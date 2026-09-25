# Converter o painel para Café · INCA

## Resultado
- Manter integralmente o layout actual: sidebar, cabeçalho, cartões, gráficos, tabelas, separadores, fichas, animações e perfil.
- Substituir os módulos e dados de Madeira · IDF pelos dados locais de Café · INCA.
- Usar apenas consulta, sem APIs reais, formulários ou alterações de dados.

## Implementação
1. Activar o domínio Café · INCA e alterar as rotas principais para `/cafe`, mantendo redireccionamentos das rotas antigas.
2. Adaptar cabeçalho, perfil, títulos, descrições e metadados para o Instituto Nacional do Café.
3. Reutilizar os mocks INCA existentes em todos os módulos: produtores, explorações, parcelas, colheitas, manutenções, lotes, transformações, embalagens, armazéns, armazenagens, movimentos, mercado, variedades e utilizadores.
4. Preservar fichas completas com separadores e tabelas, mostrando relações na mesma página.
5. Adaptar a rastreabilidade para a cadeia produtor → exploração → parcela → colheita → lote → transformação → embalagem → armazém.
6. Adaptar o OpenStreetMap para representar explorações como áreas principais, parcelas delimitadas dentro de cada exploração e colheitas dentro das parcelas; os detalhes aparecem ao seleccionar cada área.
7. Rever estados em português, dados vazios, navegação e visualização em computador e telemóvel.

## Detalhes técnicos
- O `incaDomain` será a única configuração activa no registry.
- O modelo territorial do mapa será derivado dos dados locais existentes, sem alterar o conteúdo operacional dos mocks.
- O sistema continuará 100% frontend e read-only.
