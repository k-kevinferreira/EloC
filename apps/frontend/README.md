# Frontend

Aplicacao web do projeto.

Estado atual da entrega:

- base real em Next.js com App Router, TypeScript e Tailwind CSS
- autenticacao administrativa consumindo `POST /api/auth/login` e `GET /api/auth/me`
- sessao protegida por cookie `httpOnly` no frontend
- fluxo de sessao corrigido para o App Router sem limpeza de cookie durante renderizacao server-side
- shell administrativo revisado para uso responsivo em desktop e mobile
- shell administrativo com escrita do catalogo implementada em:
  - dashboard
  - categorias
  - subcategorias
  - produtos
- placeholders de `entries`, `expenses` e `shipments`
- leitura e escrita do catalogo integradas ao backend por server actions + services server-side autenticados
- tratamento de erro do cliente HTTP ajustado para aproveitar melhor mensagens de validacao do NestJS

Ponto atual de continuidade:

- o shell administrativo ja esta funcional para uso e iteracao visual
- o CRUD administrativo de `categories`, `subcategories` e `products` ja esta implementado
- o proximo passo principal e consolidar primitivas reutilizaveis do painel sem introduzir abstracoes prematuras
- ajustes de UI restantes devem ser tratados por tela e por componente, evitando reabrir a arquitetura base sem necessidade
- a sequencia mais coerente agora e avancar para `entries`, `expenses` e `shipments`

Configuracao local:

- copiar `apps/frontend/.env.example` para `apps/frontend/.env.local`
- definir `BACKEND_API_URL`, por exemplo `http://localhost:3001/api`
- garantir que o backend esteja rodando antes de acessar o painel

Scripts principais:

- `npm run dev:frontend`
- `npm run build:frontend`
- `npm run lint --workspace @eloc/frontend`

Estrutura interna:

- `app`: rotas, layouts e composicao de telas
- `components`: componentes reutilizaveis
- `hooks`: hooks customizados
- `lib`: configuracoes, clientes e integracoes base
- `services`: consumo de API e servicos do frontend
- `types`: contratos e tipagens compartilhadas no frontend
- `utils`: funcoes utilitarias sem acoplamento com UI
