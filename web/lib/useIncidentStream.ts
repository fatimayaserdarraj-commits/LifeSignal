"use client";

import { useEffect, useState } from "react";
import { incidentStreamUrl } from "./api";
import type { Incident } from "./types";

/**
 * Subscribes to the agent service's SSE incident stream and keeps a React
 * state value in sync with the latest full incident snapshot.
 *
 * Callers are expected to remount this hook's component per incident (e.g.
 * `<IncidentDetail key={incident.id} initial={incident} />`), so `initial`
 * is only ever read at mount time -- it intentionally does not react to
 * later prop changes, only to the SSE stream itself.
 */
export function useIncidentStream(initial: Incident): Incident {
  const [incident, setIncident] = useState<Incident>(initial);

  useEffect(() => {
    if (initial.status === "resolved") return;

    const source = new EventSource(incidentStreamUrl(initial.id));

    const handleIncident = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const next: Incident = data.incident ?? data;
        setIncident(next);
      } catch {
        // ignore malformed frames
      }
    };

    source.addEventListener("incident", handleIncident);
    source.addEventListener("done", () => source.close());

    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resubscribe only on mount (id is stable per mounted instance, see doc comment)
  }, []);

  return incident;
}
