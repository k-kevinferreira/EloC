# Frontend Admin Catalog Pattern

## Contexto

O painel administrativo do catalogo passou da fase de leitura para escrita em `categories`, `subcategories` e `products`.

Nesse ponto, surgia a decisao de arquitetura no frontend:

- criar uma infra generica de CRUD logo no primeiro ciclo
- ou implementar um padrao claro por modulo e adiar abstracoes ate existir repeticao estavel

## Decisao

Foi adotado o seguinte padrao para o CRUD administrativo do catalogo no frontend:

- cada modulo administrativo possui sua propria `page.tsx`
- cada pagina concentra suas `server actions`
- a integracao com a API fica em `services` server-side autenticados
- os payloads de escrita sao tipados em `types`
- o frontend faz validacao basica de interface
- a regra de negocio permanece no backend

## Motivacao

Essa escolha foi feita para:

- preservar clareza arquitetural
- evitar abstracoes prematuras
- manter contratos explicitos entre frontend e backend
- facilitar revisao tecnica por modulo
- permitir validar o padrao em mais de um contexto antes de extrair infraestrutura compartilhada

## Consequencias praticas

Beneficios:

- cada fluxo de escrita fica facil de localizar e revisar
- a responsabilidade de cada camada permanece clara
- o backend continua como fonte de verdade do dominio
- o padrao ja se mostrou suficiente para `categories`, `subcategories` e `products`

Custos aceitos:

- existe duplicacao estrutural entre formularios e actions
- alguns componentes administrativos ainda nao compartilham primitivas comuns

## Regra de continuidade

A duplicacao atual e aceitavel enquanto:

- ela estiver restrita ao primeiro ciclo do painel
- os modulos ainda estiverem consolidando o padrao
- nao houver abstração compartilhada claramente justificada por uso recorrente

Quando os modulos de `entries`, `expenses` e `shipments` avancarem, essa decisao deve ser revisitada para avaliar:

- quais partes realmente se provaram estaveis
- quais utilitarios ou componentes valem extrair
- quais repeticoes ainda sao especificas de dominio e devem permanecer locais
