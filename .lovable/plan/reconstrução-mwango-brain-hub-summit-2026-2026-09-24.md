# Reconstrução: Mwango Brain — Hub Summit 2026

## Objectivo

Substituir integralmente o sistema actual por um portal interno, navegável e premium para gerir a participação da Mwango Brain no Eventos MwangoBrain 2026. A aplicação será 100% frontend, com dados mock persistentes no navegador e uma camada de serviços pronta para futura ligação a uma API.

## Experiência e identidade

- Aplicar a direcção “Corporate Tech Noir”: base clara, sidebar preta e vermelho Mwango reservado a acções e destaques.
- Criar tokens semânticos para cores, estados, raios, tipografia Inter, tabelas e impressão; sem cores soltas nos componentes.
- Implementar desktop com sidebar fixa, tablet com menu compacto e mobile com navegação inferior e captura rápida central.
- Usar o wordmark `mwangobrain`, com “brain” vermelho, padrão subtil apenas no login e página pública.

## Estrutura principal

- Criar sessão local de demonstração, login dividido, rotas protegidas e entrada pública por QR Code.
- Construir shell com menu agrupado, header com breadcrumb, estado do evento, pesquisa global, notificações e captura rápida.
- Criar modelos, mocks coerentes, store persistente e serviços assíncronos para contactos, leads, interacções, follow-ups, reuniões, feedback e avaliação.
- Remover da experiência final todas as páginas, marcas e rotas do sistema anterior.

## Páginas e fluxos

1. **Dashboard e executivo** — KPIs coerentes, interesse por solução, funil, leads recentes, agenda, follow-ups e vista executiva imprimível.
2. **Captação** — contactos, captura rápida em 30–60 segundos, formulário completo em três passos, catálogo de soluções e interacções.
3. **Leads** — filtros, exportação, tabela/cartões, kanban, detalhe, workflow, notas, alteração de estado, WhatsApp e operações em lote.
4. **Comercial** — follow-ups com conclusão e resultado, calendário de reuniões e oportunidades por estado.
5. **Evento** — feedback do visitante, avaliação interna com autosave, radar, relatórios com pré-visualização e exportações.
6. **Administração** — utilizadores e configurações simples, mantendo o foco no protótipo do evento.
7. **Página pública** — catálogo mobile-first das seis soluções, consentimento obrigatório, criação de contacto QR e notificação interna.

## Interacções obrigatórias

- Guardar uma captura rápida actualiza os indicadores e listas imediatamente.
- Criar contacto completo gera contacto, lead, follow-up e interacção relacionados.
- Registar uma interacção ou reunião actualiza a timeline e o calendário.
- Concluir follow-up regista o resultado na timeline.
- Submeter interesse público cria contacto com origem QR Code e nova notificação.
- Pesquisa, notificações, atalhos `Ctrl/⌘+K` e `N`, toasts, estados vazios e exportações funcionam de ponta a ponta.

## Dados e conteúdo

- Incluir pelo menos 30 contactos, 20 leads, 10 follow-ups, 6 reuniões, 15 feedbacks e 5 utilizadores.
- Usar empresas, nomes, telefones, datas, horas e valores plausíveis de Angola, concentrados no período do evento.
- Garantir que KPIs, funil, contagens por solução e totais das páginas são derivados dos mesmos dados.
- Toda a interface será em português de Angola/europeu, conforme a terminologia fornecida.

## Implementação técnica

- React, TypeScript, Vite, Tailwind, shadcn/ui, React Router, Recharts, react-hook-form, zod, date-fns e qrcode.react.
- Store React Context com persistência em `localStorage`, evitando dependência adicional quando não necessária.
- Componentes partilhados para layout, estados, soluções, formulários, timeline, calendário, pesquisa, notificações, exportação e navegação móvel.
- Impressão/PDF via folha de impressão e `window.print()`; CSV/XLSX gerado no cliente.
- Sem backend, chamadas externas, uploads reais ou autenticação remota.

## Validação

- Verificar compilação e estado do preview.
- Testar login, captura rápida, contacto completo, lead, interacção, reunião, follow-up, QR público, feedback, relatórios e exportações.
- Rever visualmente em desktop e mobile, incluindo menu compacto, navegação inferior, tabelas convertidas em cartões e alvos de toque.
- Confirmar acessibilidade básica: foco visível, labels, teclado, contraste, texto + ícone nos estados e movimento reduzido.
