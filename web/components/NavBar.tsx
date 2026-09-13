"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, LayoutDashboard, Map } from "lucide-react";

const links = [
  { href: "/", label: "Command Dashboard", icon: LayoutDashboard },
  { href: "/planning", label: "Planning Dashboard", icon: Map },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-coral/15">
            <Flame size={20} className="text-coral" strokeWidth={2.25} />
            <span className="pulse-dot absolute -right-1 -top-1 h-3 w-3 rounded-full bg-coral" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white">LifeSignal</div>
            <div className="text-xs text-gray-400">
              Fire-Scene Occupancy &amp; Network-Resilience Mapping
            </div>
          </div>
        </div>
        <nav className="flex gap-1 rounded-lg border border-border bg-surface2 p-1">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-coral text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                <Icon size={15} strokeWidth={2.25} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
