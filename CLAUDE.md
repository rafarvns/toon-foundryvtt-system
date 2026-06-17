# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Idioma do projeto: **pt-BR**. O usuário se comunica em português; código em inglês com comentários/labels em português, seguindo o módulo de referência (ver abaixo). Strings voltadas ao usuário vão em `lang/pt-BR.json` (idioma padrão) e `lang/en.json`.

## O que é este projeto

Implementação do RPG **Toon** ("O RPG no Mundo dos Desenhos Animados") como um **game system do Foundry VTT** — alvo **Foundry v14**. Apesar de ser chamado coloquialmente de "módulo", um conjunto de regras completo no Foundry é um *game system* (`system.json`), não um *module* (`module.json`). Construa-o como system.

O repositório está **vazio**, exceto pelo livro de regras `toon-modulo-basico.pdf` (em português). Toda a arquitetura ainda precisa ser criada. As regras do jogo (abaixo) são a peça de conhecimento mais importante deste arquivo: elas estão trancadas dentro do PDF e definem o domínio que o código modela.

Para extrair o texto do PDF: `pdftotext -enc UTF-8 toon-modulo-basico.pdf saida.txt` (o `-enc UTF-8` é obrigatório, senão os acentos quebram).

## Módulo de referência (template arquitetural)

Para ver **como se faz** um system para Foundry v13+, consulte:

```
E:\LivreSolucoes\games\foundryvtt-abea
```

É o system "A Bandeira do Elefante e da Arara" do mesmo autor, já em ApplicationV2. Copie a estrutura de pastas, os padrões de código e o `system.json`. Note: o ABEA usa **rolagem somando dados (3d6 + bônus − dificuldade, rolar alto)**; **Toon é o oposto** (ver "Mecânica central" abaixo) — não copie a lógica de dados do ABEA, só a estrutura.

A base de conhecimento Foundry do autor está em `E:\LivreSolucoes\games\foundryvtt-abea\.agent\rules\foundry-knowledge-base.md` — leia-a antes de mexer em sheets, scene controls ou hooks de chat.

## Design / UI

Todo trabalho visual (sheets, diálogos, cartões, CSS) deve seguir **`DESIGN.md`** (raiz do repo) — sistema de design canônico do Toon (tokens de cor, bordas/raios/sombra "ink", tipografia, layout de duas colunas, padrão de abas com `switch-tab`, painéis/`btn-add`, inputs padronizados). Reuse os tokens; não introduza valores avulsos. O agente `foundry-sheet-builder` já é instruído a carregá-lo.

## Skills do projeto (`.claude/skills/`)

Há skills específicas para construir este system, fundamentadas nos docs v14. Invoque a relevante antes de implementar a área correspondente:
- `foundry-system-setup` — `system.json`, entrypoint, registro de subtypes/sheets.
- `foundry-data-model` — schemas `TypeDataModel` (atributos, perícias, prodígios, PV).
- `foundry-sheet-appv2` — fichas ApplicationV2 (sem jQuery), DialogV2.
- `foundry-dice-rolls` — rolagens (o roll-under 2d6 do Toon) e cartões de chat.
- `foundry-rolltables` — tabelas aleatórias 11–66 (Espécies, Profissões, Tabelas Imbecis...).
- `foundry-localization` — i18n pt-BR/en.
- `foundry-active-effects` — condições/status (Estupefação, Caiu) e modificadores de atributo.
- `foundry-compendium-packs` — empacotar perícias, prodígios, NPCs, tabelas e aventuras.
- `foundry-game-settings` — regras opcionais (Super-Astros, tempo de queda) e flag de migração.
- `foundry-combat-tracker` — encontros/turnos e o Sistema de Ações do Toon.

## Agentes do projeto (`.claude/agents/`)

Subagentes especializados para o fluxo de construção. Despache o adequado:
- `toon-rules-extractor` — fonte canônica das regras (mina o PDF; entrega dados estruturados). Use antes de modelar algo dependente do livro.
- `foundry-system-dev` — construtor de lógica/dados (data models, documentos, rolagens, effects, settings, compêndios).
- `foundry-sheet-builder` — camada de UI (sheets ApplicationV2, templates `.hbs`, CSS, diálogos).
- `foundry-code-reviewer` — revisão read-only contra convenções v14 e fidelidade ao Toon, após implementar.

Fluxo típico: `toon-rules-extractor` (dados) → `foundry-system-dev` + `foundry-sheet-builder` (implementação) → `foundry-code-reviewer` (revisão).

## Documentação oficial da API (Foundry v14) — local

A pasta `foundry_14_api_docs/` é uma cópia offline da API v14 (scrape de foundryvtt.com/api) — **consulte-a aqui em vez de buscar na web**:
- `foundry_14_api_docs/index.md` — visão geral e índice da API.
- `foundry_14_api_docs/classes/`, `functions/`, `interfaces/`, `enums/`, `types/`, `variables/` — referência por símbolo (ex.: `classes/` para `ActorSheetV2`, `Roll`, `TypeDataModel`).
- `foundry_14_api_docs/Knowledge_Base/INDEX.md` — guias temáticos (Actors, Advanced Dice, Active Effects, migrações de API, etc.); comece pelo INDEX para achar o arquivo certo.

Use Grep/Glob dentro dessa pasta para localizar a assinatura exata de uma classe/método antes de implementar. Os arquivos da Knowledge_Base têm boilerplate de "JavaScript disabled" no topo — ignore-o e leia o corpo.

## Convenções Foundry v13+/v14 (não óbvias, fáceis de errar)

- **Sem jQuery.** Use `HTMLElement` puro: `querySelector()`, `addEventListener()`. O `html` entregue pelos hooks/sheets é `HTMLElement`, não objeto jQuery.
- **Sheets em ApplicationV2**: estenda `HandlebarsApplicationMixin(ActorSheetV2)` / `ItemSheetV2`. Use os campos estáticos `DEFAULT_OPTIONS`, `PARTS`, `TABS`, e `actions` (mapa de `data-action` → handler estático). Veja `module/applications/actor/character-sheet.mjs` no ABEA.
- **Data models**: estenda `foundry.abstract.TypeDataModel`; registre em `CONFIG.Actor.dataModels.<type>` / `CONFIG.Item.dataModels.<type>` no hook `init`. Declare os tipos em `documentTypes` no `system.json`.
- **Scene controls** (`getSceneControlButtons`): `controls` e `tools` são **objetos**, não arrays (`controls.x = { tools: { y: {} } }`).
- **Hook de chat**: use `renderChatMessageHTML`, não `renderChatMessage` (deprecado).
- `system.json` deve declarar `compatibility: { minimum: "13", verified: "14" }` (o ABEA ainda está em 12/13; suba para 14 neste projeto).

## Arquitetura a seguir (espelhando o ABEA)

- `<id>.mjs` na raiz — entrypoint ESM (`esmodules` no manifest). Registra data models, document classes, sheets, helpers de Handlebars e templates nos hooks `init`/`ready`.
- `module/config.mjs` — objeto `CONFIG` do system (listas de atributos, perícias, prodígios, dificuldades) exposto em `CONFIG.<ID>`.
- `module/data/` — data models (`actor/`, `item/`, `shared/` para templates compartilhados). Composição via `mergeSchema`.
- `module/documents/` — subclasses de `Actor`/`Item` com `prepareDerivedData()` e métodos de rolagem (`rollSkill`, etc.).
- `module/applications/` — sheets ApplicationV2 e diálogos.
- `module/dice/roller.mjs` — **toda** a lógica de dados centralizada aqui.
- `templates/` (`.hbs`), `styles/` (`.css`), `lang/` (`pt-BR.json`, `en.json`), `packs/` (compêndios).

Sem etapa de build: ES modules vanilla carregados direto pelo Foundry. Formatação via Prettier (config do ABEA: `tabWidth: 4`, `printWidth: 120`, `semi: true`, `trailingComma: "all"`, aspas duplas). Não há `package.json`/testes no template — introduza só se necessário.

## Rodar / desenvolver

O Foundry carrega systems da pasta `Data/systems/<id>/`. Para testar, faça um link simbólico (ou cópia) da raiz deste repo para lá e dê *reload* no mundo. Verifique mudanças dentro do próprio Foundry (não há runner headless).

## Mecânica central do Toon (modela o sistema inteiro)

**Diferença que define tudo:** Toon é **roll-under com 2d6**. Um teste tem sucesso quando `2d6 ≤ Nível de Habilidade (NH)` da perícia. Quanto **maior** o NH, melhor. **Um resultado 2 é sempre sucesso** (mesmo com NH 1). Não existe "rolar alto" como no ABEA.

- **Dados**: apenas d6. Rolagens "Dezenas e Unidades" = dois d6 lidos lado a lado (ex.: 4 e 3 = 43, não 7), gerando 11–66 para consultar tabelas.
- **Regra dos 50%**: para um sim/não arbitrário, role 1d6 — 1-3 = sim, 4-6 = não.

**Atributos (4)** — valores 1 a 6:
- `Muque` (força), `Zip` (velocidade/destreza), `Astúcia` (inteligência), `Caradura` (audácia/coragem).
- Criação: role 1d6 quatro vezes, OU distribua 14 pontos (máx. 6 por atributo).

**Pontos de Vida (PV)**: `1d6 + 6`. Ao sofrer dano acumulado ≥ PV, o personagem **Cai** (não morre) — fica 3 minutos fora e volta com PV cheio no mesmo lugar.

**Dano**: normalmente `1d6`. Armas maiores causam mais. Munição é ilimitada por padrão. **Torta de creme**: 0 de dano, mas causa **Estupefação** (atordoa).

**Perícias (23)** — cada uma com NH 1–9, agrupada por atributo. NH inicial = valor do atributo da perícia; depois distribui-se **30 Pontos de Perícia** (+1 ponto = +1 NH). Máx. 9, mín. 1. Agrupamento:
- **Muque**: Derrubar Portas, Escalada, Luta, Erguer Coisas Pesadas, Arremesso.
- **Zip**: Esquiva, Condução, Disparar Arma, Salto, Cavalgar, Corrida, Natação.
- **Astúcia**: Esconder/Achar Escondido, Identificar Coisas Perigosas, Leitura, Resistir à Lábia, Visão/Audição/Olfato, Armar/Desarmar Armadilhas, Seguir/Cobrir Pistas.
- **Caradura**: Lábia, Passar/Detectar Coisas de Má Qualidade, Prestidigitação, Esgueirar.

Mecânicas opostas comuns (ambos rolam contra sua perícia; só importa quando um tem sucesso e o outro falha): Luta↔Luta, Arremesso↔Esquiva, Disparar Arma↔Esquiva, Corrida↔Corrida (perseguição), Lábia↔Resistir à Lábia.

**Prodígios** (superpoderes) — começam todos com NH 5; máx. **2** por personagem; comprados com Pontos de Perícia. O 2º prodígio custa **+5** além do custo dele. Custos: Detectar Objetos (2), Esticar (3), Mudança Rápida/Disfarce (3), Animal de Estimação/Fiel Companheiro (3), Sorte Incrível (3), Escudo de 1001 Utilidades (4), Voar (4), Força Incrível (5), Hipnotismo (5), Invisibilidade (5), Mudar de Forma (5), Saco de Surpresas (5), Teleporte (6), Velocidade Incrível (6), Transferência Cósmica (10). Tornar um prodígio utilizável em outros: **+2**.

**Pontos de Trama** (recompensa do Diretor por jogadas engraçadas/espertas/concluir aventura): entre aventuras, **2 pts = +1 NH** de perícia; **4 pts = +1 NH** de prodígio. 3 pts = um prodígio temporário (dura 1 aventura, NH 5).

**Outros campos da ficha**: Espécie; Profissão (humanos); Inimigos Naturais (par que ganha Pontos de Trama ao derrubar o outro); Crenças & Objetivos (personalidade que move o personagem); Objetos Pessoais (até 8, ≥4 "normais"); **Trecos** (objeto coringa que vira o que o jogador quiser na hora de usar).

O **Diretor de Animação (DA)** é o GM; ferramentas/automações de GM (rolagens solicitadas, distribuição de Pontos de Trama) seguem o padrão de scene controls + diálogo do ABEA.
