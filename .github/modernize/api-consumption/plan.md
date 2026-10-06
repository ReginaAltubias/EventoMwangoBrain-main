# Plano de implementação: consumo integral da API Mwango Brain

**Data**: 2026-10-06 | **Especificação**: OpenAPI 3.0 enviado na solicitação (`Pasted text #1.txt`)

## Resumo

Ligar a aplicação React/TypeScript a todas as 39 operações REST documentadas, substituindo o uso implícito do endpoint agregado como única fonte de leitura por serviços tipados por domínio. O trabalho mantém o cliente HTTP partilhado, concentra a coordenação de dados no `BrainStore` e liga cada operação à respectiva tela ou fluxo público, com estados de carregamento, erro e sucesso visíveis.

O plano assume que o OpenAPI fornecido descreve o contrato a consumir e que a aplicação web é o consumidor. A única API usada pela aplicação será a API remota configurada por `VITE_API_URL`. O Express local está fora do escopo: não iniciar, alterar nem usar `server/` como fallback. O primeiro passo fecha os contratos que faltam na especificação antes de implementar chamadas cuja forma não está documentada.

## Contexto técnico

**Linguagem/versão**: TypeScript, React 18, Node.js 22  
**Dependências principais**: Vite, React Router, Fetch, Zod, Playwright  
**Persistência**: serviço remoto acessado exclusivamente por API REST; a aplicação cliente não acede directamente à base de dados  
**Testes**: Playwright está no projecto; não foram encontrados ficheiros de teste. O projecto não declara um script de teste unitário/integrado.  
**Plataforma**: SPA React servida por Vite, consumindo exclusivamente uma API remota; para o frontend usar `npm run dev`, não `npm run dev:all` nem scripts que iniciem `server/`  
**Contrato fornecido**: 39 operações; o documento não inclui `components.schemas`, esquemas de request/response nem secção `security`  
**Restrição de segurança**: não enviar operações de teste para a API de produção; autenticação por token não deve ser inventada porque não está definida no OpenAPI.

### Situação actual observada

- `src/brain/lib/api.ts` centraliza Fetch e configura o endereço base por `VITE_API_URL`.
- `src/brain/store/BrainStore.tsx` já chama `/api/state`, login/registo e algumas operações de escrita; não expõe todos os métodos REST nem carregamento por domínio.
- `src/brain/services/index.ts` tem leituras de contactos, leads, follow-ups, reuniões e feedback, mas não é a camada única usada pelas telas.
- `src/brain/types.ts` contém tipos de domínio locais, sem tipos para payloads e envelopes da API.
- `server/` contém uma implementação Express local, explicitamente fora do escopo deste plano. Não iniciar nem alterar esse servidor; não o usar como destino alternativo, fallback ou proxy.
- Algumas leituras actuais dependem do estado carregado por `/api/state`; isso não conta como consumo individual dos endpoints de listagem e detalhe documentados.

## Verificação da constituição

Não foi encontrado `constitution.md` no repositório. Não há princípios locais adicionais disponíveis para validar. O plano preserva o cliente HTTP existente, evita dependências novas e exige erros explícitos, tipagem e isolamento dos testes.

## Guidelines aplicadas

Não há guideline de migração aplicável a esta integração React/REST na biblioteca `skills/guidelines/` disponível.

## Cobertura da API

| Domínio | Operações documentadas | Requisito |
|---|---:|---|
| Autenticação | `POST /api/auth/login`, `POST /api/auth/register` | REQ-API-001 |
| Contactos e captura | `GET/POST /api/contacts`, `GET/PUT/DELETE /api/contacts/{id}`, `POST /api/contacts/quick`, `POST /api/contacts/full`, `POST /api/public/qr-contact` | REQ-API-002 |
| Leads | `GET/POST /api/leads`, `GET/PUT/DELETE /api/leads/{id}`, `PATCH /api/leads/{id}/status` | REQ-API-003 |
| Interacções | `GET/POST /api/interactions`, `POST /api/leads/{leadId}/interactions` | REQ-API-004 |
| Follow-ups | `GET/POST /api/follow-ups`, `PATCH /api/follow-ups/{id}/complete`, `PUT /api/follow-ups/{id}` | REQ-API-005 |
| Reuniões | `GET/POST /api/meetings` | REQ-API-006 |
| Avaliações e feedback | `GET/POST /api/evaluation`, `GET/POST /api/feedback` | REQ-API-007 |
| Notificações | `GET /api/notifications`, `PATCH /api/notifications/{id}/read` | REQ-API-008 |
| Soluções | `GET/POST /api/solutions`, `PATCH/DELETE /api/solutions/{id}` | REQ-API-009 |
| Utilizadores | `GET /api/users`, `PATCH /api/users/{id}/approve`, `DELETE /api/users/{id}` | REQ-API-010 |
| Estado agregado | `GET /api/state` | REQ-API-011 |
| **Total** | **39 operações** | **11 requisitos** |

## Decisões e limites

1. Usar os paths e métodos do OpenAPI como fonte de verdade para a integração, mas verificar os schemas reais antes de codificar payloads e desserialização. Descrições de resposta sem schema não autorizam inferir formato.
2. Manter `VITE_API_URL` como configuração de ambiente, validando a URL e documentando configuração para desenvolvimento, testes e produção. Não codificar credenciais ou tokens.
3. Não manter fallback silencioso para dados mock quando a API falhar. As telas devem mostrar erro recuperável e permitir tentar novamente.
4. Manter `/api/state` como operação suportada para bootstrap/agregação se o servidor entregar o estado completo; leituras por domínio/detalhe também devem ser implementadas e usadas onde correspondam à experiência da tela.
5. Usar exclusivamente a API remota. Não criar fallback, proxy, leitura ou escrita pelo servidor Express local.
6. O OpenAPI não define paginação, filtros, códigos de erro além de alguns casos, nem segurança. A equipa deve confirmar estes pontos com a API real; o plano não acrescenta esses comportamentos por suposição.

## Etapas de implementação

### Fase 1 — Preparação

#### 1.1 Confirmar contrato e ambientes
- **Requisitos**: REQ-API-001 a REQ-API-011
- **Entradas de desenho**: OpenAPI enviado; `src/brain/lib/api.ts`; documentação/especificação da API remota
- **Descrição**: Confirmar com a API remota para cada um dos 39 métodos: corpo de pedido, corpo de resposta, campos obrigatórios/opcionais, códigos de erro, autenticação, semântica de `PUT`/`PATCH`, respostas sem corpo e comportamento de listagem. Registar o contrato confirmado em tipos/documentação versionada antes de o consumir. `server/` fica explicitamente excluído.

### Fase 2 — Base comum

#### 2.1 Endurecer cliente HTTP e configuração
- **Requisitos**: REQ-API-001 a REQ-API-011
- **Entradas de desenho**: `src/brain/lib/api.ts`, configuração Vite e contratos confirmados em 1.1
- **Descrição**: Uniformizar serialização JSON, parsing de respostas JSON/vazias, headers e erros HTTP tipados; normalizar mensagens e respostas de erro sem ocultar falhas. Cobrir timeout/cancelamento se suportado pelo padrão já usado. Preservar o uso de `VITE_API_URL` e remover dependência de fallbacks mock na camada de consumo.

#### 2.2 Tipar contratos e criar serviços por domínio
- **Requisitos**: REQ-API-001 a REQ-API-011
- **Entradas de desenho**: `src/brain/types.ts`, `src/brain/services/index.ts`, contratos confirmados em 1.1
- **Descrição**: Definir tipos de request/response apenas a partir do contrato confirmado e organizar métodos por autenticação, contactos, leads, actividade, evento e administração. Garantir que `BrainStore` e páginas não constroem URLs nem assumem envelopes de resposta.

### Fase 3 — US1: acesso e carregamento inicial (P1)

#### 3.1 Autenticar, registar e carregar estado
- **Requisitos**: REQ-API-001, REQ-API-011
- **Entradas de desenho**: `src/brain/pages/LoginPage.tsx`, `src/brain/store/BrainStore.tsx`, `src/brain/lib/api.ts`
- **Descrição**: Ligar login, registo e bootstrap a `/api/auth/login`, `/api/auth/register` e `/api/state`. Preservar estados de conta pendente e sessão existentes; não implementar bearer token/cookie até confirmação contratual. Tratar falhas de bootstrap e apresentar estado de erro/retry em vez de ocultá-las.

### Fase 4 — US2: contactos e leads (P1)

#### 4.1 Consumir contactos e captura pública
- **Requisitos**: REQ-API-002
- **Entradas de desenho**: `src/brain/pages/ContactsPage.tsx`, `src/brain/pages/PublicPage.tsx`, `src/brain/store/BrainStore.tsx`
- **Descrição**: Ligar listagem, detalhe, criação simples, edição e eliminação aos cinco métodos de `/api/contacts` e `/api/contacts/{id}`; ligar captura rápida, completa e QR aos três endpoints especializados. Adaptar fluxos da tela sem duplicar criação de contacto/lead onde o endpoint composto já o faz; actualizar estado após sucesso e apresentar erro por operação.

#### 4.2 Consumir leads, detalhe e estado
- **Requisitos**: REQ-API-003
- **Entradas de desenho**: `src/brain/pages/LeadsPage.tsx`, `src/brain/pages/LeadDetailPage.tsx`, `src/brain/store/BrainStore.tsx`
- **Descrição**: Ligar listagem/criação, detalhe, actualização, remoção e alteração de estado aos seis métodos de `/api/leads`. Preservar o filtro, pipeline e navegação actuais; assegurar que detalhe inexistente e estado inválido resultam em UX explícita conforme os status do servidor.

### Fase 5 — US3: actividade comercial (P1)

#### 5.1 Consumir interacções, follow-ups e reuniões
- **Requisitos**: REQ-API-004, REQ-API-005, REQ-API-006
- **Entradas de desenho**: `src/brain/pages/LeadDetailPage.tsx`, `src/brain/pages/CapturePages.tsx`, `src/brain/pages/CommercialPages.tsx`, `src/brain/pages/DashboardPage.tsx`, `src/brain/store/BrainStore.tsx`
- **Descrição**: Consumir listagem global e criação de interacções, incluindo criação ligada a lead; listar/criar/actualizar/concluir follow-ups; listar e agendar reuniões. Garantir associação ao lead e ao utilizador conforme contrato, estado consistente após mutação e feedback de erro/sucesso.

### Fase 6 — US4: avaliação e feedback do evento (P2)

#### 6.1 Consumir avaliação interna e feedback de visitantes
- **Requisitos**: REQ-API-007
- **Entradas de desenho**: `src/brain/pages/EventPages.tsx`, `src/brain/store/BrainStore.tsx`
- **Descrição**: Ligar leitura e gravação da avaliação em `/api/evaluation` e leitura/submissão em `/api/feedback`. Manter os fluxos públicos e internos separados, validar pontuações e campos requeridos de acordo com o contrato confirmado, e apresentar confirmação/erro visíveis.

### Fase 7 — US5: administração, notificações e catálogo (P2)

#### 7.1 Consumir notificações, soluções e utilizadores
- **Requisitos**: REQ-API-008, REQ-API-009, REQ-API-010
- **Entradas de desenho**: `src/brain/components/AppShell.tsx`, `src/brain/pages/CapturePages.tsx`, `src/brain/pages/EventPages.tsx`, `src/brain/store/BrainStore.tsx`
- **Descrição**: Ligar leitura e marcação de notificações, CRUD documentado do catálogo de soluções e listagem/aprovação/remoção de utilizadores. Preservar confirmação antes de operações destrutivas, permissões/estados de conta existentes e actualização das listas após mutação.

### Fase final — consistência e validação

#### 8.1 Validar cobertura, ambientes e fluxos
- **Requisitos**: REQ-API-001 a REQ-API-011
- **Entradas de desenho**: Matriz da API, contratos confirmados, páginas e serviços implementados
- **Descrição**: Verificar cobertura automática dos 39 métodos e testar os fluxos críticos contra a API remota num ambiente não produtivo. Confirmar que não há chamadas de escrita para produção durante testes, fallback mock ou Express silencioso, endpoint duplicado ou tratamento de erro omitido. Se não existir ambiente remoto não produtivo, limitar os testes contra produção a operações de leitura autorizadas e não executar mutações sem aprovação e dados de teste isolados.

## Plano de tarefas

### Fase 1 — Preparação
- [ ] T001 [Plan:1.1] Confirmar os 39 métodos exclusivamente com a API remota e registar request/response, autenticação, status e respostas vazias por operação em `.github/modernize/api-consumption/api-contract.md`.
- [ ] T002 [Plan:1.1] Documentar que `server/` (Express local) está fora do escopo e confirmar a URL remota não produtiva, credenciais e dados isolados de teste; não iniciar nem alterar o servidor local.

### Fase 2 — Base comum
- [ ] T003 [Plan:2.1] Actualizar `src/brain/lib/api.ts` para parsing JSON/vazio, erros HTTP tipados, configuração e comportamento consistente de Fetch segundo o contrato confirmado.
- [ ] T004 [P] [Plan:2.2] Completar tipos de domínio e tipos de request/response confirmados em `src/brain/types.ts`.
- [ ] T005 [Plan:2.2] Expandir `src/brain/services/index.ts` para expor os 39 métodos documentados por domínio, sem fallback para mocks e sem URLs construídas nas telas.
- [ ] T006 [Plan:2.1,2.2] Actualizar `src/brain/store/BrainStore.tsx` para delegar nos serviços, propagar erros e gerir carregamento/retry por domínio sem depender exclusivamente do estado agregado.

### Fase 3 — US1: acesso e estado
- [ ] T007 [US1] [Plan:3.1] Ligar login e registo, sessão e estados de conta às operações de autenticação em `src/brain/store/BrainStore.tsx` e `src/brain/pages/LoginPage.tsx`.
- [ ] T008 [US1] [Plan:3.1] Integrar carregamento e retry do estado inicial via `/api/state` nas telas de aplicação em `src/brain/store/BrainStore.tsx` e `src/brain/components/AppShell.tsx`.

### Fase 4 — US2: contactos e leads
- [x] T009 [US2] [Plan:4.1] Implementar métodos de listar/criar/obter/actualizar/eliminar contactos e ligar operações à tabela e formulário em `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx` e `src/brain/pages/ContactsPage.tsx`. O corpo de PUT usa os campos editáveis confirmados/observados nos dados do contacto; a validação remota continua pendente porque o Swagger não mostra um corpo válido e não há ambiente de teste confirmado.
- [ ] T010 [US2] [Plan:4.1] Ligar captura rápida e completa sem duplicar lead/contacto e tratar resultado composto em `src/brain/store/BrainStore.tsx` e `src/brain/pages/ContactsPage.tsx`.
- [ ] T011 [US2] [Plan:4.1] Ligar captura pública QR ao endpoint público e mostrar resultado/falha em `src/brain/pages/PublicPage.tsx` e `src/brain/store/BrainStore.tsx`.
- [x] T012 [US2] [Plan:4.2] Implementar listagem/criação/detalhe/actualização/remoção de leads e integrar detalhe não encontrado em `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx`, `src/brain/pages/LeadsPage.tsx` e `src/brain/pages/LeadDetailPage.tsx`. O corpo de PUT foi inferido dos campos devolvidos no GET e dos campos obrigatórios do POST; falta validá-lo com exemplo válido em ambiente não produtivo.
- [x] T013 [US2] [Plan:4.2] Ligar a actualização de estado da lead e reconciliar pipeline e detalhe após sucesso em `src/brain/store/BrainStore.tsx`, `src/brain/pages/LeadsPage.tsx` e `src/brain/pages/LeadDetailPage.tsx`.

### Fase 5 — US3: actividade comercial
- [x] T014 [US3] [Plan:5.1] Implementar listagem/criação global e criação por lead de interacções, e ligar cronologia e actividade global em `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx`, `src/brain/pages/LeadDetailPage.tsx` e `src/brain/pages/CapturePages.tsx`.
- [x] T015 [US3] [Plan:5.1] Implementar listagem/criação/actualização/conclusão de follow-ups e ligar agenda, dashboard e acções do utilizador em `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx`, `src/brain/pages/CommercialPages.tsx` e `src/brain/pages/DashboardPage.tsx`.
- [x] T016 [US3] [Plan:5.1] Implementar listagem e criação de reuniões e ligar formulário e actualização da lista em `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx` e `src/brain/pages/CommercialPages.tsx`.

### Fase 6 — US4: avaliação e feedback
- [x] T017 [US4] [Plan:6.1] Ligar leitura e gravação da avaliação interna, incluindo validação dos dados pelo contrato, em `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx` e `src/brain/pages/EventPages.tsx`.
- [x] T018 [US4] [Plan:6.1] Ligar listagem e submissão de feedback sem misturar o formulário público e a vista interna em `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx` e `src/brain/pages/EventPages.tsx`.

### Fase 7 — US5: administração e catálogo
- [x] T019 [US5] [Plan:7.1] Ligar leitura e marcação como lida de notificações no shell da aplicação em `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx` e `src/brain/components/AppShell.tsx`.
- [x] T020 [US5] [Plan:7.1] Ligar leitura/criação/actualização/remoção de soluções e reflectir o catálogo nas capturas e listas em `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx` e `src/brain/pages/CapturePages.tsx`.
- [ ] T021 [US5] [Plan:7.1] Ligar listagem/aprovação/remoção de utilizadores e manter confirmações administrativas em `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx` e `src/brain/pages/EventPages.tsx`. Listagem e remoção com confirmação estão implementadas; aprovação continua bloqueada pelo erro HTTP 500 do backend (coluna `status` ausente).

### Fase final — validação
- [ ] T022 [Plan:8.1] Criar testes Playwright em `e2e/api-consumption.spec.ts` para login, captura contacto→lead, actualização de estado→interacção, follow-up/reunião, submissão de feedback e gestão administrativa, usando mocks controlados ou ambiente staging.
- [ ] T023 [Plan:8.1] Adicionar verificação de cobertura dos 39 métodos da matriz em `e2e/api-consumption.spec.ts` e garantir que qualquer método sem chamada, falha HTTP ou payload divergente reprova a validação.
- [ ] T024 [Plan:8.1] Executar build, lint e Playwright com base URL de teste; confirmar ausência de dados mock como fallback, erros não tratados e mutações em produção.

## Estrutura alvo

```text
src/brain/
  lib/api.ts                  # transporte HTTP partilhado
  services/index.ts           # operações REST por domínio
  store/BrainStore.tsx        # coordenação e estado da aplicação
  types.ts                    # tipos de domínio e contratos
  pages/                      # telas ligadas aos serviços
  components/AppShell.tsx     # estado/notificações
e2e/
  api-consumption.spec.ts     # fluxos de integração do consumidor
.github/modernize/api-consumption/
  api-contract.md             # contrato confirmado antes da implementação
  plan.md
  research.md
  checkpoints/
```

## Estratégia de testes

**appType**: SPA React com API REST separada.  
**Jornadas críticas**:
1. Login válido/inválido e registo pendente; estado inicial carregado ou erro com retry.
2. Criar contacto completo, ler a lead resultante, abrir detalhe, actualizar estado e confirmar a interacção associada.
3. Capturar contacto via QR e confirmar o resultado na listagem.
4. Criar e concluir follow-up, agendar reunião e confirmar leitura posterior.
5. Submeter feedback/avaliação, marcar notificação como lida e gerir soluções/utilizadores.

**Stack primária**: Playwright para a aplicação browser; verificações de contrato REST para os 39 métodos contra a API remota num ambiente não produtivo. Usar respostas mock controladas em E2E apenas para cenários determinísticos da interface; confirmar contrato e persistência contra a API remota de staging, sem escrita em produção. Não usar o Express local. Reutilizar `npm run test:e2e`; adicionar os novos casos a esse runner.

**Matriz de fallback**:
- `infra-tier`: a API remota de staging é a dependência real para persistência e contrato; Docker não está disponível neste ambiente e o Express local não é fallback. Se o ambiente remoto não produtivo não estiver disponível, os E2E com mocks validam apenas integração UI→cliente, não persistência/contrato da API — registar a lacuna e não declarar cobertura integral.
- `browser-tier`: Playwright CLI v1.63.0 e Node.js v22.23.3 estão disponíveis; `npx playwright install --list` falhou porque não existe o directório de cache `C:\Users\regin\AppData\Local\ms-playwright\.links`. Instalar/verificar Chromium durante a validação; se isso falhar, registar o erro exacto e não substituir silenciosamente a validação browser por testes de unidade.

**Requisitos ambientais**: Node.js 22; `npm run test:e2e`; Playwright/Chromium; `VITE_API_URL` apontado exclusivamente à API remota; para testes de mutação, usar staging/ambiente remoto não produtivo com dados isolados. Docker daemon indisponível no ambiente inspeccionado.  
**Gaps conhecidos**: payloads/respostas e autenticação ainda não especificados; ausência de testes existentes; disponibilidade de API remota não produtiva não confirmada; navegador Playwright não verificado (cache indisponível); não se deve testar mutações contra a URL de produção sem autorização expressa.
**Dados de teste**: usar registos identificados com sufixo único num tenant/ambiente remoto de testes e limpar entidades criadas quando houver endpoint de remoção; não assumir dados previamente existentes.  
**Critério de PASS**: todas as 39 operações aparecem na matriz com método/path e resultado validado; fluxos de leitura/escrita persistem na API remota não produtiva; erros 4xx/5xx são apresentados e não geram estado de sucesso; build, lint e Playwright terminam com código zero.  
**Revisão final**: confirmar que cada chamada usa os serviços tipados, cada mutação tem tratamento visível, todos os métodos estão exercitados ou explicitamente justificados, não há fallback mock silencioso e nenhum teste grava em produção.

## Mapeamento de requisitos

| REQ ID | Descrição | Itens do plano | Evidência de implementação |
|---|---|---|---|
| REQ-API-001 | Consumir login e registo de utilizadores | 1.1, 2.1, 2.2, 3.1 | `src/brain/services/index.ts`, `src/brain/store/BrainStore.tsx`, `src/brain/pages/LoginPage.tsx` |
| REQ-API-002 | Consumir CRUD de contactos e os três fluxos de captura | 1.1, 2.1, 2.2, 4.1 | `src/brain/services/index.ts`, `src/brain/pages/ContactsPage.tsx`, `src/brain/pages/PublicPage.tsx` |
| REQ-API-003 | Consumir CRUD, detalhe e estado de leads | 1.1, 2.1, 2.2, 4.2 | `src/brain/services/index.ts`, `src/brain/pages/LeadsPage.tsx`, `src/brain/pages/LeadDetailPage.tsx` |
| REQ-API-004 | Consumir interacções globais e associadas a lead | 1.1, 2.1, 2.2, 5.1 | `src/brain/pages/LeadDetailPage.tsx`, `src/brain/pages/CapturePages.tsx` |
| REQ-API-005 | Consumir ciclo completo de follow-ups | 1.1, 2.1, 2.2, 5.1 | `src/brain/pages/CommercialPages.tsx`, `src/brain/pages/DashboardPage.tsx` |
| REQ-API-006 | Consumir listagem e criação de reuniões | 1.1, 2.1, 2.2, 5.1 | `src/brain/pages/CommercialPages.tsx`, `src/brain/pages/LeadDetailPage.tsx` |
| REQ-API-007 | Consumir avaliação interna e feedback de visitantes | 1.1, 2.1, 2.2, 6.1 | `src/brain/pages/EventPages.tsx` |
| REQ-API-008 | Consumir listagem e leitura de notificações | 1.1, 2.1, 2.2, 7.1 | `src/brain/components/AppShell.tsx` |
| REQ-API-009 | Consumir CRUD documentado do catálogo de soluções | 1.1, 2.1, 2.2, 7.1 | `src/brain/pages/CapturePages.tsx` |
| REQ-API-010 | Consumir listagem, aprovação e remoção de utilizadores | 1.1, 2.1, 2.2, 7.1 | `src/brain/pages/EventPages.tsx` |
| REQ-API-011 | Consumir estado agregado da aplicação | 1.1, 2.1, 2.2, 3.1 | `src/brain/store/BrainStore.tsx`, `src/brain/components/AppShell.tsx` |
