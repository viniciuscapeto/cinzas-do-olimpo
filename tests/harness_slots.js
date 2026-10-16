;(function(){readEco=function(){};const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
 const mem={};localStorage.getItem=k=>k in mem?mem[k]:null;localStorage.setItem=(k,v)=>{mem[k]=String(v)};localStorage.removeItem=k=>{delete mem[k]};
 titleScreen();ok((panel.innerHTML.match(/Vazio/g)||[]).length===3,'sem jogo: os 3 espaços aparecem vazios');
 // jogo avançado no espaço 1
 setSlot(1);newGame();save.lv=7;save.taken.push('eco1');persist();
 // jogo do começo no espaço 2
 setSlot(2);newGame();persist();
 ok(loadSlot(1).lv===7&&loadSlot(2).lv===1&&!loadSlot(3),'cada espaço guarda o seu jogo (1: nível 7, 2: nível 1, 3: vazio)');
 ok(mem['cinzas-save2']&&JSON.parse(mem['cinzas-save2']).lv===7,'o espaço 1 é o save antigo (quem já jogava não perde nada)');
 titleScreen();ok(panel.innerHTML.includes('Nível 7')&&panel.innerHTML.includes('Nível 1')&&panel.innerHTML.includes('ecos 1/'),'o título mostra nível, lugar e ecos de cada espaço');
 // jogar no 2 não mexe no 1
 save.lv=3;persist();ok(loadSlot(1).lv===7&&loadSlot(2).lv===3,'salvar no espaço 2 não mexe no espaço 1');
 // continuar o 1
 setSlot(1);continueFrom(loadSaved());ok(save.lv===7&&save.taken.includes('eco1'),'continuar o espaço 1 volta ao jogo avançado');
 // pedir confirmação antes de apagar ou começar por cima
 slotAsk('new',1);ok(panel.innerHTML.includes('Começar do zero')&&panel.innerHTML.includes('data-go="start" data-t="1"'),'novo jogo num espaço usado pede confirmação');
 slotAsk('del',2);ok(panel.innerHTML.includes('Apagar este jogo')&&panel.innerHTML.includes('data-go="del" data-t="2"'),'apagar pede confirmação');
 localStorage.removeItem(slotKey(2));titleScreen();ok(!loadSlot(2)&&loadSlot(1),'apagar o espaço 2 deixa o 1 intacto');
 // o espaço escolhido fica lembrado
 setSlot(3);ok(mem['cinzas-slot']==='3','o último espaço usado fica lembrado');
 // começo mais difícil: pá do coveiro
 setSlot(3);newGame();ok(save.weapon==='spade'&&save.weapons.join()==='spade','jogo novo começa só com a pá do coveiro');
 ok(WEAPON_LORE.spade&&WEAPON_LORE.sword.includes('Andros'),'a pá e a espada do capitão têm história');
})();
