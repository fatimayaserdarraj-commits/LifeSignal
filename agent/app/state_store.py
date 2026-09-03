"""Process-wide incident store + a tiny pub/sub bus for SSE streaming.

A real deployment would back this with Supabase directly and use its
realtime channel for streaming; for the prototype an in-memory store keeps
things simple and framework-free while the Supabase client (db/) handles
durable history for the Risk Mapping Agent.
"""
from __future__ import annotations

import asyncio
from typing import Any

from app.models import Incident

_incidents: dict[str, Incident] = {}
_subscribers: dict[str, list[asyncio.Queue]] = {}


def save_incident(incident: Incident) -> None:
    _incidents[incident.id] = incident


def get_incident(incident_id: str) -> Incident | None:
    return _incidents.get(incident_id)


def list_incidents() -> list[Incident]:
    return sorted(_incidents.values(), key=lambda i: i.created_at, reverse=True)


def subscribe(incident_id: str) -> asyncio.Queue:
    queue: asyncio.Queue = asyncio.Queue()
    _subscribers.setdefault(incident_id, []).append(queue)
    return queue


def unsubscribe(incident_id: str, queue: asyncio.Queue) -> None:
    subs = _subscribers.get(incident_id, [])
    if queue in subs:
        subs.remove(queue)


def publish(incident_id: str, event: dict[str, Any]) -> None:
    for queue in _subscribers.get(incident_id, []):
        queue.put_nowait(event)
