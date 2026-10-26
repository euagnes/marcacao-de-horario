"use client";

/**
 * Alterna entre tema claro (sol) e escuro (lua). A escolha fica salva no navegador.
 * Os ícones reagem à classe `dark` do <html>, então não há animação ao carregar a página.
 */
export default function ThemeToggle() {
  function alternar() {
    const escuro = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("tema", escuro ? "escuro" : "claro");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Alternar tema claro e escuro"
      title="Alternar tema claro e escuro"
      className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full text-mar-700 ring-1 ring-mar-200 transition hover:bg-mar-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sol-500"
    >
      {/* Sol: some subindo e girando quando entra o tema escuro */}
      <span className="absolute inset-0 grid place-items-center transition-transform duration-500 ease-out dark:-translate-y-full dark:-rotate-90">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" fill="#f5b800" stroke="#f5b800" />
          <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" stroke="#f28a12" />
        </svg>
      </span>
      {/* Lua: nasce de baixo */}
      <span className="absolute inset-0 grid translate-y-full rotate-90 place-items-center transition-transform duration-500 ease-out dark:translate-y-0 dark:rotate-0">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a.6.6 0 0 0-.8-.7A9.5 9.5 0 1 0 21.2 15.4a.6.6 0 0 0-.7-.8Z" />
        </svg>
      </span>
    </button>
  );
}
