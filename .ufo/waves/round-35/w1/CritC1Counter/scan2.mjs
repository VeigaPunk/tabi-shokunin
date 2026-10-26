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
  chrome: /\bchrome\b/i, firefox: /\bfirefox\b/i, browser: /\bbrowser\b/i, devtools: /\bdevtools?\b/i,
  headless: /\bheadless\b/i, electron: /\belectron\b/i, gecko: /\bgecko\b/i, marionette: /\bmarionette\b/i,
  bidi: /\bbidi\b/i, w3c: /\bw3c\b/i, webview: /\bwebview\b/i, useragent: /\buser[- ]?agent\b/i,
};
const lines = (buf) => buf.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));
const seen = new Set();
const omitted = [];
for (const [lane, pin] of Object.entries(PINS)) {
  const repo = join(FLEET, `${lane}-shokunin`);
  const files = run('git', ['-C', repo, 'ls-tree', '-r', '--name-only', pin]).split('\n').filter((p) => p === 'SKILL.md' || (p.startsWith('corpus/knowledge/') && p.endsWith('.md'))).sort();
  for (const path of files) {
    const buf = run('git', ['-C', repo, 'cat-file', 'blob', `${pin}:${path}`]);
    lines(buf).forEach((text, i) => {
      if (!text.trim() || TABI.test(text)) return;
      const k = `${lane}\u0000${path}\u0000${text.trim()}`;
      if (seen.has(k)) return; seen.add(k);
      if (BG.test(text)) return;
      const hit = Object.entries(BROAD).filter(([, r]) => r.test(text)).map(([n]) => n);
      if (!hit.length) return;
      omitted.push({ lane, path, line: i + 1, hit, text });
    });
  }
}
writeFileSync(join(process.env.S, 'bg-blindspots-full.json'), JSON.stringify(omitted));
console.log('stored', omitted.length);
