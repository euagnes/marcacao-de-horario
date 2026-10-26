import { horaParaMinutos } from "./horarios";

const HORA_RE = /^\d{2}:\d{2}$/;

/** Valida e normaliza o corpo de criação/edição de turma. Retorna erro ou os dados. */
export function dadosTurma(body: any): { erro: string } | { data: Record<string, unknown> } {
  const dias: number[] = Array.isArray(body.diasSemana)
    ? Array.from(new Set<number>(body.diasSemana.map(Number)))
        .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
        .sort((a, b) => a - b)
    : [];

  if (!body.modalidade) return { erro: "Escolha a modalidade." };
  if (!dias.length) return { erro: "Escolha ao menos um dia da semana." };
  if (!HORA_RE.test(body.horaInicio ?? "") || !HORA_RE.test(body.horaFim ?? "")) {
    return { erro: "Informe o horário de início e fim." };
  }
  if (horaParaMinutos(body.horaFim) <= horaParaMinutos(body.horaInicio)) {
    return { erro: "O horário de fim deve ser depois do início." };
  }
  const vagas = body.vagas === "" || body.vagas == null ? null : Number(body.vagas);
  if (vagas !== null && (!Number.isInteger(vagas) || vagas < 0)) {
    return { erro: "Número de vagas inválido." };
  }

  return {
    data: {
      modalidade: String(body.modalidade),
      diasSemana: dias,
      horaInicio: body.horaInicio,
      horaFim: body.horaFim,
      nivel: body.nivel?.trim() || null,
      professor: body.professor?.trim() || null,
      valor: body.valor?.trim() || null,
      vagas,
      observacoes: body.observacoes?.trim() || null,
      ativa: body.ativa ?? true,
    },
  };
}

const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** [1,3,5] -> "Seg, Qua e Sex" */
export function diasLegiveis(dias: number[]): string {
  const nomes = dias.map((d) => DIAS_CURTOS[d]);
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}
