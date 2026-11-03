#!/usr/bin/env node
// R58Sentinel probe: apply the R57-S3 final-host rule to the scout's reopen
// receipts. READ-ONLY over the wave dir; writes one JSON verdict to stdout.
//
// Rule (R57-S3, binding): every network fetch records num_redirects,
// url_effective, content type and size; the FINAL host after redirects must
// equal the cited source's host, or the fetch is refused.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const WAVE = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-58';
const EXPECTED = {
  S153: { host: 'raw.githubusercontent.com', url: 'https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json' },
  S161: { host: 'www.w3.org', url: 'https://www.w3.org/TR/uievents/' },
};

const files = process.argv.slice(2);
const out = { schema: 'r58sentinel-scout-fetch-audit-v1', wave: WAVE, receipts: [], findings: [] };
const add = (id, detail) => out.findings.push({ id, detail: String(detail) });

for (const f of files) {
  const p = path.isAbsolute(f) ? f : path.resolve('/home/vgpnk/Projects/shokunin/tabi-shokunin', f);
  const rec = { path: p, exists: fs.existsSync(p) };
  if (!rec.exists) { out.receipts.push(rec); add('receipt-missing', p); continue; }
  let raw = null;
  try { raw = JSON.parse(fs.readFileSync(p, 'utf8')); rec.parses = true; }
  catch (e) { rec.parses = false; add('receipt-unparseable', p + ': ' + String((e && e.message) || e)); out.receipts.push(rec); continue; }
  rec.topLevelKeys = Object.keys(raw);
  // find every object in the tree that is a SELF-CONTAINED fetch record: it
  // carries a URL AND at least one of the R57-S3 guard fields.
  const fetches = [];
  (function walk(node, pathStr) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach((v, i) => walk(v, pathStr + '[' + i + ']')); return; }
    const keys = Object.keys(node);
    const hasUrl = keys.some((k) => /url/i.test(k));
    const hasGuard = keys.some((k) => /redirect|content_?type|size_download|effective/i.test(k));
    if (hasUrl && hasGuard) {
      fetches.push({ at: pathStr, keys, node });
    }
    for (const [k, v] of Object.entries(node)) walk(v, pathStr + '.' + k);
  })(raw, '$');
  rec.fetches = fetches.map((f) => ({ at: f.at, keys: f.keys }));
  for (const f of fetches) {
    const n = f.node;
    const flat = {};
    const collect = (o, prefix) => {
      for (const [k, v] of Object.entries(o || {})) {
        if (v === null || v === undefined) continue;
        if (typeof v === 'object' && !Array.isArray(v)) collect(v, prefix + k + '.');
        else flat[prefix + k] = v;
      }
    };
    collect(n, '');
    const urlEff = Object.entries(flat).find(([k]) => /url_?effective|effective_?url|final_?url/i.test(k));
    const redirects = Object.entries(flat).find(([k]) => /num_?redirects?|redirect_?count/i.test(k));
    const ctype = Object.entries(flat).find(([k]) => /content_?type/i.test(k));
    const size = Object.entries(flat).find(([k]) => /size_download|content_?length|bytes_download/i.test(k));
    const urlAny = Object.entries(flat).find(([k, v]) => /url$/i.test(k) && /^https?:/.test(String(v)));
    const cited = Object.entries(flat).find(([k]) => /cited_?host/i.test(k));
    const host = urlEff ? String(urlEff[1]) : (urlAny ? String(urlAny[1]) : null);
    let hostName = null;
    try { hostName = host ? new URL(host).host : null; } catch { hostName = null; }
    const row = {
      at: f.at,
      url_effective: urlEff ? urlEff[1] : null,
      num_redirects: redirects ? redirects[1] : null,
      content_type: ctype ? ctype[1] : null,
      size: size ? size[1] : null,
      cited_host: cited ? cited[1] : null,
      final_host: hostName,
    };
    rec.fetches.find((x) => x.at === f.at).detail = row;
    // R57-S3 enforcement
    const id = (f.at.match(/s1(5[36])/i) || [])[1] ? 'S1' + (f.at.match(/s1(5[36])/i) || [])[1] : null;
    if (urlEff && redirects && ctype && size) {
      const want = id ? EXPECTED[id] : null;
      if (want && hostName !== want.host) {
        add('fetch-final-host-mismatch', f.at + ': final host ' + hostName + ' != cited host ' + want.host);
      }
      if (cited && hostName && String(cited[1]) !== hostName) {
        add('fetch-cited-host-disagrees-with-final', f.at + ': cited ' + cited[1] + ' != final ' + hostName);
      }
    } else {
      add('fetch-guard-fields-missing', f.at + ': missing one of num_redirects/url_effective/content_type/size (have ' + Object.keys(row).filter((k) => row[k] !== null).join(',') + ')');
    }
  }
  // staged bytes: sha256 of the staged copy, if the receipt names one
  const staged = [];
  (function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'string' && /path|file|copy|staged/i.test(k) && v.includes('/')) {
        try {
          const b = fs.readFileSync(v);
          staged.push({ key: k, path: v, bytes: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex') });
        } catch { /* not a path */ }
      }
      walk(v);
    }
  })(raw);
  rec.staged = staged;
  out.receipts.push(rec);
}

out.findingCount = out.findings.length;
out.predicate = out.findingCount === 0;
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
