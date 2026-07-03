import { NextResponse } from "next/server";
import { encerrarSessaoUsuario } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/usuarios/logout
export async function POST() {
  encerrarSessaoUsuario();
  return NextResponse.json({ ok: true });
}
