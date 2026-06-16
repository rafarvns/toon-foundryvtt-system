import { ToonActorSheet } from "./base-actor-sheet.mjs";

/** Ficha do personagem jogador. */
export class ToonCharacterSheet extends ToonActorSheet {
  static PARTS = {
    sheet: { template: "systems/toon-rpg/templates/actor/character-sheet.hbs" }
  };
}
