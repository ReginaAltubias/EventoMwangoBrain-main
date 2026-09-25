# Portal do Produtor de Café · INCA

## Objectivo
Substituir o actual painel do operador IDF por um portal exclusivo do produtor de café, mantendo o mesmo layout limpo, sidebar em grupos, cabeçalho, cartões estatísticos, tabelas e animações.

## Estrutura do portal
- **Visão geral**: área de café, explorações, parcelas, produção da campanha, lotes e alertas.
- **O meu cadastro**: dados pessoais e agrícolas, contactos, documentos, permissões e alteração de palavra-passe.
- **Produção agrícola**: Minhas Explorações, Parcelas, Colheitas e Manutenções.
- **Café e rastreabilidade**: Lotes, Transformações, Embalagens e percurso completo do café.
- **Armazenamento e mercado**: Stock, Movimentos e Preços de Mercado.
- **Acompanhamento**: Notificações, documentos a submeter e Ajuda.

## Experiência principal
- O produtor apenas consulta os seus registos, actualiza dados permitidos e submete documentos quando solicitado.
- Explorações e parcelas terão fichas completas; no detalhe da exploração, um mapa mostrará o limite da exploração, as parcelas e as colheitas por parcela.
- Colheitas, lotes e transformações serão apresentados em tabelas com estado, quantidade, qualidade e histórico.
- A rastreabilidade mostrará a cadeia exploração → parcela → colheita → lote → transformação → embalagem → armazém.
- Preços de mercado serão informativos, filtrados por província e tipo de café.

## Dados de demonstração
- Reutilizar os dados locais já existentes do INCA.
- Associar uma conta de produtor de demonstração às suas explorações, parcelas, colheitas, lotes e documentos.
- Todos os estados e textos permanecerão em português de Angola.

## Detalhes técnicos
- Manter React, Tailwind, componentes existentes e animações com redução de movimento.
- Substituir as rotas `/painel/*` pelas páginas do produtor INCA, sem login e sem APIs reais.
- Usar OpenStreetMap/Leaflet no detalhe geográfico.
- Preservar tabelas para conjuntos grandes de dados e cartões estatísticos no mesmo padrão visual.
- Validar navegação, mapa, tabelas, estados, vista móvel e downloads/documentos disponíveis.
