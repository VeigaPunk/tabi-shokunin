#!/usr/bin/env node
// Re-derives whether the committed round-40 live measurement receipt and wrapper summary agree.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const REV=process.argv[2];
if(!/^[0-9a-f]{40}$/.test(REV||'')){console.error('usage: node scripts/count-c1-round40-binding.mjs <40-hex-revision>');process.exit(64)}
const REPO='/home/vgpnk/Projects/shokunin/tabi-shokunin';
function blob(p){try{return execFileSync('git',['-C',REPO,'show',`${REV}:${p}`],{encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']})}catch{return null}}
const mp='corpus/evidence/round40/playwright-egress/measure.json',rp='corpus/evidence/round40/playwright-egress/receipt.json';
const mt=blob(mp),rt=blob(rp),ct=blob('.ufo/waves/round-40/claims.json');
let c1_live_runs=0,reason='measurement-artifact-absent';
if(mt&&rt&&ct){
 try{
  const m=JSON.parse(mt),r=JSON.parse(rt),claims=JSON.parse(ct),c=claims.claims?.[0],pins=claims.frozenDigests||{};
  const outNonce=m.driverStdout?.match(/"runNonce":"([0-9a-f]{64})"/)?.[1];
  const receiptSha=createHash('sha256').update(rt).digest('hex');
  const driverSha=createHash('sha256').update(blob('scripts/playwright-firefox-egress-round39.mjs')||'').digest('hex');
  const wrapperSha=createHash('sha256').update(blob('scripts/measure-c1-round40.mjs')||'').digest('hex');
  const counterPath='.ufo/waves/round-40/counters/c1-sample-span-v3.mjs';
  const counterSha=createHash('sha256').update(blob(counterPath)||'').digest('hex');
  const toolsBound=driverSha===pins['scripts/playwright-firefox-egress-round39.mjs']&&wrapperSha===pins['scripts/measure-c1-round40.mjs']&&counterSha===pins[counterPath]&&m.driverSha256===driverSha;
  const exact=toolsBound&&m.schema==='tabi-r40-c1-measure'&&m.driverExit===0&&m.counterExit===0&&m.nonceMatches===true&&m.counter?.predicate===true&&m.counter?.findings?.length===0&&m.counter?.nonceMatched===true&&m.counter?.receiptSha256===receiptSha&&m.counter?.predicateSentence===c?.predicate&&!!outNonce&&r.schema==='tabi-pw-firefox-egress-receipt-r40'&&r.runNonce===outNonce&&Array.isArray(r.runs)&&r.runs.length===2&&r.runs.every(x=>x.runNonce===outNonce);
  if(exact){c1_live_runs=1;reason='live-command-receipt-wrapper-counter-and-frozen-driver-bind'}else reason='measurement-receipt-binding-failed';
 }catch{reason='measurement-json-invalid'}
}
console.log(JSON.stringify({codeRevision:REV,c1_live_runs,reason}));
process.exit(0);
