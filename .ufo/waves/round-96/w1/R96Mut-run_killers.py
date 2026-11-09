#!/usr/bin/env python3
"""Verify killer receipts for R96Mut survivors: pristine must find, mutant must say clean."""
import json, hashlib, subprocess, os

S = "/fast/scratch/hyaku/tabi-r96/R96Mut"
LANE = f"{S}/lane"
COUNTER = f"{LANE}/scripts/check-client-oopif-chooser-round96.mjs"
PRISTINE = f"{S}/pristine-counter.mjs"
POS = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-96/controls/receipt-positive.json"
PIN = "4020e57ef865e5eed506796238bb981bb4dbcb226e8fe80eb52728585ce63b91"
NONCE = "tabi-r96-ctl-positive"
SRC = open(COUNTER, encoding="utf-8").read()

BASE = json.load(open(POS))

def run(counter_path, receipt_path):
    r = subprocess.run(["node", counter_path, "--lane", LANE, "--expect-driver-sha256", PIN,
                        "--receipt", receipt_path, "--expect-nonce", NONCE, "--json"],
                       capture_output=True, text=True)
    try:
        return r.returncode, json.loads(r.stdout)
    except Exception:
        return r.returncode, {"stdout": r.stdout, "stderr": r.stderr}

def leg(r, id):
    return next(l for l in r["legs"] if l["leg"] == id)

ITEMS = [
    ("M20-drop-reps", "check('reps', receipt.reps === reps,", "check('reps', true,",
     "reps", lambda r: r.update(reps=99)),
    ("M51-pp-accept-error", "check('pp-timeout', l.outcome === 'timeout'",
     "check('pp-timeout', (l.outcome === 'timeout' || l.outcome === 'error')",
     "pp-timeout", lambda r: leg(r, "PPX-1").update(outcome="error")),
    ("M52-pp-errname", "l.errName === 'TimeoutError'", "true",
     "pp-timeout", lambda r: leg(r, "PPX-1").update(errName="Error")),
    ("M54-chooser-errnulls", "l.errName === null && l.errMessage === null", "true",
     "chooser", lambda r: leg(r, "PWX-1").update(errName="Error", errMessage="boom")),
    ("M65-chooser-accept-error", "check('chooser', l.outcome === 'chooser'",
     "check('chooser', (l.outcome === 'chooser' || l.outcome === 'error')",
     "chooser", lambda r: leg(r, "PWX-1").update(outcome="error")),
    ("M67-pp-multiple-checks", "l.chooserMultiple === null && l.chooserElementId === null", "true",
     "pp-timeout", lambda r: leg(r, "PPX-1").update(chooserMultiple=False, chooserElementId="s")),
]

out = []
for mid, old, new, expect_id, mut in ITEMS:
    r = json.loads(json.dumps(BASE))
    mut(r)
    rp = f"{S}/killers/{mid}.json"
    os.makedirs(f"{S}/killers", exist_ok=True)
    json.dump(r, open(rp, "w"), indent=2)
    # pristine
    prc, pout = run(PRISTINE, rp)
    pids = sorted({f["id"] for f in pout.get("findings", [])})
    # mutant
    assert old in SRC, mid
    open(COUNTER, "w", encoding="utf-8").write(SRC.replace(old, new, 1))
    mrc, mout = run(COUNTER, rp)
    mids = sorted({f["id"] for f in mout.get("findings", [])})
    mv = mout.get("verdict")
    killed = (prc == 1 and expect_id in pids and mrc == 0 and mv == "clean")
    print(f"{mid}: pristine rc={prc} ids={pids} | mutant rc={mrc} verdict={mv} ids={mids} => {'KILLER-VERIFIED' if killed else 'FAIL'}", flush=True)
    out.append({"mutant": mid, "receipt": rp, "expect_finding": expect_id,
                "pristine_rc": prc, "pristine_ids": pids, "mutant_rc": mrc,
                "mutant_verdict": mv, "mutant_ids": mids, "killer_verified": killed})
    open(COUNTER, "wb").write(open(PRISTINE, "rb").read())  # restore before next

restored = hashlib.sha256(open(COUNTER, "rb").read()).hexdigest()
pristine = hashlib.sha256(open(PRISTINE, "rb").read()).hexdigest()
print("restored:", restored == pristine, restored)
summary = {"killer_verification": out, "restored_ok": restored == pristine, "sha": restored,
           "structural_live_only": [
               {"mutant": "M28-drop-driver-exit-LIVE", "note": "check is inside if(live); --receipt mode never evaluates it (driverRun null). No receipt kills it in --receipt mode. Live-mode killer: driver exits nonzero yet writes a fully clean receipt; pristine -> findings [driver-exit] rc1, mutant -> clean rc0. Requires --live harness; unrun here (no deps/chromium run in this seat)."},
               {"mutant": "M29-drop-ports-bound-LIVE", "note": "check is inside if(live) and binds receipt ports to --ports (livePorts null in --receipt mode). No --receipt receipt kills it. Live-mode killer: driver exits 0, receipt ports != --ports but each in 1024..65535 and distinct; pristine -> findings [ports-bound] rc1, mutant -> clean rc0. Requires --live harness; unrun here."}]}
json.dump(summary, open(f"{S}/killer-verification.json", "w"), indent=2)
print(json.dumps(summary, indent=1)[:600])
