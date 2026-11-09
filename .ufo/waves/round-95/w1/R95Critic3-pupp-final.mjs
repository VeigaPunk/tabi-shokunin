// Final: raw CDP (as a correct client would route) on ports 32041-32043, q=286, pad=300.
// Click on page session, capture Page.fileChooserOpened on iframe session, answer on IFRAME session,
// verify child #s gets file and parent #p* stay empty. Also snapshot page describe of B for contrast.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { spawn } from 'node:child_process';
const SCRATCH='/fast/scratch/hyaku/tabi-r95/R95Critic3';
const HTTP=32041, CHILD=32042, CDP=32043, Q=286, PAD=300;
let childProc=null,s1,s2;
const result={ports:{http:HTTP,child:CHILD,cdp:CDP},q:Q,pad:PAD,error:null};
const log=(...a)=>console.log(...a);
const childHtml=(pad)=>`<!doctype html><html><head><meta charset="utf-8"><title>child</title><style>html,body{margin:0}#s{position:absolute;left:30px;top:40px;width:160px;height:50px}#p{position:absolute;left:0;top:120px;width:480px;font:4px/4px monospace}</style></head><body><div id="p">${'<span>x</span>'.repeat(pad)}</div><input type="file" id="s"><script>window.__files=()=>JSON.stringify(Array.from(document.getElementById('s').files,f=>[f.name,f.size]));window.__ready=()=>document.readyState==='complete';window.__rect=()=>{const r=document.getElementById('s').getBoundingClientRect();return JSON.stringify({left:r.left,top:r.top,width:r.width,height:r.height})};</script></body></html>`;
const parentHtml=(u,q)=>`<!doctype html><html><head><meta charset="utf-8"><title>parent</title><style>html,body{margin:0}#c{position:absolute;left:120px;top:90px;width:500px;height:300px}#q{position:absolute;left:0;top:420px;width:480px;font:4px/4px monospace}#pk{position:absolute;left:700px;top:40px}#pk input{display:block;width:180px;height:20px}</style></head><body><div id="q">${'<span>x</span>'.repeat(q)}</div><div id="pk">${[0,1,2,3,4,5].map(i=>`<input type="file" id="p${i}">`).join('')}</div><iframe id="c" src="${u}"></iframe><script>window.__ready=()=>document.readyState==='complete';window.__fr=()=>{const r=document.getElementById('c').getBoundingClientRect();return JSON.stringify({left:r.left,top:r.top})};window.__pfiles=()=>JSON.stringify(Array.from(document.querySelectorAll('#pk input'),el=>[el.id,Array.from(el.files,f=>[f.name,f.size])]));</script></body></html>`;
try{
  fs.mkdirSync(path.join(SCRATCH,'final-leg','profile'),{recursive:true});
  const answerPath=path.join(SCRATCH,'tabi-r95-answer.txt');
  fs.writeFileSync(answerPath,'tabi round 95 answer.\n');
  const childUrl=`http://localhost:${CHILD}/child.html?leg=critic3&pad=${PAD}`;
  const parentUrl=`http://127.0.0.1:${HTTP}/parent.html?leg=critic3&q=${Q}`;
  s1=http.createServer((q,r)=>{r.setHeader('content-type','text/html');r.end(parentHtml(childUrl,Number(new URL(q.url,'http://x').searchParams.get('q')||0)));});
  s2=http.createServer((q,r)=>{r.setHeader('content-type','text/html');r.end(childHtml(Number(new URL(q.url,'http://x').searchParams.get('pad')||0)));});
  await new Promise(res=>s1.listen(HTTP,'127.0.0.1',res));
  await new Promise(res=>s2.listen(CHILD,'127.0.0.1',res));
  childProc=spawn('/usr/bin/chromium',['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+path.join(SCRATCH,'final-leg','profile'),'--no-first-run','--no-default-browser-check','--window-size=1280,900','about:blank'],{stdio:'ignore',detached:true});
  let ver=null;for(let i=0;i<40&&!ver;i++){try{ver=await(await fetch('http://127.0.0.1:'+CDP+'/json/version')).json();}catch{await new Promise(r=>setTimeout(r,150));}}
  result.browserVersion=ver.Browser; log('browser',ver.Browser);
  const ws=new WebSocket(ver.webSocketDebuggerUrl); await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
  let id=0;const pend=new Map();const events=[];
  ws.onmessage=(m)=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);}else if(d.method)events.push(d);};
  const send=(method,params={},sid)=>new Promise(res=>{const i=++id;pend.set(i,res);ws.send(JSON.stringify(sid?{id:i,method,params,sessionId:sid}:{id:i,method,params}));});
  const must=async(m,p,s)=>{const r=await send(m,p,s);if(r.error)throw new Error(m+JSON.stringify(r.error));return r.result;};
  const t=await must('Target.createTarget',{url:'about:blank'});
  const ps=(await must('Target.attachToTarget',{targetId:t.targetId,flatten:true})).sessionId;
  await must('Page.enable',{},ps);await must('Runtime.enable',{},ps);
  await must('Page.setInterceptFileChooserDialog',{enabled:true},ps);
  await must('Target.setAutoAttach',{autoAttach:true,waitForDebuggerOnStart:false,flatten:true},ps);
  await must('Page.navigate',{url:parentUrl},ps);
  await new Promise(r=>setTimeout(r,2500));
  let ifrSid=null;
  for(const e of events.filter(x=>x.method==='Target.attachedToTarget'&&x.sessionId===ps)){
    if(e.params.targetInfo.type==='iframe'){ifrSid=e.params.sessionId;await must('Page.enable',{},ifrSid);await must('Page.setInterceptFileChooserDialog',{enabled:true},ifrSid);}
  }
  result.pageSession=ps; result.iframeSession=ifrSid; log('page',ps,'iframe',ifrSid);
  result.frameTree=(await must('Page.getFrameTree',{},ps)).frameTree.frame.id;
  const fr=JSON.parse((await must('Runtime.evaluate',{expression:'__fr()',returnByValue:true},ps)).result.value);
  const childVal=(ex)=>send('Runtime.evaluate',{expression:ex,returnByValue:true},ifrSid);
  const cr=JSON.parse((await childVal('__rect()')).result.result.value);
  const x=fr.left+cr.left+cr.width/2, y=fr.top+cr.top+cr.height/2;
  const mark=events.length;
  await must('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1},ps);
  await must('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1},ps);
  await new Promise(r=>setTimeout(r,2000));
  const choosers=events.slice(mark).filter(e=>e.method==='Page.fileChooserOpened');
  result.choosers=choosers.map(c=>({session:c.sessionId,page:c.sessionId===ps,iframe:c.sessionId===ifrSid,frameId:c.params.frameId,backendNodeId:c.params.backendNodeId}));
  log('choosers',JSON.stringify(result.choosers));
  const B=choosers[0].params.backendNodeId; result.B=B;
  const dp=await send('DOM.describeNode',{backendNodeId:B},ps);
  result.describeOnPage={error:dp.error?dp.error.message:null,nodeName:dp.result?dp.result.node.nodeName:null,attrs:dp.result?dp.result.node.attributes:null};
  const dc=await send('DOM.describeNode',{backendNodeId:B},ifrSid);
  result.describeOnIframe={error:dc.error?dc.error.message:null,nodeName:dc.result?dc.result.node.nodeName:null,attrs:dc.result?dc.result.node.attributes:null};
  log('describe page',JSON.stringify(result.describeOnPage));
  log('describe iframe',JSON.stringify(result.describeOnIframe));
  const ans=await send('DOM.setFileInputFiles',{files:[answerPath],backendNodeId:B},ifrSid);
  result.answerOnIframe={error:ans.error?ans.error.message:null}; log('answer iframe',JSON.stringify(result.answerOnIframe));
  await new Promise(r=>setTimeout(r,500));
  result.parentFilesAfterIfrAnswer=await (await must('Runtime.evaluate',{expression:'__pfiles()',returnByValue:true},ps)).result.value;
  result.childFilesAfterIfrAnswer=(await childVal('__files()')).result.result.value;
  log('parentFiles',result.parentFilesAfterIfrAnswer); log('childFiles',result.childFilesAfterIfrAnswer);
}catch(e){result.error=String(e&&e.message||e);log('ERROR',result.error);}
finally{
  try{if(childProc)process.kill(-childProc.pid,'SIGKILL');}catch{}
  try{s1&&s1.close();}catch{} try{s2&&s2.close();}catch{}
  fs.writeFileSync(path.join(SCRATCH,'final-result.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2)); process.exit(0);
}
