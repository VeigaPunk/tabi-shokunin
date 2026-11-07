import fs from 'node:fs';
const files = process.argv.slice(2);
const law = { in: -100 * Math.log(2), out: -100 * Math.log(0.5), clamp: -100 * Math.log(0.5), default: -100 * Math.log(1.5) };
const rows = [];
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(f, 'utf8'));
  const w = (leg) => r.events.filter((e) => e.leg === leg && e.type === 'wheel');
  const sum = (leg) => w(leg).reduce((a, e) => a + e.deltaY * e.scale, 0);
  const dev = {}; for (const leg of Object.keys(law)) dev[leg] = +(sum(leg) - law[leg]).toFixed(4);
  const clampW = w('clamp');
  rows.push({
    file: f.split('/').slice(-1)[0], nonce: r.nonce,
    in0x: w('in')[0]?.clientX, in0y: w('in')[0]?.clientY,
    inXs: [...new Set(w('in').map((e) => e.clientX))],
    clampXY: [...new Set(clampW.map((e) => e.clientX + ',' + e.clientY))],
    defX: [...new Set(w('default').map((e) => e.clientX))], defY: [...new Set(w('default').map((e) => e.clientY))],
    dev,
    clampScales: [...new Set(clampW.map((e) => +e.scale.toFixed(4)))],
    clampDelta0: clampW[0] ? +clampW[0].deltaY.toFixed(4) : null,
    clampDeltaLast: clampW.length ? +clampW[clampW.length - 1].deltaY.toFixed(4) : null,
    touchSpan: r.legShape?.touch?.touchSpanMs, slowSpan: r.legShape?.slow?.touchSpanMs,
    ratio: r.slowToTouchSpanRatio,
    wheelSpans: { in: r.legShape?.in?.wheelSpanMs, out: r.legShape?.out?.wheelSpanMs, clamp: r.legShape?.clamp?.wheelSpanMs, default: r.legShape?.default?.wheelSpanMs, zero: r.legShape?.zero?.wheelSpanMs },
    counts: { in: w('in').length, out: w('out').length, clamp: w('clamp').length, default: w('default').length, zero: w('zero').length },
  });
}
console.log(JSON.stringify(rows, null, 1));
