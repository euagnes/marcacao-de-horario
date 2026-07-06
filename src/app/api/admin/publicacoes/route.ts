import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/publicacoes?tipo=AVISO  -> lista todas (inclui não publicadas)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const where: Prisma.PublicacaoWhereInput = {};
  if (tipo) where.tipo = tipo as Prisma.EnumTipoPublicacaoFilter["equals"];

  const pubs = await prisma.publicacao.findMany({ where, orderBy: { criadoEm: "desc" } });
  return NextResponse.json(pubs);
}

// POST /api/admin/publicacoes
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.tipo || !body.titulo?.trim() || !body.resumo?.trim()) {
    return NextResponse.json({ erro: "Informe tipo, título e resumo." }, { status: 400 });
  }
  const pub = await prisma.publicacao.create({
    data: {
      tipo: body.tipo,
      titulo: body.titulo.trim(),
      resumo: body.resumo.trim(),
      conteudo: body.conteudo?.trim() || null,
      local: body.local?.trim() || null,
      dataEvento: body.dataEvento ? new Date(body.dataEvento) : null,
      imagemUrl: body.imagemUrl?.trim() || null,
      destaque: !!body.destaque,
      publicado: body.publicado ?? true,
    },
  });
  return NextResponse.json(pub, { status: 201 });
}
