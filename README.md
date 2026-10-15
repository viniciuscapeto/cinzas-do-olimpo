# Cinzas do Olimpo

Metroidvania 2D em pixel art, feito para rodar direto no navegador: **36 áreas, 17 chefes, 4 armas de corpo a corpo e um arco, forja, amuletos e um mistério com três finais.**

> Há dez anos o sol não nasce na cidade de Olimpo. Toda noite o sino toca três vezes e os mortos se levantam da cinza.
> Você é Teo, o último coveiro, e esta noite vai descobrir quem toca o sino. No bolso, um bilhete com a sua própria letra.

## Jogar

- **No navegador:** https://viniciuscapeto.github.io/cinzas-do-olimpo/
- **Como app (PC ou celular):** abra o link acima e use **Instalar app** (Chrome/Edge: ícone na barra de endereço; Android: menu ⋮ → *Instalar app*; iPhone: Compartilhar → *Adicionar à Tela de Início*). Funciona offline e abre em tela cheia.
- **Windows (.exe):** baixe o arquivo em [Releases](https://github.com/viniciuscapeto/cinzas-do-olimpo/releases), quando houver um publicado, ou gere o seu (veja abaixo).
- **Arquivo único:** `index.html` roda sozinho, é só abrir.

## Controles

| Ação | Teclado | Celular |
|---|---|---|
| Mover | ← → ou A D | ◀ ▶ |
| Pular (segure caindo para planar) | Espaço, ↑, W ou Z | Pular |
| Espada (3 golpes = giro; segure = golpe carregado) | J ou X | Atacar |
| Arco (segure = flecha carregada) | I ou V | Arco |
| Trocar de arma (Espada, Lança, Foice, Martelo) | T | Arma |
| Investida | K, C ou Shift | Invest. |
| Erupção (barra cheia) / Onda (1/3 da barra) | Q | Poder |
| Frasco de cura | R ou H | Cura |
| Falar / menu do altar (forja, amuletos, viagem) | ↓ ou E | ▼ |
| No ar: golpe de queda | ↓ + atacar | ▼ + Atacar |
| Mapa · Tela cheia | M · F | Mapa · Tela cheia |

O jogo salva sozinho nos altares.

Para continuar o desenvolvimento, veja **[docs/CONTEXTO.md](docs/CONTEXTO.md)**.

## Estrutura

| Pasta / arquivo | O que é |
|---|---|
| `index.html`, `manifest.json`, `sw.js`, `icon-*.png` | o jogo pronto, em versão PWA (é o que o GitHub Pages publica) |
| `src/cinzas.html` | fonte do jogo, um arquivo só com HTML, CSS, JS e sprites embutidos |
| `tools/build_app.ps1` | gera o `index.html` (PWA) a partir de `src/cinzas.html` |
| `tools/gem_cut.ps1`, `tools/gem_build.ps1` | recortam folhas de sprites (fundo magenta) e geram as folhas do jogo |
| `art/` | folhas originais desenhadas no Gemini e o guia para criar novos sprites |
| `tests/` | testes automáticos que rodam o jogo no Node, sem navegador |
| `desktop/` | projeto Electron que gera o `.exe` do Windows |

### Gerar o PWA a partir da fonte

```powershell
powershell -File tools\build_app.ps1 -Src src\cinzas.html -Out .
```

### Rodar os testes

Precisa do Node 18 ou mais novo.

```powershell
powershell -File tests\run_tests.ps1 harness_sub.js
```

As suítes são `harness_big`, `harness_v3`, `harness_gem`, `harness_ward`, `harness_clock`, `harness_sub` e `harness_hints`.

### Gerar o executável do Windows

```powershell
cd desktop
npm install
npm run build      # cria dist\Cinzas do Olimpo <versão>.exe (portátil, não precisa instalar)
```

`npm start` abre o jogo numa janela, sem gerar o `.exe`. F11 alterna a tela cheia.

## Créditos

- Ideia, direção e arte nova (folhas geradas no Gemini e no SpriteCook): **Vinicius Capeto**
- Parte dos sprites originais: **Ansimuz**, Gothicvania (domínio público, CC0)
- Código, sons sintetizados e música: feitos para o jogo (Web Audio, sem arquivos de áudio)
