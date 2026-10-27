import { deltaCandidates, BG } from './c1-counter.mjs';
import { readFileSync } from 'node:fs';
const FLEET='/home/vgpnk/Projects/shokunin';
const frozen=JSON.parse(readFileSync('./freeze-pins.json','utf8'));
const liveAll=JSON.parse(readFileSync('./live-pins-all.json','utf8'));
const live12=JSON.parse(readFileSync('./live-pins.json','utf8'));
for (const [label,p] of [['FROZEN(all 20)',frozen],['LIVE(12 drifted only)',live12],['LIVE(all 20 at tip)',liveAll]]) {
  const d=deltaCandidates(FLEET,p);
  console.log('delta pool ['+label+']:', d.length);
  for(const c of d.slice(0,25)) console.log('   ', c.key, '::', c.text.trim().slice(0,100));
}
