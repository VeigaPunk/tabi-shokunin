// Probe: can the fixture listener mis-record isTrusted? Record with a second independent listener + event provenance.
import http from 'node:http';
import { spawn } from 'node:child_process';
const PORTS={http:32741,child:32742,cdp:32743};
const child=`<!doctype html><html><body><input type="file" id="s"><script>
window.__a=[]; window.__b=[];
for(const t of ['input','change','click']) document.getElementById('s').addEventListener(t,function(e){window.__a.push([e.type,e.isTrusted]);});
for(const t of ['input','change','click']) document.getElementById('s').addEventListener(t,function(e){window.__b.push([e.type,e.isTrusted,e instanceof Event, typeof e.isTrusted]);});
window.__flags={isTrustedDesc:Object.getOwnPropertyDescriptor(Event.prototype,'isTrusted')?.get?.toString().slice(0,80)};
</script></body></html>`;
const parent=(u)=>`<!doctype html><html><body><input type="file" id="pp"><iframe id="c" src="${u}"></iframe></body></html>`;
let cur=null;
const serve=(p,h)=>new Promise(r=>{const s=http.createServer(h);s.listen(p,'127.0.0.1',()=>r(s));});
const s1=await serve(PORTS.http,(q,r)=>{if(new URL(q.url,'http://x').pathname==='/parent.html'){r.setHeader('content-type','text/html');r.end(parent(cur));}else{r.statusCode=404;r.end();}});
const s2=await serve(PORTS.child,(q,r)=>{if(new URL(q.url,'http://x').pathname==='/child.html'){r.setHeader('content-type','text/html');r.end(child);}else{r.statusCode=404;r.end();}});
// deps: use fleet deps dir if present, else /fast/scratch/hyaku/tabi-r97/deps
import { createRequire } from 'node:module';
import path from 'node:path';
const deps = process.env.DEPS;
if(!deps){console.error(JSON.stringify({error:'DEPS env required'}));process.exit(2);}
const req=createRequire(path.join(deps,'package.json'));
let puppeteer, pw;
try{ puppeteer=req('puppeteer-core'); pw=req('playwright-core').chromium; }catch(e){console.error(JSON.stringify({error:e.message}));process.exit(2);}
import fs from 'node:fs';
const ans='/fast/scratch/hyaku/tabi-r97/R97Critic3/probe-answer.txt'; fs.writeFileSync(ans,'tabi round 97 answer.\n');
async function leg(lib,isLocal){
  const id=`http://localhost:${PORTS.child}/child.html?x=1`;
  cur=`http://127.0.0.1:${PORTS.child}/child.html?x=1`;
  // NB: parent served on 127.0.0.1, child URL for frame lookup uses whatever cookie; use localhost child to be cross-site
  cur=`http://localhost:${PORTS.child}/child.html?x=1`;
  const prof=`/fast/scratch/hyaku/tabi-r97/R97Critic3/prof-${lib}-${isLocal?'local':'def'}`;
  fs.mkdirSync(prof,{recursive:true});
  const proc=spawn('/usr/bin/chromium',['--headless=new',`--remote-debugging-port=${PORTS.cdp}`,`--user-data-dir=${prof}`,'--no-first-run','--no-default-browser-check','about:blank'],{stdio:'ignore',detached:true});
  try{
    let ver=null; for(let i=0;i<100&&!ver;i++){try{ver=await(await fetch(`http://127.0.0.1:${PORTS.cdp}/json/version`)).json();}catch{await new Promise(r=>setTimeout(r,150));}}
    if(!ver) throw new Error('no devtools');
    let client, page, frame;
    if(lib==='puppeteer'){ client=await puppeteer.connect({browserURL:`http://127.0.0.1:${PORTS.cdp}`}); page=await client.newPage(); await page.goto(`http://127.0.0.1:${PORTS.http}/parent.html`,{waitUntil:'load'}); await new Promise(r=>setTimeout(r,800)); frame=page.frames().find(f=>f.url()===cur); const h=await frame.$('#s'); await h.uploadFile(ans); await new Promise(r=>setTimeout(r,400));
      const a=await frame.evaluate(()=>window.__a); const b=await frame.evaluate(()=>window.__b); const files=await frame.evaluate(()=>Array.from(document.getElementById('s').files,f=>[f.name,f.size])); return {lib,isLocal,files,a,b,agree:JSON.stringify(a)===JSON.stringify(b.map(x=>[x[0],x[1]]))};
    } else { client=isLocal?await pw.connectOverCDP(`http://127.0.0.1:${PORTS.cdp}`,{isLocal:true}):await pw.connectOverCDP(`http://127.0.0.1:${PORTS.cdp}`); page=await client.contexts()[0].newPage(); await page.goto(`http://127.0.0.1:${PORTS.http}/parent.html`,{waitUntil:'load'}); await new Promise(r=>setTimeout(r,800)); frame=page.frames().find(f=>f.url()===cur); await frame.locator('#s').setInputFiles(ans,{timeout:5000}); await new Promise(r=>setTimeout(r,400));
      const a=await frame.evaluate(()=>window.__a); const b=await frame.evaluate(()=>window.__b); const files=await frame.evaluate(()=>Array.from(document.getElementById('s').files,f=>[f.name,f.size])); return {lib,isLocal,files,a,b,agree:JSON.stringify(a)===JSON.stringify(b.map(x=>[x[0],x[1]]))};
    }
  } finally { try{process.kill(-proc.pid,'SIGKILL');}catch{} await new Promise(r=>setTimeout(r,500)); }
}
console.log(JSON.stringify(await leg('puppeteer',null)));
console.log(JSON.stringify(await leg('playwright',false)));
console.log(JSON.stringify(await leg('playwright',true)));
console.log(JSON.stringify(await leg('puppeteer',null),' '));
for(const s of [s1,s2]) s.close();
process.exit(0);
