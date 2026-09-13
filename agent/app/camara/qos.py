"""CAMARA Quality-on-Demand (QoS on Demand) API wrapper.

Requests guaranteed bandwidth/quality for the incident zone so responder
communications and further signal reads stay reliable once congestion is
detected.
"""
from __future__ import annotations

from app.audit import log_event
from app.camara.base import CamaraClientError, post_json
from app.config import settings
from app.models import Incident


async def request_qos_boost(incident: Incident) -> dict:
    result = None
    if settings.camara_live:
        try:
            result = await post_json(
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
            result = None

    if result is None:
        result = {
            "session_id": f"sim-qos-{incident.id}",
            "status": "GRANTED",
            "qos_profile": "QOS_E",
            "mode": "simulate",
        }

    await log_event("camara.qos", incident.id, {"mode": result.get("mode", "live"), "response": result})
    return result
