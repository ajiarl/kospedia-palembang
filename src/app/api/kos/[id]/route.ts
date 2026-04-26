import { NextResponse } from "next/server";

import { getKosByIdentifier } from "@/lib/kos";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: identifier } = await params;
  const data = await getKosByIdentifier(identifier);

  if (!data) {
    return NextResponse.json({ pesan: "Kos tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
