"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Calendario from "@/components/Calendario";
import { dataLimiteAgendamento } from "@/lib/horarios";

interface Reserva {
  codigo: string;
  nome: string;
  quadra: string;
  quadraId: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: string;
  modalidade: string | null;
  observacoes: string | null;
}
interface Slot {
  hora: string;
  fim: string;
  disponivel: boolean;
}

const STATUS_LABEL: Record<string, { txt: string; cls: string }> = {
  PENDENTE: { txt: "Pendente", cls: "bg-sol-500/20 text-sol-500" },
  CONFIRMADO: { txt: "Confirmado", cls: "bg-green-100 text-green-700" },
  CANCELADO: { txt: "Cancelado", cls: "bg-coral-500/20 text-coral-500" },
};

function dataLegivel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long",
  });
}

function Conteudo() {
  const params = useSearchParams();
  const [codigo, setCodigo] = useState(params.get("codigo") ?? "");
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Remarcação
  const [remarcando, setRemarcando] = useState(false);
  const [novaData, setNovaData] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [novaHora, setNovaHora] = useState<string | null>(null);
  const [novaQtd, setNovaQtd] = useState<1 | 2>(1);

  function podeDuasHoras(hora: string): boolean {
    const idx = slots.findIndex((s) => s.hora === hora);
    return idx >= 0 && idx + 1 < slots.length && slots[idx + 1].disponivel;
  }

  const buscar = useCallback(async (cod?: string) => {
    const c = (cod ?? codigo).trim();
    if (!c) return;
    setErro(null); setMsg(null); setCarregando(true); setReserva(null);
    try {
      const res = await fetch(`/api/reservas/${c}`);
      const json = await res.json();
      if (!res.ok) setErro(json.erro ?? "Reserva não encontrada.");
      else setReserva(json);
    } finally {
      setCarregando(false);
    }
  }, [codigo]);

  useEffect(() => {
    if (params.get("codigo")) buscar(params.get("codigo")!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar slots ao remarcar
  useEffect(() => {
    if (!remarcando || !novaData || !reserva) return;
    setNovaHora(null);
    fetch(`/api/disponibilidade?data=${novaData}&quadraId=${reserva.quadraId}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []));
  }, [remarcando, novaData, reserva]);

  async function cancelar() {
    if (!reserva) return;
    if (!confirm("Tem certeza que deseja cancelar esta reserva? Ela será removida.")) return;
    const res = await fetch(`/api/reservas/${reserva.codigo}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) { setErro(json.erro); return; }
    setReserva(null);
    setRemarcando(false);
    setMsg("Reserva cancelada e removida com sucesso.");
  }

  async function confirmarRemarcacao() {
    if (!reserva || !novaData || !novaHora) return;
    const res = await fetch(`/api/reservas/${reserva.codigo}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: novaData, horaInicio: novaHora, quantidade: novaQtd }),
    });
    const json = await res.json();
    if (!res.ok) { setErro(json.erro); return; }
    setMsg("Reserva remarcada com sucesso!");
    setRemarcando(false);
    setNovaHora(null);
    setNovaQtd(1);
    buscar(reserva.codigo);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold text-mar-800">Minha reserva</h1>
      <p className="mt-1 text-mar-500">Informe o código recebido na confirmação.</p>

      <div className="card mt-6 flex gap-2">
        <input
          className="input"
          placeholder="Cole seu código aqui"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
        />
        <button onClick={() => buscar()} className="btn-primary whitespace-nowrap">
          Buscar
        </button>
      </div>

      {carregando && <p className="mt-6 text-center text-mar-400">Buscando…</p>}
      {erro && <p className="mt-6 rounded-lg bg-coral-500/10 px-4 py-3 text-coral-500">{erro}</p>}
      {msg && <p className="mt-6 rounded-lg bg-green-100 px-4 py-3 text-green-700">{msg}</p>}

      {reserva && (
        <div className="card mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-mar-800">{reserva.quadra}</h2>
            <span className={`badge ${STATUS_LABEL[reserva.status]?.cls}`}>
              {STATUS_LABEL[reserva.status]?.txt}
            </span>
          </div>
          <div className="mt-4 space-y-1 text-mar-700">
            <p>👤 {reserva.nome}</p>
            <p>📅 {dataLegivel(reserva.data)}</p>
            <p>⏰ {reserva.horaInicio} às {reserva.horaFim}</p>
            {reserva.modalidade && <p>🏅 {reserva.modalidade}</p>}
            {reserva.observacoes && <p>📝 {reserva.observacoes}</p>}
          </div>

          {reserva.status !== "CANCELADO" && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setRemarcando((v) => !v)} className="btn-ghost">
                🔁 Remarcar
              </button>
              <button onClick={cancelar} className="btn-coral">
                ✖ Cancelar reserva
              </button>
            </div>
          )}

          {remarcando && reserva.status !== "CANCELADO" && (
            <div className="mt-6 border-t border-mar-100 pt-6">
              <h3 className="label">Escolha a nova data</h3>
              <Calendario value={novaData} onChange={setNovaData} maxData={dataLimiteAgendamento()} />
              {novaData && (
                <>
                  <h3 className="label mt-4">Novo horário</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((s) => {
                      const idxSel = slots.findIndex((x) => x.hora === novaHora);
                      const ehSegunda = novaQtd === 2 && idxSel >= 0 && slots[idxSel + 1]?.hora === s.hora;
                      return (
                        <button
                          key={s.hora}
                          disabled={!s.disponivel}
                          onClick={() => {
                            setNovaHora(s.hora);
                            if (novaQtd === 2 && !podeDuasHoras(s.hora)) setNovaQtd(1);
                          }}
                          className={[
                            "rounded-lg py-2 text-sm font-semibold",
                            !s.disponivel
                              ? "cursor-not-allowed bg-mar-50 text-mar-300 line-through"
                              : novaHora === s.hora
                              ? "bg-mar-500 text-white"
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

                  {novaHora && (
                    <div className="mt-4">
                      <p className="label">Duração</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNovaQtd(1)}
                          className={novaQtd === 1 ? "btn-primary flex-1 !py-2" : "btn-ghost flex-1 !py-2"}
                        >
                          1 hora
                        </button>
                        <button
                          type="button"
                          disabled={!podeDuasHoras(novaHora)}
                          onClick={() => setNovaQtd(2)}
                          className={novaQtd === 2 ? "btn-primary flex-1 !py-2" : "btn-ghost flex-1 !py-2"}
                        >
                          2 horas seguidas
                        </button>
                      </div>
                      {!podeDuasHoras(novaHora) && (
                        <p className="mt-1 text-xs text-mar-400">A hora seguinte não está livre — só 1 hora.</p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={confirmarRemarcacao}
                    disabled={!novaHora}
                    className="btn-sol mt-4 w-full"
                  >
                    Confirmar remarcação
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-mar-400">
        Não tem reserva? <Link href="/agendar" className="text-mar-500 hover:underline">Agende um horário</Link>
      </p>
    </main>
  );
}

export default function CancelarPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="py-20 text-center text-mar-400">Carregando…</div>}>
        <Conteudo />
      </Suspense>
      <Footer />
    </>
  );
}
