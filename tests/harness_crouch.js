;(function(){readEco=function(){};const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>console.log((c?'OK   ':'FALHA ')+m);
 const close=()=>{let g=0;while(state==='scene'&&g++<40)sceneStep(false);if(state==='msg'||state==='talk'){state='play';scr.hidden=true}};
 newGame();state='play';scr.hidden=true;save.ab.jump=save.ab.dash=save.ab.wall=true;reset();state='play';ents.forEach(e=>e.dead=true);
 const place=(tx,ty)=>{close();state='play';P.x=tx*16+3;P.y=(ty+1)*16-22;P.h=22;P.crouch=false;P.vx=P.vy=0;P.inv=1e9;run(3)};
 // agachar e levantar
 place(30,21);const y0=P.y+P.h;keys.down=true;run(3);ok(P.crouch&&P.h===14&&Math.abs(P.y+P.h-y0)<.01,'segurar baixo agacha (fica 14 de altura, pés no lugar)');
 ok(heroPose().k==='kCrouch','desenha o cavaleiro agachado');
 keys.right=true;run(20);const vC=Math.abs(P.vx);keys.right=false;ok(vC>0&&vC<RUN*.6,'agachado anda devagar ('+vC.toFixed(2)+')');
 keys.down=false;run(3);ok(!P.crouch&&P.h===22,'soltar baixo levanta');
 // cada fresta
 for(const c of CRAWLS){
   const mid=crawlMid(c),dir=c.d>0?'right':'left';
   ok(grid[c.y][c.x+c.d]==='.'&&grid[c.y-1][c.x+c.d*c.L]==='u'&&grid[c.y][mid]==='.'&&grid[c.y+1][mid]!=='.','fresta '+zoneAt(c.x,c.y)+' cavada (túnel, viga baixa e salinha)');
   // em pé não passa
   place(c.x,c.y);keys[dir]=true;run(90);keys[dir]=false;const stand=Math.abs(P.x/16-c.x);
   ok(stand<2.5,'em pé não entra na fresta de '+zoneAt(c.x,c.y)+' (andou '+stand.toFixed(1)+')');
   // agachado passa e chega na salinha
   place(c.x,c.y);keys.down=true;keys[dir]=true;for(let i=0;i<240;i++){run(1);close()}keys[dir]=false;keys.down=false;run(6);close();
   const inRoom=Math.abs((P.x+P.w/2)/16-(mid+.5))<c.cw/2+1;
   ok(inRoom&&!P.crouch,'agachado chega na salinha de '+zoneAt(c.x,c.y)+' e levanta lá dentro (x '+(P.x/16).toFixed(1)+', meio '+mid+')');
   // dentro do túnel não dá para levantar
   place(c.x+c.d*Math.ceil(c.L/2),c.y);P.crouch=true;P.h=14;P.y=(c.y+1)*16-14;keys.down=false;run(5);ok(P.crouch&&P.h===14,'no meio do túnel ele continua agachado mesmo soltando baixo');
   const tgt=c.r?chests.find(h=>h.id===c.r.id):(items.find(i=>i.id===c.item)||save.taken.includes(c.item));ok(!!tgt,'recompensa na salinha ('+(c.r?c.r.id:c.item)+')');
 }
 // a Joelheira deixa andar agachado na velocidade normal
 place(30,21);save.charms.push('joelheira');save.equip=['joelheira'];keys.down=true;keys.right=true;run(20);const vJ=Math.abs(P.vx);keys.right=false;keys.down=false;save.equip=[];run(3);
 ok(vJ>RUN*.85,'com a Joelheira do Coveiro anda agachado rápido ('+vJ.toFixed(2)+')');
 // a vida a mais da fresta
 ok(save.taken.includes('hp4')&&save.maxHp>=6,'a fresta do Jardim dá +1 de vida (vida máx '+save.maxHp+')');
 // agachar ainda desce de plataforma e fala com NPC
 place(31,17);ok(standingOnPlatform(),'de pé na plataforma das Ruínas');keys.down=true;run(2);tapped.jump=true;keys.jump=true;run(1);keys.jump=false;run(12);keys.down=false;run(3);ok(P.y+P.h>18*16+2,'baixo + pular ainda desce pela plataforma (agachado ou não)');
 // agachado o golpe alto passa por cima
 place(30,21);keys.down=true;run(3);const top=P.y;keys.down=false;run(3);ok(top-P.y>7,'agachado o corpo fica 8 mais baixo (desvia de golpes altos)');
})();
