/**
 * CAMARA's Location Retrieval / Device Status APIs return an aggregate
 * device count for the geofenced area, not individual device coordinates
 * (see agent/app/camara/location.py) -- LifeSignal never receives raw
 * per-phone GPS. These points are an illustrative scatter of that count
 * across the geofence, deterministically seeded per incident so re-renders
 * (and fewer remaining devices as occupants evacuate) don't make dots jump
 * around -- not a claim of exact device positions.
 */

function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

export interface DevicePoint {
  id: number;
  lat: number;
  lng: number;
}

/** Deterministic scatter of `count` points uniformly inside a circle of
 * `radiusMeters` around (centerLat, centerLng). Point i's position depends
 * only on (seed, i), never on `count`, so the pool is stable as count grows
 * or shrinks -- callers slice a prefix to show "currently present" devices. */
export function scatterDevicePoints(
  seed: string,
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  count: number
): DevicePoint[] {
  const rng = mulberry32(hashSeed(seed));
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLng = 111_320 * Math.cos((centerLat * Math.PI) / 180) || 1;

  const points: DevicePoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rng() * 2 * Math.PI;
    // sqrt(uniform) radius avoids over-clustering points near the center.
    const radius = radiusMeters * 0.92 * Math.sqrt(rng());
    const dLat = (radius * Math.sin(angle)) / metersPerDegreeLat;
    const dLng = (radius * Math.cos(angle)) / metersPerDegreeLng;
    points.push({ id: i, lat: centerLat + dLat, lng: centerLng + dLng });
  }
  return points;
}
