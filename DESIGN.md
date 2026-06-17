# DESIGN.md — Sistema de Design do Toon (Foundry VTT)

Guia visual **canônico** do system Toon. Qualquer nova UI (sheets, diálogos, cartões de chat, apps) **deve** seguir estes tokens e padrões para manter consistência. Os valores abaixo refletem o que já está implementado em `styles/global.css` e nos templates de `templates/`.

> Estética alvo: **desenho animado / cartoon** — contornos pretos grossos ("ink"), cores vivas, cantos arredondados, sombra sólida deslocada. Divertido, mas legível.

---

## 1. Tokens de cor

| Papel | Valor |
|---|---|
| Tinta / contorno / texto | `#1c1c1c` |
| Fundo da página (window-content) | `#fffdf3` (creme) |
| Fundo de cartão/painel | `#fff` |
| Amarelo banner (gradiente) | `#ffe14d` → `#ffc400` |
| Amarelo destaque (botão/aba ativa) | `#ffc400` (hover `#ffd54a`) |
| Amarelo aba inativa | `#ffe9a8` |
| Realce de linha (hover de row) | `#fff3c4` |
| Realce de botão redondo (hover) | `#ffe14d` |
| Anel de foco (inputs) | `#ffc40088` |
| Perigo / PV / "Caiu" | `#e8413c` |
| Texto secundário/mudo | `#555` / `#666` |
| Divisor pontilhado | `#d2d2d2` |

**Cores por seção** (gradiente `linear-gradient(180deg, claro, escuro)`):

| Seção | Claro → Escuro |
|---|---|
| Perícias (azul) | `#3aa7ff` → `#1f8be0` |
| Prodígios (roxo) | `#b15cff` → `#8e3be0` |
| Objetos/Inventário (laranja) | `#ff9d3a` → `#f07d10` |
| Biografia/Perfil (verde) | `#46c66b` → `#27a64c` |

**Cores por atributo** (fundo do cartão; texto sempre `#1c1c1c`):

| Atributo | Fundo |
|---|---|
| Muque | `#ff6b5b` (vermelho vivo) |
| Zip | `#3aa7ff` (azul vivo) |
| Astúcia | `#43c96d` (verde vivo) |
| Caradura | `#b863ff` (roxo vivo) |

---

## 2. Forma (bordas, raios, sombra)

- **Contorno padrão de cartão/painel/banner**: `border: 3px solid #1c1c1c`.
- **Contorno de input e badges menores**: `border: 2px solid #1c1c1c`.
- **Raios**: cartões/painéis/banner `16px`; cartões de atributo e item-body `14px`; foto/imagem de item `12px`; inputs `8px`; topo das abas `12px 12px 0 0`; pílulas/tags (botão adicionar, fallen-tag) `20px`; botões de ação redondos `50%`.
- **Sombra "ink"** (sólida, sem blur, deslocada para baixo): cartões `box-shadow: 0 3px 0 #1c1c1c`; elementos menores `0 2px 0 #1c1c1c`.

---

## 3. Tipografia

- Família: `"Signika", sans-serif` (padrão do Foundry).
- **Títulos/labels**: `font-weight: 800`, frequentemente `text-transform: uppercase`.
- Nome do personagem (banner): `1.9em`, 800, centralizado.
- Cabeçalho de seção (`h2`): `1.05em`, 800, uppercase, texto branco com `text-shadow: 1px 1px 0 #00000055`.
- Subtítulo (`.sub`, grupos de perícia): `0.82em`, 800, uppercase, `#1c1c1c`.
- Labels de campo: `0.72em`–`0.78em`, 700/800, uppercase.
- Nome de item em linha: `font-weight: 600`.

---

## 4. Layout da ficha

- Janela: `width 1000`, `height 900`, `min-width 640` (em `DEFAULT_OPTIONS.position`). Item sheet: `width 480`, `min-width 420`.
- **Aba de Perícias**: os 4 grupos por atributo ficam em **grade 2×2** (`.toon-panel.skills .panel-body` = grid 2 colunas). Ordem definida em `_prepareContext` (`groupOrder = ["muque","caradura","zip","astucia"]`): linha 1 = Muque | Caradura, linha 2 = Zip | Astúcia.
- `window-content`: `padding: 0`, fundo creme. O corpo (`.toon-sheet-body`) tem `padding: 12px`, `overflow-y: auto`, `display:flex; flex-direction:column; gap:10px`.
- **Banner** no topo (nome), largura total.
- Abaixo, `.toon-columns`: grid de **duas colunas** `240px (sidebar) + 1fr (main)`, `gap: 12px`, `align-items: start`.
- **Sidebar** (cards empilhados, `gap:10px`): foto → vitais (PV, Pontos de Trama, "Caiu") → atributos (grid 2×2 colorido). Espécie/Profissão ficam na aba **Perfil** (`.profile-fields`), não na sidebar.
- **Foto**: `width:100%`, `height:240px`, `object-fit:cover`, dentro de cartão com contorno e cantos arredondados.
- **Main**: barra de **abas** + conteúdo da aba ativa.

---

## 5. Padrão de ABAS (regra crítica)

Implementação **manual** (não usar o sistema de abas embutido do ApplicationV2):

- **NÃO** use `data-action="tab"` — é uma ação **reservada** do ApplicationV2 (dispara `_onClickTab`/`changeTab` e exige config `TABS`). Use **`data-action="switch-tab"`** com `data-tab="<id>"`.
- A sheet guarda a aba ativa num campo (`_tab = "skills"`), expõe `context.tab`, e alterna a classe `.active` no DOM via um método chamado em `_onRender` (`#applyTab()`), sem re-render. O handler `switch-tab` só troca `this._tab` e reaplica.
- No template: `<nav class="toon-tabs">` com `<a class="tab-link {{#if (toonEq tab 'X')}}active{{/if}}" data-action="switch-tab" data-tab="X">`, e `<div class="tab-content">` com `<section class="tab {{#if ...}}active{{/if}}" data-tab="X">`.
- CSS: `.tab-content > .tab { display:none }` / `.tab-content > .tab.active { display:block }`.

**Aparência das abas (folder/pasta):**
- `.tab-link`: pílula com `border:3px solid #1c1c1c`, **sem** borda inferior, `border-radius:12px 12px 0 0`, `padding:7px 14px`, ícone + label uppercase 800; inativa `#ffe9a8`, ativa `#ffc400`, hover `#ffd54a`.
- A "linha" sob as abas é a **borda superior do painel de conteúdo**, NÃO uma `border-bottom` no `.toon-tabs` (que não deve ter borda inferior). `.tab-content { padding-top: 0 }` para o conteúdo encostar nas abas.
- O painel da aba conecta-se às abas pela esquerda: `border-top-left-radius: 0`; os demais cantos ficam `16px` (incluindo o **superior-direito**, que arredonda a linha à direita). **Nunca** remover a borda superior do painel para arredondar o canto — isso "buga" o canto.

---

## 6. Componentes

**Painel** (`.toon-panel`): cartão branco com contorno/raio/sombra padrão. Em abas, **não** repetir título (a aba já rotula). Ações de criação ficam numa **barra de ferramentas** no topo, à direita:
- `.panel-toolbar` (`justify-content:flex-end`, `padding:8px 12px 0`) com botões `.btn-add`.
- `.btn-add`: pílula `#ffc400`, `border:2px solid #1c1c1c`, `border-radius:20px`, sombra `0 2px 0`, uppercase 800 `0.76em`, ícone + rótulo (ex.: "Nova Perícia").
- `.panel-body`: `padding: 8px 12px`.

**Cabeçalho colorido** (`.section-head`): usado em painéis **fora de abas** (ex.: ficha de NPC). Gradiente da seção, texto branco 800 uppercase, borda inferior `3px`. Não usar dentro de abas.

**Linhas de lista** (`.skill-row`, `.item-row`): `display:flex; gap:8px; padding:3px 6px; border-radius:8px`; primeiro `<span>` com `flex:1`; hover `#fff3c4`. Campo NH inline: `.nh` (input numérico `width:44px`, centralizado, 800).

**Botões de ação redondos**: ícones de rolar/editar/excluir/levantar/atributo. `24×24`, `border-radius:50%`, hover `#ffe14d` + `transform:scale(1.18)`. Aplicar **apenas** dentro de `.skill-row`, `.item-row`, `.attribute`, `.section-head` e `a.revive` — **nunca** em `.tab-link` nem `.btn-add`.

**Cartão de atributo** (`.attribute`): coluna centralizada (label / input grande `1.5em` 800 / botão rolar `d6`), contorno `3px`, raio `14px`, fundo pela cor do atributo (`data-attr`).

**Vitais com formas** (`.vital-shape`): PV e Pontos de Trama usam **formas SVG** (não cards retangulares) com contorno preto e número(s) em input transparente sobreposto (edição direta). PV = **coração** vermelho `#e8413c` (atual grande no centro `.cur`, máximo pequeno na ponta `.mx`); Pontos de Trama = **losango** roxo `#b15cff` (valor central). Legenda uppercase abaixo (`.shape-caption`); botão Levantar (`.revive`, `fa-rotate-left`) na legenda do PV.

**Tag "Caiu"** (`.fallen-tag`): pílula vermelha `#e8413c`, texto branco 800 uppercase, borda `2px`, raio `20px`.

**Banner do nome** (`.toon-banner`): cartão de gradiente amarelo; o input do nome (`.char-name`) é "título" — **transparente, sem borda** (exceção à regra de inputs).

---

## 6.1 Campos "clique-para-rolar" (`.click-roll`)

Padrão de interação para **valores roláveis e editáveis** (NH de atributo, NH de perícia/prodígio):

- O valor aparece como **texto/label** (`.display`); o `<input>` fica oculto até a edição.
- **1 clique** = rola (atributo → `rollAttribute`; perícia → `rollSkill`; item/prodígio → `item.roll()`); **clique-duplo** = entra em modo edição (mostra o input, foca e seleciona); ao perder o foco (`blur`), volta a label.
- A distinção clique simples × duplo usa um atraso (~220ms) em `_onRender` (`#wireClickRoll`/`#doClickRoll`/`#enterEdit`). Não usar `data-action` para isso.
- Marcação: `<div class="nh click-roll" data-roll-type="skill|item|attribute" [data-attr]><span class="display">{{v}}</span><input data-edit-item="system.nh" ...></div>`. Para atributo, o input tem `name="system.attributes.X"`.
- CSS: `.click-roll input{display:none}`, `.click-roll.editing input{display:inline-block}`, `.click-roll.editing .display{display:none}`, hover com `underline dotted`.
- **Botão de rolagem explícito permanece** ao lado (redundância proposital: clique no valor *ou* no botão de dado).
- O **nome** da perícia/prodígio também é clicável para rolar via `data-action="roll-skill"`/`"roll-item"` (sem duplo-clique).

Linhas de lista: `.skill-row`/`.item-row` com `padding: 5px 6px`, `gap: 6px`. Grupos de perícia separados por `margin-top: 12px` (`.skill-group + .skill-group`).

## 7. Inputs padronizados

Regra única para `input[type=text|number]`, `select`, `textarea` (exceto `.char-name`):
```css
background:#fff; border:2px solid #1c1c1c; border-radius:8px;
padding:3px 6px; color:#1c1c1c; font-family:inherit;
```
Foco: `box-shadow: 0 0 0 2px #ffc40088`. **Sem** fundos amarelos/coloridos em inputs. Texto sempre `#1c1c1c`.

---

## 8. Regras de implementação (sempre)

- **ApplicationV2 + HandlebarsApplicationMixin**, **sem jQuery** (`querySelector`/`addEventListener`).
- Cada PART de template tem **um único elemento raiz**.
- Cliques simples via `data-action` (handlers estáticos); eventos `change`/custom em `_onRender`.
- Toda string visível ao usuário é chave de i18n (`TOON.*`), adicionada em `lang/pt-BR.json` **e** `lang/en.json`.
- Escopar CSS sob `.toon-rpg`. Cores/raios/sombras conforme as tabelas acima — não introduzir novos valores avulsos sem necessidade; reusar os tokens.
