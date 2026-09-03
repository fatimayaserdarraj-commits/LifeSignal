import type { ReasoningEntry } from "@/lib/types";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function ReasoningTrace({ entries }: { entries: ReasoningEntry[] }) {
  const ordered = [...entries].reverse();

  return (
    <div className="rounded-xl border border-border bg-surface2 p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Agent Reasoning Trace
      </div>
      <div className="mt-3 max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {ordered.length === 0 && (
          <p className="text-sm text-gray-500">Waiting for the first network read…</p>
        )}
        {ordered.map((entry, idx) => (
          <div
            key={`${entry.timestamp}-${idx}`}
            className={`rounded-lg border-l-2 py-1.5 pl-3 text-sm ${
              idx === 0 ? "border-coral text-gray-100" : "border-border text-gray-400"
            }`}
          >
            <div className="mb-0.5 font-mono text-[10px] text-gray-500">
              {formatTime(entry.timestamp)}
            </div>
            {entry.message}
          </div>
        ))}
      </div>
    </div>
  );
}
