# Cinzas do Olimpo: contexto para continuar o projeto

Documento de passagem: o que o jogo é hoje, como o código está organizado, como testar e publicar, e o que ainda dá para fazer.
Para retomar com um assistente de IA, cole a seção **"Prompt para retomar"** (no fim) junto com este arquivo.

---

## 1. O jogo hoje

Metroidvania 2D em pixel art, 100% no navegador, num único HTML. Resolução lógica 320×180, blocos de 16 px e mundo de **340 × 100 blocos**.

| Item | Quantidade |
|---|---|
| Áreas com nome | 36 |
| Chefes | 17 (8 obrigatórios + 9 opcionais) |
| Armas corpo a corpo | 4: Espada, Lança, Foice, Martelo |
| Armas de tiro | Adagas do Coveiro (Ruínas, plataforma em x15 y18; 5 adagas que voltam sozinhas) e Arco (flecha normal e carregada; flechas de fogo depois). Com o arco, as adagas saem quando as flechas acabam |
| Níveis | 1 a 30. Inimigos e chefes dão experiência (`gainXp`, `xpNeed`, `BOSS_XP`); cada nível dá +4% de dano e a cada 4 níveis +1 de vida máxima |
| Dificuldade dos inimigos comuns | +35% de vida (`FOE_HP`), recuperação mais curta entre golpes, menos orbes de cura e 12% de chance de nascer **furioso** (`ELITE_P`: aura vermelha, +80% de vida, tira 2 de vida, dobro de experiência). Chefes não mudaram |
| Técnicas de espada | 4 (pergaminho + cinzas, com o Damião) |
| Amuletos | 14 (espaços 3 → 5) |
| Baús | 30 · olhos de bronze: 4 |
| Bilhetes "Ecos" (mistério) | 12 |
| Finais | 3: comum, do sacerdote e verdadeiro |
| Tempo estimado | história principal 3–4h30 · 100% 9–11h |

### História (resumo com spoilers)

- **Premissa:** há dez anos a noite se repete em Olimpo. Teo, o coveiro, acorda toda noite na cinza.
- **Revelações:**
  - Teo morreu salvando Mira nas catacumbas.
  - O pai dele, o capitão Andros, pediu à montanha "mais uma noite" tocando o sino.
- **Mistério novo:** o Sumo-Sacerdote **Kalas** ensinou Andros a pedir; o culto alimenta a montanha com os mortos. Os **Ecos** são bilhetes que o próprio Teo escreveu em noites esquecidas.
- **Final verdadeiro:** derrotar Kalas e juntar os 12 Ecos. Teo escreve o próprio nome no livro da Mira e a noite não volta.

### Ordem principal

1. Ruínas
2. Catacumbas (botas de pulo duplo)
3. Corcel da Festa
4. Fundição (investida e manoplas)
5. Chaminé
6. Ilía, a Escultora: abre o Rio e o leste
7. Em qualquer ordem: os três cães, o Guardião das Horas e Lúcio. São as **5 brasas** da porta do sino.
8. Andros, o Sineiro
9. Coração da Montanha (final)

### Opcionais

| Onde | O que tem |
|---|---|
| Pântano (chão rachado nas catacumbas) | Besta do Pântano |
| Jardim de Pedra (chão rachado) | Ninho da Tecelã |
| Porto e Mina (depois de Lúcio) | Helena, a viúva do farol; o Colosso de Bronze |
| Submundo, todo abaixo de y=55 | Brasa Viva, Grom, Estátua Ardente, Gárgula Rainha, Redemoinho, Kalas |

**Mortes e golpes:** cada inimigo se desfaz no material dele (`GORE`: sangue, gosma, osso, pedra, névoa ou brasa). As gotas caem e viram manchas no chão (`bleed`, `goreDeath`, `stains`). Cada golpe mostra o dano (x10) e soma no contador "N HITS" (`combo`, `countHit`, `drawCombo`), que zera depois de ~2,5 s sem acertar ou ao apanhar.

**Viagem:** o menu do altar mostra um mapa do que já foi visto; passar o mouse ou tocar num altar marca o destino (`travelMenu(sel)`, `drawTravelMap`) e o botão "Viajar para…" confirma.

**Pistas do Submundo:** fumaça nos chãos rachados, falas dos NPCs, boatos nos altares (`RUMORS` / `altarRumor`, até descer abaixo de y=56, que marca `save.flags.under`) e chãos rachados piscando no mapa.

**Entradas do Submundo:**
- chão rachado do pântano (x9–11, y54);
- poço do Rio de Cinza (x112–114, y38);
- chão rachado da mina (x330–332, y54).

---

## 2. Arquivos

| Caminho | O que é |
|---|---|
| `src/cinzas.html` | **a fonte**: HTML + CSS + JS + sprites em base64, cerca de 1,2 MB |
| `index.html`, `manifest.json`, `sw.js`, `icon-*.png` | build PWA (gerado; é o que o GitHub Pages serve) |
| `tools/build_app.ps1` | `-Src src\cinzas.html -Out .` gera o PWA (troque a versão do cache `cinzas-vN` a cada release) |
| `tools/gem_cut.ps1` | recorta folha de sprites (fundo magenta/roxo, JPEG ok): `-In folha.jpg -Out pasta -Rows N [-Cols N]` |
| `tools/gem_build.ps1` | reduz os recortes ao tamanho do jogo, alinha pelos pés e gera `gem_sprites.js` (bloco `Object.assign(SPRITE_DATA,...)`) |
| `tools/swapfuncs.ps1` | troca funções inteiras no HTML a partir de um arquivo com blocos `//@@nomeDaFuncao` |
| `tests/` | testes headless em Node (`run_tests.ps1 <suite>.js`) |
| `art/` | folhas originais do Gemini e o `GUIA-SPRITES.md` com o prompt-base para gerar novos sprites |
| `desktop/` | Electron: `npm install` e `npm run build` geram `dist/Cinzas do Olimpo x.y.z.exe` (portátil, cerca de 96 MB) |

### Mapa do código (`src/cinzas.html`, na ordem em que aparece)

1. **CSS e HTML:** palco 16:9, pad de toque, painéis (`.techs`, `.tech`), tela cheia e layout de PC.
2. **Sprites:** `SPRITE_DATA` / `SPRITE_CELL` / `SPRITE_ANCHOR` (Ansimuz e SpriteCook), seguidos do bloco do Gemini (`g*`: gDamiao, gGuard, gClock, gLucio, gHeart, gWeaver, gTitan, gGarg, gCult, gShadow, gZomb, gBrute, gChest, gFire, gMace, gSpirit, gTornado, gStatue, gColumn), mais `PORTRAITS` (12 rostos 48×48) e `LOGO`.
3. **Dados:**
   - itens e progressão: `ITEM_INFO`, `CHARMS`, `CHESTS`, `FORGE`, `TECHS`;
   - mundo: `ENEMY_SPAWNS`, `ITEM_SPAWNS`, `STATUES` (altares), `BRAZIERS`, `CRYSTALS`, `ZONES` (escuridão e filtro de música por área);
   - pessoas e história: `NPCS`, `BARKS`, `LINES`, `TALK_DONE`, `INTRO`, `MEMS`, `PRE_HEART`, `ENDING`;
   - combate: `ATK` + `WEAPONS` (tabela de golpes por arma) e `CHG`.
4. **Mundo:** `buildWorld()` desenha o mapa com retângulos `f(x,y,w,h,tile)`.
   - Tiles: `#` rocha, `.` ar, `=` plataforma, `^` espinho, `L` lava, `W` água de cinza, `C` chão/parede rachada, `S` selo, `G` portão de bronze.
   - Também ficam aqui: `zoneAt()`, `palKey()`, as portas `setDoorN()`, `bellOpen()` e `emberCount()`.
5. **Estado:** `freshSave()` (formato do save), `reset()`, `persist()` / `loadSaved()` / `continueFrom()` (localStorage `cinzas-save2`), `newNightPlus()`.
6. **Laço:** `step()` (lógica a 60 Hz) e `render()`.
   - O chefe ativo depende da área (linha `boss=...` em `step`).
   - `updatePlayer()` cuida de movimento, ataques, técnicas, arco, planar, frascos e altar.
7. **Combate:**
   - `hitEnemy` / `hitBoss` aplicam `dmgMult()`, escudos e `heavyHit()`;
   - IAs: `hopAI`, `guardAI`, `beastAI`, `zombAI`, `bruteAI`, `flyAI`;
   - chefes: `updXxx`, `drawXxx`, `drawSubBoss`; `bossDeath()` dá recompensas e abre portas;
   - aviso rápido: `bossWarnOn` / `drawBossWarn`.
8. **Sistemas:** menus do altar (`altarMenu`, `forgeMenu`, `charmMenu`, `travelMenu`), loja (`shopMenu`), provas (`TRIALS`), armadilhas (`TRAPS`), olhos de bronze (`TARGETS`), pistas (`CRACKS`), Ecos (`ECOS`, `readEco`), observador (`WATCHERS`) e finais (`endingLines`, `trueEnd`).
9. **Gráficos:**
   - fundos: `drawBg`, `drawWorldBg`, `drawEastBg`, `drawPortBg`, `drawSubBg`;
   - mapa e luz: `drawTiles` (profundidade e `surfaceProp`), `drawLighting` (máscara de escuridão em canvas separado), `drawAtmosphere` (névoa e tom por região);
   - resolução: `fitRes()` desenha na resolução real da tela (`RS`), com o botão "Gráficos nítidos/leves".
10. **Som:** tudo sintetizado com Web Audio (`SFX`, `TRACKS`, `bossTrack`).

### Como adicionar coisas

| Para | Faça |
|---|---|
| Inimigo | crie um tipo em `mkEnemy` (tamanho e vida), a IA em `updateEnemies`, o desenho em `drawNewEnemy` e um spawn em `ENEMY_SPAWNS` |
| Chefe | `mkX()`, `updX(b)` (máquina de estados; estados que terminam em `W` são preparação e ganham o aviso automático), desenho, linha em `reset()`, `boss=` em `step`, chaves em `hitBoss` / `updateBoss` / `drawBosses` / `bossDeath`, e `bossTrack` para a música |
| Área | carve em `buildWorld`, nome em `zoneAt` e `ZONES`, paleta em `palKey` / `PALS`, fundo em `drawSubBg` (ou similar), altar em `STATUES` |
| Sprite novo | gere no Gemini com o prompt de `art/GUIA-SPRITES.md`, rode `gem_cut` + `gem_build` e cole o bloco no lugar do bloco do Gemini |

---

## 3. Testes

Os testes rodam o jogo inteiro no Node, sem navegador (o canvas é falso), e simulam teclas.

| Suíte | Cobre |
|---|---|
| `harness_big` | mapa base, Torre, Quartel, Jardim, Tecelã, técnicas, missão do Lino, final |
| `harness_v3` | Porto, Mina, forja, frascos, amuletos, viagem, provas, loja, Helena, Colosso, Nova Noite+, alta resolução |
| `harness_gem` | inimigos do Gemini e armadilhas |
| `harness_ward` | bênção e romãs |
| `harness_clock` | romãs do Guardião |
| `harness_sub` | Submundo inteiro: caminhos, arco, olhos de bronze, planar, 6 chefes, NPCs, finais |
| `harness_hints` | pistas para achar o Submundo |
| `harness_weapons` | armas novas e aviso dos chefes |
| `harness_levels` | adagas, níveis, inimigos mais fortes e furiosos, boatos do Submundo, sangue, combo e mapa da viagem |

**Dica:** ver o jogo de verdade sem abrir janela. Rode o Edge headless com perfil separado:

```
msedge --headless=new --user-data-dir=<pasta> --window-size=1280,800 --virtual-time-budget=5000 --screenshot=x.png file:///...
```

O PNG aparece alguns segundos depois de o processo inicial sair. Injete um `<script>` no `index.html` para levar o jogador direto à cena.

---

## 4. Publicar

- **GitHub:** repositório `viniciuscapeto/cinzas-do-olimpo` (público). Depois de cada mudança:
  1. `powershell -File tools\build_app.ps1 -Src src\cinzas.html -Out .`
  2. `git add -A`
  3. `git commit -m "..."`
  4. `git push`
- **GitHub Pages:** Settings → Pages → *Deploy from a branch* → `main` / `(root)`. Link: `https://viniciuscapeto.github.io/cinzas-do-olimpo/`.
- **App instalável (PWA):** já funciona pelo link (Instalar app).
- **Windows:** `cd desktop`, `npm install` e `npm run build`. Suba o `.exe` em *Releases* (arrastar e soltar no site).
  - Na rede da empresa, antes do build: `$env:ELECTRON_GET_USE_PROXY='true'` e `$env:GLOBAL_AGENT_HTTPS_PROXY=$env:HTTPS_PROXY`.
- **Android (APK):**
  1. Com o link do Pages no ar, abra https://www.pwabuilder.com e cole o link.
  2. *Package for stores* → Android → *Generate*.
  3. O zip traz um `.apk` para instalar direto e um `.aab` para a Play Store.

---

## 5. O que ainda dá para fazer

### Ajustes que dependem de jogar
- [ ] Jogar do começo ao fim e medir tempo e dificuldade de cada chefe. Vida e cadência ficam em `mkX()` e nos `b.t={...}` de cada `updX`.
- [ ] Ver se algum lugar trava a progressão (os testes cobrem os caminhos principais, mas não todos os pulos possíveis).
- [ ] Ajustar a economia (preços da forja, das técnicas e da Zoe) conforme o ritmo real.

### Arte
- [ ] Animação de ataque própria para cada arma. Hoje o cavaleiro usa a animação da espada e só a ponta muda (lança, foice, martelo).
- [ ] Sprites próprios para Cássia, Heitor, Zoe e Iago, que ainda são recolors (`NPC_VAR`).
- [ ] Animações de mais quadros para os chefes do Gemini (muitos têm 1–4 quadros).
- [ ] Tileset desenhado no lugar dos blocos procedurais.

### Jogo
- [ ] Mais armas de tiro: besta, bombas de cinza, lança de arremesso (as adagas já existem).
- [ ] Ajustar a curva de níveis (`xpNeed`) e a vida dos inimigos (`FOE_HP`) depois de jogar.
- [ ] Inventário ou diário com os Ecos lidos e as anotações do mapa.
- [ ] Mapa com ícones de altares, chefes vencidos, baús abertos e pistas.
- [ ] Opções de dificuldade (dano recebido, janela de aviso dos chefes).
- [ ] Controle por gamepad (Gamepad API).
- [ ] Remapear teclas.
- [ ] Conquistas e tela de estatísticas.
- [ ] Modo chefe (enfrentar de novo os chefes vencidos).

### Técnico
- [ ] Separar o arquivo único em módulos (`src/*.js`) com um build que junta tudo.
- [ ] Testes rodando no GitHub Actions a cada push.
- [ ] Release automática do `.exe` pelo Actions.

---

## 6. Prompt para retomar

```
Estou continuando o jogo "Cinzas do Olimpo" (metroidvania em um único HTML).
Leia docs/CONTEXTO.md e README.md do repositório viniciuscapeto/cinzas-do-olimpo.
A fonte é src/cinzas.html; o build PWA sai com tools/build_app.ps1; os testes ficam em tests/.
Depois de cada mudança: rode as suítes de teste, gere o build e faça commit.
Responda sempre em português do Brasil.
Hoje eu quero: <descreva aqui>
```
