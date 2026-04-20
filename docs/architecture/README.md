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
- o backend ainda nao possui aplicacao NestJS completa versionada
- a camada de banco ja possui modelagem inicial, migration e client Prisma gerado
- o banco local `eloc` ja foi criado para desenvolvimento e recebeu a migration inicial

## Proximo passo arquitetural

O proximo passo recomendado e estruturar a base real do backend NestJS para integrar:

- `PrismaService`
- `PrismaModule`
- configuracao base da aplicacao
- primeiros modulos de dominio

## Observacao importante

Enquanto o backend ainda nao estiver com runtime NestJS completo, o banco e a documentacao sao a principal fonte de verdade do dominio atual.
