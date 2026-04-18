import asyncio
import json

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions
from livekit.agents.voice.events import UserInputTranscribedEvent
from livekit.plugins import google

from coach import memory
from coach.prompts import build_system_prompt

load_dotenv()

AGENT_NAME = "dating-coach"
REALTIME_MODEL = "gemini-3.1-flash-live-preview"
# Generic priming query — Pinecone needs a vector, and at session start we don't
# have a user utterance yet. This pulls semantically-dating-adjacent past context.
SESSION_START_QUERY = "the user's dating life, goals, matches, and ongoing situations"


async def entrypoint(ctx: JobContext):
    meta = json.loads(ctx.job.metadata or "{}")
    tone = meta.get("tone", "blunt")

    memory_context = await memory.retrieve(SESSION_START_QUERY, top_k=8)
    instructions = build_system_prompt(tone, memory_context=memory_context or None)

    await ctx.connect()

    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model=REALTIME_MODEL,
            voice="Puck",
            instructions=instructions,
        ),
    )

    @session.on("user_input_transcribed")
    def _on_user_transcribed(ev: UserInputTranscribedEvent):
        if ev.is_final and ev.transcript:
            asyncio.create_task(memory.ingest(ev.transcript, source="voice"))

    await session.start(agent=Agent(instructions=instructions), room=ctx.room)


if __name__ == "__main__":
    agents.cli.run_app(
        WorkerOptions(entrypoint_fnc=entrypoint, agent_name=AGENT_NAME),
    )
