import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dadosTurma } from "@/lib/turmas";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// PUT /api/admin/turmas/:id -> substitui todos os dados da turma
export async function PUT(req: Request, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const r = dadosTurma(body);
  if ("erro" in r) return NextResponse.json({ erro: r.erro }, { status: 400 });
  const turma = await prisma.turma.update({ where: { id: Number(params.id) }, data: r.data as any });
  return NextResponse.json(turma);
}

// PATCH /api/admin/turmas/:id -> só liga/desliga a visibilidade
export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const turma = await prisma.turma.update({
    where: { id: Number(params.id) },
    data: { ativa: !!body.ativa },
  });
  return NextResponse.json(turma);
}

// DELETE /api/admin/turmas/:id
export async function DELETE(_req: Request, { params }: Params) {
  await prisma.turma.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
