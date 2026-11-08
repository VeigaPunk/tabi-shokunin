import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SCRATCH='/fast/scratch/hyaku/tabi-r91/R91Review2';
const base=JSON.parse(fs.readFileSync(path.join(LANE,'corpus/evidence/round91/chromium-showpicker-proxy/receipt.json'),'utf8'));
const clone=()=>JSON.parse(JSON.stringify(base));
const leg=(r,n)=>r.legs.find(l=>l.name===n);
const CO='http://127.0.0.1:'+base.ports.child, PO='http://127.0.0.1:'+base.ports.http;
const muts=[
 ['M24 same-frame copy: proxy/proxyLog/replies copied verbatim from sp91-xo-proxy-file-answer into sp91-xo-proxy-file-childact (zero adjustment)',
  r=>{const s=leg(r,'sp91-xo-proxy-file-answer'),d=leg(r,'sp91-xo-proxy-file-childact');
      d.proxy=JSON.parse(JSON.stringify(s.proxy));d.proxyLog=JSON.parse(JSON.stringify(s.proxyLog));d.replies=JSON.parse(JSON.stringify(s.replies));}],
 ['M25 proxyLog[0].at set to 0 (before the leg action) — log ordering is unbound',
  r=>{leg(r,'sp91-xo-proxy-file-childact').proxyLog[0].at=0;}],
 ['M26 proxy.origin set to the child origin (message the child should have rejected)',
  r=>{leg(r,'sp91-xo-proxy-file-childact').proxy.origin=CO;
      const l=leg(r,'sp91-xo-proxy-file-childact'); l.replies[0].data.result=JSON.parse(JSON.stringify(l.proxy));}],
];
const pins=['--lane',LANE,'--expect-driver-sha256',base.driverSha256,'--expect-nonce',base.nonce,'--expect-parent-sha256',base.fixture.parent.sha256,'--expect-same-sha256',base.fixture.same.sha256,'--expect-child-sha256',base.fixture.child.sha256,'--prior-set','.ufo/waves/round-91/controls/c1/prior-set.txt','--json'];
for(const [n,fn] of muts){const r=clone();fn(r);const f=path.join(SCRATCH,n.slice(0,3)+'.json');fs.writeFileSync(f,JSON.stringify(r));
 const p=spawnSync(process.execPath,[path.join(LANE,'scripts/check-showpicker-proxy-round91.mjs'),'--receipt',f,...pins],{encoding:'utf8',cwd:LANE,timeout:120000});
 let j=null;try{j=JSON.parse(p.stdout);}catch{}
 console.log(n.slice(0,3),'exit='+p.status,j&&j.verdict,JSON.stringify(j&&j.findings&&j.findings.map(x=>x.id)));}
