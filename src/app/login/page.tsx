"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/agendar";

  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setErro(json.erro ?? "Erro ao entrar."); return; }
      router.push(redirect);
      router.refresh();
    } catch {
      setErro("Falha de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-mar-800">Entrar</h1>
      <p className="mt-1 text-mar-500">Acesse sua conta para agendar.</p>
      <form onSubmit={entrar} className="card mt-6 space-y-4">
        <div>
          <label className="label">E-mail</label>
          <input type="email" className="input" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Senha</label>
          <input type="password" className="input" required value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })} />
        </div>
        {erro && <p className="rounded-lg bg-coral-500/10 px-4 py-2 text-sm text-coral-500">{erro}</p>}
        <button disabled={enviando} className="btn-primary w-full">
          {enviando ? "Entrando…" : "Entrar"}
        </button>
        <p className="text-center text-sm text-mar-500">
          Não tem conta? <Link href="/cadastro" className="text-mar-600 hover:underline">Cadastre-se</Link>
        </p>
      </form>
    </main>
  );
}

export default function LoginUsuarioPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="py-20 text-center text-mar-400">Carregando…</div>}>
        <Form />
      </Suspense>
      <Footer />
    </>
  );
}
