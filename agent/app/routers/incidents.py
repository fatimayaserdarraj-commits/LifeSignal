"""Incident lifecycle endpoints: report a fire, watch it live, list history."""
from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, BackgroundTasks, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.graphs.occupancy_agent import run_occupancy_agent
from app.models import Incident, IncidentCreate
from app.state_store import get_incident, list_incidents, save_incident, subscribe, unsubscribe

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.post("", response_model=Incident, status_code=201)
async def create_incident(payload: IncidentCreate, background_tasks: BackgroundTasks) -> Incident:
    incident = Incident(
        label=payload.label,
        latitude=payload.latitude,
        longitude=payload.longitude,
        radius_meters=payload.radius_meters,
        initial_device_estimate=payload.initial_device_estimate,
    )
    save_incident(incident)
    background_tasks.add_task(_run_agent_safely, incident.id)
    return incident


async def _run_agent_safely(incident_id: str) -> None:
    try:
        await run_occupancy_agent(incident_id)
    except Exception as exc:  # noqa: BLE001 - the incident record must not get stuck mid-flight
        incident = get_incident(incident_id)
        if incident is not None:
            from app.models import IncidentStatus

            incident.status = IncidentStatus.RESOLVED
            save_incident(incident)
        raise exc


@router.get("", response_model=list[Incident])
async def list_all_incidents() -> list[Incident]:
    return list_incidents()


@router.get("/{incident_id}", response_model=Incident)
async def get_incident_detail(incident_id: str) -> Incident:
    incident = get_incident(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.get("/{incident_id}/stream")
async def stream_incident(incident_id: str) -> EventSourceResponse:
    if get_incident(incident_id) is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    queue = subscribe(incident_id)

    async def event_generator():
        try:
            current = get_incident(incident_id)
            if current is not None:
                yield {"event": "incident", "data": current.model_dump_json()}
                if current.status == "resolved":
                    yield {"event": "done", "data": "{}"}
                    return
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=20.0)
                except asyncio.TimeoutError:
                    yield {"event": "ping", "data": "{}"}
                    continue
                yield {"event": event["type"], "data": json.dumps(event, default=str)}
                if event["type"] == "done":
                    break
        finally:
            unsubscribe(incident_id, queue)

    return EventSourceResponse(event_generator())
