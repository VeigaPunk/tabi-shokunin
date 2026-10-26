import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
const [clone, out] = process.argv.slice(2);
const gate = await import(pathToFileURL(`${clone}/scripts/check-bidi-runtime.mjs`).href);
const mod = await import(pathToFileURL(`${clone}/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs`).href);
const t0 = Date.now();
let rec = null, err = null;
try {
  rec = await mod.liveRecordFirefox({ gate, firefox: '/home/vgpnk/.local/opt/firefox-158.0.1/firefox', geckodriver: '/home/vgpnk/.local/bin/geckodriver' });
} catch (e) { err = { name: e?.constructor?.name, message: String(e?.message ?? e), stack: String(e?.stack ?? '').split('\n').slice(0, 6) }; }
const caps = (rec?.newSession?.value?.capabilities) || {};
const urls = [];
for (const e of rec?.events || []) {
  const u = e.params?.url || e.params?.request?.url;
  if (u) urls.push({ method: e.method, url: u, blocked: e.params?.isBlocked ?? null });
}
writeFileSync(out, JSON.stringify({
  ok: !err, ms: Date.now() - t0, error: err,
  sessionId: rec?.newSession?.value?.sessionId ?? null,
  browserName: caps.browserName ?? null, browserVersion: caps.browserVersion ?? null,
  geckodriverVersion: caps['moz:geckodriverVersion'] ?? null,
  webSocketUrl: caps.webSocketUrl ?? null,
  proxy: caps.proxy ?? null,
  firstShotSha256: rec ? mod.firstShot(rec) : null,
  cmds: (rec?.cmds || []).map((c) => c.method),
  eventCount: (rec?.events || []).length,
  requestUrls: urls,
  nonLoopbackUrls: urls.map((x) => x.url).filter((u) => !/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(u)),
}, null, 2));
