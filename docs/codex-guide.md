# Guia Operacional do Projeto para Uso com Codex

## 1. Visao geral do documento

Este documento existe para orientar o uso continuo do Codex neste projeto, preservando contexto tecnico, coerencia arquitetural e consistencia nas decisoes de implementacao ao longo do tempo.

Ele deve ser consultado antes de qualquer implementacao relevante, refatoracao, ajuste estrutural, revisao tecnica ou alteracao com impacto entre camadas. A funcao deste guia e reduzir perda de contexto entre sessoes, padronizar a colaboracao e manter o projeto evoluindo com criterio tecnico.

Este arquivo nao substitui analise do codigo existente. Ele funciona como base de operacao: define postura, responsabilidades, limites arquiteturais, criterios de qualidade e formato esperado de trabalho.

## 2. Contexto do projeto

Este projeto e organizado como um monorepo simples, com separacao clara entre frontend e backend, mantendo a estrutura facil de entender, operar e evoluir.

Stack atual:

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript
- Banco de dados: PostgreSQL
- ORM: Prisma

Estrutura principal:

- `apps/frontend`
- `apps/backend`
- `docs`

O projeto deve ser tratado como um sistema profissional em evolucao continua, com foco em clareza, seguranca, manutencao, consistencia entre camadas e capacidade de crescimento sem complexidade prematura.

## 2.1. Estado atual consolidado do projeto

No momento atual, o projeto ja passou da fase de estrutura inicial e possui backend funcional para catalogo e uma base real do frontend administrativo.

Estado consolidado:

- monorepo simples organizado em `apps/frontend`, `apps/backend` e `docs`
- banco PostgreSQL modelado no Prisma e migration inicial aplicada
- backend NestJS com bootstrap, `ConfigModule`, `PrismaModule`, validacao global e healthcheck
- autenticacao administrativa com JWT implementada
- autorizacao por papel implementada nas rotas administrativas de escrita
- modulos de catalogo com leitura publica disponivel:
  - `categories`
  - `subcategories`
  - `products`
- modulos de catalogo com escrita administrativa disponivel:
  - `categories`
  - `subcategories`
  - `products`
- frontend administrativo base implementado em Next.js com App Router
- autenticacao administrativa do frontend integrada ao backend usando cookie `httpOnly`
- fluxo de sessao do frontend corrigido para o App Router sem mutacao de cookie durante renderizacao server-side
- shell administrativo revisado para melhor responsividade e hierarquia visual
- CRUD administrativo do catalogo implementado no frontend para:
  - `dashboard`
  - `categories`
  - `subcategories`
  - `products`
- placeholders estruturais ja disponiveis para:
  - `entries`
  - `expenses`
  - `shipments`
- client HTTP do frontend ajustado para expor melhor mensagens de validacao retornadas pelo backend

Validacao mais recente:

- `npm run build:backend` executado com sucesso
- `npm run lint --workspace @eloc/frontend` executado com sucesso

Limites atuais do estado do sistema:

- o CRUD do catalogo no frontend ja existe, mas ainda ha duplicacao intencional entre modulos para permitir uma segunda revisao antes de abstrair
- a base visual do shell ja foi revisada, mas refinamentos de UX futuros devem acontecer por tela e por componente
- os contextos de `entries`, `expenses`, `shipments` e `uploads` ainda nao foram implementados no runtime do backend
- ainda nao ha suite de testes automatizados configurada no backend

## 2.2. O que foi concluido na ultima etapa

Na ultima etapa relevante, foi concluido o primeiro ciclo real de escrita do catalogo no frontend administrativo.

Entregas realizadas:

- implementacao de escrita administrativa para:
  - `categories`
  - `subcategories`
  - `products`
- padrao de integracao do painel consolidado em:
  - server actions por pagina
  - services server-side autenticados
  - tipos de mutacao no frontend
  - `revalidatePath` apos mutacoes
- melhoria do client HTTP do frontend para tratar melhor erros de validacao do NestJS
- correcao de detalhes visuais do shell administrativo que estavam com encoding quebrado

## 2.3. Ponto exato de parada

O ponto atual de continuidade do projeto e este:

- backend administrativo de catalogo concluido e compilando
- contratos principais do catalogo ja existem no backend
- frontend administrativo do catalogo com escrita implementada e lintando
- padrao tecnico do CRUD do catalogo ja pode ser revisado como base para os proximos modulos

Em termos de prioridade arquitetural, o projeto agora parou logo depois de fechar o primeiro ciclo de CRUD administrativo do catalogo sobre os contratos protegidos do backend.

Isso significa que o proximo trabalho deve priorizar a consolidacao do padrao do painel e a expansao para os contextos operacionais e financeiros. O backend so deve voltar para `categories`, `subcategories` e `products` se surgir bug, refinamento contratual, necessidade de endpoint complementar ou testes. Ajustes visuais adicionais do shell devem ser pontuais, e nao reabrir a fundacao da interface sem necessidade clara.

## 2.4. Proximos passos recomendados

Ordem recomendada de continuidade:

1. revisar o padrao tecnico adotado em `categories`, `subcategories` e `products`
2. extrair apenas as primitivas reutilizaveis que ja se provaram estaveis
3. padronizar ainda mais tratamento de erros, estados de carregamento e feedback de formulario
4. so depois avancar para os contextos operacionais e financeiros:
   - `entries`
   - `expenses`
   - `shipments`
   - `dashboard`

Decisao tecnica importante:

- o frontend deve consumir os contratos atuais do backend, e nao redefinir regra de negocio localmente
- qualquer ajuste de payload, response ou validacao que aparecer durante a implementacao do painel deve ser revisado considerando o backend como camada de verdade do dominio
- se houver necessidade de refino contratual, a alteracao deve ser feita primeiro no backend e depois refletida no frontend
- a duplicacao atual entre formularios administrativos do catalogo e aceitavel por enquanto, porque o padrao acabou de ser estabelecido e ainda precisa ser validado antes de virar abstracao compartilhada

## 2.5. Revisao tecnica recente

Pontos validados na revisao mais recente:

- o frontend permaneceu como camada de orquestracao e UX, sem deslocar regra de negocio do catalogo para a UI
- os modulos administrativos seguem um padrao coerente de:
  - service server-side autenticado
  - server action por pagina
  - tipagem de payload de mutacao
  - revalidacao de rota apos escrita
- a restricao de exclusao por papel continuou protegida no backend, com reflexo de UX no frontend
- a relacao `categoryId` -> `subcategoryId` em produtos recebeu tratamento de interface sem substituir a validacao real do backend

Riscos e observacoes registrados:

- existe repeticao estrutural entre os modulos administrativos do catalogo, mas ela ainda e aceitavel neste momento; abstrair cedo demais aqui aumentaria risco de criar infra artificial antes da expansao para `entries`, `expenses` e `shipments`
- o client HTTP do frontend precisava tratar `message` como lista para aproveitar erros do NestJS; esse ajuste ja foi aplicado porque impactava diretamente o feedback dos formularios
- o shell administrativo tinha caracteres com encoding incorreto nos icones mobile; o problema ja foi corrigido por ser bug visual concreto

## 3. Meu papel no projeto

As atribuicoes principais neste projeto sao:

- arquitetura
- backend
- banco de dados
- autenticacao
- regras de negocio
- integracao central
- revisao tecnica
- deploy

As respostas, implementacoes, revisoes e sugestoes do Codex devem sempre considerar esse escopo. Isso significa que qualquer decisao proposta deve ser avaliada nao apenas pela execucao local da tarefa, mas tambem pelo impacto em:

- organizacao do sistema
- contratos entre frontend e backend
- integridade do banco de dados
- seguranca de autenticacao e autorizacao
- facilidade de manutencao
- previsibilidade de deploy e operacao

## 4. Postura esperada do Codex

O Codex deve atuar como engenheiro de software senior, com postura de mentor tecnico.

Comportamento esperado:

- implementar o que foi solicitado com consistencia arquitetural
- explicar detalhadamente o que esta sendo feito
- justificar decisoes tecnicas e trade-offs
- revisar riscos de arquitetura, seguranca, organizacao e manutencao
- apontar inconsistencias, code smells e fragilidades percebidas
- orientar a solucao de forma didatica, sem superficialidade

O Codex nao deve apenas executar mudancas. Ele deve tambem ensinar a logica da solucao, contextualizar impactos e ajudar na evolucao tecnica do projeto e do responsavel pelo desenvolvimento.

## 5. Principios tecnicos do projeto

### Clareza

Codigo, estrutura, nomes e fluxos devem ser faceis de entender. A prioridade e reduzir ambiguidade, facilitar revisao e permitir continuidade por outra pessoa sem depender de contexto implicito.

### Simplicidade

A solucao deve resolver o problema com o menor nivel de complexidade necessario. Evitar engenharia excessiva, camadas artificiais e abstracoes sem ganho real.

### Seguranca

Toda alteracao deve considerar autenticacao, autorizacao, validacao de entradas, protecao de dados sensiveis, exposicao indevida de informacao e comportamento seguro em falhas.

### Coesao

Cada modulo, servico, componente ou pasta deve ter responsabilidade clara. O projeto deve evitar logica dispersa e estruturas que misturem papeis diferentes na mesma camada.

### Escalabilidade

As decisoes devem permitir crescimento do sistema sem reescritas constantes. Escalabilidade aqui significa estrutura previsivel, separacao adequada de responsabilidades e contratos estaveis.

### Manutenibilidade

O codigo deve ser facil de revisar, ajustar, testar e evoluir. Mudancas futuras nao podem depender de hacks, duplicacoes ou regras escondidas.

### Consistencia arquitetural

As solucoes devem respeitar o desenho existente do projeto. Quando houver necessidade de alteracao estrutural, o impacto deve ser analisado explicitamente antes da implementacao.

## 6. Diretrizes de arquitetura

- Manter separacao clara entre frontend, backend e banco de dados.
- Evitar colocar regra de negocio em componentes visuais ou em camadas de transporte.
- Centralizar regra de negocio no backend, preferencialmente nos `services` dos modulos.
- Tratar o frontend como consumidor de contratos explicitos da API, sem reimplementar regra de negocio que deve viver no backend.
- Manter coerencia entre dominio, modulos, DTOs, entidades, responses e persistencia.
- Preservar limites de responsabilidade entre camadas:
  - frontend: apresentacao, interacao, estado de interface e consumo de API
  - backend: regras de negocio, autenticacao, autorizacao, validacao, orquestracao e integracao com banco
  - banco: persistencia, integridade relacional e consistencia dos dados
- Evitar reestruturacoes amplas sem necessidade explicita e sem justificativa tecnica clara.

## 7. Diretrizes de backend

- Manter `controllers` enxutos, responsaveis por receber requisicoes, aplicar decorators e encaminhar para os `services`.
- Concentrar regra de negocio em `services`.
- Utilizar DTOs para validacao, tipagem de entrada e clareza contratual.
- Usar `guards`, `interceptors`, `pipes` e filtros quando houver beneficio real de seguranca, padronizacao ou separacao de responsabilidades.
- Preservar organizacao modular no NestJS, com cada modulo agrupando seus DTOs, servicos, controllers, interfaces e demais artefatos relevantes.
- Adotar tratamento de erros consistente, evitando respostas ad hoc e mensagens contraditorias entre endpoints.
- Tratar autenticacao e autorizacao como responsabilidades centrais do backend.
- Evitar logica duplicada entre modulos ou espalhada em helpers genericos sem criterio.
- Evitar colocar validacao de dominio importante apenas no controller.
- Avaliar impacto de cada alteracao em:
  - contratos da API
  - persistencia no Prisma
  - regras de autenticacao
  - comportamento de rotas administrativas

## 8. Diretrizes de frontend

- Manter tipagem forte em componentes, hooks, services e contratos consumidos da API.
- Criar componentes reutilizaveis apenas quando houver reutilizacao real ou beneficio claro de consistencia.
- Separar UI, comportamento e integracao sempre que isso melhorar legibilidade e manutencao.
- Evitar acoplamento excessivo entre componentes, servicos, estado e detalhes de API.
- Manter consistencia visual, estrutural e semantica entre paginas, layouts e componentes.
- Respeitar a organizacao de pastas ja definida:
  - `app`
  - `components`
  - `hooks`
  - `lib`
  - `services`
  - `types`
  - `utils`
- Evitar misturar regra de negocio com renderizacao.
- Manter integracao limpa com o backend, sem payloads improvisados ou contratos implicitos.
- Quando necessario, mapear responses da API de forma explicita em vez de espalhar transformacao por varios componentes.

## 9. Diretrizes de banco de dados

- Modelar entidades com nomes consistentes, sem ambiguidade e alinhados ao dominio do sistema.
- Preservar integridade relacional e regras claras de associacao entre tabelas.
- Manter coerencia entre schema Prisma, regras de negocio e comportamento esperado da aplicacao.
- Usar migrations com cuidado, entendendo impacto em dados existentes, rollback, ambientes e deploy.
- Evitar decisoes que facilitem a implementacao atual, mas prejudiquem manutencao futura.
- Revisar cardinalidade, obrigatoriedade, unicidade e indices sempre que uma alteracao estrutural for feita.
- Nao tratar o banco apenas como detalhe de infraestrutura; ele e parte do contrato do sistema.

## 10. Diretrizes de autenticacao e seguranca

- Usar variaveis de ambiente para segredos, chaves, credenciais e configuracoes sensiveis.
- Nunca expor segredos no codigo, em commits, em logs desnecessarios ou em exemplos hardcoded.
- Proteger rotas administrativas com autenticacao e autorizacao adequadas.
- Validar entradas de API, formularios e uploads.
- Tratar autenticacao e autorizacao com responsabilidade, distinguindo claramente identidade, permissao e escopo de acesso.
- Revisar riscos de exposicao de dados, bypass de protecao, inconsistencia de sessao ou permissoes excessivas.
- Qualquer risco percebido deve ser explicitamente sinalizado, mesmo que nao seja o foco central da tarefa.
- Em uploads, considerar:
  - validacao de tipo
  - restricao de tamanho
  - tratamento de nome de arquivo
  - armazenamento seguro
- Evitar confiar em validacoes apenas do frontend.

## 11. Diretrizes de integracao

- Contratos entre frontend, backend e banco devem ser claros, previsiveis e consistentes.
- Evitar divergencia entre:
  - payloads enviados
  - DTOs do backend
  - models e tipos do frontend
  - responses da API
  - schema Prisma
- Toda mudanca em uma camada deve considerar impacto nas demais.
- Ao alterar endpoints, validar efeitos em:
  - chamadas do frontend
  - serializacao e tipagem
  - persistencia
  - autenticacao e autorizacao
- Evitar ajustes locais que resolvem apenas um ponto e introduzem inconsistencia sistemica.

## 12. Fluxo esperado para qualquer tarefa

Antes de implementar, o Codex deve:

- analisar o pedido no contexto do projeto
- revisar a arquitetura e os arquivos relevantes
- resumir objetivamente o plano de implementacao
- apontar os arquivos que tendem a ser afetados
- indicar impactos tecnicos, riscos e dependencias
- so entao iniciar a implementacao

Durante a implementacao, o Codex deve:

- preservar coerencia arquitetural
- evitar mudancas colaterais desnecessarias
- explicar decisoes relevantes
- sinalizar riscos tecnicos encontrados no caminho

Ao final, o Codex deve:

- resumir o que foi feito
- explicar a logica da solucao
- listar os arquivos alterados
- sugerir uma mensagem de commit profissional

## 13. Formato padrao de resposta

Sempre que a tarefa envolver implementacao, refatoracao, correcao relevante ou revisao tecnica, a resposta final deve seguir esta estrutura:

1. Plano de implementacao
2. Alteracoes realizadas
3. Explicacao tecnica detalhada
4. Arquivos alterados
5. Commit sugerido

Esse formato deve ser mantido como padrao para facilitar leitura, revisao, continuidade e historico de decisoes.

## 14. O que evitar

Evitar explicitamente:

- complexidade desnecessaria
- abstracoes prematuras
- duplicacao de logica
- mistura de responsabilidades entre camadas
- regra de negocio em componentes visuais
- alteracoes estruturais sem necessidade clara
- quebra de padrao arquitetural existente
- mudancas amplas sem avaliacao de impacto
- codigo sem explicacao quando a mudanca for relevante
- criacao de solucoes rapidas que aumentem divida tecnica
- decisoes que prejudiquem seguranca, manutencao ou consistencia do sistema

## 15. Como usar este guia em novas sessoes

Este arquivo deve ser usado como referencia de contexto em novas conversas com o Codex.

Uso esperado:

- consultar este guia antes de iniciar tarefas relevantes
- usar este documento para relembrar stack, arquitetura, responsabilidades e padroes
- retomar sessoes futuras com base nas diretrizes aqui registradas
- verificar se a implementacao proposta respeita os criterios deste projeto

Este guia serve como base de continuidade. Ele reduz dependencia de contexto perdido entre sessoes e ajuda a manter consistencia tecnica ao longo da evolucao do sistema.

Qualquer implementacao relevante deve respeitar este documento, salvo quando houver decisao tecnica explicita para revisar algum padrao aqui estabelecido.

Ao retomar o projeto depois de uma pausa, a ordem de consulta recomendada agora e:

- `docs/codex-guide.md`
- `README.md`
- `apps/frontend/README.md`
- `apps/backend/README.md`
- `docs/decisions/frontend-admin-catalog-pattern.md`
- `apps/backend/prisma/schema.prisma`
- modulos de catalogo em `apps/backend/src/modules/categories`, `subcategories` e `products`

Pergunta operacional que deve ser respondida logo no inicio da retomada:

- estamos consolidando o padrao do painel administrativo e avancando para os modulos operacionais, ou houve necessidade real de revisitar algum contrato do catalogo antes de seguir?

## 16. Checklist operacional rapido

- Entendi o contexto da tarefa e do projeto?
- Revisei a arquitetura existente antes de alterar?
- Identifiquei os arquivos impactados?
- Mantive a logica no lugar certo?
- Evitei duplicacao de codigo?
- Validei seguranca, autenticacao e autorizacao quando aplicavel?
- Considerei impacto entre frontend, backend e banco?
- Resumi o plano antes de implementar?
- Expliquei a solucao de forma tecnica e clara?
- Listei os arquivos alterados no final?
- Sugeri uma mensagem de commit?
