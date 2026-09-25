# Detalhes completos, mapa aberto e marca INCA

## Resultado
- Cada ficha mostrará, na mesma página, todos os dados da entidade e das entidades relacionadas.
- As secções relacionadas deixarão de ter cartões ou botões que levam para outras páginas.
- O mapa usará OpenStreetMap e continuará a mostrar produtores, explorações e armazéns.
- O logótipo enviado do INCA será aplicado em branco na sidebar e como favicon.

## Implementação
1. Ampliar o modelo das secções de detalhe para suportar blocos relacionados completos e sem navegação.
2. Substituir as ligações actuais de produtores, explorações, parcelas, colheitas, lotes, transformações, embalagens e stock por dados expandidos em tabelas/campos.
3. Remover links das fichas, dos pontos do mapa e da rastreabilidade, preservando apenas consulta na tela actual.
4. Trocar a cartografia local actual por tiles OpenStreetMap, com atribuição visível e marcadores INCA.
5. Aplicar a versão branca do logótipo enviado na sidebar e gerar o favicon quadrado correspondente.
6. Validar as fichas principais, mapa, rastreabilidade, computador e telemóvel.

## Detalhes técnicos
- Tudo permanece 100% frontend e read-only, usando os mocks locais existentes.
- Nenhum novo formulário, autenticação ou escrita de dados será incluído.
- O OpenStreetMap será a única chamada externa necessária para os tiles cartográficos.
