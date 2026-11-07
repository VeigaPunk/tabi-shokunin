// Independent derivation over file-chooser receipts. No repo code imported.
import fs from 'node:fs';
import path from 'node:path';

const lane = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const files = process.argv.slice(2);

function base(p) { return path.basename(p); }

for (const f of files) {
  const p = path.isAbsolute(f) ? f : path.join(lane, f);
  const raw = fs.readFileSync(p, 'utf8');
  const r = JSON.parse(raw);
  const out = {
    file: p,
    sha256_note: 'computed-separately',
    schema: r.schema,
    nonce: r.nonce,
    driverSha256: r.driverSha256,
    degenerate: r.degenerate ?? null,
    fixtureOrigin: r.fixture?.origin,
    frameTree: r.frameTree,
    mainFrameId: r.mainFrameId,
    frameNavigated: (r.cdpEventLog || []).filter(e => e.method === 'Page.frameNavigated').map(e => e.params),
    chooserEvents: (r.cdpEventLog || []).filter(e => e.method === 'Page.fileChooserOpened'),
    interceptSends: (r.cdpSendLog || []).filter(e => /setInterceptFileChooserDialog/.test(e.method || JSON.stringify(e))),
    eventCount: (r.events || []).length,
    eventsByLeg: {},
    legs: [],
    totals: {},
  };

  // page events grouped by leg
  for (const ev of r.events || []) {
    const k = ev.leg ?? '(none)';
    (out.eventsByLeg[k] ||= []).push(ev.type + (ev.target ? '@' + ev.target : ''));
  }

  // map chooser events to legs via legs[].openedNode? use legShape.opened (driver-derived) AND raw event log
  const shape = r.legShape || {};
  const choices = (r.cdpEventLog || []).filter(e => e.method === 'Page.fileChooserOpened');
  let chooserIdx = 0;
  for (const leg of r.legs || []) {
    const sh = shape[leg.name] || {};
    const openedEvents = [];
    // opened array in legShape is [[mode, id], ...]
    for (const o of sh.opened || []) openedEvents.push({ mode: o[0], backendNodeId: o[1] });
    out.legs.push({
      name: leg.name,
      kind: leg.kind,
      interceptSendId: leg.interceptSendId,
      interceptResult: leg.interceptResult,
      triggerSendId: leg.triggerSendId,
      triggerResult: leg.triggerResult,
      opened: leg.opened,
      openedNode: leg.openedNode,
      openedFromShape: openedEvents,
      setParams: leg.setParams,
      setResult: leg.setResult,
      setError: leg.setError,
      pageEventTypes: (out.eventsByLeg[leg.name] || []),
      filesFromShape: sh.files || [],
      readsFromShape: sh.read || [],
      stateAfter: leg.stateAfter ?? sh.stateAfter,
    });
  }

  // consistency: driver's openedNode (legs[]) vs legShape.opened ids vs raw fileChooserOpened events in order
  out.evidence = {
    driverOpenedNodeIds: (r.legs || []).filter(l => l.openedNode != null).map(l => [l.name, l.openedNode]),
    rawChooserBackendIds: choices.map(c => [c.params.mode, c.params.backendNodeId, c.afterSendId]),
    uniqueIdByInput: {},
  };
  // derive id->input by joining legs' trigger target and openedNode
  const triggerTarget = {};
  for (const leg of r.legs || []) {
    if (leg.openedNode != null) {
      const evs = (r.events || []).filter(e => e.leg === leg.name && ['pointerdown','click'].includes(e.type));
      const t = evs[0]?.target ?? null;
      (out.evidence.uniqueIdByInput[t] ||= new Set()).add(leg.openedNode);
      triggerTarget[leg.name] = t;
    }
  }
  for (const k of Object.keys(out.evidence.uniqueIdByInput)) {
    out.evidence.uniqueIdByInput[k] = [...out.evidence.uniqueIdByInput[k]];
  }
  out.triggerTarget = triggerTarget;
  out.stateAfterAll = Object.fromEntries((r.legs || []).map(l => [l.name, l.stateAfter]));

  console.log(JSON.stringify(out, null, 1));
}
