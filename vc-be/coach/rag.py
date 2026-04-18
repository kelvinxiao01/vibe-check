from coach.gemini import embed
from coach.pinecone_index import get_index


async def retrieve(query: str, top_k: int = 4) -> str:
    index = get_index()
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
