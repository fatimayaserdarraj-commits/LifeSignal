import type { LucideIcon } from "lucide-react";

export default function MetricCard({
  label,
  value,
  suffix,
  accent = false,
  icon: Icon,
}: {
  label: string;
  value: string | number | null;
  suffix?: string;
  accent?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-surface2 p-5 transition-colors hover:border-gray-500">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</div>
        {Icon && (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              accent ? "bg-coral/15 text-coral" : "bg-surface text-gray-400"
            }`}
          >
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className={`mt-2 text-3xl font-black ${accent ? "text-coral" : "text-white"}`}>
        {value === null || value === undefined ? (
          <span className="text-lg font-medium text-gray-500">Awaiting data</span>
        ) : (
          <>
            {value}
            {suffix && <span className="ml-1 text-lg font-semibold text-gray-400">{suffix}</span>}
          </>
        )}
      </div>
    </div>
  );
}
