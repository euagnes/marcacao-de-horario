// Dados de contato exibidos no site (configuráveis via .env)
export const CONTATO = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5575999998888",
  telefone: process.env.NEXT_PUBLIC_TELEFONE ?? "(75) 99999-8888",
  endereco:
    process.env.NEXT_PUBLIC_ENDERECO ??
    "CEU - Centro de Artes e Esportes Unificados",
};

export const EMPRESA = {
  nome: "Praça CEU",
  subtitulo: "Centro de Artes e Esportes Unificados",
  unidade: "Coronel Adelmir Romualdo de Oliveira",
};

/** Monta um link wa.me com mensagem opcional. */
export function linkWhatsApp(mensagem?: string): string {
  const base = `https://wa.me/${CONTATO.whatsapp}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
