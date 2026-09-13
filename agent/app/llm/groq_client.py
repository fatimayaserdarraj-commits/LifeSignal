"""Groq (Llama 3.3 70B) client for the incident commander's reasoning trace.

The reasoning trace is the human-readable explanation shown live on the
Command Dashboard ("12 devices detected, 3 have exited in the last 4
minutes, signal quality degrading"). When no GROQ_API_KEY is configured the
client falls back to a deterministic template so the demo never blocks on
an LLM call or an API outage.
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


def _template_fallback(context: dict) -> str:
    occupant_count = context["occupant_count"]
    unique_devices = context.get("unique_devices_detected", occupant_count)
    exited = context["devices_exited_recent"]
    congestion = context["congestion_level"]
    qos_active = context["qos_boost_active"]

    parts = [f"{occupant_count} of {unique_devices} detected device{'s' if unique_devices != 1 else ''} confirmed inside."]
    if exited:
        parts.append(f"{exited} exited in the last interval.")
    if qos_active:
        parts.append("QoS boost active to protect responder comms.")
    elif congestion is not None and congestion >= settings.congestion_threshold:
        parts.append("Signal congestion rising.")
    if occupant_count == 0:
        parts.append("Zone appears clear.")
    return " ".join(parts)


async def generate_reasoning(context: dict) -> str:
    """context keys: occupant_count, devices_exited_recent, congestion_level, qos_boost_active, tick

    Fallback chain: Groq (primary) -> Gemini Flash (secondary) -> deterministic
    template, so the reasoning trace never blocks on a single provider outage.
    """
    if settings.groq_enabled:
        try:
            from groq import AsyncGroq

            client = AsyncGroq(api_key=settings.groq_api_key)
            user_prompt = (
                f"tick={context['tick']} occupant_count={context['occupant_count']} "
                f"unique_devices_detected={context.get('unique_devices_detected', context['occupant_count'])} "
                f"devices_exited_recent={context['devices_exited_recent']} "
                f"congestion_level={context['congestion_level']} "
                f"qos_boost_active={context['qos_boost_active']}"
            )
            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=settings.groq_model,
                    messages=[
                        {"role": "system", "content": _SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    max_tokens=80,
                    temperature=0.4,
                ),
                timeout=_REQUEST_TIMEOUT_SECONDS,
            )
            text = response.choices[0].message.content
            if text and text.strip():
                return text.strip()
        except Exception:  # noqa: BLE001 - live LLM failure must never break the incident loop
            pass

    from app.llm.gemini_client import generate_reasoning as gemini_generate_reasoning

    gemini_text = await gemini_generate_reasoning(context)
    if gemini_text:
        return gemini_text

    return _template_fallback(context)
