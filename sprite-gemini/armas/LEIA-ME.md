# Armas do Gemini

Suba aqui as imagens das armas, uma por arquivo (PNG ou JPG, fundo magenta #FF00FF):

| Arquivo | Arma |
|---|---|
| `espada.png` | Espada de Teo |
| `lanca.png` | Lança da Guarda |
| `foice.png` | Foice da Ceifadora |
| `martelo.png` | Martelo do Bronte |
| `pa.png` | Pá de Dimas |
| `arco.png` | Arco da Caçadora |

Armas de perto deitadas, com a ponta para a direita. O arco fica em pé, com a curva para a direita e sem corda. Os prompts estão em [`art/GUIA-ARMAS.md`](../../art/GUIA-ARMAS.md).

Se o Gemini gerou várias armas numa folha só, pode subir a folha inteira também; eu recorto.

Depois de subir: `git pull` e `tools\weapon_build.ps1` (lê esta pasta) e `tools\build_app.ps1 -Src src\cinzas.html -Out .`