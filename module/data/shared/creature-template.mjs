const { NumberField, SchemaField, StringField, HTMLField, BooleanField } = foundry.data.fields;

/**
 * Schema compartilhado por toda criatura do Toon (character e npc):
 * os quatro atributos, Pontos de Vida, Pontos de Trama e estado "Caiu".
 */
export default class CreatureTemplate {
  static defineSchema() {
    const attr = () =>
      new NumberField({ required: true, integer: true, min: 1, max: 6, initial: 1 });

    return {
      attributes: new SchemaField({
        muque: attr(),
        zip: attr(),
        astucia: attr(),
        caradura: attr()
      }),
      hp: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 0, initial: 10 }),
        max: new NumberField({ required: true, integer: true, min: 0, initial: 10 })
      }),
      plotPoints: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      fallen: new BooleanField({ initial: false }),
      species: new StringField({ initial: "" }),
      beliefsGoals: new HTMLField({ initial: "" }),
      description: new HTMLField({ initial: "" })
    };
  }
}
