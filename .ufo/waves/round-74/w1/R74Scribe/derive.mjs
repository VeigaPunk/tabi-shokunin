import fs from 'node:fs';
const DIR='/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-74/controls/c1';
const A='/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round74/chromium-ime-composition/receipt.json';
const files=[...Array(9)].map((_,i)=>({n:'smoke'+(i+1),p:`${DIR}/smoke${i+1}.receipt.json`}));
files.push({n:'(a)',p:A});
const tag=(e)=>e.type+(e.inputType?'('+e.inputType+')':'');
const derive=(r,leg)=>{
  const evs=r.events.filter(e=>e.leg===leg&&e.type!=='focusin'&&e.type!=='focusout');
  const L=(r.legs||[]).find(l=>l.name===leg)||{};
  return {seq:evs.map(tag),trusted:evs.map(e=>e.isTrusted),data:evs.map(e=>e.data===undefined?'-':e.data),
    composing:evs.map(e=>e.isComposing),targets:[...new Set(evs.map(e=>e.target))],state: L.stateAfter||null, error: L.cdpError||null};
};
const out={};
for(const f of files){
  const r=JSON.parse(fs.readFileSync(f.p,'utf8'));
  const legs=Object.keys(r.legShape);
  const mine={}; for(const l of legs) mine[l]=derive(r,l);
  // compare my derivation against the receipt's own legShape summary
  const mism=[];
  for(const l of legs){
    const want=r.legShape[l], got=mine[l];
    const cmp=(k,ww,gg)=>{ if(JSON.stringify(ww)!==JSON.stringify(gg)) mism.push(`${l}.${k}: want=${JSON.stringify(ww)} got=${JSON.stringify(gg)}`); };
    cmp('seq',want.seq,got.seq); cmp('trusted',want.trusted,got.trusted); cmp('data',want.data,got.data);
    cmp('composing',want.composing,got.composing); cmp('targets',want.targets,got.targets); cmp('stateAfter',want.stateAfter,got.state);
  }
  const keyEvents=r.events.filter(e=>/^key(down|press|up)$/.test(e.type)).length;
  const untrusted=[...new Set(r.events.filter(e=>!e.isTrusted).map(e=>e.type))];
  const firstFocusin=(r.events.find(e=>e.type==='focusin')||{}).leg;
  out[f.n]={nonce:r.nonce,degenerate:r.degenerate,driverSha256:r.driverSha256,predicate:r.predicate,
    hyp:r.imeComposeHypothesis,failures:r.failures,legs:legs.length,events:r.events.length,
    summaryVsRawMismatches:mism,keyEvents,untrustedTypes:untrusted,firstFocusin,
    imeCalls:(r.cdpSendLog||[]).filter(c=>c.method==='Input.imeSetComposition'||c.method==='Input.insertText').length,
    replaceHalfError:(r.legs.find(l=>l.name==='replace-half')||{}).cdpError,
    lateAfterClose:r.lateAfterClose,teardown:r.teardown,legShape:mine};
}
fs.writeFileSync('derived.json',JSON.stringify(out,null,1));
// cross-receipt identity of the derived shapes
const names=Object.keys(out);
const base=out[names[0]].legShape;
for(const n of names){
  const same=JSON.stringify(out[n].legShape)===JSON.stringify(base);
  const strip=(s)=>JSON.stringify(s.legShape);
  console.log(n,'sameAsSmoke1=',same,'legs=',out[n].legs,'events=',out[n].events,'key=',out[n].keyEvents,'untrusted=',out[n].untrustedTypes.join(','),'firstFocusin=',out[n].firstFocusin,'mismatch=',out[n].summaryVsRawMismatches.length,'imeCalls=',out[n].imeCalls,'hyp=',out[n].hyp,'pred=',out[n].predicate,'fail=',out[n].failures.length,'late=',out[n].lateAfterClose);
  if(!same){ // show which legs differ
    for(const l of Object.keys(base)) if(strip({legShape:{[l]:out[n].legShape[l]}})!==strip({legShape:{[l]:base[l]}})) console.log('  DIFF leg',l,JSON.stringify(out[n].legShape[l]),'!=',JSON.stringify(base[l]));
  }
}
console.log('replaceHalfError(a)=',JSON.stringify(out['(a)'].replaceHalfError));
console.log('teardown(a)=',JSON.stringify(out['(a)'].teardown));
