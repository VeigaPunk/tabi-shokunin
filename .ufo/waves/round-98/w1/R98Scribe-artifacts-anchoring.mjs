// Where does Playwright's connectOverCDP artifacts dir land: the TMPDIR in effect at
// playwright-core IMPORT time (module-level ARTIFACTS_FOLDER constant in chromium.ts) or the
// TMPDIR at call time?  A = import-time TMPDIR (exists), B = runtime TMPDIR (exists, set after
// the import).  Own scratch, own port 33711.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

const DEPS = '/fast/scratch/hyaku/tabi-r98/R98Scribe/deps';
const BASE = '/fast/scratch/hyaku/tabi-r98/R98Scribe/aa';
const A = BASE + '/A-import-time';
const B = BASE + '/B-runtime';
const CDP = 33711;
fs.rmSync(BASE, { recursive: true, force: true });
fs.mkdirSync(A, { recursive: true });
fs.mkdirSync(B, { recursive: true });

process.env.TMPDIR = A;                            // import-time TMPDIR
const req = createRequire(DEPS + '/package.json');
const { chromium } = req('playwright-core');        // <- import happens here
process.env.TMPDIR = B;                            // runtime TMPDIR, after the import

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proc = spawn('/usr/bin/chromium', ['--headless=new', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=' + CDP, '--user-data-dir=' + BASE + '/profile'], { stdio: 'ignore' });
for (let i = 0; i < 100; i++) { try { await fetch('http://127.0.0.1:' + CDP + '/json/version'); break; } catch { await sleep(100); } }

const browser = await chromium.connectOverCDP('http://127.0.0.1:' + CDP);
await sleep(500);
const arts = (p) => { try { return fs.readdirSync(p).filter((f) => f.startsWith('playwright-artifacts-')); } catch { return []; } };
console.log('artifacts under A (import-time TMPDIR):', arts(A).length, arts(A).join(','));
console.log('artifacts under B (runtime TMPDIR):', arts(B).length, arts(B).join(','));
console.log('os.tmpdir() at call time:', (await import('node:os')).default.tmpdir());
await browser.close().catch(() => {});
try { process.kill(-proc.pid, 'SIGKILL'); } catch { try { proc.kill('SIGKILL'); } catch {} }
process.exit(0);
