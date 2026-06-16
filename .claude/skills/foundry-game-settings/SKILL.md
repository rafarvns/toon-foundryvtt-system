---
name: foundry-game-settings
description: Use ao registrar e ler configurações do system no Foundry v14 — game.settings.register/get/set, escopos (world/client/user), config visível vs oculto, onChange, requiresReload, settings menus (registerMenu) e armazenamento de versão para migração. Acione para regras opcionais do Toon (Regras dos Super-Astros), tempo de queda, ou flags de migração de mundo.
---

# Foundry VTT v14 — Game Settings

Doc: `foundry_14_api_docs/Knowledge_Base/Game Settings/settings.md`. API: `classes/foundry.helpers.ClientSettings.md`. (Distinto de "Application Configuration", que é config do servidor.)

Settings deixam o system guardar opções configuráveis. Registre sempre no hook `init` (antes de qualquer `get`).

## Escopos

- `world` — vale para o mundo inteiro, igual para todos; só GM/Assistente com permissão altera.
- `client` — por dispositivo/navegador, vale em qualquer mundo.
- `user` — por usuário num mundo (novo na v13).

## Registrar e usar

```js
Hooks.once("init", () => {
  game.settings.register("toon-rpg", "superAstros", {
    name: "TOON.Settings.SuperAstros.Name",        // chave de i18n
    hint: "TOON.Settings.SuperAstros.Hint",
    scope: "world",
    config: true,                                   // aparece no menu de configurações
    type: Boolean,
    default: false,
    requiresReload: false,
    onChange: value => console.log("Regras avançadas:", value)
  });

  game.settings.register("toon-rpg", "tempoQuedaSegundos", {
    name: "TOON.Settings.FallTime.Name",
    scope: "world", config: true,
    type: Number, default: 180                       // 3 minutos
  });
});

// Ler / escrever (após init)
const avancado = game.settings.get("toon-rpg", "superAstros");
await game.settings.set("toon-rpg", "superAstros", true);
```

`type` pode ser `Boolean`, `Number`, `String`, ou um `DataField`/classe. Para lista fixa use `type: String` + `choices: { a: "TOON...", b: "TOON..." }` (renderiza dropdown).

## Settings ocultos (estado interno)

Para guardar estado que não deve aparecer no menu (ex.: versão de schema para migração), use `config: false`:

```js
game.settings.register("toon-rpg", "systemMigrationVersion", {
  scope: "world", config: false, type: String, default: ""
});
```
Padrão de migração (à la ABEA): no `ready`, compare `game.settings.get(...,"systemMigrationVersion")` com `game.system.version` e rode migrações se preciso, então grave a versão.

## Settings menu (sub-menu customizado)

Para agrupar opções numa janela própria, registre um ApplicationV2 (ver skill `foundry-sheet-appv2`) como menu:

```js
game.settings.registerMenu("toon-rpg", "houseRules", {
  name: "TOON.Settings.HouseRules.Name",
  label: "TOON.Settings.HouseRules.Label",
  icon: "fas fa-cogs",
  type: HouseRulesApp,        // subclasse de ApplicationV2/FormApplicationV2
  restricted: true            // só GM
});
```

## Regras opcionais do Toon candidatas a setting

- `superAstros` (bool) — habilita as "Regras dos Super-Astros" (combinações, peso em Erguer, etc.).
- `tempoQuedaSegundos` (number) — tempo que um personagem fica "Caído".
- `regra50PorCento` (bool) — usar a Regra dos 50% para sim/não.
- `systemMigrationVersion` (oculto) — controle de migração.

Lembre de adicionar as chaves `name`/`hint` em `lang/pt-BR.json` e `lang/en.json` (ver skill `foundry-localization`).
