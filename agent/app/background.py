"""Background tasks that run for the lifetime of the FastAPI process.

The Risk Mapping Agent is meant to run continuously, not just when the
Planning Dashboard happens to ask for it -- see app.graphs.risk_mapping_agent.
This starts a simple asyncio loop from the app lifespan (app.main) that
recomputes weak zones on a fixed interval and caches the result.
"""
from __future__ import annotations

import asyncio
import logging

from app.config import settings
from app.graphs.risk_mapping_agent import run_risk_mapping_agent

logger = logging.getLogger(__name__)

_task: asyncio.Task | None = None


async def _risk_mapping_loop() -> None:
    while True:
        try:
            await run_risk_mapping_agent()
        except Exception:  # noqa: BLE001 - a failed scan must never kill the background loop
            logger.exception("Risk Mapping Agent background scan failed")
        await asyncio.sleep(settings.risk_mapping_interval_seconds)


def start_background_tasks() -> None:
    global _task
    if _task is None or _task.done():
        _task = asyncio.create_task(_risk_mapping_loop())


def stop_background_tasks() -> None:
    global _task
    if _task is not None:
        _task.cancel()
        _task = None
