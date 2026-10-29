import fs from 'node:fs';
const S = '/fast/scratch/hyaku/tabi-r43/ExecReplayAll';
const D = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecReplayAll/evidence';

const runs = {
  'r39-nomeasure': { round: 39, receipt: 'corpus/evidence/round-39/playwright-egress/receipt.json',
    receiptRev: '690b0500fab8eac5ab85485bbcecbc0076247bea',
    measure: '(none — round-39 committed no signed measure record; slot probed with an absent path)',
    measureRev: null },
  'r39-xround': { round: 39, receipt: 'corpus/evidence/round-39/playwright-egress/receipt.json',
    receiptRev: '690b0500fab8eac5ab85485bbcecbc0076247bea',
    measure: '.ufo/waves/round-40/measure/c1-live-run.json (== corpus/evidence/round40/playwright-egress/measure.json, byte-identical)',
    measureRev: '22883df61d8deb55e03a1afebc81f7290c3a3cfc' },
  'r40-own': { round: 40, receipt: 'corpus/evidence/round40/playwright-egress/receipt.json',
    receiptRev: '22883df61d8deb55e03a1afebc81f7290c3a3cfc',
    measure: 'corpus/evidence/round40/playwright-egress/measure.json',
    measureRev: '22883df61d8deb55e03a1afebc81f7290c3a3cfc' },
  'r41-own': { round: 41, receipt: 'corpus/evidence/round41/playwright-egress/receipt.json',
    receiptRev: '9b6de3a19de11abdb80e82a1310abc64a40215bb',
    measure: '.ufo/waves/round-41/measure/c1-measure.json',
    measureRev: '123e55c77bb101be008db4cbf8ffca626423335a' },
  'r42-own': { round: 42, receipt: 'corpus/evidence/round42/playwright-egress/receipt.json',
    receiptRev: '227956616c5413f280cc43cdcf0e6bc8f30da8b6',
    measure: '.ufo/waves/round-42/measure/c1-measure.json',
    measureRev: '236c4f49f6cf8be7fd2efc71c7e89b7465b47a27' },
  'r43-own': { round: 43, receipt: 'corpus/evidence/round43/playwright-egress/receipt.json',
    receiptRev: 'ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c',
    measure: '.ufo/waves/round-43/measure/c1-measure-r43.json',
    measureRev: 'ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c', note: 'positive control: genuine round-43 pair' },
};

const out = { schema: 'tabi-r43-w1-execreplayall', counter: '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs',
  counterSha256: '6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c',
  counterInvoked: 'in place from the lane repo (frozen bytes, read-only); fd3/fd4 closed (3>&- 4>&-)',
  claimsPathReadByCounter: '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/claims.json (hardcoded in the counter)',
  runs: {} };

for (const [tag, meta] of Object.entries(runs)) {
  const exit = Number(fs.readFileSync(`${S}/out/${tag}.exit`, 'utf8').trim());
  let doc = null;
  const raw = fs.readFileSync(`${S}/out/${tag}.stdout`, 'utf8');
  if (raw.trim()) { try { doc = JSON.parse(raw); } catch { doc = null; } }
  const rec = { ...meta, exit, refused: exit !== 0,
    receiptSha256OfBytesRead: doc ? doc.receiptSha256 : null,
    findingsCount: doc ? doc.findings.length : null,
    firstFindings: doc ? doc.findings.slice(0, 8) : null,
    allFindings: doc ? doc.findings : null,
    challengeVerified: doc ? doc.challengeVerified : null,
    challengeError: doc ? doc.challengeError : null,
    measureSignatureVerified: doc ? doc.measureSignatureVerified : null,
    witnessAttestationVerified: doc ? doc.witnessAttestationVerified : null,
    predicate: doc ? doc.predicate : null,
    stderr: fs.readFileSync(`${S}/out/${tag}.stderr`, 'utf8').trim() || null };
  out.runs[tag] = rec;
}

const ctrl = JSON.parse(fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/controls/c1-replay-r42-refused.json', 'utf8'));
const repro = JSON.parse(fs.readFileSync(`${S}/out/control-cmdexact.stdout`, 'utf8'));
out.controlCrossCheck = {
  controlPath: '.ufo/waves/round-43/controls/c1-replay-r42-refused.json',
  controlRecorded: { exit: ctrl.exit, challengeError: ctrl.challengeError, refused: ctrl.refused, predicate: ctrl.predicate, counterFindings: ctrl.counterFindings },
  reproducedAtFrozenTree: { exit: Number((fs.readFileSync(`${S}/out/control-cmdexact.exit`, 'utf8').match(/\d+/) || ['NaN'])[0]), challengeError: repro.challengeError, predicate: repro.predicate, counterFindings: repro.findings },
  conclusionReproduces: ctrl.exit === 1 && repro.predicate === false && ctrl.challengeError === repro.challengeError,
  findingListReproduces: JSON.stringify(ctrl.counterFindings) === JSON.stringify(repro.findings),
  recordedOnly: ctrl.counterFindings.filter((f) => !repro.findings.includes(f)),
  reproducedOnly: repro.findings.filter((f) => !ctrl.counterFindings.includes(f)),
};
fs.writeFileSync(`${D}/replay-summary.json`, JSON.stringify(out, null, 2) + '\n');
fs.writeFileSync(`${D}/control-diff.json`, JSON.stringify(out.controlCrossCheck, null, 2) + '\n');
console.log('written');
console.log(JSON.stringify(out.controlCrossCheck, null, 2));
