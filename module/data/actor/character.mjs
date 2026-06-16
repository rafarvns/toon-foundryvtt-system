import CreatureTemplate from "../shared/creature-template.mjs";

const { StringField, ArrayField } = foundry.data.fields;

/**
 * Data model do personagem jogador do Toon.
 * Perícias e prodígios são Items embutidos, não campos aqui.
 */
export default class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...CreatureTemplate.defineSchema(),
      profession: new StringField({ initial: "" }),
      naturalEnemy: new StringField({ initial: "" }),
      personalItems: new ArrayField(new StringField())
    };
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData?.();
    // Garante PV dentro dos limites e deriva o estado "Caiu".
    this.hp.value = Math.clamp(this.hp.value, 0, this.hp.max);
    this.fallen = this.hp.value <= 0;
  }
}
