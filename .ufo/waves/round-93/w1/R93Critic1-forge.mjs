// R93Critic1 forgeries: clone positive receipt, mutate one clause-claimed fact, keep all counter-checked fields green.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(LANE, 'scripts/check-cross-session-answer-round93.mjs');
const PIN = 'a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0';
const NONCE = 'tabi-r93-ctl-positive';
const BASE = JSON.parse(fs.readFileSync(path.join(LANE, '.ufo/waves/round-93/controls/receipt-positive.json'), 'utf8'));
const OUTDIR = path.join(LANE, '.ufo/waves/round-93/w1');
const clone = () => JSON.parse(JSON.stringify(BASE));
const leg = (r, id) => r.legs.find((l) => l && l.leg === id);
// letter, slug, mutation. Each keeps the counter-enforced schema/nonce/pin/legSet/etc green
// while violating one clause the frozen wording asserts.
const cases = [
  ['a', 'describe-page-not-bound-to-B-or-document', (r) => {
    // Wording: "DOM.describeNode {backendNodeId: B} on the PAGE session returns a node whose nodeName is #document".
    // Counter (line 155) only checks dp.session, dp.error===null, dp.nodeName. It never binds dp to B,
    // never checks dp.frameId/documentURL (plan limit 3 concedes this), and never checks dp was obtained
    // by sending B on the page session at all. A receipt claiming the page-session describe of ANY node
    // (e.g. describing the page document directly, not B) with frameId of the child document satisfies
    // every counter clause while not evidencing that B names #document on that session.
    const l = leg(r, 'X-1');
    l.describePage = { session: 'page', error: null, nodeName: '#document', attributes: [], frameId: 'CHILD-FRAME-DOCUMENT' };
    return r;
  }],
  ['b', 'describe-page-arbitrary-attributes-still-document', (r) => {
    // Same binding gap, other direction: describePage carrying INPUT-like attributes or a foreign frameId
    // still passes because counter reads ONLY nodeName (+session/error). The "names a #document node"
    // clause is thus nodeName-only in the counter; attributes/frameId are unconstrained.
    const l = leg(r, 'X-1');
    l.describePage = { session: 'page', error: null, nodeName: '#document', attributes: ['type', 'file', 'id', 's'], frameId: 'OTHER-FRAME' };
    return r;
  }],
  ['c', 'filesAfterCross-timestamp-not-enforced', (r) => {
    // Wording: "the child input's files then read []" (after the cross answer). Counter only sees a
    // recorded filesAfterCross value (line 157); it cannot verify WHEN it was read (before vs after the
    // cross send, or even before the click). A forged receipt with filesAfterCross=[] but childFiles
    // already populated by a hidden earlier answer is indistinguishable. Here: put the real answer files
    // into childClicks era? Instead mutate ordering fields the counter never reads:
    // keep all checked fields green, corrupt the click coordinates (counter never reads l.click).
    const l = leg(r, 'X-1');
    l.click = { x: 5, y: 5 }; // wording: click at #s centre; counter never checks l.click at all
    return r;
  }],
  ['d', 'cross-error-case-or-whitespace-variant', (r) => {
    // Wording: "exactly the error message 'Node is not a file input element'".
    // Counter DOES enforce exact string (line 157, CROSS_ERROR). So exactness IS enforced in receipt fields.
    // Forgery instead targets a different exactness gap: chooser mode/frame binding.
    // Actually we keep error exact; we attack "with B the backendNodeId of the chooser event":
    // counter never checks describe*/answer used the SAME B as the chooser event; it trusts recorded
    // describers/answers without a B field. Add a phantom second chooser? No — chooser count enforced.
    // The B-identity gap: receipt has no field binding describePage/crossAnswer to B at all.
    // Strongest forge: move the "correct" answer to a DIFFERENT backend id in reality while receipt
    // fields stay green — receipt cannot represent that, so counter cannot detect it. Document via
    // chooser backendNodeId mutation that does NOT propagate (describers have no B to disagree):
    const l = leg(r, 'X-1');
    l.choosers[0].backendNodeId = 99999; // receipt never records which B was used for describe/answer
    return r;
  }],
  ['e', 's-arm-cross-answer-field-null-while-sent', (r) => {
    // Wording S arm: "no cross-session answer is sent". Counter (line 161) only requires
    // crossAnswer===null && filesAfterCross===null. A driver that DID send a cross-session answer but
    // omitted the field (or recorded null) passes. Forge: S receipt claiming no cross answer while in
    // reality the driver sent one — undetectable if field omitted. Simulate by S leg where crossAnswer
    // null but filesAfterCross carries the post-cross files under a different reading:
    // here we set S childFiles as if no cross attempt preceded the page answer — counter agrees.
    // To make it a crisp violation: give S-1 a crossAnswer of null BUT filesAfterCross=[] — counter
    // line 161 requires BOTH null, so that fails. Instead the real gap is non-observability:
    // a null field is a claim of absence, not evidence of absence. Demonstrate the dual:
    // S leg with crossAnswer null but extra unknown field proving a send happened:
    const l = leg(r, 'S-1');
    l.crossAnswerProvenance = 'sent-on-page-session-before-answer'; // extra field; counter ignores unknowns
    return r;
  }],
  ['f', 'browserVersion-browser-string-unbound', (r) => {
    // Wording 'both': "the leg's DevTools /json/version Browser is Chrome/155.0.8059.84".
    // Counter (line 135) compares l.browserVersion string only; it never re-fetches /json/version,
    // never binds browserVersion to browserId or to the receipt's chromium string.
    // Receipt chromium 'Chromium 155...' + leg browserVersion 'Chrome/155...' are independent strings.
    const l = leg(r, 'X-1');
    l.browserId = '9c61fa9b-e567-4a4b-a469-29df5a6a9b3e'; // unchanged; browserVersion forged in receipt mode trivially
    return r;
  }],
  ['g', 'fresh-browser-distinct-ids-same-browser', (r) => {
    // Wording 'both': "6 distinct DevTools browser ids" + "each leg in a fresh browser and profile".
    // Counter (line 124) checks id strings are UUID-shaped + distinct. It never verifies the process/
    // profile is actually fresh, and driver releases all legs sequentially. Six distinct UUID strings
    // from ONE browser's /json/version endpoint rotation would pass. Receipt-mode forge:
    // reassign browserIds to six distinct UUIDs all claimed fresh — passes by construction in receipt mode.
    r.legs.forEach((l, i) => { l.browserId = `11111111-2222-3333-4444-00000000000${i}`; });
    return r;
  }],
  ['h', 'leg-order-fabricated-in-receipt-mode', (r) => {
    // Wording: "for 3 repetitions of two arms in the order X-1,S-1,..." and "each leg in a fresh browser".
    // Counter leg-set (line 120) enforces array ORDER in receipt mode too. So order IS enforced on the
    // receipt file. The gap is temporal: --live driver runs legs in order by construction (driver line 253),
    // but a --receipt file claiming that order is just an array — wall-clock execution order is unrecorded.
    // Forge: swap generatedAt/timestamps? Receipt has no per-leg timestamps at all. Add none; instead
    // note the driver's generatedAt is unchecked. Set generatedAt to a nonsense value:
    r.generatedAt = 'not-a-date';
    return r;
  }],
  ['i', 'describeChooser-panel-vs-input', (r) => {
    // INPUT check reads attributes array; a nodeName INPUT with attributes ['type','file','id','s'] in
    // any order passes, including EXTRA attributes (e.g. a second input's attrs). Counter attr() scans
    // pairs and returns first match; duplicate 'id' pairs with second value different still pass if first is 's'.
    const l = leg(r, 'X-1');
    l.describeChooser.attributes = ['type', 'file', 'id', 's', 'id', 'other', 'type', 'file'];
    return r;
  }],
  ['j', 'answer-file-content-never-checked', (r) => {
    // Wording 'both': child files [[tabi-r93-answer.txt,22]]. Counter checks [name,size] pairs recovered
    // via child's __files() (__files returns [name,size] only, driver line 99). File CONTENT (the 22-byte
    // 'tabi round 93 answer.\n') is never read back; any 22-byte file named tabi-r93-answer.txt passes.
    // Receipt-mode forge: answer size stays 22 — content is invisible to both driver and counter.
    // Demonstrate by noting the answerPath content is driver-local; receipt cannot evidence content.
    // Mutation: none needed — document as construction gap; keep receipt identical except generatedAt.
    r.generatedAt = '2026-11-08T23:46:19.210Z';
    return r;
  }],
];
const results = [];
for (const [letter, slug, mut] of cases) {
  const file = path.join(OUTDIR, `R93Critic1-${letter}-${slug}.json`);
  fs.writeFileSync(file, JSON.stringify(mut(clone()), null, 2) + '\n');
  const res = spawnSync(process.execPath, [COUNTER, '--lane', LANE, '--expect-driver-sha256', PIN, '--receipt', file, '--expect-nonce', NONCE], { encoding: 'utf8' });
  let ids = [];
  try { ids = [...new Set(JSON.parse(res.stdout).findings.map((f) => f.id))]; } catch {}
  results.push({ file, rc: res.status, ids });
  console.log(`${letter} ${slug}: rc=${res.status} findings=${JSON.stringify(ids)}`);
}
console.log(JSON.stringify(results, null, 2));
