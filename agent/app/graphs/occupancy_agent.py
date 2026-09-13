"""The Occupancy Agent: fire report -> live, continuously-updating occupancy count.

Graph shape:

    define_geofence -> poll_signals -> estimate_occupancy -> manage_qos
        -> generate_reasoning -> decide_continue -+-> poll_signals (loop)
                                                   +-> resolve_incident -> END

Each tick pulls live-network-derived signals (simulated by default), folds
them into the incident's occupant estimate, requests a QoS boost on
congestion, asks the LLM for a plain-English reasoning entry, and pushes the
update to any SSE subscribers. The loop ends when the zone has read zero
occupants for two consecutive ticks, or a safety cap on ticks is hit.
"""
from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone
from typing import TypedDict

from langgraph.graph import END, StateGraph

from app.alerting.twilio_client import send_alert
from app.audit import log_event
from app.camara import congestion as congestion_api
from app.camara import device_status as device_status_api
from app.camara import geofencing as geofencing_api
from app.camara import location as location_api
from app.camara import qos as qos_api
from app.config import settings
from app.db.supabase_client import record_incident_history
from app.llm.groq_client import generate_reasoning as llm_generate_reasoning
from app.models import Incident, IncidentStatus, ReasoningEntry
from app.simulator import simulation_registry
from app.state_store import get_incident, publish, save_incident


class OccupancyState(TypedDict):
    incident_id: str
    tick: int
    zero_streak: int
    start_time: float
    devices_exited_recent: int


async def _define_geofence(state: OccupancyState) -> OccupancyState:
    incident = get_incident(state["incident_id"])
    assert incident is not None
    await geofencing_api.create_geofence(incident)
    incident.status = IncidentStatus.GEOFENCED
    incident.updated_at = datetime.now(timezone.utc)
    save_incident(incident)
    publish(incident.id, {"type": "status", "status": incident.status.value})
    return state


async def _poll_signals(state: OccupancyState) -> OccupancyState:
    incident = get_incident(state["incident_id"])
    assert incident is not None

    if state["tick"] > 0:
        await asyncio.sleep(settings.occupancy_poll_interval_seconds)

    sim_state = simulation_registry.get_or_create(incident.id, incident.initial_device_estimate or 14)

    location_result = await location_api.poll_devices_in_area(incident, sim_state)
    devices_in_area = location_result["devices_in_area"]

    reachability = await device_status_api.check_reachability(incident, devices_in_area)
    reachable = reachability["devices_reachable"]

    congestion_result = await congestion_api.get_congestion(
        incident, location_result.get("congestion_hint", 0.0)
    )

    state["tick"] = location_result["tick"]
    state["devices_exited_recent"] = location_result["devices_exited_since_last_poll"]

    incident.status = IncidentStatus.MONITORING
    incident.occupant_count = reachable
    incident.peak_occupant_count = max(incident.peak_occupant_count, reachable)
    incident.devices_exited_total += state["devices_exited_recent"]
    # Ceiling on "how many were ever inside": still-present devices (location
    # layer) plus everyone confirmed to have exited so far. Using devices_in_area
    # here (not the noisier reachable count) guarantees devices_exited_total can
    # never outrun this number -- see Incident's docstring.
    incident.unique_devices_detected = max(
        incident.unique_devices_detected, devices_in_area + incident.devices_exited_total
    )
    incident.congestion_level = congestion_result["congestion_score"]
    incident.updated_at = datetime.now(timezone.utc)

    if incident.time_to_first_estimate_seconds is None:
        incident.time_to_first_estimate_seconds = round(time.monotonic() - state["start_time"], 2)

    save_incident(incident)
    return state


async def _manage_qos(state: OccupancyState) -> OccupancyState:
    incident = get_incident(state["incident_id"])
    assert incident is not None

    if incident.congestion_level >= settings.congestion_threshold and not incident.qos_boost_active:
        await qos_api.request_qos_boost(incident)
        incident.qos_boost_active = True
        incident.qos_boost_requested_at = datetime.now(timezone.utc)
        save_incident(incident)
        await send_alert(
            f"LifeSignal: QoS boost requested for incident '{incident.label}' "
            f"(congestion {incident.congestion_level:.0%})."
        )
        await log_event(
            "decision.qos_boost_requested",
            incident.id,
            {"congestion_level": incident.congestion_level, "tick": state["tick"]},
        )
        publish(incident.id, {"type": "qos", "qos_boost_active": True})
    elif incident.congestion_level < 0.35 and incident.qos_boost_active:
        # Congestion has eased; the boost naturally lapses.
        incident.qos_boost_active = False
        save_incident(incident)
        await log_event(
            "decision.qos_boost_lapsed",
            incident.id,
            {"congestion_level": incident.congestion_level, "tick": state["tick"]},
        )
        publish(incident.id, {"type": "qos", "qos_boost_active": False})

    return state


async def _generate_reasoning(state: OccupancyState) -> OccupancyState:
    incident = get_incident(state["incident_id"])
    assert incident is not None

    message = await llm_generate_reasoning(
        {
            "tick": state["tick"],
            "occupant_count": incident.occupant_count,
            "unique_devices_detected": incident.unique_devices_detected,
            "devices_exited_recent": state["devices_exited_recent"],
            "congestion_level": incident.congestion_level,
            "qos_boost_active": incident.qos_boost_active,
        }
    )
    entry = ReasoningEntry(
        message=message,
        occupant_count=incident.occupant_count,
        unique_devices_detected=incident.unique_devices_detected,
        devices_exited_recent=state["devices_exited_recent"],
        congestion_level=incident.congestion_level,
        qos_boost_active=incident.qos_boost_active,
    )
    incident.reasoning_trace.append(entry)
    save_incident(incident)
    await log_event(
        "estimate.occupancy",
        incident.id,
        {
            "tick": state["tick"],
            "occupant_count": incident.occupant_count,
            "unique_devices_detected": incident.unique_devices_detected,
            "devices_exited_recent": state["devices_exited_recent"],
            "congestion_level": incident.congestion_level,
            "message": message,
        },
    )
    publish(incident.id, {"type": "reasoning", "entry": entry.model_dump(mode="json")})
    publish(incident.id, {"type": "incident", "incident": incident.model_dump(mode="json")})
    return state


def _decide_continue(state: OccupancyState) -> str:
    incident = get_incident(state["incident_id"])
    assert incident is not None

    if incident.occupant_count == 0:
        state["zero_streak"] += 1
    else:
        state["zero_streak"] = 0

    if state["zero_streak"] >= 2 or state["tick"] >= settings.occupancy_max_ticks:
        return "resolve"
    return "continue"


async def _resolve_incident(state: OccupancyState) -> OccupancyState:
    incident = get_incident(state["incident_id"])
    assert incident is not None

    incident.status = IncidentStatus.RESOLVED
    incident.resolved_at = datetime.now(timezone.utc)
    incident.updated_at = incident.resolved_at
    save_incident(incident)

    reasoning_summary = " ".join(entry.message for entry in incident.reasoning_trace[-3:])

    await record_incident_history(
        {
            "id": incident.id,
            "label": incident.label,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "peak_occupant_count": incident.peak_occupant_count,
            "avg_congestion": incident.congestion_level,
            "qos_boost_used": incident.qos_boost_active or incident.qos_boost_requested_at is not None,
            "created_at": incident.created_at.isoformat(),
            "reasoning_summary": reasoning_summary,
        }
    )

    await log_event(
        "decision.incident_resolved",
        incident.id,
        {
            "peak_occupant_count": incident.peak_occupant_count,
            "devices_exited_total": incident.devices_exited_total,
            "ticks": state["tick"],
        },
    )

    publish(incident.id, {"type": "status", "status": incident.status.value})
    publish(incident.id, {"type": "done"})
    return state


def build_occupancy_graph():
    graph = StateGraph(OccupancyState)
    graph.add_node("define_geofence", _define_geofence)
    graph.add_node("poll_signals", _poll_signals)
    graph.add_node("manage_qos", _manage_qos)
    graph.add_node("generate_reasoning", _generate_reasoning)
    graph.add_node("resolve_incident", _resolve_incident)

    graph.set_entry_point("define_geofence")
    graph.add_edge("define_geofence", "poll_signals")
    graph.add_edge("poll_signals", "manage_qos")
    graph.add_edge("manage_qos", "generate_reasoning")
    graph.add_conditional_edges(
        "generate_reasoning",
        _decide_continue,
        {"continue": "poll_signals", "resolve": "resolve_incident"},
    )
    graph.add_edge("resolve_incident", END)
    return graph.compile()


_occupancy_graph = build_occupancy_graph()


async def run_occupancy_agent(incident_id: str) -> None:
    initial_state: OccupancyState = {
        "incident_id": incident_id,
        "tick": 0,
        "zero_streak": 0,
        "start_time": time.monotonic(),
        "devices_exited_recent": 0,
    }
    await _occupancy_graph.ainvoke(initial_state, config={"recursion_limit": settings.occupancy_max_ticks * 6})
