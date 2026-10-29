import fs from 'node:fs';
import crypto from 'node:crypto';
const frozen=fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs','utf8');
const m=frozen.match(/const PREDICATE = ('(?:[^'\\]|\\.)*');/s);
// eval the JS string literal safely
const frozenPred=(0,eval)('('+m[1]+')');
const att1=JSON.parse(fs.readFileSync('/fast/scratch/hyaku/tabi-r43/L1-measure/measure.stdout','utf8')).counter.predicateSentence;
const att2=JSON.parse(fs.readFileSync('/fast/scratch/hyaku/tabi-r43/L1-measure/measure2.stdout','utf8')).counter.predicateSentence;
const claims=JSON.parse(fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/claims.json','utf8'));
const cp=claims.claims.find(c=>c.id==='C1').counterPredicate;
const h=s=>crypto.createHash('sha256').update(s).digest('hex');
console.log('frozen == attempt1 counter :', frozenPred===att1);
console.log('frozen == attempt2 counter :', frozenPred===att2);
console.log('claims.counterPredicate == frozen PREDICATE :', cp===frozenPred);
console.log('sha frozen  :', h(frozenPred));
console.log('sha attempt1:', h(att1));
console.log('sha claims  :', h(cp));
