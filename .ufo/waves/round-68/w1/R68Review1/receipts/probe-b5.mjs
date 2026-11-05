// B5: second wedge battery — checks the 15-case selftest may not exercise.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SC = '/fast/scratch/hyaku/tabi-r68/R68Review1';
const SRC = fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-adjacency-adjudication-r68.mjs', 'utf8');
const WEDGES = [
  ['remove-pending-count', "if (args['expect-pending'] !== undefined && pending !== Number(args['expect-pending'])) {\n    findings.push(['pending-count', String(pending)]);\n  }"],
  ['remove-pending-fields-dirty', "if (cell !== '—') findings.push(['pending-fields-dirty', line + ':' + cellName]);"],
  ['remove-date-invalid', "if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) findings.push(['date-invalid', line]);"],
  ['remove-head-shape', "if (!HEX40.test(head)) { findings.push(['head-shape', line]); continue; }"],
  ['remove-reason-missing', "if (!reason || reason === '—') findings.push(['reason-missing', line]);"],
  ['remove-snapshot-head-mismatch', "else if (heads[c.lane] !== c.laneHead) {\n      findings.push(['head-source-mismatch', c.lane + ':' + c.path]);\n    }"],
  ['remove-quote-unresolved', "else if (!out.content.includes(res.quote)) findings.push(['quote-unresolved', res.line]);"],
  ['remove-path-unresolved', "if (err || !out || !out.resolved) findings.push(['path-unresolved', res.line]);"],
  ['remove-key-shape', "if (!validateKey(lane, pathKey)) findings.push(['key-shape', line]);"],
  ['remove-missing-key-loop', "if (!seen.has(key)) findings.push(['missing-key', key.replace('\\t', ':')]);"],
];
const results = [];
for (const [name, needle] of WEDGES) {
  if (!SRC.includes(needle)) { results.push({ name, error: 'needle-not-found' }); continue; }
  const mutated = SRC.replace(needle, '/*w5*/');
  const gateP = path.join(SC, 'gate5-' + name + '.mjs');
  fs.writeFileSync(gateP, mutated);
  const scratch = path.join(SC, 'st5-' + name);
  let rc, out;
  try { out = execFileSync('/usr/bin/node', [gateP, '--selftest', '--scratch', scratch], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); rc = 0; }
  catch (e) { rc = e.status; out = e.stdout || ''; }
  let parsed = null; try { parsed = JSON.parse(out); } catch {}
  results.push({ name, rc, verdict: parsed ? parsed.verdict : 'no-json', failed: parsed ? parsed.failed : null,
    expectedMismatch: parsed ? parsed.results.filter((r) => r.observed !== r.expected).map((r) => r.name) : null });
}
console.log(JSON.stringify(results, null, 1));
fs.writeFileSync(path.join(SC, 'receipts-b5.json'), JSON.stringify(results, null, 1));
