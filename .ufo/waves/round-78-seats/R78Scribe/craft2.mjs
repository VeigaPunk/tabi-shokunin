import fs from 'node:fs';
const L='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const src=JSON.parse(fs.readFileSync(L+'/corpus/evidence/round78/chromium-file-chooser/receipt.json','utf8'));
const r=JSON.parse(JSON.stringify(src));
const NEW='ABCDEF0123456789ABCDEF0123456789';
const OLD=r.mainFrameId;
r.mainFrameId=NEW; r.frameTree.mainFrameId=NEW;
for(const e of r.cdpEventLog){ if(e.params && e.params.frameId===OLD) e.params.frameId=NEW; }
fs.writeFileSync(L+'/.ufo/waves/round-78-seats/R78Scribe/frame-relabel.receipt.json', JSON.stringify(r,null,1));
console.log('old',OLD,'new',NEW);
