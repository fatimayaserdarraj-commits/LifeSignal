import { ListOrdered, MapPin } from "lucide-react";
import type { RiskZone } from "@/lib/types";

function tierFor(score: number): { label: string; className: string } {
  if (score >= 0.66) return { label: "High", className: "bg-coral/20 text-coral" };
  if (score >= 0.4) return { label: "Elevated", className: "bg-amber/20 text-amber" };
  return { label: "Watch", className: "bg-signal/20 text-signal" };
}

export default function RiskZoneList({
  zones,
  selectedZoneId,
  onSelectZone,
}: {
  zones: RiskZone[];
  selectedZoneId?: string | null;
  onSelectZone?: (id: string) => void;
}) {
  if (zones.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface2 p-5 text-sm text-gray-500">
        No incident history yet — resolve a live incident to start building the risk map.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-surface2 px-4 py-3">
        <ListOrdered size={15} className="text-gray-400" strokeWidth={2.25} />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Zone Priority List
        </span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-surface2 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <th className="px-4 py-3 text-left">Zone</th>
            <th className="px-4 py-3 text-left">Tier</th>
            <th className="px-4 py-3 text-right">Incidents</th>
            <th className="px-4 py-3 text-right">Avg. Congestion</th>
            <th className="px-4 py-3 text-right">Risk Score</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => {
            const tier = tierFor(zone.risk_score);
            const selected = zone.id === selectedZoneId;
            return (
              <tr
                key={zone.id}
                onClick={() => onSelectZone?.(zone.id)}
                className={`border-t border-border transition-colors ${
                  onSelectZone ? "cursor-pointer" : ""
                } ${selected ? "bg-coral/10" : "bg-surface hover:bg-surface2"}`}
              >
                <td className="px-4 py-3 text-gray-200">
                  <span className="flex items-center gap-1.5">
                    <MapPin
                      size={13}
                      strokeWidth={2.25}
                      className={selected ? "text-coral" : "text-gray-500"}
                    />
                    {zone.center_latitude.toFixed(3)}, {zone.center_longitude.toFixed(3)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tier.className}`}>
                    {tier.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-300">{zone.incident_count}</td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {Math.round(zone.avg_congestion * 100)}%
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-200">
                  {zone.risk_score.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
