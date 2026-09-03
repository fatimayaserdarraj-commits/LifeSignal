import type { IncidentStatus } from "@/lib/types";

const STYLES: Record<IncidentStatus, string> = {
  reported: "bg-amber/20 text-amber border-amber/40",
  geofenced: "bg-coral/20 text-coral border-coral/40",
  monitoring: "bg-coral/20 text-coral border-coral/40",
  resolved: "bg-signal/20 text-signal border-signal/40",
};

const LABELS: Record<IncidentStatus, string> = {
  reported: "Reported",
  geofenced: "Geofence Active",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export default function StatusPill({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      {status === "monitoring" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {LABELS[status]}
    </span>
  );
}
