# Armas do Teo: como pedir ao Gemini

O herói agora segura na mão a arma que está equipada. Enquanto não houver imagem, o jogo desenha cada arma em pixels. Quando você colocar as imagens na pasta, eu rodo `tools/weapon_build.ps1` e elas entram no lugar do desenho.

## Onde salvar

Pasta: `sprite-gemini/armas` no repositório (dá para subir pelo site do GitHub). Também serve a cópia local em `Documents\Cinzas do Olimpo\sprite-gemini\armas`, rodando o script com `-Dir`.

Salve **uma arma por imagem**, com estes nomes (PNG ou JPG):

| Arquivo | Arma no jogo |
|---|---|
| `espada.png` | Espada de Teo |
| `lanca.png` | Lança da Guarda |
| `foice.png` | Foice da Ceifadora |
| `martelo.png` | Martelo do Bronte |
| `pa.png` | Pá de Dimas |
| `arco.png` | Arco da Caçadora |

Não precisa fazer todas de uma vez. A arma que não tiver arquivo continua desenhada pelo jogo.

## Regras de formato

| Regra | Por quê |
|---|---|
| Fundo **magenta chapado #FF00FF**, sem chão, sombra ou cenário | o script troca o magenta por transparência |
| **Uma arma sozinha**, sem mão e sem personagem segurando | a mão já é a do cavaleiro |
| Armas de perto **deitadas na horizontal, com a ponta para a DIREITA e o cabo à esquerda** | o jogo gira a arma a partir do cabo |
| Arco **em pé**, com a curva para a direita e **sem corda** | o jogo desenha a corda puxando a flecha |
| Vista de lado, reta, sem perspectiva e sem inclinação | se vier na diagonal, peça de novo; se vier em pé com a ponta para cima, o script gira sozinho |
| Nada de magenta ou rosa choque na arma | sumiria junto com o fundo |

Elas ficam pequenas no jogo: de 22 a 38 pixels de comprimento. Por isso o desenho precisa ter silhueta forte e contorno escuro.

## Prompt-base (copie e troque só a última parte)

```
Single pixel art weapon icon for a 2D side-view dark gothic metroidvania called "Cinzas do Olimpo"
(a Greek-inspired city buried in volcanic ash, endless night, ember light).
Style: detailed 16-bit pixel art like Gothicvania / Blasphemous, strong dark outline,
readable silhouette at very small size, muted ash-covered colors with ember orange and bronze accents,
light from the upper left.

FORMAT RULES (very important):
- Square 1024x1024 image, ONE weapon only, centered, large, with empty margin around it.
- Solid flat magenta background #FF00FF everywhere. No floor, no shadow, no gradient, no scenery.
- Pure side view, perfectly straight, no perspective, no tilt.
- No hand, no character, no text, no labels, no border, no UI.
- Do not use magenta or hot pink on the weapon.

WEAPON:
{ARMA}
```

## As armas e o prompt de cada uma

### 1. Espada de Teo (`espada.png`)
- **História:** a espada com que Teo começa o jogo. É a lâmina pesada que já vem desenhada no cavaleiro negro.
- **No jogo:** equilibrada. Três golpes, e o terceiro é um giro. O rastro do golpe é laranja de brasa.
- **{ARMA}:**
  `A heavy dark iron greatsword lying HORIZONTAL, tip pointing RIGHT, hilt on the LEFT. Long straight blade, worn and chipped, dark steel with a thin ember-orange glow along the cutting edge, simple black crossguard, leather-wrapped grip, round iron pommel.`

### 2. Lança da Guarda (`lanca.png`)
- **História:** a lança de Lúcio, o porta-estandarte da guarda, chefe do Pátio do Estandarte. Teo a recebe quando o derrota.
- **No jogo:** alcance bem maior e golpes rápidos em linha reta. O terceiro golpe é uma estocada longa. O rastro é azul-prateado.
- **{ARMA}:**
  `A long city-guard spear lying HORIZONTAL, spearhead pointing RIGHT, butt on the LEFT. Dark ash-wood shaft with bronze rings, leaf-shaped polished steel spearhead with a cold silver-blue sheen, a small torn dark-red cloth ribbon tied below the head.`

### 3. Foice da Ceifadora (`foice.png`)
- **História:** fica escondida no cemitério da cidade. Teo a acha explorando.
- **No jogo:** arcos largos que acertam na frente e em cima, e a barra de Erupção enche mais rápido. O rastro é violeta.
- **{ARMA}:**
  `A large reaper scythe lying HORIZONTAL: long dark wooden shaft from LEFT to RIGHT, the curved blade at the RIGHT end curving UPWARD. Pale steel blade with a faint violet glow on the edge, iron collar binding the blade to the shaft, worn grip wrap near the left end.`

### 4. Martelo do Bronte (`martelo.png`)
- **História:** o martelo de forja de Bronte, o fundidor. Ficou esquecido na Mina de Bronze, e Iago guardou para Teo.
- **No jogo:** lento e pesado. Dá dano dobrado, quebra escudos, e o terceiro golpe racha o chão. O rastro é dourado.
- **{ARMA}:**
  `A heavy blacksmith war hammer lying HORIZONTAL, handle on the LEFT, hammer head on the RIGHT end. Short thick wooden handle wrapped in leather, big blocky dark iron head banded with bronze, slightly glowing ember cracks on the striking face.`

### 5. Pá de Dimas (`pa.png`)
- **História:** a pá do velho Dimas, o coveiro que ensinou o ofício a Teo. Fica pendurada na parede desde que ele morreu. Ela aparece no Ato II, no sonho da montanha.
- **No jogo:** golpes largos e pesados, e o terceiro joga torrões de terra para a frente. O rastro é cor de terra.
- **{ARMA}:**
  `An old gravedigger's spade lying HORIZONTAL, handle on the LEFT, spade blade on the RIGHT end. Long worn wooden handle with a T-grip at the left end, rusty iron spade blade with dried dirt on it, rope wrapped where the handle meets the blade.`

### 6. Arco da Caçadora (`arco.png`)
- **História:** dado por Cássia, a caçadora que vive no Bosque de Raízes, no Submundo. Mais tarde ganha flechas de fogo.
- **No jogo:** toque para atirar e segure para a flecha carregada, que atravessa inimigos. Acerta os olhos de bronze que abrem portões. As flechas só voltam batendo de perto: 1 a cada 7 golpes, ou 4 com a Aljava Encantada.
- **{ARMA}:**
  `A hunter's recurve bow standing VERTICAL, the curved belly facing RIGHT, NO bowstring at all. Dark lacquered wood limbs with bronze tips, leather-wrapped grip in the middle, small ember-orange runes along the limbs.`

## Conferir antes de mandar

1. O fundo é magenta chapado, sem degradê nem sombra?
2. A arma está reta? As armas de perto têm a ponta para a direita, e o arco está em pé e sem corda?
3. A imagem tem só a arma, sem mão e sem texto?

Se vier errado, peça de novo repetindo: *"single weapon only, solid flat magenta #FF00FF background, perfectly horizontal, tip pointing right"*.
