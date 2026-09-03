"""Twilio SMS/voice alerting for the command center and building safety officers.

Without Twilio credentials this simply logs the alert -- the incident
timeline still records that an alert *would* have been sent, which is what
the dashboard displays either way.
"""
from __future__ import annotations

import logging

from app.config import settings

logger = logging.getLogger("lifesignal.alerting")


async def send_alert(message: str) -> dict:
    if settings.twilio_enabled and settings.twilio_alert_to_number:
        try:
            from twilio.rest import Client

            client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
            sms = client.messages.create(
                body=message,
                from_=settings.twilio_from_number,
                to=settings.twilio_alert_to_number,
            )
            return {"delivered": True, "sid": sms.sid, "mode": "live"}
        except Exception as exc:  # noqa: BLE001
            logger.warning("Twilio alert failed, falling back to log: %s", exc)

    logger.info("[ALERT] %s", message)
    return {"delivered": False, "mode": "simulate", "message": message}
