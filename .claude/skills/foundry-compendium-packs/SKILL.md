---
name: foundry-compendium-packs
description: Use ao criar, popular ou empacotar compendium packs num system Foundry v14 — declarar packs no system.json, estrutura LevelDB v13+, manter fontes JSON versionáveis e compilar com @foundryvtt/foundryvtt-cli (compilePack/extractPack), ownership e geradores idempotentes. Acione para empacotar perícias, prodígios, NPCs (Astros do Desenho), tabelas e aventuras do Toon.
---

# Foundry VTT v14 — Compendium Packs

Doc: `foundry_14_api_docs/Knowledge_Base/Compendium Packs/compendium.md`. API: `classes/foundry.documents.collections.CompendiumCollection.md`.

Compendia guardam conteúdo pré-fabricado que o system distribui (carregado sob demanda, não na entrada no mundo). Cada pack contém **um único tipo** de Document (exceto Adventure): `Actor`, `Item`, `JournalEntry`, `Macro`, `Playlist`, `RollTable`, `Scene`, `Cards`.

## Conteúdo a empacotar no Toon

- `Item` perícias (23) e prodígios (15) — arrastáveis para a ficha.
- `Item` armas/objetos pessoais e Trecos.
- `Actor` NPCs prontos (Rufi, Fred, Olga, Fifi, Juiz Talpa, Macacos, Astros do Desenho).
- `RollTable` tabelas 11–66 (ver skill `foundry-rolltables`).
- `JournalEntry`/`Scene` aventuras do livro (Olimpíadas Animadas, etc.).

## Declarar no system.json

```json
"packs": [
  { "name": "pericias",  "label": "Perícias",  "type": "Item",      "system": "toon-rpg", "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } },
  { "name": "prodigios", "label": "Prodígios", "type": "Item",      "system": "toon-rpg" },
  { "name": "npcs",      "label": "Astros do Desenho", "type": "Actor", "system": "toon-rpg" },
  { "name": "tabelas",   "label": "Tabelas Imbecis",   "type": "RollTable", "system": "toon-rpg" }
],
"packFolders": [
  { "name": "Toon", "sorting": "m", "packs": ["pericias", "prodigios", "npcs", "tabelas"] }
]
```
`name` é minúsculo sem caracteres especiais e vira o diretório do pack em `packs/<name>/`.

## Formato em v13+/v14: LevelDB

Packs não são mais arquivos `.db` únicos; são **diretórios LevelDB** binários — não versione o diretório compilado cru. Fluxo recomendado:

1. Mantenha as **fontes em JSON** versionáveis: `packs/_source/pericias/*.json` (um arquivo por Document).
2. **Compile** para o pack binário no build com a CLI oficial.
3. Os diretórios `packs/<name>/` compilados entram no `.zip` de release (e tipicamente no `.gitignore`).

### Compilar/extrair com a CLI

`@foundryvtt/foundryvtt-cli` (`npm i -g @foundryvtt/foundryvtt-cli` ou via script `npm`):

```js
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";

// JSON -> pack LevelDB (no build)
await compilePack("packs/_source/pericias", "packs/pericias");

// pack -> JSON (para editar conteúdo criado no app e versionar)
await extractPack("packs/pericias", "packs/_source/pericias");
```

Um JSON-fonte de perícia é a serialização do Item (campos `_id`, `name`, `type`, `system`, `img`). Mantenha `_id` estável (16 chars) para preservar referências.

## Gerador idempotente (alternativa em runtime)

Para conteúdo derivado de listas (perícias/prodígios), o ABEA usa um gerador chamado pelo GM (`game.toon.generateSkills()`). Padrão: crie/atualize os Documents do pack a partir de dados em `.mjs`, sem duplicar:

```js
const pack = game.packs.get("toon-rpg.pericias");
await pack.configure({ locked: false });
const existing = await pack.getDocuments();
for ( const data of SKILL_DATA ) {
  const found = existing.find(d => d.name === data.name);
  if ( found ) await found.update(data);
  else await Item.implementation.create(data, { pack: pack.collection });
}
```

## Acessar em código

```js
const pack = game.packs.get("toon-rpg.pericias");   // CompendiumCollection
const index = await pack.getIndex();                 // leve (id+name+img)
const doc = await pack.getDocument(id);              // documento completo
const all = await pack.getDocuments();               // todos (use com parcimônia)
```

Packs de system vêm **travados** por padrão para o usuário; destrave (`pack.configure({ locked: false })`) só durante geração/import.
