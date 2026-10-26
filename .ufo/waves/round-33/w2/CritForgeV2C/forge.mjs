#!/usr/bin/env node
// CritForgeV2C: attack v2's s1 source-row rule (round 33, at 042d6d9a).
// Runs the lane gate from a scratch clone; every variant commits into the clone only.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const CLONE = '/fast/scratch/hyaku/tabi-r33/CritForgeV2C/clone';
const REV = '042d6d9abf97d567d495652a85eabc851b81adc1';
const BASE = 'd805d1d6132430118b206a848b85753ab35d1014'; // measure.sh's baseline
const ROUND_BASE = 'b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd'; // round-33 baseline
const ENTRY = 'corpus/knowledge/webdriver-bidi-runtime-round-32.md';
const REG = 'corpus/SOURCES.md';
const HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const ENVP = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: '/fast/scratch/hyaku/tabi-r33/CritForgeV2C/tmp', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' };

const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'buffer', env: ENVP, maxBuffer: 256 * 1024 * 1024, ...opts });
const git = (args) => {
  const r = run('git', ['-C', CLONE, '-c', 'user.name=CritForgeV2C', '-c', 'user.email=CritForgeV2C@scratch.local', '-c', 'commit.gpgsign=false', ...args]);
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr.toString()}`);
  return r.stdout.toString().trim();
};
const reset = () => { git(['checkout', '-q', '--force', '--detach', REV]); git(['clean', '-q', '-fdx']); };
const commit = (msg) => { git(['add', '-A']); git(['commit', '-q', '--allow-empty', '--no-verify', '-m', msg]); return git(['rev-parse', 'HEAD']); };
const put = (rel, text) => { const abs = join(CLONE, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, text); };
const get = (rel) => readFileSync(join(CLONE, rel), 'utf8');
const append = (rel, text) => put(rel, (existsSync(join(CLONE, rel)) ? get(rel) : '').replace(/\n*$/, '\n') + text);

const regRow = (url) => `| S990 | junk provenance — ${url} | spec | A | s | a | t | mined | 2026-10-26 | 90d | ${ENTRY} |\n`;
const gateTable = (url, opts = {}) => {
  const row = `| S990 | ${url} | 2026-10-26T00:00:00Z (HTTP 200, 1 B, sha256 \`${HEX}\`) | "made-up quote, never fetched" |\n`;
  if (opts.noTable) return `\n## Gate\n\n${row}`;
  const table = `| row | URL | accessed | receipt quote |\n|---|---|---|---|\n${row}`;
  return opts.fenced ? `\n## Gate\n\n\`\`\`\n${table}\`\`\`\n` : `\n## Gate\n\n${table}`;
};
const setSource = (line) => put(ENTRY, get(ENTRY).replace(/^source:.*$/m, line));

const VARIANTS = [
  { id: 'V0-honest-at-BASE', baseline: BASE, apply: () => {} },
  {
    id: 'V1-frozen-F8-junk-row-no-gate',
    baseline: BASE,
    apply: () => { append(REG, regRow('https://e.test/')); setSource('source: S990 — junk'); },
  },
  {
    id: 'V2-junk-row+forged-Gate-row-round-33',
    baseline: BASE,
    apply: () => {
      const u = 'https://chromium.googlesource.com/chromium/src/+/main/docs/junk-never-fetched.md';
      append(REG, regRow(u)); setSource('source: S990 — junk'); append('corpus/lessons/round-33.md', gateTable(u));
    },
  },
  {
    id: 'V3-forged-Gate-row-older-lesson-round-20',
    baseline: BASE,
    apply: () => {
      const u = 'https://chromium.googlesource.com/chromium/src/+/main/docs/junk-never-fetched.md';
      append(REG, regRow(u)); setSource('source: S990 — junk'); append('corpus/lessons/round-20.md', gateTable(u));
    },
  },
  {
    id: 'V4-forged-Gate-row-arbitrary-round-zzz.md',
    baseline: BASE,
    apply: () => {
      const u = 'https://chromium.googlesource.com/chromium/src/+/main/docs/junk-never-fetched.md';
      append(REG, regRow(u)); setSource('source: S990 — junk'); put('corpus/lessons/round-zzz.md', '# fabricated lesson\n' + gateTable(u));
    },
  },
  {
    id: 'V5-forged-Gate-row-verifier-spotcheck-file',
    baseline: BASE,
    apply: () => {
      const u = 'https://chromium.googlesource.com/chromium/src/+/main/docs/junk-never-fetched.md';
      append(REG, regRow(u)); setSource('source: S990 — junk'); append('corpus/lessons/round-32-verifier-spotcheck.md', gateTable(u));
    },
  },
  {
    id: 'V6-Gate-row-outside-any-table',
    baseline: BASE,
    apply: () => {
      const u = 'https://chromium.googlesource.com/chromium/src/+/main/docs/junk-never-fetched.md';
      append(REG, regRow(u)); setSource('source: S990 — junk'); append('corpus/lessons/round-33.md', gateTable(u, { noTable: true }));
    },
  },
  {
    id: 'V7-Gate-row-inside-fenced-code-block',
    baseline: BASE,
    apply: () => {
      const u = 'https://chromium.googlesource.com/chromium/src/+/main/docs/junk-never-fetched.md';
      append(REG, regRow(u)); setSource('source: S990 — junk'); append('corpus/lessons/round-33.md', gateTable(u, { fenced: true }));
    },
  },
  {
    id: 'V8-Gate-URL-different-port-same-host',
    baseline: BASE,
    apply: () => {
      append(REG, regRow('https://chromium.googlesource.com/chromium/src/+/main/docs/junk.md'));
      setSource('source: S990 — junk'); append('corpus/lessons/round-33.md', gateTable('https://chromium.googlesource.com:8443/anything/else.md'));
    },
  },
  {
    id: 'V9-Gate-URL-http-scheme-only',
    baseline: BASE,
    apply: () => {
      append(REG, regRow('https://chromium.googlesource.com/chromium/src/+/main/docs/junk.md'));
      setSource('source: S990 — junk'); append('corpus/lessons/round-33.md', gateTable('http://chromium.googlesource.com/x.md'));
    },
  },
  {
    id: 'V10-Gate-URL-lookalike-host',
    baseline: BASE,
    apply: () => {
      append(REG, regRow('https://chromium.googlesource.com/chromium/src/+/main/docs/junk.md'));
      setSource('source: S990 — junk'); append('corpus/lessons/round-33.md', gateTable('https://chromium.googlesource.com.evil.example/x.md'));
    },
  },
  {
    id: 'V11-Gate-URL-path-mismatch-same-host',
    baseline: BASE,
    apply: () => {
      append(REG, regRow('https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/util.cc'));
      setSource('source: S990 — junk'); append('corpus/lessons/round-33.md', gateTable('https://chromium.googlesource.com/totally/different/page.md'));
    },
  },
  {
    id: 'V12-junk-row-smuggled-beside-honest-cite-no-gate',
    baseline: BASE,
    apply: () => {
      append(REG, regRow('https://chromium.googlesource.com/chromium/src/+/main/docs/junk.md'));
      put(ENTRY, get(ENTRY).replace(/^source:.*$/m, (m) => m + ' S990'));
    },
  },
  {
    id: 'V14-negative-registry-host-differs-from-Gate-host',
    baseline: BASE,
    apply: () => {
      append(REG, regRow('https://e.test/'));
      setSource('source: S990 — junk'); append('corpus/lessons/round-33.md', gateTable('https://chromium.googlesource.com/chromium/src/+/main/docs/junk.md'));
    },
  },
  { id: 'V13-honest-at-ROUND-BASE-b7d16fb8', baseline: ROUND_BASE, apply: () => {} },
];

const results = [];
for (const v of VARIANTS) {
  reset();
  v.apply();
  const target = commit(`forge ${v.id}`);
  const r = run('node', [process.env.GATE_OVERRIDE || join(CLONE, 'scripts/check-bidi-runtime.mjs'), '--repo', CLONE, '--rev', target, '--baseline', v.baseline, '--entry', ENTRY, '--json'], { cwd: CLONE });
  let out = null;
  try { out = JSON.parse(r.stdout.toString('utf8')); } catch { out = null; }
  const rec = {
    variant: v.id, baseline: v.baseline.slice(0, 7), rev: target.slice(0, 7), exit: r.status,
    clean: out ? out.clean : null, entryFinding: out ? out.entryFinding : null,
    entryDetail: out ? (out.entryDetail || '').slice(0, 300) : null,
    admitted: out ? out.admitted : null, population: out ? out.population : null,
    failing: out ? out.failing : null, unmeasured: out ? out.unmeasured : null,
    provenance: out ? out.provenance : null,
    stderr: r.stderr.toString('utf8').slice(0, 300),
  };
  results.push(rec);
  writeFileSync(`/fast/scratch/hyaku/tabi-r33/CritForgeV2C/out/${process.env.OUT_PREFIX || 'gate'}-${v.id}.json`, JSON.stringify(out, null, 1) + '\n');
  const d = run('git', ['-C', CLONE, 'diff', REV, target]);
  writeFileSync(`/fast/scratch/hyaku/tabi-r33/CritForgeV2C/out/${process.env.OUT_PREFIX || 'diff'}-${v.id}.patch`, d.stdout);
  console.log(JSON.stringify(rec));
}
writeFileSync('/fast/scratch/hyaku/tabi-r33/CritForgeV2C/out/s1-forge-results.json', JSON.stringify(results, null, 1) + '\n');
