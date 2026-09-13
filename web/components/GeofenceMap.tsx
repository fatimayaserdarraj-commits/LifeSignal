"use client";

import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { Circle, CircleMarker, MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Incident } from "@/lib/types";
import { scatterDevicePoints } from "@/lib/deviceScatter";

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

  // Pool size: the most devices we've ever confirmed in this zone, falling
  // back to the initial estimate/current count before the first poll lands.
  const poolSize = Math.max(
    incident.unique_devices_detected,
    incident.initial_device_estimate ?? 0,
    incident.occupant_count
  );

  const devicePoints = useMemo(
    () => scatterDevicePoints(incident.id, incident.latitude, incident.longitude, incident.radius_meters, poolSize),
    [incident.id, incident.latitude, incident.longitude, incident.radius_meters, poolSize]
  );

  const presentPoints = devicePoints.slice(0, incident.occupant_count);
  const exitedPoints = devicePoints.slice(incident.occupant_count);

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
          fillOpacity: 0.08,
          weight: 2,
        }}
      />
      {exitedPoints.map((point) => (
        <CircleMarker
          key={`exited-${point.id}`}
          center={[point.lat, point.lng]}
          radius={4}
          pathOptions={{ color: "#5C6672", fillColor: "#5C6672", fillOpacity: 0.5, weight: 1 }}
        >
          <Tooltip>Device #{point.id + 1} — exited the zone</Tooltip>
        </CircleMarker>
      ))}
      {presentPoints.map((point) => (
        <CircleMarker
          key={`present-${point.id}`}
          center={[point.lat, point.lng]}
          radius={6}
          pathOptions={{
            color: congested ? "#F5B942" : "#FF6B57",
            fillColor: congested ? "#F5B942" : "#FF6B57",
            fillOpacity: 0.85,
            weight: 1,
          }}
        >
          <Tooltip>Device #{point.id + 1} — inside the geofence</Tooltip>
        </CircleMarker>
      ))}
      <Marker position={center} icon={markerIcon}>
        <Tooltip permanent direction="top" offset={[0, -8]}>
          {incident.label} — {incident.occupant_count} device
          {incident.occupant_count === 1 ? "" : "s"} in geofence
        </Tooltip>
      </Marker>
    </MapContainer>
  );
}
