import time
import uuid

from coach.gemini import embed
from coach.pinecone_index import MEMORY_NAMESPACE, get_index


async def ingest(text: str, source: str = "text") -> None:
    """Embed and upsert a user utterance to the memory namespace. Fire-and-forget safe."""
    text = text.strip()
    if not text:
        return
    index = get_index()
    if index is None:
        return
    try:
        vec = await embed(text)
        index.upsert(
            vectors=[
                {
                    "id": uuid.uuid4().hex,
                    "values": vec,
                    "metadata": {
                        "text": text,
                        "source": source,
                        "timestamp": int(time.time()),
                    },
                }
            ],
            namespace=MEMORY_NAMESPACE,
        )
    except Exception as e:
        print(f"[memory.ingest] failed: {e}")


async def retrieve(query: str, top_k: int = 5) -> str:
    """Return a bulleted string of past user utterances relevant to `query`."""
    query = query.strip()
    if not query:
        return ""
    index = get_index()
    if index is None:
        return ""
    try:
        vec = await embed(query)
        result = index.query(
            vector=vec,
            top_k=top_k,
            include_metadata=True,
            namespace=MEMORY_NAMESPACE,
        )
    except Exception:
        return ""

    items: list[str] = []
    for match in result.get("matches", []):
        meta = match.get("metadata") or {}
        text = meta.get("text")
        if text:
            items.append(f"- {text}")
    return "\n".join(items)
