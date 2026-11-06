#!/usr/bin/env node
// Aggregate R69Exec4 variant receipts into one table (reads *.json receipts given on argv).
import fs from 'node:fs';
const rows = [];
for (const f of process.argv.slice(2)) {
  const r = JSON.parse(fs.readFileSync(f, 'utf8'));
  const t = r.measurements.touch;
  rows.push({
    variant: r.variant,
    controlScroll: r.measurements.control.deltaTargetScroll,
    touchScroll: t.deltaTargetScroll,
    touchScrolled: t.scrolled,
    touchstart: t.touchstart, touchmove: t.touchmove, touchend: t.touchend,
    pointermove: t.pointermove, wheel: t.wheel,
    scrollEvents: t.scrollEvents,
    innerWidth: r.viewportInfo.innerWidth, innerHeight: r.viewportInfo.innerHeight,
    maxTouchPoints: r.viewportInfo.touchPoints,
    emulation: r.emulation.map((e) => e[0]),
    flags: r.flags,
    failures: r.failures.map((x) => x.id + ':' + x.detail),
  });
}
console.log(JSON.stringify(rows, null, 1));
