import Image from "next/image";
import Link from "next/link";

export default function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-white p-1 shadow-suave ring-1 ring-mar-100">
        <Image
          src="/logo.jpg"
          alt="CEU - Centro de Artes e Esportes Unificados"
          width={48}
          height={48}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <span className="leading-tight">
        <span className={`block text-lg font-extrabold ${claro ? "text-white" : "text-mar-700"}`}>
          Praça CEU
        </span>
        <span className={`block text-[11px] ${claro ? "text-white/80" : "text-mar-400"}`}>
          Quadras de Areia
        </span>
      </span>
    </Link>
  );
}
