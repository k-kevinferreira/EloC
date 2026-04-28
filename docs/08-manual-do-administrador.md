# 08 - Manual do Administrador

## Acesso ao sistema

Painel administrativo local:

```text
http://localhost:3000/admin/login
```

Endereço de produção: Pendente de validação.

## Login

1. Acesse a página de login.
2. Informe e-mail e senha cadastrados.
3. Após autenticação, o sistema redireciona para o dashboard.

## Dashboard

O dashboard exibe:

- total de categorias;
- total de subcategorias;
- produtos carregados;
- total de entradas;
- total de despesas;
- total de remessas;
- prévias recentes de dados operacionais.

## Categorias

Uso:

- cadastrar categoria;
- editar nome, slug, status e ordem;
- ativar ou inativar categoria;
- excluir categoria quando permitido.

Regras:

- categorias com produtos ou subcategorias vinculadas não podem ser excluídas;
- algumas categorias fixas não podem ser removidas;
- exclusão exige permissão `super_admin`.

## Subcategorias

Uso:

- cadastrar subcategoria vinculada a uma categoria;
- editar nome, slug, categoria, status e ordem;
- ativar ou inativar subcategoria;
- excluir subcategoria quando permitido.

Regras:

- subcategorias com produtos vinculados não podem ser excluídas;
- materiais fixos não podem ser removidos;
- exclusão exige permissão `super_admin`.

## Produtos

Uso:

- cadastrar produto;
- editar produto;
- definir categoria e subcategoria;
- definir código, slug, título, descrição e preço;
- marcar produto como ativo ou destaque;
- enviar imagens;
- escolher imagem principal;
- excluir produto quando permitido.

Regras:

- código deve ser único;
- slug deve ser único;
- produto precisa de categoria e subcategoria compatíveis;
- produtos com entradas ou remessas vinculadas não podem ser excluídos;
- exclusão exige permissão `super_admin`.

## Entradas

Uso:

- registrar entrada vinculada a produto;
- informar quantidade, valor unitário, forma de pagamento, status, data e dados opcionais do cliente;
- editar entradas já registradas;
- excluir entradas quando permitido.

Status disponíveis:

- Pago;
- Pendente;
- Parcelado.

## Despesas

Uso:

- registrar despesa;
- informar tipo, valor e data;
- editar despesas registradas;
- excluir despesas quando permitido.

Observação:

- O backend mantém uma descrição obrigatória para integridade do registro. No frontend simplificado, a despesa informada é usada como descrição.

## Remessas

Uso:

- registrar código, fornecedor e data;
- informar produto por texto no frontend e selecionar o item correspondente;
- informar quantidade;
- editar remessas registradas;
- excluir remessas quando permitido.

Regras:

- código da remessa deve ser único;
- custo total é calculado no backend;
- remessa com despesa vinculada não pode ser excluída.

## Boas práticas de uso

- Usar nomes claros em categorias e produtos.
- Conferir slugs antes de publicar.
- Manter imagens com boa qualidade e descrição acessível.
- Evitar excluir registros operacionais; preferir inativar quando existir vínculo.
- Registrar entradas, despesas e remessas no mesmo dia da ocorrência.

## Dúvidas comuns

### Produto não aparece no catálogo

Verificar se o produto está ativo e se categoria/subcategoria também estão ativas.

### Não consigo excluir um item

O item provavelmente possui vínculos operacionais ou exige papel `super_admin`.

### Imagem não carrega

Verificar se o backend está servindo `/uploads` e se `UPLOADS_PUBLIC_BASE_URL` está correto.
