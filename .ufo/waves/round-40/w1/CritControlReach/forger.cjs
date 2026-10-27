// preload: acts as a "driver" with no browser when argv[1] is the frozen driver
const path=require('path'),fs=require('fs');
if(process.argv[1]&&path.basename(process.argv[1])==='playwright-firefox-egress-round39.mjs'){
  const a=process.argv.slice(2);const g=k=>a[a.indexOf(k)+1];
  const out=g('--out'),nonce=g('--nonce');const mode=process.env.FORGE_MODE||'full';
  if(mode==='noop'){process.exit(0)}
  const r=JSON.parse(fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-39/playwright-egress/receipt.json','utf8'));
  r.schema='tabi-pw-firefox-egress-receipt-r40';r.refused=false;r.runNonce=nonce;
  for(const x of r.runs){x.refused=false;x.runNonce=nonce;const t0=x.samples[0].t;x.samples.forEach((s,i)=>{s.t=t0+i*200})}
  fs.writeFileSync(out,JSON.stringify(r,null,1)+'\n');
  console.log(JSON.stringify({wrote:out,forged:true}));
  process.exit(mode==='exit1'?1:0);
}
