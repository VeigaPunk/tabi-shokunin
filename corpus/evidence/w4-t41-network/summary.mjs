#!/usr/bin/env node
// TABI lane T4-1 — derive review tables from run records (no hand transcription).
// usage: node summary.mjs <root> <run> [<run> ...]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const [root, ...runs] = process.argv.slice(2);
const lines = [];
const out = (s = '') => { lines.push(s); console.log(s); };

const rel = (e) => e;
function timingOf(r) {
  const reqs = r.events.filter((e) => e.kind === 'req');
  const resps = r.events.filter((e) => e.kind === 'resp');
  const fins = r.events.filter((e) => e.kind === 'finished');
  const fails = r.events.filter((e) => e.kind === 'failed');
  const first = reqs[0] || {};
  const lastReq = reqs[reqs.length - 1] || {};
  const resp = resps[resps.length - 1] || {};
  const fin = fins[fins.length - 1] || {};
  const fail = fails[fails.length - 1] || {};
  const waitMs = resp.ts && lastReq.ts ? Math.round((resp.ts - lastReq.ts) * 1000 * 10) / 10 : null;
  const recvMs = fin.ts && resp.ts ? Math.round((fin.ts - resp.ts) * 1000 * 10) / 10 : null;
  const totalMs = fin.ts && first.ts ? Math.round((fin.ts - first.ts) * 1000 * 10) / 10 : null;
  const abortMs = fail.ts && first.ts ? Math.round((fail.ts - first.ts) * 1000 * 10) / 10 : null;
  return { waitMs, recvMs, totalMs, abortMs };
}
const short = (id) => id.slice(0, 8);
const pathOf = (u) => { try { const x = new URL(u); return x.pathname + x.search; } catch { return u; } };

for (const run of runs) {
  const f = join(root, run, 'journey.json');
  if (!existsSync(f)) { out(`== ${run}: no journey.json`); continue; }
  const rec = JSON.parse(readFileSync(f, 'utf8'));
  out(`\n========== ${run} ==========`);
  out(`started=${rec.startedAtUTC} ended=${rec.endedAtUTC || '?'} error=${rec.error || 'none'}`);
  out(`browser=${rec.browser.browser} protocol=${rec.browser.protocolVersion}`);
  out(`captures=${rec.captures.length} requests=${rec.requestCount}`);

  out('\n-- captures');
  for (const c of rec.captures) {
    out(`${c.tag}\tatRelMs=${c.atRelMs}\tpng=${c.png.sha256.slice(0, 16)}/${c.png.bytes}B\tshape=${c.shape.sha256.slice(0, 16)}\tnodes=${c.shape.nodes}\turl=${pathOf(c.url)}\tnetUpdated=${c.netSlice.length}`);
  }
  const inp = rec.captures.find((c) => c.tag === 'step-3-async-filled');
  if (inp) out(`inputs(step-3-async-filled)=${JSON.stringify(inp.inputs)}`);

  out('\n-- requests (event summary)');
  for (const [i, r] of rec.requests.entries()) {
    const reqs = r.events.filter((e) => e.kind === 'req');
    const wires = r.events.filter((e) => e.kind === 'wire');
    const resps = r.events.filter((e) => e.kind === 'resp');
    const fins = r.events.filter((e) => e.kind === 'finished');
    const fails = r.events.filter((e) => e.kind === 'failed');
    const cache = r.events.filter((e) => e.kind === 'cache').length;
    const t = timingOf(r);
    const lastReq = reqs[reqs.length - 1] || {};
    const resp = resps[resps.length - 1] || {};
    const fin = fins[fins.length - 1] || {};
    const fail = fails[fails.length - 1] || null;
    const hops = reqs.map((q) => `${q.redirectFrom ? '302->' : ''}${pathOf(q.url)}`).join(' | ');
    out(
      `#${i} ${short(r.requestId)} ${lastReq.method} ${lastReq.type || '?'} hops=[${hops}]` +
      ` transition=${lastReq.transitionType || '-'}` +
      ` wire=[${wires.map((w) => w.statusCode).join(',')}]` +
      ` respChain=[${resps.map((x) => x.status).join(',')}]` +
      ` client=${resp.status ?? '-'}${resp.fromDiskCache ? '(disk)' : ''}${resp.fromMemoryCache ? '(mem)' : ''}${cache ? '(cacheEvent)' : ''}` +
      ` mime=${resp.mimeType || '-'}` +
      ` respEnc=${resp.encodedDataLength ?? '-'} finEnc=${fin.encodedDataLength ?? '-'}` +
      ` body=${r.body ? (r.body.bytes ?? 'err:' + r.body.error) : '-'}` +
      ` wireHdrText=${wires.map((w) => w.headersTextBytes ?? '-').join(',')}` +
      ` waitMs=${t.waitMs ?? '-'} recvMs=${t.recvMs ?? '-'} totalMs=${t.totalMs ?? '-'}` +
      ` timingHdrEnd=${resp.timing ? Math.round(resp.timing.receiveHeadersEnd * 10) / 10 : '-'}` +
      (fail ? ` FAILED=${fail.errorText}@${t.abortMs}ms` : '')
    );
  }

  out('\n-- per-capture network updates');
  for (const c of rec.captures) {
    if (!c.netSlice.length) { out(`${c.tag}: (no network change)`); continue; }
    for (const s of c.netSlice) {
      const kinds = s.events.map((e) => {
        if (e.kind === 'req') return `req:${pathOf(e.url)}`;
        if (e.kind === 'wire') return `wire:${e.statusCode}`;
        if (e.kind === 'resp') return `resp:${e.status}`;
        if (e.kind === 'finished') return `fin:${e.encodedDataLength}B`;
        if (e.kind === 'failed') return `fail:${e.errorText}`;
        if (e.kind === 'cache') return 'cache';
        if (e.kind === 'reqExtra') return `reqExtra(${e.headerCount}h)`;
        return e.kind;
      }).join(' ');
      out(`${c.tag}: ${short(s.requestId)}${s.startedInThisSlice ? '*' : ' '} ${kinds}`);
    }
  }

  out('\n-- perf entries (last capture)');
  const last = rec.captures[rec.captures.length - 1];
  for (const e of last.perf) {
    out(`perf ${pathOf(e.name)} type=${e.initiatorType} start=${Math.round(e.startTime)}ms dur=${Math.round(e.duration)}ms transfer=${e.transferSize} encBody=${e.encodedBodySize} decBody=${e.decodedBodySize} status=${e.responseStatus}`);
  }
  out(`perfNav ${JSON.stringify(last.perfNav)}`);

  // server log
  const httpLog = join(root, run, 'http.log');
  if (existsSync(httpLog)) {
    const slog = readFileSync(httpLog, 'utf8').split('\n').filter((l) => /"GET .* HTTP/.test(l));
    out(`\n-- server log: ${slog.length} request lines`);
    const urls = slog.map((l) => {
      const m = l.match(/"GET (.*?) HTTP\/\d\.\d" (\d+)/);
      return m ? { path: m[1], status: m[2] } : { path: l, status: '?' };
    });
    for (const u of urls) out(`server ${u.status} ${u.path}`);
    // client vs server URL set — count-based (duplicate paths are the interesting delta)
    const clientPaths = rec.requests.flatMap((r) => r.events.filter((e) => e.kind === 'req').map((e) => pathOf(e.url)));
    const serverPaths = urls.map((u) => u.path);
    const countBy = (arr) => arr.reduce((m, p) => (m.set(p, (m.get(p) || 0) + 1), m), new Map());
    const cc = countBy(clientPaths);
    const sc = countBy(serverPaths);
    out(`client-request-hops=${clientPaths.length} server-request-lines=${serverPaths.length}`);
    for (const k of new Set([...cc.keys(), ...sc.keys()])) {
      const a = cc.get(k) || 0;
      const b = sc.get(k) || 0;
      if (a !== b) out(`count-delta: client-hops=${a} server-lines=${b} ${k}`);
    }
  }
  out(`history=${rec.history ? rec.history.entries.map((e) => `${pathOf(e.url)}#${e.transitionType}`).join(' > ') : '-'}`);
}

// cross-run timing ranges
out('\n========== cross-run timing ranges (ms, as-of-capture) ==========');
const byUrl = new Map();
for (const run of runs) {
  const f = join(root, run, 'journey.json');
  if (!existsSync(f)) continue;
  const rec = JSON.parse(readFileSync(f, 'utf8'));
  for (const r of rec.requests) {
    const reqs = r.events.filter((e) => e.kind === 'req');
    const resps = r.events.filter((e) => e.kind === 'resp');
    const fins = r.events.filter((e) => e.kind === 'finished');
    const fails = r.events.filter((e) => e.kind === 'failed');
    const lastReq = reqs[reqs.length - 1] || {};
    const resp = resps[resps.length - 1] || {};
    const fin = fins[fins.length - 1] || {};
    const fail = fails[fails.length - 1] || null;
    const key = `${lastReq.method} ${pathOf((lastReq.url || '?'))}` + (fail ? ' (aborted)' : '');
    const t = timingOf(r);
    const val = fail ? t.abortMs : t.waitMs;
    if (!byUrl.has(key)) byUrl.set(key, []);
    byUrl.get(key).push({ run, waitMs: t.waitMs, recvMs: t.recvMs, totalMs: t.totalMs, abortMs: t.abortMs, wire: r.events.filter((e) => e.kind === 'wire').map((w) => w.statusCode).join(','), client: resp.status ?? '-' });
  }
}
for (const [k, v] of byUrl) {
  const waits = v.map((x) => x.waitMs).filter((x) => x != null);
  const totals = v.map((x) => x.totalMs).filter((x) => x != null);
  out(`${k}: client=${[...new Set(v.map((x) => x.client))].join('/')} wire=${[...new Set(v.map((x) => x.wire))].join('/')} waitMs=[${waits.join(',')}] totalMs=[${totals.join(',')}] runs=${v.length}`);
}

writeFileSync(join(root, 'summary.txt'), lines.join('\n') + '\n');
console.log('\n[summary written to summary.txt]');