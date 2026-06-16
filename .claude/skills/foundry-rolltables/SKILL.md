---
name: foundry-rolltables
description: Use ao criar ou popular RollTables (tabelas aleatórias) num system Foundry v14 — RollTable.create com results, ranges, weights, formula, draw(), tabelas aninhadas e empacotamento em compendium packs. Acione para as muitas tabelas do Toon (Espécies, Profissões, Tabelas Imbecis 11-66, gerador de aventuras) que usam Dezenas-e-Unidades.
---

# Foundry VTT v14 — RollTables

Doc: `foundry_14_api_docs/Knowledge_Base/Rollable Tables/roll-tables.md`. API: `classes/foundry.documents.RollTable.md`, `foundry.documents.collections.RollTables.md`.

O Toon é cheio de tabelas aleatórias consultadas por **Dezenas e Unidades** (resultado 11–66, ver skill `foundry-dice-rolls`): Espécies, Espécies Disparatadas/Idiotas, Profissões, Efeitos da Estupefação, Coisas Caindo do Céu, Conteúdo de Garrafa, Lugares para Teleporte, Gerador de Aventuras, etc. RollTables são o jeito nativo de modelá-las.

## Anatomia

- `formula` — fórmula de rolagem (ex.: `"1d66"` não existe; veja "Tabelas 11-66" abaixo).
- `results[]` — cada entrada tem `range: [min, max]`, `weight`, `type` (text/document/compendium), e `text`/referência.
- `replacement` — `false` = sem reposição (esgota entradas); `true` = pode repetir.

## Criar uma tabela em código

```js
await RollTable.implementation.create({
  name: "Profissões",
  formula: "1d66",                 // ver ajuste para Dezenas-e-Unidades abaixo
  replacement: true,
  results: [
    { type: CONST.TABLE_RESULT_TYPES.TEXT, text: "Bebê",   range: [11, 11], weight: 1 },
    { type: CONST.TABLE_RESULT_TYPES.TEXT, text: "Criança", range: [12, 12], weight: 1 },
    // ...
    { type: CONST.TABLE_RESULT_TYPES.TEXT, text: "Laçador de cães", range: [66, 66], weight: 1 }
  ]
});
```

### Tabelas "11-66" (Dezenas e Unidades)

Não existe d66 nativo. Duas opções:
- **Recomendado**: `formula: "1d6*10 + 1d6"` — gera exatamente 11–66 (cada d6 = 1..6), casando com a regra do livro. Os `range` das entradas usam os números 11,12,...,16,21,...,66 (sem 17–20, etc).
- Alternativa: gere o valor com seu próprio roll (ver skill `foundry-dice-rolls`) e chame `table.getResultsForRoll(value)` / `table.draw({ roll })`.

## Sortear

```js
const table = game.tables.getName("Profissões");
const { results, roll } = await table.draw();   // posta cartão no chat e devolve resultado
// sem postar no chat:
const drawn = await table.draw({ displayChat: false });
```

## Tabelas aninhadas

Uma entrada pode ser `type: DOCUMENT` apontando para outra RollTable (ex.: "Outra" → rola em tabela mais disparatada). Para anunciar a sub-tabela, ponha uma entrada de texto com o **mesmo range** antes da entrada da tabela.

## Empacotar como compendium

Declare o pack no `system.json` (`{ "name": "tabelas", "label": "Tabelas Imbecis", "type": "RollTable", "system": "toon-rpg" }`) e gere as tabelas dentro dele. Em v13+ os packs são pastas de banco LevelDB; o fluxo prático é:
1. Criar as RollTables num mundo de dev.
2. Exportar para o pack (ou usar um script de build `@foundryvtt/foundryvtt-cli` para compilar JSON → pack).
Mantenha as fontes em JSON versionável no repo (ex.: `packs/_source/tabelas/*.json`) e compile no build de release.

## Padrão recomendado para o Toon

Crie um gerador (`module/setup/table-generator.mjs`, à la `SkillGenerator` do ABEA) exposto em `game.toon.generateTables()` que cria/atualiza todas as tabelas do livro de forma idempotente, com os dados das listas mantidos em arquivos `.mjs`/`.json` no repo.
