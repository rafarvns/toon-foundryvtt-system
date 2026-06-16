/**
 * Toon - O RPG no Mundo dos Desenhos Animados
 * Ponto de entrada do game system para Foundry VTT v14.
 */

import TOON from "./module/config.mjs";
import * as utils from "./module/utils.mjs";
import * as data from "./module/data/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as applications from "./module/applications/_module.mjs";
import { ToonRoller } from "./module/dice/roller.mjs";

Hooks.once("init", async () => {
  utils.log("Inicializando o sistema Toon");

  CONFIG.TOON = TOON;

  // Data models (devem casar com documentTypes do system.json)
  CONFIG.Actor.dataModels.character = data.CharacterData;
  CONFIG.Actor.dataModels.npc = data.NpcData;
  CONFIG.Item.dataModels.skill = data.SkillData;
  CONFIG.Item.dataModels.prodigy = data.ProdigyData;
  CONFIG.Item.dataModels.weapon = data.WeaponData;
  CONFIG.Item.dataModels.gear = data.GearData;

  // Document classes customizadas
  CONFIG.Actor.documentClass = documents.ToonActor;
  CONFIG.Item.documentClass = documents.ToonItem;

  // Recursos rastreáveis no token
  CONFIG.Actor.trackableAttributes = {
    character: { bar: ["hp"], value: ["plotPoints"] },
    npc: { bar: ["hp"], value: [] }
  };

  utils.registerHandlebarsHelpers();
  await utils.preloadHandlebarsTemplates();

  _registerSheets();
});

function _registerSheets() {
  const DSC = foundry.applications.apps.DocumentSheetConfig;

  DSC.registerSheet(Actor, "toon-rpg", applications.ToonCharacterSheet, {
    makeDefault: true,
    types: ["character"],
    label: "TOON.SheetClass.Character"
  });
  DSC.registerSheet(Actor, "toon-rpg", applications.ToonNpcSheet, {
    makeDefault: true,
    types: ["npc"],
    label: "TOON.SheetClass.Npc"
  });
  DSC.registerSheet(Item, "toon-rpg", applications.ToonItemSheet, {
    makeDefault: true,
    types: ["skill", "prodigy", "weapon", "gear"],
    label: "TOON.SheetClass.Item"
  });
}

Hooks.once("ready", () => {
  utils.log("Sistema Toon pronto");

  // API pública do sistema
  game.toon = {
    roller: ToonRoller,
    config: TOON
  };
});
