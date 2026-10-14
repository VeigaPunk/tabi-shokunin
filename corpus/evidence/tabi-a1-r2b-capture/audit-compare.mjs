// TABI-A1 audit — mechanical reproduction of compare.mjs checks on the audit scratch root,
// plus cross-checks against corpus-quoted hashes and det.json field claims.
// Session material (target ids, ws uuids) is checked by SHAPE (regex) only, never printed.
import { readFileSync } from 'node:fs';
const A = '/tmp/tabi-a1-r2b-capture';       // audit scratch
const O = '/tmp/tabi-r2-1-capture';         // original staging (read-only reference)
const load = (root, run, phase) => JSON.parse(readFileSync(`${root}/run${run}/${phase}.json`, 'utf8'));
const get = (rec, tag) => rec.captures.find((c) => c.tag === tag);

const det1 = load(A, 1, 'det'), det2 = load(A, 2, 'det');
const nd1 = load(A, 1, 'nondet'), nd2 = load(A, 2, 'nondet');
const odet1 = load(O, 1, 'det'), odet2 = load(O, 2, 'det');

let pass = 0, fail = 0;
const check = (label, cond, detail = '') => {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'}\t${label}${detail ? '\t' + detail : ''}`);
};
const eq = (a, b) => a === b;

// --- corpus-quoted full hashes (live-dynamic-capture.md §2) ---
const CORPUS = {
  detBeforePng: 'c08947dc1e02f0ea551b3beb42b4a3eb9641347d6d5ae65bebcbba01c0802dc1',
  detAfterPng: '7488d544ed53e0dbc25f9ae3c65c22b609a58c901c8a7b95aeec82ebde4b42c7',
  detBeforeShape: 'd85c76fb9d814f93ac821138e76418ca84799090493183c3fa2e75f5238dcab0',
  detAfterShape: 'ba497530f3884d0d445d2ec8190eb743a04b1bcb8379b6214af42ff134f20714',
  structBeforeAndNondet: '3f4f9240199be05f5a8de50871128492fcd087c8db9e26941254d283d3734db5',
  structAfter: 'c8a8e862afae4071f364d634ed892655d2e941f35f2d599ce52911a7ca36dd68',
  detBeforeBytes: 18672, detAfterBytes: 23210,
  clickX: 66.8046875, clickY: 172.875,
  nodesBefore: 55, nodesAfter: 65,
};

// 1. det byte-identity within audit
check('det before png: A-R1 == A-R2', eq(get(det1,'before').png.sha256, get(det2,'before').png.sha256));
check('det before png: within-run before == before2 (R1)', eq(get(det1,'before').png.sha256, get(det1,'before2').png.sha256));
check('det before png: within-run before == before2 (R2)', eq(get(det2,'before').png.sha256, get(det2,'before2').png.sha256));
check('det after png: A-R1 == A-R2', eq(get(det1,'after').png.sha256, get(det2,'after').png.sha256));
check('det after != before (mutation delta, R1)', !eq(get(det1,'after').png.sha256, get(det1,'before').png.sha256));
check('det after != before (mutation delta, R2)', !eq(get(det2,'after').png.sha256, get(det2,'before').png.sha256));

// 2. det cross vs ORIGINAL run and vs corpus pins
check('det before png: audit == original-R1', eq(get(det1,'before').png.sha256, get(odet1,'before').png.sha256));
check('det before png: audit == original-R2', eq(get(det1,'before').png.sha256, get(odet2,'before').png.sha256));
check('det after png: audit == original-R1', eq(get(det1,'after').png.sha256, get(odet1,'after').png.sha256));
check('det after png: audit == original-R2', eq(get(det1,'after').png.sha256, get(odet2,'after').png.sha256));
check('det before png == corpus pin', eq(get(det1,'before').png.sha256, CORPUS.detBeforePng));
check('det after png == corpus pin', eq(get(det1,'after').png.sha256, CORPUS.detAfterPng));
check('det shape text before == corpus pin (A-R1, A-R2)',
  eq(get(det1,'before').shape.sha256, CORPUS.detBeforeShape) && eq(get(det2,'before').shape.sha256, CORPUS.detBeforeShape));
check('det shape text after == corpus pin (A-R1, A-R2)',
  eq(get(det1,'after').shape.sha256, CORPUS.detAfterShape) && eq(get(det2,'after').shape.sha256, CORPUS.detAfterShape));
check('struct(before) == corpus pin (A-R1, A-R2)',
  eq(get(det1,'before').shape.structSha256, CORPUS.structBeforeAndNondet) && eq(get(det2,'before').shape.structSha256, CORPUS.structBeforeAndNondet));
check('struct(after) == corpus pin (A-R1, A-R2)',
  eq(get(det1,'after').shape.structSha256, CORPUS.structAfter) && eq(get(det2,'after').shape.structSha256, CORPUS.structAfter));
check('det png bytes match corpus (18672/23210)',
  get(det1,'before').png.bytes === CORPUS.detBeforeBytes && get(det1,'after').png.bytes === CORPUS.detAfterBytes);
check('det node counts 55 -> 65 (both runs)',
  get(det1,'before').shape.nodes === CORPUS.nodesBefore && get(det1,'after').shape.nodes === CORPUS.nodesAfter &&
  get(det2,'before').shape.nodes === CORPUS.nodesBefore && get(det2,'after').shape.nodes === CORPUS.nodesAfter);

// 3. nondet boundary
check('nondet png nd1 != nd2 within-run (R1)', !eq(get(nd1,'nd1').png.sha256, get(nd1,'nd2').png.sha256));
check('nondet png nd1 != nd2 within-run (R2)', !eq(get(nd2,'nd1').png.sha256, get(nd2,'nd2').png.sha256));
check('nondet png nd1 differs across runs', !eq(get(nd1,'nd1').png.sha256, get(nd2,'nd1').png.sha256));
check('nondet png nd2 differs across runs', !eq(get(nd1,'nd2').png.sha256, get(nd2,'nd2').png.sha256));
check('nondet png differs from corpus R1 nd1 (fresh randomness)', !eq(get(nd1,'nd1').png.sha256, get(odet1 ? load(O,1,'nondet') : odet1, 'nd1').png.sha256));
check('nondet shape text differs within-run (R1)', !eq(get(nd1,'nd1').shape.sha256, get(nd1,'nd2').shape.sha256));
check('nondet shape struct identical within-run (R1)', eq(get(nd1,'nd1').shape.structSha256, get(nd1,'nd2').shape.structSha256));
check('nondet shape struct identical within-run (R2)', eq(get(nd2,'nd1').shape.structSha256, get(nd2,'nd2').shape.structSha256));
check('nondet shape struct identical across runs', eq(get(nd1,'nd1').shape.structSha256, get(nd2,'nd1').shape.structSha256));
check('nondet shape struct == corpus struct pin', eq(get(nd1,'nd1').shape.structSha256, CORPUS.structBeforeAndNondet));
check('nondet node count 55 (all 4 captures)',
  [get(nd1,'nd1'),get(nd1,'nd2'),get(nd2,'nd1'),get(nd2,'nd2')].every(c => c.shape.nodes === 55));
check('nondet volatile: clock/random changed between nd1 and nd2 (R1)',
  get(nd1,'nd1').volatile.clock !== get(nd1,'nd2').volatile.clock || get(nd1,'nd1').volatile.random !== get(nd1,'nd2').volatile.random);

// 4. det.json field claims (§2)
for (const [n, rec] of [['A-R1', det1], ['A-R2', det2]]) {
  check(`${n} click rect center == corpus (66.8046875, 172.875)`,
    rec.click.rect.x === CORPUS.clickX && rec.click.rect.y === CORPUS.clickY,
    `${rec.click.rect.x}, ${rec.click.rect.y}`);
  check(`${n} volatile after: count=2 items/confirms`, rec.captures.find(c=>c.tag==='after').volatile.count === '2'
    && JSON.stringify(rec.captures.find(c=>c.tag==='after').volatile.items) === JSON.stringify(['item-1','item-2'])
    && JSON.stringify(rec.captures.find(c=>c.tag==='after').volatile.confirms) === JSON.stringify(['confirm-1','confirm-2']));
  check(`${n} viewport innerWidth/innerHeight 800/600`, rec.viewport.innerWidth === 800 && rec.viewport.innerHeight === 600);
  check(`${n} dims 800x600 (before+after)`,
    get(rec,'before').png.dims.width === 800 && get(rec,'before').png.dims.height === 600 &&
    get(rec,'after').png.dims.width === 800 && get(rec,'after').png.dims.height === 600);
  check(`${n} browser/protocol Chrome/152.0.7977.82 + 1.3`,
    rec.browser.browser.includes('152.0.7977.82') && rec.browser.protocolVersion === '1.3', rec.browser.browser);
  check(`${n} cssLayoutViewport 800x600`, rec.viewport.layout.cssLayoutViewport?.clientWidth === 800 && rec.viewport.layout.cssLayoutViewport?.clientHeight === 600);
}
check('target id shape: 32 hex chars, differs across audit runs (shape-only)',
  /^[0-9A-F]{32}$/.test(det1.target.id) && /^[0-9A-F]{32}$/.test(det2.target.id) && det1.target.id !== det2.target.id);
const jvAudit1 = JSON.parse(readFileSync(`${A}/run1/json-version.json`, 'utf8'));
const jvAudit2 = JSON.parse(readFileSync(`${A}/run2/json-version.json`, 'utf8'));
const browserWsRe = /^ws:\/\/127\.0\.0\.1:19472\/devtools\/browser\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
check('browser ws uuid: shape-valid and differs per launch (json-version, shape-only)',
  browserWsRe.test(jvAudit1.webSocketDebuggerUrl) && browserWsRe.test(jvAudit2.webSocketDebuggerUrl) &&
  jvAudit1.webSocketDebuggerUrl !== jvAudit2.webSocketDebuggerUrl);
const pageWsRe = /^ws:\/\/127\.0\.0\.1:19472\/devtools\/page\/[0-9A-F]{32}$/;
check('page ws url shape-valid in det.json (shape-only)',
  pageWsRe.test(det1.target.ws) && pageWsRe.test(det2.target.ws));
check('atUTC wall-clock stamps differ (R1 vs R2 first capture)',
  get(det1,'before').atUTC !== get(det2,'before').atUTC);

// 5. protocol metadata files
const jv1 = JSON.parse(readFileSync(`${A}/run1/json-version.json`, 'utf8'));
check('json-version Browser Chrome/152.0.7977.82, Protocol-Version 1.3',
  jv1.Browser.includes('152.0.7977.82') && jv1['Protocol-Version'] === '1.3');

console.log(`\nSUMMARY\tpass=${pass}\tfail=${fail}`);
process.exit(fail ? 1 : 0);
