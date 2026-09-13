"""Incident/congestion history store.

Backed by Supabase (Postgres) when SUPABASE_URL / SUPABASE_KEY are set --
this is what the Risk Mapping Agent learns recurring "weak zones" from over
time, and what the pgvector-backed similar-incident search draws on. Falls
back to an in-process store so the whole prototype (including risk mapping)
still works with zero external services.

Table expected in Supabase (see supabase/schema.sql):
  incident_history(id text primary key, label text, latitude double precision,
    longitude double precision, peak_occupant_count int, avg_congestion double precision,
    qos_boost_used boolean, created_at timestamptz, embedding vector(384))
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from app.config import settings
from app.llm.embeddings import embed_text

_memory_store: list[dict[str, Any]] = []

_supabase_client = None


def _get_client():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    if not settings.supabase_enabled:
        return None
    try:
        from supabase import create_client

        _supabase_client = create_client(settings.supabase_url, settings.supabase_key)
        return _supabase_client
    except Exception:  # noqa: BLE001
        return None


def _summary_text(record: dict[str, Any]) -> str:
    base = (
        f"{record.get('label', 'Incident')}: peak occupant count "
        f"{record.get('peak_occupant_count', 0)}, average congestion "
        f"{float(record.get('avg_congestion') or 0.0):.0%}, "
        f"QoS boost {'used' if record.get('qos_boost_used') else 'not used'}."
    )
    reasoning_summary = record.get("reasoning_summary")
    return f"{base} {reasoning_summary}" if reasoning_summary else base


async def record_incident_history(record: dict[str, Any]) -> None:
    # reasoning_summary (if provided) only enriches the embedding text; it is
    # not a column in incident_history, so it must not be persisted verbatim.
    summary_text = _summary_text(record)
    record = {k: v for k, v in record.items() if k != "reasoning_summary"}
    record = {**record, "recorded_at": datetime.now(timezone.utc).isoformat()}

    embedding = await embed_text(summary_text)
    if embedding is not None:
        record = {**record, "embedding": embedding}

    client = _get_client()
    if client is not None:
        try:
            client.table("incident_history").upsert(record).execute()
            return
        except Exception:  # noqa: BLE001 - never let persistence failures break the demo
            pass
    _memory_store.append(record)


async def list_incident_history() -> list[dict[str, Any]]:
    client = _get_client()
    if client is not None:
        try:
            result = client.table("incident_history").select("*").execute()
            return result.data or []
        except Exception:  # noqa: BLE001
            pass
    return list(_memory_store)


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


async def find_similar_incidents(query_text: str, top_k: int = 5) -> list[dict[str, Any]]:
    """Semantic search over resolved incidents' embeddings (pgvector in Supabase,
    or an in-memory cosine-similarity fallback). Returns [] if embeddings are
    unavailable (no GEMINI_API_KEY) rather than raising."""
    query_embedding = await embed_text(query_text)
    if query_embedding is None:
        return []

    client = _get_client()
    if client is not None:
        try:
            result = client.rpc(
                "match_incident_history",
                {"query_embedding": query_embedding, "match_count": top_k},
            ).execute()
            return result.data or []
        except Exception:  # noqa: BLE001
            pass

    scored = [
        {**record, "similarity": _cosine_similarity(query_embedding, record["embedding"])}
        for record in _memory_store
        if record.get("embedding")
    ]
    scored.sort(key=lambda r: r["similarity"], reverse=True)
    return scored[:top_k]
