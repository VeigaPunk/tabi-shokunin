#!/usr/bin/env python3
"""R100Sentinel, part (c): the same-UID fork on the --live receipt.

Limit 6 (declared) says: "a same-UID process can read the --live nonce and receipt path
from /proc (r95 A1 item 6). The claim's counting command is --live, with the host's
same-UID process space trusted."

This test uses ONLY that declared exposure:
  * read the counter's own --scratch/--ports from /proc/<counter pid>/cmdline
  * read the driver's --out <receipt path> from /proc/<driver pid>/cmdline
  * read TABI_R100_NONCE from /proc/<driver pid>/environ
and then keeps rewriting that receipt file with a self-consistent FABRICATED receipt
(derived from the committed clean receipt, re-bound to this run's nonce/ports/paths)
while the driver runs and after it exits, so the counter's post-driver read observes
the fabricated bytes.

The driver under test is MUTANT V: its MIXED-1 leg RESOLVES (the predicate requires that
call to be refused with "File paths cannot be mixed with buffers"), it is NOT labelled
launch-failed, and the driver exits 0. Without the fork the counter must report the
MIXED-1 law violation; with the fork the counter must report clean.

Usage: forge-receipt.py <mode: forge|plain> <counterPath> <lane> <pin> <out.json>
"""
import hashlib, json, os, shutil, subprocess, sys, threading, time

R = "/fast/scratch/hyaku/tabi-r100/R100Sentinel"
TEMPLATE = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-100/controls/receipt-positive.json"

mode = sys.argv[1]
COUNTER = sys.argv[2]
LANE = sys.argv[3]
PIN = sys.argv[4]
OUT = sys.argv[5]

SCRATCH = os.path.join(R, "h")
PORTS = (34171, 34172, 34173)
ARGV_MODE = mode == "argv"

shutil.rmtree(SCRATCH, ignore_errors=True)
os.makedirs(SCRATCH)

tpl = json.load(open(TEMPLATE))
state = {"receipt": None, "nonce": None, "forged": 0, "driver_pid": None, "scratch": SCRATCH, "counter_pid": os.getpid()}


def proc_read(pid, name, mode="r"):
    try:
        with open("/proc/%d/%s" % (pid, name), mode) as f:
            return f.read()
    except Exception:
        return None


def children_of(pid):
    out = []
    for d in os.listdir("/proc"):
        if not d.isdigit():
            continue
        try:
            st = open("/proc/%s/stat" % d).read().split(") ")[-1].split()
            if int(st[1]) == pid:
                out.append(int(d))
        except Exception:
            pass
    return out


def find_driver(counter_pid):
    for d in children_of(counter_pid):
        cmd = proc_read(d, "cmdline")
        if cmd and "client-oopif-uploadsets-round100.mjs" in cmd and "--out" in cmd:
            return d
    return None


def learn_counter_argv():
    """Read the COUNTER's own argv from /proc (same-UID readable): --scratch and --ports."""
    try:
        raw = open("/proc/%d/cmdline" % p.pid, "rb").read().split(b"\x00")
        argv = [x.decode() for x in raw if x]
        for i, x in enumerate(argv):
            if x == "--scratch" and i + 1 < len(argv):
                state["scratch"] = argv[i + 1]
            if x == "--ports" and i + 1 < len(argv):
                state["ports"] = [int(v) for v in argv[i + 1].split(",")]
    except Exception:
        pass


def forge():
    rc, nonce = state.get("receipt"), state.get("nonce")
    if not (rc and nonce):
        return
    if ARGV_MODE:
        learn_counter_argv()
        sc = state.get("scratch", SCRATCH)
        ports = state.get("ports", list(PORTS))
        r_missing = sc + "/driver/tabi-r100-missing.txt"
        r_tmp = sc + "/driver/t"
        r_ports = {"http": ports[0], "child": ports[1], "cdp": ports[2]}
    else:
        sc = SCRATCH
        r_missing = SCRATCH + "/driver/tabi-r100-missing.txt"
        r_tmp = SCRATCH + "/driver/t"
        r_ports = {"http": PORTS[0], "child": PORTS[1], "cdp": PORTS[2]}
    try:
        r = json.loads(json.dumps(tpl))
        r["nonce"] = nonce
        r["driverSha256"] = PIN
        r["reps"] = 3
        r["ports"] = r_ports
        r["missingPath"] = r_missing
        r["missingExists"] = False
        r["tmpdirAtLoad"] = r_tmp
        for l in r["legs"]:
            l["parentUrl"] = "http://127.0.0.1:%d/parent.html?leg=%s" % (r_ports["http"], l["leg"])
            l["childUrl"] = "http://localhost:%d/child.html?leg=%s" % (r_ports["child"], l["leg"])
            l["frames"] = [l["parentUrl"], l["childUrl"]]
            l["iframeTargets"] = [{"targetId": l["iframeTargets"][0]["targetId"], "url": l["childUrl"]}]
            l["error"] = None
            if mode == "mark" and l["leg"] == "MIXED-1":
                l["outcome"] = "error"
                l["errName"] = "Error"
                l["errMessage"] = "FORGED-MARKER-R100"
        r["failures"] = []
        tmp = rc + ".forge"
        with open(tmp, "w") as f:
            json.dump(r, f)
        os.replace(tmp, rc)
        state["forged"] += 1
    except Exception:
        pass


cmd = ["node", COUNTER, "--lane", LANE, "--expect-driver-sha256", PIN, "--live",
       "--deps", os.path.join(R, "deps"), "--scratch", SCRATCH,
       "--ports", ",".join(map(str, PORTS)), "--reps", "3", "--json"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

stop = threading.Event()


def watch():
    while not stop.is_set():
        d = find_driver(p.pid)
        if d and d != state.get("driver_pid"):
            state["driver_pid"] = d
            cmdline = proc_read(d, "cmdline") or ""
            parts = [x for x in cmdline.split("\x00") if x]
            for i, x in enumerate(parts):
                if x == "--out" and i + 1 < len(parts):
                    state["receipt"] = parts[i + 1]
            env = proc_read(d, "environ") or ""
            for kv in env.split("\x00"):
                if kv.startswith("TABI_R100_NONCE="):
                    state["nonce"] = kv.split("=", 1)[1]
        if mode in ("forge", "mark", "argv"):
            forge()
        time.sleep(0.002)


t = threading.Thread(target=watch, daemon=True)
t.start()
so, se = p.communicate(timeout=900)
stop.set()
t.join(timeout=5)

open(OUT, "w").write(so)
open(OUT + ".err", "w").write(se)
try:
    d = json.loads(so)
except Exception:
    print("UNPARSEABLE OUTPUT:", so[:400], se[:400])
    sys.exit(3)
print("mode=%s rc=%d verdict=%s checkCount=%s" % (mode, p.returncode, d.get("verdict"), d.get("checkCount")))
print("driver_pid=%s receipt=%s nonce=%s forged_writes=%d" %
      (state.get("driver_pid"), state.get("receipt"), state.get("nonce"), state.get("forged")))
print("launchFailed=%s findings=%d" % (d.get("launchFailed"), len(d.get("findings") or [])))
for f in (d.get("findings") or [])[:8]:
    print("  finding", f.get("id"), f.get("leg"), str(f.get("detail"))[:140])
