#!/usr/bin/env python3
"""Reconcile the frozen r63 counter's check ids against (a) the committed
negative/mutant coverage and (b) the independent verifier in this wave dir.

Reads only frozen bytes + my own verifier source. Writes reconcile/table.json.
"""
import json
import os
import re
import sys

LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
WAVE = os.path.join(LANE, ".ufo/waves/round-63/w1/R63Revenger")
COUNTER = os.path.join(LANE, ".ufo/waves/round-63/counters/chromium-wheel-r63.mjs")
MATRIX = os.path.join(LANE, ".ufo/waves/round-63/controls/mutation/matrix.json")
NEGDIR = os.path.join(LANE, ".ufo/waves/round-63/controls/negatives")
VERIFIER = os.path.join(WAVE, "wheel/verify-wheel.py")

src = open(COUNTER, encoding="utf-8").read()
start = src.index("export function verify(")
end = src.index("function synthetic()")
body = src[start:end]
counter_ids = []
for line in body.split("\n"):
    if "check(" not in line:
        continue
    ids = re.findall(r"'([a-z0-9][a-z0-9-]*)'\s*\)", line)
    if ids:
        counter_ids.append(ids[-1])
# de-duplicate while preserving order (the r63 counter has no repeated ids)
seen, ordered = set(), []
for cid in counter_ids:
    if cid not in seen:
        seen.add(cid)
        ordered.append(cid)

ver = open(VERIFIER, encoding="utf-8").read()
ver_ids = []
for m in re.finditer(r'"(V-[a-z0-9-]+)"', ver):
    if m.group(1) not in ver_ids:
        ver_ids.append(m.group(1))

matrix = json.load(open(MATRIX, encoding="utf-8"))
neg_hits = {}
for name, row in matrix["baseline"]["negativeExits"].items():
    for f in row["findings"]:
        neg_hits.setdefault(f, []).append(name)
mut_targets = {m["check"]: m["id"] for m in matrix["mutants"]}

rows = []
for cid in ordered:
    rows.append(
        {
            "check": cid,
            "negatives": neg_hits.get(cid, []),
            "mutant": mut_targets.get(cid),
            "verifierId": None,
        }
    )

# explicit map: counter check -> verifier id(s)
mapping = {
    "schema": ["V-schema"],
    "nonce-binding": ["V-nonce-binding"],
    "driver-binding": [],
    "fixture-binding": [],
    "loopback-origin": ["V-loopback-origin"],
    "launch-guards": ["V-launch-guards"],
    "legs-shape": ["V-legs-shape"],
    "scroll-arithmetic": ["V-legs-arithmetic", "V-dispatch-arithmetic"],
    "wheellog-count": ["V-legs-wheellog-count"],
    "wheellog-sequence": ["V-wheellog-sequence"],
    "delta-y-passthrough": ["V-delta-sequence"],
    "delta-mode-pixels": ["V-delta-mode-pixels"],
    "trusted-fields": ["V-wheel-fields"],
    "cancelation": ["V-cancelation"],
    "target-binding": ["V-target-binding"],
    "scroll-event-witness": ["V-page-final-state"],
    "shot-records": ["V-step-records"],
    "shot-bytes": [],  # only with --shot (sidecar mode); absent in receipt-only mode
    "server-witness": ["V-server-witness"],
    "survivors": ["V-teardown-survivors"],
    "closed-ports": ["V-closed-ports"],
    "launch-witness": ["V-launch-witness"],
    "failures": ["V-failures-empty"],
    "producer-verdict": ["V-producer-predicate-true", "V-producer-hypothesis-confirmed"],
    "page-final-state": ["V-page-final-state", "V-final-arithmetic"],
}
unmapped = [c for c in ordered if c not in mapping]
missing_verifier = [c for c in ordered if not mapping.get(c)]
for r in rows:
    r["verifierId"] = mapping.get(r["check"], [])

covered_by_negative = [c for c in ordered if neg_hits.get(c)]
no_negative = [c for c in ordered if not neg_hits.get(c)]
no_mutant = [c for c in ordered if c not in mut_targets]
verifier_only = [v for v in ver_ids if not any(v in vv for vv in mapping.values())]

table = {
    "schema": "r63revenger-reconcile-v1",
    "counter": os.path.relpath(COUNTER, LANE),
    "counterCheckCount": len(ordered),
    "counterChecks": ordered,
    "negativeCoveredChecks": covered_by_negative,
    "checksWithNoProductionNegative": no_negative,
    "checksWithNoMutant": no_mutant,
    "checksCounterHasThatReceiptOnlyVerifierLacks": [c for c in ordered if not mapping.get(c)],
    "checksCounterHasThatSidecarVerifierLacks": [c for c in ordered if c in ("driver-binding", "fixture-binding")],
    "mutantChecksSubsetOfNegativeCovered": set(mut_targets) <= set(neg_hits),
    "verifierIds": ver_ids,
    "verifierOnlyChecks": verifier_only,
    "unmappedCounterChecks": unmapped,
    "rows": rows,
    "negativeFindingMap": neg_hits,
}
os.makedirs(os.path.join(WAVE, "reconcile"), exist_ok=True)
json.dump(table, open(os.path.join(WAVE, "reconcile/table.json"), "w", encoding="utf-8"), indent=1)
print(json.dumps({k: table[k] for k in [
    "counterCheckCount", "negativeCoveredChecks", "checksWithNoProductionNegative",
    "checksCounterHasThatReceiptOnlyVerifierLacks", "verifierOnlyChecks", "unmappedCounterChecks"]}, indent=1))
sys.exit(0 if not unmapped else 1)
