import coordinateAudit from "../../reports/kos-coordinate-audit.json";

import type {
  CoordinateMeta,
  CoordinateSource,
  KosWithLocationMeta,
} from "@/types/kos";

type CoordinateOverride = {
  lat: number;
  lng: number;
  note: string;
  precision: CoordinateMeta["precision"];
  source: CoordinateSource;
};

type CoordinateAwareKos = {
  id: string;
  slug: string;
  lat: number;
  lng: number;
  alamat?: string | null;
};

type AuditSuggested = {
  lat: number;
  lng: number;
  provider: string;
  label: string;
  score: number;
};

type AuditEntry = {
  id: string;
  slug: string;
  nama: string;
  displacementKm: number;
  confidence: "high" | "medium" | "low" | "none" | "keep";
  suggested: AuditSuggested | null;
};

const KOS_COORDINATE_OVERRIDES: Record<string, CoordinateOverride> = {
  "kost-3-behadeng": {
    lat: -3.0130007,
    lng: 104.7673129,
    note: "Override lokasi dari geocoding OSM untuk area Lorong Usaha.",
    precision: "approximate",
    source: "geocoder",
  },
  "kostanisa-2-0": {
    lat: -3.010764544023,
    lng: 104.768028009028,
    note: "Override lokasi dari geocoding ArcGIS untuk Jalan Panca Usaha.",
    precision: "approximate",
    source: "geocoder",
  },
  "la-kost-palembang": {
    lat: -3.024994,
    lng: 104.776408,
    note: "Koordinat exact dari pin yang diberikan pengguna.",
    precision: "exact",
    source: "user",
  },
  "kost-barokah-jakabaring": {
    lat: -3.007285433312,
    lng: 104.774513063191,
    note: "Override lokasi dari geocoding ArcGIS untuk Perumahan Jaka Permai.",
    precision: "approximate",
    source: "geocoder",
  },
  "kost-nabila-putri": {
    lat: -3.010478203373,
    lng: 104.776039401655,
    note: "Override lokasi dari geocoding ArcGIS untuk Jalan Gubernur H. Bastari.",
    precision: "approximate",
    source: "geocoder",
  },
  "kost-sister-jakabaring": {
    lat: -3.010478203373,
    lng: 104.776039401655,
    note: "Override lokasi dari geocoding ArcGIS untuk Jalan Gubernur H. Bastari.",
    precision: "approximate",
    source: "geocoder",
  },
};

const auditEntries = ((coordinateAudit as { entries?: AuditEntry[] }).entries ?? []).map((entry) => [
  entry.slug,
  entry,
]);
const AUDIT_BY_SLUG = new Map<string, AuditEntry>(auditEntries);

function isStreetLevelLabel(label?: string | null) {
  if (!label) return false;

  return /(jalan|jl\.|lorong|lrg\.|gang|gg\.)/i.test(label);
}

function buildMeta(
  precision: CoordinateMeta["precision"],
  source: CoordinateSource,
  note: string
): CoordinateMeta {
  if (precision === "area") {
    return {
      precision,
      source,
      note,
      isMapVisible: false,
      isDistanceReliable: false,
    };
  }

  return {
    precision,
    source,
    note,
    isMapVisible: true,
    isDistanceReliable: true,
  };
}

function getAuditBasedLocation<T extends CoordinateAwareKos>(kos: T) {
  const audit = AUDIT_BY_SLUG.get(kos.slug);

  if (!audit) {
    return {
      lat: kos.lat,
      lng: kos.lng,
      meta: buildMeta(
        "approximate",
        "database",
        "Koordinat aktif tidak terdeteksi bermasalah pada audit otomatis."
      ),
    };
  }

  if (
    audit.suggested &&
    audit.confidence === "high" &&
    (isStreetLevelLabel(audit.suggested.label) || audit.displacementKm >= 1)
  ) {
    return {
      lat: audit.suggested.lat,
      lng: audit.suggested.lng,
      meta: buildMeta(
        "approximate",
        "geocoder",
        `Koordinat diselaraskan dari audit otomatis ${audit.suggested.provider} dengan confidence tinggi.`
      ),
    };
  }

  if (
    audit.suggested &&
    audit.confidence === "medium" &&
    isStreetLevelLabel(audit.suggested.label) &&
    audit.displacementKm <= 1
  ) {
    return {
      lat: audit.suggested.lat,
      lng: audit.suggested.lng,
      meta: buildMeta(
        "approximate",
        "geocoder",
        `Koordinat memakai kandidat jalan terdekat dari audit otomatis ${audit.suggested.provider}.`
      ),
    };
  }

  if (audit.confidence === "keep") {
    return {
      lat: kos.lat,
      lng: kos.lng,
      meta: buildMeta(
        "approximate",
        "database",
        "Koordinat aktif dipertahankan karena audit tidak mendeteksi selisih yang berarti."
      ),
    };
  }

  return {
    lat: kos.lat,
    lng: kos.lng,
    meta: buildMeta(
      "area",
      "database",
      "Lokasi belum cukup presisi untuk dipakai sebagai titik pasti di peta atau filter jarak."
    ),
  };
}

export function applyKosCoordinateOverride<T extends CoordinateAwareKos>(
  kos: T
): KosWithLocationMeta<T> {
  const override = KOS_COORDINATE_OVERRIDES[kos.slug] ?? KOS_COORDINATE_OVERRIDES[kos.id];

  if (override) {
    return {
      ...kos,
      lat: override.lat,
      lng: override.lng,
      locationMeta: buildMeta(override.precision, override.source, override.note),
    };
  }

  const resolved = getAuditBasedLocation(kos);

  return {
    ...kos,
    lat: resolved.lat,
    lng: resolved.lng,
    locationMeta: resolved.meta,
  };
}

export function applyKosCoordinateOverrides<T extends CoordinateAwareKos>(
  items: T[]
): Array<KosWithLocationMeta<T>> {
  return items.map(applyKosCoordinateOverride);
}
