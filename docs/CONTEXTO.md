# Cinzas do Olimpo: contexto para continuar o projeto

Documento de passagem: o que o jogo é hoje, como o código está organizado, como testar e publicar, e o que ainda dá para fazer.
Para retomar com um assistente de IA, cole a seção **"Prompt para retomar"** (no fim) junto com este arquivo.

---

## 1. O jogo hoje

Metroidvania 2D em pixel art, 100% no navegador, num único HTML. Resolução lógica 320×180, blocos de 16 px e mundo de **460 × 100 blocos** (as colunas 339 a 459 são o Ato II).

| Item | Quantidade |
|---|---|
| Áreas com nome | 50 |
| Chefes | 25 (8 obrigatórios + 11 opcionais + 4 do Ato II + 2 do Ato III) |
| Armas corpo a corpo | 5: Espada, Lança, Foice, Martelo, Pá de Dimas |
| Armas de tiro | Adagas do Coveiro (Ruínas, plataforma em x15 y18; até 5) e Arco (flecha normal e carregada; flechas de fogo depois). Com o arco, as adagas saem quando as flechas acabam. Munição NÃO volta com o tempo nem no altar: `meleeCharge()` dá 1 adaga a cada `KNIFE_HITS`=4 golpes de perto que acertam e 1 flecha a cada `ARROW_HITS`=7 (Aljava Encantada: 4; combo 10+ conta em dobro). O altar só garante `ALTAR_MIN_ARROWS`=3 flechas (olhos de bronze). Munição fica em `save.ammo` |
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

### Áreas opcionais

| Área | Entrada | O que tem |
|---|---|---|
| Adega do Templo (x66-105, y18-30) | chão rachado no Templo da Colheita (x70-72, golpe de queda) | altar, baús (Moeda de Caronte) |
| Ossuário Esquecido e Covil do Glutão (x74-106, y36-50) | poço no fundo da adega | **O Glutão do Ossuário** (come os zumbis que chama para se curar): +1 de vida, +60 cinzas, Dente do Vampiro |
| Sótão do Relógio e Engrenagem Mestra (x210-251, y1-9) | parede rachada na Sala das Horas (investida) | baú (Trevo de Cinza), **O Autômato do Sótão**: +1 espaço de amuleto, Sandálias de Hermes |

### Sistemas de longo prazo

- **Itens raros** (`RARES`, são amuletos): Dente do Vampiro, Coroa de Espinhos, Moeda de Caronte, Sandálias de Hermes, Lágrima de Eurídice, Trevo de Cinza, Sino Rachado e Coroa de Cinza. Caem dos inimigos (6% dos furiosos, 0,6% dos comuns), além de vir de baús, dos chefes opcionais, da arena (onda 10) e da primeira vez em cada Noite+.
- **Conquistas** (`ACH`, 22): guardadas no navegador fora do save (`cinzas-ach`), valem para todos os jogos. Estatísticas em `save.stats`.
- **Modo chefe** (altar → Ecos dos chefes): revanche contra qualquer chefe vencido, 25% mais forte, com recorde de tempo (`REMATCH`, `startRematch`, `endRematch`; a vitória volta ao altar com `reset()`).
- **Arena sem fim**: 4ª prova do Brás (`TRIALS[3]`, `endlessWave`), com recorde em `save.records.arena`.
- **Noite+**: cada volta tem nome e uma regra nova (`NG_NAMES`, `NG_RULES`): 2 = mais furiosos, 3 = golpes tiram 1 a mais, 4 = chefes 25% mais rápidos, 5 = orbes raras. A primeira vez em cada volta dá 5 bronze e um item raro.
- **Save**: salva sozinho a cada 30 s e ao fechar a aba (fora de cenas e mortes de chefe), exporta/importa arquivo, e guarda uma cópia como **save do criador** (`cinzas-slot-criador`) na primeira vez que esta versão abre.
- **Atenção à ordem**: `STATUES` e `TRIALS` são guardados no save pelo número. Coisas novas entram sempre no fim dessas listas.

### Ato II · O Sonho da Montanha

Depois que Kalas cai, abre-se uma fenda no trono dele (`RIFTS`). Ela leva ao sonho da montanha, onde está guardado tudo o que ela comeu, inclusive o que Teo esquece toda manhã. A região tem quatro faixas, de baixo para cima, cada uma com uma arena e uma saída no teto que só abre depois do chefe (`DEXIT`, `setDreamExit`):

| Faixa | Áreas | Chefe | Recompensa |
|---|---|---|---|
| A (y86-97) | Margem do Sonho, Casa de Eurídice, Cemitério de Dimas | Dimas, o primeiro coveiro | Pá de Dimas (3º golpe joga torrões) |
| B (y60-83) | Estrada da Caravana, Quarto da Febre | A Febre | amuleto Febre Contida (com 1 de vida, dano dobrado) |
| C (y30-57) | Praça da Festa Sonhada, Espelho do Eco | O Eco de Teo (luta como o jogador) | Passo do Eco (a investida deixa uma explosão) e +1 de vida |
| D (y3-27) | Cume do Sonho, Olho da Montanha | A Montanha que Sonha | final novo, "O nome" |

**Quem era Teo:** filho de Eurídice, cantora do templo, e do capitão Andros. A mãe morreu de febre quando ele tinha nove anos, enquanto o pai escoltava uma caravana mandada por um sacerdote de manto vermelho (Kalas). Ninguém abriu a porta; só o velho coveiro Dimas apareceu e ensinou que quem enterra diz o nome em voz alta. Teo recusou a espada da guarda, e pai e filho passaram anos quase sem conversar. Isso é contado nas 6 **Lembranças de Teo** (`LEMS`, `readLem`; as 6 dão +1 de vida), nas memórias dos chefes (`DREAM_MEMS`), no Teo criança e em Eurídice (NPCs fantasmas) e no final (`DREAM_END`).

Os inimigos do sonho são os comuns em tom violeta, com mais vida e experiência (`e.dream`). Saves antigos são convertidos: o mapa explorado é copiado para a largura nova (`W_OLD`), e quem já venceu o Submundo não recebe mais boatos.

### Ato III · Telma

Depois da Montanha que Sonha (que agora não encerra o jogo), abre-se uma fenda cor-de-rosa no Olho da Montanha (x343, y27). O mundo passou a ter **560 colunas**: x460-499 é a lembrança de Telma (ainda no sonho) e x500-559 é o Convento das Vozes (mundo real, no alto da montanha). Saves antigos de 340 ou 460 colunas são convertidos em `continueFrom`.

| Lugar | O que tem |
|---|---|
| Quarto de Telma (x461-476, y72-83) | Telma criança (`telmakid`), 2 lembranças (`TLMS`: tlm1, tlm2), altar |
| Jardim de Pano (arena x478-498) | **Sr. Bottoms, o coelho de pano** (`mkBotao`/`updBotao`, `B24`, `boss24Dead`): pulos com pétalas, botões que quicam, roseiras que brotam em fila, espiral de pétalas; rasgado (2ª fase): algodão que persegue e canção de ninar (anel de pétalas com uma brecha). Dá +1 de vida e o amuleto Sr. Bottoms |
| Escadaria e Claustro (x501-536) | Telma presa (NPC `telma`; falar com ela chama `rescueTelma`), altar, cultistas e guardas |
| Nave do Coro (arena x538-557) | **Malco, o Maestro das Vozes** (`mkMaestro`/`updMaestro`, `B25`, `boss25Dead`): notas ondulando, pauta (linhas altas = fique no chão, baixas = suba), crescendo em anéis, sinos do teto, coro; 2ª fase: escudo de som, réquiem (mira + coluna) e silêncio (escuro, ele some e reaparece). Final `FINAL_END` e `victory()` |

**Telma junto** (`TF`, `updTelma`, `drawTelma`): no convento, depois de solta, ela segue o Teo (pula, e reaparece do lado se ficar presa). Na luta do Maestro canta a cada `TELMA_SONG` quadros: apaga as notas por perto e, se o Maestro estiver a menos de `TELMA_R`, quebra o escudo e o deixa tonto. Também joga flores que seguem o chefe.

**Ataques com sprite:** projéteis aceitam `img` (sprite) e `upd` (comportamento: `curl`, `bounceUpd`, `homeUpd`, `wobble`); zonas novas `vine` e `sound` (`drawZoneT3`); zona `rain` aceita `drop:'bell'`.

**Origem dos chefes:** `BOSS_LORE` (todos os 25) em Altar → Quem eram os chefes (`loreMenu`), e `BOSS_INTRO` (o que o Teo pensa quando um chefe do sonho ou do Ato III acorda pela primeira vez).

**Modo criador:** na tela de viagem aparecem botões para ir direto às áreas novas (`CREATOR_SPOTS`, `creatorTp`). Recarregue o save do criador para ter o mapa novo inteiro aberto.

### Ataques de assinatura

Cada um dos 23 chefes antigos ganhou dois golpes só dele (`SIG`), com sprite e padrão próprios: a cada dois ataques (`SIG_EVERY`) ele usa um deles, com o aviso vermelho e o nome na tela (`sigName`). Exemplos: Corcel = Fogos da Festa e Ferraduras; Guardião = Ponteiros (os ponteiros giram em volta dele) e Ampulheta (areia que prende); Helena = Facho do Farol (atravesse com a investida); Coração = Pulsação (onda baixa: pule; alta: abaixe); Kalas = Círculos da Reza e Velas do Culto; A Febre = Delírio (metade das chamas é falsa); A Montanha = Pálpebras.

Como funciona: `bossStep(b,fn)` substitui a chamada da IA em `updateBoss`; os estados `sigW` (aviso) e `sig` (golpe) são tratados fora da IA de cada chefe. `arenaOf(b)` mede a arena pelo mapa (chão, paredes, teto). Peças: `SH` (projétil com `img`, `upd`, `dw`, `slow`, `fake`, `dfn`), `FX` (zona `fx` com `warn`, `live`, `hurt`, `hurtIf`, `slow`, `draw`, `on`, `upd`) e `DROPS` (o que cai nas zonas de chuva). Sprites `s_*` gerados no `relic_build.js`. Para dar um golpe novo a um chefe, acrescente em `SIG[tipo]`.

**Armas na mão:** punho em pixel art (`h_fist0/1`, luva ou manopla) em `drawFist`; armas grandes com a segunda mão no cabo (`TWO_HAND`). Arco: `drawBowHeld` usa o quadro de braço esticado do ataque, arco novo `w_bow2` em pé na mão, braço de trás puxando a corda, corda vibrando depois do tiro.

**Telma** (`xTelma`) é gerada a partir das folhas do Teo de capuz (`t0Idle`, `t0Run`) no `relic_build.js` (`telmaFromTeo`): capa e capuz rosa-poeira, trança, cachecol. O coelho se chama **Sr. Bottoms**.

**Mortes por tipo** (`DEATH`, `mkCorpse`): gárgula vira pedra e se desfaz (no ar, cai e se espatifa); soldado, cultista, bruto e cão explodem em sangue (`explodeGore`); mago, caveira e carniçal explodem em fogo e deixam marca queimada (`explodeFire`); zumbi desmonta em três pedaços e esqueleto desaba em ossos (`pieces`, desenhados com recorte de `drawEnemy`); fantasmas sobem e somem; criatura do pântano e aranha estouram em gosma. O sangue mancha chão e paredes, e quando Teo apanha a tela leva respingos que escorrem (`splats`).

**Visual:** tom de cor escuro (`drawGrade`, mais avermelhado no Submundo), granulação de filme nos gráficos nítidos e vinheta mais forte. Investida com onda e riscos de velocidade, poeira na aterrissagem (`landFx`), faíscas e marcas ao deslizar na parede.

**História:** cenas em estilo cinema (faixas pretas, câmera passeando, texto letra por letra, `finishType`) e cartões de capítulo (`CHAPTERS`, numerados na ordem em que aparecem, em `save.flags.chaps`). Objetivo atual no canto da tela e no mapa (`objective`), e pensamentos do Teo na primeira visita a cada área (`THOUGHTS`).

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
| `tools/weapon_build.ps1` | armas do Gemini: lê `Documents\Cinzas do Olimpo\sprite-gemini\armas\{espada,lanca,foice,martelo,pa,arco}.png/jpg` (fundo magenta), reduz e grava `w_<arma>` entre `// ARMAS-INICIO` e `// ARMAS-FIM` no `src/cinzas.html`. Arma que não tiver arquivo continua desenhada em pixels |
| `tools/item_build.ps1` | ícones e itens do Gemini: recorta `sprite-gemini/armas/itens.jfif` (folha 4x2) e `investida.jfif` e grava `i_*` (adaga, poção, botas, manopla, escudo, cinzas, moedas, investida) entre `// ITENS-INICIO` e `// ITENS-FIM`. Usados no HUD (`icon`) e nos itens do mapa (`itemIcon`) |
| `tools/teo_build.ps1` | evolução do Teo: lê as folhas 4x2 do Gemini em `sprite-gemini/teo` (mapa de qual imagem/quadro vira cada pose está no topo do script; quadros que faltam usam substitutos da própria fase), reduz a 31 px de altura com 2x detalhe, alinha os pés e acha a mão; grava `t<fase><Idle/Run/Atk/Jump/Crouch/Dead>`, `TEO_DETAIL` e `TEO_HAND` entre `// TEO-INICIO` e `// TEO-FIM`. O herói usa a folha da fase de `heroStage()` e a arma é desenhada na mão |
| `tools/relic_build.js` | sprites desenhados em código (Node): os 25 amuletos (`a_<id>`, 24×24, aparecem no menu de amuletos, na loja da Zoe e na mensagem do baú via `charmImg`), o bilhete dos ecos (`r_eco`, flutuando em `drawEco` e no menu Ecos) e o altar de cura (`r_altar` / `r_altarLit`, 40×56 desenhado com 20×28 em `drawStatues`). Grava entre `// AMULETOS-INICIO` e `// AMULETOS-FIM`; `node tools/relic_build.js folha.png` também gera uma folha ampliada para conferir. Amuleto novo: crie `D.<id>` no script |
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
| Arma na mão | o herói usa as folhas `k*` (com a espada desenhada) só para a espada; com outra arma ou com o arco usa `u*` (mesmo cavaleiro sem a espada) e `drawHeldMelee` / `drawWeapon` desenham a arma na mão (`HERO_HAND` = mão por quadro, `WEAPON_GEOM` = comprimento, pegada e ângulo de descanso). `heldWeapon()` diz o que está na mão (arco enquanto mira, logo depois de atirar e ao ganhar) |
| Efeito e história de arma | `WEAPON_FX` (`ember` espada, `fire` martelo, `bolt` com cor para lança/foice/pá) usado por `weaponFx()` no golpe, no acerto e na troca; `bolt()` / `drawBolt` desenham o raio. `WEAPON_LORE` conta por que cada arma ficou assim (aparece ao pegar e em Altar → Armas, `weaponsMenu`). Troca animada: `startSwap` / `SWAP_T` usa os quadros kAtk 0→1→3 (braço às costas e puxando a nova) |
| Braço no ataque e escudo | no ataque `heroPose` escolhe o quadro kAtk pela direção da arma (`blades()[0].ang`) e a arma sai da mão desenhada nesse quadro (`handAt`). Bênção de Cinza: `drawWard` desenha a bolha azul; `wardBurst` estoura (cacos, raios, onda) e empurra inimigos a até 44 px. Lança do Gemini afinada por `Sharpen` no `weapon_build.ps1` |
| Agachar e frestas | segurar baixo no chão agacha (`P.crouch`, altura 14, `CROUCH_DY`=8; `lowCeil()` impede levantar sob teto baixo). Bloco `u` = viga baixa (sólida, só a faixa de cima é desenhada). `CRAWLS` lista as 6 frestas (túnel + salinha com recompensa: Joelheira do Coveiro, bronze, cinzas, vida `hp4`); `crawlHints` solta poeira e dá a dica. Folhas `uCrouch`/`kCrouch` geradas do quadro parado |
| História guiada | `storyStep()` dá a frase do Teo e o ponto do mapa de cada etapa (sem mudar `objective()`, que os testes conferem). `drawGuide` = brasa-guia na borda da tela; quadro PRÓXIMO PASSO; marca no mapa |
| Sangue e vida baixa | inimigos e chefes sangram mais (`bleedT` continua sangrando, `bloodPool` na morte; só `blood`/`ichor`). `drawLowHp` pulsa a borda vermelha com 25% de vida ou menos |
| Efeito constante das armas | `weaponAura` (espada brasa, martelo chamas, foice roxo, pá ouro, lança `spearSpark`); `bowRunes`; flecha do Gemini `w_arrow` em `drawArrowImg`. Foice usa `flip` para a lâmina grande ficar para a frente |
| Chefe acordando do lugar errado | `harness_bosswake` varre o mapa e falha se algum chefe acordar com o Teo fora da sala (o Corcel acordava pelo andar de baixo) |
| Armadura por nível | `ARMOR` (grevas nv3, couraça nv6, elmo nv10, capa de Andros nv14). `heroStages` gera, ao carregar, versões das folhas do herói com as partes ainda sem armadura pintadas de pano (capuz, túnica, calça, manto); `spr` escolhe `s.st[heroStage()]`. Peças separadas pela cor (capa, visor) e pela altura no quadro |
| Brasa-guia e objetivo | a seta só acende depois de `GUIDE_WAIT` (25 s) na mesma tela e apaga ao andar `GUIDE_WALK` px (`guideTick`). Quadro some em `OBJ_T`/`OBJ_STORY_T`; letra pequena com `textS`/`wrapPx`. Ecos no HUD (depois do primeiro), no mapa e no altar |
| Reler os ecos | Altar → Ecos (`ecosMenu`): bilhetes achados com o texto, os outros em branco |
| Especial (Q) de cada arma | `WEAPON_POWER` + `eruption()`: espada = `eruptionFire` (anel de fogo), pá = Cova Aberta, lança = Raio de Lúcio, foice = Ceifa Violeta (devolve vida), martelo = Forja Viva, Pá de Dimas = Nomes dos Mortos. Aparece em Altar → Armas |
| Arma fluida | no golpe a mão desliza entre as 4 poses pela direção da arma (`ATK_POSE_ANG`); na corrida interpola entre quadros; parado respira; cópias da arma apagando (`P.wHist`); a arma fica no centro do punho desenhado no quadro (`TEO_HAND`, calculado pelo `teo_build.ps1`) e `heroHandOver` redesenha a própria mão do Teo por cima do cabo, sem punho extra |
| Caminho da brasa-guia | `findPath` (busca em largura pelas casas livres) e `guideAim`: a seta aponta para onde o caminho sai da tela |
| Segunda fase dos chefes | todos: com `ENRAGE_AT` (50%) de vida o chefe para `ENRAGE_T` quadros (`enrageTick`: treme, fogo se junta, onda de choque), faixa SEGUNDA FASE (`drawEnrageBanner`), aura (`drawEnrage`), tinta `crimson`, luta 1/3 mais rápido (passo extra a cada 3 quadros) e o golpe tira 1 a mais. Chefes com `BOSS_HP` (+30%) de vida. O Coração só acorda com `boss4Dead` (Andros vencido) |
| Puzzles (selos de brasa) | `PUZZLES`: portas dos três cães (braseiros em ordem), do Lúcio (relógio, abre por `time` quadros) e do Kalas (lanternas sobre a lava, de baixo para cima; flecha também acende). `applySeals` põe `S` na porta até `save.puz[id]`; `hitPuzzle` (golpe e tiros), `updatePuzzles`, `drawPuzzles`, pedra com o enigma (baixo, `nearTablet`). A fenda do sonho só abre com Kalas **e** Coração vencidos; a tela de fim do Ato I tem Continuar a noite |
| Testar áreas | modo criador: abra o jogo com `?criador` no endereço (ou clique 5 vezes no logo do título) e use "Modo criador: tudo liberado". `creatorSave()` monta o save; o save normal vai para `cinzas-save-backup` e volta com "Voltar ao meu save" |
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
| `harness_extra` | áreas opcionais, Glutão e Autômato, itens raros, conquistas, save do criador, revanche contra os 23 chefes, arena sem fim e Noite+ |
| `harness_dream` | Ato II: região lacrada, inimigos, fendas, os 4 chefes, saídas, lembranças, objetivo, save antigo, pá e Passo do Eco |
| `harness_fx` | animação de morte, sangue na parede e na tela, poeira, objetivo, pensamentos, capítulos e cenas |
| `harness_story` | abertura com a história de Teo, Mira, inscrição, Corcel, Ilía, rio, três cães, porta do sino com 5 brasas, Andros (2 fases), Coração da Montanha e final |
| `harness_creator` | modo criador escondido, save com tudo liberado (vida, ecos, armas, técnicas, amuletos, forja, chefes, altares, mapa), viagem por todos os altares e volta ao save normal |
| `harness_arms` | munição que só volta batendo de perto, altar com 3 flechas, munição no save, arma na mão ao pegar/trocar, arco na mão, desenho de todas as armas |
| `harness_telma` | Ato III: mapa de 560 colunas, save antigo, fenda rosa, lembranças, Sr. Bottoms, convento, soltar a Telma, Telma seguindo, Maestro com escudo e canto, final, origem dos chefes, amuleto Sr. Bottoms, teleporte do criador |
| `harness_sig` | os 46 golpes de assinatura dos 23 chefes: arena medida, cada golpe solta o que deve e roda sem erro, e cada chefe usa a assinatura no ciclo normal |
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
