/** @type {import('next').NextConfig} */
const nextConfig = {
  // react-leaflet's MapContainer initializes Leaflet directly against a DOM
  // node ref; React 18 Strict Mode's dev-only double-mount reuses that node
  // and Leaflet throws "Map container is already initialized." Production
  // builds only mount once regardless, so this only disables the dev-mode
  // double-invoke behavior for this app.
  reactStrictMode: false,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

module.exports = nextConfig;
