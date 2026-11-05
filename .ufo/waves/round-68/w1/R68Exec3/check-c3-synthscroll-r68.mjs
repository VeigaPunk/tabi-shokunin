#!/usr/bin/env node
// tabi r68 w1 C3 counter — docs-held synthesizeScrollGesture entry, S173 source binding.
// Docs-only byte check: entry text ↔ contract ↔ staged source bytes. No network, no
// runtime driver, no capability claim: the entry must itself pin the runtime-unmeasured
// qualifier. Exit 0 claim verified, 1 claim refuted (findings listed), 2 no-work
// (artifact makes no source-binding claim of any kind — mere file presence included).
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEAT_DIR = dirname(fileURLToPath(import.meta.url));
const LANE_ROOT = resolve(SEAT_DIR, '..', '..', '..', '..', '..');
const DEFAULT_CONTRACT = join(SEAT_DIR, 'proposed', 'c3-contract-r68.json');
const DEFAULT_ENTRY = join(LANE_ROOT, 'corpus', 'knowledge', 'chromium-scroll-gesture-protocol-round-68.md');
const DEFAULT_SOURCE = join(LANE_ROOT, '.ufo', 'waves', 'round-68', 'sources', 'Input.pdl');
const SCHEMA = 'tabi-r68-c3-docs-held-counter';

const sha256File = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

function parseArgs(argv) {
  const opts = { entry: DEFAULT_ENTRY, source: DEFAULT_SOURCE, contract: DEFAULT_CONTRACT };
  const flags = new Set(['--entry', '--source', '--contract', '--scratch', '--receipt', '--base']);
  const seen = new Set();
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--selftest') { opts.selftest = true; continue; }
    if (!flags.has(flag) || seen.has(flag)) throw new Error(`bad_arguments: ${flag}`);
    seen.add(flag);
    const value = argv[i + 1];
    if (value === undefined) throw new Error(`bad_arguments: ${flag} needs a value`);
    opts[flag.slice(2)] = value;
    i++;
  }
  return opts;
}

// Core check. Returns { verdict, exit, findings, checks }.
function runCheck({ entryPath, sourcePath, contractPath }) {
  const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
  let entry;
  try {
    entry = readFileSync(entryPath, 'utf8');
  } catch {
    return { verdict: 'failed', exit: 1, findings: ['entry-unreadable'], checks: {} };
  }
  // No-work discrimination: an artifact that cites no S-id, no URL and no digest makes no
  // source-binding claim — including "the staged file exists" — so this counter does
  // nothing: it neither certifies nor refutes it (exit 2).
  if (!/\bS\d{3}\b/.test(entry) && !entry.includes('https://') && !/[0-9a-f]{64}/i.test(entry)) {
    return { verdict: 'no-work', exit: 2, findings: [], checks: {} };
  }
  const lines = readFileSync(sourcePath, 'utf8').split('\n');
  const lineAt = (n) => (n >= 1 && n <= lines.length ? lines[n - 1] : null);
  const checks = {};

  checks['source-id'] = new RegExp(`\\b${contract.claim}\\b`).test(entry);
  checks['source-url'] = entry.includes(contract.sourceUrl);
  const sourceDigest = sha256File(sourcePath);
  checks['staged-digest'] = sourceDigest === contract.stagedSha256 && entry.includes(contract.stagedSha256);
  const corr = contract.corroboratingStagedPaths ?? [];
  checks['corroboration'] = corr.every((rel) => {
    try { return sha256File(join(LANE_ROOT, rel)) === contract.stagedSha256; } catch { return false; }
  });
  checks['anchor-range'] = entry.includes(contract.anchorText);
  checks['quote'] = contract.quotes.every((q) => {
    const at = lineAt(q.line);
    return at !== null && at.includes(q.text) && entry.includes(q.text);
  });
  checks['fact'] = contract.facts.every((f) => {
    const at = lineAt(f.line);
    return at !== null && at.includes(f.text) && entry.includes(f.token);
  });
  const required = (contract.qualifierRequired ?? []).every((p) => entry.includes(p));
  const forbidden = (contract.qualifierForbidden ?? []).some((p) => entry.includes(p));
  checks['qualifier'] = required && !forbidden;

  const findings = Object.keys(checks).filter((id) => !checks[id]);
  return { verdict: findings.length ? 'failed' : 'clean', exit: findings.length ? 1 : 0, findings, checks };
}

function writeReceipt(path, { base, exit, stdout, stderr, extraInputs = [], opts }) {
  const inputs = [opts.entry, opts.source, opts.contract, ...extraInputs]
    .map((p) => ({ path: p, sha256: sha256File(p) }));
  writeFileSync(path, JSON.stringify({
    argv: process.argv,
    cwd: process.cwd(),
    timestamp: new Date().toISOString(),
    base: base ?? null,
    exit,
    stdout,
    stderr,
    producer: [{ path: fileURLToPath(import.meta.url), sha256: sha256File(fileURLToPath(import.meta.url)) }],
    inputs,
  }, null, 1) + '\n');
}

function selftest(opts) {
  if (!opts.scratch) throw new Error('--scratch is required for --selftest');
  mkdirSync(opts.scratch, { recursive: true });
  const real = readFileSync(opts.entry, 'utf8');
  const fixtures = {
    green: { text: real, expect: 0, verdict: 'clean', tokens: [] },
    'presence-only': { text: '# Scroll gesture — presence only\n\nStaged file .ufo/waves/round-68/sources/Input.pdl exists.\n', expect: 2, verdict: 'no-work', tokens: [] },
    empty: { text: '', expect: 2, verdict: 'no-work', tokens: [] },
    'wrong-url': { text: real.replaceAll('155.0.8059.84', '155.0.8059.83'), expect: 1, verdict: 'failed', tokens: ['source-url'] },
    'wrong-anchor': { text: real.replaceAll(/lines 286.315/gu, 'lines 276-305'), expect: 1, verdict: 'failed', tokens: ['anchor-range'] },
    'quote-forgery': { text: real.replaceAll(/issuing appropriate touch events/g, 'emitting appropriate touch events'), expect: 1, verdict: 'failed', tokens: ['quote'] },
    'stale-digest': { text: real.replace('5bbc6e23', '5bbc6e24'), expect: 1, verdict: 'failed', tokens: ['staged-digest'] },
    'claim-drift': { text: real.replaceAll('S173', 'S999'), expect: 1, verdict: 'failed', tokens: ['source-id'] },
    'runtime-drift': { text: real + '\nRuntime delivery measured on this build.\n', expect: 1, verdict: 'failed', tokens: ['qualifier'] },
  };
  const results = [];
  for (const [name, fx] of Object.entries(fixtures)) {
    const path = join(opts.scratch, `${name}.md`);
    if (fx.text !== null) writeFileSync(path, fx.text);
    const observed = runCheck({ entryPath: path, sourcePath: opts.source, contractPath: opts.contract });
    const tokensOk = (fx.tokens ?? []).every((t) => observed.findings.includes(t));
    const mutated = fx.expect === 0 || fx.text !== real; // failure cases must actually change the text
    results.push({
      name,
      expected: fx.expect,
      observed: observed.exit,
      verdict: observed.verdict,
      expectedVerdict: fx.verdict,
      findings: observed.findings,
      requiredTokens: fx.tokens,
      mutated,
      pass: mutated && observed.exit === fx.expect && observed.verdict === fx.verdict && tokensOk,
    });
  }
  const failed = results.filter((r) => !r.pass).length;
  return {
    schema: SCHEMA,
    verdict: failed ? 'failed' : 'clean',
    cases: results.length,
    failed,
    results,
  };
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(String(error.message ?? error));
    process.exitCode = 2;
    return;
  }
  let result;
  let extraInputs = [];
  if (opts.selftest) {
    result = selftest(opts);
    extraInputs = result.results.map((r) => join(opts.scratch, `${r.name}.md`));
  } else {
    const observed = runCheck({ entryPath: opts.entry, sourcePath: opts.source, contractPath: opts.contract });
    result = {
      schema: SCHEMA,
      claim: JSON.parse(readFileSync(opts.contract, 'utf8')).claim,
      verdict: observed.verdict,
      findingCount: observed.findings.length,
      findings: observed.findings,
      checks: observed.checks,
      entry: { path: opts.entry, sha256: sha256File(opts.entry) },
      source: { path: opts.source, sha256: sha256File(opts.source) },
      contract: { path: opts.contract, sha256: sha256File(opts.contract) },
    };
  }
  const stdout = JSON.stringify(result);
  console.log(stdout);
  if (opts.receipt) writeReceipt(opts.receipt, { base: opts.base, exit: result.verdict === 'clean' ? 0 : result.verdict === 'no-work' ? 2 : 1, stdout, stderr: '', extraInputs, opts });
  process.exitCode = result.verdict === 'clean' ? 0 : result.verdict === 'no-work' ? 2 : 1;
}

main();
