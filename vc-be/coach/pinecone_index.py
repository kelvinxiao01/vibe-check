from pinecone import Pinecone, ServerlessSpec

from coach.config import settings

MEMORY_NAMESPACE = "memory"

_pc: Pinecone | None = None
_index = None


def get_index():
    """Return a Pinecone Index handle, auto-creating the index if missing.

    Returns None if no API key is configured.
    """
    global _pc, _index
    if _index is not None:
        return _index
    if not settings.pinecone_api_key:
        return None
    if _pc is None:
        _pc = Pinecone(api_key=settings.pinecone_api_key)
    try:
        existing = {idx["name"] for idx in _pc.list_indexes()}
    except Exception:
        return None
    if settings.pinecone_index not in existing:
        _pc.create_index(
            name=settings.pinecone_index,
            dimension=settings.gemini_embedding_dim,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
    _index = _pc.Index(settings.pinecone_index)
    return _index
