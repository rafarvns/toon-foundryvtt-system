import { ToonActorSheet } from "./base-actor-sheet.mjs";

/** Ficha de NPC. */
export class ToonNpcSheet extends ToonActorSheet {
  static PARTS = {
    sheet: { template: "systems/toon-rpg/templates/actor/npc-sheet.hbs" }
  };
}
