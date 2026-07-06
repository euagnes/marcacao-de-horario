import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/usuarios?status=PENDENTE  -> lista cadastros
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Prisma.UsuarioWhereInput = {};
  if (status) where.status = status as Prisma.EnumStatusUsuarioFilter["equals"];

  const usuarios = await prisma.usuario.findMany({
    where,
    select: {
      id: true, nome: true, email: true, cpf: true, telefone: true, fotoUrl: true,
      status: true, criadoEm: true, aprovadoEm: true,
      _count: { select: { agendamentos: true } },
    },
    orderBy: { criadoEm: "desc" },
  });
  return NextResponse.json(usuarios);
}
