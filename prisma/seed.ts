import { PrismaClient } from "@prisma/client";
import { MODALIDADES_PADRAO } from "../src/lib/aulas";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populando banco de dados...");

  // ---- Quadras ----
  const quadrasExistentes = await prisma.quadra.count();
  if (quadrasExistentes === 0) {
    await prisma.quadra.createMany({
      data: ["Quadra 1", "Quadra 2", "Quadra 3"].map((nome) => ({
        nome,
        descricao: "Quadra de areia ao ar livre",
        ativa: true,
      })),
    });
    console.log("✅ Quadras criadas");
  }

  // ---- Modalidades de aula ----
  if ((await prisma.modalidade.count()) === 0) {
    await prisma.modalidade.createMany({ data: MODALIDADES_PADRAO });
    console.log("✅ Modalidades de aula criadas");
  }

  // ---- Horários de funcionamento (seg a dom, 07:00 às 22:00) ----
  // 0 = domingo ... 6 = sábado
  for (let dia = 0; dia <= 6; dia++) {
    await prisma.horarioFuncionamento.upsert({
      where: { diaSemana: dia },
      update: {},
      create: {
        diaSemana: dia,
        horaInicio: "07:00",
        horaFim: "22:00",
        ativo: true,
      },
    });
  }
  console.log("✅ Horários de funcionamento configurados (07:00–22:00, todos os dias)");

  // ---- Publicações (avisos, novidades, eventos, torneios) ----
  const pubExistentes = await prisma.publicacao.count();
  if (pubExistentes === 0) {
    await prisma.publicacao.createMany({
      data: [
        // Quadro de Avisos (destaque)
        {
          tipo: "AVISO",
          titulo: "Pagamento presencial ou pelo WhatsApp",
          resumo: "O pagamento das reservas e aulas é feito pessoalmente na arena ou pelo WhatsApp.",
          destaque: true,
          publicado: true,
        },
        {
          tipo: "AVISO",
          titulo: "Aula experimental",
          resumo: "Quer começar no beach tennis, futevôlei ou vôlei? Agende sua aula experimental pelo site.",
          destaque: true,
          publicado: true,
        },
        {
          tipo: "AVISO",
          titulo: "Cadastro obrigatório para agendar",
          resumo: "Para alugar uma quadra é necessário criar uma conta e aguardar a aprovação.",
          destaque: true,
          publicado: true,
        },
        // Novidades
        {
          tipo: "NOTICIA",
          titulo: "Turmas de funcional na areia",
          resumo: "Novas turmas de funcional para quem quer ganhar condicionamento com o pé na areia.",
          publicado: true,
        },
        // Eventos
        {
          tipo: "EVENTO",
          titulo: "Queimada na Praia",
          resumo: "Tarde de queimada na areia, aberta para todo mundo. Chama a galera!",
          local: "Praia do Norte",
          dataEvento: new Date("2026-11-15T15:00:00"),
          publicado: true,
        },
        // Torneios (tipo TEATRO no banco)
        {
          tipo: "TEATRO",
          titulo: "Torneio Super Elite",
          resumo: "Torneio com premiação em dinheiro: 1º lugar leva R$ 1.000,00.",
          local: "Praia do Norte",
          dataEvento: new Date("2026-10-31T08:00:00"),
          publicado: true,
        },
      ],
    });
    console.log("✅ Publicações (avisos, novidades, eventos, torneios) criadas");
  }

  console.log("🎉 Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
