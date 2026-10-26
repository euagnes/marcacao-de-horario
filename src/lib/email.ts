import nodemailer from "nodemailer";

const HOST = "smtp-relay.brevo.com";
const PORT = 587;

function temConfig() {
  return Boolean(process.env.BREVO_SMTP_KEY && process.env.BREVO_SMTP_LOGIN);
}

function transporte() {
  return nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: false, // STARTTLS
    auth: {
      user: process.env.BREVO_SMTP_LOGIN,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });
}

interface EnviarParams {
  para: string;
  assunto: string;
  html: string;
}

/**
 * Envia um e-mail via Brevo SMTP.
 * Retorna { ok, simulado?, erro? } — NUNCA lança, para não quebrar fluxos
 * (ex.: a aprovação do usuário acontece mesmo que o e-mail falhe).
 */
export async function enviarEmail({ para, assunto, html }: EnviarParams) {
  // 1) Preferência: enviar via webhook do n8n (se configurado)
  const n8nUrl = process.env.N8N_EMAIL_WEBHOOK_URL;
  if (n8nUrl) {
    try {
      const res = await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          para,
          assunto,
          html,
          de: process.env.EMAIL_FROM ?? "",
          remetente: process.env.EMAIL_FROM_NAME ?? "Praia do Norte",
        }),
      });
      if (!res.ok) {
        return { ok: false as const, erro: `n8n respondeu HTTP ${res.status}` };
      }
      return { ok: true as const, via: "n8n" as const };
    } catch (e) {
      console.error("[email] Falha ao chamar webhook do n8n:", e);
      return { ok: false as const, erro: e instanceof Error ? e.message : "erro n8n" };
    }
  }

  // 2) Fallback: SMTP direto (Brevo) se configurado
  if (!temConfig()) {
    console.warn(
      "[email] Nem N8N_EMAIL_WEBHOOK_URL nem BREVO_SMTP_* configurados — e-mail SIMULADO para:",
      para
    );
    return { ok: false, simulado: true as const };
  }
  try {
    const from = `"${process.env.EMAIL_FROM_NAME ?? "Praia do Norte"}" <${
      process.env.EMAIL_FROM ?? process.env.BREVO_SMTP_LOGIN
    }>`;
    await transporte().sendMail({ from, to: para, subject: assunto, html });
    return { ok: true as const };
  } catch (e) {
    console.error("[email] Falha ao enviar:", e);
    return { ok: false as const, erro: e instanceof Error ? e.message : "erro" };
  }
}

/** E-mail de cadastro aprovado. */
export function emailAprovacao(nome: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  return {
    assunto: "✅ Seu cadastro na Praia do Norte foi aprovado!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1c404e">
        <div style="background:linear-gradient(135deg,#1497b0,#2fb5cb);padding:24px;border-radius:16px 16px 0 0;color:#fff">
          <h1 style="margin:0;font-size:22px">Praia do Norte</h1>
          <p style="margin:4px 0 0;opacity:.9">Quadras de Areia</p>
        </div>
        <div style="border:1px solid #d3f0f5;border-top:0;padding:24px;border-radius:0 0 16px 16px">
          <h2 style="color:#1b5b6f">Olá, ${nome}! 🎉</h2>
          <p>Seu cadastro foi <strong>aprovado</strong>. Agora você já pode entrar e reservar suas quadras de areia.</p>
          <p style="text-align:center;margin:28px 0">
            <a href="${base}/login" style="background:#f28a12;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:bold;display:inline-block">
              Entrar e agendar
            </a>
          </p>
          <p style="font-size:13px;color:#36abc4">Se você não solicitou este cadastro, ignore este e-mail.</p>
        </div>
      </div>`,
  };
}

/** E-mail de cadastro recusado. */
export function emailRejeicao(nome: string) {
  return {
    assunto: "Sobre seu cadastro na Praia do Norte",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1c404e">
        <h2>Olá, ${nome}</h2>
        <p>Infelizmente seu cadastro não pôde ser aprovado neste momento.</p>
        <p>Em caso de dúvida, entre em contato conosco.</p>
        <p>— Equipe Praia do Norte</p>
      </div>`,
  };
}
