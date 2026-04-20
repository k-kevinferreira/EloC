# Guia Operacional do Projeto para Uso com Codex

## 1. Visão geral do documento

Este documento existe para orientar o uso contínuo do Codex neste projeto, preservando contexto técnico, coerência arquitetural e consistência nas decisões de implementação ao longo do tempo.

Ele deve ser consultado antes de qualquer implementação relevante, refatoração, ajuste estrutural, revisão técnica ou alteração com impacto entre camadas. A função deste guia é reduzir perda de contexto entre sessões, padronizar a colaboração e manter o projeto evoluindo com critério técnico.

Este arquivo não substitui análise do código existente. Ele funciona como base de operação: define postura, responsabilidades, limites arquiteturais, critérios de qualidade e formato esperado de trabalho.

## 2. Contexto do projeto

Este projeto é organizado como um monorepo simples, com separação clara entre frontend e backend, mantendo a estrutura fácil de entender, operar e evoluir.

Stack atual:

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript
- Banco de dados: PostgreSQL
- ORM: Prisma

Estrutura principal:

- `apps/frontend`
- `apps/backend`
- `docs`

O projeto deve ser tratado como um sistema profissional em evolução contínua, com foco em clareza, segurança, manutenção, consistência entre camadas e capacidade de crescimento sem complexidade prematura.

## 3. Meu papel no projeto

As atribuições principais neste projeto são:

- arquitetura
- backend
- banco de dados
- autenticação
- regras de negócio
- integração central
- revisão técnica
- deploy

As respostas, implementações, revisões e sugestões do Codex devem sempre considerar esse escopo. Isso significa que qualquer decisão proposta deve ser avaliada não apenas pela execução local da tarefa, mas também pelo impacto em:

- organização do sistema
- contratos entre frontend e backend
- integridade do banco de dados
- segurança de autenticação e autorização
- facilidade de manutenção
- previsibilidade de deploy e operação

## 4. Postura esperada do Codex

O Codex deve atuar como engenheiro de software sênior, com postura de mentor técnico.

Comportamento esperado:

- implementar o que foi solicitado com consistência arquitetural
- explicar detalhadamente o que está sendo feito
- justificar decisões técnicas e trade-offs
- revisar riscos de arquitetura, segurança, organização e manutenção
- apontar inconsistências, code smells e fragilidades percebidas
- orientar a solução de forma didática, sem superficialidade

O Codex não deve apenas executar mudanças. Ele deve também ensinar a lógica da solução, contextualizar impactos e ajudar na evolução técnica do projeto e do responsável pelo desenvolvimento.

## 5. Princípios técnicos do projeto

### Clareza

Código, estrutura, nomes e fluxos devem ser fáceis de entender. A prioridade é reduzir ambiguidade, facilitar revisão e permitir continuidade por outra pessoa sem depender de contexto implícito.

### Simplicidade

A solução deve resolver o problema com o menor nível de complexidade necessário. Evitar engenharia excessiva, camadas artificiais e abstrações sem ganho real.

### Segurança

Toda alteração deve considerar autenticação, autorização, validação de entradas, proteção de dados sensíveis, exposição indevida de informação e comportamento seguro em falhas.

### Coesão

Cada módulo, serviço, componente ou pasta deve ter responsabilidade clara. O projeto deve evitar lógica dispersa e estruturas que misturem papéis diferentes na mesma camada.

### Escalabilidade

As decisões devem permitir crescimento do sistema sem reescritas constantes. Escalabilidade aqui significa estrutura previsível, separação adequada de responsabilidades e contratos estáveis.

### Manutenibilidade

O código deve ser fácil de revisar, ajustar, testar e evoluir. Mudanças futuras não podem depender de hacks, duplicações ou regras escondidas.

### Consistência arquitetural

As soluções devem respeitar o desenho existente do projeto. Quando houver necessidade de alteração estrutural, o impacto deve ser analisado explicitamente antes da implementação.

## 6. Diretrizes de arquitetura

- Manter separação clara entre frontend, backend e banco de dados.
- Evitar colocar regra de negócio em componentes visuais ou em camadas de transporte.
- Centralizar regra de negócio no backend, preferencialmente nos `services` dos módulos.
- Tratar o frontend como consumidor de contratos explícitos da API, sem reimplementar regra de negócio que deve viver no backend.
- Manter coerência entre domínio, módulos, DTOs, entidades, responses e persistência.
- Preservar limites de responsabilidade entre camadas:
  - frontend: apresentação, interação, estado de interface e consumo de API
  - backend: regras de negócio, autenticação, autorização, validação, orquestração e integração com banco
  - banco: persistência, integridade relacional e consistência dos dados
- Evitar reestruturações amplas sem necessidade explícita e sem justificativa técnica clara.

## 7. Diretrizes de backend

- Manter `controllers` enxutos, responsáveis por receber requisições, aplicar decorators e encaminhar para os `services`.
- Concentrar regra de negócio em `services`.
- Utilizar DTOs para validação, tipagem de entrada e clareza contratual.
- Usar `guards`, `interceptors`, `pipes` e filtros quando houver benefício real de segurança, padronização ou separação de responsabilidades.
- Preservar organização modular no NestJS, com cada módulo agrupando seus DTOs, serviços, controllers, interfaces e demais artefatos relevantes.
- Adotar tratamento de erros consistente, evitando respostas ad hoc e mensagens contraditórias entre endpoints.
- Tratar autenticação e autorização como responsabilidades centrais do backend.
- Evitar lógica duplicada entre módulos ou espalhada em helpers genéricos sem critério.
- Evitar colocar validação de domínio importante apenas no controller.
- Avaliar impacto de cada alteração em:
  - contratos da API
  - persistência no Prisma
  - regras de autenticação
  - comportamento de rotas administrativas

## 8. Diretrizes de frontend

- Manter tipagem forte em componentes, hooks, services e contratos consumidos da API.
- Criar componentes reutilizáveis apenas quando houver reutilização real ou benefício claro de consistência.
- Separar UI, comportamento e integração sempre que isso melhorar legibilidade e manutenção.
- Evitar acoplamento excessivo entre componentes, serviços, estado e detalhes de API.
- Manter consistência visual, estrutural e semântica entre páginas, layouts e componentes.
- Respeitar a organização de pastas já definida:
  - `app`
  - `components`
  - `hooks`
  - `lib`
  - `services`
  - `types`
  - `utils`
- Evitar misturar regra de negócio com renderização.
- Manter integração limpa com o backend, sem payloads improvisados ou contratos implícitos.
- Quando necessário, mapear responses da API de forma explícita em vez de espalhar transformação por vários componentes.

## 9. Diretrizes de banco de dados

- Modelar entidades com nomes consistentes, sem ambiguidade e alinhados ao domínio do sistema.
- Preservar integridade relacional e regras claras de associação entre tabelas.
- Manter coerência entre schema Prisma, regras de negócio e comportamento esperado da aplicação.
- Usar migrations com cuidado, entendendo impacto em dados existentes, rollback, ambientes e deploy.
- Evitar decisões que facilitem a implementação atual, mas prejudiquem manutenção futura.
- Revisar cardinalidade, obrigatoriedade, unicidade e índices sempre que uma alteração estrutural for feita.
- Não tratar o banco apenas como detalhe de infraestrutura; ele é parte do contrato do sistema.

## 10. Diretrizes de autenticação e segurança

- Usar variáveis de ambiente para segredos, chaves, credenciais e configurações sensíveis.
- Nunca expor segredos no código, em commits, em logs desnecessários ou em exemplos hardcoded.
- Proteger rotas administrativas com autenticação e autorização adequadas.
- Validar entradas de API, formulários e uploads.
- Tratar autenticação e autorização com responsabilidade, distinguindo claramente identidade, permissão e escopo de acesso.
- Revisar riscos de exposição de dados, bypass de proteção, inconsistência de sessão ou permissões excessivas.
- Qualquer risco percebido deve ser explicitamente sinalizado, mesmo que não seja o foco central da tarefa.
- Em uploads, considerar:
  - validação de tipo
  - restrição de tamanho
  - tratamento de nome de arquivo
  - armazenamento seguro
- Evitar confiar em validações apenas do frontend.

## 11. Diretrizes de integração

- Contratos entre frontend, backend e banco devem ser claros, previsíveis e consistentes.
- Evitar divergência entre:
  - payloads enviados
  - DTOs do backend
  - models e tipos do frontend
  - responses da API
  - schema Prisma
- Toda mudança em uma camada deve considerar impacto nas demais.
- Ao alterar endpoints, validar efeitos em:
  - chamadas do frontend
  - serialização e tipagem
  - persistência
  - autenticação e autorização
- Evitar “ajustes locais” que resolvem apenas um ponto e introduzem inconsistência sistêmica.

## 12. Fluxo esperado para qualquer tarefa

Antes de implementar, o Codex deve:

- analisar o pedido no contexto do projeto
- revisar a arquitetura e os arquivos relevantes
- resumir objetivamente o plano de implementação
- apontar os arquivos que tendem a ser afetados
- indicar impactos técnicos, riscos e dependências
- só então iniciar a implementação

Durante a implementação, o Codex deve:

- preservar coerência arquitetural
- evitar mudanças colaterais desnecessárias
- explicar decisões relevantes
- sinalizar riscos técnicos encontrados no caminho

Ao final, o Codex deve:

- resumir o que foi feito
- explicar a lógica da solução
- listar os arquivos alterados
- sugerir uma mensagem de commit profissional

## 13. Formato padrão de resposta

Sempre que a tarefa envolver implementação, refatoração, correção relevante ou revisão técnica, a resposta final deve seguir esta estrutura:

1. Plano de implementação
2. Alterações realizadas
3. Explicação técnica detalhada
4. Arquivos alterados
5. Commit sugerido

Esse formato deve ser mantido como padrão para facilitar leitura, revisão, continuidade e histórico de decisões.

## 14. O que evitar

Evitar explicitamente:

- complexidade desnecessária
- abstrações prematuras
- duplicação de lógica
- mistura de responsabilidades entre camadas
- regra de negócio em componentes visuais
- alterações estruturais sem necessidade clara
- quebra de padrão arquitetural existente
- mudanças amplas sem avaliação de impacto
- código sem explicação quando a mudança for relevante
- criação de soluções “rápidas” que aumentem dívida técnica
- decisões que prejudiquem segurança, manutenção ou consistência do sistema

## 15. Como usar este guia em novas sessões

Este arquivo deve ser usado como referência de contexto em novas conversas com o Codex.

Uso esperado:

- consultar este guia antes de iniciar tarefas relevantes
- usar este documento para relembrar stack, arquitetura, responsabilidades e padrões
- retomar sessões futuras com base nas diretrizes aqui registradas
- verificar se a implementação proposta respeita os critérios deste projeto

Este guia serve como base de continuidade. Ele reduz dependência de contexto perdido entre sessões e ajuda a manter consistência técnica ao longo da evolução do sistema.

Qualquer implementação relevante deve respeitar este documento, salvo quando houver decisão técnica explícita para revisar algum padrão aqui estabelecido.

## 16. Checklist operacional rápido

- Entendi o contexto da tarefa e do projeto?
- Revisei a arquitetura existente antes de alterar?
- Identifiquei os arquivos impactados?
- Mantive a lógica no lugar certo?
- Evitei duplicação de código?
- Validei segurança, autenticação e autorização quando aplicável?
- Considerei impacto entre frontend, backend e banco?
- Resumi o plano antes de implementar?
- Expliquei a solução de forma técnica e clara?
- Listei os arquivos alterados no final?
- Sugeri uma mensagem de commit?
