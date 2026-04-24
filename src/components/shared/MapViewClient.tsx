"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

// MapView di-lazy-load di sini agar ssr:false boleh dipakai di Client Component
const MapView = dynamic(() => import("@/components/shared/MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-muted" />,
});

type MapViewProps = ComponentProps<typeof MapView>;

export default function MapViewClient(props: MapViewProps) {
  return <MapView {...props} />;
}
