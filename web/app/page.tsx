"use client";

import { useCallback, useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { listIncidents } from "@/lib/api";
import type { Incident } from "@/lib/types";
import ReportFireForm from "@/components/ReportFireForm";
import IncidentList from "@/components/IncidentList";
import IncidentDetail from "@/components/IncidentDetail";
import HeroBanner from "@/components/HeroBanner";

export default function CommandDashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await listIncidents();
      setIncidents(data);
      setApiError(null);
    } catch (err) {
      setApiError(
        err instanceof Error
          ? `Can't reach the agent service (${err.message}). Is it running?`
          : "Can't reach the agent service."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Polling an external REST API to stay in sync, not a render-driven
    // state cascade -- see https://react.dev/learn/you-might-not-need-an-effect#fetching-data
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  function handleCreated(incident: Incident) {
    setIncidents((prev) => [incident, ...prev]);
    setSelectedId(incident.id);
  }

  const selected = incidents.find((i) => i.id === selectedId) ?? incidents[0] ?? null;

  return (
    <div className="space-y-6">
      <HeroBanner />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <ReportFireForm onCreated={handleCreated} />
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              <ListChecks size={14} strokeWidth={2.25} />
              Active &amp; Recent Incidents
            </div>
            <IncidentList
              incidents={incidents}
              selectedId={selected?.id ?? null}
              onSelect={setSelectedId}
            />
          </div>
        </div>

        <div>
          {apiError && (
            <div className="mb-4 rounded-lg border border-amber/40 bg-amber/10 p-4 text-sm text-amber">
              {apiError}
            </div>
          )}
          {!apiError && loading && (
            <div className="text-sm text-gray-500">Loading incidents…</div>
          )}
          {!apiError && !loading && selected && <IncidentDetail key={selected.id} initial={selected} />}
          {!apiError && !loading && !selected && (
            <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
              <p className="text-gray-400">No incident selected.</p>
              <p className="mt-1 text-sm text-gray-500">
                Report a fire on the left to see LifeSignal in action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
