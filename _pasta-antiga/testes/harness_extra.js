;(function(){readEco=function(){};let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 // localStorage de verdade (em memória) para testar save do criador e conquistas
 const mem={};localStorage.getItem=k=>k in mem?mem[k]:null;localStorage.setItem=(k,v)=>{mem[k]=String(v)};
 const close=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false);if(state==='msg'){state='play';scr.hidden=true}};
 const all=()=>{Object.assign(save.ab,{jump:true,dash:true,wall:true,glide:true,bow:true});save.arrowsMax=10;save.flags.lvInfo=1;for(const k of Object.values(KIND_KEY))save[k]=true;save.flags.under=1;save.flags.rift=1};
 const fresh=f=>{newGame();state='play';scr.hidden=true;all();if(f)f();reset();state='play';P.inv=0};
 const put=(x,y)=>{P.x=x*16+3;P.y=(y+1)*16-22;P.vx=P.vy=0;cam.x=P.x-160;cam.y=P.y-90;clampCam()};
 // ordem dos altares: os do Submundo continuam nos números antigos
 ok(STATUES[18].x===4&&STATUES[23].x===33&&STATUES[24].x===350&&STATUES[28].x===84,'altares antigos mantêm o número (Submundo 18-23, sonho 24-27, adega 28)');
 ok(TRIALS[2].n==='Prova do Capitão'&&TRIALS[3].endless,'provas antigas mantêm o número; arena sem fim é a 4ª');
 // áreas opcionais
 fresh();ok(tile(71,16)==='C'&&tile(208,6)==='C','entradas: chão rachado no templo e parede rachada na Sala das Horas');
 ok(zoneAt(80,25)==='Adega do Templo'&&zoneAt(95,45)==='Ossuário Esquecido'&&zoneAt(80,45)==='Covil do Glutão'&&zoneAt(220,5)==='Sótão do Relógio'&&zoneAt(240,5)==='Engrenagem Mestra','nomes das áreas opcionais');
 const oi=ENEMY_SPAWNS.map((s,i)=>(s.x>=66&&s.x<=106&&s.y>=18&&s.y<=50)||(s.x>=208&&s.x<=252&&s.y<=10)?i:-1).filter(i=>i>=0);
 ok(oi.length===10&&oi.every(i=>!solid(tile(Math.floor((ents[i].x+ents[i].w/2)/16),Math.floor((ents[i].y+ents[i].h/2)/16)))),'10 inimigos nas áreas opcionais, fora da rocha');
 ok(CHESTS.filter(c=>c.id.startsWith('co')).every(c=>!solid(tile(c.x,c.y))&&(solid(tile(c.x,c.y+1))||tile(c.x,c.y+1)==='=')),'baús novos no chão ou em plataforma');
 ok(tile(100,34)==='='&&tile(100,37)==='='&&tile(101,33)==='.','poço do ossuário tem degraus para voltar');
 // chefes opcionais
 const fight=(B,x,y,check)=>{fresh();ents.forEach(e=>e.dead=true);save.boss22Dead=save.boss23Dead=false;reset();state='play';ents.forEach(e=>e.dead=true);put(x,y);P.inv=1e9;run(8);
   const b=B();ok(b&&b.state!=='sleep','acorda: '+(b&&b.name));let err=null;try{for(let i=0;i<900;i++){step();render();close();if(state!=='play')break}}catch(e){err=e}ok(!err,'luta 15 s sem erro'+(err?' '+err.stack:''));
   const bb=B();if(bb){bb.state='idle';bb.hp=.1;boss=bb;hitBoss(5)}for(let i=0;i<200&&state==='play';i++)step();close();check()};
 fight(()=>B22,84,50,()=>ok(save.boss22Dead&&save.charms.includes('vampiro'),'Glutão cai e dá o Dente do Vampiro'));
 fight(()=>B23,238,9,()=>ok(save.boss23Dead&&save.charms.includes('agil')&&save.slots===4,'Autômato cai, dá as Sandálias e +1 espaço de amuleto'));
 // itens raros
 fresh();ents.forEach(e=>e.dead=true);put(10,21);run(3);const rnd=Math.random;Math.random=()=>0.001;const e=mkEnemy({t:'guard',x:13,y:21});e.elite=true;ents.push(e);P.atk={n:1,t:5,hit:new Set()};hitEnemy(e,999,1,0);P.atk=null;Math.random=rnd;
 const ri=items.find(i=>i.id.startsWith('rare_'));ok(!!ri,'inimigo furioso solta item raro');if(ri){hitstop=0;for(let i=0;i<4;i++){ri.x=P.x;ri.y=P.y+4;ri.vy=0;run(1)}close();ok(save.charms.includes(ri.id.slice(5)),'pegar o item raro dá o amuleto')}
 fresh();save.equip=['coroa'];const d1=dmgMult();save.equip=[];ok(Math.abs(d1/dmgMult()-1.25)<1e-9,'Coroa de Cinza: +25% de dano');
 save.equip=['vampiro'];P.hp=2;P.vamp=0;for(let i=0;i<15;i++){const t=mkEnemy({t:'brute',x:12,y:21});t.hp=999;ents.push(t);P.atk={n:1,t:5,hit:new Set()};hitEnemy(t,.01,1,0)}P.atk=null;ok(P.hp===3,'Dente do Vampiro: 15 golpes curam 1');
 save.equip=['espinho'];const f=mkEnemy({t:'hound',x:12,y:21});ents.push(f);const fh=f.hp;P.inv=0;curFoe=f;hurtPlayer(1,f);curFoe=null;ok(f.hp<fh,'Coroa de Espinhos devolve dano');
 // conquistas
 fresh();save.stats={kills:150,combo:25};checkAch();const got=achGot();ok(got.kill1&&got.kill100&&got.combo20&&!got.kill500,'conquistas desbloqueiam pelas estatísticas e ficam guardadas');
 achMenu('title');ok(panel.innerHTML.includes('Coveiro de ofício')&&panel.innerHTML.includes('✔'),'tela de conquistas');
 // save do criador
 delete mem[SLOT_KEY];mem['cinzas-save2']=JSON.stringify(Object.assign(freshSave(),{lv:17,maxHp:12}));
 try{const cur=localStorage.getItem('cinzas-save2');if(cur&&!localStorage.getItem(SLOT_KEY))localStorage.setItem(SLOT_KEY,JSON.stringify({at:Date.now(),save:JSON.parse(cur)}))}catch(_){}
 ok(creatorSlot()&&creatorSlot().save.lv===17,'cópia do save do criador guardada');titleScreen();ok(panel.innerHTML.includes('Carregar save do criador'),'botão na tela inicial');
 newGame();persist();loadCreatorSlot();ok(save.lv===17&&mem['cinzas-save-backup'],'carregar o save do criador (e guarda o save atual como backup)');state='play';scr.hidden=true;
 // revanche contra cada chefe
 const kinds=Object.keys(REMATCH);let woke=0,clean=0,back=0;const bad=[];
 for(const k of kinds){fresh();save.cp={x:6,y:21};startRematch(k);P.inv=1e9;const sp=solid(tile(Math.floor((P.x+5)/16),Math.floor((P.y+11)/16)));
   let err=null,w=false;try{for(let i=0;i<700;i++){step();render();close();if(boss&&boss.kind===k&&boss.state!=='sleep')w=true;if(state!=='play')break}}catch(e){err=e}
   if(w)woke++;else bad.push(k+':dorme');if(!err&&!sp)clean++;else bad.push(k+(sp?':rocha':':'+err.message));
   const b=boss&&boss.kind===k?boss:null;if(b){b.state='idle';b.guard=false;b.hp=.1;hitBoss(5);for(let i=0;i<200&&rematch;i++)step()}
   if(!rematch&&save.records.boss&&save.records.boss[k]>0&&Math.floor(P.x/16)===6)back++;else bad.push(k+':volta');close()}
 ok(woke===kinds.length,'revanche: todos os '+kinds.length+' chefes acordam'+(bad.length?' '+bad.join(' '):''));ok(clean===kinds.length,'revanche: todas as lutas sem erro');ok(back===kinds.length,'revanche: ao vencer, volta ao altar com recorde');
 // arena sem fim
 fresh();save.trials=[1,1,1];ents.forEach(e=>e.dead=true);startTrial(3);P.inv=1e9;let maxW=0;
 for(let i=0;i<4000&&trial;i++){step();close();for(const e of ents)if(e.trial&&!e.dead&&trial&&trial.t===0){e.dead=true}if(trial)maxW=Math.max(maxW,trial.w)}
 ok(maxW>=10&&save.records.arena>=10,'arena sem fim passa da onda 10 (recorde '+save.records.arena+')');ok(save.charms.includes('coroa'),'onda 10 dá a Coroa de Cinza');trial=null;
 // Noite+
 fresh();save.ngBest=0;const c0=save.charms.length;newNightPlus();close();ok(save.ng===1&&save.ngBest===1&&save.charms.length===c0+1,'Noite+ 1: nome novo e item raro na primeira vez');
 newNightPlus();close();newNightPlus();close();ok(save.ng===3&&NG_NAMES[3]==='A noite sem trégua','Noite+ 3: A noite sem trégua');
 state='play';const g=mkEnemy({t:'hop',x:10,y:21});P.inv=0;P.hp=5;curFoe=g;hurtPlayer(1,g);curFoe=null;ok(P.hp===3,'Noite+ 3: golpe dos mortos tira 1 a mais');
 console.log(fails?fails+' FALHA(S)':'TUDO OK');setTimeout(()=>process.exit(fails?1:0),50)})();
