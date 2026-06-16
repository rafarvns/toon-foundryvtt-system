const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/** Ficha de Item do Toon (perícia, prodígio, arma, objeto). */
export class ToonItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["toon-rpg", "sheet", "item"],
    tag: "form",
    window: { resizable: true },
    position: { width: 480, height: 480 },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    sheet: { template: "systems/toon-rpg/templates/item/item-sheet.hbs" }
  };

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.document;
    context.system = this.document.system;
    context.config = CONFIG.TOON;
    return context;
  }
}
