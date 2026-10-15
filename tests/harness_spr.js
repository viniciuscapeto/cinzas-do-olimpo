setTimeout(()=>{try{
 console.log('sprReady',sprReady,Object.keys(SPR).length);
 const run=n=>{for(let i=0;i<n;i++){step();render()}};
 cv.getBoundingClientRect=()=>({width:1920});RS=1;fitRes();console.log('RS',RS);
 newGame();state='play';scr.hidden=true;save.boss2Dead=save.bossDead=save.boss7Dead=true;save.ab.jump=save.ab.dash=save.ab.wall=true;save.flags.ward=1;save.equip=['lanterna','pena'];reset();state='play';P.inv=999999;
 for(const [x,y] of [[36,22],[270,25],[313,25],[315,8],[302,39],[275,54],[320,54],[250,25],[195,9],[164,54]]){P.x=x*16+3;P.y=y*16-22;P.vy=0;run(250);if(state==='scene'){let g=0;while(state==='scene'&&g++<30)sceneStep(false)}if(state==='msg'){state='play';scr.hidden=true}}
 altarMenu();forgeMenu();charmMenu();travelMenu();trialsMenu();shopMenu();
 console.log('render ok com sprites em alta resolução');
}catch(e){console.log('ERRO',e.stack)}},50);
