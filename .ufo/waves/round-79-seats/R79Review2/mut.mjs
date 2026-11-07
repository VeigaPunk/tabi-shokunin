import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SRC=path.join(LANE,'scripts/check-showpicker-r79.mjs');
const BAT=path.join(LANE,'scripts/negatives-showpicker-r79.mjs');
const REAL=path.join(LANE,'corpus/evidence/round79/chromium-showpicker/receipt.json');
const PRIOR=path.join(LANE,'.ufo/waves/round-79/controls/c1/prior-set.txt');
const PIN='e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933';
const NONCE='tabi-r79-l1-80830674d421';
const FIX='2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8';
const src=fs.readFileSync(SRC,'utf8');
const MUTS=[
 ['FRAC-0.9','const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;','const TOL = 0.05, GAP_MIN = 50, FRAC = 0.9, GAP_FRAC = 0.75;'],
 ['FRAC-0.4','const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;','const TOL = 0.05, GAP_MIN = 50, FRAC = 0.4, GAP_FRAC = 0.75;'],
 ['GAP_FRAC-0.9','const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;','const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.9;'],
 ['GAP_MIN-51','const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;','const TOL = 0.05, GAP_MIN = 51, FRAC = 0.5, GAP_FRAC = 0.75;'],
 ['GAP_MIN-149','const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;','const TOL = 0.05, GAP_MIN = 149, FRAC = 0.5, GAP_FRAC = 0.75;'],
 ['TOL-0.5','const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;','const TOL = 0.5, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;'],
 ['TOL-0.001','const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;','const TOL = 0.001, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;'],
];
const out=[];
for (const [name,from,to] of MUTS) {
  const n=src.split(from).length-1;
  const dir=path.join('/fast/scratch/hyaku/tabi-r79/R79Review2','mut',name);
  fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  if (n!==1) { out.push({name,occurrences:n,outcome:'unapplied'}); continue; }
  fs.writeFileSync(path.join(dir,'check-showpicker-r79.mjs'),src.replace(from,to));
  fs.copyFileSync(BAT,path.join(dir,'negatives-showpicker-r79.mjs'));
  const r=spawnSync(process.execPath,[path.join(dir,'negatives-showpicker-r79.mjs'),'--lane',LANE,'--real',REAL,'--expect-driver-sha256',PIN,'--expect-nonce',NONCE,'--expect-fixture-sha256',FIX,'--prior-set',PRIOR,'--work',path.join(dir,'work'),'--json'],{encoding:'utf8',timeout:600000});
  let j=null;try{j=JSON.parse(r.stdout);}catch{}
  out.push({name,status:r.status,cases:j&&j.cases,passed:j&&j.passed,failed:j&&j.failed,coverage:j&&j.coverage,failures:j&&j.failures&&j.failures.map(f=>f.case),head:r.stdout.slice(0,200)});
  fs.rmSync(dir,{recursive:true,force:true});
}
fs.writeFileSync('mut.json',JSON.stringify(out,null,1));
for(const x of out)console.log(JSON.stringify(x));
