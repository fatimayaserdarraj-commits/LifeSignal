"""CAMARA Location Retrieval / Verification API wrapper.

Pinpoints devices within the geofenced incident area. Live mode would call
Nokia NaC's Location Retrieval endpoint per known device id; since the
occupancy agent does not have a pre-enrolled subscriber list (by design --
"no app install required"), the practical integration path is a device
count returned by the network operator for the polygon, which is what the
simulator mirrors here.
"""
from __future__ import annotations

from app.camara.base import CamaraClientError, post_json
from app.config import settings
from app.models import Incident
from app.simulator import IncidentSimState


async def poll_devices_in_area(incident: Incident, sim_state: IncidentSimState) -> dict:
    if settings.camara_live:
        try:
            return await post_json(
                "/location-retrieval/v0/retrieve",
                {
                    "area": {
                        "areaType": "CIRCLE",
                        "center": {"latitude": incident.latitude, "longitude": incident.longitude},
                        "radius": incident.radius_meters,
                    }
                },
            )
        except (CamaraClientError, Exception):  # noqa: BLE001
            pass

    snapshot = sim_state.advance()
    return {
        "devices_in_area": snapshot["devices_remaining"],
        "devices_exited_since_last_poll": snapshot["devices_exited"],
        "tick": snapshot["tick"],
        "congestion_hint": snapshot["congestion"],
        "mode": "simulate",
    }
