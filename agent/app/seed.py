"""Synthetic incident history so the Planning Dashboard has something to show
on a fresh install, before any live incidents have been reported and
resolved. Purely additive -- real incidents recorded during the demo layer
on top of this via the same `record_incident_history` call.
"""
from __future__ import annotations

from app.db.supabase_client import list_incident_history, record_incident_history

# Dubai-area coordinates, clustered to produce a mix of risk tiers:
# a dense, congestion-prone old-town cluster (high risk), a mega-project
# construction corridor (elevated), and a low-density residential area (watch).
_SEED_INCIDENTS = [
    {"id": "seed-01", "label": "Deira - Residential Block 4", "latitude": 25.2697, "longitude": 55.3095,
     "peak_occupant_count": 22, "avg_congestion": 0.81, "qos_boost_used": True,
     "created_at": "2026-02-11T14:32:00+00:00"},
    {"id": "seed-02", "label": "Deira - Souk Perimeter", "latitude": 25.2703, "longitude": 55.3082,
     "peak_occupant_count": 17, "avg_congestion": 0.74, "qos_boost_used": True,
     "created_at": "2026-03-02T09:10:00+00:00"},
    {"id": "seed-03", "label": "Deira - Market Warehouse", "latitude": 25.2711, "longitude": 55.3101,
     "peak_occupant_count": 9, "avg_congestion": 0.69, "qos_boost_used": False,
     "created_at": "2026-04-19T21:47:00+00:00"},
    {"id": "seed-04", "label": "Al Quoz - Industrial Unit 12", "latitude": 25.1412, "longitude": 55.2278,
     "peak_occupant_count": 6, "avg_congestion": 0.52, "qos_boost_used": False,
     "created_at": "2026-01-27T03:15:00+00:00"},
    {"id": "seed-05", "label": "Al Quoz - Warehouse Row", "latitude": 25.1405, "longitude": 55.2291,
     "peak_occupant_count": 4, "avg_congestion": 0.58, "qos_boost_used": True,
     "created_at": "2026-05-08T11:02:00+00:00"},
    {"id": "seed-06", "label": "Jumeirah Village - Tower C", "latitude": 25.0595, "longitude": 55.2094,
     "peak_occupant_count": 14, "avg_congestion": 0.31, "qos_boost_used": False,
     "created_at": "2026-06-14T17:55:00+00:00"},
    {"id": "seed-07", "label": "Al Barsha - Mega-Project Site", "latitude": 25.1124, "longitude": 55.2001,
     "peak_occupant_count": 11, "avg_congestion": 0.63, "qos_boost_used": True,
     "created_at": "2026-07-01T06:40:00+00:00"},
    {"id": "seed-08", "label": "Al Barsha - Contractor Camp", "latitude": 25.1131, "longitude": 55.1988,
     "peak_occupant_count": 8, "avg_congestion": 0.60, "qos_boost_used": False,
     "created_at": "2026-08-09T20:18:00+00:00"},
]


async def ensure_seed_data() -> None:
    existing = await list_incident_history()
    if existing:
        return
    for record in _SEED_INCIDENTS:
        await record_incident_history(record)
