;(function(){readEco=function(){};let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 const close=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false);if(state==='msg'){state='play';scr.hidden=true}};
 const all=()=>{save.ab.jump=save.ab.dash=save.ab.wall=save.ab.glide=save.ab.bow=true;save.arrowsMax=10;save.flags.lvInfo=1;for(let i=1;i<=17;i++)save[i===1?'bossDead':'boss'+i+'Dead']=true};
 const fresh=f=>{newGame();state='play';scr.hidden=true;all();if(f)f();reset();state='play';P.inv=0};
 const put=(x,y)=>{P.x=x*16+3;P.y=(y+1)*16-22;P.vx=P.vy=0;cam.x=P.x-160;cam.y=P.y-90;clampCam()};
 // o mundo novo está lacrado e não vaza para o mapa antigo
 fresh();let leak=0;for(let y=0;y<H;y++)if(!solid(tile(339,y)))leak++;ok(W===560&&leak===0,'região nova lacrada (coluna 339 toda em rocha)');
 ok(zoneAt(350,90)==='Margem do Sonho'&&zoneAt(440,40)==='Espelho do Eco'&&zoneAt(360,10)==='Olho da Montanha','nomes das áreas do sonho');
 // inimigos do sonho nascem em lugar livre e não caem para fora da faixa
 const idx=ENEMY_SPAWNS.map((s,i)=>s.x>=339&&s.x<460?i:-1).filter(i=>i>=0);
 ok(idx.length>=25&&idx.every(i=>ents[i].dream),'30 inimigos do sonho, todos marcados');
 ok(idx.every(i=>!solid(tile(Math.floor((ents[i].x+ents[i].w/2)/16),Math.floor((ents[i].y+ents[i].h/2)/16)))),'nenhum inimigo nasce dentro da rocha');
 {const band=y=>y>=86?0:y>=60?1:y>=30?2:3;const b0=idx.map(i=>band(ents[i].y/16));P.inv=1e9;
  for(const i of idx){const e=ents[i];put(Math.floor(e.x/16),Math.floor(e.y/16));for(let k=0;k<40;k++)step()}
  const bad=idx.filter((i,j)=>!ents[i].dead&&band(ents[i].y/16)!==b0[j]);ok(bad.length===0,'inimigos ficam na própria faixa'+(bad.length?' '+bad.map(i=>ENEMY_SPAWNS[i].t+'@'+ENEMY_SPAWNS[i].x):''))}
 // fenda no trono do Kalas
 fresh(()=>{save.boss17Dead=false});ok(!RIFTS[0].on(),'sem fenda enquanto Kalas vive');
 fresh();ents.forEach(e=>e.dead=true);put(6,97);P.riftCd=0;run(3);ok(P.x>340*16&&save.flags.rift&&state==='scene','a fenda leva ao sonho e abre a cena');
 ok(SC&&SC.chap&&SC.chap.t==='O sonho da montanha','a cena abre com cartão de capítulo');close();
 put(343,97);P.riftCd=0;run(3);ok(P.x<40*16,'a fenda de volta leva ao trono');
 // altares novos na viagem
 save.lit=[1,...[350,446,360,440].map(x=>STATUES.findIndex(s=>s.x===x))];travelMenu();ok(panel.innerHTML.includes('Margem do Sonho')&&panel.innerHTML.includes('Cume do Sonho'),'altares do sonho aparecem na viagem');state='play';scr.hidden=true;
 // os quatro chefes: acordam, lutam sem erro, caem, abrem a saída e dão a recompensa
 const fight=(B,x,y,check)=>{fresh(f=>f);save.flags.rift=1;reset();state='play';ents.forEach(e=>e.dead=true);put(x,y);P.inv=1e9;run(8);
   const b=B();ok(b&&b.state!=='sleep','acorda: '+(b&&b.name));
   let err=null;try{for(let i=0;i<900;i++){step();render();close();if(state!=='play')break}}catch(e){err=e}ok(!err,'luta 15 s sem erro'+(err?' '+err.stack:''));
   const bb=B();if(bb){bb.state='idle';bb.hp=.1;boss=bb;hitBoss(5)}for(let i=0;i<200&&state==='play';i++)step();let k=0;while(state==='scene'&&k++<40)sceneStep(false);
   check()};
 fight(()=>B18,440,97,()=>{ok(save.boss18Dead&&save.weapons.includes('shovel'),'Dimas cai e dá a Pá de Dimas');close();ok(tile(453,85)==='.'&&tile(449,95)==='=','abre a saída do cemitério')});
 fight(()=>B19,355,83,()=>{ok(save.boss19Dead&&save.charms.includes('febre'),'a Febre cai e dá o amuleto');close();ok(tile(344,59)==='.','abre a saída do quarto')});
 fight(()=>B20,440,57,()=>{ok(save.boss20Dead&&save.ab.echo,'o Eco cai e dá o Passo do Eco');close();ok(tile(453,29)==='.','abre a saída da arena do Eco')});
 fight(()=>B21,360,27,()=>{ok(save.boss21Dead&&save.flags.sonho&&state!=='win','a Montanha cai e o jogo continua (Ato III)');close();ok(RIFTS.some(r=>r.pink&&r.x===343&&r.on()),'abre a fenda cor-de-rosa no Olho da Montanha')});
 // caminho: as saídas levam de uma faixa para a outra
 fresh(()=>{save.boss18Dead=save.boss19Dead=save.boss20Dead=true});ok(tile(453,84)==='.'&&tile(344,58)==='.'&&tile(453,28)==='.','saídas abertas ao carregar o save');
 ok(!solid(tile(452,86))&&tile(452,86)==='=','degrau embaixo de cada buraco');
 // lembranças do Teo
 fresh();save.flags.rift=1;const hp0=save.maxHp;for(const id of Object.keys(LEMS)){const it=items.find(i=>i.id===id);ok(!!it&&!solid(tile(LEMS[id].x,LEMS[id].y)),'lembrança no ar: '+LEMS[id].t);put(LEMS[id].x,LEMS[id].y);P.y=it.y-8;run(2);close()}
 ok(lemCount()===6&&save.maxHp===hp0+1,'as 6 lembranças dão +1 de vida');
 // objetivo do ato II
 fresh();save.flags.rift=0;ok(objective().includes('fenda'),'objetivo leva à fenda');save.flags.rift=1;ok(objective().includes('Dimas'),'depois: '+objective());
 save.boss18Dead=true;ok(objective().includes('Febre'),'depois: '+objective());save.boss19Dead=true;ok(objective().includes('Eco'),'depois: '+objective());save.boss20Dead=true;ok(objective().includes('Montanha'),'depois: '+objective());
 {const sv=JSON.parse(JSON.stringify(freshSave()));sv.boss13Dead=true;continueFrom(sv);ok(save.flags.under===1,'save antigo que já venceu o Submundo não recebe mais boatos');state='play';scr.hidden=true}
 // save antigo com o mapa de 340 colunas
 {const o=new Array(340*H).fill('0');o[10*340+20]='1';o[50*340+300]='1';const sv=JSON.parse(JSON.stringify(freshSave()));sv.seenStr=o.join('');continueFrom(sv);
  ok(seen[10*W+20]===1&&seen[50*W+300]===1&&seen[10*W+21]===0,'save antigo mantém o mapa explorado');state='play';scr.hidden=true}
 // pá: torrões
 fresh();save.weapons.push('shovel');save.weapon='shovel';put(10,21);run(5);P.face=1;P.atk={n:3,t:0,hit:new Set()};const n0=pshots.length;run(12);ok(pshots.filter(s=>s.kind==='clod').length>=3,'terceiro golpe da pá joga torrões');
 // passo do eco
 fresh();save.ab.echo=true;put(10,21);run(5);P.dashT=10;P.dfx=0;const p0=pshots.length;run(1);ok(pshots.length>p0,'investida deixa um eco que explode');
 // gente do sonho
 ok(LINES.teokid.length===4&&LINES.euridice.length===2&&LINES.caio[LINES.caio.length-1].some(l=>l.includes('fenda')),'Teo criança, Eurídice e a pista do Caio');
 console.log(fails?fails+' FALHA(S)':'TUDO OK');setTimeout(()=>process.exit(fails?1:0),50)})();
