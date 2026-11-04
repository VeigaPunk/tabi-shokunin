#!/usr/bin/env node
// Receipt-provenance gate (tabi round 64, C2). Counts mismatches between the
// lane's evidence record and observed repo state: every control receipt must be
// re-derivable — a real argv (not prose), an exit code, a committed stdout file
// whose recorded digest matches its bytes, and inputs bound to bytes at the
// revision the receipt names. A matrix file must name its input receipt and the
// command receipt that produced it. The r63 closure routed exactly this class
// (D3 one commit short, D4 matrix cannot show its input, D5 count not emitted,
// D7 prose argv and no stdout digest); this gate makes it countable.
//
// Usage: node check-receipt-provenance.mjs --dir <controls dir> [--repo <lane>]
//   [--rev <hex|worktree>] [--require-committed] [--min-receipts N] [--json]
//   node check-receipt-provenance.mjs --selftest --scratch <ABS> [--json]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const HEX64 = /^[a-f0-9]{64}$/;
const HEX40 = /^[a-f0-9]{40}$/;
const ALLOWED_ARGV0 = new Set(['node', 'python3', 'bash', 'sh', 'curl', 'git']);
const CHECK_IDS = ['schema', 'argv-real', 'exit-int', 'stdout-bound', 'inputs-bound', 'rev-committed', 'matrix-input', 'matrix-command'];

function readAt(repo, rev, rel) {
  if (rev && HEX40.test(rev)) {
    const r = spawnSync('git', ['-C', repo, 'show', rev + ':' + rel], { timeout: 30000, maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) return null;
    return r.stdout;
  }
  try { return fs.readFileSync(path.join(repo, rel)); } catch { return null; }
}
function commitExists(repo, rev) {
  if (!HEX40.test(rev || '')) return false;
  return spawnSync('git', ['-C', repo, 'cat-file', '-e', rev + '^{commit}'], { timeout: 20000 }).status === 0;
}

function checkReceipt(file, repo, rev, requireCommitted) {
  const failures = [];
  const push = (check, detail) => failures.push({ file, check, detail });
  let r;
  try { r = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { push('schema', 'unparseable: ' + e.message); return failures; }
  if (r?.schema !== 'tabi-command-receipt-v1') push('schema', 'schema=' + String(r?.schema));
  const argv = Array.isArray(r?.argv) ? r.argv : [];
  const prose = argv.some((a) => typeof a !== 'string' || a.trim() === '' || a.includes('  ') || a.includes('inline:') || a.includes('…'));
  const argv0Ok = argv.length > 0 && (ALLOWED_ARGV0.has(argv[0]) || (path.isAbsolute(argv[0]) && fs.existsSync(argv[0])));
  if (!argv0Ok || prose) push('argv-real', JSON.stringify(argv).slice(0, 160));
  if (!Number.isInteger(r?.exit) || r.exit < 0 || r.exit > 255) push('exit-int', String(r?.exit));
  const stdoutFile = r?.stdoutFile;
  let stdoutBytes = null;
  if (typeof stdoutFile === 'string' && stdoutFile) {
    const abs = path.isAbsolute(stdoutFile) ? stdoutFile : path.join(path.dirname(file), stdoutFile);
    try { stdoutBytes = fs.readFileSync(abs); } catch { stdoutBytes = null; }
  }
  if (!stdoutBytes || !HEX64.test(r?.stdoutSha256 || '') || sha(stdoutBytes) !== r.stdoutSha256) {
    push('stdout-bound', stdoutBytes ? 'digest mismatch' : 'stdout file missing');
  }
  const inputs = Array.isArray(r?.inputs) ? r.inputs : [];
  if (!inputs.length) push('inputs-bound', 'no inputs');
  else {
    for (const i of inputs) {
      if (typeof i?.path !== 'string' || !HEX64.test(i?.sha256 || '')) { push('inputs-bound', 'malformed entry'); continue; }
      const bytes = readAt(repo, r?.rev, i.path);
      if (!bytes) { push('inputs-bound', 'absent at ' + (r?.rev || 'worktree') + ': ' + i.path); continue; }
      if (sha(bytes) !== i.sha256) push('inputs-bound', 'digest mismatch ' + i.path);
    }
  }
  if (requireCommitted) {
    if (!HEX40.test(r?.rev || '') || !commitExists(repo, r.rev)) push('rev-committed', 'rev=' + String(r?.rev));
  }
  return failures;
}

function checkMatrix(file, dir) {
  const failures = [];
  const push = (check, detail) => failures.push({ file, check, detail });
  let m;
  try { m = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { push('matrix-input', 'unparseable: ' + e.message); return failures; }
  const inp = m?.input;
  if (typeof inp?.path !== 'string' || !HEX64.test(inp?.sha256 || '')) push('matrix-input', 'no input path+sha256');
  const cmd = path.join(dir, path.basename(file).replace(/\.json$/, '') + '.command.json');
  if (!fs.existsSync(cmd)) push('matrix-command', 'missing ' + path.basename(cmd));
  return failures;
}

function evaluate(dir, repo, rev, requireCommitted, minReceipts) {
  const receipts = fs.readdirSync(dir).filter((f) => f.endsWith('.command.json')).sort();
  const matrices = fs.readdirSync(dir).filter((f) => /^matrix.*\.json$/.test(f) && !f.endsWith('.command.json')).sort();
  const failures = [];
  for (const f of receipts) failures.push(...checkReceipt(path.join(dir, f), repo, rev, requireCommitted));
  for (const f of matrices) failures.push(...checkMatrix(path.join(dir, f), dir));
  const result = {
    schema: 'tabi-receipt-provenance',
    dir, repo, rev: rev || 'worktree', requireCommitted: !!requireCommitted,
    checked: receipts.length, matrices: matrices.length, minReceipts: minReceipts ?? null,
    failures: failures.length, byCheck: {}, findings: failures,
    ok: failures.length === 0 && receipts.length >= (minReceipts ?? 0),
  };
  for (const f of failures) result.byCheck[f.check] = (result.byCheck[f.check] || 0) + 1;
  if (receipts.length < (minReceipts ?? 0)) result.byCheck['min-receipts'] = (minReceipts ?? 0) - receipts.length;
  return result;
}

// ---------- selftest ----------
function selftest(scratch) {
  const root = path.join(scratch, 'provenance-selftest');
  fs.rmSync(root, { recursive: true, force: true });
  const repo = path.join(root, 'repo');
  fs.mkdirSync(path.join(repo, 'instruments'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'instruments', 'a.mjs'), 'export const a = 1;\n');
  const aSha = sha(fs.readFileSync(path.join(repo, 'instruments', 'a.mjs')));
  const dir = path.join(root, 'controls');
  fs.mkdirSync(dir, { recursive: true });
  const good = () => ({
    schema: 'tabi-command-receipt-v1', name: 'good',
    argv: ['node', 'instruments/a.mjs', '--json'], cwd: repo, exit: 0,
    stdoutFile: 'good.stdout', stdoutSha256: sha(Buffer.from('{"ok":true}\n')),
    inputs: [{ path: 'instruments/a.mjs', sha256: aSha }], rev: 'worktree',
  });
  fs.writeFileSync(path.join(dir, 'good.stdout'), '{"ok":true}\n');
  fs.writeFileSync(path.join(dir, 'good.command.json'), JSON.stringify(good(), null, 1));
  fs.writeFileSync(path.join(dir, 'matrix-good.json'), JSON.stringify({ input: { path: path.join(dir, 'good.command.json'), sha256: 'a'.repeat(64) } }));
  fs.writeFileSync(path.join(dir, 'matrix-good.command.json'), JSON.stringify({ ...good(), name: 'matrix-good' }, null, 1));
  const results = [];
  const base = evaluate(dir, repo, 'worktree', false, 2);
  results.push({ id: 'clean', ok: base.failures === 0, findings: base.findings });
  for (const id of CHECK_IDS) {
    const r = good();
    if (id === 'schema') r.schema = 'other';
    if (id === 'argv-real') r.argv = ['python3', '-c', 'python3 inline: verify each receipt'];
    if (id === 'exit-int') r.exit = 'zero';
    if (id === 'stdout-bound') r.stdoutSha256 = 'b'.repeat(64);
    if (id === 'inputs-bound') r.inputs = [{ path: 'instruments/a.mjs', sha256: 'c'.repeat(64) }];
    if (id === 'rev-committed') { r.rev = 'worktree'; fs.writeFileSync(path.join(dir, 'neg.command.json'), JSON.stringify(r)); }
    if (id === 'matrix-input') fs.writeFileSync(path.join(dir, 'matrix-neg1.json'), JSON.stringify({ input: null }));
    if (id === 'matrix-command') fs.writeFileSync(path.join(dir, 'matrix-neg2.json'), JSON.stringify({ input: { path: 'x', sha256: 'd'.repeat(64) } }));
    if (id !== 'rev-committed') fs.writeFileSync(path.join(dir, 'neg.command.json'), JSON.stringify(r));
    const res = evaluate(dir, repo, 'worktree', id === 'rev-committed', 0);
    results.push({ id, ok: res.findings.some((f) => f.check === id), findings: res.findings.map((f) => f.check) });
    fs.rmSync(path.join(dir, 'neg.command.json'), { force: true });
    for (const f of ['matrix-neg1.json', 'matrix-neg2.json']) fs.rmSync(path.join(dir, f), { force: true });
  }
  const passed = results.filter((r) => r.ok).length;
  return { verdict: passed === results.length ? 'clean' : 'red', cases: results.length, passed, results };
}

// ---------- CLI ----------
function main() {
  const argv = process.argv.slice(2);
  const flags = new Map();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { const n = argv[i + 1]; if (n && !n.startsWith('--')) { flags.set(argv[i].slice(2), n); i++; } else flags.set(argv[i].slice(2), true); }
  }
  const opt = (n) => (flags.get(n) === true ? null : flags.get(n) || null);
  const json = flags.has('json');
  if (flags.has('selftest')) {
    const scratch = opt('scratch');
    if (!scratch || !path.isAbsolute(scratch)) { console.log(JSON.stringify({ error: 'usage', detail: '--selftest requires absolute --scratch' })); process.exitCode = 2; return; }
    const out = selftest(scratch);
    if (json) console.log(JSON.stringify(out, null, 1));
    else {
      for (const r of out.results.filter((x) => !x.ok)) console.log('FAIL ' + r.id + ' ' + JSON.stringify(r.findings).slice(0, 300));
      console.log('TABI_R64_PROVENANCE_SELFTEST verdict=' + out.verdict + ' cases=' + out.cases + ' passed=' + out.passed);
    }
    process.exitCode = out.verdict === 'clean' ? 0 : 1;
    return;
  }
  const dir = opt('dir');
  if (!dir || !fs.existsSync(dir)) { console.log(JSON.stringify({ error: 'usage', detail: '--dir <controls dir> required and must exist' })); process.exitCode = 2; return; }
  const repo = path.resolve(opt('repo') || process.cwd());
  const min = opt('min-receipts') ? Number(opt('min-receipts')) : null;
  const res = evaluate(path.resolve(dir), repo, opt('rev') || 'worktree', flags.has('require-committed'), min);
  if (json) console.log(JSON.stringify(res, null, 1));
  else console.log('TABI_R64_PROVENANCE checked=' + res.checked + ' matrices=' + res.matrices + ' failures=' + res.failures + (res.failures ? ' byCheck=' + JSON.stringify(res.byCheck) : ''));
  process.exitCode = res.ok ? 0 : 1;
}
main();
