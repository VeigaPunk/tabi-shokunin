// B9: exhaust the adjudicated-row policy space systematically on one real row
// plus hedged pending-dirty cells with '–' (en dash), ' – ', ' --- ', empty string.
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
const base = (ws, extra = []) => ['--ledger', LEDGER, '--snapshot', SNAPSHOT, '--worksheet', ws, '--fleet', FLEET,
  '--expect-ledger-sha256', sha(LEDGER), '--expect-snapshot-sha256', sha(SNAPSHOT), ...extra];

const lines = fs.readFileSync(path.join(SC, 'ws-regen.tsv'), 'utf8').split('\n').filter((l) => l.length > 0);
const HDR = lines[0];
const data = lines.slice(1).map((l) => l.split('\t'));

const patchRow = (idx, patchObj) => {
  const c = data[idx].slice();
  for (const [k, v] of Object.entries(patchObj)) c[Number(k)] = v;
  return c;
};
const mk = (rows) => [HDR, ...rows.map((r) => r.join('\t'))].join('\n') + '\n';
const idx0 = 0;
const probe = (name, p, extra) => {
  let rc, out;
  try { out = execFileSync('/usr/bin/node', [GATE, ...base(p, extra)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); rc = 0; }
  catch (e) { rc = e.status; out = e.stdout || ''; }
  const pa = JSON.parse(out || '{}');
  console.log(name, 'rc=' + rc, 'ok=' + pa.ok, 'findings=' + JSON.stringify(pa.findings));
  return pa;
};
const W = (n, rows) => { const p = path.join(SC, 'b9-' + n + '.tsv'); fs.writeFileSync(p, mk(rows)); return p; };

// B9a: pending row with en-dash '–' (U+2013) in adjudicator
probe('B9a-en-dash-adjudicator', W('endash', [patchRow(idx0, { 4: 'pending-non-author', 5: '–' }), ...data.slice(1)]));
// B9b: pending with empty adjudicator cell (empty string)
probe('B9b-empty-adjudicator', W('emptyadj', [patchRow(idx0, { 4: 'pending-non-author', 5: '' }), ...data.slice(1)]));
// B9c: pending with whitespace adjudicator
probe('B9c-space-adjudicator', W('spaceadj', [patchRow(idx0, { 4: 'pending-non-author', 5: ' ' }), ...data.slice(1)]));
// B9d: adjudicated date with embedded tab
probe('B9d-date-tab-embedded', W('datetab', [patchRow(idx0, { 4: 'adjudicated-agree', 5: 'operator', 6: 'agree', 7: 'holds', 8: '2026-11-05X' }), ...data.slice(1)], ['--max-adjudicated', '1']));
// B9e: adjudicated verdict cell containing lane escape \t inside reason
probe('B9e-reason-embedded-tabi', W('reasontab', [patchRow(idx0, { 4: 'adjudicated-agree', 5: 'operator', 6: 'agree', 7: 'the tabi lane (this-province-author) influenced nothing', 8: '2026-11-05' }), ...data.slice(1)], ['--max-adjudicated', '1']));
