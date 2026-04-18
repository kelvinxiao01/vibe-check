"""KB ingestion: walks knowledge/ for markdown, chunks, embeds, upserts to Pinecone.

Usage: uv run python ingest.py
"""

import asyncio
import hashlib
from pathlib import Path

from coach.config import settings
from coach.gemini import embed
from coach.pinecone_index import get_index

KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"
CHUNK_CHARS = 2000
OVERLAP_CHARS = 200


def chunk_text(text: str) -> list[str]:
    if len(text) <= CHUNK_CHARS:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + CHUNK_CHARS, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - OVERLAP_CHARS
    return chunks


async def main():
    if not settings.pinecone_api_key:
        raise SystemExit("PINECONE_API_KEY not set")
    if not settings.gemini_api_key:
        raise SystemExit("GEMINI_API_KEY not set")

    files = sorted(KNOWLEDGE_DIR.glob("**/*.md"))
    if not files:
        print(f"No markdown files in {KNOWLEDGE_DIR}. Drop .md files there and rerun.")
        return

    index = get_index()
    if index is None:
        raise SystemExit("Pinecone index unavailable (check PINECONE_API_KEY)")

    vectors = []
    for path in files:
        text = path.read_text(encoding="utf-8")
        for i, chunk in enumerate(chunk_text(text)):
            vec = await embed(chunk)
            cid = hashlib.sha1(f"{path.name}:{i}".encode()).hexdigest()[:16]
            vectors.append(
                {
                    "id": cid,
                    "values": vec,
                    "metadata": {"text": chunk, "source": path.name},
                }
            )
            print(f"  embedded {path.name} chunk {i}")

    if vectors:
        index.upsert(vectors=vectors)
        print(f"Upserted {len(vectors)} chunks to {settings.pinecone_index}.")


if __name__ == "__main__":
    asyncio.run(main())
