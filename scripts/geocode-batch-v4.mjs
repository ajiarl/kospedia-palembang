import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, "reports", "geocode-input");
const OUTPUT_DIR = path.join(ROOT, "reports", "geocode-output");

const INPUT_FILE = path.join(INPUT_DIR, "kos_data.json");
const KAMPUS_FILE = path.join(INPUT_DIR, "kampus.json");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "kos_geocoded_v4.json");
const SQL_EXACT = path.join(OUTPUT_DIR, "sql_kos_exact_v4.sql");
const SQL_STAGING = path.join(OUTPUT_DIR, "sql_kos_staging_v4.sql");
const REVIEW_FILE = path.join(OUTPUT_DIR, "kos_needs_review_v4.json");

const CITY_CONTEXT = "Palembang, Sumatera Selatan, Indonesia";
const DELAY_MS = 1300;
const CANDIDATE_LIMIT = 5;
const SINGLE_PROVIDER_MIN_SCORE = 50;
const SINGLE_PROVIDER_MIN_TOKENS = 2;

const THRESHOLD = {
  EXACT: 0.12,
  APPROXIMATE: 0.3,
};

const EXACT_TYPES = new Set(["house", "building", "PointAddress", "POI"]);
const APPROX_TYPES = new Set(["road", "StreetAddress", "StreetInt"]);
const AREA_TYPES = new Set([
  "place",
  "suburb",
  "neighbourhood",
  "quarter",
  "city_block",
  "city",
  "town",
  "village",
  "county",
  "state",
  "administrative",
  "postcode",
  "region",
  "Locality",
  "PostalExt",
  "Postal",
]);

const BLACKLIST_ZONES = [
  { nama: "Sungai Musi (tengah)", lat: -2.9921, lng: 104.7634, radiusKm: 0.3 },
  { nama: "Jembatan Ampera", lat: -2.9917, lng: 104.7628, radiusKm: 0.15 },
  { nama: "Stadion Jakabaring", lat: -3.0117, lng: 104.7781, radiusKm: 0.5 },
  { nama: "Tol Palembang-Indralaya", lat: -3.18, lng: 104.65, radiusKm: 0.5 },
];

function loadReferencePoints() {
  if (fs.existsSync(KAMPUS_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(KAMPUS_FILE, "utf8"));
      console.log(`  Loaded ${raw.length} kampus dari ${KAMPUS_FILE}`);
      return raw.map((kampus) => ({
        nama: kampus.nama,
        lat: Number(kampus.lat),
        lng: Number(kampus.lng ?? kampus.lon),
        radiusKm: Number(kampus.radius_km ?? 3),
      }));
    } catch (error) {
      console.warn(`  Gagal baca ${KAMPUS_FILE}: ${error.message} — pakai fallback.`);
    }
  }

  console.log("  Pakai reference kampus fallback.");
  return [
    { nama: "Unsri Indralaya", lat: -3.3734, lng: 104.5688, radiusKm: 5 },
    { nama: "Unsri Bukit", lat: -2.9776, lng: 104.7497, radiusKm: 3 },
    { nama: "UIN Raden Fatah", lat: -2.9903, lng: 104.7571, radiusKm: 3 },
    { nama: "Polsri", lat: -2.9956, lng: 104.7562, radiusKm: 3 },
    { nama: "Bina Darma", lat: -2.9805, lng: 104.7641, radiusKm: 2 },
    { nama: "Pusat Palembang", lat: -2.9761, lng: 104.7463, radiusKm: 15 },
  ];
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const radius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isBlacklisted(lat, lng) {
  return BLACKLIST_ZONES.find((zone) => haversineKm(lat, lng, zone.lat, zone.lng) <= zone.radiusKm);
}

function normalizeAddress(raw) {
  if (!raw || typeof raw !== "string") return "";

  return raw
    .replace(/\bJl\b\.?\s*/gi, "Jalan ")
    .replace(/\bJln\b\.?\s*/gi, "Jalan ")
    .replace(/\bLrg\b\.?\s*/gi, "Lorong ")
    .replace(/\bGg\b\.?\s*/gi, "Gang ")
    .replace(/\bKel\b\.?\s*/gi, "Kelurahan ")
    .replace(/\bKec\b\.?\s*/gi, "Kecamatan ")
    .replace(/\bKab\b\.?\s*/gi, "Kabupaten ")
    .replace(/\bNo\b\.?\s*/gi, "Nomor ")
    .replace(/\bRT\.?\s*(\d)/gi, "RT $1")
    .replace(/\bRW\.?\s*(\d)/gi, "RW $1")
    .replace(/\bBlk\b\.?\s*/gi, "Blok ")
    .replace(/\bKmp\b\.?\s*/gi, "Komplek ")
    .replace(/\bPerum\b\.?\s*/gi, "Perumahan ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function buildQuery(rawAddress) {
  const normalized = normalizeAddress(rawAddress);
  if (/palembang/i.test(normalized)) return normalized;
  return `${normalized}, ${CITY_CONTEXT}`;
}

async function queryNominatim(address) {
  const url =
    "https://nominatim.openstreetmap.org/search" +
    `?q=${encodeURIComponent(address)}` +
    `&format=json&limit=${CANDIDATE_LIMIT}&addressdetails=1&countrycodes=id`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "KosGeocoder/4.0 (kospedia-palembang)",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.map((item) => ({
    provider: "nominatim",
    lat: Number(item.lat),
    lng: Number(item.lon),
    display: item.display_name,
    type: item.type,
    importance: Number(item.importance || 0),
  }));
}

async function queryArcGIS(address) {
  const url =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates" +
    `?SingleLine=${encodeURIComponent(address)}` +
    `&f=json&maxLocations=${CANDIDATE_LIMIT}&countryCode=IDN&outFields=Score,Addr_type`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ArcGIS ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.candidates?.length) return [];

  return data.candidates.map((item) => ({
    provider: "arcgis",
    lat: Number(item.location.y),
    lng: Number(item.location.x),
    display: item.address,
    type: item.attributes?.Addr_type || "unknown",
    importance: Number(item.attributes?.Score || 0) / 100,
  }));
}

const STOPWORDS = new Set([
  "jalan",
  "gang",
  "lorong",
  "nomor",
  "blok",
  "komplek",
  "perumahan",
  "palembang",
  "indonesia",
  "sumatera",
  "selatan",
  "rt",
  "rw",
  "dan",
  "di",
]);

function extractTokens(query) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((token) => token.length > 3 && !STOPWORDS.has(token));
}

function scoreCandidate(candidate, query, referencePoints) {
  if (AREA_TYPES.has(candidate.type)) return -999;

  let score = 0;

  if (EXACT_TYPES.has(candidate.type)) score += 40;
  else if (APPROX_TYPES.has(candidate.type)) score += 25;
  else score += 10;

  score += candidate.importance * 20;

  const tokens = extractTokens(query);
  const display = candidate.display.toLowerCase();
  score += tokens.filter((token) => display.includes(token)).length * 10;

  if (/palembang/i.test(candidate.display)) score += 10;

  if (
    referencePoints.some(
      (point) => haversineKm(candidate.lat, candidate.lng, point.lat, point.lng) <= point.radiusKm
    )
  ) {
    score += 10;
  }

  if (Math.abs(candidate.lat % 1) < 0.005 && Math.abs(candidate.lng % 1) < 0.005) score -= 30;
  if (haversineKm(candidate.lat, candidate.lng, -2.9761, 104.7463) > 60) score -= 40;

  return score;
}

function assignConfidence({ top, query, consensusDist, onlyOneProvider, referencePoints }) {
  const blacklisted = isBlacklisted(top.lat, top.lng);
  if (blacklisted) {
    return { confidence: "needs_review", reason: `blacklisted:${blacklisted.nama}` };
  }

  const tokens = extractTokens(query);
  const tokenHits = tokens.filter((token) => top.display.toLowerCase().includes(token)).length;
  const nearReference = referencePoints.some(
    (point) => haversineKm(top.lat, top.lng, point.lat, point.lng) <= point.radiusKm
  );

  if (
    !onlyOneProvider &&
    consensusDist !== null &&
    consensusDist <= THRESHOLD.EXACT &&
    EXACT_TYPES.has(top.type)
  ) {
    return { confidence: "exact", reason: null };
  }

  if (
    !onlyOneProvider &&
    consensusDist !== null &&
    consensusDist <= THRESHOLD.APPROXIMATE &&
    (EXACT_TYPES.has(top.type) || APPROX_TYPES.has(top.type))
  ) {
    return { confidence: "approximate", reason: null };
  }

  if (
    onlyOneProvider &&
    (EXACT_TYPES.has(top.type) || APPROX_TYPES.has(top.type)) &&
    top.score >= SINGLE_PROVIDER_MIN_SCORE &&
    tokenHits >= SINGLE_PROVIDER_MIN_TOKENS &&
    nearReference
  ) {
    return { confidence: "approximate", reason: "single_provider_verified" };
  }

  if (top.score > 0 && (EXACT_TYPES.has(top.type) || APPROX_TYPES.has(top.type))) {
    return {
      confidence: "area",
      reason: onlyOneProvider
        ? `single_provider_weak (score=${top.score}, tokens=${tokenHits}, nearRef=${nearReference})`
        : `consensus_too_far_${Math.round((consensusDist ?? 0) * 1000)}m`,
    };
  }

  return { confidence: "needs_review", reason: "no_qualifying_candidate" };
}

async function geocodeOne(item, referencePoints) {
  const alamat = item.alamat ?? "";
  const query = buildQuery(alamat);

  process.stdout.write(`  [${String(item.id).slice(0, 8)}] ${alamat.slice(0, 46).padEnd(46)} -> `);

  let nominatimCandidates = [];
  let arcgisCandidates = [];

  try {
    [nominatimCandidates, arcgisCandidates] = await Promise.all([
      queryNominatim(query),
      queryArcGIS(query),
    ]);
  } catch (error) {
    process.stdout.write(`ERROR ${error.message}\n`);
    return { ...item, lat: null, lng: null, confidence: "needs_review", error: error.message };
  }

  const score = (candidate) => scoreCandidate(candidate, query, referencePoints);

  const nominatimBest =
    nominatimCandidates
      .map((candidate) => ({ ...candidate, score: score(candidate) }))
      .filter((candidate) => candidate.score > -900)
      .sort((a, b) => b.score - a.score)[0] ?? null;

  const arcgisBest =
    arcgisCandidates
      .map((candidate) => ({ ...candidate, score: score(candidate) }))
      .filter((candidate) => candidate.score > -900)
      .sort((a, b) => b.score - a.score)[0] ?? null;

  const allScored = [
    nominatimBest,
    arcgisBest,
    ...nominatimCandidates
      .map((candidate) => ({ ...candidate, score: score(candidate) }))
      .filter((candidate) => candidate.score > -900)
      .slice(1, 2),
    ...arcgisCandidates
      .map((candidate) => ({ ...candidate, score: score(candidate) }))
      .filter((candidate) => candidate.score > -900)
      .slice(1, 2),
  ]
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  if (allScored.length === 0) {
    process.stdout.write("no candidates\n");
    return { ...item, lat: null, lng: null, confidence: "needs_review", reason: "no_candidates" };
  }

  const top = allScored[0];
  const onlyOneProvider = !nominatimBest || !arcgisBest;
  const consensusDist =
    nominatimBest && arcgisBest
      ? haversineKm(nominatimBest.lat, nominatimBest.lng, arcgisBest.lat, arcgisBest.lng)
      : null;

  const { confidence, reason } = assignConfidence({
    top,
    query,
    consensusDist,
    onlyOneProvider,
    referencePoints,
  });

  const icon = {
    exact: "OK",
    approximate: "~",
    area: "A",
    needs_review: "X",
  }[confidence];
  const distance = consensusDist !== null ? `${Math.round(consensusDist * 1000)}m` : "1src";
  process.stdout.write(`${icon} ${confidence.padEnd(12)} sc=${String(top.score).padStart(3)} d=${distance}\n`);

  return {
    ...item,
    lat: top.lat,
    lng: top.lng,
    confidence,
    reason,
    geocode_source: top.provider,
    geocoded_address: top.display,
    consensus_dist_m: consensusDist !== null ? Math.round(consensusDist * 1000) : null,
    top_score: top.score,
    top_type: top.type,
    raw_candidates: allScored.slice(0, 3).map(({ score: candidateScore, provider, lat, lng, display, type }) => ({
      score: candidateScore,
      provider,
      lat,
      lng,
      type,
      display: display.slice(0, 100),
    })),
  };
}

function esc(value) {
  return (value || "").replace(/'/g, "''").slice(0, 250);
}

function fmtId(id) {
  return /^[0-9a-f-]{36}$/i.test(String(id)) ? `'${id}'` : String(id);
}

function generateSQL(results) {
  const exact = results.filter((result) => result.confidence === "exact" && result.lat !== null);
  const approximate = results.filter(
    (result) => result.confidence === "approximate" && result.lat !== null
  );

  const exactSQL = [
    "-- sql_kos_exact_v4.sql",
    `-- ${exact.length} baris EXACT`,
    `-- Generated: ${new Date().toISOString()}`,
    "",
    ...exact.map(
      (result) =>
        `UPDATE kos SET lat = ${result.lat}, lng = ${result.lng}, geocode_confidence = 'exact', ` +
        `geocoded_address = '${esc(result.geocoded_address)}', geocode_updated_at = NOW() WHERE id = ${fmtId(result.id)};`
    ),
  ].join("\n");

  const stagingSQL = [
    "-- sql_kos_staging_v4.sql",
    `-- ${approximate.length} baris APPROXIMATE`,
    `-- Generated: ${new Date().toISOString()}`,
    "",
    ...approximate.map(
      (result) =>
        `INSERT INTO kos_geocode_staging ` +
        `(id, lat, lng, confidence, geocoded_address, geocode_source, top_score, consensus_dist_m, top_type, reason) VALUES ` +
        `(${fmtId(result.id)}, ${result.lat}, ${result.lng}, 'approximate', '${esc(result.geocoded_address)}', ` +
        `'${result.geocode_source}', ${result.top_score}, ${result.consensus_dist_m ?? "NULL"}, '${result.top_type}', '${esc(result.reason)}') ` +
        `ON CONFLICT (id) DO UPDATE SET ` +
        `lat = EXCLUDED.lat, lng = EXCLUDED.lng, confidence = EXCLUDED.confidence, geocoded_address = EXCLUDED.geocoded_address, ` +
        `geocode_source = EXCLUDED.geocode_source, top_score = EXCLUDED.top_score, consensus_dist_m = EXCLUDED.consensus_dist_m, ` +
        `top_type = EXCLUDED.top_type, reason = EXCLUDED.reason, reviewed = FALSE, reviewed_at = NULL, reviewed_by = NULL;`
    ),
  ].join("\n");

  return { exactSQL, stagingSQL };
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBatch() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`\nInput tidak ditemukan: ${INPUT_FILE}`);
    console.info('Jalankan dulu "npm run geocode:prepare".');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  const referencePoints = loadReferencePoints();
  const results = [];

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n${"=".repeat(64)}`);
  console.log(" KOS GEOCODER v4");
  console.log(` Input     : ${data.length} alamat`);
  console.log(` Exact     : konsensus <= ${THRESHOLD.EXACT * 1000}m + house/building`);
  console.log(
    ` Approx    : konsensus <= ${THRESHOLD.APPROXIMATE * 1000}m atau single-provider yang lolos rule`
  );
  console.log(
    ` 1-provider: score >= ${SINGLE_PROVIDER_MIN_SCORE}, token >= ${SINGLE_PROVIDER_MIN_TOKENS}, nearRef`
  );
  console.log(` Blacklist : ${BLACKLIST_ZONES.length} zona`);
  console.log(`${"=".repeat(64)}\n`);

  for (let index = 0; index < data.length; index += 1) {
    const result = await geocodeOne(data[index], referencePoints);
    results.push(result);

    if ((index + 1) % 10 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
      process.stdout.write(`\n  autosave ${index + 1}/${data.length}\n\n`);
    }

    if (index < data.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  fs.writeFileSync(
    REVIEW_FILE,
    JSON.stringify(
      results.filter((result) => ["area", "needs_review"].includes(result.confidence)),
      null,
      2
    )
  );

  const { exactSQL, stagingSQL } = generateSQL(results);
  fs.writeFileSync(SQL_EXACT, exactSQL);
  fs.writeFileSync(SQL_STAGING, stagingSQL);

  const stats = ["exact", "approximate", "area", "needs_review"].reduce(
    (accumulator, key) => ({
      ...accumulator,
      [key]: results.filter((result) => result.confidence === key).length,
    }),
    {}
  );

  console.log(`\n${"=".repeat(64)}`);
  console.log(" SELESAI");
  console.log(`${"=".repeat(64)}`);
  console.log(` exact        : ${String(stats.exact).padStart(4)} -> ${SQL_EXACT}`);
  console.log(` approximate  : ${String(stats.approximate).padStart(4)} -> ${SQL_STAGING}`);
  console.log(` area         : ${String(stats.area).padStart(4)} -> ${REVIEW_FILE}`);
  console.log(` needs_review : ${String(stats.needs_review).padStart(4)} -> ${REVIEW_FILE}`);
  console.log(`${"=".repeat(64)}\n`);
}

runBatch();
