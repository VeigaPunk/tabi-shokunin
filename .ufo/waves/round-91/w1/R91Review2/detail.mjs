import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin', SCRATCH='/fast/scratch/hyaku/tabi-r91/R91Review2';
const base=JSON.parse(fs.readFileSync(path.join(LANE,'corpus/evidence/round91/chromium-showpicker-proxy/receipt.json'),'utf8'));
const pins=['--lane',LANE,'--expect-driver-sha256',base.driverSha256,'--expect-nonce',base.nonce,'--expect-parent-sha256',base.fixture.parent.sha256,'--expect-same-sha256',base.fixture.same.sha256,'--expect-child-sha256',base.fixture.child.sha256,'--prior-set','.ufo/waves/round-91/controls/c1/prior-set.txt','--json'];
for(const id of ['M03','M04','M06','M09','M10','M11','M15','M16','M19','M23','M26']){
  const f=path.join(SCRATCH,id+'.json');
  const p=spawnSync(process.execPath,[path.join(LANE,'scripts/check-showpicker-proxy-round91.mjs'),'--receipt',f,...pins],{encoding:'utf8',cwd:LANE,timeout:120000});
  let j=null;try{j=JSON.parse(p.stdout);}catch{}
  console.log('== '+id+' exit='+p.status);
  for(const x of (j&&j.findings)||[]) console.log('   '+x.id+': '+x.detail.slice(0,240));
}
