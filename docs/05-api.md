# 05 - API

## Base URL

Local:

```text
http://localhost:3001/api
```

Produção: Pendente de validação.

## Autenticação

Rotas públicas não exigem autenticação.

Rotas administrativas exigem:

```http
Authorization: Bearer <token>
```

O token é obtido em `POST /auth/login`.

## Headers

Para JSON:

```http
Content-Type: application/json
```

Para upload de imagem:

```http
Content-Type: multipart/form-data
```

## Endpoints gerais

### Healthcheck

```http
GET /health
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

## Autenticação

### Login

```http
POST /auth/login
```

Body:

```json
{
  "email": "admin@exemplo.com",
  "password": "senha-segura"
}
```

Resposta de sucesso:

```json
{
  "accessToken": "jwt",
  "admin": {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@exemplo.com",
    "role": "admin"
  }
}
```

### Perfil autenticado

```http
GET /auth/me
```

Exige autenticação.

## Categorias

### Listar categorias

```http
GET /categories?isActive=true
```

Query:

- `isActive`: boolean opcional.

### Criar categoria

```http
POST /admin/categories
```

Exige papel `admin` ou `super_admin`.

Body:

```json
{
  "name": "Anéis",
  "slug": "aneis",
  "isActive": true,
  "displayOrder": 0
}
```

### Atualizar categoria

```http
PATCH /admin/categories/:id
```

### Remover categoria

```http
DELETE /admin/categories/:id
```

Exige papel `super_admin`.

## Subcategorias

### Listar subcategorias

```http
GET /subcategories?categoryId=uuid&isActive=true
```

### Criar subcategoria

```http
POST /admin/subcategories
```

Body:

```json
{
  "categoryId": "uuid",
  "name": "Prata 925",
  "slug": "prata-925",
  "isActive": true,
  "displayOrder": 0
}
```

### Atualizar subcategoria

```http
PATCH /admin/subcategories/:id
```

### Remover subcategoria

```http
DELETE /admin/subcategories/:id
```

Exige papel `super_admin`.

## Produtos

### Listar produtos

```http
GET /products?categoryId=uuid&subcategorySlug=prata-925&isActive=true&isFeatured=true&search=anel&limit=20&offset=0
```

Query:

- `categoryId`
- `subcategoryId`
- `subcategorySlug`
- `isActive`
- `isFeatured`
- `search`
- `limit`
- `offset`

### Buscar produto por slug

```http
GET /products/:slug
```

### Criar produto

```http
POST /admin/products
```

Body:

```json
{
  "categoryId": "uuid",
  "subcategoryId": "uuid",
  "code": "ANEL-001",
  "slug": "anel-prata-001",
  "title": "Anel de Prata",
  "shortDescription": "Descrição curta",
  "description": "Descrição completa",
  "price": 129.9,
  "images": [
    {
      "url": "http://localhost:3001/uploads/products/imagem.jpg",
      "altText": "Anel de prata",
      "displayOrder": 0,
      "isPrimary": true
    }
  ],
  "isFeatured": true,
  "isActive": true,
  "displayOrder": 0
}
```

### Atualizar produto

```http
PATCH /admin/products/:id
```

### Remover produto

```http
DELETE /admin/products/:id
```

Exige papel `super_admin`.

## Uploads

### Upload de imagem de produto

```http
POST /admin/uploads/product-images
```

Exige autenticação e papel `admin` ou `super_admin`.

Body: `multipart/form-data`

Campo:

- `file`: arquivo de imagem.

## Entradas

### Listar entradas

```http
GET /admin/entries?productId=uuid&status=paid&paymentMethod=pix&search=cliente&limit=50&offset=0
```

### Criar entrada

```http
POST /admin/entries
```

Body:

```json
{
  "productId": "uuid",
  "quantity": 1,
  "unitPrice": 129.9,
  "paymentMethod": "pix",
  "status": "paid",
  "customerName": "Cliente",
  "notes": "Observação",
  "soldAt": "2026-04-28T00:00:00.000Z"
}
```

### Atualizar entrada

```http
PATCH /admin/entries/:id
```

### Remover entrada

```http
DELETE /admin/entries/:id
```

Exige papel `super_admin`.

## Despesas

### Listar despesas

```http
GET /admin/expenses?shipmentId=uuid&type=frete&search=texto&limit=50&offset=0
```

### Criar despesa

```http
POST /admin/expenses
```

Body:

```json
{
  "shipmentId": null,
  "type": "frete",
  "description": "Despesa de frete",
  "amount": 50,
  "expenseDate": "2026-04-28",
  "notes": null
}
```

### Atualizar despesa

```http
PATCH /admin/expenses/:id
```

### Remover despesa

```http
DELETE /admin/expenses/:id
```

Exige papel `super_admin`.

## Remessas

### Listar remessas

```http
GET /admin/shipments?search=fornecedor&limit=50&offset=0
```

### Criar remessa

```http
POST /admin/shipments
```

Body:

```json
{
  "code": "REM-001",
  "supplier": "Fornecedor",
  "shipmentDate": "2026-04-28",
  "notes": "Observação",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10
    }
  ]
}
```

`unitCost` é opcional. Se não for enviado, o backend usa o preço atual do produto.

### Atualizar remessa

```http
PATCH /admin/shipments/:id
```

### Remover remessa

```http
DELETE /admin/shipments/:id
```

Exige papel `super_admin`.

## Respostas de erro

Erros comuns:

- `400 Bad Request`: payload inválido.
- `401 Unauthorized`: token ausente ou inválido.
- `403 Forbidden`: papel sem permissão.
- `404 Not Found`: registro não encontrado.
- `409 Conflict`: conflito de unicidade ou vínculo existente.

## Observações de segurança

- Não expor `JWT_SECRET`.
- Usar HTTPS em produção.
- Usar variáveis de ambiente para URLs e credenciais.
- Restringir remoções sensíveis ao papel `super_admin`.
