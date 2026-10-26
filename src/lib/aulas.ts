// Modalidades de aula: as do site vêm do banco (tabela "modalidades", editável no admin).
// Este arquivo guarda as opções de cor/ilustração e os dados iniciais usados no seed.

/** Cores do bloco-pôster de cada modalidade (classes fixas para o Tailwind encontrar). */
export const CORES_POSTER = {
  sol: { nome: "Amarelo", classes: "bg-sol-500 text-abismo" },
  mar: { nome: "Azul", classes: "bg-mar-500 text-white" },
  laranja: { nome: "Laranja", classes: "bg-laranja-500 text-white" },
  abismo: { nome: "Azul-escuro", classes: "bg-abismo-700 text-areia" },
} as const;
export type CorPoster = keyof typeof CORES_POSTER;

/** Ilustrações disponíveis (desenhadas em src/components/Ilustracoes.tsx). */
export const ILUSTRACOES = {
  "beach-tennis": "Bolinha de beach tennis",
  futevolei: "Bola de futebol",
  "volei-de-praia": "Bola de vôlei",
  funcional: "Kettlebell",
} as const;
export type Ilustracao = keyof typeof ILUSTRACOES;

export function classesPoster(cor: string): string {
  return (CORES_POSTER[cor as CorPoster] ?? CORES_POSTER.mar).classes;
}

/** Dados de uma modalidade como o site usa (sem campos internos do banco). */
export interface Modalidade {
  slug: string;
  nome: string;
  publico: string;
  resumo: string;
  descricao: string;
  beneficios: string[];
  cor: string;
  icone: string;
}

/** "Vôlei de Praia" -> "volei-de-praia" */
export function gerarSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Modalidades iniciais da Praia do Norte (criadas pelo seed quando a tabela está vazia). */
export const MODALIDADES_PADRAO: (Modalidade & { ordem: number })[] = [
  {
    slug: "beach-tennis",
    nome: "Beach Tennis",
    publico: "Iniciantes ao avançado",
    resumo: "Dá pra começar sem nunca ter pegado numa raquete.",
    descricao:
      "Raquete, bolinha e areia: aprenda os fundamentos (saque, voleio e posicionamento em dupla) com turmas separadas por nível.",
    beneficios: ["Turmas por nível", "Raquetes para a aula experimental", "Jogos e treinos em dupla"],
    cor: "sol",
    icone: "beach-tennis",
    ordem: 1,
  },
  {
    slug: "futevolei",
    nome: "Futevôlei",
    publico: "Iniciantes ao avançado",
    resumo: "Futebol com regra de vôlei: nada de mão, muita resenha.",
    descricao:
      "Domínio, levantada, ataque com o pé, cabeça e peito. Treinos que desenvolvem técnica, leitura de jogo e condicionamento.",
    beneficios: ["Fundamentos do zero", "Treino tático em dupla", "Jogos no fim da aula"],
    cor: "mar",
    icone: "futevolei",
    ordem: 2,
  },
  {
    slug: "volei-de-praia",
    nome: "Vôlei de Praia",
    publico: "Todas as idades e níveis",
    resumo: "Saque, manchete e ataque do jeito que se joga na praia: em dupla.",
    descricao:
      "Aulas focadas em fundamentos e em jogo de dupla, com exercícios de deslocamento na areia e muita prática de rede.",
    beneficios: ["Fundamentos e posicionamento", "Treino físico na areia", "Preparação para torneios"],
    cor: "laranja",
    icone: "volei-de-praia",
    ordem: 3,
  },
  {
    slug: "funcional",
    nome: "Funcional na Areia",
    publico: "Para todos",
    resumo: "Força e fôlego com o pé na areia, sem pancada nas articulações.",
    descricao:
      "Circuitos que trabalham o corpo todo, com baixo impacto nas articulações e alto gasto calórico. Ótimo complemento para quem joga.",
    beneficios: ["Baixo impacto", "Condicionamento e força", "Turmas animadas"],
    cor: "abismo",
    icone: "funcional",
    ordem: 4,
  },
];
