// Field-level diff between two receipts: the manual check that a "second cold run" (C2 (b))
// is a different execution and not a copy. The frozen counter never runs this.
import fs from 'node:fs';
const [aPath, bPath] = process.argv.slice(2);
const a = JSON.parse(fs.readFileSync(aPath, 'utf8'));
const b = JSON.parse(fs.readFileSync(bPath, 'utf8'));
const diff = [];
(function walk(x, y, p) {
  if (typeof x !== typeof y) return diff.push(p);
  if (x && typeof x === 'object') {
    for (const k of new Set([...Object.keys(x), ...Object.keys(y || {})])) walk(x[k], y ? y[k] : undefined, p + '.' + k);
  } else if (x !== y) diff.push(p);
})(a, b, '$');
const top = {};
for (const p of diff) { const t = p.split('.')[1]; top[t] = (top[t] || 0) + 1; }
console.log(JSON.stringify({ differingLeafPaths: diff.length, byTopLevel: top,
  nonceA: a.nonce, nonceB: b.nonce, portA: (a.host.argv.find((x) => x.startsWith('--remote-debugging-port')) || ''),
  portB: (b.host.argv.find((x) => x.startsWith('--remote-debugging-port')) || ''),
  eventsA: a.events.length, eventsB: b.events.length }, null, 1));
