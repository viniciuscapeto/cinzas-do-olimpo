const noop=()=>{};
const PX=new Proxy(function(){},{get:(t,k)=>k==='measureText'?(()=>({width:40})):PX,apply:()=>PX,set:()=>true});
const mkEl=()=>({getContext:()=>PX,addEventListener:noop,querySelectorAll:()=>[],classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},querySelector:()=>null,closest:()=>null,
  innerHTML:'',style:{},hidden:false,textContent:'',dataset:{},focus:noop,setPointerCapture:noop});
const els={};
globalThis.document={getElementById:id=>els[id]||(els[id]=mkEl()),createElement:()=>({getContext:()=>PX,width:0,height:0}),addEventListener:noop,querySelectorAll:()=>[],hidden:false};
globalThis.window=globalThis;globalThis.addEventListener=noop;globalThis.matchMedia=()=>({matches:false});
globalThis.localStorage={getItem:()=>null,setItem:noop};globalThis.requestAnimationFrame=noop;
