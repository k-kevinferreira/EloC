# EloC

Monorepo simples para organizar o frontend e o backend do projeto de forma clara, profissional e escalável, sem introduzir complexidade desnecessária.

## Visão geral

O repositório está estruturado para centralizar:

- `apps/frontend`: aplicação web em Next.js com TypeScript e Tailwind CSS
- `apps/backend`: API em NestJS com TypeScript, Prisma e PostgreSQL
- `docs`: documentação funcional, técnica, arquitetura e decisões do projeto

O objetivo desta organização é facilitar manutenção, onboarding, revisão técnica e crescimento do sistema por uma equipe pequena.

## Stack

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript
- Banco de dados: PostgreSQL
- ORM: Prisma

## Estado atual

O repositório agora possui a base estrutural do monorepo, a primeira etapa do banco de dados concluída e o bootstrap inicial do backend implementado.

Situação atual:

- monorepo organizado em `apps/frontend`, `apps/backend` e `docs`
- Prisma instalado no backend
- `schema.prisma` modelado a partir do domínio do catálogo de joias
- migration inicial criada em `apps/backend/prisma/migrations/20260428_init`
- banco local `eloc` utilizado no desenvolvimento; para novos ambientes, aplicar a migration com `prisma:migrate:deploy`
- documentação técnica do banco registrada em `docs/technical/database-model.md`
- backend NestJS inicial configurado com `ConfigModule`, `PrismaModule` e healthcheck
- autenticação administrativa inicial implementada com JWT
- autorização administrativa por papel implementada para rotas de escrita do catálogo
- primeiros módulos de domínio iniciados no backend:
  - `admins`
  - `auth`
  - `categories`
  - `subcategories`
  - `products`
- operações administrativas de escrita disponíveis para:
  - `categories`
  - `subcategories`
  - `products`
- frontend administrativo base implementado com Next.js, App Router e Tailwind CSS
- autenticação administrativa do frontend integrada ao backend com cookie `httpOnly`
- fluxo de sessão do frontend ajustado para o App Router sem mutação indevida de cookies durante renderização
- shell administrativo revisado para melhor responsividade e hierarquia visual em desktop e mobile
- painel administrativo do catálogo agora com escrita disponível para:
  - `dashboard`
  - `categories`
  - `subcategories`
  - `products`
- produtos agora possuem base relacional de imagens via `ProductImage`
- o Admin já envia `images[]` como contrato principal, ainda com URLs manuais e sem upload real
- `Product.imageUrl` permanece apenas como compatibilidade transitoria
- o frontend público consome `images[]` como fonte principal, com fallback controlado para `imageUrl`
- backend possui upload administrativo inicial de imagens de produto com storage local
- formulário administrativo de produtos já integra upload e preenche `images[]` automaticamente
- módulos administrativos iniciais implementados para:
  - `entries`
  - `expenses`
  - `shipments`
- tratamento de erro do cliente HTTP do frontend ajustado para expor melhor mensagens de validação do backend
- dashboard administrativo consolida totais de catálogo, entradas, despesas e remessas

Pendências atuais de desenvolvimento:

- refinar UX de upload no formulário de produtos e planejar storage externo futuro
- planejar a remoção futura da compatibilidade com `Product.imageUrl` depois da estabilização dos dados
- consolidar primitivas reutilizáveis do painel administrativo sem abstrair cedo demais
- padronizar ainda mais formulários, feedback de erro e estados de carregamento do painel
- refinar a UI do painel por tela conforme os módulos crescerem, sem reabrir a base do shell sem necessidade
- evoluir edição completa, filtros e refinamentos de UX dos contextos financeiros e operacionais (`entries`, `expenses`, `shipments`)

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

Configuração necessária:

- copiar `apps/frontend/.env.example` para `apps/frontend/.env.local`
- definir `BACKEND_API_URL=http://localhost:3001/api`
- subir o backend antes de acessar o login administrativo

## Como rodar o backend

Quando a API backend estiver com o código de aplicação e dependências instaladas em `apps/backend`, use:

```bash
npm install
npm run dev:backend
```

Comandos de banco já disponíveis no backend:

```bash
npm run prisma:validate --workspace @eloc/backend
npm run prisma:generate --workspace @eloc/backend
npm run prisma:migrate:dev --workspace @eloc/backend
npm run prisma:migrate:deploy --workspace @eloc/backend
```

## Como retomar depois

Se o projeto for retomado em outra sessão, consultar primeiro:

- `docs/codex-guide.md`
- `docs/technical/database-model.md`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/README.md`

Próximo passo recomendado no retorno:

- refinar a experiência de upload no Admin e planejar a troca futura do storage local, mantendo `imageUrl` apenas como fallback legado até haver plano seguro de remoção

## Checklist de deploy

Antes de publicar:

- definir `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `UPLOADS_PUBLIC_BASE_URL` e demais variáveis de ambiente fora do código
- usar um `JWT_SECRET` forte em produção; o valor do `.env.example` é apenas local
- executar `npm run prisma:migrate:deploy --workspace @eloc/backend` no ambiente de produção
- executar `npm run build:backend` e `npm run build:frontend`
- configurar `BACKEND_API_URL` no frontend apontando para a API pública de produção
- planejar storage persistente para uploads; o storage local funciona em VPS/volume persistente, mas não é ideal para ambientes serverless ou instâncias efêmeras

## Convenções básicas

- manter nomes de pastas e arquivos em inglês
- concentrar regra de negócio no backend, especialmente em `services` dos módulos
- evitar duplicação entre frontend e backend
- manter documentação de arquitetura e decisões atualizada em `docs`
- não criar `packages/` compartilhados antes de existir necessidade real
- preservar contratos claros entre API, banco e frontend
- manter aliases de import e configurações de build apontando para `apps/frontend` e `apps/backend`

## Observação importante

Os placeholders `.gitkeep` foram removidos quando deixaram de representar estrutura útil. A organização do monorepo agora deve ser mantida por código real, migrations, documentação e diretórios efetivamente utilizados.
