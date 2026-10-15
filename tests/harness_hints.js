;(function(){readEco=function(){};let fails=0;const run=n=>{for(let i=0;i<n;i++){step();render()}};const ok=(c,m)=>{if(!c)fails++;console.log((c?'OK   ':'FALHA ')+m)};
 newGame();state='play';scr.hidden=true;ents.forEach(e=>e.dead=true);P.inv=99999;
 ok(CRACKS.every(c=>tile(c.x,c.y)==='C'),'todos os chãos rachados das pistas existem no mapa');
 for(const c of CRACKS){if(c.id==='cat')continue;P.x=c.x*16-24;P.y=c.y*16-22;P.vx=P.vy=0;banner.t=0;run(3);ok(hints['ck'+c.id]&&banner.txt===c.msg,'pista perto do chão rachado: '+c.msg)}
 const n0=fxp.length;P.x=10*16;P.y=54*16-22;fxp=[];run(40);ok(fxp.some(p=>p.col==='#6a5a5a'||p.col==='#8a7a72'),'fumaça sobe do chão rachado');
 ok(LINES.caronte[3].some(l=>l.includes('oco'))&&LINES.iago[0].some(l=>l.includes('rachado'))&&LINES.zoe[0].some(l=>l.includes('pântano'))&&LINES.mira[3].some(l=>l.includes('Odete')),'NPCs dão pistas do submundo');
 save.boss9Dead=true;victory();ok(panel.innerHTML.includes('Pista:'),'tela final dá a pista se o Kalas ainda vive');
 console.log(fails?fails+' FALHA(S)':'TUDO OK')})();
