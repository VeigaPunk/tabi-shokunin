// MutGateBeyond harness — round 34 w2. New single-point mutants of rule lines of
// scripts/check-bidi-runtime.mjs at 04f9623dde8ad35d470cecf766e421eafbcb47fa that the
// frozen round-33 w2 MutGateV2 set of 20 does not touch.
// Detector: the gate's own --selftest (frozen kill rule: exit 3 AND >= 1 `CASE ... FAIL`
// line; a crash or any other exit is NOT a kill). Each mutant is parse-checked with
// `node --check` first; a SyntaxError is recorded as invalid, never as a kill.
// Clone is reset to the integration commit and byte-verified before and after every mutant.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const S = '/fast/scratch/hyaku/tabi-r34/MutGateBeyond';
const CLONE = join(S, 'clone');
const GATE = 'scripts/check-bidi-runtime.mjs';
const GATE_ABS = join(CLONE, GATE);
const BASE_REV = '04f9623dde8ad35d470cecf766e421eafbcb47fa';
const PRISTINE_SHA = '370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87';
const TMP = join(S, 'tmp');
const OUT = join(S, 'out');
const JSONL = join(OUT, 'mutants.jsonl');
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: TMP, GIT_CONFIG_NOSYSTEM: '1', LC_ALL: 'C' };

// expect = this seat's pre-run prediction (calibration only; the recorded verdict is the measured one).
const MUTANTS = [
  // ---- receipt-leg rules (evaluate) ----
  { id: 'B01', area: 'receipt schema check dropped', expect: 'survived',
    find: `if (receiptObj.schema !== RECEIPT_SCHEMA) receiptFinding = "receipt schema";`,
    replace: `if (false) receiptFinding = "receipt schema";` },
  { id: 'B02', area: 'receipt fixtureSha256 check dropped', expect: 'killed (fixture-sha-differs)',
    find: `else if (receiptObj.fixtureSha256 !== FIXTURE_SHA256) receiptFinding = "fixtureSha256 is not FIXTURE's";`,
    replace: `else if (false) receiptFinding = "fixtureSha256 is not FIXTURE's";` },
  { id: 'B03', area: 'receipt browserVersion presence dropped', expect: 'survived',
    find: `else if (typeof receiptObj.browserVersion !== "string" || !receiptObj.browserVersion) receiptFinding = "no browserVersion";`,
    replace: `else if (false) receiptFinding = "no browserVersion";` },
  { id: 'B04', area: 'driver-path-is-gate check dropped', expect: 'survived (byte-copy rule covers)',
    find: `else if (receiptObj.driver === GATE_PATH) receiptFinding = "driver is this gate's own path";`,
    replace: `else if (false) receiptFinding = "driver is this gate's own path";` },
  { id: 'B05', area: 'driver sha256 check dropped', expect: 'killed (v2-m11-driver-sha-differs)',
    find: `else if (sha256(drv) !== receiptObj.driverSha256) receiptFinding = \`driver sha256 differs: ${'$'}{receiptObj.driver}\`;`,
    replace: `else if (false) receiptFinding = "driver sha256 differs";` },
  { id: 'B06', area: 'runs>=2 weakened to >=1', expect: 'killed (one-run-only)',
    find: `receiptObj.runs.length < 2) receiptFinding = "fewer than two runs";`,
    replace: `receiptObj.runs.length < 1) receiptFinding = "fewer than two runs";` },
  { id: 'B07', area: 'per-transcript sha256 check dropped', expect: 'killed (transcript-tampered)',
    find: `if (sha256(tb) !== run.transcriptSha256)`,
    replace: `if (false)` },
  { id: 'B08', area: 'binding first-screenshot rule dropped', expect: 'killed (run-screenshots-differ)',
    find: `if (shots.some((s) => !s) || new Set(shots).size !== 1) bindingFinding = "first screenshots absent or differ between runs";`,
    replace: `if (false) bindingFinding = "first screenshots absent or differ between runs";` },
  { id: 'B09', area: 'binding chromedriverVersion rule dropped', expect: 'killed (v2-m04-runs-chromedriver-differ)',
    find: `else if (runs.some((r) => !cdv(r.rec)) || new Set(runs.map((r) => cdv(r.rec))).size !== 1) bindingFinding = "chromedriverVersion absent or differs between runs";`,
    replace: `else if (false) bindingFinding = "chromedriverVersion absent or differs between runs";` },
  { id: 'B10', area: 'live screenshot binding dropped', expect: 'killed (live-screenshot-differs)',
    find: `if (firstShot(liveRec) !== shots[0]) bindingFinding = "first screenshot differs from this counter's live session";`,
    replace: `if (false) bindingFinding = "first screenshot differs from this counter's live session";` },
  { id: 'B11', area: 'live chromedriverVersion binding dropped', expect: 'killed (live-chromedriver-differs)',
    find: `else if (cdv(liveRec) !== cdv(runs[0].rec)) bindingFinding = "chromedriverVersion differs from this counter's live session";`,
    replace: `else if (false) bindingFinding = "chromedriverVersion differs from this counter's live session";` },
  { id: 'B12', area: 'WS_SESSION session-id segment shape weakened 32->8 hex', expect: 'killed (golden refused)',
    find: `const WS_SESSION = /^ws:\\/\\/[^/]+\\/session\\/([0-9a-f]{32})$/;`,
    replace: `const WS_SESSION = /^ws:\\/\\/[^/]+\\/session\\/([0-9a-f]{8})$/;` },
  { id: 'B13', area: 'WS_LOOPBACK host requirement weakened', expect: 'killed (v2-m17-ws-url-off-loopback)',
    find: `const WS_LOOPBACK = /^ws:\\/\\/(127\\.0\\.0\\.1|localhost):\\d+\\/session\\//;`,
    replace: `const WS_LOOPBACK = /^ws:\\/\\//;` },
  // ---- verdict arithmetic ----
  { id: 'B14', area: 'failing arithmetic zeroed', expect: 'killed (v2-f7 exit flips to 0)',
    find: `out.failing = out.rows.filter((r) => r.reason !== null).length;`,
    replace: `out.failing = 0;` },
  { id: 'B15', area: 'admitted arithmetic counts all rows', expect: 'killed (v2-f7 admitted 16 != 15)',
    find: `out.admitted = out.rows.filter((r) => r.admitted).length;`,
    replace: `out.admitted = out.rows.length;` },
  { id: 'B16', area: 'population counts table rows, not non-empty Measured cells', expect: 'survived (no empty-cell case)',
    find: `out.population = tableRows.filter((r) => String(r.cells[3] == null ? "" : r.cells[3]).trim() !== "").length;`,
    replace: `out.population = tableRows.length;` },
  { id: 'B17', area: 'unmeasured arithmetic zeroed', expect: 'survived (selftest never asserts unmeasured)',
    find: `out.unmeasured = out.rows.filter((r) => r.reason === null && r.verdict === "no").length;`,
    replace: `out.unmeasured = 0;` },
  // ---- row predicates (t2-run rules) ----
  { id: 'B18', area: 'R1 own ws-loopback row check dropped', expect: 'survived (shadowed by sessionOf)',
    find: `if (!WS_LOOPBACK.test(String(caps.webSocketUrl || ""))) return "webSocketUrl not a loopback ws url";`,
    replace: `if (false) return "webSocketUrl not a loopback ws url";` },
  { id: 'B19', area: 'R3 browsingContext.load conjunct dropped', expect: 'survived (no case drops the load event)',
    find: `if (!rec.events.some((e) => e.method === "browsingContext.load" && e.params.url === url)) return "no browsingContext.load for /a.html";`,
    replace: `if (false) return "no browsingContext.load for /a.html";` },
  { id: 'B20', area: 'R16 predicate disabled', expect: 'survived (x2 precedes it; no rows reach it)',
    find: `R16: () => "no-bidi-counterpart",`,
    replace: `R16: () => null,` },
  { id: 'B21', area: 'R5 locateNodes localName h1->h2', expect: 'killed (golden-two-runs)',
    find: `res(c).nodes[0].value.localName === "h1"`,
    replace: `res(c).nodes[0].value.localName === "h2"` },
  { id: 'B22', area: 'R7 innerWidth-after-setViewport ordering dropped', expect: 'survived (no case reorders it)',
    find: `c.i > vp.i`,
    replace: `c.i > -1` },
  { id: 'B23', area: 'R11 fixture-header conjunct dropped (replace empty; harness label said inverted, as-run was a drop)', expect: 'survived (no case alters the fixture header)',
    find: `&& headerValue(e.params.response.headers, FIXTURE_HEADER[0]) === FIXTURE_HEADER[1]`,
    replace: `` },
  { id: 'B24', area: 'R12 getData-after-collector ordering dropped', expect: 'survived (no case reorders it)',
    find: `c.i > col.i`,
    replace: `c.i > -1` },
  { id: 'B25', area: 'R15 cookie value check dropped', expect: 'survived (no case with a wrong cookie value)',
    find: `k.name === "tabi_fixture" && strVal(k.value) === "1"`,
    replace: `k.name === "tabi_fixture"` },
  { id: 'B26', area: 'R17 handleUserPrompt-after-prompt ordering dropped', expect: 'survived (no case reorders it)',
    find: `opened.some((e) => c.i > e.i)`,
    replace: `opened.some((e) => c.i > -1)` },
  // ---- s1 / row-table / entry rules ----
  { id: 'B27', area: 's1 usedBy-names-entry requirement weakened', expect: 'killed (golden-two-runs s1 fires)',
    find: `r.usedBy.split(/[,;]/).map((x) => x.trim()).includes(entry)`,
    replace: `r.usedBy.split(/[,;]/).map((x) => x.trim()).includes("corpus/knowledge/never.md")` },
  { id: 'B28', area: 's1 row-new-at-this-rev conjunct dropped', expect: 'survived (no case cites an old Gate-rowed id)',
    find: `&& !regThen.has(id); });`,
    replace: `&& true; });` },
  { id: 'B29', area: 'parseTable header-match inverted', expect: 'killed (golden-two-runs population 0)',
    find: `if (!cells.every((c, k) => c.toLowerCase() === HEADER[k])) continue;`,
    replace: `if (cells.every((c, k) => c.toLowerCase() === HEADER[k])) continue;` },
  { id: 'B30', area: 'gateRows S-id shape tightened to 4+ digits', expect: 'killed (golden-two-runs s1 fires)',
    find: `if (!/^S\\d{3,}$/.test(id)) continue;`,
    replace: `if (!/^S\\d{4,}$/.test(id)) continue;` },
  { id: 'B31', area: 'entry source-line regex broken', expect: 'killed (golden-two-runs s1 fires)',
    find: `/^source:/i`,
    replace: `/^sourcex:/i` },
];

function git(args) {
  const r = spawnSync('git', ['-C', CLONE, ...args], { encoding: 'buffer', env: ENV, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr.toString('utf8').trim()}`);
  return r.stdout.toString('utf8').trim();
}
function assertToplevel() {
  const t = git(['rev-parse', '--show-toplevel']);
  if (t !== CLONE) throw new Error(`toplevel mismatch: ${t} != ${CLONE}`);
}
function reset() {
  git(['checkout', '-q', '--force', '--detach', BASE_REV]);
  git(['clean', '-qfdx']);
}
const lastLine = (buf) => (buf.toString('utf8').trim().split('\n').pop() || '');
const failingCases = (buf) => buf.toString('utf8').split('\n').filter((l) => l.includes(' FAIL ')).map((l) => (l.match(/CASE id=(\S+)/) || [])[1]).filter(Boolean);
const selftestSummary = (buf) => (buf.toString('utf8').match(/BIDI_RUNTIME_SELFTEST .*/) || [''])[0];
const count = (hay, needle) => { let n = 0, i = 0; while ((i = hay.indexOf(needle, i)) !== -1) { n += 1; i += needle.length; } return n; };

const mode = process.argv[2] || 'check';
const only = process.argv[3] || null;
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

if (mode === 'check') {
  // Parse-check the pristine gate and count occurrences of every find text.
  const pc = spawnSync('node', ['--check', GATE_ABS], { encoding: 'buffer', env: ENV });
  const src = readFileSync(GATE_ABS, 'utf8');
  const rows = MUTANTS.map((m) => ({ id: m.id, occurrences: count(src, m.find) }));
  console.log(JSON.stringify({ pristineParse: pc.status, pristineParseErr: pc.stderr.toString('utf8').slice(0, 400), finds: rows }, null, 1));
} else if (mode === 'baseline') {
  assertToplevel();
  reset();
  const g = readFileSync(GATE_ABS);
  if (sha256(g) !== PRISTINE_SHA) throw new Error('pristine sha mismatch after reset');
  const st = spawnSync('node', [GATE_ABS, '--selftest'], { encoding: 'buffer', env: ENV, cwd: CLONE, timeout: 900000, maxBuffer: 256 * 1024 * 1024 });
  writeFileSync(join(OUT, 'baseline-selftest.txt'), st.stdout.toString('utf8') + st.stderr.toString('utf8'));
  console.log(JSON.stringify({ baseline: true, gateSha256: sha256(g), selftestExit: st.status, summary: selftestSummary(st.stdout) }, null, 1));
} else {
  for (const m of MUTANTS) {
    if (only && m.id !== only) continue;
    assertToplevel();
    reset();
    if (sha256(readFileSync(GATE_ABS)) !== PRISTINE_SHA) throw new Error(`${m.id}: pristine sha mismatch after reset`);
    const src = readFileSync(GATE_ABS, 'utf8');
    const n = count(src, m.find);
    if (n !== 1) { appendFileSync(JSONL, JSON.stringify({ id: m.id, area: m.area, expect: m.expect, applies: false, occurrences: n, verdict: 'unappliable' }) + '\n'); console.error(`${m.id}: find occurs ${n} times, expected 1`); continue; }
    const mutated = src.split(m.find).join(m.replace);
    writeFileSync(GATE_ABS, mutated);
    const mutSha = sha256(Buffer.from(mutated, 'utf8'));
    const pc = spawnSync('node', ['--check', GATE_ABS], { encoding: 'buffer', env: ENV });
    const parseOk = pc.status === 0;
    let st = null;
    if (parseOk) {
      st = spawnSync('node', [GATE_ABS, '--selftest'], { encoding: 'buffer', env: ENV, cwd: CLONE, timeout: 900000, maxBuffer: 256 * 1024 * 1024 });
      writeFileSync(join(OUT, `${m.id}-selftest.txt`), st.stdout.toString('utf8') + st.stderr.toString('utf8'));
    } else {
      writeFileSync(join(OUT, `${m.id}-parse-error.txt`), pc.stderr.toString('utf8'));
    }
    const exit = parseOk ? st.status : null;
    const fails = parseOk ? failingCases(st.stdout) : [];
    const verdict = !parseOk ? 'invalid-syntax (not a kill)'
      : (exit === 3 && fails.length >= 1) ? 'killed'
      : (exit === 0) ? 'survived'
      : `not-killed exit=${exit}`;
    reset();
    const restoredSha = sha256(readFileSync(GATE_ABS));
    appendFileSync(JSONL, JSON.stringify({ id: m.id, area: m.area, expect: m.expect, applies: true, mutGateSha256: mutSha, parseOk, selftestExit: exit, failingCases: fails, summary: parseOk ? selftestSummary(st.stdout) : null, verdict, restored: restoredSha === PRISTINE_SHA, restoredSha }) + '\n');
    console.log(`${m.id} ${verdict} exit=${exit} fails=${fails.join(',') || '-'} parse=${parseOk} restored=${restoredSha === PRISTINE_SHA}`);
  }
  assertToplevel();
  reset();
  const head = git(['rev-parse', 'HEAD']);
  const por = git(['status', '--porcelain']);
  const finalSha = sha256(readFileSync(GATE_ABS));
  console.log(JSON.stringify({ finalHead: head, finalPorcelainLines: por === '' ? 0 : por.split('\n').length, finalGateSha256: finalSha, pristineSha: PRISTINE_SHA, restored: finalSha === PRISTINE_SHA }, null, 1));
}
