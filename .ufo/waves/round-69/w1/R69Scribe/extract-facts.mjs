#!/usr/bin/env node
// Re-derive the aggregate facts cited by
// chromium-synth-scroll-gesture-runtime-round-69.md from the scored receipt.
// Read-only: prints JSON to stdout; no writes.
// Usage: node extract-facts.mjs <receipt.json> [<second receipt.json>]
import fs from 'node:fs';
import crypto from 'node:crypto';

const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const files = process.argv.slice(2);
if (files.length === 0) { console.error('usage: node extract-facts.mjs <receipt.json> [...]'); process.exit(2); }

const out = files.map((file) => {
  const r = JSON.parse(fs.readFileSync(file, 'utf8'));
  const legs = r.legs.map((l) => {
    const evs = r.events.filter((e) => e.leg === l.name);
    const wheels = evs.filter((e) => e.type === 'wheel');
    const counts = {};
    for (const e of evs) counts[e.type] = (counts[e.type] || 0) + 1;
    return {
      name: l.name,
      scrollYBefore: l.scrollYBefore,
      scrollY: l.scrollY,
      wheelCount: wheels.length,
      wheelDeltaYSum: wheels.reduce((a, e) => a + e.deltaY, 0),
      wheelDeltaModeValues: [...new Set(wheels.map((e) => e.deltaMode))],
      scrollendCount: counts.scrollend || 0,
      scrollendScrollY: evs.filter((e) => e.type === 'scrollend').map((e) => e.scrollYAtDispatch),
      eventTypes: counts,
      nontrusted: evs.filter((e) => e.isTrusted !== true).length,
      elapsedMs: l.elapsedMs,
    };
  });
  return {
    receipt: file,
    receiptSha256: sha256(file),
    schema: r.schema, nonce: r.nonce, degenerate: r.degenerate,
    driverSha256: r.driverSha256,
    host: r.host && { chromium: r.host.chromium, cdpProduct: r.host.cdpProduct, cdpProtocolVersion: r.host.cdpProtocolVersion },
    fixture: r.fixture && { sha256: r.fixture.sha256, origin: r.fixture.origin, viewport: r.fixture.viewport, documentHeight: r.fixture.documentHeight },
    legs,
    pageState: r.pageState,
    failures: r.failures,
    synthScrollHypothesis: r.synthScrollHypothesis,
    predicate: r.predicate,
    teardown: r.teardown,
    sweeps: r.sweeps,
    synthScrollCalls: (r.cdpSendLog || []).filter((c) => c.method === 'Input.synthesizeScrollGesture').length,
    otherInputCalls: (r.cdpSendLog || []).filter((c) => c.method.startsWith('Input.') && c.method !== 'Input.synthesizeScrollGesture').length,
  };
});
console.log(JSON.stringify(out.length === 1 ? out[0] : out, null, 1));
