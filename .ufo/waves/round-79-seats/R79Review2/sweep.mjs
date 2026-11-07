import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER=path.join(LANE,'scripts/check-showpicker-r79.mjs');
const REAL=path.join(LANE,'corpus/evidence/round79/chromium-showpicker/receipt.json');
const PRIOR=path.join(LANE,'.ufo/waves/round-79/controls/c1/prior-set.txt');
const PIN='e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933';
const NONCE='tabi-r79-l1-80830674d421';
const FIX='2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8';
const realSha=crypto.createHash('sha256').update(fs.readFileSync(REAL)).digest('hex');
const real=JSON.parse(fs.readFileSync(REAL,'utf8'));
const priorPaths=fs.readFileSync(PRIOR,'utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')).map(p=>path.isAbsolute(p)?p:path.join(LANE,p));
const priors=priorPaths.map(p=>JSON.parse(fs.readFileSync(p,'utf8')));
const clone=v=>JSON.parse(JSON.stringify(v));
const arr=v=>Array.isArray(v)?v:[];
const rewriteNonce=(r,to)=>{const old=r.nonce;r.nonce=to;for(const l of arr(r.legs)){for(const s of arr(l.serverLog))if(s.run===old)s.run=to;for(const c of arr(l.cdpSendLog)){if(c.method==='Page.navigate')c.params.url=c.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));if(c.method==='Runtime.evaluate'&&typeof c.params.expression==='string')c.params.expression=c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to));}for(const e of arr(l.cdpEventLog))if(e.method==='Page.frameNavigated')e.params.url=e.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));}return r;};
function copyPrior(r){const prior=clone(priors[0]);for(const k of Object.keys(r))delete r[k];Object.assign(r,prior);rewriteNonce(r,NONCE);r.fixture.sha256=FIX;for(const l of arr(r.legs)){const tok=crypto.randomBytes(6).toString('hex');l.launchToken=tok;const i=l.argv.findIndex(a=>a.startsWith('--user-data-dir='));l.argv[i]='--user-data-dir='+path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)),'profile-'+tok);const bid=crypto.randomUUID();l.devtoolsListening={url:'ws://127.0.0.1:'+r.ports.cdp+'/devtools/browser/'+bid,port:r.ports.cdp,browserId:bid};l.stderrHead='DevTools listening on '+l.devtoolsListening.url;}return r;}
const gapUpper=(r)=>{const flat=arr(r.legs).flatMap(l=>arr(l.pageEvents).map((e,i)=>({l,i,at:e.at}))).sort((a,b)=>a.at-b.at);for(let i=1;i<flat.length;i++)if(flat[i].at-flat[i-1].at>=50)return flat[i];return null;};
const shiftEvent=(l,i,d)=>{l.pageEvents[i].at=Math.round((l.pageEvents[i].at+d)*10)/10;};
const dir=path.join('/fast/scratch/hyaku/tabi-r79/R79Review2','sweepcases');fs.mkdirSync(dir,{recursive:true});
const rows=[];
for(let k=0;k<=37;k++){
  const r=copyPrior(clone(real));
  const up=gapUpper(r);
  const order=arr(r.legs).flatMap(l=>arr(l.pageEvents).map((e,i)=>({l,i})).reverse());
  for(let j=0;j<k&&j<order.length;j++)shiftEvent(order[j].l,order[j].i,1);
  if(up)shiftEvent(up.l,up.i,1);
  const p=path.join(dir,'k'+k+'.json');fs.writeFileSync(p,JSON.stringify(r,null,1));
  const args=[COUNTER,'--lane',LANE,'--receipt',p,'--expect-driver-sha256',PIN,'--expect-nonce',NONCE,'--expect-fixture-sha256',FIX,'--prior-set',PRIOR,'--tree-exempt-sha256',realSha,'--json'];
  const out=spawnSync(process.execPath,args,{encoding:'utf8',timeout:120000});
  let j=null;try{j=JSON.parse(out.stdout);}catch{}
  const pp=j&&j.limit?j.limit.perPrior:[];
  const refused=!!(j&&arr(j.findings).some(f=>f.id==='replay-event-timeline'));
  const ids=j?arr(j.findings).map(f=>f.id):['unparsable'];
  const want0=pp[0]?((pp[0].absMatched>=pp[0].absNeed)||(pp[0].gapMatched>=pp[0].gapNeed)):null;
  const wantAny=pp.some(s=>(s.absMatched>=s.absNeed)||(s.gapMatched>=s.gapNeed));
  rows.push({k,abs0:pp[0]&&pp[0].absMatched,gap0:pp[0]&&pp[0].gapMatched,need0:pp[0]&&pp[0].absNeed,gn0:pp[0]&&pp[0].gapNeed,absAll:pp.map(s=>s.absMatched),gapAll:pp.map(s=>s.gapMatched),refused,want0,wantAny,ids});
}
fs.writeFileSync('sweep.json',JSON.stringify(rows,null,1));
for(const r of rows)console.log(JSON.stringify(r));
