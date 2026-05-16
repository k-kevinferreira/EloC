# Migracao para Supabase Storage

## Objetivo

Migrar os uploads de imagens de produto para Supabase Storage antes da publicacao em producao.

O storage local deve continuar disponivel apenas para desenvolvimento local e fallback operacional. Em producao, o backend deve usar storage externo para evitar perda de imagens em redeploys, reinicios, recriacao de instancia ou ambientes com filesystem efemero.

## Problema atual

O endpoint administrativo `POST /api/admin/uploads/product-images` salva arquivos em disco local:

- raiz configurada por `UPLOADS_LOCAL_ROOT`;
- URL publica montada com `UPLOADS_PUBLIC_BASE_URL`;
- arquivos servidos pelo backend em `/uploads`.

Esse modelo e simples para desenvolvimento, mas e fragil em producao quando:

- o deploy recria containers/instancias;
- nao existe volume persistente;
- o host limpa arquivos temporarios;
- ha mais de uma instancia do backend;
- o path publico muda entre ambientes.

## Decisao recomendada

Usar Supabase Storage como provider de producao para imagens do catalogo.

O contrato externo nao deve mudar:

- o frontend continua enviando imagens para o backend;
- o backend continua retornando `{ filename, url, mimeType, size }`;
- `product_images.url` continua armazenando a URL publica da imagem;
- `Product.imageUrl` permanece apenas como compatibilidade legada ate uma migracao especifica.

## Status da implementacao

Implementado no backend:

- dependencia `@supabase/supabase-js` adicionada ao workspace `@eloc/backend`;
- `UPLOADS_STORAGE_PROVIDER` seleciona `local` ou `supabase`;
- validacao de ambiente exige Supabase em `NODE_ENV=production`;
- provider local preserva o comportamento atual;
- provider Supabase envia imagens para o bucket configurado;
- endpoint administrativo de upload manteve o mesmo contrato de resposta;
- `/uploads` so e servido pelo backend quando o provider ativo e `local`.
- script `uploads:migrate-to-supabase` criado com `dry-run` por padrao.

Ainda pendente antes de producao:

- criar/configurar bucket no Supabase;
- configurar variaveis reais no ambiente de producao;
- executar teste manual de upload em ambiente com `UPLOADS_STORAGE_PROVIDER=supabase`;
- migrar URLs antigas se ja houver imagens locais em producao.

## Contexto operacional atual

Projeto Supabase informado:

```text
project_ref=ppzxtknftcnlpofelbzp
```

MCP Supabase foi adicionado globalmente ao Codex com:

```bash
codex mcp add supabase --url "https://mcp.supabase.com/mcp?project_ref=ppzxtknftcnlpofelbzp&read_only=true&features=docs%2Cdatabase%2Cdevelopment%2Cfunctions%2Cdebugging%2Caccount"
```

Observacoes importantes:

- O MCP foi adicionado com `read_only=true`.
- Com esse modo, ele deve servir para consulta, auditoria e validacao, mas nao para criar bucket, alterar policies ou fazer configuracao completa de Storage.
- `remote_mcp_client_enabled = true` foi habilitado em `C:\Users\Kkevi\.codex\config.toml`.
- Login do MCP `supabase` foi concluido com sucesso via `codex mcp login supabase`.
- Skills Supabase foram instaladas no repositorio via `npx skills add supabase/agent-skills`.
- Skills instaladas:
  - `.agents/skills/supabase`
  - `.agents/skills/supabase-postgres-best-practices`
- Pode ser necessario reiniciar o Codex ou abrir nova sessao para as novas skills/MCP ficarem disponiveis nesta conversa.
- Para configuracao completa pelo Codex, sera necessario adicionar o MCP com permissao de escrita ou executar os passos manualmente no painel do Supabase.
- Nao colar `SUPABASE_SERVICE_ROLE_KEY` no chat. A chave deve ser configurada direto no `.env` local e nas variaveis seguras do ambiente de producao.

## Proximas acoes com Supabase

Quando o MCP estiver disponivel ou quando a configuracao for feita manualmente:

1. Verificar se existe bucket `product-images`.
2. Se nao existir, criar bucket `product-images`.
3. Configurar o bucket como publico para leitura das imagens do catalogo.
4. Garantir que escrita/alteracao/exclusao fiquem restritas ao backend via service role.
5. Confirmar a URL publica do bucket:

```text
https://ppzxtknftcnlpofelbzp.supabase.co/storage/v1/object/public/product-images
```

6. Preencher no backend:

```env
UPLOADS_STORAGE_PROVIDER=supabase
SUPABASE_URL=https://ppzxtknftcnlpofelbzp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<configurar localmente, sem colar no chat>
SUPABASE_STORAGE_BUCKET=product-images
SUPABASE_STORAGE_PUBLIC_BASE_URL=https://ppzxtknftcnlpofelbzp.supabase.co/storage/v1/object/public/product-images
```

7. Subir backend local com essas envs.
8. Fazer upload de uma imagem nova pelo painel admin.
9. Confirmar que a imagem aparece no bucket e no catalogo publico.
10. Rodar `dry-run` da migracao das imagens antigas.
11. Fazer backup do banco.
12. Executar migracao real com `--execute`.
13. Validar catalogo e detalhe dos produtos.

## Arquitetura alvo

```text
Admin frontend
  -> Server Action
    -> Backend POST /api/admin/uploads/product-images
      -> UploadsService valida arquivo
      -> Storage provider selecionado por env
        -> local em desenvolvimento
        -> Supabase Storage em producao
      -> Backend retorna URL publica
      -> Produto salva URL em product_images.url
```

## Variaveis de ambiente propostas

Manter as variaveis atuais para storage local:

```env
UPLOADS_LOCAL_ROOT=uploads
UPLOADS_PUBLIC_BASE_URL=http://localhost:3001/uploads
UPLOADS_MAX_PRODUCT_IMAGE_SIZE_BYTES=5242880
```

Adicionar variavel para escolher o provider:

```env
UPLOADS_STORAGE_PROVIDER=local
```

Em producao:

```env
UPLOADS_STORAGE_PROVIDER=supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_STORAGE_BUCKET=product-images
SUPABASE_STORAGE_PUBLIC_BASE_URL=https://<project-ref>.supabase.co/storage/v1/object/public/product-images
```

Regras:

- `UPLOADS_STORAGE_PROVIDER` deve aceitar apenas `local` ou `supabase`.
- Em `NODE_ENV=production`, `UPLOADS_STORAGE_PROVIDER=supabase` deve ser obrigatorio.
- `SUPABASE_SERVICE_ROLE_KEY` nunca deve ir para o frontend.
- `SUPABASE_STORAGE_BUCKET` deve existir antes do deploy.
- `SUPABASE_STORAGE_PUBLIC_BASE_URL` deve apontar para o bucket publico usado no catalogo.

## Configuracao no Supabase

1. Criar bucket `product-images`.
2. Definir o bucket como publico para imagens de catalogo.
3. Manter escrita restrita ao backend usando `service_role`.
4. Configurar limite operacional de tamanho igual ao backend, hoje `5242880` bytes.
5. Revisar politicas do bucket:
   - leitura publica permitida;
   - escrita, atualizacao e exclusao apenas via service role/backend.

## Plano de implementacao

### Fase 1 - Preparacao

1. Criar bucket no Supabase.
2. Configurar variaveis no ambiente de staging/producao.
3. Instalar SDK oficial no backend, se ainda nao estiver instalado:

```bash
npm install @supabase/supabase-js --workspace @eloc/backend
```

4. Atualizar `.env.example` com as novas variaveis.
5. Atualizar validacao de ambiente em `apps/backend/src/config/env/env.validation.ts`.

### Fase 2 - Abstracao de storage

Criar uma interface interna para provider de upload, por exemplo:

```ts
export type StoredProductImage = {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
};

export interface ProductImageStorage {
  saveProductImage(input: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
    size: number;
  }): Promise<StoredProductImage>;
}
```

Implementar dois providers:

- `LocalProductImageStorage`: comportamento atual.
- `SupabaseProductImageStorage`: upload para Supabase Storage.

O `UploadsService` deve continuar responsavel por:

- validar arquivo;
- validar assinatura do conteudo;
- resolver extensao;
- gerar nome unico;
- delegar persistencia ao provider.

### Fase 3 - Supabase provider

O provider Supabase deve:

1. Montar path estavel, por exemplo:

```text
products/YYYY/MM/product-image-<timestamp>-<uuid>.<ext>
```

2. Enviar o buffer com:

```ts
supabase.storage
  .from(bucket)
  .upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  });
```

3. Retornar URL publica:

```text
<SUPABASE_STORAGE_PUBLIC_BASE_URL>/<path>
```

4. Tratar erros sem expor chave, token, bucket interno ou stack trace para o cliente.

### Fase 4 - Compatibilidade e fallback

Manter storage local para:

- desenvolvimento local;
- testes manuais sem Supabase;
- fallback emergencial controlado.

Nao usar fallback automatico em producao se o Supabase falhar. Em producao, falha de upload deve retornar erro claro para o admin. Fallback automatico pode espalhar imagens entre providers e dificultar auditoria/migracao.

### Fase 5 - Migracao de imagens existentes

Se ja houver imagens locais em producao, migrar antes do corte definitivo:

1. Fazer backup do banco.
2. Listar registros em `product_images.url` que apontam para `/uploads` ou para `UPLOADS_PUBLIC_BASE_URL` antigo.
3. Para cada arquivo existente:
   - localizar arquivo em `UPLOADS_LOCAL_ROOT`;
   - subir para Supabase;
   - atualizar `product_images.url`;
   - atualizar `products.image_url` quando apontar para a imagem legada principal.
4. Gerar relatorio com:
   - total encontrado;
   - total migrado;
   - arquivos ausentes;
   - registros que ficaram pendentes.
5. Validar catalogo publico e pagina de produto.

Essa migracao deve ser feita por script idempotente, com modo `dry-run` antes de alterar dados.

Script disponivel:

```bash
npm run uploads:migrate-to-supabase --workspace @eloc/backend
```

Por padrao ele roda em `dry-run`, lista as URLs locais encontradas e mostra o destino no Supabase sem alterar banco nem enviar arquivos.

Para executar a migracao:

```bash
npm run uploads:migrate-to-supabase --workspace @eloc/backend -- --execute
```

O script atualiza somente:

- `product_images.url`;
- `products.image_url`, apenas quando o valor legado for igual a URL local migrada.

Dados comerciais do produto, como preco, categoria, subcategoria, status, destaque, descricoes, entradas e remessas nao sao alterados.

## Testes recomendados

### Unitarios

- valida MIME permitido;
- bloqueia MIME nao permitido;
- bloqueia extensao divergente do MIME;
- bloqueia arquivo acima do limite;
- valida assinatura JPEG, PNG e WebP;
- provider local retorna URL correta;
- provider Supabase chama bucket/path correto;
- provider Supabase propaga erro controlado.

### Integracao manual

1. `UPLOADS_STORAGE_PROVIDER=local`: upload continua salvando em disco local.
2. `UPLOADS_STORAGE_PROVIDER=supabase`: upload retorna URL publica do Supabase.
3. Criar produto com imagem enviada.
4. Abrir catalogo publico e detalhe do produto.
5. Reiniciar backend e confirmar que a imagem continua carregando.
6. Fazer redeploy em staging e confirmar que imagem continua carregando.

## Checklist antes de producao

- Bucket `product-images` criado no Supabase.
- Bucket publico validado para leitura de catalogo.
- Service role configurada apenas no backend.
- `UPLOADS_STORAGE_PROVIDER=supabase` em producao.
- `SUPABASE_URL` configurada.
- `SUPABASE_SERVICE_ROLE_KEY` configurada.
- `SUPABASE_STORAGE_BUCKET=product-images` configurada.
- `SUPABASE_STORAGE_PUBLIC_BASE_URL` configurada.
- Upload testado no painel admin.
- Imagem validada no catalogo publico.
- Backup do banco realizado antes de migrar URLs antigas.
- Script de migracao executado com `dry-run`.
- Script de migracao executado em producao, se houver imagens locais antigas.
- Logs revisados para garantir que nao imprimem service role key.

## Riscos tecnicos

- Bucket privado quebraria imagens publicas se forem salvas URLs publicas.
- Expor `SUPABASE_SERVICE_ROLE_KEY` no frontend compromete o bucket.
- Fallback automatico em producao pode deixar imagens divididas entre local e Supabase.
- Atualizar URLs no banco sem backup dificulta rollback.
- Remover arquivos locais antes de validar URLs migradas pode causar perda de imagens.

## Rollback

Rollback seguro depende de manter:

- backup do banco antes da migracao;
- arquivos locais originais ate a validacao final;
- env vars antigas de storage local documentadas.

Se o Supabase falhar logo apos o deploy:

1. voltar `UPLOADS_STORAGE_PROVIDER=local`;
2. redeploy do backend;
3. manter produtos ja salvos com URLs do Supabase, pois elas continuam publicas;
4. investigar falha antes de tentar nova migracao.
