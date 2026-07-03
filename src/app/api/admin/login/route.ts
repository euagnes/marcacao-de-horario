import { NextResponse } from "next/server";
import { criarSessao } from "@/lib/auth";

// POST /api/admin/login  body: { email, senha }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim();
  const senha = body?.senha;

  const emailOk = email === (process.env.ADMIN_EMAIL ?? "admin@ceu.com.br");
  const senhaOk = senha === (process.env.ADMIN_PASSWORD ?? "ceu@2026");

  if (!emailOk || !senhaOk) {
    return NextResponse.json({ erro: "E-mail ou senha inválidos." }, { status: 401 });
  }

  await criarSessao();
  return NextResponse.json({ ok: true });
}
