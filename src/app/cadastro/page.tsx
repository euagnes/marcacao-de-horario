"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CadastroPage() {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/usuarios/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setErro(json.erro ?? "Erro ao cadastrar."); return; }
      setOk(true);
    } catch {
      setErro("Falha de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        {ok ? (
          <div className="card text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sol-500/20 text-3xl">📨</div>
            <h1 className="mt-4 text-2xl font-bold text-mar-800">Cadastro enviado!</h1>
            <p className="mt-2 text-mar-600">
              Seu cadastro está <strong>aguardando aprovação</strong> do administrador.
              Assim que for aprovado, você receberá um <strong>e-mail</strong> e poderá entrar para agendar.
            </p>
            <Link href="/" className="btn-primary mt-6">Voltar ao início</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-mar-800">Criar conta</h1>
            <p className="mt-1 text-mar-500">
              Cadastre-se para poder agendar. O acesso é liberado após aprovação.
            </p>
            <form onSubmit={enviar} className="card mt-6 space-y-4">
              <div>
                <label className="label">Nome completo *</label>
                <input className="input" required value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div>
                <label className="label">E-mail *</label>
                <input type="email" className="input" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Telefone / WhatsApp *</label>
                <input className="input" required value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(75) 90000-0000" />
              </div>
              <div>
                <label className="label">Senha * (mín. 6 caracteres)</label>
                <input type="password" className="input" required minLength={6} value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })} />
              </div>
              {erro && <p className="rounded-lg bg-coral-500/10 px-4 py-2 text-sm text-coral-500">{erro}</p>}
              <button disabled={enviando} className="btn-primary w-full">
                {enviando ? "Enviando…" : "Criar conta"}
              </button>
              <p className="text-center text-sm text-mar-500">
                Já tem conta? <Link href="/login" className="text-mar-600 hover:underline">Entrar</Link>
              </p>
            </form>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
