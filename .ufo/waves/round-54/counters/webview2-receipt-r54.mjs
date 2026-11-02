#!/usr/bin/env node
// webview2-receipt-r54.mjs — tabi round 54 counter for claim C2 (coverage:
// the r53 planned residual — the Ctrl/Alt/Meta modifier domain on the
// key-event trace, witnessed by the page's own DOM event record). Scores a
// webview2-cdp-loopback-round54 receipt and its screenshot bytes:
//   PREDICATE-SENTENCE: webview2-receipt-r54 admits a receipt where the
//   schema is tabi-webview2-cdp-r54, the browser identity matches /^Edg\//,
//   the DevTools websocket URL is 127.0.0.1 loopback, the compiled host is
//   webview2-host-round48.exe under an EdgeWebView Application/<version>
//   runtime folder, the recorded Edg identity equals the runtime folder's
//   version tail, the runtime folder's msedgewebview2.exe existence is
//   verified WHEN the folder exists on the scoring host (a folder present
//   but without its exe is the finding runtime-msedgewebview2-absent) and
//   is GRADED AS THE DECLARED could-not-evaluate CLASS
//   runtime-pin-host-drift (recorded under output.couldNotEvaluate, never
//   as a finding) WHEN the folder does not exist — WebView2 auto-update
//   removes fixed-version folders (r49 closure D3), so the receipt's OTHER
//   checks stay evaluated and the drift is disclosed by name — the profile
//   is a throwaway tabi-r54-wv2drv-<hex>-profile under the RESOLVED
//   scratch, receipt.paths records given-vs-resolved for --scratch/--out
//   with both resolved forms win32-absolute and the resolution applied at
//   launch, the discovery came via the profile's EBWebView
//   DevToolsActivePort with an explicit port, the recorded nonce equals the
//   live page title's echo and matches the tabi-r54-<16hex> shape, the host
//   reached ready, the committed screenshot bytes hash to the receipt sha
//   and carry the PNG magic, the keyed teardown reached postKillSweepCount
//   0, the driver and host-source digests equal the re-hashed committed
//   files — and, when receipt.journey is present, exactly six journey steps
//   with legs Page.navigate (/a.html), anchor-click (/b.html), anchor-click
//   (/c.html), navigateToHistoryEntry (/b.html), anchor-click (/form.html),
//   form-submit (/echo?field=<nonce>&mixed=<uppercased nonce>), all
//   same-port http://127.0.0.1 pages with present titles, nonceOnPageA
//   true, a history block read at /c.html with entriesLength 4,
//   currentIndex 3 and entry urls data:,/a.html,/b.html,/c.html, a back leg
//   with targetIndex 2 landing on /b.html with entriesLengthAfter 4 and
//   currentIndexAfter 2, per-step committed PNGs hashing to the per-step
//   pins, and the main shot equal to the FINAL step's capture — and, when
//   receipt.journey.form is present, the form block recording mechanism
//   dispatchKeyEvent+shift-chords+chord-domain+submit-click,
//   nonceOnFormPage true, valueBeforeFirstKey empty, the r52 plain typing[]
//   trace (re-derived from the nonce, per-keystroke prefix witnessed,
//   keyEventCount 2n), the r53 Shift-chord trace journey.form.chords
//   (re-derived: uppercase letter -> shiftRide true / modifiers 8, keyEvent
//   count 4 per shifted + 2 per unshifted character, per-keystroke prefix
//   witnessed, both echo witnesses), AND the round-54 chord-domain leg
//   journey.form.chordDomain: the letter derived from the nonce's own hex
//   tail (first [a-f] character), three chords — Control bit 2, Alt bit 1,
//   Meta bit 4 (S153's Input.dispatchKeyEvent modifiers bit field) — each
//   of 4 dispatched key events (modifier keyDown, letter keyDown with NO
//   text, letter keyUp, modifier keyUp), 12 total, whose per-chord page
//   records domEvents[0..1] the counter RE-DERIVES (the modifier's own
//   keydown and the letter's keydown, each carrying exactly the boolean
//   its bit must produce in the DOM — bit 2 <-> ctrlKey, bit 1 <-> altKey,
//   bit 4 <-> metaKey, shiftKey false; S161 grounds the DOM booleans), the
//   keylog window advancing by exactly 6 over the leg, #field3's DOM value
//   EMPTY after the chords (a modifier chord inserts nothing) — and
//   journey.form.pageKeylog, the page's own keydown record, EQUAL entry by
//   entry the complete sequence the counter re-derives from the receipt's
//   own nonce: every plain keyDown (key/code/VK per character, no
//   modifiers), every Shift chord keyDown (the Shift ride's own keydown
//   with shiftKey true, then the letter's with shiftKey true), every
//   chord-domain keyDown (the modifier's own keydown, then the letter's,
//   each with exactly its bit's boolean) — the CDP dispatch plan and the
//   DOM delivery witnessed INDEPENDENTLY and required to agree.
// Round-53 selftest layout pin (the r52 closure's routed harness note):
// the --selftest resolves its pinned driver/hostsrc five directories above
// the fixtures dir (<repoRoot>/.ufo/waves/round-54/counters/<fixtures>) —
// the layout expectation is now CHECKED at selftest start and a wrong
// layout dies exit 2 with the named error selftest-repo-root-layout
// instead of silently reporting per-case pin-file-unreadable.
// Declared residual (the r44/r45/r48/r49/r51/r52/r53 class, pre-declared):
// this counter binds receipt shape and committed bytes; it cannot by itself
// prove a browser ran — the re-derivation path is re-running the committed
// runner (fresh nonce and fresh fixture port per invocation) and
// re-compiling the host from the committed .cs. Second declared residual:
// when the pinned runtime folder is absent the runtime-existence leg is
// could-not-evaluate, so a hand-forged receipt naming a never-installed
// runtime version is refused only by the identity-consistency and shape
// checks, not by host bytes.
// Usage:
//   node webview2-receipt-r54.mjs <receipt.json> --shot <png> \
//        [--png-a <a.png> --png-b <b.png> --png-c <c.png>] \
//        --png-form <form.png> --png-echo <echo.png> \
//        --driver <mjs> --hostsrc <cs>
//   node webview2-receipt-r54.mjs --selftest <fixtures-dir>
// Exit: 0 predicate met; 1 evaluated, not met; 2 could not evaluate.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SCHEMA = 'tabi-webview2-cdp-r54';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-webview2-receipt-r54', error: msg }));
  process.exit(2);
}

function checkReceipt(receiptPath, shots, driverPath, hostSrcPath) {
  let receipt = null;
  try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch { die('receipt unreadable or unparseable'); }
  const findings = [];
  const couldNotEvaluate = [];
  const add = (id, detail) => findings.push({ id, detail });

  if (receipt.schema !== SCHEMA) add('schema', receipt.schema);
  const browser = (receipt.jsonVersion || {}).Browser;
  if (typeof browser !== 'string' || !/^Edg\//.test(browser)) add('surface-identity-mismatch', `webview2: ${browser}`);
  const wsUrl = (receipt.jsonVersion || {}).webSocketDebuggerUrl;
  if (typeof wsUrl !== 'string' || !/^ws:\/\/127\.0\.0\.1:\d+\//.test(wsUrl)) add('ws-not-loopback', wsUrl);
  if (typeof receipt.hostExe !== 'string' || !/[\\/]webview2-host-round48\.exe$/.test(receipt.hostExe)) {
    add('host-exe-not-webview2-host', receipt.hostExe);
  }
  const RUNTIME_SHAPE = /[\\/]EdgeWebView[\\/]Application[\\/](\d+\.\d+\.\d+\.\d+)$/;
  if (typeof receipt.runtimeFolder !== 'string' || !RUNTIME_SHAPE.test(receipt.runtimeFolder)) {
    add('runtime-folder-not-webview2', receipt.runtimeFolder);
  } else {
    const versionTail = RUNTIME_SHAPE.exec(receipt.runtimeFolder)[1];
    const browserVer = /^Edg\/(.+)$/.exec(typeof browser === 'string' ? browser : '');
    if (browserVer && browserVer[1] !== versionTail) add('runtime-identity-mismatch', `${browserVer[1]} != folder ${versionTail}`);
    let folderExists = false, exeExists = false;
    try { folderExists = fs.existsSync(receipt.runtimeFolder); } catch { folderExists = false; }
    if (folderExists) {
      try { exeExists = fs.existsSync(path.join(receipt.runtimeFolder, 'msedgewebview2.exe')); } catch { exeExists = false; }
      if (!exeExists) add('runtime-msedgewebview2-absent', receipt.runtimeFolder);
    } else {
      // the DECLARED could-not-evaluate class (r49 closure D3): the pinned
      // fixed-version folder was removed by WebView2 auto-update on the
      // scoring host; the check cannot run, is named here, and is NOT a
      // finding — every other check below still evaluates.
      couldNotEvaluate.push({ check: 'runtime-existence', code: 'runtime-pin-host-drift', detail: receipt.runtimeFolder });
    }
  }
  // --- the paths contract (carried from r49) ----------------------------------
  const paths = receipt.paths || {};
  const norm = (p) => String(p).toLowerCase().replace(/[\\/]+/g, '\\');
  if (typeof receipt.profile !== 'string' || !/[\\/]tabi-r54-wv2drv-[0-9a-f]+-profile$/.test(receipt.profile)) {
    add('profile-not-throwaway', receipt.profile);
  }
  if (!paths.scratchGiven || !paths.scratchResolved || !paths.outGiven || !paths.outResolved) {
    add('paths-block-missing', JSON.stringify(paths).slice(0, 120));
  } else {
    if (!path.win32.isAbsolute(paths.scratchResolved) || !path.win32.isAbsolute(paths.outResolved)) {
      add('paths-resolved-not-absolute', `${paths.scratchResolved} | ${paths.outResolved}`);
    }
    const givenRel = typeof paths.scratchGiven === 'string' && !path.win32.isAbsolute(paths.scratchGiven);
    if (/tabi-r54-wv2drv-[0-9a-f]+-profile$/.test(String(receipt.profile))
        && !norm(receipt.profile).startsWith(norm(paths.scratchResolved))) add('profile-outside-resolved-scratch', receipt.profile);
    if (givenRel) {
      if (paths.relInvocation !== true) add('relinvocation-flag', paths.relInvocation);
      if (norm(paths.scratchResolved) === norm(paths.scratchGiven)) add('paths-resolution-not-applied', paths.scratchResolved);
      const tail = norm(paths.scratchGiven).replace(/^\\/, '');
      if (!norm(paths.scratchResolved).endsWith(tail)) add('paths-tail-lost', `${paths.scratchGiven} -> ${paths.scratchResolved}`);
    } else if (typeof paths.scratchGiven === 'string') {
      if (path.win32.normalize(paths.scratchGiven).toLowerCase() !== path.win32.normalize(paths.scratchResolved).toLowerCase()) {
        add('paths-absolute-not-identity', `${paths.scratchGiven} -> ${paths.scratchResolved}`);
      }
    }
  }
  if ((receipt.discovery || {}).via !== 'devtools-active-port-webview-ebwebview') add('discovery-via', (receipt.discovery || {}).via);
  if (!/^\d+$/.test(String((receipt.discovery || {}).port ?? ''))) add('discovery-port', (receipt.discovery || {}).port);
  if (receipt.nonceEcho !== receipt.nonce) add('invocation-binding', `${receipt.nonceEcho} != ${receipt.nonce}`);
  if (!/^tabi-r54-[0-9a-f]{16}$/.test(receipt.nonce || '')) add('nonce-shape', receipt.nonce);
  if (receipt.hostReadySeen !== true) add('host-not-ready', receipt.hostReadySeen);
  if (receipt.invocationBound !== true) add('invocation-bound-flag', receipt.invocationBound);
  if ((receipt.teardown || {}).postKillSweepCount !== 0) add('teardown-survivors', JSON.stringify(receipt.teardown));
  for (const [pin, file, id] of [
    ['driverSha256', driverPath, 'driver-pin-mismatch'],
    ['hostCsSha256', hostSrcPath, 'hostsrc-pin-mismatch'],
  ]) {
    let digest = null;
    try { digest = sha256(fs.readFileSync(file)); } catch { add('pin-file-unreadable', file); }
    if (digest !== null && receipt[pin] !== digest) add(id, `${receipt[pin]} != ${digest}`);
  }
  if (!/^[0-9a-f]{64}$/.test(receipt.loaderSha256 || '')) add('loader-pin-shape', receipt.loaderSha256);
  if (!/^[0-9a-f]{64}$/.test(receipt.hostExeSha256 || '')) add('hostexe-pin-shape', receipt.hostExeSha256);
  let shot = null;
  try { shot = fs.readFileSync(shots.main); } catch { add('shot-unreadable', shots.main); }
  const pngMagic = (b) => b && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  if (shot) {
    const rec = receipt.screenshot || {};
    if (rec.sha256 !== sha256(shot)) add('shot-digest-mismatch', `${rec.sha256} != ${sha256(shot)}`);
    if (rec.bytes !== shot.length) add('shot-length-mismatch', `${rec.bytes} != ${shot.length}`);
    if (!pngMagic(shot)) add('shot-not-png', 'PNG magic missing');
  }
  // --- the journey record (C2), when present ----------------------------------
  if (receipt.journey) {
    const j = receipt.journey;
    const formMode = !!j.form;
    const steps = Array.isArray(j.steps) ? j.steps : null;
    if (!steps || steps.length !== (formMode ? 6 : 4)) add('journey-steps', JSON.stringify(steps ? steps.length : null));
    else {
      const WANT = [
        { leg: 'Page.navigate', suffix: '/a.html', shotKey: 'a' },
        { leg: 'anchor-click', suffix: '/b.html', shotKey: 'b' },
        { leg: 'anchor-click', suffix: '/c.html', shotKey: 'c' },
        { leg: 'navigateToHistoryEntry', suffix: '/b.html', shotKey: null }, // main shot (non-form)
        ...(formMode ? [
          { leg: 'anchor-click', suffix: '/form.html', shotKey: 'form' },
          { leg: 'form-submit', suffix: '/echo', shotKey: 'echo', mainShot: true },
        ] : []),
      ];
      let firstPort = null;
      const urls = [];
      steps.forEach((s, i) => {
        const w = WANT[i];
        if (s.leg !== w.leg) add('journey-leg', `step ${i}: ${s.leg} != ${w.leg}`);
        let u = null;
        try { u = new URL(s.url); } catch { add('journey-url', s.url); }
        if (u) {
          urls.push(u);
          if (u.origin !== `http://127.0.0.1${u.port ? ':' + u.port : ''}`) add('journey-origin-not-loopback', u.origin);
          if (!/^\d+$/.test(u.port)) add('journey-port', u.port);
          else if (firstPort === null) firstPort = u.port;
          else if (u.port !== firstPort) add('journey-port', `${firstPort} != ${u.port}`);
          if (!u.pathname.endsWith(w.suffix)) add('journey-url', `step ${i}: ${u.pathname} !~ ${w.suffix}`);
        }
        if (typeof s.title !== 'string' || !s.title) add('journey-title', `step ${i}: ${s.title}`);
      });
      // no global distinctness rule: the back leg legitimately revisits
      // /b.html — the per-step suffix sequence above pins A→B→C→B (→F→echo).
      if (j.nonceOnPageA !== true) add('journey-invocation-binding', j.nonceOnPageA);
      // per-step PNGs (every step with a shotKey; formMode adds form + echo)
      for (let i = 0; i < steps.length; i++) {
        if (!WANT[i].shotKey) continue;
        const f = shots[WANT[i].shotKey];
        let buf = null;
        if (!f) add('journey-shot-arg-missing', `--png-${WANT[i].shotKey}`);
        else { try { buf = fs.readFileSync(f); } catch { add('journey-shot-unreadable', f); } }
        if (buf) {
          const rec = steps[i].screenshot || {};
          if (rec.sha256 !== sha256(buf)) add('journey-shot-digest-mismatch', `step ${i}: ${rec.sha256} != ${sha256(buf)}`);
          if (rec.bytes !== buf.length) add('journey-shot-length-mismatch', `step ${i}: ${rec.bytes} != ${buf.length}`);
          if (!pngMagic(buf)) add('journey-shot-not-png', `step ${i}`);
        }
      }
      const recMain = receipt.screenshot || {};
      const lastIdx = steps.length - 1;
      if (JSON.stringify(recMain) !== JSON.stringify(steps[lastIdx].screenshot || {})) add('main-shot-not-final-step', JSON.stringify({ recMain, last: steps[lastIdx].screenshot }).slice(0, 160));
      // history block, read at C. MEASURED SURFACE MODEL: the initial data:
      // page occupies history slot 0, so the entries at C are
      // [data:, a, b, c] — entriesLength 4, currentIndex 3.
      const h = j.history || {};
      const hUrls = Array.isArray(h.urls) ? h.urls : [];
      const endsWith = (u, sfx) => { try { return new URL(u).pathname.endsWith(sfx); } catch { return false; } };
      if (h.entriesLength !== 4 || h.currentIndex !== 3
          || !endsWith(h.readAt || '', '/c.html')
          || hUrls.length !== 4
          || !String(hUrls[0] || '').startsWith('data:')
          || !endsWith(hUrls[1] || '', '/a.html') || !endsWith(hUrls[2] || '', '/b.html') || !endsWith(hUrls[3] || '', '/c.html')) {
        add('journey-history', JSON.stringify(h).slice(0, 200));
      }
      // back leg (to the /b.html entry, index 2 of [data:, a, b, c])
      const bl = j.backLeg || {};
      if (bl.mechanism !== 'navigateToHistoryEntry' || bl.targetIndex !== 2
          || !endsWith(bl.urlAfter || '', '/b.html')
          || bl.entriesLengthAfter !== 4 || bl.currentIndexAfter !== 2) {
        add('journey-back-leg', JSON.stringify(bl).slice(0, 200));
      }
      // --- the form block: the r52 per-key typing trace, carried, plus the
      // round-53 modifier-chord trace. Both traces are RE-DERIVED from the
      // receipt's own nonce; the chord plan (which characters ride Shift,
      // with modifiers 8) is re-derived per character, and every per-
      // keystroke prefix is checked — per-keystroke delivery evidence for
      // the chords themselves.
      if (formMode) {
        const f = j.form || {};
        const vkFor = (ch) => (/[0-9]/.test(ch) ? 48 + Number(ch) : /[a-z]/.test(ch) ? 65 + (ch.charCodeAt(0) - 97) : ch === '-' ? 189 : null);
        const codeFor = (ch) => (/[0-9]/.test(ch) ? 'Digit' + ch : /[a-z]/.test(ch) ? 'Key' + ch.toUpperCase() : ch === '-' ? 'Minus' : null);
        if (f.mechanism !== 'dispatchKeyEvent+shift-chords+chord-domain+submit-click') add('form-mechanism', f.mechanism);
        if (f.nonceOnFormPage !== true) add('form-invocation-binding', f.nonceOnFormPage);
        if (f.filledValue !== receipt.nonce) add('form-filled-value', String(f.filledValue).slice(0, 60));
        let echoUrl = null;
        try { echoUrl = new URL(f.urlAfter || ''); } catch { add('form-echo-url', f.urlAfter); }
        if (echoUrl) {
          const firstJourneyUrl = (() => { try { return new URL(steps[0].url); } catch { return null; } })();
          if (firstJourneyUrl && (echoUrl.origin !== firstJourneyUrl.origin || echoUrl.port !== firstJourneyUrl.port)) add('form-echo-origin', echoUrl.origin);
          if (echoUrl.pathname !== '/echo') add('form-echo-url', echoUrl.pathname);
          if (echoUrl.search !== '?field=' + encodeURIComponent(receipt.nonce) + '&mixed=' + encodeURIComponent((receipt.nonce || '').toUpperCase())) add('form-echo-query', echoUrl.search);
        }
        if (f.valueOnEchoPage !== receipt.nonce) add('form-echo-value', String(f.valueOnEchoPage).slice(0, 60));
        const wantedQuery = '/echo?field=' + encodeURIComponent(receipt.nonce) + '&mixed=' + encodeURIComponent((receipt.nonce || '').toUpperCase());
        if (f.serverSawField !== true || f.servedEchoEntry !== wantedQuery) add('form-server-witness', JSON.stringify({ serverSawField: f.serverSawField, servedEchoEntry: f.servedEchoEntry }));
        // --- the plain per-key typing trace (the r52 chain, unchanged) ---
        const typing = Array.isArray(f.typing) ? f.typing : null;
        if (!typing) add('typing-missing', 'journey.form.typing absent');
        else {
          if (typing.length !== receipt.nonce.length) add('typing-length', String(typing.length) + ' != nonce ' + receipt.nonce.length);
          typing.forEach((t, i) => {
            if (!t || typeof t !== 'object') { add('typing-entry', 'i=' + i); return; }
            if (t.i !== i) add('typing-index', 'entry ' + i + ' names i=' + t.i);
            if (t.char !== receipt.nonce[i]) add('typing-char', 'i=' + i + ': ' + t.char + ' != ' + receipt.nonce[i]);
            if (t.windowsVirtualKeyCode !== vkFor(receipt.nonce[i])) add('typing-vk', 'i=' + i + ': ' + t.windowsVirtualKeyCode + ' != ' + vkFor(receipt.nonce[i]));
            if (t.code !== codeFor(receipt.nonce[i])) add('typing-code', 'i=' + i + ': ' + t.code + ' != ' + codeFor(receipt.nonce[i]));
            if (t.valueAfter !== receipt.nonce.slice(0, i + 1)) add('typing-prefix', 'i=' + i + ': ' + String(t.valueAfter).slice(0, 40));
          });
          if (f.valueBeforeFirstKey !== '') add('typing-value-before', String(f.valueBeforeFirstKey).slice(0, 40));
          if (f.keyEventCount !== 2 * receipt.nonce.length) add('typing-event-count', String(f.keyEventCount) + ' != ' + (2 * receipt.nonce.length));
          if (f.fieldValueAfterTyping !== receipt.nonce) add('typing-field-value', String(f.fieldValueAfterTyping).slice(0, 60));
        }
        // --- the round-53 modifier-chord trace ---
        const mixed = (receipt.nonce || '').toUpperCase();
        const vkForChord = (ch) => (/[0-9]/.test(ch) ? 48 + Number(ch) : /[A-Z]/.test(ch) ? 65 + (ch.charCodeAt(0) - 65) : ch === '-' ? 189 : null);
        const codeForChord = (ch) => (/[0-9]/.test(ch) ? 'Digit' + ch : /[A-Z]/.test(ch) ? 'Key' + ch : ch === '-' ? 'Minus' : null);
        const chords = (f.chords && typeof f.chords === 'object') ? f.chords : null;
        if (!chords) add('chords-missing', 'journey.form.chords absent');
        else {
          if (chords.value !== mixed) add('chords-value', String(chords.value).slice(0, 60));
          const ct = Array.isArray(chords.typing) ? chords.typing : null;
          if (!ct) add('chords-missing', 'journey.form.chords.typing absent');
          else {
            if (ct.length !== mixed.length) add('chords-length', String(ct.length) + ' != chord value ' + mixed.length);
            ct.forEach((t, i) => {
              if (!t || typeof t !== 'object') { add('chords-entry', 'i=' + i); return; }
              if (t.i !== i) add('chords-index', 'entry ' + i + ' names i=' + t.i);
              if (t.char !== mixed[i]) add('chords-char', 'i=' + i + ': ' + t.char + ' != ' + mixed[i]);
              const ride = /[A-Z]/.test(mixed[i]);
              if (t.shiftRide !== ride) add('chords-shift', 'i=' + i + ': ' + t.shiftRide + ' != ' + ride);
              if (t.modifiers !== (ride ? 8 : 0)) add('chords-modifiers', 'i=' + i + ': ' + t.modifiers + ' != ' + (ride ? 8 : 0));
              if (t.windowsVirtualKeyCode !== vkForChord(mixed[i])) add('chords-vk', 'i=' + i + ': ' + t.windowsVirtualKeyCode + ' != ' + vkForChord(mixed[i]));
              if (t.code !== codeForChord(mixed[i])) add('chords-code', 'i=' + i + ': ' + t.code + ' != ' + codeForChord(mixed[i]));
              if (t.valueAfter !== mixed.slice(0, i + 1)) add('chords-prefix', 'i=' + i + ': ' + String(t.valueAfter).slice(0, 40));
            });
            if (chords.valueBeforeFirstKey !== '') add('chords-value-before', String(chords.valueBeforeFirstKey).slice(0, 40));
            const wantEvents = [...mixed].reduce((a, ch) => a + (/[A-Z]/.test(ch) ? 4 : 2), 0);
            if (chords.keyEventCount !== wantEvents) add('chords-event-count', String(chords.keyEventCount) + ' != ' + wantEvents);
            if (chords.fieldValueAfterTyping !== mixed) add('chords-field-value', String(chords.fieldValueAfterTyping).slice(0, 60));
            if (chords.allPrefixTrue !== true) add('chords-all-prefix-flag', chords.allPrefixTrue);
          }
        }
        if (f.mixedOnEchoPage !== mixed) add('form-mixed-echo-value', String(f.mixedOnEchoPage).slice(0, 60));
        if (f.serverSawMixed !== true) add('form-server-mixed-witness', f.serverSawMixed);
        // --- the round-54 chord-domain leg: three modifier chords (Control
        // bit 2, Alt bit 1, Meta bit 4 — S153's modifiers bit field) on the
        // derived letter, each witnessed by the PAGE's own keydown records;
        // #field3 (no name attribute, never submitted) must stay EMPTY.
        const CHORD_MODS = [
          { name: 'Control', bit: 2, key: 'Control', code: 'ControlLeft', vk: 17 },
          { name: 'Alt', bit: 1, key: 'Alt', code: 'AltLeft', vk: 18 },
          { name: 'Meta', bit: 4, key: 'Meta', code: 'MetaLeft', vk: 91 },
        ];
        const hexTail = ((receipt.nonce || '').split('-')[2]) || '';
        const lmChord = /([a-f])/.exec(hexTail);
        const chordLetter = lmChord ? lmChord[1] : 'a';
        const chordLetterCode = 'Key' + chordLetter.toUpperCase();
        const chordLetterVk = 65 + (chordLetter.charCodeAt(0) - 97);
        const klEq = (a, b) => !!a && typeof a === 'object' && !!b && a.key === b.key && a.code === b.code
          && a.ctrlKey === b.ctrlKey && a.altKey === b.altKey && a.metaKey === b.metaKey
          && a.shiftKey === b.shiftKey && a.keyCode === b.keyCode;
        const boolsFor = (bit) => ({ ctrlKey: bit === 2, altKey: bit === 1, metaKey: bit === 4, shiftKey: false });
        const cd = (f.chordDomain && typeof f.chordDomain === 'object') ? f.chordDomain : null;
        if (!cd) add('chord-domain-missing', 'journey.form.chordDomain absent');
        else {
          if (cd.derivation !== 'first [a-f] char of the nonce hex tail') add('chord-domain-derivation', String(cd.derivation).slice(0, 60));
          if (cd.hexTail !== hexTail) add('chord-domain-derivation', String(cd.hexTail).slice(0, 40));
          if (cd.letter !== chordLetter) add('chord-domain-letter', `${cd.letter} != derived ${chordLetter}`);
          if (cd.letterCode !== chordLetterCode || cd.letterWindowsVirtualKeyCode !== chordLetterVk) add('chord-domain-letter', `${cd.letterCode}/${cd.letterWindowsVirtualKeyCode} != ${chordLetterCode}/${chordLetterVk}`);
          const cds = Array.isArray(cd.chords) ? cd.chords : null;
          if (!cds || cds.length !== CHORD_MODS.length) add('chord-domain-chords', String(cds ? cds.length : null));
          else {
            cds.forEach((c, i) => {
              const cm = CHORD_MODS[i];
              if (!c || typeof c !== 'object') { add('chord-domain-chord', 'i=' + i); return; }
              if (c.name !== cm.name || c.bit !== cm.bit || c.key !== cm.key || c.code !== cm.code || c.windowsVirtualKeyCode !== cm.vk) add('chord-domain-chord', 'i=' + i);
              if (c.keyEventsDispatched !== 4) add('chord-domain-events', `i=${i}: ${c.keyEventsDispatched}`);
              const b = boolsFor(cm.bit);
              if (!Array.isArray(c.domEvents) || c.domEvents.length !== 2) add('chord-domain-boolean', `i=${i}: domEvents shape`);
              else {
                if (!klEq(c.domEvents[0], { key: cm.key, code: cm.code, keyCode: cm.vk, ...b })) add('chord-domain-boolean', `i=${i}: modifier keydown ${JSON.stringify(c.domEvents[0]).slice(0, 80)}`);
                if (!klEq(c.domEvents[1], { key: chordLetter, code: chordLetterCode, keyCode: chordLetterVk, ...b })) add('chord-domain-boolean', `i=${i}: letter keydown ${JSON.stringify(c.domEvents[1]).slice(0, 80)}`);
              }
            });
          }
          if (cd.keyEventCount !== 12) add('chord-domain-events', `keyEventCount ${cd.keyEventCount} != 12`);
          if (Number(cd.keylogLengthAfter) - Number(cd.keylogLengthBefore) !== 6) add('chord-domain-events', `keylog window ${cd.keylogLengthBefore}->${cd.keylogLengthAfter} != +6`);
          if (cd.field3ValueAfter !== '') add('field3-not-empty', String(cd.field3ValueAfter).slice(0, 40));
        }
        // --- the page's own keydown record, re-derived END TO END from the
        // receipt's own nonce: every plain keyDown, every Shift-chord
        // keyDown pair (the Shift ride's own record, then the letter's),
        // every chord-domain keyDown pair — CDP dispatch plan and DOM
        // delivery must agree entry by entry.
        const kl = Array.isArray(f.pageKeylog) ? f.pageKeylog : null;
        if (!kl) add('keylog-missing', 'journey.form.pageKeylog absent');
        else {
          const wantKl = [];
          for (const ch of receipt.nonce) wantKl.push({ key: ch, code: codeFor(ch), keyCode: vkFor(ch), ctrlKey: false, altKey: false, metaKey: false, shiftKey: false });
          for (const ch of mixed) {
            const ride = /[A-Z]/.test(ch);
            if (ride) wantKl.push({ key: 'Shift', code: 'ShiftLeft', keyCode: 16, ctrlKey: false, altKey: false, metaKey: false, shiftKey: true });
            wantKl.push({ key: ch, code: codeForChord(ch), keyCode: vkForChord(ch), ctrlKey: false, altKey: false, metaKey: false, shiftKey: ride });
          }
          for (const cm of CHORD_MODS) {
            wantKl.push({ key: cm.key, code: cm.code, keyCode: cm.vk, ...boolsFor(cm.bit) });
            wantKl.push({ key: chordLetter, code: chordLetterCode, keyCode: chordLetterVk, ...boolsFor(cm.bit) });
          }
          if (kl.length !== wantKl.length) add('keylog-length', `${kl.length} != derived ${wantKl.length}`);
          else wantKl.forEach((e, i) => {
            if (!klEq(e, kl[i])) add('keylog-entry', 'i=' + i + ': ' + JSON.stringify(kl[i]).slice(0, 90));
          });
        }
      }
    }
  }
  return { receipt, findings, couldNotEvaluate };
}

const args = process.argv.slice(2);
if (args[0] === '--selftest') {
  const dir = args[1];
  if (!dir) die('usage: webview2-receipt-r54.mjs --selftest <fixtures-dir>');
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  // the fixtures dir sits at .ufo/waves/round-54/counters/<fixtures>: five
  // levels below the repo root. ROUND-53 LAYOUT PIN (the r52 closure's routed
  // harness note): the pinned driver/hostsrc resolve five directories above
  // the fixtures dir — the expectation is CHECKED here, and a wrong layout
  // dies exit 2 with the named error selftest-repo-root-layout (usage: run
  // the selftest inside a faithful repo-root layout, or extract the pinned
  // scripts to <scratchRoot>/scripts/ beside a faithful <scratchRoot>/.ufo/
  // waves/round-54/counters/<fixtures> tree) instead of silently reporting
  // per-case pin-file-unreadable.
  const driverPath = path.resolve(dir, '..', '..', '..', '..', '..', 'scripts', 'webview2-cdp-loopback-round54.mjs');
  const hostSrcPath = path.resolve(dir, '..', '..', '..', '..', '..', 'scripts', 'webview2-host-round48.cs');
  for (const [p, what] of [[driverPath, 'driver'], [hostSrcPath, 'hostsrc']]) {
    let ok = false;
    try { ok = fs.existsSync(p); } catch { ok = false; }
    if (!ok) die('selftest-repo-root-layout: the pinned ' + what + ' does not exist at the layout-expectation path ' + p
      + ' — the fixtures dir must sit at <repoRoot>/.ufo/waves/round-54/counters/<fixtures> (five levels below the repo root)');
  }
  const os = await import('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tabi-r54-counter-selftest-'));
  let pass = 0;
  const results = [];
  for (const c of manifest.cases) {
    let receiptPath = path.join(dir, c.receipt);
    // runtimeProbe: materialize a deterministic runtime folder for the branch
    // the case needs, independent of the host's auto-update state.
    if (c.runtimeProbe === 'with-exe' || c.runtimeProbe === 'without-exe') {
      const rt = path.join(tmp, c.name, 'EdgeWebView', 'Application', '156.0.4314.50');
      fs.mkdirSync(rt, { recursive: true });
      if (c.runtimeProbe === 'with-exe') fs.writeFileSync(path.join(rt, 'msedgewebview2.exe'), 'probe');
      const r = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
      r.runtimeFolder = rt;
      receiptPath = path.join(tmp, c.name + '.json');
      fs.writeFileSync(receiptPath, JSON.stringify(r, null, 1));
    }
    const r = checkReceipt(receiptPath, {
      main: c.shots && c.shots.main ? path.join(dir, c.shots.main) : path.join(dir, 'missing.png'),
      a: c.shots && c.shots.a ? path.join(dir, c.shots.a) : null,
      b: c.shots && c.shots.b ? path.join(dir, c.shots.b) : null,
      c: c.shots && c.shots.c ? path.join(dir, c.shots.c) : null,
      form: c.shots && c.shots.form ? path.join(dir, c.shots.form) : null,
      echo: c.shots && c.shots.echo ? path.join(dir, c.shots.echo) : null,
    }, driverPath, hostSrcPath);
    const got = r.findings.map((f) => f.id).sort();
    const want = (c.findings || []).slice().sort();
    const findingsOk = JSON.stringify(got) === JSON.stringify(want);
    // the declared could-not-evaluate contract: non-empty iff the pinned
    // runtime folder does not exist on the scoring host, and only ever the
    // named code — never a finding.
    let folderExists = false;
    try { folderExists = fs.existsSync(r.receipt.runtimeFolder); } catch { folderExists = false; }
    const wantCne = folderExists ? [] : ['runtime-pin-host-drift'];
    const gotCne = r.couldNotEvaluate.map((x) => x.code).sort();
    const cneOk = JSON.stringify(gotCne) === JSON.stringify(wantCne);
    const ok = findingsOk && cneOk;
    if (ok) pass += 1;
    results.push({ name: c.name, ok, findingsOk, cneOk, got, want, gotCne, wantCne });
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  const allPass = pass === results.length;
  console.log(JSON.stringify({ schema: 'tabi-webview2-receipt-r54-selftest', allPass, cases: results.length, pass, results }, null, 1));
  process.exit(allPass ? 0 : 1);
}
// main: <receipt> --shot <png> [--png-a --png-b --png-c --png-form --png-echo] --driver <mjs> --hostsrc <cs>
const receiptPath = args[0];
const idx = (name) => { const i = args.indexOf('--' + name); return i === -1 ? null : args[i + 1]; };
const driverIdx = args.indexOf('--driver');
const hostsrcIdx = args.indexOf('--hostsrc');
if (!receiptPath || !idx('shot') || driverIdx === -1 || hostsrcIdx === -1) {
  die('usage: node webview2-receipt-r54.mjs <receipt.json> --shot <png> [--png-a <a.png> --png-b <b.png> --png-c <c.png> --png-form <f.png> --png-echo <e.png>] --driver <mjs> --hostsrc <cs> | --selftest <dir>');
}
const { receipt, findings, couldNotEvaluate } = checkReceipt(receiptPath, {
  main: idx('shot'),
  a: idx('png-a'),
  b: idx('png-b'),
  c: idx('png-c'),
  form: idx('png-form'),
  echo: idx('png-echo'),
}, args[driverIdx + 1], args[hostsrcIdx + 1]);
const out = {
  schema: 'tabi-webview2-receipt-r54',
  receipt: receiptPath,
  shots: { main: idx('shot'), a: idx('png-a'), b: idx('png-b'), c: idx('png-c') },
  browser: (receipt.jsonVersion || {}).Browser,
  journey: receipt.journey ? {
    steps: receipt.journey.steps.length,
    legs: receipt.journey.steps.map((s) => s.leg),
    urls: receipt.journey.steps.map((s) => s.url),
    history: receipt.journey.history,
    backLeg: receipt.journey.backLeg || null,
    form: receipt.journey.form || null,
  } : null,
  predicate: findings.length === 0, findingCount: findings.length, findings,
  couldNotEvaluate,
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
