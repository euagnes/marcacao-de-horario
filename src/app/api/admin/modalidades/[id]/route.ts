import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dadosModalidade } from "@/lib/modalidades";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// PUT /api/admin/modalidades/:id -> substitui os dados (o slug não muda, para não quebrar links e turmas)
export async function PUT(req: Request, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const r = dadosModalidade(body);
  if ("erro" in r) return NextResponse.json({ erro: r.erro }, { status: 400 });
  const modalidade = await prisma.modalidade.update({ where: { id: Number(params.id) }, data: r.data as any });
  return NextResponse.json(modalidade);
}

// PATCH /api/admin/modalidades/:id -> só liga/desliga a visibilidade
export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const modalidade = await prisma.modalidade.update({
    where: { id: Number(params.id) },
    data: { ativa: !!body.ativa },
  });
  return NextResponse.json(modalidade);
}

// DELETE /api/admin/modalidades/:id -> remove a modalidade e as turmas dela
export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id);
  const modalidade = await prisma.modalidade.findUnique({ where: { id } });
  if (!modalidade) return NextResponse.json({ erro: "Modalidade não encontrada." }, { status: 404 });
  await prisma.$transaction([
    prisma.turma.deleteMany({ where: { modalidade: modalidade.slug } }),
    prisma.modalidade.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}
