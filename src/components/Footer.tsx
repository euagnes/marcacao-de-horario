import Link from "next/link";
import { CONTATO, EMPRESA, linkWhatsApp } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-20 bg-mar-800 text-mar-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold text-white">{EMPRESA.nome}</h3>
          <p className="mt-2 text-sm text-mar-200">{EMPRESA.subtitulo}</p>
          <p className="text-sm text-mar-300">{EMPRESA.unidade}</p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Contato</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>📍 {CONTATO.endereco}</li>
            <li>📞 {CONTATO.telefone}</li>
            <li>
              <a
                href={linkWhatsApp("Olá! Gostaria de informações sobre as quadras.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sol-400 hover:underline"
              >
                💬 Falar no WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Atalhos</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/agendar" className="hover:underline">Agendar horário</Link></li>
            <li><Link href="/cancelar" className="hover:underline">Cancelar / remarcar</Link></li>
            <li><Link href="/admin/login" className="hover:underline">Área do administrador</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-mar-700 py-4 text-center text-xs text-mar-300">
        © {EMPRESA.nome} — Todos os direitos reservados.
      </div>
    </footer>
  );
}
