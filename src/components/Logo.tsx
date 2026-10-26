import Link from "next/link";

/** Símbolo da marca: sol laranja/amarelo nascendo sobre as ondas azuis. */
export function LogoMarca({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pdn-sol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5b800" />
          <stop offset="1" stopColor="#f28a12" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="#fff" />
      <g stroke="#f5b800" strokeWidth="2.6" strokeLinecap="round">
        <line x1="32" y1="9" x2="32" y2="14" />
        <line x1="18" y1="14.5" x2="21" y2="18.5" />
        <line x1="46" y1="14.5" x2="43" y2="18.5" />
        <line x1="10" y1="25" x2="14.5" y2="27" />
        <line x1="54" y1="25" x2="49.5" y2="27" />
      </g>
      <path d="M17 36a15 15 0 0 1 30 0z" fill="url(#pdn-sol)" />
      <g fill="none" stroke="#2fb5cb" strokeWidth="3.4" strokeLinecap="round">
        <path d="M11 41c4-3 8-3 12 0s8 3 12 0 8-3 12 0 5 2 6 1" />
        <path d="M14 48c3.5-2.6 7-2.6 10.5 0s7 2.6 10.5 0 7-2.6 10.5 0" stroke="#67d0e1" />
      </g>
    </svg>
  );
}

export default function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Praia do Norte, página inicial">
      <LogoMarca className="h-11 w-11 shrink-0 rounded-full shadow-soft ring-1 ring-mar-100 transition-transform duration-500 group-hover:rotate-[-12deg]" />
      <span className="leading-none">
        <span className={`titulo-poster block whitespace-nowrap text-[1.6rem] ${claro ? "text-white" : "text-mar-900"}`}>
          Praia do Norte
        </span>
        <span className={`mt-0.5 block text-[11px] font-medium ${claro ? "text-white/70" : "text-mar-400"}`}>
          Benfica, Juiz de Fora
        </span>
      </span>
    </Link>
  );
}
