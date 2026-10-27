;(function(){readEco=function(){};const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
 // nenhum chefe acorda com o Teo fora da sala dele (andar de baixo, atrás da parede...)
 newGame();state='play';scr.hidden=true;Object.assign(save,creatorSave());reset();state='play';
 const BS=()=>[B1,B2,B3,B4,B5,B6,B7,B8,B9,B10,B11,B12,B13,B14,B15,B16,B17,B18,B19,B20,B21,B22,B23];
 const air=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&!solid(grid[y][x]);
 // até onde dá para andar (por ar) a partir de cada chefe
 const reach={};
 for(const b of BS()){if(!b)continue;const sx=Math.floor((b.x+b.w/2)/TS),sy=Math.floor((b.y+b.h-2)/TS),d=new Map([[sx+','+sy,0]]),q=[[sx,sy]];
   while(q.length){const [x,y]=q.shift(),v=d.get(x+','+y);if(v>=45)continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(!d.has(k)&&air(nx,ny)){d.set(k,v+1);q.push([nx,ny])}}}
   reach[b.kind]=d}
 const bad={};let tested=0;
 for(let y=1;y<H-1;y++)for(let x=2;x<W-1;x+=2){
   const c=grid[y][x];if(!((c==='.'||c==='=')&&air(x,y-1)&&solid(grid[y+1][x])))continue;tested++;
   P.x=x*TS+3;P.y=(y+1)*TS-22;P.vx=P.vy=0;P.inv=1e9;P.safe={x:P.x,y:P.y};state='play';
   try{step()}catch(e){continue}
   for(const b of BS())if(b&&b.state!=='sleep'&&b.state!=='dead'&&!(reach[b.kind]&&reach[b.kind].has(x+','+y)))(bad[b.kind]=bad[b.kind]||[]).push(x+','+y);
   if(BS().some(b=>b&&b.state!=='sleep'&&b.state!=='dead')||state!=='play'){reset();state='play'}
 }
 const kinds=Object.keys(bad);
 ok(tested>800&&!kinds.length,'nenhum chefe acorda de fora da sala ('+tested+' pontos)'+(kinds.length?': '+kinds.map(k=>k+' em '+bad[k].slice(0,4).join(' ')).join(' | '):''));
 // o caso do Corcel: no corredor de baixo e no poço ao lado ele dorme; dentro da praça ele acorda
 const at=(x,y)=>{reset();state='play';P.x=x*TS+3;P.y=(y+1)*TS-22;P.vx=P.vy=0;P.inv=1e9;step();return B1.state};
 ok(at(100,25)==='sleep'&&at(114,15)==='sleep','o Corcel não acorda pelo andar de baixo nem pelo poço ao lado');
 ok(at(100,15)!=='sleep','o Corcel acorda quando o Teo entra na praça');
 // o Coração da Montanha não acorda sem vencer Andros (mesmo chegando por viagem no altar de baixo)
 {reset();state='play';save.boss4Dead=false;travelTo(13);let g=0;while(state==='scene'&&g++<20)sceneStep(true);state='play';P.inv=1e9;for(let i=0;i<30;i++)step();
  ok(B9&&B9.state==='sleep'&&hints.heartSleep,'sem vencer Andros o Coração não acorda (e o Teo avisa)');
  save.boss4Dead=true;hints.heartSleep=0;for(let i=0;i<30;i++)step();ok(B9.state!=='sleep','depois de Andros o Coração acorda');save.boss4Dead=false}
 // segunda fase: com metade da vida o chefe para, se transforma e volta mais forte
 {reset();state='play';const b=B1;P.x=100*TS+3;P.y=16*TS-22;P.inv=1e9;step();boss=B1;b.state='idle';b.t=40;b.hp=b.max*.49;
  updateBoss();ok(b.enraged&&b.enT>0&&enrageBanner,'com metade da vida o chefe entra na segunda fase (faixa SEGUNDA FASE)');
  const st=b.state,x0=b.x;for(let i=0;i<ENRAGE_T-2;i++){boss=B1;updateBoss()}ok(b.state===st&&Math.abs(b.x-x0)<1,'durante a transformação ele fica parado');
  for(let i=0;i<5;i++){boss=B1;updateBoss()}ok(b.enT===0,'depois volta a lutar');
  P.inv=0;P.ward=0;P.hp=5;P.dashT=0;state='play';const h=P.hp;curFoe=null;hurtPlayer(1,b);ok(h-P.hp===2,'na segunda fase o golpe do chefe tira 1 a mais ('+h+'→'+P.hp+')');
  let err=null;try{drawEnrage();drawEnrageBanner();drawBosses()}catch(x){err=x}ok(!err,'aura vermelha, faixa e chefe tingido desenham sem erro'+(err?': '+err.message:''))}})();
