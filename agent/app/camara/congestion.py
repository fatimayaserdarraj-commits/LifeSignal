"""CAMARA Congestion Insights API wrapper.

Detects network strain in the incident zone, typically caused by many
simultaneous emergency calls and bystander data use. The agent uses this
signal to decide whether to request a QoS boost.
"""
from __future__ import annotations

from app.audit import log_event
from app.camara.base import CamaraClientError, post_json
from app.config import settings
from app.models import Incident


async def get_congestion(incident: Incident, congestion_hint: float) -> dict:
    result = None
    if settings.camara_live:
        try:
            result = await post_json(
                "/congestion-insights/v0/query",
                {
                    "area": {
                        "areaType": "CIRCLE",
                        "center": {"latitude": incident.latitude, "longitude": incident.longitude},
                        "radius": incident.radius_meters,
                    }
                },
            )
        except (CamaraClientError, Exception):  # noqa: BLE001
            result = None

    if result is None:
        level = "high" if congestion_hint >= settings.congestion_threshold else (
            "medium" if congestion_hint >= 0.4 else "low"
        )
        result = {
            "congestion_level": level,
            "congestion_score": congestion_hint,
            "mode": "simulate",
        }

    await log_event(
        "camara.congestion",
        incident.id,
        {"mode": result.get("mode", "live"), "congestion_score": result.get("congestion_score")},
    )
    return result
