import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populando banco de dados...");

  // ---- Quadras ----
  const quadrasExistentes = await prisma.quadra.count();
  if (quadrasExistentes === 0) {
    await prisma.quadra.createMany({
      data: [
        {
          nome: "Quadra de Areia",
          descricao: "Areia fina ao ar livre - beach tennis, vôlei de praia e futevôlei.",
          ativa: true,
        },
        {
          nome: "Quadra Coberta",
          descricao: "Quadra poliesportiva coberta - basquete, futsal, vôlei e queimada.",
          ativa: true,
        },
      ],
    });
    console.log("✅ Quadras criadas");
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

  // ---- Publicações (avisos, notícias, eventos, teatro) ----
  const pubExistentes = await prisma.publicacao.count();
  if (pubExistentes === 0) {
    await prisma.publicacao.createMany({
      data: [
        // Quadro de Avisos (destaque)
        {
          tipo: "AVISO",
          titulo: "Manutenção da Quadra Coberta",
          resumo: "A Quadra Coberta ficará fechada para manutenção do piso nos dias 20 e 21/07.",
          conteudo:
            "Informamos que a Quadra Coberta passará por manutenção preventiva do piso nos dias 20 e 21 de julho. Os agendamentos desse período serão remarcados. Agradecemos a compreensão.",
          destaque: true,
          publicado: true,
        },
        {
          tipo: "AVISO",
          titulo: "Novo horário de funcionamento",
          resumo: "A partir deste mês o espaço funciona das 07h às 22h, todos os dias.",
          destaque: true,
          publicado: true,
        },
        {
          tipo: "AVISO",
          titulo: "Cadastro obrigatório para agendar",
          resumo: "Para reservar uma quadra é necessário criar uma conta e aguardar a aprovação.",
          destaque: true,
          publicado: true,
        },
        // Notícias
        {
          tipo: "NOTICIA",
          titulo: "Oficina gratuita para a comunidade",
          resumo: "Inscrições abertas para a oficina de artesanato e música, gratuita para moradores.",
          conteudo:
            "O CEU abre inscrições para oficinas gratuitas de artesanato, música e dança. As vagas são limitadas e as atividades acontecem no período da tarde. Procure a secretaria para se inscrever.",
          local: "Sala de Oficinas - CEU",
          publicado: true,
        },
        {
          tipo: "NOTICIA",
          titulo: "Espaço recebe novos equipamentos de ginástica",
          resumo: "A área de convivência ganhou novos aparelhos de exercício ao ar livre.",
          publicado: true,
        },
        // Eventos
        {
          tipo: "EVENTO",
          titulo: "Campeonato de Beach Tennis",
          resumo: "Torneio aberto na Quadra de Areia, com premiação para os campeões.",
          conteudo:
            "Venha participar do 1º Campeonato de Beach Tennis do CEU! Inscrições na secretaria. Categorias masculina, feminina e mista.",
          local: "Quadra de Areia",
          dataEvento: new Date("2026-07-19T09:00:00"),
          publicado: true,
        },
        {
          tipo: "EVENTO",
          titulo: "Feira Cultural da Comunidade",
          resumo: "Feira com comidas típicas, música ao vivo e exposição de artesanato local.",
          local: "Praça central do CEU",
          dataEvento: new Date("2026-07-26T16:00:00"),
          publicado: true,
        },
        // Teatro / programação cultural
        {
          tipo: "TEATRO",
          titulo: "Apresentação teatral aberta ao público",
          resumo: "Peça 'Raízes do Sertão' com o grupo de teatro local. Entrada gratuita.",
          conteudo:
            "O grupo de teatro da cidade apresenta 'Raízes do Sertão', um espetáculo sobre cultura e memória. Classificação livre. Chegue com antecedência para garantir lugar.",
          local: "Teatro Municipal",
          dataEvento: new Date("2026-07-12T19:30:00"),
          publicado: true,
        },
        {
          tipo: "TEATRO",
          titulo: "Sarau de Poesia e Música",
          resumo: "Noite de poesia, violão e microfone aberto para a comunidade.",
          local: "Teatro Municipal",
          dataEvento: new Date("2026-07-30T19:00:00"),
          publicado: true,
        },
      ],
    });
    console.log("✅ Publicações (avisos, notícias, eventos, teatro) criadas");
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
