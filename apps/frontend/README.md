# Frontend

Aplicacao web do projeto.

Estado atual da entrega:

- base real em Next.js com App Router, TypeScript e Tailwind CSS
- autenticacao administrativa consumindo `POST /api/auth/login` e `GET /api/auth/me`
- sessao protegida por cookie `httpOnly` no frontend
- shell administrativo inicial com:
  - dashboard
  - categorias
  - subcategorias
  - produtos
  - placeholders de `entries`, `expenses` e `shipments`
- leitura inicial do catalogo integrada ao backend

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
