;(function(){readEco=function(){};let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 const fresh=f=>{newGame();state='play';scr.hidden=true;if(f)f();reset();state='play';ents.forEach(e=>e.dead=true);P.inv=0};
 // animação de morte
 fresh();P.x=8*16;P.y=22*16-22;P.vy=0;P.inv=99999;run(5);
 const kill=(t,x,y)=>{save.flags.lvInfo=1;if(state==='msg'){state='play';scr.hidden=true}const e=mkEnemy({t,x,y});e.hidden=false;e.rise=0;ents.push(e);P.atk={n:1,t:5,hit:new Set()};hitEnemy(e,999,1,0);P.atk=null;return e};
 fxp=[];corpses=[];kill('hound',12,21);ok(fxp.filter(p=>p.blood).length>40&&fxp.some(p=>p.wave),'cão explode em sangue');
 {const c=corpses[corpses.length-1];ok(c&&c.gib==='blood'&&c.pieces.length===4,'cão é desmembrado em 4 pedaços do próprio desenho')}
 run(150);ok(corpses.length===1&&corpses[0].pieces.every(p=>p.rest),'os pedaços caem e ficam parados no chão');
 run(90);ok(stains.length>10,'o sangue mancha o chão');
 run(200);ok(corpses.length===0,'os pedaços somem depois de um tempo');
 fxp=[];stains=[];kill('bro',12,21);ok(fxp.filter(p=>p.add&&p.ramp).length>5&&stains.length>0,'mago de fogo explode em fogo e deixa marca queimada');
 {const c=corpses[corpses.length-1];ok(c&&c.gib==='fire'&&c.pieces.length>=4,'mago de fogo se parte em pedaços queimados')}
 corpses=[];kill('zomb',12,21);ok(corpses[0]&&corpses[0].how==='zombie'&&corpses[0].pieces.length===3,'zumbi desmonta em 3 pedaços');
 run(40);{const ps=corpses[0].pieces;ok(Math.abs(ps[0].px-ps[2].px)+Math.abs(ps[0].py-ps[2].py)>4,'os pedaços se separam')}
 run(100);ok(corpses.length===0,'pedaços somem');
 kill('hop',12,21);ok(corpses[0]&&corpses[0].how==='bone','esqueleto desaba em ossos');run(140);ok(corpses.length===0,'ossos somem');
 kill('garg',12,21);ok(corpses[0]&&corpses[0].how==='stone','gárgula vira pedra');run(40);ok(corpses.length===0&&fxp.some(p=>p.col==='#6a6a72'||p.col==='#8a8a92'),'pedra se desfaz');
 kill('garg',12,14);run(12);ok(corpses[0]&&corpses[0].fly,'gárgula no ar cai petrificada');run(80);ok(corpses.length===0,'e se espatifa no chão');
 kill('shade',12,19);ok(corpses[0]&&corpses[0].how==='ghost','fantasma sobe e se desfaz');run(60);ok(corpses.length===0,'fantasma some');
 fxp=[];kill('thing',12,21);ok(fxp.some(p=>p.blood&&GORE_COL.ichor.includes(p.col)),'criatura do pântano estoura em gosma');
 // sangue na parede e na tela
 fresh();stains=[];fxp.push({x:1*16+15,y:20*16,vx:-3,vy:-1,g:0,life:30,max:30,col:'#b01010',size:1,blood:true});state='play';P.x=8*16;P.y=22*16-22;run(8);
 ok(stains.some(s=>s.wall),'gota que bate na parede mancha a parede');
 P.inv=0;P.hp=5;splats=[];hurtPlayer(1,{x:0,y:0,w:1,h:1});ok(splats.length>=2,'apanhar respinga sangue na tela');P.inv=0;run(200);ok(splats.length===0,'respingos somem');
 // movimento
 fresh();fxp=[];landFx(100,100,9);ok(fxp.some(p=>p.wave)&&fxp.length>8,'aterrissar levanta poeira e onda');
 // objetivo e pensamentos
 fresh();ok(objective().includes('catacumbas'),'objetivo no começo: catacumbas');
 save.ab.jump=true;ok(objective().startsWith('Derrote o Corcel da Festa'),'depois das botas: '+objective());
 save.bossDead=true;save.ab.dash=save.ab.wall=true;save.boss2Dead=true;ok(objective().includes('brasas do sino'),'brasas do sino');
 fresh();objLast=null;state='play';run(31);ok(objT>0&&objLast,'objetivo aparece na tela');
 thought=null;save.flags.th={};thinkAbout('Catacumbas');ok(thought&&thought.txt.includes('túneis'),'Teo pensa ao entrar numa área');thought=null;thinkAbout('Catacumbas');ok(!thought,'cada pensamento só uma vez');
 // cenas de cinema
 fresh();save.flags.chaps=[];scene('Memória · A festa',['um','dois'],()=>{});ok(SC.i===-1&&SC.chap.n==='Capítulo I','memória abre com cartão de capítulo');
 sceneStep(false);ok(SC.i===0&&SC.typing,'texto aparece letra por letra');ok(finishType()&&!SC.typing,'primeiro toque completa o texto');
 sceneStep(false);sceneStep(false);ok(state==='play'&&!SC,'cena termina');
 scene('Memória · A cova',['x'],()=>{});ok(SC.chap.n==='Capítulo II','capítulos numerados na ordem em que aparecem');sceneStep(true);
 console.log(fails?fails+' FALHA(S)':'TUDO OK');setTimeout(()=>process.exit(fails?1:0),50)})();
