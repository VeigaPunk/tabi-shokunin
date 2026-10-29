import fs from 'node:fs';
import crypto from 'node:crypto';
const REPO='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const doc=JSON.parse(fs.readFileSync(REPO+'/.ufo/waves/round-43/claims.json','utf8'));
const sha=(s)=>crypto.createHash('sha256').update(s).digest('hex');
for (const [id,rel,key] of [['C1','.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs','counterPredicate'],['C2','.ufo/waves/round-43/counters/check-routed-defects-round43.mjs','predicate']]) {
  const src=fs.readFileSync(REPO+'/'+rel,'utf8');
  const m=src.match(/^const PREDICATE = '(.*)';$/m);
  const runtime=m[1].replace(/\\'/g,"'").replace(/\\\\/g,'\\');
  const sent=doc.claims.find(c=>c.id===id)[key];
  console.log(id, 'runtimeEqualsClaims=', runtime===sent, 'sha(runtime)=', sha(runtime).slice(0,16), 'sha(claims)=', sha(sent).slice(0,16));
  console.log(id, 'apostrophesInClaims=', (sent.match(/'/g)||[]).length, 'escapedQuotesInLiteral=', (m[1].match(/\\'/g)||[]).length);
}
