// Loopback-only probe: does the driver's launch-time owned tree cover the
// Firefox process set that exists later in the session, and does ss -Htnp
// report pids in that set? No external network.
import { firefox } from '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const sh = (c) => spawnSync('/bin/bash', ['-c', c], { encoding: 'utf8' }).stdout;
function table() {
  const out = sh('ps -eo pid=,ppid=,args= --no-headers');
  return out.split('\n').map((l) => l.trim().split(/\s+/)).filter((m) => m.length >= 3 && /^\d+$/.test(m[0])).map((m) => [Number(m[0]), Number(m[1]), m.slice(2).join(' ')]);
}
function roots(nodePid) { return table().filter(([, ppid, args]) => ppid === nodePid && /ms-playwright\/firefox-\d+\//.test(args)).map(([pid, , args]) => ({ pid, argv0: args.split(' ')[0] })); }
function tree(rs) {
  const rows = table(); const ch = new Map();
  for (const [pid, ppid] of rows) { if (!ch.has(ppid)) ch.set(ppid, []); ch.get(ppid).push(pid); }
  const out = [], seen = new Set(), q = [...rs];
  while (q.length) { const p = q.shift(); if (seen.has(p)) continue; seen.add(p); out.push(p); for (const c of ch.get(p) || []) q.push(c); }
  return out.sort((a, b) => a - b);
}
const startTime = (pid) => { try { const f = readFileSync(`/proc/${pid}/stat`, 'utf8'); const r = f.slice(f.lastIndexOf(')') + 2).split(' '); return Number(r[19]); } catch { return null; } };
const stat = (pids) => pids.map((p) => ({ pid: p, start: startTime(p), alive: (() => { try { readdirSync(`/proc/${p}/fd`); return true; } catch { return false; } })() }));

const page = `<!doctype html><html><body><h1 id=h>probe</h1><script>document.getElementById('h').textContent='ready'</script></body></html>`;
const server = createServer((req, res) => { res.setHeader('content-type', 'text/html'); res.end(page); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const out = { port, snapshots: [], ss: [] };
const browser = await firefox.launch({ headless: true, firefoxUserPrefs: { 'network.dns.disablePrefetch': true } });
await new Promise((r) => setTimeout(r, 400));
const rA = roots(process.pid); const tA = tree(rA.map((r) => r.pid));
out.snapshots.push({ at: 'launch+400ms', roots: rA.map((r) => r.pid), tree: tA, stat: stat(tA) });
const pg = await browser.newPage({ viewport: { width: 800, height: 600 } });
await pg.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
await pg.screenshot({ type: 'png' });
const rB = roots(process.pid); const tB = tree(rB.map((r) => r.pid));
out.snapshots.push({ at: 'after-first-navigation', roots: rB.map((r) => r.pid), tree: tB, addedVsLaunch: tB.filter((p) => !tA.includes(p)), missingVsLaunch: tA.filter((p) => !tB.includes(p)), stat: stat(tB) });
// ss visibility for the stale (launch) tree vs the fresh tree, verbatim rows
const ssOut = spawnSync('ss', ['-Htnp'], { encoding: 'utf8', maxBuffer: 8 << 20 });
out.ssExit = ssOut.status;
const rows = String(ssOut.stdout || '').split('\n').filter((l) => l.trim());
const pidOf = (l) => { const m = /pid=(\d+)/.exec(l); return m ? Number(m[1]) : null; };
out.ssRowsMatchingLaunchTree = rows.filter((l) => tA.includes(pidOf(l))).map((l) => l.trim());
out.ssRowsMatchingFreshTree = rows.filter((l) => tB.includes(pidOf(l))).map((l) => l.trim());
out.ssRowsMatchingFreshTreeNotLaunch = rows.filter((l) => tB.includes(pidOf(l)) && !tA.includes(pidOf(l))).map((l) => l.trim());
out.ssListenRowsInFreshTree = rows.filter((l) => tB.includes(pidOf(l)) && /\bLISTEN\b/.test(l)).map((l) => l.trim());
// proc surface: socket inodes per fresh-tree pid
const inodesOf = (p) => { try { return readdirSync(`/proc/${p}/fd`).map((fd) => { try { return readFileSync(`/proc/${p}/fd/${fd}`, 'utf8'); } catch { return ''; } }).filter((l) => /^socket:\[\d+\]$/.test(l)).length; } catch { return null; } };
out.inodeCounts = tB.map((p) => ({ pid: p, sockets: inodesOf(p) }));
// /proc/net rows for the fixture port, showing loopback form
const tcp = readFileSync('/proc/net/tcp', 'utf8').split('\n').slice(1).filter((l) => l.trim());
out.procNetRowsForPort = tcp.filter((l) => l.split(/\s+/)[1].toUpperCase().endsWith(':' + port.toString(16).toUpperCase().padStart(4, '0'))).map((l) => l.trim().split(/\s+/).slice(0, 4));
await pg.close();
await browser.close();
await new Promise((r) => setTimeout(r, 600));
out.afterClose = { launchTreeSurvivors: stat(tA).filter((s) => s.alive), freshTreeSurvivors: stat(tB).filter((s) => s.alive), rootsNow: roots(process.pid).map((r) => r.pid) };
server.close();
console.log(JSON.stringify(out, null, 1));
