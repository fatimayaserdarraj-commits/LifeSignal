"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  Flame,
  Gauge,
  Map as MapIcon,
  RefreshCw,
  ShieldAlert,
  Target,
  TrendingDown,
  Wifi,
} from "lucide-react";
import { getMetrics, getRiskZones, recomputeRiskZones } from "@/lib/api";
import type { MetricsSnapshot, RiskZone } from "@/lib/types";
import MetricCard from "@/components/MetricCard";
import RiskZoneList from "@/components/RiskZoneList";

const RiskZoneMap = dynamic(() => import("@/components/RiskZoneMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-surface2 text-sm text-gray-500">
      Loading map…
    </div>
  ),
});

export default function PlanningDashboardPage() {
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [zoneData, metricsData] = await Promise.all([getRiskZones(), getMetrics()]);
      setZones(zoneData);
      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Can't reach the agent service (${err.message}). Is it running?`
          : "Can't reach the agent service."
      );
    }
  }, []);

  useEffect(() => {
    // Polling an external REST API to stay in sync, not a render-driven
    // state cascade -- see https://react.dev/learn/you-might-not-need-an-effect#fetching-data
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleRecompute() {
    setRefreshing(true);
    try {
      const zoneData = await recomputeRiskZones();
      setZones(zoneData);
    } finally {
      setRefreshing(false);
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-amber/40 bg-amber/10 p-4 text-sm text-amber">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coral/15 text-coral">
            <ShieldAlert size={18} strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Civil-Defense Planning Dashboard</h1>
            <p className="text-sm text-gray-400">
              Recurring high-fire, weak-network zones flagged by the Risk Mapping Agent — the
              priority list for infrastructure investment.
            </p>
          </div>
        </div>
        <button
          onClick={handleRecompute}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-md border border-border bg-surface2 px-4 py-2 text-sm font-medium text-gray-200 hover:border-coral hover:text-coral disabled:opacity-50"
        >
          <RefreshCw size={14} strokeWidth={2.25} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Recomputing…" : "Recompute Risk Map"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          label="Incidents Tracked"
          value={metrics?.incidents_tracked ?? null}
          accent
          icon={Flame}
        />
        <MetricCard
          label="Time to Estimate"
          value={
            metrics?.avg_time_to_occupancy_estimate_seconds != null
              ? metrics.avg_time_to_occupancy_estimate_seconds.toFixed(1)
              : null
          }
          suffix="s"
          icon={Gauge}
        />
        <MetricCard
          label="Resource Misallocation ↓"
          value={
            metrics?.resource_misallocation_reduction_pct != null
              ? metrics.resource_misallocation_reduction_pct
              : null
          }
          suffix="%"
          icon={TrendingDown}
        />
        <MetricCard
          label="Occupant Accuracy"
          value={metrics?.avg_occupant_accuracy_pct ?? null}
          suffix="%"
          icon={Target}
        />
        <MetricCard
          label="High-Risk Zones"
          value={metrics?.high_risk_zones_identified ?? null}
          icon={ShieldAlert}
        />
        <MetricCard
          label="QoS Boost Success"
          value={metrics?.qos_boost_success_rate_pct ?? null}
          suffix="%"
          icon={Wifi}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex h-96 flex-col overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-2 border-b border-border bg-surface2 px-4 py-3">
            <MapIcon size={15} className="text-gray-400" strokeWidth={2.25} />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Risk Map
            </span>
            {selectedZoneId && (
              <span className="ml-auto text-xs text-gray-500">
                Click a zone below to jump to it
              </span>
            )}
          </div>
          <div className="flex-1">
            <RiskZoneMap zones={zones} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} />
          </div>
        </div>
        <div className="h-96 overflow-y-auto">
          <RiskZoneList zones={zones} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} />
        </div>
      </div>
    </div>
  );
}
