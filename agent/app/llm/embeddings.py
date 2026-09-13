"""Gemini text-embedding client for pgvector semantic search over incident
history (see supabase/schema.sql: incident_history.embedding + the
match_incident_history RPC).

Falls back to None when GEMINI_API_KEY is unset or the call fails, so
semantic search is simply unavailable rather than blocking incident
recording, mirroring the "graceful degradation" pattern used everywhere else.
"""
from __future__ import annotations

from app.config import settings

EMBEDDING_DIMENSIONS = 384


async def embed_text(text: str) -> list[float] | None:
    if not settings.gemini_enabled or not text.strip():
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        response = await client.aio.models.embed_content(
            model="models/gemini-embedding-001",
            contents=text,
            config=types.EmbedContentConfig(outputDimensionality=EMBEDDING_DIMENSIONS),
        )
        if not response.embeddings:
            return None
        return list(response.embeddings[0].values)
    except Exception:  # noqa: BLE001 - embeddings are a nice-to-have, never fatal
        return None
