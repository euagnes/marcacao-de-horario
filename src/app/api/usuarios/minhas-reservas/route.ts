import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioLogado } from "@/lib/auth";
import { formatarData } from "@/lib/horarios";

export const dynamic = "force-dynamic";

// GET /api/usuarios/minhas-reservas -> reservas do usuário logado
export async function GET() {
  const sessao = await usuarioLogado();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const reservas = await prisma.agendamento.findMany({
    where: { usuarioId: sessao.uid },
    include: { quadra: true },
    orderBy: [{ data: "desc" }, { horaInicio: "desc" }],
  });

  return NextResponse.json(
    reservas.map((a) => ({
      codigo: a.codigo,
      quadra: a.quadra.nome,
      data: formatarData(a.data),
      horaInicio: a.horaInicio,
      horaFim: a.horaFim,
      status: a.status,
      observacoes: a.observacoes,
    }))
  );
}
