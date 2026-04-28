# 07 - Deploy em Produção

## Plataformas recomendadas

Pendente de validação.

Opções compatíveis:

- Frontend: Vercel, Render, Railway ou VPS com Node.
- Backend: Render, Railway, Fly.io, VPS ou container Node.
- Banco: PostgreSQL gerenciado.
- Uploads: volume persistente em VPS ou storage externo.

## Deploy do frontend

Configurar:

```env
BACKEND_API_URL=https://api.seudominio.com/api
```

Build:

```bash
npm run build:frontend
```

Start:

```bash
npm run start --workspace @eloc/frontend
```

## Deploy do backend

Configurar variáveis de produção:

```env
PORT=3001
API_PREFIX=api
JWT_SECRET=<segredo-forte>
JWT_EXPIRES_IN=3600
DATABASE_URL=<url-postgresql-producao>
UPLOADS_LOCAL_ROOT=uploads
UPLOADS_PUBLIC_BASE_URL=https://api.seudominio.com/uploads
UPLOADS_MAX_PRODUCT_IMAGE_SIZE_BYTES=5242880
```

Build:

```bash
npm run build:backend
```

Aplicar migrations:

```bash
npm run prisma:migrate:deploy --workspace @eloc/backend
```

Start:

```bash
npm run start:prod --workspace @eloc/backend
```

## Banco de dados

- Usar PostgreSQL em produção.
- Manter backups automáticos.
- Aplicar migrations com `prisma:migrate:deploy`.
- Não usar `prisma:migrate:dev` em produção.
- Não editar migrations antigas manualmente.

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
- Executar `npm run lint --workspace @eloc/frontend`.
- Executar `npm run build:frontend`.
- Executar `npm run build:backend`.
- Executar `npm run prisma:validate --workspace @eloc/backend`.
- Executar `npm run prisma:migrate:deploy --workspace @eloc/backend`.
- Criar administrador inicial.
- Confirmar estratégia de backup do banco.
- Confirmar estratégia de persistência dos uploads.

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

## Riscos conhecidos

- Storage local exige volume persistente.
- Sem storage externo, imagens podem ser perdidas em deploys efêmeros.
- Sem CORS explícito, chamadas diretas do navegador ao backend podem falhar se forem adicionadas futuramente.
