"""Post-incident review endpoint: the audit trail of every API call, estimate, and decision."""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.audit import list_audit_log

router = APIRouter(prefix="/audit-log", tags=["audit"])


@router.get("")
async def get_audit_log(
    incident_id: str | None = Query(default=None),
    limit: int = Query(default=200, le=1000),
) -> list[dict]:
    return await list_audit_log(incident_id=incident_id, limit=limit)
