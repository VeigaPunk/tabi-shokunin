import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const FLEET = '/home/vgpnk/Projects/shokunin';
const CLONE = join(process.env.S, 'clone');
const run = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 << 20, env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' } }); if (r.status !== 0) throw new Error(cmd + ' ' + args.join(' ') + ': ' + r.stderr); return r.stdout; };
const PINS = JSON.parse(run('git', ['-C', CLONE, 'show', 'a4bfef0f75027c915e715649950b1d46dcb33d83:.ufo/waves/round-35/baseline/c1-pins.json']));
const BG = /(?:playwright|puppeteer|chromedriver|geckodriver|webdriver|selenium|chromium|headless[ -](?:chrome|chromium|browser|firefox)|devtools protocol|chrome devtools|chrome-devtools|cdp|remote-debugging|browser automation|webbridge|burner[- ]?chrome|musketeer)/i;
const TABI = /\btabi\b/i;
const BROAD = {
  chrome: /\bchrome\b/i,
  firefox: /\bfirefox\b/i,
  browser: /\bbrowser\b/i,
  devtools: /\bdevtools?\b/i,
  headless: /\bheadless\b/i,
  electron: /\belectron\b/i,
  gecko: /\bgecko\b/i,
  marionette: /\bmarionette\b/i,
  bidi: /\bbidi\b/i,
  w3c: /\bw3c\b/i,
  webview: /\bwebview\b/i,
  useragent: /\buser[- ]?agent\b/i,
};
const BROAD_UNION = new RegExp(Object.values(BROAD).map((r) => r.source).join('|'), 'i');
const lines = (buf) => buf.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));
const seen = new Set();
const stats = {};
const omittedByLane = {};
const omittedSamples = {};
for (const [lane, pin] of Object.entries(PINS)) {
  const repo = join(FLEET, `${lane}-shokunin`);
  const files = run('git', ['-C', repo, 'ls-tree', '-r', '--name-only', pin]).split('\n').filter((p) => p === 'SKILL.md' || (p.startsWith('corpus/knowledge/') && p.endsWith('.md'))).sort();
  for (const path of files) {
    const buf = run('git', ['-C', repo, 'cat-file', 'blob', `${pin}:${path}`]);
    lines(buf).forEach((text, i) => {
      if (!text.trim() || TABI.test(text)) return;
      const k = `${lane}\u0000${path}\u0000${text.trim()}`;
      if (seen.has(k)) return; seen.add(k);
      if (BG.test(text)) return; // already candidate
      let matched = false;
      for (const [name, re] of Object.entries(BROAD)) { if (re.test(text)) { stats[name] = (stats[name] || 0) + 1; matched = true; } }
      if (!matched) return;
      (omittedByLane[lane] = omittedByLane[lane] || []).push({ path, line: i + 1, text, hit: Object.entries(BROAD).filter(([, r]) => r.test(text)).map(([n]) => n) });
      (omittedSamples[lane] = omittedSamples[lane] || []).length < 4 && (omittedSamples[lane] = omittedSamples[lane] || []).concat([{ path, line: i + 1, text: text.slice(0, 150), hit: Object.entries(BROAD).filter(([, r]) => r.test(text)).map(([n]) => n) }]);
    });
  }
}
const total = Object.values(omittedByLane).reduce((a, v) => a + v.length, 0);
writeFileSync(join(process.env.S, 'bg-blindspots.json'), JSON.stringify({ total, byTerm: stats, byLane: Object.fromEntries(Object.entries(omittedByLane).map(([l, v]) => [l, v.length])), samples: omittedSamples }, null, 1));
console.log(JSON.stringify({ total, byTerm: stats, byLane: Object.fromEntries(Object.entries(omittedByLane).map(([l, v]) => [l, v.length])) }, null, 1));
