"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Calendario from "@/components/Calendario";
import { dataLimiteAgendamento } from "@/lib/horarios";
import { linkWhatsApp } from "@/lib/config";

interface Quadra {
  id: number;
  nome: string;
  descricao: string | null;
}
interface Slot {
  hora: string;
  fim: string;
  disponivel: boolean;
  motivo?: string;
}
interface Confirmacao {
  codigo: string;
  nome: string;
  quadra: string;
  modalidade?: string;
  data: string;
  horaInicio: string;
  horaFim: string;
}

function dataLegivel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function AgendarPage() {
  const router = useRouter();
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [quadraId, setQuadraId] = useState<number | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [carregandoSlots, setCarregandoSlots] = useState(false);

  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState<1 | 2>(1);

  const [modalidade, setModalidade] = useState("");
  const [modalidadeOutro, setModalidadeOutro] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [usuario, setUsuario] = useState<{ nome: string; email: string; telefone: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);

  // Carrega quadras e o usuário logado
  useEffect(() => {
    fetch("/api/quadras")
      .then((r) => r.json())
      .then((qs: Quadra[]) => {
        setQuadras(qs);
        if (qs[0]) setQuadraId(qs[0].id);
      });
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u) {
          // Sessão inválida/ausente: volta para o login
          router.replace("/login?redirect=/agendar");
          return;
        }
        setUsuario(u);
      });
  }, [router]);

  // Carrega disponibilidade quando data + quadra mudam
  const carregarSlots = useCallback(() => {
    if (!data || !quadraId) return;
    setCarregandoSlots(true);
    setHoraSelecionada(null);
    fetch(`/api/disponibilidade?data=${data}&quadraId=${quadraId}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .finally(() => setCarregandoSlots(false));
  }, [data, quadraId]);

  useEffect(() => {
    carregarSlots();
  }, [carregarSlots]);

  // Verifica se é possível reservar 2 horas a partir de uma hora
  function podeDuasHoras(hora: string): boolean {
    const idx = slots.findIndex((s) => s.hora === hora);
    return idx >= 0 && idx + 1 < slots.length && slots[idx + 1].disponivel;
  }

  function selecionarHora(s: Slot) {
    if (!s.disponivel) return;
    setHoraSelecionada(s.hora);
    if (quantidade === 2 && !podeDuasHoras(s.hora)) setQuantidade(1);
  }

  const horaFimSelecionada = (() => {
    if (!horaSelecionada) return null;
    const idx = slots.findIndex((s) => s.hora === horaSelecionada);
    if (idx < 0) return null;
    return quantidade === 2 ? slots[idx + 1]?.fim : slots[idx].fim;
  })();

  const modalidadeFinal = modalidade === "Outro" ? modalidadeOutro.trim() : modalidade;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!data || !quadraId || !horaSelecionada) {
      setErro("Escolha data, quadra e horário.");
      return;
    }
    if (!modalidadeFinal) {
      setErro("Escolha a modalidade.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modalidade: modalidadeFinal,
          observacoes,
          data,
          quadraId,
          horaInicio: horaSelecionada,
          quantidade,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Erro ao agendar.");
        carregarSlots();
        return;
      }
      setConfirmacao(json.agendamento);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  // ---- Tela de confirmação ----
  if (confirmacao) {
    const msg = `Olá! Confirmei minha reserva na ${confirmacao.quadra} em ${dataLegivel(
      confirmacao.data
    )}, das ${confirmacao.horaInicio} às ${confirmacao.horaFim}. Código: ${confirmacao.codigo}`;
    return (
      <>
        <Header />
        <main className="mx-auto max-w-xl px-4 py-16">
          <div className="card text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-3xl">✅</div>
            <h1 className="mt-4 text-2xl font-bold text-mar-800">Reserva confirmada!</h1>
            <p className="mt-1 text-mar-600">Guarde seu código para gerenciar a reserva.</p>

            <div className="mt-6 rounded-xl bg-mar-50 p-5 text-left">
              <Linha rotulo="Código" valor={confirmacao.codigo} destaque />
              <Linha rotulo="Nome" valor={confirmacao.nome} />
              <Linha rotulo="Quadra" valor={confirmacao.quadra} />
              {confirmacao.modalidade && <Linha rotulo="Modalidade" valor={confirmacao.modalidade} />}
              <Linha rotulo="Data" valor={dataLegivel(confirmacao.data)} />
              <Linha rotulo="Horário" valor={`${confirmacao.horaInicio} às ${confirmacao.horaFim}`} />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <a href={linkWhatsApp(msg)} target="_blank" rel="noopener noreferrer" className="btn-sol">
                💬 Enviar confirmação por WhatsApp
              </a>
              <Link href={`/cancelar?codigo=${confirmacao.codigo}`} className="btn-ghost">
                Gerenciar / cancelar reserva
              </Link>
              <Link href="/" className="text-sm text-mar-500 hover:underline">Voltar ao início</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ---- Fluxo de agendamento ----
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold text-mar-800">Agendar horário</h1>
        <p className="mt-1 text-mar-500">
          Escolha a quadra, a data e até <strong>2 horários seguidos</strong>.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Coluna 1: quadra + calendário */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="label">1. Escolha a quadra</h2>
              <div className="grid grid-cols-2 gap-3">
                {quadras.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuadraId(q.id)}
                    className={[
                      "rounded-xl border-2 p-4 text-left transition",
                      quadraId === q.id
                        ? "border-mar-500 bg-mar-50"
                        : "border-mar-100 hover:border-mar-300",
                    ].join(" ")}
                  >
                    <span className="block font-bold text-mar-800">{q.nome}</span>
                    <span className="mt-1 block text-xs text-mar-500">{q.descricao}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="label">2. Escolha a data</h2>
              <Calendario value={data} onChange={setData} maxData={dataLimiteAgendamento()} />
              <p className="mt-1 text-xs text-mar-400">Agendamentos com até 2 semanas de antecedência.</p>
            </div>
          </div>

          {/* Coluna 2: horários + formulário */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="label">3. Horários disponíveis</h2>
              {!data ? (
                <p className="py-6 text-center text-sm text-mar-400">Selecione uma data ao lado.</p>
              ) : carregandoSlots ? (
                <p className="py-6 text-center text-sm text-mar-400">Carregando horários…</p>
              ) : slots.length === 0 ? (
                <p className="py-6 text-center text-sm text-mar-400">
                  Nenhum horário neste dia. Tente outra data.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((s) => {
                      const sel = horaSelecionada === s.hora;
                      // Destaca também a 2ª hora quando quantidade=2
                      const idxSel = slots.findIndex((x) => x.hora === horaSelecionada);
                      const ehSegunda =
                        quantidade === 2 && idxSel >= 0 && slots[idxSel + 1]?.hora === s.hora;
                      return (
                        <button
                          key={s.hora}
                          type="button"
                          disabled={!s.disponivel}
                          onClick={() => selecionarHora(s)}
                          title={s.motivo}
                          className={[
                            "rounded-lg py-2 text-sm font-semibold transition",
                            !s.disponivel
                              ? "cursor-not-allowed bg-mar-50 text-mar-300 line-through"
                              : sel
                              ? "bg-mar-500 text-white shadow-suave"
                              : ehSegunda
                              ? "bg-mar-200 text-mar-800"
                              : "bg-mar-100 text-mar-700 hover:bg-mar-200",
                          ].join(" ")}
                        >
                          {s.hora}
                        </button>
                      );
                    })}
                  </div>

                  {horaSelecionada && (
                    <div className="mt-4">
                      <p className="label">Duração</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantidade(1)}
                          className={quantidade === 1 ? "btn-primary flex-1 !py-2" : "btn-ghost flex-1 !py-2"}
                        >
                          1 hora
                        </button>
                        <button
                          type="button"
                          disabled={!podeDuasHoras(horaSelecionada)}
                          onClick={() => setQuantidade(2)}
                          className={quantidade === 2 ? "btn-primary flex-1 !py-2" : "btn-ghost flex-1 !py-2"}
                        >
                          2 horas seguidas
                        </button>
                      </div>
                      {!podeDuasHoras(horaSelecionada) && (
                        <p className="mt-1 text-xs text-mar-400">
                          A hora seguinte não está livre — só é possível 1 hora.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Formulário */}
            <form onSubmit={enviar} className="card space-y-4">
              <h2 className="label">4. Confirme e reserve</h2>

              {usuario && (
                <div className="rounded-xl bg-mar-50 p-3 text-sm text-mar-700">
                  👤 <strong>{usuario.nome}</strong> · {usuario.telefone}
                  {usuario.email ? ` · ${usuario.email}` : ""}
                </div>
              )}

              {horaSelecionada && (
                <div className="rounded-xl bg-mar-50 p-3 text-sm text-mar-700">
                  📅 {data && dataLegivel(data)} · ⏰ {horaSelecionada} às {horaFimSelecionada}
                </div>
              )}

              <div>
                <label className="label">Modalidade *</label>
                <select
                  className="input"
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value)}
                  required
                >
                  <option value="">Selecione a modalidade…</option>
                  <option value="Basquete">Basquete</option>
                  <option value="Futsal">Futsal</option>
                  <option value="Queimada">Queimada</option>
                  <option value="Vôlei">Vôlei</option>
                  <option value="Outro">Outro</option>
                </select>
                {modalidade === "Outro" && (
                  <input
                    className="input mt-2"
                    value={modalidadeOutro}
                    onChange={(e) => setModalidadeOutro(e.target.value)}
                    placeholder="Qual modalidade?"
                    required
                  />
                )}
              </div>

              <div>
                <label className="label">Observações (opcional)</label>
                <textarea
                  className="input min-h-[80px]"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: aniversário, equipamento extra…"
                />
              </div>

              {erro && (
                <p className="rounded-lg bg-coral-500/10 px-4 py-2 text-sm text-coral-500">{erro}</p>
              )}

              <button
                type="submit"
                disabled={enviando || !horaSelecionada}
                className="btn-sol w-full text-base"
              >
                {enviando ? "Enviando…" : "Confirmar reserva"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Linha({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="flex justify-between border-b border-mar-100 py-2 last:border-0">
      <span className="text-sm text-mar-500">{rotulo}</span>
      <span className={destaque ? "font-mono font-bold text-mar-800" : "font-medium text-mar-800"}>
        {valor}
      </span>
    </div>
  );
}
