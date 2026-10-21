#!/usr/bin/env node
// Finite loopback observations, not a browser conformance suite. No host profile.
// Pending means only no correlated response in the recorded observation window.
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SELF), '..');
export const CASES = [
  ['na-pending', false, 'none', 'success'],
  ['na-click', false, 'click', 'success'],
  ['na-requestsubmit', false, 'requestSubmit', 'success'],
  ['na-native-submit', false, 'submit', 'success'],
  ['na-reset', false, 'reset', 'success'],
  ['na-remove', false, 'remove', 'success'],
  ['na-reject', false, 'requestSubmit', 'reject'],
  ['na-throw', false, 'requestSubmit', 'throw'],
  ['na-delayed', false, 'requestSubmit', 'delayed'],
  ['na-invalid-submit', false, 'invalidRequestSubmit', 'success'],
  ['auto-positive', true, 'none', 'success'],
  ['auto-invalid', true, 'none', 'invalid'],
];
const FLAGS = ['--enable-features=CDPScreenshotNewSurface,WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp', '--enable-blink-features=WebMCP,WebMCPTesting', '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1', '--disable-extensions'];
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const save = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
const canonical = (value) => JSON.stringify(value);
function playwright() {
  const candidates = [resolve(dirname(process.execPath), '..', 'lib/node_modules/playwright'), '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright', ...(process.env.NODE_PATH || '').split(':').filter(Boolean).map((p) => join(p, 'playwright'))];
  for (const dir of candidates) {
    if (!existsSync(join(dir, 'package.json'))) continue;
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json')));
    if (pkg.name !== 'playwright') continue;
    if (pkg.version !== '1.64.0') throw new Error('playwright_version_mismatch');
    return createRequire(join(dir, 'index.js'))('playwright');
  }
  throw new Error('playwright_unresolved');
}
function processTree(profile) {
  const all = [];
  for (const id of readdirSync('/proc').filter((n) => /^\d+$/.test(n))) {
    try {
      const cmd = readFileSync(`/proc/${id}/cmdline`, 'utf8').split('\0');
      const status = readFileSync(`/proc/${id}/status`, 'utf8');
      all.push({ pid: Number(id), ppid: Number(status.match(/^PPid:\s+(\d+)/m)?.[1]), root: cmd.includes(`--user-data-dir=${profile}`) });
    } catch (error) { if (!['ENOENT', 'ESRCH', 'EACCES'].includes(error.code)) throw error; }
  }
  const owned = new Set(all.filter((p) => p.root).map((p) => p.pid));
  let previous;
  do { previous = owned.size; for (const p of all) if (owned.has(p.ppid)) owned.add(p.pid); } while (previous !== owned.size);
  return [...owned].sort((a, b) => a - b);
}
function alive(pids) { return pids.filter((pid) => existsSync(`/proc/${pid}`)); }
function fixture(id, nonce, autosubmit, mode) {
  return `<!doctype html><meta charset="utf-8"><title>${id}</title>
<form id="f" toolname="lifecycle" tooldescription="Dummy loopback lifecycle" ${autosubmit ? 'toolautosubmit' : ''} action="/landing" method="get">
<label>Dummy<input name="q" required ${mode === 'invalid' ? 'type="email"' : ''}></label><button id="go" type="submit">Run</button></form>
<script>
window.observations={nonce:${JSON.stringify(nonce)},submits:[],errors:[]};
window.addEventListener('error',e=>observations.errors.push(e.message));
f.addEventListener('submit',e=>{
 observations.submits.push({agentInvoked:e.agentInvoked,isTrusted:e.isTrusted,q:f.elements.q.value,active:f.matches(':tool-form-active'),respondWith:typeof e.respondWith});
 e.preventDefault();
 const mode=${JSON.stringify(mode)};
 if(mode==='throw') throw Error('dummy submit handler throw');
 const value={ok:true,nonce:${JSON.stringify(nonce)},q:f.elements.q.value};
 if(mode==='reject') e.respondWith(Promise.reject(Error('dummy rejection')));
 else if(mode==='delayed') e.respondWith(new Promise(resolve=>{window.release=()=>resolve(value)}));
 else e.respondWith(Promise.resolve(value));
});
</script>`;
}
export async function run(out) {
  if (process.version !== 'v24.21.0') throw new Error('node_version_mismatch');
  if (existsSync(out)) throw new Error('output_exists');
  mkdirSync(out, { recursive: true });
  const temp = mkdtempSync(join(tmpdir(), 'tabi-r21-lifecycle-'));
  const pw = playwright();
  const routes = new Map();
  const requests = [];
  const server = createServer((req, res) => {
    requests.push({ at: Date.now(), method: req.method, url: req.url });
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
    if (req.url.startsWith('/landing')) {
      res.setHeader('Content-Type', 'text/html');
      res.end('<!doctype html><title>Dummy landing</title><script type="application/ld+json">{"dummy":"landing"}</script>');
      return;
    }
    const body = routes.get(req.url);
    res.writeHead(body ? 200 : 404, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' });
    res.end(body || 'not found');
  });
  await new Promise((ok, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', ok); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const receipt = { schema: 'tabi-round21-runtime-v1', startedAt: new Date().toISOString(), producer: { path: 'scripts/webmcp-lifecycle-round21.mjs', sha256: sha(readFileSync(SELF)) }, environment: { node: process.version, chromium: null, playwright: '1.64.0', flags: FLAGS }, cases: [], cleanup: { browserClosed: false, serverClosed: false } };
  let context = null;
  let abortSignal = null;
  const onSignal = (signal) => { abortSignal = signal; context?.close().catch(() => {}); };
  const signalHandlers = new Map(['SIGINT', 'SIGHUP', 'SIGTERM'].map((s) => [s, () => onSignal(s)]));
  for (const [s, handler] of signalHandlers) process.once(s, handler);
  try {
    for (const [id, autosubmit, action, mode] of CASES) {
      if (abortSignal) throw new Error(`run_aborted:${abortSignal}`);
      const nonce = randomUUID();
      const html = fixture(id, nonce, autosubmit, mode);
      writeFileSync(join(out, `${id}.html`), html);
      routes.set(`/${id}`, html);
      const profile = join(temp, id);
      const evidence = { schema: 'tabi-round21-case-v1', id, nonce, autosubmit, action, mode, fixture: { path: `corpus/evidence/round-21/runtime/${id}.html`, sha256: sha(html) }, frames: [], pageObservations: [], browserPidsBefore: [], browserPidsAfter: [], contextClosed: false, blocked: [], downloads: [] };
      let seq = 0;
      const frame = (dir, data) => evidence.frames.push({ seq: ++seq, at: Date.now(), dir, ...data });
      try {
        context = await pw.chromium.launchPersistentContext(profile, { executablePath: '/usr/bin/chromium', headless: true, acceptDownloads: false, args: FLAGS, ignoreDefaultArgs: ['--enable-features=CDPScreenshotNewSurface'], timeout: 20000, env: { PATH: process.env.PATH, HOME: temp, TMPDIR: temp, LANG: 'C.UTF-8' } });
        const browser = context.browser();
        receipt.environment.chromium = browser.version();
        if (browser.version() !== '154.0.8037.97') throw new Error('chromium_version_mismatch');
        evidence.browserPidsBefore = processTree(profile);
        if (!evidence.browserPidsBefore.length) throw new Error('browser_pid_set_empty');
        await context.route('**/*', async (route) => {
          const url = new URL(route.request().url());
          if (url.origin === origin && route.request().method() === 'GET') await route.continue();
          else { evidence.blocked.push(route.request().url()); await route.abort(); }
        });
        const page = context.pages()[0];
        page.on('download', () => evidence.downloads.push({ at: Date.now() }));
        const cdp = await context.newCDPSession(page);
        for (const method of ['WebMCP.toolsAdded', 'WebMCP.toolInvoked', 'WebMCP.toolResponded', 'Page.frameNavigated']) cdp.on(method, (params) => frame('event', { method, params }));
        let commandId = 0;
        async function send(method, params = {}) {
          const command = ++commandId;
          frame('sent', { command, method, params });
          try { const result = await cdp.send(method, params); frame('result', { command, result }); return result; }
          catch (error) { frame('error', { command, message: error.message }); throw error; }
        }
        async function observe(label) {
          const value = await page.evaluate(() => ({ ...window.observations, url: location.href, secureContext: isSecureContext, formExists: !!document.querySelector('#f'), formActive: !!document.querySelector('#f')?.matches(':tool-form-active'), value: document.querySelector('[name=q]')?.value ?? null, focused: document.activeElement?.id ?? null }));
          const record = { label, at: Date.now(), value };
          evidence.pageObservations.push(record);
          return record;
        }
        await send('Page.enable');
        await page.goto(`${origin}/${id}`, { waitUntil: 'load', timeout: 15000 });
        await send('WebMCP.enable');
        const tree = await send('Page.getFrameTree');
        const tools = evidence.frames.filter((x) => x.method === 'WebMCP.toolsAdded').flatMap((x) => x.params.tools || []);
        if (!tools.some((t) => t.name === 'lifecycle')) throw new Error('tool_not_registered');
        let invocationId = null, invokeError = null;
        try { invocationId = (await send('WebMCP.invokeTool', { frameId: tree.frameTree.frame.id, toolName: 'lifecycle', input: { q: mode === 'invalid' ? 'not-an-email' : nonce } })).invocationId; }
        catch (error) { invokeError = error.message; }
        const preStart = Date.now();
        await sleep(250);
        const pre = await observe('pre-action');
        const responses = () => evidence.frames.filter((x) => x.method === 'WebMCP.toolResponded' && x.params.invocationId === invocationId).map((x) => x.params);
        const preAction = { start: preStart, end: pre.at, windowMs: pre.at - preStart, responseCount: responses().length, formActive: pre.value.formActive };
        const actionAt = Date.now();
        frame('action', { action });
        if (action === 'click') await page.locator('#go').click({ timeout: 5000 });
        else if (action === 'requestSubmit') await page.evaluate(() => document.querySelector('#f').requestSubmit());
        else if (action === 'submit') await page.evaluate(() => document.querySelector('#f').submit());
        else if (action === 'reset') await page.evaluate(() => document.querySelector('#f').reset());
        else if (action === 'remove') await page.evaluate(() => document.querySelector('#f').remove());
        else if (action === 'invalidRequestSubmit') await page.evaluate(() => { document.querySelector('[name=q]').value = ''; document.querySelector('#f').requestSubmit(); });
        if (mode === 'delayed') { await sleep(250); await observe('delayed-before-release'); frame('release', {}); await page.evaluate(() => window.release()); }
        await sleep(500);
        const post = await observe('after-action');
        const after = { start: actionAt, end: post.at, windowMs: post.at - actionAt, responses: responses(), submits: post.value.submits || [], navigations: evidence.frames.filter((x) => x.method === 'Page.frameNavigated' && x.at >= actionAt).map((x) => x.params), pageState: post.value };
        receipt.cases.push({ id, nonce, autosubmit, action, invocationId, invokeError, preAction, after, evidence: { path: `corpus/evidence/round-21/runtime/${id}.json`, sha256: null } });
      } finally {
        if (context) { await context.close(); context = null; evidence.contextClosed = true; }
        for (let i = 0; i < 40 && alive(evidence.browserPidsBefore).length; i++) await sleep(50);
        evidence.browserPidsAfter = alive(evidence.browserPidsBefore);
        save(join(out, `${id}.json`), evidence);
        const record = receipt.cases.find((c) => c.id === id);
        if (record) record.evidence.sha256 = sha(readFileSync(join(out, `${id}.json`)));
      }
      const evidenceAfter = JSON.parse(readFileSync(join(out, `${id}.json`)));
      if (evidenceAfter.browserPidsAfter.length || evidenceAfter.blocked.length || evidenceAfter.downloads.length) throw new Error(`case_boundary_failure:${id}`);
      console.log(`LIFECYCLE_OBSERVED ${id} pre=${receipt.cases.at(-1).preAction.responseCount} statuses=${receipt.cases.at(-1).after.responses.map((r) => r.status).join(',') || 'none-in-window'}`);
    }
    receipt.cleanup.browserClosed = receipt.cases.length === CASES.length;
  } finally {
    if (context) { await context.close(); context = null; }
    server.closeAllConnections();
    await new Promise((ok, fail) => server.close((error) => error ? fail(error) : ok()));
    receipt.cleanup.serverClosed = !server.listening;
    receipt.finishedAt = new Date().toISOString();
    receipt.requests = requests;
    for (const [s, handler] of signalHandlers) process.removeListener(s, handler);
    if (!abortSignal) save(join(out, 'receipt.json'), receipt);
    rmSync(temp, { recursive: true, force: true });
  }
  if (abortSignal) throw new Error(`run_aborted:${abortSignal}`);
  return receipt;
}
if (process.argv[1] && resolve(process.argv[1]) === SELF) {
  if (process.argv.length !== 4 || process.argv[2] !== '--out') { console.error('usage: node scripts/webmcp-lifecycle-round21.mjs --out NEW_DIRECTORY'); process.exitCode = 2; }
  else run(resolve(process.argv[3])).then((receipt) => { console.log(canonical({ verdict: 'observed', cases: receipt.cases.length, cleanup: receipt.cleanup })); }, (error) => { console.error(error.stack); process.exitCode = error.message.startsWith('run_aborted:') ? 2 : 1; });
}
