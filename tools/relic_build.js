// Sprites desenhados em código: amuletos (a_<id>), bilhete dos ecos (r_eco) e altar de cura (r_altar, r_altarLit).
// Cada desenho é feito com formas simples por material; depois o script sombreia (luz de cima/esquerda) e contorna.
// Uso:  node tools/relic_build.js            grava o bloco entre // AMULETOS-INICIO e // AMULETOS-FIM no src/cinzas.html
//       node tools/relic_build.js prev.png   também gera uma folha ampliada para conferir
const fs = require('fs'), path = require('path'), zlib = require('zlib');

const RAMP = {
  bronze: ['#3a1e0c', '#7a4620', '#b8783a', '#e4b066', '#fff0c0'],
  gold:   ['#4a2c06', '#946410', '#d8a62a', '#ffdc6a', '#fffbe0'],
  iron:   ['#1e1e26', '#3e404c', '#666a7a', '#9a9eae', '#dfe3ec'],
  silver: ['#33374a', '#5e6478', '#9aa2b6', '#d0d8e6', '#ffffff'],
  stone:  ['#25201d', '#433b35', '#675c52', '#93877a', '#c2b6a4'],
  red:    ['#320606', '#701212', '#b82626', '#ee5646', '#ffc4b4'],
  ember:  ['#561804', '#a63808', '#e86e1c', '#ffb23e', '#fff2a8'],
  blue:   ['#0a1636', '#183e84', '#3482d6', '#86ccff', '#eaf8ff'],
  green:  ['#0c2612', '#1c5426', '#36943c', '#86d458', '#e2ffc2'],
  violet: ['#1c0a2c', '#461866', '#8438ae', '#c688e8', '#f4e2ff'],
  bone:   ['#4a3e2e', '#887658', '#c6b694', '#ece0c2', '#fffaf0'],
  leather:['#24120a', '#523018', '#844e26', '#b0783e', '#deae6e'],
  paper:  ['#5a4e3c', '#9a8c70', '#d2c4a2', '#ede2c6', '#fffaf0'],
  ash:    ['#121014', '#26222a', '#433d48', '#686070', '#9a92a2'],
  wood:   ['#1c120a', '#3c2816', '#664626', '#8e683a', '#b8925a'],
  ink:    ['#141a2a', '#2a3450', '#44506e', '#5e6c8c', '#8090b0'],
  pink:   ['#4a1630', '#8c3660', '#d06890', '#f2a2c0', '#ffe2ee'],
  rose:   ['#6a2a44', '#b05a7e', '#ea92b4', '#ffc4da', '#fff0f6'],
  skin:   ['#5a2e22', '#9a5a42', '#d89a76', '#f2c4a0', '#fff0e0'],
  hair:   ['#140a08', '#2e1a12', '#4e2e1e', '#74462c', '#9a6a44'],
  leaf:   ['#0c2410', '#1a4a1e', '#2e7a30', '#5aae48', '#a8e080'],
  button: ['#0e0a14', '#241c30', '#3a3048', '#5a4e6a', '#8a7ea0'],
  rag:    ['#22121a', '#4e2c3a', '#7e5262', '#a8808e', '#d0aab6'],
};
const OUT_DARK = 0.45; // contorno = tom mais escuro do material vizinho, escurecido

function Canvas(w, h) {
  const c = { w, h, m: new Array(w * h).fill(null), t: new Int8Array(w * h), fix: new Uint8Array(w * h) };
  const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  c.set = (x, y, m, t = 2, fix = 0) => { x = Math.floor(x); y = Math.floor(y); if (!inb(x, y)) return; const i = y * w + x; c.m[i] = m; c.t[i] = t; c.fix[i] = fix };
  c.clear = (x, y) => { if (inb(x, y)) c.m[y * w + x] = null };
  c.get = (x, y) => inb(x, y) ? c.m[y * w + x] : null;
  c.tone = (x, y, d) => { if (!inb(x, y) || !c.m[y * w + x]) return; const i = y * w + x; c.t[i] = Math.max(0, Math.min(4, c.t[i] + d)) };
  // forma genérica: f(px,py) = true dentro (px,py no centro do pixel); tone pode ser número ou função
  c.shape = (f, m, tone = 2, fix = 0) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const px = x + .5, py = y + .5; if (f(px, py)) c.set(x, y, m, typeof tone === 'function' ? tone(px, py) : tone, fix) } };
  c.rect = (x, y, rw, rh, m, t = 2, fix = 0) => { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) c.set(x + i, y + j, m, t, fix) };
  c.disc = (cx, cy, r, m, t = 2, fix = 0) => c.shape((x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r, m, t, fix);
  c.ell = (cx, cy, rx, ry, m, t = 2, fix = 0) => c.shape((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, m, t, fix);
  c.ring = (cx, cy, r1, r2, m, t = 2, fix = 0, keep = () => true) => c.shape((x, y) => { const d = Math.hypot(x - cx, y - cy); return d <= r1 && d >= r2 && keep(x, y) }, m, t, fix);
  // esfera: tom pela direção da luz (cima/esquerda)
  c.ball = (cx, cy, r, m, lo = 0, hi = 4, f = null) => c.shape((x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r && (!f || f(x, y)), m, (x, y) => {
    const nx = (x - cx) / r, ny = (y - cy) / r, l = Math.max(0, -(nx * .6 + ny * .75) + .55 * Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)));
    return Math.max(lo, Math.min(hi, Math.round(lo + (hi - lo) * Math.min(1, l))))
  }, 1);
  c.poly = (pts, m, t = 2, fix = 0) => c.shape((x, y) => { let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins } return ins }, m, t, fix);
  c.line = (x0, y0, x1, y1, m, t = 2, fix = 1, th = 1) => { const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2) + 1; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; if (th <= 1) c.set(x, y, m, t, fix); else c.rect(Math.floor(x - (th - 1) / 2), Math.floor(y - (th - 1) / 2), th, th, m, t, fix) } };
  c.heart = (cx, cy, s, m, t = 2, fix = 0) => c.shape((x, y) => { const X = (x - cx) / s, Y = -(y - cy) / s + .25; return (X * X + Y * Y - 1) ** 3 - X * X * Y ** 3 <= 0 }, m, t, fix);
  // gradiente diagonal (claro em cima/esquerda) nos pixels do material dado
  c.grad = (m, lo = 1, hi = 3) => { let x0 = w, y0 = h, x1 = 0, y1 = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (c.m[y * w + x] === m && !c.fix[y * w + x]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * w + x; if (c.m[i] !== m || c.fix[i]) continue; const k = ((x - x0) / (x1 - x0 + 1) * .45 + (y - y0) / (y1 - y0 + 1) * .55); c.t[i] = Math.round(hi - (hi - lo) * k) } };
  return c;
}

// borda iluminada / sombra nos pixels que não estão fixos, e contorno escuro por fora
function finish(c, { outline = true, rim = true } = {}) {
  const { w, h } = c, m0 = c.m.slice(), t = Int8Array.from(c.t);
  if (rim) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, m = m0[i]; if (!m || c.fix[i]) continue;
    const same = (dx, dy) => { const xx = x + dx, yy = y + dy; return xx >= 0 && yy >= 0 && xx < w && yy < h && m0[yy * w + xx] === m };
    if (!same(0, -1) || !same(-1, 0)) t[i] = Math.min(4, t[i] + 1);
    else if (!same(0, 1) || !same(1, 0)) t[i] = Math.max(0, t[i] - 1);
  }
  const px = new Array(w * h).fill(null);
  for (let i = 0; i < w * h; i++) if (m0[i]) px[i] = RAMP[m0[i]][t[i]];
  if (outline) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (m0[y * w + x]) continue; let nb = null;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h && m0[yy * w + xx]) { nb = m0[yy * w + xx]; break } }
    if (nb) px[y * w + x] = dark(RAMP[nb][0], OUT_DARK);
  }
  return { w, h, px };
}
function dark(hex, k) { const n = parseInt(hex.slice(1), 16), r = (n >> 16) * k, g = (n >> 8 & 255) * k, b = (n & 255) * k; return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('') }

// ===== desenhos (24x24) =====
const loop = (c, m = 'bronze', cy = 2.5) => { c.ring(12, cy, 2.6, 1.2, m) };
const D = {};
D.ima = c => { // ímã de ferradura com brasas entre as pontas
  c.rect(4, 6, 5, 8, 'red'); c.rect(15, 6, 5, 8, 'red');
  c.ring(12, 13.5, 8.2, 3.2, 'red', 2, 0, (x, y) => y >= 13); c.grad('red', 1, 3);
  c.rect(4, 4, 5, 3, 'silver', 3); c.rect(15, 4, 5, 3, 'silver', 3);
  c.set(11, 6, 'ember', 4, 1); c.set(13, 3, 'ember', 3, 1); c.set(12, 9, 'ember', 3, 1); c.set(10, 1, 'ember', 2, 1); c.set(14, 7, 'ember', 4, 1);
};
D.ferro = c => { loop(c, 'iron');
  c.heart(12, 13, 8, 'iron'); c.grad('iron', 1, 3);
  for (const [x, y] of [[7, 9], [17, 9], [12, 19], [9, 15], [15, 15]]) { c.set(x, y, 'bronze', 3, 1) }
  c.line(12, 8, 12, 17, 'iron', 1, 1); c.set(11, 7, 'iron', 4, 1); c.set(6, 8, 'iron', 4, 1);
};
D.pena = c => { // pena branca na diagonal, ponta dourada
  const ax = 5, ay = 21, bx = 20, by = 2, L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L;
  c.shape((x, y) => { const dx = x - ax, dy = y - ay, t = (dx * ux + dy * uy) / L, p = -dx * uy + dy * ux; if (t < .2 || t > 1.02) return false; const wd = Math.sin(Math.PI * (t - .16) / .88) * (p > 0 ? 4.6 : 3.6); return Math.abs(p) <= wd },
    'silver', (x, y) => { const dx = x - ax, dy = y - ay, t = (dx * ux + dy * uy) / L, p = -dx * uy + dy * ux; const barb = ((t * 9 + Math.abs(p) * .12) % 1) < .16 && Math.abs(p) > 1.4; return barb ? 1 : p > 0 ? 3 : 2 }, 1);
  c.line(ax, ay, bx - 1, by + 1.5, 'bone', 4, 1); c.line(ax - 1, ay + 1, ax + 3, ay - 4, 'gold', 3, 1, 1);
};
D.faminta = c => { loop(c, 'iron');
  c.ball(12, 14, 8, 'ember', 1, 4); c.ball(12, 14, 8, 'ash', 0, 3, (x, y) => ((x * 7 + y * 5) % 9) < 2.2 && (x - 12) ** 2 + (y - 14) ** 2 > 22);
  c.rect(6, 14, 13, 3, 'ash', 0, 1);
  for (const x of [7, 10, 13, 16]) { c.set(x, 14, 'bone', 4, 1); c.set(x + 1, 14, 'bone', 3, 1); c.set(x, 15, 'bone', 3, 1) }
  for (const x of [8, 11, 14, 17]) { c.set(x, 16, 'bone', 3, 1); c.set(x, 15, 'bone', 2, 1) }
  c.set(9, 11, 'ember', 4, 1); c.set(15, 11, 'ember', 4, 1);
};
D.longa = c => { // lâmina longa e fina
  c.poly([[10.5, 17], [13.5, 17], [13.5, 4], [12, 1], [10.5, 4]], 'silver'); c.line(12, 3, 12, 16, 'silver', 4, 1);
  c.rect(10, 4, 1, 13, 'silver', 1, 1);
  c.rect(6, 17, 12, 2, 'gold'); c.set(5, 17, 'gold', 3); c.set(18, 17, 'gold', 2);
  c.rect(11, 19, 2, 3, 'leather'); c.disc(12, 22.6, 1.6, 'gold'); c.set(12, 18, 'red', 3, 1);
};
D.furia = c => { // coração em chamas
  const fl = (x, top, s, wd) => c.shape((px, py) => { const t = (py - top) / s; if (t < 0 || t > 1) return false; return Math.abs(px - x - Math.sin(t * 5) * .7) <= Math.sin(Math.PI * Math.min(1, t * .9) ** .8 / 1) * wd }, 'ember', (px, py) => (py - top) / s < .4 ? 4 : (py - top) / s < .7 ? 3 : 2, 1);
  fl(6, 2, 14, 3.2); fl(12, 0, 14, 3.6); fl(18, 1.5, 14, 3.2);
  c.heart(12, 16, 6.6, 'red'); c.grad('red', 1, 3);
  c.set(8, 13, 'red', 4, 1); c.set(9, 12, 'red', 4, 1);
};
D.pedra = c => { loop(c, 'bronze', 2);
  c.shape((x, y) => (y < 11 && (x - 12) ** 2 + (y - 11) ** 2 <= 70) || (y >= 11 && Math.abs(x - 12) <= 8.4 * (1 - (y - 11) / 12)), 'stone'); c.grad('stone', 1, 3);
  for (const r of [3.5, 7]) c.ring(12, 22, r + 6.6, r + 5.6, 'stone', 1, 1, (x, y) => c.get(Math.floor(x), Math.floor(y)) === 'stone' && y > 6);
  c.set(9, 8, 'stone', 4, 1); c.set(10, 7, 'stone', 4, 1); c.set(15, 16, 'green', 2, 1); c.set(16, 15, 'green', 3, 1);
};
D.gole = c => { // cálice de bronze com vinho
  c.shape((x, y) => y >= 6 && y < 14 && Math.abs(x - 12) <= 7.4 * Math.sqrt(Math.max(0, 1 - ((y - 6) / 8.2) ** 2)), 'bronze'); c.grad('bronze', 1, 3);
  c.rect(5, 5, 14, 2, 'gold', 3); c.rect(6, 6, 12, 1, 'red', 1, 1); c.rect(8, 6, 6, 1, 'red', 3, 1);
  c.rect(11, 14, 2, 5, 'bronze'); c.ell(12, 20, 5, 1.8, 'bronze'); c.set(12, 16, 'gold', 4, 1);
  c.set(18, 7, 'red', 2, 1); c.set(18, 8, 'red', 3, 1); c.set(18, 9, 'red', 2, 1); c.set(8, 9, 'bronze', 4, 1);
};
D.relogio = c => { // engrenagem com mostrador
  c.shape((x, y) => { const dx = x - 12, dy = y - 12, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx); return r <= 8.6 || (r <= 11.2 && Math.cos(8 * a) > .25) }, 'bronze'); c.grad('bronze', 1, 3);
  c.disc(12, 12, 6, 'paper'); c.grad('paper', 2, 3);
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; c.set(12 + Math.cos(a) * 4.9, 12 + Math.sin(a) * 4.9, 'ink', k % 3 ? 3 : 1, 1) }
  c.line(12, 12, 12, 8, 'ink', 0, 1); c.line(12, 12, 15, 13, 'ink', 0, 1); c.set(11, 11, 'gold', 4, 1);
};
D.lanterna = c => { loop(c, 'iron', 1.8);
  c.poly([[7, 7], [17, 7], [15, 4], [9, 4]], 'iron'); c.rect(6, 7, 12, 1, 'iron', 1);
  c.rect(7, 8, 10, 11, 'ember', 3, 1); c.ball(12, 13.5, 4, 'ember', 3, 4);
  c.shape((x, y) => Math.abs(x - 12 - Math.sin(y) * .3) < (y - 10) * .35 && y < 16 && y > 10, 'ember', 4, 1);
  for (const x of [7, 12, 16]) c.rect(x, 8, 1, 11, 'iron', x === 7 ? 3 : 1, 1);
  c.rect(6, 19, 12, 2, 'iron'); c.rect(8, 21, 8, 1, 'iron', 1);
};
D.sangue = c => { // pacto: punhal atravessando uma gota de sangue
  c.line(3, 21, 20, 4, 'silver', 3, 1, 2); c.line(19.5, 4.5, 21, 3, 'silver', 4, 1); c.line(3, 18, 6, 21, 'bronze', 3, 1); c.line(2, 22, 4, 20, 'leather', 2, 1, 2);
  c.shape((x, y) => (x - 12) ** 2 + (y - 15) ** 2 <= 37 || (y < 15 && y > 3 && Math.abs(x - 12) <= (y - 3) * .52), 'red'); c.grad('red', 1, 3);
  c.set(9, 13, 'red', 4, 1); c.set(9, 14, 'red', 4, 1); c.set(10, 11, 'red', 4, 1);
};
D.sorte = c => { // moeda de prata com uma romã
  c.disc(12, 12, 10, 'silver'); c.grad('silver', 1, 3); c.ring(12, 12, 8.2, 7.4, 'silver', 1, 1);
  c.ball(12, 13, 4, 'red', 1, 4); c.rect(11, 8, 3, 1, 'gold', 3, 1); c.set(10, 7, 'gold', 3, 1); c.set(14, 7, 'gold', 3, 1); c.set(12, 7, 'gold', 4, 1);
};
D.joelheira = c => { // joelheira de couro com placa de bronze
  c.rect(1, 8, 22, 3, 'leather', 1); c.rect(1, 15, 22, 3, 'leather', 1);
  c.rect(1, 9, 2, 1, 'leather', 3, 1); c.rect(21, 15, 2, 2, 'gold', 3, 1); c.rect(21, 8, 2, 2, 'gold', 3, 1);
  c.ell(12, 13, 7.2, 9.5, 'leather'); c.grad('leather', 1, 3);
  c.ring(12, 13, 6, 5.2, 'bone', 3, 1, (x, y) => ((Math.atan2(y - 13, x - 12) * 6) % 1 + 1) % 1 < .5);
  c.ball(12, 13, 3.4, 'bronze', 1, 4);
};
D.febre = c => { // frasco com a febre presa: violeta e verde girando
  c.rect(10, 1, 4, 3, 'leather'); c.rect(10, 4, 4, 4, 'silver', 3);
  c.ball(12, 15, 7.4, 'violet', 1, 3);
  for (let i = 0; i < 40; i++) { const a = i * .42, r = 1 + i * .14; c.set(12 + Math.cos(a) * r, 15 + Math.sin(a) * r * .8, 'green', i % 4 ? 3 : 4, 1) }
  c.ring(12, 15, 7.4, 6.6, 'silver', 2, 1, (x, y) => y < 12); c.set(8, 11, 'silver', 4, 1); c.set(8, 12, 'silver', 4, 1);
};
D.dente = c => { // presa grande num cordão
  c.line(1, 2, 7, 6, 'leather', 2, 1, 1); c.line(23, 2, 17, 6, 'leather', 2, 1, 1);
  c.poly([[7, 7], [17, 7], [16, 12], [14.5, 17], [12.5, 22.5], [11, 17], [9, 12]], 'bone'); c.grad('bone', 1, 3);
  c.rect(7, 5, 11, 3, 'bronze'); c.line(10, 9, 11, 17, 'bone', 4, 1);
};
D.vampiro = c => { // duas presas de ponta vermelha numa faixa de ouro
  c.poly([[5, 8], [10.5, 8], [9.6, 14], [8, 20.5], [6.4, 14]], 'bone'); c.poly([[13.5, 8], [19, 8], [17.6, 14], [16, 20.5], [14.4, 14]], 'bone'); c.grad('bone', 1, 3);
  for (const x of [8, 16]) { c.set(x, 20, 'red', 2, 1); c.set(x, 19, 'red', 3, 1); c.set(x, 18, 'red', 2, 1) }
  c.rect(3, 4, 18, 4, 'gold'); c.grad('gold', 1, 3); c.ball(12, 6, 2.8, 'red', 1, 4); c.set(1, 5, 'gold', 2); c.set(22, 5, 'gold', 1);
};
D.espinho = c => { // coroa de espinhos pingando
  c.ring(12, 11, 10, 7.2, 'wood', 2, 0, () => true); c.shape((x, y) => (((x - 12) / 9.4) ** 2 + ((y - 11) / 5.2) ** 2 <= 1) && (((x - 12) / 6.6) ** 2 + ((y - 11) / 2.8) ** 2 > 1), 'wood');
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) if (c.get(x, y) === 'wood' && !((((x + .5 - 12) / 9.4) ** 2 + ((y + .5 - 11) / 5.2) ** 2 <= 1))) c.clear(x, y);
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) if (c.get(x, y) === 'wood') c.t[y * 24 + x] = ((x + y * 2) % 5 < 2) ? 1 : 3;
  for (const [x, y, dx, dy] of [[3, 9, -1, -1], [8, 5, 0, -1], [15, 5, 1, -1], [20, 9, 1, -1], [5, 15, -1, 1], [12, 16, 0, 1], [19, 14, 1, 1]]) { c.set(x + dx, y + dy, 'wood', 3, 1); c.set(x + 2 * dx, y + 2 * dy, 'bone', 3, 1) }
  c.set(10, 18, 'red', 3, 1); c.set(10, 19, 'red', 2, 1); c.set(15, 20, 'red', 3, 1); c.set(15, 21, 'red', 2, 1); c.set(15, 22, 'red', 1, 1);
};
D.ouro = c => { // óbolo de ouro com a caveira do barqueiro
  c.disc(12, 12, 10, 'gold'); c.grad('gold', 1, 3); c.ring(12, 12, 8.4, 7.6, 'gold', 1, 1);
  c.disc(12, 10.6, 4, 'gold', 1, 1); c.rect(10, 13, 5, 3, 'gold', 1, 1); c.rect(9, 9, 2, 3, 'gold', 0, 1); c.rect(14, 9, 2, 3, 'gold', 0, 1); c.set(12, 12, 'gold', 0, 1);
  for (const x of [10, 12, 14]) c.set(x, 15, 'gold', 0, 1);
  c.set(7, 6, 'gold', 4, 1); c.set(6, 7, 'gold', 4, 1);
};
D.agil = c => { // sandália alada
  c.poly([[9, 12], [1, 2], [4, 2], [10, 10]], 'silver', 4); c.poly([[9, 13], [0, 7], [3, 6], [10, 12]], 'silver', 3); c.poly([[9, 14], [1, 12], [4, 11], [10, 13]], 'silver', 2);
  c.poly([[3, 18], [20, 17], [22, 19], [21, 21], [3, 21]], 'leather', 1); c.rect(4, 18, 17, 1, 'gold', 3, 1);
  c.rect(5, 13, 4, 5, 'leather'); c.rect(9, 9, 6, 3, 'leather'); c.grad('leather', 1, 3);
  c.line(9, 18, 14, 12, 'wood', 2, 1, 2); c.line(14, 18, 10, 13, 'wood', 1, 1, 2); c.line(19, 18, 13, 15, 'wood', 2, 1);
  c.set(12, 10, 'gold', 4, 1); c.set(13, 10, 'gold', 3, 1);
};
D.lagrima = c => { loop(c, 'silver');
  const drop = (g) => (x, y) => (x - 12) ** 2 + (y - 15) ** 2 <= (6.4 + g) ** 2 || (y < 15 && y > 4 - g && Math.abs(x - 12) <= (y - 4 + g) * .58);
  c.shape(drop(1.3), 'silver', 3); c.shape(drop(0), 'blue', 2);
  c.ball(12, 15, 6.4, 'blue', 1, 4, drop(0)); c.shape((x, y) => drop(0)(x, y) && y < 11, 'blue', 2, 1);
  c.set(10, 12, 'blue', 4, 1); c.set(9, 14, 'blue', 4, 1); c.set(12, 7, 'blue', 3, 1);
};
D.trevo = c => { // trevo de quatro folhas, de cinza, com veios de brasa
  c.line(13, 13, 19, 22, 'wood', 2, 1, 2);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, cx = 12 + Math.sin(a) * 5, cy = 11.5 - Math.cos(a) * 5;
    c.shape((x, y) => { const dx = x - cx, dy = y - cy, u = dx * Math.cos(a) + dy * Math.sin(a), v = -dx * Math.sin(a) + dy * Math.cos(a), X = u / 4.2, Y = -v / 4.2 + .25; return (X * X + Y * Y - 1) ** 3 - X * X * Y ** 3 <= 0 }, 'ash') }
  c.grad('ash', 1, 4);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; c.line(12, 11.5, 12 + Math.sin(a) * 6, 11.5 - Math.cos(a) * 6, 'ember', 3, 1) }
  c.set(12, 11, 'ember', 4, 1); c.set(7, 5, 'ember', 2, 1); c.set(18, 7, 'ember', 2, 1);
};
D.sino2 = c => { loop(c, 'bronze', 1.8);
  c.disc(12, 8.5, 4.6, 'bronze'); c.shape((x, y) => y >= 8.5 && y < 19 && Math.abs(x - 12) <= 4.6 + 4.8 * ((y - 8.5) / 10.5) ** 1.8, 'bronze'); c.grad('bronze', 1, 3);
  c.rect(2, 18, 20, 2, 'bronze', 2); c.rect(3, 18, 18, 1, 'gold', 3, 1); c.rect(6, 13, 12, 1, 'gold', 2, 1);
  c.line(14, 5, 13, 9, 'ash', 0, 1); c.line(13, 9, 15, 12, 'ash', 0, 1); c.line(15, 12, 12, 16, 'ash', 0, 1); c.line(12, 16, 13, 19, 'ash', 0, 1);
  c.disc(12, 21.4, 1.6, 'iron', 2); c.set(9, 6, 'bronze', 4, 1); c.set(8, 7, 'bronze', 4, 1); c.set(8, 8, 'bronze', 4, 1);
};
D.coroa = c => { // coroa escura com brasas nas pontas
  c.rect(3, 14, 18, 6, 'ash'); c.poly([[3, 14], [3, 7], [6.5, 11], [8.5, 4], [12, 10], [15.5, 4], [17.5, 11], [21, 7], [21, 14]], 'ash'); c.grad('ash', 1, 4);
  c.rect(3, 19, 18, 1, 'gold', 2); c.rect(3, 14, 18, 1, 'gold', 3);
  for (const [x, y] of [[3, 6], [8, 3], [15, 3], [20, 6]]) { c.set(x, y, 'ember', 4, 1); c.set(x + 1, y, 'ember', 3, 1); c.set(x, y - 1, 'ember', 2, 1) }
  c.ball(12, 16.8, 2.2, 'red', 1, 4); c.set(7, 17, 'ember', 3, 1); c.set(17, 17, 'ember', 3, 1); c.line(5, 16, 8, 18, 'ember', 2, 1); c.line(16, 18, 19, 15, 'ember', 2, 1);
};
D.aljava = c => { // aljava com flechas de pena azul e uma runa
  for (const [x, t] of [[9, 1], [12, 0], [15, 2]]) { c.line(x, 9, x - 1 + t, 3 + t, 'wood', 3, 1); c.set(x - 2 + t, 1 + t, 'blue', 4, 1); c.set(x - 1 + t, 1 + t, 'blue', 3, 1); c.set(x - 2 + t, 2 + t, 'blue', 2, 1); c.set(x + t, 2 + t, 'blue', 3, 1) }
  c.shape((x, y) => x >= 7 && x <= 17 && y >= 8 && (y < 21 || (x - 12) ** 2 + (y - 21) ** 2 <= 25), 'leather'); c.grad('leather', 1, 3);
  c.rect(7, 9, 11, 2, 'bronze', 3); c.rect(7, 20, 11, 1, 'bronze', 2);
  c.line(11, 13, 13, 13, 'blue', 4, 1); c.line(12, 12, 12, 18, 'blue', 4, 1); c.line(10, 16, 14, 16, 'blue', 3, 1);
  c.line(18, 8, 21, 20, 'leather', 1, 1);
};
D.olho = c => { loop(c, 'gold', 1.8);
  const alm = s => (x, y) => Math.abs(y - 12.5) <= 6.6 * s * (1 - ((x - 12) / (10.6 * s)) ** 2);
  c.shape(alm(1), 'gold'); c.grad('gold', 1, 3); c.shape(alm(.8), 'bone', 3, 1);
  c.ball(12, 12.5, 3.8, 'green', 1, 4, alm(.8)); c.disc(12, 12.5, 1.6, 'ash', 0, 1); c.set(11, 11, 'green', 4, 1); c.set(10, 11, 'bone', 4, 1);
  c.line(12, 20, 12, 23, 'gold', 2, 1); c.set(11, 23, 'green', 3, 1); c.set(13, 23, 'green', 2, 1);
};

D.botao = c => { // cabeça do coelho de pano, com olhos de botão e uma flor na orelha
  c.ell(8, 6.5, 2.8, 6.5, 'pink'); c.ell(16, 6.5, 2.8, 6.5, 'pink'); c.ell(8, 7, 1.2, 4.4, 'rose', 3, 1); c.ell(16, 7, 1.2, 4.4, 'rose', 3, 1);
  c.ell(12, 15.5, 8, 7, 'pink'); c.grad('pink', 1, 3);
  c.disc(9, 14.5, 1.9, 'button', 1, 1); c.disc(15, 14.5, 1.9, 'button', 1, 1); c.set(8, 14, 'button', 4, 1); c.set(14, 14, 'button', 4, 1);
  c.set(12, 17, 'rose', 4, 1); c.line(10, 19, 14, 19, 'red', 1, 1); c.set(11, 20, 'red', 1, 1); c.set(13, 20, 'red', 1, 1);
  c.disc(18.5, 3.5, 2.2, 'red', 3, 1); c.set(18, 3, 'red', 4, 1); c.set(16, 4, 'leaf', 3, 1);
  for (let i = 0; i < 7; i++) c.set(6 + i * 2, 22, 'bone', 3, 1);
};

// ===== bilhete dos ecos (24x24) =====
function eco() { const c = Canvas(24, 24);
  c.poly([[4, 3], [16, 2], [21, 7], [20, 21], [5, 22]], 'paper'); c.grad('paper', 2, 3);
  c.poly([[16, 2], [16, 7.5], [21, 7]], 'paper', 1, 1); c.line(16, 7, 21, 7, 'paper', 0, 1);
  for (const [y, l] of [[7, 9], [10, 13], [13, 12], [16, 8]]) c.line(7, y, 7 + l, y - .4, 'ink', (y & 1) ? 2 : 3, 1);
  c.line(14, 17.5, 18, 17, 'ink', 2, 1); c.ball(9, 18.5, 3, 'red', 1, 4); c.set(9, 18, 'red', 0, 1); c.set(8, 18, 'red', 0, 1); c.set(10, 18, 'red', 0, 1); c.set(9, 19, 'red', 0, 1); c.set(9, 20, 'red', 0, 1);
  c.set(5, 4, 'paper', 4, 1); c.set(6, 4, 'paper', 4, 1);
  return finish(c);
}

// ===== altar de cura (40x56, desenhado no jogo com 20x28) =====
function altar(lit) { const c = Canvas(40, 56), E = lit ? 'ember' : 'ash';
  // degraus e pedestal
  c.rect(0, 50, 40, 6, 'stone'); c.rect(3, 45, 34, 5, 'stone'); c.rect(8, 39, 24, 6, 'stone'); c.grad('stone', 1, 3);
  c.rect(0, 50, 40, 1, 'stone', 4, 1); c.rect(3, 45, 34, 1, 'stone', 4, 1); c.rect(8, 39, 24, 1, 'stone', 4, 1);
  for (let x = 4; x < 37; x += 5) c.set(x, 47, E, lit ? 3 : 2, 1);
  for (let x = 2; x < 39; x += 7) { c.set(x, 53, E, lit ? 2 : 1, 1); c.set(x + 1, 53, E, lit ? 3 : 2, 1) }
  c.heart(20, 42, 2.8, lit ? 'red' : 'stone', lit ? 3 : 0, 1);
  // a guardiã de capuz erguendo a tigela de brasa acima da cabeça
  c.poly([[10, 39], [30, 39], [26, 23], [14, 23]], 'stone'); c.ell(20, 24, 7.5, 3.4, 'stone'); c.disc(20, 19, 4.6, 'stone'); c.grad('stone', 1, 3);
  c.disc(20.7, 20.4, 2.6, 'stone', 0, 1); c.set(21, 21, 'stone', 1, 1);
  for (const x of [15, 20, 25]) c.line(x, 29, x - (x - 20) * .35, 38, 'stone', 1, 1);
  c.line(14, 24, 12, 14, 'stone', 3, 1, 2); c.line(26, 24, 28, 14, 'stone', 1, 1, 2);
  c.rect(11, 12, 3, 2, 'stone', 3, 1); c.rect(27, 12, 3, 2, 'stone', 2, 1);
  // tigela
  c.shape((x, y) => y >= 8 && y < 13.5 && Math.abs(x - 20) <= 11 * Math.sqrt(Math.max(0, 1 - ((y - 8) / 5.6) ** 2)), 'bronze'); c.grad('bronze', 1, 3);
  c.rect(8, 7, 24, 2, 'bronze', 3); c.rect(10, 6, 20, 1, E, lit ? 3 : 2, 1); c.rect(14, 10, 12, 1, 'gold', 3, 1);
  for (let x = 11; x < 30; x += 2) c.set(x, 5, E, lit ? ((x >> 1) % 2 ? 4 : 2) : 1, 1);
  return finish(c);
}

// ===== Ato III: Telma, Sr. Bottoms e o Maestro (folhas com vários quadros, desenhadas com o dobro de detalhe) =====
// textura de pano: alguns pixels um tom mais escuro, num padrão fixo (sem ruído diferente a cada build)
const weave = (c, m, k = 5) => { for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) { const i = y * c.w + x; if (c.m[i] === m && !c.fix[i] && ((x * 7 + y * 13 + (x * y) % 5) % k === 0)) c.t[i] = Math.max(0, c.t[i] - 1) } };
// Telma (48x64, olhando para a direita), no estilo do Teo: capa com capuz caído, túnica, cinto com bolsa, botas e trança.
// pose: leg = fase da caminhada (-1 parada), bob = respiração, sing = cantando
function telma(c, { leg = -1, bob = 0, sing = false } = {}) {
  const sw = leg < 0 ? 0 : [3, 0, -3, 0][leg], lift = leg < 0 ? [0, 0] : [[0, 2], [0, 0], [2, 0], [0, 0]][leg], y0 = bob;
  // capa atrás (balança um pouco ao andar)
  c.poly([[17, 20 + y0], [27, 20 + y0], [22, 34], [14 - sw * .4, 52], [9 - sw * .5, 50]], 'rag'); weave(c, 'rag', 6); c.grad('rag', 1, 3);
  // pernas e botas
  const leg1 = (x, up, t) => { c.rect(x, 46, 5, 9 - up, 'hair', t); c.rect(x - 1, 54 - up, 7, 8, 'leather', t); c.rect(x - 1, 54 - up, 7, 1, 'leather', t + 1, 1); c.rect(x - 1, 61 - up, 8, 2, 'leather', 0, 1) };
  leg1(19 - sw, lift[1], 1); leg1(25 + sw, lift[0], 2);
  // túnica clara até o joelho
  c.poly([[19, 21 + y0], [29, 21 + y0], [32, 48], [16, 48]], 'paper'); weave(c, 'paper', 7); c.grad('paper', 1, 3);
  c.line(24, 23 + y0, 24, 47, 'paper', 1, 1);
  // cinto, fivela e bolsa (como a do Teo)
  c.rect(17, 34 + y0, 15, 2, 'leather', 1); c.rect(23, 34 + y0, 2, 2, 'gold', 3, 1);
  c.rect(16, 36 + y0, 5, 5, 'leather', 2); c.rect(16, 36 + y0, 5, 1, 'leather', 3, 1); c.set(18, 38 + y0, 'gold', 3, 1);
  // cachecol rosa (a orelha do Sr. Bottoms) com a ponta voando para trás
  c.ell(24, 20 + y0, 6.5, 2.4, 'rose', 3); c.poly([[18, 20 + y0], [20, 21 + y0], [15 - sw * .3, 30 + y0], [13 - sw * .3, 28 + y0]], 'rose', 2); c.grad('rose', 2, 4);
  // braço da frente (manga clara, mão)
  if (sing) { c.line(27, 23 + y0, 28, 28 + y0, 'paper', 2, 1, 3); c.line(28, 28 + y0, 25, 27 + y0, 'paper', 2, 1, 3); c.disc(24.5, 27 + y0, 1.8, 'skin', 3, 1) }
  else { const as = -sw * .6; c.line(27, 23 + y0, 28 + as * .3, 31 + y0, 'paper', 2, 1, 3); c.line(28 + as * .3, 31 + y0, 29 + as, 37 + y0, 'paper', 3, 1, 3); c.disc(29.5 + as, 38.5 + y0, 1.8, 'skin', 2, 1) }
  // cabeça
  c.disc(25, 13 + y0, 5.6, 'skin'); c.grad('skin', 2, 3); c.set(31, 13 + y0, 'skin', 3); c.set(30, 16 + y0, 'skin', 1, 1);
  if (sing) { c.line(27, 12 + y0, 29, 12 + y0, 'hair', 0, 1); c.set(29, 16 + y0, 'red', 0, 1); c.set(29, 17 + y0, 'red', 1, 1) }
  else { c.rect(28, 11 + y0, 2, 2, 'ink', 0, 1); c.set(29, 11 + y0, 'ink', 4, 1); c.line(27, 9 + y0, 30, 9 + y0, 'hair', 1, 1); c.set(29, 16 + y0, 'red', 2, 1) }
  c.set(27, 14 + y0, 'pink', 3, 1);
  // cabelo escuro: franja, topo e trança caindo nas costas
  c.shape((x, y) => (x - 24) ** 2 + (y - 11.5 - y0) ** 2 <= 40 && (y < 10 + y0 || x < 23), 'hair', 2); c.grad('hair', 1, 3);
  c.line(26, 7 + y0, 30, 9 + y0, 'hair', 3, 1); c.set(31, 10 + y0, 'hair', 2, 1);
  for (let i = 0; i < 6; i++) c.disc(19.5 - i * .5 - sw * i * .05, 16 + y0 + i * 3.2, 1.9, 'hair', i % 2 ? 1 : 3, 1);
  c.set(17, 35 + y0, 'rose', 4, 1); c.set(16, 35 + y0, 'rose', 3, 1);
}
// Telma criança (40x48), no mesmo estilo: vestido rosa-poeira, maria-chiquinha e o coelhinho no colo
function telmaKid(c, { bob = 0 } = {}) {
  c.rect(15, 41, 4, 5, 'skin', 1); c.rect(21, 41, 4, 5, 'skin', 2); c.rect(14, 44, 6, 4, 'leather', 1); c.rect(20, 44, 6, 4, 'leather', 2);
  c.poly([[15, 22 + bob], [25, 22 + bob], [28, 42], [12, 42]], 'rag'); weave(c, 'rag', 6); c.grad('rag', 1, 3); c.rect(13, 40, 15, 2, 'paper', 3, 1);
  c.rect(16, 21 + bob, 8, 3, 'paper', 3);
  c.disc(20.5, 14 + bob, 7, 'skin'); c.grad('skin', 2, 3);
  c.shape((x, y) => (x - 19.5) ** 2 + (y - 12 - bob) ** 2 <= 56 && (y < 11 + bob || x < 17), 'hair', 2); c.grad('hair', 1, 3);
  c.disc(12, 16 + bob, 2.6, 'hair', 2); c.disc(12, 20 + bob, 2, 'hair', 1); c.set(13, 13 + bob, 'rose', 4, 1);
  c.rect(23, 13 + bob, 2, 2, 'ink', 0, 1); c.set(24, 13 + bob, 'ink', 4, 1); c.set(22, 17 + bob, 'pink', 3, 1); c.set(25, 18 + bob, 'red', 2, 1);
  // o coelhinho (ainda bonzinho)
  c.disc(24, 29 + bob, 4.4, 'rose'); c.grad('rose', 2, 4); c.ell(22, 22 + bob, 1.4, 4, 'rose', 3); c.ell(26, 22.5 + bob, 1.4, 3.6, 'rose', 2);
  c.set(23, 28 + bob, 'button', 0, 1); c.set(26, 28 + bob, 'button', 0, 1); c.set(24, 31 + bob, 'red', 1, 1);
  c.line(17, 27 + bob, 21, 31 + bob, 'skin', 3, 1, 2);
}
// Sr. Bottoms (88x104): o coelho de pano que a culpa do Teo encheu. Encurvado, encardido, um olho de botão e um buraco com brilho vermelho,
// sorriso costurado com dentes de agulha, garras de agulha de costura e uma rosa murcha na orelha rasgada. rip = barriga aberta (2ª fase)
function plush(c, { sx = 1, sy = 1, rip = false } = {}) {
  const X = x => 44 + (x - 44) * sx, Y = y => 103 - (103 - y) * sy, S = (sx + sy) / 2;
  // orelhas: a de trás comprida e torta, a da frente rasgada pela metade com a linha pendurada
  c.shape((x, y) => { const u = (x - X(38)) / (sx * 6), v = (y - Y(16)) / (sy * 17), a = -.35; const r = u * Math.cos(a) + v * Math.sin(a), s = -u * Math.sin(a) + v * Math.cos(a); return r * r + s * s <= 1 }, 'rag');
  c.ell(X(37), Y(17), 2.4 * sx, 11 * sy, 'rose', 1, 1);
  c.shape((x, y) => { const u = (x - X(62)) / (sx * 6), v = (y - Y(22)) / (sy * 9), a = .5; const r = u * Math.cos(a) + v * Math.sin(a), s = -u * Math.sin(a) + v * Math.cos(a); return r * r + s * s <= 1 && y > Y(14) }, 'rag');
  for (let i = 0; i < 4; i++) c.set(X(60 + i * 2), Y(14 + (i % 2)), 'bone', 3, 1); c.line(X(66), Y(15), X(70), Y(24), 'bone', 2, 1);
  c.disc(X(42), Y(6), 3.4 * S, 'red', 1); c.set(X(41), Y(5), 'red', 2, 1); c.line(X(43), Y(9), X(44), Y(14), 'leaf', 1, 1); c.set(X(46), Y(9), 'leaf', 0, 1);
  // pés, corpo encurvado e braço de trás
  c.ell(X(28), Y(98), 10 * sx, 5 * sy, 'rag'); c.ell(X(54), Y(98), 10 * sx, 5 * sy, 'rag');
  c.ell(X(40), Y(72), 27 * sx, 26 * sy, 'rag'); c.ell(X(18), Y(70), 6 * sx, 13 * sy, 'rag');
  // cabeça projetada para a frente
  c.disc(X(56), Y(40), 18.5 * S, 'rag'); weave(c, 'rag', 4); c.grad('rag', 1, 3);
  // braço da frente comprido, com garras de agulha
  c.line(X(60), Y(58), X(74), Y(80), 'rag', 2, 1, 7); c.disc(X(75), Y(82), 4.5, 'rag', 2, 1);
  for (const [dx, dy] of [[3, 7], [6, 5], [7, 1]]) c.line(X(76), Y(83), X(76 + dx * 1.8), Y(83 + dy * 1.6), 'silver', 4, 1);
  for (const [dx, dy] of [[-3, 8], [0, 9]]) c.line(X(17), Y(80), X(17 + dx), Y(80 + dy), 'silver', 3, 1);
  // remendo xadrez escuro e costuras
  if (!rip) { c.rect(X(30), Y(66), 14 * sx, 12 * sy, 'ink', 1, 1); for (let j = 0; j < 12 * sy; j += 4) for (let i = 0; i < 14 * sx; i += 4) c.rect(X(30) + i, Y(66) + j, 2, 2, 'ink', 2, 1);
    for (let i = 0; i < 16 * sx; i += 3) { c.set(X(29) + i, Y(65), 'bone', 2, 1); c.set(X(29) + i, Y(66) + 13 * sy, 'bone', 2, 1) } }
  else { c.ell(X(38), Y(72), 13 * sx, 15 * sy, 'button', 0, 1); for (let k = 0; k < 14; k++) c.disc(X(27 + (k * 7) % 22), Y(58 + (k * 5) % 28), 2.2, 'paper', 3, 1);
    c.heart(X(38), Y(72), 6.5 * S, 'red', 3, 1); for (const [a, b] of [[-5, -6], [4, -7], [6, 2], [-6, 3]]) c.line(X(38 + a * .4), Y(72 + b * .4), X(38 + a), Y(72 + b), 'silver', 4, 1);
    for (let k = 0; k < 9; k++) { c.set(X(25), Y(58 + k * 3), 'bone', 2, 1); c.set(X(51), Y(58 + k * 3), 'bone', 2, 1) } }
  for (let i = 0; i < 10; i++) c.set(X(56) + Math.round(Math.cos(i / 10 * Math.PI - 1.6) * 18 * S), Y(40) + Math.round(Math.sin(i / 10 * Math.PI - 1.6) * 18 * S), 'bone', 2, 1);
  // olho de botão costurado em X e o buraco do outro olho, com brilho vermelho
  c.disc(X(63), Y(35), 4.8 * S, 'button', 2); c.ring(X(63), Y(35), 4.8 * S, 3.6 * S, 'button', 3, 1);
  c.line(X(60.5), Y(32.5), X(65.5), Y(37.5), 'bone', 3, 1); c.line(X(65.5), Y(32.5), X(60.5), Y(37.5), 'bone', 3, 1);
  c.disc(X(50), Y(35), 4 * S, 'button', 0, 1); c.disc(X(50.5), Y(35), 1.8 * S, 'red', 4, 1); c.set(X(50), Y(34), 'ember', 4, 1);
  for (const [a, b] of [[45, 30], [55, 30], [45, 40], [55, 40]]) c.set(X(a), Y(b), 'bone', 2, 1);
  // sorriso largo costurado, com dentes de agulha
  c.shape((x, y) => y > Y(46) && y < Y(46) + (5 - Math.abs(x - X(60)) / 3.4) * sy && x > X(46) && x < X(74), 'button', 0, 1);
  for (let x = 47; x < 73; x += 3) { c.set(X(x), Y(47), 'bone', 4, 1); c.set(X(x + 1), Y(48), 'bone', 3, 1); c.set(X(x + 1), Y(50), 'bone', 3, 1) }
  for (let x = 48; x < 73; x += 4) c.line(X(x), Y(45), X(x), Y(52), 'bone', 1, 1);
  c.set(X(72), Y(40), 'rag', 4, 1); c.set(X(73), Y(41), 'rag', 1, 1);
}
// Malco, o Maestro das Vozes (64x120): manto carmesim de gola alta, cabelo branco, batuta de osso
function maestro(c, pose = 0) {
  // gola alta atrás da cabeça
  c.poly([[19, 34], [45, 34], [50, 10], [42, 22], [32, 6], [22, 22], [14, 10]], 'red', 1);
  // manto até o chão (ele flutua), painel preto na frente e bordas de ouro
  c.poly([[22, 30], [42, 30], [55, 118], [9, 118]], 'red'); c.grad('red', 1, 3);
  c.poly([[29, 32], [35, 32], [40, 118], [24, 118]], 'ash', 1); c.line(29, 33, 24, 117, 'gold', 3, 1); c.line(35, 33, 40, 117, 'gold', 2, 1); c.rect(9, 116, 47, 2, 'gold', 2, 1);
  for (let y = 46; y < 116; y += 14) c.set(32, y, 'gold', 4, 1);
  // cabeça: rosto pálido, cabelo branco escorrido
  c.poly([[23, 14], [41, 14], [44, 40], [20, 40]], 'silver', 3);
  c.disc(32, 19, 8, 'bone'); c.grad('bone', 2, 3); c.shape((x, y) => (x - 32) ** 2 + (y - 17) ** 2 <= 76 && y < 15, 'silver', 4);
  c.line(28, 19, 30, 19, 'ash', 0, 1); c.line(34, 19, 36, 19, 'ash', 0, 1); c.set(29, 18, 'red', 3, 1); c.set(35, 18, 'red', 3, 1); c.line(30, 24, 34, 24, 'red', 1, 1);
  // braços (mangas largas) e batuta conforme a pose
  const arm = (sx, sy, hx, hy, t) => { c.line(sx, sy, hx, hy, 'red', t, 1, 4); c.disc(hx, hy, 2.2, 'bone', 3, 1) };
  const H = [[[22, 62], [42, 62], [44, 70]], [[26, 44], [50, 14], [57, 2]], [[24, 48], [58, 40], [63, 34]], [[6, 22], [58, 22], [62, 10]]][pose];
  arm(24, 34, H[0][0], H[0][1], 1); arm(40, 34, H[1][0], H[1][1], 2); c.line(H[1][0], H[1][1], H[2][0], H[2][1], 'bone', 4, 1); c.set(H[2][0], H[2][1], 'gold', 4, 1);
}
// projéteis e peças dos ataques
function small(w, h, f) { const c = Canvas(w, h); f(c); return finish(c) }
const PETAL = () => small(12, 12, c => { c.shape((x, y) => { const u = x - 6, v = y - 6.5; return (u * .9 + v * .4) ** 2 / 20 + (-u * .4 + v * .9) ** 2 / 7 <= 1 }, 'rose'); c.grad('rose', 1, 4); c.line(3, 8, 8, 5, 'pink', 2, 1) });
const BUTTON = () => small(12, 12, c => { c.disc(6, 6, 5.4, 'button', 2); c.ring(6, 6, 5.4, 4, 'rose', 3, 1); for (const [x, y] of [[5, 5], [7, 5], [5, 7], [7, 7]]) c.set(x, y, 'button', 0, 1); c.set(3, 3, 'rose', 4, 1) });
const COTTON = () => small(20, 20, c => { for (const [x, y, r] of [[10, 11, 6], [6, 10, 4], [14, 9, 4.5], [9, 6, 4], [13, 14, 4]]) c.disc(x, y, r, 'paper', 4); c.grad('paper', 2, 4); c.set(8, 11, 'pink', 3, 1); c.set(12, 9, 'pink', 2, 1) });
const ROSE = () => small(16, 16, c => { c.ell(5, 12, 4, 2, 'leaf'); c.ell(11, 12, 4, 2, 'leaf'); c.ball(8, 7, 5.5, 'red', 1, 4); c.line(6, 6, 9, 9, 'red', 0, 1); c.line(9, 4, 11, 7, 'red', 1, 1); c.set(6, 4, 'red', 4, 1) });
const VINE = () => small(12, 16, c => { c.rect(5, 0, 3, 16, 'leaf'); c.grad('leaf', 1, 3); c.set(4, 3, 'bone', 3, 1); c.set(3, 2, 'bone', 4, 1); c.set(8, 10, 'bone', 3, 1); c.set(9, 9, 'bone', 4, 1); c.ell(2.5, 13, 2.2, 1.2, 'leaf', 3, 1) });
const NOTE = () => small(12, 16, c => { c.ell(4.5, 12.5, 3.6, 2.6, 'red', 3); c.rect(7, 2, 1.5, 11, 'red', 3); c.poly([[7.5, 2], [11, 5], [11, 8], [8, 5.5]], 'red', 3); c.grad('red', 2, 4); c.set(3, 11, 'red', 4, 1) });
const BELL = () => small(16, 16, c => { c.disc(8, 5, 3.6, 'bronze'); c.shape((x, y) => y >= 5 && y < 13 && Math.abs(x - 8) <= 3.6 + 3.4 * ((y - 5) / 8) ** 1.6, 'bronze'); c.grad('bronze', 1, 3); c.rect(1, 12, 14, 2, 'gold', 3); c.disc(8, 14.6, 1.2, 'iron', 2); c.ring(8, 1.4, 1.6, .6, 'bronze', 2) });
const LETTER_PINK = () => small(24, 24, c => {
  c.poly([[4, 3], [17, 3], [20, 6], [20, 21], [4, 21]], 'paper'); c.grad('paper', 2, 3);
  for (const [y, l] of [[7, 10], [10, 12], [13, 9]]) c.line(6, y, 6 + l, y, 'pink', 1, 1);
  c.rect(4, 16, 17, 2, 'rose', 3); c.ball(12, 17, 2.6, 'pink', 1, 4);
  c.line(16, 15, 21, 10, 'leaf', 2, 1); c.disc(21, 9, 2.2, 'rose', 4, 1); c.set(21, 9, 'gold', 4, 1);
});
// arco da caçadora (16x56, em pé, barriga para a direita, sem corda: a corda é desenhada no jogo)
const BOW = () => small(16, 56, c => {
  const cx = y => 3.2 + 6.6 * (1 - ((y - 28) / 26.5) ** 2) - (Math.abs(y - 28) > 21 ? (Math.abs(y - 28) - 21) * .55 : 0);
  for (let y = 2; y < 54; y++) { const x = cx(y), t = Math.abs(y - 28) < 6 ? 3.4 : 2.6 - Math.abs(y - 28) / 30; c.shape((px, py) => py >= y && py < y + 1 && px >= x - t / 2 && px <= x + t / 2, 'wood', 2) }
  c.grad('wood', 1, 4);
  for (let y = 4; y < 52; y++) { const x = cx(y); if (Math.abs(y - 28) > 5) c.set(x + .6, y, 'wood', 4, 1) }
  c.rect(7, 23, 4, 10, 'leather', 2); for (let y = 24; y < 33; y += 2) c.rect(7, y, 4, 1, 'leather', 3, 1);
  for (const y of [21, 34]) c.rect(Math.round(cx(y)) - 1, y, 4, 1, 'gold', 3, 1);
  for (const y of [2, 3, 52, 53]) c.set(cx(y), y, 'gold', 4, 1);
  for (const y of [12, 16, 40, 44]) c.set(cx(y) - .2, y, 'ember', 3, 1);
});
// punho fechado em volta do cabo (12x12, o cabo passa na horizontal pelo meio): luva de couro ou manopla
const FIST = (m, sh = 0) => small(12, 12, c => {
  c.shape((x, y) => x >= 2 && x <= 10 && y >= 1.5 && y <= 10.5 && !((x < 3 || x > 9.5) && (y < 2.5 || y > 9.6)), m, 2 - sh);
  c.grad(m, 1 - sh, 3 - sh);
  for (const x of [4, 6, 8]) c.line(x, 6, x, 10, m, 0, 1);
  c.line(3, 6, 10, 6, m, Math.max(0, 1 - sh), 1);
  c.rect(8, 2, 2, 3, m, 4 - sh, 1); c.set(9, 4, m, 3 - sh, 1);
  if (m === 'iron') for (const x of [3, 5, 7, 9]) c.set(x, 7, 'bronze', 3 - sh, 1);
});
// ---- peças dos ataques de assinatura de cada chefe ----
const SIGSPR = {
  s_rocket: () => small(8, 16, c => { c.rect(2, 4, 4, 8, 'red'); c.grad('red', 1, 3); c.rect(2, 6, 4, 1, 'paper', 4, 1); c.rect(2, 9, 4, 1, 'paper', 4, 1); c.poly([[2, 4], [6, 4], [4, 0]], 'gold', 3); c.rect(3, 12, 2, 3, 'ember', 4, 1); c.set(4, 15, 'ember', 2, 1) }),
  s_horseshoe: () => small(12, 12, c => { c.ring(6, 6, 5.4, 2.8, 'bronze', 2, 0, (x, y) => y < 8.5); c.rect(1, 6, 3, 5, 'bronze'); c.rect(8, 6, 3, 5, 'bronze'); c.grad('bronze', 1, 4); for (const [x, y] of [[2, 4], [9, 4], [6, 1], [2, 8], [9, 8]]) c.set(x, y, 'iron', 0, 1) }),
  s_chisel: () => small(12, 12, c => { c.line(2, 10, 6, 6, 'wood', 2, 1, 2); c.line(6, 6, 10, 2, 'silver', 3, 1, 2); c.set(10, 1, 'silver', 4, 1); c.set(6, 6, 'iron', 1, 1) }),
  s_bust: () => small(16, 16, c => { c.rect(3, 12, 10, 3, 'stone', 3); c.ell(8, 11, 5, 3, 'silver', 3); c.disc(8, 6, 4.4, 'silver', 3); c.grad('silver', 2, 4); c.set(9, 5, 'iron', 1, 1); c.set(11, 6, 'iron', 2, 1); c.line(6, 2, 10, 2, 'bone', 4, 1) }),
  s_bone: () => small(16, 8, c => { c.rect(3, 3, 10, 2, 'bone'); c.disc(2.5, 2.5, 1.8, 'bone'); c.disc(2.5, 5.5, 1.8, 'bone'); c.disc(13.5, 2.5, 1.8, 'bone'); c.disc(13.5, 5.5, 1.8, 'bone'); c.grad('bone', 2, 4) }),
  s_sludge: () => small(12, 12, c => { c.ball(6, 7, 4.6, 'leaf', 1, 4); c.disc(3, 3, 1.4, 'leaf', 3, 1); c.set(8, 5, 'green', 4, 1) }),
  s_hourglass: () => small(12, 16, c => { c.rect(1, 0, 10, 2, 'gold', 3); c.rect(1, 14, 10, 2, 'gold', 2); c.poly([[2, 2], [10, 2], [6, 8], [10, 14], [2, 14], [6, 8]], 'silver', 4); c.poly([[4, 10], [8, 10], [9, 13], [3, 13]], 'bone', 3, 1); c.poly([[3, 3], [9, 3], [6, 6]], 'bone', 2, 1); c.set(6, 8, 'bone', 3, 1) }),
  s_flag: () => small(16, 24, c => { c.rect(2, 0, 2, 24, 'wood', 2); c.poly([[4, 2], [15, 3], [13, 8], [15, 13], [4, 12]], 'blue', 2); c.grad('blue', 1, 3); c.line(9, 4, 7, 8, 'gold', 4, 1); c.line(7, 8, 10, 8, 'gold', 4, 1); c.line(10, 8, 8, 11, 'gold', 4, 1); c.disc(3, 1, 1.5, 'gold', 3) }),
  s_egg: () => small(12, 14, c => { c.ell(6, 8, 4.5, 5.5, 'bone', 3); c.grad('bone', 2, 4); c.line(2, 5, 10, 11, 'paper', 4, 1); c.line(10, 5, 2, 11, 'paper', 4, 1); c.set(5, 7, 'violet', 2, 1); c.set(7, 9, 'violet', 1, 1) }),
  s_lamp: () => small(12, 14, c => { c.ell(6, 10, 5, 3, 'bronze'); c.grad('bronze', 1, 3); c.rect(9, 8, 3, 2, 'bronze', 2); c.disc(6, 5, 2.4, 'ember', 3, 1); c.set(6, 3, 'ember', 4, 1); c.set(6, 2, 'gold', 4, 1) }),
  s_cart: () => small(24, 16, c => { c.poly([[1, 3], [23, 3], [21, 12], [3, 12]], 'iron'); c.grad('iron', 1, 3); c.rect(1, 3, 22, 1, 'iron', 4, 1); for (const x of [5, 11, 17]) c.disc(x, 2, 2.6, 'bronze', 3); c.disc(6, 13.5, 2.4, 'ash', 1); c.disc(18, 13.5, 2.4, 'ash', 1); c.set(6, 13, 'iron', 4, 1); c.set(18, 13, 'iron', 4, 1) }),
  s_dynamite: () => small(8, 16, c => { c.rect(2, 5, 4, 10, 'red'); c.grad('red', 1, 3); c.rect(2, 8, 4, 1, 'paper', 3, 1); c.line(4, 5, 5, 1, 'bone', 2, 1); c.set(5, 0, 'ember', 4, 1); c.set(6, 1, 'gold', 4, 1) }),
  s_shackle: () => small(14, 10, c => { c.ring(4, 5, 3.6, 2, 'iron', 2); c.ring(10, 5, 3.6, 2, 'iron', 2); c.grad('iron', 1, 3); c.rect(6, 4, 2, 2, 'iron', 4, 1) }),
  s_lavadrop: () => small(8, 12, c => { c.shape((x, y) => (x - 4) ** 2 + (y - 8) ** 2 <= 9 || (y < 8 && y > 1 && Math.abs(x - 4) <= (y - 1) * .45), 'ember'); c.grad('ember', 2, 4); c.set(3, 7, 'gold', 4, 1) }),
  s_feather: () => small(14, 6, c => { c.poly([[0, 3], [10, 0], [14, 3], [10, 6]], 'stone'); c.grad('stone', 1, 4); c.line(1, 3, 13, 3, 'stone', 0, 1); for (const x of [4, 7, 10]) { c.set(x, 1, 'stone', 4, 1); c.set(x, 5, 'stone', 1, 1) } }),
  s_stal: () => small(10, 20, c => { c.poly([[0, 0], [10, 0], [5, 20]], 'stone'); c.grad('stone', 1, 4); c.line(3, 2, 5, 14, 'stone', 4, 1) }),
  s_whirl: () => small(16, 20, c => { for (let i = 0; i < 6; i++) c.ell(8 + Math.sin(i) * 1.5, 3 + i * 3, 7 - i, 1.6, 'ash', 3 - (i % 2)); c.grad('ash', 2, 4) }),
  s_candle: () => small(8, 14, c => { c.rect(2, 6, 4, 8, 'red', 2); c.grad('red', 1, 3); c.rect(1, 13, 6, 1, 'gold', 2); c.set(4, 5, 'ink', 0, 1); c.disc(4, 3, 1.6, 'ember', 4, 1); c.set(4, 1, 'gold', 4, 1) }),
  s_tomb: () => small(16, 20, c => { c.shape((x, y) => x >= 2 && x <= 14 && y >= 4 && y <= 20 || (x - 8) ** 2 + (y - 6) ** 2 <= 36 && y < 6, 'stone'); c.grad('stone', 1, 3); c.rect(7, 7, 2, 8, 'stone', 0, 1); c.rect(5, 9, 6, 2, 'stone', 0, 1); c.set(4, 16, 'leaf', 3, 1); c.set(12, 17, 'leaf', 2, 1) }),
  s_cloth: () => small(16, 10, c => { c.poly([[1, 2], [15, 1], [14, 8], [2, 9]], 'paper', 4); c.grad('paper', 2, 4); c.line(3, 5, 13, 4, 'blue', 3, 1); c.set(8, 7, 'blue', 4, 1) }),
  s_tear: () => small(8, 12, c => { c.shape((x, y) => (x - 4) ** 2 + (y - 8) ** 2 <= 9 || (y < 8 && y > 1 && Math.abs(x - 4) <= (y - 1) * .45), 'violet'); c.grad('violet', 2, 4); c.set(3, 7, 'violet', 4, 1) }),
  s_wave: () => small(8, 16, c => { for (const r of [5, 8]) c.ring(0, 8, r + 1.2, r, 'gold', r === 5 ? 4 : 3) }),
  s_screw: () => small(10, 6, c => { c.rect(0, 1, 3, 4, 'iron', 3); c.rect(3, 2, 6, 2, 'silver', 3); for (const x of [4, 6, 8]) c.set(x, 2, 'silver', 1, 1); c.set(9, 3, 'silver', 4, 1) }),
  s_shieldG: () => small(14, 16, c => { c.shape((x, y) => (y < 8 && x > 1 && x < 13) || (y >= 8 && Math.abs(x - 7) <= 6 * (1 - (y - 8) / 8)), 'blue', 3); c.grad('blue', 2, 4); c.line(7, 2, 7, 13, 'gold', 4, 1); c.line(3, 6, 11, 6, 'gold', 3, 1) }),
  s_debris: () => small(10, 10, c => { c.poly([[1, 3], [6, 0], [9, 4], [8, 9], [2, 8]], 'stone'); c.grad('stone', 1, 4); c.set(5, 4, 'ember', 3, 1) }),
  s_ember: () => small(8, 8, c => { c.ball(4, 4, 3.2, 'ember', 2, 4) }),
};
// ---- peças do mundo que ainda eram desenhadas com retângulos ----
const WORLD = {
  // relógio do puzzle do Lúcio: moldura de bronze com coroa e sininho, mostrador com algarismos, caixa do pêndulo (ponteiros e pêndulo são desenhados no jogo)
  r_clock: () => small(32, 44, c => {
    c.disc(16, 3, 2.6, 'gold', 3); c.poly([[9, 8], [23, 8], [20, 3], [12, 3]], 'bronze', 2);
    c.disc(16, 17, 12.5, 'bronze'); c.grad('bronze', 1, 4); c.ring(16, 17, 12.5, 11.3, 'gold', 3, 1);
    c.disc(16, 17, 10, 'paper'); c.grad('paper', 2, 4);
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; c.set(16 + Math.cos(a) * 8.3, 17 + Math.sin(a) * 8.3, 'ink', k % 3 ? 2 : 0, 1); if (k % 3 === 0) c.set(16 + Math.cos(a) * 7.3, 17 + Math.sin(a) * 7.3, 'ink', 1, 1) }
    c.rect(11, 29, 10, 14, 'wood'); c.grad('wood', 1, 3); c.rect(13, 31, 6, 10, 'ash', 0, 1); c.rect(10, 42, 12, 2, 'bronze', 2);
    c.set(7, 10, 'bronze', 4, 1); c.set(8, 9, 'bronze', 4, 1);
  }),
  // brasa de Héstia (HUD da porta do sino): acesa e apagada, numa tigelinha de bronze
  h_ember: () => small(16, 20, c => { c.ell(8, 17, 6.5, 2.4, 'bronze'); c.grad('bronze', 1, 3);
    c.shape((x, y) => { const t = (y - 2) / 14; return t >= 0 && t <= 1 && Math.abs(x - 8 - Math.sin(t * 5) * .8) <= Math.sin(Math.PI * Math.min(1, t * 1.05) ** .7) * 5 }, 'ember', (x, y) => y < 8 ? 4 : y < 12 ? 3 : 2, 1);
    c.shape((x, y) => (x - 8) ** 2 / 4 + (y - 12) ** 2 / 9 <= 1, 'gold', 4, 1) }),
  h_emberOff: () => small(16, 20, c => { c.ell(8, 17, 6.5, 2.4, 'bronze', 1); c.grad('bronze', 0, 2); c.ell(8, 14.5, 4.5, 2.6, 'ash', 2); c.grad('ash', 1, 3); c.set(7, 14, 'ember', 1, 1); c.set(9, 15, 'ember', 0, 1) }),
  // selo de brasa das portas: pedra escura com a runa da chama
  r_seal: () => small(32, 32, c => { c.rect(0, 0, 32, 32, 'violet', 1); weave(c, 'violet', 5); c.rect(0, 0, 32, 1, 'violet', 2, 1); c.rect(0, 31, 32, 1, 'violet', 0, 1);
    c.rect(2, 2, 28, 28, 'violet', 1); for (const [x, y] of [[3, 3], [27, 3], [3, 27], [27, 27]]) c.rect(x, y, 2, 2, 'gold', 2, 1);
    c.shape((x, y) => { const t = (y - 6) / 20; return t >= 0 && t <= 1 && Math.abs(x - 16) <= Math.sin(Math.PI * Math.min(1, t * 1.1) ** .7) * 7 && !(Math.abs(x - 16) <= Math.sin(Math.PI * Math.min(1, t * 1.1) ** .7) * 4 && t > .35) }, 'gold', 3, 1);
    c.rect(10, 27, 12, 2, 'gold', 2, 1) }),
  // braseiro de bronze em tripé (o fogo é desenhado no jogo)
  r_brazier: () => small(24, 32, c => { c.line(6, 31, 10, 16, 'iron', 2, 1, 2); c.line(18, 31, 14, 16, 'iron', 1, 1, 2); c.line(12, 31, 12, 18, 'iron', 2, 1, 2); c.rect(7, 25, 10, 1, 'iron', 2, 1);
    c.shape((x, y) => y >= 8 && y < 16 && Math.abs(x - 12) <= 10.5 * Math.sqrt(Math.max(0, 1 - ((y - 8) / 8.5) ** 2)), 'bronze'); c.grad('bronze', 1, 3); c.rect(1, 7, 22, 2, 'gold', 3);
    for (let x = 3; x < 21; x += 2) c.set(x, 6, 'ember', (x >> 1) % 2 ? 4 : 2, 1); for (let x = 4; x < 20; x += 3) c.set(x, 5, 'ash', 2, 1) }),
  r_lantern: () => small(16, 24, c => { c.ring(8, 3, 2.6, 1.2, 'iron', 2); c.poly([[3, 8], [13, 8], [11, 5], [5, 5]], 'iron'); c.rect(3, 8, 10, 12, 'ash', 0, 1); for (const x of [3, 8, 12]) c.rect(x, 8, 1, 12, 'iron', x === 3 ? 3 : 1, 1); c.rect(2, 20, 12, 2, 'iron', 2); c.grad('iron', 1, 3) }),
  r_lanternLit: () => small(16, 24, c => { c.ring(8, 3, 2.6, 1.2, 'iron', 2); c.poly([[3, 8], [13, 8], [11, 5], [5, 5]], 'iron'); c.rect(3, 8, 10, 12, 'ember', 3, 1); c.ball(8, 14, 3.4, 'ember', 3, 4); for (const x of [3, 8, 12]) c.rect(x, 8, 1, 12, 'iron', x === 3 ? 3 : 1, 1); c.rect(2, 20, 12, 2, 'iron', 2); c.grad('iron', 1, 3) }),
  // olho de bronze do culto (alvo para flecha): aberto e vigiando, e fechado depois do tiro
  r_eye: () => small(20, 26, c => { c.rect(1, 1, 18, 24, 'bronze', 2); c.grad('bronze', 1, 3); c.ring(10, 13, 8, 6.8, 'gold', 3, 1); c.ell(10, 13, 6, 3.6, 'bone', 4, 1); c.disc(10, 13, 2.6, 'red', 2, 1); c.disc(10, 13, 1.2, 'ash', 0, 1); c.set(9, 12, 'paper', 4, 1);
    for (const [x, y] of [[3, 3], [16, 3], [3, 22], [16, 22]]) c.set(x, y, 'iron', 0, 1) }),
  r_eyeShut: () => small(20, 26, c => { c.rect(1, 1, 18, 24, 'bronze', 1); c.grad('bronze', 0, 2); c.ring(10, 13, 8, 6.8, 'gold', 2, 1); c.ell(10, 13, 6, 3.6, 'bronze', 1, 1); c.line(4, 13, 16, 13, 'ash', 0, 1); for (const x of [6, 9, 12, 15]) c.set(x, 14, 'ash', 1, 1); c.line(3, 4, 17, 22, 'ash', 0, 1) }),
  // pedra com a inscrição dos puzzles
  r_tablet: () => small(20, 24, c => { c.shape((x, y) => x >= 1 && x <= 19 && y >= 4 && y <= 24 || (x - 10) ** 2 + (y - 6) ** 2 <= 81 && y < 6, 'stone'); c.grad('stone', 1, 3); weave(c, 'stone', 6);
    for (const [y, l] of [[8, 10], [11, 12], [14, 8], [17, 11]]) c.line(5, y, 5 + l, y, 'stone', 0, 1); c.set(3, 21, 'leaf', 3, 1); c.set(16, 22, 'leaf', 2, 1) }),
  r_pom: () => small(14, 16, c => { c.ball(7, 9.5, 5.6, 'red', 1, 4); c.poly([[4, 4], [10, 4], [9, 1], [7, 3], [5, 1]], 'gold', 3); c.set(4, 7, 'red', 4, 1); c.set(9, 12, 'red', 0, 1) }),
  // seta da brasa-guia (aponta para a direita; o jogo gira): ponta de brasa entalhada, haste de bronze e cauda de chama
  r_guide: () => small(18, 14, c => {
    c.poly([[0, 2], [4, 5.5], [4, 8.5], [0, 12], [2, 7]], 'red', 2); c.grad('red', 1, 3);
    c.rect(3, 5.5, 7, 3, 'bronze'); c.grad('bronze', 1, 3); c.rect(5, 5.5, 1, 3, 'gold', 3, 1); c.rect(7, 5.5, 1, 3, 'gold', 2, 1);
    c.poly([[8, 0.5], [17.6, 7], [8, 13.5], [10.5, 7]], 'ember', 2); c.grad('ember', 1, 3);
    c.line(9, 1.5, 16, 6.5, 'gold', 3, 1); c.line(12, 7, 15.5, 7, 'gold', 4, 1);
  }),
  // Lembrança de Teo (no sonho): carta dobrada em papel lilás, letra violeta e lacre com uma estrela
  r_lem: () => small(24, 24, c => {
    c.poly([[3, 4], [18, 2], [21, 6], [21, 21], [4, 22]], 'paper'); c.grad('paper', 2, 4);
    c.poly([[18, 2], [17.5, 7], [21, 6]], 'paper', 1, 1); c.line(17.5, 6.5, 21, 6.5, 'paper', 0, 1);
    for (const [y, l] of [[7, 10], [10, 13], [13, 11], [16, 7]]) c.line(6, y, 6 + l, y - .3, 'violet', (y & 1) ? 2 : 1, 1);
    c.ball(15.5, 17.5, 3.2, 'violet', 1, 4); c.set(15, 16, 'paper', 4, 1); c.set(15, 18, 'violet', 0, 1); c.set(14, 17, 'violet', 0, 1); c.set(16, 17, 'violet', 0, 1);
    c.set(4, 5, 'paper', 4, 1); c.set(5, 5, 'paper', 4, 1);
  }),
  // pergaminho das técnicas: rolo de papel com pontas de madeira e fita vermelha
  r_scroll: () => small(24, 20, c => {
    c.rect(4, 4, 16, 12, 'paper'); c.grad('paper', 2, 4);
    for (const [y, l] of [[7, 10], [10, 8], [13, 11]]) c.line(6, y, 6 + l, y, 'ink', 2, 1);
    for (const x of [2, 19]) { c.rect(x, 2, 3, 16, 'wood'); } c.grad('wood', 1, 4);
    for (const x of [3, 20]) { c.set(x, 1, 'gold', 3, 1); c.set(x, 18, 'gold', 2, 1) }
    c.rect(11, 3, 2, 14, 'red', 2, 1); c.ball(12, 10, 2.2, 'red', 1, 4); c.line(12, 12, 10, 17, 'red', 2, 1); c.line(12, 12, 14, 17, 'red', 1, 1);
  }),
  // orbe de vida que cai dos inimigos
  r_orb: () => small(10, 10, c => { c.ball(5, 5, 4.2, 'red', 1, 4); c.set(3, 3, 'paper', 4, 1); c.set(4, 3, 'red', 4, 1) }),
  r_heart: () => small(18, 16, c => { c.heart(9, 8, 6.4, 'red'); c.grad('red', 1, 4); c.ring(9, 8, 8, 7, 'gold', 3, 1, (x, y) => y < 6); c.set(5, 5, 'red', 4, 1); c.set(6, 4, 'red', 4, 1); c.set(9, 9, 'ember', 4, 1) }),
};
// ---- Telma feita a partir das folhas do Teo (t0 = o Teo de capuz): mesmo traço e mesmas animações ----
function readPNG(buf) { // só RGBA 8 bits sem entrelaçamento (o formato das folhas do jogo)
  let o = 8, w, h, idat = [];
  while (o < buf.length) { const len = buf.readUInt32BE(o), type = buf.toString('ascii', o + 4, o + 8), d = buf.slice(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); if (d[8] !== 8 || d[9] !== 6 || d[12]) throw new Error('PNG fora do formato') }
    if (type === 'IDAT') idat.push(d); o += 12 + len }
  const raw = zlib.inflateSync(Buffer.concat(idat)), px = Buffer.alloc(w * h * 4), bpr = w * 4;
  for (let y = 0; y < h; y++) { const f = raw[y * (bpr + 1)], line = raw.slice(y * (bpr + 1) + 1, (y + 1) * (bpr + 1));
    for (let i = 0; i < bpr; i++) { const a = i >= 4 ? px[y * bpr + i - 4] : 0, b = y ? px[(y - 1) * bpr + i] : 0, c = y && i >= 4 ? px[(y - 1) * bpr + i - 4] : 0, x = line[i];
      let v = x; if (f === 1) v = x + a; else if (f === 2) v = x + b; else if (f === 3) v = x + ((a + b) >> 1); else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) }
      px[y * bpr + i] = v & 255 } }
  return { w, h, px };
}
const hexOf = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function teoSheet(html, key) { const m = html.match(new RegExp('  ' + key + ":'data:image/png;base64,([^']*)'")); return m ? readPNG(Buffer.from(m[1], 'base64')) : null }
// recolore um quadro do Teo: capa e capuz marrons viram rosa-poeira (as botas continuam de couro), põe a trança saindo do capuz e o cachecol rosa
function telmaFrame(sh, fr, cw, ch) {
  const out = new Array(cw * ch).fill(null), A = (x, y) => (x >= 0 && y >= 0 && x < cw && y < ch) ? sh.px[(y * sh.w + fr * cw + x) * 4 + 3] > 40 : false;
  let top = ch, bot = 0; for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (A(x, y)) { top = Math.min(top, y); bot = Math.max(bot, y) }
  // cabeça: bordas do capuz um pouco abaixo do topo; o centro dela separa a capa (atrás) do corpo (na frente)
  let hx0 = cw, hx1 = 0; const hy = top + 8; for (let x = 0; x < cw; x++) if (A(x, hy)) { hx0 = Math.min(hx0, x); hx1 = Math.max(hx1, x) }
  const hc = (hx0 + hx1) / 2, neck = top + 15;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const i = (y * sh.w + fr * cw + x) * 4; if (sh.px[i + 3] <= 40) continue;
    let r = sh.px[i], g = sh.px[i + 1], b = sh.px[i + 2]; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 510, sat = mx ? (mx - mn) / mx : 0;
    const skin = r > 140 && r - b > 45 && l > .45, warm = r >= b && sat > .1;
    const hood = y <= neck && !skin && warm, cape = y > neck && y < top + 46 && x < hc - 5 && warm && l < .42;
    if (hood || cape) { const k = Math.min(1, l / .5); r = 64 + 132 * k; g = 34 + 78 * k; b = 50 + 96 * k }
    out[y * cw + x] = hexOf(r, g, b) }
  const P = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < cw && y < ch) out[y * cw + x] = c };
  // trança escura saindo do capuz e caindo pelas costas, com laço rosa na ponta
  for (let i = 0; i < 15; i++) { const bx = hx0 - 1 - i * .3, by = hy + 3 + i; P(bx - 1, by, '#140a06'); P(bx, by, i % 3 === 1 ? '#6a4228' : '#3e2616'); P(bx + 1, by, '#2a180e') }
  P(hx0 - 6, hy + 18, '#ff9ec8'); P(hx0 - 5, hy + 18, '#e07aa8'); P(hx0 - 7, hy + 19, '#e07aa8'); P(hx0 - 4, hy + 19, '#ffc4da');
  // franja escura na testa, saindo do capuz
  for (let x = Math.round(hc); x <= hx1 - 1; x++) { P(x, hy - 2, '#3a2416'); if (x % 2) P(x, hy - 1, '#4e2e1e') }
  // cachecol rosa no pescoço (a orelha do Sr. Bottoms), só da largura do pescoço, com a ponta voando para trás
  for (let y = neck - 1; y < neck + 2; y++) for (let x = Math.round(hc - 4); x <= Math.round(hc + 3); x++) if (A(x, y)) out[y * cw + x] = y === neck - 1 ? '#ffc4da' : y === neck ? '#ea92b4' : '#b05a7e';
  for (let i = 0; i < 6; i++) { P(hc - 5 - i, neck + i * .8, '#ea92b4'); P(hc - 4 - i, neck + 1 + i * .8, '#b05a7e') }
  return { w: cw, h: ch, px: out };
}
function telmaFromTeo(html) {
  const idle = teoSheet(html, 't0Idle'), run = teoSheet(html, 't0Run'); if (!idle || !run) return null;
  const fr = [...[0, 1, 2, 3].map(i => telmaFrame(idle, i, 88, 88)), ...[0, 1, 2, 3].map(i => telmaFrame(run, i, 88, 88))], w = 88 * fr.length, px = new Array(w * 88).fill(null);
  fr.forEach((im, n) => { for (let y = 0; y < 88; y++) for (let x = 0; x < 88; x++) px[y * w + n * 88 + x] = im.px[y * 88 + x] }); return { w, h: 88, px };
}
const sheet = (cw, ch, frames) => { const ims = frames.map(f => { const c = Canvas(cw, ch); f(c); return finish(c) }), w = cw * ims.length, px = new Array(w * ch).fill(null);
  ims.forEach((im, n) => { for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) px[y * w + n * cw + x] = im.px[y * cw + x] }); return { w, h: ch, px } };
const SHEETS = {
  xTelma: { cell: [48, 64], anchor: [24, 63], im: () => sheet(48, 64, [c => telma(c), c => telma(c, { bob: 1 }), c => telma(c, { leg: 0 }), c => telma(c, { leg: 1 }), c => telma(c, { leg: 2 }), c => telma(c, { leg: 3 }), c => telma(c, { sing: true })]) },
  xTelmaKid: { cell: [40, 48], anchor: [20, 47], im: () => sheet(40, 48, [c => telmaKid(c), c => telmaKid(c, { bob: 1 })]) },
  xBotao: { cell: [88, 104], anchor: [44, 103], im: () => sheet(88, 104, [c => plush(c), c => plush(c, { sx: 1.12, sy: .84 }), c => plush(c, { sx: .9, sy: 1.1 }), c => plush(c, { rip: true }), c => plush(c, { rip: true, sx: 1.12, sy: .84 })]) },
  xMaestro: { cell: [64, 120], anchor: [32, 119], im: () => sheet(64, 120, [0, 1, 2, 3].map(p => c => maestro(c, p))) },
};

// ===== PNG =====
function png({ w, h, px }) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; for (let x = 0; x < w; x++) { const c = px[y * w + x], o = y * (w * 4 + 1) + 1 + x * 4; if (!c) continue; const n = parseInt(c.slice(1), 16); raw[o] = n >> 16; raw[o + 1] = n >> 8 & 255; raw[o + 2] = n & 255; raw[o + 3] = 255 } }
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0 }
  const crc = b => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([l, td, cr]) };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const out = {};
for (const k in D) { const c = Canvas(24, 24); D[k](c); out['a_' + k] = finish(c) }
out.r_eco = eco(); out.r_altar = altar(false); out.r_altarLit = altar(true);
Object.assign(out, { w_bow2: BOW(), h_fist0: FIST('leather'), h_fist1: FIST('iron'), h_fist0b: FIST('leather', 1), h_fist1b: FIST('iron', 1) });
Object.assign(out, { s_petal: PETAL(), s_button: BUTTON(), s_cotton: COTTON(), s_rose: ROSE(), s_vine: VINE(), s_note: NOTE(), s_bell: BELL(), r_letterPink: LETTER_PINK() });
for (const k in SIGSPR) out[k] = SIGSPR[k]();
for (const k in WORLD) out[k] = WORLD[k]();
for (const k in SHEETS) out[k] = SHEETS[k].im();
// a Telma de verdade sai das folhas do Teo (se elas existirem no jogo)
{ const tt = telmaFromTeo(fs.readFileSync(path.join(__dirname, '..', 'src', 'cinzas.html'), 'utf8')); if (tt) { out.xTelma = tt; SHEETS.xTelma.cell = [88, 88]; SHEETS.xTelma.anchor = [46, 76] } }

// folha ampliada para conferir
const prev = process.argv[2];
if (prev) {
  const keys = Object.keys(out).filter(k => !SHEETS[k] && !k.startsWith('r_altar')), S = 4, cell = 60, cols = 8, rows = Math.ceil(keys.length / cols), W = Math.max(cols * cell, 8 + 2 * out.xBotao.w), H = rows * cell + 240 + 2 * (out.xTelma.h + out.xTelmaKid.h + out.xBotao.h + out.xMaestro.h) + 40, px = new Array(W * H).fill('#2a1e22');
  const blit = (im, ox, oy, s) => { for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { const c = im.px[y * im.w + x]; if (!c) continue; for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) { const X = ox + x * s + i, Y = oy + y * s + j; if (X < W && Y < H) px[Y * W + X] = c } } };
  keys.forEach((k, n) => blit(out[k], (n % cols) * cell + 6, Math.floor(n / cols) * cell + 6, 2));
  blit(out.r_altar, 10, rows * cell + 8, S); blit(out.r_altarLit, 200, rows * cell + 8, S);
  let yy = rows * cell + 240; for (const k of ['xTelma', 'xTelmaKid', 'xBotao', 'xMaestro']) { blit(out[k], 6, yy, 2); yy += out[k].h * 2 + 10 }
  fs.writeFileSync(prev, png({ w: W, h: H, px }));
}

const src = path.join(__dirname, '..', 'src', 'cinzas.html');
let html = fs.readFileSync(src, 'utf8');
const NL = html.includes('\r\n') ? '\r\n' : '\n';
const block = ['// AMULETOS-INICIO', 'Object.assign(SPRITE_DATA,{', ...Object.keys(out).map(k => `  ${k}:'data:image/png;base64,${png(out[k]).toString('base64')}',`), '});', 'Object.assign(SPRITE_CELL,{' + Object.keys(SHEETS).map(k => k + ':' + JSON.stringify(SHEETS[k].cell)).join(',') + '});', 'Object.assign(SPRITE_ANCHOR,{' + Object.keys(SHEETS).map(k => k + ':' + JSON.stringify(SHEETS[k].anchor)).join(',') + '});', '// AMULETOS-FIM'].join(NL);
const a = html.indexOf('// AMULETOS-INICIO'), b = html.indexOf('// AMULETOS-FIM');
if (a >= 0 && b > a) html = html.slice(0, a) + block + html.slice(b + '// AMULETOS-FIM'.length);
else { const i = html.indexOf('// ITENS-FIM') + '// ITENS-FIM'.length; html = html.slice(0, i) + NL + block + html.slice(i) }
fs.writeFileSync(src, html);
console.log(Object.keys(out).length + ' sprites gravados em src/cinzas.html');
