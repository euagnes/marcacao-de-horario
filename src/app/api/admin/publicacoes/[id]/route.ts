import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// PATCH /api/admin/publicacoes/:id
export async function PATCH(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if (body.tipo !== undefined) data.tipo = body.tipo;
  if (body.titulo !== undefined) data.titulo = body.titulo.trim();
  if (body.resumo !== undefined) data.resumo = body.resumo.trim();
  if (body.conteudo !== undefined) data.conteudo = body.conteudo?.trim() || null;
  if (body.local !== undefined) data.local = body.local?.trim() || null;
  if (body.dataEvento !== undefined) data.dataEvento = body.dataEvento ? new Date(body.dataEvento) : null;
  if (body.imagemUrl !== undefined) data.imagemUrl = body.imagemUrl?.trim() || null;
  if (body.destaque !== undefined) data.destaque = !!body.destaque;
  if (body.publicado !== undefined) data.publicado = !!body.publicado;

  const pub = await prisma.publicacao.update({ where: { id }, data });
  return NextResponse.json(pub);
}

// DELETE /api/admin/publicacoes/:id
export async function DELETE(_req: Request, { params }: Params) {
  await prisma.publicacao.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
