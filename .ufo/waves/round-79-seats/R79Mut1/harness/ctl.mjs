import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const RECEIPT = path.join(HERE, 'receipt-sweep.json');
const BASE_LANE = path.join(HERE, 'runs', 'baseline-lane', 'tabi-shokunin');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-79/controls/c1/prior-set.txt');
const PIN = 'e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933';
const NONCE = 'tabi-r79-l1-80830674d421';
const FIXTURE = '2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8';
const ids = process.argv.slice(2);
for (const id of ids) {
  const dir = path.join(HERE, 'ctl', id);
  const r = spawnSync(process.execPath, [path.join(dir, 'negatives-showpicker-r79.mjs'), '--lane', BASE_LANE, '--real', RECEIPT,
    '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--expect-fixture-sha256', FIXTURE, '--prior-set', PRIOR_SET,
    '--work', path.join(dir, 'work'), '--json'], { encoding: 'utf8', timeout: 600000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  console.log(id, 'exit', r.status, j ? 'failed ' + j.failed + ' cases ' + JSON.stringify((j.failures || []).map((f) => f.case)) : 'stdout ' + r.stdout.slice(0, 200) + ' err ' + r.stderr.slice(0, 200));
}
