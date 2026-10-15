;(function(){readEco=function(){};let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 const close=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false);if(state==='msg'){state='play';scr.hidden=true}};
 const fresh=f=>{newGame();state='play';scr.hidden=true;save.ab.jump=save.ab.dash=save.ab.wall=true;if(f)f();reset();state='play';ents.forEach(e=>e.dead=true);P.inv=0};
 const reachOf=w=>{save.weapon=w;let m=0;P.atk={n:1,t:0,hit:new Set()};for(let t=1;t<=curATK()[1].dur;t++){P.atk.t=t;for(const b of blades())m=Math.max(m,Math.abs(b.x-(P.x+P.w/2)))}P.atk=null;return m};
 fresh();ok(save.weapon==='sword'&&save.weapons.length===1,'começa só com a espada');
 const rs=reachOf('sword'),rl=reachOf('spear');save.weapon='sword';ok(rl>rs*1.3,'lança alcança bem mais longe ('+Math.round(rs)+' → '+Math.round(rl)+' px)');
 // foice no cemitério
 fresh(()=>{save.boss2Dead=true});const it=items.find(i=>i.id==='w_scythe');ok(!!it,'foice está no cemitério');P.x=it.x-2;P.y=it.y-4;P.vy=0;run(2);close();ok(save.weapons.includes('scythe')&&save.weapon==='scythe','pegar a foice equipa a arma nova');
 // trocar com T
 save.weapons.push('spear');tapped.swap=true;keys.swap=true;run(1);keys.swap=false;ok(save.weapon==='spear','tecla T troca de arma');
 // foice enche a fúria mais rápido
 save.weapon='sword';P.fury=0;P.blasting=false;addFury(1);const fs=P.fury;save.weapon='scythe';P.fury=0;addFury(1);ok(P.fury>fs*1.5,'foice enche a Erupção mais rápido');
 // martelo: dano dobrado, quebra escudo, terremoto
 fresh();save.weapons.push('hammer');save.weapon='hammer';const g=mkEnemy({t:'guard',x:30,y:21});ents.push(g);g.dir=-1;g.atk=null;P.x=g.x-24;P.y=g.y+g.h-22;P.face=1;
 P.atk={n:1,t:10,hit:new Set()};const h0=g.hp;hitEnemy(g,2,1,0);ok(g.hp<h0,'martelo atravessa o escudo do soldado');P.atk=null;
 P.x=40*16;P.y=22*16-22;run(3);P.atk={n:3,t:0,hit:new Set()};const n0=pshots.length;run(16);ok(pshots.length>=n0+2,'terceiro golpe do martelo solta ondas no chão');
 // Lúcio dá a lança
 fresh(()=>{save.bossDead=save.boss2Dead=true});P.x=250*16;P.y=25*16-22;run(4);B7.state='idle';B7.guard=false;boss=B7;B7.hp=.5;hitBoss(5);for(let i=0;i<140&&state==='play';i++)step();
 let k=0;while(state==='scene'&&k++<40)sceneStep(false);ok(save.weapons.includes('spear'),'derrotar o Lúcio dá a Lança da Guarda');close();
 // Iago dá o martelo
 fresh(()=>{save.boss11Dead=true;save.boss7Dead=true});talk(NPCS.find(n=>n.id==='iago'));let c=0;while(state==='talk'&&c++<40)advanceTalk();ok(save.weapons.includes('hammer'),'Iago dá o Martelo do Bronte');close();
 // aviso de ataque do chefe: só nos últimos quadros
 fresh(()=>{save.bossDead=save.boss2Dead=true});P.x=250*16;P.y=25*16-22;P.inv=99999;run(4);
 let warnFrames=0,longest=0,cur=0,beforeHit=false;for(let i=0;i<900;i++){step();render();close();if(bossWarnOn(boss)){warnFrames++;cur++;longest=Math.max(longest,cur)}else cur=0}
 ok(warnFrames>0,'aparece o aviso antes dos ataques do chefe');ok(longest<=WARN_T,'o aviso é rápido: no máximo '+longest+' quadros (~'+(longest/60).toFixed(2)+'s)');
 B7.state='bashW';B7.t=30;ok(!bossWarnOn(B7),'sem aviso no começo da preparação');B7.t=10;ok(bossWarnOn(B7),'aviso só no final da preparação');
 console.log(fails?fails+' FALHA(S)':'TUDO OK')})();
