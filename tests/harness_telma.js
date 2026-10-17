;(function(){readEco=function(){};let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 const close=()=>{let g=0;while(state==='scene'&&g++<60)sceneStep(false);if(state==='msg'){state='play';scr.hidden=true}};
 const all=()=>{save.ab.jump=save.ab.dash=save.ab.wall=save.ab.glide=save.ab.bow=true;save.arrowsMax=10;save.flags.lvInfo=1;for(let i=1;i<=21;i++)save[i===1?'bossDead':'boss'+i+'Dead']=true;save.flags.rift=1;save.flags.sonho=1;save.weapons.push('shovel')};
 const fresh=f=>{newGame();state='play';scr.hidden=true;all();if(f)f();reset();state='play';P.inv=0};
 const put=(x,y)=>{P.x=x*16+3;P.y=(y+1)*16-22;P.vx=P.vy=0;cam.x=P.x-160;cam.y=P.y-90;clampCam()};
 // mapa e nomes
 fresh();ok(W===560&&grid[0].length===560,'mundo com 560 colunas');
 ok(zoneAt(465,80)==='Quarto de Telma'&&zoneAt(490,70)==='Jardim de Pano'&&zoneAt(505,35)==='Escadaria do Convento'&&zoneAt(528,20)==='Claustro das Crianças'&&zoneAt(545,20)==='Nave do Coro','nomes das áreas novas');
 ok(palKey(470,80)==='pinkdream'&&palKey(520,30)==='convent'&&palKey(400,90)==='dream','paletas cor-de-rosa e do convento');
 {let leak=0;for(let y=0;y<H;y++)if(!solid(tile(459,y))||!solid(tile(500,y)))leak++;ok(leak===0,'colunas 459 e 500 lacradas (sonho, lembrança e convento separados)')}
 ok(!solid(tile(465,83))&&solid(tile(465,84))&&!solid(tile(530,24))&&solid(tile(530,25))&&!solid(tile(545,24))&&solid(tile(545,25)),'chão e espaço livre nas áreas novas');
 // save antigo com 460 colunas: o mapa explorado é copiado para a largura nova
 {const s=JSON.parse(JSON.stringify(save));let str='';for(let y=0;y<H;y++)for(let x=0;x<460;x++)str+=(x===450&&y===50)?'1':'0';s.seenStr=str;continueFrom(s);ok(seen[50*W+450]===1&&seen[50*W+451]===0,'save de 460 colunas carrega o mapa certo')}
 // a fenda cor-de-rosa só depois da Montanha, e só fora da luta
 fresh(()=>{save.boss21Dead=false});ok(!RIFTS.find(r=>r.pink&&r.x===343).on(),'sem fenda rosa antes da Montanha');
 fresh();ents.forEach(e=>e.dead=true);put(343,27);P.riftCd=0;run(3);ok(P.x>460*16&&save.flags.pink&&state==='scene','a fenda rosa leva ao quarto de Telma e abre a cena');
 ok(SC&&SC.chap&&SC.chap.t==='A irmã','cartão de capítulo: A irmã');close();
 ok(objective().includes('Sr. Bottoms'),'objetivo: '+objective());
 // lembranças e a Telma criança
 for(const id of Object.keys(TLMS)){const it=items.find(i=>i.id===id);ok(!!it&&!solid(tile(TLMS[id].x,TLMS[id].y)),'lembrança no ar: '+TLMS[id].t);put(TLMS[id].x,TLMS[id].y);P.y=it.y-8;run(2);ok(save.taken.includes(id),'pega: '+TLMS[id].t);close()}
 ok(NPCS.some(n=>n.id==='telmakid')&&LINES.telmakid.length===2,'Telma criança no quarto');
 put(461,83);P.riftCd=0;run(3);ok(P.x<380*16&&P.y<30*16,'a fenda de volta leva ao Olho da Montanha');
 // chefes: acordam, lutam sem erro e caem
 const fight=(B,x,y,pre,check,n)=>{fresh(pre);ents.forEach(e=>e.dead=true);put(x,y);P.inv=1e9;run(8);
   const b=B();ok(b&&b.state!=='sleep','acorda: '+(b&&b.name));
   let err=null,seenSt=new Set();try{for(let i=0;i<(n||1500);i++){step();render();close();state='play';const bb=B();if(bb)seenSt.add(bb.state)}}catch(e){err=e}ok(!err,'luta sem erro'+(err?' '+err.stack:''));
   check(seenSt)};
 fight(()=>B24,482,83,null,st=>{
   ok(['hop','buttonsW','vinesW','petals','stuffingW','lullaby'].filter(k=>st.has(k)).length>=4,'o coelho usa os ataques dele: '+[...st].join(','));
   const b=B24;b.hp=b.max*.4;run(120);ok(b.p2,'segunda fase do coelho (rasgado)');
   b.state='idle';b.hp=.1;boss=b;hitBoss(5);for(let i=0;i<200&&state==='play';i++)step();
   ok(save.boss24Dead&&state==='scene'&&SC&&SC.chap&&SC.chap.t==='O bilhete','Sr. Bottoms cai e mostra o bilhete de Telma');close();
   ok(save.charms.includes('botao'),'ganha o amuleto Sr. Bottoms');ok(RIFTS.find(r=>r.x===497).on(),'abre a fenda para o convento')});
 // convento
 fresh(()=>{save.boss24Dead=true});ents.forEach(e=>e.dead=true);put(497,83);P.riftCd=0;run(3);ok(P.x>500*16&&save.flags.convent&&state==='scene','a fenda sobe ao Convento das Vozes');close();
 ok(objective().includes('Telma'),'objetivo: '+objective());
 ok(solid(tile(537,20)),'a nave do coro fica fechada até soltar a Telma');
 {const n=NPCS.find(n=>n.id==='telma');ok(npcOn(n),'Telma presa no claustro');put(529,24);run(2);talk(n);let g=0;while(state==='talk'&&g++<30){talkQ.shown=1e9;advanceTalk()}
  ok(state==='scene'&&SC.chap&&SC.chap.t==='Telma','soltar a Telma abre a cena');close();
  ok(save.flags.telma&&!npcOn(n)&&!solid(tile(537,20)),'Telma livre e a porta do coro aberta');run(5);ok(TF.on,'Telma segue o Teo no convento')}
 {put(505,38);run(5);const d0=Math.abs(TF.x-P.x);put(515,38);for(let i=0;i<240;i++)step();ok(Math.abs(TF.x-P.x)<60,'ela acompanha quando o Teo anda ('+Math.round(d0)+' → '+Math.round(Math.abs(TF.x-P.x))+')')}
 ok(objective().includes('Maestro')||objective().includes('MAESTRO')||objective().includes('Malco'),'objetivo: '+objective());
 // o Maestro (com a Telma junto)
 fight(()=>B25,541,24,()=>{save.boss24Dead=true;save.flags.telma=1},st=>{
   ok(['notes','staff','crescendo','bellsW','choirW'].filter(k=>st.has(k)).length>=4,'o Maestro usa os ataques dele: '+[...st].join(','));
   const b=B25;b.hp=b.max*.4;run(110);ok(b.p2&&b.shield,'segunda fase: escudo de som');
   b.broken=0;const h0=b.hp;boss=b;b.state='idle';hitBoss(3);ok(b.hp===h0,'o escudo segura os golpes do Teo');
   TF.cd=1;b.state='idle';for(let i=0;i<30&&!(b.broken>0);i++){TF.x=b.x;TF.y=b.y+30;step()}ok(b.broken>0&&b.state==='dazed','o canto da Telma quebra o escudo e deixa ele tonto');
   hitBoss(3);ok(b.hp<h0,'com o escudo quebrado, o golpe entra');
   let err=null;try{b.hp=b.max*.4;b.broken=0;b.state='idle';for(let i=0;i<900;i++){step();render();close();state='play'}}catch(e){err=e}ok(!err,'segunda fase sem erro (réquiem e silêncio)'+(err?' '+err.stack:''));
   b.shield=0;b.state='idle';b.hp=.1;boss=b;hitBoss(5);for(let i=0;i<200&&state==='play';i++)step();
   ok(save.boss25Dead&&state==='scene'&&SC.chap&&SC.chap.t==='Os onze versos','o Maestro cai e mostra o final');close();
   ok(state==='win'&&panel.innerHTML.includes('de 25')&&panel.innerHTML.includes('Telma'),'tela de fim: 25 chefes e a história de Telma')},2200);
 // quem eram os chefes
 fresh();ok(Object.keys(REMATCH).every(k=>BOSS_LORE[k])&&BOSS_ORDER.length===Object.keys(REMATCH).length,'todos os chefes têm origem');
 save.boss18Dead=true;loreMenu();ok(panel.innerHTML.includes('Dimas')&&panel.innerHTML.includes('???'),'altar: quem eram os chefes');state='play';scr.hidden=true;
 // amuleto Sr. Bottoms
 fresh(()=>{save.charms.push('botao');save.equip=['botao']});P.hp=2;P.inv=0;hurtPlayer(1,{x:P.x+20,y:P.y,w:4,h:4});ok(P.hp===3,'Sr. Bottoms devolve 2 de vida quando ela cai para 1');
 P.inv=0;P.hp=2;hurtPlayer(1,{x:P.x+20,y:P.y,w:4,h:4});ok(P.hp===1,'só uma vez por descanso');
 // sprites novos
 ok(['xTelma','xTelmaKid','xBotao','xMaestro','s_petal','s_note','s_bell','s_rose','a_botao'].every(k=>SPRITE_DATA[k])&&SPRITE_CELL.xBotao&&SPRITE_ANCHOR.xMaestro,'sprites do Ato III');
 // modo criador: mapa inteiro, altares novos e ir direto para as áreas novas
 continueFrom(creatorSave());seen.fill(1);ok(save.lit.includes(STATUES.length-1)&&save.lit.includes(STATUES.length-2),'criador: altares de Telma e do convento acesos');
 travelMenu();ok(panel.innerHTML.includes('Nave do Coro')&&panel.innerHTML.includes('Quarto de Telma'),'criador: viagem mostra as áreas novas');
 creatorTp(5);ok(state==='play'&&zoneAt(Math.floor(P.x/16),Math.floor(P.y/16))==='Nave do Coro'&&save.flags.telma&&!solid(tile(537,20)),'criador: vai direto para a Nave do Coro');run(10);ok(TF.on,'criador: Telma junto no convento');
 console.log(fails?fails+' FALHA(S)':'TUDO OK');
})();
