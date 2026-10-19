# Cinzas do Olimpo: guia para criar sprites

Cole este guia (ou só o PROMPT BASE + o bloco do personagem) na ferramenta de imagem que você for usar (SpriteCook, ChatGPT, Gemini, Midjourney, Leonardo etc.).
Os prompts estão em inglês porque os geradores de imagem obedecem melhor assim. As explicações estão em português.

---

## 1. O jogo em uma frase (contexto para a IA)

> Cinzas do Olimpo is a 2D side-view metroidvania in dark gothic pixel art. A Greek-inspired city has been buried in volcanic ash for ten years and the night never ends. Ruined marble temples, bronze foundries, catacombs, a sunken swamp church, a clock tower. Mood: melancholic, ember-lit, ash falling. Visual reference: Gothicvania (Ansimuz) and Blasphemous, but readable at small size.

## 2. Regras técnicas (o mais importante)

O jogo roda numa tela de **320×180 pixels** com blocos de **16×16**. Tudo é reduzido depois, então a imagem gerada precisa ser **limpa e fácil de recortar**.

| Regra | Por quê |
|---|---|
| Imagem **quadrada 1024×1024** | é o formato que eu recorto automaticamente |
| Fundo **magenta chapado #FF00FF**, sem degradê, sem chão, sem sombra no chão | eu removo o magenta para deixar o fundo transparente |
| **Grade 4×4** (16 quadros) para personagens normais, **3×3** (9 quadros) para chefes grandes | cada célula vira um quadro de animação |
| **Um personagem por célula**, centralizado, com folga nas bordas, sem encostar na célula vizinha | senão o recorte pega pedaço do outro |
| **Todos olhando para a DIREITA** | o jogo espelha sozinho para a esquerda |
| **Mesmo tamanho e mesma linha do pé** em todos os quadros do mesmo personagem | senão o boneco "pula" ou muda de tamanho na animação |
| Corpo inteiro, da cabeça aos pés, pose lateral ou 3/4 | é um jogo de plataforma visto de lado |
| **Sem texto, sem números, sem linhas de grade, sem moldura** | aparecem no recorte |
| Contorno escuro e silhueta forte | vai ficar com ~35 px de altura no jogo |
| Não usar magenta/rosa choque no personagem | some junto com o fundo |

### Tamanho final no jogo (para manter proporção)

| Tipo | Altura final aproximada |
|---|---|
| Herói (cavaleiro negro) | 38 px |
| NPC adulto | 32–34 px |
| Criança | 24 px |
| Inimigo comum | 30–40 px |
| Chefe médio | 55–65 px |
| Chefe grande | 75–85 px |

## 3. Paleta e estilo

- Noite: `#120c0e`, cinza-cinza `#1f1719`, pedra `#3e3033`
- Brasa / fogo: `#e2683c`, `#ff8a3a`, `#ffd070`
- Ouro / bronze: `#d9a441`, `#c8902f`
- Osso / mármore: `#efe6d8`, `#a8998c`
- Almas / água do rio: `#7fe0d0`
- Luz vinda de **cima-esquerda**, brilho quente de brasa embaixo.
- Roupas gastas, queimadas, cobertas de cinza. Nada limpo nem colorido demais.

---

## 4. PROMPT BASE (cole sempre primeiro)

```
Pixel art sprite sheet for a 2D side-view dark gothic metroidvania called "Cinzas do Olimpo"
(a Greek-inspired city buried in volcanic ash, endless night, ember light).
Style: detailed 16-bit pixel art like Gothicvania / Blasphemous, strong dark outline,
readable silhouette at small size, muted ash-covered colors with ember orange and bronze accents,
light from the upper left.

FORMAT RULES (very important):
- Square 1024x1024 image.
- Solid flat magenta background #FF00FF everywhere. No floor, no ground shadow, no gradient, no scenery.
- Invisible {GRID} grid: exactly one full-body figure per cell, centered, with empty margin around it.
  Figures never touch or overlap neighboring cells.
- Every figure faces RIGHT, side view.
- Same character = same scale and same feet baseline in every cell.
- No text, no numbers, no labels, no grid lines, no borders, no UI.
- Do not use magenta or hot pink on the characters.

SHEET CONTENT (row by row, left to right):
{CONTEÚDO}
```

Troque `{GRID}` por `4x4` ou `3x3` e `{CONTEÚDO}` por um dos blocos abaixo.

---

## 5. Blocos prontos por folha

### Folha A: NPCs novos (grade 4x4)

```
Row 1: (1) DAMIÃO, old drill instructor of the city guard, stocky, short gray beard, scarred face,
  dented steel breastplate over a faded red tunic, arms crossed, standing idle.
  (2) same Damião, idle variation: one hand resting on a wooden practice sword planted in the ground.
  (3) CLEIA, a baker woman in her 40s, flour-stained apron, headscarf, sleeves rolled up,
  holding a round loaf of bread, idle. (4) same Cleia, idle variation: wiping her hands on the apron.
Row 2: (5) LINO, a small boy about 8 years old, oversized cap, patched clothes,
  holding a little tin bell, idle (child proportions, about 70% of an adult's height).
  (6) same Lino ringing the tin bell. (7) SISTER ODETE, an old nun of a sunken church,
  dark violet habit with teal trims, wet and torn hem, holding a small oil lamp, idle.
  (8) same Odete, idle variation: lamp raised.
Row 3: (9) PÉTROS, young sculptor apprentice, curly hair, leather apron with chisels,
  his feet and shins already turned to gray stone, holding a hammer and chisel, idle.
  (10) same Pétros hitting the chisel. (11) BRÁS, ghost of a guard sergeant, translucent pale blue,
  old helmet and spear, standing at attention, faint glow. (12) same Brás, saluting.
Row 4: (13) ASH SOLDIER enemy: undead city guard in gray-blue steel armor, round shield held
  in front, short spear, idle. (14) same soldier walking. (15) same soldier pulling the spear back
  to attack (wind-up). (16) same soldier thrusting the spear forward.
```

### Folha B: chefes do leste (grade 3x3)

```
Row 1: (1) THE KEEPER OF HOURS, a tall bronze clockwork automaton, a giant clock face embedded
  in its chest frozen at 12:03, gears visible in the joints, long thin arms ending in blades,
  idle. (2) same Keeper raising both arms, gears glowing (wind-up). (3) same Keeper slashing
  forward with one blade arm.
Row 2: (4) LÚCIO THE STANDARD-BEARER, armored knight in dark crimson plate, tall tower shield
  with a golden sun emblem, torn red banner on a pole strapped to his back, idle behind the shield.
  (5) same Lúcio charging with the shield forward. (6) same Lúcio throwing a javelin overhead.
Row 3: (7) same Lúcio planting the banner pole in the ground, shouting.
  (8) THE MOUNTAIN'S HEART, a floating molten heart of magma and black rock, glowing orange cracks,
  veins of fire, front view. (9) same heart, cracked and dimmed, stunned.
```

### Folha C: a Tecelã (grade 3x3)

```
Row 1: (1) THE WEAVER, a huge spider queen of the deep, black and violet chitin, six pale glowing
  eyes, silk threads hanging from her legs, side view, walking. (2) same Weaver, second walking frame.
  (3) same Weaver rearing up and spitting a web ball.
Row 2: (4) same Weaver charging low and fast. (5) same Weaver hanging UPSIDE DOWN from a single
  silk thread (thread goes up out of the cell). (6) same Weaver dropping down, legs spread.
Row 3: (7) same Weaver stunned on her back. (8) small spiderling enemy, same colors.
  (9) a silk cocoon with a lantern glowing inside.
```

### Folha D: retratos para as conversas (grade 4x4, opcional)

```
Head-and-shoulders portraits, front 3/4 view, same pixel art style, one per cell:
Mira, Tirésias (blind old clockmaker), Bronte (blacksmith), Nicos (hooded ferryman with teal lantern),
Damião, Cleia, Lino, Odete, Pétros, Brás (ghost), Captain Andros (bronze armor, red cape),
Teo (black knight, helmet with orange visor glow). Leave the remaining cells empty magenta.
```

---

## 6. Personagens que já existem (para manter o mesmo visual)

Se for refazer algum, descreva assim:

- **Teo (herói):** cavaleiro negro de armadura escura, capa rasgada, viseira com brilho laranja, espada longa.
- **Mira:** garota catadora, cabelo castanho preso, casaco marrom rasgado, bolsa de couro, livro grande de nomes.
- **Tirésias:** velho relojoeiro cego, venda nos olhos, barba branca, roupa cinza esfarrapada, bengala com relógio de bolso.
- **Bronte:** ferreiro careca e barbudo, avental de couro, martelo.
- **Nicos:** barqueiro encapuzado, manto verde-escuro, remo e lanterna verde-água.
- **Andros:** capitão grisalho de armadura de bronze, capa vermelha, espada longa. Na 2ª fase vira um demônio alado de fogo.
- **Chefes:** Corcel de Bronze (cavalo de festa), Ilía (escultora alada), três cães, Besta do Pântano.

---

## 7. Dicas para dar certo

1. Gere **uma folha por vez** e confira: fundo magenta chapado? todos olhando para a direita? mesmo tamanho?
2. Se a ferramenta deixar, use uma das folhas antigas como **referência de estilo**. As melhores são `Documents\Cinzas do Olimpo\sprites-antigos\spritecook\npcs_raw.png` e `knight_raw.png`.
3. Se vier com chão, sombra ou cenário, peça de novo e repita: *"solid flat magenta #FF00FF background only"*.
4. Quadros de animação do mesmo personagem saem melhores **na mesma imagem** do que em imagens separadas.
5. Salve os PNGs **sem comprimir** (nada de print de tela nem JPG).

## 8. Como me entregar

Salve em `C:\Users\cso6493\Documents\Cinzas do Olimpo\sprites\novos\` com nomes simples, por exemplo:
`npcs-novos.png`, `chefes-leste.png`, `tecela.png`, `retratos.png`.

Depois é só me avisar. Eu recorto, removo o fundo, reduzo para o tamanho do jogo e troco os personagens recoloridos pelos novos.
