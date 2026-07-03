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
          nome: "Quadra 1",
          descricao: "Quadra de areia coberta - ideal para beach tennis e vôlei de praia.",
          ativa: true,
        },
        {
          nome: "Quadra 2",
          descricao: "Quadra de areia coberta - ideal para futevôlei e treinos.",
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
