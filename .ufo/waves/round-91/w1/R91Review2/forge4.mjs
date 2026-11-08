import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin', SCRATCH='/fast/scratch/hyaku/tabi-r91/R91Review2';
const base=JSON.parse(fs.readFileSync(path.join(LANE,'corpus/evidence/round91/chromium-showpicker-proxy/receipt.json'),'utf8'));
const clone=()=>JSON.parse(JSON.stringify(base)); const leg=(r,n)=>r.legs.find(l=>l.name===n);
const muts=[
 ['M27 child proxy read rerouted: contextId replaced by a fabricated id that appears in no context record',
  r=>{const l=leg(r,'sp91-xo-proxy-file-childact');
      const e=l.cdpSendLog.find(c=>c.params&&c.params.expression==='window.__proxy === null ? "null" : JSON.stringify(window.__proxy)');
      e.params.contextId=999999;}],
 ['M28 child proxy read rerouted into the PARENT context (where window.__proxy is undefined)',
  r=>{const l=leg(r,'sp91-xo-proxy-file-childact');
      const main=l.contexts.find(c=>c.frameId===l.frameTree.mainFrameId);
      const e=l.cdpSendLog.find(c=>c.params&&c.params.expression==='window.__proxy === null ? "null" : JSON.stringify(window.__proxy)');
      e.params.contextId=main.id;}],
];
const pins=['--lane',LANE,'--expect-driver-sha256',base.driverSha256,'--expect-nonce',base.nonce,'--expect-parent-sha256',base.fixture.parent.sha256,'--expect-same-sha256',base.fixture.same.sha256,'--expect-child-sha256',base.fixture.child.sha256,'--prior-set','.ufo/waves/round-91/controls/c1/prior-set.txt','--json'];
for(const [n,fn] of muts){const r=clone();fn(r);const f=path.join(SCRATCH,n.slice(0,3)+'.json');fs.writeFileSync(f,JSON.stringify(r));
 const p=spawnSync(process.execPath,[path.join(LANE,'scripts/check-showpicker-proxy-round91.mjs'),'--receipt',f,...pins],{encoding:'utf8',cwd:LANE,timeout:120000});
 let j=null;try{j=JSON.parse(p.stdout);}catch{}
 console.log(n.slice(0,3),'exit='+p.status,j&&j.verdict,JSON.stringify(j&&j.findings&&j.findings.map(x=>x.id)));}
