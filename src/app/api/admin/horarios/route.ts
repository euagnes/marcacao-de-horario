import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/horarios -> horários de funcionamento (todos os dias)
export async function GET() {
  const horarios = await prisma.horarioFuncionamento.findMany({
    orderBy: { diaSemana: "asc" },
  });
  return NextResponse.json(horarios.map((h) => ({ ...h, valorHora: h.valorHora == null ? null : Number(h.valorHora) })));
}

/** "50", "50,00", 50 -> 50; vazio -> null; inválido/negativo -> NaN */
function lerValor(v: unknown): number | null {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

// PUT /api/admin/horarios  body: { horarios: [{ diaSemana, horaInicio, horaFim, ativo, valorHora }] }
export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const lista = body.horarios;
  if (!Array.isArray(lista)) {
    return NextResponse.json({ erro: "Envie a lista 'horarios'." }, { status: 400 });
  }
  if (lista.some((h: any) => Number.isNaN(lerValor(h.valorHora)))) {
    return NextResponse.json({ erro: "Valor da hora inválido. Use só números, ex: 50 ou 45,50." }, { status: 400 });
  }

  await prisma.$transaction(
    lista.map((h: { diaSemana: number; horaInicio: string; horaFim: string; ativo: boolean; valorHora?: unknown }) => {
      const dados = {
        horaInicio: h.horaInicio,
        horaFim: h.horaFim,
        ativo: !!h.ativo,
        valorHora: lerValor(h.valorHora),
      };
      return prisma.horarioFuncionamento.upsert({
        where: { diaSemana: h.diaSemana },
        update: dados,
        create: { diaSemana: h.diaSemana, ...dados },
      });
    })
  );

  const horarios = await prisma.horarioFuncionamento.findMany({ orderBy: { diaSemana: "asc" } });
  return NextResponse.json({ ok: true, horarios });
}
