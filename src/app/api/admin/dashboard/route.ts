import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dataApenas, formatarData } from "@/lib/horarios";

// GET /api/admin/dashboard?data=YYYY-MM-DD
// Resumo do dia: total, confirmados, pendentes, cancelados + lista do dia
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data");
  const dataObj = data ? dataApenas(data) : undefined;

  const whereDia = dataObj ? { data: dataObj } : {};

  const [doDia, totalGeral] = await Promise.all([
    prisma.agendamento.findMany({
      where: whereDia,
      include: { quadra: true, cliente: true },
      orderBy: [{ horaInicio: "asc" }],
    }),
    prisma.agendamento.count(),
  ]);

  const resumo = {
    total: doDia.length,
    confirmados: doDia.filter((a) => a.status === "CONFIRMADO").length,
    pendentes: doDia.filter((a) => a.status === "PENDENTE").length,
    cancelados: doDia.filter((a) => a.status === "CANCELADO").length,
    totalGeral,
  };

  return NextResponse.json({
    resumo,
    agendamentos: doDia.map((a) => ({
      id: a.id,
      codigo: a.codigo,
      cliente: a.cliente.nome,
      telefone: a.cliente.telefone,
      quadra: a.quadra.nome,
      quadraId: a.quadraId,
      data: formatarData(a.data),
      horaInicio: a.horaInicio,
      horaFim: a.horaFim,
      status: a.status,
      modalidade: a.modalidade,
      valorTotal: a.valorTotal == null ? null : Number(a.valorTotal),
      observacoes: a.observacoes,
    })),
  });
}
