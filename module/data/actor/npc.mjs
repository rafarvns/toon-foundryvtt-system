import CreatureTemplate from "../shared/creature-template.mjs";

const { StringField } = foundry.data.fields;

/**
 * Data model de NPC do Toon (Astros do Desenho, vilões, figurantes).
 */
export default class NpcData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...CreatureTemplate.defineSchema(),
      naturalEnemy: new StringField({ initial: "" })
    };
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData?.();
    this.hp.value = Math.clamp(this.hp.value, 0, this.hp.max);
    this.fallen = this.hp.value <= 0;
  }
}
