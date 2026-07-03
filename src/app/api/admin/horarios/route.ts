import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/horarios -> horários de funcionamento (todos os dias)
export async function GET() {
  const horarios = await prisma.horarioFuncionamento.findMany({
    orderBy: { diaSemana: "asc" },
  });
  return NextResponse.json(horarios);
}

// PUT /api/admin/horarios  body: { horarios: [{ diaSemana, horaInicio, horaFim, ativo }] }
export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const lista = body.horarios;
  if (!Array.isArray(lista)) {
    return NextResponse.json({ erro: "Envie a lista 'horarios'." }, { status: 400 });
  }

  await prisma.$transaction(
    lista.map((h: { diaSemana: number; horaInicio: string; horaFim: string; ativo: boolean }) =>
      prisma.horarioFuncionamento.upsert({
        where: { diaSemana: h.diaSemana },
        update: { horaInicio: h.horaInicio, horaFim: h.horaFim, ativo: !!h.ativo },
        create: {
          diaSemana: h.diaSemana,
          horaInicio: h.horaInicio,
          horaFim: h.horaFim,
          ativo: !!h.ativo,
        },
      })
    )
  );

  const horarios = await prisma.horarioFuncionamento.findMany({ orderBy: { diaSemana: "asc" } });
  return NextResponse.json({ ok: true, horarios });
}
