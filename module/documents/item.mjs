import { ToonRoller } from "../dice/roller.mjs";

/**
 * Classe Item customizada do Toon.
 */
export class ToonItem extends Item {
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
