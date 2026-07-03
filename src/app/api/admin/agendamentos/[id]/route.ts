import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dataApenas,
  horaParaMinutos,
  minutosParaHora,
  temSobreposicao,
  DURACAO_SLOT_MIN,
} from "@/lib/horarios";

type Params = { params: { id: string } };

// PATCH /api/admin/agendamentos/:id
// body pode conter: status, data, horaInicio, quantidade, quadraId, observacoes
export async function PATCH(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));

  const atual = await prisma.agendamento.findUnique({ where: { id } });
  if (!atual) return NextResponse.json({ erro: "Agendamento não encontrado." }, { status: 404 });

  const data: Record<string, unknown> = {};

  // Regra: não pode haver duas reservas CONFIRMADAS na mesma quadra/data/horário.
  if (body.status === "CONFIRMADO") {
    const inicio = horaParaMinutos(atual.horaInicio);
    const fim = horaParaMinutos(atual.horaFim);
    const confirmados = await prisma.agendamento.findMany({
      where: {
        quadraId: atual.quadraId,
        data: atual.data,
        status: "CONFIRMADO",
        id: { not: id },
      },
      select: { horaInicio: true, horaFim: true },
    });
    const jaConfirmado = confirmados.some((c) =>
      temSobreposicao(inicio, fim, horaParaMinutos(c.horaInicio), horaParaMinutos(c.horaFim))
    );
    if (jaConfirmado) {
      return NextResponse.json(
        { erro: "Já existe uma reserva confirmada nesta quadra, data e horário." },
        { status: 409 }
      );
    }
  }

  if (body.status) data.status = body.status; // PENDENTE | CONFIRMADO | CANCELADO
  if (body.observacoes !== undefined) data.observacoes = body.observacoes || null;
  if (body.quadraId) data.quadraId = Number(body.quadraId);

  // Mudança de horário/data
  if (body.data || body.horaInicio || body.quantidade) {
    const novaData = body.data ?? undefined;
    const horaInicio: string = body.horaInicio ?? atual.horaInicio;
    const quantidade = Number(body.quantidade) || 1;
    const inicioMin = horaParaMinutos(horaInicio);
    const fimMin = inicioMin + quantidade * DURACAO_SLOT_MIN;
    const quadraId = body.quadraId ? Number(body.quadraId) : atual.quadraId;
    const dataObj = novaData ? dataApenas(novaData) : atual.data;

    // checa conflito (ignora a própria reserva)
    const ativos = await prisma.agendamento.findMany({
      where: { quadraId, data: dataObj, status: { not: "CANCELADO" }, id: { not: id } },
      select: { horaInicio: true, horaFim: true },
    });
    const conflita = ativos.some((a) =>
      temSobreposicao(inicioMin, fimMin, horaParaMinutos(a.horaInicio), horaParaMinutos(a.horaFim))
    );
    if (conflita) {
      return NextResponse.json({ erro: "Conflito de horário nesta quadra." }, { status: 409 });
    }

    data.horaInicio = horaInicio;
    data.horaFim = minutosParaHora(fimMin);
    if (novaData) data.data = dataObj;
  }

  const atualizado = await prisma.agendamento.update({ where: { id }, data });
  return NextResponse.json({ ok: true, id: atualizado.id, status: atualizado.status });
}

// DELETE /api/admin/agendamentos/:id  -> remove definitivamente
export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id);
  await prisma.pagamento.deleteMany({ where: { agendamentoId: id } });
  await prisma.agendamento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
