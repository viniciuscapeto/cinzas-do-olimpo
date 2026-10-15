;readEco=function(){};
;(function(){
  const LS={};globalThis.localStorage={getItem:k=>k in LS?LS[k]:null,setItem:(k,v)=>{LS[k]=String(v)}};
  let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};
  const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
  const feet=()=>((P.y+P.h)/16);
  const place=(tx,ty)=>{P.x=tx*16+3;P.y=ty*16-22;P.vy=0;P.vx=0;P.kbT=0;P.dashT=0;run(4)};
  const finishScene=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false)};
  const talkTo=id=>{const n=NPCS.find(x=>x.id===id);talk(n);let c=0;while(state==='talk'&&c++<40)advanceTalk()};
  const fresh=()=>{newGame();state='play';scr.hidden=true;ents.forEach(e=>e.dead=true);P.inv=0};
  function reach(sx,sf,tf,tx0,tx1){
    for(const dir of [1,-1,0])for(const hs of [0,6,12,18])for(const dbl of [0,8,12,16,22])for(const stopH of [999,20,30]){
      P.hp=99;P.inv=99999;P.x=sx*16+3;P.y=sf*16-22;P.vx=P.vy=0;P.kbT=0;P.dashT=0;P.atk=null;P.plunge=false;keys.left=keys.right=keys.jump=false;run(3);
      if(Math.abs(feet()-sf)>.05)return 'não fica em pé';
      for(let f=0;f<120;f++){keys.right=dir>0&&f>=hs&&f<stopH;keys.left=dir<0&&f>=hs&&f<stopH;
        if(f===0){keys.jump=true;tapped.jump=true}else if(dbl&&f===dbl){keys.jump=true;tapped.jump=true}else if(f===dbl+10||(!dbl&&f===16))keys.jump=false;
        step();if(f>10&&P.ground)break}
      keys.left=keys.right=keys.jump=false;
      const cx=Math.floor((P.x+5)/16);if(P.ground&&Math.abs(feet()-tf)<.05&&cx>=tx0&&cx<=tx1)return 'ok';
    }return null}

  // ---- mapa da região nova ----
  fresh();
  ok(tile(260,22)==='#','porto fechado antes de Lúcio');
  save.boss7Dead=save.boss2Dead=true;save.ab.jump=save.ab.dash=save.ab.wall=true;reset();state='play';ents.forEach(e=>e.dead=true);
  ok(tile(260,22)==='.','porto aberto depois de Lúcio');
  place(255,25);keys.right=true;run(90);keys.right=false;run(5);ok(zone==='Porto das Cinzas','anda do pátio até o porto ('+zone+')');
  ok(CHESTS.every(c=>tile(c.x,c.y)==='.'&&(solid(tile(c.x,c.y+1))||tile(c.x,c.y+1)==='=')),'baús no chão: '+CHESTS.filter(c=>!(tile(c.x,c.y)==='.'&&(solid(tile(c.x,c.y+1))||tile(c.x,c.y+1)==='='))).map(c=>c.id).join(' '));
  ok(STATUES.every(s=>tile(s.x,s.y)==='.'&&solid(tile(s.x,s.y+1))),'altares no chão');
  ok(NPCS.every(n=>tile(n.x,n.y)==='.'&&(solid(tile(n.x,n.y+1))||tile(n.x,n.y+1)==='=')),'NPCs no chão: '+NPCS.filter(n=>!(tile(n.x,n.y)==='.'&&(solid(tile(n.x,n.y+1))||tile(n.x,n.y+1)==='='))).map(n=>n.id).join(' '));
  const badSp=ENEMY_SPAWNS.filter(s=>{const e=mkEnemy(s);const l=Math.floor(e.x/16),r=Math.floor((e.x+e.w-1)/16),t=Math.floor(e.y/16),b=Math.floor((e.y+e.h-1)/16);for(let y=t;y<=b;y++)for(let x=l;x<=r;x++)if(solid(tile(x,y)))return true;return false});
  ok(badSp.length===0,'inimigos fora da parede: '+badSp.map(s=>s.t+'@'+s.x+','+s.y).join(' '));
  ents.forEach(e=>e.dead=true);const keep10=B10;B10=null;
  for(const [sx,sf,tf,a,b,n] of [[300,25,22,302,304,'farol 1'],[303,22,19,306,308,'farol 2'],[307,19,16,302,304,'farol 3'],[303,16,13,306,308,'farol 4'],[307,13,8,301,308,'farol topo'],
     [333,25,39,320,338,'cai na mina'],[330,39,35,331,333,'mina sobe 1'],[332,35,31,334,336,'mina sobe 2'],[335,31,25,330,338,'mina volta ao porto'],
     [292,54,50,293,295,'fundo 1'],[294,50,44,296,301,'fundo 2 (direto ao degrau de cima)'],[300,47,44,296,299,'fundo 3'],[298,44,39,290,305,'fundo volta à mina']]){
    const r=reach(sx,sf,tf,a,b);ok(r==='ok','caminho: '+n+' ('+r+')')}
  B10=keep10;

  // ---- baús, bronze, forja, frascos ----
  fresh();save.ab.jump=true;
  const c=chests.find(x=>x.id==='c1');P.x=c.x-14;P.y=c.y+c.h-22;P.face=1;run(2);keys.attack=true;tapped.attack=true;run(1);keys.attack=false;run(20);
  ok(save.bronze===2&&save.chests.includes('c1'),'golpear o baú abre e dá bronze');
  reset();state='play';ok(chests.find(x=>x.id==='c1').open,'baú aberto continua aberto');
  ok(P.flasks===2,'começa com 2 frascos');P.hp=1;place(30,22);ents.forEach(e=>e.dead=true);tapped.heal=true;keys.heal=true;run(1);keys.heal=false;run(45);
  ok(P.hp===3&&P.flasks===1,'beber frasco cura 2 ('+P.hp+') e gasta um');
  P.hp=1;tapped.heal=true;run(1);run(10);P.inv=0;hurtPlayer(1,{x:P.x+20,y:P.y,w:4,h:4});run(40);ok(P.flasks===1,'levar golpe enquanto bebe cancela sem gastar');
  // altar: menu, forja
  save.bronze=10;save.ash=200;talkTo('hefesto');state='play';scr.hidden=true;
  place(6,22);run(5);ok(P.onStatue>=0,'em cima do altar');keys.down=true;tapped.down=true;run(1);keys.down=false;
  ok(state==='msg'&&panel.innerHTML.includes('A brasa responde'),'baixo no altar abre o menu');
  forgeMenu();ok(panel.innerHTML.includes('Afiar a espada'),'forja abre do altar');
  buyForge('sword');ok(save.swordLv===1&&save.bronze===8&&save.ash===170,'forjar espada gasta bronze e cinzas');
  const h=mkEnemy({t:'hop',x:20,y:21});h.hp=10;hitEnemy(h,1,0,0);ok(Math.abs(h.hp-8.75)<.01,'espada +1 dá 25% a mais de dano');
  buyForge('flask');ok(save.flaskMax===3&&P.flasks===3,'mais um frasco');
  // amuletos
  save.charms=['ferro','pena','sangue','longa'];charmMenu();toggleCharm('ferro');ok(maxHp()===save.maxHp+1,'Coração de Ferro dá +1 de vida');
  toggleCharm('sangue');ok(slotsUsed()===2&&!hasCharm('sangue'),'sem espaço não equipa (3 espaços, ferro usa 2)');
  toggleCharm('pena');ok(hasCharm('pena')&&slotsUsed()===3,'equipa amuleto de 1 espaço');
  toggleCharm('ferro');toggleCharm('sangue');P.inv=0;state='play';scr.hidden=true;const hp0=P.hp;hurtPlayer(1,{x:P.x+20,y:P.y,w:4,h:4});ok(P.hp===hp0-2,'Pacto de Cinza: leva 2 de dano');
  // viagem
  save.lit=[1,3];altarMenu();travelMenu();ok(panel.innerHTML.includes('Templo da Colheita'),'lista de viagem mostra altares acesos');
  travelTo(3);ok(state==='play'&&Math.floor(P.x/16)===50&&save.cp.x===50,'viaja para outro altar');
  // descansar devolve inimigos e frascos
  P.flasks=0;ents.forEach(e=>e.dead=true);restAtAltar();ok(P.flasks===save.flaskMax&&ents.some(e=>!e.dead),'descansar enche frascos e traz inimigos de volta');

  // ---- provas, loja, Iago ----
  fresh();save.boss7Dead=true;save.boss2Dead=true;reset();state='play';ents.forEach(e=>e.dead=true);
  talkTo('bras');ok(state==='msg'&&panel.innerHTML.includes('Provas da guarda'),'Brás oferece as provas');
  startTrial(0);P.inv=999999;ok(tile(240,20)==='#','arena da prova fechada');
  let g=0;while(trial&&g++<4000){step();for(const e of ents)if(e.trial&&!e.dead&&trial.t===0&&g%20===0){e.hp=0;e.dead=true}}
  ok(!trial&&save.trials[0]&&save.bronze>=3,'vence a prova 1 e ganha bronze');ok(tile(240,20)==='.','arena reabre');state='play';scr.hidden=true;
  save.ash=100;talkTo('zoe');ok(state==='msg'&&panel.innerHTML.includes('Zoe'),'Zoe abre a loja');buyShop('ima');ok(save.charms.includes('ima')&&save.ash===40,'compra amuleto com cinzas');
  buyShop('bronze');ok(save.ash===40,'sem cinzas suficientes não compra');state='play';scr.hidden=true;
  save.boss11Dead=true;const br=save.bronze;talkTo('iago');ok(save.bronze===br+4,'Iago dá bronze depois do Colosso');state='play';scr.hidden=true;

  // ---- chefes novos ----
  function bossTest(B,need,name){const seenS=new Set();P.inv=999999;for(let i=0;i<2400;i++){step();render();if(state==='scene')finishScene();if(state==='msg'){state='play';scr.hidden=true}if(B())seenS.add(B().state)}
    ok(need.every(s=>seenS.has(s)),name+' usa '+need.join(', ')+': '+[...seenS].join(','))}
  fresh();save.boss7Dead=save.boss2Dead=true;save.ab.jump=save.ab.dash=save.ab.wall=true;reset();state='play';ents.forEach(e=>e.dead=true);
  place(315,8);run(4);ok(B10&&B10.state!=='sleep'&&tile(304,8)==='#','Helena acorda e o topo do farol fecha');
  bossTest(()=>B10,['beamW','beam','orbsW','swoopW','swoop','rest','wailW'],'Helena');
  // dá para acertar ela pulando quando flutua?
  B10.state='rest';B10.t=9999;B10.x=315*16;B10.y=8*16-B10.h;let hh=B10.hp;P.x=B10.x-16;P.y=8*16-22;P.face=1;run(2);keys.attack=true;tapped.attack=true;run(1);keys.attack=false;run(14);ok(B10.hp<hh,'Helena no chão leva golpe');
  B10.state='idle';B10.hp=1;hitBoss(5);for(let i=0;i<130&&state==='play';i++)step();ok(state==='scene'&&SC.title.includes('farol'),'vencer Helena mostra a memória do farol');finishScene();
  ok(state==='msg'&&save.charms.includes('lanterna'),'Helena dá a Lanterna');state='play';scr.hidden=true;ok(tile(304,8)==='=','topo reabre');
  place(275,54);run(4);ok(B11&&B11.state!=='sleep'&&tile(289,50)==='#','Colosso acorda e a fornalha fecha');
  bossTest(()=>B11,['stompW','stomp','boulderW','ventW','chargeW','charge'],'Colosso');
  B11.state='idle';B11.hp=1;hitBoss(5);for(let i=0;i<130&&state==='play';i++)step();ok(state==='scene'&&SC.title.includes('autômato'),'vencer o Colosso mostra a memória');finishScene();
  ok(save.charms.includes('ferro')&&save.boss11Dead,'Colosso dá o Coração de Ferro');state='play';scr.hidden=true;

  // ---- Nova Noite+ ----
  save.swordLv=2;save.charms.push('pena');newNightPlus();finishScene();
  ok(save.ng===1&&save.swordLv===2&&save.charms.includes('pena')&&!save.bossDead&&save.ab.wall,'Nova Noite+ mantém melhorias e recomeça a história');
  ok(B1.max>28,'na Noite+ os chefes têm mais vida ('+B1.max+')');

  // ---- alta resolução ----
  cv.getBoundingClientRect=()=>({width:1280});globalThis.devicePixelRatio=1;RS=1;fitRes();
  ok(RS===4&&cv.width===1280,'no PC desenha em 1280x720 (escala '+RS+')');
  fresh();save.boss7Dead=save.boss2Dead=true;reset();state='play';
  for(const [x,y] of [[270,25],[310,8],[300,39],[275,54],[320,54],[30,22],[164,54]]){place(x,y);run(3)}
  ok(true,'desenha todas as áreas em alta resolução sem erro');
  console.log(fails?fails+' FALHA(S)':'TUDO OK');
})();
