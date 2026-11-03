#!/usr/bin/env node
// Round-56 labrat CDP driver. Node >= 22 (global WebSocket + fetch). Zero npm deps.
// One hypothesis per invocation. Prints one JSON object on stdout.
import { readFileSync, existsSync } from 'node:fs';
import process from 'node:process';

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : def;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile  = arg('profile');
const httpPort = Number(arg('http-port'));
const hyp      = arg('hypothesis');
const runNo    = Number(arg('run', '0'));
const serverLogPath = arg('server-log');
const variant  = arg('variant', 'default');

async function waitForDevtoolsPort(timeoutMs = 20000) {
  const t0 = Date.now();
  const f = `${profile}/DevToolsActivePort`;
  while (Date.now() - t0 < timeoutMs) {
    if (existsSync(f)) {
      try {
        const lines = readFileSync(f, 'utf8').trim().split('\n');
        const p = Number(lines[0]);
        if (Number.isInteger(p) && p > 0) return p;
      } catch { /* mid-write */ }
    }
    await sleep(100);
  }
  throw new Error('DevToolsActivePort not written within ' + timeoutMs + 'ms');
}

async function waitForPageTarget(port, timeoutMs = 20000) {
  const t0 = Date.now();
  let last = '(none)';
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page;
      last = JSON.stringify(list.map((t) => t.type));
    } catch (e) {
      last = String((e && e.message) || e);
    }
    await sleep(100);
  }
  throw new Error('no page target within ' + timeoutMs + 'ms; last=' + last);
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.next = 1;
    this.pending = new Map();
    this.handlers = new Map();
    ws.addEventListener('message', (ev) => {
      let m;
      try {
        m = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString('utf8'));
      } catch { return; }
      if (m.id && this.pending.has(m.id)) {
        const { res, rej } = this.pending.get(m.id);
        this.pending.delete(m.id);
        if (m.error) rej(new Error(`${m.error.message} (code ${m.error.code})`));
        else res(m.result);
      } else if (m.method) {
        for (const h of this.handlers.get(m.method) || []) h(m.params);
      }
    });
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true });
      ws.addEventListener('error', () => rej(new Error('websocket error connecting ' + url)), { once: true });
    });
    return new CDP(ws);
  }
  send(method, params = {}) {
    const id = this.next++;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('cdp timeout: ' + method)); }
      }, 20000);
    });
  }
  close() { try { this.ws.close(); } catch { /* noop */ } }
}

async function evaluate(cdp, expression) {
  const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails));
  return r.result.value;
}

const FIELD_STATE = `(()=>{const e=document.getElementById('q');if(!e)return null;return {value:e.value,selStart:e.selectionStart,selEnd:e.selectionEnd,focused:(document.activeElement&&document.activeElement.id)||null};})()`;
const RECT = `(()=>{const e=document.getElementById('q');const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height};})()`;

async function waitReady(cdp) {
  for (let i = 0; i < 200; i++) {
    try { if ((await evaluate(cdp, 'document.readyState')) === 'complete') return; } catch { /* context swapping */ }
    await sleep(50);
  }
  throw new Error('document never reached readyState complete');
}

async function clickCentre(cdp, rect) {
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y, button: 'none', buttons: 0 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', buttons: 1, clickCount: 1 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', buttons: 0, clickCount: 1 });
}

async function keyPair(cdp, { key, code, vk, text }) {
  const down = { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
  if (text !== undefined) { down.text = text; down.unmodifiedText = text; }
  const up = { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
  await cdp.send('Input.dispatchKeyEvent', down);
  await cdp.send('Input.dispatchKeyEvent', up);
}

function readServerLog() {
  if (!serverLogPath || !existsSync(serverLogPath)) return [];
  return readFileSync(serverLogPath, 'utf8').split('\n').filter((l) => l.includes('"GET ') || l.includes('"POST '));
}

async function runH1(cdp) {
  await waitReady(cdp);
  const rect = await evaluate(cdp, RECT);
  if (variant === 'control-nofocus') {
    // NEGATIVE CONTROL: focus body, type nothing into a field, hit Enter.
    // Proves the submit witness comes from the focused-field path and not page load.
    await cdp.send('Runtime.evaluate', { expression: 'document.getElementById("q").blur()' });
    await clickCentre(cdp, { x: 5, y: 300 });
  } else {
    await clickCentre(cdp, rect);
    await cdp.send('Input.insertText', { text: 'probe' });
  }
  const before = await evaluate(cdp, FIELD_STATE);

  const logBefore = readServerLog().length;
  const t0 = Date.now();
  if (variant === 'keydown-only') {
    // EXPLORATORY (beyond H1): C2's frozen predicate demands keyEventsDispatched === 1
    // for the Enter leg. Does a lone keyDown (no keyUp) still drive implicit submission?
    // No text: a CR text field on keyDown would otherwise be the submit trigger.
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'keyDown', key: 'Enter', code: 'Enter',
      windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r',
    });
  } else if (variant === 'notext') {
    // EXPLORATORY (beyond H1): keyDown/keyUp pair with NO text payload.
    // Runners that omit text are common; if this does not submit, the C2 runner
    // MUST carry text:'\r' or its Enter leg goes red for the wrong reason.
    await keyPair(cdp, { key: 'Enter', code: 'Enter', vk: 13 });
  } else {
    await keyPair(cdp, { key: 'Enter', code: 'Enter', vk: 13, text: '\r' });
  }

  let submitLines = [];
  while (Date.now() - t0 < 5000) {
    const lines = readServerLog().filter((l) => l.includes('"GET /submit?'));
    if (lines.length > 0) { submitLines = lines; break; }
    await sleep(50);
  }
  await sleep(300); // let any duplicate arrive before we count
  const all = readServerLog();
  const submitAll = all.filter((l) => l.includes('"GET /submit?'));
  const elapsed = Date.now() - t0;

  const carried = submitAll.length > 0 && /[?&]q=probe(&|\s|$)/.test(submitAll[0]);
  const verdict = variant === 'control-nofocus'
    ? (submitAll.length === 0 ? 'control-as-expected' : 'control-unexpected')
    : (submitAll.length === 1 && carried ? (variant === 'keydown-only' ? 'supported-keydown-only' : variant === 'notext' ? 'supported-notext' : 'supported') : 'falsified');

  return {
    submitted: submitAll.length === 1,
    serverLogLines: all,
    submitRequests: submitAll.length,
    valueBefore: before ? before.value : null,
    valueAfter: null, // page navigated away to /submit?q=probe
    focusedField: before ? before.focused : null,
    queryCarriesValue: carried,
    elapsedMs: elapsed,
    variant,
    logLinesBeforeEnter: logBefore,
    verdict,
  };
}

async function runH3Tab(cdp) {
  // EXPLORATORY (beyond H1/H2): the C2 leg also needs Tab focus traversal
  // witnessed by document.activeElement. Not one of my two frozen hypotheses;
  // run to hand the L1 a grounded Tab result instead of an assumption.
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${httpPort}/form2.html` });
  await sleep(300);
  await waitReady(cdp);
  const rect = await evaluate(cdp, RECT);
  await clickCentre(cdp, rect);
  const before = await evaluate(cdp, FIELD_STATE);
  const rect2 = await evaluate(cdp, `(()=>{const e=document.getElementById('q2');const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  // move the real mouse off the second field first so a stray hover cannot focus it
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 400, button: 'none', buttons: 0 });
  await keyPair(cdp, { key: 'Tab', code: 'Tab', vk: 9 });
  const afterTab = await evaluate(cdp, FIELD_STATE);
  const moved = !!before && !!afterTab && before.focused === 'q' && afterTab.focused === 'q2';
  return {
    submitted: readServerLog().some((l) => l.includes('"GET /submit?')),
    serverLogLines: readServerLog(),
    submitRequests: readServerLog().filter((l) => l.includes('"GET /submit?')).length,
    valueBefore: before ? before.value : null,
    valueAfter: afterTab ? afterTab.value : null,
    activeElementBefore: before ? before.focused : null,
    activeElementAfterTab: afterTab ? afterTab.focused : null,
    field2Rect: rect2,
    variant,
    verdict: moved ? 'supported-exploratory' : 'falsified',
  };
}

async function runH2(cdp) {
  await waitReady(cdp);
  const SEED = variant === 'control-home' ? 'abcde' : 'abcdefghijklmnopqrstuvwxyz0123456789';
  const seeded = await evaluate(cdp, `(()=>{const e=document.getElementById('q');e.value='${SEED}';e.focus();return e.value;})()`);
  const rect = await evaluate(cdp, RECT);
  await clickCentre(cdp, rect);
  const before = await evaluate(cdp, FIELD_STATE);

  if (variant === 'control-home') {
    // NEGATIVE CONTROL: Home moves the caret to 0, so Backspace must delete NOTHING.
    // Proves the exact-restore witness is caret-position-sensitive, not a constant.
    await keyPair(cdp, { key: 'Home', code: 'Home', vk: 36 });
  } else {
    await keyPair(cdp, { key: 'End', code: 'End', vk: 35 });
  }
  const afterEnd = await evaluate(cdp, FIELD_STATE);

  await keyPair(cdp, { key: 'Backspace', code: 'Backspace', vk: 8 });
  const afterBackspace = await evaluate(cdp, FIELD_STATE);

  const expectAfterBackspace = before ? before.value.slice(0, -1) : null;
  const endUnchanged = !!before && !!afterEnd && afterEnd.value === before.value;
  const backspaceExact = !!expectAfterBackspace && !!afterBackspace && afterBackspace.value === expectAfterBackspace;
  const caretAtEnd = !!afterEnd && afterEnd.selStart === afterEnd.value.length && afterEnd.selEnd === afterEnd.value.length;
  const caretWasNotAlreadyAtEnd = !!before && before.selStart !== before.value.length;
  const verdict = variant === 'control-home'
    ? (afterBackspace && before && afterBackspace.value === before.value ? 'control-as-expected' : 'control-unexpected')
    : (endUnchanged && backspaceExact ? 'supported' : 'falsified');

  const all = readServerLog();
  return {
    submitted: all.some((l) => l.includes('"GET /submit?')),
    serverLogLines: all,
    submitRequests: all.filter((l) => l.includes('"GET /submit?')).length,
    valueBefore: before ? before.value : null,
    valueAfter: afterBackspace ? afterBackspace.value : null,
    seededValue: seeded,
    focusedField: before ? before.focused : null,
    caretAfterClick: before ? { selStart: before.selStart, selEnd: before.selEnd } : null,
    afterEnd: afterEnd ? { value: afterEnd.value, selStart: afterEnd.selStart, selEnd: afterEnd.selEnd } : null,
    afterBackspace: afterBackspace ? { value: afterBackspace.value, selStart: afterBackspace.selStart, selEnd: afterBackspace.selEnd } : null,
    endLeftValueUnchanged: endUnchanged,
    caretAtEndAfterEnd: caretAtEnd,
    caretWasNotAlreadyAtEndBeforeEnd: caretWasNotAlreadyAtEnd,
    variant,
    backspaceRemovedExactlyLastChar: backspaceExact,
    expectedAfterBackspace: expectAfterBackspace,
    verdict,
  };
}

(async () => {
  const out = { hypothesis: hyp, run: runNo, variant, profile, httpPort };
  let cdp;
  try {
    const port = await waitForDevtoolsPort();
    out.devtoolsPort = port;
    const page = await waitForPageTarget(port);
    out.pageTarget = { id: page.id, url: page.url, type: page.type };
    cdp = await CDP.connect(page.webSocketDebuggerUrl);
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    const body = hyp === 'H1' ? await runH1(cdp)
      : hyp === 'H2' ? await runH2(cdp)
      : hyp === 'HTab' ? await runH3Tab(cdp)
      : (() => { throw new Error('unknown hypothesis ' + hyp); })();
    Object.assign(out, body);
  } catch (e) {
    out.verdict = 'falsified';
    out.error = String((e && e.stack) || e);
    out.serverLogLines = readServerLog();
    out.submitted = (out.serverLogLines || []).some((l) => l.includes('"GET /submit?'));
    if (out.valueBefore === undefined) out.valueBefore = null;
    if (out.valueAfter === undefined) out.valueAfter = null;
  } finally {
    if (cdp) cdp.close();
  }
  process.stdout.write(JSON.stringify(out, null, 1) + '\n');
})();
