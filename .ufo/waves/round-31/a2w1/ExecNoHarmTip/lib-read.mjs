import fs from 'node:fs';
export const DROP = new Set(['rev','schema','claim','file','baseline','stable','profile','lane','public','catalogue_sha256','metric','revision','frontier','since','results','reports','runs','inventory']);
export const BOOLK = new Set(['clean','valid','ok','inventoryOk','present','sha_match','anchor_located']);
const sha = v => (/^[0-9a-f]{40}$/.test(String(v)) ? '<SHA>' : String(v));

export function summarise(text) {
  const t = String(text).trim();
  const brace = t.indexOf('{');
  if (brace >= 0) {
    try {
      const j = JSON.parse(t.slice(brace));
      const out = new Map();
      for (const [k, v] of Object.entries(j)) {
        if (k === 'cases' && Array.isArray(v)) { out.set('cases', v.length); if (v.length && typeof v[0]?.ok === 'boolean') out.set('caseOk', `${v.filter(c => c.ok).length}/${v.length}`); continue; }
        if (DROP.has(k)) continue;
        if (Array.isArray(v)) { out.set(k, `n${v.length}`); continue; }
        if (v && typeof v === 'object') continue;
        out.set(k, sha(v));
      }
      if (out.size) return out;
    } catch {}
  }
  const out = new Map();
  for (const key of ['tiers', 'status']) {
    const lm = new RegExp(`${key}=([A-Za-z0-9:._,/-]+)`).exec(t);
    if (!lm) continue;
    for (const p of lm[1].split(',')) { const [a, b] = p.split(':'); if (a && b !== undefined) out.set(`${key}.${a}`, b); }
  }
  const re = /([a-zA-Z_][a-zA-Z0-9_.]*)\s*=\s*([^\s,()]+)/g;
  let m;
  while ((m = re.exec(t))) {
    const k = m[1]; let v = m[2].replace(/[.;:]$/, '');
    if (DROP.has(k)) continue;
    if (k === 'tiers' || k === 'status') continue;
    if (v === '[object') continue;
    out.set(k, sha(v));
  }
  return out;
}
export const canonical = m => [...m.entries()].sort((a,b)=>a[0]<b[0]?-1:1).map(([k,v])=>`${k}=${v}`).join(' ');
export function delta(a, b) {
  const A = summarise(a), Bt = summarise(b);
  const both = [], tipOnly = [];
  for (const k of [...new Set([...A.keys(), ...Bt.keys()])].sort()) {
    if (A.get(k) === Bt.get(k)) continue;
    if (A.has(k) && Bt.has(k)) both.push(`${k} ${A.get(k)}->${Bt.get(k)}`);
    else if (Bt.has(k)) tipOnly.push(k);
    else both.push(`${k} ${A.get(k)}->absent`);
  }
  return { both, tipOnly };
}

// Self-test signature: only the count and the all-cases-green boolean.
export function selftestSig(text) {
  const t = String(text).trim();
  let body = t;
  const brace = t.indexOf('{');
  let parsed = null;
  if (brace >= 0) { try { parsed = JSON.parse(t.slice(brace)); } catch {} }
  if (parsed) {
    let cases = null, ok = null;
    if (Array.isArray(parsed.cases)) {
      cases = parsed.cases.length;
      if (cases && typeof parsed.cases[0]?.ok === 'boolean') ok = parsed.cases.every(c => c.ok);
    } else if (typeof parsed.cases === 'number') cases = parsed.cases;
    if (typeof parsed.passed === 'number') { if (cases === null) cases = parsed.passed; ok = (ok === false ? false : parsed.passed === cases); }
    if (typeof parsed.ok === 'boolean') ok = parsed.ok && ok !== false;
    if (typeof parsed.clean === 'boolean') ok = parsed.clean && ok !== false;
    if (typeof parsed.verdict === 'string') ok = ['clean', 'pass', 'valid'].includes(parsed.verdict) && ok !== false;
    return { cases, ok, style: 'json' };
  }
  const lines = t.split('\n').filter(l => /SELFTEST|cases=\d+/.test(l));
  const line = lines.length ? lines[lines.length - 1] : t.split('\n').pop();
  const cm = /cases=(\d+)/.exec(line);
  const pm = /passed=(\d+)/.exec(line);
  let ok = null;
  if (/verdict=(clean|pass|valid)/.test(line) || /(^|\s)(clean|valid|ok)=true/.test(line)) ok = true;
  if (/verdict=(failed|invalid)/.test(line)) ok = false;
  if (pm && cm) ok = (ok === false ? false : Number(pm[1]) === Number(cm[1]));
  return { cases: cm ? Number(cm[1]) : null, ok, style: 'line' };
}
