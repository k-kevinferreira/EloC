# EloC

Monorepo simples para organizar o frontend e o backend do projeto de forma clara, profissional e escalavel, sem introduzir complexidade desnecessaria.

## Visao geral

O repositorio esta estruturado para centralizar:

- `apps/frontend`: aplicacao web em Next.js com TypeScript e Tailwind CSS
- `apps/backend`: API em NestJS com TypeScript, Prisma e PostgreSQL
- `docs`: documentacao funcional, tecnica, arquitetura e decisoes do projeto

O objetivo desta organizacao e facilitar manutencao, onboarding, revisao tecnica e crescimento do sistema por uma equipe pequena.

## Stack

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript
- Banco de dados: PostgreSQL
- ORM: Prisma

## Estado atual

O repositorio agora possui a base estrutural do monorepo, a primeira etapa do banco de dados concluida e o bootstrap inicial do backend implementado.

Situacao atual:

- monorepo organizado em `apps/frontend`, `apps/backend` e `docs`
- Prisma instalado no backend
- `schema.prisma` modelado a partir do dominio do catalogo de joias
- migration inicial criada em `apps/backend/prisma/migrations/20260420_init`
- banco local `eloc` criado e migration inicial aplicada em PostgreSQL local
- documentacao tecnica do banco registrada em `docs/technical/database-model.md`
- backend NestJS inicial configurado com `ConfigModule`, `PrismaModule` e healthcheck
- autenticacao administrativa inicial implementada com JWT
- autorizacao administrativa por papel implementada para rotas de escrita do catalogo
- primeiros modulos de dominio iniciados no backend:
  - `admins`
  - `auth`
  - `categories`
  - `subcategories`
  - `products`
- operacoes administrativas de escrita disponiveis para:
  - `categories`
  - `subcategories`
  - `products`
- frontend administrativo base implementado com Next.js, App Router e Tailwind CSS
- autenticacao administrativa do frontend integrada ao backend com cookie `httpOnly`
- fluxo de sessao do frontend ajustado para o App Router sem mutacao indevida de cookies durante renderizacao
- shell administrativo revisado para melhor responsividade e hierarquia visual em desktop e mobile
- painel administrativo do catalogo agora com escrita disponivel para:
  - `dashboard`
  - `categories`
  - `subcategories`
  - `products`
- produtos agora possuem base relacional de imagens via `ProductImage`
- o Admin ja envia `images[]` como contrato principal, ainda com URLs manuais e sem upload real
- `Product.imageUrl` permanece apenas como compatibilidade transitoria
- o frontend publico consome `images[]` como fonte principal, com fallback controlado para `imageUrl`
- backend possui upload administrativo inicial de imagens de produto com storage local
- formulario administrativo de produtos ja integra upload e preenche `images[]` automaticamente
- modulos administrativos iniciais implementados para:
  - `entries`
  - `expenses`
  - `shipments`
- tratamento de erro do cliente HTTP do frontend ajustado para expor melhor mensagens de validacao do backend
- dashboard administrativo consolida totais de catalogo, entradas, despesas e remessas

Pendencias atuais de desenvolvimento:

- refinar UX de upload no formulario de produtos e planejar storage externo futuro
- planejar a remocao futura da compatibilidade com `Product.imageUrl` depois da estabilizacao dos dados
- consolidar primitivas reutilizaveis do painel administrativo sem abstrair cedo demais
- padronizar ainda mais formularios, feedback de erro e estados de carregamento do painel
- refinar a UI do painel por tela conforme os modulos crescerem, sem reabrir a base do shell sem necessidade
- evoluir edicao completa, filtros e refinamentos de UX dos contextos financeiros e operacionais (`entries`, `expenses`, `shipments`)

## Estrutura do monorepo

```text
root/
|-- apps/
|   |-- frontend/
|   |   |-- src/
|   |   |   |-- app/
|   |   |   |-- components/
|   |   |   |-- hooks/
|   |   |   |-- lib/
|   |   |   |-- services/
|   |   |   |-- types/
|   |   |   `-- utils/
|   |   |-- package.json
|   |   `-- README.md
|   `-- backend/
|       |-- prisma/
|       |-- src/
|       |   |-- common/
|       |   |-- config/
|       |   |-- modules/
|       |   `-- prisma/
|       |-- package.json
|       `-- README.md
|-- docs/
|   |-- architecture/
|   |-- decisions/
|   |-- functional/
|   `-- technical/
|-- .gitignore
|-- README.md
`-- package.json
```

## Como rodar o frontend

Para rodar o frontend administrativo:
  
```bash
npm install
npm run dev:frontend
```

Configuracao necessaria:

- copiar `apps/frontend/.env.example` para `apps/frontend/.env.local`
- definir `BACKEND_API_URL=http://localhost:3001/api`
- subir o backend antes de acessar o login administrativo

## Como rodar o backend

Quando a API backend estiver com o codigo de aplicacao e dependencias instaladas em `apps/backend`, use:

```bash
npm install
npm run dev:backend
```

Comandos de banco ja disponiveis no backend:

```bash
npm run prisma:validate --workspace @eloc/backend
npm run prisma:generate --workspace @eloc/backend
npm run prisma:migrate:dev --workspace @eloc/backend
npm run prisma:migrate:deploy --workspace @eloc/backend
```

## Como retomar depois

Se o projeto for retomado em outra sessao, consultar primeiro:

- `docs/codex-guide.md`
- `docs/technical/database-model.md`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/README.md`

Proximo passo recomendado no retorno:

- refinar a experiencia de upload no Admin e planejar a troca futura do storage local, mantendo `imageUrl` apenas como fallback legado ate haver plano seguro de remocao

## Convencoes basicas

- manter nomes de pastas e arquivos em ingles
- concentrar regra de negocio no backend, especialmente em `services` dos modulos
- evitar duplicacao entre frontend e backend
- manter documentacao de arquitetura e decisoes atualizada em `docs`
- nao criar `packages/` compartilhados antes de existir necessidade real
- preservar contratos claros entre API, banco e frontend
- manter aliases de import e configuracoes de build apontando para `apps/frontend` e `apps/backend`

## Observacao importante

Este repositorio esta versionando a estrutura com arquivos placeholder, porque o Git nao rastreia diretorios vazios. Isso garante que o monorepo continue consistente para qualquer pessoa que clone o projeto.
