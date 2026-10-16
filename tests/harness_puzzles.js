;(function(){readEco=function(){};const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
 const close=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false);if(state==='msg'){state='play';scr.hidden=true}};
 newGame();state='play';scr.hidden=true;Object.assign(save.ab,{jump:true,dash:true,wall:true,glide:true,bow:true});reset();state='play';ents.forEach(e=>e.dead=true);P.inv=1e9;
 const PZ=id=>PUZZLES.find(p=>p.id===id),sealed=pz=>{for(let r=pz.seal.r0;r<=pz.seal.r1;r++)if(grid[r][pz.seal.x]!=='S')return false;return true};
 ok(PUZZLES.every(sealed),'as portas dos três cães, do Lúcio e do Kalas começam seladas');
 // a pedra ensina o enigma
 {const pz=PZ('caes');P.x=pz.tablet.x*16+3;P.y=(pz.tablet.y+1)*16-22;P.vy=0;run(3);keys.down=true;tapped.down=true;run(1);keys.down=false;
  ok(state==='msg'&&panel.innerHTML.includes('cova mais funda'),'baixo perto da pedra mostra o enigma');close()}
 // braseiros dos cães: ordem errada apaga, a certa abre
 {const pz=PZ('caes'),hit=i=>{const p=pz.pieces[i];hitPuzzle(p.x*16+8,p.y*16+8,10)};
  hit(0);hit(2);ok(puzSt(pz).lit.length===0&&sealed(pz),'ordem errada: as chamas apagam e o selo continua');
  hit(0);hit(1);hit(2);hit(3);ok(!sealed(pz)&&save.puz&&save.puz.caes,'na ordem certa (funda, longe, alta, a que sobra) o selo dos cães abre');
  reset();state='play';ok(!sealed(pz),'resolvido fica resolvido (salvo)')}
 // relógio do Lúcio: abre por pouco tempo e fecha de novo
 {const pz=PZ('lucio'),c=pz.clock;P.x=220*16;P.y=25*16-22;P.vy=0;hitPuzzle(c.x*16+8,c.y*16+8,10);
  ok(!sealed(pz)&&puzSt(pz).open>0,'acertar o relógio abre o selo do Lúcio');run(pz.time+5);ok(sealed(pz),'sem passar a tempo, o selo fecha de novo');
  hitPuzzle(c.x*16+8,c.y*16+8,10);P.x=pz.seal.x*16+20;run(2);ok(save.puz&&save.puz.lucio&&!sealed(pz),'passando pela porta aberta, o selo fica aberto de vez')}
 // lanternas do Kalas: acende de baixo para cima, também com flecha
 {const pz=PZ('kalas'),order=pz.pieces.map((p,i)=>[p.y,i]).sort((a,b)=>b[0]-a[0]).map(a=>a[1]);
  const p0=pz.pieces[order[0]];pshots.push({kind:'arrow',x:p0.x*16+2,y:p0.y*16+3,w:12,h:3,vx:0,vy:0,g:0,life:20,hit:new Set(),dmg:1});run(1);
  ok(puzSt(pz).lit.includes(order[0]),'uma flecha acende a lanterna mais baixa');
  for(const i of order.slice(1)){const p=pz.pieces[i];hitPuzzle(p.x*16+8,p.y*16+4,10)}ok(!sealed(pz),'de baixo para cima, o selo do Kalas abre')}
 // a fenda do sonho só depois do Coração
 {save.boss17Dead=true;save.boss9Dead=false;ok(!RIFTS[0].on(),'com o Kalas vencido mas o Coração vivo, a fenda fica fechada');
  save.boss9Dead=true;ok(RIFTS[0].on(),'depois do Coração a fenda abre');
  victory();ok(panel.innerHTML.includes('data-go="cont"')&&panel.innerHTML.includes('ainda sonha'),'no fim do Ato I dá para continuar a noite e ir para o sonho')}
 let err=null;try{drawPuzzles();updatePuzzles()}catch(x){err=x}ok(!err,'puzzles desenham sem erro'+(err?': '+err.message:''));
})();
