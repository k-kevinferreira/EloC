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
- a autorizacao por papel ja protege as rotas administrativas de escrita do catalogo
- os primeiros modulos de dominio ja foram iniciados e estabilizados para o contexto de catalogo:
  - `admins`
  - `auth`
  - `categories`
  - `subcategories`
  - `products`
- a camada de banco ja possui modelagem inicial, migration e client Prisma gerado
- o banco local `eloc` ja foi criado para desenvolvimento e recebeu a migration inicial

## Proximo passo arquitetural

Com o CRUD administrativo do catalogo agora implementado no frontend sobre os contratos ja consolidados do backend, o proximo passo recomendado e:

- consolidar o padrao tecnico adotado no painel administrativo
- avaliar extracoes reutilizaveis apenas onde a repeticao ja se provou estavel
- expandir os modulos operacionais e financeiros:
  - `entries`
  - `expenses`
  - `shipments`
- continuar refinando tratamento de erro, carregamento e feedback por tela

## Observacao importante

Agora que o backend ja possui runtime inicial, o schema Prisma continua sendo a fonte estrutural do dominio, mas os contratos HTTP e os services do Nest passam a fazer parte da fonte de verdade da aplicacao.
