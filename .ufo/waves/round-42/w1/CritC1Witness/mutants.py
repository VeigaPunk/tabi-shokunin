#!/usr/bin/env python3
"""Sensitivity battery: which in-byte bindings refuse a forged pair, and which
are trivially satisfiable. Base = t3 synthetic (already predicate-true)."""
import json, hashlib, copy, os, subprocess, sys

S = "/fast/scratch/hyaku/tabi-r42/CritC1Witness"
C = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/counters/c1-session-bound-v4.mjs"
P = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/claims.json"
FF = "/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox"

rec = json.load(open(f"{S}/t3.receipt.json"))
wit = json.load(open(f"{S}/t3.witness.json"))
mea = json.load(open(f"{S}/t3.measure.json"))
N = wit["nonce"]

def run(name, r=None, w=None, m=None, pins=P, nonce=N):
    rp, wp, mp = f"{S}/m-{name}.receipt.json", f"{S}/m-{name}.witness.json", f"{S}/m-{name}.measure.json"
    json.dump(r if r is not None else rec, open(rp, "w"))
    json.dump(w if w is not None else wit, open(wp, "w"))
    json.dump(m if m is not None else mea, open(mp, "w"))
    args = ["node", C, rp, "--nonce", nonce, "--witness", wp]
    if pins: args += ["--pins", pins]
    if m is not None or True: args += ["--measure", mp]
    p = subprocess.run(args, capture_output=True, text=True)
    try:
        d = json.loads(p.stdout)
        print(f"{name:28s} exit={p.returncode} predicate={d['predicate']!s:5s} findings={d['findings']}")
    except Exception:
        print(f"{name:28s} exit={p.returncode} stdout={p.stdout[:120]!r} stderr={p.stderr[:120]!r}")
    return p.returncode

def mut(deep=True):
    return copy.deepcopy(rec if deep else rec)

# M1: receipt.runNonce != runs' nonce
r = mut(); r["runNonce"] = "0" * 64; run("m1-receipt-nonce", r=r)
# M2: witness nonce stale
w = copy.deepcopy(wit); w["nonce"] = "1" * 64; run("m2-witness-nonce", w=w)
# M3: sample pid stale relative to runStartTicks
r = mut()
for s in r["runs"][0]["samples"]: s["treePids"][0]["startTicks"] = r["runs"][0]["runStartTicks"] - 100
r["runs"][0]["owned"]["roots"][0]["startTicks"] = r["runs"][0]["runStartTicks"] - 100
run("m3-pid-stale", r=r)
# M4: pid future relative to sample tTicks
r = mut(); s = r["runs"][1]["samples"][3]; s["treePids"][0]["startTicks"] = s["tTicks"] + 100; run("m4-pid-future", r=r)
# M5: elapsedMs below span sum
m = copy.deepcopy(mea); m["elapsedMs"] = 100; run("m5-wall-clock", m=m)
# M6: shortened span (<1000ms)
r = mut()
for run_ in r["runs"]:
    base = run_["samples"][0]["t"]
    for k, s in enumerate(run_["samples"]): s["t"] = base + k * 50
run("m6-span-short", r=r)
# M7: witness only 9 samples
w = copy.deepcopy(wit); w["samples"] = w["samples"][:9]; run("m7-witness-9", w=w)
# M8: witness trees without firefox
w = copy.deepcopy(wit)
for s in w["samples"]: s["tree"] = [t for t in s["tree"] if "firefox" not in t["exe"]]
run("m8-witness-no-ff", w=w)
# M9: zero socket observations
r = mut()
for run_ in r["runs"]:
    for s in run_["samples"]: s["ss"]["ssObs"] = 0; s["proc"]["procObs"] = 0
    run_["sockets"] = {"ss": {"observations": 0, "nonLoopback": 0}, "proc": {"observations": 0, "nonLoopback": 0}, "finalSweep": {"ss": 0, "proc": 0}}
run("m9-zero-obs", r=r)
# M10: one nonLoopback socket
r = mut(); r["runs"][0]["samples"][0]["ss"]["nonLoopback"] = 1; run("m10-egress", r=r)
# M11: wrong schema
r = mut(); r["schema"] = "tabi-pw-firefox-egress-receipt-r40"; run("m11-schema", r=r)
# M12: pins with a tampered producer digest (does the pin check work at all?)
pins = json.load(open(P)); pins["frozenDigests"]["scripts/measure-c1-round41.mjs"] = "0" * 64
json.dump(pins, open(f"{S}/pins-tampered.json", "w")); run("m12-pins-tampered", pins=f"{S}/pins-tampered.json")
# M13: attacker-supplied empty pins -> pin checks skipped entirely
json.dump({"frozenDigests": {}, "producerPins": {}}, open(f"{S}/pins-empty.json", "w"))
run("m13-pins-empty", pins=f"{S}/pins-empty.json")
# M14: witness never contains nodePid; ff pid hangs off it by ppid only
w = copy.deepcopy(wit)
for s in w["samples"]: s["tree"] = [t for t in s["tree"] if t["pid"] != 9000001]
run("m14-witness-no-driver", w=w)
# M15: both runs share identical pid identity (no per-run process identity)
r = mut(); r["runs"][1]["owned"]["nodePid"] = r["runs"][0]["owned"]["nodePid"]; run("m15-shared-pids", r=r)
