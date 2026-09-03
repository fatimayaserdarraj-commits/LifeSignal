"""CAMARA Quality-on-Demand (QoS on Demand) API wrapper.

Requests guaranteed bandwidth/quality for the incident zone so responder
communications and further signal reads stay reliable once congestion is
detected.
"""
from __future__ import annotations

from app.camara.base import CamaraClientError, post_json
from app.config import settings
from app.models import Incident


async def request_qos_boost(incident: Incident) -> dict:
    if settings.camara_live:
        try:
            return await post_json(
                "/qod/v0/sessions",
                {
                    "device": {"area": {
                        "areaType": "CIRCLE",
                        "center": {"latitude": incident.latitude, "longitude": incident.longitude},
                        "radius": incident.radius_meters,
                    }},
                    "qosProfile": "QOS_E",  # emergency-priority profile
                    "duration": 3600,
                },
            )
        except (CamaraClientError, Exception):  # noqa: BLE001
            pass

    return {
        "session_id": f"sim-qos-{incident.id}",
        "status": "GRANTED",
        "qos_profile": "QOS_E",
        "mode": "simulate",
    }
