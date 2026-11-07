#!/usr/bin/env node
// Build a relabelled/re-timed receipt from a committed smoke receipt, then it is scored
// by the pinned counter. Read-only on the lane.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const counter = path.join(LANE, 'scripts/check-dragdrop-r75.mjs');
const driver = path.join(LANE, 'scripts/chrome-cdp-dragdrop-round75.mjs');
const PIN = sha256(fs.readFileSync(driver));
const tpl = /\/\*DRAGDROP-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\n\/\*DRAGDROP-FIXTURE-END\*\//.exec(fs.readFileSync(driver, 'utf8'));
if (!tpl) throw new Error('no fixture template');
const fixtureHash = (nonce) => sha256(tpl[1].replaceAll('__NONCE__', nonce));

export function build(srcPath, outPath, nonce, mutate) {
  let r = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
  const oldNonce = r.nonce;
  // global nonce relabel (nonce, nonceOnPage, serverLog.run/query, Page.navigate url, ready expr)
  let s = JSON.stringify(r).replaceAll(oldNonce, nonce);
  r = JSON.parse(s);
  r.fixture.sha256 = fixtureHash(nonce);
  // fresh launch token and devtools browser id
  const oldUrl = r.host.devtoolsListening.url;
  const tok = crypto.randomBytes(6).toString('hex');
  const bid = crypto.randomUUID();
  const newUrl = oldUrl.replace(/\/devtools\/browser\/[0-9a-f-]+$/i, '/devtools/browser/' + bid);
  r.host.launchToken = tok;
  r.host.devtoolsListening.url = newUrl;
  r.host.devtoolsListening.browserId = bid;
  r.host.stderrHead = r.host.stderrHead.replaceAll(oldUrl, newUrl);
  // mutations: [{i: 1-based seq, at?: number|null, ts?: number|null}]
  if (mutate) {
    for (const m of mutate) {
      const e = r.events.find((x) => x.seq === m.i);
      if (!e) throw new Error('no event seq ' + m.i);
      if (m.at !== undefined && m.at !== null) e.at = m.at;
      if (m.ts !== undefined && m.ts !== null) e.ts = m.ts;
    }
  }
  // keep the source leg marks; assert every event still sits inside its window
  const LEG = r.plan.map((l) => l.name);
  const idxOf = (n) => LEG.indexOf(n) + 1;
  for (const e of r.events) {
    const i = idxOf(e.leg);
    const lo = r.legMarks[i].at; const hi = i + 1 < r.legMarks.length ? r.legMarks[i + 1].at : r.closedAt;
    if (!(e.at >= lo && e.at <= hi)) throw new Error('window violation seq ' + e.seq + ' at ' + e.at + ' window ' + lo + '..' + hi);
  }
  for (let i = 1; i < r.events.length; i++) if (r.events[i].at < r.events[i - 1].at) throw new Error('non-monotone at seq ' + r.events[i].seq);
  fs.writeFileSync(outPath, JSON.stringify(r, null, 1));
  return outPath;
}
