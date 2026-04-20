# Architecture

## Visao atual

O projeto esta organizado como um monorepo simples, com separacao entre:

- `apps/frontend`
- `apps/backend`
- `docs`

## Limites entre camadas

- `apps/frontend`: interface publica e administrativa futura, consumo da API e tipagem de contratos
- `apps/backend`: regras de negocio, autenticacao, autorizacao, integracao com banco e contratos centrais
- PostgreSQL + Prisma: persistencia relacional e integridade estrutural do dominio

## Estado atual

- a estrutura do monorepo ja esta consolidada
- o backend ja possui runtime NestJS inicial versionado
- o backend ja integra `ConfigModule`, `PrismaModule` e `PrismaService`
- a autenticacao administrativa inicial com JWT ja esta implementada
- os primeiros modulos de dominio ja foram iniciados:
  - `admins`
  - `auth`
  - `categories`
  - `subcategories`
  - `products`
- a camada de banco ja possui modelagem inicial, migration e client Prisma gerado
- o banco local `eloc` ja foi criado para desenvolvimento e recebeu a migration inicial

## Proximo passo arquitetural

O proximo passo recomendado e evoluir a camada administrativa do backend a partir da base ja estruturada:

- autenticacao administrativa
- autorizacao de rotas protegidas
- operacoes de escrita com regras de negocio
- contratos administrativos para painel

## Observacao importante

Agora que o backend ja possui runtime inicial, o schema Prisma continua sendo a fonte estrutural do dominio, mas os contratos HTTP e os services do Nest passam a fazer parte da fonte de verdade da aplicacao.
