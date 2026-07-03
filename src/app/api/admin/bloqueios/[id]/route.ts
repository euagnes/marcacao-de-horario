import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// DELETE /api/admin/bloqueios/:id
export async function DELETE(_req: Request, { params }: Params) {
  await prisma.bloqueio.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
