import json

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions
from livekit.plugins import google

from coach.prompts import build_system_prompt

load_dotenv()

AGENT_NAME = "dating-coach"
REALTIME_MODEL = "gemini-3.1-flash-live-preview"


async def entrypoint(ctx: JobContext):
    meta = json.loads(ctx.job.metadata or "{}")
    tone = meta.get("tone", "blunt")
    instructions = build_system_prompt(tone)

    await ctx.connect()

    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model=REALTIME_MODEL,
            voice="Puck",
            instructions=instructions,
        ),
    )
    await session.start(agent=Agent(instructions=instructions), room=ctx.room)


if __name__ == "__main__":
    agents.cli.run_app(
        WorkerOptions(entrypoint_fnc=entrypoint, agent_name=AGENT_NAME),
    )
