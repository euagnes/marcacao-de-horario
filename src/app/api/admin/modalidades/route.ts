import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gerarSlug } from "@/lib/aulas";
import { dadosModalidade } from "@/lib/modalidades";

export const dynamic = "force-dynamic";

// GET /api/admin/modalidades -> todas (inclui ocultas), com o id do banco
export async function GET() {
  const lista = await prisma.modalidade.findMany({ orderBy: [{ ordem: "asc" }, { id: "asc" }] });
  return NextResponse.json(lista);
}

// POST /api/admin/modalidades
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const r = dadosModalidade(body);
  if ("erro" in r) return NextResponse.json({ erro: r.erro }, { status: 400 });

  // Slug único a partir do nome: "futevolei", "futevolei-2"…
  const base = gerarSlug(r.data.nome as string) || "modalidade";
  let slug = base;
  for (let n = 2; await prisma.modalidade.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;

  const modalidade = await prisma.modalidade.create({ data: { ...(r.data as any), slug } });
  return NextResponse.json(modalidade, { status: 201 });
}
