"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) {
        const j = await res.json();
        setErro(j.erro ?? "Falha no login.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-mar-500 to-mar-300 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo claro />
        </div>
        <form onSubmit={entrar} className="card space-y-4">
          <h1 className="text-center text-xl font-bold text-mar-800">Área do administrador</h1>
          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              className="input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ceu.com.br"
            />
          </div>
          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              className="input"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {erro && <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-500">{erro}</p>}
          <button type="submit" disabled={enviando} className="btn-primary w-full">
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
