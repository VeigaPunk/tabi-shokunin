// verify the delivered screen.tsv against the counter's own candidate list and the
// sibling git bytes: reason vocabulary, quote substring, word/non-space bounds, surface rule.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const [screen, cands] = process.argv.slice(2);
const FLEET = '/home/vgpnk/Projects/shokunin';
const REASONS = ['not-browser-sense', 'same-surface', 'third-lane-report', 'no-claim-declared'];
const VERIFIED = new Map([
  ['musketeer-cdp-9222-profile-lease kagi', 'adjacency.tsv row 6'],
  ['cdp-live-target-census kama', 'adjacency.tsv row 11'],
]);
const words = (s) => s.trim().split(/\s+/).filter(Boolean);
const cand = new Map();
for (const l of readFileSync(cands, 'utf8').split('\n')) {
  if (!l) continue; const f = l.split('\t'); cand.set(f[0], { set: f[1], text: f[2] });
}
let bad = 0, ok = 0;
readFileSync(screen, 'utf8').split('\n').forEach((l, i) => {
  if (!l) return;
  const f = l.split('\t'); const row = i + 1;
  const problems = [];
  if (f.length !== 5) problems.push(`columns=${f.length}`);
  const [ref, reason, surface, quote, note] = f.map((x) => (x ?? '').trim());
  const c = cand.get(ref);
  if (!c) problems.push('not-a-candidate');
  else if (!c.text.includes(quote)) problems.push('quote-not-substring');
  if (!REASONS.includes(reason)) problems.push('reason-unknown');
  const w = words(quote).length, ns = quote.replace(/\s/g, '').length;
  if (w < 4 || w > 25) problems.push(`words=${w}`);
  if (ns < 20) problems.push(`nonspace=${ns}`);
  if (reason === 'same-surface') {
    const lane = ref.split('-shokunin@')[0];
    if (!VERIFIED.has(`${surface} ${lane}`)) problems.push(`surface-unmapped ${surface} ${lane}`);
  } else if (surface !== '-') problems.push('surface-not-dash');
  if (!note) problems.push('note-empty');
  // quote must exist on the cited line of the pinned sibling commit (git bytes, not the candidate copy)
  const m = /^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/.exec(ref);
  if (!m) problems.push('ref-shape');
  else {
    const r = spawnSync('git', ['-C', `${FLEET}/${m[1]}-shokunin`, 'show', `${m[2]}:${m[3]}`], { encoding: 'utf8' });
    const line = r.stdout.split('\n')[Number(m[4]) - 1] ?? '';
    if (!line.includes(quote)) problems.push('quote-absent-on-cited-line');
  }
  if (problems.length) { bad += 1; console.log(`FAIL row=${row} ${ref} :: ${problems.join(',')}`); }
  else { ok += 1; console.log(`OK   row=${row} ${ref} reason=${reason} surface=${surface} words=${w} nonspace=${ns} set=${c.set}`); }
});
console.log(`SCREEN_VERIFY rows_ok=${ok} rows_bad=${bad}`);
process.exit(bad ? 1 : 0);
