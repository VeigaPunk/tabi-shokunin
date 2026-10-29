// ScribeLessonSkel — locate the nearest preceding section heading for each staged quote,
// and check the used-by target's committed state.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const D = `${ROOT}/.ufo/waves/round-43/w1/ScribeLessonSkel`;
const out = []; const say = (s = '') => out.push(s);

const cases = [
  { id: 'S150', file: `${ROOT}/.ufo/waves/round-43/sources/crypto.html`, quote: 'createPrivateKey, createPublicKey, generateKeyPair, sign, verify,' },
  { id: 'S151', file: `${ROOT}/.ufo/waves/round-43/sources/git-cat-file.html`, quote: 'Instead of the content, show the object type identified by' },
];
say('# ScribeLessonSkel — locator context for the two new registry quotes');
for (const c of cases) {
  const text = fs.readFileSync(c.file, 'utf8');
  const idx = text.indexOf(c.quote);
  const head = text.slice(0, idx);
  const hs = [...head.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/g)];
  const last3 = hs.slice(-3).map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  say(`## ${c.id} — ${c.file}`);
  say(`quote byte offset: ${idx}`);
  say(`nearest preceding headings (last 3): ${JSON.stringify(last3)}`);
  say(`line number of the quote: ${text.slice(0, idx).split('\n').length}`);
  say();
}

say('## used-by target of S150/S151 at HEAD');
let trackedStatus = 0;
try {
  execFileSync('git', ['-C', ROOT, 'ls-files', '--error-unmatch', 'corpus/knowledge/receipt-authenticity-signing-round-43.md'], { stdio: ['ignore', 'pipe', 'pipe'] });
  trackedStatus = 0;
} catch (e) { trackedStatus = e.status; }
say(`git ls-files --error-unmatch corpus/knowledge/receipt-authenticity-signing-round-43.md -> exit ${trackedStatus} (nonzero => NOT tracked)`);
const status = execFileSync('git', ['-C', ROOT, 'status', '--porcelain', '--', 'corpus/knowledge/receipt-authenticity-signing-round-43.md']).toString();
say(`git status --porcelain: ${JSON.stringify(status)}`);
const st = fs.statSync(`${ROOT}/corpus/knowledge/receipt-authenticity-signing-round-43.md`);
say(`file exists on disk: ${st.size} bytes`);
const head = execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD']).toString().trim();
say(`HEAD: ${head}`);
say();
say('## HEAD commits after the freeze (what landed between freeze and now)');
say(execFileSync('git', ['-C', ROOT, 'log', '--oneline', '7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc..HEAD']).toString());

fs.writeFileSync(`${D}/evidence-locator-context.txt`, out.join('\n') + '\n');
console.log(out.join('\n'));
