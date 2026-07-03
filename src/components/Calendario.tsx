"use client";

import { useState } from "react";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

export default function Calendario({
  value,
  onChange,
  maxData,
}: {
  value: string | null;
  onChange: (data: string) => void;
  maxData?: string; // "YYYY-MM-DD" - datas após esta ficam desabilitadas
}) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = maxData ? new Date(`${maxData}T00:00:00`) : null;

  const inicial = value ? new Date(`${value}T00:00:00`) : hoje;
  const [mesAtual, setMesAtual] = useState(
    new Date(inicial.getFullYear(), inicial.getMonth(), 1)
  );

  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const celulas: (Date | null)[] = [];
  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(new Date(ano, mes, d));

  function mudarMes(delta: number) {
    setMesAtual(new Date(ano, mes + delta, 1));
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => mudarMes(-1)}
          className="grid h-9 w-9 place-items-center rounded-lg text-mar-600 hover:bg-mar-50"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <span className="font-semibold text-mar-800">
          {MESES[mes]} {ano}
        </span>
        <button
          type="button"
          onClick={() => mudarMes(1)}
          className="grid h-9 w-9 place-items-center rounded-lg text-mar-600 hover:bg-mar-50"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-mar-400">
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {celulas.map((data, i) => {
          if (!data) return <div key={i} />;
          const str = ymd(data);
          const passado = data < hoje || (limite ? data > limite : false);
          const selecionado = str === value;
          return (
            <button
              key={i}
              type="button"
              disabled={passado}
              onClick={() => onChange(str)}
              className={[
                "aspect-square rounded-lg text-sm font-medium transition",
                passado
                  ? "cursor-not-allowed text-mar-200"
                  : "text-mar-700 hover:bg-mar-100",
                selecionado ? "!bg-mar-500 !text-white shadow-suave" : "",
              ].join(" ")}
            >
              {data.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
