"""Central runtime configuration.

Every external integration (CAMARA/Nokia Network-as-Code, Groq, Supabase,
Twilio) is optional. When credentials are absent the corresponding client
falls back to a deterministic simulator or a no-op, so the whole prototype
runs end-to-end with zero paid commitment -- exactly the "graceful
degradation" behaviour described in the pitch.
"""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- CAMARA / Nokia Network-as-Code -------------------------------
    camara_mode: str = "simulate"  # "simulate" | "live"
    nokia_nac_base_url: str = "https://network-as-code.p-eu.rapidapi.com"
    nokia_nac_api_key: str | None = None

    # --- LLM (Groq, primary) ---------------------------------------------
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"

    # --- LLM (Gemini, secondary fallback) ---------------------------------
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-flash-latest"

    # --- Supabase ---------------------------------------------------------
    supabase_url: str | None = None
    supabase_key: str | None = None

    # --- Twilio alerting --------------------------------------------------
    twilio_account_sid: str | None = None
    twilio_auth_token: str | None = None
    twilio_from_number: str | None = None
    twilio_alert_to_number: str | None = None

    # --- Agent tuning -------------------------------------------------
    occupancy_poll_interval_seconds: float = 2.0
    occupancy_max_ticks: int = 40
    congestion_threshold: float = 0.7
    risk_zone_grid_size_km: float = 1.0
    risk_mapping_interval_seconds: float = 300.0

    # --- App ------------------------------------------------------------
    cors_origins: str = "*"

    @property
    def camara_live(self) -> bool:
        return self.camara_mode == "live" and bool(self.nokia_nac_api_key)

    @property
    def groq_enabled(self) -> bool:
        return bool(self.groq_api_key)

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)

    @property
    def twilio_enabled(self) -> bool:
        return bool(self.twilio_account_sid and self.twilio_auth_token)


settings = Settings()
