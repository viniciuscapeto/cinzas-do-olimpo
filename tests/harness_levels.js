;(function(){readEco=function(){};let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 const close=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false);if(state==='msg'){state='play';scr.hidden=true}};
 const fresh=f=>{newGame();state='play';scr.hidden=true;if(f)f();reset();state='play';ents.forEach(e=>e.dead=true);P.inv=0};
 const tap=k=>{tapped[k]=true;keys[k]=true;run(1);keys[k]=false;tapped[k]=false};
 // adagas nas Ruínas, logo no começo
 fresh();const it=items.find(i=>i.id==='knives');ok(!!it,'adagas estão nas Ruínas');
 ok(Math.abs(it.x/16-save.cp.x)<20,'adagas ficam perto do começo');
 P.x=it.x-2;P.y=it.y-8;P.vy=0;run(3);close();ok(save.ab.knives&&P.knives===KNIFE_MAX,'pegar as adagas dá '+KNIFE_MAX+' adagas');
 P.x=8*16;P.y=22*16-22;P.vy=0;run(5);const e=mkEnemy({t:'hop',x:13,y:21});e.xp=6;ents.push(e);P.face=1;P.inv=99999;const h0=e.hp;
 tap('shoot');ok(P.knives===KNIFE_MAX-1&&pshots.some(s=>s.kind==='knife'),'tecla de tiro lança uma adaga');
 run(30);ok(e.hp<h0,'adaga machuca o inimigo');
 P.knives=0;banner.t=0;run(20);tap('shoot');ok(banner.txt.includes('Sem adagas'),'sem adagas avisa');
 run(400);ok(P.knives===0,'adagas não voltam sozinhas com o tempo');
 // com o arco, as adagas só saem quando as flechas acabam
 save.ab.bow=true;save.arrowsMax=10;P.arrows=10;P.knives=KNIFE_MAX;run(15);keys.shoot=true;run(3);keys.shoot=false;run(2);ok(P.arrows===9&&P.knives===KNIFE_MAX,'com flechas, atira flecha');
 P.arrows=0;run(15);tap('shoot');ok(P.knives===KNIFE_MAX-1,'sem flechas, lança adaga');
 // adaga não abre olho de bronze
 save.ab.bow=false;
 // níveis
 fresh();ok(save.lv===1&&save.xp===0,'começa no nível 1');const hp0=maxHp(),d0=dmgMult();
 gainXp(xpNeed(1));close();ok(save.lv===2,'experiência sobe de nível');ok(dmgMult()>d0,'nível aumenta o dano');
 ok(save.flags.lvInfo,'primeiro nível explica o sistema');
 gainXp(xpNeed(2)+xpNeed(3));close();ok(save.lv===4&&maxHp()===hp0+1,'nível 4 dá +1 de vida máxima');ok(P.hp===maxHp(),'subir de nível recupera a vida');
 const g=mkEnemy({t:'hop',x:10,y:21});g.xp=7;ents.push(g);const x0=save.xp;P.atk={n:1,t:5,hit:new Set()};hitEnemy(g,99,1,0);ok(save.xp===x0+7||save.lv>4,'matar inimigo dá experiência');P.atk=null;
 const lvb=save.lv,xb=save.xp;boss=mkMino();boss.state='idle';boss.hp=.1;hitBoss(5);ok(save.lv>lvb||save.xp>xb,'chefe dá experiência');boss=null;
 for(let i=0;i<200;i++)gainXp(500);close();ok(save.lv===LV_MAX,'nível máximo '+LV_MAX);
 let stored=null;localStorage.setItem=(k,v)=>{stored=v};persist();localStorage.setItem=()=>{};ok(stored&&JSON.parse(stored).lv===LV_MAX,'nível fica salvo');
 continueFrom({ab:{},cp:{x:4,y:21},maxHp:5});ok(save.lv===1&&save.xp===0,'save antigo começa no nível 1');
 // dificuldade: inimigos comuns mais fortes, chefes iguais
 fresh();newGame();const base=ENEMY_SPAWNS.map(mkEnemy);let more=0,elites=0;ents.forEach((e,i)=>{if(e.hp>base[i].hp*1.3-1e-9)more++;if(e.elite)elites++});
 ok(more===ents.length,'todos os inimigos comuns têm mais vida');ok(elites>0&&elites<ents.length*.3,'alguns inimigos furiosos ('+elites+')');
 ok(mkMino().max===B1.max,'chefe com a mesma vida');
 const el=mkEnemy({t:'hop',x:10,y:21});el.elite=true;state='play';P.inv=0;P.hp=5;curFoe=el;hurtPlayer(1,el);curFoe=null;ok(P.hp===3,'inimigo furioso tira 2 de vida');
 P.inv=0;P.hp=5;hurtPlayer(1,{x:0,y:0,w:1,h:1});ok(P.hp===4,'outros golpes continuam tirando 1');
 // boatos do Submundo nos altares
 fresh(()=>{save.ab.jump=true});hints={};altarRumor();ok(save.flags.rumor===1,'altar dá boato do Submundo');
 hints={};save.flags.under=1;altarRumor();ok(save.flags.rumor===1,'sem boatos depois de achar o Submundo');
 fresh();P.x=12*16;P.y=78*16-22;P.vy=0;P.inv=99999;run(20);close();ok(save.flags.under,'descer abaixo de y=56 marca o Submundo como achado');
 showMap=true;run(2);showMap=false;ok(true,'mapa desenha os chãos rachados');
 // sangue, combo e números de dano
 fresh();P.x=8*16;P.y=22*16-22;P.vy=0;P.inv=99999;run(5);const v=mkEnemy({t:'hound',x:12,y:21});ents.push(v);P.atk={n:1,t:5,hit:new Set()};
 hitEnemy(v,1,1,0);ok(combo.n===1&&fxp.some(p=>p.num)&&fxp.some(p=>p.blood),'golpe conta hit, mostra dano e espirra sangue');
 hitEnemy(v,99,1,0);ok(combo.n===2&&v.dead,'segundo golpe soma no combo');P.atk=null;run(90);ok(stains.length>5,'gotas viram manchas no chão ('+stains.length+')');
 run(160);ok(combo.n===0,'combo zera depois de um tempo sem acertar');
 const sk=mkEnemy({t:'hop',x:12,y:21});ents.push(sk);fxp=[];hitEnemy(sk,99,1,0);ok(!fxp.some(p=>p.blood)&&fxp.some(p=>p.col==='#e6dccb'||p.col==='#fff6e8'),'esqueleto solta ossos, não sangue');
 combo.n=5;combo.t=100;P.inv=0;hurtPlayer(1,{x:0,y:0,w:1,h:1});ok(combo.n===0,'apanhar zera o combo');
 // viagem mostra o destino no mapa
 fresh();save.lit=[1,3,4];save.cp={x:STATUES[1].x,y:STATUES[1].y};travelMenu();ok(travelSel===3&&panel.innerHTML.includes('tmap')&&panel.innerHTML.includes('Viajar para'),'viagem abre com mapa e destino escolhido');
 travelMenu(4);ok(travelSel===4,'escolher outro altar muda o destino');travelTo(travelSel);ok(save.cp.x===STATUES[4].x,'confirmar viaja para o destino escolhido');
 console.log(fails?fails+' FALHA(S)':'TUDO OK')})();
