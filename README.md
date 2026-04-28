# EloC

Sistema web para catálogo público e painel administrativo da EloC Pratas e Semijoias.

## Descrição

O projeto entrega uma aplicação web com catálogo de produtos, páginas públicas de navegação e painel administrativo protegido para gestão de categorias, subcategorias, produtos, entradas financeiras, despesas e remessas.

## Stack utilizada

- Frontend: Next.js, TypeScript e Tailwind CSS
- Backend: NestJS e TypeScript
- Banco de dados: PostgreSQL
- ORM: Prisma
- Estrutura: monorepo com workspaces npm

## Estrutura do projeto

```text
apps/
  frontend/   Aplicação Next.js
  backend/    API NestJS, Prisma e scripts operacionais
docs/         Documentação final do projeto
```

## Como rodar localmente

1. Instalar dependências:

```bash
npm install
```

2. Configurar variáveis de ambiente:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

3. Configurar o banco PostgreSQL e aplicar migrations:

```bash
npm run prisma:generate --workspace @eloc/backend
npm run prisma:migrate:dev --workspace @eloc/backend
```

4. Criar um administrador:

```bash
npm run admin:create --workspace @eloc/backend
```

5. Iniciar backend e frontend:

```bash
npm run dev:backend
npm run dev:frontend
```

Por padrão:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/api`

## Comandos principais

```bash
npm run dev:frontend
npm run dev:backend
npm run build:frontend
npm run build:backend
npm run prisma:validate --workspace @eloc/backend
npm run prisma:generate --workspace @eloc/backend
npm run prisma:migrate:deploy --workspace @eloc/backend
```

## Documentação

- [01 - Escopo e requisitos](docs/01-escopo-e-requisitos.md)
- [02 - Regras de negócio](docs/02-regras-de-negocio.md)
- [03 - Arquitetura técnica](docs/03-arquitetura-tecnica.md)
- [04 - Banco de dados](docs/04-banco-de-dados.md)
- [05 - API](docs/05-api.md)
- [06 - Instalação local](docs/06-instalacao-local.md)
- [07 - Deploy em produção](docs/07-deploy-producao.md)
- [08 - Manual do administrador](docs/08-manual-do-administrador.md)
- [09 - Termo de entrega e aceite](docs/09-termo-de-entrega-e-aceite.md)
- [10 - Manutenção e garantia](docs/10-manutencao-e-garantia.md)

## Observações importantes

- As rotas administrativas dependem de autenticação JWT.
- O frontend guarda a sessão administrativa em cookie `httpOnly`.
- O storage de uploads é local no backend. Para produção em ambiente efêmero ou serverless, recomenda-se storage externo.
- As migrations versionadas em `apps/backend/prisma/migrations` devem ser preservadas.
- Arquivos `.env` não devem ser versionados.
