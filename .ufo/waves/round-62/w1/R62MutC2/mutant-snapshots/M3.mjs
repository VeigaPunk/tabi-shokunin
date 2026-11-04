#!/usr/bin/env node
// Frozen r62 counter. Scope: two secondary-button cycles on Chromium/Linux,
// page-side shared sequence, right-button contextmenu-at-press, and closure.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
export function verify(r, external = {}) {
  const findings = [];
  const check = (ok, id) => { if (!ok) findings.push(id); };
  check(r?.schema === 'tabi-chrome-cdp-r62', 'schema');
  check(/^tabi-r62-[a-z0-9-]+$/.test(r?.nonce || '') && r.nonceOnPage === r.nonce, 'nonce-binding');
  check(r?.driverSha256 === external.driverSha256 && /^[a-f0-9]{64}$/.test(r?.driverSha256 || ''), 'driver-binding');
  check(r?.fixture?.origin?.match(/^http:\/\/127\.0\.0\.1:[0-9]+$/), 'loopback-origin');
  check(r?.fixture?.sha256 === external.fixtureSha256, 'fixture-binding');
  check(r?.host?.argv?.includes('--disable-extensions') && r.host.argv.includes('--headless=new') && r.host.argv.includes('--remote-debugging-address=127.0.0.1'), 'launch-guards');
  const b = Array.isArray(r?.btnlog) ? r.btnlog : [];
  const m = Array.isArray(r?.mouselog) ? r.mouselog : [];
  check(JSON.stringify(b.map(e => e.type)) === JSON.stringify(['pointermove','pointerdown','pointerup','pointerdown','pointerup']), 'pointer-types');
  check(JSON.stringify(m.map(e => e.type)) === JSON.stringify(['mousedown','contextmenu','mouseup','mousedown','contextmenu','mouseup']), 'mouse-types');
  check(b.length === 5 && b.every(e => e.pointerType === 'mouse' && Number.isInteger(e.pointerId) && e.pointerId > 0 && e.pointerId === b[0].pointerId), 'pointer-identity');
  check([...b,...m].length === 11 && [...b,...m].every(e => e.isTrusted === true && Number.isFinite(e.ts) && e.ts >= 0), 'trusted-fields');
  const ordered = [...b,...m].sort((a,c) => a.seq-c.seq);
  check(ordered.length === 11 && ordered.every((e,i) => e.seq === i+1), 'shared-sequence');
  check(b[0]?.button === -1 && b[0]?.buttons === 0, 'move-buttons');
  for (let i=0;i<2;i++) {
    const d=b[1+i*2], u=b[2+i*2], md=m[i*3], menu=m[i*3+1], mu=m[i*3+2];
    const target=i===0?'target':'target2';
    check(d?.button===2 && d?.buttons===2 && u?.button===2 && u?.buttons===0, 'pointer-buttons-'+i);
    check(md?.button===2 && md?.buttons===2 && menu?.button===2 && menu?.buttons===2 && mu?.button===2 && mu?.buttons===0, 'mouse-buttons-'+i);
    check([d,u,md,menu,mu].every(e => e?.targetId===target), 'target-binding-'+i);
    check(d?.seq<md?.seq && md?.seq<menu?.seq && menu?.seq<u?.seq && u?.seq<mu?.seq, 'cycle-order-'+i);
    check(d?.ts<=md?.ts && md?.ts<=menu?.ts && menu?.ts<=u?.ts && u?.ts<=mu?.ts, 'cycle-time-'+i);
  }
  check(Array.isArray(r?.clicklog) && r.clicklog.length===0, 'no-click');
  check(r?.teardown?.postKillSweepCount===0 && Array.isArray(r.teardown.survivors) && r.teardown.survivors.length===0, 'survivors');
  check(r?.teardown?.portProbes?.fixture==='closed' && r.teardown.portProbes.devtools==='closed' && r.teardown.postKillCurl?.fixture===7 && r.teardown.postKillCurl.devtools===7, 'closed-ports');
  check(r?.sweeps?.preLaunch===0 && r.sweeps.midRun>0 && r.sweeps.postKill===0, 'launch-witness');
  check(Array.isArray(r?.failures) && r.failures.length===0, 'failures');
  const names=['a-right-press','b-contextmenu','c-second-press'];
  check(Array.isArray(r?.steps) && r.steps.length===3 && r.steps.every((e,i)=>e.name===names[i] && e.png===names[i]+'.png' && /^[a-f0-9]{64}$/.test(e.sha256) && e.bytes>0), 'shot-records');
  check(external.shotsValid===true, 'shot-bytes');
  check(r?.predicate===true && r.buttonHypothesis==='CONFIRMED', 'producer-verdict');
  check(Array.isArray(r?.serverLog) && r.serverLog.some(e=>e.path==='/button') && r.serverLog.every(e=>['/button','/favicon.ico'].includes(e.path)), 'server-witness');
  return {schema:'tabi-r62-secondary-counter',predicate:findings.length===0,findingCount:findings.length,findings};
}
function synthetic() {
  const b=[['pointermove',1,-1,0,'target'],['pointerdown',2,2,2,'target'],['pointerup',5,2,0,'target'],['pointerdown',7,2,2,'target2'],['pointerup',10,2,0,'target2']].map(([type,seq,button,buttons,targetId])=>({type,seq,button,buttons,targetId,ts:seq,pointerId:1,pointerType:'mouse',isTrusted:true}));
  const m=[['mousedown',3,2,'target'],['contextmenu',4,2,'target'],['mouseup',6,0,'target'],['mousedown',8,2,'target2'],['contextmenu',9,2,'target2'],['mouseup',11,0,'target2']].map(([type,seq,buttons,targetId])=>({type,seq,button:2,buttons,targetId,ts:seq,isTrusted:true,defaultPrevented:type==='contextmenu'}));
  return {schema:'tabi-chrome-cdp-r62',nonce:'tabi-r62-test',nonceOnPage:'tabi-r62-test',driverSha256:'a'.repeat(64),fixture:{origin:'http://127.0.0.1:19471',sha256:'b'.repeat(64)},host:{argv:['--disable-extensions','--headless=new','--remote-debugging-address=127.0.0.1']},btnlog:b,mouselog:m,clicklog:[],teardown:{postKillSweepCount:0,survivors:[],portProbes:{fixture:'closed',devtools:'closed'},postKillCurl:{fixture:7,devtools:7}},sweeps:{preLaunch:0,midRun:1,postKill:0},failures:[],steps:['a-right-press','b-contextmenu','c-second-press'].map(name=>({name,png:name+'.png',sha256:'c'.repeat(64),bytes:10})),predicate:true,buttonHypothesis:'CONFIRMED',serverLog:[{path:'/button'}]};
}
const ext={driverSha256:'a'.repeat(64),fixtureSha256:'b'.repeat(64),shotsValid:true};
export const forgeries = {
  f1:r=>{r.btnlog[1].button=0;},
  f2:r=>{r.btnlog.splice(2,1);},
  f3:r=>{r.mouselog[1].isTrusted=false;},
  f4:r=>{r.mouselog.splice(1,1);},
  f5:r=>{r.btnlog[3].buttons=1;},
  f6:r=>{r.btnlog[3].pointerId=2;},
  f7:r=>{r.mouselog[4].defaultPrevented=false;},
  f8:r=>{r.teardown.survivors=[99999];},
};
function selftest() {
  const results=[{name:'valid',ok:verify(synthetic(),ext).predicate}];
  for(const [id,mutate] of Object.entries(forgeries)){const r=synthetic();mutate(r);results.push({name:id,ok:!verify(r,ext).predicate,findings:verify(r,ext).findings});}
  for(const [name,mutate] of Object.entries({nonce:r=>{r.nonceOnPage='wrong';},driver:r=>{r.driverSha256='d'.repeat(64);},sequence:r=>{r.mouselog[1].seq=30;},menuButtons:r=>{r.mouselog[1].buttons=0;},secondTarget:r=>{r.btnlog[3].targetId='target';},click:r=>{r.clicklog=[{}];},ports:r=>{r.teardown.postKillCurl.devtools=0;}})){const r=synthetic();mutate(r);results.push({name,ok:!verify(r,ext).predicate});}
  const allPass=results.every(e=>e.ok);console.log(JSON.stringify({schema:'tabi-r62-counter-selftest',allPass,cases:results.length,results},null,1));process.exitCode=allPass?0:1;
}
const main=process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href;
if(main){
  const args=process.argv.slice(2), option=n=>args[args.indexOf(n)+1];
  if(args[0]==='--selftest') selftest();
  else {
    try {
      if(!args[0] || !args.includes('--driver') || !args.includes('--expect-driver-sha256') || !args.includes('--shot')) throw new Error('usage: counter receipt --driver file --expect-driver-sha256 sha --shot dir --json');
      const r=JSON.parse(fs.readFileSync(args[0],'utf8'));
      const src=fs.readFileSync(option('--driver'),'utf8'), driverSha=sha(src);
      if(driverSha!==option('--expect-driver-sha256')) throw new Error('counter invocation driver pin mismatch');
      const match=/const BUTTON_HTML = `([\s\S]*?)`;\n\/\*FIXTURE-END\*\//.exec(src);
      if(!match)throw new Error('fixture template absent');
      const fixture=match[1].replace('${nonce}',r.nonce);
      let shotsValid=true;
      for(const s of r.steps||[]){
        if(!/^[a-z-]+\.png$/.test(s.png||'')){shotsValid=false;continue;}
        try {const bytes=fs.readFileSync(path.join(option('--shot'),s.png));shotsValid=shotsValid && sha(bytes)===s.sha256 && bytes.length===s.bytes && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && bytes.readUInt32BE(16)>0 && bytes.readUInt32BE(20)>0;}catch{shotsValid=false;}
      }
      const result=verify(r,{driverSha256:driverSha,fixtureSha256:sha(fixture),shotsValid});
      console.log(JSON.stringify(result,null,1));process.exitCode=result.predicate?0:1;
    }catch(e){console.error(JSON.stringify({schema:'tabi-r62-secondary-counter',error:e.message}));process.exitCode=2;}
  }
}
