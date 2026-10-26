import { liveRecordFirefox, firstShot } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs';
const gate = await import('/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-bidi-runtime.mjs');
const o = { gate, firefox: '/home/vgpnk/.local/opt/firefox-158.0.1/firefox', geckodriver: '/home/vgpnk/.local/bin/geckodriver' };
const out = [];
for (let k = 0; k < 2; k++) {
  const rec = await liveRecordFirefox(o);
  const caps = rec.newSession.value.capabilities;
  const ctx = { browserVersion: caps.browserVersion };
  const res = {};
  for (const id of Object.keys(gate.ROWS)) res[id] = gate.PREDICATES[id](rec, ctx);
  const errs = rec.cmds.filter(c => !c.response || c.response.type !== 'success').map(c => `${c.method}: ${JSON.stringify(c.response).slice(0,160)}`);
  out.push({ sid: rec.newSession.value.sessionId, bv: caps.browserVersion, gdv: caps['moz:geckodriverVersion'], ws: caps.webSocketUrl, shot: firstShot(rec), res, errs });
}
console.log(JSON.stringify(out, null, 1));
