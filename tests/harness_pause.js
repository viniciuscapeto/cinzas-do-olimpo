(function(){readEco=function(){};const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
 const mem={};localStorage={getItem:k=>k in mem?mem[k]:null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}};
 // pausa
 newGame();state='play';scr.hidden=true;ents.forEach(e=>e.dead=true);run(5);
 pauseMenu();ok(state==='msg'&&panel.innerHTML.includes('Opções'),'Esc/Start abre a pausa');
 const f0=frames;const x0=P.x;keys.right=true;run(20);keys.right=false;ok(P.x===x0,'na pausa o mundo para');
 // salvar só no altar: a pausa não salva
 ok(!panel.innerHTML.includes('Salvar jogo')&&panel.innerHTML.includes('salva nos altares'),'a pausa não salva; avisa que o jogo salva nos altares');
 altarMenu();ok(panel.innerHTML.includes('altarsave'),'o menu do altar tem Salvar jogo');
 // morrer fora de luta volta para o altar
 state='play';scr.hidden=true;keys.right=true;run(70);keys.right=false;run(30);
 die();deadT=1;run(1);ok(Math.abs(P.x-(save.cp.x*TS+3))<1,'morrendo fora de luta, volta para o altar');
 // checkpoint de chefe
 newGame();state='play';scr.hidden=true;ents.forEach(e=>e.dead=true);
 const b1=B1;P.x=b1.x-200;P.y=b1.y;for(let i=0;i<60;i++)run(1);
 safeHist.length=0;safeHist.push({x:P.safe.x,y:P.safe.y});const cpx=P.safe.x;
 boss=b1;b1.state='idle';trackBossCp();ok(bossCp&&bossCp.kind==='mino'&&bossCp.x===cpx,'quando a luta começa, guarda o checkpoint de antes da arena');
 P.x=b1.x-30;die();deadT=1;run(1);ok(Math.abs(P.x-cpx)<1&&P.hp===maxHp(),'morrendo na luta, volta ao checkpoint do chefe com vida cheia');
 ok(Math.abs(P.x-(save.cp.x*TS+3))>TS,'e não para o altar');
 boss=B1;B1.state='idle';bossCp.kind='mino';P.x=10*TS;die();deadT=1;run(1);ok(!bossCp&&Math.abs(P.x-(save.cp.x*TS+3))<1,'morrendo longe do chefe, volta para o altar e o checkpoint some');
 boss=B1;B1.state='idle';trackBossCp();B1.hp=0;B1.state='dead';trackBossCp();ok(!bossCp,'vencendo o chefe, o checkpoint some');
 boss=null;
 // sair para o título
 state='play';quitToTitle();ok(state==='title'&&!bossCp,'Sair para o título continua do altar');
 // opções
 optsMenu();ok(panel.innerHTML.includes('Música')&&panel.innerHTML.includes('Tremor'),'Opções: volume, tela cheia, gráficos e tremor');
 // teclas
 const old={...KEYMAP};ok(bindKey('attack','KeyU')&&KEYMAP.KeyU==='attack'&&!KEYMAP.KeyJ,'trocar a tecla de atacar para U');
 ok(!bindKey('jump','Escape'),'Esc não pode ser usada');
 ok(JSON.parse(mem['cinzas-teclas']).KeyU==='attack','as teclas ficam guardadas');KEYMAP={...KEYMAP_DEF};
 keysMenu();ok(panel.innerHTML.includes('Controle')&&panel.innerHTML.includes('Start'),'tela de teclas mostra o controle também');
 // controle: apertar A pula (vira toque), segurar não repete
 newGame();state='play';scr.hidden=true;ents.forEach(e=>e.dead=true);
 const btn=Array.from({length:17},()=>({pressed:false,value:0}));const gp={connected:true,buttons:btn,axes:[0,0]};
 const nav=globalThis.navigator;Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[gp]},configurable:true});
 pollPad();btn[0].pressed=true;pollPad();ok(tapped.jump&&keys.jump,'A do controle = pular');
 run(1);pollPad();ok(!tapped.jump&&keys.jump,'segurando A não repete o toque');
 btn[0].pressed=false;pollPad();ok(!keys.jump,'soltou A');
 gp.axes[0]=-1;pollPad();ok(keys.left,'analógico para a esquerda anda');gp.axes[0]=0;pollPad();ok(!keys.left,'analógico no meio para');
 btn[9].pressed=true;pollPad();ok(state==='msg'&&panel.innerHTML.includes('Pausado'),'Start abre a pausa');btn[9].pressed=false;pollPad();
 Object.defineProperty(globalThis,'navigator',{value:nav,configurable:true});
 // demo
 ok(DEMO===false,'jogo completo não é demo');
 let err=null;try{demoEnd()}catch(x){err=x}ok(!err&&panel.innerHTML.includes('Fim da demo'),'tela de fim da demo funciona'+(err?': '+err.message:''));
})();
