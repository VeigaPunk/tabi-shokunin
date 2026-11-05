// B7: probe head-shape continue-leak (row with non-HEX40 head still resolves via git HEAD-ish),
//     and the git-show bare-arg form (non-ref objects and alternate forms).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const SC = '/fast/scratch/hyaku/tabi-r68/R68Review1';
const GATE = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-adjacency-adjudication-r68.mjs';
const LEDGER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv';
const SNAPSHOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/measure/snapshot-live-r66.tsv';
const FLEET = '/home/vgpnk/Projects/shokunin';
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const base = (ws) => ['--ledger', LEDGER, '--snapshot', SNAPSHOT, '--worksheet', ws, '--fleet', FLEET,
  '--expect-ledger-sha256', sha(LEDGER), '--expect-snapshot-sha256', sha(SNAPSHOT)];

const lines = fs.readFileSync(path.join(SC, 'ws-regen.tsv'), 'utf8').split('\n').filter((l) => l.length > 0);
const HDR = lines[0];
const data = lines.slice(1).map((l) => l.split('\t'));

// B7a: head-shape leak —.First row's head replaced by a branch name (40-hex fails) but still resolvable via `show`.
const blobLine = data.map((r, i) => {
  if (i === 0) {
    const c = r.slice();
    c[2] = 'HEAD'; // still 'HEAD' is 4 chars, fails HEX40 → head-shape, but 'continue' skips the resolve push...?
    return c;
  }
  return r;
});
// but continue skips the rest of the loop → resolutions misses row 1 → and missing resolution means
// the row never goes through git. So the leak is: head-shape rows skip git, unknown outcome? Check next:
const wsA = [HDR, ...blobLine.map((r) => r.join('\t'))].join('\n') + '\n';
fs.writeFileSync(path.join(SC, 'b7a-head-shape.tsv'), wsA);
const runGate = (ws) => {
  try {
    const o = execFileSync('/usr/bin/node', [GATE, ...base(ws)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { rc: 0, out: o };
  } catch (e) { return { rc: e.status, out: e.stdout || '' }; }
};
const a = runGate(path.join(SC, 'b7a-head-shape.tsv'));
const pa = JSON.parse(a.out);
console.log('B7a head-shape: rc=' + a.rc + ' byCheck=' + JSON.stringify(pa.byCheck) + ' checked=' + pa.checked);

// B7b: does resolveAtHead's `show` call with `head:file` accept a non-40-hex `head`? Direct git:
const probe = spawnSync('git', ['-C', '/home/vgpnk/Projects/shokunin/kagi-shokunin', 'cat-file', '-e', 'HEAD:PROVINCE.md']);
console.log('B7b cat-file -e HEAD:PROVINCE.md rc=' + probe.status + ' (despite regex-free args the gate regex-filters this earlier)');

// B7c: symlink ledger/snapshot inputs
const symL = path.join(SC, 'b7c-ledger-symlink.tsv');
const symS = path.join(SC, 'b7c-snap-symlink.tsv');
try { fs.unlinkSync(symL); fs.unlinkSync(symS); } catch {}
fs.symlinkSync(LEDGER, symL);
fs.symlinkSync(SNAPSHOT, symS);
const runC = (() => {
  try {
    const o = execFileSync('/usr/bin/node', [GATE, '--ledger', symL, '--snapshot', symS, '--worksheet', path.join(SC, 'ws-regen.tsv'),
      '--fleet', FLEET, '--expect-ledger-sha256', sha(LEDGER), '--expect-snapshot-sha256', sha(SNAPSHOT)],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { rc: 0, out: o };
  } catch (e) { return { rc: e.status, out: e.stdout || '' }; }
})();
console.log('B7c symlink ledger/snapshot rc=' + runC.rc + ' out=' + runC.out.trim().slice(0, 160));
