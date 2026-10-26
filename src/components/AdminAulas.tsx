"use client";

import { useEffect, useState, useCallback } from "react";
import { CORES_POSTER, ILUSTRACOES, classesPoster } from "@/lib/aulas";
import { Bola } from "@/components/Ilustracoes";

/* ----------------------------- AULAS: modalidades ----------------------------- */
interface ModalidadeAdmin {
  id: number;
  slug: string;
  nome: string;
  publico: string;
  resumo: string;
  descricao: string;
  beneficios: string[];
  cor: string;
  icone: string;
  ordem: number;
  ativa: boolean;
}

export default function AdminAulas() {
  const [modalidades, setModalidades] = useState<ModalidadeAdmin[]>([]);

  const carregarModalidades = useCallback(() => {
    fetch("/api/admin/modalidades").then((r) => r.json()).then(setModalidades);
  }, []);
  useEffect(() => { carregarModalidades(); }, [carregarModalidades]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-mar-800">Aulas</h1>
      <p className="mt-1 text-sm text-mar-500">
        As modalidades que aparecem na página de aulas e na home.
      </p>

      <Modalidades
        lista={modalidades}
        aoMudar={carregarModalidades}
      />
    </div>
  );
}

/* ----------------------------- MODALIDADES ----------------------------- */
const MODALIDADE_VAZIA = {
  nome: "", publico: "", resumo: "", descricao: "", beneficios: "",
  cor: "mar", icone: "volei-de-praia", ordem: 0, ativa: true,
};

function Modalidades({
  lista, aoMudar,
}: {
  lista: ModalidadeAdmin[];
  aoMudar: () => void;
}) {
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(MODALIDADE_VAZIA);
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function nova() {
    setEditId(null);
    setForm({ ...MODALIDADE_VAZIA, ordem: (lista.at(-1)?.ordem ?? 0) + 1 });
    setAberto(true);
    setMsg(null);
  }
  function fechar() {
    setEditId(null);
    setForm(MODALIDADE_VAZIA);
    setAberto(false);
  }
  function editar(m: ModalidadeAdmin) {
    setEditId(m.id);
    setForm({ ...m, beneficios: m.beneficios.join("\n") });
    setAberto(true);
    setMsg(null);
    document.getElementById("form-modalidade")?.scrollIntoView({ behavior: "smooth" });
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setMsg(null);
    try {
      const res = await fetch(editId ? `/api/admin/modalidades/${editId}` : "/api/admin/modalidades", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); setMsg(j.erro ?? "Erro ao salvar."); return; }
      setMsg(editId ? "Modalidade atualizada!" : "Modalidade criada!");
      fechar();
      aoMudar();
      setTimeout(() => setMsg(null), 2500);
    } finally {
      setSalvando(false);
    }
  }

  async function toggleAtiva(m: ModalidadeAdmin) {
    await fetch(`/api/admin/modalidades/${m.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativa: !m.ativa }),
    });
    aoMudar();
  }
  async function excluir(m: ModalidadeAdmin) {
    if (!confirm(`Remover "${m.nome}"? Isso não pode ser desfeito.`)) return;
    await fetch(`/api/admin/modalidades/${m.id}`, { method: "DELETE" });
    if (editId === m.id) fechar();
    aoMudar();
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-mar-800">Modalidades</h2>
        {!aberto && <button onClick={nova} className="btn-primary !py-2 text-sm">Nova modalidade</button>}
      </div>
      {msg && !aberto && <p className="mt-3 rounded-lg bg-mar-100 px-4 py-2 text-sm text-mar-700">{msg}</p>}

      {/* Lista */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {lista.map((m) => {
          return (
            <div key={m.id} className={`card flex items-center gap-4 !p-4 ${m.ativa ? "" : "opacity-60"}`}>
              <div className={`relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl ${classesPoster(m.cor)}`}>
                <Bola tipo={m.icone} className="h-12 w-12" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-mar-900">{m.nome}</span>
                  {!m.ativa && <span className="badge bg-coral-500/20 text-coral-500">Oculta no site</span>}
                </div>
                <p className="truncate text-sm text-mar-500">{m.resumo}</p>
                <p className="text-xs text-mar-400">{m.ativa ? `Posição ${m.ordem}` : "Não aparece no site. Clique em Mostrar para publicar."}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button onClick={() => editar(m)} className="btn-primary !px-3 !py-1 text-xs">Editar</button>
                <button onClick={() => toggleAtiva(m)} className="btn-ghost !px-3 !py-1 text-xs">{m.ativa ? "Ocultar" : "Mostrar"}</button>
                <button onClick={() => excluir(m)} className="btn-coral !px-3 !py-1 text-xs">Excluir</button>
              </div>
            </div>
          );
        })}
        {!lista.length && <p className="text-sm text-mar-400">Nenhuma modalidade cadastrada. Crie a primeira.</p>}
      </div>

      {/* Formulário com prévia */}
      {aberto && (
        <form id="form-modalidade" onSubmit={salvar} className="card mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <h3 className="font-semibold text-mar-700">{editId ? `Editar ${form.nome || "modalidade"}` : "Nova modalidade"}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Nome *</label>
                <input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Beach Tennis" />
              </div>
              <div>
                <label className="label">Para quem é</label>
                <input className="input" value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })} placeholder="Ex: Iniciantes ao avançado" />
              </div>
            </div>
            <div>
              <label className="label">Frase de destaque *</label>
              <input className="input" value={form.resumo} onChange={(e) => setForm({ ...form, resumo: e.target.value })} placeholder="Ex: Dá pra começar sem nunca ter pegado numa raquete." />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea className="input min-h-[80px]" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Como é a aula, o que se aprende…" />
            </div>
            <div>
              <label className="label">Destaques (um por linha)</label>
              <textarea className="input min-h-[90px]" value={form.beneficios} onChange={(e) => setForm({ ...form, beneficios: e.target.value })} placeholder={"Turmas por nível\nJogos no fim da aula"} />
            </div>

            <div>
              <label className="label">Cor do bloco</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CORES_POSTER).map(([chave, c]) => (
                  <button
                    key={chave}
                    type="button"
                    onClick={() => setForm({ ...form, cor: chave })}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ring-offset-2 ring-offset-superficie transition ${c.classes} ${form.cor === chave ? "ring-2 ring-mar-900" : ""}`}
                  >
                    {c.nome}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Ilustração</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ILUSTRACOES).map(([chave, nome]) => (
                  <button
                    key={chave}
                    type="button"
                    title={nome}
                    aria-label={nome}
                    onClick={() => setForm({ ...form, icone: chave })}
                    className={`grid h-14 w-14 place-items-center rounded-xl bg-nuvem-100 transition ${form.icone === chave ? "ring-2 ring-laranja-500" : "hover:bg-nuvem-200"}`}
                  >
                    <Bola tipo={chave} className="h-10 w-10" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="label">Posição</label>
                <input type="number" className="input !w-24" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 pb-3 text-sm text-mar-700">
                <input type="checkbox" checked={form.ativa} onChange={(e) => setForm({ ...form, ativa: e.target.checked })} />
                Visível no site
              </label>
            </div>

            {msg && <p className="rounded-lg bg-mar-100 px-4 py-2 text-sm text-mar-700">{msg}</p>}
            <div className="flex gap-2">
              <button disabled={salvando} className="btn-primary">{salvando ? "Salvando…" : editId ? "Salvar alterações" : "Criar modalidade"}</button>
              <button type="button" onClick={fechar} className="btn-ghost">Cancelar</button>
            </div>
          </div>

          {/* Prévia de como o bloco aparece no site */}
          <div>
            <p className="label">Prévia</p>
            <div className={`relative isolate flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[28px] p-6 ${classesPoster(form.cor)}`}>
              <Bola tipo={form.icone} className="absolute -bottom-8 -right-8 -z-10 h-40 w-40" />
              <p className="text-xs font-bold opacity-80">{form.publico || "Para quem é"}</p>
              <div>
                <p className="titulo-poster max-w-[9ch] text-5xl">{form.nome || "Nome"}</p>
                <p className="mt-3 max-w-[22ch] text-sm font-medium opacity-90">{form.resumo || "Frase de destaque"}</p>
              </div>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
