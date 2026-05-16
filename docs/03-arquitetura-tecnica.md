# 03 - Arquitetura Técnica

## Visão geral

O projeto usa monorepo simples com separação entre frontend, backend e documentação. A regra de negócio fica no backend, enquanto o frontend consome contratos HTTP e organiza a experiência pública e administrativa.

## Frontend

- Framework: Next.js com App Router.
- Linguagem: TypeScript.
- Estilo: Tailwind CSS.
- Rotas públicas em `apps/frontend/src/app/(public)`.
- Rotas administrativas em `apps/frontend/src/app/(admin)`.
- Componentes administrativos em `apps/frontend/src/components/admin`.
- Serviços HTTP em `apps/frontend/src/services`.
- Configuração de API em `apps/frontend/src/lib/config/env.ts`.

## Backend

- Framework: NestJS.
- Linguagem: TypeScript.
- ORM: Prisma.
- Banco: PostgreSQL.
- Módulos de domínio em `apps/backend/src/modules`.
- Prisma em `apps/backend/src/prisma`.
- Configurações em `apps/backend/src/config`.
- Scripts operacionais em `apps/backend/src/scripts`.

## Banco de dados

- Provider Prisma: PostgreSQL.
- Schema: `apps/backend/prisma/schema.prisma`.
- Migrations: `apps/backend/prisma/migrations`.

## Separação de responsabilidades

- Frontend:
  - renderização das páginas;
  - formulários administrativos;
  - feedback de erro ao usuário;
  - armazenamento seguro da sessão em cookie `httpOnly`;
  - chamada dos serviços do backend.
- Backend:
  - validação de entrada;
  - autenticação;
  - autorização por papel;
  - regras de negócio;
  - persistência via Prisma;
  - cálculo de totais financeiros e operacionais.
- Banco:
  - integridade relacional;
  - unicidade de códigos e slugs;
  - relacionamentos entre catálogo, entradas, despesas e remessas.

## Fluxo geral da aplicação

1. Cliente acessa catálogo público.
2. Frontend consulta backend usando `BACKEND_API_URL`.
3. Backend consulta PostgreSQL via Prisma.
4. Administrador acessa `/admin/login`.
5. Frontend envia credenciais para `/auth/login`.
6. Token retornado é gravado em cookie `httpOnly`.
7. Rotas protegidas usam a sessão para consumir endpoints administrativos.

## Fluxo de autenticação

- Endpoint de login: `POST /api/auth/login`.
- Endpoint de perfil autenticado: `GET /api/auth/me`.
- Header esperado pelo backend: `Authorization: Bearer <token>`.
- O frontend encapsula o token em cookie `httpOnly`, evitando exposição direta em JavaScript do navegador.

## Padrões adotados

- Controllers NestJS enxutos.
- Services concentram regra de negócio.
- DTOs validam entrada.
- Prisma centraliza acesso ao banco.
- Server Actions do Next.js são usadas para operações administrativas do frontend.
- Erros do backend são propagados para mensagens úteis no frontend.

## Principais módulos

- `auth`: login, JWT, perfil autenticado.
- `admins`: acesso aos administradores no banco.
- `categories`: categorias públicas e administrativas.
- `subcategories`: subcategorias públicas e administrativas.
- `products`: produtos públicos e administrativos.
- `uploads`: upload de imagens de produto; local em desenvolvimento e storage externo em producao.
- `entries`: entradas financeiras administrativas.
- `expenses`: despesas administrativas.
- `shipments`: remessas administrativas.
- `catalog-taxonomy`: slugs fixos aceitos para categorias e materiais.

## Pontos de atenção arquitetural

- Upload local deve ser substituido por Supabase Storage antes de producao. Plano: `docs/technical/supabase-storage-migration.md`.
- O dashboard pode evoluir para endpoint próprio no backend se os dados crescerem.
- A compatibilidade legada com `Product.imageUrl` deve ser removida apenas após migração segura dos dados.
