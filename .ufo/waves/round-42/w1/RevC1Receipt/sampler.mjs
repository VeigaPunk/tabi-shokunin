// Samples the wrapper's descendant tree for firefox-binary processes for the whole run.
import fs from 'node:fs';
const root = Number(process.argv[2]);
const FF = '/home/vgpnk/.cache/ms-playwright/firefox-';
const ident = (pid) => {
  try {
    const s = fs.readFileSync('/proc/' + pid + '/stat', 'utf8');
    const e = s.lastIndexOf(')');
    const f = s.slice(e + 2).split(' ');
    let exe = null; try { exe = fs.readlinkSync('/proc/' + pid + '/exe'); } catch { }
    return { pid, ppid: Number(f[1]), startTicks: Number(f[19]), comm: s.slice(s.indexOf('(') + 1, e), exe };
  } catch { return null; }
};
const live = () => { try { process.kill(root, 0); return true; } catch { return false; } };
const out = { root, samples: 0, maxTree: 0, firefoxSeen: [], ffCounts: [] };
const t0 = Date.now();
while (live() && Date.now() - t0 < 120000) {
  const pids = fs.readdirSync('/proc').filter((d) => /^\d+$/.test(d)).map(Number);
  const rows = pids.map(ident).filter(Boolean);
  const kids = new Map();
  for (const r of rows) { if (!kids.has(r.ppid)) kids.set(r.ppid, []); kids.get(r.ppid).push(r.pid); }
  const desc = new Set(); const q = [root];
  while (q.length) { const p = q.shift(); if (desc.has(p)) continue; desc.add(p); for (const c of kids.get(p) || []) q.push(c); }
  const ff = rows.filter((r) => desc.has(r.pid) && typeof r.exe === 'string' && r.exe.replace(/ \(deleted\)$/, '').startsWith(FF));
  out.samples += 1;
  out.maxTree = Math.max(out.maxTree, desc.size);
  out.ffCounts.push(ff.length);
  for (const f of ff) out.firefoxSeen.push({ pid: f.pid, exe: f.exe });
  await new Promise((r) => setTimeout(r, 100));
}
out.maxFirefoxInTree = Math.max(0, ...out.ffCounts);
out.durationMs = Date.now() - t0;
console.log(JSON.stringify(out));
