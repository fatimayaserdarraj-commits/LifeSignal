"""Pydantic data models shared across the agent service."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _id() -> str:
    return uuid.uuid4().hex[:12]


class IncidentStatus(str, Enum):
    REPORTED = "reported"
    GEOFENCED = "geofenced"
    MONITORING = "monitoring"
    RESOLVED = "resolved"


class ReasoningEntry(BaseModel):
    timestamp: datetime = Field(default_factory=_now)
    message: str
    occupant_count: int
    devices_exited_recent: int = 0
    congestion_level: float | None = None
    qos_boost_active: bool = False


class IncidentCreate(BaseModel):
    label: str = Field(..., description="Human readable incident label, e.g. 'Al Nahda Tower - Floor 12'")
    latitude: float
    longitude: float
    radius_meters: float = 120.0
    initial_device_estimate: int | None = Field(
        default=None,
        description="Optional seed for the simulator; omitted in live mode.",
    )


class Incident(BaseModel):
    id: str = Field(default_factory=_id)
    label: str
    latitude: float
    longitude: float
    radius_meters: float
    initial_device_estimate: int | None = None
    status: IncidentStatus = IncidentStatus.REPORTED
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)
    occupant_count: int = 0
    peak_occupant_count: int = 0
    devices_exited_total: int = 0
    congestion_level: float = 0.0
    qos_boost_active: bool = False
    qos_boost_requested_at: datetime | None = None
    reasoning_trace: list[ReasoningEntry] = Field(default_factory=list)
    resolved_at: datetime | None = None
    time_to_first_estimate_seconds: float | None = None


class RiskZone(BaseModel):
    id: str = Field(default_factory=_id)
    grid_cell: str
    center_latitude: float
    center_longitude: float
    incident_count: int
    avg_congestion: float
    risk_score: float
    label: str


class MetricsSnapshot(BaseModel):
    incidents_tracked: int
    avg_time_to_occupancy_estimate_seconds: float | None
    avg_occupant_accuracy_pct: float | None
    high_risk_zones_identified: int
    qos_boost_success_rate_pct: float | None
    resource_misallocation_reduction_pct: float | None
    avg_partner_integration_days: float | None
