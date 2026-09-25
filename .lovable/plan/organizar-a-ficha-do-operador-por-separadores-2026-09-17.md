# Organizar a ficha do operador por separadores

## Objectivo
Reduzir a confusão na ficha do operador, mostrando uma categoria de informação de cada vez e acrescentando o controlo de consumo em metros cúbicos.

## Alterações
- Manter o cabeçalho e o resumo do operador.
- Substituir a sequência longa de blocos por separadores claros: **Resumo**, **Consumo**, **Financeiro**, **Documentos**, **Concessões**, **Tramitação**, **Produção**, **Circulação**, **Fiscalização** e **Arquivo**.
- Cada separador mostrará a sua própria tabela ou painel, sem misturar informações de outras categorias.
- Abrir a ficha no separador **Resumo**, com identificação, contactos e indicadores principais.
- Criar o separador **Consumo** com uma linha por concessão/quota: volume contratado, volume consumido, volume disponível e percentagem consumida.
- Exibir o saldo automaticamente pela fórmula: `volume disponível = volume contratado − volume consumido`, nunca abaixo de zero.
- Incluir totais consolidados do operador e barras de progresso para facilitar a leitura.
- Manter os contratos, pareceres e documentos consultáveis nos respectivos separadores.
- Preservar o comportamento apenas de consulta e os dados mock locais.

## Detalhes técnicos
- O sistema de separadores será aplicado apenas às fichas de **Operadores**.
- Os valores de consumo serão derivados das quotas e concessões já associadas ao operador; quando necessário, será criado um valor mock coerente por concessão.
- O layout continuará adaptado a computador e telemóvel, com animações suaves e respeito pela preferência de movimento reduzido.
- Validar a ficha com dados, troca de separadores, cálculos em m³ e compilação sem erros.
