#!/usr/bin/env node
// Analysis for the R71Exec3 pinch variant probe: reads the per-variant receipts and emits
// the falsification tables (clamp, negative, queue, touch/mobile, speed law, deltaY law,
// anchor bounds) plus analysis.json. Usage:
//   node analyze-pinchprobe-r71.mjs --receipts <ABS dir> --out <ABS analysis.json>
// The deltaY law test: for every wheel event, left side dY (observed) versus
// right side -100*ln(k)/S with k = S_i/S_{i-1} (S = the visualViewport.scale the page
// recorded at dispatch, S_0 = the leg's scaleBefore). The integral form
// sum(-dY_i*S_i)/100 versus ln(scaleFactor) is alignment-free and is the decisive test.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const dir = opt('receipts'); const outPath = opt('out');
if (!dir || !outPath) { console.error('usage: --receipts <dir> --out <analysis.json>'); process.exit(2); }
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== path.basename(outPath)).sort();
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : Number(x));
const ln = Math.log;
const analysis = { schema: 'tabi-r71-pinchprobe-analysis-R71Exec3', receipts: {}, law: {}, speed: {}, clamps: {}, queue: {}, touch: {}, bounds: {}, negative: {} };

for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (!r || r.schema !== 'tabi-r71-pinchprobe-R71Exec3') continue;
  const key = r.variant + (f.includes('run1') ? '-run1' : '');
  analysis.receipts[key] = {
    file: f, nonce: r.nonce, predicate: r.predicate, failures: r.failures,
    legs: r.legs.map((l) => ({ name: l.name, result: l.cdpResult ?? null, error: l.cdpError ?? null, liveness: l.liveness ?? null, elapsedMs: l.elapsedMs, scaleBefore: l.scaleBefore?.page ?? null, scaleAfter: l.scaleAfter?.page ?? null, scaleAfterCdp: l.scaleAfter?.cdp ?? null })),
    shape: r.legShape,
  };
  const wheels = (leg) => r.events.filter((e) => e.leg === leg && e.type === 'wheel');
  const legOf = (name) => r.legs.find((l) => l.name === name);

  if (r.variant === 'law' || r.variant === 'scale025' || r.variant === 'scale3' || r.variant === 'touchmobile') {
    for (const leg of r.legs) {
      const w = wheels(leg.name);
      if (w.length === 0) continue;
      const plan = leg.plan.pinch || {};
      const sf = plan.scaleFactor;
      const S = w.map((e) => num(e.scaleRaw));
      const dY = w.map((e) => num(e.deltaYRaw));
      const S0 = num(leg.scaleBefore.page);
      const sumNoDiv = dY.reduce((a, d) => a - d, 0) / 100;
      const sumDiv = dY.reduce((a, d, i) => a - d * S[i], 0) / 100;
      const rows = dY.map((d, i) => {
        const impliedK = Math.exp(-d * S[i] / 100);
        const prev = i === 0 ? S0 : S[i - 1];
        const trajK = S[i] / prev;
        return { i: i + 1, deltaY: +d.toFixed(6), S: +S[i].toFixed(6), impliedK: +impliedK.toFixed(6), trajK: +trajK.toFixed(6), residPct: +(100 * (impliedK / trajK - 1)).toFixed(3) };
      });
      analysis.law[`${key}:${leg.name}`] = {
        scaleFactor: sf, n: w.length, spanMs: r.legShape[leg.name].wheelSpanMs, scaleBefore: S0, scaleAfter: num(leg.scaleAfter.page),
        sumNoDiv: +sumNoDiv.toFixed(5), sumDiv: +sumDiv.toFixed(5), lnScaleFactor: sf ? +ln(sf).toFixed(5) : null,
        ratioDiv: sf ? +(sumDiv / ln(sf)).toFixed(5) : null,
        residPctMaxMid: +Math.max(...rows.slice(3, -1).map((x) => Math.abs(x.residPct))).toFixed(3),
        rows,
      };
    }
  }
  if (r.variant === 'speed1600' || r.variant === 'speed100') {
    const leg = r.legs.find((l) => l.name === 's');
    const sf = leg.plan.pinch.scaleFactor; const speed = leg.plan.pinch.relativeSpeed;
    const predicted = 1000 * ((sf > 1 ? sf - 1 : 1 / sf - 1) * 200) / speed;
    const observed = r.legShape.s.wheelSpanMs;
    analysis.speed[key] = { scaleFactor: sf, relativeSpeed: speed, predictedMs: predicted, observedMs: observed, ratio: +(observed / predicted).toFixed(4), wheels: r.legShape.s.wheels, scaleAfter: num(leg.scaleAfter.page) };
  }
  if (r.variant === 'scale3' || r.variant === 'scale025' || r.variant === 'bounds') {
    analysis.clamps[key] = r.legs.map((l) => ({ name: l.name, scaleFactor: l.plan.pinch?.scaleFactor ?? null, anchor: l.plan.pinch ? [l.plan.pinch.x, l.plan.pinch.y] : null, result: l.cdpResult ?? null, error: l.cdpError ?? null, scaleBefore: num(l.scaleBefore.page), scaleAfter: num(l.scaleAfter.page), wheels: r.legShape[l.name].wheels }));
  }
  if (r.variant === 'queue') {
    const per = {};
    for (const leg of r.legs) {
      const evs = r.events.filter((e) => e.leg === leg.name);
      per[leg.name] = {
        error: leg.cdpError, liveness: leg.liveness ?? null, elapsedMs: leg.elapsedMs,
        wheels: evs.filter((e) => e.type === 'wheel').length,
        nonzeroWheels: evs.filter((e) => e.type === 'wheel' && num(e.deltaYRaw) !== 0).length,
        deltaYValues: [...new Set(evs.filter((e) => e.type === 'wheel').map((e) => e.deltaYRaw))],
        scaleBefore: num(leg.scaleBefore.page), scaleAfter: num(leg.scaleAfter.page),
      };
    }
    analysis.queue[key] = per;
  }
  if (r.variant === 'touchmobile') {
    analysis.touch[key] = r.legs.map((l) => ({
      name: l.name, pre: (l.plan.pre || []).map((p) => p.method), pinch: l.plan.pinch || null,
      result: l.cdpResult ?? null, error: l.cdpError ?? null,
      scaleBefore: num(l.scaleBefore.page), scaleAfter: num(l.scaleAfter.page),
      kinds: r.legShape[l.name].kinds, wheels: r.legShape[l.name].wheels, touchmoves: r.legShape[l.name].touchmoves,
      touchPoints: r.legShape[l.name].touchPoints,
    }));
  }
  if (r.variant === 'edge') {
    analysis.bounds[key] = r.legs.map((l) => ({ name: l.name, anchor: l.plan.pinch ? [l.plan.pinch.x, l.plan.pinch.y] : null, source: l.plan.pinch ? l.plan.pinch.gestureSourceType : null, result: l.cdpResult ?? null, error: l.cdpError ?? null, scaleBefore: num(l.scaleBefore.page), scaleAfter: num(l.scaleAfter.page), wheels: r.legShape[l.name].wheels, touchPoints: r.legShape[l.name].touchPoints, nonMove: r.legShape[l.name].nonMove }));
  }
  if (r.variant === 'negative') {
    const leg = r.legs.find((l) => l.name === 'neg');
    const evs = r.events.filter((e) => e.leg === 'neg');
    analysis.negative[key] = {
      result: leg.cdpResult ?? null, error: leg.cdpError ?? null, elapsedMs: leg.elapsedMs,
      scaleBefore: num(leg.scaleBefore.page), scaleAfter: num(leg.scaleAfter.page),
      events: evs.map((e) => ({ type: e.type, isTrusted: e.isTrusted, ctrlKey: e.ctrlKey, deltaYRaw: e.deltaYRaw, scaleRaw: e.scaleRaw, x: e.clientX, y: e.clientY, target: e.target })),
      wsClosed: r.wsClosed, childExit: r.host.childExit,
    };
  }
}
fs.writeFileSync(outPath, JSON.stringify(analysis, null, 1));
// Human table.
const line = (s) => console.log(s);
line('== clamps ==');
for (const [k, rows] of Object.entries(analysis.clamps)) for (const x of rows) line(`${k} ${x.name} sf=${x.scaleFactor} anchor=${x.anchor} -> ${x.error ? 'ERR ' + x.error : 'ok'} scale ${x.scaleBefore} -> ${x.scaleAfter} wheels=${x.wheels}`);
line('== speed ==');
for (const [k, x] of Object.entries(analysis.speed)) line(`${k} sf=${x.scaleFactor} speed=${x.relativeSpeed} predicted=${x.predictedMs}ms observed=${x.observedMs}ms ratio=${x.ratio} wheels=${x.wheels} final=${x.scaleAfter}`);
line('== law (integral) ==');
for (const [k, x] of Object.entries(analysis.law)) line(`${k} sf=${x.scaleFactor} n=${x.n} span=${x.spanMs} sum(-dY)/100=${x.sumNoDiv} sum(-dY*S)/100=${x.sumDiv} ln(sf)=${x.lnScaleFactor} ratio=${x.ratioDiv} midResidMax%=${x.residPctMaxMid}`);
line('== negative ==');
for (const [k, x] of Object.entries(analysis.negative)) line(`${k} result=${JSON.stringify(x.result)} err=${x.error} scale ${x.scaleBefore}->${x.scaleAfter} events=${JSON.stringify(x.events)} childExit=${JSON.stringify(x.childExit)}`);
line('== queue ==');
for (const [k, per] of Object.entries(analysis.queue)) for (const [leg, x] of Object.entries(per)) line(`${k} ${leg} err=${x.error} live=${JSON.stringify(x.liveness)} wheels=${x.wheels} nonzero=${x.nonzeroWheels} dY=${JSON.stringify(x.deltaYValues)} scale ${x.scaleBefore}->${x.scaleAfter}`);
line('== touch/mobile ==');
for (const [k, rows] of Object.entries(analysis.touch)) for (const x of rows) line(`${k} ${x.name} pre=${x.pre.join(',') || '-'} sf=${x.pinch?.scaleFactor} src=${x.pinch?.gestureSourceType || 'default'} -> ${x.error ? 'ERR ' + x.error : 'ok'} scale ${x.scaleBefore}->${x.scaleAfter} wheels=${x.wheels} touchmoves=${x.touchmoves} kinds=${x.kinds.join('|')}`);
line('== edge ==');
for (const [k, rows] of Object.entries(analysis.bounds)) for (const x of rows) line(`${k} ${x.name} anchor=${x.anchor} src=${x.source} -> ${x.error ? 'ERR ' + x.error : 'ok'} scale ${x.scaleBefore}->${x.scaleAfter} wheels=${x.wheels} nonMove=${x.nonMove.join('|')} touches=${JSON.stringify(x.touchPoints)}`);
