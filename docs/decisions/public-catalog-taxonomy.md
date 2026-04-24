# Public Catalog Taxonomy

## Contexto

O site publico do EloC e um catalogo virtual, nao um e-commerce transacional.

A navegacao principal precisa refletir a forma como clientes descobrem as pecas:

- Aneis
- Brincos
- Colares
- Pulseiras

Dentro de cada grupo, as pecas sao organizadas por material/acabamento:

- Prata
- Dourado

## Decisao

A taxonomia publica do catalogo passa a ser fixa:

- `Category` representa o tipo principal da peca:
  - `aneis`
  - `brincos`
  - `colares`
  - `pulseiras`
- `Subcategory` representa o material/acabamento dentro de cada categoria:
  - `prata`
  - `dourado`
- `Product` deve estar vinculado a uma categoria e a uma subcategoria.

## Motivacao

Essa decisao evita que material/acabamento seja tratado como categoria principal e preserva uma navegacao publica mais clara.

Ela tambem mantem a modelagem atual do banco sem migration estrutural, porque a relacao `Category 1:N Subcategory 1:N Product` ja cobre a regra.

## Impacto tecnico

- O backend valida que novas categorias usem apenas os slugs fixos do catalogo publico.
- O backend valida que novas subcategorias usem apenas os slugs fixos de material/acabamento.
- Novas escritas de produto passam a exigir `subcategoryId`.
- O frontend publico usa uma navegacao fixa baseada nos slugs de categoria.
- O painel administrativo passa a tratar subcategoria como material/acabamento.

## Operacao

Para criar ou atualizar a taxonomia fixa no banco local:

```bash
npm run catalog:seed-taxonomy --workspace @eloc/backend
```

O script e idempotente e cria:

- 4 categorias principais
- 2 subcategorias de material/acabamento dentro de cada categoria

## Observacao

Produtos antigos sem subcategoria ainda podem existir enquanto nao houver limpeza de dados.
O contrato de escrita ja impede que novos produtos sejam criados sem material/acabamento.
