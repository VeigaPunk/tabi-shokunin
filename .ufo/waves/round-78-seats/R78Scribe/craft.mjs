import fs from 'node:fs';
const L='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const src=JSON.parse(fs.readFileSync(L+'/corpus/evidence/round78/chromium-file-chooser/receipt.json','utf8'));
const clone=v=>JSON.parse(JSON.stringify(v));
function remap(r, fn){
  for(const e of r.cdpEventLog) if(e.method==='Page.fileChooserOpened') e.params.backendNodeId=fn(e.params.backendNodeId);
  for(const c of r.cdpSendLog) if(c.method==='DOM.setFileInputFiles' && c.params.backendNodeId!==undefined) c.params.backendNodeId=fn(c.params.backendNodeId);
  for(const l of r.legs){ if(l.openedNode!==null) l.openedNode=fn(l.openedNode); if(l.setParams && l.setParams.backendNodeId!==undefined) l.setParams.backendNodeId=fn(l.setParams.backendNodeId); }
  for(const k of Object.keys(r.legShape)) r.legShape[k].opened=r.legShape[k].opened.map(([m,id])=>[m, fn(id)]);
  return r;
}
const out={};
// consistent swap 5<->7
out['swap-consistent']=remap(clone(src), id=> id===5?7 : id===7?5 : id);
// consistent relabel 5->105
out['relabel-consistent']=remap(clone(src), id=> id===5?105 : id);
// one-leg swap: pick-same only, id 5 -> 7
{
  const r=clone(src);
  const leg=r.legs.find(l=>l.name==='pick-same');
  const o=r.cdpEventLog.find(e=>e.method==='Page.fileChooserOpened' && e.afterSendId===leg.triggerSendId);
  o.params.backendNodeId=7; leg.openedNode=7;
  if(leg.setParams) leg.setParams.backendNodeId=7;
  const c=r.cdpSendLog.find(c=>c.id===leg.setSendId); if(c) c.params.backendNodeId=7;
  r.legShape['pick-same'].opened=[['selectSingle',7]];
  out['swap-one-leg']=r;
}
for(const [k,v] of Object.entries(out)) fs.writeFileSync(`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-78-seats/R78Scribe/${k}.receipt.json`, JSON.stringify(v,null,1));
console.log(Object.keys(out).join(' '));
