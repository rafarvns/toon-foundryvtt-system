const { NumberField, BooleanField, HTMLField } = foundry.data.fields;

/**
 * Prodígio do Toon (superpoder). Começa com NH 5; máx. 2 por personagem.
 */
export default class ProdigyData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      nh: new NumberField({ required: true, integer: true, min: 1, max: 9, initial: 5 }),
      cost: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      usableOnOthers: new BooleanField({ initial: false }),
      description: new HTMLField({ initial: "" })
    };
  }
}
