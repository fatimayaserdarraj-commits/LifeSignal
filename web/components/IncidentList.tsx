import type { Incident } from "@/lib/types";
import StatusPill from "./StatusPill";

export default function IncidentList({
  incidents,
  selectedId,
  onSelect,
}: {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface2 p-5 text-sm text-gray-500">
        No incidents yet. Report one to start the demo.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {incidents.map((incident) => (
        <button
          key={incident.id}
          onClick={() => onSelect(incident.id)}
          className={`w-full rounded-lg border p-3 text-left transition-colors ${
            incident.id === selectedId
              ? "border-coral bg-surface2"
              : "border-border bg-surface hover:border-gray-500"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-white">{incident.label}</span>
            <StatusPill status={incident.status} />
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {incident.occupant_count} occupant{incident.occupant_count === 1 ? "" : "s"} ·{" "}
            {new Date(incident.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </button>
      ))}
    </div>
  );
}
