import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "reports", "geocode-input");
const ENV_PATHS = [".env.local", ".env"];

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

async function main() {
  const env = await loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const [kosRows, kampusRows] = await Promise.all([
    fetchSupabaseRows(
      supabaseUrl,
      supabaseAnonKey,
      "kos",
      "select=id,nama,alamat&tersedia=eq.true&order=nama.asc"
    ),
    fetchSupabaseRows(
      supabaseUrl,
      supabaseAnonKey,
      "kampus",
      "select=id,nama,lat,lng&order=nama.asc"
    ),
  ]);

  const kosData = kosRows.map((item) => ({
    id: item.id,
    nama: item.nama,
    alamat: item.alamat,
  }));
  const kampusData = kampusRows.map((item) => ({
    id: item.id,
    nama: item.nama,
    lat: item.lat,
    lng: item.lng,
    radius_km: 3,
  }));

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUTPUT_DIR, "kos_data.json"), JSON.stringify(kosData, null, 2));
  await fs.writeFile(path.join(OUTPUT_DIR, "kampus.json"), JSON.stringify(kampusData, null, 2));

  console.log(`Prepared ${kosData.length} kos and ${kampusData.length} kampus in ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
