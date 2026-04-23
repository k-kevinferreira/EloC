# Product Images Roadmap

## Contexto

O catalogo administrativo ja permite criar, editar e excluir produtos, mas hoje cada produto suporta apenas uma imagem simples por `imageUrl`.

Essa estrutura foi suficiente para fechar o primeiro ciclo do painel, porque permitiu:

- persistir uma referencia de imagem no produto
- exibir uma imagem unica no catalogo
- evitar introduzir infraestrutura de upload cedo demais

Ao mesmo tempo, ela se tornou a principal limitacao estrutural para a proxima fase do projeto:

- frontend publico mais robusto
- upload real no painel
- galeria de imagens por produto
- definicao explicita de imagem principal

## Problema

`Product.imageUrl` resolve apenas o caso mais simples.

Ela nao cobre bem:

- multiplas imagens por produto
- ordenacao de galeria
- imagem principal separada de imagens secundarias
- metadados de exibicao, como `altText`
- independencia de provider para upload e storage

Se o projeto crescer em cima desse campo como contrato definitivo, o frontend publico e o Admin vao se acoplar a uma estrutura fraca e provavelmente exigirao retrabalho.

## Decisao

Antes de implementar upload, o projeto deve formalizar uma evolucao de dominio para imagens de produto.

A direcao recomendada e:

- manter `Product.imageUrl` apenas como estrutura transitoria
- introduzir uma entidade relacional dedicada, como `ProductImage`
- definir contratos de backend e frontend preparados para uma ou varias imagens por produto
- adiar a escolha de storage e o fluxo de upload para a etapa seguinte

## Modelagem recomendada

Estrutura sugerida para a futura entidade:

- `id`
- `productId`
- `url`
- `altText`
- `displayOrder`
- `isPrimary`
- `createdAt`
- `updatedAt`

Relacao esperada:

- `Product 1:N ProductImage`

## Consequencias praticas

Beneficios:

- prepara o dominio para frontend publico mais robusto
- evita acoplar modelagem de negocio a detalhes de upload
- permite galeria, capa principal e ordenacao
- cria base melhor para SEO e acessibilidade
- facilita troca futura de provider sem quebrar o contrato central do produto

Custos aceitos:

- exige revisao do schema Prisma
- exige revisao dos contracts do backend e dos tipos do frontend
- exige estrategia de compatibilidade temporaria para o Admin atual

## Regra de continuidade

A sequencia recomendada e:

1. modelar a estrutura de imagens no Prisma
2. definir DTOs e responses do backend para leitura e escrita
3. ajustar tipos e consumo no frontend administrativo e publico
4. so depois implementar upload, storage e validacao de arquivo

## Observacao importante

Upload nao deve ser o primeiro passo.

Upload e uma decisao de infraestrutura. Antes disso, o dominio precisa estar correto.
