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
- o Admin e o catalogo publico ja consomem `images[]` como contrato principal de produto
- o backend ja possui upload administrativo inicial de imagens de produto com storage local

## Proximo passo arquitetural

Com a modelagem relacional de imagens de produto ja implementada, o Admin e o catalogo publico ajustados para `images[]`, e o upload local inicial disponivel no backend, o proximo passo recomendado e de integracao:

- revisar se o backend precisa de serializacao publica especifica para produto
- manter `imageUrl` apenas como compatibilidade transitoria enquanto houver algum ponto legado dependente
- integrar o upload administrativo ao formulario de produtos no frontend

So depois disso faz sentido:

- revisar a troca futura do storage local por um provider externo
- revisar se alguma primitiva reutilizavel do painel realmente merece extracao
- expandir os modulos operacionais e financeiros:
  - `entries`
  - `expenses`
  - `shipments`

## Observacao importante

Agora que o backend ja possui runtime inicial, o schema Prisma continua sendo a fonte estrutural do dominio, mas os contratos HTTP e os services do Nest passam a fazer parte da fonte de verdade da aplicacao.
