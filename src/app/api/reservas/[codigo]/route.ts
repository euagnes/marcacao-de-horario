import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dataApenas,
  dataLimiteAgendamento,
  diaDaSemana,
  formatarData,
  horaParaMinutos,
  minutosParaHora,
  temSobreposicao,
  ANTECEDENCIA_MAX_DIAS,
  DURACAO_SLOT_MIN,
} from "@/lib/horarios";

type Params = { params: { codigo: string } };

// GET /api/reservas/:codigo  -> consulta uma reserva pelo código (público)
export async function GET(_req: Request, { params }: Params) {
  const ag = await buscar(params.codigo);
  if (!ag) return NextResponse.json({ erro: "Reserva não encontrada." }, { status: 404 });
  return NextResponse.json(serializar(ag));
}

// DELETE /api/reservas/:codigo  -> cancela e REMOVE a reserva (some dos dois painéis)
export async function DELETE(_req: Request, { params }: Params) {
  const ag = await buscar(params.codigo);
  if (!ag) return NextResponse.json({ erro: "Reserva não encontrada." }, { status: 404 });

  // Remove de vez (libera o horário e some do painel do cliente e do admin)
  await prisma.pagamento.deleteMany({ where: { agendamentoId: ag.id } });
  await prisma.agendamento.delete({ where: { id: ag.id } });

  return NextResponse.json({ ok: true, mensagem: "Reserva cancelada e removida com sucesso." });
}

// PATCH /api/reservas/:codigo  -> remarcar (público, mediante código)
// body: { data, horaInicio, quantidade }
export async function PATCH(req: Request, { params }: Params) {
  const ag = await buscar(params.codigo);
  if (!ag) return NextResponse.json({ erro: "Reserva não encontrada." }, { status: 404 });
  if (ag.status === "CANCELADO") {
    return NextResponse.json({ erro: "Não é possível remarcar uma reserva cancelada." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.data || !body?.horaInicio) {
    return NextResponse.json({ erro: "Informe nova data e horário." }, { status: 400 });
  }
  const quantidade = Number(body.quantidade) || 1;
  if (quantidade < 1 || quantidade > 2) {
    return NextResponse.json({ erro: "Máximo de 2 horários seguidos." }, { status: 400 });
  }

  const data: string = body.data;
  const horaInicio: string = body.horaInicio;
  const inicioMin = horaParaMinutos(horaInicio);
  const fimMin = inicioMin + quantidade * DURACAO_SLOT_MIN;
  const horaFim = minutosParaHora(fimMin);
  const dataObj = dataApenas(data);

  // Limite de antecedência: no máximo 2 semanas
  if (data > dataLimiteAgendamento()) {
    return NextResponse.json(
      { erro: `Só é possível remarcar com até ${ANTECEDENCIA_MAX_DIAS} dias (2 semanas) de antecedência.` },
      { status: 400 }
    );
  }

  // Funcionamento
  const func = await prisma.horarioFuncionamento.findUnique({
    where: { diaSemana: diaDaSemana(data) },
  });
  if (!func || !func.ativo) {
    return NextResponse.json({ erro: "Não há funcionamento neste dia." }, { status: 400 });
  }
  if (inicioMin < horaParaMinutos(func.horaInicio) || fimMin > horaParaMinutos(func.horaFim)) {
    return NextResponse.json({ erro: "Horário fora do funcionamento." }, { status: 400 });
  }

  // Conflitos (ignora a própria reserva)
  const ativos = await prisma.agendamento.findMany({
    where: {
      quadraId: ag.quadraId,
      data: dataObj,
      status: { not: "CANCELADO" },
      id: { not: ag.id },
    },
    select: { horaInicio: true, horaFim: true },
  });
  const conflita = ativos.some((a) =>
    temSobreposicao(inicioMin, fimMin, horaParaMinutos(a.horaInicio), horaParaMinutos(a.horaFim))
  );
  if (conflita) {
    return NextResponse.json({ erro: "Novo horário já está reservado." }, { status: 409 });
  }

  const bloqueios = await prisma.bloqueio.findMany({
    where: { data: dataObj, OR: [{ quadraId: ag.quadraId }, { quadraId: null }] },
    select: { horaInicio: true, horaFim: true },
  });
  const bloqueado = bloqueios.some((b) => {
    if (b.horaInicio === null || b.horaFim === null) return true;
    return temSobreposicao(inicioMin, fimMin, horaParaMinutos(b.horaInicio), horaParaMinutos(b.horaFim));
  });
  if (bloqueado) {
    return NextResponse.json({ erro: "Novo horário está bloqueado." }, { status: 409 });
  }

  const atualizado = await prisma.agendamento.update({
    where: { id: ag.id },
    data: { data: dataObj, horaInicio, horaFim, status: "PENDENTE" },
    include: { quadra: true, cliente: true },
  });

  return NextResponse.json({ ok: true, agendamento: serializar(atualizado) });
}

function buscar(codigo: string) {
  return prisma.agendamento.findUnique({
    where: { codigo },
    include: { quadra: true, cliente: true },
  });
}

function serializar(ag: Awaited<ReturnType<typeof buscar>>) {
  if (!ag) return null;
  return {
    codigo: ag.codigo,
    nome: ag.cliente.nome,
    telefone: ag.cliente.telefone,
    quadra: ag.quadra.nome,
    quadraId: ag.quadraId,
    data: formatarData(ag.data),
    horaInicio: ag.horaInicio,
    horaFim: ag.horaFim,
    status: ag.status,
    modalidade: ag.modalidade,
    observacoes: ag.observacoes,
  };
}
