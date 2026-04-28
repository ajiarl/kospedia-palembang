"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";

type MapMarker = {
  id: string;
  nama: string;
  alamat?: string;
  note?: string;
  lat: number;
  lng: number;
  href?: string;
  precision?: "exact" | "approximate" | "area";
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
  const color = isKos ? "#C84B31" : "#1C1917";
  const innerColor = "white";

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

function FitBounds({
  markers,
  enabled,
  maxZoom = 14,
}: {
  markers: MapMarker[];
  enabled: boolean;
  maxZoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || markers.length <= 1) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [56, 56], maxZoom });
  }, [enabled, map, markers, maxZoom]);

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
  const visibleLocations = markers.filter((marker) => marker.type === "kos");
  const orderedMarkers = [...markers].sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === "kampus" ? -1 : 1;
  });
  const shouldAutoFit = !center;

  const kosIcon = useMemo(() => createPinIcon("kos"), []);
  const kampusIcon = useMemo(() => createPinIcon("kampus"), []);

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-muted shadow-sm ${className}`}>
      <MapContainer
        aria-hidden="true"
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds markers={orderedMarkers} enabled={shouldAutoFit} />

        {orderedMarkers.map((marker) => (
          <Marker
            key={`${marker.type}-${marker.id}`}
            position={[marker.lat, marker.lng]}
            icon={marker.type === "kos" ? kosIcon : kampusIcon}
            riseOnHover
            zIndexOffset={marker.type === "kos" ? 200 : 100}
          >
            {marker.type === "kampus" ? (
              <Tooltip
                direction="top"
                offset={[0, -44]}
                opacity={1}
                className="!border-0 !bg-[#2D4A3E] !text-white !text-xs !font-semibold !rounded-md !shadow-md !px-2 !py-1"
              >
                {marker.nama}
              </Tooltip>
            ) : (
              <Tooltip
                direction="top"
                offset={[0, -44]}
                opacity={1}
                className="!rounded-[14px] !border !border-stone-200 !bg-white/95 !px-3 !py-2 !text-left !shadow-xl backdrop-blur-sm"
              >
                <div className="max-w-[220px] space-y-1">
                  <p className="text-[11px] font-semibold leading-snug text-stone-900">
                    {marker.nama}
                  </p>
                  {marker.alamat ? (
                    <p className="text-[10px] leading-relaxed text-stone-600">{marker.alamat}</p>
                  ) : null}
                  {marker.precision === "approximate" && marker.note ? (
                    <p className="text-[10px] leading-relaxed text-amber-700">{marker.note}</p>
                  ) : null}
                </div>
              </Tooltip>
            )}

            <Popup>
              <div className="min-w-32 space-y-1">
                <p className="text-sm font-semibold">{marker.nama}</p>
                {marker.alamat && <p className="text-xs text-gray-500">{marker.alamat}</p>}
                {marker.precision === "approximate" && marker.note ? (
                  <p className="text-xs text-amber-700">{marker.note}</p>
                ) : null}
                {marker.href && (
                  <a
                    href={marker.href}
                    className="mt-1 block text-xs font-medium text-primary hover:underline"
                  >
                    Lihat detail {"->"}
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-3 right-3 z-[400] flex items-center gap-3 rounded-lg border bg-white/95 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          Kos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#2D4A3E]" />
          Kampus
        </span>
      </div>

      <div className="absolute left-3 top-3 z-[400] rounded-lg border bg-white/92 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
        Hover pin kos untuk lihat alamat, klik jika ingin detail penuh
      </div>

      <div className="sr-only" role="note" aria-label="Ringkasan peta lokasi kos">
        <p>Peta menampilkan lokasi kos dan kampus terdekat.</p>
        {visibleLocations.length > 0 ? (
          <ul>
            {visibleLocations.slice(0, 10).map((marker) => (
              <li key={marker.id}>
                {marker.nama}
                {marker.alamat ? `, ${marker.alamat}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada lokasi kos yang ditampilkan pada peta ini.</p>
        )}
      </div>
    </div>
  );
}
