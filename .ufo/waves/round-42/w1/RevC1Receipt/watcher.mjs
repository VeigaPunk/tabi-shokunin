import fs from 'node:fs';
const S = '/fast/scratch/hyaku/tabi-r42/RevC1Receipt';
const scratch = S + '/run-scratch';
const DRIVER = S + '/tree/scripts/playwright-firefox-egress-round41.mjs';
const t0 = Date.now();
while (!fs.existsSync(scratch)) {
  await new Promise((r) => setTimeout(r, 1));
  if (Date.now() - t0 > 30000) { console.log('WATCHER_TIMEOUT'); process.exit(3); }
}
fs.copyFileSync(S + '/forger.mjs', DRIVER + '.swap');
fs.renameSync(DRIVER + '.swap', DRIVER);
console.log('SWAPPED_AFTER_SCRATCH_MKDIR_MS=' + (Date.now() - t0));
