# Backend

API do projeto.

Estrutura interna prevista:

- `prisma`: schema, migrations e artefatos de banco
- `src/common`: utilitarios e elementos reutilizaveis de infraestrutura
- `src/config`: configuracoes da aplicacao
- `src/modules`: modulos de negocio
- `src/prisma`: camada de integracao com Prisma no runtime

## Prisma

Comandos principais do banco de dados:

- `npm run prisma:validate --workspace @eloc/backend`
- `npm run prisma:generate --workspace @eloc/backend`
- `npm run prisma:migrate:dev --workspace @eloc/backend`
- `npm run prisma:migrate:deploy --workspace @eloc/backend`

Configuracao local:

- copiar a referencia de `apps/backend/.env.example` para `apps/backend/.env` quando necessario
- garantir que o PostgreSQL local esteja acessivel pela `DATABASE_URL`
