---
name: foundry-dice-rolls
description: Use ao implementar rolagens de dados e cartões de chat num system Foundry v14 — classe foundry.dice.Roll, evaluate(), avaliar sucesso/falha de regras customizadas, toMessage, ChatMessage com speaker e flavor, roll modes. Acione para o mecanismo roll-under 2d6 do Toon (teste de perícia, dano 1d6, regra dos 50%, Dezenas e Unidades).
---

# Foundry VTT v14 — Dados e Chat

API: `foundry_14_api_docs/classes/foundry.dice.Roll.md`, `foundry.documents.ChatMessage.md`. Docs: `Knowledge_Base/Basic Dice/dice.md`, `Advanced Dice/dice-advanced.md`, `Chat Messages/chat.md`. Centralize tudo num `module/dice/roller.mjs` (padrão ABEA).

## A mecânica do Toon é roll-under (não copie a soma do ABEA)

Um teste tem **sucesso quando `2d6 <= NH`** da perícia. Maior NH = melhor. **Resultado 2 é sempre sucesso** (mesmo NH 1). O `Roll` do Foundry só gera o número; a avaliação de sucesso é lógica sua.

## Roll API básico

```js
const roll = new Roll("2d6");
await roll.evaluate();          // v12+: assíncrono, sem {async:true}
roll.total;                     // soma (2..12)
roll.dice[0].results;           // [{result:3,...},{result:5,...}]
await roll.toMessage({ speaker, flavor });  // posta no chat com tooltip expansível
```

Fórmulas podem usar dados do actor: `new Roll("1d6 + @bonus", actor.getRollData())`.

## Teste de perícia (roll-under) com cartão de chat

```js
export async function rollSkillTest({ nh, label, actor, modifier = 0 }) {
  const roll = new Roll("2d6");
  await roll.evaluate();
  const target = nh - modifier;                  // modificadores SOMAM dificuldade no Toon
  const success = roll.total === 2 || roll.total <= target;
  const crit = roll.total === 2;                 // 2 é sucesso automático

  const flavor =
    `<h3>${label}</h3>` +
    `<p>NH ${nh}${modifier ? ` (mod ${modifier})` : ""} — ` +
    `<strong>${success ? "SUCESSO" : "FALHA"}</strong>${crit ? " (automático!)" : ""}</p>`;

  return roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor
  });
}
```

Coloque isso no roller e exponha via método no Document/DataModel (ex.: `actor.rollSkill(itemId)` que resolve o NH da perícia e chama o roller).

## Dano

Normalmente `1d6`. Torta de creme = 0 de dano mas causa Estupefação (trate como status/efeito, não dano).

```js
export async function rollDamage({ formula = "1d6", label, actor }) {
  const roll = new Roll(formula);
  await roll.evaluate();
  await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `<h3>${label}</h3>` });
  return roll.total;             // subtraia de hp.value no Document
}
```

## Regra dos 50% e Dezenas-e-Unidades

```js
// Sim/Não: 1d6, 1-3 = sim
const r = new Roll("1d6"); await r.evaluate();
const sim = r.total <= 3;

// Dezenas e Unidades: dois d6 lidos lado a lado -> 11..66 (para tabelas; ver skill foundry-rolltables)
const d = new Roll("2d6"); await d.evaluate();
const [a, b] = d.dice[0].results.map(x => x.result);
const tens = a * 10 + b;       // ex.: 4 e 3 -> 43
```

## Cartões de chat customizados

Para cartões ricos (botões, layout), renderize um template e poste como conteúdo:

```js
const content = await foundry.applications.handlebars.renderTemplate(
  "systems/toon-rpg/templates/chat/skill-card.hbs", { /* dados */ });
await ChatMessage.implementation.create({
  speaker: ChatMessage.getSpeaker({ actor }),
  content,
  rolls: [roll],               // anexa o Roll para o Dice So Nice etc.
});
```

Para anexar listeners aos botões do cartão, use o hook `renderChatMessageHTML` (v13+; `html` é HTMLElement, **sem jQuery** — `html.querySelector(...).addEventListener(...)`).

## Roll modes

`toMessage` respeita o roll mode atual. Para forçar: `roll.toMessage(data, { rollMode: CONST.DICE_ROLL_MODES.PRIVATE })` (PUBLIC, PRIVATE/gmroll, BLIND, SELF). Útil para o Diretor de Animação rolar escondido.
