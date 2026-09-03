from app.graphs.occupancy_agent import run_occupancy_agent
from app.models import Incident, IncidentStatus
from app.state_store import get_incident, save_incident


async def test_occupancy_agent_resolves_and_reaches_zero():
    incident = Incident(
        label="Unit Test Tower",
        latitude=25.2,
        longitude=55.3,
        radius_meters=100,
        initial_device_estimate=6,
    )
    save_incident(incident)

    await run_occupancy_agent(incident.id)

    resolved = get_incident(incident.id)
    assert resolved is not None
    assert resolved.status == IncidentStatus.RESOLVED
    assert resolved.occupant_count == 0
    assert resolved.peak_occupant_count > 0
    assert len(resolved.reasoning_trace) > 0
    assert resolved.resolved_at is not None
    assert resolved.time_to_first_estimate_seconds is not None


async def test_occupancy_agent_requests_qos_when_congested(monkeypatch):
    # Force congestion permanently high so the QoS branch is exercised.
    from app.camara import congestion as congestion_api

    async def _always_congested(incident, congestion_hint):
        return {"congestion_level": "high", "congestion_score": 0.95, "mode": "simulate"}

    monkeypatch.setattr(congestion_api, "get_congestion", _always_congested)

    incident = Incident(
        label="Congested Zone Test",
        latitude=25.2,
        longitude=55.3,
        radius_meters=100,
        initial_device_estimate=4,
    )
    save_incident(incident)

    await run_occupancy_agent(incident.id)

    resolved = get_incident(incident.id)
    assert resolved is not None
    assert resolved.qos_boost_requested_at is not None
