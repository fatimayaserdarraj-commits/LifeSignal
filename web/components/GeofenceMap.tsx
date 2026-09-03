"use client";

import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Incident } from "@/lib/types";

// Default Leaflet marker icons reference bundled assets that don't resolve
// under Next.js's module system; point them at the CDN instead.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function GeofenceMap({ incident }: { incident: Incident }) {
  const center: [number, number] = [incident.latitude, incident.longitude];
  const congested = incident.congestion_level >= 0.7;

  return (
    <MapContainer
      center={center}
      zoom={16}
      scrollWheelZoom={false}
      className="h-full w-full rounded-lg"
      style={{ background: "#131A22" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={center}
        radius={incident.radius_meters}
        pathOptions={{
          color: congested ? "#F5B942" : "#FF6B57",
          fillColor: congested ? "#F5B942" : "#FF6B57",
          fillOpacity: 0.15,
          weight: 2,
        }}
      />
      <Marker position={center} icon={markerIcon}>
        <Tooltip permanent direction="top" offset={[0, -8]}>
          {incident.label} — {incident.occupant_count} device
          {incident.occupant_count === 1 ? "" : "s"} in geofence
        </Tooltip>
      </Marker>
    </MapContainer>
  );
}
