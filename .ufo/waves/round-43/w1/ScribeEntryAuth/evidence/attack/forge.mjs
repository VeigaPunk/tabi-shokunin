// Fully self-signed fabrication: own Ed25519 keys, no browser, no fetch.
// Goal: see whether counter v5 reaches predicate true when the FABRICATOR
// answers the fd3 challenge with their OWN private half.
import fs from 'node:fs';
import crypto from 'node:crypto';
const D='/fast/scratch/hyaku/tabi-r43/ScribeEntryAuth/forge';
fs.rmSync(D,{recursive:true,force:true}); fs.mkdirSync(D,{recursive:true});
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const canonical=(v)=>{if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';};
const sha=(b)=>crypto.createHash('sha256').update(b).digest('hex');
const fileSha=(p)=>sha(fs.readFileSync(p));
const wk=crypto.generateKeyPairSync('ed25519');
const wit=crypto.generateKeyPairSync('ed25519');
const nonce=sha(crypto.randomBytes(32));
const FF='/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox';
const NOW=Math.round(Number(fs.readFileSync('/proc/uptime','utf8').split(' ')[0])*100);
const nodePid=process.pid;
const shot=sha(Buffer.from('forged screenshot'));
const mkRun=(runIdx)=>{
  const runStartTicks=NOW-1000+runIdx*5000;
  const ffPid=90000+runIdx;
  const samples=[];
  for(let j=0;j<9;j++){
    const t=runStartTicks+200+j*250;
    samples.push({
      t,
      ss:{ticks:t-1, nonLoopback:0, ssObs:1, nonLoopbackRemotes:[]},
      proc:{ticks:t-1, nonLoopback:0, procObs:1, nonLoopbackRemotes:[]},
      treePids:[
        {pid:nodePid, ppid:1, startTicks:runStartTicks+1, exe:process.execPath},
        {pid:ffPid, ppid:nodePid, startTicks:runStartTicks+2, exe:FF}
      ]
    });
  }
  return {
    refused:false, runNonce:nonce, runStartTicks,
    samples,
    finalSweep:{ss:{ticks:runStartTicks+2500, nonLoopback:0, ssObs:0}, proc:{ticks:runStartTicks+2500, nonLoopback:0, procObs:0}},
    owned:{nodePid, roots:[{pid:ffPid, startTicks:runStartTicks+2, exe:FF}]},
    survivors:0, survivorPids:[], portClosed:true,
    browserVersion:'Firefox 155.0 (forged)', firstShotSha256:shot,
    sockets:{ss:{observations:9, nonLoopback:0}, proc:{observations:9, nonLoopback:0}},
    egressNonLoopback:0
  };
};
const runs=[mkRun(0),mkRun(1)];
const receipt=JSON.stringify({
  schema:'tabi-pw-firefox-egress-receipt-r43', runNonce:nonce, refused:false,
  binding:true, runs, egressNonLoopback:0,
  envCheck:{procEnvironReadable:true, forbiddenNames:[], execArgv:true, execArgvClean:true, envNonceEcho:'match'}
},null,1);
const wSamples=[];
for(let j=0;j<10;j++){
  wSamples.push({tree:[
    {pid:nodePid, ppid:1, startTicks:NOW-900, exe:process.execPath},
    {pid:90000, ppid:nodePid, startTicks:NOW-890, exe:FF}
  ]});
}
const wdoc={schema:'tabi-r43-witness', nonce, rootPid:1, startedTicks:NOW-900, endedTicks:NOW, samples:wSamples, environ:[]};
const wsign=canonical({rootPid:wdoc.rootPid,nonce:wdoc.nonce,startedTicks:wdoc.startedTicks,endedTicks:wdoc.endedTicks,samples:wdoc.samples});
wdoc.attestation={publicKey:wit.publicKey.export({type:'spki',format:'pem'}).toString(), over:sha(Buffer.from(wsign,'utf8')), value:crypto.sign(null,Buffer.from(wsign,'utf8'),wit.privateKey).toString('hex')};
const witness=JSON.stringify(wdoc,null,1);
fs.writeFileSync(D+'/receipt.json',receipt);
fs.writeFileSync(D+'/receipt.witness.json',witness);
const measure={
  schema:'tabi-r43-c1-measure-record', nonce, createdAt:new Date().toISOString(),
  pubkeys:{wrapper:wk.publicKey.export({type:'spki',format:'pem'}).toString(), witness:wit.publicKey.export({type:'spki',format:'pem'}).toString()},
  bindings:{receiptSha256:sha(Buffer.from(receipt,'utf8')), witnessSha256:sha(Buffer.from(witness,'utf8')), runs:2},
  digests:{
    'scripts/measure-c1-round43.mjs': fileSha(LANE+'/scripts/measure-c1-round43.mjs'),
    'scripts/playwright-firefox-egress-round43.mjs': fileSha(LANE+'/scripts/playwright-firefox-egress-round43.mjs'),
    '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs': fileSha(LANE+'/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs')
  },
  gate:{self:{procEnvironReadable:true,nameCount:1,forbiddenNames:[],execArgv:[],execArgvClean:true,execPath:process.execPath,nodeSha256:fileSha(process.execPath)},child:{ok:true}},
  elapsedMs:20000, driverExit:0
};
const us=canonical(measure);
measure.signature={scheme:'ed25519', over:sha(Buffer.from(us,'utf8')), value:crypto.sign(null,Buffer.from(us,'utf8'),wk.privateKey).toString('hex')};
fs.writeFileSync(D+'/measure.json',JSON.stringify(measure,null,1));
fs.writeFileSync(D+'/wrapper-private.pem', wk.privateKey.export({type:'pkcs8',format:'pem'}).toString());
console.log(JSON.stringify({dir:D,nonce,receiptSha:sha(Buffer.from(receipt,'utf8')),witnessSha:sha(Buffer.from(witness,'utf8'))}));
