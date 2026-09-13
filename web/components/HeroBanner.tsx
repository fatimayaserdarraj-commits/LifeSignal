import { Activity, Radio } from "lucide-react";
import FirefighterIllustration from "./FirefighterIllustration";

export default function HeroBanner() {
  return (
    <div className="relative flex items-center gap-6 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface2 to-surface p-6">
      <FirefighterIllustration className="hidden h-32 w-32 shrink-0 sm:block" />
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-coral">
          <Radio size={13} strokeWidth={2.5} />
          Live Incident Command
        </div>
        <h1 className="mt-1 text-xl font-bold text-white">Every second of visibility saves a life.</h1>
        <p className="mt-1 max-w-xl text-sm text-gray-400">
          Report a fire-scene incident and LifeSignal turns network signals into a live,
          continuously-updating occupancy count for the incident commander — no app install,
          no pre-enrolled devices required.
        </p>
      </div>
      <div className="ml-auto hidden shrink-0 items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-2 text-xs text-gray-400 md:flex">
        <Activity size={14} className="text-signal" strokeWidth={2.25} />
        Agent monitoring active
      </div>
    </div>
  );
}
