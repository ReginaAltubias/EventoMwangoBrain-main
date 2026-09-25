# Mapa IDF com OpenStreetMap e ocupação por concessões

## Objectivo
Repor o OpenStreetMap como mapa base e manter as camadas territoriais do IDF claramente visíveis.

## Alterações
- Usar novamente os mosaicos do OpenStreetMap, com créditos cartográficos visíveis.
- Mostrar cada área registada como polígono delimitado e cada concessão como uma mancha interior proporcional aos hectares ocupados.
- Usar cores distintas para área total, concessão ocupada, área disponível e conflitos territoriais.
- Ao seleccionar uma área, apresentar área total, hectares ocupados por cada concessão, saldo disponível e percentagem de ocupação.
- Manter pesquisa, filtros, lista de registos, ecrã completo e controlo para ligar/desligar sobreposições.
- Validar a visualização no navegador e o funcionamento dos filtros e detalhes.

## Nota técnica
A geometria da concessão será calculada dentro do polígono da área com base na proporção `hectares da concessão / hectares da área`, usando os dados mock locais já existentes.
