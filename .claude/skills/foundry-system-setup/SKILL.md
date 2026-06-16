---
name: foundry-system-setup
description: Use ao criar/configurar o esqueleto de um game system do Foundry VTT v14 — escrever ou editar system.json, o entrypoint .mjs, registrar document subtypes (CONFIG.Actor/Item.dataModels e documentClass), compendium packs, languages e atributos de token. Acione ao iniciar o system Toon ou ao adicionar um novo tipo de Actor/Item.
---

# Foundry VTT v14 — Setup de Game System

Doc-fonte: `foundry_14_api_docs/Knowledge_Base/Introduction to System Development/system-development.md`. Leia-o para detalhes de cada campo do manifest.

## Princípios

- Um conjunto de regras completo é um **game system** (`system.json`), não um *module*. A pasta deve ter o mesmo nome do `id`.
- O system vive em `{userData}/Data/systems/<id>/`. Para testar, linke/copie este repo para lá e recarregue o mundo.
- Use nomes de arquivos/pastas em minúsculo-com-hífen.
- Alvo deste projeto: **Foundry v14**, ES modules (`esmodules`), sem build step, sem jQuery. Espelhe a estrutura do módulo de referência ABEA (ver CLAUDE.md).

## system.json mínimo (Toon)

```json
{
  "id": "toon-rpg",
  "title": "Toon - O RPG no Mundo dos Desenhos Animados",
  "description": "...",
  "version": "0.1.0",
  "compatibility": { "minimum": "13", "verified": "14" },
  "authors": [{ "name": "rafarvns" }],
  "esmodules": ["toon-rpg.mjs"],
  "styles": ["styles/global.css"],
  "languages": [
    { "lang": "pt-BR", "name": "Português (Brasil)", "path": "lang/pt-BR.json" },
    { "lang": "en", "name": "English", "path": "lang/en.json" }
  ],
  "defaultLanguage": "pt-BR",
  "documentTypes": {
    "Actor": { "character": {}, "npc": {} },
    "Item": { "skill": {}, "prodigy": {}, "weapon": {}, "gear": {} }
  },
  "packs": [
    { "name": "pericias", "label": "Perícias", "type": "Item", "system": "toon-rpg" }
  ],
  "socket": false,
  "grid": { "distance": 5, "units": "m" },
  "primaryTokenAttribute": "hp",
  "url": "...", "manifest": "...", "download": "..."
}
```

Notas:
- `documentTypes` precisa listar **todo** subtype que você registra em código, senão o servidor descarta o Document como inválido. Pareie cada um com um DataModel (ver skill `foundry-data-model`).
- Se um campo do `system` guarda HTML do usuário, declare `htmlFields`; se guarda mídia, declare `filePathFields` (ver doc de data models).
- `primaryTokenAttribute` aponta para um objeto com `value` e `max` (ex.: `hp`). Toon usa Pontos de Vida — ver `prepareDerivedData`.

## Entrypoint (`toon-rpg.mjs`)

```js
import * as data from "./module/data/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as applications from "./module/applications/_module.mjs";
import TOON from "./module/config.mjs";
import * as utils from "./module/utils.mjs";

Hooks.once("init", async () => {
  CONFIG.TOON = TOON;

  // Data models (subtypes) — devem casar com documentTypes do manifest
  CONFIG.Actor.dataModels.character = data.CharacterData;
  CONFIG.Actor.dataModels.npc = data.NpcData;
  CONFIG.Item.dataModels.skill = data.SkillData;
  CONFIG.Item.dataModels.prodigy = data.ProdigyData;

  // Document classes customizadas
  CONFIG.Actor.documentClass = documents.ToonActor;
  CONFIG.Item.documentClass = documents.ToonItem;

  utils.registerHandlebarsHelpers();
  await utils.preloadHandlebarsTemplates();

  _registerSheets();
});

function _registerSheets() {
  const DSC = foundry.applications.apps.DocumentSheetConfig;
  DSC.registerSheet(Actor, "toon-rpg", applications.ToonActorSheet, {
    makeDefault: true, types: ["character", "npc"], label: "TOON.SheetClass.Character"
  });
  DSC.registerSheet(Item, "toon-rpg", applications.ToonItemSheet, {
    makeDefault: true, types: ["skill", "prodigy", "weapon", "gear"], label: "TOON.SheetClass.Item"
  });
}
```

`init` é onde tudo é registrado. Use `ready` para lógica que depende do mundo carregado (ex.: migrações, `game.toon = {...}`).

## Checklist ao adicionar um novo subtype

1. Adicione a chave em `documentTypes` no `system.json`.
2. Crie o DataModel (skill `foundry-data-model`) e registre em `CONFIG.<Doc>.dataModels.<type>`.
3. Registre/ajuste a sheet para incluir o `type` em `types: [...]`.
4. Adicione strings de label em `lang/pt-BR.json` e `lang/en.json`.
