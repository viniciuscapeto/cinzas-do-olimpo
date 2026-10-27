# A evolução do Teo: como pedir os sprites ao Gemini

O Teo começa o jogo como **coveiro** e, a cada peça, a cinza se junta no corpo dele e vira a **armadura da guarda**. Hoje o jogo simula isso pintando de pano as partes que ainda não têm armadura. Com os sprites desta lista, cada fase passa a ter um desenho de verdade.

## A história por trás

- Teo é o último coveiro de Olimpo. Mora na casinha do cemitério e trabalha com uma pá velha.
- O pai dele, Andros, era o capitão da guarda e sumiu na noite do vulcão. A armadura da guarda ficou espalhada na cinza da cidade.
- Cada vez que Teo sobe de nível, a cinza grudada nele endurece e vira uma peça dessa armadura. Ele não escolhe: a cidade vai vestindo o filho do capitão.
- A espada não é dele no começo. É a **espada do capitão Andros**, cravada na praça da festa. Teo a arranca da cinza depois de vencer o Corcel. Até lá, ele luta com a pá.

## As 5 fases

| Fase | Nível | Arquivo | O que muda |
|---|---|---|---|
| 0 · Coveiro | 1–2 | `teo0` | sem armadura nenhuma |
| 1 · Grevas | 3–5 | `teo1` | pernas e pés de metal |
| 2 · Couraça | 6–9 | `teo2` | peito, ombros e braços de metal |
| 3 · Elmo | 10–13 | `teo3` | elmo fechado com o visor aceso |
| 4 · Capa de Andros | 14+ | `teo4` | capa vermelha rasgada: é o cavaleiro de hoje |

**Fase 0, o coveiro:** um rapaz magro de uns 20 anos. Capuz de lã marrom remendado, com o rosto aparecendo (cabelo escuro, olhos cansados, cinza na bochecha). Túnica de linho grosso com as mangas arregaçadas e cinto de couro com uma bolsinha. Calça de trabalho, pés enrolados em faixas de pano com botas gastas e um manto curto de lona, sujo de cinza. Nada de metal.

**Fase 1, grevas:** igual à fase 0, mas das coxas para baixo vira metal escuro, quase preto, com bordas de bronze: grevas, joelheiras e botas de ferro (sabatons). O metal parece ter **crescido da cinza**, com rachaduras finas que brilham laranja.

**Fase 2, couraça:** tudo da fase 1, mais a couraça de ferro escuro no peito com o símbolo da guarda (um sino pequeno em bronze), ombreiras e braços de metal com manoplas. O capuz e o manto de lona continuam.

**Fase 3, elmo:** tudo da fase 2, mas o capuz dá lugar a um **elmo fechado**, com uma fenda de visor que brilha laranja como brasa. O manto de lona continua.

**Fase 4, capa de Andros:** o manto de lona vira uma **capa vermelho-escura**, longa e rasgada na ponta. É exatamente o cavaleiro negro que está no jogo hoje (veja `referencia-cavaleiro-final.png`).

## Regras para o jogo conseguir usar

| Regra | Por quê |
|---|---|
| Fundo **magenta chapado #FF00FF**, sem chão, sombra ou cenário | eu tiro o magenta |
| Teo olhando para a **direita**, vista de lado | o jogo espelha para a esquerda |
| **Mãos vazias, fechadas como se segurassem um cabo** | o jogo desenha a arma na mão (pá, espada, lança…) |
| Mesmo tamanho e mesma linha dos pés em todos os quadros | senão ele "pula" na animação |
| Uma figura por quadro, sem encostar no vizinho | eu recorto cada quadro sozinho |
| Sem texto, número, borda ou grade desenhada | sujeira no recorte |
| Nada de magenta ou rosa choque no personagem | sumiria junto com o fundo |

No jogo ele tem uns 31 pixels de altura. Por isso a silhueta tem que ser forte, o contorno escuro e os detalhes grandes.

## Os quadros de cada fase (2 imagens por fase)

**Imagem A**, grade 4×2, salve como `teoN_a.png` (troque N pelo número da fase):
1. parado 1
2. parado 2 (respirando, os ombros descem um pouco)
3. correndo 1
4. correndo 2
5. correndo 3
6. correndo 4
7. pulando (subindo, joelhos dobrados)
8. caindo (pernas esticadas para baixo)

**Imagem B**, grade 4×2, salve como `teoN_b.png`:
1. ataque 1: braços erguidos acima da cabeça, puxando a arma para trás
2. ataque 2: braços descendo à frente, na altura da cabeça
3. ataque 3: braços esticados à frente, na altura do peito
4. ataque 4: fim do golpe, braços embaixo, corpo inclinado
5. apanhando: corpo jogado para trás
6. agachado: joelhos bem dobrados, cabeça baixa (bem mais baixo que em pé)
7. morto: caído de lado no chão
8. vazio

Suba tudo na pasta `sprite-gemini/teo` do GitHub. Se o Gemini juntar tudo numa folha só ou numa ordem diferente, pode subir assim mesmo e me avise a ordem.

## Prompt-base (copie e troque só o FASE e o QUADROS)

```
Pixel art sprite sheet for a 2D side-view dark gothic metroidvania called "Cinzas do Olimpo"
(a Greek-inspired city buried in volcanic ash, endless night, ember light).
Main character: TEO, a young gravedigger who slowly becomes an armored knight.
Style: detailed 16-bit pixel art like Gothicvania / Blasphemous, strong dark outline,
readable silhouette at small size, muted ash-covered colors with ember orange and bronze accents,
light from the upper left.

FORMAT RULES (very important):
- Image 1408x768, invisible 4x2 grid: exactly one full-body figure per cell, centered, with empty margin.
- Solid flat magenta background #FF00FF everywhere. No floor, no shadow, no gradient, no scenery.
- No grid lines, no borders, no text, no numbers, no UI.
- The character faces RIGHT, pure side view, same scale and same feet baseline in every cell.
- EMPTY HANDS, closed as if gripping a handle (the weapon is drawn separately by the game).
- Do not use magenta or hot pink on the character.

CHARACTER STAGE:
{FASE}

CELLS (left to right, top row then bottom row):
{QUADROS}
```

### {FASE} de cada uma

- **Fase 0:**
  `Stage 0 - the gravedigger. A thin young man about 20 years old. Patched brown wool hood with his face visible (dark hair, tired eyes, ash smudge on the cheek), rough linen tunic with rolled sleeves, leather belt with a small pouch, work trousers, feet wrapped in cloth strips over worn boots, short ash-stained burlap cloak. No armor, no metal at all.`
- **Fase 1:**
  `Stage 1 - same gravedigger as stage 0 (same hood, face, tunic and burlap cloak), but from the thighs down he now wears dark, almost black iron greaves, knee guards and iron boots with bronze trim. The metal looks like it grew out of hardened ash, with thin glowing orange cracks.`
- **Fase 2:**
  `Stage 2 - same as stage 1, plus a dark iron breastplate with a small bronze bell emblem of the city guard, iron pauldrons, iron arm plates and gauntlets, all with thin glowing orange cracks. He still wears the brown hood with his face visible and the burlap cloak.`
- **Fase 3:**
  `Stage 3 - same as stage 2, but the hood is replaced by a closed dark iron helmet with a narrow visor slit that glows orange like an ember. He still wears the short burlap cloak.`
- **Fase 4:**
  `Stage 4 - the full black knight: same armor as stage 3, and the burlap cloak becomes a long, deep dark-red tattered cape. (Match the attached reference image of the final knight.)`

### {QUADROS}

- **Imagem A:**
  `1 idle, 2 idle breathing (shoulders slightly lower), 3-6 running cycle (4 frames), 7 jumping up with knees bent, 8 falling with legs stretched down.`
- **Imagem B:**
  `1 attack wind-up: both hands raised above the head pulling back, 2 attack: hands coming down in front at head height, 3 attack: arms stretched forward at chest height, 4 attack follow-through: hands low, body leaning forward, 5 hurt: body thrown backward, 6 crouching low: knees fully bent, head down (much shorter than standing), 7 dead: lying on his side on the ground, 8 empty cell.`

## Dicas para sair bonito e não "qualquer um"

1. **Comece pela fase 4**, mandando junto o `referencia-cavaleiro-final.png` desta pasta: "redraw this character in higher detail, same pose". Assim você fixa o estilo.
2. Depois faça a **fase 0** e, nas fases seguintes, mande sempre a imagem da fase anterior junto: *"Same character as the attached image, now with …"*. É isso que mantém o mesmo rosto, o mesmo corpo e as mesmas proporções.
3. Peça uma fase de cada vez e confira: o fundo é magenta chapado? Ele olha para a direita? Está do mesmo tamanho em todos os quadros? As mãos estão vazias?
4. Se vier com chão, sombra ou cenário, peça de novo repetindo: *"solid flat magenta #FF00FF background only, no floor, no shadow"*.
5. Se vier segurando uma arma, peça: *"empty hands, no weapon, hands closed as if gripping a handle"*.

Quando subir, eu recorto, reduzo para o tamanho do jogo, alinho os pés e troco a pintura automática pelos desenhos de cada fase.
