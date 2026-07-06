import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cpfValido, soDigitos } from "@/lib/cpf";

export const dynamic = "force-dynamic";

// POST /api/usuarios/cadastro  body: { nome, email, cpf, telefone, senha, fotoUrl? }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nome = body.nome?.trim();
  const email = body.email?.trim().toLowerCase();
  const telefone = body.telefone?.trim();
  const senha = body.senha;
  const cpf = body.cpf ? soDigitos(body.cpf) : "";
  const fotoUrl = typeof body.fotoUrl === "string" ? body.fotoUrl : null;

  if (!nome || !email || !telefone || !senha || !cpf) {
    return NextResponse.json(
      { erro: "Preencha nome, CPF, e-mail, telefone e senha." },
      { status: 400 }
    );
  }
  if (senha.length < 6) {
    return NextResponse.json({ erro: "A senha deve ter ao menos 6 caracteres." }, { status: 400 });
  }
  if (!cpfValido(cpf)) {
    return NextResponse.json({ erro: "CPF inválido." }, { status: 400 });
  }
  // Limite de tamanho da foto (data URL) ~1.5MB
  if (fotoUrl && fotoUrl.length > 1_500_000) {
    return NextResponse.json({ erro: "A foto é muito grande. Use uma imagem menor." }, { status: 400 });
  }

  const emailEmUso = await prisma.usuario.findUnique({ where: { email } });
  if (emailEmUso) {
    return NextResponse.json({ erro: "Já existe uma conta com este e-mail." }, { status: 409 });
  }
  const cpfEmUso = await prisma.usuario.findUnique({ where: { cpf } });
  if (cpfEmUso) {
    return NextResponse.json({ erro: "Já existe uma conta com este CPF." }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.create({
    data: { nome, email, cpf, telefone, fotoUrl, senhaHash, status: "PENDENTE" },
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
