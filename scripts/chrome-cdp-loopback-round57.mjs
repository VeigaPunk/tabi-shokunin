#!/usr/bin/env node
// chrome-cdp-loopback-round57.mjs — tabi round 57, claim C2 runner
// (capability chromium-keyevent-modifier-chords-linux).
//
// Round 57 extends the FROZEN r56 bytes
// (scripts/chrome-cdp-loopback-round56.mjs, which is never edited) with the
// modifier-chord domain the r56 planned residual names. Everything r56
// witnessed is carried unchanged; the deltas are listed here, and nowhere
// else in the runner does behaviour differ from r56:
//
//   (1) RELABEL. schema tabi-chrome-cdp-r57, nonce tabi-r57-<12 hex>, the
//       fixture titles and the header. The nonce's 12-hex tail is
//       REGENERATED (bounded) whenever it carries no [a-f] letter, so the
//       chord-letter derivation below always has a subject.
//   (2) FIXTURE DELTA (the r56 fixture already carried #field, #field2,
//       #field3 and the inline keydown recorder; only what was missing is
//       added): the recorder additionally records the DOM's legacy
//       `keyCode` under the name `windowsVirtualKeyCode` (the DOM has no
//       windowVirtualKeyCode property — `KeyboardEvent.keyCode` IS the
//       Windows virtual key code value, so both names carry the same
//       number; the pair is recorded, never one inferred from the other);
//       the form page and the echo page carry a #nonce marker so the
//       invocation binding rides the data page itself; the echo page
//       reports whether the GET query carried a field3 parameter.
//   (3) NEW leg: the Shift-chord trace. The nonce UPPERCASED is typed into
//       #field2; every uppercase letter's keyDown/keyUp pair is
//       SURROUNDED by a real Shift keyDown/keyUp (letter event modifiers 8
//       per S153 and the shifted key/text; digits and '-' unshifted). BOTH
//       fields' DOM values are read back after EVERY keystroke — #field must
//       still hold the plain nonce, #field2 must hold the uppercased prefix
//       — and the page's own keydown record for the keystroke rides along.
//   (4) NEW leg: the chord domain. #field3 (NO name attribute, never
//       submitted) receives three real chords — Control (bit 2), Alt (1),
//       Meta (4) — on the nonce-derived letter (the first [a-f] of the
//       nonce's hex tail): modifier keyDown, letter keyDown with NO text
//       param, letter keyUp, modifier keyUp. The page's keylog records the
//       two delivered keydowns per chord; the CDP modifier bit <-> DOM
//       boolean correspondence (2<->ctrlKey, 1<->altKey, 4<->metaKey,
//       shiftKey false) is checked against them. #field3's DOM value staying
//       EMPTY is the negative witness; its absence from the submitted query
//       is the server-side one.
//   (5) LEG ORDER. The enumerated legs are plain trace -> control legs ->
//       shift trace -> chord domain -> submit. The r56 Enter leg (ONE
//       keyDown, text '\r', implicit submission of the form) is PHYSICALLY
//       LAST and is dispatched from a re-focused #field2: this round's
//       frozen C2 requires the single submission to carry BOTH `field` and
//       `field2`, so the submission cannot precede the field2 fill. The
//       JSON order of the r56 steps array is unchanged (r56 step names, r56
//       order); the two new legs' PNGs are recorded in stepsExtended and
//       journey.form.shots. That asymmetry is DISCLOSED, not hidden.
//   (6) TEARDOWN gains PORT PROBES: after the keyed PID-group kill and the
//       /proc sweep reach zero survivors, the fixture port and the DevTools
//       port must refuse a connect.
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
//   node scripts/chrome-cdp-loopback-round57.mjs --scratch <ABS dir> --out <ABS receipt.json> [--chromium <ABS bin>]
//   node scripts/chrome-cdp-loopback-round57.mjs --path-selftest
//
// Exit: 0 predicate true; 1 predicate false (the receipt IS still written, so
// a red run is committable evidence); 2 usage / environment precondition /
// fixture-contract failure (nothing spawned, no receipt).
// Writes: everything under --scratch (server-log.json, profile-<token>/),
// plus the receipt and the eight step PNGs inside dirname(--out).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-r57';
const SELF = fileURLToPath(import.meta.url);
const DEFAULT_CHROMIUM = '/usr/bin/chromium';
const DEFAULT_PROFILE_ROOT = path.join(os.homedir(), '.config', 'chromium');
// The r56 step array is kept byte-for-byte in name and order (its counter
// pins it); the two new legs' evidence files ride beside it.
const STEP_NAMES = ['a-start', 'b-typed', 'c-end-witness', 'd-backspace', 'e-tab', 'f-enter-echo'];
const SHOT_NAMES = ['g-shift-typed', 'h-chord-domain'];
const ALL_PNG_NAMES = [...STEP_NAMES, ...SHOT_NAMES];
const ENTER_TIMEOUT_MS = 5000; // the frozen C2 kill rule: "no submit request within 5 s"
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
// ('tabi-r57-' + 12 lowercase hex: a-z, 0-9, '-'), and for the UPPERCASED
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
// third dash-separated field of 'tabi-r57-<hex>'). null when the tail carries
// none — the live path regenerates the nonce so the derivation always has a
// subject; the selftest asserts both branches.
function deriveChordLetter(nonceValue) {
  const tail = String(nonceValue).split('-')[2] || '';
  const m = /([a-f])/.exec(tail);
  return m ? m[1] : null;
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
  const res = {
    field: Boolean(tagField) && nameOf(tagField) === 'field',
    field2: Boolean(tagField2) && nameOf(tagField2) === 'field2',
    field3: Boolean(tagField3),
    field3Name: nameOf(tagField3),
    recorder: /window\.__keylog\s*=\s*\[\]/.test(s) && /addEventListener\(\s*'keydown'/.test(s),
  };
  res.missing = [];
  if (!res.field) res.missing.push('field');
  if (!res.field2) res.missing.push('field2');
  if (!res.field3) res.missing.push('field3');
  if (res.field3 && res.field3Name !== null) res.missing.push('field3-carries-name:' + res.field3Name);
  if (!res.recorder) res.missing.push('keylog-recorder');
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
// nonce and the fixture's control/cord constants. The counter re-derives the
// same plan independently from the receipt's own nonce; this copy only makes
// the RUN fail loudly when the page's record disagrees with what was
// dispatched.
function expectedKeylogPlan(nonceValue, mixed, chordLetter) {
  const plan = [];
  const plain = { ctrlKey: false, altKey: false, metaKey: false, shiftKey: false };
  for (const ch of nonceValue) plan.push({ key: ch, code: codeFor(ch), keyCode: vkFor(ch), ...plain });
  const rCh = nonceValue[nonceValue.length - 1];
  plan.push({ key: 'End', code: 'End', keyCode: 35, ...plain });
  plan.push({ key: 'Backspace', code: 'Backspace', keyCode: 8, ...plain });
  plan.push({ key: rCh, code: codeFor(rCh), keyCode: vkFor(rCh), ...plain });
  plan.push({ key: 'Tab', code: 'Tab', keyCode: 9, ...plain });
  for (const ch of mixed) {
    const ride = /[A-Z]/.test(ch);
    if (ride) plan.push({ key: 'Shift', code: 'ShiftLeft', keyCode: 16, ctrlKey: false, altKey: false, metaKey: false, shiftKey: true });
    plan.push({ key: ch, code: codeForMixed(ch), keyCode: vkForMixed(ch), ctrlKey: false, altKey: false, metaKey: false, shiftKey: ride });
  }
  const chordLetterCode = 'Key' + chordLetter.toUpperCase();
  const chordLetterVk = 65 + (chordLetter.charCodeAt(0) - 97);
  for (const cm of CHORD_MODS) {
    const bools = chordBoolFor(cm.bit);
    plan.push({ key: cm.key, code: cm.code, keyCode: cm.vk, ...bools });
    plan.push({ key: chordLetter, code: chordLetterCode, keyCode: chordLetterVk, ...bools });
  }
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
  const abs = path.join(os.tmpdir(), 'tabi-r57-selftest');
  // 1 — relative scratch refused
  t('relative-scratch-refused', () => refuses(() => validateScratch('rel/scratch'), 'relative scratch'));
  // 2 — relative out refused
  t('relative-out-refused', () => refuses(() => validateOut('out/receipt.json'), 'relative out'));
  // 3 — out inside /tmp allowed
  t('out-inside-tmp-allowed', () => {
    const r = validateOut(path.join(os.tmpdir(), 'tabi-r57-selftest', 'receipt.json'));
    if (!isAbsNative(r)) throw new PathError('tmp out not absolute: ' + r);
    if (norm(r) !== norm(path.join(os.tmpdir(), 'tabi-r57-selftest', 'receipt.json'))) throw new PathError('tmp out relocated: ' + r);
  });
  // 4 — the six r56 PNG names in their frozen order, then the two new legs
  t('png-names-fixed', () => {
    const got = ALL_PNG_NAMES.map(pngNameFor);
    const want = ['a-start.png', 'b-typed.png', 'c-end-witness.png', 'd-backspace.png',
      'e-tab.png', 'f-enter-echo.png', 'g-shift-typed.png', 'h-chord-domain.png'];
    if (JSON.stringify(got) !== JSON.stringify(want)) throw new PathError('png names drifted: ' + JSON.stringify(got));
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
    if (deriveChordLetter('tabi-r57-00a1b2c3d4e5') !== 'a') throw new PathError('first [a-f] not derived');
    if (deriveChordLetter('tabi-r57-0123456789ab') !== 'a') throw new PathError('derivation missed a later [a-f]');
    if (deriveChordLetter('tabi-r57-012345678909') !== null) throw new PathError('a digit-only tail produced a letter');
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
const FIXTURE_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r57 form fixture</title>
<script>
window.__keylog = [];
document.addEventListener('keydown', function (e) {
  window.__keylog.push({ key: e.key, code: e.code, keyCode: e.keyCode,
    windowsVirtualKeyCode: e.keyCode,
    ctrlKey: e.ctrlKey === true, altKey: e.altKey === true,
    metaKey: e.metaKey === true, shiftKey: e.shiftKey === true,
    targetId: (e.target && (e.target.id || e.target.tagName)) || null });
}, true);
// The FULL record (r57): keydown AND keyup, with the S153 modifier mirror
// computed from the DOM booleans (alt1|ctrl2|meta4|shift8). Separate from the
// r56 keydown-only recorder above, whose fields and window are unchanged.
window.__keylogFull = [];
(function () {
  function rec(e) {
    window.__keylogFull.push({
      type: e.type === 'keydown' ? 'keyDown' : 'keyUp',
      key: e.key, code: e.code, keyCode: e.keyCode,
      modifiers: (e.altKey ? 1 : 0) | (e.ctrlKey ? 2 : 0) | (e.metaKey ? 4 : 0) | (e.shiftKey ? 8 : 0),
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

// The r57 nonce: 'tabi-r57-' + 12 lowercase hex. Regenerated (bounded) while
// the hex tail carries no [a-f] letter, because the chord-domain leg's
// derivation subject (the first [a-f] of the hex tail) must exist for the
// frozen C2 witness to be non-vacuous.
let nonceHex = '';
for (let i = 0; i < 1000 && !nonceHex; i++) {
  const h = crypto.randomBytes(6).toString('hex');
  if (/[a-f]/.test(h)) nonceHex = h;
}
if (!nonceHex) usage('could not draw a nonce whose hex tail carries an [a-f] letter');
const nonce = 'tabi-r57-' + nonceHex;
const chordLetter = deriveChordLetter(nonce);
if (chordLetter === null) usage('internal: the drawn nonce has no chord letter');
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
// The served bytes are checked against the shared contract BEFORE a browser
// exists: a fixture that cannot witness the legs is an authoring failure, not
// a red run (the code exits 2 with the diagnosis).
const fixtureCheck = fixtureContract(FORM_HTML);
if (!fixtureCheck.ok) {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'fixture-contract', contract: fixtureCheck }));
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
  if (u.pathname === '/echo') {
    // the SERVER-SIDE witness: the received values are rendered back, so the
    // client DOM and the server log carry the same facts independently. The
    // field3 marker witnesses that the never-named field cannot ride.
    const field = u.searchParams.get('field') || '';
    const field2 = u.searchParams.get('field2') || '';
    return html(`<!doctype html><html><head><meta charset="utf-8"><title>tabi-r57 echo</title></head>
<body><h1 id="pg">echo</h1><p id="nonce">${nonce}</p>
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
// --- r57 additions (field3Final, legOrder, journey, stepsExtended)     ---
const steps = [];
// chronological evidence log across every leg (r56 steps + the two new ones)
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
    origin,
    contract: fixtureCheck,
    fields: [],
    field3Name: null,
    field3NameAttribute: null,
  },
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
  legOrder: ['plain-trace', 'end', 'backspace', 'restore', 'tab', 'shift-trace', 'chord-leg', 'enter-submit'],
  journey: {
    form: {
      mechanism: 'dispatchKeyEvent+shift-chords+chord-domain+enter-submit',
      nonceOnPage: false,
      fields: [],
      shots: [],
      field3NameAttribute: null,
      shiftTrace: {
        target: 'field2', value: mixed, valueBeforeFirstKey: null, focusBefore: null,
        typing: [], keyEventCount: 0, field2ValueAfterTyping: null, fieldValueAfterTyping: null,
        allPrefixTrue: false, allFieldUnchanged: false, ridesPresent: false,
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
      pageKeylog: [],
      expectedKeylogLength: -1,
      keylogMatchesPlan: false,
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

    // Every evidence step writes its PNG next to the receipt; the r56 steps
    // array is assembled from this log in the FROZEN r56 order, and the full
    // chronological log is stepsExtended.
    const capture = async (stepName) => {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      if (!shot.result || !shot.result.data) throw new Error('captureScreenshot: ' + JSON.stringify(shot).slice(0, 200));
      const buf = Buffer.from(shot.result.data, 'base64');
      const name = pngNameFor(stepName);
      fs.writeFileSync(path.join(outDir, name), buf);
      const rec = { name: stepName, png: name, sha256: sha256(buf), bytes: buf.length };
      shotLog.push(rec);
      return rec;
    };
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

    // the page's COMPLETE keydown+keyup record of the run, read BEFORE the
    // Enter dispatch (the submission navigates the document and the recorder
    // dies with it — the r56 disclosure, carried unchanged)
    const fullKeylog = await evalJSON('JSON.stringify(window.__keylogFull)');
    form.pageKeylog = Array.isArray(fullKeylog) ? fullKeylog : [];
    receipt.field3Value = await fieldValue('field3');
    receipt.field3Final = await fieldValue('field3');
    form.field3NameAttribute = receipt.fixture.field3Name;
    const plan = expectedKeylogPlan(nonce, mixed, chordLetter);
    const klEq = (a, b) => !!a && !!b && a.key === b.key && a.code === b.code
      && a.ctrlKey === b.ctrlKey && a.altKey === b.altKey
      && a.metaKey === b.metaKey && a.shiftKey === b.shiftKey
      && a.keyCode === b.keyCode;
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
  } catch (e) {
    fail('drive-error', String((e && e.message) || e));
  } finally {
    try { if (ws) ws.close(); } catch {}
  }
}

// r56 steps array in the FROZEN r56 order (its counter pins the sequence);
// the full chronological evidence log is stepsExtended.
receipt.stepsExtended = shotLog.slice();
for (const n of STEP_NAMES) {
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
const shift = receipt.journey.form.shiftTrace;
const chord = receipt.journey.form.chordLeg;
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
  field3: receipt.field3Value === '' && receipt.field3Final === '',
  shift: shift.allPrefixTrue === true && shift.allFieldUnchanged === true && shift.ridesPresent === true
    && shift.field2ValueAfterTyping === mixed && shift.fieldValueAfterTyping === nonce
    && shift.keyEventCount === expectedShiftEvents
    && shift.typing.length === mixed.length
    && shift.typing.filter((e) => e.shiftRide).length === [...mixed].filter((ch) => /[A-Z]/.test(ch)).length,
  chordLeg: chord.chords.length === CHORD_MODS.length && chord.keyEventCount === 12
    && chord.booleansMatch === true && chord.field3ValueAfter === ''
    && chord.letter === chordLetter && chord.keylogLengthAfter - chord.keylogLengthBefore === 6,
  pageKeylog: receipt.journey.form.keylogMatchesPlan === true
    && receipt.journey.form.pageKeylogKeydownCount === receipt.journey.form.expectedKeylogLength,
  nonceOnPage: receipt.journey.form.nonceOnPage === true,
  fixtureContract: receipt.fixture.contract.ok === true && receipt.fixture.field3Name === null,
  steps: steps.length === STEP_NAMES.length && steps.every((s, i) => s.name === STEP_NAMES[i]),
  serverLogEcho: serverLog.filter((r) => r.path === '/echo').length === 1,
  launchBound: midRunCount >= 1,
  teardown: receipt.teardown.postKillSweepCount === 0 && receipt.teardown.survivors.length === 0
    && portProbes.fixture === 'closed' && (!devPort || portProbes.devtools === 'closed'),
};
receipt.predicate = Object.values(witness).every((v) => v === true) && failures.length === 0;

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
  field3Final: receipt.field3Final,
  steps: steps.map((s) => ({ name: s.name, bytes: s.bytes })),
  serverLog: serverLog.map((r) => ({ path: r.path, query: r.query.slice(0, 80) })),
  witness,
  failures,
  receipt: outReceipt,
}, null, 1));

process.exit(receipt.predicate ? 0 : 1);
