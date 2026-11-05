// Build evidence dirs bound to a given wrapper: copy a counter-clean receipt
// (the committed smoke control) and patch only driverSha256 to the wrapper's.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const S = '/fast/scratch/hyaku/tabi-r64/R64MutDriver';
const SRC = path.join(LANE, '.ufo/waves/round-64/controls/smoke');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

for (const name of ['wrapper-once', 'wrapper-copy']) {
  const wrapper = path.join(S, 'attacks', name + '.mjs');
  const dst = path.join(S, 'attacks', 'evidence-' + name);
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(dst, { recursive: true });
  const rec = JSON.parse(fs.readFileSync(path.join(SRC, 'receipt.json'), 'utf8'));
  rec.driverSha256 = sha(fs.readFileSync(wrapper));
  for (const l of rec.legs) fs.copyFileSync(path.join(SRC, l.shot), path.join(dst, l.shot));
  fs.writeFileSync(path.join(dst, 'receipt.json'), JSON.stringify(rec, null, 1));
  console.log(JSON.stringify({ name, evidence: dst, driverSha256: rec.driverSha256 }));
}
