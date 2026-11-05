// B8: path traversal attack on worksheet keys — Provinces.md@fleet-root like `../../shokunin/x.md:1`,
// fleet-outside key, and an overly-long key. Cells legit except path.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
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

const mk = (patch) => [HDR, ...data.map((r, i) => (i === 0 ? patch(r.slice()) : r).join('\t'))].join('\n') + '\n';

// B8a: traversal key (same-lane .. escape): ../../glee-shokunin/glee.md:1
const t1 = mk((r) => { r[1] = '../../tabi-shokunin/SKILL.md:1'; return r; });
fs.writeFileSync(path.join(SC, 'b8a-traversal.tsv'), t1);
// B8b: fleet-outside absolute key:
const t2 = mk((r) => { r[1] = '/etc/passwd:1'; return r; });
fs.writeFileSync(path.join(SC, 'b8b-abskey.tsv'), t2);
// B8c: colon-position variant `PROVINCE.md:64:3` (line:lastIndexOf handles double colon)
const t3 = mk((r) => { r[1] = r[1] + ':3'; return r; });
fs.writeFileSync(path.join(SC, 'b8c-colonvar.tsv'), t3);
// B8d: lane traversal — fleet/subdir-shokunin
const t4 = mk((r) => { r[0] = '../tabi-shokunin'; return r; });
fs.writeFileSync(path.join(SC, 'b8d-lanetrav.tsv'), t4);

const probe = (name, p) => {
  let rc, out;
  try { out = execFileSync('/usr/bin/node', [GATE, ...base(p)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); rc = 0; }
  catch (e) { rc = e.status; out = e.stdout || ''; }
  const pa = JSON.parse(out || '{}');
  console.log(name, 'rc=' + rc, 'ok=' + pa.ok, 'byCheck=' + JSON.stringify(pa.byCheck));
};
probe('B8a-traversal-key', path.join(SC, 'b8a-traversal.tsv'));
probe('B8b-abskey', path.join(SC, 'b8b-abskey.tsv'));
probe('B8c-colonvar-key', path.join(SC, 'b8c-colonvar.tsv'));
probe('B8d-lane-traversal', path.join(SC, 'b8d-lanetrav.tsv'));
