# 06 - Instalação Local

## Pré-requisitos

- Node.js compatível com o projeto.
- npm com suporte a workspaces.
- PostgreSQL instalado e em execução.
- Git.

## Instalação das dependências

Na raiz do projeto:

```bash
npm install
```

## Configuração de ambiente

Backend:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Frontend:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

## Variáveis principais do backend

```env
PORT=3001
API_PREFIX=api
JWT_SECRET=change-me-in-local-development
JWT_EXPIRES_IN=3600
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eloc?schema=public"
UPLOADS_LOCAL_ROOT=uploads
UPLOADS_PUBLIC_BASE_URL=http://localhost:3001/uploads
UPLOADS_MAX_PRODUCT_IMAGE_SIZE_BYTES=5242880
```

## Variáveis principais do frontend

```env
BACKEND_API_URL=http://localhost:3001/api
```

## Configuração do banco

Criar o banco local `eloc` no PostgreSQL ou ajustar `DATABASE_URL` para o banco desejado.

Gerar Prisma Client:

```bash
npm run prisma:generate --workspace @eloc/backend
```

Aplicar migrations:

```bash
npm run prisma:migrate:dev --workspace @eloc/backend
```

Validar schema:

```bash
npm run prisma:validate --workspace @eloc/backend
```

## Seeds e dados iniciais

Criar administrador:

```bash
npm run admin:create --workspace @eloc/backend
```

Popular taxonomia do catálogo:

```bash
npm run catalog:seed-taxonomy --workspace @eloc/backend
```

Popular produtos demonstrativos:

```bash
npm run catalog:seed-demo --workspace @eloc/backend
```

## Iniciar backend

```bash
npm run dev:backend
```

API local:

```text
http://localhost:3001/api
```

## Iniciar frontend

```bash
npm run dev:frontend
```

Frontend local:

```text
http://localhost:3000
```

## Problemas comuns

### Backend request failed with status 404

Verificar se o backend está rodando em `localhost:3001` e se `BACKEND_API_URL` aponta para `http://localhost:3001/api`.

### Erro de autenticação no painel

Criar um administrador com `admin:create` e confirmar `JWT_SECRET` configurado.

### Build do frontend falha ao apagar `.next`

Em Windows/OneDrive pode haver bloqueio temporário de arquivos. Remover `apps/frontend/.next` e executar o build novamente.

### Upload não aparece publicamente

Verificar `UPLOADS_PUBLIC_BASE_URL` e se o backend está servindo `/uploads`.
