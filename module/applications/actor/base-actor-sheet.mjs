const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Base das fichas de Actor do Toon (ApplicationV2, sem jQuery).
 * Personagem e NPC herdam daqui, mudando apenas o template.
 */
export class ToonActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["toon-rpg", "sheet", "actor"],
    tag: "form",
    window: { resizable: true },
    position: { width: 720, height: 760 },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      "roll-attribute": ToonActorSheet._onRollAttribute,
      "roll-skill": ToonActorSheet._onRollSkill,
      "add-item": ToonActorSheet._onAddItem,
      "edit-item": ToonActorSheet._onEditItem,
      "delete-item": ToonActorSheet._onDeleteItem,
      "roll-item": ToonActorSheet._onRollItem,
      "revive": ToonActorSheet._onRevive
    }
  };

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    context.actor = actor;
    context.system = actor.system;
    context.config = CONFIG.TOON;

    // Atributos como lista pronta para o template
    context.attributes = Object.entries(CONFIG.TOON.attributes).map(([key, cfg]) => ({
      key,
      label: game.i18n.localize(cfg.label),
      value: actor.system.attributes[key]
    }));

    // Perícias agrupadas por atributo
    const skills = actor.items.filter((i) => i.type === "skill");
    context.skillsByAttribute = Object.keys(CONFIG.TOON.attributes).map((key) => ({
      key,
      label: game.i18n.localize(CONFIG.TOON.attributes[key].label),
      skills: skills
        .filter((s) => s.system.attribute === key)
        .sort((a, b) => a.name.localeCompare(b.name))
    }));

    context.prodigies = actor.items.filter((i) => i.type === "prodigy");
    context.weapons = actor.items.filter((i) => i.type === "weapon");
    context.gear = actor.items.filter((i) => i.type === "gear");
    return context;
  }

  /** @inheritDoc */
  _onRender(context, options) {
    super._onRender(context, options);
    // Edição inline de campos de Item embutido (ex.: NH da perícia).
    this.element.querySelectorAll("[data-edit-item]").forEach((el) =>
      el.addEventListener("change", this.#onItemFieldChange.bind(this))
    );
  }

  #onItemFieldChange(event) {
    const input = event.currentTarget;
    const row = input.closest("[data-item-id]");
    const item = this.document.items.get(row?.dataset.itemId);
    if (!item) return;
    const field = input.dataset.editItem;
    const value = input.type === "number" ? Number(input.value) : input.value;
    item.update({ [field]: value });
  }

  /* -------------------------------------------- */
  /*  Handlers (estáticos; `this` = a sheet)      */
  /* -------------------------------------------- */

  static _onRollAttribute(event, target) {
    return this.document.rollAttribute(target.dataset.attr);
  }

  static _onRollSkill(event, target) {
    const id = target.closest("[data-item-id]").dataset.itemId;
    return this.document.rollSkill(id);
  }

  static _onRollItem(event, target) {
    const id = target.closest("[data-item-id]").dataset.itemId;
    return this.document.items.get(id)?.roll();
  }

  static async _onAddItem(event, target) {
    const type = target.dataset.type;
    const names = {
      skill: "TOON.Skills.New",
      prodigy: "TOON.Prodigies.New",
      weapon: "TOON.Weapons.New",
      gear: "TOON.Gear.New"
    };
    return this.document.createEmbeddedDocuments("Item", [
      { name: game.i18n.localize(names[type] ?? "TOON.Item.New"), type }
    ]);
  }

  static _onEditItem(event, target) {
    const id = target.closest("[data-item-id]").dataset.itemId;
    this.document.items.get(id)?.sheet.render(true);
  }

  static _onDeleteItem(event, target) {
    const id = target.closest("[data-item-id]").dataset.itemId;
    return this.document.items.get(id)?.delete();
  }

  static _onRevive() {
    return this.document.revive();
  }
}
