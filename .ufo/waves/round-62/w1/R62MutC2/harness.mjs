// R62MutC2 mutation-matrix harness — runs the frozen r62 counter CLI on
// pristine + declared mutants M1..M5 against its own synthetic/forgeries.
// Writes: mutants/*.mjs, receipts/*.json, shots/*.png, harness-out.json, kills.json
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const S = '/fast/scratch/hyaku/tabi-r62/R62MutC2';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FROZEN = LANE + '/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const j = p => path.join(S, p);

const controlText = fs.readFileSync(j('control.mjs'), 'utf8');
const controlSha = sha(controlText);

// ---- 1. mutants: one semantic defect each, occurrence asserted === 1 ----
const MUT = {
  M1: { name: 'M1-drop-right-button-check', probe: 'f1', expectSelftestCase: 'f1',
    desc: 'drop the right-button check that refuses f1 (first pointerdown button 2->0)',
    old: "    check(d?.button===2 && d?.buttons===2 && u?.button===2 && u?.buttons===0, 'pointer-buttons-'+i);\n", rep: '' },
  M2: { name: 'M2-drop-pointer-identity', probe: 'f6', expectSelftestCase: 'f6',
    desc: 'drop the pointer-identity check that refuses f6 (second pointerdown pointerId changed)',
    old: "  check(b.length === 5 && b.every(e => e.pointerType === 'mouse' && Number.isInteger(e.pointerId) && e.pointerId > 0 && e.pointerId === b[0].pointerId), 'pointer-identity');\n", rep: '' },
  M3: { name: 'M3-drop-menu-cancellation', probe: 'f7', expectSelftestCase: 'f7',
    desc: 'drop the menu-cancelation check that refuses f7 (second contextmenu defaultPrevented false)',
    old: "    check(menu?.defaultPrevented===true && md?.defaultPrevented===false && mu?.defaultPrevented===false, 'menu-cancelation-'+i);\n", rep: '' },
  M4: { name: 'M4-drop-closure', probe: 'f8', expectSelftestCase: 'f8',
    desc: 'drop the closure/survivors check that refuses f8 (nonempty teardown survivors)',
    old: "  check(r?.teardown?.postKillSweepCount===0 && Array.isArray(r.teardown.survivors) && r.teardown.survivors.length===0, 'survivors');\n", rep: '' },
  M5: { name: 'M5-predicate-AND-to-OR', probe: 'm5-predicate-false', expectSelftestCase: null,
    desc: 'predicate AND->OR: producer-verdict passes on buttonHypothesis alone (declared detector: negative selftests)',
    old: "r?.predicate===true && r.buttonHypothesis==='CONFIRMED'",
    rep: "r?.predicate===true || r.buttonHypothesis==='CONFIRMED'" },
};

const mutants = {};
for (const [id, m] of Object.entries(MUT)) {
  const n = controlText.split(m.old).length - 1;
  if (n !== 1) throw new Error(`${id}: target occurs ${n} times, expected exactly 1`);
  const text = controlText.replace(m.old, m.rep);
  const file = j(`mutants/${id}.mjs`);
  fs.writeFileSync(file, text);
  const a = controlText.split('\n'), b = text.split('\n');
  const changed = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) changed.push({ line: i + 1, before: a[i] ?? null, after: b[i] ?? null });
  mutants[id] = { ...m, file, sha256: sha(fs.readFileSync(file)), bytes: Buffer.byteLength(text), changedLines: changed };
}

// ---- 2. fixture stubs: driver stub (never executed), template sha, PNG stubs ----
const driverSrc = [
  '#!/usr/bin/env node',
  '// R62MutC2 scratch fixture stub - NEVER executed as a browser driver.',
  '// Receipt mode of the counter only readFileSync+regex-extracts the BUTTON_HTML',
  '// template and pins its sha256; this stub exists so that path is exercised.',
  'const BUTTON_HTML = `<button id="b" data-nonce="${nonce}"></button>`;',
  '/*FIXTURE-END*/',
].join('\n') + '\n';
fs.writeFileSync(j('driver-stub.mjs'), driverSrc);
const driverSha = sha(driverSrc);
const tpl = /const BUTTON_HTML = `([\s\S]*?)`;\n\/\*FIXTURE-END\*\//.exec(driverSrc);
if (!tpl) throw new Error('fixture template absent in driver stub');
const NONCE = 'tabi-r62-test';
const fixtureSha = sha(tpl[1].replace('${nonce}', NONCE));

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG magic
  Buffer.from([0, 0, 0, 13]), Buffer.from('IHDR'),
  Buffer.from([0, 0, 0, 4]), Buffer.from([0, 0, 0, 2]), // width=4, height=2 (offsets 16/20)
  Buffer.from([8, 6, 0, 0, 0]),
]);
const pngSha = sha(png);
for (const n of ['a-right-press', 'b-contextmenu', 'c-second-press']) fs.writeFileSync(j(`shots/${n}.png`), png);

// ---- 3. receipts from the counter's own synthetic()/forgeries ----
const { forgeries } = await import(pathToFileURL(j('control.mjs')));
const syntheticSource = controlText.slice(controlText.indexOf('function synthetic() {'), controlText.indexOf('\nconst ext='));
const synthetic = new Function(syntheticSource + '\nreturn synthetic;')();
function bake(r) {
  r.driverSha256 = driverSha;
  r.fixture.sha256 = fixtureSha;
  r.steps = ['a-right-press', 'b-contextmenu', 'c-second-press'].map(n => ({ name: n, png: n + '.png', sha256: pngSha, bytes: png.length }));
  return r;
}
const receipts = { valid: bake(synthetic()) };
for (const [id, fn] of Object.entries(forgeries)) receipts[id] = bake((r => (fn(r), r))(synthetic()));
// negative-selftest-shaped receipts (mirror the counter's own 7 negative cases) + M5 producer-lying probes
const negativeMutations = {
  'neg-nonce': r => { r.nonceOnPage = 'wrong'; },
  'neg-driver': r => { r.driverSha256 = 'd'.repeat(64); },
  'neg-sequence': r => { r.mouselog[1].seq = 30; },
  'neg-menubuttons': r => { r.mouselog[1].buttons = 0; },
  'neg-secondtarget': r => { r.btnlog[3].targetId = 'target'; },
  'neg-click': r => { r.clicklog = [{}]; },
  'neg-ports': r => { r.teardown.postKillCurl.devtools = 0; },
  'm5-predicate-false': r => { r.predicate = false; },
  'm5-hypothesis-wrong': r => { r.buttonHypothesis = 'TENTATIVE'; },
};
for (const [name, mutate] of Object.entries(negativeMutations)) {
  const r = bake(synthetic()); mutate(r); receipts[name] = r;
}
for (const [name, r] of Object.entries(receipts)) fs.writeFileSync(j(`receipts/${name}.json`), JSON.stringify(r, null, 1) + '\n');

// ---- 4. run matrix (all runs cwd = scratch; absolute paths; --json mirrors live argv) ----
const runs = [];
function run(id, counter, args) {
  const argv = ['node', counter, ...args];
  const t0 = process.hrtime.bigint();
  const p = spawnSync(argv[0], argv.slice(1), { cwd: S, encoding: 'utf8' });
  runs.push({
    id, counter: path.basename(counter), receipt: args[0] && !args[0].startsWith('--') ? path.basename(args[0]) : null,
    argv, exit: p.status, signal: p.signal,
    stdout: p.stdout ?? '', stderr: p.stderr ?? '',
    stdoutSha256: sha(Buffer.from(p.stdout ?? '')), stderrSha256: sha(Buffer.from(p.stderr ?? '')),
    ms: Number(process.hrtime.bigint() - t0) / 1e6,
  });
  return runs[runs.length - 1];
}
const RE = name => j(`receipts/${name}.json`);
const LIVE = r => [RE(r), '--driver', j('driver-stub.mjs'), '--expect-driver-sha256', driverSha, '--shot', j('shots'), '--json'];

run('control-selftest', j('control.mjs'), ['--selftest']);
run('control-driver-pin-mismatch', j('control.mjs'), [RE('valid'), '--driver', j('driver-stub.mjs'), '--expect-driver-sha256', 'f'.repeat(64), '--shot', j('shots'), '--json']);
run('control-no-args', j('control.mjs'), []);
for (const r of Object.keys(receipts)) run('control-' + r, j('control.mjs'), LIVE(r));

const byMutant = {};
for (const [id] of Object.entries(mutants)) {
  const C = j(`mutants/${id}.mjs`);
  const selftest = run(`${id}-selftest`, C, ['--selftest']);
  const probe = {};
  for (const r of ['valid', ...Object.keys(forgeries), 'neg-nonce', 'neg-ports', 'm5-predicate-false', 'm5-hypothesis-wrong']) probe[r] = run(`${id}-${r}`, C, LIVE(r));
  let st = null;
  try { st = JSON.parse(selftest.stdout); } catch {}
  const failing = st ? st.results.filter(e => !e.ok).map(e => e.name) : null;
  const expectedCase = mutants[id].expectSelftestCase;
  const probeName = mutants[id].probe;
  const verdict = {
    selftestExit: selftest.exit, selftestAllPass: st ? st.allPass : null, selftestCases: st ? st.cases : null,
    selftestFailingCases: failing,
    matchedProbe: probeName, matchedProbeControlExit: runs.find(x => x.id === 'control-' + probeName)?.exit ?? null,
    matchedProbeMutantExit: probe[probeName].exit,
    validReceiptExit: probe.valid.exit,
    blind: runs.find(x => x.id === 'control-' + probeName).exit === 1 && probe[probeName].exit === 0,
    killedBySelftest: selftest.exit === 1 && (expectedCase ? failing?.includes(expectedCase) : failing?.length > 0),
  };
  byMutant[id] = verdict;
  // verdict text
  if (id === 'M5') {
    verdict.verdict = verdict.blind
      ? (verdict.killedBySelftest ? 'IMPOSSIBLE' : 'SURVIVED-declared-detector (negative selftests still 16/16); semantic blind spot proven by out-of-battery producer-lying receipt (control exit 1 -> mutant exit 0)')
      : 'KILLED';
  } else {
    verdict.verdict = verdict.blind && verdict.killedBySelftest ? 'KILLED (semantic: matched forgery greens under mutant, refused by control; selftest case fails)' : 'REVIEW';
  }
}
// Restore exact pristine bytes at each tested path, then repeat the same detector.
fs.mkdirSync(j('mutant-snapshots'), {recursive:true});
const restoration = {};
for (const [id, m] of Object.entries(mutants)) {
  fs.copyFileSync(m.file, j(`mutant-snapshots/${id}.mjs`));
  fs.writeFileSync(m.file, controlText);
  const st = run(`${id}-restored-selftest`, m.file, ['--selftest']);
  const probe = run(`${id}-restored-${m.probe}`, m.file, LIVE(m.probe));
  restoration[id] = {sha256:sha(fs.readFileSync(m.file)), selftestExit:st.exit, probeExit:probe.exit};
}
fs.writeFileSync(j('restoration.json'), JSON.stringify(restoration,null,1)+'\n');

// ---- 5. emit ----
const out = {
  seat: 'R62MutC2', scratch: S, node: process.version, generatedAt: new Date().toISOString(),
  frozenLaneCounter: { path: FROZEN, sha256: sha(fs.readFileSync(FROZEN)) },
  control: { path: j('control.mjs'), sha256: controlSha, bytes: Buffer.byteLength(controlText) },
  driverStub: { path: j('driver-stub.mjs'), sha256: driverSha },
  fixtureSha256: fixtureSha, pngStub: { sha256: pngSha, bytes: png.length },
  receipts: Object.fromEntries(Object.entries(receipts).map(([k, r]) => [k, sha(fs.readFileSync(j(`receipts/${k}.json`)))])),
  mutants, runs, byMutant,
};
fs.writeFileSync(j('harness-out.json'), JSON.stringify(out, null, 1) + '\n');

const kills = {
  seat: 'R62MutC2', round: 62, wave: 'w1', claim: 'C2',
  instrument: { path: '.ufo/waves/round-62/counters/chromium-receipt-r62.mjs', sha256Original: controlSha, sha256FinalFrozen: out.frozenLaneCounter.sha256 },
  baseline: { selftestExit: runs[0].exit, selftest: JSON.parse(runs[0].stdout) },
  mutantDefinitions: Object.fromEntries(Object.entries(mutants).map(([id, m]) => [id, { name: m.name, desc: m.desc, probe: m.probe, expectedSelftestCase: m.expectSelftestCase, secondary: !!m.secondary, sha256: m.sha256, bytes: m.bytes, transformation: m.changedLines }])),
  verdicts: byMutant,
  runsIndex: Object.fromEntries(runs.map(r => [r.id, { exit: r.exit, argv: r.argv, stdoutSha256: r.stdoutSha256, stderrSha256: r.stderrSha256 }])),
};
fs.writeFileSync(j('kills.json'), JSON.stringify(kills, null, 1) + '\n');

// ---- 6. console summary ----
console.log('control selftest:', runs[0].exit, JSON.parse(runs[0].stdout).allPass ? '16/16 allPass' : 'FAIL');
console.log('control valid:', runs.find(r => r.id === 'control-valid').exit, '| f1..f8:', Object.keys(forgeries).map(f => runs.find(r => r.id === 'control-' + f).exit).join(','), '| neg-nonce:', runs.find(r => r.id === 'control-neg-nonce').exit, '| neg-ports:', runs.find(r => r.id === 'control-neg-ports').exit);
for (const [id, v] of Object.entries(byMutant)) {
  console.log(`${id}: selftest=${v.selftestExit} failing=[${(v.selftestFailingCases || []).join(',')}] matched(${v.matchedProbe}) ctrl=${v.matchedProbeControlExit} mut=${v.matchedProbeMutantExit} valid=${v.validReceiptExit} -> ${v.verdict}`);
}
