"""Deterministic-ish simulator that stands in for live CAMARA network signals.

Every CAMARA client (geofencing, location, device status, congestion, QoS)
reads from a single `IncidentSimState` per incident so the numbers stay
consistent across API calls within one incident lifecycle -- this is what
lets the demo run with zero external credentials while still telling a
believable story (an evacuation curve, a congestion spike, a QoS boost).
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field


@dataclass
class IncidentSimState:
    incident_id: str
    seed_devices: int
    rng: random.Random = field(init=False)
    tick: int = 0
    devices_remaining: int = field(init=False)
    devices_exited_this_tick: int = 0
    congestion: float = 0.15
    qos_requested: bool = False

    def __post_init__(self) -> None:
        self.rng = random.Random(self.incident_id)
        self.devices_remaining = self.seed_devices

    def advance(self) -> dict:
        """Advance the simulated incident by one tick and return a signal snapshot."""
        self.tick += 1

        # Evacuation curve: fastest exits in the middle of the incident,
        # tapering off as fewer occupants remain.
        if self.devices_remaining > 0:
            progress = min(self.tick / 18.0, 1.0)
            exit_rate = 0.05 + 0.22 * (1 - abs(progress - 0.5) * 2)
            max_exit = max(1, int(self.devices_remaining * exit_rate))
            exited = self.rng.randint(0, max_exit)
            exited = min(exited, self.devices_remaining)
        else:
            exited = 0

        self.devices_exited_this_tick = exited
        self.devices_remaining -= exited

        # Congestion spikes early (simultaneous 911 calls / bystander data use)
        # then eases once QoS is boosted or occupants thin out.
        target = 0.75 if self.tick <= 6 and not self.qos_requested else 0.25
        self.congestion += (target - self.congestion) * 0.35 + self.rng.uniform(-0.05, 0.05)
        self.congestion = max(0.0, min(1.0, self.congestion))

        return {
            "tick": self.tick,
            "devices_remaining": self.devices_remaining,
            "devices_exited": exited,
            "congestion": round(self.congestion, 3),
        }


class SimulationRegistry:
    """Keeps one IncidentSimState alive per incident id for the process lifetime."""

    def __init__(self) -> None:
        self._states: dict[str, IncidentSimState] = {}

    def get_or_create(self, incident_id: str, seed_devices: int) -> IncidentSimState:
        if incident_id not in self._states:
            self._states[incident_id] = IncidentSimState(incident_id, seed_devices)
        return self._states[incident_id]

    def drop(self, incident_id: str) -> None:
        self._states.pop(incident_id, None)


simulation_registry = SimulationRegistry()
