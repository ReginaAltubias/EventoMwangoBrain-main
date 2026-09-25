# Reconstrução do Back Office Mô'Kamba

## Objectivo
Substituir integralmente o painel actual por um back office de administração e moderação da Mô'Kamba, totalmente em PT-PT, com dados mock locais e preparado para ligação futura a uma API REST.

## Fases de implementação

### 1. Base visual e arquitectura
- Reorganizar o código por funcionalidades: autenticação, painel, utilizadores, denúncias, grupos, anúncios, legal, comunicados, administradores, auditoria e definições.
- Criar tokens completos para modo claro e escuro, com a paleta Mô'Kamba, tipografia Inter, superfícies arredondadas, sombras suaves e foco acessível.
- Criar componentes reutilizáveis para marca, cabeçalhos, cartões de métricas, estados, tabelas responsivas, filtros, estados de carregamento/vazio/erro e confirmações destrutivas.
- Adicionar uma camada de serviços tipada que devolve dados mock através do TanStack Query.

### 2. Acesso e estrutura principal
- Criar login com email, palavra-passe e segundo passo 2FA de seis dígitos.
- Criar sidebar recolhível e drawer móvel, topbar com pesquisa global Ctrl+K, notificações, tema e perfil.
- Guardar sessão, tema e perfil de demonstração no armazenamento local.
- Aplicar controlo de acesso visível para super-admin, moderador e suporte.

### 3. Dashboard
- Criar indicadores com variação e sparkline, actividade por período, comparação Real/Kamba, denúncias recentes e estado dos serviços.
- Incluir carregamento skeleton, estado de erro e animações discretas.

### 4. Operações e moderação
- Utilizadores: tabela avançada, filtros, ordenação, paginação, selecção múltipla, cartões em ecrãs pequenos e ficha completa.
- Denúncias: fila rápida com filtros, painel lateral, mensagens denunciadas em bolhas e acções com nota obrigatória.
- Grupos: membros, denúncias e acções de suspensão/encerramento.
- Todas as acções destrutivas terão confirmação e motivo obrigatório.

### 5. Gestão e conformidade
- Anúncios: configurações por ecrã e conta, consentimentos, impressões e receita mock.
- Legal: editor, versões, pré-visualização, publicação e aceitações.
- Comunicados: audiência, agendamento, pré-visualização móvel e manutenção.
- Administradores: convites, estado, 2FA e matriz de permissões.
- Auditoria: registo imutável, filtros e exportação CSV.
- Definições: perfil, segurança, sessões e preferências.

### 6. Qualidade final
- Dados angolanos realistas, datas relativas em PT-PT e estados consistentes.
- Validar navegação por teclado, contraste, aria-labels e foco visível.
- Validar desktop e móvel, login/2FA, pesquisa, filtros, moderação, confirmações, tema e exportação.
- Confirmar compilação limpa e ausência de erros no navegador.

## Detalhes técnicos
- React + TypeScript + Vite, React Router e shadcn/ui.
- TanStack Query para leitura dos mocks; TanStack Table para listas densas.
- React Hook Form + Zod para formulários; Recharts para gráficos; Lucide para ícones.
- Sem backend, sem chamadas externas e sem dependência dos módulos SIGAFLO/IDA anteriores.
- As rotas ficam em `/login`, `/dashboard`, `/utilizadores`, `/denuncias`, `/grupos`, `/anuncios`, `/legal`, `/comunicados`, `/administradores`, `/auditoria` e `/definicoes`.
