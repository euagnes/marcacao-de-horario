import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== Identidade azul institucional (governo/público) =====
        // Nome "mar" mantido por compatibilidade com as classes existentes.
        mar: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb", // primário
          600: "#1d4ed8", // hover / links
          700: "#1e40af",
          800: "#1e3a8a", // títulos
          900: "#172554", // navy escuro
        },
        // Neutros de superfície/borda
        nuvem: {
          50: "#f8fafc",
          100: "#eef2f7",
          200: "#e2e8f0",
          300: "#cbd5e1",
        },
        // Accent quente (uso pontual em destaques)
        laranja: {
          50: "#fff7ed",
          100: "#ffedd5",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        sol: {
          400: "#fbbf24",
          500: "#f59e0b",
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
        soft: "0 1px 2px 0 rgba(23,37,84,0.04), 0 1px 3px 0 rgba(23,37,84,0.07)",
        card: "0 1px 3px 0 rgba(23,37,84,0.06), 0 8px 24px -8px rgba(23,37,84,0.10)",
        suave: "0 10px 30px -12px rgba(23,37,84,0.25)",
        glow: "0 8px 30px -6px rgba(37,99,235,0.35)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 240ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
