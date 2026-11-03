#!/usr/bin/env node
// R56Connector — emit overlap.tsv.
//
// Model copied from the FROZEN meter (c1-adjacency-host-v15.mjs):
//   phase 1: ONE `git rev-parse HEAD` per roster lane -> a single head snapshot
//   phase 2: every sibling byte is read with `git cat-file -p <snapshotHead>:PROVINCE.md`
//            (the working tree is never read)
// so every row of the TSV describes ONE instant of the fleet, exactly as the
// meter's own receipt does.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const FLEET = '/home/vgpnk/Projects/shokunin';
const SELF_LANE = 'tabi-shokunin';
const OUT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/connector/overlap.tsv';
const BG_WORDS = ['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har'];

const laneExists = (fleet, lane) => fs.existsSync(path.join(fleet, lane, '.git')) || fs.existsSync(path.join(fleet, lane, 'HEAD'));
const roster = fs.readdirSync(FLEET, { withFileTypes: true })
  .filter((d) => !d.name.startsWith('.'))
  .filter((d) => d.isDirectory() || (d.isSymbolicLink() && (() => { try { return fs.statSync(path.join(FLEET, d.name)).isDirectory(); } catch { return false; } })()))
  .filter((d) => laneExists(FLEET, d.name) && d.name !== SELF_LANE)
  .map((d) => d.name).sort();

// ---- phase 1: ONE head snapshot per lane ----
const heads = new Map();
for (const lane of roster) {
  const r = spawnSync('git', ['-C', path.join(FLEET, lane), 'rev-parse', 'HEAD'], { maxBuffer: 1 << 24 });
  heads.set(lane, r.status === 0 ? r.stdout.toString('utf8').trim() : null);
}
// ---- phase 2: bytes at the snapshot head ----
const sibRef = (lane, p) => {
  const head = heads.get(lane);
  if (!head) return null;
  const r = spawnSync('git', ['-C', path.join(FLEET, lane), 'cat-file', '-p', `${head}:${p}`], { maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout.toString('utf8') : undefined;
};

// ---- tabi surface anchors (verbatim clauses from tabi-shokunin/PROVINCE.md) ----
const S = {
  CDP: 'Owns: CDP session discipline (endpoints, targets, screenshot/DOM evidence capture) [PROVINCE.md:9-10]',
  PROFILE: 'Owns: browser inventory + profile surfaces (shape-only census) [PROVINCE.md:8]',
  PUBLISH: 'Refuses: web *publishing* (→ kake) [PROVINCE.md:16]',
};
const OVERRIDES = {
  'kagi-shokunin': {
    41: { surface: S.PROFILE, disp: 'contested-open', reason: 'janitor CLI verb cdp-bridge is the 1Password<->Chrome native-messaging bridge over the the-musketeer chrome-profile (corpus/knowledge/cdp-bridge-1password.md); that profile/CDP lease is tabi-owned surface and kagi states it never adjudicates it (PROVINCE.md:81)' },
    64: { surface: `${S.PROFILE} | ${S.CDP}`, disp: 'contested-open', reason: 'kagi PROVINCE.md:64 names CDP 9222 + the-musketeer chrome-profile and marks it contested with kake; corpus/adjacency.tsv row musketeer-cdp-9222-profile-lease is disposition contested-open with tabi_ref SKILL.md:556 (fresh throwaway profile per run)' },
    81: { surface: `${S.PROFILE} | ${S.CDP}`, disp: 'contested-open', reason: 'kagi PROVINCE.md:81 states the CDP lease/profile ownership question is reported to the integrator and never adjudicated in kagi -> the surface stays open, not declared away' },
  },
  'kaidoku-shokunin': {
    53: { surface: S.CDP, disp: 'contested-open', reason: 'kaidoku PROVINCE.md:53 self-launched chromium --headless --remote-debugging-port=9222 CDP runtime observation; the r55 delta ledger adjudicates this EXACT line (same provinceSha256 50b6c259beb6, same head c7fe6898e9a8) as contested-open, so that adjudication is carried forward unchanged. CONTRADICTION (unresolved): corpus/adjacency.tsv row cdp-runtime-observation carries disposition ruled with the ruling "kaidoku keeps CDP only as an REA provider surface for shipped-artifact analysis" -- the two frozen ledgers disagree on the same surface' },
    137: { surface: S.CDP, disp: 'contested-open', reason: 'kaidoku PROVINCE.md:137 self-launched CDP/V8-inspector targets + Playwright capture-electron-scenario; the r55 delta ledger binds this same line (same provinceSha256 50b6c259beb6) as contested-open and no ruling closes it' },
  },
  'revenger-shokunin': {
    30: { surface: S.CDP, disp: 'contested-open', reason: 'revenger PROVINCE.md:30 declares a CDP browser surface (Chrome/Edge loopback CDP) on this host; corpus/adjacency.tsv row rea-browser-runtime-evidence (revenger PROVINCE.md:5) is contested-open and the fleet L0 question stays open' },
    33: { surface: S.CDP, disp: 'contested-open', reason: 'revenger PROVINCE.md:33 loopback CDP endpoint for the rea-cdp-browser provider -- the same contested browser-runtime surface as PROVINCE.md:5/30; the r55 delta ledger binds this line (same provinceSha256 c49f6d1d1144) as contested-open' },
  },
  'kake-shokunin': {
    40: { surface: S.PUBLISH, disp: 'overlap-declared', reason: 'kake PROVINCE.md:40 declares the split: tabi drives browsers and owns client-side crawler discipline, kake owns the publisher side; corpus/adjacency.tsv row crawler-discipline-vs-publishing is split-declared with tabi_ref PROVINCE.md:16' },
    310: { surface: S.PUBLISH, disp: 'overlap-declared', reason: 'kake PROVINCE.md:310 repeats the declared boundary: publisher-side robots/sitemap placement is kake, browser-driving and client-side crawler discipline belong to tabi; corpus/adjacency.tsv row robots-txt-publisher-audit-vs-client-obedience is split-declared' },
    329: { surface: S.PUBLISH, disp: 'overlap-declared', reason: 'kake PROVINCE.md:329 states client-side crawler discipline stays with tabi and kake keeps the publisher side -- the same declared split as PROVINCE.md:40/310' },
    344: { surface: S.PUBLISH, disp: 'overlap-declared', reason: 'kake PROVINCE.md:344 states the boundary is unchanged: publisher-side placement is kake, client-side crawling stays with tabi -- the same declared split as PROVINCE.md:40/310' },
  },
};

// Per-lane DEFAULT reason for hits with no explicit override. Each lane's
// default is derived from the lane's own declared domain (its PROVINCE.md
// header) — never from the BG keyword alone.
const DEFAULT_REASON = {
  'audio-shokunin': 'audio production lane: "headless" is an audio-analysis/fixture qualifier (stems, loudness, spectral measurement), not a browser-ground surface',
  'game-dev-2d-shokunin': '2D game lane: "headless" is the Godot 4.7.2 headless runtime qualifier, not a browser-ground surface',
  'game-dev-3d-shokunin': '3D game lane: "headless" is the Godot/Blender headless-runtime qualifier, not a browser-ground surface',
  'kotoba-shokunin': 'prompt-craft lane: the "headless" wording is a citation of the audio/game-dev lanes fixtures inside an adjacency table, not a browser-ground surface of kotoba',
  'mado-shokunin': 'desktop-environment lane: "screenshot" is a desktop/file screenshot of the compositor, not a browser screenshot/DOM capture',
  'tsukuroi-shokunin': 'host-operations lane: "screenshot" appears in an ADJ-03 row that routes the desktop screenshot surface to mado, not to tabi',
  'kake-shokunin': 'publisher-side lane: "crawl" here is publisher-side crawl budget/robots/crawler-identity knowledge (Google/Baidu/Yahoo), not tabi client-side crawler discipline -- see the declared-split rows PROVINCE.md:40/310/329/344 for the tabi boundary',
};

const rows = [];
const perLane = {};
for (const lane of roster) {
  const head = heads.get(lane);
  const text = sibRef(lane, 'PROVINCE.md');
  if (text === null || text === undefined) { perLane[lane] = { head, provStatus: text === undefined ? 'file-absent' : 'absent', hits: 0 }; continue; }
  const lines = text.replace(/\n$/, '').split('\n').map((l) => l.replace(/\r$/, ''));
  let n = 0;
  lines.forEach((l, i) => {
    const low = l.toLowerCase();
    const terms = BG_WORDS.filter((w) => low.includes(w));
    if (!terms.length) return;
    n++;
    const ov = (OVERRIDES[lane] || {})[i + 1];
    rows.push({
      lane, head, file: 'PROVINCE.md', line: i + 1,
      term: terms.join('+'),
      text: l,
      surface: ov ? ov.surface : '-',
      disp: ov ? ov.disp : 'no-tabi-ground',
      reason: ov ? ov.reason : (DEFAULT_REASON[lane] || 'BG keyword hit is inside a sibling domain tabi does not own; no tabi Owns/Refuses surface is touched'),
    });
  });
  perLane[lane] = { head, provStatus: 0, lines: lines.length, hits: n };
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const esc = (s) => s.replace(/\t/g, ' ').replace(/\r/g, '');
const tsv = [
  ['lane', 'head', 'file', 'line', 'term', 'wholeLineText', 'tabiOwnsSurface', 'proposedDisposition', 'reason'].join('\t'),
  ...rows.map((r) => [r.lane, r.head, r.file, String(r.line), r.term, esc(r.text), esc(r.surface), r.disp, esc(r.reason)].join('\t')),
].join('\n') + '\n';
fs.writeFileSync(OUT, tsv);

const byLane = {}, byDisp = {};
for (const r of rows) { byLane[r.lane] = (byLane[r.lane] || 0) + 1; byDisp[r.disp] = (byDisp[r.disp] || 0) + 1; }
const surfRows = rows.filter((r) => r.surface !== '-');
const routes = {};
for (const r of surfRows) {
  const route = r.lane === 'kagi-shokunin' ? 'kagi' : r.lane === 'kake-shokunin' ? 'kake' : 'revenger/kaidoku';
  routes[route] = (routes[route] || 0) + 1;
}
const summary = {
  snapshotAt: new Date().toISOString(),
  out: OUT, rows: rows.length, rosterSize: roster.length,
  headSnapshot: Object.fromEntries(heads),
  perLaneHits: byLane, byDisposition: byDisp,
  hitsTouchingTabiSurface: surfRows.length,
  hitsTouchingTabiOwnsBlock: surfRows.filter((r) => r.surface.includes('Owns:')).length,
  hitsTouchingTabiRefusesBlock: surfRows.filter((r) => r.surface.includes('Refuses:')).length,
  refusalRoutesOnSurfaceHits: routes,
  perLane,
};
fs.writeFileSync('/fast/scratch/hyaku/tabi-r56/R56Connector/summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
