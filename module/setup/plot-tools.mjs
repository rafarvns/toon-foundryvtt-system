/**
 * Ferramentas do Diretor de Animação para Pontos de Trama.
 */
export class PlotTools {
  /** Diálogo para conceder Pontos de Trama aos personagens selecionados. */
  static async award() {
    const tokens = (canvas.tokens?.controlled ?? []).filter((t) => t.actor?.type === "character");
    if (!tokens.length) {
      return ui.notifications?.warn(game.i18n.localize("TOON.Plot.SelectToken"));
    }

    const amount = await foundry.applications.api.DialogV2.prompt({
      window: { title: game.i18n.localize("TOON.Plot.AwardTitle") },
      content: `<div class="toon-rpg toon-dialog">
        <div class="field">
          <label>${game.i18n.localize("TOON.Plot.Amount")}</label>
          <input type="number" name="amount" value="1" min="1" autofocus>
        </div>
      </div>`,
      ok: {
        label: game.i18n.localize("TOON.Save"),
        icon: "fas fa-star",
        callback: (event, button, dialog) => {
          const form = button.form ?? dialog.element.querySelector("form");
          return Number(form.elements.amount.value) || 0;
        }
      },
      rejectClose: false
    });

    if (!amount) return;
    for (const token of tokens) await token.actor.awardPlotPoints(amount);
  }
}
