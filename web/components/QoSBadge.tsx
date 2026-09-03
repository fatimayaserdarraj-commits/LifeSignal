import type { Incident } from "@/lib/types";

export default function QoSBadge({ incident }: { incident: Incident }) {
  const congestionPct = Math.round(incident.congestion_level * 100);

  return (
    <div className="rounded-xl border border-border bg-surface2 p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Network Signal
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-gray-300">Congestion</span>
        <span
          className={`text-sm font-bold ${
            congestionPct >= 70 ? "text-amber" : "text-gray-200"
          }`}
        >
          {congestionPct}%
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink">
        <div
          className={`h-full rounded-full transition-all ${
            congestionPct >= 70 ? "bg-amber" : "bg-signal"
          }`}
          style={{ width: `${congestionPct}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-300">QoS on Demand</span>
        {incident.qos_boost_active ? (
          <span className="rounded-full bg-signal/20 px-2.5 py-0.5 text-xs font-semibold text-signal">
            Boost Active
          </span>
        ) : (
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-gray-500">
            Standby
          </span>
        )}
      </div>
    </div>
  );
}
