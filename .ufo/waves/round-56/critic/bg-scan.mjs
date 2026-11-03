// R56Critic probe (read-only): browser-ground words in roster PROVINCE.md at the
// frozen round-open heads that the frozen v15 BG_WORDS list does NOT screen.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const fleet = '/home/vgpnk/Projects/shokunin';
const frozen = JSON.parse(fs.readFileSync(`${fleet}/tabi-shokunin/.ufo/waves/round-56/controls/c1-meter-v15-red-at-round-open.json`, 'utf8'));
const BG = ['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har'];
const EXTRA = /chromium|chrome|puppeteer|webview|browser|scrape/i;
let total = 0;
for (const [lane, head] of Object.entries(frozen.headSnapshot)) {
  if (!head) continue;
  const r = spawnSync('git', ['-C', `${fleet}/${lane}`, 'cat-file', '-p', `${head}:PROVINCE.md`], { maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) continue;
  const lines = r.stdout.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));
  const gap = lines.map((l, i) => [i + 1, l]).filter(([, l]) => EXTRA.test(l) && !BG.some((w) => l.toLowerCase().includes(w)));
  const bg = lines.filter((l) => BG.some((w) => l.toLowerCase().includes(w))).length;
  if (gap.length) { total += gap.length; console.log(`${lane}: bgHits=${bg} unscreened-browser-word-lines=${gap.length}`); for (const [n, l] of gap) console.log(`   :${n} ${l.slice(0, 140)}`); }
}
console.log(`TOTAL unscreened browser-word lines at frozen heads: ${total}`);
