import type { Config } from "tailwindcss";

// As cores que mudam no modo escuro vêm de variáveis CSS (ver globals.css).
const v = (nome: string) => `rgb(var(--${nome}) / <alpha-value>)`;
const escala = (nome: string, tons: number[]) =>
  Object.fromEntries(tons.map((t) => [t, v(`${nome}-${t}`)]));

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== Identidade Praia do Norte: azul (mar), laranja e amarelo (sol) =====
        // Nome "mar" mantido por compatibilidade com as classes existentes.
        mar: escala("mar", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        // Neutros de superfície/borda (tom de areia)
        nuvem: escala("nuvem", [50, 100, 200, 300]),
        // Fundo de cartões, inputs e cabeçalho
        superficie: v("superficie"),
        // Azul profundo fixo (hero, rodapé, blocos de destaque) — igual nos dois temas
        abismo: { DEFAULT: "#071e26", 800: "#0b2a35", 700: "#103a48" },
        areia: { DEFAULT: "#fbf3e2", 300: "#f0dcb4" },
        laranja: {
          50: v("laranja-50"),
          100: v("laranja-100"),
          300: "#fcbf73",
          400: "#f9a03f",
          500: "#f28a12", // laranja da marca
          600: "#d9730a",
        },
        sol: {
          50: v("sol-50"),
          100: v("sol-100"),
          300: "#fde38a",
          400: "#fcd34d",
          500: "#f5b800", // amarelo da marca
          600: "#c99300",
        },
        coral: {
          400: "#fb7185",
          500: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(var(--sombra) / 0.05), 0 1px 3px 0 rgb(var(--sombra) / 0.08)",
        card: "0 1px 3px 0 rgb(var(--sombra) / 0.07), 0 8px 24px -8px rgb(var(--sombra) / 0.12)",
        suave: "0 10px 30px -12px rgb(var(--sombra) / 0.28)",
        glow: "0 8px 30px -6px rgba(242,138,18,0.45)",
        // Sombra "carimbo" dos pôsteres: deslocada e sem desfoque
        poster: "6px 6px 0 0 #071e26",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "sol-nasce": {
          from: { transform: "translateY(55%)", opacity: "0.4" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "linha-sobe": {
          from: { transform: "translateY(105%)" },
          to: { transform: "translateY(0)" },
        },
        letreiro: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 240ms ease-out",
        "sol-nasce": "sol-nasce 1400ms cubic-bezier(.2,.8,.2,1) both",
        "linha-sobe": "linha-sobe 700ms cubic-bezier(.2,.8,.2,1) both",
        letreiro: "letreiro 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
