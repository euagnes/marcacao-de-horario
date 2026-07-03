import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/usuarios/cadastro  body: { nome, email, telefone, senha }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nome = body.nome?.trim();
  const email = body.email?.trim().toLowerCase();
  const telefone = body.telefone?.trim();
  const senha = body.senha;

  if (!nome || !email || !telefone || !senha) {
    return NextResponse.json(
      { erro: "Preencha nome, e-mail, telefone e senha." },
      { status: 400 }
    );
  }
  if (senha.length < 6) {
    return NextResponse.json({ erro: "A senha deve ter ao menos 6 caracteres." }, { status: 400 });
  }

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) {
    return NextResponse.json({ erro: "Já existe uma conta com este e-mail." }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.create({
    data: { nome, email, telefone, senhaHash, status: "PENDENTE" },
  });

  return NextResponse.json(
    {
      ok: true,
      mensagem:
        "Cadastro enviado! Aguarde a aprovação do administrador — você receberá um e-mail quando for liberado.",
    },
    { status: 201 }
  );
}
