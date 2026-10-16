;(function(){readEco=function(){};let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 const fresh=f=>{newGame();state='play';scr.hidden=true;if(f)f();reset();state='play';ents.forEach(e=>e.dead=true);P.inv=0};
 // animação de morte
 fresh();P.x=8*16;P.y=22*16-22;P.vy=0;P.inv=99999;run(5);
 const e=mkEnemy({t:'hound',x:12,y:21});ents.push(e);P.atk={n:1,t:5,hit:new Set()};hitEnemy(e,99,1,0);P.atk=null;
 ok(corpses.length===1&&corpses[0].kind==='blood','morte deixa um corpo animado');
 run(30);ok(corpses[0]&&corpses[0].landed&&Math.abs(corpses[0].ang)>1,'o corpo cai e tomba de lado');
 const st0=stains.length;run(40);ok(stains.length>st0,'o corpo forma poça de sangue');
 run(80);ok(corpses.length===0,'o corpo vira cinza e some');
 const sk=mkEnemy({t:'hop',x:12,y:21});ents.push(sk);P.atk={n:1,t:5,hit:new Set()};hitEnemy(sk,99,1,0);P.atk=null;run(60);ok(corpses.length===0,'esqueleto desmorona em ossos');
 const gh=mkEnemy({t:'shade',x:12,y:19});ents.push(gh);P.atk={n:1,t:5,hit:new Set()};hitEnemy(gh,99,1,0);P.atk=null;ok(corpses[0]&&corpses[0].kind==='ghost','fantasma sobe e se desfaz');run(60);ok(corpses.length===0,'fantasma some');
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
