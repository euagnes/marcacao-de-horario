"use client";

import { useState } from "react";
import { classesPoster } from "@/lib/aulas";
import { linkWhatsApp } from "@/lib/config";

export interface TurmaOpcao {
  id: number;
  modalidade: string; // slug da modalidade
  rotulo: string; // ex: "Seg e Qua · 18:00–19:00 · Iniciante"
}

export interface ModalidadeOpcao {
  slug: string;
  nome: string;
  cor: string;
}

/** Inscrição em aula experimental: monta a mensagem e abre a conversa no WhatsApp. */
export default function FormAulaExperimental({
  modalidadeInicial,
  modalidades,
  turmas = [],
}: {
  modalidadeInicial?: string;
  modalidades: ModalidadeOpcao[];
  turmas?: TurmaOpcao[];
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [idade, setIdade] = useState("");
  const [modalidade, setModalidade] = useState(
    modalidades.find((m) => m.slug === modalidadeInicial)?.nome ?? ""
  );
  const [turma, setTurma] = useState("");
  const [nivel, setNivel] = useState("Nunca joguei");
  const [periodo, setPeriodo] = useState("Noite");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const modalidadeSlug = modalidades.find((m) => m.nome === modalidade)?.slug;
  const turmasDaModalidade = turmas.filter((t) => t.modalidade === modalidadeSlug);

  function escolherModalidade(nomeModalidade: string) {
    setModalidade(nomeModalidade);
    setTurma("");
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const idadeNum = Number(idade);
    if (!nome.trim() || !telefone.trim() || !idade.trim() || !modalidade) {
      setErro("Preencha nome, WhatsApp, idade e modalidade.");
      return;
    }
    if (!Number.isInteger(idadeNum) || idadeNum < 3 || idadeNum > 100) {
      setErro("Informe uma idade válida.");
      return;
    }
    setErro(null);
    const msg =
      `Olá, Praia do Norte! 🌴 Quero agendar uma *aula experimental*.\n\n` +
      `👤 Nome: ${nome.trim()}\n` +
      `📞 Telefone: ${telefone.trim()}\n` +
      `🎂 Idade: ${idadeNum}\n` +
      `🏐 Modalidade: ${modalidade}\n` +
      (turma ? `📅 Turma de interesse: ${turma}\n` : "") +
      `📈 Nível: ${nivel}\n` +
      `🕒 Melhor período: ${periodo}\n` +
      (observacoes.trim() ? `📝 Obs: ${observacoes.trim()}\n` : "") +
      `\nQuais horários vocês têm disponíveis?`;
    window.open(linkWhatsApp(msg), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={enviar} className="card space-y-4 !rounded-[28px] sm:!p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Nome completo *</label>
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" required />
        </div>
        <div>
          <label className="label">WhatsApp *</label>
          <input
            className="input"
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(32) 99999-9999"
            required
          />
        </div>
        <div>
          <label className="label">Idade *</label>
          <input
            className="input"
            type="number"
            min={3}
            max={100}
            inputMode="numeric"
            value={idade}
            onChange={(e) => setIdade(e.target.value)}
            placeholder="Ex: 28"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Modalidade *</label>
        <div className="grid grid-cols-2 gap-2">
          {modalidades.map((m) => (
            <button
              key={m.slug}
              type="button"
              onClick={() => escolherModalidade(m.nome)}
              className={[
                "rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition",
                modalidade === m.nome
                  ? `border-transparent ${classesPoster(m.cor)} scale-[1.02] shadow-soft`
                  : "border-nuvem-200 text-mar-700 hover:border-mar-300",
              ].join(" ")}
            >
              {m.nome}
            </button>
          ))}
        </div>
      </div>

      {turmasDaModalidade.length > 0 && (
        <div>
          <label className="label">Turma de interesse (opcional)</label>
          <select className="input" value={turma} onChange={(e) => setTurma(e.target.value)}>
            <option value="">Ainda não sei / quero sugestões</option>
            {turmasDaModalidade.map((t) => (
              <option key={t.id} value={t.rotulo}>{t.rotulo}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Seu nível</label>
          <select className="input" value={nivel} onChange={(e) => setNivel(e.target.value)}>
            <option>Nunca joguei</option>
            <option>Iniciante</option>
            <option>Intermediário</option>
            <option>Avançado</option>
          </select>
        </div>
        <div>
          <label className="label">Melhor período</label>
          <select className="input" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option>Manhã</option>
            <option>Tarde</option>
            <option>Noite</option>
            <option>Fim de semana</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Observações (opcional)</label>
        <textarea
          className="input min-h-[80px]"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Ex: quero fazer com um amigo, tenho alguma lesão…"
        />
      </div>

      {erro && <p className="rounded-lg bg-coral-500/10 px-4 py-2 text-sm text-coral-500">{erro}</p>}

      <button type="submit" className="btn-laranja w-full rounded-full text-base">
        Enviar e abrir o WhatsApp
      </button>
      <p className="text-center text-xs text-mar-400">
        A conversa abre com seus dados já preenchidos. É só enviar.
      </p>
    </form>
  );
}
