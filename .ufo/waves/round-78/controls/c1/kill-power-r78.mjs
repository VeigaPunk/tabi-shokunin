#!/usr/bin/env node
// Kill-power control, tabi round 78 C1 (check-filechooser-r78; structure of the round-76 control).
// Two mutant classes, each a copy of scripts/check-filechooser-r78.mjs with the battery copy
// scripts/negatives-filechooser-r78.mjs AND the pinned driver beside it, run against one real receipt:
//  (1) FORCE-TRUE: for every check id the counter declares (--list-checks), that one check
//      always holds (its `ok` forced true at the check() hook).
//  (2) SEMANTIC (source-location-specific): a named operator/polarity/tolerance edit at one exact
//      source string of the counter. Each edit string must occur EXACTLY once in the counter
//      bytes, else the control refuses (exit 2). The set carries BOTH directions of every
//      tolerance and threshold the counter holds: pair tolerance, GAP_MIN (round-76 routed defect 3:
//      100/200/290 survived r76), abs and gap fractions, the own-gap floor, the grid tolerance; the
//      own-denominator gap rule (routed defect 1); and the prior-set walk features (routed defect 2:
//      symlink following, any extension, unparsable refusal, the receipt test).
//      Not carried: an abs-denominator mutant (pairs(p).length -> pairs(a).length) is equivalent on
//      receipts of one frozen leg shape (79 events in every honest receipt and every prior).
// Attribution, flake guard and minimum-mutant guard as in r76: `killed` needs a named failed case;
// `killed-positive` needs the mutant counter's own finding ids on the honest receipt; anything else
// is `crashed`; the unmutated battery runs twice in full; force-true mutants == declared checks
// (>= 100) and semantic >= 40.
// holds = both unmutated runs allOk, every mutant killed or killed-positive, none crashed or survived,
// and the minimum-mutant guard.
// Usage: node kill-power-r78.mjs --lane <ABS lane> --real <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <nonce> --prior-set <file> [--prior <receipt.json> ...] --laundered <deg.json> (x3)
//          --work <ABS scratch> --out <summary.json> [--jobs 4]
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const lane = opt('lane'), real = opt('real'), pin = opt('expect-driver-sha256'), work = opt('work'), outFile = opt('out'), priorSet = opt('prior-set');
const jobs = Number(opt('jobs') || 4);
const expectNonce = opt('expect-nonce');
const priors = multi('prior');
const laundered = multi('laundered');
if (!lane || !real || !pin || !expectNonce || !priorSet || laundered.length !== 3 || !work || !outFile || !path.isAbsolute(work) || !path.isAbsolute(lane)) { console.error('usage: absolute --lane/--work, --real, --expect-driver-sha256, --expect-nonce, --prior-set, 3 --laundered, --out'); process.exit(2); }
// a battery case locks a mirror directory (chmod 000) to prove the walk refuses an unreadable dir;
// rmSync then needs the mode restored first, or the cleanup dies EACCES and every mutant is `crashed`
const forceRm = (dir) => {
  const walk = (d) => { let st; try { st = fs.lstatSync(d); } catch { return; } if (!st.isDirectory()) return;
    try { fs.chmodSync(d, 0o700); } catch {}
    let es = []; try { es = fs.readdirSync(d); } catch {}
    for (const e of es) walk(path.join(d, e)); };
  walk(dir); try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
};
const COUNTER = 'check-filechooser-r78.mjs', BATTERY = 'negatives-filechooser-r78.mjs', DRIVER = 'chrome-cdp-filechooser-round78.mjs';
const driverBytes = fs.readFileSync(path.join(lane, 'scripts', DRIVER));
const counterSrc = fs.readFileSync(path.join(lane, 'scripts', COUNTER), 'utf8');
const batterySrc = fs.readFileSync(path.join(lane, 'scripts', BATTERY), 'utf8');
const ids = JSON.parse(spawnSync(process.execPath, [path.join(lane, 'scripts', COUNTER), '--list-checks'], { encoding: 'utf8' }).stdout);
const HOOK = 'const check = (id, ok, detail) => { checks[id] = !!ok;';
// Semantic mutants: each edit string occurs exactly once in the counter bytes (checked below).
const SEMANTIC = [
  {"id": "M5-producer-verdict-and-to-or", "from": "r.predicate === true && r.chooserHypothesis === 'CONFIRMED'", "to": "r.predicate === true || r.chooserHypothesis === 'CONFIRMED'"},
  {"id": "M-driver-pin-any", "from": "r.driverSha256 === pin", "to": "typeof r.driverSha256 === 'string'"},
  {"id": "M-nonce-on-page-dropped", "from": "typeof r.nonce === 'string' && r.nonceOnPage === r.nonce", "to": "typeof r.nonce === 'string'"},
  {"id": "M-nonce-expected-dropped", "from": "r.nonce === expectNonce, ", "to": "typeof r.nonce === 'string', "},
  {"id": "M-degenerate-loose-null", "from": "r.degenerate === null", "to": "r.degenerate == null"},
  {"id": "M-fixture-keys-open", "from": " && canon(Object.keys(r.fixture).sort()) === canon(['origin', 'sha256', 'viewport'])", "to": ""},
  {"id": "M-host-chromium-shape", "from": "host.chromium === HOST.chromium", "to": "/^Chromium \\d+/.test(String(host.chromium))"},
  {"id": "M-host-product-shape", "from": "host.cdpProduct === HOST.cdpProduct", "to": "/Chrome\\//.test(String(host.cdpProduct))"},
  {"id": "M-host-protocol-dropped", "from": " && host.cdpProtocolVersion === HOST.cdpProtocolVersion", "to": ""},
  {"id": "M-argv-pin-dropped", "from": "argvWant !== null && same(hargv, argvWant) && ", "to": "argvWant !== null && "},
  {"id": "M-argv-length-only", "from": "same(hargv, argvWant) && path.isAbsolute", "to": "hargv.length === argvWant.length && path.isAbsolute"},
  {"id": "M-argv-profile-dropped", "from": " && path.basename(profileArg) === 'profile-' + tok", "to": ""},
  {"id": "M-upload-dir-dropped", "from": "up.dir === upDir && ", "to": ""},
  {"id": "M-upload-sha-dropped", "from": " && up.files[n].sha256 === UPLOAD[n].sha256", "to": ""},
  {"id": "M-replay-token-every-to-some", "from": "priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok)", "to": "priors.some((p) => !isObj(p.host) || p.host.launchToken !== tok)"},
  {"id": "M-replay-url-dropped", "from": "priors.every((p) => browserId(p.host) !== bid)", "to": "true"},
  {"id": "M-replay-url-case-sensitive", "from": "return m ? m[1].toLowerCase() : null;", "to": "return m ? m[1] : null;"},
  {"id": "M-timeline-tol-0.045", "from": "TOL = 0.05,", "to": "TOL = 0.045,"},
  {"id": "M-timeline-tol-0.06", "from": "TOL = 0.05,", "to": "TOL = 0.06,", "dup": true},
  {"id": "M-timeline-gapmin-100", "from": "GAP_MIN = 50,", "to": "GAP_MIN = 100,"},
  {"id": "M-timeline-gapmin-40", "from": "GAP_MIN = 50,", "to": "GAP_MIN = 40,", "dup": true},
  {"id": "M-timeline-frac-0.55", "from": "FRAC = 0.5,", "to": "FRAC = 0.55,"},
  {"id": "M-timeline-frac-0.45", "from": "FRAC = 0.5,", "to": "FRAC = 0.45,", "dup": true},
  {"id": "M-timeline-gapfrac-0.85", "from": "GAP_FRAC = 0.75,", "to": "GAP_FRAC = 0.85,"},
  {"id": "M-timeline-gapfrac-0.6", "from": "GAP_FRAC = 0.75,", "to": "GAP_FRAC = 0.6,", "dup": true},
  {"id": "M-timeline-min-own-gaps-10", "from": "MIN_OWN_GAPS = 11;", "to": "MIN_OWN_GAPS = 10;"},
  {"id": "M-timeline-min-own-gaps-12", "from": "MIN_OWN_GAPS = 11;", "to": "MIN_OWN_GAPS = 12;", "dup": true},
  {"id": "M-timeline-gap-denominator-own", "from": "gapNeed = Math.ceil(GAP_FRAC * gp - 1e-9)", "to": "gapNeed = Math.ceil(GAP_FRAC * gaps(a).length - 1e-9)"},
  {"id": "M-timeline-gap-test-dropped", "from": " || (gp > 0 && gapMatched >= gapNeed)", "to": ""},
  {"id": "M-timeline-abs-test-dropped", "from": "(np > 0 && absMatched >= absNeed) || ", "to": ""},
  {"id": "M-quantum-tolerance-0.02", "from": "Math.round(v * 10)) <= 1e-4", "to": "Math.round(v * 10)) <= 0.02"},
  {"id": "M-quantum-tolerance-1e-5", "from": "Math.round(v * 10)) <= 1e-4", "to": "Math.round(v * 10)) <= 1e-5", "dup": true},
  {"id": "M-prior-set-complete-dropped", "from": "check('prior-set-complete', outside.length === 0", "to": "check('prior-set-complete', true"},
  {"id": "M-walk-evidence-only", "from": "for (const t of ['.ufo/waves/round-78', 'corpus/evidence/round78'])", "to": "for (const t of ['corpus/evidence/round78'])"},
  {"id": "M-walk-nonce-exemption-reintroduced", "from": " && rf !== selfReal && !priorReal.has(rf) && !exemptReal.has(rf)", "to": " && j.nonce !== expectNonce && rf !== selfReal && !priorReal.has(rf) && !exemptReal.has(rf)"},
  {"id": "M-walk-exempt-all", "from": " && !exemptReal.has(rf))", "to": " && true)"},
  {"id": "M-walk-no-symlink-follow", "from": "let stt; try { stt = fs.statSync(p); }", "to": "let stt; try { stt = fs.lstatSync(p); }"},
  {"id": "M-walk-json-ext-only", "from": "if (!stt.isFile()) continue;", "to": "if (!stt.isFile() || !name.endsWith('.json')) continue;"},
  {"id": "M-walk-unparsable-skipped", "from": "unparsable.push(path.relative(lane, p)); continue; }", "to": "continue; }"},
  {"id": "M-walk-receipt-needs-both", "from": "('nonce' in j || 'events' in j)", "to": "('nonce' in j && 'events' in j)"},
  {"id": "M-run-window-floor", "from": "t1 - t0 >= 6000", "to": "t1 - t0 >= 0"},
  {"id": "M-late-after-close-loose", "from": "r.lateAfterClose === 0", "to": "r.lateAfterClose >= 0"},
  {"id": "M-leg-window-upper-dropped", "from": "return e.at >= w[0] && e.at <= w[1] &&", "to": "return e.at >= w[0] &&"},
  {"id": "M-legrec-elapsed-floor", "from": "l.elapsedMs < 290", "to": "l.elapsedMs < 0"},
  {"id": "M-legrec-object-class-dropped", "from": " || tr.className !== 'HTMLButtonElement'", "to": ""},
  {"id": "M-legrec-setparams-dropped", "from": "if (!same(l.setParams, wantParams)) bad('setParams');", "to": ""},
  {"id": "M-read-ts-order-loose", "from": "e.ts <= e.at\n", "to": "e.ts <= e.at + 1\n"},
  {"id": "M-call-count-case-sensitive", "from": "/^input\\.|^dom\\.setfileinputfiles$|^page\\.setinterceptfilechooserdialog$/i.test(c.method)", "to": "/^Input\\.|^DOM\\.setFileInputFiles$|^Page\\.setInterceptFileChooserDialog$/.test(c.method)"},
  {"id": "M-event-log-keys-open", "from": " && isObj(e.params) && same(Object.keys(e.params).sort(), EVK[e.method])", "to": ""},
  {"id": "M-binding-order-dropped", "from": "bindBad === 0 && ordered && openedLegs === 10", "to": "bindBad === 0 && openedLegs === 10"},
  {"id": "M-binding-node-dropped", "from": " || e.params.backendNodeId !== l.openedNode", "to": ""},
  {"id": "M-frame-chooser-dropped", "from": ".every((e) => isObj(e.params) && e.params.frameId === mf)", "to": ".every((e) => isObj(e.params))"},
  {"id": "M-frame-url-path-only", "from": "navs[0].params.url === origin + '/?run=' + encodeURIComponent(String(r.nonce))", "to": "navs[0].params.url.startsWith(origin + '/')"},
  {"id": "M-frame-nav-first-dropped", "from": " && eventLog.indexOf(navs[0]) === 0", "to": ""},
  {"id": "M-frame-id-case-insensitive", "from": "/^[0-9A-F]{32}$/.test(mf)", "to": "/^[0-9A-F]{32}$/i.test(mf)"},
  {"id": "M-allowlist-eval-any", "from": " && EXPRS.has(c.params.expression)", "to": ""},
  {"id": "M-allowlist-script-once", "from": " && evalN(SCRIPT_CLICK) === 1", "to": ""},
  {"id": "M-teardown-sweep-dropped", "from": "td.postKillSweepCount === 0 && ", "to": ""},
  {"id": "M-trust-count-dropped", "from": "untrusted.length === 2 && ", "to": ""},
  {"id": "M-activation-intercept-dropped", "from": "clicks[0].act === true && icpt;", "to": "clicks[0].act === true;"},
  {"id": "M-mode-multiple-ignored", "from": "o.params.mode !== (dsc.multiple === true ? 'selectMultiple' : 'selectSingle')", "to": "o.params.mode !== 'selectSingle' && o.params.mode !== 'selectMultiple'"},
  {"id": "M-node-distinct-dropped", "from": " && new Set(nodeVals).size === nodeVals.length", "to": ""},
  {"id": "M-selection-last-path", "from": "p.files.slice(0, 1)", "to": "p.files.slice(-1)"},
  {"id": "M-cancel-location-dropped", "from": " && cancels.length === 3 && cancels.every((e) => cancelLegs.includes(e.leg))", "to": ""},
  {"id": "M-empty-state-dropped", "from": " && same(pe.stateAfter, pm.stateAfter)", "to": ""},
  {"id": "M-read-missing-any", "from": "u.hex === null ? 'error:NotFoundError'", "to": "u.hex === null ? e.ret"},
  {"id": "M-not-file-code-dropped", "from": "same(nf.setError, NOT_FILE_INPUT)", "to": "isObj(nf.setError) && nf.setError.message === NOT_FILE_INPUT.message"},
  {"id": "M-intercept-off-event-dropped", "from": " && eventLog.filter((e) => isObj(e) && io.triggerSendId != null && e.afterSendId >= io.triggerSendId).length === 0", "to": ""},
  {"id": "M-coordinate-target-dropped", "from": " || e.target !== AT_TARGET[p.at.join(',')]", "to": ""},
  {"id": "M-coordinate-y-dropped", "from": "e.x !== p.at[0] || e.y !== p.at[1]", "to": "e.x !== p.at[0]"},
  {"id": "M-server-favicon-any", "from": "(s.path === '/favicon.ico' && s.status === 404 && s.run === '' && s.query === '')", "to": "(s.status === 404)"},
  {"id": "M-r78-opened-id-pinned", "from": "same(d.opened.map((x) => x[0]), want.opened.map((x) => x[0]))", "to": "same(d.opened, want.opened)"},
  {"id": "M-r78-receipt-fields-open", "from": "check('receipt-fields', same(Object.keys(r).sort(), RECEIPT_KEYS)", "to": "check('receipt-fields', true"},
  {"id": "M-r78-frame-tree-dropped", "from": "ftree.mainFrameId === mf && ", "to": ""},
  {"id": "M-r78-fixture-descriptors-dropped", "from": "check('fixture-descriptors', fixiBad.length === 0", "to": "check('fixture-descriptors', true"},
  {"id": "M-r78-descriptor-rect-any", "from": "if (!(p.at[0] >= dsc.rect.left && p.at[0] < dsc.rect.left + dsc.rect.width && p.at[1] >= dsc.rect.top && p.at[1] < dsc.rect.top + dsc.rect.height))", "to": "if (!isObj(dsc.rect))"},
];
if (!counterSrc.includes(HOOK)) { console.error('hook line not found'); process.exit(2); }
for (const m of SEMANTIC) {
  const k = counterSrc.split(m.from).length - 1;
  if (k !== 1) { console.error(`semantic mutant ${m.id}: edit string occurs ${k} times (must be 1)`); process.exit(2); }
}
const mk = (name, src) => {
  const d = path.join(work, name); forceRm(d); fs.mkdirSync(path.join(d, 'w'), { recursive: true });
  fs.writeFileSync(path.join(d, COUNTER), src);
  fs.writeFileSync(path.join(d, BATTERY), batterySrc);
  fs.writeFileSync(path.join(d, DRIVER), driverBytes);
  return d;
};
const run = (d, first) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(d, BATTERY), '--lane', lane, '--real', real, '--expect-driver-sha256', pin, '--expect-nonce', expectNonce, '--prior-set', priorSet, ...priors.flatMap((x) => ['--prior', x]),
    ...laundered.flatMap((x) => ['--laundered', x]), '--work', path.join(d, 'w'), '--json', ...(first ? ['--first-failure'] : [])], { stdio: ['ignore', 'pipe', 'ignore'] });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  // 'close', not 'exit': the summary is read only after stdout has drained.
  p.on('close', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ code, j }); });
});
const classify = (code, j) => {
  const parsed = !!j && Array.isArray(j.failed) && j.positive && typeof j.positive === 'object';
  if (!parsed) return { outcome: 'crashed', why: 'battery exit ' + code + ', summary unparsable' };
  if (code === 0 && j.allOk === true) return { outcome: 'survived' };
  if (code !== 1) return { outcome: 'crashed', why: 'battery exit ' + code };
  const named = j.failed.filter((f) => f !== '(positive)' && f !== '(coverage-gap)');
  if (named.length > 0) return { outcome: 'killed', failedCases: named };
  if (j.failed.includes('(positive)')) {
    const p = j.positive;
    if (p.exit === 1 && Array.isArray(p.findingIds) && p.findingIds.length > 0) return { outcome: 'killed-positive', positiveFindings: p.findingIds };
    return { outcome: 'crashed', why: 'positive run exit ' + p.exit + ' findings ' + JSON.stringify(p.findingIds) };
  }
  return { outcome: 'crashed', why: 'battery exit 1 with no named failure: ' + JSON.stringify(j.failed) };
};
const tasks = [
  { cls: 'unmutated', id: '(unmutated-first)', src: counterSrc },
  ...ids.map((id) => ({ cls: 'force-true', id, src: counterSrc.replace(HOOK, `const check = (id, ok, detail) => { if (id === ${JSON.stringify(id)}) ok = true; checks[id] = !!ok;`) })),
  ...SEMANTIC.map((m) => ({ cls: 'semantic', id: m.id, src: counterSrc.replace(m.from, m.to) })),
];
const results = new Array(tasks.length);
let next = 0;
await Promise.all(Array.from({ length: jobs }, async () => {
  while (next < tasks.length) {
    const i = next++; const t = tasks[i];
    const d = mk('m' + i, t.src);
    const { code, j } = await run(d, t.cls !== 'unmutated');
    const c = classify(code, j);
    results[i] = { cls: t.cls, mutant: t.id, batteryExit: code, ...c, killed: t.cls === 'unmutated' ? null : (c.outcome === 'killed' || c.outcome === 'killed-positive') };
    forceRm(d);
  }
}));
// flake guard: the unmutated battery again, in full, after every mutant
const dLast = mk('m-last', counterSrc);
const last = await run(dLast, false);
forceRm(dLast);
const lastC = classify(last.code, last.j);
const base = results[0];
const muts = results.slice(1);
const of = (c) => muts.filter((m) => m.cls === c);
const guard = { declaredChecks: ids.length, forceTrueMutants: of('force-true').length, semanticMutants: of('semantic').length,
  ok: of('force-true').length === ids.length && ids.length >= 100 && of('semantic').length >= 40 };
const summary = {
  schema: 'tabi-r78-kill-power', real, unmutatedExit: base.batteryExit, unmutatedOutcome: base.outcome, unmutatedLastExit: last.code, unmutatedLastOutcome: lastC.outcome,
  forceTrue: { mutants: of('force-true').length, killed: of('force-true').filter((m) => m.killed).length, killedPositive: of('force-true').filter((m) => m.outcome === 'killed-positive').length },
  semantic: { mutants: of('semantic').length, killed: of('semantic').filter((m) => m.killed).length, killedPositive: of('semantic').filter((m) => m.outcome === 'killed-positive').length },
  mutants: muts.length, killed: muts.filter((m) => m.killed).length, minimumMutantGuard: guard,
  crashed: muts.filter((m) => m.outcome === 'crashed').map((m) => m.mutant),
  survivors: muts.filter((m) => m.outcome === 'survived').map((m) => m.mutant),
  holds: base.outcome === 'survived' && base.batteryExit === 0 && lastC.outcome === 'survived' && last.code === 0 && muts.every((m) => m.killed) && guard.ok, results,
};
fs.writeFileSync(outFile, JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ unmutatedExit: summary.unmutatedExit, unmutatedLastExit: summary.unmutatedLastExit, forceTrue: summary.forceTrue, semantic: summary.semantic, guard, survivors: summary.survivors, crashed: summary.crashed, holds: summary.holds }));
process.exit(summary.holds ? 0 : 1);
