import fs from 'node:fs';
const all = [];
let buf = fs.readFileSync(process.argv[2], 'utf8');
// derive.out.json is a concatenation of pretty JSON objects; split on "\n{\n \"file\""
const parts = buf.split(/\n(?=\{\n "file":)/);
for (const p of parts) { if (p.trim()) all.push(JSON.parse(p)); }

const short = p => p.split('/').slice(-2).join('/');
console.log('receipts:', all.length);
console.log('\n== event counts / legs / nonce ==');
for (const r of all) {
  console.log(short(r.file), 'events=', r.eventCount, 'legs=', r.legs.length, 'nonce=', r.nonce, 'deg=', r.degenerate);
}
console.log('\n== per-leg chooser mode/id (driver legShape.opened) ==');
const modeTable = {};
for (const r of all) {
  const row = {};
  for (const l of r.legs) if (l.openedFromShape.length) row[l.name] = l.openedFromShape.map(o => o.mode + '#' + o.backendNodeId).join(',');
  modeTable[short(r.file)] = row;
}
console.log(JSON.stringify(modeTable, null, 1));
console.log('\n== driver openedNode vs legShape.opened ids ==');
for (const r of all) {
  const a = r.legs.filter(l => l.openedNode != null).map(l => l.name + ':' + l.openedNode);
  const b = r.legs.filter(l => l.openedFromShape.length).map(l => l.name + ':' + l.openedFromShape.map(o => o.backendNodeId).join('|'));
  const same = JSON.stringify(a) === JSON.stringify(b);
  console.log(short(r.file), same ? 'MATCH' : 'DIFF', same ? '' : JSON.stringify({a, b}));
}
console.log('\n== raw chooser events vs legShape.opened ids (order) ==');
for (const r of all) {
  const raw = r.chooserEvents.map(c => c.params.mode + '#' + c.params.backendNodeId);
  const shape = r.legs.flatMap(l => l.openedFromShape.map(o => o.mode + '#' + o.backendNodeId));
  console.log(short(r.file), JSON.stringify(raw) === JSON.stringify(shape) ? 'MATCH' : 'DIFF', raw.length, shape.length);
  if (JSON.stringify(raw) !== JSON.stringify(shape)) { console.log(' raw ', raw.join(' ')); console.log(' shape', shape.join(' ')); }
}
console.log('\n== frame tree ==');
for (const r of all) {
  const nav = r.frameNavigated.map(n => n.frameId + ' ' + n.url);
  const chooserFrames = [...new Set(r.chooserEvents.map(c => c.params.frameId))];
  console.log(short(r.file), JSON.stringify(r.frameTree), 'main===ftree:', r.mainFrameId === r.frameTree?.mainFrameId,
    'nav:', nav.join(';'), 'chooserFrames:', chooserFrames.join(','), 'allFramesEqMain:', chooserFrames.every(f => f === r.mainFrameId));
}
console.log('\n== id per input across legs ==');
for (const r of all) {
  const m = {};
  for (const l of r.legs) {
    if (l.openedNode == null) continue;
    const t = r.triggerTarget[l.name];
    (m[t] ||= new Set()).add(l.openedNode);
  }
  const o = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, [...v]]));
  console.log(short(r.file), JSON.stringify(o));
}
console.log('\n== per-leg page event types ==');
for (const r of all.slice(0, 1)) {
  console.log(short(r.file));
  for (const l of r.legs) console.log(' ', l.name.padEnd(16), (l.pageEventTypes || []).join(' ') || '(none)');
}
console.log('\n== set params / results ==');
for (const r of all) {
  console.log('--', short(r.file));
  for (const l of r.legs) {
    if (l.setParams || l.setResult || l.setError) {
      const files = (l.setParams?.files || []).map(f => f.split('/').slice(-1)[0]);
      console.log(' ', l.name.padEnd(16), 'files=', JSON.stringify(files), 'backendNodeId=', l.setParams?.backendNodeId, 'result=', JSON.stringify(l.setResult), 'err=', JSON.stringify(l.setError));
    }
  }
}
