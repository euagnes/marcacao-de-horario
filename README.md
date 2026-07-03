# 🏐 Praça CEU — Sistema de Agendamento de Quadras de Areia

Site completo de agendamentos para uma empresa com **2 quadras de areia cobertas**.
Clientes veem horários disponíveis em tempo real, reservam (até **2 horários seguidos**),
recebem confirmação e podem **cancelar ou remarcar**. Há uma **área administrativa**
para gerenciar reservas, quadras, horários de funcionamento e bloqueios.

---

## 🧰 Tecnologias

| Camada        | Tecnologia                                  |
| ------------- | ------------------------------------------- |
| Front-end     | Next.js 14 (App Router) + React + TypeScript |
| Estilo        | Tailwind CSS (paleta praia/areia/mar)       |
| Back-end/API  | Route Handlers do Next.js                   |
| Banco         | PostgreSQL via **Prisma ORM**               |
| Autenticação  | Cookie de sessão assinado (JWT com `jose`)  |

---

## 🚀 Como rodar

### 1. Pré-requisitos
- Node.js 18+ (testado no Node 24)
- Um banco PostgreSQL acessível

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copie o modelo e ajuste os valores:
```bash
cp .env.example .env
```
Variáveis principais (no `.env`):
```env
DATABASE_URL="postgresql://usuario:senha@host:5432/agendamentoQuadra?schema=public"
ADMIN_EMAIL="admin@ceu.com.br"
ADMIN_PASSWORD="troque-esta-senha"
AUTH_SECRET="uma-string-aleatoria-bem-longa"
NEXT_PUBLIC_WHATSAPP="5575999998888"        # só dígitos, com DDI+DDD
NEXT_PUBLIC_TELEFONE="(75) 99999-8888"
NEXT_PUBLIC_ENDERECO="Endereço exibido no site"
```

### 4. Criar as tabelas e popular dados iniciais
```bash
npm run db:push     # cria as tabelas no banco
npm run db:seed     # cria 2 quadras + horário de funcionamento (07h–22h todos os dias)
```

### 5. Rodar
```bash
npm run dev         # desenvolvimento  -> http://localhost:3000
# ou
npm run build && npm start   # produção
```

### Scripts úteis
| Comando            | O que faz                                            |
| ------------------ | ---------------------------------------------------- |
| `npm run dev`      | Servidor de desenvolvimento                          |
| `npm run build`    | Gera o Prisma Client e compila para produção         |
| `npm start`        | Sobe a build de produção                             |
| `npm run db:push`  | Sincroniza o schema com o banco                      |
| `npm run db:seed`  | Popula quadras e horários                            |
| `npm run db:studio`| Abre o Prisma Studio (visualizar/editar o banco)     |
| `npm run db:reset` | **Apaga tudo** e recria do zero + seed               |

---

## 🔐 Acesso administrativo
- URL: **`/admin/login`**
- Credenciais padrão: definidas em `ADMIN_EMAIL` / `ADMIN_PASSWORD` no `.env`
  (padrão do seed: `admin@ceu.com.br` / `ceu@2026` — **troque em produção!**)

---

## 🗺️ Páginas

| Rota              | Descrição                                                            |
| ----------------- | ------------------------------------------------------------------- |
| `/`               | Página inicial: empresa, quadras, contatos, WhatsApp, "Agendar"     |
| `/agendar`        | Calendário, horários livres, escolha de quadra e formulário         |
| `/cancelar`       | Buscar reserva por código e **cancelar / remarcar**                 |
| `/admin/login`    | Login do administrador                                              |
| `/admin`          | Painel: agenda do dia, reservas, quadras, horários, bloqueios       |

---

## 📐 Regras de agendamento (implementadas)

- ✅ Cliente escolhe o horário e pode reservar **1 ou no máximo 2 horários seguidos**.
- ✅ **Não é possível reservar um horário já ocupado** (checagem de sobreposição em transação).
- ✅ **Mesmo horário em quadras diferentes é permitido** (conflito é por quadra).
- ✅ Cliente pode **cancelar ou remarcar** sua reserva pelo código (com confirmação).
- ✅ Horários de funcionamento são **configuráveis pelo administrador** (por dia da semana).
- ✅ **Bloqueio manual** de datas/horários (feriado, manutenção, evento) — por quadra ou geral.
- ✅ Não permite reservas no passado.

---

## 🗄️ Banco de dados (modelo)

Tabelas (nomes reais no Postgres entre parênteses):

- **Cliente** (`clientes`): `id, nome, telefone, email, criado_em`
- **Quadra** (`quadras`): `id, nome, descricao, ativa`
- **Agendamento** (`agendamentos`): `id, cliente_id, quadra_id, data, hora_inicio, hora_fim, status, observacoes, codigo, criado_em`
- **HorarioFuncionamento** (`horarios_funcionamento`): `id, dia_semana, hora_inicio, hora_fim, ativo`
- **Bloqueio** (`bloqueios`): `id, quadra_id, data, hora_inicio, hora_fim, motivo`
- **Pagamento** (`pagamentos`): `id, agendamento_id, valor, metodo_pagamento, status_pagamento, criado_em`

`status` do agendamento: `PENDENTE | CONFIRMADO | CANCELADO`.
Cada reserva recebe um **código único** que o cliente usa para gerenciar sem login.

---

## 🔌 API (resumo)

### Público
- `GET  /api/quadras` — lista quadras ativas
- `GET  /api/disponibilidade?data=YYYY-MM-DD&quadraId=1` — horários livres
- `POST /api/agendamentos` — cria reserva
- `GET    /api/reservas/:codigo` — consulta reserva
- `PATCH  /api/reservas/:codigo` — remarcar
- `DELETE /api/reservas/:codigo` — cancelar

### Administrativo (exige sessão)
- `POST /api/admin/login` · `POST /api/admin/logout`
- `GET  /api/admin/dashboard?data=` — resumo do dia
- `GET  /api/admin/agendamentos?data=&quadraId=&status=` — lista filtrável
- `PATCH/DELETE /api/admin/agendamentos/:id` — confirmar/cancelar/editar/excluir
- `GET/POST /api/admin/quadras` · `PATCH/DELETE /api/admin/quadras/:id`
- `GET/PUT  /api/admin/horarios`
- `GET/POST /api/admin/bloqueios` · `DELETE /api/admin/bloqueios/:id`

---

## ✨ Funcionalidades extras incluídas
- Botão flutuante e links de **contato via WhatsApp** (com mensagem pré-preenchida).
- Botão para **enviar a confirmação por WhatsApp** após reservar.
- **Histórico/gestão** de reservas pelo código.
- **Filtros** por quadra, data e status no painel.
- Painel com **totais**: reservas do dia, confirmadas, pendentes e total geral.
- Tabela `pagamentos` pronta para **PIX/dinheiro/cartão** (estrutura disponível para evolução).

---

## 📁 Estrutura do projeto
```
prisma/
  schema.prisma        # modelo do banco
  seed.ts              # dados iniciais (quadras + horários)
src/
  lib/                 # prisma client, auth, helpers de horário, config
  components/          # Header, Footer, Logo, Calendário, botão WhatsApp
  middleware.ts        # protege /admin e /api/admin
  app/
    page.tsx           # página inicial
    agendar/           # fluxo de agendamento
    cancelar/          # cancelar / remarcar
    admin/             # login + painel
    api/               # rotas de back-end
```

---

## 🔒 Nota de segurança
- O `.env` está no `.gitignore` — **nunca** versione credenciais.
- Esta build usa **Next.js 14.2.35** (última correção da linha 14.2). Algumas advisories
  de DoS do Next só são corrigidas no Next 15/16 (atualização *major*). Para um
  ambiente self-hosted exposto, avalie migrar para o Next mais recente quando possível.
- Troque `ADMIN_PASSWORD` e `AUTH_SECRET` antes de ir para produção.
