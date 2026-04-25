# Product Images Roadmap

## Contexto

O catalogo administrativo ja permite criar, editar e excluir produtos. No primeiro ciclo, cada produto suportava apenas uma imagem simples por `imageUrl`.

Essa estrutura foi suficiente para fechar a base inicial do painel, porque permitiu:

- persistir uma referencia de imagem no produto
- exibir uma imagem unica no catalogo
- evitar introduzir infraestrutura de upload cedo demais

Ao mesmo tempo, ela se tornou a principal limitacao estrutural para a fase seguinte do projeto:

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

A direcao adotada e:

- manter `Product.imageUrl` apenas como estrutura transitoria
- usar `ProductImage` como entidade relacional dedicada
- definir contratos de backend e frontend preparados para uma ou varias imagens por produto
- adiar a escolha de storage e o fluxo de upload ate o contrato de dominio estar estavel

## Estado atual da decisao

Esta decisao ja foi iniciada no codigo:

- `ProductImage` foi implementado como entidade relacional
- o backend de `products` ja expoe `images[]`
- o Admin ja escreve `images[]` com galeria manual por URL
- o frontend publico ja consome `images[]` como fonte principal de exibicao
- o backend ja possui upload administrativo inicial com storage local
- `Product.imageUrl` continua apenas como compatibilidade transitoria

Portanto, a decisao nao esta mais no campo de planejamento inicial. Ela ja entrou em execucao, e o contrato novo esta consolidado no backend, no Admin e no catalogo publico. O upload local inicial existe como infraestrutura, mas ainda precisa ser integrado ao formulario administrativo de produtos.

## Modelagem implementada

Estrutura da entidade:

- `id`
- `productId`
- `url`
- `altText`
- `displayOrder`
- `isPrimary`
- `createdAt`
- `updatedAt`

Relacao:

- `Product 1:N ProductImage`

## Consequencias praticas

Beneficios:

- prepara o dominio para frontend publico mais robusto
- evita acoplar modelagem de negocio a detalhes de upload
- permite galeria, capa principal e ordenacao
- cria base melhor para SEO e acessibilidade
- facilita troca futura de provider sem quebrar o contrato central do produto

Custos aceitos:

- exige estrategia de compatibilidade temporaria com `Product.imageUrl`
- exige cuidado para nao duplicar regra de selecao de imagem entre camadas
- exige validacao futura de arquivos quando upload real for implementado

## Regra de continuidade

A sequencia recomendada e:

1. revisar se a serializacao publica de `products` precisa ser diferenciada
2. integrar o upload administrativo ao formulario de produtos no frontend
3. planejar a remocao futura da compatibilidade com `Product.imageUrl`

## Observacao importante

Upload nao deve ser tratado como substituto da modelagem de dominio.

Upload e uma decisao de infraestrutura. A entidade `ProductImage` continua sendo o contrato central de imagens de produto.
