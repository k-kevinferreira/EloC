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

Quando o app frontend estiver com o codigo de aplicacao e dependencias instaladas em `apps/frontend`, use:

```bash
npm install
npm run dev:frontend
```

## Como rodar o backend

Quando a API backend estiver com o codigo de aplicacao e dependencias instaladas em `apps/backend`, use:

```bash
npm install
npm run dev:backend
```

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
