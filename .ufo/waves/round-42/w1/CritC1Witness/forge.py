#!/usr/bin/env python3
"""Witness-only forgery builder for tabi round-42 C1 counter v4.

Tier T1: verbatim committed r41 receipt + fresh nonce        (expects refusal)
Tier T2: r41 receipt+witness, nonce patched in both only    (minimal edit)
Tier T3: fully synthetic receipt+witness, zero real-run bytes
No browser is launched at any tier.
"""
import json, hashlib, os, sys

REPO = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
S = "/fast/scratch/hyaku/tabi-r42/CritC1Witness"
FF = "/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox"
NODE = "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node"
h = lambda s: hashlib.sha256(s.encode()).hexdigest()

R41_RECEIPT = os.path.join(REPO, "corpus/evidence/round41/playwright-egress/receipt.json")
R41_WITNESS = os.path.join(REPO, "corpus/evidence/round41/playwright-egress/receipt.witness.json")

def write(path, obj):
    with open(path, "w") as f:
        json.dump(obj, f)
    print("wrote", path, os.path.getsize(path), "bytes  sha256", h(open(path).read()))

# ---------------- Tier 2: nonce substitution on real committed bytes ----------
N2 = h("CritC1Witness-tier2-nonce")
rec = json.load(open(R41_RECEIPT))
rec["runNonce"] = N2
for r in rec["runs"]:
    r["runNonce"] = N2
wit = json.load(open(R41_WITNESS))
wit["nonce"] = N2
write(f"{S}/t2.receipt.json", rec)
write(f"{S}/t2.witness.json", wit)
with open(f"{S}/t2.nonce", "w") as f:
    f.write(N2)

# ---------------- Tier 3: fully synthetic, no real-run bytes ------------------
N3 = h("CritC1Witness-tier3-synthetic-nonce")
T0_MS = 1800000000000          # synthetic wall clock, nothing binds it
STEP_MS = 200                  # 8 samples -> 1400 ms span per run
TICKS0 = 5000000               # synthetic CLK_TCK tick base
PID_NODE = 9000001
PID_FF = 9000002

def run(idx):
    base = T0_MS + idx * 20000
    ticks = TICKS0 + idx * 2000
    samples, ss_sum, proc_sum = [], 0, 0
    for k in range(8):
        ss = {"ticks": 1, "lines": 0, "nonLoopback": 0, "ssObs": 1}
        pr = {"ticks": 1, "inodes": 0, "nonLoopback": 0, "procObs": 1}
        ss_sum += 1; proc_sum += 1
        samples.append({
            "t": base + k * STEP_MS,
            "tTicks": ticks + k * (STEP_MS // 10),
            "ss": ss, "proc": pr,
            "treePids": [
                {"pid": PID_FF, "startTicks": ticks + 10, "exe": FF,
                 "comm": "firefox", "args": FF + " -no-remote -headless"},
                {"pid": PID_FF + 1, "startTicks": ticks + 12, "exe": FF,
                 "comm": "firefox", "args": FF + " -contentproc"},
            ],
        })
    return {
        "name": f"run{idx+1}", "cmds": [], "events": [], "refused": False,
        "refuseReason": None, "runNonce": N3, "serverPort": 4173,
        "runStartTicks": ticks,
        "owned": {"nodePid": PID_NODE, "selfStartTicks": ticks - 20,
                  "roots": [{"pid": PID_FF, "startTicks": ticks + 10,
                             "exe": FF, "comm": "firefox"}],
                  "source": "synthetic"},
        "samples": samples, "browserVersion": "157.0",
        "userAgent": "Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0",
        "firstShotSha256": h("forged-shot"),
        "firstShotBytes": 1, "httpLog": [],
        "runEndTicks": ticks + 140,
        "coverageMs": 1400, "sampleCount": 8,
        "finalSweep": {"t": base + 1600, "tTicks": ticks + 160,
                       "ss": {"ticks": 1, "lines": 0, "nonLoopback": 0, "ssObs": 0},
                       "proc": {"ticks": 1, "inodes": 0, "nonLoopback": 0, "procObs": 0},
                       "treePids": []},
        "survivorPids": [], "survivors": 0, "portClosed": True,
        "sockets": {"ss": {"observations": ss_sum, "nonLoopback": 0},
                    "proc": {"observations": proc_sum, "nonLoopback": 0},
                    "finalSweep": {"ss": 0, "proc": 0}},
        "egressNonLoopback": 0,
    }

srec = {
    "schema": "tabi-pw-firefox-egress-receipt-r41",
    "driver": "scripts/playwright-firefox-egress-round41.mjs",
    "measuredAt": "2026-10-28T00:00:00.000Z",
    "playwrightVersion": "1.64.0",
    "fixture": {"sha256": h("forged-fixture"), "bytes": 1},
    "envCheck": {"procEnvironReadable": True, "nameCount": 1,
                 "forbiddenNames": [], "execArgv": [], "execArgvClean": True,
                 "envNonceEcho": "match"},
    "runNonce": N3,
    "runs": [run(0), run(1)],
    "refused": False, "binding": True, "egressNonLoopback": 0, "survivors": 0,
    "browserVersion": "157.0",
    "userAgent": "Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0",
}
write(f"{S}/t3.receipt.json", srec)

wsamples = []
for k in range(10):
    wsamples.append({
        "t": T0_MS + k * 250, "tTicks": TICKS0 + k * 25,
        "tree": [
            {"pid": 9000000, "ppid": 1, "startTicks": TICKS0 - 30,
             "exe": NODE, "comm": "MainThread"},
            {"pid": PID_NODE, "ppid": 9000000, "startTicks": TICKS0 - 20,
             "exe": NODE, "comm": "MainThread"},
            {"pid": PID_FF, "ppid": PID_NODE, "startTicks": TICKS0 + 10,
             "exe": FF, "comm": "firefox"},
        ],
    })
swit = {
    "schema": "tabi-r41-witness", "rootPid": 9000000, "nonce": N3,
    "startedTicks": TICKS0 - 30, "endedTicks": TICKS0 + 200,
    "samples": wsamples, "environ": ["PATH", "HOME", "LANG"],
}
write(f"{S}/t3.witness.json", swit)
with open(f"{S}/t3.nonce", "w") as f:
    f.write(N3)

# forged measure wrapper record: elapsed >= spanSum + 500, gate clean
span_sum = 2 * (7 * STEP_MS)
measure = {"schema": "tabi-r41-c1-measure", "out": f"{S}/t3.receipt.json",
           "witness": f"{S}/t3.witness.json", "elapsedMs": span_sum + 600,
           "driverExit": 0,
           "gate": {"self": {"forbiddenNames": [], "execArgvClean": True},
                    "child": {"ok": True}}}
write(f"{S}/t3.measure.json", measure)
print("T2 nonce", N2)
print("T3 nonce", N3)
