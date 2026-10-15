;(function(){
  let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};
  const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
  const talkTo=id=>{const n=NPCS.find(x=>x.id===id);talk(n);let c=0;while(state==='talk'&&c++<40)advanceTalk()};
  newGame();state='play';scr.hidden=true;ents.forEach(e=>e.dead=true);
  ok(!P.ward,'sem bênção no começo');
  talkTo('odete');ok(save.flags.ward&&P.ward===1&&state==='msg','Irmã Odete dá a Bênção de Cinza');state='play';scr.hidden=true;
  const hp=P.hp;P.inv=0;hurtPlayer(1,{x:P.x+20,y:P.y,w:4,h:4});ok(P.hp===hp&&P.ward===0,'a bênção segura um golpe sem perder vida');
  P.inv=0;hurtPlayer(1,{x:P.x+20,y:P.y,w:4,h:4});ok(P.hp===hp-1,'o segundo golpe já tira vida');
  P.onStatue=-1;const s=statues[1];P.x=s.x;P.y=s.y;updateStatues();ok(P.ward===1,'altar acende a bênção de novo');
  reset();state='play';ok(P.ward===1,'depois de morrer/voltar, a bênção vem acesa');
  // romãs na luta da Besta
  ents.forEach(e=>e.dead=true);P.x=55*16;P.y=54*16-22;P.inv=999999;run(3);
  let got=0;const hp0=P.hp;for(let i=0;i<1400;i++){step();if(items.some(it=>it.id==='pom'))got++;}
  ok(B5.state!=='sleep'&&got>0,'na luta da Besta caem romãs');
  const pm=items.find(it=>it.id==='pom');P.hp=2;if(pm){P.x=pm.x;P.y=pm.y-10;run(30)}ok(P.hp===3,'pegar a romã dá +1 de vida');
  // romãs na luta da Tecelã
  newGame();state='play';scr.hidden=true;save.boss2Dead=true;save.ab.jump=save.ab.wall=true;reset();state='play';ents.forEach(e=>e.dead=true);
  P.x=250*16;P.y=54*16-22;P.inv=999999;run(3);got=0;for(let i=0;i<1400;i++){step();if(items.some(it=>it.id==='pom'))got++}
  ok(B8.state!=='sleep'&&got>0,'na luta da Tecelã caem romãs');
  talkTo('t8');ok(save.flags.ward,'o casulo perto da Tecelã também dá a bênção');
  console.log(fails?fails+' FALHA(S)':'TUDO OK');
})();
