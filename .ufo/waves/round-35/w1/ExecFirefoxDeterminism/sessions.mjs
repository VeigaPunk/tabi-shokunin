// Round-35 C2 falsifier harness: N cold Firefox/geckodriver BiDi sessions through the
// frozen counter's own liveRecordFirefox, recording first-screenshot bytes and all 17
// gate predicate results per session.
// env: R35_CLONE, R35_N (sessions), R35_G (concurrent group size), R35_TAG, R35_OUT
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const CLONE = process.env.R35_CLONE;
const N = Number(process.env.R35_N || 1);
const G = Number(process.env.R35_G || 1);
const TAG = process.env.R35_TAG || 'run';
const OUT = process.env.R35_OUT;

const counter = await import(pathToFileURL(`${CLONE}/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs`).href);
const gate = await import(pathToFileURL(`${CLONE}/scripts/check-bidi-runtime.mjs`).href);

const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const ok = (c) => c && c.response && c.response.type === 'success';
const resu = (c) => (c && c.response && c.response.result) || {};
const ids = Object.keys(gate.ROWS).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

function shotInfo(rec) {
  const c = rec.cmds.find((x) => x.method === 'browsingContext.captureScreenshot' && ok(x));
  if (!c) return { sha: null, bytes: null, b64len: null };
  const b64 = String(resu(c).data || '');
  const buf = Buffer.from(b64, 'base64');
  return { sha: sha256(buf), bytes: buf.length, b64len: b64.length };
}

async function one(k) {
  const t0 = Date.now();
  const rec = await counter.liveRecordFirefox({ gate, firefox: process.env.R35_FIREFOX, geckodriver: process.env.R35_GECKO });
  const wallMs = Date.now() - t0;
  const caps = (rec.newSession && rec.newSession.value && rec.newSession.value.capabilities) || {};
  const sess = counter.sessionOf(rec);
  const shot = shotInfo(rec);
  const ctx = { browserVersion: caps.browserVersion };
  const preds = {};
  const fails = [];
  for (const id of ids) {
    let w;
    try { w = gate.PREDICATES[id](rec, ctx); } catch (e) { w = `threw: ${e.message}`; }
    preds[id] = w;
    if (w !== null) fails.push(`${id}=${w}`);
  }
  return {
    tag: TAG, k, wallMs, sid: sess.sid || null, sessWhy: sess.why || null,
    browserVersion: caps.browserVersion || null,
    geckodriverVersion: caps['moz:geckodriverVersion'] || null,
    webSocketUrl: caps.webSocketUrl || null,
    shotSha: shot.sha, shotBytes: shot.bytes, shotB64Len: shot.b64len,
    cmds: rec.cmds.length, events: rec.events.length,
    predicates: preds,
    failing: fails,
  };
}

for (let g = 0; g < N; g += G) {
  const batch = [];
  for (let j = 0; j < Math.min(G, N - g); j += 1) batch.push(g + j);
  const rs = await Promise.all(batch.map(async (k) => {
    try { return await one(k); } catch (e) { return { tag: TAG, k, error: String((e && e.stack) || e).slice(0, 2000) }; }
  }));
  for (const r of rs) appendFileSync(OUT, `${JSON.stringify(r)}\n`);
  process.stderr.write(`[${TAG}] group done up to k=${rs[rs.length - 1].k}\n`);
}
