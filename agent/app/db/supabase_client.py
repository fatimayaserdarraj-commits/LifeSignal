"""Incident/congestion history store.

Backed by Supabase (Postgres) when SUPABASE_URL / SUPABASE_KEY are set --
this is what the Risk Mapping Agent learns recurring "weak zones" from over
time. Falls back to an in-process store so the whole prototype (including
risk mapping) still works with zero external services.

Table expected in Supabase (see supabase/schema.sql):
  incident_history(id text primary key, label text, latitude double precision,
    longitude double precision, peak_occupant_count int, avg_congestion double precision,
    qos_boost_used boolean, created_at timestamptz)
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.config import settings

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


async def record_incident_history(record: dict[str, Any]) -> None:
    record = {**record, "recorded_at": datetime.now(timezone.utc).isoformat()}
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
