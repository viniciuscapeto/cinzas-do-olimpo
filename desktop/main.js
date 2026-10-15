// Janela do jogo para Windows: abre o index.html da pasta game/ sem barra de menus
const {app,BrowserWindow,Menu}=require('electron');
const path=require('path');

function create(){
  const win=new BrowserWindow({
    width:1280,height:780,minWidth:640,minHeight:400,backgroundColor:'#120c0e',title:'Cinzas do Olimpo',
    icon:path.join(__dirname,'game','icon-512.png'),autoHideMenuBar:true,
    webPreferences:{contextIsolation:true,sandbox:true},
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname,'game','index.html'));
  // F11 alterna tela cheia (o F do jogo também funciona)
  win.webContents.on('before-input-event',(e,input)=>{
    if(input.type==='keyDown'&&input.key==='F11'){win.setFullScreen(!win.isFullScreen());e.preventDefault()}
  });
}
app.whenReady().then(create);
app.on('window-all-closed',()=>app.quit());
