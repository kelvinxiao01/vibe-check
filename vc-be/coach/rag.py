from pinecone import Pinecone

from coach.config import settings
from coach.gemini import embed

_pc: Pinecone | None = None


def _get_index():
    global _pc
    if not settings.pinecone_api_key:
        return None
    if _pc is None:
        _pc = Pinecone(api_key=settings.pinecone_api_key)
    try:
        existing = {idx["name"] for idx in _pc.list_indexes()}
    except Exception:
        return None
    if settings.pinecone_index not in existing:
        return None
    return _pc.Index(settings.pinecone_index)


async def retrieve(query: str, top_k: int = 4) -> str:
    index = _get_index()
    if index is None or not query.strip():
        return ""

    try:
        vector = await embed(query)
        result = index.query(vector=vector, top_k=top_k, include_metadata=True)
    except Exception:
        return ""

    chunks: list[str] = []
    for match in result.get("matches", []):
        meta = match.get("metadata") or {}
        text = meta.get("text")
        if text:
            chunks.append(str(text))
    return "\n\n---\n\n".join(chunks)
