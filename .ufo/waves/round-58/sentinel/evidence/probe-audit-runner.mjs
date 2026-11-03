#!/usr/bin/env node
// R58Sentinel probe: static perimeter audit of the r58 runner + counter.
// READ-ONLY. Usage: node audit-runner.mjs <runner.mjs> [<counter.mjs> [<fixturesDir>]]
import fs from 'node:fs';
import path from 'node:path';

const runnerPath = process.argv[2];
const counterPath = process.argv[3];
const fixturesDir = process.argv[4];

const out = { schema: 'r58sentinel-runner-audit-v1', checks: [], findings: [] };
const add = (id, ok, detail) => { out.checks.push({ id, ok: !!ok, detail: String(detail) }); if (!ok) out.findings.push({ id, detail: String(detail) }); };

if (!runnerPath || !fs.existsSync(runnerPath)) {
  add('runner-present', false, 'missing: ' + runnerPath);
  console.log(JSON.stringify(out, null, 1)); process.exit(2);
}
const src = fs.readFileSync(runnerPath, 'utf8');
const lines = src.split('\n');
const grepAll = (re) => lines.map((l, i) => [i + 1, l]).filter(([, l]) => re.test(l));

out.runner = { path: runnerPath, lines: lines.length, bytes: fs.statSync(runnerPath).size };

// --- 1. loopback-only perimeter -------------------------------------------
const has = (re) => grepAll(re);

// 1a remote-debugging-address 127.0.0.1
{
  const hits = has(/remote-debugging-address/);
  const ok = hits.length > 0 && hits.every(([, l]) => /remote-debugging-address=127\.0\.0\.1/.test(l));
  add('remote-debugging-address-loopback', ok, hits.map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'ABSENT');
}
// 1b fixture server bound to 127.0.0.1
{
  const hits = has(/listen\(\s*0\s*,\s*'127\.0\.0\.1'|listen\([^)]*'127\.0\.0\.1'/);
  const anyListen = has(/\.listen\(/);
  const ok = hits.length > 0 && anyListen.every(([, l]) => /127\.0\.0\.1/.test(l));
  add('fixture-server-loopback-only', ok, anyListen.map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'no listen()');
}
// 1c throwaway --user-data-dir under scratch
{
  const hits = has(/--user-data-dir=/);
  const ok = hits.length > 0 && hits.every(([, l]) => /profileDir|--scratch|scratch/i.test(l));
  add('user-data-dir-from-scratch-profile', ok, hits.map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'ABSENT');
}
// 1d throwaway HOME + XDG_CONFIG_HOME
{
  const h = has(/HOME:\s*runHome|runHome/);
  const x = has(/XDG_CONFIG_HOME/);
  add('throwaway-home', h.length > 0, h.slice(0, 3).map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'ABSENT');
  add('throwaway-xdg-config-home', x.length > 0, x.slice(0, 3).map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'ABSENT');
}
// 1e --disable-extensions
{
  const hits = has(/--disable-extensions/);
  add('disable-extensions', hits.length > 0, hits.map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'ABSENT');
}
// 1f keyed PID-group kill, never pkill -f
{
  const grp = has(/process\.kill\(-child\.pid/);
  const sweep = has(/SWEEP_NEEDLES|\/proc\//);
  const pkill = has(/pkill/);
  const pkillReal = pkill.filter(([, l]) => !/never pkill/i.test(l) && !/^\s*\/\//.test(l.trim()));
  add('keyed-pid-group-kill', grp.length > 0 && sweep.length > 0, 'groupKill=' + grp.length + ' sweep=' + sweep.length);
  add('no-pkill-invocation', pkillReal.length === 0, pkillReal.map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'clean (only the "never pkill" prose)');
}
// 1g zero-survivor closure probes + port probes
{
  const surv = has(/postKillSweepCount|survivors/);
  const port = has(/probePort|portProbes/);
  const close = has(/net\.connect\(/);
  add('zero-survivor-closure-probe', surv.length > 0, surv.slice(0, 3).map(([n, l]) => n + ': ' + l.trim()).join(' | '));
  add('port-probes', port.length > 0 && close.length > 0, 'portProbe=' + port.length + ' netConnect=' + close.length);
}
// 1h argv recorded shape-only (home redaction)
{
  const hits = has(/__USER_HOME__|argvText|receipt\.host\.argv/);
  const redaction = has(/__USER_HOME__/);
  add('argv-shape-only-redaction', hits.length > 0 && redaction.length > 0, hits.slice(0, 4).map(([n, l]) => n + ': ' + l.trim()).join(' | '));
}
// 1i no external URL in the runner source (other than loopback / w3c refs in comments)
{
  const urls = [];
  const re = /https?:\/\/[^\s'"`)]+/g;
  let m;
  while ((m = re.exec(src))) urls.push({ line: src.slice(0, m.index).split('\n').length, url: m[0] });
  const external = urls.filter((u) => !/127\.0\.0\.1|localhost/.test(u.url));
  out.runner.urls = urls.slice(0, 40);
  out.runner.externalUrls = external;
  add('no-external-url-in-runner', external.length === 0, external.map((u) => u.line + ': ' + u.url).join(' | ') || 'clean');
}

// --- 1j launch-flag SET vs the frozen r57 precedent ------------------------
// A REMOVED flag is a new egress surface (e.g. dropping
// --disable-background-networking re-opens the browser's background calls).
{
  const P57 = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round57.mjs';
  const flagsOf = (text) => {
    const s = new Set();
    for (const m of text.matchAll(/^\s*'(--[a-z0-9-]+)/gm)) s.add(m[1]);
    for (const m of text.matchAll(/^\s*`(--[a-z0-9-]+)/gm)) s.add(m[1]);
    return s;
  };
  const f58 = flagsOf(src);
  let f57 = new Set();
  try { f57 = flagsOf(fs.readFileSync(P57, 'utf8')); } catch { /* precedent absent */ }
  const removed = [...f57].filter((f) => !f58.has(f));
  const added = [...f58].filter((f) => !f57.has(f));
  out.runner.flags = { r57: [...f57].sort(), r58: [...f58].sort(), removed, added };
  add('no-launch-flag-removed-vs-r57', removed.length === 0, removed.join(' | ') || 'none removed');
  add('no-new-launch-flag-vs-r57', added.length === 0, added.join(' | ') || 'none added');
}

// --- 2. the swallow toggle ------------------------------------------------
{
  // 2a the SWALLOW state must not be settable from a URL/query parameter.
  //     Scope: the browser-executed fixture JS (FIXTURE_HTML) plus any
  //     assignment of __swallowOn/__swallowSet anywhere in the runner.
  const fxStart = lines.findIndex((l) => /const FIXTURE_HTML/.test(l));
  // the template literal ends at the first line that closes the backtick
  let fxEnd = -1;
  for (let i = fxStart + 1; i < lines.length; i++) {
    if (/`;\s*$/.test(lines[i])) { fxEnd = i; break; }
    if (i - fxStart > 400) break;
  }
  const fx = fxStart >= 0 ? lines.slice(fxStart, (fxEnd > fxStart ? fxEnd : fxStart + 220) + 1).join('\n') : '';
  out.runner.fixtureBlock = { startLine: fxStart + 1, endLine: fxEnd + 1 };
  // a location read INSIDE the browser-executed fixture
  const fxLocationReads = fx.split('\n').map((l, i) => [fxStart + i + 1, l]).filter(([, l]) =>
    /location\s*\.\s*(search|hash|href)|document\s*\.\s*location|window\s*\.\s*location|URLSearchParams|document\.URL|location\s*\[/.test(l));
  add('fixture-js-no-location-read', fxLocationReads.length === 0, fxLocationReads.map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'clean (the browser-executed fixture reads no location member)');
  // an assignment of the swallow state derived from anything URL-shaped.
  // SCOPE: the SHIPPED fixture block only (the runner's own selftest carries
  // deliberately-broken fixture mutants as string literals; those are not
  // the shipped fixture).
  const fxLines = fx.split('\n').map((l, i) => [fxStart + i + 1, l]);
  const swallowAssign = fxLines.filter(([, l]) => /__swallow(On|Set)\s*=/.test(l) && !/window\.__swallow(On|Set)\s*=\s*(true|false|\[\])?\s*;?\s*$/i.test(l.trim()));
  const urlDerived = swallowAssign.filter(([, l]) => /search|query|location|href|URLSearchParams|params|param/i.test(l));
  add('swallow-state-not-url-derived', urlDerived.length === 0, urlDerived.map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'clean (no __swallowOn/__swallowSet assignment in the shipped fixture derives from a URL/query)');
  // a navigation to a URL carrying a swallow-ish query parameter
  const navQuery = lines.map((l, i) => [i + 1, l]).filter(([, l]) => /(Page\.navigate|location\.href\s*=|goto\(|open\()[^;\n]*\?[^\s'"`]*swallow/i.test(l));
  add('no-navigation-with-swallow-query', navQuery.length === 0, navQuery.map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'clean');
  // 2b __setSwallow exists and is idempotent
  const setSwallow = has(/__setSwallow/);
  add('set-swallow-exposed', setSwallow.length > 0, setSwallow.slice(0, 5).map(([n, l]) => n + ': ' + l.trim()).join(' | '));
  // 2c the fixture's inline JS references no external URL
  const fxUrls = [...fx.matchAll(/https?:\/\/[^\s'"`)]+/g)].map((x) => x[0]).filter((u) => !/127\.0\.0\.1|localhost/.test(u));
  add('fixture-inline-js-no-external-url', fxUrls.length === 0, fxUrls.join(' | ') || 'clean');
  // 2d swallower registered BEFORE the recorder (capture order).
  //     Independent detection: find every keydown addEventListener call in
  //     the shipped fixture and, for each, scan the next few lines for the
  //     swallower's body (preventDefault + __swallowSet). The swallower's
  //     call must be the FIRST keydown listener registered.
  {
    const fxArr = fx.split('\n');
    const fxOnly = fxArr.map((l, i) => [fxStart + i + 1, l]);
    const calls = [];
    fxOnly.forEach(([, l], idx) => {
      if (!/addEventListener\(\s*'keydown'/.test(l)) return;
      const body = fxArr.slice(idx, idx + 4).join('\n');
      calls.push({ line: fxStart + idx + 1, isSwallower: /preventDefault/.test(body) && /__swallow(Set|On)/.test(body), body: body.replace(/\s+/g, ' ').slice(0, 120) });
    });
    out.runner.keydownListenerCalls = calls;
    const sw = calls.find((c) => c.isSwallower);
    out.runner.swallowListenerLine = sw ? sw.line : null;
    out.runner.recorderCallLines = calls.filter((c) => !c.isSwallower).map((c) => c.line);
    const ok = !!sw && calls.length > 0 && calls[0].isSwallower === true;
    add('swallower-registered-before-recorder', ok,
      'swallowerCall@' + (sw ? sw.line : 'none')
      + ' allKeydownListenerCalls=' + JSON.stringify(calls.map((c) => c.line + (c.isSwallower ? '(swallower)' : '(recorder)'))));
  }
  // 2e recorder records cancelable + defaultPrevented
  const canc = has(/cancelable/);
  const dp = has(/defaultPrevented/);
  add('recorder-records-cancelable', canc.length > 0, canc.slice(0, 3).map(([n, l]) => n + ': ' + l.trim()).join(' | '));
  add('recorder-records-defaultprevented', dp.length > 0, dp.slice(0, 3).map(([n, l]) => n + ': ' + l.trim()).join(' | '));
}

// --- 3. counter ------------------------------------------------------------
if (counterPath && fs.existsSync(counterPath)) {
  const c = fs.readFileSync(counterPath, 'utf8');
  const cl = c.split('\n');
  out.counter = { path: counterPath, lines: cl.length, bytes: fs.statSync(counterPath).size };
  const execHits = cl.map((l, i) => [i + 1, l]).filter(([, l]) =>
    /child_process|spawnSync\s*\(|execSync\s*\(|execFile\s*\(|execFileSync\s*\(|fork\s*\(|spawn\s*\(|child_process|await import\s*\(|import\s*\(\s*driver/i.test(l));
  add('counter-never-executes-driver', execHits.length === 0, execHits.map(([n, l]) => n + ': ' + l.trim()).join(' | ') || 'clean (no child_process / spawn / exec / dynamic import of the driver)');
  const readHits = cl.map((l, i) => [i + 1, l]).filter(([, l]) => /readFileSync\(\s*driverPath|driverBytes/.test(l));
  add('counter-reads-driver-bytes-for-sha', readHits.length > 0, readHits.slice(0, 4).map(([n, l]) => n + ': ' + l.trim()).join(' | '));
  const pinHits = cl.map((l, i) => [i + 1, l]).filter(([, l]) => /expect-driver-sha256|expectSha/.test(l));
  add('counter-honours-driver-sha-pin', pinHits.length > 0, pinHits.slice(0, 4).map(([n, l]) => n + ': ' + l.trim()).join(' | '));
  const cUrls = [...c.matchAll(/https?:\/\/[^\s'"`)]+/g)].map((x) => x[0]).filter((u) => !/127\.0\.0\.1|localhost/.test(u));
  add('counter-no-external-url', cUrls.length === 0, cUrls.join(' | ') || 'clean');
} else {
  out.counter = { path: counterPath, present: false };
  add('counter-present', false, 'missing: ' + counterPath);
}

// --- 4. counter fixtures dir: no network fixture --------------------------
if (fixturesDir && fs.existsSync(fixturesDir)) {
  const entries = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else entries.push(p);
    }
  })(fixturesDir);
  const ext = {};
  for (const e of entries) { const x = path.extname(e) || '(none)'; ext[x] = (ext[x] || 0) + 1; }
  out.fixtures = { dir: fixturesDir, fileCount: entries.length, extHistogram: ext };
  const codeFiles = entries.filter((e) => /\.(mjs|cjs|js|py|sh|ts)$/.test(e));
  out.fixtures.codeFiles = codeFiles;
  // A fixture that PERFORMS network I/O is the forbidden shape. A static
  // module with no network primitive is fine (the r57 precedent ships
  // driver-stub.mjs, a pure export).
  const netHits = [];
  for (const e of codeFiles) {
    const t = fs.readFileSync(e, 'utf8');
    if (/\bfetch\s*\(|node:http|node:net|node:dgram|node:https|\bhttp\.(request|get)\s*\(|net\.connect\s*\(|createServer\s*\(|urllib|requests\.|socket\.socket\s*\(|curl\s/.test(t)) netHits.push(e);
  }
  add('counter-fixtures-no-network-code', netHits.length === 0, netHits.join(' | ') || 'clean (no fixture performs network I/O)');
  // no fixture file may carry an EXTERNAL url (loopback origin strings are fine)
  const extUrl = [];
  for (const e of entries) {
    if (/\.(png|bin)$/.test(e)) continue;
    let t; try { t = fs.readFileSync(e, 'utf8'); } catch { continue; }
    const urls = [...t.matchAll(/https?:\/\/[^\s'"`,)]+/g)].map((x) => x[0]).filter((u) => !/127\.0\.0\.1|localhost/.test(u));
    if (urls.length) extUrl.push(e + ' -> ' + urls.slice(0, 3).join(','));
  }
  add('counter-fixtures-no-external-url', extUrl.length === 0, extUrl.join(' | ') || 'clean');
  // the fixtures dir must ship no live server / driver copy of the real driver
  const realDriverCopies = entries.filter((e) => /chrome-cdp-loopback-round58\.mjs$/.test(e));
  add('counter-fixtures-no-real-driver-copy', realDriverCopies.length === 0, realDriverCopies.join(' | ') || 'none');
} else {
  out.fixtures = { dir: fixturesDir, present: false };
  add('counter-fixtures-dir-present', false, 'missing: ' + fixturesDir);
}

out.findingCount = out.findings.length;
out.predicate = out.findingCount === 0;
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
