import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarEmail, emailAprovacao, emailRejeicao } from "@/lib/email";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// PATCH /api/admin/usuarios/:id  body: { acao: "aprovar" | "rejeitar" }
export async function PATCH(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const acao = body.acao;

  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });

  if (acao === "aprovar") {
    await prisma.usuario.update({
      where: { id },
      data: { status: "APROVADO", aprovadoEm: new Date() },
    });
    const { assunto, html } = emailAprovacao(usuario.nome);
    const email = await enviarEmail({ para: usuario.email, assunto, html });
    return NextResponse.json({
      ok: true,
      status: "APROVADO",
      email, // { ok } | { ok:false, simulado } | { ok:false, erro }
    });
  }

  if (acao === "rejeitar") {
    await prisma.usuario.update({ where: { id }, data: { status: "REJEITADO" } });
    const { assunto, html } = emailRejeicao(usuario.nome);
    const email = await enviarEmail({ para: usuario.email, assunto, html });
    return NextResponse.json({ ok: true, status: "REJEITADO", email });
  }

  return NextResponse.json({ erro: "Ação inválida." }, { status: 400 });
}

// DELETE /api/admin/usuarios/:id
export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id);
  // Desvincula reservas antes de excluir o usuário
  await prisma.agendamento.updateMany({ where: { usuarioId: id }, data: { usuarioId: null } });
  await prisma.usuario.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
