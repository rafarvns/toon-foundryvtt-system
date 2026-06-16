---
name: foundry-sheet-appv2
description: Use ao criar ou editar fichas/janelas (sheets, dialogs, apps) num system Foundry v14 com a API ApplicationV2 — ActorSheetV2/ItemSheetV2 com HandlebarsApplicationMixin, DEFAULT_OPTIONS, PARTS, TABS, actions, _prepareContext, _onRender, templates .hbs e DialogV2. Acione ao construir a ficha do personagem Toon, sheets de Item ou diálogos de rolagem.
---

# Foundry VTT v14 — Sheets com ApplicationV2

API: `foundry_14_api_docs/classes/foundry.applications.api.ApplicationV2.md`, `foundry.applications.sheets.ActorSheetV2.md`, `foundry.applications.sheets.ItemSheetV2.md`, `foundry.applications.api.DialogV2.md`, `foundry.HandlebarsApplication.md`. Espelhe `module/applications/actor/character-sheet.mjs` do ABEA (referência funcional em v13/v14).

> **Regra de ouro v13+/v14: SEM jQuery.** Toda manipulação de DOM usa `HTMLElement` puro (`querySelector`, `addEventListener`). O `this.element` da sheet e o `html` dos hooks são `HTMLElement`.

## Estrutura de uma sheet

```js
const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class ToonActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["toon-rpg", "sheet", "actor"],
    tag: "form",
    window: { title: "TOON.Actor.SheetTitle", resizable: true },
    position: { width: 720, height: 800 },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {                       // mapeia data-action -> handler ESTÁTICO
      "roll-skill": ToonActorSheet._onSkillRoll,
      "add-skill": ToonActorSheet._onSkillAdd,
      "delete-skill": ToonActorSheet._onSkillDelete,
      "toggle-fallen": ToonActorSheet._onToggleFallen
    }
  };

  static PARTS = {                   // templates compostos
    header: { template: "systems/toon-rpg/templates/actor/header.hbs" },
    tabs:   { template: "templates/generic/tab-navigation.hbs" },
    skills: { template: "systems/toon-rpg/templates/actor/skills.hbs" },
    bio:    { template: "systems/toon-rpg/templates/actor/bio.hbs" }
  };

  static TABS = {
    primary: {
      tabs: [
        { id: "skills", group: "primary", label: "TOON.Tabs.Skills", icon: "fas fa-list" },
        { id: "bio", group: "primary", label: "TOON.Tabs.Bio", icon: "fas fa-user" }
      ],
      initial: "skills"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.document;
    context.system = this.document.system;
    context.config = CONFIG.TOON;
    context.skills = this.document.items.filter(i => i.type === "skill");
    context.prodigies = this.document.items.filter(i => i.type === "prodigy");
    context.tabs = this._getTabs?.() ?? {};   // ver helper de tabs no ABEA
    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    // Listeners que NÃO são cliques simples (ex.: change). Cliques use data-action.
    this.element.querySelectorAll("input.nh-input").forEach(el =>
      el.addEventListener("change", this.#onNhChange.bind(this)));
  }

  /* handlers de action: assinatura (event, target) com `this` = a sheet */
  static async _onSkillRoll(event, target) {
    const id = target.closest("[data-item-id]").dataset.itemId;
    return this.document.rollSkill(id);     // lógica de rolagem no Document/DataModel
  }
  static async _onSkillAdd(event, target) {
    return this.document.createEmbeddedDocuments("Item", [{
      name: game.i18n.localize("TOON.Skills.New"), type: "skill",
      system: { nh: 1, attribute: "muque" }
    }]);
  }
  static async _onSkillDelete(event, target) {
    const id = target.closest("[data-item-id]").dataset.itemId;
    return this.document.items.get(id)?.delete();
  }
  static async _onToggleFallen(event, target) {
    return this.document.update({ "system.fallen": !this.document.system.fallen });
  }
}
```

Item sheets seguem o mesmo padrão com `ItemSheetV2`.

## Templates (.hbs)

- Inputs com `name="system.caminho.do.campo"` salvam direto (graças a `submitOnChange`).
- Botões/cliques usam `data-action="nome"` (casando com `actions`) + `data-item-id` para identificar o item.
- Localize com `{{localize 'TOON.Chave'}}`.
- Pré-carregue todos os templates no `init` via `foundry.applications.handlebars.loadTemplates([...])` (ver `utils.preloadHandlebarsTemplates` do ABEA).

```hbs
<li class="skill-row" data-item-id="{{this.id}}">
  <span>{{this.name}}</span>
  <input class="nh-input" type="number" min="1" max="9"
         name="..." value="{{this.system.nh}}">
  <a data-action="roll-skill" title="{{localize 'TOON.Roll'}}"><i class="fas fa-dice"></i></a>
  <a data-action="delete-skill"><i class="fas fa-trash"></i></a>
</li>
```

## Diálogos (DialogV2)

Para prompts (ex.: escolher dificuldade/modificador antes de rolar) use `foundry.applications.api.DialogV2`:

```js
const proceed = await foundry.applications.api.DialogV2.confirm({
  window: { title: "TOON.Confirm" },
  content: "<p>Iniciar a luta?</p>"
});
// ou DialogV2.prompt / new DialogV2({ buttons: [...] }).render(true)
```

## Registro

Registre a sheet no `init` com `foundry.applications.apps.DocumentSheetConfig.registerSheet(...)` (ver skill `foundry-system-setup`).

## Armadilhas comuns

- Handlers de `actions` são **estáticos**, mas dentro deles `this` é a instância da sheet.
- Não use `.find()/.on()` (jQuery). Só `querySelector/addEventListener`.
- Mantenha lógica de regra/rolagem no Document ou DataModel; a sheet só dispara.
