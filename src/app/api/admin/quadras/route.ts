import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/quadras -> todas as quadras (inclusive inativas)
export async function GET() {
  const quadras = await prisma.quadra.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(quadras);
}

// POST /api/admin/quadras  body: { nome, descricao, ativa }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.nome?.trim()) {
    return NextResponse.json({ erro: "Informe o nome da quadra." }, { status: 400 });
  }
  const quadra = await prisma.quadra.create({
    data: {
      nome: body.nome.trim(),
      descricao: body.descricao?.trim() || null,
      ativa: body.ativa ?? true,
    },
  });
  return NextResponse.json(quadra, { status: 201 });
}
