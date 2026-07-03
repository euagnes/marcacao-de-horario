import { NextResponse } from "next/server";
import { encerrarSessao } from "@/lib/auth";

// POST /api/admin/logout
export async function POST() {
  encerrarSessao();
  return NextResponse.json({ ok: true });
}
