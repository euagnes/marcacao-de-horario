/** Faixa amarela correndo de lado, igual ao "save the date" dos posts da arena. */
export default function Letreiro({ itens, className = "" }: { itens: string[]; className?: string }) {
  const sequencia = [...itens, ...itens];
  return (
    <div className={`overflow-hidden bg-sol-500 py-3 text-abismo ${className}`} aria-label={itens.join(", ")}>
      <div className="flex w-max animate-letreiro motion-reduce:animate-none" aria-hidden="true">
        {[0, 1].map((metade) => (
          <div key={metade} className="flex shrink-0 items-center">
            {sequencia.map((t, i) => (
              <span key={i} className="titulo-poster flex items-center gap-6 px-3 text-3xl sm:text-4xl">
                {t}
                <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="#f28a12">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v4M12 19v4M1 12h4M19 12h4M4.2 4.2 7 7M17 17l2.8 2.8M4.2 19.8 7 17M17 7l2.8-2.8" stroke="#f28a12" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
