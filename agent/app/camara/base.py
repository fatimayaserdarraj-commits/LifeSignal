"""Shared plumbing for CAMARA API clients.

Each client exposes the same shape regardless of mode: a small async method
that either calls the real Nokia Network-as-Code (CAMARA) endpoint, or reads
from the shared `IncidentSimState` when `settings.camara_live` is False (the
default, and the only mode that needs zero credentials).
"""
from __future__ import annotations

import httpx

from app.config import settings


class CamaraClientError(RuntimeError):
    """Raised when a live CAMARA call fails; callers should fall back gracefully."""


async def post_json(path: str, payload: dict) -> dict:
    """POST helper against Nokia Network-as-Code, used only in live mode."""
    if not settings.nokia_nac_api_key:
        raise CamaraClientError("Nokia Network-as-Code API key not configured")

    url = f"{settings.nokia_nac_base_url}{path}"
    headers = {
        "Authorization": f"Bearer {settings.nokia_nac_api_key}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=6.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
