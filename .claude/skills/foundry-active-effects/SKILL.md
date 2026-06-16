---
name: foundry-active-effects
description: Use ao implementar condições/status e modificadores temporários num system Foundry v14 — ActiveEffect, registrar status effects em CONFIG.statusEffects/specialStatusEffects, change modes (ADD/MULTIPLY/OVERRIDE/UPGRADE/DOWNGRADE/CUSTOM), attribute keys por data path, efeitos em Item que transferem para o Actor. Acione para Estupefação, "Caiu", inimigo natural, ou prodígios que alteram atributos (Força Incrível, Encolher) no Toon.
---

# Foundry VTT v14 — Active Effects

Doc: `foundry_14_api_docs/Knowledge_Base/Active Effects/active-effects.md`. API: `classes/foundry.documents.ActiveEffect.md`, `foundry.applications.sheets.ActiveEffectConfig.md`.

Active Effects aplicam mudanças **não destrutivas**: o dado original (`source`) fica intacto; a mudança é aplicada na cópia preparada apresentada ao usuário. Remover o efeito restaura o valor. São aplicados durante a preparação do Actor (entre `prepareBaseData` e `prepareDerivedData`).

## Quando usar no Toon

- **Estupefação** (torta de creme): status temporário que impede ações por um tempo.
- **Caiu** (`fallen`): pode ser um status visual no token quando `hp.value <= 0`.
- **Prodígios/itens** que mexem em atributos: Força Incrível (+Muque), encolhido após uma queda, etc.
- **Inimigo Natural**: marcador.

> Atenção: o `fallen` já é derivado no DataModel (skill `foundry-data-model`). Use Active Effect só se quiser um ícone de status no token + toggle manual. Não duplique a regra.

## Anatomia de uma mudança (change)

Cada `ActiveEffect` tem `changes: [{ key, mode, value, priority }]`:
- `key` — **attribute key** = data path do que muda, ex.: `system.attributes.muque.value` (o campo precisa existir no schema com o tipo certo).
- `mode` — `CONST.ACTIVE_EFFECT_MODES`: `ADD` (soma/subtrai), `MULTIPLY`, `OVERRIDE`, `UPGRADE` (só sobe), `DOWNGRADE` (só desce), `CUSTOM` (lógica do system via hook `applyActiveEffect`).
- `value` — string/número aplicado conforme o mode.

```js
await actor.createEmbeddedDocuments("ActiveEffect", [{
  name: "Força Incrível",
  img: "icons/svg/upgrade.svg",
  changes: [{
    key: "system.attributes.muque.value",
    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
    value: "2"
  }],
  disabled: false
}]);
```

Efeito em um Item com `transfer: true` (padrão) passa automaticamente para o Actor quando o item é embutido — ideal para prodígios/equipamento.

## Status effects (condições) do system

Registre as condições do Toon no `init` para aparecerem no Token HUD:

```js
Hooks.once("init", () => {
  CONFIG.statusEffects.push({
    id: "estupefacao",
    name: "TOON.Status.Estupefacao",
    img: "icons/svg/daze.svg"
  });
  // status sem changes só marca o token; com changes, também modifica dados
});
```

Para um status "especial" tratado pelo core (ex.: invulnerável/morto), use `CONFIG.specialStatusEffects`. Aplicar/alternar via token:

```js
const token = actor.getActiveTokens()[0];
await token.actor.toggleStatusEffect("estupefacao");      // liga/desliga
actor.statuses.has("estupefacao");                         // checagem
```

## Duração

`ActiveEffect#duration` aceita `rounds`/`turns` (ligados ao Combat) ou `seconds`. A Estupefação do Toon pode durar X turnos:

```js
duration: { rounds: 1 }   // expira no início do próximo round (requer Combat ativo)
```

## Change mode CUSTOM

Para regras que os modes padrão não cobrem, use `mode: CUSTOM` e implemente o hook:

```js
Hooks.on("applyActiveEffect", (actor, change, current, delta, changes) => {
  // sua lógica; retorne o valor calculado
});
```

## Descobrir attribute keys

No console do Foundry, para listar os caminhos válidos de um subtype:
```js
const a = new Actor.implementation({ name: "character", type: "character" });
console.log(a.toObject().system);   // prefixe com "system." ao usar como key
```
