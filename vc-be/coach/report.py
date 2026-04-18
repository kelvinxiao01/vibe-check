"""Generate a structured analysis report from current chat + Pinecone memory."""

import json
from typing import Literal

from google.genai import types
from pydantic import BaseModel, Field

from coach import memory
from coach.config import settings
from coach.gemini import _get_client


class Score(BaseModel):
    label: Literal[
        "Interest Level", "Reciprocity", "Intrigue", "Emotional Balance"
    ]
    value: int = Field(ge=0, le=10)


class Investment(BaseModel):
    you: int = Field(ge=0, le=100, description="Percentage of effort the user contributes")
    them: int = Field(ge=0, le=100, description="Percentage of effort the other person contributes")
    description: str


class Rewrite(BaseModel):
    original: str = Field(description="A direct quote of one of the user's real messages")
    improved: str = Field(description="A rewritten version that lands with more confidence/restraint")
    why: str


class NextStep(BaseModel):
    label: Literal["Balanced", "Pull-Back", "Direct"]
    text: str


class Trajectory(BaseModel):
    title: str = Field(description="Short label like 'Still Recoverable' or 'At Risk Of Fading'")
    confidence: str = Field(description="e.g. '72% confidence'")
    drivers: list[str] = Field(min_length=2, max_length=4)
    improve: list[str] = Field(min_length=2, max_length=4)


class Tarot(BaseModel):
    card: str = Field(description="A real or playful tarot-style card name")
    meaning: str
    prediction: str


class Report(BaseModel):
    archetype: str = Field(description="Short archetype label, e.g. 'High Energy Over-Investor'")
    summary: str
    scores: list[Score] = Field(min_length=4, max_length=4)
    investment: Investment
    keyPatterns: list[str] = Field(min_length=3, max_length=5)
    risks: list[str] = Field(min_length=3, max_length=5)
    rewrite: Rewrite
    nextSteps: list[NextStep] = Field(min_length=3, max_length=3)
    trajectory: Trajectory
    tarot: Tarot


SYSTEM_INSTRUCTION = """You are a dating coach writing a structured analysis report about a user's dating life.

Analyze what the user has actually said — both in the current session and in past memory — and produce a JSON report that:
- Is grounded in their real language, not generic advice
- Quotes the user directly in the "rewrite.original" field (use an actual message they sent; do not invent one)
- Uses concrete observations for keyPatterns and risks
- Has investment.you + investment.them = 100

Be honest and specific. If there's very little data, still produce a plausible best-effort report but mark trajectory.confidence accordingly (e.g. "low confidence — limited data")."""


def _format_messages(messages: list[dict]) -> str:
    if not messages:
        return "(no current-session messages)"
    lines = []
    for m in messages:
        role = "USER" if m.get("role") == "user" else "COACH"
        content = m.get("content", "")
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


async def _memory_query(messages: list[dict]) -> str:
    """Pick a query string that maximizes retrieval relevance."""
    user_texts = [
        m["content"] for m in messages[-5:] if m.get("role") == "user" and m.get("content")
    ]
    if user_texts:
        return " ".join(user_texts)
    return "the user's dating life, recent matches, conversations, and concerns"


async def generate_report(messages: list[dict], tone: str) -> dict:
    query = await _memory_query(messages)
    memory_context = await memory.retrieve(query, top_k=20)

    current = _format_messages(messages)

    user_prompt_parts = [
        f"Selected coaching tone: {tone}",
        f"CURRENT SESSION:\n{current}",
    ]
    if memory_context:
        user_prompt_parts.append(
            f"PAST MEMORY (semantically relevant utterances from prior sessions):\n{memory_context}"
        )
    else:
        user_prompt_parts.append("PAST MEMORY: (empty — no prior sessions yet)")

    user_prompt = "\n\n".join(user_prompt_parts)

    client = _get_client()
    response = await client.aio.models.generate_content(
        model=settings.gemini_text_model,
        contents=[
            types.Content(role="user", parts=[types.Part.from_text(text=user_prompt)]),
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=Report,
            temperature=0.7,
        ),
    )

    text = response.text or "{}"
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}") from e

    # Normalize investment split to 100 in case the model drifted.
    inv = data.get("investment", {})
    you, them = inv.get("you", 50), inv.get("them", 50)
    total = you + them
    if total > 0 and total != 100:
        inv["you"] = round(you * 100 / total)
        inv["them"] = 100 - inv["you"]

    return data
