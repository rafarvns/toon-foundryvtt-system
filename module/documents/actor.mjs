import { ToonRoller } from "../dice/roller.mjs";

/**
 * Classe Actor customizada do Toon.
 */
export class ToonActor extends Actor {
  /**
   * Ao criar um personagem, semeia as 23 perícias canônicas com NH igual ao
   * valor do atributo que as governa.
   * @inheritDoc
   */
  async _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (game.user.id !== userId) return;
    if (this.type === "character" && this.items.filter((i) => i.type === "skill").length === 0) {
      await this.createDefaultSkills();
    }
  }

  /** Cria as perícias padrão do Toon a partir de CONFIG.TOON.skills. */
  async createDefaultSkills() {
    const items = CONFIG.TOON.skills.map((s) => ({
      name: s.name,
      type: "skill",
      system: { attribute: s.attribute, nh: this.system.attributes[s.attribute] ?? 1, core: true }
    }));
    return this.createEmbeddedDocuments("Item", items);
  }

  /**
   * Rola o teste de uma perícia embutida (roll-under 2d6 <= NH).
   * @param {string} itemId
   * @param {object} [options] { modifier }
   */
  async rollSkill(itemId, { modifier = 0 } = {}) {
    const item = this.items.get(itemId);
    if (!item || item.type !== "skill") return null;
    const opposed = CONFIG.TOON.opposed[item.name] ?? null;
    const target = game.user?.targets?.first?.() ?? null;
    return ToonRoller.rollSkillTest({
      nh: item.system.nh,
      label: item.name,
      actor: this,
      modifier,
      opposed,
      defenderId: target?.actor?.id ?? null,
      canDamage: !!opposed?.damage
    });
  }

  /**
   * Rola um teste direto de atributo (2d6 <= valor do atributo).
   * @param {"muque"|"zip"|"astucia"|"caradura"} key
   */
  async rollAttribute(key, { modifier = 0 } = {}) {
    const value = this.system.attributes?.[key];
    if (value === undefined) return null;
    const label = game.i18n.localize(CONFIG.TOON.attributes[key].label);
    return ToonRoller.rollSkillTest({ nh: value, label, actor: this, modifier });
  }

  /**
   * Aplica dano: subtrai de PV e marca "Caiu" se chegar a zero.
   * @param {number} amount
   */
  async applyDamage(amount) {
    amount = Math.max(0, Math.round(amount));
    const value = Math.max(0, this.system.hp.value - amount);
    await this.update({ "system.hp.value": value });
    await ChatMessage.implementation.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: game.i18n.format("TOON.Damage.Dealt", { name: this.name, amount })
    });
    const fell = value <= 0;
    await this.toggleStatusEffect?.("fallen", { active: fell });
    if (fell) {
      await ChatMessage.implementation.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: game.i18n.format("TOON.Fell", { name: this.name })
      });
    }
    return value;
  }

  /** Levanta o personagem: restaura PV ao máximo e remove o status "Caiu". */
  async revive() {
    await this.toggleStatusEffect?.("fallen", { active: false });
    return this.update({ "system.hp.value": this.system.hp.max });
  }

  /** Concede Pontos de Trama e anuncia no chat. */
  async awardPlotPoints(amount = 1) {
    if (this.system.plotPoints === undefined) return;
    await this.update({ "system.plotPoints": (this.system.plotPoints ?? 0) + amount });
    await ChatMessage.implementation.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: game.i18n.format("TOON.Plot.Awarded", { name: this.name, amount })
    });
  }

  /**
   * Gasta Pontos de Trama para subir 1 NH de uma perícia (2 pts) ou
   * prodígio (4 pts). Respeita o NH máximo e o saldo disponível.
   */
  async spendPlotPointsToRaise(itemId) {
    const item = this.items.get(itemId);
    if (!item || !["skill", "prodigy"].includes(item.type)) return;
    const cost = item.type === "skill" ? CONFIG.TOON.advancement.skill : CONFIG.TOON.advancement.prodigy;
    const maxNh = CONFIG.TOON.limits.skillNh.max;

    if (item.system.nh >= maxNh) {
      return ui.notifications?.warn(game.i18n.format("TOON.Plot.MaxNh", { name: item.name, max: maxNh }));
    }
    if ((this.system.plotPoints ?? 0) < cost) {
      return ui.notifications?.warn(game.i18n.format("TOON.Plot.NotEnough", { cost }));
    }

    const newNh = item.system.nh + 1;
    await this.update({ "system.plotPoints": this.system.plotPoints - cost });
    await item.update({ "system.nh": newNh });
    await ChatMessage.implementation.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: game.i18n.format("TOON.Plot.Raised", { name: item.name, nh: newNh, cost })
    });
  }
}
