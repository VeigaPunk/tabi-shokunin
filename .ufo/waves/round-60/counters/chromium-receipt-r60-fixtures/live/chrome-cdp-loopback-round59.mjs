#!/usr/bin/env node
// chrome-cdp-loopback-round59.mjs — tabi round 59, claim C2 runner
// (capability chromium-keyevent-capslock-toggle-linux).
//
// Round 59 extends the FROZEN r58 bytes
// (scripts/chrome-cdp-loopback-round58.mjs, which is never edited) with the
// CapsLock-toggle domain the r57 planned residual names and the routed D4
// positive control. Everything r56/r57/r58 witnessed is carried unchanged;
// the deltas are listed here, and nowhere else does behaviour differ from
// r58:
//
//   (1) RELABEL. schema tabi-chrome-cdp-r59, nonce tabi-r59-<12 hex>, the
//       fixture titles and the header. The nonce's 12-hex tail is
//       REGENERATED (bounded) whenever it carries no [a-f] letter, so both
//       the carried chord-letter derivation and the r59 CapsLock-letter
//       derivation always have a subject.
//   (2) FIXTURE DELTA. Both recorders (window.__keylog, window.__keylogFull)
//       gain exactly one ADDITIVE field — `capsLock`
//       (e.getModifierState('CapsLock') === true) — on every recorded
//       keydown AND keyup, so the PAGE's own record witnesses the latch
//       sequence. Every r58 field and the r58 keylog plan shape ride
//       unchanged; the addition is DISCLOSED in the receipt as
//       `fixtureDelta.additiveRecorderFields` and is never inferred.
//   (3) NEW leg: the CapsLock toggle leg, on the never-submitted #field3,
//       AFTER the r58 swallow leg (whose restore leaves the gate OFF) and
//       BEFORE the carried final Enter submit:
//         press1   CapsLock keyDown+keyUp (key/code CapsLock, VK 20, no
//                  text); the page record must read caps false before the
//                  press and true on the press1 keyup;
//         letters1 TWO nonce-derived [a-f] letters, typed r52-style
//                  (per-char code/windowsVirtualKeyCode, text = char); the
//                  page record must hold caps true across both;
//         press2   a SECOND CapsLock keyDown+keyUp; the page record must
//                  read caps false on its keyup;
//         letters2 TWO more nonce-derived letters; caps false across both.
//       The DOM value of #field3 is read back after EVERY keystroke
//       (prefix witnesses). The disclosed limit: CDP text injection is not
//       remapped by the latch — the inserted case is exactly the text the
//       driver sends.
//   (4) NEW leg: the routed D4 positive control on a second form page
//       /form2 (same fixture shape, NO swallower; served by the same
//       fixture server). The SAME Control+Enter chord (bit 2, text '\r')
//       on #field, prefilled with the nonce, DOES submit form2 to /echo2:
//       exactly one /echo2 request, witnessed client-side (navigation/URL
//       and the echo page's DOM) and server-side (the fixture server's own
//       request log). form1's single-/echo invariant is untouched; the two
//       forms submit independently.
//   (5) RECEIPT. capslockTrace (target, derivation, letters, press/letter
//       records, latch checkpoints and sequence, trace, capsLatchOk),
//       journey.form.capsLockLeg (the detailed leg with every value
//       read-back), journey.form2 (focus, typed nonce, the chord's DOM
//       records, the server request window, the /echo2 witness, the echo
//       page), echo2Witness, and the six new per-step PNGs appended to the
//       declared step list. The r58 top-level field3Value/field3Final are
//       read at the SAME carried point (before the submit), which is now
//       after the CapsLock leg: they hold the swallow control prefix plus
//       the four CapsLock letters. That shift is DISCLOSED, not hidden.
//   (6) STEP PLAN is append-only: the r58 twelve names keep their order and
//       the r59 six names are appended (m-capslock-press1 .. r-form2-echo).
//       receipt.steps is the declared list in that order; stepsExtended is
//       the chronological log.
//   (7) TEARDOWN is carried unchanged from r58: keyed PID-group kill, /proc
//       sweep to zero survivors, port probes on the fixture port and the
//       DevTools port.
//
// Round 58 extends the FROZEN r57 bytes
// (scripts/chrome-cdp-loopback-round57.mjs, which is never edited) with the
// accelerator-SWALLOWING domain the r57 planned residual names. Everything
// r56/r57 witnessed is carried unchanged; the deltas are listed here, and
// nowhere else in the runner does behaviour differ from r57:
//
//   (1) RELABEL. schema tabi-chrome-cdp-r58, nonce tabi-r58-<12 hex>, the
//       fixture titles and the header. The nonce's 12-hex tail is
//       REGENERATED (bounded) whenever it carries no [a-f] letter, so the
//       carried r57 chord-letter derivation always has a subject.
//   (2) FIXTURE DELTA. The page's OWN swallower — a capture-phase keydown
//       listener registered BEFORE both r57 recorders on the same target and
//       phase, so capture order makes its preventDefault visible in their
//       records — calls preventDefault() exactly when
//       window.__swallowOn === true and window.__swallowSet carries
//       event.key. window.__setSwallow(on, keys) is the only way to reach it
//       (idempotent: it CLEARS then SETS); the fixture JS reads no URL, query
//       or hash, so no query-string bypass exists, and references no external
//       URL. Both recorders (`window.__keylog`, `window.__keylogFull`) gain
//       exactly two ADDITIVE fields — `cancelable` (from the event) and
//       `defaultPrevented` (the event's flag AFTER the swallower ran) — so a
//       receipt can distinguish delivered-but-swallowed from not-delivered
//       and from delivered-and-acted-on. Every r57 field and the r57 keylog
//       plan shape ride unchanged; the addition is DISCLOSED in the receipt
//       as `fixtureDelta` and is never inferred from the driver.
//   (3) NEW leg: the swallow domain, on the never-submitted #field3, AFTER
//       the carried chord leg (which requires #field3 empty) and BEFORE the
//       carried final Enter submit, with the gate restored OFF before that
//       submit:
//         s1 control, gate OFF — the first two characters of the nonce hex
//            tail are typed into #field3: both insert (valueAfter equals
//            them), both keylog entries carry cancelable true and
//            defaultPrevented false;
//         s2 gate ON {Backspace} — the Backspace keydown is DELIVERED (a
//            keylog entry with cancelable true) with defaultPrevented TRUE and
//            the field value read back UNCHANGED;
//         s3 gate ON {<third hex-tail character>} — that character's keydown
//            is delivered with defaultPrevented TRUE and the value UNCHANGED
//            (a swallowed insertion);
//         s4 gate ON {Enter} — ONE Control+Enter chord (modifier bit 2 per
//            S153, text '\r' exactly as the carried submit carries) is
//            delivered with BOTH keydowns recorded, defaultPrevented TRUE on
//            the Enter event, and NO /echo request reaches the fixture
//            server.
//       The carried final Enter submit (gate OFF) stays the run's ONLY
//       submission; journey.form.serverRequests carries the fixture server's
//       own request log (path + query per request), so the one-submission
//       witness is committed bytes, not a driver claim.
//   (4) RECEIPT. journey.form.swallowLeg (control / backspaceSwallow /
//       digitSwallow / enterChordSwallow / restore), fixtureDelta,
//       journey.form.serverRequests, declaredStepNames, and the four swallow
//       per-step PNGs in stepsExtended and journey.form.shots. The r57
//       top-level `field3Value`/`field3Final` are read at the SAME carried
//       point (before the submit), which is now after the swallow leg: they
//       hold the typed two-character prefix instead of the empty string. The
//       carried chord-leg negative witness stays where r57 put it, in
//       journey.form.chordLeg.field3ValueAfter === '', and
//       journey.form.swallowLeg.control.valueBefore proves #field3 was still
//       empty when the swallow leg began. That shift is DISCLOSED, not hidden.
//   (5) LEG ORDER. plain trace -> control legs -> shift trace -> chord domain
//       -> swallow domain -> submit. The r56 steps array and the r57
//       stepsExtended naming are unchanged in name and order; the four new
//       swallow PNGs ride chronologically in stepsExtended and are listed in
//       journey.form.shots with the r57 g/h shots.
//   (6) TEARDOWN is carried unchanged from r57: keyed PID-group kill, /proc
//       sweep to zero survivors, port probes on the fixture port and the
//       DevTools port.
//
// Drives the Linux host's Chromium 155 headless surface over raw CDP
// (loopback only, throwaway profile, node's built-in WebSocket, zero npm
// deps) against an inline loopback fixture and records a nonce-bound
// evidence receipt whose EVERY witness is page-side DOM state or
// server-side request state, never the driver's assumption.
//
// Process discipline (the r46/r55 keyed-teardown model, ported to Linux):
// the launch owns a unique token that appears verbatim in the throwaway
// profile path (<scratch>/profile-<token>) and therefore in the command line
// of the browser and every helper. /proc is swept for that token:
//   pre-launch  count MUST be 0 (a fresh key; refuse to start otherwise),
//   mid-run     count MUST be >= 1 (the key really binds this launch),
//   post-kill   survivors are killed BY PID (never pkill -f, never an image
//               name — the operator runs the same binary), re-swept until 0;
//               the receipt is green only when the final sweep is 0 AND the
//               fixture/DevTools ports refuse a connect.
// The browser is spawned detached so it owns a process group and is killed as
// a GROUP (kill(-pid)) before the per-pid sweep.
//
// Profile safety (found by the r56 runner's own usage test): Chromium
// SILENTLY FALLS BACK to the operator's default profile when
// --user-data-dir is not writable — an uncreatable scratch (/root as a plain
// user) made it open /home/vgpnk/.config/chromium. The runner therefore
// refuses before spawn unless the scratch passes a real write probe and the
// throwaway profile directory is created, verified EMPTY, mode 0700, and
// writable; the realpath of the scratch is also checked against the
// operator's default profile so a symlink cannot re-enter it. The default
// Chromium profile is never read. Throwaway HOME/XDG_CONFIG_HOME under the
// scratch and --disable-extensions are mandatory (the r56 sentinel
// amendments), never optional.
//
// Usage:
//   node scripts/chrome-cdp-loopback-round58.mjs --scratch <ABS dir> --out <ABS receipt.json> [--chromium <ABS bin>]
//   node scripts/chrome-cdp-loopback-round58.mjs --path-selftest
//
// Exit: 0 predicate true; 1 predicate false (the receipt IS still written, so
// a red run is committable evidence); 2 usage / environment precondition /
// fixture-contract failure (nothing spawned, no receipt).
// Writes: everything under --scratch (server-log.json, profile-<token>/),
// plus the receipt and the twelve step PNGs (six carried r56 steps, the two
// r57 legs, the four r58 swallow steps) inside dirname(--out).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-r59';
const SELF = fileURLToPath(import.meta.url);
const DEFAULT_CHROMIUM = '/usr/bin/chromium';
const DEFAULT_PROFILE_ROOT = path.join(os.homedir(), '.config', 'chromium');
// The r56 step array is kept byte-for-byte in name and order (its counter
// pins it); the r57 legs' and the r58 swallow leg's evidence files ride
// beside it.
const STEP_NAMES = ['a-start', 'b-typed', 'c-end-witness', 'd-backspace', 'e-tab', 'f-enter-echo'];
const SHOT_NAMES = ['g-shift-typed', 'h-chord-domain',
  'i-swallow-control', 'j-swallow-backspace', 'k-swallow-digit', 'l-swallow-enter',
  'm-capslock-press1', 'n-capslock-letters1', 'o-capslock-press2', 'p-capslock-letters2',
  'q-form2-chord', 'r-form2-echo'];
const ALL_PNG_NAMES = [...STEP_NAMES, ...SHOT_NAMES];
const ENTER_TIMEOUT_MS = 5000; // the frozen C2 kill rule: "no submit request within 5 s"
// The swallow leg's no-submission window: after the Control+Enter chord the
// fixture server must stay silent for this long before the gate is restored.
const SWALLOW_NO_SUBMIT_WAIT_MS = 1500;
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;

// S153 (Input.dispatchKeyEvent.modifiers): Alt=1, Ctrl=2, Meta/Command=4,
// Shift=8. The three chords below carry the three non-Shift bits; Shift=8
// rides the Shift-chord trace's letter events (and its own keyDown/keyUp).
const CHORD_MODS = [
  { name: 'Control', bit: 2, key: 'Control', code: 'ControlLeft', vk: 17 },
  { name: 'Alt', bit: 1, key: 'Alt', code: 'AltLeft', vk: 18 },
  { name: 'Meta', bit: 4, key: 'Meta', code: 'MetaLeft', vk: 91 },
];

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// CDP key naming for every character a nonce can contain
// ('tabi-r58-' + 12 lowercase hex: a-z, 0-9, '-'), and for the UPPERCASED
// value the Shift-chord trace types (A-Z, 0-9, '-').
const vkFor = (ch) => (/[0-9]/.test(ch) ? 48 + Number(ch)
  : /[a-z]/.test(ch) ? 65 + (ch.charCodeAt(0) - 97)
  : ch === '-' ? 189 : null);
const codeFor = (ch) => (/[0-9]/.test(ch) ? 'Digit' + ch
  : /[a-z]/.test(ch) ? 'Key' + ch.toUpperCase()
  : ch === '-' ? 'Minus' : null);
const vkForMixed = (ch) => (/[0-9]/.test(ch) ? 48 + Number(ch)
  : /[A-Z]/.test(ch) ? 65 + (ch.charCodeAt(0) - 65)
  : ch === '-' ? 189 : null);
const codeForMixed = (ch) => (/[0-9]/.test(ch) ? 'Digit' + ch
  : /[A-Z]/.test(ch) ? 'Key' + ch
  : ch === '-' ? 'Minus' : null);

// The chord letter: the FIRST [a-f] character of the nonce's hex tail (the
// third dash-separated field of 'tabi-r58-<hex>'). null when the tail carries
// none — the live path regenerates the nonce so the derivation always has a
// subject; the selftest asserts both branches.
function deriveChordLetter(nonceValue) {
  const tail = String(nonceValue).split('-')[2] || '';
  const m = /([a-f])/.exec(tail);
  return m ? m[1] : null;
}

// The swallow leg's subject: the nonce hex tail itself. s1 types the FIRST
// TWO tail characters into #field3 (they are hex digits: 0-9a-f), s3 presses
// the THIRD. null when the tail is shorter than three characters.
function deriveSwallowSubject(nonceValue) {
  const tail = String(nonceValue).split('-')[2] || '';
  if (!/^[0-9a-f]{3,}$/.test(tail)) return null;
  return { hexTail: tail, controlChars: [tail[0], tail[1]], thirdChar: tail[2] };
}

// The r59 CapsLock leg's subject: the [a-f] letters of the nonce hex tail in
// order, cycled to four so the two letters after each CapsLock press always
// exist. The live nonce is regenerated while its tail carries no [a-f], so
// the live path always has a subject; the selftest asserts the cycling and
// the null branch.
function deriveCapsSubject(nonceValue) {
  const tail = String(nonceValue).split('-')[2] || '';
  const found = tail.match(/[a-f]/g) || [];
  if (!found.length) return null;
  const letters = found.slice(0, 4);
  const cycle = found.slice();
  let k = 0;
  while (letters.length < 4) letters.push(cycle[k++ % cycle.length]);
  return {
    hexTail: tail,
    letters,
    letters1: letters.slice(0, 2),
    letters2: letters.slice(2, 4),
  };
}

// The r59 measured-negative contract, shared by the live path and the
// selftest: every CapsLock-leg page record (keydown AND keyup) must carry the
// delivered shape, and the caps flag MUST be the boolean false. A true
// anywhere is the forged/unexpected state the C2 kill rule names; a missing
// shape field is a delivery failure. `expected` is the receipt's named
// expectation (false on this surface).
function capsBoundaryOk(entries, expected) {
  if (expected !== false) return false;
  if (!Array.isArray(entries) || entries.length === 0) return false;
  return entries.every((e) => e
    && (e.type === 'keyDown' || e.type === 'keyUp')
    && typeof e.key === 'string' && e.key.length > 0
    && typeof e.code === 'string' && e.code.length > 0
    && typeof e.keyCode === 'number'
    && e.cancelable === true
    && e.defaultPrevented === false
    && e.capsLock === false);
}

// The fixture's swallow gate, as a pure function: the page calls
// e.preventDefault() exactly when the gate is ON and the event's key is in
// the gate's set. The run derives the EXPECTED defaultPrevented of every
// planned keydown from this function; the page's own recorded flag is then
// compared against it, so the witness is the page's, not the driver's.
function swallowGate(on, set, key) {
  return on === true && Array.isArray(set) && set.indexOf(key) !== -1;
}

// The fixture contract, shared by the live path and --path-selftest: the live
// run REFUSES to spawn a browser against a fixture that cannot witness the
// legs, so the selftest cannot pass on logic the run does not use.
function fixtureContract(html) {
  const s = String(html);
  const inputTag = (id) => {
    const m = new RegExp('<input[^>]*\\bid="' + id + '"[^>]*>').exec(s);
    return m ? m[0] : null;
  };
  const nameOf = (tag) => {
    const m = tag ? /\bname="([^"]*)"/.exec(tag) : null;
    return m ? m[1] : null;
  };
  const tagField = inputTag('field');
  const tagField2 = inputTag('field2');
  const tagField3 = inputTag('field3');
  // The swallower must be REGISTERED BEFORE both recorders: same target
  // (document), same phase (capture), so capture order alone decides who runs
  // first and the recorders see the swallower's preventDefault.
  const swallowAt = s.indexOf('window.__swallowSet.indexOf(e.key)');
  const recorderAt = s.indexOf('window.__keylog = []');
  // No URL / environment channel may toggle the gate (no query-string
  // bypass): the fixture JS reads no URL, no cookie and no window.name, and
  // it references no external URL.
  const urlToggles = ['location', 'URLSearchParams', 'document.cookie', 'window.name', 'localStorage', 'sessionStorage']
    .filter((needle) => s.includes(needle));
  const external = ['http://', 'https://', '<link', '<img', '<script src']
    .filter((needle) => s.includes(needle));
  const res = {
    field: Boolean(tagField) && nameOf(tagField) === 'field',
    field2: Boolean(tagField2) && nameOf(tagField2) === 'field2',
    field3: Boolean(tagField3),
    field3Name: nameOf(tagField3),
    recorder: /window\.__keylog\s*=\s*\[\]/.test(s) && /addEventListener\(\s*'keydown'/.test(s),
    recorderFull: /window\.__keylogFull\s*=\s*\[\]/.test(s),
    // the additive fields: both recorders must record them
    cancelableRecorded: (s.match(/cancelable:\s*e\.cancelable === true/g) || []).length >= 2,
    defaultPreventedRecorded: (s.match(/defaultPrevented:\s*e\.defaultPrevented === true/g) || []).length >= 2,
    capsLockRecorded: (s.match(/capsLock:\s*e\.getModifierState\('CapsLock'\) === true/g) || []).length >= 2,
    shiftRecorded: (s.match(/shift:\s*e\.getModifierState\('Shift'\) === true/g) || []).length >= 2,
    swallowApi: /window\.__setSwallow\s*=\s*function/.test(s)
      && /window\.__swallowOn\s*=\s*on === true/.test(s)
      && /window\.__swallowSet\s*=\s*Array\.isArray\(keys\)\s*\?\s*keys\.slice\(\)\s*:\s*\[\]/.test(s),
    swallowListener: swallowAt >= 0 && /e\.preventDefault\(\)/.test(s)
      && /window\.__swallowOn === true/.test(s),
    swallowRegisteredBeforeRecorder: swallowAt >= 0 && recorderAt >= 0 && swallowAt < recorderAt,
    urlToggles,
    external,
  };
  res.noUrlToggle = urlToggles.length === 0 && external.length === 0;
  res.missing = [];
  if (!res.field) res.missing.push('field');
  if (!res.field2) res.missing.push('field2');
  if (!res.field3) res.missing.push('field3');
  if (res.field3 && res.field3Name !== null) res.missing.push('field3-carries-name:' + res.field3Name);
  if (!res.recorder) res.missing.push('keylog-recorder');
  if (!res.recorderFull) res.missing.push('keylog-full-recorder');
  if (!res.cancelableRecorded) res.missing.push('recorder-cancelable');
  if (!res.defaultPreventedRecorded) res.missing.push('recorder-default-prevented');
  if (!res.capsLockRecorded) res.missing.push('recorder-capslock');
  if (!res.shiftRecorded) res.missing.push('recorder-shiftstate');
  if (!res.swallowApi) res.missing.push('swallow-api');
  if (!res.swallowListener) res.missing.push('swallow-listener');
  if (!res.swallowRegisteredBeforeRecorder) res.missing.push('swallow-listener-order');
  for (const t of urlToggles) res.missing.push('url-toggle-channel:' + t);
  for (const e of external) res.missing.push('external-reference:' + e);
  res.ok = res.missing.length === 0;
  return res;
}

// The form2 contract (r59, the routed D4 positive control): the SAME fixture
// shape as form1 with NO swallower, its own /echo2 action, both recorders
// (including the r59 capsLock field) and the unnamed #field3. Shared by the
// selftest and the live path; the live path ALSO asserts at runtime that no
// swallow API exists on the served page.
function form2Contract(html) {
  const s = String(html);
  const input = (id) => {
    const m = new RegExp('<input[^>]*\\bid="' + id + '"[^>]*>').exec(s);
    return m ? m[0] : null;
  };
  const nameOf = (tag) => {
    const m = tag ? /\bname="([^"]*)"/.exec(tag) : null;
    return m ? m[1] : null;
  };
  const tagField = input('field');
  const tagField2 = input('field2');
  const tagField3 = input('field3');
  const external = ['http://', 'https://', '<link', '<img', '<script src']
    .filter((needle) => s.includes(needle));
  const urlToggles = ['location.search', 'URLSearchParams', 'document.cookie', 'window.name', 'localStorage', 'sessionStorage']
    .filter((needle) => s.includes(needle));
  const res = {
    actionEcho2: /\baction="\/echo2"/.test(s),
    noSwallower: !/__swallowOn|__setSwallow|preventDefault/.test(s),
    field: Boolean(tagField) && nameOf(tagField) === 'field',
    field2: Boolean(tagField2) && nameOf(tagField2) === 'field2',
    field3: Boolean(tagField3),
    field3Name: nameOf(tagField3),
    recorder: /window\.__keylog\s*=\s*\[\]/.test(s) && /addEventListener\(\s*'keydown'/.test(s),
    recorderFull: /window\.__keylogFull\s*=\s*\[\]/.test(s),
    keyupRecorded: /addEventListener\(\s*'keyup'/.test(s),
    capsLockRecorded: (s.match(/capsLock:\s*e\.getModifierState\('CapsLock'\) === true/g) || []).length >= 2,
    shiftRecorded: (s.match(/shift:\s*e\.getModifierState\('Shift'\) === true/g) || []).length >= 2,
    urlToggles,
    external,
  };
  res.noUrlToggle = urlToggles.length === 0 && external.length === 0;
  res.missing = [];
  if (!res.actionEcho2) res.missing.push('action-echo2');
  if (!res.noSwallower) res.missing.push('swallower-present');
  if (!res.field) res.missing.push('field');
  if (!res.field2) res.missing.push('field2');
  if (!res.field3) res.missing.push('field3');
  if (res.field3 && res.field3Name !== null) res.missing.push('field3-carries-name:' + res.field3Name);
  if (!res.recorder) res.missing.push('keylog-recorder');
  if (!res.recorderFull) res.missing.push('keylog-full-recorder');
  if (!res.keyupRecorded) res.missing.push('keyup-recorder');
  if (!res.capsLockRecorded) res.missing.push('recorder-capslock');
  if (!res.shiftRecorded) res.missing.push('recorder-shiftstate');
  for (const t of urlToggles) res.missing.push('url-toggle-channel:' + t);
  for (const e of external) res.missing.push('external-reference:' + e);
  res.ok = res.missing.length === 0;
  return res;
}

// The Shift-chord trace contract, shared by the live path and the selftest:
// every uppercase letter MUST ride a real Shift keyDown/keyUp pair around its
// key pair (the `ride` record), the letter event MUST carry modifiers 8 and
// the shifted key/text, non-uppercase characters MUST NOT ride (modifiers 0,
// no ride), and the read-back of BOTH fields must hold after EVERY keystroke.
function shiftTraceOk(mixed, plain, typing) {
  if (!Array.isArray(typing) || typing.length !== mixed.length) return false;
  return typing.every((e, i) => {
    if (!e || e.char !== mixed[i]) return false;
    const ride = /[A-Z]/.test(mixed[i]);
    if (e.shiftRide !== ride) return false;
    if (e.modifiers !== (ride ? 8 : 0)) return false;
    if (e.valueAfterField !== plain) return false;
    if (e.valueAfter !== mixed.slice(0, i + 1)) return false;
    if (ride) {
      const r = e.ride;
      if (!r || !r.keyDown || !r.keyUp) return false;
      if (!(r.keyDown.key === 'Shift' && r.keyDown.code === 'ShiftLeft' && r.keyDown.keyCode === 16
        && r.keyDown.modifiers === 8 && r.keyDown.shiftKey === true)) return false;
      if (!(r.keyUp.key === 'Shift' && r.keyUp.code === 'ShiftLeft' && r.keyUp.keyCode === 16
        && r.keyUp.modifiers === 8 && r.keyUp.shiftKey === true)) return false;
    } else if (e.ride !== null && e.ride !== undefined) {
      return false;
    }
    return true;
  });
}

// The page-side bracket witness: walking the FULL page record, each uppercase
// letter's keydown/keyup pair must be immediately bracketed by the Shift
// keydown (before) and the Shift keyup (after). Returns the section bounds so
// the runner can assert the section ends where the chord leg begins.
function shiftRideSectionOk(pageLog, mixed) {
  if (!Array.isArray(pageLog)) return { ok: false, reason: 'page log absent', start: -1, end: -1 };
  const start = pageLog.findIndex((e) => e && e.type === 'keyDown' && e.key === 'Shift' && e.code === 'ShiftLeft');
  if (start < 0) return { ok: false, reason: 'no Shift keydown in the page record', start: -1, end: -1 };
  let k = start;
  for (const ch of mixed) {
    const ride = /[A-Z]/.test(ch);
    if (ride) {
      const kd = pageLog[k];
      if (!kd || kd.type !== 'keyDown' || kd.key !== 'Shift' || kd.code !== 'ShiftLeft' || kd.shiftKey !== true) {
        return { ok: false, reason: 'Shift keydown missing at ' + k + ' for ' + ch, start, end: k };
      }
      k++;
    }
    const down = pageLog[k];
    if (!down || down.type !== 'keyDown' || down.key !== ch) {
      return { ok: false, reason: 'letter keydown missing at ' + k + ' for ' + ch, start, end: k };
    }
    const up = pageLog[k + 1];
    if (!up || up.type !== 'keyUp' || up.key !== ch) {
      return { ok: false, reason: 'letter keyup missing at ' + (k + 1) + ' for ' + ch, start, end: k + 1 };
    }
    if (ride) {
      const ku = pageLog[k + 2];
      if (!ku || ku.type !== 'keyUp' || ku.key !== 'Shift' || ku.code !== 'ShiftLeft' || ku.shiftKey !== true) {
        return { ok: false, reason: 'Shift keyup missing at ' + (k + 2) + ' for ' + ch, start, end: k + 2 };
      }
      k += 3;
    } else {
      k += 2;
    }
  }
  return { ok: true, reason: '', start, end: k };
}

// The CDP modifier bit <-> DOM boolean correspondence a chord MUST produce
// (S153 grounds the bits, S161 the booleans).
function chordBoolFor(bit) {
  return { ctrlKey: bit === 2, altKey: bit === 1, metaKey: bit === 4, shiftKey: false };
}

function chordDomOk(chord, letter, letterCode, letterVk) {
  if (!chord || !Array.isArray(chord.domEvents) || chord.domEvents.length !== 2) return false;
  const bools = chordBoolFor(chord.bit);
  const [a, b] = chord.domEvents;
  if (!a || !b) return false;
  if (a.key !== chord.key || a.code !== chord.code || a.keyCode !== chord.windowsVirtualKeyCode) return false;
  if (a.ctrlKey !== bools.ctrlKey || a.altKey !== bools.altKey || a.metaKey !== bools.metaKey || a.shiftKey !== false) return false;
  if (b.key !== letter || b.code !== letterCode || b.keyCode !== letterVk) return false;
  if (b.ctrlKey !== bools.ctrlKey || b.altKey !== bools.altKey || b.metaKey !== bools.metaKey || b.shiftKey !== false) return false;
  return true;
}

// The complete expected page keydown plan for the run, re-derived from the
// nonce and the fixture's control/chord constants. The counter re-derives the
// same plan independently from the receipt's own nonce; this copy only makes
// the RUN fail loudly when the page's record disagrees with what was
// dispatched. Every entry also carries the two additive recorder fields: a
// keydown is `cancelable` on this host (probed before the freeze — digits,
// letters, '-', End, Tab, Shift, Control, Alt, Meta, Backspace and Enter all
// report cancelable true) and is `defaultPrevented` only when the fixture's
// swallower matched it, which is exactly what swallowGate() decides.
function expectedKeylogPlan(nonceValue, mixed, chordLetter, swallowSubject, capsSubject) {
  const plan = [];
  const plain = { ctrlKey: false, altKey: false, metaKey: false, shiftKey: false };
  const kd = (base, prevented) => ({ ...base, cancelable: true, defaultPrevented: prevented === true });
  for (const ch of nonceValue) plan.push(kd({ key: ch, code: codeFor(ch), keyCode: vkFor(ch), ...plain }));
  const rCh = nonceValue[nonceValue.length - 1];
  plan.push(kd({ key: 'End', code: 'End', keyCode: 35, ...plain }));
  plan.push(kd({ key: 'Backspace', code: 'Backspace', keyCode: 8, ...plain }));
  plan.push(kd({ key: rCh, code: codeFor(rCh), keyCode: vkFor(rCh), ...plain }));
  plan.push(kd({ key: 'Tab', code: 'Tab', keyCode: 9, ...plain }));
  for (const ch of mixed) {
    const ride = /[A-Z]/.test(ch);
    if (ride) plan.push(kd({ key: 'Shift', code: 'ShiftLeft', keyCode: 16, ctrlKey: false, altKey: false, metaKey: false, shiftKey: true }));
    plan.push(kd({ key: ch, code: codeForMixed(ch), keyCode: vkForMixed(ch), ctrlKey: false, altKey: false, metaKey: false, shiftKey: ride }));
  }
  const chordLetterCode = 'Key' + chordLetter.toUpperCase();
  const chordLetterVk = 65 + (chordLetter.charCodeAt(0) - 97);
  for (const cm of CHORD_MODS) {
    const bools = chordBoolFor(cm.bit);
    plan.push(kd({ key: cm.key, code: cm.code, keyCode: cm.vk, ...bools }));
    plan.push(kd({ key: chordLetter, code: chordLetterCode, keyCode: chordLetterVk, ...bools }));
  }
  // the r58 swallow leg: s1 runs with the gate OFF, s2/s3/s4 with it ON for
  // exactly one key each.
  for (const ch of swallowSubject.controlChars) {
    plan.push(kd({ key: ch, code: codeFor(ch), keyCode: vkFor(ch), ...plain }, swallowGate(false, [], ch)));
  }
  plan.push(kd({ key: 'Backspace', code: 'Backspace', keyCode: 8, ...plain },
    swallowGate(true, ['Backspace'], 'Backspace')));
  const third = swallowSubject.thirdChar;
  plan.push(kd({ key: third, code: codeFor(third), keyCode: vkFor(third), ...plain },
    swallowGate(true, [third], third)));
  const ctrlBools = chordBoolFor(2);
  plan.push(kd({ key: 'Control', code: 'ControlLeft', keyCode: 17, ...ctrlBools },
    swallowGate(true, ['Enter'], 'Control')));
  plan.push(kd({ key: 'Enter', code: 'Enter', keyCode: 13, ...ctrlBools },
    swallowGate(true, ['Enter'], 'Enter')));
  // the r59 CapsLock leg: two presses, each followed by two nonce-derived
  // letters. The delivered shape is asserted separately from the caps flag,
  // which this surface measures as FALSE throughout (the claim's measured
  // negative); the plan carries the key facts only.
  const capsLetter = (ch) => kd({ key: ch, code: codeFor(ch), keyCode: vkFor(ch), ...plain });
  plan.push(kd({ key: 'CapsLock', code: 'CapsLock', keyCode: 20, ...plain }));
  for (const ch of capsSubject.letters1) plan.push(capsLetter(ch));
  plan.push(kd({ key: 'CapsLock', code: 'CapsLock', keyCode: 20, ...plain }));
  for (const ch of capsSubject.letters2) plan.push(capsLetter(ch));
  return plan;
}

// ---------------------------------------------------------------------------
// Path contract. These validators are shared by the selftest and the live
// path, so the selftest cannot pass on logic the run does not use.
class PathError extends Error {}
const isAbsNative = (p) => typeof p === 'string' && p.length > 0 && path.isAbsolute(p);
const norm = (p) => path.resolve(p);
const inside = (child, parent) => {
  const c = norm(child);
  const p = norm(parent);
  return c === p || c.startsWith(p + path.sep);
};

function validateScratch(given) {
  if (typeof given !== 'string' || given === '') throw new PathError('--scratch is required');
  if (!isAbsNative(given)) throw new PathError('--scratch must be an ABSOLUTE path: ' + given);
  const resolved = norm(given);
  if (resolved === norm(os.homedir())) throw new PathError('--scratch must not be the home directory: ' + resolved);
  if (resolved === path.parse(resolved).root) throw new PathError('--scratch must not be a filesystem root: ' + resolved);
  if (inside(resolved, DEFAULT_PROFILE_ROOT)) throw new PathError('--scratch must not live inside the user Chromium profile: ' + resolved);
  return resolved;
}

function validateOut(given) {
  if (typeof given !== 'string' || given === '') throw new PathError('--out is required');
  if (!isAbsNative(given)) throw new PathError('--out must be an ABSOLUTE path: ' + given);
  const resolved = norm(given);
  if (inside(resolved, DEFAULT_PROFILE_ROOT)) throw new PathError('--out must not live inside the user Chromium profile: ' + resolved);
  return resolved;
}

// The profile is a THROWAWAY directory, always <scratch>/profile-<12 hex>.
// It can never be, or live under, the operator's default Chromium profile.
function validateProfile(scratch, token, profileDir) {
  if (typeof token !== 'string' || !/^[0-9a-f]{12}$/.test(token)) throw new PathError('launch token must be 12 lowercase hex chars: ' + String(token));
  const want = path.join(scratch, 'profile-' + token);
  if (norm(profileDir) !== norm(want)) throw new PathError('profile dir must be ' + want + ', got ' + profileDir);
  if (inside(profileDir, DEFAULT_PROFILE_ROOT)) throw new PathError('profile must not be the user Chromium profile: ' + profileDir);
  if (!inside(profileDir, scratch) || norm(profileDir) === norm(scratch)) throw new PathError('profile must be a child of --scratch: ' + profileDir);
  return norm(profileDir);
}

const pngNameFor = (stepName) => {
  if (!ALL_PNG_NAMES.includes(stepName)) throw new PathError('unknown step name: ' + stepName);
  return stepName + '.png';
};

function pathSelftest() {
  const cases = [];
  const t = (name, fn) => {
    try { fn(); cases.push({ name, ok: true }); }
    catch (e) { cases.push({ name, ok: false, error: String((e && e.message) || e) }); }
  };
  const refuses = (fn, label) => {
    let threw = false;
    try { fn(); } catch (e) { threw = e instanceof PathError; }
    if (!threw) throw new PathError(label + ' was accepted');
  };
  const abs = path.join(os.tmpdir(), 'tabi-r58-selftest');
  // 1 — relative scratch refused
  t('relative-scratch-refused', () => refuses(() => validateScratch('rel/scratch'), 'relative scratch'));
  // 2 — relative out refused
  t('relative-out-refused', () => refuses(() => validateOut('out/receipt.json'), 'relative out'));
  // 3 — out inside os.tmpdir() allowed
  t('out-inside-tmp-allowed', () => {
    const r = validateOut(path.join(os.tmpdir(), 'tabi-r58-selftest', 'receipt.json'));
    if (!isAbsNative(r)) throw new PathError('tmp out not absolute: ' + r);
    if (norm(r) !== norm(path.join(os.tmpdir(), 'tabi-r58-selftest', 'receipt.json'))) throw new PathError('tmp out relocated: ' + r);
  });
  // 4 — the six r56 PNG names in their frozen order, then the r57 legs, then
  //      the four r58 swallow steps: the driver's DECLARED step list, which
  //      the freeze pins
  t('png-names-fixed', () => {
    const got = ALL_PNG_NAMES.map(pngNameFor);
    const want = ['a-start.png', 'b-typed.png', 'c-end-witness.png', 'd-backspace.png',
      'e-tab.png', 'f-enter-echo.png', 'g-shift-typed.png', 'h-chord-domain.png',
      'i-swallow-control.png', 'j-swallow-backspace.png', 'k-swallow-digit.png', 'l-swallow-enter.png',
      'm-capslock-press1.png', 'n-capslock-letters1.png', 'o-capslock-press2.png',
      'p-capslock-letters2.png', 'q-form2-chord.png', 'r-form2-echo.png'];
    if (JSON.stringify(got) !== JSON.stringify(want)) throw new PathError('png names drifted: ' + JSON.stringify(got));
    if (want.length !== 18 || ALL_PNG_NAMES.length !== 18 || SHOT_NAMES.length !== 12) {
      throw new PathError('the declared step list is not the frozen eighteen: ' + ALL_PNG_NAMES.length);
    }
    if (JSON.stringify(STEP_NAMES) !== JSON.stringify(want.slice(0, 6).map((n) => n.replace(/\.png$/, '')))) {
      throw new PathError('the r56 step array drifted: ' + JSON.stringify(STEP_NAMES));
    }
    refuses(() => pngNameFor('z-unknown'), 'unknown step name');
  });
  // 5 — scratch cannot be the home directory
  t('scratch-cannot-be-home', () => {
    refuses(() => validateScratch(os.homedir()), 'home as scratch');
    refuses(() => validateScratch(path.parse(os.homedir()).root), 'filesystem root as scratch');
    if (!isAbsNative(validateScratch(abs))) throw new PathError('a real absolute scratch was rejected');
  });
  // 6 — profile cannot be the user's default Chromium profile
  t('profile-cannot-be-default-chromium-profile', () => {
    const scratch = validateScratch(abs);
    refuses(() => validateProfile(scratch, 'abcdef012345', DEFAULT_PROFILE_ROOT), 'default chromium profile as profile');
    refuses(() => validateProfile(scratch, 'abcdef012345', path.join(DEFAULT_PROFILE_ROOT, 'Default')), 'chrome profile subdir as profile');
    refuses(() => validateProfile(scratch, 'abcdef012345', path.join(scratch, 'not-the-token')), 'profile not keyed by the token');
    refuses(() => validateProfile(scratch, '../escape', path.join(scratch, 'profile-../escape')), 'malformed token');
    const good = validateProfile(scratch, 'abcdef012345', path.join(scratch, 'profile-abcdef012345'));
    if (!inside(good, scratch)) throw new PathError('throwaway profile escaped scratch');
  });
  // 7 — the fixture contract: the REAL fixture passes...
  t('fixture-contract-green', () => {
    const c = fixtureContract(FIXTURE_HTML);
    if (!c.ok) throw new PathError('the shipped fixture does not satisfy its own contract: ' + JSON.stringify(c.missing));
    if (c.field3Name !== null) throw new PathError('field3 carries a name attribute: ' + JSON.stringify(c.field3Name));
    if (c.swallowRegisteredBeforeRecorder !== true) throw new PathError('the shipped fixture registers the swallower after a recorder');
    if (c.cancelableRecorded !== true || c.defaultPreventedRecorded !== true) throw new PathError('the shipped fixture does not record the additive fields');
    if (c.noUrlToggle !== true) throw new PathError('the shipped fixture carries a URL toggle channel: ' + JSON.stringify([c.urlToggles, c.external]));
  });
  // 8 — ...and a fixture MISSING #field3 is refused
  t('fixture-missing-field3', () => {
    const broken = FIXTURE_HTML.replace(/<input id="field3"[^>]*>\n?/, '');
    const c = fixtureContract(broken);
    if (c.ok) throw new PathError('a fixture without #field3 satisfied the contract');
    if (!c.missing.includes('field3')) throw new PathError('field3 absence not named: ' + JSON.stringify(c.missing));
  });
  // 9 — a fixture whose keydown recorder is ABSENT is refused
  t('fixture-keylog-recorder-absent', () => {
    const broken = FIXTURE_HTML.replace(/<script>[\s\S]*?<\/script>/, '');
    const c = fixtureContract(broken);
    if (c.ok) throw new PathError('a fixture without the keylog recorder satisfied the contract');
    if (!c.missing.includes('keylog-recorder')) throw new PathError('recorder absence not named: ' + JSON.stringify(c.missing));
  });
  // 10 — a fixture whose #field3 carries a NAME attribute is refused
  t('fixture-field3-named', () => {
    const broken = FIXTURE_HTML.replace('<input id="field3" value="" size="40">', '<input id="field3" name="leak" value="" size="40">');
    if (broken === FIXTURE_HTML) throw new PathError('selftest fixture rewrite did not apply');
    const c = fixtureContract(broken);
    if (c.ok) throw new PathError('a fixture with a named field3 satisfied the contract');
    if (!c.missing.some((m) => m.startsWith('field3-carries-name:'))) throw new PathError('named field3 not named: ' + JSON.stringify(c.missing));
  });
  // 11 — the Shift trace contract: a ride-less uppercase letter is refused
  t('shift-ride-absent-refused', () => {
    const plain = 'tabi-r57-ab';
    const rideRec = () => ({
      keyDown: { key: 'Shift', code: 'ShiftLeft', keyCode: 16, modifiers: 8, shiftKey: true },
      keyUp: { key: 'Shift', code: 'ShiftLeft', keyCode: 16, modifiers: 8, shiftKey: true },
    });
    const good = {
      i: 0, char: 'T', key: 'T', code: 'KeyT', windowsVirtualKeyCode: 84,
      shiftRide: true, modifiers: 8, valueAfter: 'T', valueAfterField: plain, ride: rideRec(),
    };
    // a one-entry trace cannot satisfy a two-character value
    if (shiftTraceOk('TT', plain, [good]) !== false) throw new PathError('a short trace was accepted');
    if (shiftTraceOk('T', plain, [{ ...good, ride: null }]) !== false) {
      throw new PathError('an uppercase letter without its Shift ride was accepted');
    }
    if (shiftTraceOk('T', plain, [good]) !== true) throw new PathError('a correct ride was refused');
    const unshifted = {
      i: 0, char: '5', key: '5', code: 'Digit5', windowsVirtualKeyCode: 53,
      shiftRide: false, modifiers: 0, valueAfter: '5', valueAfterField: plain, ride: null,
    };
    if (shiftTraceOk('5', plain, [unshifted]) !== true) throw new PathError('a correct unshifted keystroke was refused');
    if (shiftTraceOk('5', plain, [{ ...unshifted, modifiers: 8 }]) !== false) throw new PathError('an unshifted digit carrying modifiers 8 was accepted');
    if (shiftTraceOk('5', plain, [{ ...unshifted, valueAfterField: 'DRIFT' }]) !== false) throw new PathError('a drifted #field read-back was accepted');
    if (shiftTraceOk('5', plain, [{ ...unshifted, valueAfter: '55' }]) !== false) throw new PathError('a broken field2 prefix was accepted');
  });
  // 12 — the page-side Shift brackets: a Shift pair must enclose each
  //      uppercase letter's keydown/keyup in the FULL page record
  t('page-shift-brackets', () => {
    const kd = (key, code, extra = {}) => ({ type: 'keyDown', key, code, keyCode: 0, modifiers: 0, ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, targetId: 'field2', ...extra });
    const ku = (key, code, extra = {}) => ({ type: 'keyUp', key, code, keyCode: 0, modifiers: 0, ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, targetId: 'field2', ...extra });
    const shiftExtra = { shiftKey: true, modifiers: 8 };
    const good = [kd('Shift', 'ShiftLeft', shiftExtra), kd('T', 'KeyT', shiftExtra), ku('T', 'KeyT', shiftExtra), ku('Shift', 'ShiftLeft', shiftExtra)];
    if (shiftRideSectionOk(good, 'T').ok !== true) throw new PathError('a correct Shift bracket was refused');
    if (shiftRideSectionOk(good.slice(0, 3), 'T').ok !== false) throw new PathError('a missing Shift keyup was accepted');
    if (shiftRideSectionOk([good[1], good[2]], 'T').ok !== false) throw new PathError('a ride-less uppercase pair was accepted');
    const plainChar = [kd('a', 'KeyA'), ku('a', 'KeyA')];
    if (shiftRideSectionOk([...good, ...plainChar], 'Ta').ok !== true) throw new PathError('an unshifted pair after a ride was refused');
  });
  // 13 — the chord letter derivation is total on the live nonce shape and
  //      reports its absence honestly
  t('chord-letter-derivation', () => {
    if (deriveChordLetter('tabi-r59-00a1b2c3d4e5') !== 'a') throw new PathError('first [a-f] not derived');
    if (deriveChordLetter('tabi-r59-0123456789ab') !== 'a') throw new PathError('derivation missed a later [a-f]');
    if (deriveChordLetter('tabi-r59-012345678909') !== null) throw new PathError('a digit-only tail produced a letter');
  });
  // 14 — the swallow subject is the nonce hex tail: first two characters for
  //      s1, the third for s3, and a short or non-hex tail yields NO subject
  t('swallow-subject-derivation', () => {
    const d = deriveSwallowSubject('tabi-r59-7b3f0e1d2c4a');
    if (!d) throw new PathError('a valid tail produced no subject');
    if (JSON.stringify(d.controlChars) !== JSON.stringify(['7', 'b'])) throw new PathError('control chars wrong: ' + JSON.stringify(d.controlChars));
    if (d.thirdChar !== '3') throw new PathError('third char wrong: ' + d.thirdChar);
    if (d.hexTail !== '7b3f0e1d2c4a') throw new PathError('hex tail wrong: ' + d.hexTail);
    if (deriveSwallowSubject('tabi-r59-ab') !== null) throw new PathError('a two-character tail produced a subject');
    if (deriveSwallowSubject('tabi-r59-ZZ42') !== null) throw new PathError('a non-hex tail produced a subject');
  });
  // 15 — the swallow gate is exactly (on === true) && set membership
  t('swallow-gate-semantics', () => {
    if (swallowGate(true, ['Backspace'], 'Backspace') !== true) throw new PathError('a matching ON gate did not swallow');
    if (swallowGate(false, ['Backspace'], 'Backspace') !== false) throw new PathError('an OFF gate swallowed');
    if (swallowGate(true, ['Enter'], 'Control') !== false) throw new PathError('a non-member key was swallowed');
    if (swallowGate(true, [], 'Enter') !== false) throw new PathError('an empty set swallowed');
    if (swallowGate(true, ['Enter'], 'Enter') !== true) throw new PathError('the Enter member did not swallow');
    if (swallowGate('true', ['Enter'], 'Enter') !== false) throw new PathError('a truthy non-true gate swallowed');
  });
  // 16 — the plan's swallow tail: s1 unprevented, s2/s3 prevented, the chord's
  //      Control unprevented and its Enter prevented, every entry cancelable;
  //      the six r59 CapsLock entries follow it, all unprevented
  t('swallow-plan-tail', () => {
    const nonce = 'tabi-r59-7b3f0e1d2c4a';
    const subj = deriveSwallowSubject(nonce);
    const caps = deriveCapsSubject(nonce);
    const plan = expectedKeylogPlan(nonce, nonce.toUpperCase(), deriveChordLetter(nonce), subj, caps);
    const tail = plan.slice(-12, -6).map((e) => [e.key, e.defaultPrevented, e.cancelable]);
    const want = [['7', false, true], ['b', false, true], ['Backspace', true, true], ['3', true, true],
      ['Control', false, true], ['Enter', true, true]];
    if (JSON.stringify(tail) !== JSON.stringify(want)) throw new PathError('plan tail drifted: ' + JSON.stringify(tail));
    const capsTail = plan.slice(-6).map((e) => [e.key, e.defaultPrevented, e.cancelable]);
    const wantCaps = [['CapsLock', false, true], ['b', false, true], ['f', false, true],
      ['CapsLock', false, true], ['e', false, true], ['d', false, true]];
    if (JSON.stringify(capsTail) !== JSON.stringify(wantCaps)) throw new PathError('caps plan tail drifted: ' + JSON.stringify(capsTail));
    const prevented = plan.filter((e) => e.defaultPrevented === true).map((e) => e.key);
    if (JSON.stringify(prevented) !== JSON.stringify(['Backspace', '3', 'Enter'])) throw new PathError('prevented set wrong: ' + JSON.stringify(prevented));
    if (plan.some((e) => e.cancelable !== true)) throw new PathError('a plan entry is not cancelable');
    if (plan.slice(-6).some((e) => e.ctrlKey || e.altKey || e.metaKey || e.shiftKey)) {
      throw new PathError('a CapsLock-leg plan entry carries a modifier');
    }
  });
  // 17 — the swallower must be REGISTERED BEFORE the recorder; a fixture whose
  //      recorder comes first is refused
  t('swallow-listener-order-refused', () => {
    const inverted = FIXTURE_HTML.replace('<script>\n', '<script>\nwindow.__keylog = [];\n');
    if (inverted === FIXTURE_HTML) throw new PathError('selftest fixture rewrite did not apply');
    const c = fixtureContract(inverted);
    if (c.ok) throw new PathError('a fixture whose recorder precedes the swallower satisfied the contract');
    if (!c.missing.includes('swallow-listener-order')) throw new PathError('listener order not named: ' + JSON.stringify(c.missing));
  });
  // 18 — the additive recorder fields cannot be dropped silently
  t('swallow-recorder-fields-absent-refused', () => {
    const broken = FIXTURE_HTML.split('cancelable: e.cancelable === true').join('cancelable: undefined');
    if (broken === FIXTURE_HTML) throw new PathError('selftest fixture rewrite did not apply');
    const c = fixtureContract(broken);
    if (c.ok) throw new PathError('a fixture without the additive cancelable field satisfied the contract');
    if (!c.missing.includes('recorder-cancelable')) throw new PathError('cancelable absence not named: ' + JSON.stringify(c.missing));
  });
  // 19 — no query-string bypass: a fixture whose JS reads the URL is refused
  t('swallow-url-toggle-refused', () => {
    const broken = FIXTURE_HTML.replace('window.__swallowOn = false;', 'window.__swallowOn = false; var bypass = location.search;');
    if (broken === FIXTURE_HTML) throw new PathError('selftest fixture rewrite did not apply');
    const c = fixtureContract(broken);
    if (c.ok) throw new PathError('a fixture reading the URL satisfied the contract');
    if (!c.missing.some((m) => m.startsWith('url-toggle-channel:'))) throw new PathError('URL channel not named: ' + JSON.stringify(c.missing));
  });
  // 20 — the CapsLock-letter derivation: the tail's [a-f] letters in order,
  //      cycled to four; a letterless tail yields NO subject
  t('caps-subject-derivation', () => {
    const d = deriveCapsSubject('tabi-r59-7b3f0e1d2c4a');
    if (!d) throw new PathError('a valid tail produced no caps subject');
    if (JSON.stringify(d.letters) !== JSON.stringify(['b', 'f', 'e', 'd'])) throw new PathError('letters wrong: ' + JSON.stringify(d.letters));
    if (JSON.stringify(d.letters1) !== JSON.stringify(['b', 'f'])) throw new PathError('letters1 wrong: ' + JSON.stringify(d.letters1));
    if (JSON.stringify(d.letters2) !== JSON.stringify(['e', 'd'])) throw new PathError('letters2 wrong: ' + JSON.stringify(d.letters2));
    const one = deriveCapsSubject('tabi-r59-7b');
    if (!one || JSON.stringify(one.letters) !== JSON.stringify(['b', 'b', 'b', 'b'])) {
      throw new PathError('single-letter cycling wrong: ' + JSON.stringify(one && one.letters));
    }
    if (deriveCapsSubject('tabi-r59-0123456789') !== null) throw new PathError('a letterless tail produced a caps subject');
  });
  // 21 — the measured-negative boundary contract: delivered shape required on
  //      every record, capsLock MUST be false, and a true can never pass
  t('caps-boundary-negative', () => {
    const rec = (over) => ({ type: 'keyDown', key: 'CapsLock', code: 'CapsLock', keyCode: 20,
      cancelable: true, defaultPrevented: false, capsLock: false, shift: false, ...(over || {}) });
    if (capsBoundaryOk([rec(), rec({ type: 'keyUp' })], false) !== true) throw new PathError('a clean delivered pair was refused');
    if (capsBoundaryOk([rec({ type: 'keypress' })], false) !== false) throw new PathError('a record without keyDown/keyUp type passed');
    if (capsBoundaryOk([rec({ type: undefined })], false) !== false) throw new PathError('a missing type passed');
    if (capsBoundaryOk([rec({ capsLock: true })], false) !== false) throw new PathError('a true caps flag passed the measured negative');
    if (capsBoundaryOk([rec({ key: '' })], false) !== false) throw new PathError('a missing key passed');
    if (capsBoundaryOk([rec({ code: '' })], false) !== false) throw new PathError('a missing code passed');
    if (capsBoundaryOk([rec({ keyCode: '20' })], false) !== false) throw new PathError('a non-numeric keyCode passed');
    if (capsBoundaryOk([rec({ cancelable: false })], false) !== false) throw new PathError('a non-cancelable record passed');
    if (capsBoundaryOk([rec({ defaultPrevented: true })], false) !== false) throw new PathError('a prevented record passed');
    if (capsBoundaryOk([], false) !== false) throw new PathError('an empty trace passed');
    if (capsBoundaryOk([rec()], true) !== false) throw new PathError('an expectation other than false passed');
  });
  // 22 — the form2 fixture (the D4 positive control) satisfies its contract
  t('form2-contract-green', () => {
    const c = form2Contract(FIXTURE2_HTML);
    if (!c.ok) throw new PathError('the shipped form2 fixture does not satisfy its contract: ' + JSON.stringify(c.missing));
    if (c.field3Name !== null) throw new PathError('form2 field3 carries a name attribute: ' + JSON.stringify(c.field3Name));
    if (c.noSwallower !== true) throw new PathError('the shipped form2 fixture carries a swallower');
    if (c.actionEcho2 !== true) throw new PathError('the shipped form2 fixture does not post to /echo2');
    if (c.capsLockRecorded !== true) throw new PathError('the shipped form2 fixture does not record the caps flag');
    if (c.shiftRecorded !== true) throw new PathError('the shipped form2 fixture does not record the shift detector');
  });
  // 23 — a form2 fixture carrying a swallower is refused
  t('form2-swallower-refused', () => {
    const broken = FIXTURE2_HTML.replace('<script>\n', '<script>\nwindow.__setSwallow = function () {};\n');
    if (broken === FIXTURE2_HTML) throw new PathError('selftest fixture rewrite did not apply');
    const c = form2Contract(broken);
    if (c.ok) throw new PathError('a form2 fixture carrying a swallower satisfied the contract');
    if (!c.missing.includes('swallower-present')) throw new PathError('swallower not named: ' + JSON.stringify(c.missing));
  });
  // 24 — the caps recorder field cannot be dropped silently from either fixture
  t('caps-recorder-absent-refused', () => {
    const needle = "capsLock: e.getModifierState('CapsLock') === true";
    const broken2 = FIXTURE2_HTML.split(needle).join('capsLock: undefined');
    if (broken2 === FIXTURE2_HTML) throw new PathError('selftest form2 fixture rewrite did not apply');
    const c2 = form2Contract(broken2);
    if (c2.ok) throw new PathError('a form2 fixture without the caps field satisfied the contract');
    if (!c2.missing.includes('recorder-capslock')) throw new PathError('form2 caps absence not named: ' + JSON.stringify(c2.missing));
    const broken1 = FIXTURE_HTML.split(needle).join('capsLock: undefined');
    if (broken1 === FIXTURE_HTML) throw new PathError('selftest form1 fixture rewrite did not apply');
    const c1 = fixtureContract(broken1);
    if (c1.ok) throw new PathError('a form1 fixture without the caps field satisfied the contract');
    if (!c1.missing.includes('recorder-capslock')) throw new PathError('form1 caps absence not named: ' + JSON.stringify(c1.missing));
    const shiftNeedle = "shift: e.getModifierState('Shift') === true";
    const brokenS = FIXTURE_HTML.split(shiftNeedle).join('shift: undefined');
    if (brokenS === FIXTURE_HTML) throw new PathError('selftest shift fixture rewrite did not apply');
    const cs = fixtureContract(brokenS);
    if (cs.ok) throw new PathError('a fixture without the shift detector field satisfied the contract');
    if (!cs.missing.includes('recorder-shiftstate')) throw new PathError('form1 shift absence not named: ' + JSON.stringify(cs.missing));
  });
  const allPass = cases.every((c) => c.ok);
  console.log(JSON.stringify({
    schema: SCHEMA + '-path-selftest', allPass,
    cases: cases.length, pass: cases.filter((c) => c.ok).length, results: cases,
  }, null, 1));
  process.exit(allPass ? 0 : 1);
}

// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && i + 1 < argv.length && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};
const hasFlag = (name) => argv.includes('--' + name);

// The fixture is a pure function of the nonce (the #nonce marker rides it),
// so the contract below is checked against the bytes the server will serve.
// Declared before pathSelftest() runs; the function is hoisted and the
// contract is only EVALUATED once a nonce exists.
const FIXTURE_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r59 form fixture</title>
<script>
// (r58) The page's OWN swallower. It is registered on document/capture BEFORE
// both recorders below, and capture listeners on one target run in
// registration order, so its preventDefault() is already visible when the
// recorders read e.defaultPrevented. The gate is reachable ONLY through this
// API: the fixture reads no URL, query, hash or cookie and references no
// external URL, so no query-string bypass exists.
window.__swallowOn = false;
window.__swallowSet = [];
window.__setSwallow = function (on, keys) {
  window.__swallowOn = on === true;
  window.__swallowSet = Array.isArray(keys) ? keys.slice() : [];
};
document.addEventListener('keydown', function (e) {
  if (window.__swallowOn === true && window.__swallowSet.indexOf(e.key) !== -1) e.preventDefault();
}, true);
window.__keylog = [];
document.addEventListener('keydown', function (e) {
  window.__keylog.push({ key: e.key, code: e.code, keyCode: e.keyCode,
    windowsVirtualKeyCode: e.keyCode,
    cancelable: e.cancelable === true, defaultPrevented: e.defaultPrevented === true,
    capsLock: e.getModifierState('CapsLock') === true,
    shift: e.getModifierState('Shift') === true,
    ctrlKey: e.ctrlKey === true, altKey: e.altKey === true,
    metaKey: e.metaKey === true, shiftKey: e.shiftKey === true,
    targetId: (e.target && (e.target.id || e.target.tagName)) || null });
}, true);
// The FULL record (r57): keydown AND keyup, with the S153 modifier mirror
// computed from the DOM booleans (alt1|ctrl2|meta4|shift8). Separate from the
// r56 keydown-only recorder above, whose field set is unchanged apart from the
// two additive r58 fields (cancelable, defaultPrevented).
window.__keylogFull = [];
(function () {
  function rec(e) {
    window.__keylogFull.push({
      type: e.type === 'keydown' ? 'keyDown' : 'keyUp',
      key: e.key, code: e.code, keyCode: e.keyCode,
      modifiers: (e.altKey ? 1 : 0) | (e.ctrlKey ? 2 : 0) | (e.metaKey ? 4 : 0) | (e.shiftKey ? 8 : 0),
      cancelable: e.cancelable === true, defaultPrevented: e.defaultPrevented === true,
      capsLock: e.getModifierState('CapsLock') === true,
      shift: e.getModifierState('Shift') === true,
      ctrlKey: e.ctrlKey === true, altKey: e.altKey === true,
      metaKey: e.metaKey === true, shiftKey: e.shiftKey === true,
      targetId: (e.target && (e.target.id || e.target.tagName)) || null,
    });
  }
  document.addEventListener('keydown', rec, true);
  document.addEventListener('keyup', rec, true);
})();
</script></head>
<body><h1 id="pg">form</h1><p id="nonce">${'__NONCE__'}</p>
<form id="f" method="GET" action="/echo">
<input id="field" name="field" value="" size="40">
<input id="field2" name="field2" value="" size="40">
<input id="field3" value="" size="40">
<button id="go" type="submit">go</button>
</form></body></html>`;

// The routed D4 positive control's page (r59): the SAME fixture shape as
// /form, served by the same fixture server, with NO event-cancelling handler
// (so the chord's default action reaches the form) and its own /echo2 action.
// The recorders are identical to form1's, including the r59 capsLock field.
const FIXTURE2_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r59 form2 fixture</title>
<script>
// (r59) form2 — the D4 positive control page. No key handler cancels an
// event; both recorders below are identical to form1's, including capsLock.
window.__keylog = [];
document.addEventListener('keydown', function (e) {
  window.__keylog.push({ key: e.key, code: e.code, keyCode: e.keyCode,
    windowsVirtualKeyCode: e.keyCode,
    cancelable: e.cancelable === true, defaultPrevented: e.defaultPrevented === true,
    capsLock: e.getModifierState('CapsLock') === true,
    shift: e.getModifierState('Shift') === true,
    ctrlKey: e.ctrlKey === true, altKey: e.altKey === true,
    metaKey: e.metaKey === true, shiftKey: e.shiftKey === true,
    targetId: (e.target && (e.target.id || e.target.tagName)) || null });
}, true);
window.__keylogFull = [];
(function () {
  function rec(e) {
    window.__keylogFull.push({
      type: e.type === 'keydown' ? 'keyDown' : 'keyUp',
      key: e.key, code: e.code, keyCode: e.keyCode,
      modifiers: (e.altKey ? 1 : 0) | (e.ctrlKey ? 2 : 0) | (e.metaKey ? 4 : 0) | (e.shiftKey ? 8 : 0),
      cancelable: e.cancelable === true, defaultPrevented: e.defaultPrevented === true,
      capsLock: e.getModifierState('CapsLock') === true,
      shift: e.getModifierState('Shift') === true,
      ctrlKey: e.ctrlKey === true, altKey: e.altKey === true,
      metaKey: e.metaKey === true, shiftKey: e.shiftKey === true,
      targetId: (e.target && (e.target.id || e.target.tagName)) || null,
    });
  }
  document.addEventListener('keydown', rec, true);
  document.addEventListener('keyup', rec, true);
})();
</script></head>
<body><h1 id="pg">form2</h1><p id="nonce">${'__NONCE__'}</p>
<form id="f" method="GET" action="/echo2">
<input id="field" name="field" value="" size="40">
<input id="field2" name="field2" value="" size="40">
<input id="field3" value="" size="40">
<button id="go" type="submit">go</button>
</form></body></html>`;

if (hasFlag('path-selftest')) pathSelftest();

const usage = (msg) => {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'usage', detail: msg }));
  process.exit(2);
};

// --- environment preconditions (before anything is spawned) ----------------
const chromiumArg = opt('chromium') || DEFAULT_CHROMIUM;
if (!isAbsNative(chromiumArg)) usage('--chromium must be an ABSOLUTE path: ' + chromiumArg);
if (!fs.existsSync(chromiumArg)) usage('--chromium does not exist: ' + chromiumArg);

let scratchDir, outReceipt, outDir;
try {
  scratchDir = validateScratch(opt('scratch'));
  outReceipt = validateOut(opt('out'));
  outDir = path.dirname(outReceipt);
} catch (e) {
  if (e instanceof PathError) usage(e.message);
  throw e;
}

// realpath the scratch (when it exists) and refuse a symlink into the
// operator's default Chromium profile.
let scratchReal = null;
try { scratchReal = fs.realpathSync(scratchDir); } catch { scratchReal = null; }
let defaultReal = null;
try { defaultReal = fs.realpathSync(DEFAULT_PROFILE_ROOT); } catch { defaultReal = null; }
if (scratchReal && defaultReal && inside(scratchReal, defaultReal)) {
  usage('--scratch resolves inside the user Chromium profile: ' + scratchReal);
}

try { fs.mkdirSync(scratchDir, { recursive: true }); fs.mkdirSync(outDir, { recursive: true }); }
catch (e) { usage('cannot create --scratch/--out directory: ' + String((e && e.message) || e)); }

// A REAL write probe. Without it, a non-writable --user-data-dir makes
// Chromium fall back to the operator's default profile (observed).
const probePath = path.join(scratchDir, '.write-probe-' + crypto.randomBytes(6).toString('hex'));
try {
  fs.writeFileSync(probePath, 'probe');
  if (fs.readFileSync(probePath, 'utf8') !== 'probe') throw new Error('probe readback mismatch');
  fs.rmSync(probePath, { force: true });
} catch (e) {
  try { fs.rmSync(probePath, { force: true }); } catch {}
  usage('--scratch is not writable: ' + String((e && e.message) || e));
}
try { if (!fs.statSync(scratchDir).isDirectory()) usage('--scratch is not a directory'); }
catch (e) { usage('--scratch is not usable: ' + String((e && e.message) || e)); }
try {
  const o = fs.statSync(outDir);
  if (!o.isDirectory()) usage('dirname(--out) is not a directory: ' + outDir);
} catch (e) { usage('dirname(--out) is not usable: ' + String((e && e.message) || e)); }

const driverSha256 = sha256(fs.readFileSync(SELF));

// the browser identity, read BEFORE launch so even a red receipt carries it
const versionLine = (() => {
  const r = spawnSync(chromiumArg, ['--version'], { encoding: 'utf8', timeout: 15000 });
  return String((r.stdout || r.stderr || '')).trim();
})();

// --- the launch key --------------------------------------------------------
const launchToken = crypto.randomBytes(6).toString('hex'); // 12 lowercase hex
const profileDir = validateProfile(scratchDir, launchToken, path.join(scratchDir, 'profile-' + launchToken));

// The r59 nonce: 'tabi-r59-' + 12 lowercase hex. Regenerated (bounded) while
// the hex tail carries no [a-f] letter, because BOTH derivation subjects (the
// carried chord letter and the r59 CapsLock letters) must exist for the
// frozen C2 witness to be non-vacuous. The swallow leg's subject is that same
// tail — its first two characters and its third — so a 12-character tail
// always carries one.
let nonceHex = '';
for (let i = 0; i < 1000 && !nonceHex; i++) {
  const h = crypto.randomBytes(6).toString('hex');
  if (/[a-f]/.test(h)) nonceHex = h;
}
if (!nonceHex) usage('could not draw a nonce whose hex tail carries an [a-f] letter');
const nonce = 'tabi-r59-' + nonceHex;
const chordLetter = deriveChordLetter(nonce);
if (chordLetter === null) usage('internal: the drawn nonce has no chord letter');
const swallowSubject = deriveSwallowSubject(nonce);
if (!swallowSubject) usage('internal: the drawn nonce has no swallow subject');
if (swallowSubject.controlChars.concat([swallowSubject.thirdChar]).some((c) => vkFor(c) === null || codeFor(c) === null)) {
  usage('internal: a swallow-leg character has no CDP key mapping');
}
const capsSubject = deriveCapsSubject(nonce);
if (!capsSubject) usage('internal: the drawn nonce has no CapsLock subject');
if (capsSubject.letters.some((c) => vkFor(c) === null || codeFor(c) === null)) {
  usage('internal: a CapsLock-leg character has no CDP key mapping');
}
const mixed = nonce.toUpperCase();

// Throwaway HOME/XDG_CONFIG_HOME under the scratch (sentinel RISK 1/RISK 3):
// the Arch /usr/bin/chromium wrapper prepends the USER's
// ~/.config/chromium-flags.conf, which would load the operator's own
// extension into the fixture browser, and the crashpad handler would write
// its reports into the user's default profile. Redirecting HOME keeps the
// wrapper, the profile AND the crash database inside this run's scratch.
const runHome = path.join(scratchDir, 'home-' + launchToken);
const runXdgConfig = path.join(runHome, '.config');
try {
  fs.mkdirSync(runXdgConfig, { recursive: true, mode: 0o700 });
} catch (e) {
  usage('cannot prepare the throwaway HOME ' + runHome + ': ' + String((e && e.message) || e));
}
const runCrashDb = path.join(runXdgConfig, 'chromium', 'Crash Reports');

// throwaway profile prep: never reuse, never inherit content, always 0700
try {
  fs.rmSync(profileDir, { recursive: true, force: true });
  fs.mkdirSync(profileDir, { recursive: true, mode: 0o700 });
  fs.accessSync(profileDir, fs.constants.W_OK | fs.constants.R_OK);
  if (fs.readdirSync(profileDir).length !== 0) throw new Error('profile directory is not empty after creation');
} catch (e) {
  usage('cannot prepare the throwaway profile ' + profileDir + ': ' + String((e && e.message) || e));
}

// --- keyed process sweep over /proc ---------------------------------------
// Every process whose command line carries one of this run's identity keys:
// the launch token, the throwaway profile path, or the throwaway crash
// database (sentinel RISK 3 — the crashpad handler carries NO token and is
// re-parented outside the process group). Never an image name (the operator
// runs the same binary); never pkill -f.
const SWEEP_NEEDLES = [launchToken, profileDir, runCrashDb];
function sweepOnce() {
  const pids = [];
  let ents;
  try { ents = fs.readdirSync('/proc'); } catch { return { error: 'cannot list /proc', pids: [] }; }
  for (const ent of ents) {
    if (!/^\d+$/.test(ent)) continue;
    const pid = Number(ent);
    if (pid === process.pid) continue;
    let cmd;
    try { cmd = fs.readFileSync('/proc/' + ent + '/cmdline', 'latin1'); } catch { continue; } // vanished: not ours
    if (SWEEP_NEEDLES.some((n) => cmd.includes(n))) pids.push(pid);
  }
  return { pids: pids.sort((a, b) => a - b) };
}
const killPid = (pid, sig = 'SIGKILL') => { try { process.kill(pid, sig); return true; } catch { return false; } };
async function sweepToZero() {
  let last = sweepOnce();
  for (let round = 0; round < SWEEP_MAX_ROUNDS; round++) {
    if (!last.pids.length) return { postKillSweepCount: 0, survivors: [], rounds: round };
    for (const pid of last.pids) killPid(pid);
    await sleep(SWEEP_WAIT_MS);
    last = sweepOnce();
  }
  return { postKillSweepCount: last.pids.length, survivors: last.pids, rounds: SWEEP_MAX_ROUNDS };
}

// Port probe: after the keyed kill nothing may answer on the fixture port or
// the DevTools port. A refused connect is the only green answer.
function probePort(port) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: '127.0.0.1' });
    let done = false;
    const fin = (v) => { if (done) return; done = true; try { s.destroy(); } catch {} resolve(v); };
    s.setTimeout(PORT_PROBE_TIMEOUT_MS, () => fin('timeout'));
    s.on('connect', () => fin('open'));
    s.on('error', () => fin('closed'));
  });
}

const preLaunch = sweepOnce();
if (preLaunch.error || preLaunch.pids.length !== 0) {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'launch-token-not-fresh', preLaunch }));
  process.exit(2); // nothing was spawned; there is no receipt to explain
}

// --- fixture: loopback form + echo ----------------------------------------
const FORM_HTML = FIXTURE_HTML.split('__NONCE__').join(nonce);
const FORM2_HTML = FIXTURE2_HTML.split('__NONCE__').join(nonce);
// The served bytes are checked against the shared contracts BEFORE a browser
// exists: a fixture that cannot witness the legs is an authoring failure, not
// a red run (the code exits 2 with the diagnosis).
const fixtureCheck = fixtureContract(FORM_HTML);
if (!fixtureCheck.ok) {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'fixture-contract', contract: fixtureCheck }));
  process.exit(2);
}
const form2Check = form2Contract(FORM2_HTML);
if (!form2Check.ok) {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'form2-fixture-contract', contract: form2Check }));
  process.exit(2);
}

const serverLog = [];
const writeServerLog = () => {
  try { fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1)); }
  catch { /* stdout still carries the log */ }
};

const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, '') });
  const html = (body) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(body);
  };
  if (u.pathname === '/form') return html(FORM_HTML);
  if (u.pathname === '/form2') return html(FORM2_HTML);
  if (u.pathname === '/echo') {
    // the SERVER-SIDE witness: the received values are rendered back, so the
    // client DOM and the server log carry the same facts independently. The
    // field3 marker witnesses that the never-named field cannot ride.
    const field = u.searchParams.get('field') || '';
    const field2 = u.searchParams.get('field2') || '';
    return html(`<!doctype html><html><head><meta charset="utf-8"><title>tabi-r59 echo</title></head>
<body><h1 id="pg">echo</h1><p id="nonce">${nonce}</p>
<p id="echoed">${field}</p><p id="echoed2">${field2}</p>
<p id="field3param">${u.searchParams.has('field3') ? 'present' : 'absent'}</p></body></html>`);
  }
  if (u.pathname === '/echo2') {
    // the D4 positive control's server-side witness: form2's submission is
    // rendered back independently of the client DOM.
    const field = u.searchParams.get('field') || '';
    const field2 = u.searchParams.get('field2') || '';
    return html(`<!doctype html><html><head><meta charset="utf-8"><title>tabi-r59 echo2</title></head>
<body><h1 id="pg">echo2</h1><p id="nonce">${nonce}</p>
<p id="echoed">${field}</p><p id="echoed2">${field2}</p>
<p id="field3param">${u.searchParams.has('field3') ? 'present' : 'absent'}</p></body></html>`);
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
});
await new Promise((resolve) => fixtureServer.listen(0, '127.0.0.1', resolve));
const fixturePort = fixtureServer.address().port;
const origin = 'http://127.0.0.1:' + fixturePort;

// --- receipt skeleton: EXACT r56 top-level keys, fixed order, then the ---
// --- r57 additions (field3Final, legOrder, journey, stepsExtended) and ---
// --- the r58 additions (fixtureDelta, declaredStepNames, swallowLeg)   ---
const steps = [];
// chronological evidence log across every leg (r56 steps, the two r57 legs
// and the four r58 swallow steps)
const shotLog = [];
const failures = [];
const fail = (id, detail) => { failures.push({ id, detail: String(detail).slice(0, 400) }); };
const receipt = {
  schema: SCHEMA,
  nonce,
  driverSha256,
  host: { chromium: versionLine, argv: [], launchToken },
  fixture: {
    formSha256: sha256(Buffer.from(FORM_HTML, 'utf8')),
    form2Sha256: sha256(Buffer.from(FORM2_HTML, 'utf8')),
    origin,
    contract: fixtureCheck,
    form2Contract: form2Check,
    fields: [],
    field3Name: null,
    field3NameAttribute: null,
  },
  // The DISCLOSED evidence delta: exactly which page-side recorder fields the
  // r59 fixture adds to the carried r58 recorders, how the swallower is
  // ordered and gated, and the runtime proof that every recorded event
  // carries the additive fields. Nothing here is inferred by the driver.
  fixtureDelta: {
    additiveRecorderFields: ['cancelable', 'defaultPrevented', 'capsLock', 'shift'],
    recorders: ['window.__keylog', 'window.__keylogFull'],
    capsLockField: "capsLock: e.getModifierState('CapsLock') === true",
    shiftField: "shift: e.getModifierState('Shift') === true",
    listenerOrder: 'the swallower is a capture-phase keydown listener on document registered BEFORE both recorders (same target, same phase, so registration order decides who reads the flag)',
    swallowGate: { on: 'window.__swallowOn', set: 'window.__swallowSet', api: 'window.__setSwallow(on, keys) — idempotent, clears then sets' },
    urlToggle: 'none: the fixture JS reads no location/query/hash/cookie/window.name and references no external URL',
    carriedFieldsUnchanged: true,
    witness: { keylogEntries: -1, keylogFullEntries: -1, allCarryAdditiveFields: false, allCarryCapsFlag: false, allCarryShiftFlag: false },
  },
  declaredStepNames: ALL_PNG_NAMES.slice(),
  plainTrace: { entries: [] },
  controlDomain: {
    end: { valueBefore: null, valueAfter: null, negativeWitness: false },
    backspace: { valueBefore: null, valueAfter: null, expected: null },
    restore: { valueAfter: null },
    tab: { activeBefore: null, activeAfter: null },
    enter: {
      submitted: false, serverSawField: null, serverSawField2: null,
      expectedField2: mixed, focusedBeforeEnter: null, queryKeys: [], carriesField3: null,
    },
  },
  keylog: { entries: [], length: 0, window: { start: null, end: null } },
  serverLog,
  field3Value: null,
  field3Final: null,
  // The r59 measured-negative assertion, NAMED in the receipt: this surface's
  // CapsLock key events deliver, but the page's getModifierState('CapsLock')
  // must read false on every recorded event. A true anywhere is a finding.
  capsLatchExpected: false,
  capslockTrace: {
    target: 'field3',
    derivation: 'the [a-f] chars of the nonce hex tail in order, cycled to 4',
    letters: capsSubject.letters.slice(),
    letters1: capsSubject.letters1.slice(),
    letters2: capsSubject.letters2.slice(),
    press1: { key: 'CapsLock', code: 'CapsLock', windowsVirtualKeyCode: 20, keydownEntry: null, keyupEntry: null, capsKeydown: null, capsKeyup: null, valueAfter: null },
    letters1: [],
    press2: { key: 'CapsLock', code: 'CapsLock', windowsVirtualKeyCode: 20, keydownEntry: null, keyupEntry: null, capsKeydown: null, capsKeyup: null, valueAfter: null },
    letters2: [],
    beforePress1: null,
    afterPress1: null,
    acrossLetters1: null,
    afterPress2: null,
    acrossLetters2: null,
    latch: { sequence: [], allFalse: null, anyTrue: null },
    capsLatchOk: false,
    trace: [],
  },
  echo2Witness: {
    submitted: false, requestCount: null, serverRequests: [],
    clientPath: null, clientField: null, clientField2: null, field3Param: null, queryKeys: [],
  },
  legOrder: ['plain-trace', 'end', 'backspace', 'restore', 'tab', 'shift-trace', 'chord-leg', 'swallow-leg', 'capslock-leg', 'enter-submit', 'form2-leg'],
  journey: {
    form: {
      mechanism: 'dispatchKeyEvent+shift-chords+chord-domain+preventDefault-swallow+enter-submit',
      nonceOnPage: false,
      fields: [],
      shots: [],
      serverRequests: [],
      field3NameAttribute: null,
      shiftTrace: {
        target: 'field2', value: mixed, valueBeforeFirstKey: null, focusBefore: null,
        typing: [], keyEventCount: 0, field2ValueAfterTyping: null, fieldValueAfterTyping: null,
        allPrefixTrue: false, allFieldUnchanged: false, ridesPresent: false,
      },
      // R1 (pre-data pin): the detector-positive differential on the same
      // page's own record: the Shift chord reads getModifierState('Shift')
      // true, the CapsLock leg reads it false.
      shiftDetector: {
        mechanism: "getModifierState('Shift') on the page's own keydown/keyup record",
        events: 0, shiftKeyEvents: 0, uppercaseLetterEvents: 0,
        allGetModifierStateShiftTrue: false,
        capsLegEvents: 0, capsLegAllGetModifierStateShiftFalse: false,
        differential: false, ok: false,
      },
      chordLeg: {
        target: 'field3', derivation: 'first [a-f] char of the nonce hex tail',
        hexTail: nonceHex, letter: chordLetter,
        letterCode: 'Key' + chordLetter.toUpperCase(),
        letterWindowsVirtualKeyCode: 65 + (chordLetter.charCodeAt(0) - 97),
        field3TargetId: 'field3',
        focusBefore: null, keylogLengthBefore: null, keylogLengthAfter: null,
        field3ValueBefore: null, field3ValueAfter: null,
        keyEventCount: 0, chords: [], booleansMatch: false,
      },
      // r58: the preventDefault swallow domain. Every field is a page-side
      // read-back (DOM value, the page's own keylog entry) or fixture-server
      // request state; none is the driver's assumption.
      swallowLeg: {
        target: 'field3',
        derivation: 'the nonce hex tail: its first two characters for the control, its third for the swallowed insertion',
        hexTail: swallowSubject.hexTail,
        controlChars: swallowSubject.controlChars.slice(),
        thirdChar: swallowSubject.thirdChar,
        focusBefore: null,
        control: {
          swallowOn: false, swallowSet: [], gate: null, valueBefore: null, typed: [],
          valueAfter: null, defaultPrevented: false,
          keylogLengthBefore: null, keylogLengthAfter: null, keylog: [],
        },
        backspaceSwallow: {
          swallowOn: true, swallowSet: ['Backspace'], gate: null, valueBefore: null, valueAfter: null,
          cancelable: null, defaultPrevented: null,
          keylogLengthBefore: null, keylogLengthAfter: null, keylogEntry: null,
        },
        digitSwallow: {
          swallowOn: true, swallowSet: [], gate: null, char: swallowSubject.thirdChar,
          valueBefore: null, valueAfter: null,
          cancelable: null, defaultPrevented: null,
          keylogLengthBefore: null, keylogLengthAfter: null, keylogEntry: null,
        },
        enterChordSwallow: {
          swallowOn: true, swallowSet: ['Enter'], gate: null, chord: 'Control+Enter',
          modifierBit: 2, text: '\r',
          valueBefore: null, valueAfter: null,
          ctrlKeylogEntry: null, enterKeylogEntry: null,
          bothKeydownsDelivered: false, enterModifiers: null, defaultPrevented: null,
          submitted: false, noSubmitWaitMs: SWALLOW_NO_SUBMIT_WAIT_MS,
          serverRequestsBefore: null, serverRequestsAfter: null, newRequests: [],
        },
        restore: {
          preSwallowGate: null, swallowOn: false, swallowSet: [], pageGate: null, activeElement: null,
        },
      },
      // r59: the CapsLock toggle leg. Every field is the PAGE's own record
      // (delivered shape + getModifierState('CapsLock')) or a DOM value
      // read-back; capsLatchExpected is the assertion this surface measures
      // (false), never a driver-side claim about what the events did.
      capsLockLeg: {
        target: 'field3',
        derivation: 'the [a-f] chars of the nonce hex tail in order, cycled to 4',
        letters: capsSubject.letters.slice(),
        letters1: capsSubject.letters1.slice(),
        letters2: capsSubject.letters2.slice(),
        focusBefore: null,
        valueBefore: null,
        press1: {
          key: 'CapsLock', code: 'CapsLock', windowsVirtualKeyCode: 20,
          keydownEntry: null, keyupEntry: null, capsKeydown: null, capsKeyup: null, valueAfter: null,
        },
        letters1: [],
        press2: {
          key: 'CapsLock', code: 'CapsLock', windowsVirtualKeyCode: 20,
          keydownEntry: null, keyupEntry: null, capsKeydown: null, capsKeyup: null, valueAfter: null,
        },
        letters2: [],
        valueAfter: null,
        prefixOk: false,
        keylogWindow: { start: null, end: null },
        capsLatchExpected: false,
        capsLatchObservedAllFalse: false,
        anyCapsTrue: null,
        capsLatchOk: false,
        trace: [],
      },
      pageKeylog: [],
      expectedKeylogLength: -1,
      keylogMatchesPlan: false,
    },
    // r59: the routed D4 positive control's page. Same fixture shape, NO
    // swallower; the same Control+Enter chord submits it.
    form2: {
      mechanism: 'dispatchKeyEvent+control-enter-submit',
      url: null,
      nonceOnPage: false,
      fields: [],
      noSwallowerLive: null,
      focus: { target: 'field', activeBefore: null },
      typed: { value: null, entries: [], valueAfter: null },
      chord: {
        name: 'Control', bit: 2, key: 'Control', code: 'ControlLeft', windowsVirtualKeyCode: 17,
        letterKeydown: { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
        events: [], domEvents: [], bothKeydownsDelivered: false, enterModifiers: null,
      },
      serverRequestsBefore: null,
      serverRequestsAfter: null,
      newRequests: [],
      submitted: false,
      echo2: { submitted: false, count: null, path: '/echo2', field: null, field2: null, queryKeys: [], field3Param: null, url: null, disposition: null, clientTargetUrl: null, clientTargetId: null },
      echoPage: { url: null, field: null, field2: null, field3Param: null },
      shots: [],
    },
  },
  steps,
  stepsExtended: [],
  teardown: { postKillSweepCount: -1, survivors: [], portProbes: null },
  predicate: false,
};

// --- launch ----------------------------------------------------------------
const childArgv = [
  chromiumArg,
  '--headless=new',
  '--remote-debugging-port=0',
  '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=' + profileDir,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  '--disable-component-update',
  '--disable-sync',
  '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--window-size=1280,900',
  'about:blank',
];
// Shape-only host state (sentinel RISK 4): the receipt never carries a path
// into the user's home — any such path is replaced with a placeholder.
receipt.host.argv = childArgv.map((a) => String(a).replace(/\/home\/[^/\s"]+(?=\/)/g, '__USER_HOME__').replace(/(^|[=])~\//g, '$1__USER_HOME__/'));
const child = spawn(childArgv[0], childArgv.slice(1), {
  stdio: ['ignore', 'ignore', 'pipe'],
  detached: true, // own process group: killed as a GROUP, not by name
  env: { ...process.env, HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, TMPDIR: scratchDir },
});
let stderrTail = '';
child.on('exit', () => { /* observed by the sweep, not by an exit code */ });
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

// R57-S1 (sentinel, pre-freeze amendment): an external SIGTERM/SIGINT must run
// the SAME keyed teardown instead of orphaning the process group (the
// sentinel's live probe observed 13 orphans when the runner was killed
// externally). Best effort on the way out; exit 1 either way.
let signaled = false;
const signalTeardown = async () => {
  if (signaled) return;
  signaled = true;
  try { if (child.pid) process.kill(-child.pid, 'SIGKILL'); } catch { /* group already gone */ }
  try { await sweepToZero(); } catch { /* best effort */ }
  try { fixtureServer.closeAllConnections(); } catch { /* node <18 */ }
  try { fixtureServer.close(() => process.exit(1)); } catch { process.exit(1); }
  setTimeout(() => process.exit(1), 2000).unref();
};
process.on('SIGTERM', () => { signalTeardown(); });
process.on('SIGINT', () => { signalTeardown(); });

let midRunCount = -1;
let driveRan = false;

// --- discovery: the port file inside OUR throwaway profile -----------------
const portFile = path.join(profileDir, 'DevToolsActivePort');
let devPort = null;
for (let i = 0; i < 100 && !devPort; i++) {
  try {
    const first = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim();
    if (/^\d+$/.test(first)) devPort = Number(first);
  } catch { /* not yet */ }
  if (!devPort) await sleep(150);
}
if (!devPort) fail('no-devtools-active-port', 'no DevToolsActivePort inside ' + profileDir + '; stderr tail: ' + stderrTail.slice(-300));

let versionInfo = null;
if (devPort) {
  const cdpOrigin = 'http://127.0.0.1:' + devPort;
  for (let i = 0; i < 60 && !versionInfo; i++) {
    try { versionInfo = await (await fetch(cdpOrigin + '/json/version')).json(); } catch { versionInfo = null; }
    if (!versionInfo) await sleep(150);
  }
  if (!versionInfo) fail('no-json-version', 'CDP on 127.0.0.1:' + devPort + ' never answered /json/version');
}

// loopback enforcement: the debug socket must be 127.0.0.1 on both legs
if (versionInfo) {
  const browserWsHost = (() => { try { return new URL(versionInfo.webSocketDebuggerUrl).host; } catch { return null; } })();
  if (!browserWsHost || !/^127\.0\.0\.1:\d+$/.test(browserWsHost)) {
    fail('non-loopback-debug-address', String(browserWsHost));
  }
  if (!receipt.host.chromium) receipt.host.chromium = String(versionInfo.Browser || '').trim();
}

// mid-run keyed census: the token MUST bind this live launch
if (devPort) {
  const midRun = sweepOnce();
  midRunCount = midRun.pids.length;
  if (midRun.error || midRun.pids.length < 1) fail('launch-token-unbound-mid-run', JSON.stringify(midRun));
}

// --- drive -----------------------------------------------------------------
if (devPort && versionInfo && !failures.length) {
  driveRan = true;
  const cdpOrigin = 'http://127.0.0.1:' + devPort;
  let ws = null;
  try {
    // page target — polled, because about:blank may not be listed yet
    let page = null;
    for (let i = 0; i < 100 && !page; i++) {
      try {
        const list = await (await fetch(cdpOrigin + '/json/list')).json();
        page = (Array.isArray(list) ? list : []).find((t) => t.type === 'page');
      } catch { page = null; }
      if (!page) await sleep(150);
    }
    if (!page || !page.webSocketDebuggerUrl) throw new Error('no page target');
    if (!/^ws:\/\/127\.0\.0\.1:\d+\//.test(page.webSocketDebuggerUrl)) throw new Error('page ws not loopback: ' + page.webSocketDebuggerUrl);

    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      const timer = setTimeout(() => rej(new Error('ws open timeout')), 20000);
      const done = (err) => { clearTimeout(timer); if (err) rej(err); else res(); };
      ws.addEventListener('open', () => done(null), { once: true });
      ws.addEventListener('error', () => done(new Error('ws error')), { once: true });
    });
    let msgId = 0;
    const pending = new Map();
    ws.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    });
    const send = (method, params = {}) => new Promise((res, rej) => {
      const id = ++msgId;
      pending.set(id, res);
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('cdp timeout ' + method)); } }, 20000);
    });
    const evalValue = async (expression) => {
      const rs = await send('Runtime.evaluate', { expression, returnByValue: true });
      if (rs.error) throw new Error('evaluate: ' + JSON.stringify(rs.error).slice(0, 200));
      if (rs.result && rs.result.exceptionDetails) throw new Error('evaluate threw: ' + String(rs.result.exceptionDetails.text || '').slice(0, 200));
      return rs.result && rs.result.result ? rs.result.result.value : undefined;
    };
    // by-value results arrive as JS values; only strings need parsing
    const evalJSON = async (expression) => {
      const v = await evalValue(expression);
      return typeof v === 'string' ? JSON.parse(v) : v;
    };

    // Every evidence step writes its PNG next to the receipt; the declared
    // step list is assembled from this log in its FROZEN order, and the full
    // chronological log is stepsExtended. captureOn is shared with the
    // form2 echo target (the Ctrl+Enter submission lands in a new tab).
    const captureOn = async (sender, stepName) => {
      const shot = await sender('Page.captureScreenshot', { format: 'png' });
      if (!shot.result || !shot.result.data) throw new Error('captureScreenshot: ' + JSON.stringify(shot).slice(0, 200));
      const buf = Buffer.from(shot.result.data, 'base64');
      const name = pngNameFor(stepName);
      fs.writeFileSync(path.join(outDir, name), buf);
      const rec = { name: stepName, png: name, sha256: sha256(buf), bytes: buf.length };
      shotLog.push(rec);
      return rec;
    };
    const capture = (stepName) => captureOn(send, stepName);
    const waitFor = async (fn, ms, every = 100) => {
      const t0 = Date.now();
      for (;;) {
        if (await fn()) return true;
        if (Date.now() - t0 >= ms) return false;
        await sleep(every);
      }
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: origin + '/form' });
    const ready = await waitFor(async () => {
      try {
        return (await evalValue('document.readyState')) === 'complete'
          && (await evalValue('location.pathname')) === '/form'
          && (await evalValue('!!document.getElementById("field")')) === true
          && (await evalValue('!!document.getElementById("field2")')) === true
          && (await evalValue('!!document.getElementById("field3")')) === true
          && (await evalValue('Array.isArray(window.__keylog)')) === true
          && (await evalValue('Array.isArray(window.__keylogFull)')) === true
          && (await evalValue('(document.getElementById("nonce")||{}).textContent')) === nonce;
      } catch { return false; }
    }, 15000);
    if (!ready) throw new Error('GET /form never reached readyState complete with #field/#field2/#field3, the recorder and the nonce marker');
    await capture('a-start');

    const form = receipt.journey.form;
    form.nonceOnPage = true;
    // The LIVE fixture record: #field3's attribute state as the DOM reports
    // it (the counter's field3-named check reads this echo, not the source).
    const liveFields = await evalJSON('JSON.stringify(Array.from(document.querySelectorAll("#f input")).map(function (el) { return { id: el.id, name: el.getAttribute("name") }; }))');
    receipt.fixture.fields = Array.isArray(liveFields) ? liveFields : [];
    form.fields = receipt.fixture.fields;
    const liveField3 = (receipt.fixture.fields || []).find((f) => f && f.id === 'field3');
    receipt.fixture.field3Name = liveField3 ? liveField3.name : null;
    receipt.fixture.field3NameAttribute = receipt.fixture.field3Name;
    if (!liveField3 || liveField3.name !== null) fail('fixture-field3-named-live', JSON.stringify(receipt.fixture.fields));

    // --- leg 1: click #field, then keyDown+keyUp per nonce character -------
    const centreOf = async (id) => evalJSON(`(() => { const r = document.getElementById(${JSON.stringify(id)}).getBoundingClientRect(); return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)]; })()`);
    const clickCenter = async (id) => {
      const [x, y] = await centreOf(id);
      for (const type of ['mousePressed', 'mouseReleased']) {
        await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
      }
      return [x, y];
    };
    const fieldValue = (id) => evalValue('document.getElementById(' + JSON.stringify(id) + ').value');
    const activeId = () => evalValue('document.activeElement.id || document.activeElement.tagName');
    const keylogLength = () => evalValue('window.__keylog.length');
    const keylogSlice = async (from, to) => {
      const v = await evalValue('JSON.stringify(window.__keylog.slice(' + Number(from) + ',' + Number(to) + '))');
      return v ? JSON.parse(v) : [];
    };
    // the r57 full record (keydown AND keyup) — the ONLY place the additive
    // cancelable/defaultPrevented fields are read from for the swallow leg
    const fullKeylogLength = () => evalValue('window.__keylogFull.length');
    const fullKeylogSlice = async (from, to) => {
      const v = await evalValue('JSON.stringify(window.__keylogFull.slice(' + Number(from) + ',' + Number(to) + '))');
      return v ? JSON.parse(v) : [];
    };
    // the page's OWN gate state, read back after every __setSwallow call
    const readSwallowGate = () => evalJSON('JSON.stringify({ on: window.__swallowOn, set: window.__swallowSet })');
    const setSwallow = async (on, keys) => {
      await evalValue('window.__setSwallow(' + JSON.stringify(on === true) + ', ' + JSON.stringify(keys) + ')');
      return readSwallowGate();
    };
    // One keyDown + keyUp pair with NO interleaving (the swallow leg's
    // single-key steps and the s1 control): returns the page's OWN keydown
    // record plus the record window it was taken from.
    const pressKey = async ({ key, code, vk, text = null, modifiers = 0 }) => {
      const before = await fullKeylogLength();
      const down = { type: 'keyDown', modifiers, key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
      if (text !== null) { down.text = text; down.unmodifiedText = text; }
      await send('Input.dispatchKeyEvent', down);
      try {
        await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers, key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
      } catch { /* the document may already be navigating; the record is the witness */ }
      const after = await fullKeylogLength();
      const slice = await fullKeylogSlice(before, after);
      return { entry: slice.find((e) => e && e.type === 'keyDown') || null, slice, lengthBefore: before, lengthAfter: after };
    };

    await clickCenter('field');
    const focusAfterClick = await activeId();
    if (focusAfterClick !== 'field') fail('focus-after-click', focusAfterClick);
    const valueBeforeFirstKey = await fieldValue('field');
    if (valueBeforeFirstKey !== '') fail('field-not-empty-before-typing', valueBeforeFirstKey);

    for (let i = 0; i < nonce.length; i++) {
      const ch = nonce[i];
      const vk = vkFor(ch);
      const code = codeFor(ch);
      if (vk === null || code === null) { fail('key-mapping-missing', `i=${i} ch=${JSON.stringify(ch)}`); break; }
      await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: ch, text: ch, unmodifiedText: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
      receipt.plainTrace.entries.push({ i, char: ch, valueAfter: await fieldValue('field') });
    }
    if (!(receipt.plainTrace.entries.length === nonce.length
      && receipt.plainTrace.entries.every((e, i) => e.char === nonce[i] && e.valueAfter === nonce.slice(0, i + 1)))) {
      fail('plain-trace-wrong', JSON.stringify(receipt.plainTrace.entries.slice(-2)));
    }
    await capture('b-typed');

    // --- leg 2: End (VK 35) — the NEGATIVE EDIT WITNESS --------------------
    const keylogBefore = await keylogLength();
    const endBefore = await fieldValue('field');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'End', code: 'End', windowsVirtualKeyCode: 35, nativeVirtualKeyCode: 35 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'End', code: 'End', windowsVirtualKeyCode: 35, nativeVirtualKeyCode: 35 });
    const endAfter = await fieldValue('field');
    receipt.controlDomain.end = { valueBefore: endBefore, valueAfter: endAfter, negativeWitness: endBefore === nonce && endAfter === endBefore };
    if (!receipt.controlDomain.end.negativeWitness) fail('control-end-witness-wrong', JSON.stringify(receipt.controlDomain.end));
    await capture('c-end-witness');

    // --- leg 3: Backspace (VK 8) -------------------------------------------
    const bsBefore = await fieldValue('field');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8 });
    const bsAfter = await fieldValue('field');
    receipt.controlDomain.backspace = { valueBefore: bsBefore, valueAfter: bsAfter, expected: nonce.slice(0, -1) };
    if (bsAfter !== nonce.slice(0, -1)) fail('control-backspace-witness-wrong', JSON.stringify(receipt.controlDomain.backspace));
    await capture('d-backspace');

    // --- leg 4: exact restore ----------------------------------------------
    const lastCh = nonce[nonce.length - 1];
    const rVk = vkFor(lastCh);
    const rCode = codeFor(lastCh);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: lastCh, text: lastCh, unmodifiedText: lastCh, code: rCode, windowsVirtualKeyCode: rVk, nativeVirtualKeyCode: rVk });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: lastCh, code: rCode, windowsVirtualKeyCode: rVk, nativeVirtualKeyCode: rVk });
    const restored = await fieldValue('field');
    receipt.controlDomain.restore = { valueAfter: restored };
    if (restored !== nonce) fail('control-restore-witness-wrong', String(restored));

    // --- leg 5: Tab (VK 9) — focus field -> field2 -------------------------
    const tabBefore = await activeId();
    await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    const tabAfter = await activeId();
    receipt.controlDomain.tab = { activeBefore: tabBefore, activeAfter: tabAfter };
    if (tabBefore !== 'field' || tabAfter !== 'field2') fail('control-tab-focus-wrong', JSON.stringify(receipt.controlDomain.tab));
    await capture('e-tab');

    // the page's own keydown recorder: the CONTROL-DOMAIN slice, read before
    // anything else types (the r56 window semantics: exactly the four control
    // keydowns End, Backspace, the restored character and Tab)
    const keylogAfter = await keylogLength();
    const pageKeylogSlice = await keylogSlice(keylogBefore, keylogAfter);
    const slice = Array.isArray(pageKeylogSlice) ? pageKeylogSlice : [];
    receipt.keylog = { entries: slice, length: slice.length, window: { start: keylogBefore, end: keylogAfter } };
    const wantKeys = ['End', 'Backspace', lastCh, 'Tab'];
    const wantCodes = ['End', 'Backspace', rCode, 'Tab'];
    const wantVks = [35, 8, rVk, 9];
    const keylogOk = slice.length === 4 && slice.every((e, i) => e
      && e.key === wantKeys[i] && e.code === wantCodes[i] && e.keyCode === wantVks[i]
      && e.windowsVirtualKeyCode === wantVks[i]
      && e.ctrlKey === false && e.altKey === false && e.metaKey === false && e.shiftKey === false
      && typeof e.targetId === 'string' && e.targetId.length > 0);
    if (!keylogOk) fail('keylog-window-wrong', JSON.stringify(slice).slice(0, 360));

    // --- leg 6 (NEW): the Shift-chord trace into #field2 -------------------
    const shift = form.shiftTrace;
    shift.valueBeforeFirstKey = await fieldValue('field2');
    shift.focusBefore = await activeId();
    if (shift.valueBeforeFirstKey !== '') fail('field2-not-empty-before-shift-trace', shift.valueBeforeFirstKey);
    if (shift.focusBefore !== 'field2') fail('shift-trace-source-not-field2', String(shift.focusBefore));
    let shiftEvents = 0;
    for (let i = 0; i < mixed.length; i++) {
      const ch = mixed[i];
      const vk = vkForMixed(ch);
      const code = codeForMixed(ch);
      if (vk === null || code === null) { fail('shift-key-mapping-missing', 'i=' + i + ' ch=' + JSON.stringify(ch)); break; }
      const ride = /[A-Z]/.test(ch);
      const emit = async (ev) => {
        await send('Input.dispatchKeyEvent', ev);
        shiftEvents++;
      };
      let rideRecord = null;
      if (ride) {
        await emit({ type: 'keyDown', modifiers: 8, key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16, nativeVirtualKeyCode: 16 });
        rideRecord = {
          keyDown: { key: 'Shift', code: 'ShiftLeft', keyCode: 16, modifiers: 8, shiftKey: true },
          keyUp: { key: 'Shift', code: 'ShiftLeft', keyCode: 16, modifiers: 8, shiftKey: true },
        };
      }
      await emit({ type: 'keyDown', modifiers: ride ? 8 : 0, key: ch, text: ch, unmodifiedText: ride ? ch.toLowerCase() : ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
      await emit({ type: 'keyUp', modifiers: ride ? 8 : 0, key: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
      if (ride) await emit({ type: 'keyUp', modifiers: 8, key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16, nativeVirtualKeyCode: 16 });
      const valueAfterField = await fieldValue('field');
      const valueAfterField2 = await fieldValue('field2');
      shift.typing.push({
        i, char: ch, key: ch, code, windowsVirtualKeyCode: vk,
        shiftRide: ride, modifiers: ride ? 8 : 0,
        valueAfter: valueAfterField2, valueAfterField,
        ride: rideRecord,
      });
    }
    delete shift.rideKeyUp;
    shift.keyEventCount = shiftEvents;
    shift.field2ValueAfterTyping = await fieldValue('field2');
    shift.fieldValueAfterTyping = await fieldValue('field');
    shift.allPrefixTrue = shiftTraceOk(mixed, nonce, shift.typing);
    shift.allFieldUnchanged = shift.typing.every((e) => e && e.valueAfterField === nonce);
    if (!shift.allPrefixTrue) fail('shift-trace-prefix-wrong', JSON.stringify(shift.typing.slice(-2)).slice(0, 380));
    if (!shift.allFieldUnchanged) fail('shift-trace-field-changed', JSON.stringify(shift.typing.slice(-2)).slice(0, 380));
    await capture('g-shift-typed');

    // --- leg 7 (NEW): the chord domain into #field3 ------------------------
    const chordLeg = form.chordLeg;
    const chordLetterCode = chordLeg.letterCode;
    const chordLetterVk = chordLeg.letterWindowsVirtualKeyCode;
    await clickCenter('field3');
    chordLeg.focusBefore = await activeId();
    if (chordLeg.focusBefore !== 'field3') fail('chord-focus-wrong', String(chordLeg.focusBefore));
    chordLeg.keylogLengthBefore = await keylogLength();
    chordLeg.field3ValueBefore = await fieldValue('field3');
    if (chordLeg.field3ValueBefore !== '') fail('field3-not-empty-before-chords', chordLeg.field3ValueBefore);
    let chordEvents = 0;
    for (const cm of CHORD_MODS) {
      const klFrom = await keylogLength();
      const events = [];
      const emit = async (ev) => {
        await send('Input.dispatchKeyEvent', ev);
        chordEvents++;
        events.push({ type: ev.type, key: ev.key, code: ev.code, modifiers: ev.modifiers });
      };
      await emit({ type: 'keyDown', modifiers: cm.bit, key: cm.key, code: cm.code, windowsVirtualKeyCode: cm.vk, nativeVirtualKeyCode: cm.vk });
      // NO text param: a modifier chord inserts nothing, and #field3's DOM
      // value staying EMPTY is part of the witness.
      await emit({ type: 'keyDown', modifiers: cm.bit, key: chordLetter, unmodifiedText: chordLetter, code: chordLetterCode, windowsVirtualKeyCode: chordLetterVk, nativeVirtualKeyCode: chordLetterVk });
      await emit({ type: 'keyUp', modifiers: cm.bit, key: chordLetter, code: chordLetterCode, windowsVirtualKeyCode: chordLetterVk, nativeVirtualKeyCode: chordLetterVk });
      await emit({ type: 'keyUp', modifiers: cm.bit, key: cm.key, code: cm.code, windowsVirtualKeyCode: cm.vk, nativeVirtualKeyCode: cm.vk });
      const klTo = await keylogLength();
      chordLeg.chords.push({
        name: cm.name, bit: cm.bit, key: cm.key, code: cm.code, windowsVirtualKeyCode: cm.vk,
        letterKeydown: { key: chordLetter, code: chordLetterCode, windowsVirtualKeyCode: chordLetterVk },
        keyEventsDispatched: 4,
        events,
        domEvents: await keylogSlice(klFrom, klTo),
        field3ValueAfter: await fieldValue('field3'),
      });
    }
    chordLeg.keyEventCount = chordEvents;
    chordLeg.keylogLengthAfter = await keylogLength();
    chordLeg.field3ValueAfter = await fieldValue('field3');
    chordLeg.booleansMatch = chordLeg.chords.length === CHORD_MODS.length
      && chordLeg.chords.every((c) => chordDomOk(c, chordLetter, chordLetterCode, chordLetterVk) && c.field3ValueAfter === '');
    if (chordLeg.chords.length !== CHORD_MODS.length) fail('chord-count-wrong', String(chordLeg.chords.length));
    if (!chordLeg.booleansMatch) fail('chord-booleans-wrong', JSON.stringify(chordLeg.chords.map((c) => ({ name: c.name, dom: c.domEvents }))).slice(0, 400));
    await capture('h-chord-domain');

    // --- leg 8 (NEW, r58): the preventDefault SWALLOW domain into #field3 ---
    // Physically AFTER the carried chord leg (which requires #field3 empty)
    // and BEFORE the carried final Enter submit, which restores the gate to
    // OFF first. #field3 carries NO name attribute, so nothing typed here can
    // ride the submitted query. Every witness below is read from the page
    // (DOM value / the page's own keylog entry) or from the fixture server's
    // request log — never from a driver-side assumption.
    const sw = form.swallowLeg;
    await clickCenter('field3');
    sw.focusBefore = await activeId();
    if (sw.focusBefore !== 'field3') fail('swallow-focus-wrong', String(sw.focusBefore));

    // (s1) control, gate OFF — the first two characters of the hex tail must
    // INSERT, and both keydowns must be recorded unprevented.
    sw.restore.preSwallowGate = await setSwallow(false, []);
    if (sw.restore.preSwallowGate.on !== false || sw.restore.preSwallowGate.set.length !== 0) {
      fail('swallow-gate-not-off', JSON.stringify(sw.restore.preSwallowGate));
    }
    sw.control.swallowOn = sw.restore.preSwallowGate.on;
    sw.control.swallowSet = sw.restore.preSwallowGate.set;
    sw.control.gate = sw.restore.preSwallowGate;
    sw.control.valueBefore = await fieldValue('field3');
    if (sw.control.valueBefore !== '') fail('swallow-control-field3-not-empty', String(sw.control.valueBefore));
    sw.control.typed = swallowSubject.controlChars.slice();
    const controlFrom = await fullKeylogLength();
    for (const ch of sw.control.typed) {
      const rec = await pressKey({ key: ch, code: codeFor(ch), vk: vkFor(ch), text: ch });
      sw.control.keylog.push(rec.entry);
    }
    sw.control.keylogLengthBefore = controlFrom;
    sw.control.keylogLengthAfter = await fullKeylogLength();
    sw.control.valueAfter = await fieldValue('field3');
    sw.control.defaultPrevented = sw.control.keylog.some((e) => e && e.defaultPrevented === true);
    if (sw.control.keylog.length !== 2 || sw.control.keylog.some((e) => !e)) {
      fail('swallow-control-not-delivered', JSON.stringify(sw.control.keylog).slice(0, 300));
    }
    if (sw.control.valueAfter !== sw.control.typed.join('')) {
      fail('swallow-control-not-inserted', JSON.stringify({ typed: sw.control.typed, valueAfter: sw.control.valueAfter }));
    }
    if (sw.control.keylog.some((e) => e && (e.cancelable !== true || e.defaultPrevented !== false))) {
      fail('swallow-control-prevented', JSON.stringify(sw.control.keylog.map((e) => e && { cancelable: e.cancelable, defaultPrevented: e.defaultPrevented })));
    }
    await capture('i-swallow-control');

    // (s2) gate ON {Backspace} — DELIVERED (cancelable true), PREVENTED, and
    // the value read back UNCHANGED (the negative edit witness).
    sw.backspaceSwallow.valueBefore = await fieldValue('field3');
    sw.backspaceSwallow.gate = await setSwallow(true, ['Backspace']);
    sw.backspaceSwallow.swallowOn = sw.backspaceSwallow.gate.on;
    sw.backspaceSwallow.swallowSet = sw.backspaceSwallow.gate.set;
    const bsRec = await pressKey({ key: 'Backspace', code: 'Backspace', vk: 8 });
    sw.backspaceSwallow.keylogEntry = bsRec.entry;
    sw.backspaceSwallow.keylogLengthBefore = bsRec.lengthBefore;
    sw.backspaceSwallow.keylogLengthAfter = bsRec.lengthAfter;
    sw.backspaceSwallow.cancelable = bsRec.entry ? bsRec.entry.cancelable === true : null;
    sw.backspaceSwallow.defaultPrevented = bsRec.entry ? bsRec.entry.defaultPrevented === true : null;
    sw.backspaceSwallow.valueAfter = await fieldValue('field3');
    if (!bsRec.entry) fail('swallow-backspace-not-delivered', JSON.stringify(bsRec.slice).slice(0, 300));
    if (sw.backspaceSwallow.cancelable !== true) fail('swallow-backspace-not-cancelable', String(sw.backspaceSwallow.cancelable));
    if (sw.backspaceSwallow.defaultPrevented !== true) fail('swallow-backspace-not-prevented', String(sw.backspaceSwallow.defaultPrevented));
    if (sw.backspaceSwallow.valueAfter !== sw.backspaceSwallow.valueBefore) {
      fail('swallow-backspace-edited-value', JSON.stringify({ before: sw.backspaceSwallow.valueBefore, after: sw.backspaceSwallow.valueAfter }));
    }
    await capture('j-swallow-backspace');

    // (s3) gate ON {<third tail char>} — DELIVERED, PREVENTED, value UNCHANGED
    // (a swallowed character insertion).
    sw.digitSwallow.valueBefore = await fieldValue('field3');
    sw.digitSwallow.gate = await setSwallow(true, [sw.digitSwallow.char]);
    sw.digitSwallow.swallowOn = sw.digitSwallow.gate.on;
    sw.digitSwallow.swallowSet = sw.digitSwallow.gate.set;
    const dgChar = sw.digitSwallow.char;
    const dgRec = await pressKey({ key: dgChar, code: codeFor(dgChar), vk: vkFor(dgChar), text: dgChar });
    sw.digitSwallow.keylogEntry = dgRec.entry;
    sw.digitSwallow.keylogLengthBefore = dgRec.lengthBefore;
    sw.digitSwallow.keylogLengthAfter = dgRec.lengthAfter;
    sw.digitSwallow.cancelable = dgRec.entry ? dgRec.entry.cancelable === true : null;
    sw.digitSwallow.defaultPrevented = dgRec.entry ? dgRec.entry.defaultPrevented === true : null;
    sw.digitSwallow.valueAfter = await fieldValue('field3');
    if (!dgRec.entry) fail('swallow-digit-not-delivered', JSON.stringify(dgRec.slice).slice(0, 300));
    if (sw.digitSwallow.defaultPrevented !== true) fail('swallow-digit-not-prevented', String(sw.digitSwallow.defaultPrevented));
    if (sw.digitSwallow.valueAfter !== sw.digitSwallow.valueBefore) {
      fail('swallow-digit-edited-value', JSON.stringify({ before: sw.digitSwallow.valueBefore, after: sw.digitSwallow.valueAfter }));
    }
    await capture('k-swallow-digit');

    // (s4) gate ON {Enter} — ONE Control+Enter chord (modifier bit 2 per
    // S153, text '\r' exactly as the carried submit carries). Both keydowns
    // must be DELIVERED, the Enter event's recorded defaultPrevented must be
    // TRUE, and the fixture server must see NO request.
    sw.enterChordSwallow.valueBefore = await fieldValue('field3');
    sw.enterChordSwallow.gate = await setSwallow(true, ['Enter']);
    sw.enterChordSwallow.swallowOn = sw.enterChordSwallow.gate.on;
    sw.enterChordSwallow.swallowSet = sw.enterChordSwallow.gate.set;
    sw.enterChordSwallow.serverRequestsBefore = serverLog.length;
    const chordFrom = await fullKeylogLength();
    const mk = (type, key, code, vk, modifiers, text) => {
      const ev = { type, modifiers, key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
      if (text !== null) { ev.text = text; ev.unmodifiedText = text; }
      return ev;
    };
    await send('Input.dispatchKeyEvent', mk('keyDown', 'Control', 'ControlLeft', 17, 2, null));
    await send('Input.dispatchKeyEvent', mk('keyDown', 'Enter', 'Enter', 13, 2, '\r'));
    try { await send('Input.dispatchKeyEvent', mk('keyUp', 'Enter', 'Enter', 13, 2, null)); } catch { /* recorded anyway */ }
    try { await send('Input.dispatchKeyEvent', mk('keyUp', 'Control', 'ControlLeft', 17, 2, null)); } catch { /* recorded anyway */ }
    const chordSliceSw = await fullKeylogSlice(chordFrom, await fullKeylogLength());
    const chordDowns = chordSliceSw.filter((e) => e && e.type === 'keyDown');
    sw.enterChordSwallow.ctrlKeylogEntry = chordDowns.find((e) => e.key === 'Control') || null;
    sw.enterChordSwallow.enterKeylogEntry = chordDowns.find((e) => e.key === 'Enter') || null;
    sw.enterChordSwallow.bothKeydownsDelivered = chordDowns.length === 2
      && !!sw.enterChordSwallow.ctrlKeylogEntry && !!sw.enterChordSwallow.enterKeylogEntry;
    sw.enterChordSwallow.enterModifiers = sw.enterChordSwallow.enterKeylogEntry
      ? sw.enterChordSwallow.enterKeylogEntry.modifiers : null;
    sw.enterChordSwallow.defaultPrevented = sw.enterChordSwallow.enterKeylogEntry
      ? sw.enterChordSwallow.enterKeylogEntry.defaultPrevented === true : null;
    // the no-submission window: the server must stay silent (a /favicon.ico
    // fetch is possible on a navigation, so only an /echo request counts as a
    // submission; the raw new-request list is kept anyway).
    await sleep(SWALLOW_NO_SUBMIT_WAIT_MS);
    sw.enterChordSwallow.serverRequestsAfter = serverLog.length;
    sw.enterChordSwallow.newRequests = serverLog
      .slice(sw.enterChordSwallow.serverRequestsBefore)
      .map((r) => ({ path: r.path, query: r.query }));
    sw.enterChordSwallow.submitted = sw.enterChordSwallow.newRequests.some((r) => r.path === '/echo');
    sw.enterChordSwallow.valueAfter = await fieldValue('field3');
    if (!sw.enterChordSwallow.bothKeydownsDelivered) {
      fail('swallow-chord-not-delivered', JSON.stringify(chordDowns).slice(0, 360));
    }
    if (sw.enterChordSwallow.enterModifiers !== 2) fail('swallow-chord-modifiers-wrong', String(sw.enterChordSwallow.enterModifiers));
    if (sw.enterChordSwallow.defaultPrevented !== true) fail('swallow-chord-not-prevented', String(sw.enterChordSwallow.defaultPrevented));
    if (sw.enterChordSwallow.submitted !== false) fail('swallow-chord-submitted', JSON.stringify(sw.enterChordSwallow.newRequests));
    if (sw.enterChordSwallow.valueAfter !== sw.enterChordSwallow.valueBefore) {
      fail('swallow-chord-edited-value', JSON.stringify({ before: sw.enterChordSwallow.valueBefore, after: sw.enterChordSwallow.valueAfter }));
    }
    await capture('l-swallow-enter');

    // the gate is restored OFF before the carried final Enter submit, and the
    // page itself confirms it (the submission must not be swallowed).
    sw.restore.pageGate = await setSwallow(false, []);
    sw.restore.swallowOn = sw.restore.pageGate.on;
    sw.restore.swallowSet = sw.restore.pageGate.set;
    sw.restore.activeElement = await activeId();
    if (sw.restore.pageGate.on !== false || sw.restore.pageGate.set.length !== 0) {
      fail('swallow-gate-not-restored', JSON.stringify(sw.restore.pageGate));
    }

    // --- leg 9 (NEW, r59): the CapsLock DELIVERY-BOUNDARY leg into #field3 --
    // Physically after the r58 swallow leg (whose restore left the gate OFF)
    // and before the carried final Enter submit. Two CapsLock down/up pairs
    // with two nonce-derived letters after each. Every witness is the PAGE's
    // own record (delivered shape + getModifierState('CapsLock')) plus the DOM
    // value read back after every keystroke. The measured expectation is
    // NAMED in the receipt: capsLatchExpected false.
    const cap = form.capsLockLeg;
    const capTrace = receipt.capslockTrace;
    await clickCenter('field3');
    cap.focusBefore = await activeId();
    if (cap.focusBefore !== 'field3') fail('capslock-focus-wrong', String(cap.focusBefore));
    cap.valueBefore = await fieldValue('field3');
    const capWinFrom = await fullKeylogLength();
    cap.keylogWindow.start = capWinFrom;
    const preCaps = (await fullKeylogSlice(capWinFrom - 1, capWinFrom))[0] || null;
    capTrace.beforePress1 = preCaps ? preCaps.capsLock === true : null;
    const capsPair = (rec, valueAfter) => {
      const down = rec.slice.find((e) => e && e.type === 'keyDown') || null;
      const up = rec.slice.find((e) => e && e.type === 'keyUp') || null;
      return {
        key: 'CapsLock', code: 'CapsLock', windowsVirtualKeyCode: 20,
        keydownEntry: down, keyupEntry: up,
        capsKeydown: down ? down.capsLock === true : null,
        capsKeyup: up ? up.capsLock === true : null,
        shiftKeydown: down ? down.shift === true : null,
        shiftKeyup: up ? up.shift === true : null,
        valueAfter,
      };
    };
    const capsTracePush = (phase, rec, valueAfter) => {
      for (const e of rec.slice) {
        cap.trace.push({ phase, type: e.type, key: e.key, code: e.code, keyCode: e.keyCode,
          capsLock: e.capsLock === true, shift: e.shift === true, valueAfter });
      }
    };
    // press 1
    const capsP1 = await pressKey({ key: 'CapsLock', code: 'CapsLock', vk: 20 });
    cap.press1 = capsPair(capsP1, await fieldValue('field3'));
    capTrace.press1 = { ...cap.press1 };
    capsTracePush('press1', capsP1, cap.press1.valueAfter);
    await capture('m-capslock-press1');
    // letters 1 (r52-style: per-char code/vk, text = char)
    for (let i = 0; i < capsSubject.letters1.length; i++) {
      const ch = capsSubject.letters1[i];
      const rec = await pressKey({ key: ch, code: codeFor(ch), vk: vkFor(ch), text: ch });
      const valueAfter = await fieldValue('field3');
      const entry = {
        i, char: ch, key: ch, code: codeFor(ch), windowsVirtualKeyCode: vkFor(ch), text: ch,
        type: 'keyDown',
        capsLock: rec.entry ? rec.entry.capsLock === true : null,
        shift: rec.entry ? rec.entry.shift === true : null,
        cancelable: rec.entry ? rec.entry.cancelable === true : null,
        defaultPrevented: rec.entry ? rec.entry.defaultPrevented === true : null,
        valueAfter,
      };
      cap.letters1.push(entry);
      capTrace.letters1.push(entry);
      capsTracePush('letters1-' + i, rec, valueAfter);
    }
    await capture('n-capslock-letters1');
    // press 2
    const capsP2 = await pressKey({ key: 'CapsLock', code: 'CapsLock', vk: 20 });
    cap.press2 = capsPair(capsP2, await fieldValue('field3'));
    capTrace.press2 = { ...cap.press2 };
    capsTracePush('press2', capsP2, cap.press2.valueAfter);
    await capture('o-capslock-press2');
    // letters 2
    for (let i = 0; i < capsSubject.letters2.length; i++) {
      const ch = capsSubject.letters2[i];
      const rec = await pressKey({ key: ch, code: codeFor(ch), vk: vkFor(ch), text: ch });
      const valueAfter = await fieldValue('field3');
      const entry = {
        i, char: ch, key: ch, code: codeFor(ch), windowsVirtualKeyCode: vkFor(ch), text: ch,
        type: 'keyDown',
        capsLock: rec.entry ? rec.entry.capsLock === true : null,
        shift: rec.entry ? rec.entry.shift === true : null,
        cancelable: rec.entry ? rec.entry.cancelable === true : null,
        defaultPrevented: rec.entry ? rec.entry.defaultPrevented === true : null,
        valueAfter,
      };
      cap.letters2.push(entry);
      capTrace.letters2.push(entry);
      capsTracePush('letters2-' + i, rec, valueAfter);
    }
    cap.valueAfter = await fieldValue('field3');
    cap.keylogWindow.end = await fullKeylogLength();
    const capRecords = await fullKeylogSlice(cap.keylogWindow.start, cap.keylogWindow.end);
    cap.capsLatchExpected = receipt.capsLatchExpected;
    cap.capsLatchObservedAllFalse = capRecords.length > 0
      && capRecords.every((e) => e && e.capsLock === false);
    cap.anyCapsTrue = capRecords.some((e) => e && e.capsLock === true);
    capTrace.capsLatchOk = false;
    for (const key of ['press1', 'press2']) {
      capTrace[key + 'DownCaps'] = cap[key].capsKeydown;
      capTrace[key + 'UpCaps'] = cap[key].capsKeyup;
    }
    const letters1Caps = cap.trace.filter((t) => t.phase.startsWith('letters1-')).map((t) => t.capsLock);
    const letters2Caps = cap.trace.filter((t) => t.phase.startsWith('letters2-')).map((t) => t.capsLock);
    const acrossLetters1 = letters1Caps.length > 0 && letters1Caps.every((v) => v === false);
    const acrossLetters2 = letters2Caps.length > 0 && letters2Caps.every((v) => v === false);
    // the RAW observed caps values in page order: before the first press, then
    // press1 down/up, both letters1 pairs, press2 down/up, both letters2 pairs.
    const rawSequence = [
      capTrace.beforePress1,
      cap.press1.capsKeydown, cap.press1.capsKeyup,
      ...letters1Caps,
      cap.press2.capsKeydown, cap.press2.capsKeyup,
      ...letters2Caps,
    ];
    cap.latch = {
      expected: receipt.capsLatchExpected,
      beforePress1: capTrace.beforePress1,
      afterPress1: cap.press1.capsKeyup,
      acrossLetters1,
      afterPress2: cap.press2.capsKeyup,
      acrossLetters2,
      sequence: rawSequence,
      anyTrue: rawSequence.some((v) => v === true) || cap.anyCapsTrue === true,
      allFalse: rawSequence.length > 0 && rawSequence.every((v) => v === false),
    };
    capTrace.afterPress1 = cap.press1.capsKeyup;
    capTrace.acrossLetters1 = acrossLetters1;
    capTrace.afterPress2 = cap.press2.capsKeyup;
    capTrace.acrossLetters2 = acrossLetters2;
    capTrace.latch = { ...cap.latch };
    capTrace.capsLatchOk = receipt.capsLatchExpected === false
      && cap.latch.allFalse === true
      && cap.anyCapsTrue === false
      && acrossLetters1 === true && acrossLetters2 === true
      && capsBoundaryOk(capRecords, receipt.capsLatchExpected);
    cap.capsLatchOk = capTrace.capsLatchOk;
    const capPrefix1 = cap.valueBefore;
    const capPrefix2 = capPrefix1 + capsSubject.letters1.join('');
    cap.prefixOk = cap.letters1.every((e, i) => e.valueAfter === capPrefix1 + capsSubject.letters1.slice(0, i + 1).join(''))
      && cap.letters2.every((e, i) => e.valueAfter === capPrefix2 + capsSubject.letters2.slice(0, i + 1).join(''))
      && cap.valueAfter === capPrefix2 + capsSubject.letters2.join('');
    if (!cap.prefixOk) fail('capslock-prefix-wrong', JSON.stringify({ valueBefore: cap.valueBefore, letters1: cap.letters1, letters2: cap.letters2, valueAfter: cap.valueAfter }));
    if (!cap.capsLatchOk) {
      fail('capslock-boundary-mismatch', JSON.stringify({ expected: receipt.capsLatchExpected, latch: cap.latch, anyCapsTrue: cap.anyCapsTrue }));
    }
    if (!capsBoundaryOk(capRecords, receipt.capsLatchExpected)) {
      fail('capslock-delivered-shape-wrong', JSON.stringify(capRecords.slice(0, 6)));
    }
    await capture('p-capslock-letters2');

    // the page's COMPLETE keydown+keyup record of the run, read BEFORE the
    // Enter dispatch (the submission navigates the document and the recorder
    // dies with it — the r56 disclosure, carried unchanged)
    const fullKeylog = await evalJSON('JSON.stringify(window.__keylogFull)');
    form.pageKeylog = Array.isArray(fullKeylog) ? fullKeylog : [];
    // R1 (pre-data pin): the Shift DETECTOR-POSITIVE leg. The same page's own
    // record must read getModifierState('Shift') TRUE on every event of the
    // real Shift chord (the Shift keydown/keyup pairs and every uppercase
    // ride letter), while the CapsLock leg's events read it FALSE. CDP maps
    // the Shift bit, so this separates "the recorder's getModifierState works"
    // from "the caps flag cannot be set": the differential is the boundary.
    const shiftDetectorEvents = form.pageKeylog.filter((e) => e
      && (e.key === 'Shift' || /^[A-Z]$/.test(String(e.key))));
    const shiftKeyEvents = shiftDetectorEvents.filter((e) => e.key === 'Shift');
    const uppercaseEvents = shiftDetectorEvents.filter((e) => /^[A-Z]$/.test(String(e.key)));
    const capsLegShiftFalse = cap.trace.length > 0 && cap.trace.every((t) => t && t.shift === false);
    form.shiftDetector = {
      mechanism: "getModifierState('Shift') on the page's own keydown/keyup record",
      events: shiftDetectorEvents.length,
      shiftKeyEvents: shiftKeyEvents.length,
      uppercaseLetterEvents: uppercaseEvents.length,
      allGetModifierStateShiftTrue: shiftDetectorEvents.length > 0
        && shiftDetectorEvents.every((e) => e.shift === true),
      capsLegEvents: cap.trace.length,
      capsLegAllGetModifierStateShiftFalse: capsLegShiftFalse,
      differential: shiftDetectorEvents.length > 0 && capsLegShiftFalse
        && shiftDetectorEvents.every((e) => e.shift === true),
      ok: shiftDetectorEvents.length > 0
        && shiftKeyEvents.length > 0
        && uppercaseEvents.length > 0
        && shiftDetectorEvents.every((e) => e.shift === true)
        && capsLegShiftFalse,
    };
    if (!form.shiftDetector.ok) fail('shift-detector-negative', JSON.stringify(form.shiftDetector));
    receipt.field3Value = await fieldValue('field3');
    receipt.field3Final = await fieldValue('field3');
    form.field3NameAttribute = receipt.fixture.field3Name;
    // the DISCLOSED fixtureDelta witness: EVERY recorded event of both
    // recorders carries the two additive fields (page-side boolean, not a
    // driver count).
    receipt.fixtureDelta.witness.keylogEntries = await evalValue('window.__keylog.length');
    receipt.fixtureDelta.witness.keylogFullEntries = form.pageKeylog.length;
    receipt.fixtureDelta.witness.allCarryAdditiveFields = form.pageKeylog.length > 0
      && form.pageKeylog.every((e) => e && typeof e.cancelable === 'boolean' && typeof e.defaultPrevented === 'boolean' && typeof e.capsLock === 'boolean')
      && (await evalValue('window.__keylog.every(function (e) { return typeof e.cancelable === "boolean" && typeof e.defaultPrevented === "boolean" && typeof e.capsLock === "boolean"; })')) === true;
    if (!receipt.fixtureDelta.witness.allCarryAdditiveFields) {
      fail('fixture-delta-fields-missing', JSON.stringify(receipt.fixtureDelta.witness));
    }
    receipt.fixtureDelta.witness.allCarryCapsFlag = form.pageKeylog.length > 0
      && form.pageKeylog.every((e) => e && typeof e.capsLock === 'boolean');
    receipt.fixtureDelta.witness.allCarryShiftFlag = form.pageKeylog.length > 0
      && form.pageKeylog.every((e) => e && typeof e.shift === 'boolean');
    const plan = expectedKeylogPlan(nonce, mixed, chordLetter, swallowSubject, capsSubject);
    const klEq = (a, b) => !!a && !!b && a.key === b.key && a.code === b.code
      && a.ctrlKey === b.ctrlKey && a.altKey === b.altKey
      && a.metaKey === b.metaKey && a.shiftKey === b.shiftKey
      && a.keyCode === b.keyCode
      && a.cancelable === b.cancelable && a.defaultPrevented === b.defaultPrevented;
    const keydowns = form.pageKeylog.filter((e) => e && e.type === 'keyDown');
    form.expectedKeylogLength = plan.length;
    form.pageKeylogLength = form.pageKeylog.length;
    form.pageKeylogKeydownCount = keydowns.length;
    form.keylogMatchesPlan = keydowns.length === plan.length && plan.every((e, i) => klEq(e, keydowns[i]));
    if (!form.keylogMatchesPlan) fail('page-keylog-plan-mismatch', 'page keydowns ' + keydowns.length + ' plan ' + plan.length);
    // the page-side Shift ride witness, re-derived from the full record
    const rideSection = shiftRideSectionOk(form.pageKeylog, mixed);
    shift.ridesPresent = rideSection.ok === true;
    form.rideSection = { ok: rideSection.ok, reason: rideSection.reason, start: rideSection.start, end: rideSection.end };
    if (!rideSection.ok) fail('shift-ride-not-delivered', rideSection.reason);
    if (rideSection.ok) {
      const after = form.pageKeylog[rideSection.end];
      form.rideSection.nextIsChord = !!(after && after.type === 'keyDown' && after.key === 'Control');
      if (!form.rideSection.nextIsChord) fail('page-keylog-section-order', 'the shift section is not followed by the chord leg');
    }

    // --- leg 8: Enter (VK 13) from a re-focused #field2 — the ONE submit ---
    // The r56 Enter leg is carried unchanged (ONE keyDown with text '\r'
    // driving the implicit submission); it is physically last because the
    // frozen C2 requires the single submission to carry field AND field2.
    await clickCenter('field2');
    const focusBeforeEnter = await activeId();
    receipt.controlDomain.enter.focusedBeforeEnter = focusBeforeEnter;
    if (focusBeforeEnter !== 'field2') fail('enter-source-not-field2', String(focusBeforeEnter));
    try {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
      try { await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 }); }
      catch { /* the document may already be navigating; the server log is the witness */ }
    } catch (e) {
      fail('enter-dispatch', String((e && e.message) || e));
    }
    const submitted = await waitFor(() => serverLog.some((r) => r.path === '/echo'), ENTER_TIMEOUT_MS, 50);
    if (!submitted) fail('enter-implicit-submission', 'no /echo request within ' + ENTER_TIMEOUT_MS + ' ms of the Enter keyDown');
    writeServerLog();

    const echoReqs = serverLog.filter((r) => r.path === '/echo');
    const q = echoReqs.length ? new URLSearchParams(echoReqs[0].query) : new URLSearchParams('');
    receipt.controlDomain.enter = {
      submitted: submitted === true && echoReqs.length === 1,
      serverSawField: echoReqs.length ? (q.get('field') || '') : '',
      serverSawField2: echoReqs.length ? (q.get('field2') || '') : '',
      expectedField2: mixed,
      focusedBeforeEnter: focusBeforeEnter,
      queryKeys: echoReqs.length ? Array.from(q.keys()) : [],
      carriesField3: echoReqs.length ? q.has('field3') : null,
    };
    if (echoReqs.length !== 1) fail('enter-echo-count', 'expected exactly 1 /echo request, saw ' + echoReqs.length + ': ' + JSON.stringify(echoReqs).slice(0, 300));
    if (receipt.controlDomain.enter.serverSawField !== nonce) fail('enter-field-value', JSON.stringify(receipt.controlDomain.enter.serverSawField));
    if (receipt.controlDomain.enter.serverSawField2 !== mixed) fail('enter-field2-value', JSON.stringify(receipt.controlDomain.enter.serverSawField2));
    if (receipt.controlDomain.enter.carriesField3 !== false) fail('enter-carries-field3', JSON.stringify(receipt.controlDomain.enter.queryKeys));

    // client-side witness on the echo page
    const echoReady = await waitFor(async () => {
      try { return (await evalValue('location.pathname')) === '/echo' && (await evalValue('document.readyState')) === 'complete'; }
      catch { return false; }
    }, 5000);
    if (!echoReady) fail('echo-page-not-ready', 'location.pathname never became /echo');
    let echoed = null;
    let echoed2 = null;
    let echoField3Param = null;
    try {
      echoed = await evalValue('(document.getElementById("echoed")||{}).textContent');
      echoed2 = await evalValue('(document.getElementById("echoed2")||{}).textContent');
      echoField3Param = await evalValue('(document.getElementById("field3param")||{}).textContent');
    } catch { /* the fail below carries the state */ }
    if (echoed !== nonce) fail('echo-page-value', String(echoed));
    if (echoed2 !== mixed) fail('echo-page-field2-value', String(echoed2));
    if (echoField3Param !== 'absent') fail('echo-page-field3-param', String(echoField3Param));
    form.echoPage = { url: await evalValue('location.href'), field: echoed, field2: echoed2, field3Param: echoField3Param };
    await capture('f-enter-echo');
    form.shots = shotLog.filter((s) => SHOT_NAMES.includes(s.name));

    // --- leg 10 (NEW, r59): the routed D4 positive control on /form2 ------
    // A second form page (same fixture shape, NO swallower; same fixture
    // server). The SAME Control+Enter chord that form1's swallower suppressed
    // DOES submit here: exactly one /echo2, witnessed client-side (the
    // navigation and the echo page's DOM) and server-side (the fixture
    // server's own request log). form1's single-/echo invariant is untouched.
    const f2 = receipt.journey.form2;
    await send('Page.navigate', { url: origin + '/form2' });
    const f2ready = await waitFor(async () => {
      try {
        return (await evalValue('document.readyState')) === 'complete'
          && (await evalValue('location.pathname')) === '/form2'
          && (await evalValue('!!document.getElementById("field")')) === true
          && (await evalValue('!!document.getElementById("field2")')) === true
          && (await evalValue('!!document.getElementById("field3")')) === true
          && (await evalValue('Array.isArray(window.__keylog)')) === true
          && (await evalValue('Array.isArray(window.__keylogFull)')) === true
          && (await evalValue('(document.getElementById("nonce")||{}).textContent')) === nonce
          && (await evalValue('typeof window.__setSwallow')) === 'undefined'
          && (await evalValue('typeof window.__swallowOn')) === 'undefined';
      } catch { return false; }
    }, 15000);
    if (!f2ready) fail('form2-not-ready', 'GET /form2 never reached the contract state (fields, recorders, nonce, no swallow API)');
    f2.url = await evalValue('location.href');
    f2.nonceOnPage = (await evalValue('(document.getElementById("nonce")||{}).textContent')) === nonce;
    f2.noSwallowerLive = (await evalValue('typeof window.__setSwallow === "undefined" && typeof window.__swallowOn === "undefined"')) === true;
    if (!f2.noSwallowerLive) fail('form2-swallower-live', 'form2 exposes a swallow API');
    const f2fields = await evalJSON('JSON.stringify(Array.from(document.querySelectorAll("#f input")).map(function (el) { return { id: el.id, name: el.getAttribute("name") }; }))');
    f2.fields = Array.isArray(f2fields) ? f2fields : [];
    const f2field3 = f2.fields.find((x) => x && x.id === 'field3');
    if (!f2field3 || f2field3.name !== null) fail('form2-field3-named-live', JSON.stringify(f2.fields));
    await clickCenter('field');
    f2.focus.activeBefore = await activeId();
    if (f2.focus.activeBefore !== 'field') fail('form2-focus-wrong', String(f2.focus.activeBefore));
    for (let i = 0; i < nonce.length; i++) {
      const ch = nonce[i];
      await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: ch, text: ch, unmodifiedText: ch, code: codeFor(ch), windowsVirtualKeyCode: vkFor(ch), nativeVirtualKeyCode: vkFor(ch) });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: ch, code: codeFor(ch), windowsVirtualKeyCode: vkFor(ch), nativeVirtualKeyCode: vkFor(ch) });
      f2.typed.entries.push({ i, char: ch, valueAfter: await fieldValue('field') });
    }
    f2.typed.value = await fieldValue('field');
    f2.typed.valueAfter = f2.typed.value;
    if (f2.typed.value !== nonce) fail('form2-field-value', String(f2.typed.value));
    await capture('q-form2-chord');
    f2.serverRequestsBefore = serverLog.length;
    const f2chordFrom = await fullKeylogLength();
    const f2mk = (type, key, code, vk, modifiers, text) => {
      const ev = { type, modifiers, key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
      if (text !== null) { ev.text = text; ev.unmodifiedText = text; }
      return ev;
    };
    f2.chord.events = [
      { type: 'keyDown', key: 'Control', code: 'ControlLeft', windowsVirtualKeyCode: 17, modifiers: 2, text: null },
      { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, modifiers: 2, text: '\r' },
      { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, modifiers: 2, text: null },
      { type: 'keyUp', key: 'Control', code: 'ControlLeft', windowsVirtualKeyCode: 17, modifiers: 2, text: null },
    ];
    await send('Input.dispatchKeyEvent', f2mk('keyDown', 'Control', 'ControlLeft', 17, 2, null));
    await send('Input.dispatchKeyEvent', f2mk('keyDown', 'Enter', 'Enter', 13, 2, '\r'));
    try { await send('Input.dispatchKeyEvent', f2mk('keyUp', 'Enter', 'Enter', 13, 2, null)); } catch { /* navigating */ }
    try { await send('Input.dispatchKeyEvent', f2mk('keyUp', 'Control', 'ControlLeft', 17, 2, null)); } catch { /* navigating */ }
    const f2slice = await fullKeylogSlice(f2chordFrom, await fullKeylogLength());
    f2.chord.domEvents = f2slice.filter((e) => e && e.type === 'keyDown');
    f2.chord.bothKeydownsDelivered = f2.chord.domEvents.length === 2
      && f2.chord.domEvents.some((e) => e.key === 'Control') && f2.chord.domEvents.some((e) => e.key === 'Enter');
    const f2enter = f2.chord.domEvents.find((e) => e.key === 'Enter') || null;
    f2.chord.enterModifiers = f2enter ? f2enter.modifiers : null;
    if (!f2.chord.bothKeydownsDelivered) fail('form2-chord-not-delivered', JSON.stringify(f2slice).slice(0, 360));
    if (f2.chord.enterModifiers !== 2) fail('form2-chord-modifiers-wrong', String(f2.chord.enterModifiers));
    const f2submitted = await waitFor(() => serverLog.some((r) => r.path === '/echo2'), ENTER_TIMEOUT_MS, 50);
    f2.submitted = f2submitted === true;
    if (!f2.submitted) fail('form2-chord-not-submitted', 'no /echo2 request within ' + ENTER_TIMEOUT_MS + ' ms of the chord keyDown');
    await sleep(200); // let the navigation commit before the client witness
    f2.serverRequestsAfter = serverLog.length;
    f2.newRequests = serverLog.slice(f2.serverRequestsBefore).map((r) => ({ path: r.path, query: String(r.query) }));
    const echo2Reqs = serverLog.filter((r) => r.path === '/echo2');
    f2.echo2.count = echo2Reqs.length;
    f2.echo2.submitted = f2.submitted && echo2Reqs.length === 1;
    const q2 = echo2Reqs.length ? new URLSearchParams(echo2Reqs[0].query) : new URLSearchParams('');
    f2.echo2.field = echo2Reqs.length ? (q2.get('field') || '') : null;
    f2.echo2.field2 = echo2Reqs.length ? (q2.get('field2') || '') : null;
    f2.echo2.queryKeys = echo2Reqs.length ? Array.from(q2.keys()) : [];
    f2.echo2.field3Param = echo2Reqs.length ? (q2.has('field3') ? 'present' : 'absent') : null;
    f2.echo2.url = echo2Reqs.length ? (origin + '/echo2?' + echo2Reqs[0].query) : null;
    if (echo2Reqs.length !== 1) fail('echo2-count', 'expected exactly 1 /echo2 request, saw ' + echo2Reqs.length + ': ' + JSON.stringify(echo2Reqs).slice(0, 300));
    if (f2.echo2.field !== nonce) fail('echo2-field-value', JSON.stringify(f2.echo2.field));
    if (f2.echo2.queryKeys.indexOf('field3') !== -1) fail('echo2-carries-field3', JSON.stringify(f2.echo2.queryKeys));
    // Ctrl+Enter's default action submits to a NEW TAB on this surface, so the
    // client-side witness is the /echo2 page TARGET's own DOM and URL, not the
    // original /form2 document (which stays put). The new tab is still the same
    // throwaway browser: the keyed teardown kills it with the group.
    let echo2Target = null;
    for (let i = 0; i < 50 && !echo2Target; i++) {
      try {
        const list = await (await fetch(cdpOrigin + '/json/list')).json();
        echo2Target = (Array.isArray(list) ? list : []).find((t) => t.type === 'page'
          && String(t.url).startsWith(origin + '/echo2')) || null;
      } catch { echo2Target = null; }
      if (!echo2Target) await sleep(100);
    }
    f2.echo2.disposition = echo2Target ? 'new-tab' : null;
    f2.echo2.clientTargetUrl = echo2Target ? echo2Target.url : null;
    f2.echo2.clientTargetId = echo2Target ? echo2Target.id : null;
    if (!echo2Target) fail('echo2-client-target', 'no /echo2 page target appeared after the chord');
    if (echo2Target) {
      const echoWs = new WebSocket(echo2Target.webSocketDebuggerUrl);
      await new Promise((res, rej) => {
        const timer = setTimeout(() => rej(new Error('echo2 ws open timeout')), 15000);
        echoWs.addEventListener('open', () => { clearTimeout(timer); res(); }, { once: true });
        echoWs.addEventListener('error', () => { clearTimeout(timer); rej(new Error('echo2 ws error')); }, { once: true });
      });
      let echoMsgId = 0;
      const echoPending = new Map();
      echoWs.addEventListener('message', (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch { return; }
        if (msg.id && echoPending.has(msg.id)) { echoPending.get(msg.id)(msg); echoPending.delete(msg.id); }
      });
      const echoSend = (method, params = {}) => new Promise((res, rej) => {
        const id = ++echoMsgId;
        echoPending.set(id, res);
        echoWs.send(JSON.stringify({ id, method, params }));
        setTimeout(() => { if (echoPending.has(id)) { echoPending.delete(id); rej(new Error('echo2 cdp timeout ' + method)); } }, 15000);
      });
      const echoEval = async (expression) => {
        const rs = await echoSend('Runtime.evaluate', { expression, returnByValue: true });
        return rs.result && rs.result.result ? rs.result.result.value : undefined;
      };
      try {
        await echoSend('Page.enable');
        await echoSend('Runtime.enable');
        const echo2Ready = await waitFor(async () => {
          try {
            return (await echoEval('document.readyState')) === 'complete'
              && (await echoEval('location.pathname')) === '/echo2';
          } catch { return false; }
        }, 5000);
        if (!echo2Ready) fail('echo2-page-not-ready', 'the /echo2 target never reached readyState complete');
        f2.echoPage.url = await echoEval('location.href');
        f2.echoPage.field = await echoEval('(document.getElementById("echoed")||{}).textContent');
        f2.echoPage.field2 = await echoEval('(document.getElementById("echoed2")||{}).textContent');
        f2.echoPage.field3Param = await echoEval('(document.getElementById("field3param")||{}).textContent');
        await captureOn(echoSend, 'r-form2-echo');
      } catch (e) {
        fail('echo2-target-error', String((e && e.message) || e));
      } finally {
        try { echoWs.close(); } catch { /* already gone */ }
      }
    }
    if (f2.echoPage.field !== nonce) fail('echo2-page-field', String(f2.echoPage.field));
    if (f2.echoPage.field2 !== '') fail('echo2-page-field2', String(f2.echoPage.field2));
    if (f2.echoPage.field3Param !== 'absent') fail('echo2-page-field3-param', String(f2.echoPage.field3Param));
    f2.shots = shotLog.filter((s) => s.name === 'q-form2-chord' || s.name === 'r-form2-echo');
    receipt.echo2Witness = {
      submitted: f2.echo2.submitted === true,
      requestCount: f2.echo2.count,
      serverRequests: (Array.isArray(f2.newRequests) ? f2.newRequests : []).filter((r) => r.path === '/echo2'),
      clientPath: (() => { try { return new URL(String(f2.echoPage.url)).pathname; } catch { return null; } })(),
      clientField: f2.echoPage.field,
      clientField2: f2.echoPage.field2,
      field3Param: f2.echoPage.field3Param,
      queryKeys: f2.echo2.queryKeys,
      disposition: f2.echo2.disposition,
      clientTargetUrl: f2.echo2.clientTargetUrl,
    };
    if (f2.echo2.submitted !== true) fail('echo2-not-submitted', JSON.stringify(f2.echo2));
    if (receipt.echo2Witness.clientPath !== '/echo2') fail('echo2-client-path', String(receipt.echo2Witness.clientPath));

    // the fixture server's OWN request log, path + query per request: the
    // one-submission witness as committed bytes. Re-snapshotted from the live
    // array immediately before the receipt is written.
    form.serverRequests = serverLog.map((r) => ({ path: r.path, query: String(r.query) }));
  } catch (e) {
    fail('drive-error', String((e && e.message) || e));
  } finally {
    try { if (ws) ws.close(); } catch {}
  }
}

// The r59 declared step list in its FROZEN order (the r58 twelve carried,
// the six r59 names appended); the full chronological evidence log is
// stepsExtended. The r56 STEP_NAMES remain the first six entries.
receipt.stepsExtended = shotLog.slice();
for (const n of ALL_PNG_NAMES) {
  const s = shotLog.find((x) => x.name === n) || null;
  if (s) steps.push(s);
}
receipt.steps = steps;

// --- teardown: kill the process GROUP, sweep the token to zero, PROBE -----
// The browser is killed BEFORE the fixture server is closed: Chromium holds
// keep-alive sockets to the fixture, and server.close() waits for them, so
// closing first deadlocks against a live browser (observed in this runner's
// first smoke: the drive completed, the receipt never got written).
if (child.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch { /* group already gone */ } }
await sleep(600);
const swept = await sweepToZero();
try { fixtureServer.closeAllConnections(); } catch { /* node <18: close() still returns */ }
const fixtureClosed = new Promise((resolve) => fixtureServer.close(() => resolve()));
await Promise.race([fixtureClosed, sleep(2000)]);
const portProbes = {
  fixture: await probePort(fixturePort),
  devtools: devPort ? await probePort(devPort) : 'not-launched',
};
receipt.teardown = { postKillSweepCount: swept.postKillSweepCount, survivors: swept.survivors, portProbes };
if (swept.postKillSweepCount !== 0 || swept.survivors.length !== 0) fail('teardown-survivor', JSON.stringify(swept));
if (portProbes.fixture !== 'closed' || (devPort && portProbes.devtools !== 'closed')) fail('teardown-port-open', JSON.stringify(portProbes));
writeServerLog();

// --- predicate: every witness true, keyed sweep empty, ports closed -------
const cd = receipt.controlDomain;
const form = receipt.journey.form;
const f2 = receipt.journey.form2;
const cap = form.capsLockLeg;
const shift = form.shiftTrace;
const chord = form.chordLeg;
const swLeg = form.swallowLeg;
const swallowControlValue = swallowSubject.controlChars.join('');
const capsTypedValue = swallowControlValue + capsSubject.letters.join('');
const expectedShiftEvents = [...mixed].reduce((a, ch) => a + (/[A-Z]/.test(ch) ? 4 : 2), 0);
const witness = {
  plainTrace: receipt.plainTrace.entries.length === nonce.length
    && receipt.plainTrace.entries.every((e, i) => e.char === nonce[i] && e.valueAfter === nonce.slice(0, i + 1)),
  end: cd.end.negativeWitness === true && cd.end.valueAfter === cd.end.valueBefore && cd.end.valueAfter === nonce,
  backspace: cd.backspace.valueBefore === nonce && cd.backspace.valueAfter === nonce.slice(0, -1),
  restore: cd.restore.valueAfter === nonce,
  tab: cd.tab.activeBefore === 'field' && cd.tab.activeAfter === 'field2',
  enter: cd.enter.submitted === true && cd.enter.serverSawField === nonce
    && cd.enter.serverSawField2 === mixed && cd.enter.focusedBeforeEnter === 'field2'
    && cd.enter.carriesField3 === false,
  keylog: receipt.keylog.length === 4 && receipt.keylog.window.end - receipt.keylog.window.start === 4,
  // The carried r57 `field3` witness moves by exactly the swallow leg's
  // control prefix and the r59 CapsLock leg's letters: the top-level reads
  // are taken at the SAME (pre-submit) point, which is now after both legs.
  // The r57 negative witness — #field3 EMPTY after the chord leg — stays
  // pinned where r57 put it.
  field3: receipt.field3Value === capsTypedValue && receipt.field3Final === capsTypedValue
    && chord.field3ValueAfter === '',
  // the r59 measured-negative delivery boundary: the CapsLock and letter
  // events DELIVER with their full shape while getModifierState('CapsLock')
  // reads FALSE on every one of them. The expectation is named in the
  // receipt; any true is a finding.
  capsLock: receipt.capsLatchExpected === false
    && cap.capsLatchExpected === false
    && cap.capsLatchOk === true
    && cap.capsLatchObservedAllFalse === true
    && cap.anyCapsTrue === false
    && cap.prefixOk === true
    && cap.press1.capsKeydown === false && cap.press1.capsKeyup === false
    && cap.press2.capsKeydown === false && cap.press2.capsKeyup === false
    && cap.letters1.length === 2 && cap.letters2.length === 2
    && cap.letters1.every((e) => e && e.capsLock === false && e.cancelable === true && e.defaultPrevented === false)
    && cap.letters2.every((e) => e && e.capsLock === false && e.cancelable === true && e.defaultPrevented === false)
    && cap.trace.length > 0 && cap.trace.every((t) => t && t.capsLock === false)
    && cap.trace.every((t) => t && t.shift === false)
    && cap.latch.allFalse === true && cap.latch.anyTrue === false
    && receipt.capslockTrace.capsLatchOk === true,
  // R1: the detector-positive differential; a dead recorder would read false
  // on the Shift chord too, so this must be green for the absence to count.
  shiftDetector: form.shiftDetector.ok === true
    && form.shiftDetector.differential === true
    && form.shiftDetector.allGetModifierStateShiftTrue === true
    && form.shiftDetector.capsLegAllGetModifierStateShiftFalse === true,
  // the routed D4 positive control: the SAME chord on a page without the
  // swallower DOES submit, exactly once, client- and server-witnessed.
  form2: f2.submitted === true
    && f2.typed.value === nonce
    && f2.focus.activeBefore === 'field'
    && f2.noSwallowerLive === true
    && f2.chord.bothKeydownsDelivered === true && f2.chord.enterModifiers === 2
    && f2.echo2.submitted === true && f2.echo2.count === 1
    && f2.echo2.field === nonce && f2.echo2.field3Param === 'absent'
    && f2.echoPage.field === nonce && f2.echoPage.field2 === ''
    && f2.echoPage.field3Param === 'absent'
    && receipt.echo2Witness.submitted === true
    && receipt.echo2Witness.requestCount === 1
    && receipt.echo2Witness.clientPath === '/echo2',
  shift: shift.allPrefixTrue === true && shift.allFieldUnchanged === true && shift.ridesPresent === true
    && shift.field2ValueAfterTyping === mixed && shift.fieldValueAfterTyping === nonce
    && shift.keyEventCount === expectedShiftEvents
    && shift.typing.length === mixed.length
    && shift.typing.filter((e) => e.shiftRide).length === [...mixed].filter((ch) => /[A-Z]/.test(ch)).length,
  chordLeg: chord.chords.length === CHORD_MODS.length && chord.keyEventCount === 12
    && chord.booleansMatch === true && chord.field3ValueAfter === ''
    && chord.letter === chordLetter && chord.keylogLengthAfter - chord.keylogLengthBefore === 6,
  // the r58 swallow domain: s1 inserts unprevented, s2/s3 are delivered but
  // prevented and leave the value unchanged, s4's chord is delivered with
  // bit 2 and prevented and submits nothing, and the gate is OFF again.
  swallow: swLeg.focusBefore === 'field3'
    && JSON.stringify(swLeg.control.typed) === JSON.stringify(swallowSubject.controlChars)
    && swLeg.control.valueBefore === ''
    && swLeg.control.valueAfter === swallowControlValue
    && swLeg.control.defaultPrevented === false
    && swLeg.control.keylog.length === 2
    && swLeg.control.keylog.every((e) => e && e.cancelable === true && e.defaultPrevented === false)
    && swLeg.backspaceSwallow.swallowOn === true
    && JSON.stringify(swLeg.backspaceSwallow.swallowSet) === JSON.stringify(['Backspace'])
    && swLeg.backspaceSwallow.keylogEntry !== null
    && swLeg.backspaceSwallow.cancelable === true
    && swLeg.backspaceSwallow.defaultPrevented === true
    && swLeg.backspaceSwallow.valueBefore === swallowControlValue
    && swLeg.backspaceSwallow.valueAfter === swallowControlValue
    && swLeg.digitSwallow.swallowOn === true
    && JSON.stringify(swLeg.digitSwallow.swallowSet) === JSON.stringify([swallowSubject.thirdChar])
    && swLeg.digitSwallow.keylogEntry !== null
    && swLeg.digitSwallow.cancelable === true
    && swLeg.digitSwallow.defaultPrevented === true
    && swLeg.digitSwallow.valueBefore === swallowControlValue
    && swLeg.digitSwallow.valueAfter === swallowControlValue
    && swLeg.enterChordSwallow.swallowOn === true
    && JSON.stringify(swLeg.enterChordSwallow.swallowSet) === JSON.stringify(['Enter'])
    && swLeg.enterChordSwallow.bothKeydownsDelivered === true
    && swLeg.enterChordSwallow.ctrlKeylogEntry !== null
    && swLeg.enterChordSwallow.enterKeylogEntry !== null
    && swLeg.enterChordSwallow.enterModifiers === 2
    && swLeg.enterChordSwallow.defaultPrevented === true
    && swLeg.enterChordSwallow.submitted === false
    && swLeg.enterChordSwallow.newRequests.filter((r) => r.path === '/echo').length === 0
    && swLeg.enterChordSwallow.valueAfter === swallowControlValue
    && swLeg.restore.pageGate !== null
    && swLeg.restore.pageGate.on === false && swLeg.restore.pageGate.set.length === 0,
  fixtureDelta: receipt.fixtureDelta.witness.allCarryAdditiveFields === true
    && receipt.fixtureDelta.witness.allCarryCapsFlag === true
    && receipt.fixtureDelta.witness.allCarryShiftFlag === true
    && receipt.fixtureDelta.witness.keylogEntries > 0
    && receipt.fixtureDelta.witness.keylogFullEntries > 0,
  // exactly ONE /echo request in the fixture server's OWN log, carrying both
  // named fields and no field3: the one-submission witness.
  serverRequests: (() => {
    if (!Array.isArray(form.serverRequests)) return false;
    const echoReqs = form.serverRequests.filter((r) => r.path === '/echo');
    if (echoReqs.length !== 1) return false;
    const q = new URLSearchParams(echoReqs[0].query);
    return q.get('field') === nonce && q.get('field2') === mixed
      && !q.has('field3') && Array.from(q.keys()).length === 2;
  })(),
  // exactly ONE /echo2 request, carrying form2's field and no field3
  serverRequests2: (() => {
    if (!Array.isArray(form.serverRequests)) return false;
    const echo2Reqs = form.serverRequests.filter((r) => r.path === '/echo2');
    if (echo2Reqs.length !== 1) return false;
    const q = new URLSearchParams(echo2Reqs[0].query);
    return q.get('field') === nonce && !q.has('field3');
  })(),
  pageKeylog: form.keylogMatchesPlan === true
    && form.pageKeylogKeydownCount === form.expectedKeylogLength,
  nonceOnPage: form.nonceOnPage === true,
  fixtureContract: receipt.fixture.contract.ok === true && receipt.fixture.field3Name === null
    && receipt.fixture.form2Contract.ok === true,
  steps: steps.length === ALL_PNG_NAMES.length && steps.every((s, i) => s.name === ALL_PNG_NAMES[i]),
  // exactly the eighteen declared evidence PNGs, each written once
  declaredShots: shotLog.length === ALL_PNG_NAMES.length
    && ALL_PNG_NAMES.every((n) => shotLog.filter((s) => s.name === n).length === 1)
    && JSON.stringify(receipt.declaredStepNames) === JSON.stringify(ALL_PNG_NAMES),
  serverLogEcho: serverLog.filter((r) => r.path === '/echo').length === 1,
  serverLogEcho2: serverLog.filter((r) => r.path === '/echo2').length === 1,
  launchBound: midRunCount >= 1,
  teardown: receipt.teardown.postKillSweepCount === 0 && receipt.teardown.survivors.length === 0
    && portProbes.fixture === 'closed' && (!devPort || portProbes.devtools === 'closed'),
};
receipt.predicate = Object.values(witness).every((v) => v === true) && failures.length === 0;

// re-snapshot the server's log into the receipt's journey (the committed
// one-submission bytes) immediately before the write
if (receipt.journey && receipt.journey.form) {
  receipt.journey.form.serverRequests = serverLog.map((r) => ({ path: r.path, query: String(r.query) }));
}

fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));

console.log(JSON.stringify({
  schema: SCHEMA,
  predicate: receipt.predicate,
  nonce,
  chromium: receipt.host.chromium,
  launchToken,
  driveRan,
  legOrder: receipt.legOrder,
  sweeps: { preLaunch: preLaunch.pids.length, midRun: midRunCount, postKill: receipt.teardown.postKillSweepCount },
  portProbes,
  plainTraceLength: receipt.plainTrace.entries.length,
  keylog: receipt.keylog.window,
  controlDomain: cd,
  shiftTrace: {
    entries: shift.typing.length,
    keyEventCount: shift.keyEventCount,
    field2ValueAfterTyping: shift.field2ValueAfterTyping,
    allPrefixTrue: shift.allPrefixTrue,
    allFieldUnchanged: shift.allFieldUnchanged,
    ridesPresent: shift.ridesPresent,
  },
  shiftDetector: form.shiftDetector,
  chordLeg: {
    letter: chord.letter,
    hexTail: chord.hexTail,
    keyEventCount: chord.keyEventCount,
    keylogSpan: (chord.keylogLengthAfter === null || chord.keylogLengthBefore === null) ? null : chord.keylogLengthAfter - chord.keylogLengthBefore,
    field3ValueAfter: chord.field3ValueAfter,
    booleansMatch: chord.booleansMatch,
    chords: chord.chords.map((c) => ({ name: c.name, bit: c.bit, dom: c.domEvents })),
  },
  pageKeylog: { page: receipt.journey.form.pageKeylog.length, expected: receipt.journey.form.expectedKeylogLength, matches: receipt.journey.form.keylogMatchesPlan },
  swallowLeg: {
    control: {
      typed: swLeg.control.typed, valueAfter: swLeg.control.valueAfter,
      defaultPrevented: swLeg.control.defaultPrevented,
      keylog: swLeg.control.keylog.map((e) => e && ({ key: e.key, cancelable: e.cancelable, defaultPrevented: e.defaultPrevented })),
    },
    backspaceSwallow: {
      cancelable: swLeg.backspaceSwallow.cancelable, defaultPrevented: swLeg.backspaceSwallow.defaultPrevented,
      valueBefore: swLeg.backspaceSwallow.valueBefore, valueAfter: swLeg.backspaceSwallow.valueAfter,
    },
    digitSwallow: {
      char: swLeg.digitSwallow.char, cancelable: swLeg.digitSwallow.cancelable,
      defaultPrevented: swLeg.digitSwallow.defaultPrevented,
      valueBefore: swLeg.digitSwallow.valueBefore, valueAfter: swLeg.digitSwallow.valueAfter,
    },
    enterChordSwallow: {
      bothKeydownsDelivered: swLeg.enterChordSwallow.bothKeydownsDelivered,
      enterModifiers: swLeg.enterChordSwallow.enterModifiers,
      defaultPrevented: swLeg.enterChordSwallow.defaultPrevented,
      submitted: swLeg.enterChordSwallow.submitted,
      newRequests: swLeg.enterChordSwallow.newRequests,
      valueAfter: swLeg.enterChordSwallow.valueAfter,
    },
    restore: swLeg.restore.pageGate,
  },
  fixtureDelta: receipt.fixtureDelta,
  capslockTrace: {
    expected: receipt.capsLatchExpected,
    target: cap.target,
    letters: cap.letters,
    valueBefore: cap.valueBefore,
    valueAfter: cap.valueAfter,
    prefixOk: cap.prefixOk,
    latch: cap.latch,
    capsLatchOk: cap.capsLatchOk,
    traceEntries: cap.trace.length,
    press1: { capsKeydown: cap.press1.capsKeydown, capsKeyup: cap.press1.capsKeyup },
    press2: { capsKeydown: cap.press2.capsKeydown, capsKeyup: cap.press2.capsKeyup },
  },
  form2: {
    submitted: f2.submitted,
    typed: f2.typed.value,
    focus: f2.focus.activeBefore,
    noSwallowerLive: f2.noSwallowerLive,
    chord: { bothKeydownsDelivered: f2.chord.bothKeydownsDelivered, enterModifiers: f2.chord.enterModifiers, domEvents: f2.chord.domEvents },
    echo2: f2.echo2,
    echoPage: f2.echoPage,
  },
  echo2Witness: receipt.echo2Witness,
  declaredStepNames: receipt.declaredStepNames,
  serverRequests: form.serverRequests,
  field3Final: receipt.field3Final,
  steps: steps.map((s) => ({ name: s.name, bytes: s.bytes })),
  serverLog: serverLog.map((r) => ({ path: r.path, query: r.query.slice(0, 80) })),
  witness,
  failures,
  receipt: outReceipt,
}, null, 1));

process.exit(receipt.predicate ? 0 : 1);
