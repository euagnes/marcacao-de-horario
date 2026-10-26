import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFab from "@/components/WhatsappFab";
import Letreiro from "@/components/Letreiro";
import { Bola, Coqueiro, QuadraDesenho } from "@/components/Ilustracoes";
import { prisma } from "@/lib/prisma";
import { classesPoster } from "@/lib/aulas";
import { listarModalidades } from "@/lib/modalidades";
import { AVISO_PAGAMENTO, CONTATO, linkWhatsApp } from "@/lib/config";

export const dynamic = "force-dynamic";

// O tipo TEATRO do banco é exibido como "Torneio" na Praia do Norte.
const ROTULO_TIPO = { AVISO: "Aviso", NOTICIA: "Novidade", EVENTO: "Evento", TEATRO: "Torneio" } as const;

// Larguras alternadas dos blocos de modalidade (grade de 12 colunas)
const LARGURA_BLOCO = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];

/** Largura do bloco i; se sobrar um sozinho na última linha, ocupa a linha inteira. */
function larguraBloco(i: number, total: number) {
  return total % 2 === 1 && i === total - 1 ? "lg:col-span-12" : LARGURA_BLOCO[i % 4];
}

export default async function HomePage() {
  const [avisos, eventos, noticias, quadras, modalidades] = await Promise.all([
    prisma.publicacao.findMany({
      where: { publicado: true, destaque: true },
      orderBy: { criadoEm: "desc" },
      take: 6,
    }),
    prisma.publicacao.findMany({
      where: { publicado: true, tipo: { in: ["EVENTO", "TEATRO"] } },
      orderBy: [{ dataEvento: "asc" }, { criadoEm: "desc" }],
      take: 4,
    }),
    prisma.publicacao.findMany({
      where: { publicado: true, tipo: "NOTICIA" },
      orderBy: { criadoEm: "desc" },
      take: 3,
    }),
    prisma.quadra.findMany({ where: { ativa: true }, orderBy: { id: "asc" } }),
    listarModalidades(),
  ]);

  return (
    <>
      <Header />

      {/* ===== HERO: o sol nasce atrás das ondas ===== */}
      <section className="relative isolate overflow-hidden bg-abismo text-areia">
        <div
          className="absolute -right-16 top-12 -z-10 h-44 w-44 animate-sol-nasce rounded-full bg-gradient-to-b from-sol-400 via-sol-500 to-laranja-500 sm:bottom-16 sm:right-8 sm:top-auto sm:h-[30rem] sm:w-[30rem] lg:right-16"
          aria-hidden="true"
        />
        <Coqueiro className="absolute -right-6 top-12 -z-10 h-44 w-32 text-abismo sm:bottom-10 sm:right-24 sm:top-auto sm:h-96 sm:w-72" />

        <div className="mx-auto max-w-6xl px-4 pb-36 pt-16 sm:pb-44 sm:pt-24">
          <h1 className="titulo-poster text-[clamp(4rem,13vw,9.5rem)]">
            {["Areia,", "sol e rede", "em Benfica."].map((linha, i) => (
              <span key={linha} className="block overflow-hidden pb-1">
                <span className="block animate-linha-sobe" style={{ animationDelay: `${150 + i * 120}ms` }}>
                  {linha}
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-md animate-slide-up text-lg text-areia/85 [animation-delay:650ms] [animation-fill-mode:both]">
            Três quadras de areia ao ar livre para alugar por hora, e aulas de beach tennis, futevôlei,
            vôlei de praia e funcional.
          </p>
          <div className="mt-8 flex animate-slide-up flex-wrap gap-3 [animation-delay:800ms] [animation-fill-mode:both]">
            <Link href="/agendar" className="btn rounded-full bg-sol-500 text-base text-abismo shadow-glow hover:bg-sol-400">
              Alugar quadra
            </Link>
            <Link href="/aulas#experimental" className="btn rounded-full text-base text-areia ring-2 ring-areia/40 hover:bg-areia/10">
              Agendar aula experimental
            </Link>
          </div>
        </div>

        {/* Ondas e areia na base do hero */}
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-24 w-full sm:h-28" aria-hidden="true">
          <path d="M0 40c120-24 240-24 360 0s240 24 360 0 240-24 360 0 240 24 360 0v80H0z" fill="#1497b0" />
          <path d="M0 64c120-20 240-20 360 0s240 20 360 0 240-20 360 0 240 20 360 0v56H0z" fill="#67d0e1" />
          <path d="M0 92c180-14 360-14 540 0s360 14 540 0 270-10 360-4v32H0z" className="fill-nuvem-50" />
        </svg>
      </section>

      <Letreiro
        className="relative z-10 -mt-4 -rotate-1 shadow-card"
        itens={["Beach tennis", "Futevôlei", "Vôlei de praia", "Funcional", "Aluguel de quadra", "Torneios"]}
      />

      <main className="mx-auto max-w-6xl px-4">
        {/* ===== RECADOS ===== */}
        {avisos.length > 0 && (
          <section className="pt-16">
            <h2 className="titulo-secao">Recados da arena</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {avisos.map((a) => (
                <li key={a.id} className="rounded-r-2xl border-l-4 border-laranja-500 bg-superficie px-5 py-4 shadow-soft">
                  <h3 className="font-bold text-mar-900">{a.titulo}</h3>
                  <p className="mt-1 text-sm text-mar-600">{a.resumo}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ===== MODALIDADES ===== */}
        <section className="pt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="titulo-secao max-w-md">Escolha sua modalidade</h2>
            <p className="max-w-xs text-mar-600">Turmas para quem nunca jogou e para quem já disputa torneio.</p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-12">
            {modalidades.map((m, i) => (
              <Link
                key={m.slug}
                href={`/aulas#${m.slug}`}
                className={`group relative isolate flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[28px] p-7 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sol-500 ${classesPoster(m.cor)} ${larguraBloco(i, modalidades.length)}`}
              >
                <Bola
                  tipo={m.icone}
                  className="absolute -bottom-10 -right-10 -z-10 h-36 w-36 transition-transform duration-700 ease-out group-hover:-translate-x-8 group-hover:-translate-y-4 group-hover:rotate-[160deg] sm:h-56 sm:w-56"
                />
                <h3 className="titulo-poster max-w-[9ch] text-6xl sm:text-7xl">{m.nome}</h3>
                <div className="mt-6 max-w-[26ch]">
                  <p className="text-base font-medium opacity-90">{m.resumo}</p>
                  <span className="mt-3 inline-block border-b-2 border-current pb-0.5 text-sm font-bold">
                    Ver horários e valores
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-sol-100 px-7 py-5">
            <p className="text-lg font-semibold text-mar-900">Nunca jogou? A primeira aula é experimental.</p>
            <Link href="/aulas#experimental" className="btn-laranja rounded-full">Agendar aula experimental</Link>
          </div>
        </section>

        {/* ===== QUADRAS ===== */}
        <section className="pt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="titulo-secao max-w-lg">
              {quadras.length === 3 ? "Três quadras" : `${quadras.length} quadras`}, pé na areia
            </h2>
            <p className="max-w-xs text-mar-600">Escolha a quadra, o dia e o horário. A reserva é por hora.</p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quadras.map((q) => {
              const numero = q.nome.match(/\d+/)?.[0] ?? String(q.id);
              return (
                <Link
                  key={q.id}
                  href="/agendar"
                  className="group overflow-hidden rounded-[24px] bg-superficie shadow-card ring-1 ring-nuvem-200 transition hover:ring-2 hover:ring-laranja-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sol-500"
                >
                  <div className="overflow-hidden">
                    <QuadraDesenho numero={numero} className="block w-full transition-transform duration-500 group-hover:scale-[1.04]" />
                  </div>
                  <div className="flex items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <h3 className="text-lg font-bold text-mar-900">{q.nome}</h3>
                      <p className="text-sm text-mar-500">Ao ar livre</p>
                    </div>
                    <span className="rounded-full bg-mar-500 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-laranja-500">
                      Reservar
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="mt-5 text-sm text-mar-600">
            {AVISO_PAGAMENTO}{" "}
            <a
              href={linkWhatsApp("Olá! Gostaria de saber os valores do aluguel de quadra.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-mar-900 underline decoration-laranja-500 decoration-2 underline-offset-4"
            >
              Consultar valores no WhatsApp
            </a>
          </p>
        </section>

        {/* ===== TORNEIOS & EVENTOS ===== */}
        {eventos.length > 0 && (
          <section id="eventos" className="pt-24">
            <h2 className="titulo-secao">Torneios e eventos</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {eventos.map((e) => {
                const d = e.dataEvento ? new Date(e.dataEvento) : null;
                return (
                  <article key={e.id} className="flex gap-5 rounded-[24px] bg-sol-500 p-6 text-abismo shadow-poster dark:shadow-[6px_6px_0_0_#1497b0]">
                    {d && (
                      <div className="shrink-0 text-center">
                        <p className="titulo-poster text-6xl">{d.toLocaleDateString("pt-BR", { day: "2-digit" })}</p>
                        <p className="text-sm font-bold uppercase">
                          {d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                          {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    )}
                    <div className="min-w-0 border-l-2 border-abismo/20 pl-5">
                      <p className="text-xs font-bold text-laranja-600">{ROTULO_TIPO[e.tipo]}</p>
                      <h3 className="titulo-poster mt-1 text-3xl">{e.titulo}</h3>
                      <p className="mt-2 text-sm">{e.resumo}</p>
                      {e.local && <p className="mt-2 text-xs font-semibold opacity-75">{e.local}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== NOVIDADES ===== */}
        {noticias.length > 0 && (
          <section className="pt-24">
            <h2 className="titulo-secao">Novidades</h2>
            <div className="mt-6 divide-y divide-nuvem-200 border-y border-nuvem-200">
              {noticias.map((n) => (
                <article key={n.id} className="grid gap-1 py-5 sm:grid-cols-[1fr_2fr] sm:gap-8">
                  <h3 className="font-bold text-mar-900">{n.titulo}</h3>
                  <p className="text-mar-600">{n.resumo}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ===== CONTATO ===== */}
        <section className="py-24">
          <div className="relative isolate overflow-hidden rounded-[32px] bg-abismo px-7 py-12 text-areia dark:bg-abismo-800 dark:ring-1 dark:ring-areia/10 sm:px-12">
            <Coqueiro className="absolute -bottom-6 -right-4 -z-10 h-72 w-56 text-abismo-700" />
            <div className="absolute -right-20 -top-20 -z-20 h-64 w-64 rounded-full bg-laranja-500/90" aria-hidden="true" />
            <h2 className="titulo-poster max-w-xl text-6xl sm:text-7xl">Bora pra areia?</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div className="space-y-3 text-areia/85">
                <p>{CONTATO.endereco}</p>
                <p>
                  <a href={CONTATO.instagram} target="_blank" rel="noopener noreferrer" className="font-semibold text-sol-400 hover:underline">
                    {CONTATO.instagramUser}
                  </a>{" "}
                  no Instagram
                </p>
              </div>
              <div>
                <a
                  href={linkWhatsApp("Olá, Praia do Norte! Gostaria de mais informações.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="titulo-poster block text-5xl text-sol-500 transition hover:text-sol-400"
                >
                  {CONTATO.telefone}
                </a>
                <p className="mt-1 text-sm text-areia/70">WhatsApp para reservas, aulas e pagamentos</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsappFab />
    </>
  );
}
