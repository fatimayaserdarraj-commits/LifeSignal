"""CAMARA Geofencing API wrapper.

Defines the incident zone and reports whether the zone is still "active"
(i.e. still worth polling). In live mode this would call Nokia
Network-as-Code's Geofencing subscription endpoints; in simulate mode it
just echoes back a synthetic geofence id.
"""
from __future__ import annotations

from app.camara.base import CamaraClientError, post_json
from app.config import settings
from app.models import Incident


async def create_geofence(incident: Incident) -> dict:
    if settings.camara_live:
        try:
            return await post_json(
                "/geofencing/v0/subscriptions",
                {
                    "area": {
                        "areaType": "CIRCLE",
                        "center": {"latitude": incident.latitude, "longitude": incident.longitude},
                        "radius": incident.radius_meters,
                    },
                    "sink": "webhook://lifesignal-agent",
                },
            )
        except (CamaraClientError, Exception):  # noqa: BLE001 - live call must never crash the demo
            pass

    return {
        "geofence_id": f"sim-geofence-{incident.id}",
        "area": {
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "radius_meters": incident.radius_meters,
        },
        "status": "ACTIVE",
        "mode": "simulate",
    }
