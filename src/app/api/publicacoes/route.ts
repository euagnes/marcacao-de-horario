import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/publicacoes?tipo=EVENTO&destaque=1  -> lista publicadas (público)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const destaque = searchParams.get("destaque");

  const where: Prisma.PublicacaoWhereInput = { publicado: true };
  if (tipo) where.tipo = tipo as Prisma.EnumTipoPublicacaoFilter["equals"];
  if (destaque === "1") where.destaque = true;

  const pubs = await prisma.publicacao.findMany({
    where,
    orderBy: [{ criadoEm: "desc" }],
  });
  return NextResponse.json(pubs);
}
