"""Planning Dashboard endpoints: weak-zone risk map for civil-defense infrastructure investment."""
from __future__ import annotations

from fastapi import APIRouter

from app.graphs.risk_mapping_agent import get_cached_zones, run_risk_mapping_agent
from app.models import RiskZone

router = APIRouter(prefix="/risk-zones", tags=["risk-zones"])


@router.get("", response_model=list[RiskZone])
async def get_risk_zones() -> list[RiskZone]:
    """Serves the background scheduler's latest scan (see app.background) so
    the Planning Dashboard loads instantly instead of recomputing on every hit."""
    zones = get_cached_zones()
    if zones:
        return zones
    return await run_risk_mapping_agent()


@router.post("/recompute", response_model=list[RiskZone])
async def recompute_risk_zones() -> list[RiskZone]:
    return await run_risk_mapping_agent()
