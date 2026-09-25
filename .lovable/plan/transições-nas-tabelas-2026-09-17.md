# Transições nas tabelas

## Alterações
- Aplicar animação suave na troca entre os separadores da ficha do operador.
- Animar a entrada e actualização das linhas das tabelas com opacidade e pequeno deslocamento.
- Usar transições curtas e escalonadas para manter a leitura rápida.
- Respeitar a preferência do dispositivo por movimento reduzido.

## Âmbito técnico
- Reutilizar o React Motion já instalado no projecto.
- Centralizar o comportamento nos modelos partilhados de detalhe e listagem, cobrindo as tabelas do sistema sem alterar dados ou regras.
- Validar a ficha do operador, filtros/listagens e o funcionamento em ecrãs menores.
