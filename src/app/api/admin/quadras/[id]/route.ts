import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// PATCH /api/admin/quadras/:id  body: { nome?, descricao?, ativa? }
export async function PATCH(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (body.nome !== undefined) data.nome = body.nome.trim();
  if (body.descricao !== undefined) data.descricao = body.descricao?.trim() || null;
  if (body.ativa !== undefined) data.ativa = !!body.ativa;

  const quadra = await prisma.quadra.update({ where: { id }, data });
  return NextResponse.json(quadra);
}

// DELETE /api/admin/quadras/:id
export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id);
  const reservas = await prisma.agendamento.count({ where: { quadraId: id } });
  if (reservas > 0) {
    // Não apaga quadra com histórico; apenas desativa
    const quadra = await prisma.quadra.update({ where: { id }, data: { ativa: false } });
    return NextResponse.json({
      ok: true,
      desativada: true,
      mensagem: "Quadra possui reservas; foi desativada em vez de excluída.",
      quadra,
    });
  }
  await prisma.quadra.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
