import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFab from "@/components/WhatsappFab";
import FormAulaExperimental from "@/components/FormAulaExperimental";
import { Bola } from "@/components/Ilustracoes";
import { prisma } from "@/lib/prisma";
import { classesPoster } from "@/lib/aulas";
import { listarModalidades } from "@/lib/modalidades";
import { diasLegiveis } from "@/lib/turmas";
import { AVISO_PAGAMENTO, CONTATO, linkWhatsApp } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Aulas | Praia do Norte",
  description:
    "Aulas de beach tennis, futevôlei, vôlei de praia e funcional na areia em Juiz de Fora. Agende sua aula experimental.",
};

const PASSOS = [
  { t: "Escolha a modalidade", d: "Preencha o formulário com a modalidade, seu nível e o melhor período." },
  { t: "Combine no WhatsApp", d: "A gente responde com as turmas que têm vaga e marca o dia." },
  { t: "Venha para a areia", d: "Roupa leve, protetor solar e uma garrafa d'água. O resto é com a gente." },
];

export default async function AulasPage({ searchParams }: { searchParams: { modalidade?: string } }) {
  const [turmas, modalidades] = await Promise.all([
    prisma.turma.findMany({ where: { ativa: true }, orderBy: [{ horaInicio: "asc" }] }),
    listarModalidades(),
  ]);
  const rotulo = (t: (typeof turmas)[number]) =>
    [diasLegiveis(t.diasSemana), `${t.horaInicio} às ${t.horaFim}`, t.nivel].filter(Boolean).join(", ");

  return (
    <>
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative isolate overflow-hidden bg-abismo text-areia">
        <div
          className="absolute -right-24 -top-24 -z-10 h-56 w-56 animate-sol-nasce rounded-full bg-gradient-to-b from-sol-400 to-laranja-500 sm:right-16 sm:h-80 sm:w-80"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-14 sm:pb-32 sm:pt-20">
          <h1 className="titulo-poster text-[clamp(3.6rem,11vw,8rem)]">
            {["Aprenda", "na areia."].map((linha, i) => (
              <span key={linha} className="block overflow-hidden pb-1">
                <span className="block animate-linha-sobe" style={{ animationDelay: `${120 + i * 120}ms` }}>
                  {linha}
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-md text-lg text-areia/85">
            Beach tennis, futevôlei, vôlei de praia e funcional, com turmas para todos os níveis. A primeira aula é
            experimental.
          </p>
          <a href="#experimental" className="btn mt-8 rounded-full bg-sol-500 text-base text-abismo shadow-glow hover:bg-sol-400">
            Agendar aula experimental
          </a>
        </div>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-16 w-full" aria-hidden="true">
          <path d="M0 30c120-22 240-22 360 0s240 22 360 0 240-22 360 0 240 22 360 0v50H0z" fill="#1497b0" />
          <path d="M0 56c180-14 360-14 540 0s360 14 540 0 270-10 360-4v28H0z" className="fill-nuvem-50" />
        </svg>
      </section>

      <main className="mx-auto max-w-6xl px-4">
        {/* ===== MODALIDADES ===== */}
        <section className="space-y-16 py-16 sm:space-y-24 sm:py-20">
          {modalidades.map((m, i) => {
            const turmasModalidade = turmas.filter((t) => t.modalidade === m.slug);
            return (
              <article
                key={m.slug}
                id={m.slug}
                className="grid scroll-mt-28 items-start gap-8 lg:grid-cols-[5fr_7fr] lg:gap-12"
              >
                {/* Bloco-pôster da modalidade */}
                <div
                  className={`group relative isolate flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[32px] p-8 ${classesPoster(m.cor)} ${
                    i % 2 ? "lg:order-2" : ""
                  }`}
                >
                  <Bola
                    tipo={m.icone}
                    className="absolute -bottom-10 -right-10 -z-10 h-40 w-40 transition-transform sm:-bottom-12 sm:-right-12 sm:h-60 sm:w-60 duration-700 ease-out group-hover:-translate-x-6 group-hover:rotate-[140deg]"
                  />
                  <p className="text-sm font-bold opacity-80">{m.publico}</p>
                  <h2 className="titulo-poster max-w-[8ch] text-7xl sm:text-8xl">{m.nome}</h2>
                </div>

                {/* Detalhes */}
                <div>
                  <p className="text-2xl font-bold leading-snug text-mar-900">{m.resumo}</p>
                  {m.descricao && <p className="mt-3 max-w-prose text-mar-600">{m.descricao}</p>}
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {m.beneficios.map((b) => (
                      <li key={b} className="rounded-full bg-nuvem-100 px-3.5 py-1.5 text-sm font-medium text-mar-800 ring-1 ring-nuvem-200">
                        {b}
                      </li>
                    ))}
                  </ul>

                  <TabelaTurmas turmas={turmasModalidade} />

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={`/aulas?modalidade=${m.slug}#experimental`} className="btn-laranja rounded-full">
                      Agendar aula experimental
                    </a>
                    <a
                      href={linkWhatsApp(`Olá! Quero saber os horários e valores das aulas de ${m.nome}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost rounded-full"
                    >
                      Tirar dúvidas no WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* ===== COMO FUNCIONA (sequência real, por isso numerada) ===== */}
        <section className="border-y border-nuvem-200 py-14">
          <h2 className="titulo-secao">Como funciona a aula experimental</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {PASSOS.map((p, i) => (
              <li key={p.t} className="flex gap-4">
                <span className="titulo-poster text-7xl text-laranja-500">{i + 1}</span>
                <div className="pt-2">
                  <h3 className="font-bold text-mar-900">{p.t}</h3>
                  <p className="mt-1 text-sm text-mar-600">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ===== INSCRIÇÃO ===== */}
        <section id="experimental" className="scroll-mt-24 py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="titulo-poster text-6xl text-mar-900 sm:text-7xl">Marque sua aula experimental</h2>
              <p className="mt-4 max-w-md text-mar-600">
                Conheça a arena, o professor e a turma antes de fechar seu plano. Ao enviar, abre uma conversa com a
                gente no WhatsApp para escolher o dia.
              </p>
              <div className="mt-6 rounded-2xl border-2 border-dashed border-sol-500 px-5 py-4 text-sm text-mar-800">
                <p className="font-bold">Pagamento</p>
                <p className="mt-1">{AVISO_PAGAMENTO}</p>
              </div>
              <ul className="mt-6 space-y-1.5 text-sm text-mar-700">
                <li>{CONTATO.endereco}</li>
                <li>WhatsApp {CONTATO.telefone}</li>
                <li>
                  <a href={CONTATO.instagram} target="_blank" rel="noopener noreferrer" className="font-semibold text-mar-900 underline decoration-laranja-500 decoration-2 underline-offset-4">
                    {CONTATO.instagramUser}
                  </a>
                </li>
              </ul>
            </div>
            <FormAulaExperimental
              key={searchParams.modalidade}
              modalidadeInicial={searchParams.modalidade}
              modalidades={modalidades.map((m) => ({ slug: m.slug, nome: m.nome, cor: m.cor }))}
              turmas={turmas.map((t) => ({ id: t.id, modalidade: t.modalidade, rotulo: rotulo(t) }))}
            />
          </div>
        </section>
      </main>

      <Footer />
      <WhatsappFab />
    </>
  );
}

interface TurmaView {
  id: number;
  diasSemana: number[];
  horaInicio: string;
  horaFim: string;
  nivel: string | null;
  professor: string | null;
  valor: string | null;
  vagas: number | null;
  observacoes: string | null;
}

function TabelaTurmas({ turmas }: { turmas: TurmaView[] }) {
  if (!turmas.length) return null;
  return (
    <table className="mt-6 w-full text-left text-sm">
      <caption className="sr-only">Horários das turmas</caption>
      <thead>
        <tr className="border-b-2 border-mar-900 text-mar-900">
          <th className="py-2 pr-3 font-bold">Dias</th>
          <th className="py-2 pr-3 font-bold">Horário</th>
          <th className="hidden py-2 pr-3 font-bold sm:table-cell">Turma</th>
          <th className="py-2 text-right font-bold">Valor</th>
        </tr>
      </thead>
      <tbody>
        {turmas.map((t) => (
          <tr key={t.id} className="border-b border-nuvem-200 align-top">
            <td className="py-3 pr-3 font-semibold text-mar-900">{diasLegiveis(t.diasSemana)}</td>
            <td className="whitespace-nowrap py-3 pr-3 tabular-nums text-mar-800">
              {t.horaInicio} às {t.horaFim}
            </td>
            <td className="hidden py-3 pr-3 text-mar-600 sm:table-cell">
              {[t.nivel, t.professor && `com ${t.professor}`, t.vagas != null && `${t.vagas} vagas`].filter(Boolean).join(", ")}
              {t.observacoes && <span className="block text-xs text-mar-500">{t.observacoes}</span>}
            </td>
            <td className="py-3 text-right font-bold text-laranja-600">{t.valor ?? "Consultar"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
