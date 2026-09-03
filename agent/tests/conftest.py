import pytest

from app.config import settings


@pytest.fixture(autouse=True)
def _fast_agent_tuning():
    """Speed up the occupancy loop for tests: no sleep, short cap."""
    original_interval = settings.occupancy_poll_interval_seconds
    original_max_ticks = settings.occupancy_max_ticks
    settings.occupancy_poll_interval_seconds = 0.0
    settings.occupancy_max_ticks = 40
    yield
    settings.occupancy_poll_interval_seconds = original_interval
    settings.occupancy_max_ticks = original_max_ticks
