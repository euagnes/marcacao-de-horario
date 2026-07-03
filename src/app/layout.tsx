import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Praça CEU | Agendamento de Quadras de Areia",
  description:
    "Reserve sua quadra de areia coberta no Praça CEU. Beach tennis, vôlei de praia e futevôlei. Agende online em segundos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
