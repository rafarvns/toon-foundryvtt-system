/**
 * Toda a lógica de dados do Toon. Mecânica central: roll-under com 2d6.
 * Resultados são postados como cartões de chat com botões de ação.
 */
export class ToonRoller {
  /**
   * Teste de perícia/atributo (2d6 <= alvo; 2 é sucesso automático).
   * Se `opposed` e `defenderId` vierem, o cartão oferece o botão "Defender".
   * @returns {Promise<{roll: Roll, success: boolean, auto: boolean}>}
   */
  static async rollSkillTest({
    nh,
    label,
    actor = null,
    modifier = 0,
    opposed = null,
    defenderId = null,
    canDamage = false
  } = {}) {
    const roll = new Roll("2d6");
    await roll.evaluate();

    const target = nh - modifier;
    const auto = roll.total === 2;
    const success = auto || roll.total <= target;
    const showOpposed = !!(opposed && defenderId);

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/toon-rpg/templates/chat/skill-card.hbs",
      {
        label,
        nh,
        modifier,
        total: roll.total,
        success,
        auto,
        attackerId: actor?.id ?? "",
        attackerSuccess: success,
        opposed: showOpposed,
        defenderId: defenderId ?? "",
        defenseSkill: opposed?.defense ?? "",
        mutual: opposed?.mutual ?? false,
        isDamage: opposed?.damage ?? false,
        category: opposed?.category ?? "",
        canDamage: !showOpposed && success && canDamage,
        damageFormula: CONFIG.TOON.defaultDamage,
        damageLabel: label
      }
    );

    await ChatMessage.implementation.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content,
      rolls: [roll],
      sound: CONFIG.sounds.dice
    });

    return { roll, success, auto };
  }

  /**
   * O defensor rola a perícia de defesa; o sistema resolve o teste oposto.
   * @param {DOMStringMap} data dataset do botão "Defender"
   */
  static async onDefend(data) {
    const defender = game.actors.get(data.defenderId) ?? null;
    if (!defender) return ui.notifications?.warn(game.i18n.localize("TOON.Opposed.NoDefender"));
    if (!defender.isOwner) return ui.notifications?.warn(game.i18n.localize("TOON.Opposed.NotOwner"));

    const defenseItem = defender.items.find(
      (i) => i.type === "skill" && i.name === data.defenseSkill
    );
    if (!defenseItem) {
      return ui.notifications?.warn(
        game.i18n.format("TOON.Opposed.NoSkill", { skill: data.defenseSkill, name: defender.name })
      );
    }

    const roll = new Roll("2d6");
    await roll.evaluate();
    const defAuto = roll.total === 2;
    const defSuccess = defAuto || roll.total <= defenseItem.system.nh;

    const attacker = game.actors.get(data.attackerId) ?? null;
    const attackerName = attacker?.name ?? game.i18n.localize("TOON.Opposed.Attacker");
    const defenderName = defender.name;
    const attackerSuccess = data.attackerSuccess === "true";
    const mutual = data.mutual === "true";
    const isDamage = data.damage === "true";
    const category = data.category;

    const attackerLands = attackerSuccess && !defSuccess;
    const counter = mutual && defSuccess && !attackerSuccess;

    let outcomeKey = "TOON.Opposed.Nothing";
    let outcomeClass = "is-fail";
    let hit = false;
    let hitterId = "";
    let victimId = "";

    if (attackerLands) {
      outcomeClass = "is-success";
      if (isDamage) {
        hit = true;
        hitterId = attacker?.id ?? "";
        victimId = defender.id;
        outcomeKey = "TOON.Opposed.Hit";
      } else if (category === "talk") outcomeKey = "TOON.Opposed.Convinced";
      else outcomeKey = "TOON.Opposed.AttackerGains";
    } else if (counter) {
      outcomeClass = "is-success";
      if (isDamage) {
        hit = true;
        hitterId = defender.id;
        victimId = attacker?.id ?? "";
        outcomeKey = "TOON.Opposed.Counter";
      } else outcomeKey = "TOON.Opposed.DefenderGains";
    } else if (category === "talk" && defSuccess) {
      outcomeKey = "TOON.Opposed.Resisted";
    }

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/toon-rpg/templates/chat/opposed-card.hbs",
      {
        attackLabel: data.attackLabel,
        defenseSkill: data.defenseSkill,
        defenderName,
        defTotal: roll.total,
        defSuccess,
        defAuto,
        outcomeText: game.i18n.format(outcomeKey, { attacker: attackerName, defender: defenderName }),
        outcomeClass,
        hit,
        hitterId,
        victimId,
        damageFormula: CONFIG.TOON.defaultDamage,
        damageLabel: hit ? `${game.i18n.localize("TOON.Damage.Label")}: ${data.attackLabel}` : ""
      }
    );

    await ChatMessage.implementation.create({
      speaker: ChatMessage.getSpeaker({ actor: defender }),
      content,
      rolls: [roll],
      sound: CONFIG.sounds.dice
    });
  }

  /**
   * Rolagem de dano. Posta cartão com botão "Aplicar dano".
   * @returns {Promise<number>}
   */
  static async rollDamage({ formula = CONFIG.TOON.defaultDamage, label, actor = null, victimId = null } = {}) {
    const roll = new Roll(formula);
    await roll.evaluate();

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/toon-rpg/templates/chat/damage-card.hbs",
      {
        label: label ?? game.i18n.localize("TOON.Damage.Label"),
        total: roll.total,
        formula,
        victimId: victimId ?? ""
      }
    );

    await ChatMessage.implementation.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content,
      rolls: [roll],
      sound: CONFIG.sounds.dice
    });

    return roll.total;
  }

  /** Regra dos 50%: 1d6, 1-3 = sim, 4-6 = não. */
  static async fiftyPercent() {
    const roll = new Roll("1d6");
    await roll.evaluate();
    return roll.total <= 3;
  }

  /** Jogada de "Dezenas e Unidades": dois d6 lidos lado a lado (11..66). */
  static async tensAndUnits() {
    const roll = new Roll("2d6");
    await roll.evaluate();
    const [a, b] = roll.dice[0].results.map((r) => r.result);
    return a * 10 + b;
  }

  /* -------------------------------------------- */
  /*  Botões dos cartões de chat                  */
  /* -------------------------------------------- */

  /** Liga os botões dos cartões (hook renderChatMessageHTML; html é HTMLElement). */
  static onRenderChatMessage(message, html) {
    const dmgBtn = html.querySelector("[data-toon='roll-damage']");
    if (dmgBtn) {
      dmgBtn.addEventListener("click", async () => {
        const actor = game.actors.get(dmgBtn.dataset.actorId) ?? null;
        await ToonRoller.rollDamage({
          formula: dmgBtn.dataset.formula,
          label: dmgBtn.dataset.label,
          actor,
          victimId: dmgBtn.dataset.victimId || null
        });
      });
    }

    const applyBtn = html.querySelector("[data-toon='apply-damage']");
    if (applyBtn) {
      applyBtn.addEventListener("click", () =>
        ToonRoller.applyDamage({
          amount: Number(applyBtn.dataset.amount),
          victimId: applyBtn.dataset.victimId || null
        })
      );
    }

    const defendBtn = html.querySelector("[data-toon='defend']");
    if (defendBtn) {
      defendBtn.addEventListener("click", () => ToonRoller.onDefend(defendBtn.dataset));
    }
  }

  /** Aplica dano a um alvo específico (victimId) ou aos tokens mirados/selecionados. */
  static async applyDamage({ amount, victimId = null } = {}) {
    if (victimId) {
      const actor = game.actors.get(victimId);
      if (!actor?.isOwner) return ui.notifications?.warn(game.i18n.localize("TOON.Chat.NoTarget"));
      return actor.applyDamage(amount);
    }
    const targeted = Array.from(game.user.targets);
    const tokens = targeted.length ? targeted : canvas.tokens?.controlled ?? [];
    const appliable = tokens.filter((t) => t.actor?.isOwner);
    if (!appliable.length) return ui.notifications?.warn(game.i18n.localize("TOON.Chat.NoTarget"));
    for (const t of appliable) await t.actor.applyDamage(amount);
  }
}
