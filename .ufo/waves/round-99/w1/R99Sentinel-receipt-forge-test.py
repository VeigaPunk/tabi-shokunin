#!/usr/bin/env python3
"""R99Sentinel: can a same-UID watcher forge the --live RECEIPT?

The plan's declared limit 6 says: "a same-UID process can read the --live nonce and
receipt path from /proc ... The claim's counting command is --live, with the host's
same-UID process space trusted."

This test uses ONLY that declared exposure:
  * read the receipt path from the driver's /proc/<pid>/cmdline  (--out <path>)
  * read the nonce from the driver's /proc/<pid>/environ        (TABI_R99_NONCE)
  * keep rewriting that receipt file with a fabricated (but self-consistent) receipt
    while the driver runs and after it exits, so the counter's post-driver read
    observes the fabricated bytes.

If the counter then reports verdict clean / rc 0, the --live receipt is forgeable by
exactly the exposure the plan declares.  No lane file is modified.
"""
import hashlib, json, os, shutil, subprocess, sys, threading, time

ROOT = "/fast/scratch/hyaku/tabi-r99/R99Sentinel"
COUNTER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-client-oopif-uploadsets-round99.mjs"
DRIVER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/client-oopif-uploadsets-round99.mjs"
PIN = "98efdc1293cc729b04a3774dfc45caf75bf20acf0d657f962a93b3eaba6b89f8"
TEMPLATE = os.path.join(ROOT, "template-receipt.json")

LANEDIR = os.path.join(ROOT, "lane-race")
SCRATCH = os.path.join(ROOT, "s-race")
PORTS = (34674, 34675, 34676)

shutil.rmtree(LANEDIR, ignore_errors=True)
os.makedirs(os.path.join(LANEDIR, "scripts"))
shutil.copy2(COUNTER, os.path.join(LANEDIR, "scripts", "check-client-oopif-uploadsets-round99.mjs"))
shutil.copy2(DRIVER, os.path.join(LANEDIR, "scripts", "client-oopif-uploadsets-round99.mjs"))
shutil.rmtree(SCRATCH, ignore_errors=True)

# template: the first 8 legs (rep 1) of the clean 24-leg receipt
full = json.load(open("/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-99/w1/R99Sentinel-confined-live-receipt.json"))
full["legs"] = full["legs"][:8]
json.dump(full, open(TEMPLATE, "w"))
tpl = json.load(open(TEMPLATE))

state = {"receipt": None, "nonce": None, "forged": 0, "driver_pid": None}


def proc_read(pid, name, mode="r"):
    try:
        with open("/proc/%d/%s" % (pid, name), mode) as f:
            return f.read()
    except Exception:
        return None


def find_driver(counter_pid):
    for d in os.listdir("/proc"):
        if not d.isdigit():
            continue
        try:
            st = open("/proc/%s/stat" % d).read().split(") ")[-1].split()
            ppid = int(st[1])
        except Exception:
            continue
        if ppid == counter_pid:
            cmd = proc_read(int(d), "cmdline")
            if cmd and "client-oopif-uploadsets-round99.mjs" in cmd and "--out" in cmd:
                return int(d)
    return None


def forge():
    """Rewrite the receipt with a self-consistent fabricated one, repeatedly."""
    while True:
        rc = state.get("receipt")
        nonce = state.get("nonce")
        if rc and nonce:
            try:
                r = dict(tpl)
                r["nonce"] = nonce
                r["driverSha256"] = PIN
                r["reps"] = 1
                r["ports"] = {"http": PORTS[0], "child": PORTS[1], "cdp": PORTS[2]}
                r["missingPath"] = SCRATCH + "/driver/tabi-r99-missing.txt"
                r["missingExists"] = False
                r["tmpdirAtLoad"] = SCRATCH + "/driver/t"
                r["failures"] = []
                legs = []
                for l in tpl["legs"]:
                    l = dict(l)
                    l["parentUrl"] = "http://127.0.0.1:%d/parent.html?leg=%s" % (PORTS[0], l["leg"])
                    l["childUrl"] = "http://localhost:%d/child.html?leg=%s" % (PORTS[1], l["leg"])
                    l["frames"] = [l["parentUrl"], l["childUrl"]]
                    l["iframeTargets"] = [{"targetId": l["iframeTargets"][0]["targetId"], "url": l["childUrl"]}]
                    l["error"] = None
                    if l.get("errMessage") and l["errMessage"].startswith("ENOENT"):
                        l["errMessage"] = "ENOENT: no such file or directory, stat '" + r["missingPath"] + "'"
                    legs.append(l)
                r["legs"] = legs
                tmp = rc + ".forge"
                with open(tmp, "w") as f:
                    json.dump(r, f)
                os.replace(tmp, rc)
                state["forged"] += 1
            except Exception:
                pass
        time.sleep(0.05)


cmd = ["node", os.path.join(LANEDIR, "scripts", "check-client-oopif-uploadsets-round99.mjs"),
       "--lane", LANEDIR, "--expect-driver-sha256", PIN, "--live",
       "--deps", os.path.join(ROOT, "deps"), "--scratch", SCRATCH,
       "--ports", ",".join(map(str, PORTS)), "--reps", "1", "--json"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

t = threading.Thread(target=forge, daemon=True)
t.start()

deadline = time.time() + 240
while time.time() < deadline and p.poll() is None:
    dp = find_driver(p.pid)
    if dp:
        state["driver_pid"] = dp
        cmdline = proc_read(dp, "cmdline") or ""
        parts = cmdline.split("\0")
        if "--out" in parts:
            state["receipt"] = parts[parts.index("--out") + 1]
        env = proc_read(dp, "environ") or ""
        for e in env.split("\0"):
            if e.startswith("TABI_R99_NONCE="):
                state["nonce"] = e.split("=", 1)[1]
        if state["receipt"] and state["nonce"]:
            break
    time.sleep(0.02)

out, err = p.communicate(timeout=300)
print("=== driver pid:", state["driver_pid"], "receipt:", state["receipt"], "nonce:", state["nonce"])
print("=== forged writes:", state["forged"])
print("=== rc:", p.returncode)
try:
    d = json.loads(out)
    print("verdict:", d.get("verdict"), "| checkCount:", d.get("checkCount"))
    for f in d.get("findings", []):
        print("   finding:", f["id"], f["leg"], str(f["detail"])[:140])
except Exception:
    print("raw stdout:", out[:1500], "stderr:", err[:400])
