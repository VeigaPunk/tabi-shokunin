// R59MutCounter: independent r59 receipt builder.
// Constructs a receipt for schema tabi-chrome-cdp-r59 from the r58 committed
// receipt SHAPE (round-58 fixtures green-synthetic) plus the r59 domains
// documented in the round-59 counter header: the 18-step plan, the CapsLock
// delivery-boundary leg (constant-false absence witness + Shift detector
// positive), form2/echo2, and the D1 page-vs-block triples.
//
// OWN nonce, OWN PNG bytes, OWN stub driver, OWN host token: nothing is copied
// from the counter's fixtures. `--forge` applies ONE forgery on top of the
// base; the base must green, the forged variant must refuse with the named id.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const OUT = opt('out', '/fast/scratch/hyaku/tabi-r59/R59MutCounter/forge');
const FORGE = opt('forge', 'none');
const NONCE = 'tabi-r59-a1b2c3d4e5f6';
const TAIL = NONCE.split('-')[2];
const PREFIX = TAIL.slice(0, 2);
const D1 = TAIL[0];
const D2 = TAIL[1];
const D3 = TAIL[2];
const HITS = (TAIL.match(/[a-f]/g) || []);
const LETTERS = [0, 1, 2, 3].map((i) => HITS[i % HITS.length]);
const CHORD_LETTER = HITS[0];
const MIXED = NONCE.toUpperCase();
const PLAN = ['a-start', 'b-typed', 'c-end-witness', 'd-backspace', 'e-tab', 'f-enter-echo',
  'g-shift-typed', 'h-chord-domain', 'i-swallow-control', 'j-swallow-backspace',
  'k-swallow-digit', 'l-swallow-enter', 'm-capslock-press1', 'n-capslock-letters1',
  'o-capslock-press2', 'p-capslock-letters2', 'q-form2-chord', 'r-form2-echo'];
const TOKEN = 'a1b2c3d4e5f6';
const ORIGIN = 'http://127.0.0.1:52741';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const noMods = { ctrlKey: false, altKey: false, metaKey: false, shiftKey: false };
const boolsFor = (bit) => ({ ctrlKey: bit === 2, altKey: bit === 1, metaKey: bit === 4, shiftKey: false });
const vkFor = (ch) => (/[0-9]/.test(ch) ? 48 + Number(ch) : /[a-zA-Z]/.test(ch) ? 65 + ch.toUpperCase().charCodeAt(0) - 65 : ch === '-' ? 189 : null);
const codeFor = (ch) => (/[0-9]/.test(ch) ? 'Digit' + ch : /[a-zA-Z]/.test(ch) ? 'Key' + ch.toUpperCase() : ch === '-' ? 'Minus' : null);
const bitOf = (b) => (b.altKey ? 1 : 0) | (b.ctrlKey ? 2 : 0) | (b.metaKey ? 4 : 0) | (b.shiftKey ? 8 : 0);

fs.mkdirSync(OUT, { recursive: true });

// --- 18 step PNGs (own bytes, own hashes) --------------------------------
function mkPng(i) {
  const w = 8; const h = 8;
  const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const body = Buffer.concat([Buffer.from(t, 'latin1'), d]); const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32 ? zlib.crc32(body) >>> 0 : 0); return Buffer.concat([len, body, crc]); };
  // zlib.crc32 exists in node >= 22; fall back to a manual crc32 table otherwise
  const crc32 = (buf) => {
    let c; const table = [];
    for (let n = 0; n < 256; n += 1) { c = n; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
    let crc = 0xffffffff;
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  };
  const ch = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const body = Buffer.concat([Buffer.from(t, 'latin1'), d]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body)); return Buffer.concat([len, body, crc]); };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const row = Buffer.concat([Buffer.from([0]), Buffer.from([0x10 + (i % 60), 0x40, 0x80, 0xff])]);
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ch('IHDR', ihdr), ch('IDAT', zlib.deflateSync(raw)), ch('IEND', Buffer.alloc(0))]);
}
const stepFiles = [];
for (let i = 0; i < PLAN.length; i += 1) {
  const name = PLAN[i];
  const bytes = mkPng(i + 1);
  fs.writeFileSync(path.join(OUT, name + '.png'), bytes);
  stepFiles.push({ name, png: name + '.png', sha256: sha256(bytes), bytes: 1 });
}

// --- own stub driver -----------------------------------------------------
const driverPath = path.join(OUT, 'driver-stub-r59mut.mjs');
fs.writeFileSync(driverPath, '// R59MutCounter independent stub driver (byte identity pin only)\nexport const STUB = "r59mut-counter-forge";\n');
const driverSha = sha256(fs.readFileSync(driverPath));

// --- page keylog ---------------------------------------------------------
const page = [];
const mk = (type, o) => ({ type, cancelable: true, defaultPrevented: false, ...o, modifiers: o.modifiers !== undefined ? o.modifiers : bitOf(o), capsLock: false, shift: o.shiftKey === true });
const push = (o) => { page.push(mk('keyDown', o)); page.push(mk('keyUp', { ...o })); };
for (const ch of NONCE) push({ leg: 'plain', key: ch, code: codeFor(ch), keyCode: vkFor(ch), ...noMods, targetId: 'field' });
const ctlStart = page.length / 2;
push({ leg: 'control', key: 'End', code: 'End', keyCode: 35, ...noMods, targetId: 'field' });
push({ leg: 'control', key: 'Backspace', code: 'Backspace', keyCode: 8, ...noMods, targetId: 'field' });
push({ leg: 'control', key: NONCE[NONCE.length - 1], code: codeFor(NONCE[NONCE.length - 1]), keyCode: vkFor(NONCE[NONCE.length - 1]), ...noMods, targetId: 'field' });
push({ leg: 'control', key: 'Tab', code: 'Tab', keyCode: 9, ...noMods, targetId: 'field' });
for (const ch of MIXED) {
  const ride = /[A-Z]/.test(ch);
  const letter = { leg: 'shift', key: ch, code: codeFor(ch), keyCode: vkFor(ch), ...noMods, shiftKey: ride, targetId: 'field2' };
  if (ride) {
    // [Shift keyDown][letter keyDown][letter keyUp][Shift keyUp]
    const shift = { leg: 'shift', key: 'Shift', code: 'ShiftLeft', keyCode: 16, ...noMods, shiftKey: true, targetId: 'field2' };
    page.push(mk('keyDown', shift));
    page.push(mk('keyDown', letter));
    page.push(mk('keyUp', letter));
    page.push(mk('keyUp', shift));
  } else {
    push(letter);
  }
}
for (const cm of [{ key: 'Control', code: 'ControlLeft', vk: 17, bit: 2 }, { key: 'Alt', code: 'AltLeft', vk: 18, bit: 1 }, { key: 'Meta', code: 'MetaLeft', vk: 91, bit: 4 }]) {
  push({ leg: 'chord', key: cm.key, code: cm.code, keyCode: cm.vk, ...boolsFor(cm.bit), targetId: 'field3' });
  push({ leg: 'chord', key: CHORD_LETTER, code: 'Key' + CHORD_LETTER.toUpperCase(), keyCode: 65 + CHORD_LETTER.toUpperCase().charCodeAt(0) - 65, ...boolsFor(cm.bit), targetId: 'field3' });
}
// swallow continuation (gate off inserts d1,d2; gate on swallows bs, d3, Enter)
push({ leg: 'swallow', key: D1, code: codeFor(D1), keyCode: vkFor(D1), ...noMods, targetId: 'field3' });
push({ leg: 'swallow', key: D2, code: codeFor(D2), keyCode: vkFor(D2), ...noMods, targetId: 'field3' });
push({ leg: 'swallow', key: 'Backspace', code: 'Backspace', keyCode: 8, ...noMods, targetId: 'field3', defaultPrevented: true });
push({ leg: 'swallow', key: D3, code: codeFor(D3), keyCode: vkFor(D3), ...noMods, targetId: 'field3', defaultPrevented: true });
push({ leg: 'swallow', key: 'Control', code: 'ControlLeft', keyCode: 17, ...boolsFor(2), targetId: 'field3' });
push({ leg: 'swallow', key: 'Enter', code: 'Enter', keyCode: 13, ...boolsFor(2), targetId: 'field3', defaultPrevented: true });
// caps tail: CapsLock, l0, l1, CapsLock, l2, l3
const capSeq = ['CapsLock', LETTERS[0], LETTERS[1], 'CapsLock', LETTERS[2], LETTERS[3]];
const capsTailStart = page.filter((e) => e.type === 'keyDown').length;
for (const k of capSeq) {
  push({ leg: 'capslock', key: k, code: k === 'CapsLock' ? 'CapsLock' : codeFor(k), keyCode: k === 'CapsLock' ? 20 : vkFor(k), ...noMods, targetId: 'field3' });
}

const fieldValue = PREFIX + LETTERS.join('');

const letterEntry = (i) => ({
  char: LETTERS[i],
  key: LETTERS[i],
  code: codeFor(LETTERS[i]),
  windowsVirtualKeyCode: vkFor(LETTERS[i]),
  text: LETTERS[i],
  valueAfter: PREFIX + LETTERS.slice(0, i + 1).join(''),
  capsLock: false,
  type: 'keyDown',
  cancelable: true,
  defaultPrevented: false,
});
const pressEntry = (type) => ({
  type, key: 'CapsLock', code: 'CapsLock', keyCode: 20, modifiers: 0,
  cancelable: true, defaultPrevented: false, capsLock: false, shift: false,
  ...noMods, targetId: 'field3',
});
const capslockLeg = {
  target: 'field3',
  derivation: 'the [a-f] chars of the nonce hex tail in order, cycled to 4',
  letters: LETTERS.slice(),
  letters1: [letterEntry(0), letterEntry(1)],
  letters2: [letterEntry(2), letterEntry(3)],
  focusBefore: 'field3',
  valueBefore: PREFIX,
  press1: { key: 'CapsLock', code: 'CapsLock', windowsVirtualKeyCode: 20, keydownEntry: pressEntry('keyDown'), keyupEntry: pressEntry('keyUp'), valueAfter: PREFIX },
  press2: { key: 'CapsLock', code: 'CapsLock', windowsVirtualKeyCode: 20, keydownEntry: pressEntry('keyDown'), keyupEntry: pressEntry('keyUp'), valueAfter: PREFIX + LETTERS.slice(0, 2).join('') },
};
const latch = {
  expected: false,
  beforePress1: false, afterPress1: false, acrossLetters1: true,
  afterPress2: false, acrossLetters2: true,
  sequence: [false, false, false, false, false, false, false, false, false, false, false, false],
  anyTrue: false, allFalse: true,
};
const capslockTrace = {
  target: 'field3',
  derivation: capslockLeg.derivation,
  letters: LETTERS.slice(),
  letters1: capslockLeg.letters1,
  letters2: capslockLeg.letters2,
  press1: capslockLeg.press1,
  press2: capslockLeg.press2,
  beforePress1: false, afterPress1: false, acrossLetters1: true,
  afterPress2: false, acrossLetters2: true,
  latch,
  capsLatchOk: false,
};

// --- the shift trace -----------------------------------------------------
const typing = [];
[...MIXED].forEach((ch, i) => {
  const ride = /[A-Z]/.test(ch);
  const e = {
    i, char: ch, key: ch, code: codeFor(ch), windowsVirtualKeyCode: vkFor(ch),
    shiftRide: ride, modifiers: ride ? 8 : 0,
    valueAfter: MIXED.slice(0, i + 1), valueAfterField: NONCE,
  };
  if (ride) {
    e.ride = {
      keyDown: { key: 'Shift', code: 'ShiftLeft', keyCode: 16, modifiers: 8, shiftKey: true },
      keyUp: { key: 'Shift', code: 'ShiftLeft', keyCode: 16, modifiers: 8, shiftKey: true },
    };
  }
  typing.push(e);
});

// --- chord leg -----------------------------------------------------------
const chordLeg = {
  derivation: 'first [a-f] char of the nonce hex tail',
  hexTail: TAIL,
  letter: CHORD_LETTER,
  letterCode: 'Key' + CHORD_LETTER.toUpperCase(),
  letterWindowsVirtualKeyCode: 65 + CHORD_LETTER.toUpperCase().charCodeAt(0) - 65,
  field3TargetId: 'field3',
  chords: [
    { key: 'Control', code: 'ControlLeft', vk: 17, bit: 2 },
    { key: 'Alt', code: 'AltLeft', vk: 18, bit: 1 },
    { key: 'Meta', code: 'MetaLeft', vk: 91, bit: 4 },
  ].map((cm) => ({
    name: cm.key === 'Control' ? 'Control' : cm.key,
    bit: cm.bit,
    key: cm.key,
    code: cm.code,
    windowsVirtualKeyCode: cm.vk,
    keyEventsDispatched: 4,
    domEvents: [
      { key: cm.key, code: cm.code, keyCode: cm.vk, ...boolsFor(cm.bit) },
      { key: CHORD_LETTER, code: 'Key' + CHORD_LETTER.toUpperCase(), keyCode: 65 + CHORD_LETTER.toUpperCase().charCodeAt(0) - 65, ...boolsFor(cm.bit) },
    ],
  })),
  keyEventCount: 12,
  field3ValueAfter: '',
};

// --- swallow leg ---------------------------------------------------------
const swallowLeg = {
  control: {
    valueBefore: '',
    typed: PREFIX,
    valueAfter: PREFIX,
    defaultPrevented: false,
    keylogEntries: [D1, D2].map((ch) => ({
      type: 'keyDown', key: ch, code: codeFor(ch), keyCode: vkFor(ch), modifiers: 0,
      ...noMods, targetId: 'field3', cancelable: true, defaultPrevented: false,
    })),
  },
  backspaceSwallow: {
    valueBefore: PREFIX, valueAfter: PREFIX, defaultPrevented: true, cancelable: true,
    keylogEntry: { type: 'keyDown', key: 'Backspace', code: 'Backspace', keyCode: 8, modifiers: 0, ...noMods, targetId: 'field3', cancelable: true, defaultPrevented: true },
  },
  digitSwallow: {
    key: D3, valueBefore: PREFIX, valueAfter: PREFIX, defaultPrevented: true, cancelable: true,
    keylogEntry: { type: 'keyDown', key: D3, code: codeFor(D3), keyCode: vkFor(D3), modifiers: 0, ...noMods, targetId: 'field3', cancelable: true, defaultPrevented: true },
  },
  enterChordSwallow: {
    valueBefore: PREFIX, valueAfter: PREFIX, submitted: false,
    ctrlKeylogEntry: { type: 'keyDown', key: 'Control', code: 'ControlLeft', keyCode: 17, modifiers: 2, ...boolsFor(2), targetId: 'field3', cancelable: true, defaultPrevented: false },
    enterKeylogEntry: { type: 'keyDown', key: 'Enter', code: 'Enter', keyCode: 13, modifiers: 2, ...boolsFor(2), targetId: 'field3', cancelable: true, defaultPrevented: true },
  },
  restore: { swallowOn: false },
};

const form = {
  shiftTrace: { value: MIXED, valueBeforeFirstKey: '', valueAfterTyping: NONCE, field2ValueAfterTyping: MIXED, typing },
  chordLeg,
  field3NameAttribute: null,
  pageKeylog: page,
  swallowLeg,
  fixtureDelta: {
    swallower: 'capture-phase keydown listener registered BEFORE both r57 recorders',
    gate: 'window.__setSwallow(on, keys), idempotent; no URL/query/hash toggle',
    recorderFields: ['cancelable', 'defaultPrevented'],
    carried: 'every r57 recorder field and the r57 keylog plan shape unchanged',
    urlToggles: false,
  },
  serverRequests: [
    { path: '/echo', query: 'field=' + NONCE + '&field2=' + MIXED },
    { path: '/echo2', query: 'field=' + NONCE + '&field2=' },
  ],
  capsLockLeg: capslockLeg,
};

const form2 = {
  mechanism: 'dispatchKeyEvent+control-enter-submit',
  url: ORIGIN + '/form2',
  nonceOnPage: NONCE,
  fields: ['field', 'field2'],
  noSwallowerLive: true,
  focus: { target: 'field', activeBefore: 'field' },
  typed: { value: NONCE, entries: [], valueAfter: NONCE },
  chord: {
    name: 'Control', bit: 2, key: 'Control', code: 'ControlLeft', windowsVirtualKeyCode: 17,
    letterKeydown: { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
    events: [], domEvents: [],
  },
  serverRequestsBefore: 0,
  serverRequestsAfter: 1,
  newRequests: [{ path: '/form2', query: '' }, { path: '/echo2', query: 'field=' + NONCE + '&field2=' }],
  submitted: true,
  echo2: {
    submitted: true, count: 1, path: '/echo2', field: NONCE, field2: '',
    queryKeys: ['field', 'field2'], field3Param: 'absent', url: ORIGIN + '/echo2',
  },
  echoPage: { url: ORIGIN + '/echo2', field: NONCE, field2: '' },
};

// --- the receipt ---------------------------------------------------------
const rec = {
  schema: 'tabi-chrome-cdp-r59',
  nonce: NONCE,
  driverSha256: driverSha,
  host: {
    chromium: 'Chromium/155.0.8059.84',
    argv: [
      '/usr/bin/chromium', '--headless=new', '--remote-debugging-address=127.0.0.1',
      '--remote-debugging-port=0', '--user-data-dir=/fast/scratch/hyaku/tabi-r59/R59MutCounter/profile-' + TOKEN,
      '--no-first-run', '--disable-extensions',
    ],
    launchToken: TOKEN,
  },
  fixture: { formSha256: sha256(Buffer.from('r59mut-independent-fixture')), origin: ORIGIN },
  plainTrace: { entries: [...NONCE].map((ch, i) => ({ i, char: ch, valueAfter: NONCE.slice(0, i + 1) })) },
  controlDomain: {
    end: { valueBefore: NONCE, valueAfter: NONCE, negativeWitness: true },
    backspace: { valueBefore: NONCE, valueAfter: NONCE.slice(0, -1), expected: NONCE.slice(0, -1) },
    restore: { valueAfter: NONCE },
    tab: { activeBefore: 'field', activeAfter: 'field2' },
    enter: { submitted: true, serverSawField: NONCE, serverSawField2: MIXED },
  },
  keylog: {
    entries: [
      { key: 'End', code: 'End', keyCode: 35, ...noMods, targetId: 'field' },
      { key: 'Backspace', code: 'Backspace', keyCode: 8, ...noMods, targetId: 'field' },
      { key: NONCE[NONCE.length - 1], code: codeFor(NONCE[NONCE.length - 1]), keyCode: vkFor(NONCE[NONCE.length - 1]), ...noMods, targetId: 'field' },
      { key: 'Tab', code: 'Tab', keyCode: 9, ...noMods, targetId: 'field' },
    ],
    length: 4,
    window: { start: ctlStart, end: ctlStart + 4 },
  },
  serverLog: [
    { path: '/form', query: {} },
    { path: '/echo', query: { field: NONCE, field2: MIXED } },
    { path: '/echo2', query: 'field=' + NONCE + '&field2=' },
  ],
  field3Value: fieldValue,
  field3Final: fieldValue,
  steps: stepFiles,
  teardown: { postKillSweepCount: 0, survivors: [] },
  predicate: true,
  journey: { form, form2 },
  declaredStepNames: PLAN.slice(),
  capslockTrace,
  capsLatchExpected: false,
  echo2Witness: {
    submitted: true, requestCount: 1,
    serverRequests: [{ path: '/echo2', query: 'field=' + NONCE + '&field2=' }],
    clientPath: '/echo2', clientField: NONCE, clientField2: '', field3Param: 'absent',
    queryKeys: ['field', 'field2'],
  },
};

// --- the ONE forgery on top of the base ----------------------------------
const applied = [];
if (FORGE === 'f6-missing-cancelable') {
  // f6: the FIRST CapsLock keydown of the page tail carries no cancelable
  // field (delivered-shape tuple incomplete); everything else stays consistent.
  const at = rec.journey.form.pageKeylog.findIndex((e) => e.leg === 'capslock' && e.type === 'keyDown');
  delete rec.journey.form.pageKeylog[at].cancelable;
  applied.push({ forge: FORGE, at: 'journey.form.pageKeylog[' + at + '] (first capslock keydown)', change: 'delete cancelable' });
} else if (FORGE === 'f5-caps-true') {
  rec.journey.form.pageKeylog[0].capsLock = true;
  applied.push({ forge: FORGE, at: 'journey.form.pageKeylog[0].capsLock', change: 'false -> true' });
} else if (FORGE === 'f9-shift-constant-false') {
  // the constant-false recorder: every shift-held page entry records shift:false
  for (const e of rec.journey.form.pageKeylog) if (e.shiftKey === true) e.shift = false;
  applied.push({ forge: FORGE, at: 'journey.form.pageKeylog entries with shiftKey true', change: 'shift -> false' });
} else if (FORGE === 'f4-forged-page-flag') {
  // D1: the swallow block claims defaultPrevented true, the (forged) page record says false
  rec.journey.form.pageKeylog[page.findIndex((e) => e.leg === 'swallow' && e.key === 'Backspace')].defaultPrevented = false;
  applied.push({ forge: FORGE, at: 'journey.form.pageKeylog swallow Backspace', change: 'defaultPrevented true -> false' });
} else if (FORGE === 'f7-two-echo2') {
  rec.serverLog.push({ path: '/echo2', query: 'field=' + NONCE + '&field2=' });
  rec.journey.form.serverRequests.push({ path: '/echo2', query: 'field=' + NONCE + '&field2=' });
  applied.push({ forge: FORGE, at: 'serverLog + journey.form.serverRequests', change: 'second /echo2 row' });
} else if (FORGE === 'f1-schema') {
  rec.schema = 'tabi-chrome-cdp-r58';
  applied.push({ forge: FORGE, at: 'schema', change: 'tabi-chrome-cdp-r59 -> tabi-chrome-cdp-r58' });
} else if (FORGE === 'f2-step-reorder') {
  const a = rec.steps[6]; rec.steps[6] = rec.steps[7]; rec.steps[7] = a;
  applied.push({ forge: FORGE, at: 'steps[6]/steps[7]', change: 'swapped g-shift-typed and h-chord-domain' });
} else if (FORGE === 'f3-driver-sha') {
  rec.driverSha256 = '0'.repeat(64);
  applied.push({ forge: FORGE, at: 'driverSha256', change: 'pinned to 64 zeros' });
} else if (FORGE === 'f8-shot-set') {
  const b = rec.steps[1];
  rec.steps[0].png = b.png;
  rec.steps[0].sha256 = b.sha256;
  applied.push({ forge: FORGE, at: 'steps[0].png', change: 'a-start -> b-typed.png with its pin' });
} else if (FORGE !== 'none') {
  throw new Error('unknown forge ' + FORGE);
}

fs.writeFileSync(path.join(OUT, 'receipt.json'), JSON.stringify(rec, null, 1) + '\n');
console.log(JSON.stringify({ out: OUT, forge: FORGE, applied, nonce: NONCE, letters: LETTERS, fieldValue, pageEntries: page.length, capsTailStart, driverSha256: driverSha, driver: driverPath, receiptSha256: sha256(fs.readFileSync(path.join(OUT, 'receipt.json'))) }, null, 1));
