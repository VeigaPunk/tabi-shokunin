import fs from 'node:fs';
import { forgeries } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs';
const out = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2';
const live = JSON.parse(fs.readFileSync(out + '/smoke/receipt.json', 'utf8'));
for (const [id, mutate] of Object.entries(forgeries)) {
  const probe = structuredClone(live);
  mutate(probe);
  fs.writeFileSync(out + '/probes/' + id + '.json', JSON.stringify(probe, null, 1) + '\n');
  console.log(id);
}
