import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Archivo variável: o eixo de largura (wdth) dá o corte condensado dos títulos.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Praia do Norte | Quadras de Areia e Aulas em Juiz de Fora",
  description:
    "Alugue quadra de areia e agende aulas de beach tennis, futevôlei, vôlei de praia e funcional na Praia do Norte, em Benfica - Juiz de Fora.",
};

// Aplica o tema salvo antes da pintura, para não piscar claro → escuro.
const scriptTema = `(function(){try{var t=localStorage.getItem('tema');var e=t?t==='escuro':matchMedia('(prefers-color-scheme: dark)').matches;if(e)document.documentElement.classList.add('dark')}catch(_){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
