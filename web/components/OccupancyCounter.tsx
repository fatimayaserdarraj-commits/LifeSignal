import type { Incident } from "@/lib/types";

export default function OccupancyCounter({ incident }: { incident: Incident }) {
  const isResolved = incident.status === "resolved";

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface2 p-8 text-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {isResolved ? "Final occupant count" : "Live occupant estimate"}
      </div>
      <div
        className={`mt-2 text-7xl font-black tabular-nums ${
          isResolved ? "text-signal" : "text-coral"
        }`}
      >
        {incident.occupant_count}
      </div>
      <div className="mt-2 text-sm text-gray-400">
        {incident.unique_devices_detected} unique devices detected · {incident.devices_exited_total} exited
      </div>
    </div>
  );
}
