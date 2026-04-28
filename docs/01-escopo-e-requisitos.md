# 01 - Escopo e Requisitos

## Objetivo do sistema

O EloC é um sistema web para apresentar produtos de pratas e semijoias em um catálogo público e permitir que a operação administrativa gerencie catálogo, registros financeiros e remessas.

## Problema resolvido

O sistema centraliza a exibição de produtos e a gestão operacional básica em uma aplicação própria, reduzindo dependência de controles manuais dispersos para categorias, produtos, entradas, despesas e remessas.

## Público-alvo

- Clientes finais que consultam produtos pelo catálogo público.
- Administradores da EloC responsáveis por manter catálogo e registros operacionais.
- Responsável técnico pelo suporte, manutenção e evolução do sistema.

## Versão atual

Versão de entrega: `0.1.0`.

## Módulos entregues

- Catálogo público.
- Página inicial pública.
- Listagem de produtos.
- Página de categoria.
- Página de detalhe do produto.
- Login administrativo.
- Dashboard administrativo.
- Administração de categorias.
- Administração de subcategorias.
- Administração de produtos e imagens.
- Administração de entradas.
- Administração de despesas.
- Administração de remessas.
- Upload local de imagens de produto.

## Funcionalidades incluídas

- Consulta pública de produtos ativos.
- Filtro público por categoria, subcategoria, busca textual e destaque.
- Cadastro, edição e exclusão administrativa de categorias.
- Cadastro, edição e exclusão administrativa de subcategorias.
- Cadastro, edição e exclusão administrativa de produtos.
- Upload de imagens de produto pelo painel administrativo.
- Registro e edição de entradas financeiras vinculadas a produtos.
- Status de entrada: `paid`, `pending` e `installment`.
- Registro e edição de despesas.
- Registro e edição de remessas com item de produto, quantidade e custo calculado pelo backend.
- Dashboard com totais carregados a partir dos serviços existentes.

## Funcionalidades fora do escopo

- Checkout online.
- Pagamento integrado.
- Carrinho de compras.
- Controle completo de estoque.
- Emissão de nota fiscal.
- Integração com transportadora.
- Recuperação automática de senha.
- Área de cliente final autenticado.
- Relatórios avançados e exportação de dados.

## Limitações conhecidas

- O storage de uploads é local no backend.
- O dashboard consolida dados buscando listas existentes; não há endpoint dedicado de agregação no backend.
- Não há testes automatizados versionados para todos os fluxos.
- A recuperação de senha administrativa não está implementada.
- Dados finais de cliente, domínio e plataforma de deploy estão pendentes de validação.

## Pendências de validação

- Nome jurídico do cliente.
- Responsável final pelo aceite.
- Domínio de produção.
- Plataforma final de hospedagem.
- Estratégia definitiva de storage para imagens.
