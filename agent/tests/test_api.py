import asyncio

import httpx
import pytest
from httpx import ASGITransport

from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"


async def test_create_and_poll_incident_to_resolution(client):
    response = await client.post(
        "/incidents",
        json={
            "label": "API Test Incident",
            "latitude": 25.25,
            "longitude": 55.3,
            "radius_meters": 100,
            "initial_device_estimate": 5,
        },
    )
    assert response.status_code == 201
    incident = response.json()
    incident_id = incident["id"]
    assert incident["status"] == "reported"

    # The occupancy agent runs as a FastAPI background task; poll until it
    # finishes (poll interval is patched to 0s by conftest, so this is fast).
    for _ in range(100):
        detail = await client.get(f"/incidents/{incident_id}")
        assert detail.status_code == 200
        if detail.json()["status"] == "resolved":
            break
        await asyncio.sleep(0.05)
    else:
        pytest.fail("incident never resolved")

    resolved = detail.json()
    assert resolved["occupant_count"] == 0
    assert len(resolved["reasoning_trace"]) > 0


async def test_list_incidents(client):
    response = await client.get("/incidents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_incident_not_found(client):
    response = await client.get("/incidents/does-not-exist")
    assert response.status_code == 404


async def test_risk_zones(client):
    response = await client.get("/risk-zones")
    assert response.status_code == 200
    zones = response.json()
    assert len(zones) > 0  # seed data guarantees at least one zone
    assert all("risk_score" in z for z in zones)


async def test_metrics(client):
    response = await client.get("/metrics")
    assert response.status_code == 200
    body = response.json()
    assert "incidents_tracked" in body
