// Dados de contato exibidos no site (configuráveis via .env)
export const CONTATO = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5532988370515",
  telefone: process.env.NEXT_PUBLIC_TELEFONE ?? "(32) 98837-0515",
  endereco:
    process.env.NEXT_PUBLIC_ENDERECO ??
    "Rua Marília, 285 - Benfica, Juiz de Fora - MG, 36090-330",
  instagram: "https://www.instagram.com/praiadonortejf",
  instagramUser: "@praiadonortejf",
};

export const EMPRESA = {
  nome: "Praia do Norte",
  subtitulo: "Beach tennis, vôlei de areia, funcional e futevôlei",
  unidade: "Benfica · Juiz de Fora",
};

/** Mensagem padrão sobre a forma de pagamento. */
export const AVISO_PAGAMENTO =
  "O pagamento é feito somente pessoalmente na arena ou pelo WhatsApp.";

/** 50 -> "R$ 50,00" */
export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Mensagem que o cliente envia no WhatsApp para a equipe aprovar a reserva. */
export function mensagemPedidoReserva(r: {
  nome: string;
  quadra: string;
  modalidade?: string | null;
  data: string; // já formatada para leitura
  horaInicio: string;
  horaFim: string;
  codigo: string;
  valorTotal?: number | null;
}): string {
  return (
    `Olá, Praia do Norte! 🌴 Fiz um *pedido de reserva* pelo site e aguardo a aprovação.\n\n` +
    `👤 ${r.nome}\n` +
    `🏐 ${r.quadra}${r.modalidade ? ` (${r.modalidade})` : ""}\n` +
    `📅 ${r.data}\n` +
    `⏰ ${r.horaInicio} às ${r.horaFim}\n` +
    (r.valorTotal != null ? `💰 Valor: ${formatarReais(r.valorTotal)}\n` : "") +
    `🔑 Código: ${r.codigo}\n\n` +
    `Como faço o pagamento?`
  );
}

/** Monta um link wa.me com mensagem opcional. */
export function linkWhatsApp(mensagem?: string): string {
  const base = `https://wa.me/${CONTATO.whatsapp}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
