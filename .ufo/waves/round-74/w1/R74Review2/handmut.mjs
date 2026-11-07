import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const [lane, work, real, nonce, pin, ...want] = process.argv.slice(2);
const counter = fs.readFileSync(path.join(lane,'scripts/check-imecompose-r74.mjs'),'utf8');
const battery = fs.readFileSync(path.join(lane,'scripts/negatives-imecompose-r74.mjs'),'utf8');
const driver  = fs.readFileSync(path.join(lane,'scripts/chrome-cdp-imecompose-round74.mjs'));
const kp = fs.readFileSync(path.join(lane,'.ufo/waves/round-74/controls/c1/kill-power-r74.mjs'),'utf8');
const SEM = eval(kp.split('const SEMANTIC = ')[1].split('\n];')[0]+']');
const HOOK = 'const check = (id, ok, detail) => { checks[id] = !!ok;';
const C1 = path.join(lane,'.ufo/waves/round-74/controls/c1');
const n = path.basename(real).replace('.receipt.json','');
const priors = [];
for (let i=1;i<=9;i++) if (`smoke${i}`!==n) priors.push('--prior',path.join(C1,`smoke${i}.receipt.json`));
for (const k of ['dispatch-key','exec-command','script-events']) priors.push('--prior',path.join(C1,`degenerate-${k}.receipt.json`));
let src = null, name = null;
if (want[0].startsWith('M')) { const m = SEM.find((x)=>x.id===want[0]); if(!m){console.error('no mutant');process.exit(2);} src = counter.replace(m.from,m.to); name=m.id; }
else { // force-true:<id>
  const id = want[0].slice('force-true:'.length);
  if (!counter.includes(HOOK)) { console.error('hook missing'); process.exit(2); }
  src = counter.replace(HOOK, `const check = (id, ok, detail) => { if (id === ${JSON.stringify(id)}) ok = true; checks[id] = !!ok;`);
  name = 'force-true:'+id;
}
const d = path.join(work,'m-'+name.replace(/[^A-Za-z0-9_.:-]/g,'_')); fs.mkdirSync(path.join(d,'w'),{recursive:true});
fs.writeFileSync(path.join(d,'check-imecompose-r74.mjs'),src);
fs.writeFileSync(path.join(d,'negatives-imecompose-r74.mjs'),battery);
fs.writeFileSync(path.join(d,'chrome-cdp-imecompose-round74.mjs'),driver);
const p = spawnSync(process.execPath,[path.join(d,'negatives-imecompose-r74.mjs'),'--real',real,'--expect-driver-sha256',pin,'--expect-nonce',nonce,...priors,'--work',path.join(d,'w'),'--json'],{encoding:'utf8',timeout:600000});
let j=null; try{j=JSON.parse(p.stdout);}catch{}
if(!j){ console.log(JSON.stringify({mutant:name,exit:p.status,parse:false,stderr:(p.stderr||'').slice(-300)})); process.exit(0); }
const fails = j.results.filter((r)=>!r.ok);
console.log(JSON.stringify({mutant:name,exit:p.status,allOk:j.allOk,positiveOk:j.positiveOk,passed:j.passed,cases:j.cases,
  failed:fails.map((r)=>({case:r.case,expect:r.expect,class:r.class,exit:r.exit,findingIds:r.findingIds&&r.findingIds.slice(0,6),extra:r.extra,error:r.error}))},null,1));
