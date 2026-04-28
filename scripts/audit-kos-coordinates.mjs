import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ENV_PATHS = [".env.local", ".env"];
const REPORT_PATH = path.join(ROOT, "reports", "kos-coordinate-audit.json");

function parseEnv(content) {
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function loadEnv() {
  const merged = {};

  for (const relativePath of ENV_PATHS) {
    try {
      const fileContent = await fs.readFile(path.join(ROOT, relativePath), "utf8");
      Object.assign(merged, parseEnv(fileContent));
    } catch {}
  }

  return merged;
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTokens(value) {
  const stopwords = new Set([
    "jl",
    "jalan",
    "no",
    "rt",
    "rw",
    "kec",
    "kel",
    "kota",
    "palembang",
    "sumatera",
    "selatan",
    "indonesia",
    "ulu",
    "ilir",
    "lorong",
    "lrg",
    "komplek",
    "perumahan",
    "blok",
    "dan",
  ]);

  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !stopwords.has(token));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

async function fetchSupabaseRows(baseUrl, anonKey, table, query) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase ${table} request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function geocodeArcGis(address) {
  const url =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates" +
    `?f=json&maxLocations=3&outFields=Match_addr,Addr_type&singleLine=${encodeURIComponent(address)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "KospediaPalembang/1.0 coordinate-audit",
    },
  });

  if (!response.ok) {
    throw new Error(`ArcGIS geocoder failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  return (payload.candidates ?? []).map((candidate) => ({
    provider: "arcgis",
    lat: candidate.location.y,
    lng: candidate.location.x,
    label: candidate.address,
    rawScore: candidate.score ?? 0,
  }));
}

async function geocodeNominatim(address) {
  const url =
    "https://nominatim.openstreetmap.org/search" +
    `?q=${encodeURIComponent(address)}&format=jsonv2&limit=3`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "KospediaPalembang/1.0 coordinate-audit",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim geocoder failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  return payload.map((candidate) => ({
    provider: "nominatim",
    lat: Number(candidate.lat),
    lng: Number(candidate.lon),
    label: candidate.display_name,
    rawScore: Number(candidate.importance ?? 0) * 100,
  }));
}

function scoreCandidate(kos, kampus, candidate) {
  const addressTokens = extractTokens(kos.alamat);
  const labelText = normalizeText(candidate.label);
  const matchedTokens = addressTokens.filter((token) => labelText.includes(token));
  const tokenCoverage = addressTokens.length > 0 ? matchedTokens.length / addressTokens.length : 0;
  const sameCityBonus = labelText.includes("palembang") ? 8 : 0;
  const roadHintBonus =
    labelText.includes("jalan") || labelText.includes("jl") || labelText.includes("lorong") ? 5 : 0;
  const providerWeight = candidate.provider === "arcgis" ? candidate.rawScore : candidate.rawScore * 0.65;
  const campusDistanceKm = kampus
    ? haversineKm(candidate.lat, candidate.lng, kampus.lat, kampus.lng)
    : null;
  const campusProximityScore =
    campusDistanceKm === null ? 0 : Math.max(0, 16 - Math.min(campusDistanceKm, 16));

  return {
    ...candidate,
    matchedTokens,
    tokenCoverage,
    campusDistanceKm,
    score: Number((providerWeight + tokenCoverage * 25 + sameCityBonus + roadHintBonus + campusProximityScore).toFixed(2)),
  };
}

function summarizeAgreement(bestArcGis, bestNominatim) {
  if (!bestArcGis || !bestNominatim) return null;

  return haversineKm(bestArcGis.lat, bestArcGis.lng, bestNominatim.lat, bestNominatim.lng);
}

function classifyConfidence(bestCandidate, providerAgreementKm, displacementKm) {
  if (!bestCandidate) return "none";

  if (
    bestCandidate.score >= 105 &&
    providerAgreementKm !== null &&
    providerAgreementKm <= 0.35 &&
    displacementKm >= 0.2
  ) {
    return "high";
  }

  if (bestCandidate.score >= 92 && displacementKm >= 0.2) {
    return "medium";
  }

  if (bestCandidate.score >= 80 && displacementKm >= 0.5) {
    return "low";
  }

  return "keep";
}

function chooseSuggestedCandidate(kos, kampus, arcgisCandidates, nominatimCandidates) {
  const scoredArcGis = arcgisCandidates.map((candidate) => scoreCandidate(kos, kampus, candidate));
  const scoredNominatim = nominatimCandidates.map((candidate) =>
    scoreCandidate(kos, kampus, candidate)
  );
  const allCandidates = [...scoredArcGis, ...scoredNominatim].sort((a, b) => b.score - a.score);
  const bestCandidate = allCandidates[0] ?? null;
  const bestArcGis = scoredArcGis[0] ?? null;
  const bestNominatim = scoredNominatim[0] ?? null;
  const providerAgreementKm = summarizeAgreement(bestArcGis, bestNominatim);
  const displacementKm = bestCandidate
    ? haversineKm(kos.lat, kos.lng, bestCandidate.lat, bestCandidate.lng)
    : 0;
  const confidence = classifyConfidence(bestCandidate, providerAgreementKm, displacementKm);

  return {
    bestCandidate,
    bestArcGis,
    bestNominatim,
    providerAgreementKm,
    displacementKm,
    confidence,
    allCandidates: allCandidates.slice(0, 4),
  };
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const env = await loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env files.");
  }

  const [kosRows, kampusRows] = await Promise.all([
    fetchSupabaseRows(
      supabaseUrl,
      supabaseAnonKey,
      "kos",
      "select=id,slug,nama,alamat,lat,lng,kampus_id&tersedia=eq.true&order=nama.asc"
    ),
    fetchSupabaseRows(supabaseUrl, supabaseAnonKey, "kampus", "select=id,nama,lat,lng"),
  ]);

  const kampusById = new Map(kampusRows.map((kampus) => [kampus.id, kampus]));
  const auditEntries = [];

  for (const [index, kos] of kosRows.entries()) {
    const kampus = kos.kampus_id ? kampusById.get(kos.kampus_id) ?? null : null;
    const address = kos.alamat?.trim();
    let arcgisCandidates = [];
    let nominatimCandidates = [];
    let geocodeError = null;

    if (address) {
      try {
        [arcgisCandidates, nominatimCandidates] = await Promise.all([
          geocodeArcGis(address),
          geocodeNominatim(address),
        ]);
      } catch (error) {
        geocodeError = error instanceof Error ? error.message : String(error);
      }
    }

    const suggestion = chooseSuggestedCandidate(kos, kampus, arcgisCandidates, nominatimCandidates);

    auditEntries.push({
      id: kos.id,
      slug: kos.slug,
      nama: kos.nama,
      alamat: kos.alamat,
      kampus: kampus?.nama ?? null,
      current: {
        lat: kos.lat,
        lng: kos.lng,
      },
      suggested:
        suggestion.bestCandidate && suggestion.confidence !== "keep"
          ? {
              lat: suggestion.bestCandidate.lat,
              lng: suggestion.bestCandidate.lng,
              provider: suggestion.bestCandidate.provider,
              label: suggestion.bestCandidate.label,
              score: suggestion.bestCandidate.score,
            }
          : null,
      displacementKm: Number(suggestion.displacementKm.toFixed(3)),
      providerAgreementKm:
        suggestion.providerAgreementKm === null
          ? null
          : Number(suggestion.providerAgreementKm.toFixed(3)),
      confidence: suggestion.confidence,
      candidates: suggestion.allCandidates.map((candidate) => ({
        provider: candidate.provider,
        lat: candidate.lat,
        lng: candidate.lng,
        score: candidate.score,
        label: candidate.label,
        tokenCoverage: Number(candidate.tokenCoverage.toFixed(2)),
        campusDistanceKm:
          candidate.campusDistanceKm === null ? null : Number(candidate.campusDistanceKm.toFixed(3)),
      })),
      geocodeError,
    });

    process.stdout.write(`Audited ${index + 1}/${kosRows.length}: ${kos.nama}\n`);
    await sleep(300);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    totalKos: auditEntries.length,
    flaggedHigh: auditEntries.filter((entry) => entry.confidence === "high").length,
    flaggedMedium: auditEntries.filter((entry) => entry.confidence === "medium").length,
    flaggedLow: auditEntries.filter((entry) => entry.confidence === "low").length,
    unresolved: auditEntries.filter((entry) => entry.confidence === "none").length,
  };

  const report = {
    summary,
    entries: auditEntries.sort((a, b) => b.displacementKm - a.displacementKm),
  };

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));

  process.stdout.write(`\nReport saved to ${REPORT_PATH}\n`);
  process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
