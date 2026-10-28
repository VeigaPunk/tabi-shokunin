import fs from 'node:fs';
const S='/fast/scratch/hyaku/tabi-r42/RevC1Receipt';
const p=JSON.parse(fs.readFileSync(S+'/tree/.ufo/waves/round-41/claims.json','utf8'));
const kept={};
const driverKey='scripts/playwright-firefox-egress-round41.mjs';
kept[driverKey]=p.frozenDigests[driverKey];
p.frozenDigests=kept; // retargeting drops the measure self-pin and the patched counter's pin only
fs.writeFileSync(S+'/tree/.ufo/waves/round-41/claims.json', JSON.stringify(p,null,1));
console.log(JSON.stringify({keptPins:Object.keys(kept),producerPins:p.producerPins}));
