// mutate.mjs <baseDelta> <baseAudit> <outDir> — writes mutants (a)-(f) as copies; prints a JSON manifest.
import fs from 'node:fs';
import path from 'node:path';

const [baseDelta, baseAudit, outDir] = process.argv.slice(2);
if (!baseDelta || !baseAudit || !outDir) { console.error('usage: mutate.mjs <baseDelta> <baseAudit> <outDir>'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });

const DISP = ['no-tabi-ground', 'overlap-declared', 'contested-open'];
const BG = ['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har'];
const HEAD40 = /^[0-9a-f]{40}$/;

const deltaRaw = fs.readFileSync(baseDelta, 'utf8');
const auditRaw = fs.readFileSync(baseAudit, 'utf8');
const dLines = deltaRaw.split('\n');       // keep trailing '' so the join is byte-exact
const aLines = auditRaw.split('\n');
const dRows = dLines.map((l) => l.replace(/\r$/, '').split('\t'));
const aRows = aLines.map((l) => l.replace(/\r$/, '').split('\t'));

const writeDelta = (name, lines) => { const p = path.join(outDir, name); fs.writeFileSync(p, lines.join('\n')); return p; };
const writeAudit = (name, lines) => { const p = path.join(outDir, name); fs.writeFileSync(p, lines.join('\n')); return p; };
const manifest = { base: { delta: baseDelta, audit: baseAudit }, mutants: {} };
const hashOf = (p) => (globalThis.crypto ? null : null);

// index of a delta row by predicate
const idx = (pred) => dRows.findIndex((r, i) => i > 0 && pred(r));

// (a) flip a line row's disposition to a different in-vocabulary value
{
  const i = idx((r) => r[0] === 'line' && DISP.includes(r[7]));
  const row = dRows[i].slice();
  const next = DISP.find((d) => d !== row[7]);
  const lines = dLines.slice(); row[7] = next; lines[i] = row.join('\t');
  manifest.mutants.a = { file: writeDelta('mut-a-delta.tsv', lines), line: i + 1, from: dRows[i][7], to: next, key: `${dRows[i][1]}:${dRows[i][2]}` };
  manifest.mutants.a.audit = baseAudit;
}

// (b) delete one line row for a browser-ground hit line (quote contains a BG word)
{
  const i = idx((r) => r[0] === 'line' && BG.some((w) => (r[6] || '').toLowerCase().includes(w)));
  const lines = dLines.filter((_, k) => k !== i);
  manifest.mutants.b = { file: writeDelta('mut-b-delta.tsv', lines), line: i + 1, key: `${dRows[i][1]}:${dRows[i][2]}`, quote: dRows[i][6] };
  manifest.mutants.b.audit = baseAudit;
}

// (c) change one lane row's head to a different 40-hex value
{
  const i = idx((r) => r[0] === 'lane' && HEAD40.test(r[8]));
  const row = dRows[i].slice();
  const newHead = row[8].startsWith('0') ? '1'.repeat(40) : '0'.repeat(40);
  row[8] = newHead;
  const lines = dLines.slice(); lines[i] = row.join('\t');
  manifest.mutants.c = { file: writeDelta('mut-c-delta.tsv', lines), line: i + 1, lane: dRows[i][1], from: dRows[i][8], to: newHead };
  manifest.mutants.c.audit = baseAudit;
}

// (d) change one lane row's provinceSha256 to all zeros
{
  const i = idx((r) => r[0] === 'lane' && /^[0-9a-f]{64}$/.test(r[3]));
  const row = dRows[i].slice();
  row[3] = '0'.repeat(64);
  const lines = dLines.slice(); lines[i] = row.join('\t');
  manifest.mutants.d = { file: writeDelta('mut-d-delta.tsv', lines), line: i + 1, lane: dRows[i][1], path: dRows[i][2], from: dRows[i][3], to: row[3] };
  manifest.mutants.d.audit = baseAudit;
}

// (e) add a second line row on an existing key with a different disposition
{
  const i = idx((r) => r[0] === 'line' && DISP.includes(r[7]));
  const row = dRows[i].slice();
  const next = DISP.find((d) => d !== row[7]);
  row[7] = next;
  const lines = dLines.slice(); lines.splice(i + 1, 0, row.join('\t'));
  manifest.mutants.e = { file: writeDelta('mut-e-delta.tsv', lines), inserted_after_line: i + 1, key: `${dRows[i][1]}:${dRows[i][2]}`, from: dRows[i][7], to: next };
  manifest.mutants.e.audit = baseAudit;
}

// (f) change one audit status to `unchanged` where the meter derives `moved`
// The derivation needs the live snapshot; the caller passes candidate audit rows
// (see verify step) — here we emit the row list of audit rows whose status is
// `moved` in the base, which the runner resolves against the meter's own derivation.
{
  const movedIdx = aRows.map((r, i) => [r, i]).filter(([r, i]) => i > 0 && r[1] === 'moved').map(([, i]) => i);
  manifest.mutants.f = { candidateAuditLines: movedIdx.map((i) => i + 1), note: 'runner picks first candidate the meter derives as moved' };
}
manifest.auditRowsAll = aRows.length;
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(JSON.stringify(manifest, null, 1));
