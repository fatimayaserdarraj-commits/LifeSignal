"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { createIncident } from "@/lib/api";
import type { Incident } from "@/lib/types";

const PRESETS = [
  { label: "Deira Residential Tower", latitude: 25.2705, longitude: 55.3091, devices: 18 },
  { label: "Al Quoz Warehouse Fire", latitude: 25.1408, longitude: 55.2285, devices: 7 },
  { label: "Al Barsha Mega-Project Site", latitude: 25.1128, longitude: 55.1995, devices: 12 },
];

// Kept outside the component: these read Math.random(), which the React
// Compiler's purity rule disallows directly inside render/event-handler
// closures defined in a component body.
function jitter(value: number): number {
  return value + (Math.random() - 0.5) * 0.001;
}

function pickRandomPreset(): (typeof PRESETS)[number] {
  return PRESETS[Math.floor(Math.random() * PRESETS.length)];
}

export default function ReportFireForm({ onCreated }: { onCreated: (incident: Incident) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [devices, setDevices] = useState(10);
  const [error, setError] = useState<string | null>(null);

  async function report(preset: (typeof PRESETS)[number]) {
    setSubmitting(true);
    setError(null);
    try {
      const incident = await createIncident({
        label: preset.label,
        latitude: jitter(preset.latitude),
        longitude: jitter(preset.longitude),
        radius_meters: 120,
        initial_device_estimate: preset.devices,
      });
      onCreated(incident);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report incident");
    } finally {
      setSubmitting(false);
    }
  }

  async function reportCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    const base = pickRandomPreset();
    await report({ ...base, label, devices });
    setLabel("");
    setCustomOpen(false);
  }

  return (
    <div className="rounded-xl border border-coral/30 bg-surface2 p-5">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-coral">
        <Flame size={14} strokeWidth={2.25} />
        Report a Fire
      </div>
      <p className="mt-1 text-sm text-gray-400">
        Simulates a dispatch trigger. LifeSignal will geofence the location and start
        reading live network signals immediately.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            disabled={submitting}
            onClick={() => report(preset)}
            className="rounded-lg border border-border bg-ink px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-coral hover:text-coral disabled:opacity-50"
          >
            {preset.label}
          </button>
        ))}
        <button
          disabled={submitting}
          onClick={() => setCustomOpen((v) => !v)}
          className="rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-gray-400 hover:border-coral hover:text-coral"
        >
          + Custom
        </button>
      </div>

      {customOpen && (
        <form onSubmit={reportCustom} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Incident label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Marina Tower - Floor 22"
              className="rounded-md border border-border bg-ink px-3 py-2 text-sm text-white outline-none focus:border-coral"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Est. devices</label>
            <input
              type="number"
              min={1}
              max={80}
              value={devices}
              onChange={(e) => setDevices(Number(e.target.value))}
              className="w-24 rounded-md border border-border bg-ink px-3 py-2 text-sm text-white outline-none focus:border-coral"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Report
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-amber">{error}</p>}
    </div>
  );
}
