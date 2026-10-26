import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dadosTurma } from "@/lib/turmas";

export const dynamic = "force-dynamic";

// GET /api/admin/turmas -> lista todas (inclui inativas)
export async function GET() {
  const turmas = await prisma.turma.findMany({
    orderBy: [{ modalidade: "asc" }, { horaInicio: "asc" }],
  });
  return NextResponse.json(turmas);
}

// POST /api/admin/turmas
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const r = dadosTurma(body);
  if ("erro" in r) return NextResponse.json({ erro: r.erro }, { status: 400 });
  const turma = await prisma.turma.create({ data: r.data as any });
  return NextResponse.json(turma, { status: 201 });
}
