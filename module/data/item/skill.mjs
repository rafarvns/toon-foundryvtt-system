const { NumberField, StringField, HTMLField, BooleanField } = foundry.data.fields;

/**
 * Perícia do Toon. Nível de Habilidade (NH) 1-9, governada por um atributo.
 * Teste: 2d6 <= NH (roll-under). Ver module/dice/roller.mjs.
 * `core`: perícia padrão (das 23 semeadas) — não pode ser excluída.
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
      core: new BooleanField({ initial: false }),
      description: new HTMLField({ initial: "" })
    };
  }
}
