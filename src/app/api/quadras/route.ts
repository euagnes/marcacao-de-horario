import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/quadras -> lista as quadras ativas (público)
export async function GET() {
  const quadras = await prisma.quadra.findMany({
    where: { ativa: true },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(quadras);
}
