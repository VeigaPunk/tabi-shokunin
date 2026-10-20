// WebmcpProbeDeclarative.mjs — round 16 C2 probe (seat: TabiR16.WebmcpProbeDeclarative-5)
//
// Observes how Chromium 154 derives WebMCP Tool.inputSchema from DECLARATIVE
// <form toolname tooldescription> markup over loopback HTTP:
//   - per-input-type schema mapping (text/number/email/checkbox/hidden/…)
//   - `required` attribute -> inputSchema.required (incl. radio groups)
//   - <select>/<option> -> enum/anyOf, multiple -> array, <textarea>
//   - <fieldset> + radio group -> enum of values; per-radio labels
//   - parameter description sources: toolparamdescription / title /
//     toolparamtitle / aria-label / placeholder / <label>
//   - string-constraint attrs (pattern/maxlength/minlength/value/readonly/
//     disabled), datalist, form= out-of-form association, form-associated
//     custom elements, file input under its own flag
//   - toolautosubmit -> annotations.autosubmit; missing submit button
//   - malformed declarative forms (missing toolname / tooldescription /
//     parameter names) -> tools absent or degraded + Audits issues
//   - DOM reflection surface for the tool* content attributes
//
// Two runs: 'plan-flags' (the harness flag set from PLAN.md) and
// 'plus-declarative-flags' (adds WebMCPDeclarativeFileInput and
// WebMCPFormAssociatedCustomElements to --enable-features).
//
// Records exact WebMCP.* events, Audits.issueAdded payloads,
// document.modelContext.getTools() results and DOM facts into
// WebmcpProbeDeclarative.json (same dir).
//
// Usage:
//   node WebmcpProbeDeclarative.mjs            # all runs, writes .json
//   node WebmcpProbeDeclarative.mjs --stdout   # print JSON, do not write
//
// Loopback only (127.0.0.1): node http server bound to 127.0.0.1:0, page
// route aborts any non-loopback request. Fresh playwright temp profile;
// never the user's profile, never a real site. No persistence besides the
// sibling .json owned by this seat.

import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_JSON = join(HERE, 'WebmcpProbeDeclarative.json');
const STDOUT_ONLY = process.argv.includes('--stdout');
const CHROMIUM = process.env.WEBMCP_CHROMIUM || '/usr/bin/chromium';
const SETTLE_MS = 1600;
const BASE_FEATURES = 'WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp';
const RUNS = [
  {
    label: 'plan-flags',
    flags: [
      `--enable-features=${BASE_FEATURES}`,
      '--enable-blink-features=WebMCP,WebMCPTesting',
    ],
    pages: ['matrix', 'extra', 'malformed'],
  },
  {
    label: 'plus-declarative-flags',
    flags: [
      `--enable-features=${BASE_FEATURES},WebMCPDeclarativeFileInput,WebMCPFormAssociatedCustomElements`,
      '--enable-blink-features=WebMCP,WebMCPTesting,WebMCPDeclarativeFileInput,WebMCPFormAssociatedCustomElements',
    ],
    pages: ['matrix', 'extra'],
  },
];

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function loadPlaywright() {
  // Probe-only loader: playwright resolved from the global npm root
  // (same runtime pinned in corpus/evidence/round-16/webmcp/runtime-pin.json).
  const npmRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
  const req = createRequire(join(npmRoot, 'playwright', 'package.json'));
  const pkg = JSON.parse(readFileSync(join(npmRoot, 'playwright', 'package.json'), 'utf8'));
  return { playwright: req('playwright'), version: pkg.version };
}

// ---- fixture pages -------------------------------------------------------
// Served from memory; each form gets a unique toolname so every toolsAdded
// payload is attributable. action="/noop" + a real submit button (except the
// two negative controls) keeps parsing deterministic.

const PAGE_MATRIX = `<!doctype html><meta charset="utf-8"><title>decl matrix</title>
<form id="f-basic" toolname="basic" tooldescription="Basic field types" action="/noop" method="get">
  <input type="text" name="q" required>
  <input type="number" name="n" min="1" max="10" step="0.5">
  <input type="email" name="em" required>
  <input type="checkbox" name="ok" value="yes">
  <button type="submit">Go</button>
</form>
<form id="f-select" toolname="selectenum" tooldescription="Select and textarea" action="/noop" method="get">
  <select name="choice">
    <option value="a">Alpha</option>
    <option value="b">Beta</option>
    <option value="c">Gamma</option>
  </select>
  <select name="multi" multiple>
    <option value="x">X</option>
    <option value="y">Y</option>
  </select>
  <textarea name="notes" required></textarea>
  <button type="submit">Go</button>
</form>
<form id="f-radio" toolname="radiogroup" tooldescription="Radio group inside fieldset" action="/noop" method="get">
  <fieldset>
    <legend>Size</legend>
    <input type="radio" name="size" value="s" required>
    <input type="radio" name="size" value="m">
    <input type="radio" name="size" value="l">
  </fieldset>
  <input type="checkbox" name="extra" required>
  <button type="submit">Go</button>
</form>
<form id="f-desc" toolname="descattrs" tooldescription="Parameter description attribute candidates" action="/noop" method="get">
  <input name="p1" toolparamdescription="desc via toolparamdescription">
  <input name="p2" title="desc via title">
  <input name="p3" toolparamtitle="desc via toolparamtitle">
  <input name="p4" aria-label="desc via aria-label">
  <input name="p5" placeholder="desc via placeholder">
  <input name="p6" toolparamdescription="tpd wins" title="title also present">
  <label>wrapped label <input name="p7"></label>
  <label for="p8id">label-by-for</label>
  <input id="p8id" name="p8">
  <button type="submit">Go</button>
</form>
<form id="f-autosub" toolname="autosub" tooldescription="Autosubmit, no submit button" toolautosubmit action="/noop" method="get">
  <input name="a" required>
</form>
<form id="f-nosubmit" toolname="nosubmit" tooldescription="No submit, no autosubmit" action="/noop" method="get">
  <input name="a">
</form>
<form id="f-types" toolname="types" tooldescription="Many input types" action="/noop" method="get">
  <input type="hidden" name="h" value="fixed">
  <input type="password" name="pw">
  <input type="date" name="d">
  <input type="range" name="r" min="0" max="100">
  <input type="file" name="f">
  <input type="url" name="u">
  <input type="tel" name="t">
  <input type="search" name="s">
  <input type="color" name="c">
  <input type="datetime-local" name="dt">
  <input type="month" name="mo">
  <input type="week" name="wk">
  <input type="time" name="tm">
  <input type="number" name="reqnum" required>
  <input type="button" name="btn" value="not-a-param">
  <button type="submit">Go</button>
</form>
<form id="f-tooltitle" toolname="withtitle" tooldescription="Has tooltitle" tooltitle="Tool-level title" action="/noop" method="get">
  <input name="tt" tooltitle="param tooltitle" toolparamdescription="tt desc"><button type="submit">Go</button>
</form>`;

const PAGE_EXTRA = `<!doctype html><meta charset="utf-8"><title>decl extra</title>
<script>
customElements.define('my-param', class extends HTMLElement {
  static formAssociated = true;
  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.setFormValue('ce-value');
    try {
      this._internals.setToolParamSchema({ type: 'object', properties: { x: { type: 'string' } } });
    } catch (e) {
      this._internals.setToolParamSchema('{"type":"object","properties":{"x":{"type":"string"}}}');
    }
  }
});
<script>
window.__ceProbe = (() => {
  const el = document.createElement('div');
  // probe on the already-defined class via a fresh instance
  const inst = new (customElements.get('my-param'))();
  const internals = inst.attachInternals ? inst._internals : null;
  const protoKeys = internals ? Object.getOwnPropertyNames(Object.getPrototypeOf(internals)).filter(k => /tool|param|schema/i.test(k)) : null;
  return {
    hasSetToolParamSchema: internals ? typeof internals.setToolParamSchema : 'no-internals',
    internalsProtoKeys: protoKeys,
  };
})();
</script>
<form id="f-constraints" toolname="constraints" tooldescription="String and numeric constraints" action="/noop" method="get">
  <input name="ml" maxlength="10" minlength="3" toolparamdescription="len param">
  <input name="def" value="preset" toolparamdescription="default param">
  <input name="ro" readonly toolparamdescription="readonly param">
  <input name="dis" disabled toolparamdescription="disabled param">
  <input type="number" name="nb" toolparamdescription="bare number">
  <input type="checkbox" name="ck" toolparamdescription="checkbox no value">
  <textarea name="ta" maxlength="20" toolparamdescription="textarea len"></textarea>
  <select name="reqsel" required toolparamdescription="required select">
    <option value="">pick</option>
    <option value="a">A</option>
  </select>
  <button type="submit">Go</button>
</form>
<form id="f-radiolabels" toolname="radiolabels" tooldescription="Radio with labels and tpd" action="/noop" method="get">
  <input type="radio" name="r" value="1" id="r1"><label for="r1">One</label>
  <input type="radio" name="r" value="2" id="r2"><label for="r2"><input type="hidden">Two</label>
  <input type="radio" name="r" value="3" toolparamdescription="Three desc">
  <input type="radio" name="r" value="4">
  <button type="submit">Go</button>
</form>
<form id="f-datalist" toolname="datalist" tooldescription="Datalist options" action="/noop" method="get">
  <input name="dl" list="dl1" toolparamdescription="datalist param">
  <datalist id="dl1"><option value="aa"><option value="bb"></datalist>
  <button type="submit">Go</button>
</form>
<form id="f-outside" toolname="outside" tooldescription="Out-of-form association" action="/noop" method="get">
  <button type="submit">Go</button>
</form>
<input form="f-outside" name="external" toolparamdescription="outside via form attr">
<form id="f-face" toolname="face" tooldescription="Form-associated custom element" action="/noop" method="get">
  <my-param name="cep" toolparamdescription="custom element desc"></my-param>
  <input name="plain" toolparamdescription="sibling plain input">
  <button type="submit">Go</button>
</form>
<form id="f-ckgroup" toolname="ckgroup" tooldescription="Same-name checkbox group" action="/noop" method="get">
  <input type="checkbox" name="fruit" value="a" toolparamdescription="fruits">
  <input type="checkbox" name="fruit" value="b">
  <input type="checkbox" name="fruit" value="c">
  <button type="submit">Go</button>
</form>
<form id="f-dupname" toolname="dupname" tooldescription="Duplicate text name" action="/noop" method="get">
  <input name="dup" toolparamdescription="first dup">
  <input name="dup" toolparamdescription="second dup">
  <input name="ok" toolparamdescription="ok field">
  <button type="submit">Go</button>
</form>
<form id="f-hidden" toolname="hiddenparams" tooldescription="Hidden inputs" action="/noop" method="get">
  <input type="hidden" name="hv" value="fixed" toolparamdescription="hidden described">
  <input type="hidden" name="hplain" value="x">
  <button type="submit">Go</button>
</form>
`;


const PAGE_MALFORMED = `<!doctype html><meta charset="utf-8"><title>decl malformed</title>
<form id="f-notoolname" tooldescription="has description, no toolname" action="/noop" method="get">
  <input name="x"><button type="submit">Go</button>
</form>
<form id="f-notooldesc" toolname="nodesc" action="/noop" method="get">
  <input name="x"><button type="submit">Go</button>
</form>
<form id="f-noname-req" toolname="nonamereq" tooldescription="required param missing name" action="/noop" method="get">
  <input required><button type="submit">Go</button>
</form>
<form id="f-noname-opt" toolname="nonameopt" tooldescription="optional param missing name" action="/noop" method="get">
  <input><input name="named"><button type="submit">Go</button>
</form>
<form id="f-emptytoolname" toolname="" tooldescription="empty toolname" action="/noop" method="get">
  <input name="x"><button type="submit">Go</button>
</form>
<form id="f-emptytooldesc" toolname="emptydesc" tooldescription="" action="/noop" method="get">
  <input name="x"><button type="submit">Go</button>
</form>`;

const PAGES = {
  matrix: PAGE_MATRIX,
  extra: PAGE_EXTRA,
  malformed: PAGE_MALFORMED,
};

// ---- server --------------------------------------------------------------

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const key = (req.url || '/').replace(/^\//, '').replace(/\?.*$/, '');
      const body = PAGES[key];
      if (body) {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(body);
      } else {
        res.writeHead(204);
        res.end();
      }
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}

// ---- in-page probes ------------------------------------------------------

async function domFacts(page) {
  return page.evaluate(async () => {
    const form = document.getElementById('f-basic') || document.querySelector('form');
    const auto = document.getElementById('f-autosub');
    const input = form ? form.querySelector('input') : null;
    const probeProps = (obj, names) => {
      const out = {};
      for (const n of names) {
        out[n] = obj ? { in: n in obj, value: obj[n] ?? null } : { in: false, value: null };
      }
      return out;
    };
    const mc = document.modelContext;
    let mcProto = null;
    let tools = null;
    let toolsError = null;
    if (mc) {
      mcProto = Object.getOwnPropertyNames(Object.getPrototypeOf(mc));
      try {
        const raw = await mc.getTools();
        tools = raw.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: typeof t.inputSchema === 'string' ? JSON.parse(t.inputSchema) : (t.inputSchema ?? null),
          inputSchemaSerializedAs: typeof t.inputSchema,
          annotations: t.annotations ?? null,
          protoKeys: Object.getOwnPropertyNames(Object.getPrototypeOf(t)),
          ownKeys: Object.getOwnPropertyNames(t),
        }));
      } catch (e) {
        toolsError = String(e);
      }
    }
    return {
      documentModelContext: 'modelContext' in document ? typeof mc : 'absent',
      navigatorModelContext: 'modelContext' in navigator,
      modelContextProtoKeys: mcProto,
      modelContextGetTools: tools,
      modelContextGetToolsError: toolsError,
      formReflection: probeProps(form, [
        'toolname', 'toolName', 'tooldescription', 'toolDescription',
        'toolautosubmit', 'toolAutosubmit', 'toolAutoSubmit', 'autosubmit',
      ]),
      autoSubmitFormReflection: probeProps(auto, [
        'toolautosubmit', 'toolAutosubmit', 'toolAutoSubmit', 'autosubmit',
      ]),
      formProtoKeys: Object.getOwnPropertyNames(HTMLFormElement.prototype)
        .filter((k) => /tool|auto/i.test(k)),
      inputReflection: probeProps(input, [
        'toolparamdescription', 'toolParamDescription',
        'toolparamtitle', 'toolParamTitle', 'toolparamname', 'toolParamName',
      ]),
      inputProtoKeys: Object.getOwnPropertyNames(HTMLInputElement.prototype)
        .filter((k) => /tool|param/i.test(k)),
      selectProtoKeys: Object.getOwnPropertyNames(HTMLSelectElement.prototype)
        .filter((k) => /tool|param/i.test(k)),
      textareaProtoKeys: Object.getOwnPropertyNames(HTMLTextAreaElement.prototype)
        .filter((k) => /tool|param/i.test(k)),
    };
  });
}

// ---- one run -------------------------------------------------------------

async function runScenario(playwright, run, port) {
  const events = [];
  const issues = [];
  const browser = await playwright.chromium.launch({
    executablePath: CHROMIUM,
    headless: true,
    chromiumSandbox: false,
    args: run.flags,
  });
  try {
    const context = await browser.newContext();
    await context.route('**/*', (route) => {
      const url = new URL(route.request().url());
      const loopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
      if (loopback) return route.continue();
      return route.abort('blockedbyclient');
    });
    const enableResults = {};
    const facts = {};
    for (const label of run.pages) {
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      for (const method of ['WebMCP.toolsAdded', 'WebMCP.toolsRemoved', 'WebMCP.toolInvoked', 'WebMCP.toolResponded']) {
        cdp.on(method, (params) => events.push({ page: label, method, params }));
      }
      cdp.on('Audits.issueAdded', (params) => issues.push({ page: label, payload: params }));
      enableResults[label] = {
        'WebMCP.enable': await cdp.send('WebMCP.enable'),
        'Audits.enable': await cdp.send('Audits.enable'),
      };
      await page.goto(`http://127.0.0.1:${port}/${label}`, { waitUntil: 'load' });
      await page.waitForTimeout(SETTLE_MS);
      try {
        const dom = await cdp.send('DOM.getDocument');
        const seen = new Map();
        for (const issue of issues.filter((i) => i.page === label)) {
          const det = issue.payload?.issue?.details?.genericIssueDetails;
          if (!det || det.violatingNodeId == null) continue;
          const key = det.violatingNodeId;
          if (!seen.has(key)) {
            try {
              const node = await cdp.send('DOM.describeNode', { backendNodeId: key });
              seen.set(key, `${node.node?.nodeName || '?'}${node.node?.attributes ? ' [' + node.node.attributes.join('=').slice(0, 80) + ']' : ''}`);
            } catch (e) {
              seen.set(key, `unresolved: ${String(e?.message || e)}`);
            }
          }
          det.violatingNodeSelector = seen.get(key);
        }
      } catch { /* node labels are advisory */ }
      try {
        facts[label] = await domFacts(page);
      } catch (e) {
        facts[label] = { error: String(e) };
      }
      await page.close().catch(() => {});
    }
    return { enableResults, events, issues, facts };
  } finally {
    await browser.close().catch(() => {});
  }
}

// ---- main ----------------------------------------------------------------

const { playwright, version: playwrightVersion } = loadPlaywright();
const startedAt = new Date().toISOString();
const chromiumVersion = execFileSync(CHROMIUM, ['--version'], { encoding: 'utf8' }).trim();
const chromiumSha256 = sha256(readFileSync(CHROMIUM));

const { server, port } = await startServer();
try {
  const runResults = {};
  for (const run of RUNS) {
    runResults[run.label] = { flags: run.flags, ...(await runScenario(playwright, run, port)) };
  }

  const out = {
    schema: 'tabi-round16-webmcp-declarative-probe-v1',
    seat: 'TabiR16.WebmcpProbeDeclarative-5',
    capturedAt: startedAt,
    scope: 'declarative <form> -> WebMCP Tool.inputSchema derivation; loopback 127.0.0.1 only',
    runtime: {
      chromiumExecutable: CHROMIUM,
      chromiumVersion,
      chromiumSha256,
      playwright: playwrightVersion,
      node: process.version,
      freshTempProfile: true,
    },
    server: { bind: '127.0.0.1', port, pages: Object.keys(PAGES) },
    runs: runResults,
    binaryStringsNote: 'strings -n6 /usr/lib/chromium/chromium | grep -i toolparam => toolparamdescription only; no toolparamtitle',
  };

  const text = `${JSON.stringify(out, null, 2)}\n`;
  if (STDOUT_ONLY) {
    process.stdout.write(text);
  } else {
    if (existsSync(OUT_JSON) && readFileSync(OUT_JSON, 'utf8') === text) {
      console.error('probe JSON unchanged');
    } else {
      writeFileSync(OUT_JSON, text);
      console.error(`wrote ${OUT_JSON}`);
    }
    for (const [label, r] of Object.entries(runResults)) {
      const tools = r.events.filter((e) => e.method === 'WebMCP.toolsAdded')
        .reduce((n, e) => n + (e.params?.tools?.length || 0), 0);
      console.error(`WEBMCP_DECL_PROBE run=${label} events=${r.events.length} tools=${tools} issues=${r.issues.length}`);
    }
  }
} finally {
  server.close();
}
