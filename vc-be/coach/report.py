"""Generate a structured analysis report from current chat + Pinecone memory."""

import json
import logging
from typing import Literal

from google.genai import types
from pydantic import BaseModel, Field

from coach import memory
from coach.config import settings
from coach.gemini import _get_client

logger = logging.getLogger(__name__)


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

You have access to TWO sources:
1. CURRENT SESSION — what the user is saying right now
2. PAST MEMORY — a semantic retrieval of things the user said in prior sessions

Your report MUST cross-reference both. Specifically:
- If PAST MEMORY exists, at least two of your `keyPatterns` must describe recurring behaviors across multiple past situations (not just the current chat). Name the recurring theme, not the one-off.
- `archetype` should reflect patterns from the full history if PAST MEMORY is non-empty, not just the current message.
- `rewrite.original` MUST be a direct quote from CURRENT SESSION or PAST MEMORY — never invented. Prefer the most illustrative problem message.
- `trajectory.confidence` should scale with how much data you have. If PAST MEMORY is empty, explicitly say "low confidence — limited data".
- Investment percentages must sum to 100.

Be honest and specific. No generic advice. Ground every observation in the user's actual language."""


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

    memory_items = [
        line[2:] for line in memory_context.split("\n") if line.startswith("- ")
    ]
    current_user_count = sum(1 for m in messages if m.get("role") == "user")

    logger.info(
        "report.generate memory=%d current_user_messages=%d query=%r",
        len(memory_items),
        current_user_count,
        query[:120],
    )
    if memory_items:
        preview = "; ".join(item[:80] for item in memory_items[:3])
        logger.info("report.generate memory_preview=%s", preview)

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

    data["meta"] = {
        "memoryItems": len(memory_items),
        "currentUserMessages": current_user_count,
        "memorySamples": memory_items[:3],
    }
    return data
