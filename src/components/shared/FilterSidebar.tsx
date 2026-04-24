import Link from "next/link";

import type { KampusRow } from "@/types/kos";

type FilterValues = {
  kampus?: string;
  jenis?: string;
  hargaMin?: string;
  hargaMax?: string;
};

export default function FilterSidebar({
  kampus,
  values,
}: {
  kampus: KampusRow[];
  values: FilterValues;
}) {
  return (
    <aside className="rounded-lg border bg-white p-4">
      <form action="/kos" className="space-y-5">
        <div>
          <label htmlFor="kampus" className="text-sm font-medium">
            Kampus
          </label>
          <select
            id="kampus"
            name="kampus"
            defaultValue={values.kampus ?? ""}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Semua kampus</option>
            {kampus.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="jenis" className="text-sm font-medium">
            Jenis kos
          </label>
          <select
            id="jenis"
            name="jenis"
            defaultValue={values.jenis ?? ""}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Semua jenis</option>
            <option value="putra">Putra</option>
            <option value="putri">Putri</option>
            <option value="campur">Campur</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="hargaMin" className="text-sm font-medium">
              Min
            </label>
            <input
              id="hargaMin"
              name="hargaMin"
              type="number"
              min="0"
              step="50000"
              defaultValue={values.hargaMin ?? ""}
              placeholder="500000"
              className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="hargaMax" className="text-sm font-medium">
              Max
            </label>
            <input
              id="hargaMax"
              name="hargaMax"
              type="number"
              min="0"
              step="50000"
              defaultValue={values.hargaMax ?? ""}
              placeholder="1500000"
              className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
          >
            Terapkan
          </button>
          <Link
            href="/kos"
            className="rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Reset
          </Link>
        </div>
      </form>
    </aside>
  );
}
