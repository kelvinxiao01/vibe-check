from google import genai
from google.genai import types

from coach.config import settings
from coach.prompts import build_system_prompt

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _to_contents(
    messages: list[dict],
    image_bytes: bytes | None,
    image_mime: str | None,
) -> list[types.Content]:
    contents: list[types.Content] = []
    for i, msg in enumerate(messages):
        role = "user" if msg["role"] == "user" else "model"
        parts: list[types.Part] = [types.Part.from_text(text=msg["content"])]
        is_last_user = i == len(messages) - 1 and role == "user"
        if is_last_user and image_bytes and image_mime:
            parts.append(types.Part.from_bytes(data=image_bytes, mime_type=image_mime))
        contents.append(types.Content(role=role, parts=parts))
    return contents


async def generate(
    messages: list[dict],
    tone: str,
    rag_context: str | None = None,
    image_bytes: bytes | None = None,
    image_mime: str | None = None,
) -> str:
    client = _get_client()
    system_prompt = build_system_prompt(tone, rag_context)
    contents = _to_contents(messages, image_bytes, image_mime)

    response = await client.aio.models.generate_content(
        model=settings.gemini_text_model,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=system_prompt),
    )
    return response.text or ""


async def embed(text: str) -> list[float]:
    client = _get_client()
    response = await client.aio.models.embed_content(
        model=settings.gemini_embedding_model,
        contents=text,
    )
    return list(response.embeddings[0].values)
