
;(function(){
  const run=(n)=>{for(let i=0;i<n;i++){step();render()}};
  const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
  const place=(tx,ty)=>{P.x=tx*16+3;P.y=ty*16-22;P.vy=0;P.vx=0;run(4)};
  const finishScene=()=>{let g=0;while(state==='scene'&&g++<20)sceneStep(false)};
  // início: cena de introdução
  newGame();scene('Olimpo, dez anos depois',INTRO,()=>say('Ruínas de Olimpo'));
  ok(state==='scene','começa com a cena de introdução');
  ok(INTRO.length>=8&&INTRO.some(l=>l.includes('casinha do cemitério'))&&INTRO.some(l=>l.includes('Andros')),'a abertura conta a história de Teo ('+INTRO.length+' telas)');
  finishScene();ok(state==='play','depois da introdução o jogo começa');
  // conversa com a Mira
  ents.forEach(e=>e.dead=true);
  place(11,22);P.x=NS.mira.px-5;run(1);keys.attack=true;run(1);keys.attack=false;ok(state==='play'&&P.atk,'perto da Mira, atacar ataca (não abre conversa)');run(30);P.x=NS.mira.px-5;run(1);keys.down=true;run(1);keys.down=false;
  ok(state==='talk'&&talkQ&&talkQ.n.id==='mira','aperta baixo perto da Mira e abre a conversa');
  let g=0;while(state==='talk'&&g++<30)advanceTalk();
  ok(state==='play'&&save.talked.mira===0,'conversa termina e volta ao jogo');
  // inscrição
  place(19,22);keys.down=true;run(1);keys.down=false;ok(state==='talk'&&talkQ.n.id==='t1','lê a inscrição');g=0;while(state==='talk'&&g++<30)advanceTalk();
  // longe de NPC, atacar ataca
  place(30,22);keys.attack=true;run(1);keys.attack=false;ok(state==='play'&&P.atk,'longe de NPC o botão ataca');run(30);
  // Corcel de Bronze morre -> lembrança
  save.ab.jump=save.ab.dash=save.ab.wall=true;
  B1.state='idle';B1.hp=0;hitBoss(0);boss=B1;for(let i=0;i<130&&state==='play';i++)step();
  ok(state==='scene'&&SC&&SC.title.includes('festa'),'vencer o Corcel de Bronze mostra a lembrança da festa');finishScene();
  ok(grid[12][109]==='.','passagem a leste aberta');
  // Ilía morre -> selo
  place(167,14);boss=B2;B2.state='idle';B2.hp=0;hitBoss(0);for(let i=0;i<130&&state==='play';i++)step();
  ok(state==='scene'&&SC.title.includes('catacumbas'),'vencer Ilía mostra a segunda lembrança');finishScene();
  ok(grid[26][119]==='.','selo do chão da Forja aberto');
  // descer ao Rio de Cinza
  place(119,24);run(90);ok(zone==='Rio de Cinza','cai no Rio de Cinza pelo buraco (zona '+zone+')');
  // voltar subindo as plataformas até a forja
  place(119,29);keys.jump=true;run(8);keys.left=true;run(12);keys.left=false;keys.jump=false;run(30);
  ok(P.y+P.h<=26*16+0.01,'consegue voltar do rio para a Forja (pé na linha '+((P.y+P.h)/16).toFixed(1)+')');
  // a barqueira
  ents.forEach(e=>e.dead=true);
  place(124,38);keys.down=true;run(1);keys.down=false;ok(state==='talk'&&talkQ.n.id==='caronte','fala com a barqueira');g=0;while(state==='talk'&&g++<30)advanceTalk();
  // água fere
  const hp0=P.hp;place(127,38);run(10);ok(P.hp<hp0,'água do rio machuca');P.hp=save.maxHp;P.inv=0;
  // os três cães
  place(155,38);P.inv=99999;const seenC=new Set();for(let i=0;i<1600;i++){step();render();if(B3)seenC.add(B3.state)}
  ok(seenC.has('breath')&&seenC.has('lunge')&&seenC.has('howlW'),'os três cães usam fogo, investida e uivo: '+[...seenC].join(','));
  ok(ents.some(e=>e.summoned),'uivo invoca sombras');
  B3.hp=1;B3.state='idle';P.x=B3.x-22;P.y=B3.y+B3.h-22;P.face=1;run(1);
  for(let k=0;k<3;k++){keys.attack=true;run(1);keys.attack=false;run(10)}
  for(let i=0;i<150&&state==='play';i++)step();
  ok(state==='scene'&&SC.title.includes('cova'),'vencer os três cães mostra a terceira lembrança');finishScene();
  // sem as cinco brasas (faltam o Guardião das Horas e o Lúcio) a porta do sino fica selada
  ok(grid[36][164]==='S','sem as cinco brasas a porta do sino fica selada ('+emberCount()+' de 5)');
  // Tirésias muda de fala no estágio 3
  ok(npcLines(NPCS[1])[0].includes('Andros'),'Tirésias revela que o sineiro é o pai');ok(MIRA_POS[3][0]===Math.round((NS.mira.hx-8)/16),'Mira mudou de lugar para o rio');
  // com as cinco brasas a porta abre
  save.boss6Dead=save.boss7Dead=true;reset();state='play';ents.forEach(e=>e.dead=true);
  ok(bellOpen()&&emberCount()===5&&grid[36][164]==='.','com as cinco brasas a porta do sino abre');
  // Andros, o sineiro
  place(162,38);P.inv=99999;keys.right=true;run(60);keys.right=false;
  ok(state==='scene'&&SC.title==='Câmara do Sino','entrar na câmara mostra a cena antes de Andros');finishScene();
  ok(boss===B4&&B4.name.includes('ANDROS')||B4&&B4.state!=='sleep','a luta contra Andros começa');
  const seenA=new Set();for(let i=0;i<2400;i++){step();render();if(B4)seenA.add(B4.state);if(i===1200&&B4)B4.hp=30}
  ok(seenA.has('dash')&&seenA.has('pillarW')&&seenA.has('spearW')&&seenA.has('rage')&&seenA.has('rainW'),'Andros usa investida, pilares, lança, fúria e chuva: '+[...seenA].join(','));
  ok(B4&&B4.phase===2&&B4.name.includes('CONSUMIDO'),'na metade da vida a montanha consome Andros (segunda fase)');
  B4.hp=1;B4.state='idle';P.x=B4.x+B4.w+10;P.y=B4.y+B4.h-22;P.face=-1;run(1);
  for(let k=0;k<3;k++){keys.attack=true;run(1);keys.attack=false;run(10)}
  for(let i=0;i<150&&state==='play';i++)step();
  ok(state==='scene'&&SC.title==='O fundo da montanha','vencer Andros leva ao fundo da montanha');finishScene();
  ok(state==='play'&&save.cp.x===152&&P.y>42*16,'Teo desce até o Coração da Montanha');
  // Coração da Montanha: o chefe final
  for(let i=0;i<200&&B9&&B9.state==='sleep';i++){step();render()}
  ok(B9&&B9.state!=='sleep','o Coração da Montanha acorda');
  boss=B9;B9.state='idle';B9.hp=0;hitBoss(0);for(let i=0;i<200&&state==='play';i++)step();
  ok(state==='scene'&&SC.title.startsWith('O amanhecer'),'vencer o Coração mostra o final ('+(SC&&SC.title)+')');finishScene();
  ok(state==='win','depois do final aparece a tela de fim');
})();
;(function(){
  const run=(n)=>{for(let i=0;i<n;i++){step();render()}};
  const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
  newGame();state='play';ents.forEach(e=>e.dead=true);
  const e=ents.find(x=>x.t==='hop');e.dead=false;e.atk=null;P.inv=0;P.hp=5;
  // cair em cima do esqueleto: não toma dano por contato e escorrega para o lado
  P.x=e.x+1;P.y=e.y-20;P.vy=2;e.atk='rec';e.at=999;
  for(let i=0;i<20;i++){step()}
  ok(P.hp===5,'cair em cima do inimigo não dá dano (vida '+P.hp+')');
  ok(!overlap(P,e),'jogador é empurrado para fora do inimigo');
  // o esqueleto avisa e depois estoca com a lança
  e.atk=null;P.inv=0;P.x=e.x+e.w+14;P.y=e.y+e.h-22;P.vy=0;
  let sawWind=false;for(let i=0;i<60;i++){step();if(e.atk==='wind')sawWind=true}
  ok(sawWind&&P.hp<5,'esqueleto prepara (aviso) e acerta a estocada se você ficar parado');
  // acertar durante a preparação cancela
  P.hp=5;P.inv=0;e.atk='wind';e.at=20;hitEnemy(e,1,1,0);ok(e.atk==='rec','golpear o esqueleto durante o aviso cancela o ataque');
  // conversa com texto aparecendo aos poucos
  e.dead=true;hitstop=0;P.kbT=0;P.x=NS.mira.px-5;P.y=22*16-22;P.vy=0;run(3);keys.down=true;run(1);keys.down=false;
  ok(state==='talk'&&talkQ.shown<talkQ.lines[0].length,'texto da conversa aparece aos poucos');
  advanceTalk();ok(talkQ.shown===talkQ.lines[0].length,'tocar mostra o texto inteiro');
})();;(function(){
  const run=(n)=>{for(let i=0;i<n;i++){step();render()}};
  const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
  newGame();state='play';ents.forEach(e=>e.dead=true);
  const e=ents.find(x=>x.t==='hop');e.dead=false;e.hp=99;P.inv=99999;
  P.x=e.x-24;P.y=e.y+e.h-22;P.face=1;run(2);
  let i=0;while(P.fury<1&&i++<60){keys.attack=true;run(1);keys.attack=false;run(9);P.x=e.x-24;P.face=1}
  ok(P.fury>=1,'acertar inimigos enche a barra da Erupção ('+i+' golpes)');
  tapped.power=true;run(1);ok(P.power>0||hitstop>0,'');run(8);ok(P.power>0||P.fury===0,'aperta poder com a barra cheia e começa a carregar');
  const hp0=e.hp;run(40);ok(e.hp<=hp0-4&&P.fury===0,'Erupção causa dano forte e esvazia a barra (vida do inimigo '+hp0+'→'+e.hp+')');
  run(60);tapped.power=true;run(3);ok(!P.power,'sem barra cheia o poder não sai');
  // Erupção no chefe
  save.bossDead=save.boss2Dead=save.boss3Dead=true;reset();state='play';ents.forEach(x=>x.dead=true);
  P.x=170*16;P.y=38*16-22;P.inv=999999;run(3);let g=0;while(state==='scene'&&g++<20)sceneStep(false);
  run(60);P.fury=1;P.x=B4.x-20;P.y=B4.y+B4.h-22;const bh=B4.hp;keys.power=true;run(1);keys.power=false;run(40);
  ok(B4.hp<=bh-5,'Erupção tira 5 de vida do chefe ('+bh+'→'+B4.hp+')');
})();