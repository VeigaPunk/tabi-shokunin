#!/usr/bin/env node
// chromium-receipt-r58.mjs — tabi round 58 counter for claim C2 (coverage:
// capability chromium-keyevent-preventdefault-swallow-linux — the
// preventDefault-SWALLOW domain on the Linux host's Chromium 155 headless
// surface, witnessed page-side).
//
// BASE: the frozen r57 counter (.ufo/waves/round-57/counters/
// chromium-receipt-r57.mjs), copied and extended. Every r57 finding id is
// kept with the same semantics; r57 bytes are never edited and the r57
// counter still scores r57 receipts. This file is the r58 generation.
//
// PREDICATE-SENTENCE (frozen in .ufo/waves/round-58/claims.json before any
// seat ran; this file implements it and never amends it): the counter admits
// a receipt with schema tabi-chrome-cdp-r58 whose nonce matches
// ^tabi-r58-[0-9a-f]{12}$ AND is invocation-bound (present in the server log
// or in the typed values), whose driverSha256 equals the sha256 of the
// driver bytes AND of --expect-driver-sha256 when that pin is given, whose
// child argv carries an absolute --user-data-dir naming a throwaway
// profile-<launchToken> dir, whose plain trace re-derives as nonce prefixes,
// whose control domain witnesses End (negative edit), Backspace (exact
// residue), restore (exact nonce), Tab (field -> field2 by
// document.activeElement) and one Enter implicit submission seen
// server-side, whose page keylog window has the length the control domain
// implies, whose server log carries exactly one /echo entry, whose six named
// steps are present in order with committed PNG bytes hashing to their pins
// and carrying the PNG signature and a non-degenerate IHDR, whose teardown
// left no survivor; whose r57 modifier domain is carried end to end (the
// Shift-chord trace of the nonce UPPERCASED into #field2 with every
// uppercase letter's recorded real Shift keyDown/keyUp pair and modifiers 8,
// #field2 ending exactly at the uppercased nonce, the chord leg on the first
// [a-f] of the nonce hex tail with recorded modifier bits 2/1/4 and the
// matching page-side booleans, #field3 carrying no name attribute); AND —
// the r58 generation — whose preventDefault-swallow domain is witnessed end
// to end on #field3 AFTER the chord leg and BEFORE the carried final Enter
// submit: (s1) gate OFF, the first two characters of the nonce hex tail are
// inserted (valueAfter equals them, defaultPrevented false recorded on both
// keystrokes); (s2) gate ON {Backspace}, the delivered Backspace keydown
// records cancelable true and defaultPrevented true and the field value is
// UNCHANGED; (s3) gate ON {<third hex-tail character>}, its delivered
// keydown records defaultPrevented true and the value is UNCHANGED; (s4)
// gate ON {Enter}, ONE Control+Enter chord is delivered with modifier bit 2
// on the Enter event and defaultPrevented true and does NOT submit (the
// fixture server sees exactly ONE request carrying field and field2 and NOT
// field3, and none carrying field3); every swallow-leg keylog entry carries
// the recorder's two new fields cancelable and defaultPrevented; the
// receipt discloses fixtureDelta; #field3 was empty when the swallow leg
// began (swallowLeg.control.valueBefore) and the chord-leg negative witness
// chordLeg.field3ValueAfter stayed empty, while the top-level
// field3Value/field3Final (read after the swallow leg) equal that typed
// two-character prefix; and journey.form.pageKeylog is cross-checked ENTRY
// BY ENTRY against the sequence this counter RE-DERIVES from the receipt's
// own nonce (the r52..r58 defence), with the swallow section, when recorded,
// matching the same re-derivation; and the receipt's own predicate flag is
// true.
//
// RECEIPT CONTRACT (r58; the counter is the scoring authority for it; the r57
// contract below is carried verbatim and the r58 block extends it):
//   top level, unchanged from r56: schema, nonce, driverSha256,
//     host{chromium,argv,launchToken}, fixture{formSha256,origin,
//     field3NameAttribute?}, plainTrace{entries[]},
//     controlDomain{end,backspace,restore,tab,enter}, keylog{entries,
//     length,window}, serverLog[], field3Value, steps[], teardown,
//     predicate.
//   r57 additions:
//     field3Final                "" — #field3 after the whole modifier leg
//     journey.form.shiftTrace    { value, valueBeforeFirstKey,
//                                  typing[] | entries[],
//                                  field2ValueAfterTyping,
//                                  fieldValueAfterTyping?, keyEventCount? }
//        each trace entry: { i, char, key?, code?, windowsVirtualKeyCode?,
//                            shiftRide, modifiers, valueAfter,
//                            valueAfterField, ride? }
//        ride (uppercase entries ONLY): { keyDown:{key:'Shift',
//                            code:'ShiftLeft',keyCode:16,modifiers:8,
//                            shiftKey:true}, keyUp:{...} }
//     journey.form.chordLeg      { derivation?, hexTail?, letter,
//                                  letterCode?, letterWindowsVirtualKeyCode?,
//                                  chords:[{name,bit,key?,code?,keyEvents...,
//                                  domEvents?[2]}], field3TargetId?,
//                                  field3ValueAfter }
//     journey.form.field3NameAttribute  null|"" (absent) | "<name>" (finding)
//     journey.form.pageKeylog    ARRAY of entries covering the WHOLE run in
//                                  leg order plain,control,shift,chord —
//                                  OR { legs:['plain'|'control'|'shift'|
//                                  'chord'...], entries:[...] } (declared
//                                  legs MUST include shift and chord).
//                                  Every entry:
//                                    { type:'keyDown'|'keyUp', key, code,
//                                      keyCode, modifiers, ctrlKey, altKey,
//                                      metaKey, shiftKey, targetId }
//                                  — `modifiers` is the S153 bit mirror the
//                                  fixture recorder computes from the DOM
//                                  booleans (Alt=1, Ctrl=2, Meta=4, Shift=8),
//                                  `targetId` is the element the event was
//                                  delivered to ('field' | 'field2' |
//                                  field3TargetId, default 'field3').
//                                  The r56 `keylog` block stays the
//                                  keydown-only control-domain slice of
//                                  window.__keylog (r56 semantics intact);
//                                  pageKeylog is the r57 full record.
//   r58 additions (all r57 fields carried; the two recorder fields are
//   ADDITIVE and appear on EVERY entry the r58 page recorder writes):
//     journey.form.swallowLeg   { control:{ valueBefore, typed, valueAfter,
//                                  defaultPrevented },
//                                  backspaceSwallow:{ valueBefore,
//                                  valueAfter, defaultPrevented,
//                                  cancelable?, keylogEntry?|keylogEntries? },
//                                  digitSwallow:{ key?, valueBefore,
//                                  valueAfter, defaultPrevented,
//                                  cancelable?, keylogEntry?|keylogEntries? },
//                                  enterChordSwallow:{ ctrlKeylogEntry,
//                                  enterKeylogEntry, submitted,
//                                  valueBefore?, valueAfter?, queryKeys? },
//                                  restore? }
//        Every entry recorded by the r58 recorder carries, in addition to
//        the r57 fields, `cancelable` and `defaultPrevented` (read AFTER the
//        page's own capture-phase swallower ran).
//     fixtureDelta               object — the disclosed fixture delta (the
//        swallower + the two additive recorder fields). The runner records it
//        at the RECEIPT TOP LEVEL; a journey.form copy is also admitted.
//        Presence is REQUIRED; when it names the new fields they must
//        include cancelable AND defaultPrevented.
//     journey.form.serverRequests ARRAY of { path, query } — the fixture
//        server's own request log (/form, /favicon.ico, the /echo).
//        Exactly ONE row with path '/echo' may carry `field` and `field2`
//        (and must not carry `field3`); no row may carry `field3`.
//     journey.form.declaredStepNames? — the driver's declared step list.
//     stepsExtended[]            chronological evidence log; when present,
//        every entry that pins a png is hashed with the same PNG geometry
//        witness (the four swallow shots ride beside the six carried steps
//        and the r57 shots).
//     top-level field3Value/field3Final — read at the carried point (now
//        AFTER the swallow leg): the typed two-character prefix, never a
//        submitted value.
//
// DERIVATION RULES (the r52..r58 defence, restated for r58):
//   * every expected value is derived from the receipt's own nonce: the
//     per-keystroke #field prefixes (plain), the residue (Backspace), the
//     uppercased string (shift leg), the chord letter (first [a-f] of the
//     nonce hex tail), the swallow control's two characters (the FIRST TWO
//     hex-tail characters), the swallowed insertion character (the THIRD
//     hex-tail character), the per-character key/code/keyCode and the
//     modifiers/boolean plan of every dispatched keydown.
//   * the Shift plan is derived per character: /[A-Z]/ rides Shift
//     (modifiers 8, a Shift keyDown/keyUp pair, key = the uppercase char,
//     code = KeyX, VK = 65+(char-65)); digits and '-' do not (modifiers 0,
//     no ride). A digit or '-' carrying modifiers 8 (or any other shifted
//     shape) is a finding.
//   * the chord plan is derived per chord: Control bit 2, Alt bit 1, Meta
//     bit 4 (S153's Input.dispatchKeyEvent modifiers bit field); the page's
//     booleans are the S161 ground (ctrlKey/altKey/metaKey/shiftKey).
//   * the SWALLOW plan is derived from the same hex tail: the control leg's
//     two characters are tail[0], tail[1] (target #field3, modifiers 0, the
//     page's swallower OFF); the swallowed insertion is tail[2]; the
//     swallowed Backspace is the Backspace key (modifiers 0); the swallowed
//     chord is Control then Enter with modifiers bit 2. The swallow-ON
//     entries must record defaultPrevented TRUE (S161: the default action
//     was cancelled); the control entries must record FALSE. The value read
//     back after a swallowed edit must EQUAL the pre-step value — a prefix
//     match or a boolean claim is not the witness.
//   * pageKeylog is re-derived from the nonce and compared entry by entry:
//     key/code/keyCode -> keylog-entry-mismatch; the chord entries'
//     booleans -> boolean-mismatch; every other entry's booleans ->
//     keylog-entry-mismatch. When the record continues past the four
//     carried legs, the continuation must equal the re-derived swallow
//     plan EXACTLY (same order, identities, modifiers bit, target); an
//     absent continuation is admitted because the swallow witnesses are
//     also recorded per block in journey.form.swallowLeg (never weaken a
//     recorded continuation).
//   * when the nonce is unusable (absent or shape-wrong) the nonce-derived
//     comparisons cannot evaluate: the shape checks still run and the
//     derivation is recorded in couldNotEvaluate as nonce-unusable (never
//     silently passed).
//   * a nonce whose 12-hex tail carries no [a-f] cannot derive the chord
//     letter: that receipt is refused with chord-char-mismatch naming the
//     underivable tail (the runner's nonce generator must reject such a
//     tail — a 1-in-285 draw at 12 hex chars).
//
// FINDING IDS — EXACT, FROZEN r58 (a fixture asserts the exact set):
//   carried from r56 unchanged (29):
//   receipt-missing, receipt-unparseable, schema-wrong, nonce-shape,
//   nonce-not-invocation-bound, driver-sha-mismatch, driver-missing,
//   profile-not-throwaway, host-browser-mismatch, host-argv-home-leak,
//   plain-trace-wrong, plain-trace-missing,
//   control-domain-missing, control-end-witness-wrong,
//   control-backspace-witness-wrong, control-restore-witness-wrong,
//   control-tab-focus-wrong, control-enter-submit-wrong, field3-not-empty,
//   keylog-missing, keylog-length-wrong, server-log-missing,
//   server-log-echo-count, steps-missing,
//   png-missing, png-sha-mismatch, png-not-png, teardown-survivor,
//   predicate-false.
//   new in r57 (14), carried unchanged:
//   shift-trace-missing, shift-prefix-mismatch, shift-modifiers-wrong,
//   shift-ride-missing, shift-unshifted-char-wrong, field2-final-mismatch,
//   chord-missing, chord-modifiers-wrong, keylog-absent,
//   keylog-entry-mismatch, boolean-mismatch, chord-char-mismatch,
//   field3-named, server-field2-mismatch.
//   new in r58 (6):
//   swallow-control-inserted-wrong, swallow-defaultprevented-missing,
//   swallow-value-changed, swallow-enter-chord-leak, swallow-plan-mismatch,
//   swallow-recorder-fields-missing.
//
// PRE-FREEZE AMENDMENTS (R57Critic items 1 and 2, sanctioned by the L1 before
// the freeze commit and disclosed in the wave report):
//   * (1) the runner runs the Enter leg LAST, so #field2 legitimately carries
//     the UPPERCASED nonce at submit time. The r56 clause that required
//     serverSawField2 === '' is therefore REPLACED by server-field2-mismatch
//     with the strengthened expectation serverSawField2 === nonce.toUpperCase().
//     control-enter-submit-wrong keeps `submitted` and `serverSawField`.
//   * (2) the page keylog entries carry the event type, the S153 modifiers
//     bit mirror and the target identity, and the counter checks ENTRY
//     CONTENT, not only length/window: the keyDown subsequence must equal the
//     re-derived sequence (identity, booleans, modifiers bit, targetId), and
//     every uppercase letter's keydown must be BRACKETED by a Shift
//     keyDown/keyUp pair in the raw record, in order. A missing type,
//     modifiers or target identity field is itself keylog-entry-mismatch —
//     the check is never weakened to fit a missing field.
//     (the r56 keylog window check keeps its keydown-only semantics: the
//     fixture's r56 recorder window.__keylog stays keydown-only; the r57
//     witness is the separate journey.form.pageKeylog record, which carries
//     both types.)
//
// ID SEMANTICS THAT NEED A SENTENCE (the rest are documented at their check):
//   * field3-not-empty (r58 semantics, carried id): #field3 is NEVER
//     submitted and its witnesses are consistent at every recorded point.
//     The chord-leg witness (journey.form.chordLeg.field3ValueAfter or
//     rec.field3Final when the chord leg is where it is read) must be EMPTY,
//     the swallow leg must START empty (swallowLeg.control.valueBefore ===
//     '') and the top-level field3Value/field3Final (read AFTER the swallow
//     leg) must equal the derived two-character prefix. Anything else — an
//     unexpected value at any of those points, or no post-chord / start
//     witness at all — is refused under the same id. When the nonce is
//     unusable the r56 clause is carried unchanged (both top-level values
//     must be ''), since no prefix can be derived.
//   * field3-named fires when a recorded #field3 name attribute is a
//     non-empty string (fixture echo or form record) AND when NO such
//     record exists at all: the frozen claim's witness is the ABSENCE of a
//     name attribute, and an absent witness cannot establish it.
//   * shift-modifiers-wrong covers the shifted keystroke's event identity
//     (key/code/VK) AND its modifiers: an uppercase letter whose recorded
//     event is not the shifted one is the same failure class.
//   * shift-trace-missing covers an absent/incomplete trace: missing block,
//     missing entry array, wrong length, wrong index or wrong character at
//     an index. The per-keystroke prefix chain has its own id.
//   * chord-missing covers an absent chordLeg, a chords array that is not
//     exactly the three named chords, and a named chord whose recorded
//     modifier key identity is not that modifier.
//   * swallow-control-inserted-wrong (s1) covers the gate-OFF control
//     insertion: swallowLeg.control absent, `typed` not the derived first two
//     hex-tail characters, `valueAfter` not equal to them, or the two
//     control keylog entries missing / carrying the wrong key identity.
//   * swallow-defaultprevented-missing covers the witness VALUE on a
//     swallow-leg keylog entry: TRUE is required on the swallowed
//     Backspace, the swallowed insertion and the Enter of the swallowed
//     chord; FALSE is required on the gate-OFF control entries and on the
//     chord's Control keydown (the declared swallow set is {Enter}). A
//     recorded cancelable=false is the same failure class — a
//     non-cancelable keydown cannot carry the preventDefault witness. A
//     missing field is the recorder defect below, not this id.
//   * swallow-value-changed covers the negative edit witness: the value
//     read back after the swallowed Backspace or the swallowed insertion
//     differs from the pre-step value (the control leg's valueAfter).
//   * swallow-enter-chord-leak covers s4's no-submission witness: the chord
//     block records submitted !== false; no serverRequests log is recorded;
//     the number of requests whose query carries `field` and `field2` (and
//     not `field3`) is not exactly one; or any request carries `field3`.
//   * swallow-plan-mismatch covers the swallow plan as re-derived from the
//     nonce: journey.form.swallowLeg absent; a required block absent; a
//     required keylog entry absent from both the block and the pageKeylog
//     continuation; a recorded swallow entry whose key/code/keyCode,
//     modifiers bit or targetId differs from the derivation; or a pageKeylog
//     continuation that is not exactly the derived swallow sequence.
//   * swallow-recorder-fields-missing covers the disclosure/witness surface:
//     journey.form.fixtureDelta absent (or, when it names the new fields,
//     naming fewer than cancelable AND defaultPrevented), and any swallow-leg
//     keylog entry lacking `cancelable` or `defaultPrevented` as booleans.
//
// DEDUPE: one entry per id, first detail retained, `occurrences` counted —
// so a fixture's expected set is a set, not a multiset.
//
// Cross-generation refusals BY CONSTRUCTION (both directions shipped as
// fixtures so the L1 can re-run them on committed bytes):
//   * the r57 counter refuses an r58 receipt on schema (tabi-chrome-cdp-r57
//     counter's schema check) — run by the L1 at the data pass, not
//     fabricated here;
//   * this counter refuses the COMMITTED r57 receipt (schema-wrong FIRST,
//     then nonce-shape; the swallow derivation records nonce-unusable
//     instead of silently passing) — receipt in
//     .ufo/waves/round-58/measure/c2-r58counter-refuses-r57.json;
//   * this counter refuses an r56/r57-SHAPED receipt (no swallowLeg /
//     fixtureDelta / serverRequests) — relabelled to the r58 schema a
//     nonce-usable receipt trips swallow-plan-mismatch and
//     swallow-recorder-fields-missing; the r57-shaped fixtures carried here
//     inject a valid derived swallow leg so each carried refusal keeps its
//     EXACT r57 finding set (the carry proves the old checks still fire).
//
// Declared residual (the r44..r58 class, pre-declared, NOT a predicate
// change): a counter over committed bytes cannot by itself prove a browser
// ran. The re-derivation path is re-running the committed runner (fresh
// nonce, fresh fixture port per invocation) and re-hashing the committed
// PNGs. Second residual: the r56 plain-trace clause still admits a trace
// that stops early (each valueAfter is a prefix of the nonce of its own
// length); it is caught only by the control-domain witnesses and the
// invocation binding — unchanged from r56 and not strengthened here.
//
// Usage:
//   node chromium-receipt-r58.mjs <receipt.json> --driver <driver.mjs>
//        [--expect-driver-sha256 <hex>] [--shot <dir|png...>] [--json]
//   node chromium-receipt-r58.mjs --selftest
//   node chromium-receipt-r58.mjs --self-check
// Exit: 0 predicate met (no finding); 1 any finding; 2 usage.
// Writes nothing but stdout. Paths are resolved against cwd.
//
// FIXTURES (chromium-receipt-r58-fixtures/): every r57 case carried with the
// same case id and the same EXACT finding set (its base receipt relabelled
// to the r58 schema/nonce and given a valid nonce-derived swallow leg so the
// carry isolates the one check the case names), the r58 schema refusal, the
// committed-r57-shape cross refusal, plus one case per new r58 id seeded
// from the green synthetic receipt. --selftest asserts the EXACT finding set
// of every case and the full id coverage; see the fixture spec shape below.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-r58';
const NONCE_RE = /^tabi-r58-[0-9a-f]{12}$/;
const STEP_NAMES = ['a-start', 'b-typed', 'c-end-witness', 'd-backspace', 'e-tab', 'f-enter-echo'];
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const TOKEN_RE = /^[A-Za-z0-9._-]{4,}$/;
const CONTROL_LEGS = ['end', 'backspace', 'restore', 'tab'];
const CHORD_MODS = [
  { name: 'Control', bit: 2, key: 'Control', code: 'ControlLeft', vk: 17 },
  { name: 'Alt', bit: 1, key: 'Alt', code: 'AltLeft', vk: 18 },
  { name: 'Meta', bit: 4, key: 'Meta', code: 'MetaLeft', vk: 91 },
];
const KEYLOG_LEGS = ['plain', 'control', 'shift', 'chord'];
// r58: the swallow leg's declared names (a pageKeylog legs declaration may
// name them, all mapped to the one nonce-derived swallow plan).
const SWALLOW_LEG_NAMES = ['swallow', 'swallow-control', 'swallow-backspace', 'swallow-digit', 'swallow-enter', 'swallow-chord'];
const SWALLOW_FINDING_IDS = [
  'swallow-control-inserted-wrong', 'swallow-defaultprevented-missing',
  'swallow-value-changed', 'swallow-enter-chord-leak',
  'swallow-plan-mismatch', 'swallow-recorder-fields-missing',
];

// The frozen id list, verbatim and exhaustive — the selftest asserts every one
// of them is exercised by at least one fixture.
const FINDING_IDS = [
  // carried from r56, unchanged
  'receipt-missing', 'receipt-unparseable', 'schema-wrong', 'nonce-shape',
  'nonce-not-invocation-bound', 'driver-sha-mismatch', 'driver-missing',
  'profile-not-throwaway', 'host-browser-mismatch', 'host-argv-home-leak',
  'plain-trace-wrong', 'plain-trace-missing',
  'control-domain-missing', 'control-end-witness-wrong',
  'control-backspace-witness-wrong', 'control-restore-witness-wrong',
  'control-tab-focus-wrong', 'control-enter-submit-wrong', 'field3-not-empty',
  'keylog-missing', 'keylog-length-wrong', 'server-log-missing',
  'server-log-echo-count', 'steps-missing',
  'png-missing', 'png-sha-mismatch', 'png-not-png', 'teardown-survivor',
  'predicate-false',
  // new in r57
  'shift-trace-missing', 'shift-prefix-mismatch', 'shift-modifiers-wrong',
  'shift-ride-missing', 'shift-unshifted-char-wrong', 'field2-final-mismatch',
  'chord-missing', 'chord-modifiers-wrong', 'keylog-absent',
  'keylog-entry-mismatch', 'boolean-mismatch', 'chord-char-mismatch',
  'field3-named', 'server-field2-mismatch',
  // new in r58
  ...SWALLOW_FINDING_IDS,
];

const SELF = fileURLToPath(import.meta.url);
const FIXTURES_DIR = path.join(path.dirname(SELF), 'chromium-receipt-r58-fixtures');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-chromium-receipt-r58', error: msg }));
  process.exit(2);
}

function newFindings() {
  const list = [];
  const byId = new Map();
  const add = (id, detail) => {
    const prev = byId.get(id);
    if (prev) { prev.occurrences += 1; return; }
    const f = { id, detail: String(detail === undefined ? '' : detail).slice(0, 400), occurrences: 1 };
    byId.set(id, f);
    list.push(f);
  };
  return { list, add };
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const argvText = (argv) => (Array.isArray(argv) ? argv.map((x) => String(x)).join(' ') : typeof argv === 'string' ? argv : '');
const has = (o, k) => isObj(o) && Object.prototype.hasOwnProperty.call(o, k);

// --user-data-dir extraction: both `--user-data-dir=PATH` and
// `--user-data-dir PATH` forms, first match wins.
function userDataDirArg(text) {
  const m = /--user-data-dir(?:=|\s+)(?:"([^"]+)"|'([^']+)'|(\S+))/.exec(text);
  if (!m) return null;
  return m[1] || m[2] || m[3] || null;
}

function impliedKeydowns(cd) {
  if (!cd) return 4;
  let n = 0;
  for (const leg of CONTROL_LEGS) if (isObj(cd[leg])) n += 1;
  return n;
}

// PNG presence check: file exists, sha256 equals the pin, signature present,
// and the IHDR chunk is structurally sane (r58 carry of the PNG geometry
// witness: a 8-byte signature alone is not a PNG).
function checkStepPng(step, baseDir, add, overrideAbs) {
  const rel = step && typeof step.png === 'string' ? step.png : null;
  if (!rel && !overrideAbs) { add('png-missing', 'step ' + JSON.stringify(step && step.name) + ' has no png path'); return; }
  const abs = overrideAbs || path.resolve(baseDir, rel);
  let buf = null;
  try { buf = fs.readFileSync(abs); } catch { add('png-missing', abs); return; }
  const got = sha256(buf);
  if (typeof step.sha256 !== 'string' || got !== step.sha256) {
    add('png-sha-mismatch', abs + ' sha ' + got + ' != pin ' + step.sha256);
  }
  if (!(buf.length >= 8 && buf.subarray(0, 8).equals(PNG_MAGIC))) { add('png-not-png', abs); return; }
  // IHDR must be the first chunk, 13 bytes, with non-zero geometry.
  if (buf.length < 33 || buf.toString('latin1', 12, 16) !== 'IHDR' || buf.readUInt32BE(8) !== 13) {
    add('png-not-png', abs + ' has no first IHDR chunk');
    return;
  }
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (!(w > 0 && h > 0)) add('png-not-png', abs + ' IHDR geometry ' + w + 'x' + h);
}

// --- key identity derivation (S153's Windows virtual-key model) -------------
function vkFor(ch) {
  if (/[0-9]/.test(ch)) return 48 + Number(ch);
  if (/[a-zA-Z]/.test(ch)) return 65 + (ch.toUpperCase().charCodeAt(0) - 65);
  if (ch === '-') return 189;
  return null;
}
function codeFor(ch) {
  if (/[0-9]/.test(ch)) return 'Digit' + ch;
  if (/[a-zA-Z]/.test(ch)) return 'Key' + ch.toUpperCase();
  if (ch === '-') return 'Minus';
  return null;
}
const boolsFor = (bit) => ({ ctrlKey: bit === 2, altKey: bit === 1, metaKey: bit === 4, shiftKey: false });
const NO_MODS = { ctrlKey: false, altKey: false, metaKey: false, shiftKey: false };

// The uppercased nonce is the Shift leg's target.
const mixedOf = (nonceStr) => (typeof nonceStr === 'string' ? nonceStr.toUpperCase() : null);
// The chord letter: first [a-f] of the nonce hex tail (split('-')[2]); null
// when the tail has none (underivable — see the header).
function chordLetterOf(nonceStr) {
  if (typeof nonceStr !== 'string') return null;
  const tail = nonceStr.split('-')[2] || '';
  const m = /([a-f])/.exec(tail);
  return m ? m[1] : null;
}
function hexTailOf(nonceStr) {
  return typeof nonceStr === 'string' && nonceStr.split('-').length > 2 ? (nonceStr.split('-')[2] || '') : '';
}

// The complete page KEYDOWN plan, re-derived from the nonce for the declared
// legs, in the frozen leg order. `leg` tags each entry so the chord entries'
// booleans get their own finding id; `modifiers` is the S153 bit mirror the
// fixture recorder computes from the DOM booleans (Alt=1, Ctrl=2, Meta=4,
// Shift=8); `targetId` is the element the event was delivered to.
const bitOfBools = (b) => (b.altKey ? 1 : 0) | (b.ctrlKey ? 2 : 0) | (b.metaKey ? 4 : 0) | (b.shiftKey ? 8 : 0);
function derivePageKeylog(nonceStr, legs, letter, f3Target) {
  const out = [];
  const push = (leg, o) => out.push({ leg, type: 'keyDown', ...o, modifiers: bitOfBools(o) });
  if (legs.includes('plain')) {
    for (const ch of nonceStr) push('plain', { key: ch, code: codeFor(ch), keyCode: vkFor(ch), ...NO_MODS, targetId: 'field' });
  }
  if (legs.includes('control')) {
    push('control', { key: 'End', code: 'End', keyCode: 35, ...NO_MODS, targetId: 'field' });
    push('control', { key: 'Backspace', code: 'Backspace', keyCode: 8, ...NO_MODS, targetId: 'field' });
    const last = nonceStr[nonceStr.length - 1];
    push('control', { key: last, code: codeFor(last), keyCode: vkFor(last), ...NO_MODS, targetId: 'field' });
    push('control', { key: 'Tab', code: 'Tab', keyCode: 9, ...NO_MODS, targetId: 'field' });
  }
  if (legs.includes('shift')) {
    for (const ch of mixedOf(nonceStr)) {
      const ride = /[A-Z]/.test(ch);
      if (ride) push('shift', { key: 'Shift', code: 'ShiftLeft', keyCode: 16, ...NO_MODS, shiftKey: true, targetId: 'field2' });
      push('shift', { key: ch, code: codeFor(ch), keyCode: vkFor(ch), ...NO_MODS, shiftKey: ride, targetId: 'field2' });
    }
  }
  if (legs.includes('chord') && letter) {
    for (const cm of CHORD_MODS) {
      push('chord', { key: cm.key, code: cm.code, keyCode: cm.vk, ...boolsFor(cm.bit), targetId: f3Target });
      push('chord', { key: letter, code: 'Key' + letter.toUpperCase(), keyCode: 65 + (letter.charCodeAt(0) - 97), ...boolsFor(cm.bit), targetId: f3Target });
    }
  }
  return out;
}

// r58: the swallow leg's KEYDOWN plan, re-derived from the same nonce hex
// tail. Gate OFF inserts the first two tail characters into #field3; gate ON
// swallows the Backspace, the third tail character and one Control+Enter
// chord (S153 modifier bit 2), all on f3Target.
function deriveSwallowKeydowns(nonceStr, f3Target) {
  const tail = hexTailOf(nonceStr);
  const out = [];
  const push = (o) => out.push({ leg: 'swallow', type: 'keyDown', ...o, modifiers: bitOfBools(o) });
  const d1 = tail[0];
  const d2 = tail[1];
  const d3 = tail[2];
  push({ key: d1, code: codeFor(d1), keyCode: vkFor(d1), ...NO_MODS, targetId: f3Target });
  push({ key: d2, code: codeFor(d2), keyCode: vkFor(d2), ...NO_MODS, targetId: f3Target });
  push({ key: 'Backspace', code: 'Backspace', keyCode: 8, ...NO_MODS, targetId: f3Target });
  push({ key: d3, code: codeFor(d3), keyCode: vkFor(d3), ...NO_MODS, targetId: f3Target });
  push({ key: 'Control', code: 'ControlLeft', keyCode: 17, ...boolsFor(2), targetId: f3Target });
  push({ key: 'Enter', code: 'Enter', keyCode: 13, ...boolsFor(2), targetId: f3Target });
  return out;
}

// Every keylog entry a swallowLeg block may embed (the runner records the
// per-block copies the same way the r57 chordLeg.domEvents does).
const ENTRY_KEYS = ['keylogEntry', 'keylogEntries', 'keylog', 'entries', 'keydowns', 'keyEvents', 'domEvents', 'ctrlKeylogEntry', 'enterKeylogEntry', 'event'];
function entriesOfBlock(b) {
  const out = [];
  if (!isObj(b)) return out;
  for (const k of ENTRY_KEYS) {
    const v = b[k];
    if (isObj(v) && (v.type === 'keyDown' || v.type === 'keyUp')) out.push(v);
    else if (Array.isArray(v)) for (const e of v) if (isObj(e) && (e.type === 'keyDown' || e.type === 'keyUp')) out.push(e);
  }
  return out;
}

// r58 swallow domain (k1..k5). Every expected value/identity is derived from
// the receipt's own nonce; recorded entries are only ever the SUBJECT of the
// comparison, never its source of truth.
function checkSwallow(rec, form, nonceStr, f3Target, pageKd, add) {
  const tail = hexTailOf(nonceStr);
  const wantPrefix = tail.slice(0, 2);
  const d1 = tail[0];
  const d2 = tail[1];
  const d3 = tail[2];
  const sl = form && isObj(form.swallowLeg) ? form.swallowLeg : null;

  // k5 (disclosure): fixtureDelta is REQUIRED whenever a nonce can derive the
  // leg, independently of whether the leg blocks were recorded. The runner
  // records it at the receipt top level; a form-level copy is also admitted.
  const fd = (form && isObj(form.fixtureDelta)) ? form.fixtureDelta
    : (isObj(rec.fixtureDelta) ? rec.fixtureDelta : null);
  if (!fd) add('swallow-recorder-fields-missing', 'fixtureDelta absent (the fixture delta is not disclosed)');
  else {
    const names = [];
    for (const k of ['recorderFields', 'additiveRecorderFields', 'newFields', 'addedFields']) {
      if (Array.isArray(fd[k])) names.push(...fd[k]);
    }
    if (names.length > 0 && !(names.includes('cancelable') && names.includes('defaultPrevented'))) {
      add('swallow-recorder-fields-missing', 'fixtureDelta names ' + JSON.stringify(names) + ' but not cancelable AND defaultPrevented');
    }
    if (isObj(fd.witness) && fd.witness.allCarryAdditiveFields === false) {
      add('swallow-recorder-fields-missing', 'fixtureDelta.witness.allCarryAdditiveFields=false');
    }
  }

  if (!sl) {
    add('swallow-plan-mismatch', 'journey.form.swallowLeg absent (no preventDefault-swallow domain recorded)');
    return;
  }

  const ctl = isObj(sl.control) ? sl.control : null;
  const bs = isObj(sl.backspaceSwallow) ? sl.backspaceSwallow : null;
  const dg = isObj(sl.digitSwallow) ? sl.digitSwallow : null;
  const en = isObj(sl.enterChordSwallow) ? sl.enterChordSwallow : null;

  // ---- k1: the gate-OFF control insertion ------------------------------
  if (!ctl) add('swallow-plan-mismatch', 'swallowLeg.control absent');
  else {
    const typedOk = Array.isArray(ctl.typed)
      ? (ctl.typed.length === 2 && String(ctl.typed[0]) === d1 && String(ctl.typed[1]) === d2)
      : ctl.typed === wantPrefix;
    if (!typedOk) add('swallow-control-inserted-wrong', 'control.typed ' + JSON.stringify(ctl.typed) + ' != ' + JSON.stringify([d1, d2]));
    if (ctl.valueAfter !== wantPrefix) add('swallow-control-inserted-wrong', 'control.valueAfter ' + JSON.stringify(ctl.valueAfter) + ' != ' + JSON.stringify(wantPrefix));
    if (ctl.swallowOn !== undefined && ctl.swallowOn !== false) add('swallow-plan-mismatch', 'control.swallowOn=' + JSON.stringify(ctl.swallowOn) + ' (the control leg runs with the gate OFF)');
    if (typeof ctl.valueBefore === 'string' && ctl.valueBefore !== '') add('field3-not-empty', '#field3 not empty when the swallow leg began: ' + JSON.stringify(ctl.valueBefore));
  }

  // ---- the recorded keylog entries -------------------------------------
  const pool = [];
  for (const src of [ctl, bs, dg, en]) for (const e of entriesOfBlock(src)) pool.push(e);
  for (const e of pageKd) pool.push(e);
  for (const e of pool) {
    if (typeof e.cancelable !== 'boolean' || typeof e.defaultPrevented !== 'boolean') {
      add('swallow-recorder-fields-missing', 'swallow-leg entry ' + JSON.stringify(e.key) + ' lacks cancelable/defaultPrevented booleans');
    }
  }

  const expected = [
    { where: 'control', key: d1, code: codeFor(d1), keyCode: vkFor(d1), bit: 0, dp: false, block: ctl },
    { where: 'control', key: d2, code: codeFor(d2), keyCode: vkFor(d2), bit: 0, dp: false, block: ctl },
    { where: 'backspaceSwallow', key: 'Backspace', code: 'Backspace', keyCode: 8, bit: 0, dp: true, block: bs },
    { where: 'digitSwallow', key: d3, code: codeFor(d3), keyCode: vkFor(d3), bit: 0, dp: true, block: dg },
    { where: 'enterChordSwallow', key: 'Control', code: 'ControlLeft', keyCode: 17, bit: 2, dp: false, block: en },
    { where: 'enterChordSwallow', key: 'Enter', code: 'Enter', keyCode: 13, bit: 2, dp: true, block: en },
  ];
  for (const exp of expected) {
    const kd = (e) => objType(e) === 'keyDown';
    const ownAll = entriesOfBlock(exp.block).filter(kd);
    const own = ownAll.filter((e) => e.key === exp.key && e.code === exp.code && e.keyCode === exp.keyCode);
    const any = pool.filter((e) => kd(e) && e.key === exp.key && e.code === exp.code && e.keyCode === exp.keyCode);
    if (ownAll.length > 0 && own.length === 0) {
      add('swallow-plan-mismatch', exp.where + ' block records ' + ownAll.length + ' keydown(s), none keyed ' + JSON.stringify(exp.key) + ' (' + exp.code + '/' + exp.keyCode + ')');
      continue;
    }
    const found = own.length ? own : any;
    if (!found.length) {
      add('swallow-plan-mismatch', 'no recorded keylog entry for ' + exp.where + ' key ' + JSON.stringify(exp.key) + ' (' + exp.code + '/' + exp.keyCode + ')');
      continue;
    }
    const e = found[0];
    if (typeof e.modifiers !== 'number' || e.modifiers !== exp.bit) {
      add('swallow-plan-mismatch', exp.where + ' key ' + exp.key + ' modifiers ' + JSON.stringify(e.modifiers) + ' != ' + exp.bit);
    }
    const boolOk = e.ctrlKey === (exp.bit === 2) && e.altKey === false && e.metaKey === false && e.shiftKey === false;
    if (['ctrlKey', 'altKey', 'metaKey', 'shiftKey'].some((k) => typeof e[k] !== 'boolean') || !boolOk) {
      add('swallow-plan-mismatch', exp.where + ' key ' + exp.key + ' booleans ' + JSON.stringify({ ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey }) + ' != bit ' + exp.bit);
    }
    if (typeof e.targetId !== 'string' || e.targetId !== f3Target) {
      add('swallow-plan-mismatch', exp.where + ' key ' + exp.key + ' targetId ' + JSON.stringify(e.targetId) + ' != ' + JSON.stringify(f3Target));
    }
    if (e.cancelable === false) {
      add('swallow-defaultprevented-missing', exp.where + ' key ' + exp.key + ' recorded cancelable=false: the default action could not be cancelled');
    }
    if (typeof e.defaultPrevented === 'boolean' && e.defaultPrevented !== exp.dp) {
      add('swallow-defaultprevented-missing', exp.where + ' key ' + exp.key + ' defaultPrevented=' + e.defaultPrevented + ' != ' + exp.dp);
    }
  }

  // ---- k2/k3: the negative edit witness --------------------------------
  if (!bs) add('swallow-plan-mismatch', 'swallowLeg.backspaceSwallow absent');
  if (!dg) add('swallow-plan-mismatch', 'swallowLeg.digitSwallow absent');
  const pre = ctl && typeof ctl.valueAfter === 'string' ? ctl.valueAfter : null;
  if (bs) {
    if (bs.swallowOn !== undefined && bs.swallowOn !== true) add('swallow-plan-mismatch', 'backspaceSwallow.swallowOn=' + JSON.stringify(bs.swallowOn) + ' (the swallowed Backspace runs with the gate ON)');
    if (pre !== null && bs.valueAfter !== pre) add('swallow-value-changed', 'backspaceSwallow.valueAfter ' + JSON.stringify(bs.valueAfter) + ' != pre-step ' + JSON.stringify(pre));
    if (bs.defaultPrevented !== true) add('swallow-defaultprevented-missing', 'backspaceSwallow.defaultPrevented=' + JSON.stringify(bs.defaultPrevented) + ' != true');
  }
  if (dg) {
    const dgKey = typeof dg.key === 'string' ? dg.key : typeof dg.char === 'string' ? dg.char : undefined;
    if (dgKey !== undefined && dgKey !== d3) add('swallow-plan-mismatch', 'digitSwallow key ' + JSON.stringify(dgKey) + ' != derived ' + JSON.stringify(d3));
    if (dg.swallowOn !== undefined && dg.swallowOn !== true) add('swallow-plan-mismatch', 'digitSwallow.swallowOn=' + JSON.stringify(dg.swallowOn) + ' (the swallowed insertion runs with the gate ON)');
    if (pre !== null && dg.valueAfter !== pre) add('swallow-value-changed', 'digitSwallow.valueAfter ' + JSON.stringify(dg.valueAfter) + ' != pre-step ' + JSON.stringify(pre));
    if (dg.defaultPrevented !== true) add('swallow-defaultprevented-missing', 'digitSwallow.defaultPrevented=' + JSON.stringify(dg.defaultPrevented) + ' != true');
  }

  // ---- k4: the swallowed Enter chord must not submit -------------------
  if (!en) add('swallow-plan-mismatch', 'swallowLeg.enterChordSwallow absent');
  else {
    if (en.swallowOn !== undefined && en.swallowOn !== true) add('swallow-plan-mismatch', 'enterChordSwallow.swallowOn=' + JSON.stringify(en.swallowOn) + ' (the swallowed chord runs with the gate ON)');
    if (typeof en.enterModifiers === 'number' && en.enterModifiers !== 2) add('swallow-plan-mismatch', 'enterChordSwallow.enterModifiers ' + en.enterModifiers + ' != 2');
    if (en.defaultPrevented !== undefined && en.defaultPrevented !== true) add('swallow-defaultprevented-missing', 'enterChordSwallow.defaultPrevented=' + JSON.stringify(en.defaultPrevented) + ' != true');
    if (en.submitted !== false) add('swallow-enter-chord-leak', 'enterChordSwallow.submitted=' + JSON.stringify(en.submitted) + ' != false');
    if (typeof en.valueAfter === 'string' && pre !== null && en.valueAfter !== pre) add('swallow-value-changed', 'enterChordSwallow.valueAfter ' + JSON.stringify(en.valueAfter) + ' != pre-step ' + JSON.stringify(pre));
  }
  const rows = form && Array.isArray(form.serverRequests) ? form.serverRequests : null;
  if (!rows) {
    add('swallow-enter-chord-leak', 'journey.form.serverRequests absent (no server-side one-submission witness)');
    return;
  }
  const q = (e) => (isObj(e) ? String(typeof e.query === 'string' ? e.query : '') : String(e || ''));
  const pathOf = (e) => (isObj(e) && typeof e.path === 'string' ? e.path : '');
  const hasQ = (s, k) => new RegExp('(?:^|&)' + k + '=').test(s);
  const withField3 = rows.filter((e) => hasQ(q(e), 'field3'));
  // The runner records the fixture server's WHOLE log (/form, /favicon.ico,
  // the /echo): the submission witness is the /echo count, never a count of
  // all rows.
  const echoes = rows.filter((e) => pathOf(e) === '/echo');
  const submissions = echoes.filter((e) => hasQ(q(e), 'field') && hasQ(q(e), 'field2') && !hasQ(q(e), 'field3'));
  if (withField3.length > 0) {
    add('swallow-enter-chord-leak', 'serverRequests carries ' + withField3.length + ' request(s) with field3 (a chord-submitted #field3)');
  }
  if (echoes.length !== 1 || submissions.length !== 1) {
    add('swallow-enter-chord-leak', 'serverRequests /echo ' + echoes.length + ' (field+field2 submissions ' + submissions.length + ') != exactly one (the chord submitted, or the one submit is missing)');
  }
}

const objType = (e) => (isObj(e) && typeof e.type === 'string' ? e.type : null);

const pickStr = (o, keys) => {
  for (const k of keys) if (isObj(o) && typeof o[k] === 'string') return o[k];
  return undefined;
};


// input: {receiptPath} | {inline, baseDir}; opts: {driverPath, expectSha}
function checkReceipt(input, opts) {
  const { list, add } = newFindings();
  return evaluate(input, opts, list, add);
}

function evaluate(input, opts, findings, add) {
  const couldNotEvaluate = [];
  const done = (receipt) => ({ receipt, findings, couldNotEvaluate });
  let rec;
  let baseDir;
  if (input && Object.prototype.hasOwnProperty.call(input, 'inline')) {
    rec = input.inline;
    baseDir = input.baseDir || FIXTURES_DIR;
    if (!isObj(rec)) rec = {};
  } else {
    const receiptPath = input.receiptPath;
    baseDir = path.dirname(path.resolve(receiptPath));
    let buf;
    try { buf = fs.readFileSync(receiptPath); } catch (e) {
      if (e && e.code === 'ENOENT') {
        add('receipt-missing', path.resolve(receiptPath));
        couldNotEvaluate.push({ check: 'receipt-load', code: 'receipt-absent', detail: 'no receipt bytes at ' + path.resolve(receiptPath) });
        return done(null);
      }
      add('receipt-unparseable', 'unreadable: ' + (e && e.code));
      couldNotEvaluate.push({ check: 'receipt-load', code: 'receipt-unreadable', detail: 'cannot read ' + path.resolve(receiptPath) + ': ' + (e && e.code) });
      return done(null);
    }
    try { rec = JSON.parse(buf.toString('utf8')); } catch (e) {
      add('receipt-unparseable', String((e && e.message) || e).slice(0, 200));
      couldNotEvaluate.push({ check: 'receipt-load', code: 'receipt-unparseable', detail: String((e && e.message) || e).slice(0, 200) });
      return done(null);
    }
    if (!isObj(rec)) rec = {};
  }

  // ---- receipt identity -------------------------------------------------
  if (rec.schema !== SCHEMA) add('schema-wrong', String(rec.schema));

  const nonce = rec.nonce;
  const nonceStr = typeof nonce === 'string' ? nonce : null;
  const nonceOk = nonceStr !== null && NONCE_RE.test(nonceStr);
  if (!nonceOk) add('nonce-shape', String(nonce));

  // ---- driver binding ---------------------------------------------------
  const driverPath = opts.driverPath || null;
  let driverBytes = null;
  if (!driverPath) add('driver-missing', 'no --driver given');
  else {
    try { driverBytes = fs.readFileSync(driverPath); } catch { add('driver-missing', path.resolve(driverPath)); }
  }
  if (driverBytes) {
    const got = sha256(driverBytes);
    if (rec.driverSha256 !== got) add('driver-sha-mismatch', 'receipt ' + rec.driverSha256 + ' != bytes ' + got);
  }
  if (opts.expectSha && rec.driverSha256 !== opts.expectSha) {
    add('driver-sha-mismatch', 'receipt ' + rec.driverSha256 + ' != --expect-driver-sha256 ' + opts.expectSha);
  }

  // ---- throwaway profile ------------------------------------------------
  const host = isObj(rec.host) ? rec.host : {};
  const token = typeof host.launchToken === 'string' ? host.launchToken : '';
  const udd = userDataDirArg(argvText(host.argv));
  const profileOk = udd !== null
    && path.isAbsolute(udd)
    && TOKEN_RE.test(token)
    && !/[\\/]/.test(token)
    && path.basename(udd) === 'profile-' + token;
  if (!profileOk) add('profile-not-throwaway', 'argv=' + argvText(host.argv) + ' token=' + JSON.stringify(token));

  // ---- host browser identity (frozen claim names Chromium 155) ----------
  if (!isObj(rec.host) || typeof host.chromium !== 'string' || !host.chromium.includes('155.')) {
    add('host-browser-mismatch', 'host.chromium=' + JSON.stringify(isObj(rec.host) ? host.chromium : rec.host));
  }
  // ---- shape-only host state: no user-home path in the recorded argv ----
  const argvStr = argvText(host.argv);
  if (/\/home\/[A-Za-z0-9._-]+\//.test(argvStr) || argvStr.includes('~/')) {
    add('host-argv-home-leak', 'argv=' + argvStr);
  }

  // ---- plain typing trace ----------------------------------------------
  const pt = rec.plainTrace;
  const ptEntries = isObj(pt) && Array.isArray(pt.entries) ? pt.entries : null;
  if (!ptEntries || ptEntries.length === 0) add('plain-trace-missing', 'plainTrace.entries absent or empty');
  else for (const e of ptEntries) {
    if (!isObj(e) || typeof e.valueAfter !== 'string') {
      add('plain-trace-wrong', 'i=' + (isObj(e) ? e.i : '?') + ' valueAfter not a string'); continue;
    }
    const v = e.valueAfter;
    if (nonceStr === null || v.length > nonceStr.length || v !== nonceStr.slice(0, v.length)) {
      add('plain-trace-wrong', 'i=' + (isObj(e) ? e.i : '?') + ' valueAfter=' + JSON.stringify(v));
    }
  }

  // ---- control domain ---------------------------------------------------
  const cd = isObj(rec.controlDomain) ? rec.controlDomain : null;
  if (!cd) add('control-domain-missing', 'controlDomain absent');
  else {
    const end = isObj(cd.end) ? cd.end : null;
    if (!end) add('control-end-witness-wrong', 'end block absent');
    else if (end.negativeWitness !== true) add('control-end-witness-wrong', 'negativeWitness=' + JSON.stringify(end.negativeWitness));
    else if (end.valueAfter !== end.valueBefore) add('control-end-witness-wrong', 'valueAfter ' + JSON.stringify(end.valueAfter) + ' != valueBefore ' + JSON.stringify(end.valueBefore));

    const bs = isObj(cd.backspace) ? cd.backspace : null;
    const expectedResidue = nonceStr === null ? null : nonceStr.slice(0, -1);
    if (!bs) add('control-backspace-witness-wrong', 'backspace block absent');
    else if (expectedResidue === null || bs.valueAfter !== expectedResidue) {
      add('control-backspace-witness-wrong', 'valueAfter ' + JSON.stringify(bs.valueAfter) + ' != ' + JSON.stringify(expectedResidue));
    }

    const rs = isObj(cd.restore) ? cd.restore : null;
    if (!rs) add('control-restore-witness-wrong', 'restore block absent');
    else if (nonceStr === null || rs.valueAfter !== nonceStr) {
      add('control-restore-witness-wrong', 'valueAfter ' + JSON.stringify(rs.valueAfter) + ' != ' + JSON.stringify(nonceStr));
    }

    const tab = isObj(cd.tab) ? cd.tab : null;
    if (!tab) add('control-tab-focus-wrong', 'tab block absent');
    else if (tab.activeBefore !== 'field' || tab.activeAfter !== 'field2') {
      add('control-tab-focus-wrong', 'activeBefore ' + JSON.stringify(tab.activeBefore) + ' activeAfter ' + JSON.stringify(tab.activeAfter));
    }

    const en = isObj(cd.enter) ? cd.enter : null;
    if (!en) add('control-enter-submit-wrong', 'enter block absent');
    else if (en.submitted !== true) add('control-enter-submit-wrong', 'submitted=' + JSON.stringify(en.submitted));
    else if (nonceStr === null || en.serverSawField !== nonceStr) {
      add('control-enter-submit-wrong', 'serverSawField ' + JSON.stringify(en.serverSawField) + ' != ' + JSON.stringify(nonceStr));
    }
    // R57Critic item 1 (pre-freeze amendment): the Enter leg runs LAST, so
    // #field2 legitimately carries the UPPERCASED nonce at submit time — the
    // r56 `serverSawField2 === ''` clause is replaced by this strengthened
    // witness under its own id.
    const wantField2 = nonceOk ? mixedOf(nonceStr) : null;
    if (en && wantField2 !== null && en.serverSawField2 !== wantField2) {
      add('server-field2-mismatch', 'serverSawField2 ' + JSON.stringify(en.serverSawField2) + ' != ' + JSON.stringify(wantField2));
    }
  }

  // ---- #field3 -----------------------------------------------------------
  // r58: the top-level field3Value/field3Final are read AFTER the swallow
  // leg and must equal the derived two-character prefix (the r56 clause
  // `=== ''` is carried for receipts whose nonce derives no prefix). The
  // check runs in the swallow dispatch below; the chord-leg witness is
  // checked in the chord section.

  // ---- page keylog (control-domain slice, r56 semantics) ----------------
  const kl = rec.keylog;
  if (!isObj(kl) || !Array.isArray(kl.entries)) add('keylog-missing', 'keylog.entries absent');
  else {
    const implied = impliedKeydowns(cd);
    if (kl.length !== implied) add('keylog-length-wrong', 'length ' + JSON.stringify(kl.length) + ' != implied ' + implied);
    if (kl.length !== kl.entries.length) add('keylog-length-wrong', 'length ' + JSON.stringify(kl.length) + ' != entries ' + kl.entries.length);
    const win = isObj(kl.window) ? kl.window : null;
    if (!win) add('keylog-length-wrong', 'keylog.window absent');
    else if (typeof win.start !== 'number' || typeof win.end !== 'number') add('keylog-length-wrong', 'window not numeric');
    else if (win.end - win.start !== implied || win.start < 0 || win.end < win.start) {
      add('keylog-length-wrong', 'window [' + win.start + ',' + win.end + ') span ' + (win.end - win.start) + ' != implied ' + implied);
    }
  }

  // ---- server log -------------------------------------------------------
  const log = Array.isArray(rec.serverLog) ? rec.serverLog : null;
  const logText = log ? JSON.stringify(log) : '';
  if (!log || !logText.includes('/echo')) add('server-log-missing', log ? 'no /echo entry' : 'serverLog absent');
  if (log) {
    const echoCount = log.filter((e) => (typeof e === 'string' ? e : JSON.stringify(e)).includes('/echo')).length;
    if (echoCount !== 1) add('server-log-echo-count', 'echoCount=' + echoCount);
  }

  // ---- invocation binding ----------------------------------------------
  const typed = [];
  if (ptEntries) for (const e of ptEntries) if (isObj(e) && typeof e.valueAfter === 'string') typed.push(e.valueAfter);
  if (cd) {
    for (const leg of CONTROL_LEGS) {
      const b = isObj(cd[leg]) ? cd[leg] : null;
      if (!b) continue;
      for (const k of ['valueBefore', 'valueAfter']) if (typeof b[k] === 'string') typed.push(b[k]);
    }
    if (isObj(cd.enter) && typeof cd.enter.serverSawField === 'string') typed.push(cd.enter.serverSawField);
  }
  const haystack = [logText, ...typed].join('\u0000');
  if (nonceStr === null || !haystack.includes(nonceStr)) {
    add('nonce-not-invocation-bound', 'nonce ' + JSON.stringify(nonce) + ' absent from server log and typed values');
  }

  // ---- steps + committed PNG bytes -------------------------------------
  const steps = Array.isArray(rec.steps) ? rec.steps : null;
  const names = steps ? steps.map((s) => (isObj(s) ? s.name : null)) : null;
  // The six r56 steps must be present, in order, at positions 0..5. Extra
  // evidence steps after them are admitted (and hashed identically) so the
  // r57 legs can commit their own PNGs without weakening the six.
  const sixOk = names !== null && names.length >= STEP_NAMES.length
    && STEP_NAMES.every((n, i) => names[i] === n);
  if (!sixOk) add('steps-missing', names === null ? 'steps absent' : JSON.stringify(names));
  if (steps) {
    const overrides = Array.isArray(opts.shotFiles) ? opts.shotFiles : [];
    steps.forEach((s, i) => checkStepPng(isObj(s) ? s : {}, opts.shotDir || baseDir, add, overrides[i] || null));
  }
  // r58: the chronological evidence log carries the four swallow shots beside
  // the carried steps; every recorded shot that pins its bytes is hashed with
  // the same PNG geometry witness. An absent log adds nothing (the r57 carry
  // has no stepsExtended), but a recorded one is never taken on trust.
  if (Array.isArray(rec.stepsExtended)) {
    for (const s of rec.stepsExtended) if (isObj(s)) checkStepPng(s, opts.shotDir || baseDir, add, null);
  }

  // ---- teardown ---------------------------------------------------------
  const td = isObj(rec.teardown) ? rec.teardown : null;
  const survivors = td ? td.survivors : undefined;
  const swept = td ? td.postKillSweepCount : undefined;
  if (!td || !Array.isArray(survivors) || survivors.length > 0 || swept !== 0) {
    add('teardown-survivor', 'survivors=' + JSON.stringify(survivors) + ' postKillSweepCount=' + JSON.stringify(swept));
  }

  // =======================================================================
  // ---- the r57 modifier domain (new checks) -----------------------------
  // =======================================================================
  const journey = isObj(rec.journey) ? rec.journey : null;
  const form = journey && isObj(journey.form) ? journey.form : null;
  const mixed = nonceOk ? mixedOf(nonceStr) : null;
  const hexTail = nonceOk ? hexTailOf(nonceStr) : '';
  const chordLetter = nonceOk ? chordLetterOf(nonceStr) : null;

  if (!nonceOk) {
    couldNotEvaluate.push({
      check: 'modifier+swallow-domain-derivation',
      code: 'nonce-unusable',
      detail: 'nonce ' + JSON.stringify(nonce) + ' cannot derive the shift/chord/swallow plan; only shape checks below ran',
    });
  }

  // ---- (1) the Shift-chord trace ----------------------------------------
  const st = form && isObj(form.shiftTrace) ? form.shiftTrace : null;
  if (!st) add('shift-trace-missing', 'journey.form.shiftTrace absent');
  else {
    const entries = Array.isArray(st.typing) ? st.typing : Array.isArray(st.entries) ? st.entries : null;
    if (!entries || entries.length === 0) add('shift-trace-missing', 'shiftTrace typing/entries absent or empty');
    else {
      if (mixed !== null && entries.length !== mixed.length) {
        add('shift-trace-missing', 'trace length ' + entries.length + ' != uppercased nonce ' + mixed.length);
      }
      const n = mixed !== null ? Math.min(entries.length, mixed.length) : entries.length;
      for (let i = 0; i < entries.length; i += 1) {
        const e = entries[i];
        if (!isObj(e)) { add('shift-trace-missing', 'entry i=' + i + ' not an object'); continue; }
        if (e.i !== i) add('shift-trace-missing', 'entry ' + i + ' names i=' + e.i);
        const ch = typeof e.char === 'string' ? e.char : null;
        if (ch === null) { add('shift-trace-missing', 'entry i=' + i + ' has no char'); continue; }
        if (i < n && mixed !== null && ch !== mixed[i]) add('shift-trace-missing', 'i=' + i + ': char ' + JSON.stringify(ch) + ' != ' + JSON.stringify(mixed[i]));
        const ride = /[A-Z]/.test(ch);
        // modifiers (S153 bit 8) — derived from the entry's own char so the
        // check still runs when the nonce is unusable.
        if (e.modifiers !== (ride ? 8 : 0)) {
          add(ride ? 'shift-modifiers-wrong' : 'shift-unshifted-char-wrong', 'i=' + i + ' char=' + ch + ' modifiers=' + JSON.stringify(e.modifiers));
        }
        // the shifted key/text (uppercase) or the unshifted key (digit/hyphen)
        if (typeof e.key === 'string' && e.key !== ch) {
          add(ride ? 'shift-modifiers-wrong' : 'shift-unshifted-char-wrong', 'i=' + i + ' key=' + JSON.stringify(e.key) + ' != char ' + JSON.stringify(ch));
        }
        if (typeof e.code === 'string' && e.code !== codeFor(ch)) {
          add(ride ? 'shift-modifiers-wrong' : 'shift-unshifted-char-wrong', 'i=' + i + ' code=' + JSON.stringify(e.code) + ' != ' + codeFor(ch));
        }
        if (typeof e.windowsVirtualKeyCode === 'number' && e.windowsVirtualKeyCode !== vkFor(ch)) {
          add(ride ? 'shift-modifiers-wrong' : 'shift-unshifted-char-wrong', 'i=' + i + ' vk=' + e.windowsVirtualKeyCode + ' != ' + vkFor(ch));
        }
        if (typeof e.shiftRide === 'boolean' && e.shiftRide !== ride) {
          add(ride ? 'shift-ride-missing' : 'shift-unshifted-char-wrong', 'i=' + i + ' shiftRide=' + e.shiftRide + ' != ' + ride);
        }
        // per-keystroke #field2 prefix (needs the nonce)
        if (mixed !== null && i < n && e.valueAfter !== mixed.slice(0, i + 1)) {
          add('shift-prefix-mismatch', 'i=' + i + ' valueAfter=' + JSON.stringify(e.valueAfter) + ' != ' + JSON.stringify(mixed.slice(0, i + 1)));
        }
        // both-field read-back: #field1 is untouched by these keystrokes, so
        // its read-back must still be the nonce, every single time.
        const f1 = pickStr(e, ['valueAfterField', 'fieldValueAfter', 'field1ValueAfter', 'valueAfterField1']);
        if (f1 === undefined) add('shift-prefix-mismatch', 'i=' + i + ': #field read-back missing (both-field witness)');
        else if (nonceOk && f1 !== nonceStr) add('shift-prefix-mismatch', 'i=' + i + ': #field read-back ' + JSON.stringify(f1) + ' != nonce');
        // the Shift ride around the letter's key pair
        if (ride) {
          const rr = e.ride;
          const evs = isObj(rr) ? rr : null;
          const kd = evs && isObj(evs.keyDown) ? evs.keyDown : null;
          const ku = evs && isObj(evs.keyUp) ? evs.keyUp : null;
          if (!kd || !ku) {
            add('shift-ride-missing', 'i=' + i + ' char=' + ch + ': no Shift keyDown/keyUp pair recorded');
          } else {
            for (const [which, ev] of [['keyDown', kd], ['keyUp', ku]]) {
              if (ev.key !== 'Shift') add('shift-ride-missing', 'i=' + i + ' ' + which + '.key=' + JSON.stringify(ev.key));
              if (has(ev, 'code') && ev.code !== 'ShiftLeft') add('shift-ride-missing', 'i=' + i + ' ' + which + '.code=' + JSON.stringify(ev.code));
              if (has(ev, 'keyCode') && ev.keyCode !== 16) add('shift-ride-missing', 'i=' + i + ' ' + which + '.keyCode=' + JSON.stringify(ev.keyCode));
              if (which === 'keyDown' && has(ev, 'shiftKey') && ev.shiftKey !== true) add('shift-ride-missing', 'i=' + i + ' keyDown.shiftKey=' + JSON.stringify(ev.shiftKey));
              if (has(ev, 'modifiers') && ev.modifiers !== 8) add('shift-modifiers-wrong', 'i=' + i + ' ' + which + '.modifiers=' + JSON.stringify(ev.modifiers));
            }
          }
        } else if (e.ride !== undefined && e.ride !== null) {
          // a ride on an UNSHIFTED character means the Shift key was held
          // where none may be: the same class as a shifted digit/hyphen.
          add('shift-unshifted-char-wrong', 'i=' + i + ' char=' + ch + ' carries a Shift ride');
        }
      }
      // declared target and the final #field2 value
      if (typeof st.value === 'string' && mixed !== null && st.value !== mixed) {
        add('field2-final-mismatch', 'shiftTrace.value ' + JSON.stringify(st.value) + ' != ' + JSON.stringify(mixed));
      }
      const final2 = pickStr(st, ['field2ValueAfterTyping', 'field2Value', 'field2Final']);
      if (final2 === undefined) add('field2-final-mismatch', 'no final #field2 read-back recorded');
      else if (mixed !== null && final2 !== mixed) add('field2-final-mismatch', '#field2 ' + JSON.stringify(final2) + ' != ' + JSON.stringify(mixed));
      const final1 = pickStr(st, ['fieldValueAfterTyping', 'fieldValue', 'field1ValueAfterTyping']);
      if (final1 !== undefined && nonceOk && final1 !== nonceStr) add('shift-prefix-mismatch', '#field final ' + JSON.stringify(final1) + ' != nonce');
    }
  }

  // ---- (2) the chord leg -------------------------------------------------
  const cg = form && isObj(form.chordLeg) ? form.chordLeg : null;
  if (!cg) add('chord-missing', 'journey.form.chordLeg absent');
  else {
    if (nonceOk && chordLetter === null) {
      add('chord-char-mismatch', 'nonce hex tail ' + JSON.stringify(hexTail) + ' carries no [a-f]: the chord letter is underivable');
    } else if (chordLetter !== null) {
      const letterCode = 'Key' + chordLetter.toUpperCase();
      const letterVk = 65 + (chordLetter.charCodeAt(0) - 97);
      if (typeof cg.hexTail === 'string' && nonceOk && cg.hexTail !== hexTail) add('chord-char-mismatch', 'hexTail ' + JSON.stringify(cg.hexTail) + ' != ' + JSON.stringify(hexTail));
      if (cg.letter !== chordLetter) add('chord-char-mismatch', 'letter ' + JSON.stringify(cg.letter) + ' != derived ' + JSON.stringify(chordLetter));
      if (typeof cg.letterCode === 'string' && cg.letterCode !== letterCode) add('chord-char-mismatch', 'letterCode ' + JSON.stringify(cg.letterCode) + ' != ' + letterCode);
      if (typeof cg.letterWindowsVirtualKeyCode === 'number' && cg.letterWindowsVirtualKeyCode !== letterVk) add('chord-char-mismatch', 'letterVk ' + cg.letterWindowsVirtualKeyCode + ' != ' + letterVk);
    }
    const cds = Array.isArray(cg.chords) ? cg.chords : null;
    if (!cds || cds.length !== CHORD_MODS.length) add('chord-missing', 'chordLeg.chords ' + (cds ? cds.length : 'absent') + ' != ' + CHORD_MODS.length);
    else {
      cds.forEach((c, i) => {
        const cm = CHORD_MODS[i];
        if (!isObj(c)) { add('chord-missing', 'chord i=' + i + ' not an object'); return; }
        if (typeof c.name === 'string' && c.name !== cm.name) { add('chord-missing', 'chord i=' + i + ' name ' + JSON.stringify(c.name) + ' != ' + cm.name); return; }
        if (typeof c.key === 'string' && c.key !== cm.key) { add('chord-missing', 'chord ' + cm.name + ' key ' + JSON.stringify(c.key)); return; }
        if (typeof c.code === 'string' && c.code !== cm.code) add('chord-missing', 'chord ' + cm.name + ' code ' + JSON.stringify(c.code));
        if (typeof c.windowsVirtualKeyCode === 'number' && c.windowsVirtualKeyCode !== cm.vk) add('chord-missing', 'chord ' + cm.name + ' vk ' + c.windowsVirtualKeyCode);
        // the recorded modifier BIT is the CDP-side half of the correspondence
        const bit = typeof c.bit === 'number' ? c.bit : typeof c.modifiers === 'number' ? c.modifiers : null;
        if (bit === null) add('chord-modifiers-wrong', 'chord ' + cm.name + ': no modifiers bit recorded');
        else if (bit !== cm.bit) add('chord-modifiers-wrong', 'chord ' + cm.name + ': bit ' + bit + ' != ' + cm.bit);
        // the chord's own page-side echo, when the runner records it: its
        // BOOLEANS are the bit correspondence (identity is the pageKeylog's
        // job). Two keydowns: the modifier's, then the letter's.
        if (has(c, 'domEvents')) {
          const de = Array.isArray(c.domEvents) ? c.domEvents : null;
          if (!de || de.length !== 2) add('chord-missing', 'chord ' + cm.name + ': domEvents ' + (de ? de.length : 'not an array') + ' != 2');
          else {
            const want = [{ what: 'modifier keydown', exp: boolsFor(cm.bit) }, { what: 'letter keydown', exp: boolsFor(cm.bit) }];
            for (let j = 0; j < 2; j += 1) {
              const ev = de[j];
              if (!isObj(ev)) { add('boolean-mismatch', 'chord ' + cm.name + ' ' + want[j].what + ' not an object'); continue; }
              for (const k of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey']) {
                if (ev[k] !== want[j].exp[k]) add('boolean-mismatch', 'chord ' + cm.name + ' ' + want[j].what + ' ' + k + '=' + JSON.stringify(ev[k]) + ' != ' + want[j].exp[k]);
              }
            }
          }
        }
      });
    }
    // the negative witness: #field3 EMPTY at the end of the chord leg. In
    // r58 the top-level field3Final is read AFTER the swallow leg and is no
    // longer a post-chord witness, so a derived-prefix receipt must record
    // chordLeg.field3ValueAfter; the r57 fallback survives only when the
    // nonce derives nothing.
    const after3 = typeof cg.field3ValueAfter === 'string' ? cg.field3ValueAfter
      : (!nonceOk && typeof rec.field3Final === 'string' ? rec.field3Final : undefined);
    if (after3 === undefined) add('field3-not-empty', 'no post-chord #field3 witness recorded (chordLeg.field3ValueAfter)');
    else if (after3 !== '') add('field3-not-empty', 'post-chord #field3 ' + JSON.stringify(after3));
  }

  // ---- (3) the #field3 name-attribute witness ---------------------------
  const nameCands = [];
  if (has(rec.fixture, 'field3NameAttribute')) nameCands.push(['fixture.field3NameAttribute', rec.fixture.field3NameAttribute]);
  if (form) {
    if (has(form, 'field3NameAttribute')) nameCands.push(['journey.form.field3NameAttribute', form.field3NameAttribute]);
    if (has(form, 'field3Name')) nameCands.push(['journey.form.field3Name', form.field3Name]);
  }
  if (cg) {
    if (has(cg, 'field3NameAttribute')) nameCands.push(['journey.form.chordLeg.field3NameAttribute', cg.field3NameAttribute]);
    if (has(cg, 'field3Name')) nameCands.push(['journey.form.chordLeg.field3Name', cg.field3Name]);
  }
  if (nameCands.length === 0) {
    add('field3-named', 'no #field3 name-attribute witness recorded (fixture echo / form record)');
  } else {
    for (const [where, v] of nameCands) {
      if (typeof v === 'string' && v !== '') add('field3-named', where + '=' + JSON.stringify(v));
      else if (v !== null && typeof v !== 'string') add('field3-named', where + ' is ' + JSON.stringify(v) + ', not null/""');
    }
  }

  // ---- (4) the page keydown record, re-derived from the nonce -----------
  const declared3 = cg ? pickStr(cg, ['field3TargetId', 'targetId']) : undefined;
  const declaredForm3 = form ? pickStr(form, ['field3TargetId']) : undefined;
  const f3Target = declared3 !== undefined ? declared3 : (declaredForm3 !== undefined ? declaredForm3 : 'field3');
  const pkRaw = form ? form.pageKeylog : undefined;
  let klLegs = null;
  let klEntries = null;
  let pageSwallowKd = [];
  if (pkRaw === undefined || pkRaw === null) {
    add('keylog-absent', 'journey.form.pageKeylog absent');
  } else if (Array.isArray(pkRaw)) {
    klLegs = KEYLOG_LEGS.slice();
    klEntries = pkRaw;
  } else if (isObj(pkRaw) && Array.isArray(pkRaw.entries)) {
    const declared = Array.isArray(pkRaw.legs) ? pkRaw.legs : null;
    const allowed = KEYLOG_LEGS.concat(SWALLOW_LEG_NAMES);
    const bad = declared === null
      || !declared.includes('shift') || !declared.includes('chord')
      || declared.some((l) => !allowed.includes(l));
    if (bad) {
      add('keylog-absent', 'pageKeylog legs declaration invalid (needs shift+chord, only ' + JSON.stringify(KEYLOG_LEGS) + ' plus the r58 swallow names): ' + JSON.stringify(declared));
    } else {
      klLegs = KEYLOG_LEGS.filter((l) => declared.includes(l));
      klEntries = pkRaw.entries;
    }
  } else {
    add('keylog-absent', 'journey.form.pageKeylog has no entries array');
  }
  if (klEntries) {
    // R57Critic item 2 (pre-freeze amendment): ENTRY CONTENT, not only
    // length/window. Every entry must carry its event type and its target
    // identity; a missing field is itself a finding — the check is never
    // weakened to fit a missing field.
    const rawKd = [];
    klEntries.forEach((a, i) => {
      if (!isObj(a)) { add('keylog-entry-mismatch', 'entry i=' + i + ' not an object'); return; }
      if (a.type !== 'keyDown' && a.type !== 'keyUp') {
        add('keylog-entry-mismatch', 'entry i=' + i + ' lacks the event type (keyDown|keyUp)');
        return;
      }
      if (typeof a.targetId !== 'string' || a.targetId === '') {
        add('keylog-entry-mismatch', 'entry i=' + i + ' lacks the target identity (targetId)');
      }
      if (a.type === 'keyDown') rawKd.push({ i, ev: a });
    });
    if (nonceOk) {
      const want = derivePageKeylog(nonceStr, klLegs, chordLetter, f3Target);
      const swPlan = deriveSwallowKeydowns(nonceStr, f3Target);
      const extra = rawKd.length > want.length ? rawKd.slice(want.length) : [];
      if (rawKd.length < want.length || (extra.length > 0 && extra.length !== swPlan.length)) {
        add('keylog-entry-mismatch', 'pageKeylog keydowns ' + rawKd.length + ' != derived ' + want.length + ' (+ swallow ' + swPlan.length + ') for legs ' + JSON.stringify(klLegs));
      }
      const n = Math.min(rawKd.length, want.length);
      const shiftKdPositions = [];
      for (let j = 0; j < n; j += 1) {
        const { i, ev: a } = rawKd[j];
        const e = want[j];
        if (e.leg === 'shift' && /[A-Z]/.test(e.key) && e.key !== 'Shift') shiftKdPositions.push({ j, rawI: i, char: e.key });
        if (a.key !== e.key || a.code !== e.code || a.keyCode !== e.keyCode) {
          add('keylog-entry-mismatch', 'i=' + i + ' (' + e.leg + ') got ' + JSON.stringify({ key: a.key, code: a.code, keyCode: a.keyCode }) + ' want ' + JSON.stringify({ key: e.key, code: e.code, keyCode: e.keyCode }));
          continue;
        }
        if (typeof a.modifiers !== 'number') {
          add('keylog-entry-mismatch', 'entry i=' + i + ' (' + e.leg + ') lacks the S153 modifiers bit');
        }
        if (typeof a.targetId === 'string' && a.targetId !== e.targetId) {
          add('keylog-entry-mismatch', 'entry i=' + i + ' (' + e.leg + ') targetId ' + JSON.stringify(a.targetId) + ' != ' + JSON.stringify(e.targetId));
        }
        const boolsDiffer = ['ctrlKey', 'altKey', 'metaKey', 'shiftKey'].some((k) => a[k] !== e[k]);
        const detailBools = JSON.stringify({ ctrlKey: a.ctrlKey, altKey: a.altKey, metaKey: a.metaKey, shiftKey: a.shiftKey }) + ' want ' + JSON.stringify({ ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey });
        if (e.leg === 'chord') {
          if (boolsDiffer) add('boolean-mismatch', 'entry i=' + i + ' chord ' + detailBools);
          if (typeof a.modifiers === 'number' && a.modifiers !== e.modifiers) {
            add('boolean-mismatch', 'entry i=' + i + ' chord modifiers bit ' + a.modifiers + ' != ' + e.modifiers);
          }
        } else {
          if (boolsDiffer) add('keylog-entry-mismatch', 'entry i=' + i + ' (' + e.leg + ') booleans ' + detailBools);
          if (typeof a.modifiers === 'number' && a.modifiers !== e.modifiers) {
            add('keylog-entry-mismatch', 'entry i=' + i + ' (' + e.leg + ') modifiers bit ' + a.modifiers + ' != ' + e.modifiers);
          }
        }
      }
      // the Shift pair BRACKETS each uppercase letter's pair in the raw
      // record, in order: [Shift keyDown][letter keyDown][letter keyUp]
      // [Shift keyUp].
      if (klLegs.includes('shift')) {
        for (const { rawI, char } of shiftKdPositions) {
          const before = klEntries[rawI - 1];
          const afterKd = klEntries[rawI + 1];
          const afterShift = klEntries[rawI + 2];
          const ok = isObj(before) && before.type === 'keyDown' && before.key === 'Shift'
            && isObj(afterKd) && afterKd.type === 'keyUp' && afterKd.key === char
            && isObj(afterShift) && afterShift.type === 'keyUp' && afterShift.key === 'Shift';
          if (!ok) {
            add('shift-ride-missing', 'raw ' + rawI + ' char ' + JSON.stringify(char) + ': Shift keyDown/keyUp does not bracket the letter pair ('
              + JSON.stringify([before && before.key, afterKd && afterKd.key, afterShift && afterShift.key]) + ')');
          }
        }
      }
      // r58: when the record continues past the four carried legs, the
      // continuation must BE the re-derived swallow plan (identity, order,
      // modifiers bit, target). An absent continuation is admitted: the
      // swallow witnesses are also recorded per block in swallowLeg, and a
      // recorded continuation is never weakened.
      if (extra.length === swPlan.length && extra.length > 0) {
        for (let j = 0; j < extra.length; j += 1) {
          const { i, ev: a } = extra[j];
          const e = swPlan[j];
          if (a.key !== e.key || a.code !== e.code || a.keyCode !== e.keyCode) {
            add('swallow-plan-mismatch', 'pageKeylog continuation i=' + i + ' got ' + JSON.stringify({ key: a.key, code: a.code, keyCode: a.keyCode }) + ' want ' + JSON.stringify({ key: e.key, code: e.code, keyCode: e.keyCode }));
            continue;
          }
          if (typeof a.modifiers !== 'number' || a.modifiers !== e.modifiers) {
            add('swallow-plan-mismatch', 'pageKeylog continuation i=' + i + ' modifiers ' + JSON.stringify(a.modifiers) + ' != ' + e.modifiers);
          }
          if (typeof a.targetId === 'string' && a.targetId !== e.targetId) {
            add('swallow-plan-mismatch', 'pageKeylog continuation i=' + i + ' targetId ' + JSON.stringify(a.targetId) + ' != ' + JSON.stringify(e.targetId));
          }
          if (['ctrlKey', 'altKey', 'metaKey', 'shiftKey'].some((k) => a[k] !== e[k])) {
            add('swallow-plan-mismatch', 'pageKeylog continuation i=' + i + ' booleans ' + JSON.stringify({ ctrlKey: a.ctrlKey, altKey: a.altKey, metaKey: a.metaKey, shiftKey: a.shiftKey }) + ' != bit ' + e.modifiers);
          }
          pageSwallowKd.push(a);
        }
      }
    }
  }

  // ---- (5) the r58 preventDefault-swallow domain ------------------------
  if (nonceOk) {
    checkSwallow(rec, form, nonceStr, f3Target, pageSwallowKd, add);
    const wantPrefix = hexTailOf(nonceStr).slice(0, 2);
    if (rec.field3Value !== wantPrefix) {
      add('field3-not-empty', 'field3Value ' + JSON.stringify(rec.field3Value) + ' != the derived typed prefix ' + JSON.stringify(wantPrefix));
    }
    if (typeof rec.field3Final === 'string' && rec.field3Final !== wantPrefix) {
      add('field3-not-empty', 'field3Final ' + JSON.stringify(rec.field3Final) + ' != the derived typed prefix ' + JSON.stringify(wantPrefix));
    }
  } else {
    // r56 clause carried: no prefix is derivable, so both values must be ''.
    if (rec.field3Value !== '') add('field3-not-empty', JSON.stringify(rec.field3Value));
    if (typeof rec.field3Final === 'string' && rec.field3Final !== '') {
      add('field3-not-empty', 'field3Final ' + JSON.stringify(rec.field3Final));
    }
  }

  // ---- the receipt's own flag ------------------------------------------
  if (findings.length === 0 && rec.predicate !== true) add('predicate-false', JSON.stringify(rec.predicate));

  return done(rec);
}

// ---------------------------------------------------------------------------
// selftest: every fixture in chromium-receipt-r58-fixtures/ that carries an
// expectFindings key. Fixture shape:
//   { name, note?, receiptPath? | receipt?, expectFindings: [ids] | "GREEN",
//     driver?, expectDriverSha256?, shotFiles?,
//     expectOrder?: [ids]            — optional exact emission order
//     expectCouldNotEvaluate?: [codes] — optional exact unevaluable codes }
// receiptPath/driver/shotFiles are relative to the fixtures dir (absolute
// accepted). expectFindings is the EXACT set; "GREEN" means the empty set.
// ---------------------------------------------------------------------------
function runSelftest() {
  if (!fs.existsSync(FIXTURES_DIR)) die('selftest: fixtures dir absent at ' + FIXTURES_DIR);
  const files = fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json')).sort();
  const cases = [];
  for (const f of files) {
    const p = path.join(FIXTURES_DIR, f);
    let obj;
    try { obj = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { continue; }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, 'expectFindings')) continue;
    cases.push({ file: f, spec: obj });
  }
  if (cases.length === 0) die('selftest: no fixture case found in ' + FIXTURES_DIR);

  const results = [];
  let pass = 0;
  for (const { file, spec } of cases) {
    const name = typeof spec.name === 'string' ? spec.name : file;
    const driverRel = typeof spec.driver === 'string' ? spec.driver : 'driver-stub.mjs';
    const driverPath = path.resolve(FIXTURES_DIR, driverRel);
    const opts = {
      driverPath,
      expectSha: typeof spec.expectDriverSha256 === 'string' ? spec.expectDriverSha256 : null,
      shotFiles: Array.isArray(spec.shotFiles) ? spec.shotFiles.map((x) => path.resolve(FIXTURES_DIR, x)) : null,
    };
    let input;
    if (Object.prototype.hasOwnProperty.call(spec, 'receipt')) input = { inline: spec.receipt, baseDir: FIXTURES_DIR };
    else if (typeof spec.receiptPath === 'string') input = { receiptPath: path.resolve(FIXTURES_DIR, spec.receiptPath) };
    else input = { receiptPath: path.resolve(FIXTURES_DIR, 'absent-by-construction.json') };

    const out = checkReceipt(input, opts);
    const got = out.findings.map((f) => f.id).sort();
    const gotOrder = out.findings.map((f) => f.id);
    const want = spec.expectFindings === 'GREEN' ? [] : Array.isArray(spec.expectFindings) ? spec.expectFindings.slice().sort() : null;
    let ok = want !== null && JSON.stringify(got) === JSON.stringify(want);
    let orderOk;
    if (Array.isArray(spec.expectOrder)) {
      orderOk = JSON.stringify(gotOrder) === JSON.stringify(spec.expectOrder);
      if (!orderOk) ok = false;
    }
    let cneOk;
    if (Array.isArray(spec.expectCouldNotEvaluate)) {
      const codes = out.couldNotEvaluate.map((c) => c.code).sort();
      cneOk = JSON.stringify(codes) === JSON.stringify(spec.expectCouldNotEvaluate.slice().sort());
      if (!cneOk) ok = false;
    }
    if (ok) pass += 1;
    results.push({ name, file, ok, got, want, ...(orderOk === undefined ? {} : { orderOk, gotOrder }), ...(cneOk === undefined ? {} : { cneOk, gotCne: out.couldNotEvaluate.map((c) => c.code) }) });
  }
  const seen = new Set();
  for (const r of results) for (const id of r.want) seen.add(id);
  const uncovered = FINDING_IDS.filter((id) => !seen.has(id));
  const stray = [...seen].filter((id) => !FINDING_IDS.includes(id));
  const coverageOk = uncovered.length === 0 && stray.length === 0;
  const allPass = pass === results.length && coverageOk;
  if (!coverageOk) {
    results.push({ name: 'fixture-id-coverage', ok: false, uncovered, stray });
  }
  const out = {
    schema: 'tabi-chromium-receipt-r58-selftest',
    fixturesDir: FIXTURES_DIR,
    cases: results.length,
    pass,
    allPass,
    idCoverage: { required: FINDING_IDS.length, covered: FINDING_IDS.length - uncovered.length, uncovered, stray },
    failing: results.filter((r) => !r.ok).map((r) => ({ name: r.name, got: r.got, want: r.want })),
    results,
  };
  console.log(JSON.stringify(out, null, 1));
  console.log(pass + '/' + results.length);
  process.exit(allPass ? 0 : 1);
}

function runSelfCheck() {
  const bytes = fs.readFileSync(SELF);
  const files = fs.existsSync(FIXTURES_DIR) ? fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json')) : [];
  let count = 0;
  for (const f of files) {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, f), 'utf8'));
      if (o && typeof o === 'object' && !Array.isArray(o) && Object.prototype.hasOwnProperty.call(o, 'expectFindings')) count += 1;
    } catch { /* not a case */ }
  }
  console.log(JSON.stringify({
    schema: 'tabi-chromium-receipt-r58-selfcheck',
    counter: SELF,
    sha256: sha256(bytes),
    bytes: bytes.length,
    fixturesDir: FIXTURES_DIR,
    fixtureCount: count,
    status: 'ok',
  }, null, 1));
  process.exit(0);
}

// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
if (argv.length === 0) die('usage: chromium-receipt-r58.mjs <receipt.json> --driver <driver.mjs> [--expect-driver-sha256 <hex>] [--json] | --selftest | --self-check');
if (argv.includes('--selftest')) {
  if (argv.length !== 1) die('--selftest takes no other argument');
  runSelftest();
}
if (argv.includes('--self-check')) {
  if (argv.length !== 1) die('--self-check takes no other argument');
  runSelfCheck();
}

let receiptArg = null;
let driverArg = null;
let expectSha = null;
let shotDir = null;
let shotGiven = false;
const extraPos = [];
let jsonOut = false;
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--json') { jsonOut = true; continue; }
  if (a === '--driver') { const v = argv[i + 1]; if (!v) die('--driver needs a path'); driverArg = v; i += 1; continue; }
  // --shot is accepted for command compatibility with the frozen claims text:
  // a path names the directory the per-step PNGs sit in; a bare flag is a
  // no-op (the PNGs already resolve against dirname(receipt)). --shot NEVER
  // relaxes a check.
  if (a === '--shot') {
    shotGiven = true;
    const v = argv[i + 1];
    if (v && !v.startsWith('--')) {
      let st = null;
      try { st = fs.statSync(path.resolve(v)); } catch { st = null; }
      if (st && st.isDirectory()) { shotDir = path.resolve(v); i += 1; }
    }
    continue;
  }
  if (a === '--expect-driver-sha256') {
    const v = argv[i + 1];
    if (!v || !/^[0-9a-f]{64}$/.test(v)) die('--expect-driver-sha256 needs 64 lowercase hex chars');
    expectSha = v; i += 1; continue;
  }
  if (a.startsWith('--')) die('unknown flag ' + a);
  if (receiptArg === null) { receiptArg = a; continue; }
  extraPos.push(a);
}
let shotFiles = null;
if (extraPos.length > 0) {
  if (!shotGiven) die('more than one receipt path given');
  shotFiles = extraPos.map((x) => path.resolve(x));
}
if (!receiptArg) die('usage: chromium-receipt-r58.mjs <receipt.json> --driver <driver.mjs> [--expect-driver-sha256 <hex>] [--shot <dir>] [--json]');
if (!driverArg) die('usage: chromium-receipt-r58.mjs <receipt.json> --driver <driver.mjs> [--expect-driver-sha256 <hex>] [--shot <dir>] [--json]');

const receiptPath = path.resolve(receiptArg);
const driverPath = path.resolve(driverArg);
const out = checkReceipt({ receiptPath }, { driverPath, expectSha, shotDir, shotFiles });
const result = {
  schema: 'tabi-chromium-receipt-r58',
  receipt: receiptPath,
  driver: driverPath,
  shotDir: shotDir || path.dirname(receiptPath),
  nonce: out.receipt ? out.receipt.nonce : null,
  predicate: out.findings.length === 0,
  findingCount: out.findings.length,
  findings: out.findings,
  couldNotEvaluate: out.couldNotEvaluate,
};
if (jsonOut) {
  console.log(JSON.stringify(result, null, 1));
} else {
  console.log('receipt:   ' + result.receipt);
  console.log('driver:    ' + result.driver);
  console.log('predicate: ' + result.predicate);
  console.log('findings:  ' + result.findingCount);
  for (const f of result.findings) console.log('  - ' + f.id + (f.occurrences > 1 ? ' x' + f.occurrences : '') + ': ' + f.detail);
  for (const c of result.couldNotEvaluate) console.log('  ~ ' + c.code + ': ' + c.detail);
}
process.exit(result.predicate ? 0 : 1);
