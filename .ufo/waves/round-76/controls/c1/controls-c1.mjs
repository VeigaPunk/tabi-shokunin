#!/usr/bin/env node
// Round 76 C1 pre-freeze do-nothing / forgery / positive / limit controls for scripts/check-dialog-r76.mjs.
// Each control states its expected exit and finding ids BEFORE it runs (tabi r63 prerequisite;
// QUALITY 131: exit AND ids, evaluated mechanically). PRE is the committed prior-set.txt (QUALITY
// 140/141), passed by file (--prior-set), never as a hand-written list.
// Usage: node controls-c1.mjs --work <ABS scratch>   (writes controls-summary.json beside this file)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = path.resolve(HERE, '../../../../..');
const CTR = path.join(LANE, 'scripts/check-dialog-r76.mjs');
const DRV = path.join(LANE, 'scripts/chrome-cdp-dialog-round76.mjs');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const driverText = fs.readFileSync(DRV, 'utf8');
const PIN = sha(fs.readFileSync(DRV));
const wi = process.argv.indexOf('--work');
const work = wi >= 0 ? process.argv[wi + 1] : null;
if (!work || !path.isAbsolute(work)) { console.error('usage: --work <ABS scratch>'); process.exit(2); }
fs.mkdirSync(work, { recursive: true });
const PS = path.join(HERE, 'prior-set.txt');
const PRE = fs.readFileSync(PS, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => path.join(LANE, l.trim()));
if (PRE.length === 0) { console.error('empty prior-set.txt'); process.exit(2); }
const BASEARGS = ['--lane', LANE, '--prior-set', PS];
const POST = 'tabi-r76-l1-control0000';   // stands in for the post-freeze nonce the predicate derives
const smoke1Path = PRE.find((p) => p.endsWith('/smoke1.receipt.json'));
const probe1Path = PRE.find((p) => p.endsWith('/probe/p1.receipt.json'));
const smoke1 = JSON.parse(fs.readFileSync(smoke1Path, 'utf8'));
const tpl = /\/\*DIALOG-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\nconst NEXT_TEMPLATE = `([\s\S]*?)`;\n\/\*DIALOG-FIXTURE-END\*\//.exec(driverText);
const fixtureSha = (nonce) => [sha(tpl[1].replaceAll('__NONCE__', nonce)), sha(tpl[2].replaceAll('__NONCE__', nonce))];
const write = (name, obj) => { const f = path.join(work, name + '.json'); fs.writeFileSync(f, JSON.stringify(obj)); return f; };
const clone = (v) => JSON.parse(JSON.stringify(v));
const rewriteNonce = (r, to, fixToo) => {
  const old = r.nonce; r.nonce = to; r.nonceOnPage = to; r.serverLog.forEach((s) => { if (s.run === old) { s.run = to; s.query = 'run=' + encodeURIComponent(to); } });
  for (const c of r.cdpSendLog) { if (c.method === 'Page.navigate') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(to)); if (c.method === 'Runtime.evaluate') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to)); }
  if (fixToo) [r.fixture.sha256, r.fixture.nextSha256] = fixtureSha(to);
};
const shiftStamps = (r) => { for (const k of ['startedAt', 'finishedAt']) r[k] = new Date(Date.parse(r[k]) + 3600000).toISOString(); };
const newIds = (r) => {
  const oldTok = r.host.launchToken; const tok = crypto.randomBytes(6).toString('hex'); r.host.launchToken = tok; r.host.argv = r.host.argv.map((a) => a.split(oldTok).join(tok));
  const oldId = r.host.devtoolsListening.url.split('/devtools/browser/')[1]; const newId = crypto.randomUUID();
  r.host.devtoolsListening.url = r.host.devtoolsListening.url.replace(oldId, newId);
  if (typeof r.host.devtoolsListening.browserId === 'string') r.host.devtoolsListening.browserId = newId;
  r.host.stderrHead = r.host.stderrHead.split(oldId).join(newId);
};
const q = (v) => Math.round(v * 10) / 10;
const shiftAll = (r, d) => { r.events.forEach((e) => { e.ts = q(e.ts + d); e.at = q(e.at + d); }); r.legMarks.forEach((m) => { m.at = q(m.at + d); }); r.closedAt = q(r.closedAt + d); };
// a full relabel: nonce (with fixture hashes), stamps, launch token (argv too), browser id, driver pin field, producer verdict
const relabel = (src) => { const r = clone(src); rewriteNonce(r, POST, true); shiftStamps(r); newIds(r); r.driverSha256 = PIN; r.predicate = true; r.dialogHypothesis = 'CONFIRMED'; r.degenerate = null; r.failures = []; return r; };
const forgedFix = clone(smoke1); rewriteNonce(forgedFix, POST, true); shiftStamps(forgedFix);
const whole = relabel(smoke1); shiftAll(whole, 0.1);
const whole100 = relabel(smoke1); shiftAll(whole100, 100);
const probeRelabel = relabel(JSON.parse(fs.readFileSync(probe1Path, 'utf8')));
// declared-limit witness: every event moved by a different multiple of 0.3 ms (monotone: order and windows hold)
const limit = relabel(smoke1); limit.events.forEach((e, i) => { const d = (i + 1) * 0.3; e.ts = q(e.ts + d); e.at = q(e.at + d); });
// host forgeries on an otherwise clean relabel-with-retime (only the forged field may fire)
const hostOld = clone(limit); hostOld.host.chromium = 'Chromium 154.0.8059.84 Arch Linux';
const hostHeadful = clone(limit); hostHeadful.host.argv.splice(1, 1); hostHeadful.host.argv.splice(15, 0, '--no-sandbox');
const hostProduct = clone(limit); hostProduct.host.cdpProduct = 'HeadlessChrome/155.0.8059.84';
// error-code forgery (R75Review1 F3): the message kept, the code changed
// (the forger also edits the producer's legShape; the first pass left it stale and legshape-consistency
// co-fired: lesson-proof/controls-first-pass-error-code-expectation.json)
const errCode = clone(limit); errCode.legs.find((l) => l.name === 'no-dialog').handleError.code = -32000; errCode.legShape['no-dialog'].handleError.code = -32000;
// prompt-default belief forgery: a page return of the default prompt for an accept without promptText
const promptDefault = clone(limit); promptDefault.events.find((e) => e.leg === 'prompt-noparam' && e.type === 'dialog-return').ret = 'string:tabi-default';
promptDefault.legs.find((l) => l.name === 'prompt-noparam').stateAfter.last = 'prompt=string:tabi-default';
// prior set omitting one committed receipt (R75Review1 F6)
const psShort = path.join(work, 'prior-set-short.txt'); fs.writeFileSync(psShort, fs.readFileSync(PS, 'utf8').split('\n').filter((l) => !l.endsWith('/probe/p2.receipt.json')).join('\n'));

const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const C = (rel) => ['--receipt', rel, '--expect-driver-sha256', PIN];
const controls = [
  { name: 'donothing-no-receipt', args: [...BASEARGS, ...C(path.join(work, 'absent.json')), '--expect-nonce', POST], expectExit: 2, expectIds: ['receipt-unreadable'], exact: true,
    why: 'no work: no r76 dialog receipt exists' },
  { name: 'donothing-r75-drag-receipt', args: [...BASEARGS, ...C(path.join(LANE, 'corpus/evidence/round75/chromium-drag-intercept/receipt.json')), '--expect-nonce', POST], expectExit: 1, expectIds: ['schema', 'nonce-shape', 'nonce-expected', 'driver-pin', 'dialog-call-count', 'cdp-event-log-closed'], exact: false,
    why: 'no work: re-present the lane\'s newest committed capability receipt (r75 drag) as a dialog run' },
  { name: 'donothing-no-flags', args: ['--receipt', smoke1Path], expectExit: 2, expectIds: ['usage'], exact: true,
    why: 'call without lane, pin, nonce or prior set: refused as usage' },
  { name: 'donothing-no-prior-set', args: ['--lane', LANE, ...C(smoke1Path), '--expect-nonce', smoke1.nonce, '--prior', PRE[1]], expectExit: 2, expectIds: ['usage'], exact: true,
    why: 'R75Review1 F6: a caller that omits the committed prior set is refused (r75: clean)' },
  { name: 'prior-set-short', args: ['--lane', LANE, '--prior-set', psShort, ...C(smoke1Path), '--expect-nonce', smoke1.nonce], expectExit: 1, expectIds: [...REPLAY, 'prior-set-complete'], exact: true,
    why: 'a prior set missing one committed receipt (probe p2) is caught by the tree walk (smoke1 itself is also refused as a replay of its own copy in PRE)' },
  { name: 'replay-zeroedit-smoke1', args: [...BASEARGS, ...C(smoke1Path), '--expect-nonce', POST], expectExit: 1, expectIds: ['nonce-expected', ...REPLAY], exact: true,
    why: 'QUALITY 136 replay 1: byte-identical pre-freeze receipt presented as the post-freeze run' },
  { name: 'replay-forged-nonce-stamps-fixture', args: [...BASEARGS, ...C(write('forged-nonce-stamps-fixture', forgedFix)), '--expect-nonce', POST], expectExit: 1, expectIds: REPLAY, exact: true,
    why: 'nonce rewritten everywhere it is logged, fixture hashes recomputed, stamps +1 h' },
  { name: 'replay-forged-whole-shift-0.1ms', args: [...BASEARGS, ...C(write('forged-whole-shift', whole)), '--expect-nonce', POST], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'full relabel plus every event time moved by one 0.1 ms quantum: the shift-invariant gap test refuses it' },
  { name: 'replay-forged-whole-shift-100ms', args: [...BASEARGS, ...C(write('forged-whole-shift-100', whole100)), '--expect-nonce', POST], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'same with a 100 ms whole-timeline shift' },
  { name: 'replay-probe-p1-relabel', args: [...BASEARGS, ...C(write('probe-p1-relabel', probeRelabel)), '--expect-nonce', POST], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'a full relabel of a committed PROBE receipt is refused because the probes are in PRE' },
  { name: 'forge-host-chromium-154', args: [...BASEARGS, ...C(write('forge-host-154', hostOld)), '--expect-nonce', POST], expectExit: 1, expectIds: ['host-chromium'], exact: true,
    why: 'R75Review1 F1: another Chromium build string (shape-valid) is refused by the exact pin' },
  { name: 'forge-host-headful-argv', args: [...BASEARGS, ...C(write('forge-host-headful', hostHeadful)), '--expect-nonce', POST], expectExit: 1, expectIds: ['host-argv'], exact: true,
    why: 'R75Review1 F2: an argv without --headless=new is refused' },
  { name: 'forge-host-headless-product', args: [...BASEARGS, ...C(write('forge-host-product', hostProduct)), '--expect-nonce', POST], expectExit: 1, expectIds: ['host-chromium'], exact: true,
    why: 'R75Review1 F1: the old-headless product string is refused by the exact pin' },
  { name: 'forge-error-code', args: [...BASEARGS, ...C(write('forge-error-code', errCode)), '--expect-nonce', POST], expectExit: 1, expectIds: ['leg-no-dialog-error', 'no-dialog-law'], exact: true,
    why: 'R75Review1 F3: the no-dialog refusal with message kept and code -32000 is refused (code checked)' },
  { name: 'forge-prompt-returns-default', args: [...BASEARGS, ...C(write('forge-prompt-default', promptDefault)), '--expect-nonce', POST], expectExit: 1, expectIds: ['leg-prompt-noparam-ret', 'leg-prompt-noparam-state', 'return-value-law', 'legshape-consistency'], exact: true,
    why: 'the rejected belief "accepting a prompt without promptText returns its default" written into a receipt is refused' },
  { name: 'limit-nonuniform-retime', args: [...BASEARGS, ...C(write('limit-nonuniform', limit)), '--expect-nonce', POST], expectExit: 0, expectIds: [], exact: true,
    why: 'DECLARED LIMIT witness, not a pass: a full relabel whose every event time is moved by a different multiple of 0.3 ms is not refused (the counter is not an execution oracle)' },
  { name: 'positive-smoke1-own-nonce-without-itself', args: ['--lane', LANE, '--prior-set', (() => { const f = path.join(work, 'ps-no-smoke1.txt'); fs.writeFileSync(f, fs.readFileSync(PS, 'utf8').split('\n').filter((l) => !l.endsWith('/smoke1.receipt.json')).join('\n')); return f; })(), ...C(smoke1Path), '--expect-nonce', smoke1.nonce], expectExit: 0, expectIds: [], exact: true,
    why: 'POSITIVE control (blanket refusal is not a gain): an honest pre-freeze receipt with every other committed receipt as prior is clean' },
];
const results = controls.map((c) => {
  const p = spawnSync(process.execPath, [CTR, ...c.args, '--json'], { encoding: 'utf8', timeout: 60000 });
  const rc = p.status;
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  const ids = j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null;
  const ok = rc === c.expectExit && Array.isArray(ids) && c.expectIds.every((i) => ids.includes(i)) && (!c.exact || ids.length === c.expectIds.length);
  return { name: c.name, why: c.why, expectExit: c.expectExit, expectIds: c.expectIds, exact: c.exact, exit: rc, ids, ok };
});
const degenerates = ['page-stub', 'eval-trigger', 'swap-accept'].map((k) => {
  const read = (f) => { try { return fs.readFileSync(path.join(HERE, f), 'utf8').trim(); } catch { return null; } };
  let r = null; try { r = JSON.parse(read(`degenerate-${k}.receipt.json`)); } catch {}
  const ok = read(`degenerate-${k}.driver.exit`) === '1' && r !== null && r.degenerate === k && r.dialogHypothesis === 'REFUTED' && r.predicate === false;
  return { name: 'degenerate-' + k, expect: 'driver exit 1, receipt.degenerate === name (QUALITY 133), hypothesis REFUTED', driverExit: read(`degenerate-${k}.driver.exit`), label: r ? r.degenerate : null, hypothesis: r ? r.dialogHypothesis : null, ok };
});
// before-state at the round's base commit (committed bytes, not the working tree)
const BASE = 'a69f9060cb9d239b3d6d4429e1b91177b792ebd3';
const baseScorecard = spawnSync('git', ['-C', LANE, 'show', BASE + ':SCORECARD.md'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout;
const rows = baseScorecard.split('\n').filter((l) => l.startsWith('| `chromium-js-dialog-linux` |')).length;
const notes = spawnSync('git', ['-C', LANE, 'grep', '-lE', 'handleJavaScriptDialog|javascriptDialogOpening', BASE, '--', 'corpus/knowledge'], { encoding: 'utf8' });
const summary = { schema: 'tabi-r76-c1-controls', counterSha256: sha(fs.readFileSync(CTR)), driverSha256: PIN, priorSetSha256: sha(fs.readFileSync(PS)), priors: PRE.map((p) => path.relative(LANE, p)),
  capabilityRowCount: rows, notesCitingDialogCommands: notes.stdout.split('\n').filter(Boolean).length,
  allOk: results.every((r) => r.ok) && degenerates.every((d) => d.ok) && rows === 0, results, degenerates };
fs.writeFileSync(path.join(HERE, 'controls-summary.json'), JSON.stringify(summary, null, 1) + '\n');
console.log([...results, ...degenerates].map((r) => `${r.ok ? 'ok  ' : 'FAIL'} ${r.name} exit=${r.exit ?? r.driverExit} ids=${JSON.stringify(r.ids ?? r.label)}`).join('\n') + `\ncapabilityRowCount=${summary.capabilityRowCount} notes=${summary.notesCitingDialogCommands} allOk=${summary.allOk}`);
process.exit(summary.allOk ? 0 : 1);
