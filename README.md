# toon-foundryvtt-system

Game system **não oficial** do RPG **Toon — O RPG no Mundo dos Desenhos Animados** para o [Foundry VTT](https://foundryvtt.com/) **v14**.

O mundo louco dos desenhos animados, onde as leis da física só funcionam quando se presta atenção a elas e ninguém morre — apenas **Cai**.

## Estado

Em desenvolvimento inicial (scaffold). Já implementado:

- Tipos de Actor: `character`, `npc`; tipos de Item: `skill`, `prodigy`, `weapon`, `gear`.
- Atributos **Muque / Zip / Astúcia / Caradura** (1–6), Pontos de Vida, Pontos de Trama, estado "Caiu".
- Mecânica central **roll-under 2d6** (sucesso com `2d6 ≤ NH`; resultado 2 é sucesso automático), dano, Regra dos 50%.
- As 23 perícias canônicas semeadas automaticamente ao criar um personagem.
- Fichas em ApplicationV2 (pt-BR / en).

## Instalação (dev)

Linke ou copie esta pasta para `{userData}/Data/systems/toon-rpg/` e recarregue o Foundry.

## Idioma

pt-BR (padrão) e en.

---

*Projeto de fã, sem fins lucrativos. Toon é uma marca de Steve Jackson Games.*
