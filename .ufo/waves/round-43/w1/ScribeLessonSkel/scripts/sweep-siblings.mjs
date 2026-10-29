// ScribeLessonSkel — sweep sibling seat reports in the round-43 wave dir for verdicts and for any
// mention of the two new registry rows (S150 / S151), so the lesson's "reject row" table is
// evidence-backed rather than asserted. READ-ONLY over the wave dir.
import fs from 'node:fs';
import path from 'node:path';

const W1 = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1';
const OUT = `${W1}/ScribeLessonSkel/evidence-sibling-sweep.txt`;
const out = []; const say = (s = '') => out.push(s);

say('# ScribeLessonSkel — sibling-report sweep (S150 / S151 agreement + every verdict seen)');
say(`sweep taken at: ${new Date().toISOString()}`);
say(`wave dir: ${W1}`);
say();

const files = [];
const walk = (dir, depth = 0) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (depth < 2 && e.name !== 'ScribeLessonSkel') walk(p, depth + 1); }
    else if (e.name.endsWith('.md')) files.push(p);
  }
};
walk(W1);
files.sort();

const rows = [];
for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  const rel = f.replace(`${W1}/`, '');
  const verdict = txt.split('\n').filter((l) => /^VERDICT\b/.test(l.trim())).map((l) => l.trim()).join(' | ');
  const mentions = /S150|S151/.test(txt);
  const sLines = mentions
    ? txt.split('\n').map((l, n) => [n + 1, l]).filter(([, l]) => /S150|S151/.test(l)).slice(0, 3)
    : [];
  rows.push({ rel, bytes: txt.length, verdict, mentions, sLines });
}

say(`markdown reports found: ${rows.length}`);
say();
say('| report | bytes | mentions S150/S151 | verdict line |');
say('|---|---|---|---|');
for (const r of rows) {
  const v = r.verdict ? r.verdict.replace(/\|/g, '\\|').slice(0, 300) : '_(no VERDICT line)_';
  say(`| ${r.rel} | ${r.bytes} | ${r.mentions ? 'yes' : 'no'} | ${v} |`);
}
say();
say('## every S150/S151 mention, with the seat that made it');
for (const r of rows) {
  if (!r.mentions) continue;
  say(`- ${r.rel}`);
  for (const [n, l] of r.sLines) say(`    ${n}: ${l.trim().slice(0, 300)}`);
}
say();
say('## re-open seats dedicated to S150 / S151');
for (const r of rows) {
  if (/RevS15[01]/.test(r.rel)) {
    say(`- ${r.rel}: ${r.verdict || '(no VERDICT line)'}`);
  }
}
const agree = rows.filter((r) => /RevS15[01]/.test(r.rel) && /^VERDICT ok/i.test(r.verdict || ''));
const disagree = rows.filter((r) => /RevS15[01]/.test(r.rel) && !/^VERDICT ok/i.test(r.verdict || ''));
say();
say(`dedicated re-open seats agreeing with the admit: ${agree.length} (${agree.map((r) => r.rel).join(', ') || 'none'})`);
say(`dedicated re-open seats not agreeing / no verdict: ${disagree.length} (${disagree.map((r) => r.rel).join(', ') || 'none'})`);
say(`any OTHER seat report mentioning S150/S151: ${rows.filter((r) => r.mentions && !/RevS15[01]/.test(r.rel)).map((r) => r.rel).join(', ') || 'none'}`);

fs.writeFileSync(OUT, out.join('\n') + '\n');
console.log(out.join('\n'));
