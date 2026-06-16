---
name: foundry-combat-tracker
description: Use ao trabalhar com encontros/turnos no Foundry v14 — documentos Combat e Combatant, fórmula de iniciativa no system.json, CONFIG.Combat.initiative, hooks de combate, ou customizar a ordem de turnos. Acione ao decidir como o Toon (que usa o "Sistema de Ações", não iniciativa tradicional) lida com lutas, corridas e perseguições no Combat Tracker.
---

# Foundry VTT v14 — Combat Encounters

Doc: `foundry_14_api_docs/Knowledge_Base/Combat Encounters/combat.md`. API: `classes/foundry.documents.Combat.md`, `foundry.documents.Combatant.md`, `foundry.applications.sidebar.tabs.CombatTracker.md`.

Um `Combat` é uma cena de turnos (luta, corrida, perseguição) ligada a uma Scene; `Combatant`s são os tokens participantes. O Combat Tracker gerencia rounds/turnos.

## O Toon não usa iniciativa tradicional

O livro define o **Sistema de Ações**: o Diretor pergunta a cada jogador, em círculo, o que faz, até alguém precisar de um Teste de Habilidade; aí passa a vez. NPCs agem quando o Diretor quiser. Não há rolagem de iniciativa numérica.

Implicações de design:
- **Opção A (recomendada, fiel ao livro):** ordem fixa/manual. Defina iniciativa como `"0"` (ou desligue a rolagem) e use o tracker só como lista de turnos que o Diretor avança. Reordene arrastando ou via `combatant.update({ initiative })`.
- **Opção B (conveniência):** dar uma ordem com base em **Zip** (velocidade/prontidão), já que é o atributo de agilidade. Ex.: `initiative: "@attributes.zip.value"`.

Deixe isso configurável (ver skill `foundry-game-settings`).

## Fórmula de iniciativa

No `system.json`:
```json
"initiative": "1d6"
```
Ou em código no `init` (tem prioridade e permite usar roll data):
```js
CONFIG.Combat.initiative = { formula: "1d6 + @attributes.zip.value", decimals: 0 };
```
Para a Opção A (sem iniciativa), use `"0"` e oriente o Diretor a ordenar manualmente.

## API essencial

```js
// Adicionar tokens ao combate
await token.toggleCombatant();                 // liga/desliga estado de combate
// Avançar
await game.combat.nextTurn();
await game.combat.nextRound();
await game.combat.startCombat();
await game.combat.endCombat();
// Rolar iniciativa de combatentes
await game.combat.rollInitiative([combatant.id]);
await game.combat.rollAll();   // todos
await game.combat.rollNPC();   // só NPCs
// Estado atual
game.combat.combatant;         // combatente do turno atual
game.combat.turn; game.combat.round;
```

## Hooks úteis

```js
Hooks.on("combatStart", (combat, updateData) => {/* abrir cena/efeitos */});
Hooks.on("combatTurnChange", (combat, prior, current) => {/* início de turno */});
Hooks.on("combatRound", (combat, updateData, opts) => {/* novo round: expirar Estupefação etc. */});
Hooks.on("deleteCombat", (combat) => {/* fim do encontro */});
```

Use `combatRound`/`combatTurnChange` para expirar Active Effects de duração em turnos (ver skill `foundry-active-effects`), como a Estupefação.

## Corridas e perseguições

São "encontros" no sentido do Toon: vários personagens fazendo testes de Corrida simultâneos (6 sucessos vencem). Em geral isso é melhor resolvido com cartões de rolagem (skill `foundry-dice-rolls`) do que com o tracker de turnos; use o Combat Tracker apenas se quiser ordenar quem declara primeiro. Considere um app/diálogo dedicado para acompanhar contagem de sucessos.
