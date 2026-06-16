/**
 * Toda a lógica de dados do Toon. Mecânica central: roll-under com 2d6.
 */
export class ToonRoller {
  /**
   * Teste de perícia/atributo do Toon: sucesso quando 2d6 <= alvo.
   * Um resultado 2 é SEMPRE sucesso. Modificadores positivos aumentam a
   * dificuldade (reduzem o alvo).
   * @param {object} p
   * @param {number} p.nh        Nível de Habilidade (ou valor de atributo) — o alvo.
   * @param {string} p.label     Texto do cartão.
   * @param {Actor}  [p.actor]   Ator que rola.
   * @param {number} [p.modifier] Modificador de dificuldade (positivo = mais difícil).
   * @returns {Promise<{roll: Roll, success: boolean, auto: boolean}>}
   */
  static async rollSkillTest({ nh, label, actor = null, modifier = 0 } = {}) {
    const roll = new Roll("2d6");
    await roll.evaluate();

    const target = nh - modifier;
    const auto = roll.total === 2; // 2 é sucesso automático
    const success = auto || roll.total <= target;

    const result = success
      ? game.i18n.localize("TOON.Roll.Success")
      : game.i18n.localize("TOON.Roll.Fail");
    const autoTxt = auto ? ` (${game.i18n.localize("TOON.Roll.Auto")})` : "";
    const modTxt = modifier ? ` (mod ${modifier > 0 ? "+" : ""}${modifier})` : "";

    const flavor =
      `<h3>${label}</h3>` +
      `<p>NH ${nh}${modTxt} &mdash; <strong>${result}</strong>${autoTxt}</p>`;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor
    });

    return { roll, success, auto };
  }

  /**
   * Rolagem de dano (normalmente 1d6). Retorna o total.
   * @returns {Promise<number>}
   */
  static async rollDamage({ formula = "1d6", label, actor = null } = {}) {
    const roll = new Roll(formula);
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `<h3>${label ?? game.i18n.localize("TOON.Damage.Label")}</h3>`
    });
    return roll.total;
  }

  /**
   * Regra dos 50%: 1d6, 1-3 = sim, 4-6 = não.
   * @returns {Promise<boolean>}
   */
  static async fiftyPercent() {
    const roll = new Roll("1d6");
    await roll.evaluate();
    return roll.total <= 3;
  }

  /**
   * Jogada de "Dezenas e Unidades": dois d6 lidos lado a lado (11..66).
   * @returns {Promise<number>}
   */
  static async tensAndUnits() {
    const roll = new Roll("2d6");
    await roll.evaluate();
    const [a, b] = roll.dice[0].results.map((r) => r.result);
    return a * 10 + b;
  }
}
