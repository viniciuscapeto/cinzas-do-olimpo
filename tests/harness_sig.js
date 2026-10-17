;(function(){readEco=function(){};let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 const close=()=>{let g=0;while(state==='scene'&&g++<60)sceneStep(false);if(state==='msg'){state='play';scr.hidden=true}};
 const fresh=()=>{newGame();state='play';scr.hidden=true;const s=creatorSave();for(const k of Object.values(KIND_KEY))s[k]=true;continueFrom(s);state='play';scr.hidden=true;P.inv=0};
 const kinds=Object.keys(SIG);ok(kinds.length===23&&kinds.every(k=>SIG[k].length===2&&REMATCH[k]),'23 chefes com 2 golpes de assinatura cada');
 const names=new Set();kinds.forEach(k=>SIG[k].forEach(g=>names.add(g.n)));ok(names.size===46,'46 golpes com nomes diferentes');
 for(const k of kinds){
   fresh();save.cp={x:6,y:21};startRematch(k);P.inv=1e9;let err=null,woke=false;
   try{for(let i=0;i<500&&!woke;i++){step();close();state='play';if(boss&&boss.kind===k&&boss.state!=='sleep'&&boss.state!=='intro')woke=true}}catch(e){err=e}
   const b=boss&&boss.kind===k?boss:null;if(!b||!woke){ok(false,k+': o chefe não acordou'+(err?' '+err.message:''));continue}
   const A=arenaOf(b);ok(A.R-A.L>=8*TS&&A.F>A.T+3*TS&&b.x+b.w/2>A.L&&b.x+b.w/2<A.R,k+': arena medida ('+((A.R-A.L)/TS)+'x'+((A.F-A.T)/TS)+' blocos)');
   for(const g of SIG[k]){
     b.sg=g;b.state='sigW';b.t=2;const m0=sigMade,z0=zones.length;let made=false;err=null;
     try{for(let i=0;i<g.dur+120;i++){step();render();close();state='play';if(sigMade>m0||zones.length>z0||b.hands||b.beamA!=null||b.flagX!=null||b.vein||b.orb||b.deb||b.candles||b.boneX!=null)made=true;if(b.state!=='sig'&&b.state!=='sigW'&&i>g.dur+4)break}}catch(e){err=e}
     ok(!err&&made,k+' · '+g.n+(err?' ERRO '+err.stack.split('\n').slice(0,2).join(' '):made?'':' (não soltou nada)'));
   }
   // e o ciclo normal: em 25 s o chefe usa um golpe de assinatura sozinho
   b.sigC=0;b.state='idle';b.t=5;let used=false;try{for(let i=0;i<1500&&!used;i++){step();close();state='play';if(boss===b&&(b.state==='sigW'||b.state==='sig'))used=true;if(b.hp<b.max*.3)b.hp=b.max}}catch(e){err=e}
   ok(used,k+': usa a assinatura no ciclo normal');
 }
 console.log(fails?fails+' FALHA(S)':'TUDO OK');
})();
