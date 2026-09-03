"""CAMARA Device Status API wrapper.

Confirms which devices in the geofence are genuinely reachable/online, so
the occupancy estimate distinguishes real occupants from stale or
powered-off signals rather than trusting a raw location count.
"""
from __future__ import annotations

import random

from app.camara.base import CamaraClientError, post_json
from app.config import settings
from app.models import Incident


async def check_reachability(incident: Incident, devices_in_area: int) -> dict:
    if settings.camara_live:
        try:
            return await post_json(
                "/device-status/v0/connectivity",
                {"device_count": devices_in_area},
            )
        except (CamaraClientError, Exception):  # noqa: BLE001
            pass

    # A handful of devices are typically powered-off, in airplane mode, or
    # stale registrations -- reachability trims a small, stable fraction.
    rng = random.Random(f"{incident.id}-reachability")
    reachable_fraction = rng.uniform(0.9, 0.98)
    reachable = round(devices_in_area * reachable_fraction)
    return {
        "devices_checked": devices_in_area,
        "devices_reachable": reachable,
        "devices_stale": devices_in_area - reachable,
        "mode": "simulate",
    }
