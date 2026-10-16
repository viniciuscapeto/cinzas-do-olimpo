;(function(){const run=n=>{for(let i=0;i<n;i++){step();render()}};let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 newGame();state='play';scr.hidden=true;save.boss2Dead=true;save.ab.jump=true;reset();state='play';ents.forEach(e=>e.dead=true);
 P.x=195*16+3;P.y=9*16-22;P.inv=999999;run(4);ok(B6.state!=='sleep','guardião acorda');
 P.x=183*16+3;let first=-1;for(let i=0;i<900&&first<0;i++){step();if(items.some(it=>it.id==='pom'))first=i}
 ok(first>=0,'cai romã na luta do relógio (primeira em '+(first/60).toFixed(1)+'s)');
 const pm=items.find(it=>it.id==='pom');let land=false;for(let i=0;i<120&&pm&&items.includes(pm);i++){step();if(pm.vy===0&&pm.y>5*16)land=true}
 ok((land&&pm.y+pm.h<=9*16+.5)||(pm&&!items.includes(pm)&&overlap(pm,P)),'a romã cai até o chão da sala (y '+(pm?((pm.y+pm.h)/16).toFixed(2):'-')+')');
 console.log(fails?fails+' FALHA(S)':'TUDO OK')})();
