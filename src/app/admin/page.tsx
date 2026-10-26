"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { NOMES_DIAS } from "@/lib/horarios";
import { formatarCpf } from "@/lib/cpf";
import { formatarReais } from "@/lib/config";
import AdminAulas from "@/components/AdminAulas";

type Aba =
  | "painel" | "reservas" | "usuarios" | "aulas" | "horarios" | "bloqueios"
  | "avisos" | "noticias" | "eventos" | "teatro";

function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

const STATUS_CLS: Record<string, string> = {
  PENDENTE: "bg-sol-500/20 text-sol-600",
  CONFIRMADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-coral-500/20 text-coral-500",
};

/** Abre o WhatsApp do cliente com a mensagem de reserva aprovada. */
function avisarAprovacaoWhatsApp(a: {
  cliente: string; telefone: string; quadra: string;
  data: string; horaInicio: string; horaFim: string;
}) {
  const fone = (a.telefone || "").replace(/\D/g, "");
  const dataBR = new Date(`${a.data}T00:00:00`).toLocaleDateString("pt-BR");
  const msg =
    `Olá, ${a.cliente}! ✅\n\nSua reserva na Praia do Norte foi APROVADA:\n` +
    `🏐 ${a.quadra}\n📅 ${dataBR}\n⏰ ${a.horaInicio} às ${a.horaFim}\n\n` +
    `💳 O pagamento é feito pessoalmente na arena ou por aqui no WhatsApp.\n\nBom jogo! 🎉`;
  if (!fone) { alert("Reserva confirmada! (cliente sem telefone para WhatsApp)"); return; }
  window.open(`https://wa.me/${fone}?text=${encodeURIComponent(msg)}`, "_blank");
}

export default function AdminPage() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("painel");

  async function sair() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const abas: { id: Aba; label: string }[] = [
    { id: "painel", label: "📊 Painel" },
    { id: "reservas", label: "📋 Reservas" },
    { id: "usuarios", label: "👥 Usuários" },
    { id: "aulas", label: "🎾 Aulas" },
    { id: "avisos", label: "📢 Quadro de Avisos" },
    { id: "noticias", label: "📰 Notícias" },
    { id: "eventos", label: "🎉 Eventos" },
    { id: "teatro", label: "🏆 Torneios" },
    { id: "horarios", label: "🕒 Horários e valores" },
    { id: "bloqueios", label: "🚫 Bloqueios" },
  ];

  return (
    <div className="min-h-screen bg-mar-50">
      <header className="border-b border-mar-100 bg-superficie">
        <div className="flex items-center justify-between px-4 py-3 sm:px-8">
          <Logo />
          <button onClick={sair} className="btn-ghost !px-4 !py-2 text-sm">Sair</button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 sm:px-6">
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={[
                "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition",
                aba === a.id ? "bg-mar-500 text-white" : "text-mar-600 hover:bg-mar-100",
              ].join(" ")}
            >
              {a.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="px-4 py-8 sm:px-8">
        {aba === "painel" && <Painel />}
        {aba === "reservas" && <Reservas />}
        {aba === "usuarios" && <Usuarios />}
        {aba === "aulas" && <AdminAulas />}
        {aba === "avisos" && <Publicacoes tipo="AVISO" titulo="Quadro de Avisos" temDestaque />}
        {aba === "noticias" && <Publicacoes tipo="NOTICIA" titulo="Notícias" />}
        {aba === "eventos" && <Publicacoes tipo="EVENTO" titulo="Eventos" temData />}
        {aba === "teatro" && <Publicacoes tipo="TEATRO" titulo="Torneios" temData />}
        {aba === "horarios" && <Horarios />}
        {aba === "bloqueios" && <Bloqueios />}
      </main>
    </div>
  );
}

/* ----------------------------- PAINEL ----------------------------- */
function Painel() {
  const [data, setData] = useState(hojeISO());
  const [dados, setDados] = useState<any>(null);

  const carregar = useCallback(() => {
    fetch(`/api/admin/dashboard?data=${data}`).then((r) => r.json()).then(setDados);
  }, [data]);

  useEffect(() => { carregar(); }, [carregar]);

  async function mudarStatus(id: number, status: string) {
    await fetch(`/api/admin/agendamentos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    carregar();
  }

  async function confirmar(a: any) {
    const res = await fetch(`/api/admin/agendamentos/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMADO" }),
    });
    const json = await res.json();
    if (!res.ok) { alert(json.erro ?? "Não foi possível confirmar."); return; }
    avisarAprovacaoWhatsApp(a);
    carregar();
  }

  const r = dados?.resumo;
  return (
    <div>
      <QuadrasStatus />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-mar-800">Painel do dia</h1>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="input !w-auto" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat titulo="Reservas no dia" valor={r?.total ?? 0} cor="bg-mar-500" />
        <Stat titulo="Confirmadas" valor={r?.confirmados ?? 0} cor="bg-green-600" />
        <Stat titulo="Pendentes" valor={r?.pendentes ?? 0} cor="bg-sol-500" />
        <Stat titulo="Total geral" valor={r?.totalGeral ?? 0} cor="bg-mar-700" />
      </div>

      <h2 className="mt-8 mb-3 font-semibold text-mar-700">Agenda de {new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")}</h2>
      <div className="space-y-2">
        {dados?.agendamentos?.length ? (
          dados.agendamentos.map((a: any) => (
            <div key={a.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
              <div>
                <span className="font-mono font-bold text-mar-800">{a.horaInicio}–{a.horaFim}</span>
                <span className="ml-3 text-mar-700">{a.cliente}</span>
                <span className="ml-2 text-sm text-mar-400">· {a.quadra}{a.modalidade ? ` · ${a.modalidade}` : ""} · {a.telefone}</span>
                {a.valorTotal != null && <span className="ml-2 text-sm font-bold text-laranja-600">{formatarReais(a.valorTotal)}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${STATUS_CLS[a.status]}`}>{a.status}</span>
                {a.status !== "CONFIRMADO" && (
                  <button onClick={() => confirmar(a)} className="btn-ghost !px-3 !py-1 text-xs">Confirmar</button>
                )}
                {a.status !== "CANCELADO" && (
                  <button onClick={() => mudarStatus(a.id, "CANCELADO")} className="btn-coral !px-3 !py-1 text-xs">Cancelar</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-mar-400">Nenhuma reserva neste dia.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ titulo, valor, cor }: { titulo: string; valor: number; cor: string }) {
  return (
    <div className="card !p-4">
      <div className={`mb-2 h-1 w-10 rounded ${cor}`} />
      <p className="text-3xl font-extrabold text-mar-800">{valor}</p>
      <p className="text-sm text-mar-500">{titulo}</p>
    </div>
  );
}

/* ----------------------------- RESERVAS ----------------------------- */
function Reservas() {
  const [data, setData] = useState("");
  const [quadraId, setQuadraId] = useState("");
  const [status, setStatus] = useState("");
  const [quadras, setQuadras] = useState<any[]>([]);
  const [lista, setLista] = useState<any[]>([]);

  useEffect(() => { fetch("/api/admin/quadras").then((r) => r.json()).then(setQuadras); }, []);

  const carregar = useCallback(() => {
    const p = new URLSearchParams();
    if (data) p.set("data", data);
    if (quadraId) p.set("quadraId", quadraId);
    if (status) p.set("status", status);
    fetch(`/api/admin/agendamentos?${p}`).then((r) => r.json()).then(setLista);
  }, [data, quadraId, status]);

  useEffect(() => { carregar(); }, [carregar]);

  async function acao(id: number, body: any) {
    const res = await fetch(`/api/admin/agendamentos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro ?? "Não foi possível atualizar.");
      return;
    }
    carregar();
  }
  async function confirmar(a: any) {
    const res = await fetch(`/api/admin/agendamentos/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMADO" }),
    });
    const json = await res.json();
    if (!res.ok) { alert(json.erro ?? "Não foi possível confirmar."); return; }
    avisarAprovacaoWhatsApp(a);
    carregar();
  }
  async function excluir(id: number) {
    if (!confirm("Excluir definitivamente esta reserva?")) return;
    await fetch(`/api/admin/agendamentos/${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-mar-800">Reservas</h1>

      <div className="card mt-4 flex flex-wrap gap-3">
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="input !w-auto" />
        <select value={quadraId} onChange={(e) => setQuadraId(e.target.value)} className="input !w-auto">
          <option value="">Todas as quadras</option>
          {quadras.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto">
          <option value="">Todos os status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
        <button onClick={() => { setData(""); setQuadraId(""); setStatus(""); }} className="btn-ghost">Limpar</button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-mar-400">
              <th className="p-2">Data</th><th className="p-2">Horário</th><th className="p-2">Quadra</th>
              <th className="p-2">Modalidade</th><th className="p-2">Cliente</th><th className="p-2">Telefone</th><th className="p-2">Valor</th><th className="p-2">Status</th><th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((a) => (
              <tr key={a.id} className="border-t border-mar-100">
                <td className="p-2">{new Date(`${a.data}T00:00:00`).toLocaleDateString("pt-BR")}</td>
                <td className="p-2 font-mono">{a.horaInicio}–{a.horaFim}</td>
                <td className="p-2">{a.quadra}</td>
                <td className="p-2">{a.modalidade ?? "—"}</td>
                <td className="p-2">{a.cliente}</td>
                <td className="p-2">{a.telefone}</td>
                <td className="whitespace-nowrap p-2 font-semibold">{a.valorTotal != null ? formatarReais(a.valorTotal) : "—"}</td>
                <td className="p-2"><span className={`badge ${STATUS_CLS[a.status]}`}>{a.status}</span></td>
                <td className="p-2">
                  <div className="flex gap-1">
                    {a.status !== "CONFIRMADO" && <button onClick={() => confirmar(a)} className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">✓</button>}
                    {a.status !== "CANCELADO" && <button onClick={() => acao(a.id, { status: "CANCELADO" })} className="rounded bg-coral-500/20 px-2 py-1 text-xs text-coral-500">✖</button>}
                    <button onClick={() => excluir(a.id)} className="rounded bg-mar-100 px-2 py-1 text-xs text-mar-600">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {!lista.length && <tr><td colSpan={9} className="p-6 text-center text-mar-400">Nenhuma reserva encontrada.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------- USUÁRIOS ----------------------------- */
const STATUS_USER_CLS: Record<string, string> = {
  PENDENTE: "bg-sol-500/20 text-sol-600",
  APROVADO: "bg-green-100 text-green-700",
  REJEITADO: "bg-coral-500/20 text-coral-500",
};

function Usuarios() {
  const [filtro, setFiltro] = useState("PENDENTE");
  const [lista, setLista] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [processando, setProcessando] = useState<number | null>(null);
  const [detalhe, setDetalhe] = useState<any | null>(null);

  const carregar = useCallback(() => {
    const q = filtro ? `?status=${filtro}` : "";
    fetch(`/api/admin/usuarios${q}`).then((r) => r.json()).then(setLista);
  }, [filtro]);
  useEffect(() => { carregar(); }, [carregar]);

  async function acao(id: number, acao: "aprovar" | "rejeitar") {
    setProcessando(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });
      const json = await res.json();
      if (acao === "aprovar") {
        if (json.email?.ok) setMsg("✅ Usuário aprovado e e-mail enviado!");
        else if (json.email?.simulado) setMsg("✅ Usuário aprovado. ⚠️ E-mail SIMULADO (configure o Brevo no .env para enviar de verdade).");
        else setMsg(`✅ Usuário aprovado. ⚠️ Falha ao enviar e-mail: ${json.email?.erro ?? "verifique o Brevo"}`);
      } else {
        setMsg("Usuário rejeitado.");
      }
      setDetalhe(null);
      carregar();
    } finally {
      setProcessando(null);
    }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este usuário?")) return;
    await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
    setDetalhe(null);
    carregar();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-mar-800">Usuários / Cadastros</h1>
      <p className="mt-1 text-mar-500">Aprove os cadastros — o cliente recebe um e-mail ao ser aprovado.</p>

      <div className="card mt-4 flex flex-wrap gap-2">
        {[
          { v: "PENDENTE", l: "Pendentes" },
          { v: "APROVADO", l: "Aprovados" },
          { v: "REJEITADO", l: "Rejeitados" },
          { v: "", l: "Todos" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFiltro(f.v)}
            className={filtro === f.v ? "btn-primary !px-4 !py-2 text-sm" : "btn-ghost !px-4 !py-2 text-sm"}
          >
            {f.l}
          </button>
        ))}
      </div>

      {msg && <p className="mt-4 rounded-lg bg-mar-100 px-4 py-3 text-sm text-mar-700">{msg}</p>}

      <div className="mt-4 space-y-2">
        {lista.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setDetalhe(u)}
            className="card flex w-full flex-wrap items-center justify-between gap-3 !p-4 text-left transition hover:ring-2 hover:ring-mar-200"
          >
            <div className="flex items-center gap-3">
              <Avatar foto={u.fotoUrl} nome={u.nome} />
              <div>
                <p className="font-bold text-mar-800">{u.nome}</p>
                <p className="text-sm text-mar-500">{u.email} · {u.telefone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${STATUS_USER_CLS[u.status]}`}>{u.status}</span>
              <span className="text-xs text-mar-400">ver dados ›</span>
            </div>
          </button>
        ))}
        {!lista.length && <p className="text-mar-400">Nenhum usuário neste filtro.</p>}
      </div>

      {/* Painel de detalhes do usuário */}
      {detalhe && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-mar-900/40 p-0 sm:items-center sm:p-4"
          onClick={() => setDetalhe(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-superficie p-6 shadow-suave sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar foto={detalhe.fotoUrl} nome={detalhe.nome} size={56} />
                <div>
                  <h2 className="text-xl font-bold text-mar-800">{detalhe.nome}</h2>
                  <span className={`badge mt-1 ${STATUS_USER_CLS[detalhe.status]}`}>{detalhe.status}</span>
                </div>
              </div>
              <button onClick={() => setDetalhe(null)} className="grid h-9 w-9 place-items-center rounded-lg text-mar-500 hover:bg-mar-50">✕</button>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <Campo rotulo="CPF" valor={detalhe.cpf ? formatarCpf(detalhe.cpf) : "—"} />
              <Campo rotulo="E-mail" valor={detalhe.email} />
              <Campo rotulo="Telefone / WhatsApp" valor={detalhe.telefone} />
              <Campo rotulo="Reservas feitas" valor={String(detalhe._count?.agendamentos ?? 0)} />
              <Campo rotulo="Cadastrado em" valor={formatarDataHora(detalhe.criadoEm)} />
              <Campo rotulo="Aprovado em" valor={detalhe.aprovadoEm ? formatarDataHora(detalhe.aprovadoEm) : "—"} />
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${detalhe.telefone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost !py-2 text-sm"
              >
                💬 WhatsApp
              </a>
              <a href={`mailto:${detalhe.email}`} className="btn-ghost !py-2 text-sm">✉️ E-mail</a>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-mar-100 pt-4">
              {detalhe.status !== "APROVADO" && (
                <button
                  disabled={processando === detalhe.id}
                  onClick={() => acao(detalhe.id, "aprovar")}
                  className="btn-primary flex-1 !py-2 text-sm"
                >
                  {processando === detalhe.id ? "…" : "✓ Aprovar"}
                </button>
              )}
              {detalhe.status !== "REJEITADO" && (
                <button
                  disabled={processando === detalhe.id}
                  onClick={() => acao(detalhe.id, "rejeitar")}
                  className="btn-ghost flex-1 !py-2 text-sm"
                >
                  Rejeitar
                </button>
              )}
              <button onClick={() => excluir(detalhe.id)} className="btn-coral !py-2 text-sm">🗑 Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ foto, nome, size = 40 }: { foto?: string | null; nome: string; size?: number }) {
  const iniciais = nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-mar-100 font-semibold text-mar-600 ring-1 ring-mar-200"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto} alt={nome} className="h-full w-full object-cover" />
      ) : (
        iniciais || "?"
      )}
    </span>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-mar-100 pb-2 last:border-0">
      <dt className="text-mar-500">{rotulo}</dt>
      <dd className="text-right font-medium text-mar-800">{valor}</dd>
    </div>
  );
}

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* ----------------------------- QUADRAS (ativar/desativar) ----------------------------- */
function QuadrasStatus() {
  const [lista, setLista] = useState<any[]>([]);
  const [processando, setProcessando] = useState<number | null>(null);

  const carregar = useCallback(() => {
    fetch("/api/admin/quadras").then((r) => r.json()).then(setLista);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function toggle(q: any) {
    setProcessando(q.id);
    try {
      await fetch(`/api/admin/quadras/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativa: !q.ativa }),
      });
      carregar();
    } finally {
      setProcessando(null);
    }
  }

  if (!lista.length) return null;

  return (
    <div className="card mb-6 !p-4">
      <p className="mb-3 text-sm font-semibold text-mar-700">Quadras</p>
      <div className="flex flex-wrap gap-2">
        {lista.map((q) => (
          <div
            key={q.id}
            className="flex items-center gap-2 rounded-xl border border-mar-100 px-3 py-2"
          >
            <span className="font-medium text-mar-800">{q.nome}</span>
            <span className={`badge ${q.ativa ? "bg-green-100 text-green-700" : "bg-mar-100 text-mar-500"}`}>
              {q.ativa ? "Ativa" : "Inativa"}
            </span>
            <button
              onClick={() => toggle(q)}
              disabled={processando === q.id}
              className={q.ativa ? "btn-ghost !px-3 !py-1 text-xs" : "btn-primary !px-3 !py-1 text-xs"}
            >
              {processando === q.id ? "…" : q.ativa ? "Desativar" : "Ativar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- HORÁRIOS ----------------------------- */
function Horarios() {
  const [lista, setLista] = useState<any[]>([]);
  const [valorPadrao, setValorPadrao] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/horarios").then((r) => r.json()).then((dados) => {
      // Garante os 7 dias mesmo que falte algum
      const completos = Array.from({ length: 7 }, (_, dia) => {
        const existente = dados.find((h: any) => h.diaSemana === dia);
        const h = existente ?? { diaSemana: dia, horaInicio: "07:00", horaFim: "22:00", ativo: false, valorHora: null };
        // O campo de valor é texto no formulário ("50,00")
        return { ...h, valorHora: h.valorHora == null ? "" : String(h.valorHora).replace(".", ",") };
      });
      setLista(completos);
    });
  }, []);

  function atualizar(dia: number, campo: string, valor: any) {
    setLista((l) => l.map((h) => (h.diaSemana === dia ? { ...h, [campo]: valor } : h)));
  }

  function aplicarATodos() {
    setLista((l) => l.map((h) => (h.ativo ? { ...h, valorHora: valorPadrao } : h)));
  }

  async function salvar() {
    const res = await fetch("/api/admin/horarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horarios: lista }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMsg({ ok: false, texto: j.erro ?? "Não foi possível salvar." });
      return;
    }
    setMsg({ ok: true, texto: "Horários e valores salvos!" });
    setTimeout(() => setMsg(null), 2500);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-mar-800">Horários e valores</h1>
      <p className="mt-1 text-mar-500">
        Defina o funcionamento e o valor da hora de quadra para cada dia da semana. Dia sem valor aparece como
        &quot;a combinar&quot; para o cliente.
      </p>

      {/* Atalho: mesmo valor para todos os dias abertos */}
      <div className="card mt-4 flex flex-wrap items-end gap-3 !py-4">
        <div>
          <label className="label">Valor padrão da hora</label>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-mar-600">R$</span>
            <input
              inputMode="decimal"
              value={valorPadrao}
              onChange={(e) => setValorPadrao(e.target.value)}
              placeholder="45,00"
              className="input !w-32"
            />
          </div>
        </div>
        <button type="button" onClick={aplicarATodos} className="btn-ghost">Aplicar a todos os dias abertos</button>
        <p className="w-full text-xs text-mar-400 sm:w-auto">Depois ajuste os dias com preço diferente, como a sexta.</p>
      </div>

      <div className="card mt-4 space-y-2">
        {lista.map((h) => (
          <div key={h.diaSemana} className="flex flex-wrap items-center gap-3 border-b border-mar-100 py-2 last:border-0">
            <label className="flex w-32 items-center gap-2 font-medium text-mar-700">
              <input type="checkbox" checked={h.ativo} onChange={(e) => atualizar(h.diaSemana, "ativo", e.target.checked)} />
              {NOMES_DIAS[h.diaSemana]}
            </label>
            <input type="time" value={h.horaInicio} disabled={!h.ativo} onChange={(e) => atualizar(h.diaSemana, "horaInicio", e.target.value)} className="input !w-auto disabled:opacity-40" />
            <span className="text-mar-400">até</span>
            <input type="time" value={h.horaFim} disabled={!h.ativo} onChange={(e) => atualizar(h.diaSemana, "horaFim", e.target.value)} className="input !w-auto disabled:opacity-40" />
            <div className="flex items-center gap-2 sm:ml-6">
              <span className="font-semibold text-mar-600">R$</span>
              <input
                inputMode="decimal"
                value={h.valorHora}
                disabled={!h.ativo}
                onChange={(e) => atualizar(h.diaSemana, "valorHora", e.target.value)}
                placeholder="a combinar"
                aria-label={`Valor da hora de ${NOMES_DIAS[h.diaSemana]}`}
                className="input !w-32 disabled:opacity-40"
              />
              <span className="text-sm text-mar-400">por hora</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={salvar} className="btn-primary">Salvar horários e valores</button>
        {msg && <span className={msg.ok ? "text-green-600" : "text-coral-500"}>{msg.texto}</span>}
      </div>
    </div>
  );
}

/* ----------------------------- BLOQUEIOS ----------------------------- */
function Bloqueios() {
  const [lista, setLista] = useState<any[]>([]);
  const [quadras, setQuadras] = useState<any[]>([]);
  const [form, setForm] = useState({ data: hojeISO(), quadraId: "", horaInicio: "", horaFim: "", motivo: "" });

  const carregar = useCallback(() => {
    fetch("/api/admin/bloqueios").then((r) => r.json()).then(setLista);
  }, []);
  useEffect(() => {
    carregar();
    fetch("/api/admin/quadras").then((r) => r.json()).then(setQuadras);
  }, [carregar]);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/bloqueios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: form.data,
        quadraId: form.quadraId || null,
        horaInicio: form.horaInicio || null,
        horaFim: form.horaFim || null,
        motivo: form.motivo,
      }),
    });
    setForm({ ...form, horaInicio: "", horaFim: "", motivo: "" });
    carregar();
  }
  async function excluir(id: number) {
    await fetch(`/api/admin/bloqueios/${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-mar-800">Bloqueios</h1>
      <p className="mt-1 text-mar-500">Bloqueie datas/horários para feriados, manutenção ou eventos.</p>

      <form onSubmit={criar} className="card mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Data</label>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="input" required />
        </div>
        <div>
          <label className="label">Quadra</label>
          <select value={form.quadraId} onChange={(e) => setForm({ ...form, quadraId: e.target.value })} className="input">
            <option value="">Todas as quadras</option>
            {quadras.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Hora início (vazio = dia inteiro)</label>
          <input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Hora fim</label>
          <input type="time" value={form.horaFim} onChange={(e) => setForm({ ...form, horaFim: e.target.value })} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Motivo</label>
          <input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} className="input" placeholder="Ex: Feriado, manutenção, evento privado" />
        </div>
        <button className="btn-primary sm:col-span-2">Adicionar bloqueio</button>
      </form>

      <div className="mt-6 space-y-2">
        {lista.map((b) => (
          <div key={b.id} className="card flex items-center justify-between !p-4">
            <div>
              <span className="font-semibold text-mar-800">{new Date(`${b.data}T00:00:00`).toLocaleDateString("pt-BR")}</span>
              <span className="ml-2 text-sm text-mar-500">
                {b.horaInicio ? `${b.horaInicio}–${b.horaFim}` : "Dia inteiro"} · {b.quadra}
              </span>
              {b.motivo && <span className="ml-2 text-sm text-mar-400">· {b.motivo}</span>}
            </div>
            <button onClick={() => excluir(b.id)} className="btn-coral !px-3 !py-1 text-xs">Remover</button>
          </div>
        ))}
        {!lista.length && <p className="text-mar-400">Nenhum bloqueio cadastrado.</p>}
      </div>
    </div>
  );
}

/* ----------------------------- PUBLICAÇÕES (Avisos/Notícias/Eventos/Teatro) ----------------------------- */
function Publicacoes({
  tipo,
  titulo,
  temData = false,
  temDestaque = false,
}: {
  tipo: "AVISO" | "NOTICIA" | "EVENTO" | "TEATRO";
  titulo: string;
  temData?: boolean;
  temDestaque?: boolean;
}) {
  const [lista, setLista] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    titulo: "", resumo: "", conteudo: "", local: "", dataEvento: "", destaque: temDestaque, publicado: true,
  });
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const carregar = useCallback(() => {
    fetch(`/api/admin/publicacoes?tipo=${tipo}`).then((r) => r.json()).then(setLista);
  }, [tipo]);
  useEffect(() => { carregar(); }, [carregar]);

  function limpar() {
    setEditId(null);
    setForm({ titulo: "", resumo: "", conteudo: "", local: "", dataEvento: "", destaque: temDestaque, publicado: true });
  }

  function editar(p: any) {
    setEditId(p.id);
    setForm({
      titulo: p.titulo ?? "",
      resumo: p.resumo ?? "",
      conteudo: p.conteudo ?? "",
      local: p.local ?? "",
      dataEvento: p.dataEvento ? new Date(p.dataEvento).toISOString().slice(0, 16) : "",
      destaque: p.destaque,
      publicado: p.publicado,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.resumo.trim()) { setMsg("Preencha título e resumo."); return; }
    setSalvando(true);
    setMsg(null);
    try {
      const body = { ...form, tipo, dataEvento: form.dataEvento || null };
      const url = editId ? `/api/admin/publicacoes/${editId}` : "/api/admin/publicacoes";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const j = await res.json().catch(() => ({})); setMsg(j.erro ?? "Erro ao salvar."); return; }
      limpar();
      setMsg(editId ? "Publicação atualizada!" : "Publicação criada!");
      carregar();
      setTimeout(() => setMsg(null), 2500);
    } finally {
      setSalvando(false);
    }
  }

  async function togglePublicado(p: any) {
    await fetch(`/api/admin/publicacoes/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicado: !p.publicado }),
    });
    carregar();
  }
  async function toggleDestaque(p: any) {
    await fetch(`/api/admin/publicacoes/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destaque: !p.destaque }),
    });
    carregar();
  }
  async function excluir(id: number) {
    if (!confirm("Remover esta publicação?")) return;
    await fetch(`/api/admin/publicacoes/${id}`, { method: "DELETE" });
    if (editId === id) limpar();
    carregar();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-mar-800">{titulo}</h1>

      {/* Formulário */}
      <form onSubmit={salvar} className="card mt-4 space-y-3">
        <h2 className="font-semibold text-mar-700">{editId ? "Editar publicação" : "Nova publicação"}</h2>
        <div>
          <label className="label">Título *</label>
          <input className="input" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        </div>
        <div>
          <label className="label">Resumo * (aparece no card)</label>
          <input className="input" value={form.resumo} onChange={(e) => setForm({ ...form, resumo: e.target.value })} />
        </div>
        <div>
          <label className="label">Conteúdo completo (opcional)</label>
          <textarea className="input min-h-[80px]" value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Local (opcional)</label>
            <input className="input" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} placeholder="Ex: Quadra 1" />
          </div>
          {temData && (
            <div>
              <label className="label">Data e hora do evento</label>
              <input type="datetime-local" className="input" value={form.dataEvento} onChange={(e) => setForm({ ...form, dataEvento: e.target.value })} />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          {temDestaque && (
            <label className="flex items-center gap-2 text-sm text-mar-700">
              <input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} />
              Destacar no Quadro de Avisos
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-mar-700">
            <input type="checkbox" checked={form.publicado} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} />
            Publicado (visível no site)
          </label>
        </div>
        {msg && <p className="rounded-lg bg-mar-100 px-4 py-2 text-sm text-mar-700">{msg}</p>}
        <div className="flex gap-2">
          <button disabled={salvando} className="btn-primary">{salvando ? "Salvando…" : editId ? "Salvar alterações" : "Publicar"}</button>
          {editId && <button type="button" onClick={limpar} className="btn-ghost">Cancelar</button>}
        </div>
      </form>

      {/* Lista */}
      <div className="mt-6 space-y-2">
        {lista.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-mar-800">{p.titulo}</span>
                {!p.publicado && <span className="badge bg-mar-100 text-mar-500">Rascunho</span>}
                {p.destaque && <span className="badge bg-laranja-100 text-laranja-600">Destaque</span>}
              </div>
              <p className="text-sm text-mar-500">{p.resumo}</p>
              {(p.local || p.dataEvento) && (
                <p className="mt-0.5 text-xs text-mar-400">
                  {p.dataEvento && `🗓️ ${new Date(p.dataEvento).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`}
                  {p.local && `  📍 ${p.local}`}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <button onClick={() => togglePublicado(p)} className="btn-ghost !px-3 !py-1 text-xs">{p.publicado ? "Despublicar" : "Publicar"}</button>
              {temDestaque && <button onClick={() => toggleDestaque(p)} className="btn-ghost !px-3 !py-1 text-xs">{p.destaque ? "Tirar destaque" : "Destacar"}</button>}
              <button onClick={() => editar(p)} className="btn-primary !px-3 !py-1 text-xs">Editar</button>
              <button onClick={() => excluir(p.id)} className="btn-coral !px-3 !py-1 text-xs">🗑</button>
            </div>
          </div>
        ))}
        {!lista.length && <p className="text-mar-400">Nenhuma publicação cadastrada.</p>}
      </div>
    </div>
  );
}
