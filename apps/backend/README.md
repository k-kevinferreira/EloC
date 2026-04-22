# Backend

API do projeto.

Estrutura interna atual:

- `prisma`: schema, migrations e artefatos de banco
- `src/common`: utilitarios e elementos reutilizaveis de infraestrutura
- `src/config`: configuracoes da aplicacao
- `src/modules`: modulos de negocio
- `src/prisma`: camada de integracao com Prisma no runtime

## Estado atual

O backend agora possui uma base real em NestJS com:

- bootstrap da aplicacao em `src/main.ts`
- `AppModule` com `ConfigModule` global
- `PrismaModule` e `PrismaService` conectando o runtime ao banco
- healthcheck em `GET /api/health`
- autenticacao administrativa com JWT
- modulos iniciais de dominio:
  - `admins`
  - `auth`
  - `categories`
  - `subcategories`
  - `products`

Esses modulos comecam a camada de dominio com:

- controllers enxutos
- DTOs para validacao de entrada
- services concentrando a logica de consulta e escrita administrativa
- consultas Prisma alinhadas ao schema atual
- protecao por autenticacao e autorizacao por papel nas rotas administrativas de escrita

## Endpoints iniciais

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `GET /api/subcategories`
- `GET /api/products`
- `GET /api/products/:slug`

## Endpoints administrativos do catalogo

Esses endpoints exigem `Bearer token` administrativo. Criacao e edicao aceitam `admin` e `super_admin`. Exclusao fica restrita a `super_admin`.

- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `POST /api/admin/subcategories`
- `PATCH /api/admin/subcategories/:id`
- `DELETE /api/admin/subcategories/:id`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`

Exemplos de filtros ja suportados:

- `GET /api/categories?isActive=true`
- `GET /api/subcategories?categoryId=<uuid>&isActive=true`
- `GET /api/products?isFeatured=true&limit=12`
- `GET /api/products?search=anel`

Exemplo de login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@eloc.local\",\"password\":\"<senha>\"}"
```

## Prisma

Comandos principais do banco de dados:

- `npm run prisma:validate --workspace @eloc/backend`
- `npm run prisma:generate --workspace @eloc/backend`
- `npm run prisma:migrate:dev --workspace @eloc/backend`
- `npm run prisma:migrate:deploy --workspace @eloc/backend`

Configuracao local:

- copiar a referencia de `apps/backend/.env.example` para `apps/backend/.env` quando necessario
- garantir que o PostgreSQL local esteja acessivel pela `DATABASE_URL`
- definir `JWT_SECRET` com um valor forte fora do codigo
- definir `JWT_EXPIRES_IN` em segundos

## Observacao sobre primeiro admin

Esta entrega implementa autenticacao, mas nao cria um endpoint publico para cadastro administrativo inicial por questao de seguranca.

O primeiro admin deve ser criado por um caminho controlado, por exemplo:

- script administrativo interno
- insercao manual via Prisma Studio
- seed futura dedicada

Script disponivel agora:

```bash
npm run admin:create --workspace @eloc/backend -- --name="Admin" --email="admin@eloc.local" --password="senha-forte" --role="super_admin"
```

## Proximo passo recomendado

Com a base administrativa do catalogo pronta, a evolucao mais coerente agora e:

- iniciar o frontend administrativo consumindo esses contratos protegidos
- padronizar tratamento de erros e feedback de formulario no painel
- evoluir os modulos de `entries`, `expenses` e `shipments`
