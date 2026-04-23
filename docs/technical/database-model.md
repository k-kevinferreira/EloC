# Modelagem Inicial do Banco de Dados

## Objetivo

Este documento registra a modelagem inicial do banco de dados com base no arquivo de referencia do dominio do catalogo de joias e do painel administrativo.

O foco desta etapa e estabelecer uma base relacional consistente para:

- catalogo publico
- painel administrativo
- controle financeiro
- remessas
- autenticacao administrativa

## Estado atual da implementacao

No momento, esta modelagem ja esta refletida em:

- `apps/backend/prisma/schema.prisma`
- migration inicial em `apps/backend/prisma/migrations/20260420_init`
- banco local de desenvolvimento `eloc`

O schema foi validado com Prisma e o client foi gerado localmente.

## Fonte de dominio

A modelagem foi derivada do documento funcional e tecnico de referencia do projeto, que define:

- contextos principais do sistema
- entidades do dominio
- relacionamentos
- regras de negocio
- restricoes de integridade

## Entidades modeladas

### Admin

Representa usuarios com acesso ao painel administrativo.

Campos principais:

- identificacao
- nome
- email unico
- hash de senha
- papel de acesso
- timestamps de criacao e atualizacao

### Category

Categoria principal do catalogo.

Campos principais:

- nome
- slug unico
- status de ativacao
- ordem de exibicao

### Subcategory

Subdivisao de uma categoria principal.

Campos principais:

- categoria pai
- nome
- slug unico dentro da categoria
- status de ativacao
- ordem de exibicao

### Product

Entidade central do catalogo publico e da administracao interna.

Campos principais:

- categoria obrigatoria
- subcategoria opcional
- codigo unico
- slug unico
- titulo
- descricao curta opcional
- descricao completa opcional
- preco
- imagem opcional por `imageUrl` simples
- destaque editorial
- status de ativacao
- ordem de exibicao

### SaleEntry

Representa o registro administrativo de uma venda manual. Nao modela checkout online, pedido, carrinho ou fluxo de e-commerce.

Campos principais:

- produto
- quantidade
- preco unitario
- valor total
- forma de pagamento
- status administrativo
- cliente opcional
- observacoes opcionais
- data da venda

### Expense

Representa um gasto operacional, com vinculo opcional a uma remessa.

Campos principais:

- tipo
- descricao
- valor
- data
- observacoes opcionais
- remessa opcional

### Shipment

Representa uma remessa ou pedido feito ao fornecedor.

Campos principais:

- codigo unico
- fornecedor
- data da remessa
- custo total
- observacoes opcionais

### ShipmentItem

Representa os itens vinculados a uma remessa.

Campos principais:

- remessa
- produto
- quantidade
- custo unitario
- custo total

## Relacoes implementadas

- `Category 1:N Subcategory`
- `Category 1:N Product`
- `Subcategory 1:N Product`
- `Product 1:N SaleEntry`
- `Shipment 1:N ShipmentItem`
- `Product 1:N ShipmentItem`
- `Shipment 1:N Expense` com vinculo opcional em `Expense`

## Decisoes tecnicas adotadas

### Identificadores

Foi adotado `UUID` como chave primaria em todas as entidades.

Motivos:

- reduz previsibilidade de identificadores expostos
- facilita integracao futura entre camadas
- evita acoplamento ao incremento sequencial do banco

### Nomenclatura

No Prisma, foram usados:

- modelos em singular e PascalCase
- campos em camelCase

No banco, foi preservado o padrao snake_case com `@map` e `@@map`.

### Tipos monetarios

Campos financeiros usam `Decimal(12,2)`.

Motivo:

- evita erro de precisao de ponto flutuante

### Datas

- campos de auditoria e eventos com horario usam `timestamp with time zone`
- campos estritamente de calendario usam `date`

Aplicacao:

- `createdAt`, `updatedAt`, `soldAt` usam timestamp
- `expenseDate` e `shipmentDate` usam date

### Catalogo publico

O modelo foi ampliado para atender melhor o catalogo publico sem transformar o sistema em e-commerce.

Foram adicionados:

- `Product.slug`
- `Product.description`
- `Product.isFeatured`
- `displayOrder` em categorias, subcategorias e produtos

Motivos:

- URLs amigaveis
- separacao entre descricao curta e detalhada
- destaque editorial na vitrine
- controle de ordenacao sem depender apenas de data de criacao

## Estado atual das imagens de produto

No estado atual do schema, `Product` possui apenas `imageUrl` opcional.

Isso significa:

- o Admin consegue referenciar uma imagem publica por URL
- o frontend publico consegue consumir uma imagem simples por produto
- ainda nao existe modelagem para galeria
- ainda nao existe imagem principal separada de imagens secundarias
- ainda nao existe infraestrutura de upload, storage ou metadados de arquivo

Esse campo atende o ciclo inicial do catalogo, mas deve ser tratado como estrutura provisoria caso o projeto precise de um catalogo publico mais robusto.

## Direcao recomendada para evolucao de imagens

A direcao tecnica mais coerente e evoluir para uma entidade relacional dedicada, por exemplo `ProductImage`.

Campos recomendados para essa futura modelagem:

- `id`
- `productId`
- `url`
- `altText`
- `displayOrder`
- `isPrimary`
- `createdAt`
- `updatedAt`

Beneficios esperados:

- multiplas imagens por produto
- definicao explicita de imagem principal
- ordenacao de galeria
- suporte futuro a acessibilidade e SEO por `altText`
- independencia em relacao ao provider de storage

Decisao importante:

- a modelagem e os contratos devem ser definidos antes do upload
- upload deve ser tratado depois como problema de infraestrutura, nao como substituto da modelagem de dominio

### Registro de vendas

`SaleEntry` foi refinada para representar melhor uma venda administrativa manual.

Em vez de um campo generico de valor, o modelo agora usa:

- `quantity`
- `unitPrice`
- `totalAmount`
- `paymentMethod`
- `status`

Isso reduz ambiguidade e melhora rastreabilidade sem forcar um modelo de pedido completo.

## Restricoes implementadas no banco

### Unicidade

- `Admin.email`
- `Category.slug`
- `Product.code`
- `Product.slug`
- `Shipment.code`
- `Subcategory(categoryId, slug)`

### Indices operacionais

Foram adicionados indices para:

- chaves estrangeiras
- status de exibicao
- destaque
- ordenacao
- data de venda
- forma de pagamento
- status da venda
- tipo de despesa

### Check constraints

Foram adicionadas restricoes de banco para impedir lixo estrutural:

- `Product.price >= 0`
- `SaleEntry.quantity > 0`
- `SaleEntry.unitPrice >= 0`
- `SaleEntry.totalAmount >= 0`
- `SaleEntry.totalAmount = quantity * unitPrice`
- `Shipment.totalCost >= 0`
- `ShipmentItem.quantity > 0`
- `ShipmentItem.unitCost >= 0`
- `ShipmentItem.totalCost >= 0`
- `ShipmentItem.totalCost = quantity * unitCost`
- `Expense.amount >= 0`

Essas restricoes nao substituem o backend, mas aumentam a confiabilidade estrutural do sistema.

## Regras que continuam no backend

Algumas validacoes devem continuar na camada de aplicacao, principalmente nos services:

- verificar se a subcategoria informada pertence realmente a `categoryId` do produto
- calcular `SaleEntry.totalAmount` no backend, sem confiar no valor vindo do frontend
- calcular `ShipmentItem.totalCost` no backend, sem confiar no valor vindo do frontend
- padronizar `paymentMethod`
- padronizar `Expense.type`
- decidir regras de alteracao de `status` da venda

Esses pontos nao devem ser delegados apenas ao frontend.

## Cuidados arquiteturais

- `Dashboard` continua sendo contexto de leitura e agregacao, nao uma tabela
- `Auth` continua representado por `Admin` neste momento
- `paymentMethod`, `Expense.type` e `Admin.role` seguem como `VARCHAR` por enquanto para evitar rigidez prematura
- se esses conjuntos estabilizarem, a evolucao natural e migrar para enums

## Proximos passos recomendados

1. manter `schema.prisma`, migrations e banco real sempre alinhados
2. usar o schema atual como base contratual para o frontend administrativo do catalogo, mas tratar `Product.imageUrl` como estrutura transitoria
3. definir a modelagem futura de imagens de produto e planejar a migracao segura para uma relacao dedicada
4. alinhar os contratos de backend e frontend para leitura e escrita de imagens antes de implementar upload real
5. padronizar valores aceitos para `paymentMethod`, `Expense.type` e `status` antes de expor os modulos financeiros
6. implementar os modulos de runtime para `entries`, `expenses` e `shipments` no backend quando a direcao estrutural das imagens estiver estabilizada

## Ponto de retomada

Se o projeto for retomado depois de uma pausa, o ponto tecnico atual e este:

- banco de dados inicial ja modelado e aplicado localmente
- backend NestJS inicial ja implementado e integrado ao Prisma
- autenticacao administrativa inicial com JWT ja implementada
- modulos de leitura e escrita para `categories`, `subcategories` e `products` ja disponiveis
- proximo passo recomendado: formalizar a evolucao de imagens de produto e seus contratos antes de upload e do frontend publico
