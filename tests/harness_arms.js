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
 fresh();ok(heldWeapon()==='sword','começa com a espada na mão');
 giveWeapon('spear');close();ok(heldWeapon()==='spear','pegar a lança coloca a lança na mão na hora');
 giveWeapon('hammer');close();ok(heldWeapon()==='hammer','pegar o martelo coloca o martelo na mão');
 save.weapons=['sword','spear','scythe','hammer','shovel'];save.weapon='sword';
 const order=[];for(let i=0;i<5;i++){tap('swap');run(2);order.push(heldWeapon())}
 ok(order.join(',')==='spear,scythe,hammer,shovel,sword','trocar com T passa por todas e a arma na mão acompanha: '+order.join(','));
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
