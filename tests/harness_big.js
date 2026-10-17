;readEco=function(){};
;(function(){
  const LS={};globalThis.localStorage={getItem:k=>k in LS?LS[k]:null,setItem:(k,v)=>{LS[k]=String(v)}};
  let fails=0;
  const run=(n)=>{for(let i=0;i<n;i++){step();render()}};
  const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
  const place=(tx,ty)=>{P.x=tx*16+3;P.y=ty*16-22;P.vy=0;P.vx=0;P.kbT=0;P.dashT=0;run(4)};
  const finishScene=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false)};
  const feet=()=>((P.y+P.h)/16);
  const fresh=()=>{newGame();state='play';scr.hidden=true;ents.forEach(e=>e.dead=true);P.inv=0};
  // pulo com direção: segura dir, pula, opcional pulo duplo no topo
  function jumpTo(dir,dbl,frames){keys.right=dir>0;keys.left=dir<0;keys.jump=true;tapped.jump=true;run(1);run(dbl?12:16);keys.jump=false;run(1);
    if(dbl){keys.jump=true;tapped.jump=true;run(1);run(14);keys.jump=false}run(frames||50);keys.left=keys.right=false;run(10)}

  // ---------- mundo ----------
  fresh();
  ok(W===560&&grid[0].length===560,'mundo tem 560 colunas');
  ok(tile(179,12)==='#','passagem leste fechada antes da escultora');
  save.boss2Dead=true;save.ab.jump=save.ab.dash=save.ab.wall=true;save.bossDead=true;reset();state='play';ents.forEach(e=>e.dead=true);
  ok(tile(179,12)==='.','passagem leste aberta depois da escultora');
  place(176,13);keys.right=true;run(70);keys.right=false;run(10);
  ok(zone==='Torre do Relógio','anda do ateliê até a torre (zona '+zone+', x '+(P.x/16).toFixed(1)+')');
  // descer o poço e subir de volta pelas plataformas
  place(186,38);ok(Math.abs(feet()-38)<.05,'fundo do poço tem chão');
  // busca: de (sx, pé sf) existe alguma combinação de direção/pulo duplo que pousa no pé tf?
  function reach(sx,sf,tf,tx0,tx1){
    for(const dir of [1,-1,0])for(const hs of [0,6,12,18])for(const dbl of [0,8,12,16,22])for(const stopH of [999,20,30]){
      P.hp=99;P.inv=99999;P.x=sx*16+3;P.y=sf*16-22;P.vx=P.vy=0;P.kbT=0;P.dashT=0;P.atk=null;P.plunge=false;keys.left=keys.right=keys.jump=false;run(3);
      if(Math.abs(feet()-sf)>.05)return 'não fica em pé';
      for(let f=0;f<120;f++){keys.right=dir>0&&f>=hs&&f<stopH;keys.left=dir<0&&f>=hs&&f<stopH;
        if(f===0){keys.jump=true;tapped.jump=true}else if(dbl&&f===dbl){keys.jump=true;tapped.jump=true}else if(f===dbl+10||(!dbl&&f===16))keys.jump=false;
        step();if(f>10&&P.ground)break}
      keys.left=keys.right=keys.jump=false;
      const cx=Math.floor((P.x+5)/16);if(P.ground&&Math.abs(feet()-tf)<.05&&cx>=tx0&&cx<=tx1)return 'ok dir='+dir+' dbl='+dbl;
    }return null}
  const chain=[[186,38,35,184,187],[185,35,32,180,182],[181,32,29,184,187],[185,29,26,180,182],[181,26,23,184,187],[185,23,20,180,182],[181,20,17,184,187],[185,17,14,180,182],[181,14,11,184,187],[186,11,9,180,187]];
  const keepB6=B6;B6=null;
  for(const [sx,sf,tf,a,b] of chain){const r=reach(sx,sf,tf,a,b);ok(r&&r.startsWith('ok'),'poço: da linha '+sf+' alcança a '+tf+' ('+r+')')}
  B6=keepB6;P.x=184*16;P.y=9*16-22;run(3);P.x=192*16;run(3);  ok(zone==='Sala das Horas'||P.y<10*16,'chega à Sala das Horas');
  // quartel e jardim
  place(192,25);ok(zone==='Quartel da Guarda'&&Math.abs(feet()-25)<.05,'quartel tem chão ('+zone+')');
  place(195,38);ok(zone==='Jardim de Pedra'&&Math.abs(feet()-38)<.05,'jardim tem chão ('+zone+')');
  place(245,25);ok(zone==='Pátio do Estandarte','pátio do estandarte');
  // chaminé do pergaminho 3
  ok(ITEM_SPAWNS.every(i=>tile(i.x,i.y)==='.'),'nenhum item dentro da parede: '+ITEM_SPAWNS.filter(i=>tile(i.x,i.y)!=='.').map(i=>i.id).join(','));
  ok(STATUES.every(s=>tile(s.x,s.y)==='.'&&solid(tile(s.x,s.y+1))),'altares em pé no chão: '+STATUES.filter(s=>!(tile(s.x,s.y)==='.'&&solid(tile(s.x,s.y+1)))).map(s=>s.x+','+s.y).join(' '));
  ok(NPCS.every(n=>tile(n.x,n.y)==='.'&&(solid(tile(n.x,n.y+1))||tile(n.x,n.y+1)==='=')),'NPCs em pé no chão: '+NPCS.filter(n=>!(tile(n.x,n.y)==='.'&&(solid(tile(n.x,n.y+1))||tile(n.x,n.y+1)==='='))).map(n=>n.id).join(' '));
  const badSp=ENEMY_SPAWNS.filter(s=>{const e=mkEnemy(s);const l=Math.floor(e.x/16),r=Math.floor((e.x+e.w-1)/16),t=Math.floor(e.y/16),b=Math.floor((e.y+e.h-1)/16);for(let y=t;y<=b;y++)for(let x=l;x<=r;x++)if(solid(tile(x,y)))return true;return false});
  ok(badSp.length===0,'inimigos não nascem dentro da parede: '+badSp.map(s=>s.t+'@'+s.x+','+s.y).join(' '));
  // pegar o pergaminho da chaminé do jardim (precisa de salto na parede)
  {place(226,38);let top=99;let hold=1;keys.right=true;tapped.jump=true;keys.jump=true;run(10);
    for(let f=0;f<600&&!save.taken.includes('pg3');f++){keys.right=hold>0;keys.left=hold<0;
      if(P.wallSide&&!prev.jump){keys.jump=true;tapped.jump=true;hold=-P.wallSide}else if(P.vy>=0)keys.jump=false;
      step();if(state==='msg'){state='play';scr.hidden=true}top=Math.min(top,P.y/16)}
    keys.left=keys.right=keys.jump=false;
    ok(save.taken.includes('pg3'),'pega o pergaminho da chaminé do jardim escalando (subiu até '+top.toFixed(1)+')')}
  // chão rachado do jardim -> ninho, e voltar
  place(213,38);P.vy=-2;run(2);P.y-=30;keys.down=true;run(1);keys.attack=true;tapped.attack=true;run(1);keys.attack=false;keys.down=false;run(80);
  ok(zone==='Ninho da Tecelã','golpe de queda abre o chão do jardim e cai no ninho ('+zone+', pé '+feet().toFixed(1)+')');
  for(const [sx,sf,tf,a,b] of [[205,54,50,209,211],[210,50,47,216,218],[217,47,44,211,214],[213,44,38,205,220]]){const r=reach(sx,sf,tf,a,b);ok(r&&r.startsWith('ok'),'ninho: da linha '+sf+' alcança a '+tf+' ('+r+')')}

  // ---------- soldado com escudo ----------
  fresh();save.ab.dash=true;
  const g=mkEnemy({t:'guard',x:30,y:21});ents.push(g);g.dir=-1;g.atk=null;
  P.x=g.x-30;P.y=g.y+g.h-22;P.face=1;P.inv=0;
  let hp0=g.hp;hitEnemy(g,1,1,0);ok(g.hp===hp0,'escudo do soldado bloqueia golpe pela frente');
  P.x=g.x+30;P.face=-1;hitEnemy(g,1,-1,0);ok(g.hp===hp0-1,'por trás o golpe entra');
  P.x=g.x-30;P.plunge=true;hitEnemy(g,2,0,0);P.plunge=false;ok(g.hp===hp0-3,'golpe de queda passa pelo escudo');

  // ---------- cinzas e técnicas ----------
  fresh();
  const h=mkEnemy({t:'hop',x:30,y:21});ents.push(h);h.hp=1;P.x=h.x-20;P.y=h.y+h.h-22;run(1);hitEnemy(h,1,1,0);
  ok(items.some(i=>i.id==='ash'),'inimigo derrotado solta cinzas');
  run(80);ok(save.ash>=1,'cinzas vão até o jogador ('+save.ash+')');
  save.ash=0;ok(!canLearn(TECHS[0]),'sem pergaminho não aprende');
  save.taken.push('pg1');ok(!canLearn(TECHS[0]),'sem cinzas não aprende');
  save.ash=25;ok(canLearn(TECHS[0]),'com pergaminho e cinzas pode aprender');
  // conversar com Damião abre o menu
  ents.forEach(e=>e.dead=true);place(36,22);P.x=NS.damiao.px-5;run(1);keys.down=true;tapped.down=true;run(1);keys.down=false;
  ok(state==='talk'&&talkQ.n.id==='damiao','fala com o Damião');let k=0;while(state==='talk'&&k++<30)advanceTalk();
  ok(state==='msg'&&panel.innerHTML.includes('Damião ensina'),'depois da conversa abre o menu de técnicas');
  save.ash-=20;save.tech.charge=true;state='play';scr.hidden=true;
  // golpe carregado
  const d=mkEnemy({t:'hop',x:40,y:21});ents.push(d);d.hp=50;d.atk='rec';d.at=9999;
  place(37,22);P.face=1;P.x=d.x-30;keys.attack=true;tapped.attack=true;let mx=0;for(let i=0;i<70;i++){step();mx=Math.max(mx,P.chg)}
  keys.attack=false;run(1);ok(P.atk&&P.atk.n===4,'segurar e soltar atacar dispara o golpe carregado (carga '+mx+')');
  const hpb=d.hp;run(30);ok(hpb-d.hp>=3,'golpe carregado tira 3 ('+hpb+'→'+d.hp+')');
  // investida cortante
  save.ab.dash=true;save.tech.dashcut=true;d.hp=50;d.dead=false;P.x=d.x-60;P.y=d.y+d.h-22;P.face=1;P.dashCd=0;run(2);
  keys.dash=true;tapped.dash=true;run(1);keys.dash=false;keys.attack=true;tapped.attack=true;run(1);keys.attack=false;run(20);
  ok(d.hp===48,'investida cortante tira 2 de quem está no caminho ('+d.hp+')');ok(P.dashCd>28||P.dcut===null,'investida cortante recarrega mais devagar');
  // onda de brasa
  save.tech.wave=true;d.hp=50;P.x=d.x-80;P.face=1;P.fury=.5;run(2);tapped.power=true;keys.power=true;run(1);keys.power=false;
  ok(pshots.length===1&&Math.abs(P.fury-(.5-1/3))<.01,'Onda de Brasa sai e gasta 1/3 da barra');
  run(40);ok(d.hp===48,'onda acerta o inimigo ('+d.hp+')');
  pshots=[];P.fury=.2;tapped.power=true;run(2);ok(pshots.length===0,'sem 1/3 da barra a onda não sai');

  // ---------- missão do Lino ----------
  fresh();save.bossDead=true;reset();state='play';ents.forEach(e=>e.dead=true);
  ok(npcOn(NPCS.find(n=>n.id==='lino')),'Lino aparece depois do Corcel');
  const talkTo=id=>{const n=NPCS.find(x=>x.id===id);talk(n);let c=0;while(state==='talk'&&c++<30)advanceTalk()};
  talkTo('lino');talkTo('cleia');const mh=save.maxHp;talkTo('lino');
  ok(save.flags.bell&&save.maxHp===mh+1&&state==='msg','missão do pão: Lino dá o sininho (+1 vida)');state='play';scr.hidden=true;

  // ---------- chefes novos ----------
  function bossTest(B,setup,need,name){
    const seenS=new Set();P.inv=999999;for(let i=0;i<2200;i++){step();render();if(state==='scene')finishScene();if(B())seenS.add(B().state)}
    ok(need.every(s=>seenS.has(s)),name+' usa '+need.join(', ')+': '+[...seenS].join(','));
  }
  fresh();save.ab.jump=save.ab.dash=save.ab.wall=true;save.bossDead=save.boss2Dead=true;reset();state='play';ents.forEach(e=>e.dead=true);
  place(195,9);run(5);ok(B6&&B6.state!=='sleep'&&tile(183,9)==='#','entra na sala e o guardião acorda (tampa fecha)');
  bossTest(()=>B6,null,['gearsW','tollW','blinkW','slash','pendulumW'],'Guardião das Horas');
  B6.hp=1;B6.state='idle';hitBoss(5);for(let i=0;i<130&&state==='play';i++)step();
  ok(state==='scene'&&SC.title.includes('relógio'),'vencer o guardião mostra a memória do relógio');finishScene();
  ok(tile(183,9)==='='&&save.boss6Dead&&save.ash>=20,'tampa reabre, brasa e +20 cinzas');

  place(250,25);run(5);ok(B7&&B7.state!=='sleep'&&tile(240,20)==='#','Lúcio acorda e o pátio fecha');
  bossTest(()=>B7,null,['bashW','throwW','rallyW','leapW','rec'],'Lúcio');
  B7.state='idle';B7.guard=true;B7.dir=-1;P.x=B7.x-30;P.y=B7.y+B7.h-22;P.atk=null;P.plunge=false;let lh=B7.hp;hitBoss(1);ok(B7.hp===lh,'escudo de Lúcio bloqueia pela frente');
  P.atk={n:4,t:10,hit:new Set()};hitBoss(3);ok(B7.state==='stun'&&B7.hp<lh,'golpe carregado quebra o escudo de Lúcio');P.atk=null;
  B7.guard=false;B7.hp=1;hitBoss(5);for(let i=0;i<130&&state==='play';i++)step();
  ok(state==='scene'&&SC.title.includes('juramento'),'vencer Lúcio mostra a memória do juramento');finishScene();
  if(state==='msg'){state='play';scr.hidden=true}ok(tile(240,20)==='.'&&save.boss7Dead,'pátio reabre');
  ok(tile(164,35)==='S','porta do sino continua selada sem os cães');

  place(250,54);run(5);ok(B8&&B8.state!=='sleep','a Tecelã acorda');
  bossTest(()=>B8,null,['hang','dropW','drop','spitW','chargeW','climb'],'Tecelã');
  B8.state='idle';B8.hp=1;hitBoss(5);const mh2=save.maxHp;for(let i=0;i<130&&state==='play';i++)step();
  ok(state==='msg'&&save.taken.includes('pg4')&&save.maxHp===mh2+1,'vencer a Tecelã dá o pergaminho 4 e +1 vida');state='play';scr.hidden=true;

  // cães abrem a porta quando já tem as outras brasas
  B3.state='idle';boss=B3;P.x=156*16;P.y=38*16-22;B3.hp=0;hitBoss(0);for(let i=0;i<130&&state==='play';i++)step();finishScene();
  ok(tile(164,35)==='.'&&emberCount()===5,'com 5 brasas a porta do sino abre');

  // Andros -> Coração da Montanha -> final
  place(170,38);P.inv=999999;run(3);finishScene();run(30);
  B4.hp=0;boss=B4;hitBoss(0);for(let i=0;i<130&&state==='play';i++)step();
  ok(state==='scene'&&SC.title==='O fundo da montanha','vencer Andros mostra a queda');finishScene();
  ok(zone==='Coração da Montanha'||zoneAt(Math.floor(P.x/16),Math.floor(P.y/16))==='Coração da Montanha','Teo cai no Coração da Montanha');
  ok(save.cp.x===152,'altar do coração vira o ponto de volta');
  run(10);ok(B9.state!=='sleep','o Coração acorda');
  bossTest(()=>B9,null,['rainW','pillarW','volleyW','slamW','stun'],'Coração da Montanha');
  // dá para acertar o coração pulando? (com ele no ponto mais alto do voo)
  save.weapon='sword';B9.state='stun';B9.t=9999;B9.y=46*16-14;B9.x=164*16;const hh=B9.hp;P.x=B9.x+5;P.y=54*16-22;P.vy=0;P.inv=999999;run(2);
  keys.jump=true;tapped.jump=true;run(1);run(10);tapped.jump=true;run(3);keys.jump=false;keys.attack=true;tapped.attack=true;run(1);keys.attack=false;run(12);
  ok(B9.hp<hh,'pulando dá para acertar o coração no alto ('+hh+'→'+B9.hp+')');
  B9.hp=1;B9.state='stun';hitBoss(5);for(let i=0;i<130&&state==='play';i++)step();
  ok(state==='scene'&&SC.title==='O amanhecer','vencer o coração mostra o final');finishScene();ok(state==='win','tela de fim');
  ok(panel.innerHTML.includes('de 25'),'tela de fim conta os 25 chefes');

  // ---------- salvar e continuar ----------
  fresh();save.ash=33;save.tech.charge=true;save.cp={x:181,y:13};persist();
  const s=loadSaved();ok(s&&s.ash===33&&s.cp.x===181,'jogo salvo no navegador');
  newGame();continueFrom(s);ok(save.ash===33&&save.tech.charge&&Math.floor(P.x/16)===181,'continuar recupera cinzas, técnicas e altar');

  // render em todas as áreas sem erro
  fresh();save.boss2Dead=true;reset();state='play';
  for(const [x,y] of [[183,30],[195,5],[210,22],[250,22],[205,35],[220,50],[250,50],[164,50]]){place(x,y);run(3)}
  ok(true,'desenha todas as áreas novas sem erro');
  console.log(fails?'\n'+fails+' FALHA(S)':'\nTUDO OK');
})();
