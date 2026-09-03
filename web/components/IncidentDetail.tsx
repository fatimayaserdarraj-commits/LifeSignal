"use client";

import dynamic from "next/dynamic";
import { useIncidentStream } from "@/lib/useIncidentStream";
import type { Incident } from "@/lib/types";
import OccupancyCounter from "./OccupancyCounter";
import QoSBadge from "./QoSBadge";
import ReasoningTrace from "./ReasoningTrace";
import StatusPill from "./StatusPill";

const GeofenceMap = dynamic(() => import("./GeofenceMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-surface2 text-sm text-gray-500">
      Loading map…
    </div>
  ),
});

export default function IncidentDetail({ initial }: { initial: Incident }) {
  const incident = useIncidentStream(initial);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">{incident.label}</h2>
          <p className="text-sm text-gray-400">
            {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)} · geofence radius{" "}
            {Math.round(incident.radius_meters)}m
          </p>
        </div>
        <StatusPill status={incident.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-80 overflow-hidden rounded-xl border border-border lg:col-span-2">
          <GeofenceMap incident={incident} />
        </div>
        <div className="flex flex-col gap-4">
          <OccupancyCounter incident={incident} />
          <QoSBadge incident={incident} />
        </div>
      </div>

      <ReasoningTrace entries={incident.reasoning_trace} />
    </div>
  );
}
