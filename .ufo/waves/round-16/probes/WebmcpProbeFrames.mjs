#!/usr/bin/env node
// Round-16 wave-1 probe — seat WebmcpProbeFrames.
//
// Question: WebMCP frame/target attribution.
//   * same-origin iframe with a declarative tool
//   * second loopback origin (127.0.0.1 different port — cross-origin, same site) iframe
//   * cross-site loopback iframe (localhost vs 127.0.0.1 — candidate OOPIF)
//   * popup / new page target
// Records: WebMCP.toolsAdded frameId attribution; whether events arrive on the
// top-level page session or need Target.setAutoAttach (flatten); backendNodeId
// resolution via DOM.describeNode from the emitting session vs the page session.
//
// Loopback only: two http servers on 127.0.0.1 / dual-stack '::'; Chromium is
// launched with host-resolver-rules that fail every name except 127.0.0.1 and
// localhost. Fresh temp profile. No external requests are possible.
//
// Zero dependencies: raw CDP over the DevTools browser WebSocket (Node >= 22
// global WebSocket). Usage:
//   node .ufo/waves/round-16/probes/WebmcpProbeFrames.mjs
// Writes .ufo/waves/round-16/probes/WebmcpProbeFrames.json next to itself and
// prints one summary line.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const OUT = resolve(dirname(SCRIPT), 'WebmcpProbeFrames.json');
const CHROMIUM = '/usr/bin/chromium';
const FLAGS = [
  '--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
];
const SETTLE_MS = 3500;
const NOTE_METHODS = new Set([
  'WebMCP.toolsAdded', 'WebMCP.toolsRemoved',
  'Target.attachedToTarget', 'Target.detachedFromTarget',
  'Target.targetCreated', 'Target.targetDestroyed', 'Target.targetInfoChanged',
  'Page.frameAttached', 'Page.frameDetached', 'Page.frameNavigated',
  'Page.loadEventFired', 'Page.domContentEventFired',
  'Inspector.targetCrashed', 'Runtime.exceptionThrown',
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => Date.now();
const sha256File = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

function page({ title, html }) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title><h1>${title}</h1>${html}`;
}
function toolForm(name, desc, input) {
  return `<form toolname="${name}" tooldescription="${desc}"><input name="${input}" title="${input} field"></form>`;
}

// ---------------------------------------------------------------- HTTP ------
// `routes` is a plain object the caller fills AFTER the port is known; the
// handler reads it lazily per request.
function makeServer(routes) {
  const hits = [];
  const server = createServer((req, res) => {
    hits.push({ t: now(), url: req.url, host: req.headers.host });
    const body = routes[req.url];
    if (body === undefined) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  });
  return { server, hits };
}
function listen(server, host) {
  return new Promise((res, rej) => {
    server.once('error', rej);
    server.listen(0, host, () => res(server.address().port));
  });
}

// ------------------------------------------------------------------ CDP -----
class Cdp {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.afterAttach = [];
  }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((res, rej) => {
      this.ws.addEventListener('open', res, { once: true });
      this.ws.addEventListener('error', rej, { once: true });
    });
    this.ws.addEventListener('message', (ev) => this.#onMessage(ev));
  }
  #onMessage(ev) {
    let msg;
    try { msg = JSON.parse(ev.data); } catch { return; }
    if (msg.id !== undefined) {
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      p(msg);
      return;
    }
    const rec = { t: now(), sessionId: msg.sessionId ?? null, method: msg.method, params: msg.params };
    if (NOTE_METHODS.has(msg.method) || msg.method.startsWith('WebMCP.')) this.events.push(rec);
    if (msg.method === 'Target.attachedToTarget') {
      // child session id is in PARAMS; msg.sessionId is the parent (null on browser endpoint)
      for (const fn of this.afterAttach) queueMicrotask(() => fn(msg.params.sessionId, msg.sessionId ?? null, msg.params));
    }
  }
  send(method, params = {}, sessionId = null) {
    const id = this.nextId++;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    return new Promise((res, rej) => {
      const timer = setTimeout(() => { this.pending.delete(id); rej(new Error(`timeout ${method}`)); }, 15000);
      this.pending.set(id, (m) => { clearTimeout(timer); res(m); });
      this.ws.send(JSON.stringify(msg));
    });
  }
  async cmd(method, params = {}, sessionId = null) {
    const m = await this.send(method, params, sessionId);
    if (m.error) return { ok: false, error: m.error };
    return { ok: true, result: m.result };
  }
  close() { try { this.ws.close(); } catch { /* noop */ } }
}

async function describeNode(cdp, sessionId, backendNodeId) {
  const r = await cdp.cmd('DOM.describeNode', { backendNodeId }, sessionId);
  if (!r.ok) return { ok: false, error: r.error.message ?? String(r.error) };
  const n = r.result.node;
  return { ok: true, nodeName: n.nodeName, frameId: n.frameId ?? null, attributes: n.attributes ?? [] };
}

function frameMap(frameTree) {
  const out = {};
  const walk = (ft) => {
    out[ft.frame.id] = { url: ft.frame.url, parentId: ft.frame.parentId ?? null, name: ft.frame.name ?? '' };
    for (const c of ft.childFrames ?? []) walk(c);
  };
  walk(frameTree.frameTree ?? frameTree);
  return out;
}

function eventTools(cdp, sinceT) {
  return cdp.events.filter((e) => e.t >= sinceT && e.method === 'WebMCP.toolsAdded');
}

// ---------------------------------------------------------------- main ------
async function main() {
  const report = {
    schema: 'tabi-r16-webmcp-probe-frames-v1',
    seat: 'WebmcpProbeFrames',
    generated: new Date().toISOString(),
    runtime: {
      node: process.version,
      chromium: null, chromiumSha256: sha256File(CHROMIUM), chromiumPath: CHROMIUM,
      flags: FLAGS,
    },
    origins: {}, hits: {}, phases: {}, events: {}, findings: {},
  };

  // Loopback HTTP origins: A on 127.0.0.1, B dual-stack ('::') so that
  // 127.0.0.1:<B> is same-site cross-origin and localhost:<B> is cross-site.
  const routesA = {};
  const routesB = {};
  const a = makeServer(routesA);
  const b = makeServer(routesB);
  const portA = await listen(a.server, '127.0.0.1');
  const portB = await listen(b.server, '::');
  Object.assign(routesA, {
    '/top.html': page({ title: 'top', html:
      toolForm('top_tool', 'Top page tool', 'tq') +
      `<iframe id="fa" src="/frame-a.html"></iframe>` +
      `<iframe id="fb" src="http://127.0.0.1:${portB}/frame-b.html"></iframe>` +
      `<iframe id="fc" src="http://localhost:${portB}/frame-c.html"></iframe>` }),
    '/frame-a.html': page({ title: 'frame-a', html: toolForm('frame_a_tool', 'Same-origin iframe tool', 'aq') }),
    '/popup.html': page({ title: 'popup', html: toolForm('popup_tool', 'Popup window tool', 'pq') }),
    '/newpage.html': page({ title: 'newpage', html: toolForm('newpage_tool', 'New page tool', 'nq') }),
  });
  Object.assign(routesB, {
    '/frame-b.html': page({ title: 'frame-b', html: toolForm('frame_b_tool', 'Cross-origin same-site iframe tool', 'bq') }),
    '/frame-c.html': page({ title: 'frame-c', html: toolForm('frame_c_tool', 'Cross-site loopback iframe tool', 'cq') }),
  });
  report.origins = {
    A: `http://127.0.0.1:${portA}`,
    B_same_site: `http://127.0.0.1:${portB}`,
    B_cross_site: `http://localhost:${portB}`,
  };

  // ---- chromium
  const profile = mkdtempSync(join(tmpdir(), 'wmc-frames-'));
  const stderrBuf = [];
  const child = spawn(CHROMIUM, [
    '--headless', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-popup-blocking',
    '--disable-background-networking', '--disable-component-update', '--disable-sync',
    '--disable-default-apps', '--disable-extensions', '--mute-audio',
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost',
    ...FLAGS, 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  child.stderr.on('data', (d) => stderrBuf.push(String(d)));

  const wsUrl = await (async () => {
    for (let i = 0; i < 200; i++) {
      const m = stderrBuf.join('').match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) return m[1];
      await sleep(100);
    }
    throw new Error('no DevTools endpoint');
  })();
  const ver = await fetch(wsUrl.replace('ws://', 'http://').replace(/\/devtools\/.*$/, '') + '/json/version')
    .then((r) => r.json()).catch(() => null);
  report.runtime.chromium = ver?.Browser ?? null;

  const cdp = new Cdp(wsUrl);
  await cdp.connect();
  const t0 = now();

  const topUrl = `http://127.0.0.1:${portA}/top.html`;
  const popupUrl = `http://127.0.0.1:${portA}/popup.html`;
  const newPageUrl = `http://127.0.0.1:${portA}/newpage.html`;
  // Target discovery events (targetCreated/Destroyed) need explicit opt-in.
  const discover = await cdp.cmd('Target.setDiscoverTargets', { discover: true });
  report.phases.setDiscoverTargets = discover;


  // ================================================================ PHASE A =
  // Single session on the page target only. No auto-attach: do iframe tools
  // reach the page session, and are popup tools invisible?
  const phaseA = { tools: [], describeNode: {}, evaluates: {}, targets: [] };
  {
    const t = await cdp.cmd('Target.createTarget', { url: 'about:blank' });
    const targetId = t.result.targetId;
    const att = await cdp.cmd('Target.attachToTarget', { targetId, flatten: true });
    const S = att.result.sessionId;
    phaseA.pageTargetId = targetId;
    phaseA.pageSessionId = S;

    phaseA.webmcpEnable = await cdp.cmd('WebMCP.enable', {}, S);
    await cdp.cmd('Page.enable', {}, S);
    await cdp.cmd('Runtime.enable', {}, S);
    const nav = await cdp.cmd('Page.navigate', { url: topUrl }, S);
    phaseA.navigate = nav.ok ? nav.result : nav;
    await sleep(SETTLE_MS);

    const frameTree = await cdp.cmd('Page.getFrameTree', {}, S);
    phaseA.frameTree = frameTree.ok ? frameMap(frameTree.result) : frameTree;
    const toolsEv = eventTools(cdp, t0);
    phaseA.tools = toolsEv.map((e) => ({ sessionId: e.sessionId, tools: e.params.tools }));
    phaseA.toolNames = toolsEv.flatMap((e) => e.params.tools.map((x) => x.name));

    phaseA.evaluates.top = await cdp.cmd('Runtime.evaluate', {
      expression: `JSON.stringify({
        doc: typeof document.modelContext,
        navIn: ('modelContext' in navigator),
        frameA_mc: (()=>{try{return typeof document.getElementById('fa').contentDocument.modelContext}catch(e){return 'ERR:'+e.name}})(),
        frameB_doc: (()=>{try{const d=document.getElementById('fb').contentDocument;return d===null?'null':typeof d.modelContext}catch(e){return 'ERR:'+e.name}})()
      })`,
      returnByValue: true,
    }, S);

    // describeNode for each tool backendNodeId on its emitting session
    await cdp.cmd('DOM.getDocument', { depth: 1 }, S);
    for (const e of toolsEv) {
      for (const tool of e.params.tools) {
        if (tool.backendNodeId === undefined) continue;
        phaseA.describeNode[`${tool.name}@emittingSession`] =
          await describeNode(cdp, e.sessionId, tool.backendNodeId);
      }
    }

    // popup opened from page JS: does its tool ever reach the page session?
    const before = now();
    phaseA.popupOpen = await cdp.cmd('Runtime.evaluate', {
      expression: `(()=>{const w=window.open(${JSON.stringify(popupUrl)},'_blank','width=320,height=240');return w?'opened':'blocked'})()`,
      userGesture: true, returnByValue: true,
    }, S);
    await sleep(SETTLE_MS);
    phaseA.popup = {
      targetsCreated: cdp.events.filter((e) => e.t >= before && e.method === 'Target.targetCreated')
        .map((e) => e.params.targetInfo),
      toolsAddedAfterPopup: eventTools(cdp, before).map((e) => ({
        sessionId: e.sessionId, tools: e.params.tools.map((x) => x.name),
      })),
    };

    // Late attach: a second session on the SAME page target — does
    // WebMCP.enable replay already-registered tools?
    const att2 = await cdp.cmd('Target.attachToTarget', { targetId, flatten: true });
    const S2 = att2.result.sessionId;
    const before2 = now();
    const en2 = await cdp.cmd('WebMCP.enable', {}, S2);
    await sleep(1200);
    phaseA.lateAttach = {
      sessionId: S2, webmcpEnable: en2,
      toolsAdded: eventTools(cdp, before2).map((e) => ({
        sessionId: e.sessionId, tools: e.params.tools.map((x) => x.name),
      })),
    };
    phaseA.targets = (await cdp.cmd('Target.getTargets')).result?.targetInfos ?? [];
  }
  report.phases.A_no_autoattach = phaseA;
  report.events.A = cdp.events.filter((e) => e.t >= t0);

  // ================================================================ PHASE B =
  // flatten auto-attach with waitForDebuggerOnStart: every new target pauses,
  // we enable domains on its own session, then resume.
  const phaseB = { attached: [], tools: [], describeNode: {}, enables: {}, targets: [] };
  {
    const mark = cdp.events.length;
    const seen = new Map(); // sessionId -> targetInfo
    cdp.afterAttach.push(async (childSessionId, parentSessionId, params) => {
      const ti = params.targetInfo;
      seen.set(childSessionId, ti);
      phaseB.attached.push({
        sessionId: childSessionId, parentSessionId, targetId: ti.targetId, type: ti.type,
        url: ti.url, title: ti.title, openerId: ti.openerId ?? null,
        waitingForDebugger: params.waitingForDebugger ?? null,
      });
      if (seen.size > 64) return; // safety bound
      // Recursive auto-attach on the child session so OOPIF (type=iframe)
      // targets underneath a page also get sessions in flat mode.
      const aa = await cdp.cmd('Target.setAutoAttach',
        { autoAttach: true, waitForDebuggerOnStart: true, flatten: true }, childSessionId);
      (phaseB.enables[`Target.setAutoAttach@${ti.type}`] ??= []).push(
        { sessionId: childSessionId, ok: aa.ok, error: aa.ok ? undefined : aa.error?.message });
      for (const m of ['WebMCP.enable', 'Page.enable', 'Runtime.enable']) {
        const r = await cdp.cmd(m, {}, childSessionId);
        const key = `${m}@${ti.type}`;
        (phaseB.enables[key] ??= []).push(
          { sessionId: childSessionId, ok: r.ok, error: r.ok ? undefined : r.error?.message });
      }
      const g = await cdp.cmd('DOM.getDocument', { depth: 1 }, childSessionId);
      (phaseB.enables[`DOM.getDocument@${ti.type}`] ??= []).push(
        { sessionId: childSessionId, ok: g.ok, error: g.ok ? undefined : g.error?.message });
      await cdp.cmd('Runtime.runIfWaitingForDebugger', {}, childSessionId);
    });

    await cdp.cmd('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
    const t = await cdp.cmd('Target.createTarget', { url: topUrl });
    phaseB.pageTargetId = t.result.targetId;
    await sleep(SETTLE_MS + 2500);

    // Identify the page session among auto-attached sessions.
    const pageSession = [...seen.entries()].find(([, ti]) => ti.type === 'page' && ti.url === topUrl)?.[0] ?? null;
    phaseB.pageSessionId = pageSession;

    // popup + explicit new-page target under auto-attach
    if (pageSession) {
      phaseB.popupOpen = await cdp.cmd('Runtime.evaluate', {
        expression: `(()=>{const w=window.open(${JSON.stringify(popupUrl)},'_blank','width=320,height=240');return w?'opened':'blocked'})()`,
        userGesture: true, returnByValue: true,
      }, pageSession);
    }
    await cdp.cmd('Target.createTarget', { url: newPageUrl });
    await sleep(SETTLE_MS + 1000);

    const evB = cdp.events.slice(mark);
    phaseB.tools = evB.filter((e) => e.method === 'WebMCP.toolsAdded').map((e) => ({
      sessionId: e.sessionId,
      target: seen.get(e.sessionId) ? { type: seen.get(e.sessionId).type, url: seen.get(e.sessionId).url } : null,
      tools: e.params.tools,
    }));
    if (pageSession) {
      const ft = await cdp.cmd('Page.getFrameTree', {}, pageSession);
      phaseB.frameTree = ft.ok ? frameMap(ft.result) : ft;
    }
    phaseB.targets = (await cdp.cmd('Target.getTargets')).result?.targetInfos ?? [];

    // describeNode matrix: emitting session vs page session
    for (const rec of phaseB.tools) {
      for (const tool of rec.tools) {
        if (tool.backendNodeId === undefined) continue;
        phaseB.describeNode[`${tool.name}@emitting`] =
          await describeNode(cdp, rec.sessionId, tool.backendNodeId);
        if (pageSession && rec.sessionId !== pageSession) {
          phaseB.describeNode[`${tool.name}@pageSession`] =
            await describeNode(cdp, pageSession, tool.backendNodeId);
        }
      }
    }
    report.events.B = evB;
  }
  report.phases.B_flatten_autoattach = phaseB;
  report.hits = { A: a.hits, B: b.hits };

  // ---------------------------------------------------------------- summary -
  const namesA = phaseA.toolNames ?? [];
  const namesB = phaseB.tools.flatMap((r) => r.tools.map((x) => x.name));
  report.findings = {
    phaseA_tools_on_page_session: namesA,
    phaseA_missing_tools: ['top_tool', 'frame_a_tool', 'frame_b_tool', 'frame_c_tool', 'popup_tool']
      .filter((n) => !namesA.includes(n)),
    phaseB_tools: phaseB.tools.map((r) => ({
      names: r.tools.map((x) => x.name), targetType: r.target?.type, targetUrl: r.target?.url,
    })),
    phaseB_all_tools: namesB,
    lateAttach_replay: phaseA.lateAttach?.toolsAdded?.flatMap((e) => e.tools) ?? [],
    popup_needs_own_session: !namesA.includes('popup_tool') && namesB.includes('popup_tool'),
  };

  writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`WEBMCP_FRAMES A_tools=[${namesA.join(',')}] B_sessions=${phaseB.attached.length} B_tools=[${namesB.join(',')}] -> ${OUT}`);

  cdp.close();
  child.kill('SIGKILL');
  await new Promise((r) => a.server.close(r));
  await new Promise((r) => b.server.close(r));
  rmSync(profile, { recursive: true, force: true });
}

main().catch((e) => { console.error('PROBE_FAIL', e); process.exit(1); });
