# Technical Documentation

## Conteudo atual

- `database-model.md`: documenta a modelagem atual do banco, relacoes, restricoes, decisoes tecnicas e proximos passos
- `database-erd.md`: apresenta o ERD textual do banco e aponta para o SQL de exportacao da migration

## Estado tecnico atual

- Prisma instalado no workspace `@eloc/backend`
- schema validado
- Prisma Client gerado
- migration inicial criada e aplicada no banco local
- backend NestJS inicial compilando com sucesso
- `PrismaModule` e `PrismaService` integrados ao runtime
- autenticacao administrativa inicial implementada com JWT e `Passport`
- autorizacao administrativa por papel implementada para rotas de escrita do catalogo
- DTOs e services de leitura e escrita implementados para catalogo
- painel administrativo do frontend com CRUD implementado para `categories`, `subcategories` e `products`
- client HTTP do frontend ajustado para propagar melhor mensagens de validacao do backend

## Retomada recomendada

Ao retomar o projeto, usar esta sequencia:

1. revisar `database-model.md`
2. revisar `apps/backend/prisma/schema.prisma`
3. revisar `apps/backend/src/app.module.ts`
4. revisar os modulos em `apps/backend/src/modules`
5. revisar os modulos administrativos do frontend em `apps/frontend/src/app/(admin)`
6. avancar para os modulos operacionais e financeiros ou consolidar o padrao do painel
