# 04 - Banco de Dados

## Visão geral

O banco PostgreSQL é modelado via Prisma. O schema principal está em `apps/backend/prisma/schema.prisma` e as migrations versionadas estão em `apps/backend/prisma/migrations`.

## Entidades

### Admin

Tabela: `admins`

Campos principais:

- `id`: UUID, chave primária.
- `name`: nome do administrador.
- `email`: e-mail único.
- `passwordHash`: hash da senha.
- `role`: papel administrativo.
- `createdAt` e `updatedAt`: controle temporal.

### Category

Tabela: `categories`

Campos principais:

- `id`: UUID, chave primária.
- `name`: nome da categoria.
- `slug`: slug único.
- `isActive`: status de exibição.
- `displayOrder`: ordenação no catálogo.

Relacionamentos:

- Uma categoria possui várias subcategorias.
- Uma categoria possui vários produtos.

### Subcategory

Tabela: `subcategories`

Campos principais:

- `id`: UUID, chave primária.
- `categoryId`: chave estrangeira para `categories`.
- `name`: nome da subcategoria.
- `slug`: slug da subcategoria.
- `isActive`: status de exibição.
- `displayOrder`: ordenação.

Constraints:

- `categoryId + slug` deve ser único.

### Product

Tabela: `products`

Campos principais:

- `id`: UUID, chave primária.
- `categoryId`: chave estrangeira para `categories`.
- `subcategoryId`: chave estrangeira opcional para `subcategories`.
- `code`: código único.
- `slug`: slug único.
- `title`: título do produto.
- `shortDescription`: descrição curta.
- `description`: descrição completa.
- `price`: preço decimal.
- `imageUrl`: campo legado de imagem principal.
- `isFeatured`: destaque.
- `isActive`: status.
- `displayOrder`: ordenação.

Relacionamentos:

- Produto pertence a uma categoria.
- Produto pode pertencer a uma subcategoria.
- Produto possui várias imagens.
- Produto pode ter entradas e itens de remessa.

### ProductImage

Tabela: `product_images`

Campos principais:

- `id`: UUID, chave primária.
- `productId`: chave estrangeira para `products`.
- `url`: URL da imagem.
- `altText`: texto alternativo.
- `displayOrder`: ordenação.
- `isPrimary`: imagem principal.

### SaleEntry

Tabela: `sales_entries`

Campos principais:

- `id`: UUID, chave primária.
- `productId`: chave estrangeira para `products`.
- `quantity`: quantidade.
- `unitPrice`: valor unitário.
- `totalAmount`: total calculado.
- `paymentMethod`: forma de pagamento.
- `status`: status da entrada.
- `customerName`: cliente, opcional.
- `notes`: observações.
- `soldAt`: data da venda/entrada.

### Expense

Tabela: `expenses`

Campos principais:

- `id`: UUID, chave primária.
- `shipmentId`: chave estrangeira opcional para `shipments`.
- `type`: tipo da despesa.
- `description`: descrição.
- `amount`: valor.
- `expenseDate`: data.
- `notes`: observações.

### Shipment

Tabela: `shipments`

Campos principais:

- `id`: UUID, chave primária.
- `code`: código único.
- `supplier`: fornecedor.
- `shipmentDate`: data da remessa.
- `totalCost`: custo total calculado.
- `notes`: observações.

Relacionamentos:

- Uma remessa possui vários itens.
- Uma remessa pode possuir despesas vinculadas.

### ShipmentItem

Tabela: `shipment_items`

Campos principais:

- `id`: UUID, chave primária.
- `shipmentId`: chave estrangeira para `shipments`.
- `productId`: chave estrangeira para `products`.
- `quantity`: quantidade.
- `unitCost`: custo unitário.
- `totalCost`: custo total calculado.

## Migrations

Migrations existentes:

- `20260420_init`: estrutura inicial do domínio, catálogo, entradas, despesas e remessas.
- `20260423_add_product_images`: estrutura relacional de imagens de produto e migração de `image_url` para `product_images`.

Arquivo de lock:

- `apps/backend/prisma/migrations/migration_lock.toml`

## Seeds e scripts

Scripts disponíveis no backend:

- `admin:create`: cria administrador.
- `catalog:seed-taxonomy`: cria categorias e subcategorias da taxonomia.
- `catalog:seed-demo`: cria produtos demonstrativos.

## Instruções úteis

Validar schema:

```bash
npm run prisma:validate --workspace @eloc/backend
```

Gerar Prisma Client:

```bash
npm run prisma:generate --workspace @eloc/backend
```

Aplicar migrations em desenvolvimento:

```bash
npm run prisma:migrate:dev --workspace @eloc/backend
```

Aplicar migrations em produção:

```bash
npm run prisma:migrate:deploy --workspace @eloc/backend
```

## ERD

O ERD pode ser gerado a partir de `apps/backend/prisma/schema.prisma` usando ferramentas compatíveis com Prisma ou dbdiagram. Documento gráfico final: Pendente de validação.
