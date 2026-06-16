const { StringField, HTMLField } = foundry.data.fields;

/**
 * Arma / objeto que causa dano. O dano é uma fórmula de dados (ex.: "1d6").
 */
export default class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      damage: new StringField({ required: true, initial: "1d6" }),
      description: new HTMLField({ initial: "" })
    };
  }
}
