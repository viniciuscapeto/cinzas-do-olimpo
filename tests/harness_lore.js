(function(){readEco=function(){};const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
 // chefes que só davam item agora contam uma lembrança antes
 const MK={spirit:mkSpirit,queen:mkQueen,tornado:mkTornado,weaver:mkWeaver,beast:mkBeast,glutton:mkGlutton,automaton:mkAutomaton};
 for(const k in MK){newGame();state='play';scr.hidden=true;const b=MK[k]();b.state='dead';b.t=0;b.hp=0;boss=b;
  let err=null;try{bossDeath(b)}catch(x){err=x}
  ok(!err&&state==='scene'&&SC&&SC.title===BOSS_MEMS[k][0],k+': lembrança "'+BOSS_MEMS[k][0]+'" depois da luta'+(err?': '+err.message:''));
  let g=0;while(state==='scene'&&g++<20)sceneStep(false);
  ok(state!=='scene'&&(state==='msg'||banner.t>0),k+': depois da lembrança vem a recompensa ('+state+')');
  ok(BOSS_MEMS[k][1].every(p=>p.length<260),k+': falas cabem na tela')}
 // Caio: uma conversa nova entre cada chefe do santuário
 newGame();const caio=NPCS.find(n=>n.id==='caio');const st=[];
 for(const k of [null,'boss14Dead','boss15Dead','boss16Dead','boss17Dead']){if(k)save[k]=true;st.push(caio.st())}
 ok(st.join('')==='01234','Caio muda de conversa a cada chefe: '+st.join(''));
 ok(LINES.caio.length===5&&LINES.caio.every(l=>l.length>=1),'Caio tem 5 conversas');
 ok(LINES.caio[2].some(l=>l.includes('cor-de-rosa')),'Caio fala da menina da fita cor-de-rosa (pista da Telma)');
 ok(LINES.caio[4].some(l=>l.includes('fenda')),'a fala sobre a fenda continua depois do Kalas');
 save.flags.caioG=0;const b0=save.bronze;TALK_DONE.caio(3);ok(save.bronze===b0+2,'Caio dá o que roubou do altar uma vez');TALK_DONE.caio(3);ok(save.bronze===b0+2,'só uma vez');
 // Mira no sonho
 newGame();const md=NPCS.find(n=>n.id==='miradream');ok(md&&!md.when(),'a Mira criança só aparece depois do Coveiro do sonho');
 save.boss18Dead=true;ok(md.when()&&md.st()===0,'depois do Coveiro: primeira conversa');save.boss19Dead=true;ok(md.st()===1,'depois da Febre: segunda');save.boss20Dead=true;ok(md.st()===2,'depois do Eco: terceira');
 ok(!solid(grid[md.y][md.x])&&solid(grid[md.y+1][md.x]),'a Mira fica em chão firme');
 // pensamento antes da porta
 newGame();state='play';scr.hidden=true;ents.forEach(e=>e.dead=true);thought=null;boss=B1;B1.state='sleep';
 P.x=B1.x-6*TS;P.y=B1.y+B1.h-P.h;preBossThought();ok(thought&&thought.txt===PRE_BOSS.mino,'chegando perto do Corcel, Teo pensa antes da luta');
 thought=null;preBossThought();ok(!thought,'o pensamento aparece só uma vez');
 ok(BOSS_ORDER.filter(k=>!['ares','heart'].includes(k)&&!PRE_BOSS[k]&&!BOSS_INTRO[k]).length===0,'todo chefe tem um pensamento antes da luta');
 // desenho do NPC novo
 let err=null;try{save.boss18Dead=true;P.x=452*TS;P.y=83*TS;cam.x=P.x-VW/2;cam.y=P.y-VH/2;render()}catch(x){err=x}ok(!err,'Mira do sonho desenha sem erro'+(err?': '+err.message:''));
})();
