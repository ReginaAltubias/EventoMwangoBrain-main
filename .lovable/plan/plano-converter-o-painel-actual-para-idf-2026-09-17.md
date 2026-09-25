# Plano — Converter o painel actual para IDF

## Resultado esperado
- Manter o mesmo estilo visual limpo do painel actual: sidebar verde, header organizado, avatar, perfil, mapa amplo, listagens, fichas completas e entidades ligadas numa só tela.
- Trocar o conteúdo de Café · INCA para Madeira · IDF, usando dados mock locais do IDF.
- Continuar 100% frontend/read-only, sem APIs reais, sem autenticação real e sem formulários de escrita operacional.

## O que vou alterar
- Substituir o domínio activo de `/cafe` para o domínio IDF, preferencialmente em `/madeira` com redireccionamento de `/idf` para compatibilidade.
- Restaurar/adaptar as informações do IDF: operadores, licenças, concessões, produtos, espécies, guias, fiscalização, inventário, quotas, transportes e demais dados que já existiam nos mocks anteriores.
- Ajustar textos, breadcrumbs, estados e cabeçalhos para “Madeira · IDF” e “Instituto de Desenvolvimento Florestal”.
- Manter a página de perfil com permissões SIGAFLO: INCA, IDF, INCER e IDA.
- Verificar que nenhuma tela fica vazia e que as entidades ligadas aparecem com informação completa, sem depender de links.

## Detalhes técnicos
- Usar a estrutura actual de templates partilhados: dashboard, mapa, rastreabilidade, listagem e detalhe.
- Criar/ligar `src/sigaflo/domains/idf` e mocks locais em `src/mocks/idf`, reaproveitando os dados IDF já disponíveis no histórico/projeto quando existirem.
- Actualizar `src/App.tsx`, registry de domínios e textos da shell para apontarem ao IDF.
- Validar o resultado com typecheck/build e uma verificação rápida da interface.

## Assumido
- “df” significa IDF.
- A intenção é substituir o painel Café actual por um painel IDF com o mesmo layout, não manter os dois em paralelo.
