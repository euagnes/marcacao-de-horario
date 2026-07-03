import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dataApenas, formatarData } from "@/lib/horarios";

// GET /api/admin/agendamentos?data=YYYY-MM-DD&quadraId=&status=
// Lista reservas com filtros (admin)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data");
  const quadraId = searchParams.get("quadraId");
  const status = searchParams.get("status");

  const where: Prisma.AgendamentoWhereInput = {};
  if (data) where.data = dataApenas(data);
  if (quadraId) where.quadraId = Number(quadraId);
  if (status) where.status = status as Prisma.EnumStatusAgendamentoFilter["equals"];

  const agendamentos = await prisma.agendamento.findMany({
    where,
    include: { quadra: true, cliente: true },
    orderBy: [{ data: "asc" }, { horaInicio: "asc" }],
  });

  return NextResponse.json(
    agendamentos.map((a) => ({
      id: a.id,
      codigo: a.codigo,
      cliente: a.cliente.nome,
      telefone: a.cliente.telefone,
      email: a.cliente.email,
      quadra: a.quadra.nome,
      quadraId: a.quadraId,
      data: formatarData(a.data),
      horaInicio: a.horaInicio,
      horaFim: a.horaFim,
      status: a.status,
      modalidade: a.modalidade,
      observacoes: a.observacoes,
      criadoEm: a.criadoEm,
    }))
  );
}
