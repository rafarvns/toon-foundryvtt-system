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
    position: { width: 1000, height: 726 },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      "roll-attribute": ToonActorSheet._onRollAttribute,
      "roll-skill": ToonActorSheet._onRollSkill,
      "add-item": ToonActorSheet._onAddItem,
      "edit-item": ToonActorSheet._onEditItem,
      "delete-item": ToonActorSheet._onDeleteItem,
      "roll-item": ToonActorSheet._onRollItem,
      "level-up": ToonActorSheet._onLevelUp,
      "revive": ToonActorSheet._onRevive,
      "switch-tab": ToonActorSheet._onTabClick,
      "edit-image": ToonActorSheet._onEditImage
    }
  };

  /** Aba ativa da coluna principal (persiste entre re-renders). */
  _tab = "skills";

  /** Título da janela = apenas o nome do ator (sem o rótulo do tipo). */
  get title() {
    return this.document.name;
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    context.actor = actor;
    context.system = actor.system;
    context.config = CONFIG.TOON;
    context.tab = this._tab;

    // Atributos como lista pronta para o template
    context.attributes = Object.entries(CONFIG.TOON.attributes).map(([key, cfg]) => ({
      key,
      label: game.i18n.localize(cfg.label),
      value: actor.system.attributes[key]
    }));

    // Perícias agrupadas por atributo. Ordem pensada para grade 2×2:
    // linha 1 = Muque | Caradura, linha 2 = Zip | Astúcia.
    const skills = actor.items.filter((i) => i.type === "skill");
    const groupOrder = ["muque", "caradura", "zip", "astucia"];
    context.skillsByAttribute = groupOrder
      .filter((key) => key in CONFIG.TOON.attributes)
      .map((key) => ({
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
    this.#applyTab();
    this.#wireClickRoll();
  }

  /** Aplica a aba ativa alternando classes no DOM (sem re-render). */
  #applyTab() {
    const tab = this._tab;
    this.element.querySelectorAll(".tab-link").forEach((el) =>
      el.classList.toggle("active", el.dataset.tab === tab)
    );
    this.element.querySelectorAll(".tab-content > .tab").forEach((el) =>
      el.classList.toggle("active", el.dataset.tab === tab)
    );
  }

  /**
   * Campos `.click-roll`: 1 clique = rola; clique-duplo = ativa edição.
   * Usa um pequeno atraso para distinguir clique simples de duplo.
   */
  #wireClickRoll() {
    for (const box of this.element.querySelectorAll(".click-roll")) {
      let timer = null;
      box.addEventListener("click", (event) => {
        if (box.classList.contains("editing")) return;
        if (event.target.closest("input, a[data-action]")) return;
        clearTimeout(timer);
        timer = setTimeout(() => this.#doClickRoll(box), 220);
      });
      box.addEventListener("dblclick", (event) => {
        if (event.target.closest("a[data-action]")) return;
        clearTimeout(timer);
        this.#enterEdit(box);
      });
    }
  }

  #doClickRoll(box) {
    switch (box.dataset.rollType) {
      case "attribute":
        return this.document.rollAttribute(box.dataset.attr);
      case "skill": {
        const id = box.closest("[data-item-id]")?.dataset.itemId;
        return id ? this.document.rollSkill(id) : null;
      }
      case "item": {
        const id = box.closest("[data-item-id]")?.dataset.itemId;
        return id ? this.document.items.get(id)?.roll() : null;
      }
    }
  }

  #enterEdit(box) {
    box.classList.add("editing");
    const input = box.querySelector("input");
    if (!input) return;
    input.focus();
    input.select?.();
    const finish = () => {
      box.classList.remove("editing");
      input.removeEventListener("blur", finish);
    };
    input.addEventListener("blur", finish);
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

  static _onTabClick(event, target) {
    this._tab = target.dataset.tab;
    this.#applyTab();
  }

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
    // Perícia: abre formulário; só insere ao salvar.
    if (type === "skill") return this.#createSkillViaDialog();

    const names = {
      prodigy: "TOON.Prodigies.New",
      weapon: "TOON.Weapons.New",
      gear: "TOON.Gear.New"
    };
    return this.document.createEmbeddedDocuments("Item", [
      { name: game.i18n.localize(names[type] ?? "TOON.Item.New"), type }
    ]);
  }

  /** Abre um diálogo de criação de perícia; cria o item apenas ao salvar. */
  async #createSkillViaDialog() {
    const options = Object.entries(CONFIG.TOON.attributes)
      .map(([key, cfg]) => `<option value="${key}">${game.i18n.localize(cfg.label)}</option>`)
      .join("");
    const content = `
      <div class="toon-rpg toon-dialog">
        <div class="field">
          <label>${game.i18n.localize("TOON.Field.Name")}</label>
          <input type="text" name="name" autofocus placeholder="${game.i18n.localize("TOON.Skills.New")}">
        </div>
        <div class="field">
          <label>${game.i18n.localize("TOON.Attribute")}</label>
          <select name="attribute">${options}</select>
        </div>
      </div>`;

    const data = await foundry.applications.api.DialogV2.prompt({
      window: { title: game.i18n.localize("TOON.Skills.New") },
      content,
      rejectClose: false,
      ok: {
        label: game.i18n.localize("TOON.Save"),
        icon: "fas fa-floppy-disk",
        callback: (event, button, dialog) => {
          const form = button.form ?? dialog.element.querySelector("form");
          return {
            name: form.elements.name.value.trim(),
            attribute: form.elements.attribute.value
          };
        }
      }
    });

    if (!data) return; // cancelado
    const attribute = data.attribute || "muque";
    const name = data.name || game.i18n.localize("TOON.Skills.New");
    const nh = this.document.system.attributes[attribute] ?? 1;
    return this.document.createEmbeddedDocuments("Item", [
      { name, type: "skill", system: { attribute, nh, core: false } }
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

  static _onLevelUp(event, target) {
    const id = target.closest("[data-item-id]").dataset.itemId;
    return this.document.spendPlotPointsToRaise(id);
  }

  static _onRevive() {
    return this.document.revive();
  }

  /** Abre o seletor de arquivos para trocar a imagem do ator. */
  static _onEditImage(event, target) {
    const fp = new foundry.applications.apps.FilePicker.implementation({
      type: "image",
      current: this.document.img,
      callback: (path) => this.document.update({ img: path })
    });
    return fp.render(true);
  }
}
