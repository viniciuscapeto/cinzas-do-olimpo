;(function(){readEco=function(){};const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
 const close=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false);if(state==='msg'){state='play';scr.hidden=true}};
 const fresh=f=>{newGame();state='play';scr.hidden=true;if(f)f();reset();state='play';ents.forEach(e=>e.dead=true);P.inv=0};
 const tap=k=>{tapped[k]=true;keys[k]=true;run(1);keys[k]=false;tapped[k]=false};
 // golpes de perto num inimigo parado na frente
 const dummy=()=>{const e=mkEnemy({t:'hop',x:Math.floor(P.x/16)+2,y:Math.floor((P.y+P.h)/16)-1});e.hp=9999;e.vx=0;e.atk='rec';e.at=99999;ents.push(e);return e};
 const swingAt=(e,n)=>{let hits=0;for(let i=0;i<n;i++){P.x=e.x-14;P.face=1;P.atk=null;P.queue=false;const h=e.hp;tap('attack');run(18);combo.n=0;if(e.hp<h)hits++}return hits};

 // ---- munição: não volta com o tempo, volta batendo ----
 fresh(()=>{save.ab.knives=true;save.ab.bow=true;save.arrowsMax=10});
 P.knives=0;P.arrows=5;P.inv=99999;run(600);
 ok(P.knives===0&&P.arrows===5,'adagas e flechas não voltam sozinhas com o tempo');
 const e=dummy();run(2);
 let h=swingAt(e,KNIFE_HITS);ok(h===KNIFE_HITS&&P.knives===1,'a cada '+KNIFE_HITS+' golpes de perto volta 1 adaga ('+h+' acertos, '+P.knives+' adaga)');
 h+=swingAt(e,ARROW_HITS-KNIFE_HITS);ok(P.arrows===6,'a cada '+ARROW_HITS+' golpes de perto volta 1 flecha (flechas '+P.arrows+')');
 // combo de 10+ conta em dobro
 P.knives=0;P.knT=0;combo.n=12;meleeCharge();meleeCharge();ok(P.knives===1,'com 10+ de combo cada golpe conta em dobro');
 // tiro não recarrega
 P.knives=0;P.knT=0;P.arrows=0;P.arT=0;P.knives=1;tap('shoot');run(40);ok(P.knT===0&&P.arT===0,'acertar de longe não recarrega');
 // morrer ou descansar não enche
 P.knives=2;P.arrows=1;reset();state='play';ok(P.knives===2,'descansar/morrer não devolve adagas ('+P.knives+')');
 ok(P.arrows===ALTAR_MIN_ARROWS,'o altar só garante '+ALTAR_MIN_ARROWS+' flechas para os olhos de bronze ('+P.arrows+')');
 P.arrows=8;reset();state='play';ok(P.arrows===8,'com mais de '+ALTAR_MIN_ARROWS+' flechas, o altar não mexe ('+P.arrows+')');
 // munição salva no save
 P.knives=1;P.arrows=4;persist();ok(save.ammo&&save.ammo.k===1&&save.ammo.a===4,'munição vai para o save');
 const s=JSON.parse(JSON.stringify(save));continueFrom(s);ok(P.knives===1&&P.arrows===4,'continuar recupera a munição');
 // Aljava Encantada: 4 golpes por flecha
 save.charms=save.charms||[];save.equip=['aljava'];ok(arrowHits()===ARROW_HITS_ALJAVA,'com a Aljava Encantada bastam '+ARROW_HITS_ALJAVA+' golpes por flecha');save.equip=[];
 // forja da aljava aumenta o máximo mas não enche
 save.bronze=20;save.ash=200;P.arrows=2;buyForge('quiver');close();ok(save.arrowsMax===15&&P.arrows===2,'aljava maior aumenta o máximo sem encher');

 // Dente do Glutão: recarrega duas vezes mais rápido (e com combo 10+, quatro)
 save.equip=['dente'];P.knives=0;P.knT=0;combo.n=0;meleeCharge();meleeCharge();ok(P.knives===1,'Dente do Glutão: 2 golpes por adaga');save.equip=[];
 // Adega e Covil
 fresh();ok(grid[31][90]==='W'&&grid[31][93]==='W'&&grid[30][90]==='.'&&grid[30][93]==='.','a poça da Adega fica afundada no chão, não em cima');
 {const bad=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(grid[y][x]==='W'){const L=grid[y][x-1],R=grid[y][x+1],D=grid[y+1][x];
   if((!solid(L)&&L!=='W')||(!solid(R)&&R!=='W')||(!solid(D)&&D!=='W'))bad.push(x+','+y)}
  ok(!bad.length,'nenhuma água fica em cima do chão no mapa todo'+(bad.length?': '+bad.slice(0,8).join(' '):''))}
 const c5=CHESTS.find(c=>c.id==='co5');ok(c5&&c5.r.charm==='dente'&&CHARMS.dente,'baú com o Dente do Glutão no alto do Covil');
 ok(['47,77','44,84','41,78','38,85'].every(s=>{const [y,x]=s.split(',').map(Number);return grid[y][x]==='='})&&grid[c5.y+1][c5.x]==='=','plataformas sobem até o baú do Covil');
 // ---- arma na mão ----
 fresh();ok(heldWeapon()==='spade'&&WEAPONS.spade.atk[1].dmg<ATK[1].dmg,'começa com a pá do coveiro na mão (mais fraca que a espada)');
 giveWeapon('spear');close();ok(heldWeapon()==='spear','pegar a lança coloca a lança na mão na hora');
 giveWeapon('hammer');close();ok(heldWeapon()==='hammer','pegar o martelo coloca o martelo na mão');
 save.weapons=['sword','spear','scythe','hammer','shovel'];save.weapon='sword';P.swapT=0;
 const order=[];for(let i=0;i<5;i++){tap('swap');run(SWAP_T+2);order.push(heldWeapon())}
 ok(order.join(',')==='spear,scythe,hammer,shovel,sword','trocar com T passa por todas e a arma na mão acompanha: '+order.join(','));
 // troca animada: braço vai às costas com a arma antiga e volta com a nova
 save.weapon='sword';P.atk=null;tap('swap');const seenK=new Set(),seenHeld=new Set();for(let i=0;i<SWAP_T;i++){const p=heroPose();seenK.add(p.k+p.fr);seenHeld.add(P.swapT>0&&SWAP_T-P.swapT<7?P.swapFrom:heldWeapon());run(1)}
 ok(seenK.has('kAtk0')&&seenK.has('kAtk1')&&seenK.has('kAtk3'),'trocar de arma anima o braço (vai às costas e puxa a nova): '+[...seenK].join(','));
 ok(seenHeld.has('sword')&&seenHeld.has('spear'),'na troca aparece a arma antiga e depois a nova');
 tap('swap');run(3);tap('attack');ok(P.swapT===0&&P.atk,'atacar no meio da troca cancela a animação');run(30);
 // efeitos de cada arma
 {let err=null;const before=fxp.length;try{for(const w of ['sword','spear','scythe','hammer','shovel']){weaponFx(w,100,100,90,100);weaponFx(w,100,100,90,100,true)}}catch(x){err=x}
  ok(!err&&fxp.some(p=>p.bolt&&p.col===WEAPON_FX.spear.c)&&fxp.some(p=>p.bolt&&p.col===WEAPON_FX.scythe.c)&&fxp.length>before+20,'cada arma solta o seu efeito (raio azul, raio violeta, fogo, brasa, ouro)'+(err?': '+err.message:''));
  let e2=null;try{drawParticles(true);drawParticles(false)}catch(x){e2=x}ok(!e2,'raios desenham sem erro')}
 ok(Object.keys(WEAPONS).every(w=>WEAPON_LORE[w]&&WEAPON_LORE[w].length>80)&&WEAPON_LORE.bow,'cada arma tem a sua história');
 ok(['w_sword','w_spear','w_scythe','w_hammer','w_shovel','w_bow'].every(k=>SPRITE_DATA[k]),'as 6 armas do Gemini estão no jogo'); // especial (Q) de cada arma: cada um acerta do seu jeito
 {const pos={spade:30,sword:30,spear:60,scythe:40,hammer:20,shovel:50};let res=[];
  for(const w of Object.keys(pos)){fresh();save.weapons=Object.keys(WEAPONS);save.weapon=w;P.face=1;run(2);
   const e=mkEnemy({t:'cult',x:Math.floor((P.x+P.w/2+pos[w])/16),y:Math.floor((P.y+P.h)/16)-1});e.hp=99;e.vx=0;ents.push(e);run(1);e.x=P.x+P.w/2+pos[w]-e.w/2;e.y=P.y+P.h-e.h;
   const h=e.hp;banner.t=0;eruption();res.push(w+(e.hp<h?'✓':'✗'));ok(e.hp<h&&banner.txt===WEAPON_POWER[w].n,'especial '+WEAPON_POWER[w].n+' ('+w+') acerta o inimigo ('+h+'→'+e.hp.toFixed(1)+')')}
  fresh();save.weapon='scythe';P.hp=1;const e2=mkEnemy({t:'cult',x:Math.floor(P.x/16)+1,y:Math.floor((P.y+P.h)/16)-1});e2.hp=99;ents.push(e2);const e3=mkEnemy({t:'cult',x:Math.floor(P.x/16)+2,y:Math.floor((P.y+P.h)/16)-1});e3.hp=99;ents.push(e3);
  e2.x=P.x+20;e2.y=P.y+P.h-e2.h;e3.x=P.x-20;e3.y=P.y+P.h-e3.h;eruption();ok(P.hp>1,'a Ceifa Violeta devolve vida (vida '+P.hp+')')}
 // a arma fica na mão do próprio sprite: no golpe o cabo acompanha a mão do quadro que está na tela
 {fresh();save.weapon='spade';startAtk(1);const ys=[];let err=null,off=0;try{for(let i=0;i<14;i++){P.atk.t=i;const p={...heroPose(),k:'t0Atk'};drawHeldMelee('spade',p,100,100,false);const h=handAt(p,100,100);off=Math.max(off,Math.hypot(P.hand.x-h.x,P.hand.y-h.y));ys.push(P.hand.y)}}catch(x){err=x}
  const span=Math.max(...ys)-Math.min(...ys);ok(!err&&off<.01&&span>4,'no golpe a arma segue a mão do sprite (percorre '+span.toFixed(1)+' px, maior distância da mão '+off.toFixed(2)+')');P.atk=null} // braço em sincronia com a arma: o quadro do ataque segue a direção da arma
 {save.weapon='sword';P.swapT=0;P.atk=null;startAtk(1);const seq=[];let okSync=true;for(let i=0;i<14;i++){const a=blades()[0].ang,p=heroPose();seq.push(p.fr);const exp=a<-1.5?0:a<-.45?1:a<.62?2:3;if(p.fr!==exp)okSync=false;P.atk.t++}
  ok(okSync&&new Set(seq).size>=2,'no ataque o braço acompanha a direção da arma: '+seq.join(''));P.atk=null}
 // escudo da bênção
 {P.ward=1;P.inv=0;P.dashT=0;state='play';const hp=P.hp,e=mkEnemy({t:'hop',x:Math.floor(P.x/16)+1,y:Math.floor((P.y+P.h)/16)-1});ents.push(e);e.x=P.x+14;const n0=fxp.length;
  let err=null;try{drawWard()}catch(x){err=x}ok(!err,'escudo azul desenha em volta do Teo'+(err?': '+err.message:''));
  hurtPlayer(1,e);ok(P.ward===0&&P.hp===hp,'a bênção segura o golpe inteiro');
  ok(fxp.some(p=>p.bolt)&&fxp.some(p=>p.wave&&p.col==='#9ad8ff')&&fxp.length>n0+25,'o escudo explode em cacos, raios e onda azul');
  ok(e.kb>0&&e.kbv>0,'a explosão empurra o inimigo que estava perto');
  try{drawWard()}catch(x){err=x}ok(!err&&P.wardFx>0,'clarão da explosão desenha sem erro');e.dead=true;P.inv=0;hitstop=0;shake=0} ok(Math.cos(WEAPON_GEOM.scythe.rest)>.5&&Math.cos(WEAPON_GEOM.hammer.rest)>.5,'foice e martelo descansam com a parte grande para fora, não sobre o Teo');
 {const n0=fxp.filter(p=>p.bolt).length;let err=null;try{for(let i=0;i<30;i++)spearSpark(100,100,-.5,WEAPON_GEOM.spear)}catch(x){err=x}ok(!err&&fxp.filter(p=>p.bolt).length>n0,'a ponta da lança estala raios')}
 ok(fxp.some(p=>p.shard),'o escudo estoura em cacos de vidro'); // efeito constante de cada arma e a flecha do Gemini
 {let err=null;const n0=fxp.length;try{state='play';for(const w of ['sword','spear','scythe','hammer','shovel'])for(let i=0;i<30;i++)weaponAura(w,100,100,-.4,WEAPON_GEOM[w]);
   if(SPR.w_arrow)drawArrowImg({x:100,y:100,vx:6,vy:-.4,pierce:true,fire:true});P.bowShow=30;drawBow();P.aim=30;drawBow();P.aim=0;bowRunes(100,100)}catch(x){err=x}
  ok(!err&&fxp.length>n0+30,'cada arma tem efeito constante (brasa, raio, chama, roxo, ouro) e o arco tem runas'+(err?': '+err.message:''));
  ok(SPRITE_DATA.w_arrow&&WEAPON_GEOM.scythe.flip&&WEAPON_GEOM.arrow,'flecha do Gemini no jogo e foice virada (lâmina grande para a frente)')} save.weapon='sword';P.swapT=0;P.atk=null;
 // arco: aparece na mão ao ganhar, ao mirar e logo depois de atirar; atacar volta para a arma
 save.ab.bow=true;save.arrowsMax=10;P.arrows=10;P.bowShow=150;ok(heldWeapon()==='bow','ao ganhar o arco ele vai para a mão');
 tap('attack');ok(heldWeapon()==='sword'&&P.bowShow===0,'atacar de perto guarda o arco e volta a espada');run(30);
 keys.shoot=true;run(5);ok(heldWeapon()==='bow','mirando, o arco fica na mão');keys.shoot=false;run(2);ok(heldWeapon()==='bow','logo depois de atirar o arco continua na mão');
 run(60);ok(heldWeapon()==='sword','depois de um tempo a arma de perto volta para a mão');
 // desenho: cada arma e cada pose desenham sem erro (com e sem sprites)
 let err=null;try{for(const w of ['sword','spear','scythe','hammer','shovel']){save.weapon=w;for(const k of ['kIdle','kRun','kAtk','kJump'])for(let f=0;f<5;f++){drawHeldMelee(w,{k,fr:f,face:1},100,100,false);drawHeldMelee(w,{k,fr:f,face:-1},100,100,true)}
   startAtk(1);for(let i=0;i<20;i++){P.atk.t=i;drawHeldMelee(w,{k:'kAtk',fr:i%4,face:1},100,100,false)}P.atk=null}
   P.bowShow=30;drawBow();P.aim=10;drawBow();P.aim=0}catch(x){err=x}
 ok(!err,'todas as armas desenham na mão sem erro'+(err?': '+err.message:''));
 ok(['uIdle','uRun','uAtk','uJump'].every(k=>SPRITE_DATA[k]&&SPRITE_CELL[k]&&SPRITE_ANCHOR[k]),'folhas do cavaleiro sem espada estão no jogo');
 ok(Object.keys(HERO_HAND).every(k=>SPRITE_ANCHOR[k]),'mão marcada em todas as folhas do cavaleiro');

 // ---- abertura ----
 ok(INTRO.some(l=>l.includes('casinha do cemitério')),'abertura conta quem é Teo');
})();
