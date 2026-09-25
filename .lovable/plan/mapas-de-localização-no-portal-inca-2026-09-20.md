# Mapas de localização no Portal INCA

## Alterações
- Adicionar em **O Meu Cadastro** um mapa OpenStreetMap com marcador na localização registada do produtor e um resumo de província, município e comuna.
- Adicionar na ficha **Ver tudo** de cada posição de stock um mapa OpenStreetMap com marcador na localização do armazém associado.
- Reutilizar o padrão visual e técnico dos mapas já existentes, mantendo os dados locais e o funcionamento apenas de consulta.

## Detalhes técnicos
- Criar um componente de mapa de localização reutilizável com Leaflet.
- Relacionar a posição de stock ao armazém pelo identificador já presente nos dados mock.
- Integrar o mapa como separador próprio na ficha do stock e como secção no cadastro.
- Validar os dois mapas no navegador, incluindo a apresentação em ecrãs menores.
