// Helpers de data/hora e cálculo de disponibilidade.

/** Converte "HH:MM" em minutos desde 00:00. */
export function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/** Converte minutos desde 00:00 em "HH:MM". */
export function minutosParaHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Dois intervalos [aInicio,aFim) e [bInicio,bFim) se sobrepõem? (valores em minutos) */
export function temSobreposicao(
  aInicio: number,
  aFim: number,
  bInicio: number,
  bFim: number
): boolean {
  return aInicio < bFim && bInicio < aFim;
}

export const DURACAO_SLOT_MIN = 60; // cada horário tem 1 hora

// Antecedência máxima para agendar (2 semanas)
export const ANTECEDENCIA_MAX_DIAS = 14;

/** Retorna a data máxima permitida para agendar, como "YYYY-MM-DD" (hoje + 14 dias). */
export function dataLimiteAgendamento(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + ANTECEDENCIA_MAX_DIAS);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

/**
 * Gera os horários de início possíveis (de hora em hora) dentro do
 * intervalo de funcionamento. Ex: 07:00..22:00 -> 07:00, 08:00, ..., 21:00.
 */
export function gerarSlots(horaInicio: string, horaFim: string): string[] {
  const inicio = horaParaMinutos(horaInicio);
  const fim = horaParaMinutos(horaFim);
  const slots: string[] = [];
  for (let t = inicio; t + DURACAO_SLOT_MIN <= fim; t += DURACAO_SLOT_MIN) {
    slots.push(minutosParaHora(t));
  }
  return slots;
}

/**
 * Converte "YYYY-MM-DD" em Date à meia-noite UTC.
 * Usado para gravar e consultar a coluna @db.Date sem sofrer com fuso horário.
 */
export function dataApenas(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/** Retorna o dia da semana (0=domingo..6=sábado) de "YYYY-MM-DD". */
export function diaDaSemana(dateStr: string): number {
  return dataApenas(dateStr).getUTCDay();
}

/** Formata um Date (vindo do banco) como "YYYY-MM-DD". */
export function formatarData(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const NOMES_DIAS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

interface Intervalo {
  inicio: string; // "HH:MM"
  fim: string; // "HH:MM"
}

export interface SlotDisponibilidade {
  hora: string; // início "HH:MM"
  fim: string; // fim "HH:MM"
  disponivel: boolean;
  motivo?: string; // por que está indisponível
}

/**
 * Calcula a disponibilidade de cada slot de 1h para uma quadra/data.
 * @param funcionamento intervalo de funcionamento do dia
 * @param ocupados      agendamentos ativos (não cancelados) da quadra naquela data
 * @param bloqueios     bloqueios que afetam a quadra naquela data (dia inteiro = inicio/fim null)
 */
export function calcularDisponibilidade(
  funcionamento: Intervalo,
  ocupados: Intervalo[],
  bloqueios: { inicio: string | null; fim: string | null }[]
): SlotDisponibilidade[] {
  const slots = gerarSlots(funcionamento.inicio, funcionamento.fim);

  return slots.map((hora) => {
    const inicio = horaParaMinutos(hora);
    const fim = inicio + DURACAO_SLOT_MIN;
    const fimStr = minutosParaHora(fim);

    // Já reservado?
    const ocupado = ocupados.some((o) =>
      temSobreposicao(inicio, fim, horaParaMinutos(o.inicio), horaParaMinutos(o.fim))
    );
    if (ocupado) {
      return { hora, fim: fimStr, disponivel: false, motivo: "Reservado" };
    }

    // Bloqueado (manutenção, feriado, evento)?
    const bloqueado = bloqueios.some((b) => {
      if (b.inicio === null || b.fim === null) return true; // dia inteiro
      return temSobreposicao(inicio, fim, horaParaMinutos(b.inicio), horaParaMinutos(b.fim));
    });
    if (bloqueado) {
      return { hora, fim: fimStr, disponivel: false, motivo: "Bloqueado" };
    }

    return { hora, fim: fimStr, disponivel: true };
  });
}
