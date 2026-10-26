// Ilustrações em SVG: bolas de cada modalidade e a quadra de areia vista de cima.

type Props = { className?: string };

function BolaBeachTennis({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#d9f24a" stroke="#071e26" strokeWidth="4" />
      <path d="M12 30c22 6 30 24 26 46M88 70C66 64 58 46 62 24" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function BolaFutevolei({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#071e26" strokeWidth="4" />
      <path d="M50 32 66 44 60 63H40L34 44Z" fill="#071e26" />
      <path d="M50 32V8M66 44l22-8M60 63l14 20M40 63 26 83M34 44l-22-8" stroke="#071e26" strokeWidth="4" />
      <path d="M50 8 38 10M88 36l-2 14M74 83l-12 6M26 83l12 6M12 36l2 14" stroke="#071e26" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function BolaVolei({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#fff" />
      <path d="M50 50C50 30 40 14 26 8A46 46 0 0 0 6 44C20 36 36 38 50 50Z" fill="#f5b800" />
      <path d="M50 50c17 10 36 10 46-2a46 46 0 0 0-17-34C79 30 66 42 50 50Z" fill="#1497b0" />
      <path d="M50 50c0 20-12 34-26 40a46 46 0 0 0 46 3C58 84 50 68 50 50Z" fill="#f28a12" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#071e26" strokeWidth="4" />
      <path d="M50 50C50 30 40 14 26 8M50 50c17 10 36 10 46-2M50 50c0 20-12 34-26 40" fill="none" stroke="#071e26" strokeWidth="4" />
    </svg>
  );
}

function Kettlebell({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d="M32 40V30a18 18 0 0 1 36 0v10" fill="none" stroke="#071e26" strokeWidth="10" strokeLinecap="round" />
      <path d="M32 40V30a18 18 0 0 1 36 0v10" fill="none" stroke="#f28a12" strokeWidth="4" strokeLinecap="round" />
      <path d="M22 66a28 28 0 1 1 56 0c0 14-6 24-10 28H32c-4-4-10-14-10-28Z" fill="#f28a12" stroke="#071e26" strokeWidth="4" />
      <path d="M36 58a16 16 0 0 1 12-10" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

const BOLAS: Record<string, (p: Props) => JSX.Element> = {
  "beach-tennis": BolaBeachTennis,
  futevolei: BolaFutevolei,
  "volei-de-praia": BolaVolei,
  funcional: Kettlebell,
};

/** `tipo` é a chave da ilustração (ver ILUSTRACOES em src/lib/aulas.ts). */
export function Bola({ tipo, className }: { tipo: string } & Props) {
  const C = BOLAS[tipo] ?? BolaVolei;
  return <C className={className} />;
}

/** Quadra de areia vista de cima, com o número pintado na areia. */
export function QuadraDesenho({ numero, className }: { numero: string } & Props) {
  return (
    <svg viewBox="0 0 160 100" className={className} aria-hidden="true">
      <defs>
        <pattern id={`graos-${numero}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".7" fill="#c9a86a" opacity=".55" />
          <circle cx="4" cy="4" r=".5" fill="#fff" opacity=".6" />
        </pattern>
      </defs>
      <rect width="160" height="100" fill="#f0dcb4" />
      <rect width="160" height="100" fill={`url(#graos-${numero})`} />
      {/* Linhas da quadra */}
      <rect x="18" y="14" width="124" height="72" fill="none" stroke="#1497b0" strokeWidth="2.5" />
      {/* Rede */}
      <line x1="80" y1="8" x2="80" y2="92" stroke="#071e26" strokeWidth="2.5" strokeDasharray="3 2" />
      <circle cx="80" cy="8" r="2.5" fill="#071e26" />
      <circle cx="80" cy="92" r="2.5" fill="#071e26" />
      {/* Número */}
      <text
        x="49"
        y="66"
        textAnchor="middle"
        fontSize="44"
        fontWeight="900"
        fill="#f28a12"
        opacity=".9"
        style={{ fontFamily: "var(--font-sans)", fontStretch: "62%", fontVariationSettings: '"wdth" 62' }}
      >
        {numero}
      </text>
    </svg>
  );
}

/** Silhueta de coqueiro, igual às artes do Instagram da arena. */
export function Coqueiro({ className }: Props) {
  return (
    <svg viewBox="0 0 120 160" className={className} aria-hidden="true" fill="currentColor">
      <path d="M62 60c2 30 0 66-8 100h10c7-34 9-70 6-100z" />
      <path d="M64 58C50 40 28 34 6 42c20-2 38 4 50 18-16-6-34-2-46 10 18-8 36-6 50 0z" />
      <path d="M64 58c10-20 30-30 52-26-20 2-36 12-44 26 14-10 32-12 46-4-18-2-36 4-50 10z" />
      <path d="M64 58C60 38 66 18 82 6 74 22 70 40 70 56z" />
      <path d="M62 58C52 40 36 30 20 30c16 6 28 16 36 30z" />
    </svg>
  );
}
