// TABI-B1 audit — mechanical verification of the fresh-port rerun vs multi-step-journey.md pins.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = '/tmp/tabi-b1-r3b-journey';
const sha = (b) => createHash('sha256').update(b).digest('hex');
let pass = 0, fail = 0;
const ck = (ok, label) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); };

const pinned = {
  png: {
    'step-1-index': 'e9d8c83c880158775f8aef00b0785adc9fe603f001f0230ce08b44c8a387bc12',
    'step-1-index-idem': 'e9d8c83c880158775f8aef00b0785adc9fe603f001f0230ce08b44c8a387bc12',
    'step-2-detail': '6d48d45ebecfaa49d3297b3842646ee590ab44042bca9798c560b95152dea6dc',
    'step-3-form': '15a97130785f7562f92bd2229bf0dcd1a6b302980eac8b83513d8645b8e669a8',
    'step-3-form-filled': '8cc96fdf637a606efde36a240356f2867d1b0c3ebfb1be096a94af8705b8ad7c',
    'step-4-confirm': 'a12566cd4890fbddd0438c4d71e3c5dc50e4f7a6eaa2edc17bac73e41d60693b',
  },
  pngBytes: { 'step-1-index': 14810, 'step-1-index-idem': 14810, 'step-2-detail': 15068, 'step-3-form': 13354, 'step-3-form-filled': 14240, 'step-4-confirm': 12692 },
  shape: {
    'step-1-index': ['af23de0471797ee7e39443c4aefc0aa3216c2209dd8b0eb276d573b24b2dbba6', '2f77717b0501dd90d51526dedaf56dcac8a6ea1a462778a605e095ce94011bee'],
    'step-1-index-idem': ['af23de0471797ee7e39443c4aefc0aa3216c2209dd8b0eb276d573b24b2dbba6', '2f77717b0501dd90d51526dedaf56dcac8a6ea1a462778a605e095ce94011bee'],
    'step-2-detail': ['f4ecc2771d1af837d5d8a6497daee75ba49f4c860496d09577432b997f31d232', 'd6ba6564883ef2afc902a59c42e3620e72b66ee52c2cc4062f57309fed396d73'],
    'step-3-form': ['23aa4e306ec3a449ea162ffcd3295dfa74a4d8271fb42dd331390b1fd74ef871', '0db82bf93c127a13f7cbf3b00e593670eb69cb1ccff2d0029e1be5c71f1f7772'],
    'step-3-form-filled': ['23aa4e306ec3a449ea162ffcd3295dfa74a4d8271fb42dd331390b1fd74ef871', '0db82bf93c127a13f7cbf3b00e593670eb69cb1ccff2d0029e1be5c71f1f7772'],
    'step-4-confirm': ['a6a9c3aca791595971091703c7e73dab2f0104b6c5a2219f7675a5d6d87153da', 'a346a204ed62474f1bf12f872f8bec28ff4ca5252db8fc1e0c8f3680e013e7bf'],
  },
};
const expUrl = {
  'step-1-index': 'http://127.0.0.1:19481/index.html',
  'step-1-index-idem': 'http://127.0.0.1:19481/index.html',
  'step-2-detail': 'http://127.0.0.1:19481/detail.html?id=1',
  'step-3-form': 'http://127.0.0.1:19481/form.html?id=1',
  'step-3-form-filled': 'http://127.0.0.1:19481/form.html?id=1',
  'step-4-confirm': 'http://127.0.0.1:19481/confirm.html?traveler=tabi-r3&mode=rail&item=1',
};
const expHist = { 'step-1-index': 'typed', 'step-1-index-idem': 'typed', 'step-2-detail': 'link', 'step-3-form': 'link', 'step-3-form-filled': 'link', 'step-4-confirm': 'form_submit' };
const expNodes = { 'step-1-index': 37, 'step-1-index-idem': 37, 'step-2-detail': 42, 'step-3-form': 53, 'step-3-form-filled': 53, 'step-4-confirm': 43 };
const expNetCounts = { 'step-1-index': 3, 'step-1-index-idem': 0, 'step-2-detail': 3, 'step-3-form': 2, 'step-3-form-filled': 0, 'step-4-confirm': 2 };

for (const run of [1, 2]) {
  const rec = JSON.parse(readFileSync(`${root}/run${run}/journey.json`, 'utf8'));
  const tags = rec.captures.map((c) => c.tag);
  ck(JSON.stringify(tags) === JSON.stringify(Object.keys(pinned.png)), `run${run}: six captures in order`);
  for (const c of rec.captures) {
    const pngDisk = sha(readFileSync(`${root}/run${run}/${c.tag}.png`));
    const shapeDisk = sha(readFileSync(`${root}/run${run}/${c.tag}.shape.txt`));
    const ds = JSON.parse(readFileSync(`${root}/run${run}/${c.tag}.domsnapshot.json`, 'utf8'));
    const doc = ds.documents[0];
    const strings = ds.strings;
    const str = (i) => (typeof i === 'number' && i >= 0 && i < strings.length ? strings[i] : '');
    const structLines = doc.nodes.nodeName.map((ni, i) => {
      const p = doc.nodes.parentIndex[i];
      const depth = p >= 0 ? structDepth(doc.nodes, i) : 0;
      return `${'  '.repeat(depth)}${str(ni)}`;
    });
    function structDepth(nodes, i) { let d = 0, p = nodes.parentIndex[i]; while (p >= 0) { d++; p = nodes.parentIndex[p]; } return d; }
    const structDisk = sha(structLines.map((_, i) => `${structDepth(doc.nodes, i)}:${str(doc.nodes.nodeName[i])}`).join('\n') + '\n');
    ck(pngDisk === c.png.sha256 && pngDisk === pinned.png[c.tag], `run${run} ${c.tag}: png disk==json==pin (${c.png.sha256.slice(0, 12)})`);
    ck(c.png.bytes === pinned.pngBytes[c.tag] && c.png.dims.width === 800 && c.png.dims.height === 600, `run${run} ${c.tag}: png bytes ${c.png.bytes} 800x600`);
    ck(shapeDisk === c.shape.sha256 && shapeDisk === pinned.shape[c.tag][0], `run${run} ${c.tag}: shape disk==json==pin`);
    ck(structDisk === c.shape.structSha256 && structDisk === pinned.shape[c.tag][1], `run${run} ${c.tag}: struct disk==json==pin`);
    ck(c.shape.nodes === expNodes[c.tag], `run${run} ${c.tag}: nodes=${c.shape.nodes}`);
    ck(c.url === expUrl[c.tag], `run${run} ${c.tag}: url read-back`);
    ck(c.history.transitionType === expHist[c.tag], `run${run} ${c.tag}: transition=${c.history.transitionType}`);
    ck(c.net.length === expNetCounts[c.tag], `run${run} ${c.tag}: net slice ${c.net.length} events`);
  }
  const h = rec.history;
  ck(h.entries.length === 5 && h.currentIndex === 4, `run${run}: history 5 entries, currentIndex 4`);
  const seq = h.entries.map((e) => {
    const u = new URL(e.url);
    return `${e.transitionType}:${u.protocol === 'about:' ? e.url : u.pathname + u.search}`;
  });
  ck(JSON.stringify(seq) === JSON.stringify(['auto_toplevel:about:blank', 'typed:/index.html', 'link:/detail.html?id=1', 'link:/form.html?id=1', 'form_submit:/confirm.html?traveler=tabi-r3&mode=rail&item=1']), `run${run}: history sequence ${seq.join(' -> ')}`);
  ck(rec.targetLaunch.id === rec.targetEnd.id, `run${run}: page target id stable across journey`);
  ck(rec.targetEnd.url === expUrl['step-4-confirm'], `run${run}: /json/list targetEnd url == confirm read-back`);
  ck(rec.viewport.innerWidth === 800 && rec.viewport.innerHeight === 600 && rec.viewport.devicePixelRatio === 1, `run${run}: viewport 800x600 dpr1`);
  const inputsForm = rec.captures.find((c) => c.tag === 'step-3-form').inputs;
  const inputsFilled = rec.captures.find((c) => c.tag === 'step-3-form-filled').inputs;
  ck(JSON.stringify(inputsForm) === JSON.stringify([{ id: 'traveler', name: 'traveler', type: 'text', inputValue: null, inputChecked: null }, { id: 'mode-rail', name: 'mode', type: 'radio', inputValue: 'rail', inputChecked: false }, { id: 'mode-trail', name: 'mode', type: 'radio', inputValue: 'trail', inputChecked: false }, { id: 'item-field', name: 'item', type: 'hidden', inputValue: '1', inputChecked: null }]), `run${run}: step-3-form inputs (traveler empty(-1), radios value-attr unchecked, item=1)`);
  ck(JSON.stringify(inputsFilled) === JSON.stringify([{ id: 'traveler', name: 'traveler', type: 'text', inputValue: 'tabi-r3', inputChecked: null }, { id: 'mode-rail', name: 'mode', type: 'radio', inputValue: 'rail', inputChecked: true }, { id: 'mode-trail', name: 'mode', type: 'radio', inputValue: 'trail', inputChecked: false }, { id: 'item-field', name: 'item', type: 'hidden', inputValue: '1', inputChecked: null }]), `run${run}: step-3-form-filled inputs (tabi-r3, rail checked)`);
  ck(rec.netEvents.length === 10, `run${run}: client netEvents total ${rec.netEvents.length}`);
  const nonLoop = rec.netEvents.filter((e) => !e.url.startsWith('http://127.0.0.1:19481/'));
  ck(nonLoop.length === 0, `run${run}: all client net URLs loopback:19481 (${nonLoop.length} offenders)`);
  const fav = rec.captures.find((c) => c.tag === 'step-1-index').net.find((e) => e.url.includes('favicon'));
  ck(fav && fav.status === 404, `run${run}: favicon 404 present in step-1 slice (reported, not adopted)`);
  const styleSlices = rec.captures.flatMap((c) => c.net).filter((e) => e.url.includes('style.css'));
  ck(styleSlices.length === 4 && styleSlices.every((e) => e.status === 200 && e.fromDiskCache === false && e.fromMemoryCache === false), `run${run}: style.css 4 client events, all 200 flag-false (wire has 1 — §5 delta)`);
  ck(rec.browser.browser.includes('152.0.7977.82'), `run${run}: chromium ${rec.browser.browser}`);
}
const log = readFileSync(`${root}/run1/http.log`, 'utf8').trim().split('\n');
ck(log.length === 8, `run1: http.log 8 lines (7 requests + 404 explainer)`);
ck(log[7] === `127.0.0.1 - - [${log[7].split('[')[1]?.slice(0, 11)}] "GET /confirm.html?traveler=tabi-r3&mode=rail&item=1 HTTP/1.1" 200 -` || /"GET \/confirm\.html\?traveler=tabi-r3&mode=rail&item=1 HTTP\/1\.1" 200 -/.test(log[7]), `run1: http.log line 8 exact confirm GET 200`);
ck(log.filter((l) => l.includes('style.css')).length === 1, `run1: wire style.css exactly once (client saw 4)`);
ck(log.every((l) => l.startsWith('127.0.0.1 ')), 'run1: every wire request from 127.0.0.1');
const log2 = readFileSync(`${root}/run2/http.log`, 'utf8').trim().split('\n');
ck(log2.length === 8 && /"GET \/confirm\.html\?traveler=tabi-r3&mode=rail&item=1 HTTP\/1\.1" 200 -/.test(log2[7]), 'run2: http.log 8 lines, line 8 confirm GET 200');
for (const run of [1, 2]) {
  const wl = readFileSync(`${root}/run${run}/driver.log`, 'utf8');
  ck(/pass: ports 19481\/19482 not listening/.test(wl), `run${run}: driver.log closure line ports`);
  ck(/pass: no chromium process/.test(wl), `run${run}: driver.log closure line chromium`);
  ck(/curl cdp exit=7/.test(wl) && /curl http exit=7/.test(wl), `run${run}: driver.log curl exit=7 x2`);
  ck(/fresh profile: removing/.test(wl), `run${run}: driver.log fresh-profile line`);
}
console.log(`\n== ${pass} PASS, ${fail} FAIL ==`);
process.exit(fail ? 1 : 0);
