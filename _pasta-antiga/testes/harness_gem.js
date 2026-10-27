;(function(){let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 const fresh=()=>{newGame();state='play';scr.hidden=true;save.bossDead=save.boss2Dead=save.boss7Dead=true;save.ab.jump=save.ab.wall=save.ab.dash=true;reset();state='play';ents.forEach(e=>e.dead=true);P.inv=0};
 const spawn=(t,x,y)=>{const e=mkEnemy({t,x,y});ents.push(e);return e};
 // armadilhas no lugar certo
 const badF=TRAPS.filter(t=>t.t==='fire'&&!(tile(t.x,t.y)==='.'&&solid(tile(t.x,t.y+1))));ok(!badF.length,'estátuas de fogo em pé no chão '+badF.map(t=>t.x+','+t.y).join(' '));
 const badM=TRAPS.filter(t=>t.t==='mace'&&!(solid(tile(t.x,t.y-1))&&tile(t.x,t.y)==='.'));ok(!badM.length,'bolas de espinho presas no teto '+badM.map(t=>t.x+','+t.y).join(' '));
 fresh();
 for(const tr of TRAPS){if(tr.t!=='mace')continue;const s=trapState(tr);ok(s.by<(Math.floor(s.by/16)+1)*16&&!solid(tile(Math.floor(s.bx/16),Math.floor(s.by/16))),'bola de espinhos em '+tr.x+','+tr.y+' balança no ar (corrente '+Math.round(tr.len)+'px)')}
 // fogo machuca quem está na frente
 {const tr=TRAPS[0];P.x=(tr.x*16+8)-40;P.y=(tr.y+1)*16-22;P.inv=0;const hp=P.hp;let hit=false;for(let i=0;i<200&&!hit;i++){step();if(P.hp<hp)hit=true;P.x=(tr.x*16+8)-40}ok(hit,'estátua cospe fogo e machuca')}
 // bola machuca
 {fresh();const tr=TRAPS.find(t=>t.t==='mace');const hp=P.hp;let hit=false;for(let i=0;i<400&&!hit;i++){const s=trapState(tr);P.x=s.bx-5;P.y=s.by-11;P.vy=0;step();if(P.hp<hp)hit=true}ok(hit,'bola de espinhos machuca')}
 // zumbi
 fresh();const z=spawn('zomb',40,21);ok(z.hidden,'zumbi começa enterrado');const h0=z.hp;P.x=z.x-150;P.y=z.y+z.h-22;run(3);hitEnemy(z,1,0,0);ok(z.hp===h0,'enterrado não leva dano');
 P.x=z.x-50;run(5);ok(!z.hidden,'zumbi sobe quando você chega perto');P.inv=0;const hp=P.hp;P.x=z.x-18;let saw=false;for(let i=0;i<120;i++){step();P.x=z.x-18;if(z.atk==='wind')saw=true}ok(saw&&P.hp<hp,'zumbi avisa e arranha');
 // brutamontes
 fresh();const b=spawn('brute',40,21);P.x=b.x-50;P.y=b.y+b.h-22;P.inv=0;const hp2=P.hp;let w=false;for(let i=0;i<200;i++){step();if(b.atk==='wind')w=true}ok(w&&P.hp<hp2,'brutamontes ergue a clava e acerta');
 b.hp=6;b.atk=null;run(3);ok(b.enr===1,'com metade da vida ele fica furioso');const br=save.bronze;b.hp=0.5;hitEnemy(b,1,0,0);ok(b.dead&&save.bronze===br+1,'brutamontes dá 1 bronze');
 // sacerdote atira
 fresh();const c=spawn('cult',40,21);P.x=c.x-100;P.y=c.y+c.h-22;P.inv=999;let shot=false;for(let i=0;i<200;i++){step();if(shots.length)shot=true}ok(shot,'sacerdote lança fogo');
 // gárgula mergulha
 fresh();const g=spawn('garg',35,17);P.x=g.x;P.y=21*16+16-22;let dive=false;for(let i=0;i<400;i++){step();if(g.mode==='dive')dive=true}ok(dive,'gárgula mergulha');
 // sombra salta
 fresh();const sh=spawn('shadow',40,21);P.x=sh.x-60;P.y=sh.y+sh.h-22;P.inv=999;let lp=false;for(let i=0;i<200;i++){step();if(sh.atk==='leap')lp=true}ok(lp,'sombra dá o bote');
 // baú aberto continua no mapa
 fresh();const ch=chests[0];openChest(ch);state='play';scr.hidden=true;ok(ch.open&&chests.includes(ch),'baú aberto fica no lugar');
 // retratos e logo carregados
 ok(Object.keys(PORTRAITS).length===12&&LOGO.startsWith('data:image/png'),'12 retratos e o logo no jogo');
 ok(['gDamiao','gGuard','gClock','gLucio','gWeaver','gTitan','gGarg','gCult','gShadow','gZomb','gBrute','gChest','gFire','gMace'].every(k=>SPRITE_DATA[k]&&SPRITE_CELL[k]&&SPRITE_ANCHOR[k]),'folhas do Gemini registradas');
 console.log(fails?fails+' FALHA(S)':'TUDO OK')})();
