import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFab from "@/components/WhatsappFab";
import { CONTATO, EMPRESA, linkWhatsApp } from "@/lib/config";

const QUADRAS = [
  {
    nome: "Quadra Coberta",
    desc: "Quadra coberta poliesportiva. Perfeita para basquete, futsal, vôlei e queimada.",
    tag: "Basquete · Futsal · Vôlei",
    img: "/quadra-1.jpg",
  },
  {
    nome: "Quadra de Areia",
    desc: "Espaço de areia ao ar livre. Ideal para beach tennis, vôlei de praia e futevôlei.",
    tag: "Beach Tennis · Futevôlei",
    img: "/quadra-2.jpg",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden text-white">
        <Image
          src="/praca.jpg"
          alt="Praça CEU - Centro de Artes e Esportes Unificados"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-mar-800/90 via-mar-600/80 to-mar-500/60" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-20 sm:py-28 md:grid-cols-2">
          <div>
            <span className="badge bg-laranja-500 text-white">☀️ Quadras de areia</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight drop-shadow sm:text-5xl">
              {EMPRESA.nome}
            </h1>
            <p className="mt-2 text-lg text-white/90">{EMPRESA.subtitulo}</p>
            <p className="mt-4 max-w-md text-white/90">
              Reserve sua quadra em segundos. Beach tennis, vôlei de praia e futevôlei
              com disponibilidade em tempo real.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/agendar" className="btn-laranja text-base">📅 Agendar horário</Link>
              <a
                href={linkWhatsApp("Olá! Gostaria de informações sobre as quadras.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-white/15 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/25 text-base"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>

          {/* Cartão flutuante com mini-fotos */}
          <div className="hidden md:block">
            <div className="card bg-white/95 text-mar-900">
              <div className="grid grid-cols-2 gap-3">
                {QUADRAS.map((q) => (
                  <div key={q.nome} className="relative aspect-square overflow-hidden rounded-xl">
                    <Image src={q.img} alt={q.nome} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-mar-900/70 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-sm font-bold text-white">{q.nome}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-mar-500">2 quadras · das 07h às 22h</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUADRAS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-mar-800">Nossas quadras</h2>
        <p className="mt-2 text-center text-mar-500">Estrutura completa para você jogar com conforto.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {QUADRAS.map((q) => (
            <article key={q.nome} className="card overflow-hidden p-0">
              <div className="relative h-56 w-full">
                <Image src={q.img} alt={q.nome} fill className="object-cover" />
              </div>
              <div className="p-6">
                <span className="badge bg-laranja-100 text-laranja-600">{q.tag}</span>
                <h3 className="mt-2 text-xl font-bold text-mar-800">{q.nome}</h3>
                <p className="mt-2 text-mar-600">{q.desc}</p>
                <Link href="/agendar" className="btn-primary mt-4 w-full">Reservar {q.nome}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-mar-800">Como funciona</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { n: "1", t: "Crie sua conta", d: "Cadastre-se e aguarde a aprovação por e-mail." },
              { n: "2", t: "Escolha data e quadra", d: "Veja os horários livres em tempo real." },
              { n: "3", t: "Reserve e jogue", d: "Receba a confirmação e gerencie quando quiser." },
            ].map((p) => (
              <div key={p.n} className="card text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-laranja-500 text-lg font-bold text-white">
                  {p.n}
                </div>
                <h3 className="mt-4 font-bold text-mar-800">{p.t}</h3>
                <p className="mt-1 text-sm text-mar-600">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO / CONTATO */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-mar-800">Onde estamos</h2>
            <ul className="mt-4 space-y-3 text-mar-700">
              <li className="flex gap-3"><span>📍</span><span>{CONTATO.endereco}</span></li>
              <li className="flex gap-3"><span>📞</span><span>{CONTATO.telefone}</span></li>
              <li className="flex gap-3">
                <span>💬</span>
                <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" className="text-laranja-600 hover:underline">
                  Chamar no WhatsApp
                </a>
              </li>
              <li className="flex gap-3"><span>🕒</span><span>Todos os dias, das 07h às 22h</span></li>
            </ul>
            <Link href="/agendar" className="btn-laranja mt-6">Agendar agora</Link>
          </div>
          <div className="relative min-h-[240px] overflow-hidden rounded-xl">
            <Image src="/home.webp" alt="Complexo CEU" fill className="object-cover" />
          </div>
        </div>
      </section>

      <Footer />
      <WhatsappFab />
    </>
  );
}
