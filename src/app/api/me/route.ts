import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { usuarioLogado, criarSessaoUsuario } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/me -> dados do usuário logado (ou 401)
export async function GET() {
  const sessao = await usuarioLogado();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.uid },
    select: { id: true, nome: true, email: true, telefone: true, status: true },
  });
  if (!usuario || usuario.status !== "APROVADO") {
    return NextResponse.json({ erro: "Conta inativa" }, { status: 401 });
  }
  return NextResponse.json(usuario);
}

// PATCH /api/me -> atualiza o perfil do usuário logado
// body: { nome, telefone, email, senhaAtual?, novaSenha? }
export async function PATCH(req: Request) {
  const sessao = await usuarioLogado();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const usuario = await prisma.usuario.findUnique({ where: { id: sessao.uid } });
  if (!usuario) return NextResponse.json({ erro: "Conta não encontrada" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const nome = body.nome?.trim();
  const telefone = body.telefone?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!nome || !telefone || !email) {
    return NextResponse.json({ erro: "Preencha nome, telefone e e-mail." }, { status: 400 });
  }

  // E-mail único (ignorando a própria conta)
  const emailEmUso = await prisma.usuario.findFirst({
    where: { email, id: { not: usuario.id } },
    select: { id: true },
  });
  if (emailEmUso) {
    return NextResponse.json({ erro: "Já existe outra conta com este e-mail." }, { status: 409 });
  }

  const data: Record<string, unknown> = { nome, telefone, email };

  // Troca de senha (opcional): exige a senha atual
  if (body.novaSenha) {
    if (String(body.novaSenha).length < 6) {
      return NextResponse.json({ erro: "A nova senha deve ter ao menos 6 caracteres." }, { status: 400 });
    }
    const confere = await bcrypt.compare(body.senhaAtual ?? "", usuario.senhaHash);
    if (!confere) {
      return NextResponse.json({ erro: "Senha atual incorreta." }, { status: 400 });
    }
    data.senhaHash = await bcrypt.hash(body.novaSenha, 10);
  }

  const atualizado = await prisma.usuario.update({ where: { id: usuario.id }, data });

  // Atualiza o cookie de sessão (nome usado no cabeçalho)
  await criarSessaoUsuario(atualizado.id, atualizado.nome);

  return NextResponse.json({
    ok: true,
    usuario: {
      id: atualizado.id,
      nome: atualizado.nome,
      email: atualizado.email,
      telefone: atualizado.telefone,
      status: atualizado.status,
    },
  });
}
