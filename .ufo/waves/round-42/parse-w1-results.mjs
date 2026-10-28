#!/usr/bin/env node
// parse-w1-results.mjs — summarize .ufo/waves/round-42/w1-results.json for the
// round report: per-seat name/agent/status/output-nonempty, role mix, dead seats,
// and the VERDICT line each seat emitted. Read-only; prints JSON to stdout.
import fs from 'node:fs';

const p = process.argv[2] || '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/w1-results.json';
const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
const seats = Array.isArray(raw) ? raw : (Array.isArray(raw.results) ? raw.results : (Array.isArray(raw.seats) ? raw.seats : []));
const rows = seats.map((s) => {
  const out = s.finalOutput ?? s.output ?? s.result ?? '';
  const text = typeof out === 'string' ? out : JSON.stringify(out ?? '');
  const v = text.match(/VERDICT\s+(ok|finding|could-not-evaluate)\b([^\n]*)/i);
  return {
    name: s.name, agent: s.agent || s.role, id: s.id || s.agentId || null,
    status: s.status || null,
    outputNonempty: text.trim().length > 0,
    outputBytes: text.length,
    verdict: v ? `${v[1]} ${v[2].trim()}`.trim() : null,
  };
});
const by = {};
for (const r of rows) by[r.agent] = (by[r.agent] || 0) + 1;
const dead = rows.filter((r) => r.status && !['completed', 'ok', 'success', 'done'].includes(String(r.status).toLowerCase()));
const empty = rows.filter((r) => !r.outputNonempty);
const noVerdict = rows.filter((r) => !r.verdict);
console.log(JSON.stringify({
  total: rows.length,
  roles: by,
  dead,
  emptyOutput: empty.map((r) => r.name),
  noVerdictLine: noVerdict.map((r) => r.name),
  verdicts: rows.map((r) => ({ name: r.name, verdict: r.verdict, status: r.status })),
}, null, 1));
