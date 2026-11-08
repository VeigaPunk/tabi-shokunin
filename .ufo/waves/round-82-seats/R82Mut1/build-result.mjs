// Build the combined r82mut1 result artifact (mutant list + outcomes + witness verdicts).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const SEAT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-82-seats/R82Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const mut = JSON.parse(fs.readFileSync(path.join(SEAT, 'mutants-r82.json'), 'utf8'));
const wit = JSON.parse(fs.readFileSync(path.join(SEAT, 'witnesses-r82.json'), 'utf8'));
const base = JSON.parse(fs.readFileSync(path.join(SEAT, 'baseline-battery.json'), 'utf8'));
const FAMILY = (n) => {
  if (/^(host|fixture|ports|nonce|receipt|leg-order)/.test(n)) return 'identity/host/fixture/ports';
  if (/^frame-/.test(n)) return 'frame tree';
  if (/^(leg-|intercept-error|priorclick|trigger2)/.test(n)) return 'leg records';
  if (/^marks-/.test(n)) return 'leg marks';
  if (/^ctx-/.test(n)) return 'execution contexts';
  if (/^(sendid|sendlog)/.test(n)) return 'CDP send log';
  if (/^cdp-/.test(n)) return 'CDP event log';
  if (/^event-/.test(n)) return 'page events';
  if (/^(gesture|activation|cross-|order-|extras-|mode-)/.test(n)) return 'law checks';
  if (/^(webkitdir|accept-)/.test(n)) return 'answer laws';
  if (/^click-/.test(n)) return 'click while open';
  if (/^no-selection/.test(n)) return 'no selection';
  if (/^(cancel|dismiss)/.test(n)) return 'cancel/dismiss';
  if (/^trust-/.test(n)) return 'trust';
  if (/^(argv|teardown)/.test(n)) return 'host argv/teardown';
  if (/^(server|childserver)/.test(n)) return 'server logs';
  if (/^runwindow/.test(n)) return 'run window';
  if (/^replay-/.test(n)) return 'replay';
  if (/^(trees|unparsable|walk-)/.test(n)) return 'prior-set walk';
  return 'other';
};
const MISS = {
  'identity/host/fixture/ports': 'the battery flips only schema/lane/nonce/driver/fixture.sha256/host.chromium/frameTree.mainFrameUrl and a duplicate port; no case mutates host.cdpProduct, host.cdpProtocolVersion, fixture.viewport, fixture.child keys/sha, either fixture origin, or a sub-1024 port',
  'frame tree': 'the frame cases mutate frameTree.mainFrameUrl (top level) and one leg mainFrameParentId; no case mutates frame-tree key sets, frame-id shape, or a leg frameTree url',
  'leg records': 'leg-records is exercised only by deleting stderrHead; no case mutates chooserWaitMs bounds, any errOk(...) field, a non-empty errors array, or the trigger2Error slot',
  'leg marks': 'leg-marks is exercised only through lateAfterClose; mark order, start/pre labels, settle label, the 0.1 ms grid, closedAt, mark count and mark-name typing are unprobed',
  'execution contexts': 'context-binding is exercised by removing the child context; isDefault, frameId uniqueness, childContextId equality and an unexpected childContextId are unprobed',
  'CDP send log': 'send-log-allowlist is exercised with DOM.getDocument; send-id order, prologue order, getFrameTree-once, navigate params, and the parent/child expression allowlists are unprobed',
  'CDP event log': 'cdp-event-log-closed is exercised on afterSendId and open-binding only; chooser param key set, mode enum, backendNodeId positivity, nav url/count, afterSendId typing and the 3-open cap are unprobed',
  'page events': 'event-types is exercised with one extra key; act/files/ret/target typing, ts typing, window lower bound, intra-leg order and the start-leg exclusion are unprobed',
  'law checks': 'each law case flips one field (webkitdirectory showPicker, one activationBefore, sod message, one chooser mode, one extra-leg childResult); ret, unexpected parent showPicker, childActivationBefore/After, child act, childLate, mode selectMultiple and the activation no-law branch are unprobed',
  'answer laws': 'answer laws are exercised on uploadDir.files[0].sha256 and one read ret; answer key set, upload name/size, state k, answer basename and read counts are unprobed (or pinned only by plan-calls/leg shape)',
  'click while open': 'click-while-open is exercised on the after-count; element id, click count, click act and the log chooser count are unprobed (the latter pinned by leg shape)',
  'no selection': 'no-selection is exercised by planting a selected file; state key set, dismiss-state equality and file events are unprobed (or pinned by leg shape)',
  'cancel/dismiss': 'cancel/dismiss are exercised on one added cancel and dismissResult.ok; dismissError and the cancel scan inside dismiss-law are unprobed',
  trust: 'trust-law is exercised by isTrusted=false; the showPicker pointer-event exclusion is unprobed',
  'host argv/teardown': 'host-argv is exercised with argv[7]; profile/token binding, devtools url prefix, browserId format, stderr binding, probe key set/values and postKillCurl are unprobed',
  'server logs': 'server logs are exercised by one run field; duplicate root entries, side-request status and a missing child request are unprobed',
  'run window': 'run-window is exercised on the lower bound only; the 600 s upper bound is unprobed',
  replay: 'replay is exercised with a full prior copy and one token/browser reuse; cross-leg token and browser uniqueness and the FRAC threshold are unprobed',
  'prior-set walk': 'the walk cases use one stray receipt inside .ufo/waves/round-82; the corpus/evidence tree, a non-.json unparsable file, a blanket exemption and the self-exemption are unprobed',
  other: 'no battery case mutates this conjunct',
};
const witByName = new Map(wit.results.map((x) => [x.mutant, x]));
const noWit = new Map(wit.noWitness.map((x) => [x.mutant, x.why]));
const records = mut.results.map((r) => {
  const w = witByName.get(r.mutant);
  const family = FAMILY(r.mutant);
  return {
    name: r.mutant,
    family,
    from: r.from,
    to: r.to,
    mutantSha256: r.mutantSha256,
    outcome: r.outcome,
    battery: { exit: r.batteryExit, failed: r.batteryFailed, uncovered: r.batteryUncovered, firstFailures: r.firstFailures },
    direct: { exit: r.directExit, verdict: r.directVerdict, checkCount: r.directCheckCount },
    witness: w ? {
      status: w.witnessKills ? 'kills' : 'fails',
      pristineExit: w.pristineExit, pristineIds: w.pristineIds,
      mutantExit: w.mutantExit, mutantVerdict: w.mutantVerdict,
      receiptSha256: w.receiptSha256,
    } : { status: 'none', why: noWit.get(r.mutant) || null },
    routedDefect: r.outcome === 'survived',
    missReason: r.outcome === 'survived' ? MISS[family] : null,
  };
});
const out = {
  schema: 'tabi-r82-r82mut1-mutants',
  seat: 'R82Mut1',
  round: 82, wave: 'w1', lane: LANE,
  baseline: {
    battery: 'scripts/negatives-showpicker-r82.mjs', exit: 0,
    cases: base.cases, failed: base.failed, coverage: base.coverage,
    receipt: 'corpus/evidence/round82/chromium-showpicker/receipt.json',
    receiptSha256: mut.receiptSha256,
    pins: mut.pins,
  },
  instruments: {
    counter: 'scripts/check-showpicker-r82.mjs', counterSha256: mut.counterSha256Prerun,
    battery: 'scripts/negatives-showpicker-r82.mjs', batterySha256: mut.batterySha256,
  },
  method: 'each mutant: copy counter+battery into /fast/scratch/hyaku/tabi-r82/R82Mut1/mut-<name>/, apply one semantic edit, run the frozen battery there; survived = battery exit 0, killed = battery exit 1 with the expected case, crashed = mutant counter no longer emits JSON',
  totals: { mutants: mut.mutants, survived: mut.survived, killed: mut.killed, crashed: mut.crashed, unapplied: mut.unapplied,
    survivorsWithKillingWitness: wit.killing, survivorsWithoutWitness: wit.noWitness.length },
  survivors: mut.survivors,
  killed: mut.results.filter((r) => r.outcome === 'killed').map((r) => ({ name: r.mutant, caughtBy: r.firstFailures && r.firstFailures[0] && r.firstFailures[0].case })),
  mutants: records,
};
fs.writeFileSync(path.join(SEAT, 'r82mut1-result.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out.totals, null, 1));
console.log('killed:', JSON.stringify(out.killed));
