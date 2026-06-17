import { ToonRoller } from "../dice/roller.mjs";

/**
 * Classe Item customizada do Toon.
 */
export class ToonItem extends Item {
  /**
   * Perícia "padrão" (uma das 23 semeadas) — protegida contra exclusão.
   * Considera o flag `system.core` e, como salvaguarda para personagens
   * criados antes do flag, a correspondência por nome com CONFIG.TOON.skills.
   * @type {boolean}
   */
  get isCore() {
    if (this.type !== "skill") return false;
    if (this.system?.core) return true;
    const names = (CONFIG.TOON?.skills ?? []).map((s) => s.name);
    return names.includes(this.name);
  }

  /** @inheritDoc */
  async _preDelete(options, user) {
    if (this.isCore) {
      ui.notifications?.warn(game.i18n.localize("TOON.Skills.CannotDeleteCore"));
      return false; // cancela a exclusão
    }
    return super._preDelete(options, user);
  }

  /**
   * Aciona o uso do item: rola perícia/prodígio (roll-under) ou dano (arma).
   */
  async roll({ modifier = 0 } = {}) {
    const actor = this.actor;
    switch (this.type) {
      case "skill":
      case "prodigy":
        return ToonRoller.rollSkillTest({ nh: this.system.nh, label: this.name, actor, modifier });
      case "weapon":
        return ToonRoller.rollDamage({ formula: this.system.damage, label: this.name, actor });
      default:
        return null;
    }
  }
}
