import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calcularDisponibilidade,
  dataApenas,
  diaDaSemana,
} from "@/lib/horarios";

// GET /api/disponibilidade?data=YYYY-MM-DD&quadraId=1
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data");
  const quadraIdParam = searchParams.get("quadraId");

  if (!data || !quadraIdParam) {
    return NextResponse.json(
      { erro: "Informe 'data' (YYYY-MM-DD) e 'quadraId'." },
      { status: 400 }
    );
  }

  const quadraId = Number(quadraIdParam);
  const dia = diaDaSemana(data);
  const dataObj = dataApenas(data);

  // Horário de funcionamento do dia da semana
  const funcionamento = await prisma.horarioFuncionamento.findUnique({
    where: { diaSemana: dia },
  });

  if (!funcionamento || !funcionamento.ativo) {
    return NextResponse.json({
      data,
      quadraId,
      funcionamento: null,
      slots: [],
      mensagem: "Não há funcionamento neste dia.",
    });
  }

  // Agendamentos ativos (não cancelados) da quadra na data
  const ocupados = await prisma.agendamento.findMany({
    where: {
      quadraId,
      data: dataObj,
      status: { not: "CANCELADO" },
    },
    select: { horaInicio: true, horaFim: true },
  });

  // Bloqueios que afetam essa quadra na data (específicos da quadra OU gerais)
  const bloqueios = await prisma.bloqueio.findMany({
    where: {
      data: dataObj,
      OR: [{ quadraId }, { quadraId: null }],
    },
    select: { horaInicio: true, horaFim: true },
  });

  const slots = calcularDisponibilidade(
    { inicio: funcionamento.horaInicio, fim: funcionamento.horaFim },
    ocupados.map((o) => ({ inicio: o.horaInicio, fim: o.horaFim })),
    bloqueios.map((b) => ({ inicio: b.horaInicio, fim: b.horaFim }))
  );

  return NextResponse.json({
    data,
    quadraId,
    funcionamento: { inicio: funcionamento.horaInicio, fim: funcionamento.horaFim },
    valorHora: funcionamento.valorHora == null ? null : Number(funcionamento.valorHora),
    slots,
  });
}
