import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dataApenas, formatarData } from "@/lib/horarios";

// GET /api/admin/bloqueios?data=YYYY-MM-DD (opcional)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data");
  const bloqueios = await prisma.bloqueio.findMany({
    where: data ? { data: dataApenas(data) } : {},
    include: { quadra: true },
    orderBy: [{ data: "asc" }, { horaInicio: "asc" }],
  });
  return NextResponse.json(
    bloqueios.map((b) => ({
      id: b.id,
      quadraId: b.quadraId,
      quadra: b.quadra?.nome ?? "Todas",
      data: formatarData(b.data),
      horaInicio: b.horaInicio,
      horaFim: b.horaFim,
      motivo: b.motivo,
    }))
  );
}

// POST /api/admin/bloqueios  body: { quadraId?, data, horaInicio?, horaFim?, motivo? }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.data) {
    return NextResponse.json({ erro: "Informe a data." }, { status: 400 });
  }
  const bloqueio = await prisma.bloqueio.create({
    data: {
      quadraId: body.quadraId ? Number(body.quadraId) : null,
      data: dataApenas(body.data),
      horaInicio: body.horaInicio || null,
      horaFim: body.horaFim || null,
      motivo: body.motivo?.trim() || null,
    },
  });
  return NextResponse.json(bloqueio, { status: 201 });
}
