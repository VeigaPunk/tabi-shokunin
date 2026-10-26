#!/usr/bin/env node
// Egress/listener sampler for the tabi r35 lane driver (pid-scoped).
// Samples ss every ~200 ms, keeps only sockets owned by the driver's process tree,
// records the pid set each sample, and captures the live Firefox profile's user.js/prefs.js
// so the DNS-off prefs can be seen in force. Every sample is kept, so absence is evidence too.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const driverPid = Number(process.argv[2]);
const outPath = process.argv[3];
const scratchTmp = process.argv[4];
const deadlineMs = Number(process.argv[5] || 300000);
const t0 = Date.now();
if (!Number.isInteger(driverPid) || driverPid <= 0) throw new Error(`bad driver pid ${process.argv[2]}`);

function pids() {
  const all = [];
  for (const name of readdirSync("/proc")) {
    if (!/^\d+$/.test(name)) continue;
    try {
      const stat = readFileSync(`/proc/${name}/stat`, "utf8");
      const ppid = Number(stat.slice(stat.lastIndexOf(")") + 2).split(" ")[1]);
      all.push([Number(name), ppid]);
    } catch {}
  }
  const tree = new Set([driverPid]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [pid, ppid] of all) {
      if (!tree.has(pid) && tree.has(ppid)) { tree.add(pid); grew = true; }
    }
  }
  return [...tree];
}

function cmd(args) {
  return spawnSync("ss", args, { encoding: "utf8" }).stdout;
}

const samples = [];
const firstSeen = new Map();
let profileShot = null;
function captureProfile() {
  if (profileShot) return;
  try {
    const roots = readdirSync(scratchTmp).filter((d) => d.startsWith("fx-"));
    for (const r of roots) {
      const prof = `${scratchTmp}/${r}/profiles`;
      let dirs = [];
      try { dirs = readdirSync(prof); } catch { continue; }
      for (const d of dirs) {
        const base = `${prof}/${d}`;
        let files = [];
        try { files = readdirSync(base); } catch { continue; }
        for (const f of ["user.js", "prefs.js"]) {
          if (!files.includes(f)) continue;
          const text = readFileSync(`${base}/${f}`, "utf8");
          const lines = text.split("\n").filter((l) => /network\.dns\.disabled|network\.trr\.mode|remote\.prefs\.recommended\.applied/.test(l));
          profileShot = { path: `${base}/${f}`, bytes: text.length, lines };
          return;
        }
      }
    }
  } catch {}
}
function sample() {
  const set = new Set(pids());
  const keep = (text) => text.split("\n").filter((l) => {
    const m = l.match(/pid=(\d+)/g);
    return m ? m.some((s) => set.has(Number(s.slice(4)))) : false;
  });
  const tcp = keep(cmd(["-tanpH"]));
  const udp = keep(cmd(["-uanpH"]));
  const listeners = keep(cmd(["-tlnpH"]));
  const n = samples.length;
  const t = Date.now() - t0;
  samples.push({ n, t, pids: [...set], tcp, udp, listeners });
  captureProfile();
  for (const line of [...tcp, ...udp, ...listeners]) {
    const key = line.replace(/\s+/g, " ");
    if (!firstSeen.has(key)) firstSeen.set(key, t);
  }
  writeFileSync(outPath, JSON.stringify({ driverPid, samples, firstSeen: [...firstSeen.entries()].map(([k, t]) => ({ t, k })), profileShot }, null, 1));
}
const iv = setInterval(sample, 200);
sample();
process.on("SIGTERM", () => { clearInterval(iv); sample(); process.exit(0); });
setTimeout(() => { clearInterval(iv); sample(); process.exit(0); }, deadlineMs);
