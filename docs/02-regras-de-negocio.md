# 02 - Regras de Negócio

## Autenticação e permissões

- O login administrativo é feito por e-mail e senha.
- A senha deve ter pelo menos 8 caracteres no DTO de login.
- O backend autentica com JWT.
- O frontend armazena a sessão administrativa em cookie `httpOnly`.
- Rotas administrativas usam `JwtAuthGuard`.
- Operações administrativas usam `RolesGuard`.
- Papéis existentes:
  - `admin`
  - `super_admin`

## Regras gerais de cadastro

- Entradas são validadas no backend com DTOs e `ValidationPipe`.
- Campos não previstos nos DTOs são rejeitados por `forbidNonWhitelisted`.
- Slugs são normalizados para minúsculas.
- Códigos são normalizados antes de persistir.
- Textos são aparados antes de salvar.

## Categorias

- Categorias possuem nome, slug, status ativo e ordem de exibição.
- O slug deve conter letras minúsculas, números e hífens simples.
- O slug da categoria deve pertencer à taxonomia fixa definida no backend.
- O slug deve ser único.
- Categorias são listadas por ordem de exibição e nome.
- Exclusão é bloqueada se houver subcategorias ou produtos vinculados.
- Exclusão de categorias fixas é bloqueada.
- Exclusão administrativa exige papel `super_admin`.

## Subcategorias

- Subcategorias pertencem a uma categoria.
- O slug deve conter letras minúsculas, números e hífens simples.
- O slug da subcategoria deve pertencer à taxonomia fixa de materiais definida no backend.
- O slug é único dentro da categoria, não globalmente.
- Exclusão é bloqueada se houver produtos vinculados.
- Exclusão de materiais fixos é bloqueada.
- Exclusão administrativa exige papel `super_admin`.

## Produtos

- Produto pertence a uma categoria e a uma subcategoria compatível.
- Código do produto deve ser único.
- Slug do produto deve ser único.
- Preço deve ser maior ou igual a zero.
- O backend exige subcategoria para criação de produto.
- Ao alterar categoria, uma subcategoria compatível deve ser informada quando necessário.
- Produto pode ser ativo ou inativo.
- Produto pode ser marcado como destaque.
- Produto pode ter múltiplas imagens.
- Apenas uma imagem primária é permitida por produto.
- Se nenhuma imagem primária for marcada, a primeira imagem enviada vira primária.
- `Product.imageUrl` permanece como compatibilidade legada, mas `ProductImage` é a fonte principal.
- Exclusão é bloqueada se houver entradas de venda ou itens de remessa vinculados.
- Exclusão administrativa exige papel `super_admin`.

## Entradas

- Entradas representam registros administrativos de venda ou recebimento.
- Cada entrada deve estar vinculada a um produto existente.
- Quantidade deve ser maior que zero.
- Valor unitário deve ser maior ou igual a zero.
- Total é calculado no backend como `quantity * unitPrice`.
- Status padrão é `paid`.
- Status usados no frontend:
  - `paid`: Pago
  - `pending`: Pendente
  - `installment`: Parcelado
- Entradas podem ser editadas e removidas.
- Remoção administrativa exige papel `super_admin`.

## Despesas

- Despesas registram custos operacionais.
- Despesa possui tipo, descrição, valor e data.
- Valor deve ser maior ou igual a zero.
- Despesa pode estar vinculada a uma remessa ou ser avulsa.
- No frontend atual, o formulário foi simplificado para despesa, tipo, valor e data.
- Despesas podem ser editadas e removidas.
- Remoção administrativa exige papel `super_admin`.

## Remessas

- Remessas representam entrada de mercadoria.
- Código da remessa deve ser único.
- Remessa possui fornecedor, data, observações e itens.
- Cada item deve estar vinculado a um produto existente.
- Quantidade do item deve ser maior que zero.
- Custo unitário é opcional na API; quando omitido, o backend usa o preço atual do produto.
- Total do item é calculado no backend como `quantity * unitCost`.
- Total da remessa é calculado no backend somando os itens.
- Exclusão é bloqueada se houver despesas vinculadas.
- Remoção administrativa exige papel `super_admin`.

## Dashboard

- O dashboard administrativo consolida totais de categorias, subcategorias, produtos, entradas, despesas e remessas.
- A consolidação é feita no frontend a partir dos serviços existentes.
- Não existe endpoint dedicado de dashboard no backend nesta versão.
