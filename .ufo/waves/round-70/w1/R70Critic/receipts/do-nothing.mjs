// R70Critic do-nothing producer: writes a receipt copied from the committed evidence with the
// verifier-drawn nonce/ports/digest rewritten. Launches no browser, sends no CDP.
import fs from 'node:fs';
import crypto from 'node:crypto';
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const out = opt('out'), nonce = opt('nonce'), httpPort = opt('http-port'), cdpPort = opt('cdp-port');
if (!out || !nonce || !httpPort || !cdpPort) process.exit(2);
const src = JSON.parse(fs.readFileSync(process.env.FORGED_TEMPLATE, 'utf8'));
src.nonce = nonce; src.nonceOnPage = nonce;
for (const s of src.serverLog || []) { if (s) { s.run = nonce; if (s.path === '/') s.query = 'run=' + encodeURIComponent(nonce); } }
const oldPort = String((src.host.argv.find((a) => a.startsWith('--remote-debugging-port=')) || '').split('=')[1] || '');
src.host.argv = src.host.argv.map((a) => (a.startsWith('--remote-debugging-port=') ? '--remote-debugging-port=' + cdpPort : a));
const dl = src.host.devtoolsListening || {};
const browserId = dl.browserId || crypto.randomUUID();
const newUrl = 'ws://127.0.0.1:' + cdpPort + '/devtools/browser/' + browserId;
if (dl.url) src.host.stderrHead = String(src.host.stderrHead || '').replaceAll(dl.url, newUrl);
src.host.devtoolsListening = { url: newUrl, port: Number(cdpPort), browserId };
src.fixture.origin = 'http://127.0.0.1:' + httpPort;
src.host.launchToken = crypto.randomBytes(6).toString('hex');
src.startedAt = new Date(Date.now() - 13000).toISOString();
src.finishedAt = new Date().toISOString();
src.driverSha256 = '704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577';
fs.writeFileSync(out, JSON.stringify(src, null, 1));
process.exit(0);
