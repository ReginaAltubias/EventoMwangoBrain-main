# Pesquisa e decisões — consumo integral da API

## Decisão: tratar o OpenAPI enviado como inventário de escopo, não como contrato de payload completo

**Decisão**: considerar as 39 operações listadas como escopo fechado de cobertura; fechar os corpos de pedido, respostas, autenticação e erros com a implementação real da API antes de codificar a tipagem final.

**Racional**: o OpenAPI remoto publicado em `https://ssgmea-mosap3.a2hosted.com/backend/public/docs?api-docs.json` declara os 39 métodos e seus paths, mas nenhum dos 39 tem `requestBody`; `components.schemas` e `components.securitySchemes` estão vazios e as respostas não têm schemas. O texto Swagger UI partilhado mostra alguns corpos de resposta e erros de validação 422, mas não estabelece todos os campos/tipos opcionais, payloads aceites, nem autenticação. Inferir estes dados poderia quebrar compatibilidade.

**Alternativas consideradas**:
- Reutilizar os tipos locais em `src/brain/types.ts` como contrato exacto: rejeitada porque tipos locais não provam que o serviço remoto devolve a mesma forma.
- Inferir payloads pela descrição de cada endpoint: rejeitada porque as descrições não especificam campos nem regras de validação.
- Usar exclusivamente `/api/state` em vez dos endpoints por domínio: rejeitada porque não cobre CRUD, leituras de detalhe, nem prova consumo das 39 operações.

## Decisão: consumir exclusivamente a API remota

**Decisão**: a aplicação e os testes de contrato usam exclusivamente a API remota, configurada por `VITE_API_URL`. O servidor Express em `server/` fica fora do escopo: não iniciar, alterar, usar como fallback, nem direccionar chamadas para ele.

**Racional**: manter um único backend evita divergência de comportamento e conflitos entre a implementação local e o serviço remoto.

**Alternativas consideradas**:
- Alternar entre API remota e Express local: rejeitada por criar dois comportamentos possíveis e risco de inconsistência.
- Usar Express como fallback se a API remota falhar: rejeitada porque mascara indisponibilidade real e pode apresentar dados divergentes.

## Decisão: preservar configuração de ambientes da API remota

**Decisão**: continuar a usar `VITE_API_URL` como base URL para a API remota. Executar testes de integração contra um ambiente remoto não produtivo.

**Racional**: `src/brain/lib/api.ts` já permite configurar a base URL. O OpenAPI fornecido lista uma URL de produção e não se deve enviar escritas de teste para ela.

**Alternativas consideradas**:
- Fixar a URL de produção no cliente: rejeitada por impedir testes seguros e ambientes independentes.
- Usar o Express local quando staging não estiver disponível: rejeitada, pois o servidor local está fora do escopo e não deve mascarar indisponibilidade remota.

## Limites em aberto para a tarefa de preparação

- Esquemas de request/response e envelopes de dados de todas as 39 operações.
- Política de autenticação e persistência da sessão; não há `security` definido no OpenAPI.
- Comportamento de paginação/filtros e códigos de erro completos.
- Confirmação da URL remota não produtiva, credenciais e dados de teste isolados.
- `BrainStore` enviava avaliação por `PUT`, mas o OpenAPI remoto e o Swagger UI documentam `POST`; o frontend foi alinhado ao método documentado. A estrutura do payload continua a precisar de confirmação.
- O Swagger UI fornecido mostra que `POST /api/contacts/full` retornou 201 e criou `CON-4034`/`LEAD-4692` e depois `CON-2841`/`LEAD-5537` em produção; o utilizador confirmou que ambas as criações foram intencionais e pediu para manter todos os registos sem alterações.
- O Swagger UI mostra também `POST /api/evaluation` com HTTP 200; o utilizador confirmou que a submissão foi intencional e pediu para não a reverter.

## Evidência parcial de validação da API remota

O Swagger UI executou pedidos vazios (`-d ''`). Os erros 422 revelam alguns campos obrigatórios, mas não os tipos, enums, formatos de data, relações entre campos nem payloads opcionais aceites:

| Operação | Campos reportados como obrigatórios |
|---|---|
| `POST /api/auth/login` | `email`, `password` |
| `POST /api/auth/register` | `name`, `email`, `role`, `password` |
| `POST /api/contacts` | `fullName`, `company`, `phone`, `source` |
| `POST /api/contacts/quick` | `fullName`, `company`, `phone`, `mainSolution`, `interest` |
| `POST /api/public/qr-contact` | `fullName`, `company` |
| `POST /api/leads` | `contactId`, `mainSolution`, `interest`, `status`, `ownerId` |
| `POST /api/interactions` | `leadId`, `type`, `description` |
| `POST /api/follow-ups` | `leadId`, `action`, `dueDate` |
| `POST /api/meetings` | `leadId`, `type`, `start`, `end`, `ownerId` |
| `POST /api/feedback` | `overall`, `team`, `presentation`, `relevance` |
| `POST /api/solutions` | `name`, `subtitle` |

O `POST /api/contacts/full` respondeu 201 a pedidos sem corpo na saída Swagger; esses pedidos criaram contactos/leads com valores por omissão. O `POST /api/evaluation` respondeu 200 sem corpo e foi confirmado como intencional. Estes resultados não definem os formatos correctos dos payloads. Também faltam exemplos de sucesso para update/contact, lead, follow-up e solução; interacção associada a lead; conclusão de follow-up; e autenticação bem-sucedida.

### Contrato observado para contactos — Swagger enviado em 2026-10-06

- `GET /api/contacts` devolve HTTP 200 com uma lista de contactos. A resposta observada inclui propriedades em `snake_case` e aliases `camelCase` para os campos usados pela interface.
- `GET /api/contacts/{id}` devolve HTTP 200 quando encontrado e 404 quando não encontrado. O exemplo inclui os dados do contacto e arrays `leads` e `feedback` associados.
- `POST /api/contacts` documenta HTTP 201; a chamada vazia devolveu 422 e identificou `fullName`, `company`, `phone` e `source` como obrigatórios. Não há exemplo de criação válida nem schema de resposta.
- `PUT /api/contacts/{id}` devolve HTTP 200 com o contacto, mas o Swagger executou-o sem corpo. A forma válida do pedido e os campos actualizáveis não foram demonstrados.
- `DELETE /api/contacts/{id}` documenta HTTP 200, mas não esclarece os efeitos sobre leads/feedback associados. A interface apresenta confirmação e alerta; o cliente aceita resposta vazia no DELETE.

A interface liga os cinco métodos de CRUD. A criação envia `fullName`, `company`, `phone` e `source` (os campos obrigatórios observados); a actualização envia os campos editáveis de contacto em `camelCase`, alinhados com os nomes observados na criação/resposta. O corpo válido de `PUT` continua sem confirmação e a resposta não foi verificada contra ambiente de teste. A remoção exige confirmação e avisa que o efeito em leads/feedback associados não é especificado. Nenhuma escrita remota foi executada por esta implementação.

### Contrato observado para leads — Swagger enviado em 2026-10-06

- `GET /api/leads` devolve HTTP 200 com lista de leads e propriedades em `snake_case` com aliases `camelCase`; o objeto inclui contacto relacionado e interacções.
- `GET /api/leads/{id}` documenta HTTP 200 e 404.
- `POST /api/leads` documenta HTTP 201; o pedido vazio devolveu 422 com os campos obrigatórios `contactId`, `mainSolution`, `interest`, `status` e `ownerId`.
- `PUT /api/leads/{id}` documenta HTTP 200 e 404, mas não apresenta um pedido válido ou schema do corpo.
- `DELETE /api/leads/{id}` e `PATCH /api/leads/{id}/status` documentam HTTP 200. O exemplo não especifica cascata para interacções, follow-ups ou reuniões, nem enumeração de status aceite.

A interface consome os seis caminhos (listagem, detalhe, criação, edição, remoção e mudança de estado). A criação envia os campos obrigatórios observados e usa o utilizador autenticado como `ownerId`. A edição envia os campos disponíveis no modelo lido pela API, incluindo os campos obrigatórios do POST. Esse formato de PUT e os efeitos da remoção continuam sem confirmação; não foram feitas mutações remotas durante esta implementação.

### Contrato observado para interacções — Swagger enviado em 2026-10-06

- `GET /api/interactions` documenta HTTP 200 e lista de interacções; o corpo do exemplo recebido não contém um schema detalhado.
- `POST /api/interactions` documenta HTTP 201. O pedido vazio executado no Swagger devolveu 422 e identificou `leadId`, `type` e `description` como obrigatórios.
- `POST /api/leads/{leadId}/interactions` documenta HTTP 201 e recebe o ID da lead no path. O Swagger não apresenta um exemplo válido de corpo nem os campos aceites.
- Não há endpoints `PUT`, `PATCH` ou `DELETE` de interacções documentados no material recebido; a interface limita-se à listagem e criação, sem oferecer edição ou eliminação.

A página global carrega a colecção por `GET /api/interactions` e permite registar uma interacção através de `POST /api/interactions`, enviando os três campos obrigatórios observados. A cronologia no detalhe da lead mantém a criação específica por lead, através de `POST /api/leads/{leadId}/interactions`, com tipo e descrição. Os testes verificam methods, paths e payloads usando `fetch` simulado; não foram executadas escritas remotas. A estrutura exacta da resposta e o corpo válido do endpoint específico por lead continuam por confirmar.

### Contrato observado para follow-ups — Swagger enviado em 2026-10-06

- `GET /api/follow-ups` devolve HTTP 200 com lista de follow-ups. A resposta inclui aliases `snake_case` e `camelCase` para lead, data prevista e responsável, e pode incluir o lead associado.
- `POST /api/follow-ups` documenta HTTP 201; o pedido vazio devolveu 422 com `leadId`, `action` e `dueDate` como campos obrigatórios.
- `PATCH /api/follow-ups/{id}/complete` documenta HTTP 200. O exemplo partilhado concluiu `FUP-1` sem request body; o endpoint devolveu o follow-up com estado `Concluído`.
- `PUT /api/follow-ups/{id}` documenta HTTP 200 e uma resposta do follow-up, mas o exemplo não envia request body. A descrição indica actualização de estado, sem definir o payload.

A página de Follow-ups e o dashboard utilizam o conjunto carregado directamente por `GET /api/follow-ups`, em vez de depender da lista agregada ou de dados de demonstração. Criação e conclusão usam os endpoints dedicados. O utilizador confirmou que a chamada Swagger de `PUT /api/follow-ups/{id}` não envia corpo; a página disponibiliza uma acção para chamar esse endpoint sem payload e depois actualizar a lista. Como o Swagger não mostra parâmetros nem explica qual estado é alterado pelo PUT, a acção reflecte estritamente a operação documentada, sem tentar escolher ou fabricar um estado. Foi executada uma leitura real de `GET /api/follow-ups` na API remota, que devolveu 20 registos. Nenhum POST, PUT ou PATCH foi enviado remotamente nesta implementação.

### Contrato observado para reuniões — Swagger enviado em 2026-10-06

- `GET /api/meetings` devolve HTTP 200 com reuniões e inclui `lead` relacionado, além dos campos `leadId`, `ownerId`, `start`, `end`, `type` e `location`.
- `POST /api/meetings` documenta HTTP 201; a chamada vazia devolveu 422 com `leadId`, `type`, `start`, `end` e `ownerId` obrigatórios. `location` é opcional no exemplo observado.

O store carrega a lista de reuniões directamente de `GET /api/meetings`, e não da colecção `/api/state`. O formulário cria reuniões via `POST /api/meetings`; a camada de serviço inclui `ownerId` da sessão autenticada e não chama escrita se não existir sessão. Foi executada uma leitura real do GET remoto, que devolveu 9 reuniões. Nenhuma criação remota foi executada; o pedido válido POST ainda não foi demonstrado no Swagger.

### Contrato observado para feedback e soluções — Swagger enviado em 2026-10-06

- `GET /api/feedback` devolve HTTP 200 com feedbacks e aliases snake_case/camelCase, incluindo `overall`, `team`, `presentation`, `relevance`, `highlights`, `wantsSolution`, `wantsContact`, comentário e contacto relacionado.
- `POST /api/feedback` documenta HTTP 201; pedido vazio devolveu 422 com `overall`, `team`, `presentation` e `relevance` obrigatórios.
- `GET /api/solutions` devolve HTTP 200 com `id`, `name` e `subtitle`.
- `POST /api/solutions` documenta HTTP 201; pedido vazio devolveu 422 com `name` e `subtitle` obrigatórios.
- `PATCH /api/solutions/{id}` e `DELETE /api/solutions/{id}` documentam HTTP 200. A chamada PATCH mostrada devolve a solução; não há exemplo de corpo PATCH no trecho fornecido.

O store carrega `feedback` e `solutions` pelos endpoints dedicados, substituindo os arrays que vinham de `/api/state`. Feedback mantém listagem e submissão pela página, e os cartões de média são agora calculados sobre os registos remotos em vez de apresentarem valores fixos; formulário envia as quatro classificações exigidas. O catálogo mantém criação, actualização, remoção com confirmação e actualiza o estado após mutações por serviço. Foram feitas leituras remotas sem escrita: 15 feedbacks e 6 soluções. Nenhuma submissão/criação/actualização/remoção foi executada remotamente.

### Divergências já identificadas entre consumidor e API

- A criação de reunião no frontend não enviava `ownerId`, embora a validação remota o reporte como obrigatório. A camada de serviço agora acrescenta o ID do utilizador autenticado e recusa criar a reunião sem sessão.
- As respostas observadas para contactos, leads, interacções, follow-ups, reuniões e feedback incluem propriedades `snake_case` e aliases `camelCase`; o estado agregado tem as colecções esperadas pelo frontend.
- A colecção `users` observada em `/api/state` contém `id` numérico, `name`, `email`, `email_verified_at`, `created_at` e `updated_at`, mas o frontend espera `id` textual, `role`, `initials` e `status`. Não há informação suficiente para derivar estes campos; confirmar se a API pode devolvê-los ou se existe um mapeamento de negócio autorizado.
- Vários campos opcionais do domínio podem ser `null` na API (por exemplo, notas de contacto e lead), mas os tipos React actuais declaram principalmente `?: string`, não `string | null`. Auditar nulabilidade antes de ligar a resposta crua a cada página.

### Contrato observado para utilizadores e notificações — Swagger enviado em 2026-10-06

- `GET /api/users` devolve HTTP 200 com utilizadores identificados por ID numérico e campos `name` e `email` (também podem surgir `email_verified_at` e timestamps). A página consome apenas os três campos confirmados pelo tipo `TeamMemberSummary`.
- `PATCH /api/users/{id}/approve` está documentado, mas a execução já observada no Swagger devolveu HTTP 500 porque a base de dados não tem a coluna `status`. Não voltar a executar nem expor aprovação na UI até o backend corrigir a migração e confirmar o contrato.
- `DELETE /api/users/{id}` é destrutivo e o material não estabelece política de autorização, protecção contra auto-remoção ou semântica de rejeição. Após pedido explícito do utilizador, a página de utilizadores expõe a eliminação com confirmação, apresenta erros da API e remove o registo do estado apenas após sucesso; se a conta eliminada for a sessão actual, a sessão local é terminada.
- `GET /api/notifications` devolve HTTP 200 com `id`, `title`, `detail`, `date`, `read` e `href`.
- `PATCH /api/notifications/{id}/read` documenta resposta `{"ok": true}`. A integração marca a notificação localmente apenas depois da resposta bem-sucedida; nenhuma escrita remota foi executada durante esta implementação.

### Contrato observado para avaliação interna — Swagger enviado em 2026-10-06

- `GET /api/evaluation` devolve HTTP 200 com um objecto contendo `scores` (mapa de critérios para valores de 1 a 5), `wentWell`, `difficulties`, `topSolutions` (lista de strings), `mainNeeds`, `improvements` e `savedAt` (data ISO).
- `POST /api/evaluation` documenta HTTP 200 e devolve a avaliação guardada com a mesma estrutura. O exemplo Swagger efectuou uma gravação válida; a implementação envia os campos actualmente editáveis no formulário e não executou nova escrita remota.
- O store carrega esta avaliação do endpoint dedicado, sem depender do valor potencialmente desactualizado em `/api/state`. A camada de serviço rejeita respostas/pedidos com estrutura incompatível ou pontuações não inteiras fora de 1–5.
