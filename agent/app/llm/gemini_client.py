"""Gemini Flash client — secondary LLM used when Groq is unavailable or errors.

Same reasoning-trace contract as app.llm.groq_client.generate_reasoning: given
live occupancy signals, return one short plain-English situational update.
"""
from __future__ import annotations

import asyncio

from app.config import settings

_REQUEST_TIMEOUT_SECONDS = 8.0

_SYSTEM_PROMPT = (
    "You are LifeSignal, an AI agent assisting a fire incident commander. "
    "Given live network-derived occupancy signals, write ONE short, plain-English "
    "situational update (max 30 words) for the commander. Be concrete: cite the "
    "current occupant count out of the unique devices ever detected, how many "
    "people just exited, and congestion/QoS status if notable. occupant_count is "
    "how many are confirmed inside right now; unique_devices_detected is the "
    "total ever seen in the zone (the ceiling exits are counted against) -- "
    "never imply more people exited than unique_devices_detected. No preamble, "
    "no markdown, just the sentence."
)


async def generate_reasoning(context: dict) -> str | None:
    """Returns None (rather than a template) on failure, so the caller can
    decide the next fallback step instead of this client guessing one."""
    if not settings.gemini_enabled:
        return None

    try:
        from google import genai

        client = genai.Client(api_key=settings.gemini_api_key)
        user_prompt = (
            f"tick={context['tick']} occupant_count={context['occupant_count']} "
            f"unique_devices_detected={context.get('unique_devices_detected', context['occupant_count'])} "
            f"devices_exited_recent={context['devices_exited_recent']} "
            f"congestion_level={context['congestion_level']} "
            f"qos_boost_active={context['qos_boost_active']}"
        )
        response = await asyncio.wait_for(
            client.aio.models.generate_content(
                model=settings.gemini_model,
                contents=user_prompt,
                config={
                    "system_instruction": _SYSTEM_PROMPT,
                    "max_output_tokens": 80,
                    "temperature": 0.4,
                },
            ),
            timeout=_REQUEST_TIMEOUT_SECONDS,
        )
        text = response.text
        return text.strip() if text else None
    except Exception:  # noqa: BLE001 - live LLM failure must never break the incident loop
        return None
