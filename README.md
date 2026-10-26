# 🌴 Praia do Norte — Aluguel de Quadras e Aulas

Site da **Praia do Norte**, arena de areia em Benfica, Juiz de Fora (MG), com **3 quadras de areia ao ar livre**
e aulas de beach tennis, futevôlei, vôlei de praia e funcional.

Clientes criam uma conta, veem os horários livres em tempo real e pedem a reserva (até **2 horários seguidos**).
O pedido fica **aguardando aprovação** e é enviado à equipe pelo **WhatsApp**, onde também se combina o pagamento.
Na página de aulas é possível se inscrever para uma **aula experimental**. A equipe gerencia tudo por uma
**área administrativa**.

---

## 🧰 Tecnologias

| Camada        | Tecnologia                                         |
| ------------- | -------------------------------------------------- |
| Front-end     | Next.js 14 (App Router) + React + TypeScript       |
| Estilo        | Tailwind CSS, fonte Archivo, tema claro e escuro   |
| Back-end/API  | Route Handlers do Next.js                          |
| Banco         | PostgreSQL via **Prisma ORM**                      |
| Autenticação  | Cookies de sessão assinados (JWT com `jose`)       |
| E-mail        | Webhook do n8n ou SMTP do Brevo (Nodemailer)       |

---

## 🚀 Como rodar

### 1. Pré-requisitos
- Node.js 18+
- Um banco PostgreSQL acessível

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copie o modelo e preencha os valores:
```bash
cp .env.example .env
```
Variáveis principais:
```env
DATABASE_URL="postgresql://usuario:senha@host:5432/agendamentoQuadra?schema=public"
ADMIN_EMAIL="admin@praiadonorte.com.br"
ADMIN_PASSWORD="troque-esta-senha"
AUTH_SECRET="uma-string-aleatoria-bem-longa"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP="5532999999999"         # só dígitos, com DDI + DDD
NEXT_PUBLIC_TELEFONE="(32) 99999-9999"
NEXT_PUBLIC_ENDERECO="Endereço exibido no site"
```
Para e-mails automáticos, preencha `N8N_EMAIL_WEBHOOK_URL` **ou** as variáveis do Brevo (veja `.env.example`).

### 4. Criar as tabelas e popular dados iniciais
```bash
npm run db:push     # cria as tabelas no banco
npm run db:seed     # cria 3 quadras, 4 modalidades de aula e o horário de funcionamento
```

### 5. Rodar
```bash
npm run dev                  # desenvolvimento -> http://localhost:3000
npm run build && npm start   # produção
```

### Scripts úteis
| Comando             | O que faz                                        |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Servidor de desenvolvimento                      |
| `npm run build`     | Gera o Prisma Client e compila para produção     |
| `npm start`         | Sobe a build de produção                         |
| `npm run db:push`   | Sincroniza o schema com o banco                  |
| `npm run db:seed`   | Popula quadras, modalidades e horários           |
| `npm run db:studio` | Abre o Prisma Studio (ver/editar o banco)        |
| `npm run db:reset`  | **Apaga tudo** e recria do zero + seed           |

---

## 🔐 Acesso administrativo
- URL: **`/admin/login`**
- Credenciais: `ADMIN_EMAIL` e `ADMIN_PASSWORD` do `.env`. **Use uma senha forte em produção.**

---

## 🗺️ Páginas

| Rota            | Descrição                                                                      |
| --------------- | ------------------------------------------------------------------------------ |
| `/`             | Home: modalidades, quadras, recados, torneios, eventos e contato               |
| `/aulas`        | Modalidades de aula e inscrição para aula experimental (abre o WhatsApp)       |
| `/cadastro`     | Criação de conta (aprovada pela equipe antes de poder reservar)                |
| `/login`        | Entrada do cliente                                                             |
| `/agendar`      | Escolha de quadra, data e horário, com valor da hora e total                   |
| `/minha-conta`  | Dados do cliente e suas reservas, com status e envio do pedido pelo WhatsApp   |
| `/cancelar`     | Buscar reserva pelo código e **cancelar ou remarcar**                          |
| `/admin/login`  | Login do administrador                                                         |
| `/admin`        | Painel administrativo (abas abaixo)                                            |

### Abas do painel
- **Painel:** agenda do dia, totais e ativar/desativar quadras.
- **Reservas:** lista filtrável por data, quadra e status; confirmar (avisa o cliente no WhatsApp), cancelar, excluir.
- **Usuários:** aprovar ou recusar cadastros.
- **Aulas:** criar, editar, ocultar e excluir modalidades (cor, ilustração, textos e ordem), com prévia ao vivo.
- **Quadro de Avisos, Notícias, Eventos e Torneios:** publicações exibidas na home.
- **Horários e valores:** funcionamento e **valor da hora de quadra por dia da semana**.
- **Bloqueios:** datas ou horários indisponíveis (feriado, manutenção, evento), por quadra ou geral.

---

## 📐 Regras de agendamento

- ✅ Só clientes com cadastro **aprovado** podem reservar.
- ✅ Reserva de **1 ou no máximo 2 horários seguidos**, com até **14 dias** de antecedência.
- ✅ **Não é possível reservar horário ocupado** (checagem de sobreposição dentro de transação).
- ✅ **O mesmo horário em quadras diferentes é permitido** (o conflito é por quadra).
- ✅ Toda reserva nasce **pendente**; a equipe confirma no admin.
- ✅ O valor é **valor da hora do dia × horas**, guardado na reserva no momento do pedido.
- ✅ **Pagamento só presencialmente ou pelo WhatsApp**; o site não faz cobrança.
- ✅ Respeita horários de funcionamento e bloqueios; não permite reservas no passado.

---

## 🗄️ Banco de dados

Tabelas (nome no Postgres entre parênteses):

- **Usuario** (`usuarios`): conta do cliente, com status `PENDENTE | APROVADO | REJEITADO`
- **Cliente** (`clientes`): dados de contato ligados às reservas
- **Quadra** (`quadras`): `nome, descricao, ativa`
- **Agendamento** (`agendamentos`): quadra, data, horário, modalidade, `valor_total`, `status`, `codigo`
- **HorarioFuncionamento** (`horarios_funcionamento`): por dia da semana, com `valor_hora`
- **Bloqueio** (`bloqueios`): data e horário bloqueados, por quadra ou geral
- **Modalidade** (`modalidades`): modalidades de aula exibidas no site
- **Turma** (`turmas`): estrutura de turmas por modalidade (sem tela no admin no momento)
- **Publicacao** (`publicacoes`): avisos, notícias, eventos e torneios
- **Pagamento** (`pagamentos`): estrutura pronta para evolução

`status` do agendamento: `PENDENTE | CONFIRMADO | CANCELADO`.
Cada reserva recebe um **código único**, usado para cancelar ou remarcar sem login.

---

## 🔌 API (resumo)

### Público e cliente
- `GET  /api/quadras` · `GET /api/publicacoes`
- `GET  /api/disponibilidade?data=YYYY-MM-DD&quadraId=1` — horários livres e valor da hora do dia
- `POST /api/usuarios/cadastro` · `POST /api/usuarios/login` · `POST /api/usuarios/logout`
- `GET/PATCH /api/me` — dados do cliente logado
- `GET  /api/usuarios/minhas-reservas`
- `POST /api/agendamentos` — cria pedido de reserva (cliente logado e aprovado)
- `GET/PATCH/DELETE /api/reservas/:codigo` — consultar, remarcar, cancelar

### Administrativo (exige sessão de admin)
- `POST /api/admin/login` · `POST /api/admin/logout`
- `GET  /api/admin/dashboard?data=`
- `GET  /api/admin/agendamentos?data=&quadraId=&status=` · `PATCH/DELETE /api/admin/agendamentos/:id`
- `GET  /api/admin/usuarios` · `PATCH/DELETE /api/admin/usuarios/:id`
- `GET/POST /api/admin/quadras` · `PATCH/DELETE /api/admin/quadras/:id`
- `GET/PUT  /api/admin/horarios` — horários e valor da hora por dia
- `GET/POST /api/admin/bloqueios` · `DELETE /api/admin/bloqueios/:id`
- `GET/POST /api/admin/modalidades` · `PUT/PATCH/DELETE /api/admin/modalidades/:id`
- `GET/POST /api/admin/publicacoes` · `PATCH/DELETE /api/admin/publicacoes/:id`
- `GET/POST /api/admin/turmas` · `PUT/PATCH/DELETE /api/admin/turmas/:id`

---

## 📁 Estrutura do projeto
```
prisma/
  schema.prisma        # modelo do banco
  seed.ts              # dados iniciais (quadras, modalidades, horários, publicações)
src/
  lib/                 # prisma, auth, horários, config/contatos, modalidades, e-mail
  components/          # Header, Footer, Logo, ilustrações, tema, formulários, admin
  middleware.ts        # protege /admin, /api/admin, /agendar e /minha-conta
  app/
    page.tsx           # home
    aulas/             # aulas e aula experimental
    agendar/           # pedido de reserva
    cadastro/ login/ minha-conta/ cancelar/
    admin/             # login + painel
    api/               # rotas de back-end
```

---

## 🔒 Nota de segurança
- O `.env` está no `.gitignore`: **nunca** versione credenciais.
- Troque `ADMIN_PASSWORD` e `AUTH_SECRET` antes de ir para produção.
- Esta build usa **Next.js 14.2.35** (última correção da linha 14.2). Algumas advisories de DoS do Next
  só são corrigidas no Next 15/16. Em um servidor exposto, avalie migrar para a versão mais recente.
