const { NumberField, BooleanField, HTMLField } = foundry.data.fields;

/**
 * Objeto pessoal genérico. `isProp` marca um "Treco" (objeto coringa do Toon).
 */
export default class GearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      quantity: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      isProp: new BooleanField({ initial: false }),
      description: new HTMLField({ initial: "" })
    };
  }
}
