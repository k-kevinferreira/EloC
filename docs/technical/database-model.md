# Modelagem Inicial do Banco de Dados

## Objetivo

Este documento registra a modelagem inicial do banco de dados com base no arquivo de referência do domínio do catálogo de joias e do painel administrativo.

O foco desta etapa é estabelecer uma base relacional consistente para:

- catálogo público
- painel administrativo
- controle financeiro
- remessas
- autenticação administrativa

## Fonte de domínio

A modelagem foi derivada do documento funcional/técnico de referência do projeto, que define:

- contextos principais do sistema
- entidades do domínio
- relacionamentos
- regras de negócio
- restrições de integridade

## Entidades modeladas

### Admin

Responsável por representar usuários com acesso ao painel administrativo.

Campos principais:

- identificação
- nome
- email único
- hash de senha
- papel de acesso
- timestamps de criação e atualização

### Category

Categoria principal do catálogo.

Responsabilidades:

- organizar o catálogo em grupos macro
- controlar ativação e exibição lógica

### Subcategory

Subdivisão de uma categoria principal.

Responsabilidades:

- refinar navegação do catálogo
- permitir filtragem mais específica dos produtos

Restrição importante:

- `slug` único dentro da categoria, não globalmente

### Product

Entidade central do catálogo.

Campos principais:

- categoria obrigatória
- subcategoria opcional
- código único
- título
- descrição curta opcional
- preço
- imagem opcional
- status de ativação

### SaleEntry

Representa uma entrada financeira decorrente de uma venda registrada.

Campos principais:

- produto
- valor
- forma de pagamento
- cliente opcional
- observações opcionais
- data da venda

### Expense

Representa um gasto operacional.

Campos principais:

- tipo
- descrição
- valor
- data
- observações opcionais
- vínculo opcional com remessa

### Shipment

Representa um pedido ou remessa feita ao fornecedor.

Campos principais:

- código único
- fornecedor
- data da remessa
- custo total
- observações opcionais

### ShipmentItem

Entidade de composição de remessa.

Função:

- vincular produtos à remessa
- registrar quantidade
- registrar custo unitário e custo total

## Relações implementadas

- `Category 1:N Subcategory`
- `Category 1:N Product`
- `Subcategory 1:N Product`
- `Product 1:N SaleEntry`
- `Shipment 1:N ShipmentItem`
- `Product 1:N ShipmentItem`
- `Shipment 1:N Expense` com vínculo opcional do lado de `Expense`

## Decisões técnicas adotadas

### Identificadores

Foi adotado `UUID` como identificador primário em todas as entidades.

Motivos:

- reduz previsibilidade de identificadores expostos
- favorece integração futura entre camadas e ambientes
- evita acoplamento ao incremento sequencial do banco

### Nomenclatura

No Prisma, foram usados:

- nomes de modelos em singular e PascalCase
- nomes de campos em camelCase

No banco, foi preservado o padrão do domínio em snake_case com `@map` e `@@map`.

Motivos:

- ergonomia melhor no TypeScript e no NestJS
- banco continua consistente com convenções SQL e com o documento de domínio

### Tipos monetários

Valores financeiros usam `Decimal(12,2)`.

Motivo:

- evita erro de precisão de ponto flutuante

### Datas

- campos de auditoria e eventos com horário usam `timestamp with time zone`
- campos estritamente de calendário usam `date`

Aplicação:

- `createdAt`, `updatedAt`, `soldAt` usam timestamp
- `expenseDate` e `shipmentDate` usam date

### Exclusão e integridade referencial

Foram definidos comportamentos explícitos de relacionamento:

- `Product -> Category`: `Restrict`
- `Product -> Subcategory`: `SetNull`
- `SaleEntry -> Product`: `Restrict`
- `Expense -> Shipment`: `SetNull`
- `ShipmentItem -> Shipment`: `Cascade`
- `ShipmentItem -> Product`: `Restrict`

Racional:

- preservar histórico financeiro e operacional
- evitar exclusões que quebrem rastreabilidade
- permitir desvinculação opcional quando isso fizer sentido sem apagar histórico

## Restrições implementadas diretamente no schema

- unicidade de `Admin.email`
- unicidade de `Category.slug`
- unicidade de `Product.code`
- unicidade de `Shipment.code`
- unicidade composta de `Subcategory.categoryId + slug`
- índices para chaves estrangeiras e campos usados em filtros operacionais

## Restrições que permanecem como responsabilidade de serviço ou migration manual

Algumas validações do documento de domínio não são expressas diretamente no schema Prisma de forma completa e devem ser garantidas pelo backend e, se necessário, por migration SQL manual:

- `price >= 0`
- `SaleEntry.amount > 0`
- `Expense.amount > 0`
- `ShipmentItem.quantity > 0`
- `ShipmentItem.unitCost >= 0`
- `ShipmentItem.totalCost >= 0`
- coerência entre `Product.categoryId` e a categoria da `Subcategory` vinculada
- coerência entre `Shipment.totalCost` e a soma dos itens da remessa

Esses pontos não devem ser tratados apenas no frontend.

## Cuidados arquiteturais para as próximas etapas

- `Dashboard` não deve virar tabela por padrão; ele é um contexto de leitura e agregação
- `Auth` não exige entidade separada neste momento, porque o acesso administrativo já está representado por `Admin`
- enums não foram introduzidos ainda para `role`, `paymentMethod` e `Expense.type`, porque o domínio ainda não definiu conjuntos fechados de valores
- se esses valores forem estabilizados depois, a migração para enums deve ser feita com critério para não gerar rigidez prematura

## Próximos passos recomendados

1. adicionar dependências reais de Prisma no backend
2. gerar o client Prisma
3. criar a primeira migration
4. implementar `PrismaService` e módulo de integração em `src/prisma`
5. criar DTOs e services respeitando as validações de domínio não cobertas diretamente pelo schema
