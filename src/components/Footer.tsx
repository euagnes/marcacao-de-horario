import Link from "next/link";
import { CONTATO, EMPRESA, linkWhatsApp } from "@/lib/config";
import { LogoMarca } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-abismo text-areia/80 dark:border-t dark:border-areia/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMarca className="h-12 w-12 rounded-full" />
            <p className="titulo-poster text-4xl text-areia">{EMPRESA.nome}</p>
          </div>
          <p className="mt-3 max-w-xs text-sm">{EMPRESA.subtitulo} em Benfica, Juiz de Fora.</p>
        </div>

        <div>
          <h4 className="font-bold text-areia">Contato</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>{CONTATO.endereco}</li>
            <li>
              <a
                href={linkWhatsApp("Olá! Gostaria de informações sobre a Praia do Norte.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sol-400 hover:underline"
              >
                WhatsApp {CONTATO.telefone}
              </a>
            </li>
            <li>
              <a href={CONTATO.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Instagram {CONTATO.instagramUser}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-areia">Atalhos</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/agendar" className="hover:underline">Alugar quadra</Link></li>
            <li><Link href="/aulas" className="hover:underline">Aulas e aula experimental</Link></li>
            <li><Link href="/cancelar" className="hover:underline">Cancelar ou remarcar</Link></li>
            <li><Link href="/admin/login" className="hover:underline">Área do administrador</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-areia/10 py-4 text-center text-xs text-areia/50">
        © {EMPRESA.nome}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
