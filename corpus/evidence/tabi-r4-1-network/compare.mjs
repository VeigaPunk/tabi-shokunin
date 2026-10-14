// TABI-R4-1 — mechanical comparison: cold-run artifact identity, cross-round continuity
// (round-4 network rung must not perturb round-3 artifacts), per-step network-shape rows,
// client-vs-wire reconciliation, response-body-vs-authored-fixture equality, timing classes.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = '/tmp/tabi-r4-1-network';
const r3root = '/tmp/tabi-r3-1-journey';
const load = (rel) => JSON.parse(readFileSync(`${root}/${rel}/journey.json`, 'utf8'));
const r1 = load('run1');
const r2 = load('run2');
const warm = existsSync(`${root}/run3-warm/journey.json`) ? load('run3-warm') : null;
const r3 = existsSync(`${r3root}/run1/journey.json`) ? JSON.parse(readFileSync(`${r3root}/run1/journey.json`, 'utf8')) : null;

const rows = [];
const say = (s) => console.log(s);
const tsv = (label, verdict, a, b) => rows.push([label, verdict, String(a), String(b)].join('\t'));
const get = (rec, tag) => rec.captures.find((c) => c.tag === tag);
const pathOnly = (p) => p.split('?')[0];

say('== runs ==');
for (const [name, rec] of [['run1', r1], ['run2', r2], ['run3-warm', warm]]) {
  if (!rec) continue;
  say(`${name}: captures=${rec.captures.length} actions=${rec.actions.length} netEvents=${rec.netEvents.length} error=${rec.error || 'none'} started=${rec.startedAtUTC} ended=${rec.endedAtUTC || '-'}`);
  say(`${name}: browser=${rec.browser.browser} proto=${rec.browser.protocolVersion} viewport=${JSON.stringify(rec.viewport)} targetLaunch=${rec.targetLaunch.id} targetEnd=${rec.targetEnd.id} same=${rec.targetLaunch.id === rec.targetEnd.id}`);
  say(`${name}: asyncTiming=${JSON.stringify(rec.asyncTiming)}`);
}
if (r3) say(`round3 run1 present: captures=${r3.captures.length} (for cross-round continuity)`);

say('\n== A. cold-run artifact identity (run1 vs run2) ==');
rows.push('comparison\tverdict\ta(24)\tb(24)');
for (const t of r1.captures.map((c) => c.tag)) {
  const a = get(r1, t), b = get(r2, t);
  if (!b) { tsv(`png ${t} (R1 vs R2)`, 'MISSING', a.png.sha256.slice(0, 24), '-'); continue; }
  tsv(`png ${t} (R1 vs R2)`, a.png.sha256 === b.png.sha256 ? 'IDENTICAL' : 'DIFFER', a.png.sha256.slice(0, 24), b.png.sha256.slice(0, 24));
  tsv(`shape ${t} (R1 vs R2)`, a.shape.sha256 === b.shape.sha256 ? 'IDENTICAL' : 'DIFFER', a.shape.sha256.slice(0, 24), b.shape.sha256.slice(0, 24));
  tsv(`struct ${t} (R1 vs R2)`, a.shape.structSha256 === b.shape.structSha256 ? 'IDENTICAL' : 'DIFFER', a.shape.structSha256.slice(0, 24), b.shape.structSha256.slice(0, 24));
  tsv(`url ${t} (R1 vs R2)`, a.url === b.url ? 'IDENTICAL' : 'DIFFER', a.url, b.url);
}
const delta = (l, x, y, expect) => {
  const a = get(r1, x), b = get(r1, y);
  if (!a || !b) return;
  const v = a.png.sha256 === b.png.sha256 ? 'IDENTICAL' : 'DIFFER';
  tsv(l, v + (expect ? ` (expect ${expect})` : ''), a.png.sha256.slice(0, 24), b.png.sha256.slice(0, 24));
};
delta('png step-1 vs step-1-idem (R1, idempotence)', 'step-1-index', 'step-1-index-idem', 'IDENTICAL');
delta('png step-1 vs step-2 (link delta)', 'step-1-index', 'step-2-detail', 'DIFFER');
delta('png step-3 vs step-3-filled (fill delta)', 'step-3-form', 'step-3-form-filled', 'DIFFER');
delta('png step-3-filled vs step-4 (submit delta)', 'step-3-form-filled', 'step-4-confirm', 'DIFFER');
delta('png step-5-async-idle vs step-6-async-loaded (async render delta)', 'step-5-async-idle', 'step-6-async-loaded', 'DIFFER');
delta('png step-6-async-race vs step-6-async-loaded (race window)', 'step-6-async-race', 'step-6-async-loaded', 'as measured');
delta('png step-6-async-loaded vs step-7-pub-optimistic (publish render delta)', 'step-6-async-loaded', 'step-7-pub-optimistic', 'DIFFER');

if (r3) {
  say('\n== B. cross-round continuity: round-4 run1 vs round-3 run1 (same fixture bytes, network rung added) ==');
  for (const t of ['step-1-index', 'step-1-index-idem', 'step-2-detail', 'step-3-form', 'step-3-form-filled', 'step-4-confirm']) {
    const a = get(r3, t), b = get(r1, t);
    if (!a || !b) { say(`  ${t}: missing (r3=${!!a} r4=${!!b})`); continue; }
    for (const [k, av, bv] of [['png', a.png.sha256, b.png.sha256], ['shape', a.shape.sha256, b.shape.sha256], ['struct', a.shape.structSha256, b.shape.structSha256]]) {
      tsv(`R3-vs-R4 ${k} ${t}`, av === bv ? 'IDENTICAL' : 'DIFFER', av.slice(0, 24), bv.slice(0, 24));
    }
  }
} else say('\n== B. cross-round continuity: round-3 run1 not staged — skipped ==');

say('\n== C. per-step network rows (as captured) ==');
const shapeTuple = (e) => `${e.method} ${e.path} ${e.status}/${e.extraStatus} ${e.class} cl=${e.contentLength} type=${e.type}`;
function netSection(name, rec) {
  if (!rec) return;
  say(`-- ${name} --`);
  for (const c of rec.captures) {
    say(`  ${c.tag}  slice@${c.netSliceAtUTC}`);
    for (const e of c.net) {
      say(`    ${e.method} ${e.path} -> ${e.status}${e.extraStatus !== null && e.extraStatus !== e.status ? `(wire ${e.extraStatus})` : ''} ${e.mimeType || '-'} cls=${e.class} cl=${e.contentLength} respEnc=${e.respEncoded} data=[${e.dataEvents}x${e.dataLength}] total=${e.totalBytes} dur=${e.durationMs}ms post=${e.postDataBytes}B init=${e.initiator}${e.failed ? ' FAILED=' + e.failed : ''}`);
    }
  }
}
netSection('run1', r1);
netSection('run2', r2);
if (r1.captures.every((c) => get(r2, c.tag))) {
  say('-- run1 vs run2 network-shape tuples (timing excluded) --');
  for (const c of r1.captures) {
    const a = c.net.map(shapeTuple).join(' | ');
    const b = (get(r2, c.tag) || { net: [] }).net.map(shapeTuple).join(' | ');
    tsv(`netshape ${c.tag}`, a === b ? 'IDENTICAL' : 'DIFFER', a.slice(0, 200), b.slice(0, 200));
  }
}
const classCount = (rec) => {
  const m = {};
  for (const e of rec.netEvents) m[e.class] = (m[e.class] || 0) + 1;
  return JSON.stringify(m);
};
for (const [name, rec] of [['run1', r1], ['run2', r2], ['run3-warm', warm]]) if (rec) say(`${name} net classes: ${classCount(rec)}`);

say('\n== D. client-vs-wire reconciliation (server log = wire truth) ==');
function wireOf(name) {
  try {
    const log = readFileSync(`${root}/${name}/http.log`, 'utf8');
    return log.split('\n').filter(Boolean).map((l, i) => {
      const m = l.match(/"([A-Z]+) (\S+) HTTP\/1\.[01]" (\d{3}) (\S+)/);
      return m ? { line: i + 1, method: m[1], target: m[2], status: Number(m[3]), raw: l } : { line: i + 1, parse: false, raw: l };
    });
  } catch { return null; }
}
function reconcile(name, rec) {
  const wire = wireOf(name);
  if (!wire || !rec) { say(`  ${name}: no wire log / record`); return; }
  const client = rec.netEvents;
  const matched = new Map();
  let cursor = 0;
  for (const w of wire) {
    if (w.parse === false) continue;
    let found = -1;
    for (let k = cursor; k < client.length; k++) {
      if (client[k].method === w.method && client[k].path === w.target) { found = k; break; }
    }
    if (found >= 0) { matched.set(found, w); cursor = found + 1; }
    else say(`  WIRE-ONLY: ${w.method} ${w.target} ${w.status}`);
  }
  let wireOnly = 0, cacheRows = 0;
  for (let i = 0; i < client.length; i++) {
    const c = client[i];
    const w = matched.get(i);
    if (!w) {
      cacheRows++;
      say(`  CLIENT-ONLY: #${i} ${c.method} ${c.path} client=${c.status} extra=${c.extraStatus} cls=${c.class} servedFromCache=${c.servedFromCache} disk=${c.fromDiskCache} mem=${c.fromMemoryCache}`);
    } else if (w.status !== c.status || (c.extraStatus !== null && w.status !== c.extraStatus)) {
      say(`  STATUS-SPLIT: ${c.method} ${c.path} wire=${w.status} client=${c.status} extra=${c.extraStatus} cls=${c.class}`);
    }
  }
  wireOnly = wire.filter((w) => w.parse !== false).length - matched.size;
  say(`  ${name}: wire lines=${wire.filter((w) => w.parse !== false).length} matched=${matched.size} wire-only=${wireOnly} client-only(cache/other)=${cacheRows} (client events=${client.length})`);
  tsv(`wire ${name}`, wire.filter((w) => w.parse !== false).length === matched.size && cacheRows >= 0 ? 'RECONCILED' : 'GAP', `wire=${wire.filter((w) => w.parse !== false).length} matched=${matched.size} clientOnly=${cacheRows}`, '');
}
reconcile('run1', r1);
reconcile('run2', r2);
reconcile('run3-warm', warm);

say('\n== E. response body vs authored fixture bytes (Network.getResponseBody) ==');
function fixtureSha(rec, p) {
  const f = rec.fixtures.find((x) => x.file === pathOnly(p).replace(/^\//, ''));
  return f ? f.sha256 : null;
}
for (const [name, rec] of [['run1', r1], ['run2', r2], ['run3-warm', warm]]) {
  if (!rec) continue;
  for (const e of rec.netEvents) {
    const fs = fixtureSha(rec, e.path);
    const body = e.body;
    if (!body) continue;
    if (!body.ok) { say(`  ${name} ${e.method} ${e.path}: body UNAVAILABLE (${body.error}) cls=${e.class}`); continue; }
    const verdict = fs === null ? '(no fixture file)' : body.sha256 === fs ? 'MATCH' : 'DIFFER';
    say(`  ${name} ${e.method} ${e.path}: body bytes=${body.bytes} sha=${body.sha256.slice(0, 16)} fixture=${fs ? fs.slice(0, 16) : '-'} ${verdict} cls=${e.class} cl=${e.contentLength} total=${e.totalBytes}`);
    if (fs !== null) tsv(`body-vs-fixture ${name} ${e.path}`, verdict, body.sha256.slice(0, 24), fs.slice(0, 24));
  }
}

say('\n== F. timing detail (run1; as-of-capture, loopback) ==');
for (const e of r1.netEvents) {
  say(`  ${e.method} ${e.path} cls=${e.class} dur=${e.durationMs}ms timingMs=${JSON.stringify(e.timingMs)} respAt=${e.respAtUTC} finAt=${e.finishedAtUTC}`);
}

if (warm) {
  say('\n== G. warm run status classes ==');
  for (const e of warm.netEvents) {
    say(`  ${e.method} ${e.path} wire(extra)=${e.extraInfo ? e.extraInfo.statusCode : '-'} client=${e.status} cls=${e.class} disk=${e.fromDiskCache} mem=${e.fromMemoryCache} servedFromCache=${e.servedFromCache} body=${e.body ? (e.body.ok ? 'ok/' + e.body.bytes + 'B' : 'unavailable') : '-'}`);
  }
}

writeFileSync(`${root}/compare.tsv`, rows.join('\n') + '\n');
say('\nwrote compare.tsv rows=' + rows.length);