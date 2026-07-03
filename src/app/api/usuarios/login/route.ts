import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { criarSessaoUsuario } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/usuarios/login  body: { email, senha }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = body.email?.trim().toLowerCase();
  const senha = body.senha;

  if (!email || !senha) {
    return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    return NextResponse.json({ erro: "E-mail ou senha inválidos." }, { status: 401 });
  }

  if (usuario.status === "PENDENTE") {
    return NextResponse.json(
      { erro: "Seu cadastro ainda está aguardando aprovação do administrador." },
      { status: 403 }
    );
  }
  if (usuario.status === "REJEITADO") {
    return NextResponse.json(
      { erro: "Seu cadastro não foi aprovado. Entre em contato conosco." },
      { status: 403 }
    );
  }

  await criarSessaoUsuario(usuario.id, usuario.nome);
  return NextResponse.json({ ok: true, nome: usuario.nome });
}
