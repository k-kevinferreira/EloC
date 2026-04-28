# 07 - Deploy em Produção

## Plataformas recomendadas

Para este projeto, a composição recomendada é:

- Frontend: Vercel.
- Backend: Railway ou Render.
- Banco: PostgreSQL gerenciado.
- Uploads: volume persistente no backend ou storage externo.

## Deploy do frontend

Configurar no projeto da Vercel:

```env
BACKEND_API_URL=https://url-do-backend/api
```

Configuração recomendada para monorepo:

```text
Root Directory: apps/frontend
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: padrão da Vercel
```

Build local equivalente:

```bash
npm run build:frontend
```

## Deploy do backend no Railway

Como o projeto é um monorepo, o backend deve ser criado a partir da raiz do repositório.

Configuração recomendada:

```text
Root Directory: /
Install Command: npm ci --include=dev
Build Command: npm run build --workspace @eloc/backend
Start Command: npm run start:prod --workspace @eloc/backend
```

O script de build do backend executa `prisma generate` automaticamente antes do `nest build`. Isso é necessário porque os tipos do Prisma, como `Admin`, `ProductWhereInput` e `SaleEntryInclude`, só existem depois que o Prisma Client é gerado no ambiente de build.

## Variáveis de produção do backend

```env
PORT=3001
API_PREFIX=api
JWT_SECRET=<segredo-forte>
JWT_EXPIRES_IN=3600
DATABASE_URL=<url-postgresql-producao>
UPLOADS_LOCAL_ROOT=/data/uploads
UPLOADS_PUBLIC_BASE_URL=https://url-do-backend/uploads
UPLOADS_MAX_PRODUCT_IMAGE_SIZE_BYTES=5242880
```

Para usar imagens no Railway com storage local, criar um volume persistente e montar em:

```text
/data
```

Sem volume persistente, imagens enviadas podem ser perdidas em reinícios, rebuilds ou recriação da instância.

## Banco de dados

- Usar PostgreSQL em produção.
- Manter backups automáticos.
- Aplicar migrations com `prisma:migrate:deploy`.
- Não usar `prisma:migrate:dev` em produção.
- Não editar migrations antigas manualmente.

Aplicar migrations:

```bash
npm run prisma:migrate:deploy --workspace @eloc/backend
```

## Criação do administrador inicial

Após o backend estar conectado ao banco de produção, criar um administrador:

```bash
npm run admin:create --workspace @eloc/backend
```

Esse comando deve ser executado em ambiente seguro, com acesso às variáveis de produção.

## CORS

Pendente de validação.

O backend atual não configura CORS explicitamente em `main.ts`. Como o frontend usa chamadas server-side para a API, isso pode ser suficiente no fluxo atual. Se houver chamadas diretas do navegador para o backend, configurar CORS permitindo apenas o domínio oficial do frontend.

## Domínio

Pendente de validação.

Sugestão:

- Frontend: `https://seudominio.com`
- Backend: `https://api.seudominio.com`
- Uploads: `https://api.seudominio.com/uploads`

## Checklist antes de publicar

- Definir `JWT_SECRET` forte.
- Definir `DATABASE_URL` de produção.
- Definir `BACKEND_API_URL` no frontend.
- Definir `UPLOADS_PUBLIC_BASE_URL`.
- Confirmar volume persistente ou storage externo para uploads.
- Executar `npm run lint --workspace @eloc/frontend`.
- Executar `npm run build:frontend`.
- Executar `npm run build:backend`.
- Executar `npm run prisma:validate --workspace @eloc/backend`.
- Executar `npm run prisma:migrate:deploy --workspace @eloc/backend`.
- Criar administrador inicial.
- Confirmar estratégia de backup do banco.

## Checklist depois de publicar

- Acessar página inicial pública.
- Acessar catálogo.
- Abrir detalhe de produto.
- Fazer login administrativo.
- Criar ou editar categoria.
- Criar ou editar produto com imagem.
- Registrar entrada.
- Registrar despesa.
- Registrar remessa.
- Validar imagens públicas.
- Validar HTTPS.

## Problemas comuns

### Erro: Prisma não exporta `Admin`, `ProductWhereInput` ou tipos similares

Causa: Prisma Client não foi gerado no ambiente de build.

Correção: garantir que o build execute `prisma generate` antes de `nest build`. O backend já possui `prebuild` para isso:

```bash
npm run build --workspace @eloc/backend
```

### Frontend na Vercel mostra erro de servidor

Causa provável: `BACKEND_API_URL` ausente ou apontando para backend inexistente.

Correção: publicar o backend, testar `/api/health` e configurar a URL real na Vercel.

## Riscos conhecidos

- Storage local exige volume persistente.
- Sem storage externo, imagens podem ser perdidas em deploys efêmeros.
- Sem CORS explícito, chamadas diretas do navegador ao backend podem falhar se forem adicionadas futuramente.
