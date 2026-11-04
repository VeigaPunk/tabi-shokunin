#!/usr/bin/env python3
"""Re-derive the C1 exactness claim from committed bytes only.

For each candidate cold-run pair (smoke run1/run2, scored run1/run2) report
whether legs, wheellog-minus-ts, pageState and the four declared PNG sha256
values are identical, plus the sha256 of every PNG file on disk.
"""
import hashlib
import json
import pathlib

LANE = pathlib.Path("/home/vgpnk/Projects/shokunin/tabi-shokunin")
E = LANE / "corpus/evidence/round63/chromium-wheel-scroll"
SMOKE = LANE / ".ufo/waves/round-63/controls/smoke"


def sha(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()


def load(p):
    return json.loads(pathlib.Path(p).read_text())


def shape(r):
    return {
        "legs": r["legs"],
        "wheellogMinusTs": [{k: v for k, v in e.items() if k != "ts"} for e in r["wheellog"]],
        "pageState": r["pageState"],
    }


def pair(name, a_path, a_shots, b_path, b_shots):
    a, b = load(a_path), load(b_path)
    sa, sb = shape(a), shape(b)
    steps_equal = [s["sha256"] for s in a["steps"]] == [s["sha256"] for s in b["steps"]]
    files = {}
    for label, receipt, shots in (("a", a, a_shots), ("b", b, b_shots)):
        files[label] = {s["png"]: sha(pathlib.Path(shots) / s["png"]) for s in receipt["steps"]}
    file_equal = files["a"] == files["b"]
    return {
        "pair": name,
        "a": {"file": str(a_path), "sha256": sha(a_path), "nonce": a["nonce"]},
        "b": {"file": str(b_path), "sha256": sha(b_path), "nonce": b["nonce"]},
        "legsEqual": sa["legs"] == sb["legs"],
        "wheellogMinusTsEqual": sa["wheellogMinusTs"] == sb["wheellogMinusTs"],
        "pageStateEqual": sa["pageState"] == sb["pageState"],
        "declaredStepShasEqual": steps_equal,
        "declaredStepShas": [s["sha256"] for s in a["steps"]],
        "distinctDeclaredShasWithinRun": len({s["sha256"] for s in a["steps"]}),
        "pngFilesEqualAcrossShotDirs": file_equal,
        "pngFileSha": files,
    }


doc = {
    "schema": "tabi-r63-critic-shape-rederive-v1",
    "author": "R63Critic",
    "smokePair": pair("smoke-run1-vs-run2", SMOKE / "receipt-run1.json", SMOKE, SMOKE / "receipt-run2.json", SMOKE),
    "scoredPair": pair("scored-run1-vs-run2", E / "receipt.json", E, E / "stability/receipt-run2.json", E / "stability"),
    "notes": [
        "Both smoke receipts resolve their four step PNGs to the SAME four files in controls/smoke; there is no second shot directory for smoke run 2.",
        "Driver capture order (scripts/chrome-cdp-loopback-round63.mjs:264-274) puts a,b,c at scrollY 120 and d at 240, so three identical a,b,c bytes are expected and the four records carry two distinct images.",
    ],
}
print(json.dumps(doc, indent=1))
