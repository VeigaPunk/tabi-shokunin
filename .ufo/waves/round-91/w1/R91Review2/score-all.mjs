import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin', SCRATCH='/fast/scratch/hyaku/tabi-r91/R91Review2';
const base=JSON.parse(fs.readFileSync(path.join(LANE,'corpus/evidence/round91/chromium-showpicker-proxy/receipt.json'),'utf8'));
const pins=['--lane',LANE,'--expect-driver-sha256',base.driverSha256,'--expect-nonce',base.nonce,'--expect-parent-sha256',base.fixture.parent.sha256,'--expect-same-sha256',base.fixture.same.sha256,'--expect-child-sha256',base.fixture.child.sha256,'--prior-set','.ufo/waves/round-91/controls/c1/prior-set.txt','--json'];
const files=fs.readdirSync(SCRATCH).filter(f=>/^M\d\d\.json$/.test(f)).sort();
const rows=[];
for(const f of files){
  const p=spawnSync(process.execPath,[path.join(LANE,'scripts/check-showpicker-proxy-round91.mjs'),'--receipt',path.join(SCRATCH,f),...pins],{encoding:'utf8',cwd:LANE,timeout:120000});
  let j=null;try{j=JSON.parse(p.stdout);}catch{}
  rows.push({id:f.replace('.json',''),exit:p.status,verdict:j&&j.verdict,checkCount:j&&j.checkCount,findings:j&&j.findings?j.findings.map(x=>x.id):['<unparsed>']});
}
fs.writeFileSync(path.join(SCRATCH,'all-results.json'),JSON.stringify(rows,null,1));
const acc=rows.filter(r=>r.exit===0).map(r=>r.id), ref=rows.filter(r=>r.exit!==0).map(r=>r.id);
console.log('files',rows.length,'accepted',acc.length,acc.join(','),'refused',ref.length,ref.join(','));
