import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta praia / areia / esporte
        areia: {
          50: "#fdf8ef",
          100: "#f9ecd2",
          200: "#f2d8a3",
          300: "#e9bd6c",
          400: "#e2a544",
        },
        mar: {
          50: "#eef9fb",
          100: "#d3f0f5",
          200: "#a8e1ec",
          300: "#6dcadd",
          400: "#36abc4",
          500: "#1d8ca6",
          600: "#1a7189",
          700: "#1b5b6f",
          800: "#1d4c5c",
          900: "#1c404e",
        },
        // Laranja (cor de destaque principal - CTAs)
        laranja: {
          50: "#fff5ed",
          100: "#ffe7d2",
          300: "#ffae6b",
          400: "#ff8f3d",
          500: "#f4731c",
          600: "#dd5e0f",
        },
        // mantidos para badges/estados
        sol: {
          400: "#ffae6b",
          500: "#f4731c",
        },
        coral: {
          400: "#ff7a59",
          500: "#f25c3b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        suave: "0 10px 30px -12px rgba(27, 91, 111, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
