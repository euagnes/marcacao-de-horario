import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFab from "@/components/WhatsappFab";
import { prisma } from "@/lib/prisma";
import { CONTATO, EMPRESA, linkWhatsApp } from "@/lib/config";

export const dynamic = "force-dynamic";

const QUADRAS = [
  {
    nome: "Quadra de Areia",
    desc: "Areia fina ao ar livre — beach tennis, vôlei de praia e futevôlei.",
    tag: "Beach Tennis · Futevôlei",
    img: "/quadra-2.jpg",
    icon: "🏐",
  },
  {
    nome: "Quadra Coberta",
    desc: "Quadra poliesportiva coberta — basquete, futsal, vôlei e queimada.",
    tag: "Basquete · Futsal · Vôlei",
    img: "/quadra-1.jpg",
    icon: "⛹️",
  },
];

const TIPO = {
  AVISO: { label: "Aviso", icon: "📢", cls: "bg-laranja-100 text-laranja-600" },
  NOTICIA: { label: "Notícia", icon: "📰", cls: "bg-mar-100 text-mar-700" },
  EVENTO: { label: "Evento", icon: "🎉", cls: "bg-emerald-100 text-emerald-700" },
  TEATRO: { label: "Teatro", icon: "🎭", cls: "bg-fuchsia-100 text-fuchsia-700" },
} as const;

function dataEventoBR(d: Date | null) {
  if (!d) return null;
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default async function HomePage() {
  const [avisos, eventos, noticias] = await Promise.all([
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
  ]);

  return (
    <>
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden text-white">
        <Image src="/praca.jpg" alt="Praça CEU" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-mar-900/95 via-mar-800/85 to-mar-600/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
            🏛️ Espaço público · Esporte e Cultura
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight drop-shadow sm:text-5xl">
            {EMPRESA.nome}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/90">
            {EMPRESA.subtitulo}. Agende quadras, acompanhe eventos, notícias e a
            programação cultural do nosso espaço.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/agendar" className="btn-laranja text-base shadow-glow">📅 Agendar quadra</Link>
            <a href="#eventos" className="btn bg-white/15 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/25 text-base">
              🎭 Ver eventos
            </a>
          </div>
        </div>
        {/* onda decorativa */}
        <div className="absolute inset-x-0 -bottom-px h-10 bg-nuvem-50 [clip-path:polygon(0_55%,100%_0,100%_100%,0_100%)]" />
      </section>

      <main className="mx-auto max-w-6xl px-4">
        {/* ===== QUADRO DE AVISOS ===== */}
        <section className="-mt-6 relative z-10">
          <div className="rounded-2xl border border-nuvem-200 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-laranja-100 text-lg">📢</span>
              <div>
                <h2 className="text-lg font-bold text-mar-900">Quadro de Avisos</h2>
                <p className="text-xs text-mar-400">Comunicados e informações recentes</p>
              </div>
            </div>
            {avisos.length === 0 ? (
              <p className="py-6 text-center text-sm text-mar-400">Nenhum aviso no momento.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {avisos.map((a) => (
                  <div key={a.id} className="rounded-xl border border-nuvem-200 bg-nuvem-50 p-4 transition hover:shadow-soft">
                    <span className={`badge ${TIPO[a.tipo].cls}`}>{TIPO[a.tipo].icon} {TIPO[a.tipo].label}</span>
                    <h3 className="mt-2 font-semibold text-mar-900">{a.titulo}</h3>
                    <p className="mt-1 text-sm text-mar-600">{a.resumo}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ===== QUADRAS ===== */}
        <section className="py-16">
          <SectionTitle icon="🏟️" titulo="Agende uma quadra" sub="Duas quadras disponíveis para reserva online." />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {QUADRAS.map((q) => (
              <article key={q.nome} className="group overflow-hidden rounded-2xl border border-nuvem-200 bg-white shadow-card transition hover:shadow-suave">
                <div className="relative h-52 w-full overflow-hidden">
                  <Image src={q.img} alt={q.nome} fill className="object-cover transition duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-mar-900/50 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-mar-700">{q.tag}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-mar-900">{q.icon} {q.nome}</h3>
                  <p className="mt-2 text-mar-600">{q.desc}</p>
                  <Link href="/agendar" className="btn-primary mt-4 w-full">Reservar horário</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ===== EVENTOS & TEATRO ===== */}
        <section id="eventos" className="py-8">
          <SectionTitle icon="🎉" titulo="Eventos & Programação Cultural" sub="Fique por dentro do que acontece no espaço e no teatro." />
          {eventos.length === 0 ? (
            <p className="mt-6 text-center text-sm text-mar-400">Nenhum evento programado.</p>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {eventos.map((e) => (
                <article key={e.id} className="flex gap-4 rounded-2xl border border-nuvem-200 bg-white p-5 shadow-card transition hover:shadow-suave">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-mar-50 text-2xl">
                    {TIPO[e.tipo].icon}
                  </div>
                  <div className="min-w-0">
                    <span className={`badge ${TIPO[e.tipo].cls}`}>{TIPO[e.tipo].label}</span>
                    <h3 className="mt-1 font-bold text-mar-900">{e.titulo}</h3>
                    <p className="mt-1 text-sm text-mar-600">{e.resumo}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mar-400">
                      {e.dataEvento && <span>🗓️ {dataEventoBR(e.dataEvento)}</span>}
                      {e.local && <span>📍 {e.local}</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ===== NOTÍCIAS ===== */}
        {noticias.length > 0 && (
          <section className="py-16">
            <SectionTitle icon="📰" titulo="Notícias recentes" sub="Novidades e informações da comunidade." />
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {noticias.map((n) => (
                <article key={n.id} className="rounded-2xl border border-nuvem-200 bg-white p-5 shadow-card transition hover:shadow-suave">
                  <span className={`badge ${TIPO[n.tipo].cls}`}>{TIPO[n.tipo].icon} {TIPO[n.tipo].label}</span>
                  <h3 className="mt-2 font-bold text-mar-900">{n.titulo}</h3>
                  <p className="mt-1 text-sm text-mar-600">{n.resumo}</p>
                  {n.local && <p className="mt-2 text-xs text-mar-400">📍 {n.local}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ===== SOBRE / CONTATO ===== */}
        <section className="pb-20">
          <div className="grid gap-8 rounded-2xl border border-nuvem-200 bg-white p-8 shadow-card md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-mar-900">Sobre o espaço</h2>
              <p className="mt-3 text-mar-600">
                O {EMPRESA.nome} é um espaço público de esporte, arte e cultura, com quadras,
                teatro e áreas de convivência para toda a comunidade.
              </p>
              <ul className="mt-5 space-y-3 text-mar-700">
                <li className="flex gap-3"><span>📍</span><span>{CONTATO.endereco}</span></li>
                <li className="flex gap-3"><span>📞</span><span>{CONTATO.telefone}</span></li>
                <li className="flex gap-3"><span>🕒</span><span>Todos os dias, das 07h às 22h</span></li>
                <li className="flex gap-3">
                  <span>💬</span>
                  <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" className="text-mar-600 hover:underline">Falar no WhatsApp</a>
                </li>
              </ul>
              <Link href="/agendar" className="btn-primary mt-6">Agendar agora</Link>
            </div>
            <div className="relative min-h-[240px] overflow-hidden rounded-xl">
              <Image src="/home.webp" alt="Complexo CEU" fill className="object-cover" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsappFab />
    </>
  );
}

function SectionTitle({ icon, titulo, sub }: { icon: string; titulo: string; sub: string }) {
  return (
    <div className="text-center">
      <span className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-xl bg-mar-100 text-xl">{icon}</span>
      <h2 className="text-2xl font-bold tracking-tight text-mar-900 sm:text-3xl">{titulo}</h2>
      <p className="mt-1 text-mar-400">{sub}</p>
    </div>
  );
}
