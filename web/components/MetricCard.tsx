export default function MetricCard({
  label,
  value,
  suffix,
  accent = false,
}: {
  label: string;
  value: string | number | null;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface2 p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</div>
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
