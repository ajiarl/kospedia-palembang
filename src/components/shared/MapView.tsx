"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

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

function createMarkerIcon(type: MapMarker["type"]) {
  const isKos = type === "kos";

  return L.divIcon({
    className: "",
    html: `<span class="block h-4 w-4 rounded-full border-2 border-white shadow-md ${
      isKos ? "bg-primary" : "bg-foreground"
    }"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length <= 1) return;

    const bounds = L.latLngBounds(markers.map((marker) => [marker.lat, marker.lng]));
    map.fitBounds(bounds, {
      padding: [32, 32],
      maxZoom: 15,
    });
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
  const kosIcon = useMemo(() => createMarkerIcon("kos"), []);
  const kampusIcon = useMemo(() => createMarkerIcon("kampus"), []);

  return (
    <div className={`overflow-hidden rounded-lg border bg-muted ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
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
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{marker.nama}</p>
                {marker.alamat ? <p className="text-xs">{marker.alamat}</p> : null}
                {marker.href ? (
                  <a href={marker.href} className="text-xs font-medium text-primary">
                    Lihat detail
                  </a>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
