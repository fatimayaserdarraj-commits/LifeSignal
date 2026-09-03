export type IncidentStatus = "reported" | "geofenced" | "monitoring" | "resolved";

export interface ReasoningEntry {
  timestamp: string;
  message: string;
  occupant_count: number;
  devices_exited_recent: number;
  congestion_level: number | null;
  qos_boost_active: boolean;
}

export interface Incident {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  occupant_count: number;
  peak_occupant_count: number;
  devices_exited_total: number;
  congestion_level: number;
  qos_boost_active: boolean;
  qos_boost_requested_at: string | null;
  reasoning_trace: ReasoningEntry[];
  resolved_at: string | null;
  time_to_first_estimate_seconds: number | null;
}

export interface RiskZone {
  id: string;
  grid_cell: string;
  center_latitude: number;
  center_longitude: number;
  incident_count: number;
  avg_congestion: number;
  risk_score: number;
  label: string;
}

export interface MetricsSnapshot {
  incidents_tracked: number;
  avg_time_to_occupancy_estimate_seconds: number | null;
  avg_occupant_accuracy_pct: number | null;
  high_risk_zones_identified: number;
  qos_boost_success_rate_pct: number | null;
  resource_misallocation_reduction_pct: number | null;
  avg_partner_integration_days: number | null;
}

export interface IncidentCreatePayload {
  label: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  initial_device_estimate?: number;
}
