#!/usr/bin/env node
// TABI lane B6-1 — extract the E1 (redirect chain) + trip records for the note.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/tmp/w6-tabi-b61';
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const j = (p) => JSON.parse(readFileSync(p, 'utf8'));

const out = {};
const chain = j(join(ROOT, 'chain-run2', 'journey.json'));
const chain3 = j(join(ROOT, 'chain-run3', 'journey.json'));
const cCell = (rec, name) => (rec.cells.find((c) => c.cell === name) || {}).result;
const legRows = (rec) => {
  const rows = [];
  for (const r of rec.requests) {
    const reqs = r.events.filter((e) => e.kind === 'req');
    if (!reqs.length) continue;
    if (!/19541|19543/.test(reqs[0].url)) continue;
    const wires = r.events.filter((e) => e.kind === 'wire').map((w) => w.statusLine);
    const resp = r.events.find((e) => e.kind === 'resp');
    rows.push({
      hops: reqs.map((q) => ({
        method: q.method,
        url: q.url.replace('http://127.0.0.1:', 'p:'),
        type: q.type,
        redirectFrom: q.redirectFrom ? q.redirectFrom.status : null,
      })),
      hopWireStatusLines: wires,
      finalClientStatus: resp ? resp.status : null,
      finalProtocol: resp ? resp.protocol : null,
      bodyBytes: r.body && r.body.bytes !== undefined ? r.body.bytes : null,
      bodySha: r.body && r.body.sha256 ? r.body.sha256.slice(0, 16) : null,
    });
  }
  return rows;
};
out.chainRun2 = {
  robots: cCell(chain, 'robots-probe'),
  post307: cCell(chain, 'post-307'),
  chainJump: cCell(chain, 'chain-navigate'),
  sameOriginJump: cCell(chain, 'same-origin-chain'),
  legs: legRows(chain),
  stopped: chain.stopped,
  responseHeadersOfInterest: {},
};
// capture the wire headers of the redirect responses (Location / Retry-After shapes)
for (const r of chain.requests) {
  const req = r.events.find((e) => e.kind === 'req');
  if (!req) continue;
  const wire = r.events.find((e) => e.kind === 'wire');
  if (wire && wire.headers && /hop2|307|start/.test(req.url)) {
    out.chainRun2.responseHeadersOfInterest[req.url] = {
      statusLine: wire.statusLine,
      location: wire.headers.Location || wire.headers.location || null,
      headers: wire.headers,
    };
  }
}
out.chainRun2VsRun3 = {
  robotsSha: [cCell(chain, 'robots-probe').sha256, cCell(chain3, 'robots-probe').sha256],
  post307: [cCell(chain, 'post-307'), cCell(chain3, 'post-307')],
  chainJumpFinal: [cCell(chain, 'chain-navigate').finalUrl, cCell(chain3, 'chain-navigate').finalUrl],
  navRedirectCount: [cCell(chain, 'chain-navigate').nav[0].redirectCount, cCell(chain3, 'chain-navigate').nav[0].redirectCount],
};
out.trips = {};
for (const run of ['probe-robots', 'probe-429', 'probe-429b', 'probe-403', 'probe-captcha', 'chain-run1']) {
  const t = j(join(ROOT, run, 'trip.json'));
  const rec = j(join(ROOT, run, 'journey.json'));
  const cells = rec.cells.map((c) => ({ cell: c.cell, executed: c.executed, result: c.result ? { ...c.result, text: undefined } : undefined, skippedBecause: c.skippedBecause }));
  out.trips[run] = {
    class: t.class, cell: t.cell, matchedOn: t.matchedOn, observed: t.observed,
    action: t.action, notExecuted: t.notExecuted,
    robotsParse: rec.robotsParse, robots: rec.robots ? { status: rec.robots.status, ct: rec.robots.ct, bytes: rec.robots.bytes, sha256: rec.robots.sha256.slice(0, 16), text: rec.robots.text } : null,
    cells, requestCount: rec.requestCount, stopped: rec.stopped,
  };
}
// pins
const pins = {};
const walk = (dir, prefix = '') => {
  for (const f of readdirSync(dir).sort()) {
    const p = join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) { if (f !== 'profile') walk(p, prefix + f + '/'); continue; }
    pins[prefix + f] = { sha256: sha(p), bytes: st.size };
  }
};
const pinDirs = {
  'site-a': join(ROOT, 'site-a'), 'site-b': join(ROOT, 'site-b'),
  'chain-run2/artifacts': join(ROOT, 'chain-run2'), 'trip-records': null,
};
for (const [k, d] of Object.entries(pinDirs)) {
  if (!d) continue;
  pins[k] = {};
  for (const f of readdirSync(d).sort()) {
    if (f === 'profile') continue;
    const p = join(d, f);
    const st = statSync(p);
    if (st.isDirectory()) continue;
    if (!/\.(png|txt|json|log)$/.test(f)) continue;
    pins[k][f] = { sha256: sha(p), bytes: st.size };
  }
}
for (const f of ['server.py', 'v2-journey.mjs', 'v2-driver.sh', 'compare-v2.mjs']) pins[f] = { sha256: sha(join(ROOT, f)), bytes: statSync(join(ROOT, f)).size };
out.pins = pins;
// http log shas
const logSha = {};
for (const run of ['chain-run1', 'chain-run2', 'chain-run3', 'probe-robots', 'probe-429', 'probe-429b', 'probe-403', 'probe-captcha']) {
  for (const f of ['http-a.log', 'http-b.log']) {
    try { logSha[`${run}/${f}`] = { sha256: sha(join(ROOT, run, f)).slice(0, 16), bytes: statSync(join(ROOT, run, f)).size }; } catch {}
  }
}
out.logSha = logSha;
console.log(JSON.stringify(out, null, 1));