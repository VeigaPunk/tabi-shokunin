#!/usr/bin/env node
// Self-audit: prove each negative receipt differs from the committed base in the
// declared single place (and that probes/invocation fixtures changed what they claim).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const WAVE = path.join(LANE, '.ufo/waves/round-63/w1/R63ExecNeg');
const base = JSON.parse(fs.readFileSync(path.join(LANE, '.ufo/waves/round-63/controls/smoke/receipt-run1.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(WAVE, 'manifest.json'), 'utf8'));
const fmt = (p) => p.reduce((a, k) => (typeof k === 'number' ? `${a}[${k}]` : a ? `${a}.${k}` : k), '');
function diff(a, b, prefix = [], out = []) {
  if (a === b) return out;
  const ta = Array.isArray(a) ? 'array' : a && typeof a === 'object' ? 'object' : 'scalar';
  const tb = Array.isArray(b) ? 'array' : b && typeof b === 'object' ? 'object' : 'scalar';
  if (ta !== tb) { out.push(`${fmt(prefix)} <type ${ta}->${tb}>`); return out; }
  if (ta === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(k in a) || !(k in b)) out.push(`${fmt([...prefix, k])} <${k in a ? 'removed' : 'added'}>`);
      else diff(a[k], b[k], [...prefix, k], out);
    }
    return out;
  }
  if (ta === 'array') {
    const eq = (x, y) => JSON.stringify(x) === JSON.stringify(y);
    if (a.length === b.length + 1) {
      for (let k = 0; k < a.length; k++) {
        const without = [...a.slice(0, k), ...a.slice(k + 1)];
        if (eq(without, b)) { out.push(`${fmt(prefix)} element [${k}] removed: ${JSON.stringify(a[k])}`); return out; }
      }
    }
    if (b.length === a.length + 1) {
      for (let k = 0; k < b.length; k++) {
        const without = [...b.slice(0, k), ...b.slice(k + 1)];
        if (eq(without, a)) { out.push(`${fmt(prefix)} element [${k}] added: ${JSON.stringify(b[k])}`); return out; }
      }
    }
    if (a.length !== b.length) out.push(`${fmt(prefix)}.length ${a.length} -> ${b.length}`);
    for (let i = 0; i < Math.min(a.length, b.length); i++) diff(a[i], b[i], [...prefix, i], out);
    return out;
  }
  out.push(`${fmt(prefix)} ${JSON.stringify(a)} -> ${JSON.stringify(b)}`);
  return out;
}
const rows = [];
for (const c of manifest.cases) {
  const r = JSON.parse(fs.readFileSync(path.join(LANE, c.receipt), 'utf8'));
  rows.push({ id: c.id, cls: c.cls, mandatory: c.mandatory, declared: c.mutation, changed: diff(base, r) });
}
const single = rows.filter((r) => r.cls === 'negative').map((r) => ({ id: r.id, mandatory: r.mandatory, changedCount: r.changed.length, changed: r.changed }));
const mandatory = single.filter((r) => r.mandatory);
const out = { schema: 'tabi-r63-execneg-differences-v1', baseSha256: crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(LANE, '.ufo/waves/round-63/controls/smoke/receipt-run1.json'))).digest('hex'),
  mandatoryAllSingleField: mandatory.every((r) => r.changedCount === 1), mandatory, all: rows };
fs.writeFileSync(path.join(WAVE, 'differences.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({ mandatoryAllSingleField: out.mandatoryAllSingleField, mandatory, multiField: single.filter((r) => r.changedCount !== 1).map((r) => ({ id: r.id, changedCount: r.changedCount, changed: r.changed })) }, null, 1));
