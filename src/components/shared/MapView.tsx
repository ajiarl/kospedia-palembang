"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";

type MapMarker = {
  id: string;
  nama: string;
  alamat?: string;
  lat: number;
  lng: number;
  href?: string;
  type: "kos" | "kampus";
};

type MapViewProps = {
  center?: [number, number];
  zoom?: number;
  markers: MapMarker[];
  className?: string;
};

function createPinIcon(type: MapMarker["type"]) {
  const isKos = type === "kos";
  const color = isKos ? "#1E6B5A" : "#1A2B3C";   // primary teal vs navy
  const innerColor = "white";

  // Teardrop SVG pin
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" width="28" height="40">
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
    </filter>
    <path filter="url(#shadow)" d="M14 1C7.373 1 2 6.373 2 13c0 10.188 12 26 12 26s12-15.813 12-26C26 6.373 20.627 1 14 1z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="13" r="5.5" fill="${innerColor}"/>
    ${isKos ? `<circle cx="14" cy="13" r="2.5" fill="${color}"/>` : `<rect x="11" y="10" width="6" height="6" rx="1" fill="${color}"/>`}
  </svg>`;

  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -42],
    tooltipAnchor: [14, -42],
  });
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length <= 1) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, markers]);

  return null;
}

export default function MapView({
  center,
  zoom = 13,
  markers,
  className = "h-80",
}: MapViewProps) {
  const fallbackCenter: [number, number] = [-2.9761, 104.7754];
  const mapCenter =
    center ??
    (markers[0] ? ([markers[0].lat, markers[0].lng] as [number, number]) : fallbackCenter);

  const kosIcon = useMemo(() => createPinIcon("kos"), []);
  const kampusIcon = useMemo(() => createPinIcon("kampus"), []);

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-muted shadow-sm ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds markers={markers} />

        {markers.map((marker) => (
          <Marker
            key={`${marker.type}-${marker.id}`}
            position={[marker.lat, marker.lng]}
            icon={marker.type === "kos" ? kosIcon : kampusIcon}
          >
            {/* Kampus: tooltip permanent selalu terlihat */}
            {marker.type === "kampus" && (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -44]}
                className="!border-0 !bg-teal-500 !text-white !text-xs !font-semibold !rounded-md !shadow-md !px-2 !py-1"
              >
                {marker.nama}
              </Tooltip>
            )}

            <Popup>
              <div className="space-y-1 min-w-32">
                <p className="font-semibold text-sm">{marker.nama}</p>
                {marker.alamat && (
                  <p className="text-xs text-gray-500">{marker.alamat}</p>
                )}
                {marker.href && (
                  <a
                    href={marker.href}
                    className="block text-xs font-medium text-primary mt-1 hover:underline"
                  >
                    Lihat detail →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-[400] flex items-center gap-3 rounded-lg border bg-white/95 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          Kos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal-500" />
          Kampus
        </span>
      </div>
    </div>
  );
}
