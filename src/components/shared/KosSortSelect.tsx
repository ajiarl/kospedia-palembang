"use client";

import { useRouter, useSearchParams } from "next/navigation";

type KosSortSelectProps = {
  defaultValue: string;
};

export default function KosSortSelect({ defaultValue }: KosSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "termurah") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    const queryString = params.toString();
    router.push(queryString ? `/kos?${queryString}` : "/kos");
  }

  return (
    <select
      id="sort"
      name="sort"
      defaultValue={defaultValue}
      className="rounded-lg border bg-background px-3 py-2 text-sm"
      onChange={(event) => handleChange(event.currentTarget.value)}
    >
      <option value="termurah">Termurah</option>
      <option value="termahal">Termahal</option>
      <option value="rating">Rating tertinggi</option>
    </select>
  );
}
