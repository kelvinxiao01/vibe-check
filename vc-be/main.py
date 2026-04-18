import asyncio
import json
import uuid

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from livekit import api
from pydantic import BaseModel

from coach import gemini, memory, rag, report as report_mod
from coach.config import settings
from coach.prompts import TONES

MAX_IMAGE_BYTES = 20 * 1024 * 1024
ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp"}
AGENT_NAME = "dating-coach"

app = FastAPI(title="Dating Coach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/chat")
async def chat(
    messages: str = Form(...),
    tone: str = Form("blunt"),
    image: UploadFile | None = File(None),
):
    if tone not in TONES:
        raise HTTPException(400, f"unknown tone: {tone}")

    try:
        parsed_messages = json.loads(messages)
    except json.JSONDecodeError:
        raise HTTPException(400, "messages must be valid JSON")

    if not isinstance(parsed_messages, list) or not parsed_messages:
        raise HTTPException(400, "messages must be a non-empty list")

    image_bytes: bytes | None = None
    image_mime: str | None = None
    if image is not None:
        if image.content_type not in ALLOWED_IMAGE_MIMES:
            raise HTTPException(400, f"unsupported image type: {image.content_type}")
        image_bytes = await image.read()
        if len(image_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(400, "image exceeds 20MB limit")
        image_mime = image.content_type

    latest_user = next(
        (m["content"] for m in reversed(parsed_messages) if m.get("role") == "user"),
        "",
    )
    rag_context, memory_context = ("", "")
    if latest_user:
        rag_context, memory_context = await asyncio.gather(
            rag.retrieve(latest_user),
            memory.retrieve(latest_user),
        )

    reply = await gemini.generate(
        messages=parsed_messages,
        tone=tone,
        rag_context=rag_context or None,
        memory_context=memory_context or None,
        image_bytes=image_bytes,
        image_mime=image_mime,
    )

    if latest_user:
        asyncio.create_task(memory.ingest(latest_user, source="text"))

    return {"reply": reply}


class TokenRequest(BaseModel):
    tone: str = "blunt"


@app.post("/token")
async def token(req: TokenRequest):
    if req.tone not in TONES:
        raise HTTPException(400, f"unknown tone: {req.tone}")
    if not (settings.livekit_api_key and settings.livekit_api_secret and settings.livekit_url):
        raise HTTPException(500, "LiveKit credentials not configured")

    room_name = f"coach-{uuid.uuid4().hex[:8]}"
    identity = f"user-{uuid.uuid4().hex[:8]}"

    jwt = (
        api.AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
        .with_identity(identity)
        .with_name("user")
        .with_grants(api.VideoGrants(room_join=True, room=room_name))
        .to_jwt()
    )

    lk = api.LiveKitAPI(
        url=settings.livekit_url,
        api_key=settings.livekit_api_key,
        api_secret=settings.livekit_api_secret,
    )
    try:
        await lk.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(
                agent_name=AGENT_NAME,
                room=room_name,
                metadata=json.dumps({"tone": req.tone}),
            )
        )
    finally:
        await lk.aclose()

    return {
        "serverUrl": settings.livekit_url,
        "participantToken": jwt,
        "roomName": room_name,
        "participantName": identity,
    }


class ReportRequest(BaseModel):
    messages: list[dict]
    tone: str = "blunt"


@app.post("/report")
async def report(req: ReportRequest):
    if req.tone not in TONES:
        raise HTTPException(400, f"unknown tone: {req.tone}")
    try:
        data = await report_mod.generate_report(req.messages, req.tone)
    except Exception as e:
        raise HTTPException(500, f"report generation failed: {e}")
    return data


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
