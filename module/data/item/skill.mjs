const { NumberField, StringField, HTMLField } = foundry.data.fields;

/**
 * Perícia do Toon. Nível de Habilidade (NH) 1-9, governada por um atributo.
 * Teste: 2d6 <= NH (roll-under). Ver module/dice/roller.mjs.
 */
export default class SkillData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      nh: new NumberField({ required: true, integer: true, min: 1, max: 9, initial: 1 }),
      attribute: new StringField({
        required: true,
        initial: "muque",
        choices: ["muque", "zip", "astucia", "caradura"]
      }),
      description: new HTMLField({ initial: "" })
    };
  }
}
