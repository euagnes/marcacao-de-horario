"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Reserva {
  codigo: string;
  quadra: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: string;
}

const STATUS_CLS: Record<string, string> = {
  PENDENTE: "bg-sol-500/20 text-sol-600",
  CONFIRMADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-coral-500/20 text-coral-500",
};

export default function MinhaContaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Edição de perfil
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", senhaAtual: "", novaSenha: "" });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/usuarios/minhas-reservas").then((r) => (r.ok ? r.json() : [])),
    ]).then(([u, rs]) => {
      setUsuario(u);
      setReservas(Array.isArray(rs) ? rs : []);
      setCarregando(false);
    });
  }, []);

  function abrirEdicao() {
    if (!usuario) return;
    setForm({
      nome: usuario.nome ?? "",
      telefone: usuario.telefone ?? "",
      email: usuario.email ?? "",
      senhaAtual: "",
      novaSenha: "",
    });
    setErro(null);
    setMsg(null);
    setEditando(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMsg(null);
    setSalvando(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Erro ao salvar.");
        return;
      }
      setUsuario(json.usuario);
      setEditando(false);
      setMsg("Perfil atualizado com sucesso!");
      router.refresh(); // atualiza o nome no cabeçalho
    } catch {
      setErro("Falha de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    await fetch("/api/usuarios/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-mar-800">Minha conta</h1>
            {usuario && <p className="text-mar-500">{usuario.nome} · {usuario.email}</p>}
          </div>
          <div className="flex gap-2">
            <Link href="/agendar" className="btn-primary !py-2 text-sm">Novo agendamento</Link>
            <button onClick={sair} className="btn-ghost !py-2 text-sm">Sair</button>
          </div>
        </div>

        {msg && <p className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-green-700">{msg}</p>}

        {/* Dados do perfil */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-semibold text-mar-700">Meus dados</h2>
          {usuario && !editando && (
            <button onClick={abrirEdicao} className="btn-ghost !px-4 !py-1.5 text-sm">✏️ Editar perfil</button>
          )}
        </div>

        {usuario && !editando && (
          <div className="card mt-2 space-y-1 text-mar-700">
            <p>👤 {usuario.nome}</p>
            <p>📧 {usuario.email}</p>
            <p>📱 {usuario.telefone}</p>
          </div>
        )}

        {usuario && editando && (
          <form onSubmit={salvar} className="card mt-2 space-y-4">
            <div>
              <label className="label">Nome completo *</label>
              <input className="input" required value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Telefone / WhatsApp *</label>
                <input className="input" required value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div>
                <label className="label">E-mail *</label>
                <input type="email" className="input" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="rounded-xl bg-mar-50 p-4">
              <p className="mb-2 text-sm font-medium text-mar-600">Trocar senha (opcional)</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Senha atual</label>
                  <input type="password" className="input" value={form.senhaAtual}
                    onChange={(e) => setForm({ ...form, senhaAtual: e.target.value })} placeholder="••••••" />
                </div>
                <div>
                  <label className="label">Nova senha</label>
                  <input type="password" className="input" value={form.novaSenha}
                    onChange={(e) => setForm({ ...form, novaSenha: e.target.value })} placeholder="mín. 6 caracteres" />
                </div>
              </div>
              <p className="mt-1 text-xs text-mar-400">Preencha só se quiser mudar a senha.</p>
            </div>

            {erro && <p className="rounded-lg bg-coral-500/10 px-4 py-2 text-sm text-coral-500">{erro}</p>}

            <div className="flex gap-2">
              <button type="submit" disabled={salvando} className="btn-primary">
                {salvando ? "Salvando…" : "Salvar alterações"}
              </button>
              <button type="button" onClick={() => setEditando(false)} className="btn-ghost">Cancelar</button>
            </div>
          </form>
        )}

        <h2 className="mt-8 mb-3 font-semibold text-mar-700">Minhas reservas</h2>
        {carregando ? (
          <p className="text-mar-400">Carregando…</p>
        ) : reservas.length === 0 ? (
          <div className="card text-center text-mar-500">
            Você ainda não tem reservas.
            <div className="mt-3"><Link href="/agendar" className="btn-sol">Agendar agora</Link></div>
          </div>
        ) : (
          <div className="space-y-2">
            {reservas.map((r) => (
              <div key={r.codigo} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
                <div>
                  <span className="font-semibold text-mar-800">
                    {new Date(`${r.data}T00:00:00`).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="ml-2 font-mono text-mar-600">{r.horaInicio}–{r.horaFim}</span>
                  <span className="ml-2 text-sm text-mar-400">· {r.quadra}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${STATUS_CLS[r.status]}`}>{r.status}</span>
                  <Link href={`/cancelar?codigo=${r.codigo}`} className="text-sm text-mar-500 hover:underline">
                    Gerenciar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
