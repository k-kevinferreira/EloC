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
- services concentrando a logica de consulta
- consultas Prisma alinhadas ao schema atual

## Endpoints iniciais

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `GET /api/subcategories`
- `GET /api/products`
- `GET /api/products/:slug`

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

Com a base do runtime pronta, a evolucao mais coerente agora e:

- iniciar operacoes administrativas de escrita com regras de negocio
- aplicar `JwtAuthGuard` nas rotas administrativas de escrita
- consolidar contratos do painel para categorias, subcategorias e produtos
