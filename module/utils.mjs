/**
 * Utilitários do sistema Toon: helpers de Handlebars e pré-carga de templates.
 */

const TEMPLATES = [
  "systems/toon-rpg/templates/actor/character-sheet.hbs",
  "systems/toon-rpg/templates/actor/npc-sheet.hbs",
  "systems/toon-rpg/templates/item/item-sheet.hbs",
  "systems/toon-rpg/templates/chat/skill-card.hbs",
  "systems/toon-rpg/templates/chat/damage-card.hbs",
  "systems/toon-rpg/templates/chat/opposed-card.hbs"
];

/** Pré-carrega todos os templates Handlebars do sistema. */
export async function preloadHandlebarsTemplates() {
  return foundry.applications.handlebars.loadTemplates(TEMPLATES);
}

/** Registra helpers Handlebars customizados. */
export function registerHandlebarsHelpers() {
  Handlebars.registerHelper("toonEq", (a, b) => a === b);

  // Localiza a label de um atributo a partir de CONFIG.TOON.
  Handlebars.registerHelper("toonAttrLabel", (key) => {
    const attr = CONFIG.TOON?.attributes?.[key];
    return attr ? game.i18n.localize(attr.label) : key;
  });

  // Gera um array [start..end] para iterar em níveis (1..9, etc.).
  Handlebars.registerHelper("toonRange", (start, end) => {
    const out = [];
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  });
}

/** Log formatado do sistema. */
export function log(message, level = "log") {
  console[level](`Toon | ${message}`);
}
