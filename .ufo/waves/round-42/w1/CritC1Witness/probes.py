#!/usr/bin/env python3
"""P1-P5 minimalism probes on the synthetic forgery. No browser, no wrapper."""
import json, copy, os, subprocess

S = "/fast/scratch/hyaku/tabi-r42/CritC1Witness"
C = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/counters/c1-session-bound-v4.mjs"
P = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/claims.json"
FF = "/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox"
rec = json.load(open(f"{S}/t3.receipt.json"))
wit = json.load(open(f"{S}/t3.witness.json"))
mea = json.load(open(f"{S}/t3.measure.json"))
N = wit["nonce"]

def go(name, r, w, m=mea, pins=P):
    rp, wp, mp = f"{S}/p-{name}.r.json", f"{S}/p-{name}.w.json", f"{S}/p-{name}.m.json"
    json.dump(r, open(rp, "w")); json.dump(w, open(wp, "w")); json.dump(m, open(mp, "w"))
    args = ["node", C, rp, "--nonce", N, "--witness", wp]
    if pins: args += ["--pins", pins]
    args += ["--measure", mp]
    pr = subprocess.run(args, capture_output=True, text=True)
    d = json.loads(pr.stdout) if pr.stdout.strip().startswith("{") else {"findings": pr.stderr[:200], "predicate": None}
    print(f"{name:24s} exit={pr.returncode} predicate={d.get('predicate')} findings={d.get('findings')} "
          f"receipt_bytes={os.path.getsize(rp)} witness_bytes={os.path.getsize(wp)}")

# P1: witness tree = a single firefox entry whose ppid is nodePid; driver never observed
w = copy.deepcopy(wit)
for s in w["samples"]:
    s["tree"] = [{"pid": 9000002, "ppid": 9000001, "startTicks": 5000010, "exe": FF, "comm": "firefox"}]
go("p1-one-entry", rec, w)

# P2: strip top-level fields the counter never reads
r = copy.deepcopy(rec)
for k in ["measuredAt", "playwrightVersion", "fixture", "userAgent", "browserVersion", "driver"]:
    r.pop(k, None)
go("p2-stripped", r, wit)

# P3: ten identical witness samples (no time progression)
w = copy.deepcopy(wit)
w["samples"] = [copy.deepcopy(w["samples"][0]) for _ in range(10)]
go("p3-duplicate-samples", rec, w)

# P4: both runs share one timestamp base (runs not time-separated)
r = copy.deepcopy(rec)
for run_ in r["runs"]:
    for k, s in enumerate(run_["samples"]):
        s["t"] = 1800000000000 + k * 200
go("p4-overlapping-runs", r, wit)

# P5: truly minimal receipt: drop every field the counter never touches
minimal_runs = []
for run_ in rec["runs"]:
    minimal_runs.append({
        "runNonce": run_["runNonce"], "runStartTicks": run_["runStartTicks"],
        "refused": False, "samples": run_["samples"],
        "owned": {"nodePid": run_["owned"]["nodePid"], "roots": run_["owned"]["roots"]},
        "finalSweep": run_["finalSweep"], "survivors": 0, "survivorPids": [],
        "portClosed": True, "browserVersion": "157.0",
        "firstShotSha256": run_["firstShotSha256"],
        "sockets": run_["sockets"], "egressNonLoopback": 0,
    })
min_rec = {"schema": rec["schema"], "runNonce": N, "runs": minimal_runs,
           "refused": False, "binding": True, "egressNonLoopback": 0,
           "envCheck": rec["envCheck"]}
min_wit = {"schema": "tabi-r41-witness", "nonce": N, "samples": wit["samples"], "environ": []}
go("p5-minimal", min_rec, min_wit)
