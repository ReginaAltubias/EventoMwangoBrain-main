# Reconstrução do Sistema Café — INCA

## Objectivo
Substituir integralmente o Portal IDF pelo backoffice consultivo do **Café — INCA**, com dados locais completos, sem autenticação, formulários, edição ou chamadas externas.

## Experiência escolhida
- Direcção: painel institucional moderno.
- Paleta fixa: verde floresta `#1F523A`, café, dourado discreto e superfícies claras.
- Tipografia: Sora nos títulos e Manrope no restante conteúdo.
- Estrutura: sidebar compacta e recolhível, ligada ao cabeçalho; avatar e identificação **Café · INCA**.
- Animações suaves de entrada, navegação e realce, respeitando redução de movimento.

## O que será construído
1. **Base do sistema**
   - Remover páginas, estado e fluxos do Portal do Produtor IDF.
   - Restaurar a arquitectura INCA tipada e isolada, com rotas apenas do Café.
   - Actualizar nome, metadados e identidade para SIGAFLO — Café · INCA.

2. **Navegação e páginas**
   - Visão geral, mapa e rastreabilidade.
   - Listagem e detalhe para: produtores, explorações agrícolas, parcelas, colheitas, manutenções, lotes de processamento, transformações, embalagens, armazéns, armazenagens, movimentos de armazém, dados de mercado, variedades e utilizadores.
   - Sidebar agrupada e recolhível, mantendo aberto apenas o grupo activo.

3. **Dados e leitura**
   - Restaurar e completar os mocks INCA para que nenhuma página fique vazia.
   - Filtros, pesquisa, paginação e exportação CSV nas listagens.
   - Detalhes com relações entre entidades e ligações para consulta.
   - Sem botões de criar, editar, apagar, carregar ou mudar estado.

4. **Painel e visualização**
   - Indicadores de produtores, explorações, produção e lotes.
   - Gráficos por espécie, estado, província e evolução mensal.
   - Mapa de Angola com produtores, explorações e armazéns.
   - Rastreabilidade por código de embalagem, exibindo a cadeia completa em linha temporal.

5. **Qualidade**
   - Ajustar o painel para computador e telemóvel.
   - Verificar rotas, dados, filtros, mapa, rastreabilidade, consola e compilação.

## Limites
- 100% frontend e dados mock locais.
- Nenhuma API real, autenticação ou operação de escrita.
- Apenas o sistema Café — INCA; nenhuma página ou módulo IDF permanecerá acessível.
