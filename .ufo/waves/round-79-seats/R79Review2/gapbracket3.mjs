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
const clone=v=>JSON.parse(JSON.stringify(v));
const base=JSON.parse(fs.readFileSync('battery/cases/replay-gap-only-refuse.json','utf8'));
const legOf=(r,n)=>r.legs.find(l=>l.name===n);
const lower=legOf(base,'sp-click-then-show').pageEvents[4]; // 33.8 click
const upper=legOf(base,'sp-cancel-armed').pageEvents[5];   // 167.8 cancel
// P: shift the whole suffix (at >= upper.at) earlier by (134-50)=84 so the ONLY >=50 gap is 50.0
const P=clone(base);
for (const l of P.legs) for (const e of l.pageEvents) if (e.at>=upper.at) e.at=Math.round((e.at-84)*10)/10;
// fresh tokens for P
for (const l of P.legs) {
  const tok=crypto.randomBytes(6).toString('hex'); l.launchToken=tok;
  const i=l.argv.findIndex(a=>a.startsWith('--user-data-dir='));
  l.argv[i]='--user-data-dir='+path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)),'profile-'+tok);
  const bid=crypto.randomUUID(); l.devtoolsListening={url:'ws://127.0.0.1:'+P.ports.cdp+'/devtools/browser/'+bid,port:P.ports.cdp,browserId:bid};
  l.stderrHead='DevTools listening on '+l.devtoolsListening.url;
}
const fresh=(r)=>{for(const l of r.legs){const tok=crypto.randomBytes(6).toString('hex');l.launchToken=tok;const i=l.argv.findIndex(a=>a.startsWith('--user-data-dir='));l.argv[i]='--user-data-dir='+path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)),'profile-'+tok);const bid=crypto.randomUUID();l.devtoolsListening={url:'ws://127.0.0.1:'+r.ports.cdp+'/devtools/browser/'+bid,port:r.ports.cdp,browserId:bid};l.stderrHead='DevTools listening on '+l.devtoolsListening.url;}return r;};
const R50=fresh(clone(P));
for (const l of R50.legs) for (const e of l.pageEvents) e.at=Math.round((e.at+1)*10)/10;
const R499=clone(R50);
const clickR=legOf(R499,'sp-click-then-show').pageEvents[4].at;
legOf(R499,'sp-cancel-armed').pageEvents[5].at=Math.round((clickR+49.9)*10)/10;
const dir=path.join('/fast/scratch/hyaku/tabi-r79/R79Review2','gapbracket3');fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'P.json'),JSON.stringify(P,null,1));
fs.writeFileSync(path.join(dir,'R50.json'),JSON.stringify(R50,null,1));
fs.writeFileSync(path.join(dir,'R499.json'),JSON.stringify(R499,null,1));
const gaps=(r)=>{const at=r.legs.flatMap(l=>l.pageEvents.map(e=>e.at)).sort((a,b)=>a-b);const g=[];for(let i=1;i<at.length;i++)if(at[i]-at[i-1]>=50)g.push(at[i]-at[i-1]);return g;};
console.log('P gaps',JSON.stringify(gaps(P)),'R50 gaps',JSON.stringify(gaps(R50)),'R499 gaps',JSON.stringify(gaps(R499)));
const run=(counter,receipt)=>{
  const args=[counter,'--lane',LANE,'--receipt',receipt,'--expect-driver-sha256',PIN,'--expect-nonce',NONCE,'--expect-fixture-sha256',FIX,'--prior-set',PRIOR,'--tree-exempt-sha256',realSha,'--prior',path.join(dir,'P.json'),'--json'];
  const r=spawnSync(process.execPath,args,{encoding:'utf8',timeout:120000});
  let j=null;try{j=JSON.parse(r.stdout);}catch{}
  return {status:r.status,verdict:j&&j.verdict,ids:j&&j.findings&&j.findings.map(f=>f.id),last:j&&j.limit&&j.limit.perPrior[j.limit.perPrior.length-1]};
};
for (const n of ['R50','R499']) console.log(n, JSON.stringify(run(COUNTER,path.join(dir,n+'.json'))));
const src=fs.readFileSync(COUNTER,'utf8');
const from='const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;';
const mut=path.join(dir,'check-gapmin51.mjs');
fs.writeFileSync(mut,src.replace(from,'const TOL = 0.05, GAP_MIN = 51, FRAC = 0.5, GAP_FRAC = 0.75;'));
console.log('R50 under GAP_MIN=51', JSON.stringify(run(mut,path.join(dir,'R50.json'))));
