"""Audit & Compliance Module.

Records every CAMARA API call, LLM-driven estimate, and QoS/alert decision
the agent makes, so an incident can be reconstructed step-by-step for
post-incident review -- independent of the (UX-facing) reasoning trace shown
on the Command Dashboard.

Backed by Supabase when configured, with an in-memory fallback so audit
logging never blocks or fails the incident loop.

Table expected in Supabase (see supabase/schema.sql):
  audit_log(id text primary key, incident_id text, event_type text,
    detail jsonb, created_at timestamptz)
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.config import settings

_memory_log: list[dict[str, Any]] = []
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


async def log_event(event_type: str, incident_id: str | None, detail: dict[str, Any]) -> None:
    """Fire-and-forget audit entry. Must never raise into the caller's flow."""
    record = {
        "id": uuid.uuid4().hex[:16],
        "incident_id": incident_id,
        "event_type": event_type,
        "detail": detail,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    client = _get_client()
    if client is not None:
        try:
            client.table("audit_log").insert(record).execute()
            return
        except Exception:  # noqa: BLE001 - audit logging must never break the incident loop
            pass
    _memory_log.append(record)


async def list_audit_log(incident_id: str | None = None, limit: int = 200) -> list[dict[str, Any]]:
    client = _get_client()
    if client is not None:
        try:
            query = client.table("audit_log").select("*").order("created_at", desc=True).limit(limit)
            if incident_id:
                query = query.eq("incident_id", incident_id)
            result = query.execute()
            return result.data or []
        except Exception:  # noqa: BLE001
            pass
    records = _memory_log
    if incident_id:
        records = [r for r in records if r["incident_id"] == incident_id]
    return list(reversed(records))[:limit]
