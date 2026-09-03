import type { Incident, IncidentCreatePayload, MetricsSnapshot, RiskZone } from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }
  return response.json() as Promise<T>;
}

export function listIncidents(): Promise<Incident[]> {
  return request<Incident[]>("/incidents");
}

export function getIncident(id: string): Promise<Incident> {
  return request<Incident>(`/incidents/${id}`);
}

export function createIncident(payload: IncidentCreatePayload): Promise<Incident> {
  return request<Incident>("/incidents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getRiskZones(): Promise<RiskZone[]> {
  return request<RiskZone[]>("/risk-zones");
}

export function recomputeRiskZones(): Promise<RiskZone[]> {
  return request<RiskZone[]>("/risk-zones/recompute", { method: "POST" });
}

export function getMetrics(): Promise<MetricsSnapshot> {
  return request<MetricsSnapshot>("/metrics");
}

export function incidentStreamUrl(id: string): string {
  return `${API_BASE}/incidents/${id}/stream`;
}
