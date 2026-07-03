"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  const router = useRouter();
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

  return (
    <header className="sticky top-0 z-30 border-b border-mar-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          {carregando ? null : usuario ? (
            <>
              <span className="hidden text-sm font-medium text-mar-500 sm:block">
                Olá, {usuario.nome.split(" ")[0]}
              </span>
              <Link href="/minha-conta" className="btn-ghost !px-4 !py-2 text-sm">📋 Minhas reservas</Link>
              <Link href="/agendar" className="btn-primary !px-4 !py-2 text-sm">Agendar</Link>
              <button onClick={sair} className="text-sm font-medium text-coral-500 hover:underline">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-mar-600 hover:text-mar-800">
                Entrar
              </Link>
              <Link href="/cadastro" className="btn-primary !px-4 !py-2 text-sm">Criar conta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
