"""The Risk Mapping Agent: incident + congestion history -> weak-zone risk scores.

Runs continuously in the background on a fixed interval (see
app.background.risk_mapping_scheduler, started from the FastAPI lifespan),
plus on demand for a manual refresh from the Planning Dashboard. It buckets
historical incidents into a coarse lat/lon grid and scores each cell on how
often fires occur there AND how badly the network struggles under load --
the combination civil-defense agencies should prioritize for infrastructure
investment.
"""
from __future__ import annotations

import math
from typing import TypedDict

from langgraph.graph import END, StateGraph

from app.audit import log_event
from app.config import settings
from app.db.supabase_client import list_incident_history
from app.models import RiskZone

_latest_zones: list[RiskZone] = []


class RiskMappingState(TypedDict):
    history: list[dict]
    zones: list[RiskZone]


def _grid_cell_key(lat: float, lon: float) -> tuple[str, float, float]:
    # Roughly km-sized buckets: 1 degree of latitude ~= 111km.
    step_deg = settings.risk_zone_grid_size_km / 111.0
    cell_lat = math.floor(lat / step_deg) * step_deg
    cell_lon = math.floor(lon / step_deg) * step_deg
    center_lat = cell_lat + step_deg / 2
    center_lon = cell_lon + step_deg / 2
    key = f"{cell_lat:.4f}:{cell_lon:.4f}"
    return key, center_lat, center_lon


async def _fetch_history(state: RiskMappingState) -> RiskMappingState:
    state["history"] = await list_incident_history()
    return state


async def _compute_zones(state: RiskMappingState) -> RiskMappingState:
    buckets: dict[str, dict] = {}

    for record in state["history"]:
        try:
            lat = float(record["latitude"])
            lon = float(record["longitude"])
        except (KeyError, TypeError, ValueError):
            continue

        key, center_lat, center_lon = _grid_cell_key(lat, lon)
        bucket = buckets.setdefault(
            key,
            {
                "grid_cell": key,
                "center_latitude": center_lat,
                "center_longitude": center_lon,
                "incident_count": 0,
                "congestion_sum": 0.0,
                "qos_boost_count": 0,
            },
        )
        bucket["incident_count"] += 1
        bucket["congestion_sum"] += float(record.get("avg_congestion") or 0.0)
        if record.get("qos_boost_used"):
            bucket["qos_boost_count"] += 1

    if not buckets:
        state["zones"] = []
        return state

    max_incidents = max(b["incident_count"] for b in buckets.values())

    zones: list[RiskZone] = []
    for bucket in buckets.values():
        avg_congestion = bucket["congestion_sum"] / bucket["incident_count"]
        incident_weight = bucket["incident_count"] / max_incidents
        # Risk = how often fires happen here, weighted with how badly the
        # network degrades when they do -- a frequent-fire, low-congestion
        # zone is lower priority than a less-frequent but network-fragile one.
        risk_score = round(0.6 * incident_weight + 0.4 * avg_congestion, 3)

        if risk_score >= 0.66:
            tier = "High"
        elif risk_score >= 0.4:
            tier = "Elevated"
        else:
            tier = "Watch"

        zones.append(
            RiskZone(
                grid_cell=bucket["grid_cell"],
                center_latitude=bucket["center_latitude"],
                center_longitude=bucket["center_longitude"],
                incident_count=bucket["incident_count"],
                avg_congestion=round(avg_congestion, 3),
                risk_score=risk_score,
                label=f"{tier} risk zone — {bucket['incident_count']} incident(s), "
                f"{avg_congestion:.0%} avg congestion",
            )
        )

    zones.sort(key=lambda z: z.risk_score, reverse=True)
    state["zones"] = zones
    return state


def build_risk_mapping_graph():
    graph = StateGraph(RiskMappingState)
    graph.add_node("fetch_history", _fetch_history)
    graph.add_node("compute_zones", _compute_zones)
    graph.set_entry_point("fetch_history")
    graph.add_edge("fetch_history", "compute_zones")
    graph.add_edge("compute_zones", END)
    return graph.compile()


_risk_mapping_graph = build_risk_mapping_graph()


async def run_risk_mapping_agent() -> list[RiskZone]:
    global _latest_zones
    result = await _risk_mapping_graph.ainvoke({"history": [], "zones": []})
    zones = result["zones"]
    _latest_zones = zones
    await log_event(
        "risk_mapping.scan",
        None,
        {
            "zones_identified": len(zones),
            "high_risk_zones": sum(1 for z in zones if z.risk_score >= 0.66),
        },
    )
    return zones


def get_cached_zones() -> list[RiskZone]:
    """Instant read for the Planning Dashboard; populated by the background
    scheduler (app.background) and refreshed on every manual recompute."""
    return _latest_zones
