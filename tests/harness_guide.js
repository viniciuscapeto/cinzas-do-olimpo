;(function(){readEco=function(){};const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
 // próximo passo da história: frase e lugar em todas as etapas
 newGame();state='play';scr.hidden=true;ents.forEach(e=>e.dead=true);
 const steps=[];const snap=()=>{const s=storyStep();steps.push(s);return s};
 const at=s=>s&&s.at&&s.at.x>0&&s.at.x<W&&s.at.y>0&&s.at.y<H;
 let s=snap();ok(at(s)&&s.line.includes('botas'),'começo: a história manda buscar as botas nas catacumbas');
 save.ab.jump=true;s=snap();ok(at(s)&&s.line.includes('Corcel'),'depois: o Corcel');
 save.bossDead=true;save.ab.dash=save.ab.wall=true;s=snap();ok(at(s)&&s.line.includes('Ilía'),'depois: Ilía');
 save.boss2Dead=true;s=snap();ok(at(s)&&s.line.includes('cinco brasas'),'depois: as cinco brasas, apontando para o guardião mais perto');
 save.boss3Dead=save.boss6Dead=save.boss7Dead=true;s=snap();ok(at(s)&&s.line.includes('sino'),'depois: Andros');
 save.boss4Dead=true;s=snap();ok(at(s)&&s.line.includes('coração'),'depois: o Coração da Montanha');
 save.boss9Dead=true;s=snap();ok(at(s)&&s.line.includes('debaixo da cidade'),'depois: o chão rachado do Submundo');
 save.flags.under=1;s=snap();ok(at(s)&&s.line.includes('Submundo'),'depois: Kalas');
 save.boss17Dead=true;s=snap();ok(at(s)&&s.line.includes('trono'),'depois: a fenda do sonho');
 save.flags.rift=1;for(const k of ['boss18Dead','boss19Dead','boss20Dead','boss21Dead']){s=snap();ok(at(s),'Ato II: '+s.line.slice(0,40)+'…');save[k]=true}
 save.flags.sonho=1;s=snap();ok(at(s)&&s.line.includes('bilhetes')||s.line.includes('Bilhetes'),'no fim: os Ecos que faltam');
 save.taken.push(...ECOS.map(e=>e.id));ok(storyStep()===null,'com tudo feito não há próximo passo');
 // desenho do guia, do mapa e do quadro
 newGame();state='play';let err=null;try{objT=200;objLast=objective();drawStory();showMap=true;drawMap();showMap=false;objT=0;drawStory()}catch(x){err=x}
 ok(!err,'brasa-guia, quadro da história e marca no mapa desenham sem erro'+(err?': '+err.message:''));
 // brasa-guia: só depois de muito tempo na mesma tela; andando um pouco ela apaga
 {ents.forEach(e=>e.dead=true);P.inv=1e9;guide.cell='';run(5);ok(!guide.on,'a brasa-guia começa apagada');
  run(GUIDE_WAIT-10);ok(!guide.on,'ainda apagada antes de '+Math.round(GUIDE_WAIT/60)+' s na mesma tela');run(20);ok(guide.on,'acende depois de '+Math.round(GUIDE_WAIT/60)+' s parado na mesma tela');
  const n=fxp.length;frames=149;run(2);ok(fxp.length>n,'com ela acesa, uma brasa sai do Teo na direção do próximo passo');
  P.x+=GUIDE_WALK+20;run(2);ok(!guide.on&&guide.t<5,'andou uns 6 blocos: a brasa-guia apaga e o tempo recomeça')}
 ok(OBJ_STORY_T<=300&&OBJ_T<=200,'o quadro do objetivo some em até 5 s');
 // vida baixa
 err=null;try{P.hp=1;drawLowHp();P.hp=maxHp();drawLowHp()}catch(x){err=x}ok(!err,'borda vermelha de vida baixa desenha sem erro');
 // armadura por nível
 newGame();state='play';ok(heroStage()===0,'Teo começa sem armadura (roupa de trabalho)');
 {const st=[];for(const lv of [2,3,5,6,9,10,13,14,30]){save.lv=lv;st.push(heroStage())}ok(st.join('')==='011223344','peças chegam nos níveis 3, 6, 10 e 14: '+st.join(''))}
 save.lv=2;save.xp=0;ents.forEach(e=>e.dead=true);banner.t=0;gainXp(xpNeed(2)+1);ok(save.lv>=3&&banner.txt.includes('Grevas'),'subir para o nível 3 veste as Grevas da Guarda ('+banner.txt+')');
 // ecos e texto pequeno
 {let err=null;try{save.taken.push('eco1');drawHud();showMap=true;drawMap();showMap=false;objT=100;objLast=objective();drawStory();
   items.push({id:'arw',x:P.x+20,y:P.y,w:8,h:6,vy:0});drawItems()}catch(x){err=x}ok(!err,'contador de ecos no HUD/mapa, quadro com letra menor e flecha no chão desenham sem erro'+(err?': '+err.message:''))}
 ok(wrapPx('uma frase bem comprida para ver se quebra em mais de uma linha certinho',30).length>1,'o texto do objetivo quebra pela largura'); // reler os ecos no altar e ícones do Gemini
 {save.taken.push('eco1','eco2');let err=null;try{ecosMenu()}catch(x){err=x}
  ok(!err&&panel.innerHTML.includes('Bilhete 1')&&panel.innerHTML.includes(ECOS[0].t.slice(0,20))&&panel.innerHTML.includes('Ainda não encontrado'),'no altar dá para reler os ecos achados (os outros ficam em branco)');
  altarMenu();ok(panel.innerHTML.includes('data-go="ecos"')&&/Armas \(\d+\)/.test(panel.innerHTML),'altar tem o botão Ecos e o de Armas mostra o número');
  ok(['i_dagger','i_flask','i_boots','i_gauntlet','i_shield','i_ash','i_coins','i_dash'].every(k=>SPRITE_DATA[k]),'ícones do Gemini no jogo (adaga, poção, botas, manopla, escudo, cinzas, moedas, investida)');
  err=null;try{save.ab.jump=save.ab.dash=save.ab.wall=save.ab.knives=save.ab.bow=true;save.flags.ward=1;drawHud();for(const id of ['jump','dash','wall','knives'])items.push({id,x:P.x,y:P.y,w:10,h:12});drawItems();showMap=true;drawMap();showMap=false}catch(x){err=x}
  ok(!err,'HUD, itens e mapa desenham com os ícones novos'+(err?': '+err.message:''))} // sangue dos inimigos
 newGame();state='play';ents.forEach(e=>e.dead=true);const e=mkEnemy({t:'cult',x:Math.floor(P.x/16)+2,y:Math.floor((P.y+P.h)/16)-1});e.hp=99;ents.push(e);
 const b0=fxp.filter(p=>p.blood).length;hitEnemy(e,1,1,0);ok(fxp.filter(p=>p.blood).length-b0>=12&&e.bleedT>0,'golpe faz o inimigo sangrar mais (e continua sangrando)');
 const b1=fxp.filter(p=>p.blood).length;run(6);ok(fxp.filter(p=>p.blood).length>b1-4||e.bleedT<14,'a ferida sangra por alguns quadros');
 const s0=stains.filter(s=>s.pool).length;e.hp=.5;hitEnemy(e,1,1,0);ok(stains.filter(s=>s.pool).length>s0,'quem morre sangrando deixa poça no chão');
 const sk=mkEnemy({t:'hop',x:Math.floor(P.x/16)+2,y:Math.floor((P.y+P.h)/16)-1});sk.hp=99;ents.push(sk);hitEnemy(sk,1,1,0);ok(!sk.bleedT,'esqueleto não sangra (solta osso)');
})();
