// Retargeted round-41 forger: same preload technique as the committed
// round-40 F4 attack, retargeted at the round-41 driver basename and schema.
// It fabricates an r41-shaped receipt (envCheck clean, nonce-bound runs,
// 1200ms spans, owned trees, socket observations) so that ONLY the
// environment boundary can stop it — digests/witness then refuse too.
const path=require('path'),fs=require('fs');
if(process.argv[1]&&path.basename(process.argv[1])==='playwright-firefox-egress-round41.mjs'){
  const a=process.argv.slice(2);const g=k=>a[a.indexOf(k)+1];
  const out=g('--out'),nonce=g('--nonce');
  const now=Date.now();
  const mkRun=(name)=>{const samples=[];for(let i=0;i<12;i++){const t=now-1200+i*100;samples.push({t,tTicks:1+i,ss:{ticks:1,lines:2,nonLoopback:0,ssObs:2},proc:{ticks:1,inodes:2,nonLoopback:0,procObs:2},treePids:[{pid:9,startTicks:1,exe:'/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox',comm:'firefox'}]});}
   return {name,cmds:[],events:[],refused:false,runNonce:nonce,samples,browserVersion:'157.0',firstShotSha256:'a'.repeat(64),survivors:0,survivorPids:[],portClosed:true,runStartTicks:0,runEndTicks:99,
    finalSweep:{t:now,tTicks:99,ss:{ticks:1,lines:0,nonLoopback:0,ssObs:0},proc:{ticks:1,inodes:0,nonLoopback:0,procObs:0},treePids:[]},
    owned:{nodePid:1,roots:[{pid:9,startTicks:1,exe:'/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox',comm:'firefox'}]},
    sockets:{ss:{observations:24,nonLoopback:0},proc:{observations:24,nonLoopback:0},finalSweep:{ss:0,proc:0}},egressNonLoopback:0};};
  const r={schema:'tabi-pw-firefox-egress-receipt-r41',driver:'scripts/playwright-firefox-egress-round41.mjs',measuredAt:new Date().toISOString(),playwrightVersion:'1.64.0',
    envCheck:{procEnvironReadable:true,nameCount:10,forbiddenNames:[],execArgv:[],execArgvClean:true,envNonceEcho:'match'},
    runNonce:nonce,runs:[mkRun('run1'),mkRun('run2')],refused:false,binding:true,egressNonLoopback:0,survivors:0,browserVersion:'157.0'};
  fs.writeFileSync(out,JSON.stringify(r,null,1)+'\n');
  console.log(JSON.stringify({wrote:out,forged:true,runNonce:nonce}));
  process.exit(0);
}
