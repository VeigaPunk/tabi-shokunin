#!/usr/bin/env node
// R74Revenger audit probe: does the r74 counter refuse the r73-falsified attack class
// (a previous-generation receipt relabelled on its identity fields)?
// Read-only except for files written under --work.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const C1 = path.join(LANE, '.ufo/waves/round-74/controls/c1');
const CTR = path.join(LANE, 'scripts/check-imecompose-r74.mjs');
const DRV = path.join(LANE, 'scripts/chrome-cdp-imecompose-round74.mjs');
const work = process.argv[process.argv.indexOf('--work') + 1];
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const PIN = sha(fs.readFileSync(DRV));
const tpl = /\/\*IMECOMPOSE-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\n\/\*IMECOMPOSE-FIXTURE-END\*\//.exec(fs.readFileSync(DRV, 'utf8'))[1];
const fixtureSha = (n) => sha(tpl.replaceAll('__NONCE__', n));
const POST = 'tabi-r74-l1-ca30e1a3b7b2';
const PRE = [...[1,2,3,4,5,6,7,8,9].map((i) => path.join(C1, `smoke${i}.receipt.json`)),
  ...['dispatch-key','exec-command','script-events'].map((k) => path.join(C1, `degenerate-${k}.receipt.json`))];
const P = PRE.flatMap((p) => ['--prior', p]);
const REAL = path.join(LANE, 'corpus/evidence/round74/chromium-ime-composition/receipt.json');

const runCtr = (receipt) => {
  const p = spawnSync(process.execPath, [CTR, '--receipt', receipt, '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P, '--json'], { encoding: 'utf8' });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, verdict: j && j.verdict, ids: j && j.findings ? j.findings.map((f) => f.id) : null, n: j && j.checkCount };
};

const rewriteAllNonceCarriers = (r, to) => {
  const old = r.nonce;
  r.nonce = to; r.nonceOnPage = to;
  (r.serverLog || []).forEach((s) => { if (s && typeof s.run === 'string') s.run = to; });
  for (const c of r.cdpSendLog || []) {
    if (c.method === 'Page.navigate') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(to));
    if (c.method === 'Runtime.evaluate') c.params.expression = String(c.params.expression).split(JSON.stringify(old)).join(JSON.stringify(to));
  }
  if (r.fixture) r.fixture.sha256 = fixtureSha(to);
};
const freshIds = (r) => {
  r.host.launchToken = crypto.randomBytes(6).toString('hex');
  const oldId = r.host.devtoolsListening.url.split('/devtools/browser/')[1];
  const newId = crypto.randomUUID();
  r.host.devtoolsListening.url = r.host.devtoolsListening.url.replace(oldId, newId);
  r.host.stderrHead = String(r.host.stderrHead).split(oldId).join(newId);
};

const out = {};

// 1. r73-falsified class: previous-generation receipt, every identity field relabelled.
{
  const r73 = JSON.parse(fs.readFileSync(path.join(LANE, 'corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json'), 'utf8'));
  r73.schema = 'tabi-chrome-cdp-imecompose-r74';
  r73.driverSha256 = PIN;
  rewriteAllNonceCarriers(r73, POST);
  freshIds(r73);
  const f = path.join(work, 'r73-relabel.json');
  fs.writeFileSync(f, JSON.stringify(r73));
  out.r73_relabelled_maximal = runCtr(f);
}

// 2. same but only the four identity fields r73's critic used (schema, nonce, nonceOnPage, driverSha256), no fixture/id rewrite.
{
  const r73 = JSON.parse(fs.readFileSync(path.join(LANE, 'corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json'), 'utf8'));
  r73.schema = 'tabi-chrome-cdp-imecompose-r74';
  r73.nonce = POST; r73.nonceOnPage = POST; r73.driverSha256 = PIN;
  const f = path.join(work, 'r73-relabel-four.json');
  fs.writeFileSync(f, JSON.stringify(r73));
  out.r73_relabelled_four_fields = runCtr(f);
}

// 3a. r73 1e-12 timeline escape re-run: PRIOR smoke1 fully relabelled (all identity, fixture, ids), one ts +1e-12.
{
  const r = JSON.parse(fs.readFileSync(PRE[0], 'utf8'));
  rewriteAllNonceCarriers(r, POST);
  freshIds(r);
  r.events[7].ts = Math.round((r.events[7].ts + 1e-12) * 1e9) / 1e9;
  const f = path.join(work, 'prior-1e-12.json');
  fs.writeFileSync(f, JSON.stringify(r));
  out.prior_full_rewrite_1e12 = runCtr(f);
}
// 3b. same, no time change at all: near-match must fire on the exact replay.
{
  const r = JSON.parse(fs.readFileSync(PRE[0], 'utf8'));
  rewriteAllNonceCarriers(r, POST);
  freshIds(r);
  const f = path.join(work, 'prior-exact.json');
  fs.writeFileSync(f, JSON.stringify(r));
  out.prior_full_rewrite_exact = runCtr(f);
}
// 3c. leg relabel leak (r71 class): one compose-b event relabelled into an adjacent leg, all else intact.
{
  const r = JSON.parse(fs.readFileSync(REAL, 'utf8'));
  const e = r.events.find((x) => x.leg === 'compose-b' && x.type === 'compositionupdate');
  e.leg = 'compose-a';
  const f = path.join(work, 'leg-relabel-earlier.json');
  fs.writeFileSync(f, JSON.stringify(r));
  out.leg_relabel_earlier = runCtr(f);
}
{
  const r = JSON.parse(fs.readFileSync(REAL, 'utf8'));
  const e = r.events.find((x) => x.leg === 'compose-b' && x.type === 'compositionupdate');
  e.leg = 'commit';
  const f = path.join(work, 'leg-relabel-later.json');
  fs.writeFileSync(f, JSON.stringify(r));
  out.leg_relabel_later = runCtr(f);
}

// 4. declared-limit witness re-run: prior smoke1 with all identity rewritten + ONE event moved one 0.1 ms quantum.
{
  const r = JSON.parse(fs.readFileSync(PRE[0], 'utf8'));
  rewriteAllNonceCarriers(r, POST);
  freshIds(r);
  r.events[3].ts = Math.round((r.events[3].ts + 0.1) * 10) / 10;
  const f = path.join(work, 'prior-one-quantum.json');
  fs.writeFileSync(f, JSON.stringify(r));
  out.prior_one_event_one_quantum = runCtr(f);
}

// 5. contradictory duplicate keys: two `predicate` keys, the last true, the first false.
{
  const txt = fs.readFileSync(REAL, 'utf8');
  const f = path.join(work, 'dup-predicate.json');
  fs.writeFileSync(f, txt.replace('"predicate": true', '"predicate": false,\n "predicate": true'));
  out.duplicate_predicate_key = runCtr(f);
}

// 6. baseline: the committed scored receipt.
out.scored_receipt = runCtr(REAL);

console.log(JSON.stringify(out, null, 1));
