"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { RiskZone } from "@/lib/types";

function colorFor(score: number): string {
  if (score >= 0.66) return "#FF6B57";
  if (score >= 0.4) return "#F5B942";
  return "#34D1BF";
}

function FlyToZone({ zone }: { zone: RiskZone | null }) {
  const map = useMap();

  useEffect(() => {
    if (zone) {
      map.flyTo([zone.center_latitude, zone.center_longitude], 14, { duration: 0.9 });
    }
  }, [zone, map]);

  return null;
}

export default function RiskZoneMap({
  zones,
  selectedZoneId,
  onSelectZone,
}: {
  zones: RiskZone[];
  selectedZoneId?: string | null;
  onSelectZone?: (id: string) => void;
}) {
  const center: [number, number] =
    zones.length > 0
      ? [zones[0].center_latitude, zones[0].center_longitude]
      : [25.2, 55.27];

  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      className="h-full w-full rounded-lg"
      style={{ background: "#131A22" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToZone zone={selectedZone} />
      {zones.map((zone) => {
        const selected = zone.id === selectedZoneId;
        return (
          <Circle
            key={zone.id}
            center={[zone.center_latitude, zone.center_longitude]}
            radius={600 + zone.risk_score * 900}
            eventHandlers={{
              click: () => onSelectZone?.(zone.id),
            }}
            pathOptions={{
              color: colorFor(zone.risk_score),
              fillColor: colorFor(zone.risk_score),
              fillOpacity: selected ? 0.5 : 0.25,
              weight: selected ? 3.5 : 1.5,
            }}
          >
            <Tooltip permanent={selected}>{zone.label}</Tooltip>
          </Circle>
        );
      })}
    </MapContainer>
  );
}
