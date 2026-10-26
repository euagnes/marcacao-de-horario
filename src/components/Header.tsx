"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<{ nome: string } | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setUsuario(u))
      .finally(() => setCarregando(false));
  }, []);

  async function sair() {
    await fetch("/api/usuarios/logout", { method: "POST" });
    setUsuario(null);
    router.push("/");
    router.refresh();
  }

  const linkNav = (href: string) =>
    [
      "relative hidden py-1 text-sm font-semibold transition sm:block",
      "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded after:bg-laranja-500 after:transition-transform",
      pathname === href
        ? "text-mar-900 after:scale-x-100"
        : "text-mar-600 after:scale-x-0 hover:text-mar-900 hover:after:scale-x-100",
    ].join(" ");

  return (
    <header className="sticky top-0 z-30 border-b border-nuvem-200 bg-superficie/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <Logo />
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link href="/aulas" className={linkNav("/aulas")}>Aulas</Link>
          <Link href="/agendar" className={linkNav("/agendar")}>Alugar quadra</Link>
          {carregando ? null : usuario ? (
            <>
              <Link href="/minha-conta" className={linkNav("/minha-conta")}>Minhas reservas</Link>
              <span className="hidden text-sm text-mar-500 lg:block">Oi, {usuario.nome.split(" ")[0]}</span>
              <button onClick={sair} className="text-sm font-semibold text-coral-500 hover:underline">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-mar-600 hover:text-mar-900">
                Entrar
              </Link>
              <Link href="/cadastro" className="btn-primary hidden !rounded-full !px-4 !py-2 text-sm sm:inline-flex">Criar conta</Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
      {/* No celular os links principais ficam numa segunda linha */}
      <div className="flex gap-2 border-t border-nuvem-200 px-4 py-2 sm:hidden">
        <Link href="/aulas" className="flex-1 rounded-full bg-sol-100 py-1.5 text-center text-sm font-semibold text-mar-900">Aulas</Link>
        <Link href="/agendar" className="flex-1 rounded-full bg-mar-100 py-1.5 text-center text-sm font-semibold text-mar-900">Alugar quadra</Link>
        {usuario && (
          <Link href="/minha-conta" className="flex-1 rounded-full bg-nuvem-100 py-1.5 text-center text-sm font-semibold text-mar-900">Reservas</Link>
        )}
      </div>
    </header>
  );
}
