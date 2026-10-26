// Acesso e validação das modalidades no servidor (usa o Prisma; não importar em componentes "use client").
import { prisma } from "./prisma";
import { CORES_POSTER, ILUSTRACOES, type Modalidade } from "./aulas";

/** Modalidades na ordem do admin. `apenasAtivas` = só as visíveis no site. */
export async function listarModalidades(apenasAtivas = true): Promise<Modalidade[]> {
  return prisma.modalidade.findMany({
    where: apenasAtivas ? { ativa: true } : undefined,
    orderBy: [{ ordem: "asc" }, { id: "asc" }],
    select: {
      slug: true, nome: true, publico: true, resumo: true, descricao: true,
      beneficios: true, cor: true, icone: true,
    },
  });
}

/** Valida o corpo de criação/edição. O slug é definido só na criação. */
export function dadosModalidade(body: any): { erro: string } | { data: Record<string, unknown> } {
  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const nome = texto(body.nome);
  const resumo = texto(body.resumo);
  if (!nome) return { erro: "Informe o nome da modalidade." };
  if (!resumo) return { erro: "Escreva a frase de destaque (resumo)." };
  if (!(body.cor in CORES_POSTER)) return { erro: "Escolha uma cor." };
  if (!(body.icone in ILUSTRACOES)) return { erro: "Escolha uma ilustração." };

  const beneficios: string[] = (Array.isArray(body.beneficios) ? body.beneficios : String(body.beneficios ?? "").split("\n"))
    .map((b: unknown) => texto(b))
    .filter(Boolean);
  const ordem = Number(body.ordem);

  return {
    data: {
      nome,
      resumo,
      publico: texto(body.publico),
      descricao: texto(body.descricao),
      beneficios,
      cor: body.cor,
      icone: body.icone,
      ordem: Number.isFinite(ordem) ? Math.trunc(ordem) : 0,
      ativa: body.ativa ?? true,
    },
  };
}
