;(function(){
  const LS={};globalThis.localStorage={getItem:k=>k in LS?LS[k]:null,setItem:(k,v)=>{LS[k]=String(v)}};
  let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};
  const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
  const feet=()=>((P.y+P.h)/16);
  const place=(tx,ty)=>{P.x=tx*16+3;P.y=ty*16-22;P.vy=0;P.vx=0;P.kbT=0;P.dashT=0;run(4)};
  const finishScene=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false)};
  const close=()=>{finishScene();if(state==='msg'){state='play';scr.hidden=true}};
  const talkTo=id=>{const n=NPCS.find(x=>x.id===id);talk(n);let c=0;while(state==='talk'&&c++<40)advanceTalk()};
  const fresh=(f)=>{newGame();state='play';scr.hidden=true;save.ab.jump=save.ab.dash=save.ab.wall=true;if(f)f();reset();state='play';ents.forEach(e=>e.dead=true);P.inv=0};
  function reach(sx,sf,tf,tx0,tx1){
    for(const dir of [1,-1,0])for(const hs of [0,6,12,18])for(const dbl of [0,8,12,16,22])for(const stopH of [999,20,30]){
      P.hp=99;P.inv=99999;P.x=sx*16+3;P.y=sf*16-22;P.vx=P.vy=0;P.kbT=0;P.dashT=0;P.atk=null;P.plunge=false;keys.left=keys.right=keys.jump=false;run(3);
      if(Math.abs(feet()-sf)>.05)return 'não fica em pé em '+feet().toFixed(2);
      for(let f=0;f<140;f++){keys.right=dir>0&&f>=hs&&f<stopH;keys.left=dir<0&&f>=hs&&f<stopH;
        if(f===0){keys.jump=true;tapped.jump=true}else if(dbl&&f===dbl){keys.jump=true;tapped.jump=true}else if(f===dbl+10||(!dbl&&f===16))keys.jump=false;
        step();if(f>10&&P.ground)break}
      keys.left=keys.right=keys.jump=false;
      const cx=Math.floor((P.x+5)/16);if(P.ground&&Math.abs(feet()-tf)<.05&&cx>=tx0&&cx<=tx1)return 'ok';
    }return null}
  readEco=function(){};

  // ---- mapa ----
  fresh();
  ok(H===100&&grid.length===100,'mundo tem 100 linhas');
  const bad=(arr,f)=>arr.filter(f).map(o=>(o.id||o.t||'')+'@'+o.x+','+o.y).join(' ');
  const onFloor=o=>tile(o.x,o.y)==='.'&&(solid(tile(o.x,o.y+1))||tile(o.x,o.y+1)==='=');
  ok(!bad(STATUES,s=>!(tile(s.x,s.y)==='.'&&solid(tile(s.x,s.y+1)))),'altares no chão '+bad(STATUES,s=>!(tile(s.x,s.y)==='.'&&solid(tile(s.x,s.y+1)))));
  ok(!bad(CHESTS,c=>!onFloor(c)),'baús no chão '+bad(CHESTS,c=>!onFloor(c)));
  ok(!bad(NPCS,n=>!onFloor(n)),'NPCs no chão '+bad(NPCS,n=>!onFloor(n)));
  ok(!bad(ECOS,e=>tile(e.x,e.y)!=='.'),'bilhetes no ar livre '+bad(ECOS,e=>tile(e.x,e.y)!=='.'));
  ok(!bad(TARGETS,t=>tile(t.x,t.y)!=='.'||tile(t.x,t.y+1)!=='.'),'olhos de bronze em lugar livre '+bad(TARGETS,t=>tile(t.x,t.y)!=='.'));
  ok(!bad(WATCHERS,w=>!(tile(w.x,w.y)==='.'&&(solid(tile(w.x,w.y+1))||tile(w.x,w.y+1)==='='))),'observador no chão '+bad(WATCHERS,w=>!(tile(w.x,w.y)==='.'&&(solid(tile(w.x,w.y+1))||tile(w.x,w.y+1)==='='))));
  const badSp=ENEMY_SPAWNS.filter(s=>{const e=mkEnemy(s);const l=Math.floor(e.x/16),r=Math.floor((e.x+e.w-1)/16),t=Math.floor(e.y/16),b=Math.floor((e.y+e.h-1)/16);for(let y=t;y<=b;y++)for(let x=l;x<=r;x++)if(solid(tile(x,y)))return true;return false});
  ok(badSp.length===0,'inimigos fora da parede: '+badSp.map(s=>s.t+'@'+s.x+','+s.y).join(' '));
  // entrar no bosque pelo chão rachado do pântano
  place(10,54);P.vy=-2;run(2);P.y-=30;keys.down=true;run(1);keys.attack=true;tapped.attack=true;run(1);keys.attack=false;keys.down=false;run(90);
  ok(zone==='Bosque de Raízes','golpe de queda no pântano abre o Bosque de Raízes ('+zone+')');
  // caminhos (com os chãos rachados já quebrados, como no jogo)
  for(const [x0,y0,w,h] of [[330,54,3,4],[195,78,3,2]])for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)grid[y][x]='.';
  for(const [sx,sf,tf,a,b,n] of [[10,78,75,12,15,'bosque 1'],[13,75,72,6,9,'bosque 2'],[7,72,69,12,15,'bosque 3'],[13,69,66,6,9,'bosque 4'],[7,66,60,8,11,'bosque 5 (direto ao degrau de cima)'],[13,63,60,8,11,'bosque 6'],[10,60,54,5,14,'bosque volta ao pântano'],
    [16,78,74,22,26,'bosque raiz'],[24,74,71,30,33,'bosque raiz 2'],[32,71,74,38,41,'bosque desce para a plataforma'],
    [111,78,74,110,112,'prisão→poço 1'],[111,74,70,114,116,'prisão→poço 2'],[115,70,66,110,112,'prisão→poço 3'],[111,66,62,113,115,'prisão→poço 4'],[114,62,59,112,114,'prisão→poço 5'],
    [86,78,72,84,87,'mira do olho da cela'],
    [322,98,94,322,325,'ninho 0'],[324,94,91,328,331,'ninho 1'],[329,91,89,326,329,'ninho 2'],[327,89,85,333,336,'ninho 3'],[334,85,81,326,329,'ninho 4'],[327,81,77,333,336,'ninho 5'],[334,77,73,326,329,'ninho 6'],[327,73,69,333,336,'ninho 7'],[334,69,65,326,329,'ninho 8'],[327,65,61,331,334,'ninho 9'],[331,61,54,320,338,'ninho volta à mina'],
    [190,98,94,194,196,'santuário 1'],[195,94,90,198,200,'santuário 2'],[199,90,86,194,196,'santuário 3'],[195,86,82,195,197,'santuário 4'],[196,82,78,150,230,'santuário volta ao templo'],
    [70,98,94,64,66,'lago: degrau 1'],[65,94,90,61,63,'lago: degrau 2'],[62,90,86,60,65,'lago: borda']]){
    const r=reach(sx,sf,tf,a,b);ok(r==='ok','caminho: '+n+' ('+r+')')}
  // lago de fogo: sem asas não atravessa, com asas atravessa
  function crossLake(){P.x=60*16+3;P.y=86*16-22;P.vx=P.vy=0;run(3);keys.left=true;keys.jump=true;tapped.jump=true;run(14);tapped.jump=true;run(1);keys.jump=true;
    let best=99;for(let i=0;i<400;i++){step();best=Math.min(best,(P.x+5)/16);if(P.ground&&P.y>90*16)break}keys.left=keys.jump=false;return {x:(P.x+5)/16,best}}
  let r=crossLake();ok(r.x>35,'sem asas não atravessa o lago de fogo (chegou em '+r.best.toFixed(1)+')');
  fresh(()=>{save.ab.glide=true});r=crossLake();ok(r.x<35.5&&P.y>90*16,'com as Asas de Pedra plana por cima do lago (x '+r.x.toFixed(1)+')');

  // ---- arco ----
  fresh();
  talkTo('cassia');ok(save.ab.bow&&P.arrows===10&&state==='msg','Cássia dá o arco com 10 flechas');close();
  const e=mkEnemy({t:'hop',x:40,y:21});ents.push(e);e.hp=20;e.atk='rec';e.at=9999;place(30,22);P.face=1;
  keys.shoot=true;run(1);keys.shoot=false;run(40);ok(P.arrows===9&&e.hp<20,'toque rápido atira uma flecha que acerta ('+e.hp+')');
  const h1=e.hp;keys.shoot=true;run(40);keys.shoot=false;run(40);ok(e.hp<=h1-2,'flecha carregada dá mais dano ('+h1+'→'+e.hp+')');
  P.arrows=0;keys.shoot=true;run(1);keys.shoot=false;run(5);ok(!pshots.some(s=>s.kind==='arrow'),'sem flechas não atira');
  // alvo de bronze no templo da colheita
  fresh(()=>{save.ab.bow=true;save.arrowsMax=10});ok(tile(77,13)==='G','portão de bronze fechado');P.arrows=10;place(70,16);P.face=1;keys.shoot=true;run(1);keys.shoot=false;run(40);
  ok(tile(77,13)==='.'&&save.flags.tg_a2,'flecha no olho de bronze abre o portão');
  reset();state='play';ok(tile(77,13)==='.','portão continua aberto depois');
  // catacumbas
  P.arrows=10;place(55,37);close();P.face=1;keys.shoot=true;run(1);keys.shoot=false;run(40);ok(save.flags.tg_a1&&tile(63,36)==='.','olho das catacumbas abre o nicho');
  // forja de flechas
  save.bronze=20;save.ash=200;buyForge('quiver');ok(save.arrowsMax===15,'aljava maior: +5 flechas');buyForge('tips');ok(save.tipsLv===1,'pontas de bronze');close();

  // ---- chefes do submundo ----
  function bossTest(B,need,name){const seenS=new Set();P.inv=999999;for(let i=0;i<2600;i++){step();render();close();if(B())seenS.add(B().state)}
    ok(need.every(s=>seenS.has(s)),name+' usa '+need.join(', ')+': '+[...seenS].join(','))}
  function killBoss(B){const b=B();b.state=b.state==='sleep'?'idle':b.state;b.guard=false;boss=b;b.hp=0.5;hitBoss(5);for(let i=0;i<140&&state==='play';i++)step()}
  fresh(()=>{save.ab.bow=true;save.arrowsMax=10});
  place(60,78);run(4);ok(B12&&B12.state!=='sleep'&&tile(51,74)==='#','Brasa Viva acorda e fecha a arena');
  bossTest(()=>B12,['volleyW','dashW','dash','pillarsW','splitW'],'Brasa Viva');
  killBoss(()=>B12);close();ok(save.boss12Dead&&tile(71,74)==='.'&&tile(51,74)==='.','Brasa Viva cai e abre caminho para a prisão');
  talkTo('cassia');ok(save.flags.cassiaR&&save.arrowsMax===15,'Cássia recompensa depois da Brasa Viva');close();
  place(140,78);run(4);ok(B13&&B13.state!=='sleep','Grom acorda');
  bossTest(()=>B13,['whipW','whip','smashW','ballW','cellsW'],'Grom');
  killBoss(()=>B13);ok(state==='scene'&&SC.title.includes('prisão'),'Grom mostra a memória da prisão');close();ok(tile(151,74)==='.','prisão abre para o templo submerso');
  place(212,78);run(4);ok(B14&&B14.state!=='sleep','Estátua Ardente acorda');
  bossTest(()=>B14,['lowW','highW','jet','rocksW'],'Estátua');
  B14.hp=B14.max*.4;bossTest(()=>B14,['gazeW'],'Estátua na 2a fase');
  killBoss(()=>B14);ok(state==='scene'&&SC.title.includes('estátua'),'Estátua mostra memória');close();
  P.arrows=10;place(226,78);P.face=1;keys.shoot=true;run(1);keys.shoot=false;run(30);ok(save.flags.tg_a4&&tile(231,74)==='.','olho do altar abre o atalho para o ninho');
  place(245,98);run(4);ok(B15&&B15.state!=='sleep','Gárgula Rainha acorda');
  bossTest(()=>B15,['diveW','dive','rest','gustW','gust','stonesW','callW'],'Rainha');
  killBoss(()=>B15);close();ok(save.ab.glide,'Rainha dá as Asas de Pedra');
  place(112,98);run(4);ok(B16&&B16.state!=='sleep'&&tile(99,92)==='#'&&tile(131,92)==='#','Redemoinho acorda e fecha os dois lados');
  bossTest(()=>B16,['idle','calm'],'Redemoinho');
  killBoss(()=>B16);close();ok(save.ab.fire&&tile(99,92)==='.','Redemoinho dá as flechas de fogo');
  place(15,98);run(4);ok(B17&&B17.state!=='sleep','Kalas acorda');
  bossTest(()=>B17,['teleW','rainW','beamW','beam','summonW','orbsW'],'Kalas');
  killBoss(()=>B17);ok(state==='scene'&&SC.title.includes('pedido'),'Kalas revela o pedido');close();ok(save.boss17Dead,'Kalas cai');
  // Colosso solta romã
  fresh(()=>{save.boss7Dead=true});place(280,54);run(4);let pom=false;for(let i=0;i<900&&!pom;i++){step();close();if(items.some(it=>it.id==='pom'))pom=true}ok(pom,'na luta do Colosso caem romãs');

  // ---- NPCs e mistério ----
  fresh(()=>{save.flags.tg_a3=1});ok(tile(92,75)==='.','cela do Heitor aberta pelo olho');const mh=save.maxHp;talkTo('heitor');ok(save.maxHp===mh+1,'Heitor dá um coração');close();
  talkTo('caio');ok(state==='play','Irmão Caio conversa');
  ok(INTRO.some(l=>l.includes('bilhete')),'a introdução apresenta o bilhete');
  fresh();ok(endingLines().some(l=>l.includes('manto vermelho')),'final comum deixa o mistério aberto');
  save.boss17Dead=true;ok(!trueEnd()&&endingLines().some(l=>l.includes('pela metade')),'sem todos os ecos não é o final verdadeiro');
  save.taken.push(...ECOS.map(e=>e.id));ok(trueEnd()&&endingLines().some(l=>l.includes('Lembrou')),'com Kalas e todos os ecos: final verdadeiro');
  // observador some quando você chega perto
  fresh();const w=WATCHERS[0];place(w.x-30,w.y+1);run(2);ok(!watchGone.has(0),'observador visível de longe');place(w.x-4,w.y+1);run(2);ok(watchGone.has(0),'observador some quando você chega perto');
  // olho do herói sem risco extra
  ok(!String(drawHeroSprite).includes('brilho do visor'),'sem o risco extra no visor do herói');
  console.log(fails?fails+' FALHA(S)':'TUDO OK');
})();
