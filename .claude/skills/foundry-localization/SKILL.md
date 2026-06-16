---
name: foundry-localization
description: Use ao adicionar ou organizar strings traduzíveis (i18n) num system Foundry v14 — arquivos lang/pt-BR.json e lang/en.json, namespacing de chaves, game.i18n.localize/format, helper {{localize}} no Handlebars e o campo languages do manifest. Acione ao introduzir qualquer texto visível ao usuário no system Toon.
---

# Foundry VTT v14 — Localização (i18n)

Doc: `foundry_14_api_docs/Knowledge_Base/Languages and Localization/localization.md`. API: `classes/foundry.helpers.Localization.md`.

Este projeto é **pt-BR como idioma padrão** + en. Nunca escreva texto cru voltado ao usuário no código/templates — use chaves de localização.

## Manifest

```json
"languages": [
  { "lang": "pt-BR", "name": "Português (Brasil)", "path": "lang/pt-BR.json" },
  { "lang": "en", "name": "English", "path": "lang/en.json" }
],
"defaultLanguage": "pt-BR"
```

## Arquivos de tradução

Objeto JSON plano de `chave -> tradução`. **Namespace** com o prefixo do system (`TOON.`) para evitar colisão com core/outros pacotes. As chaves devem ser idênticas entre os idiomas; só os valores mudam.

`lang/pt-BR.json`:
```json
{
  "TOON.Attributes.Muque": "Muque",
  "TOON.Attributes.Zip": "Zip",
  "TOON.Attributes.Astucia": "Astúcia",
  "TOON.Attributes.Caradura": "Caradura",
  "TOON.HP": "Pontos de Vida",
  "TOON.PlotPoints": "Pontos de Trama",
  "TOON.Roll.Success": "Sucesso",
  "TOON.Roll.Fail": "Falha",
  "TOON.Damage.Dealt": "{name} sofreu {amount} de dano!"
}
```

`lang/en.json` (mesmas chaves):
```json
{
  "TOON.Attributes.Muque": "Brawn",
  "TOON.HP": "Hit Points",
  "TOON.Damage.Dealt": "{name} took {amount} damage!"
}
```

## Usar em JavaScript

```js
game.i18n.localize("TOON.HP");                       // string simples
game.i18n.format("TOON.Damage.Dealt", { name, amount });  // com interpolação {var}
game.i18n.has("TOON.HP");                            // checa existência
```
Disponível só a partir do hook `init` em diante (não no topo do módulo).

## Usar em Handlebars

```hbs
<label>{{localize 'TOON.HP'}}</label>
<img title="{{localize 'TOON.Title'}}">
```
Use aspas simples dentro do `{{localize}}` para poder pôr atributos HTML com aspas duplas em volta.

## Boas práticas

- Estruture as chaves por contexto: `TOON.Attributes.*`, `TOON.Skills.*`, `TOON.Tabs.*`, `TOON.SheetClass.*`, `TOON.Roll.*`.
- Para listas em `CONFIG.TOON` (atributos, perícias, prodígios), guarde a **chave** de label (ex.: `"TOON.Attributes.Muque"`) e localize na hora de renderizar — espelha o padrão do ABEA (`config.mjs`).
- Ao adicionar qualquer string nova, edite **ambos** os arquivos de idioma de uma vez para não deixar chave faltando.
- Mantenha um doc de mapeamento se as traduções divergirem muito (o ABEA tem `docs/i18n-mapping.md`).
