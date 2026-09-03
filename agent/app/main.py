"""LifeSignal Agent Service.

FastAPI app hosting the Occupancy Agent and Risk Mapping Agent (both
LangGraph state machines) behind a small REST + SSE API consumed by the
Next.js Command and Planning dashboards.
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import incidents, metrics, risk_zones
from app.seed import ensure_seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_seed_data()
    yield


app = FastAPI(
    title="LifeSignal Agent Service",
    description=(
        "AI agent for real-time fire-scene occupancy detection and "
        "network-resilience mapping, built on CAMARA APIs via Nokia "
        "Network-as-Code."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router)
app.include_router(risk_zones.router)
app.include_router(metrics.router)


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "camara_mode": "live" if settings.camara_live else "simulate",
        "llm_mode": "groq" if settings.groq_enabled else "template",
        "persistence": "supabase" if settings.supabase_enabled else "memory",
        "alerting": "twilio" if settings.twilio_enabled else "log",
    }
