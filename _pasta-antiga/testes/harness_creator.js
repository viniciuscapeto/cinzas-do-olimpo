;(function(){readEco=function(){};const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
 const close=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false);if(state==='msg'||state==='talk'){state='play';scr.hidden=true}};
 const mem={};localStorage.getItem=k=>k in mem?mem[k]:null;localStorage.setItem=(k,v)=>{mem[k]=String(v)};localStorage.removeItem=k=>{delete mem[k]};
 // um save normal já existe neste navegador
 newGame();save.maxHp=7;persist();const mine=localStorage.getItem('cinzas-save2');
 // escondido por padrão
 titleScreen();ok(!creatorMode()&&!panel.innerHTML.includes('Modo criador'),'modo criador fica escondido no título');
 setCreatorMode(true);titleScreen();ok(panel.innerHTML.includes('Modo criador'),'depois de liberado aparece no título');
 // o save
 loadCreatorSave();
 ok(state==='play'&&save.flags.creator,'carrega o save do criador e entra no jogo');
 ok(save.maxHp===5+ITEM_SPAWNS.filter(i=>/^hp\d?$/.test(i.id)).length+4&&P.hp===maxHp(),'vida sem as recompensas de chefe ('+save.maxHp+' + nível = '+maxHp()+')');
 ok(ecoCount()===ECOS.length,'os '+ECOS.length+' ecos');
 ok(['sword','spear','scythe','hammer','shovel'].every(w=>save.weapons.includes(w))&&save.ab.knives&&save.ab.bow&&save.ab.fire,'todas as armas, adagas e arco de fogo');
 ok(['jump','dash','wall','glide','beast','echo'].every(k=>save.ab[k]),'todas as habilidades de movimento');
 ok(TECHS.every(t=>save.tech[t.id])&&Object.keys(CHARMS).every(c=>save.charms.includes(c)),'todas as técnicas e amuletos');
 ok(Object.keys(FORGE).every(k=>forgeLv(k)===FORGE[k].lv.length),'forja no máximo');
 ok(['bossDead',...Array.from({length:22},(_,i)=>'boss'+(i+2)+'Dead')].every(k=>!save[k])&&B1&&B9&&B17&&B21&&B23,'os 23 chefes continuam vivos');
 ok(save.lit.length===STATUES.length&&seen.every(v=>v===1),'todos os altares acesos e mapa revelado');
 ok(P.arrows===save.arrowsMax&&P.knives===KNIFE_MAX,'munição cheia ('+P.arrows+' flechas)');
 ok(!items.some(i=>/^(hp\d?|eco\d+|w_|pg|lem)/.test(i.id)),'nenhum item de progresso sobra no mapa');
 // anda pelo mundo todo: viaja para cada altar e roda o jogo
 let err=null,bad=[];P.inv=1e9;
 try{for(let i=0;i<STATUES.length;i++){travelTo(i);close();P.inv=1e9;run(40);close();if(state!=='play')bad.push(i+':'+state)}}catch(x){err=x}
 ok(!err&&!bad.length,'viaja para os '+STATUES.length+' altares e o jogo roda em todos'+(err?': '+err.message:'')+(bad.length?' '+bad.join(','):''));
 // vencer um chefe dá a vida dele normalmente
 {const hp=save.maxHp;boss=B5=mkBeast();B5.state='idle';B5.hp=0;hitBoss(0);for(let i=0;i<300&&B5;i++){boss=B5;updateBoss()}close();ok(save.boss5Dead&&save.maxHp===hp+1,'vencer a Besta dá +1 de vida como no jogo normal ('+hp+'→'+save.maxHp+')')}
 // esconder de novo
 // voltar ao save de antes
 titleScreen();ok(panel.innerHTML.includes('Voltar ao meu save'),'título oferece voltar ao save de antes');
 restoreBackup();ok(JSON.parse(localStorage.getItem('cinzas-save2')).maxHp===7&&!hasBackup(),'voltar ao meu save devolve o save normal');
 setCreatorMode(false);titleScreen();ok(!panel.innerHTML.includes('Modo criador'),'dá para esconder o modo criador');
})();
