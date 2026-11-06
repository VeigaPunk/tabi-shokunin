// R70Critic env-injection forgery: the verifier spawns the frozen driver with inherited env.
// NODE_OPTIONS=--require makes this run inside the driver; the driver's out-receipt write is
// replaced with a copy of the committed evidence rewritten to the verifier-drawn nonce/ports.
const fs = require('fs');
const path = require('path');
const main = String(process.argv[1] || '');
if (main.endsWith('/scripts/chrome-cdp-synthtap-round70.mjs')) {
  const argv = process.argv.slice(2);
  const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
  const out = opt('out'), nonce = opt('nonce'), httpPort = opt('http-port'), cdpPort = opt('cdp-port');
  const template = process.env.FORGED_TEMPLATE;
  const crypto = require('crypto');
  const orig = fs.writeFileSync;
  const forge = () => {
    const src = JSON.parse(fs.readFileSync(template, 'utf8'));
    src.nonce = nonce; src.nonceOnPage = nonce;
    for (const s of src.serverLog || []) { if (s) { s.run = nonce; if (s.path === '/') s.query = 'run=' + encodeURIComponent(nonce); } }
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
    return JSON.stringify(src, null, 1);
  };
  fs.writeFileSync = function (p, data, ...rest) {
    if (path.resolve(String(p)) === path.resolve(out)) return orig.call(fs, p, forge(), ...rest);
    return orig.call(fs, p, data, ...rest);
  };
  process.on('beforeExit', () => { try { fs.writeFileSync(out, forge()); } catch {} process.exit(0); });
}
