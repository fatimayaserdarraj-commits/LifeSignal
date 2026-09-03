"use client";

import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { RiskZone } from "@/lib/types";

function colorFor(score: number): string {
  if (score >= 0.66) return "#FF6B57";
  if (score >= 0.4) return "#F5B942";
  return "#34D1BF";
}

export default function RiskZoneMap({ zones }: { zones: RiskZone[] }) {
  const center: [number, number] =
    zones.length > 0
      ? [zones[0].center_latitude, zones[0].center_longitude]
      : [25.2, 55.27];

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
      {zones.map((zone) => (
        <Circle
          key={zone.id}
          center={[zone.center_latitude, zone.center_longitude]}
          radius={600 + zone.risk_score * 900}
          pathOptions={{
            color: colorFor(zone.risk_score),
            fillColor: colorFor(zone.risk_score),
            fillOpacity: 0.25,
            weight: 1.5,
          }}
        >
          <Tooltip>{zone.label}</Tooltip>
        </Circle>
      ))}
    </MapContainer>
  );
}
