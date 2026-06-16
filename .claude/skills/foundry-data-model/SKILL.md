---
name: foundry-data-model
description: Use ao definir ou alterar o schema de dados de Actors/Items (ou outros subtypes) num system Foundry v14 — criar classes TypeDataModel com defineSchema, escolher DataFields (NumberField, StringField, SchemaField, ArrayField, HTMLField...), implementar prepareBaseData/prepareDerivedData, migrateData e métodos/getters de regra. Acione ao modelar atributos, perícias, prodígios, PV, etc. do Toon.
---

# Foundry VTT v14 — Data Models

Doc-fonte: `foundry_14_api_docs/Knowledge_Base/Introduction to System Data Models/system-data-models.md` e a seção "Data Model" de `Introduction to System Development/system-development.md`. API: `foundry_14_api_docs/classes/foundry.abstract.TypeDataModel.md`.

## Conceito

Cada subtype guarda seus dados sob `document.system`, modelado por uma subclasse de `foundry.abstract.TypeDataModel`. O schema é declarado em `static defineSchema()` retornando um objeto de `foundry.data.fields`. Registre com `CONFIG.Actor.dataModels.<type> = Classe` (ver skill `foundry-system-setup`).

## Campos disponíveis (`foundry.data.fields`)

`NumberField`, `StringField`, `BooleanField`, `SchemaField` (objeto aninhado), `ArrayField`, `ObjectField` (dicionário livre), `HTMLField` (texto rico — declarar em `htmlFields` do manifest), `FilePathField` (mídia — declarar em `filePathFields`), `SetField`, `EmbeddedDataField`.

Opções comuns: `{ required, nullable, blank, initial, integer, min, max, positive, choices }`.

## Padrão: composição via template compartilhado

Para dados comuns a vários subtypes (ex.: atributos de toda criatura), crie um template e mescle. O ABEA usa um helper `mergeSchema(a, b)` (`{ ...a, ...b }`) numa classe base. Exemplo Toon:

```js
const { NumberField, SchemaField, StringField, HTMLField, ObjectField } = foundry.data.fields;

// Atributos 1-6 comuns a character e npc
export class CreatureTemplate {
  static defineSchema() {
    const attr = () => new NumberField({ required: true, integer: true, min: 1, max: 6, initial: 1 });
    return {
      attributes: new SchemaField({
        muque: attr(), zip: attr(), astucia: attr(), caradura: attr()
      }),
      hp: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 0, initial: 10 }),
        max:   new NumberField({ required: true, integer: true, min: 0, initial: 10 })
      }),
      plotPoints: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      fallen: new BooleanField({ initial: false }),
      species: new StringField({ initial: "" }),
      beliefsGoals: new HTMLField({ initial: "" })
    };
  }
}

export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...CreatureTemplate.defineSchema(),
      profession: new StringField({ initial: "" }),
      naturalEnemy: new StringField({ initial: "" }),
      personalItems: new ArrayField(new StringField())
    };
  }
}
```

Perícias e prodígios são **Items embutidos** (cada um com seu próprio DataModel `SkillData`/`ProdigyData` com `nh`/level), não campos do Actor — isso casa com a estrutura ABEA e facilita compêndios.

## Regras do Toon a modelar no schema/preparação

- **Atributos**: `muque, zip, astucia, caradura`, inteiros 1–6.
- **Perícia (Item `skill`)**: `nh` 1–9, `attribute` (qual dos 4 governa). NH inicial = valor do atributo; a distribuição dos 30 pontos é estado salvo, não derivado.
- **Prodígio (Item `prodigy`)**: `nh` (começa 5), `cost`, `usableOnOthers` (bool).
- **PV**: `hp.value`/`hp.max`; ao `value <= 0` o personagem **Cai** (`fallen = true`).

## Preparação de dados

`prepareBaseData()` roda antes de filhos/ActiveEffects; `prepareDerivedData()` depois. Derive valores e imponha limites aqui:

```js
prepareDerivedData() {
  super.prepareDerivedData?.();
  // Clamp de PV e estado "Caiu"
  this.hp.value = Math.clamp(this.hp.value, 0, this.hp.max);
  this.fallen = this.hp.value <= 0;
}
```

O Document pai é acessível por `this.parent` dentro do DataModel.

## Métodos e getters de regra

Prefira pôr lógica de regra no DataModel (mais específico que o Document):

```js
get attrValue() { /* ... */ }
// teste roll-under 2d6 <= nh (ver skill foundry-dice-rolls)
```

## Migrações

Ao mudar a forma dos dados, implemente `static migrateData(source)` (roda ao ler do disco e em update deltas — `source` pode ser só o delta):

```js
static migrateData(source) {
  if ( "skill" in source ) source.nh = source.skill; // renomeou campo
  return super.migrateData(source);
}
```

## Token resources

Configure no `init` para expor barras de token:

```js
CONFIG.Actor.trackableAttributes = {
  character: { bar: ["hp"], value: ["plotPoints"] },
  npc: { bar: ["hp"], value: [] }
};
```
Atributo `bar` precisa apontar para objeto com `value` e `max` numéricos.
