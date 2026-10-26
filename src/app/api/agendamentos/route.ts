import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { usuarioLogado } from "@/lib/auth";
import {
  dataApenas,
  dataLimiteAgendamento,
  diaDaSemana,
  horaParaMinutos,
  minutosParaHora,
  temSobreposicao,
  ANTECEDENCIA_MAX_DIAS,
  DURACAO_SLOT_MIN,
} from "@/lib/horarios";

export const dynamic = "force-dynamic";

interface CorpoAgendamento {
  data: string; // YYYY-MM-DD
  horaInicio: string; // "HH:MM"
  quantidade: number; // 1 ou 2 horas seguidas
  quadraId: number;
  modalidade?: string;
  observacoes?: string;
}

// POST /api/agendamentos  -> cria uma reserva (exige usuário aprovado logado)
export async function POST(req: Request) {
  // ---- Exige login de usuário aprovado ----
  const sessao = await usuarioLogado();
  if (!sessao) {
    return NextResponse.json(
      { erro: "Você precisa estar logado para agendar." },
      { status: 401 }
    );
  }
  const usuario = await prisma.usuario.findUnique({ where: { id: sessao.uid } });
  if (!usuario || usuario.status !== "APROVADO") {
    return NextResponse.json(
      { erro: "Sua conta não está aprovada para agendar." },
      { status: 403 }
    );
  }

  let corpo: CorpoAgendamento;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const { data, horaInicio, quadraId, modalidade, observacoes } = corpo;
  const quantidade = Number(corpo.quantidade) || 1;

  // Identidade vem da conta logada (não do formulário)
  const nome = usuario.nome;
  const telefone = usuario.telefone;
  const email = usuario.email;

  // ---- Validações básicas ----
  if (!data || !horaInicio || !quadraId) {
    return NextResponse.json(
      { erro: "Preencha data, horário e quadra." },
      { status: 400 }
    );
  }
  if (quantidade < 1 || quantidade > 2) {
    return NextResponse.json(
      { erro: "Você pode reservar no máximo 2 horários seguidos." },
      { status: 400 }
    );
  }

  const inicioMin = horaParaMinutos(horaInicio);
  const fimMin = inicioMin + quantidade * DURACAO_SLOT_MIN;
  const horaFim = minutosParaHora(fimMin);
  const dataObj = dataApenas(data);

  // Não permitir reservas no passado
  const agora = new Date();
  const inicioReserva = new Date(`${data}T${horaInicio}:00`);
  if (inicioReserva.getTime() < agora.getTime()) {
    return NextResponse.json(
      { erro: "Não é possível reservar um horário no passado." },
      { status: 400 }
    );
  }

  // Limite de antecedência: no máximo 2 semanas
  if (data > dataLimiteAgendamento()) {
    return NextResponse.json(
      { erro: `Só é possível agendar com até ${ANTECEDENCIA_MAX_DIAS} dias (2 semanas) de antecedência.` },
      { status: 400 }
    );
  }

  // ---- Horário de funcionamento ----
  const dia = diaDaSemana(data);
  const funcionamento = await prisma.horarioFuncionamento.findUnique({
    where: { diaSemana: dia },
  });
  if (!funcionamento || !funcionamento.ativo) {
    return NextResponse.json(
      { erro: "Não há funcionamento neste dia." },
      { status: 400 }
    );
  }
  if (
    inicioMin < horaParaMinutos(funcionamento.horaInicio) ||
    fimMin > horaParaMinutos(funcionamento.horaFim)
  ) {
    return NextResponse.json(
      { erro: "Horário fora do período de funcionamento." },
      { status: 400 }
    );
  }

  // Valor da reserva = valor da hora do dia × horas (null se o dia não tem valor cadastrado)
  const valorTotal =
    funcionamento.valorHora == null ? null : Number(funcionamento.valorHora) * quantidade;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // Conflito com bloqueios (da quadra ou geral)
      const bloqueios = await tx.bloqueio.findMany({
        where: { data: dataObj, OR: [{ quadraId }, { quadraId: null }] },
        select: { horaInicio: true, horaFim: true },
      });
      const temBloqueio = bloqueios.some((b) => {
        if (b.horaInicio === null || b.horaFim === null) return true;
        return temSobreposicao(
          inicioMin,
          fimMin,
          horaParaMinutos(b.horaInicio),
          horaParaMinutos(b.horaFim)
        );
      });
      if (temBloqueio) {
        throw new ConflitoError("Este horário está bloqueado (feriado/manutenção/evento).");
      }

      // Conflito com agendamentos ativos da MESMA quadra (outra quadra pode no mesmo horário)
      const ativos = await tx.agendamento.findMany({
        where: { quadraId, data: dataObj, status: { not: "CANCELADO" } },
        select: { horaInicio: true, horaFim: true },
      });
      const conflita = ativos.some((a) =>
        temSobreposicao(
          inicioMin,
          fimMin,
          horaParaMinutos(a.horaInicio),
          horaParaMinutos(a.horaFim)
        )
      );
      if (conflita) {
        throw new ConflitoError("Este horário já está reservado para esta quadra.");
      }

      // Cliente: reaproveita por e-mail, senão cria (espelha os dados da conta)
      let cliente = await tx.cliente.findFirst({ where: { email } });
      if (!cliente) {
        cliente = await tx.cliente.create({
          data: { nome, telefone, email },
        });
      }

      const agendamento = await tx.agendamento.create({
        data: {
          clienteId: cliente.id,
          usuarioId: usuario.id,
          quadraId: Number(quadraId),
          data: dataObj,
          horaInicio,
          horaFim,
          modalidade: modalidade?.trim() || null,
          observacoes: observacoes?.trim() || null,
          valorTotal,
          status: "PENDENTE",
        },
        include: { quadra: true, cliente: true },
      });

      return agendamento;
    });

    return NextResponse.json(
      {
        ok: true,
        agendamento: {
          codigo: resultado.codigo,
          nome: resultado.cliente.nome,
          quadra: resultado.quadra.nome,
          modalidade: resultado.modalidade,
          data,
          horaInicio: resultado.horaInicio,
          horaFim: resultado.horaFim,
          status: resultado.status,
          valorTotal,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof ConflitoError) {
      return NextResponse.json({ erro: e.message }, { status: 409 });
    }
    // Violação da unique constraint (corrida) -> conflito
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { erro: "Este horário acabou de ser reservado. Escolha outro." },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json({ erro: "Erro ao criar agendamento." }, { status: 500 });
  }
}

class ConflitoError extends Error {}
