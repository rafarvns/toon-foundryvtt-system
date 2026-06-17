/**
 * Gera/atualiza o compêndio de Prodígios a partir de CONFIG.TOON.prodigies.
 * Idempotente: cria os que faltam e atualiza os existentes (por nome).
 * Uso manual (GM, console): game.toon.generateProdigies()
 */
export class ProdigyGenerator {
  static PACK_ID = "toon-rpg.prodigios";

  static async generate({ notify = true } = {}) {
    const pack = game.packs.get(this.PACK_ID);
    if (!pack) {
      ui.notifications?.error(`Toon | Compêndio "${this.PACK_ID}" não encontrado.`);
      return;
    }

    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });

    const existing = await pack.getDocuments();
    const creations = [];
    const updates = [];

    for (const p of CONFIG.TOON.prodigies) {
      const data = {
        name: p.name,
        type: "prodigy",
        img: "icons/svg/item-bag.svg",
        system: {
          nh: CONFIG.TOON.limits.prodigyStartNh,
          cost: p.cost,
          usableOnOthers: false
        }
      };
      const found = existing.find((d) => d.name === p.name);
      if (found) updates.push({ _id: found.id, ...data });
      else creations.push(data);
    }

    if (creations.length) await Item.implementation.createDocuments(creations, { pack: this.PACK_ID });
    if (updates.length) await Item.implementation.updateDocuments(updates, { pack: this.PACK_ID });

    if (wasLocked) await pack.configure({ locked: true });

    if (notify) {
      ui.notifications?.info(
        `Toon | Prodígios: ${CONFIG.TOON.prodigies.length} (criados ${creations.length}, atualizados ${updates.length}).`
      );
    }
  }
}
