import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer as netServer } from "node:net";
import { join } from "node:path";
import { serveFixture } from "/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/clone/scripts/check-bidi-runtime.mjs";
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const freePort=()=>new Promise((res,rej)=>{const s=netServer();s.on("error",rej);s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>res(p))})});
const S=process.env.TMPDIR; const scratch=mkdtempSync(join(S,"pat-"));
const rt=process.env.XDG_RUNTIME_DIR; let chromeTmp=scratch; let own=false;
if(scratch.length>60){chromeTmp=mkdtempSync(join(rt,"pat-"));own=true;}
const fx=await serveFixture(); const port=await freePort();
const cd=spawn("/usr/bin/chromedriver",[`--port=${port}`],{stdio:"ignore",env:{...process.env,TMPDIR:chromeTmp,TMP:chromeTmp,TEMP:chromeTmp}});
let body=null;
for(let k=0;k<60&&!body;k++){try{const r=await fetch(`http://127.0.0.1:${port}/session`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({capabilities:{alwaysMatch:{browserName:"chrome",webSocketUrl:true,unhandledPromptBehavior:"ignore","goog:chromeOptions":{binary:"/usr/bin/chromium",args:["--headless=new","--no-sandbox","--no-first-run","--disable-gpu",`--user-data-dir=${join(scratch,"profile")}`]}}}})});body=await r.json()}catch{await sleep(200)}}
if(!body||!body.value||!body.value.capabilities){console.error("NEW SESSION FAILED",JSON.stringify(body));process.exit(3)}
const ws=new WebSocket(body.value.capabilities.webSocketUrl);
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=()=>j(new Error("ws"))});
let id=0; const pend=new Map(); const events=[];
ws.onmessage=(m)=>{const f=JSON.parse(String(m.data)); if(f.id!==undefined&&pend.has(f.id)){pend.get(f.id)(f);pend.delete(f.id)} else if(f.method) events.push(f)};
const send=(method,params={})=>new Promise(res=>{id++;pend.set(id,res);ws.send(JSON.stringify({id,method,params}))});
await send("session.subscribe",{events:["network.beforeRequestSent","network.responseStarted","network.authRequired","network.responseCompleted"]});
const tree=await send("browsingContext.getTree",{}); const context=tree.result.contexts[0].context;
await send("browsingContext.navigate",{context,url:`${fx.base}/a.html`,wait:"complete"});
const B=fx.base;
const pats=[
 ["counter-shape",`${B}/data.txt?held=1`],
 ["exact-with-case",`${B}/data.txt?case=x`],
 ["no-query",`${B}/data.txt`],
 ["trailing-star",`${B}/data.txt*`],
 ["base-star",`${B}/*`],
 ["star",`*`],
 ["query-star",`${B}/data.txt?case=*`],
 ["never-star",`${B}/never-*`],
 ["plain-path",`/data.txt`],
];
const results=[];
for(const [label,p] of pats){
  const r=await send("network.addIntercept",{phases:["beforeRequestSent"],urlPatterns:[{type:"string",pattern:p}]});
  results.push({label,pattern:p,response:r});
  if(r.type==="success") await send("network.removeIntercept",{intercept:r.result.intercept});
}
// blocking check with an accepted pattern: exact URL including query
const target=`${B}/data.txt?case=blockme`;
const add=await send("network.addIntercept",{phases:["beforeRequestSent"],urlPatterns:[{type:"string",pattern:target}]});
const start=events.length;
await send("script.evaluate",{expression:`window.__r=fetch(${JSON.stringify(target)}).then(r=>r.text(),e=>'ERR:'+e),1`,awaitPromise:false,target:{context}});
await sleep(1500);
const evs=events.slice(start).map(e=>({method:e.method,isBlocked:e.params.isBlocked,url:e.params.request&&e.params.request.url,intercepts:e.params.intercepts}));
writeFileSync(process.argv[2],JSON.stringify({results,add,eventsForBlock:evs},null,2));
console.log(JSON.stringify({results,add,evs},null,2));
try{ws.close()}catch{}
await fetch(`http://127.0.0.1:${port}/session/${body.value.sessionId}`,{method:"DELETE"}).catch(()=>{});
cd.kill("SIGTERM"); await fx.close(); await sleep(300); rmSync(scratch,{recursive:true,force:true}); if(own) rmSync(chromeTmp,{recursive:true,force:true});
