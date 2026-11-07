#!/usr/bin/env python3
"""Independent re-derivation of the r78 counter's timeline/quantum brackets.

Written from the prose spec (not by transliterating the JS): pairs = events carrying numeric ts
and at; pairMatch = greedy first-fit of each receipt event against an unused prior event with
|dts| < TOL and |dat| < TOL; gaps = consecutive sorted `at` differences >= GAP_MIN; gapMatch =
sorted greedy with |d| < TOL. Needs come from the PRIOR's own counts.
"""
import json, sys, math

TOL, GAP_MIN, FRAC, GAP_FRAC, MIN_OWN_GAPS = 0.05, 50.0, 0.5, 0.75, 11
GRID_TOL = 1e-4  # in units of 0.1 ms


def load(p):
    with open(p) as f:
        return json.load(f)


def pairs(x):
    return [e for e in x.get("events", []) if isinstance(e, dict)
            and isinstance(e.get("ts"), (int, float)) and not isinstance(e.get("ts"), bool)
            and isinstance(e.get("at"), (int, float)) and not isinstance(e.get("at"), bool)]


def pair_match(a, b, tol=TOL):
    y = [(e["ts"], e["at"]) for e in pairs(b)]
    used = [False] * len(y)
    n = 0
    for e in pairs(a):
        for i, v in enumerate(y):
            if not used[i] and abs(v[0] - e["ts"]) < tol and abs(v[1] - e["at"]) < tol:
                used[i] = True
                n += 1
                break
    return n


def gaps(x, gap_min=GAP_MIN):
    at = sorted(e["at"] for e in pairs(x))
    return [at[i] - at[i - 1] for i in range(1, len(at)) if at[i] - at[i - 1] >= gap_min]


def match_count(a, b, tol=TOL):
    x, y = sorted(a), sorted(b)
    i = j = n = 0
    while i < len(x) and j < len(y):
        d = x[i] - y[j]
        if abs(d) < tol:
            n += 1; i += 1; j += 1
        elif d < 0:
            i += 1
        else:
            j += 1
    return n


def needs(p):
    return math.ceil(FRAC * len(pairs(p)) - 1e-9), math.ceil(GAP_FRAC * len(gaps(p)) - 1e-9)


def sim(under, prior):
    aN, gN = needs(prior)
    am, gm = pair_match(under, prior), match_count(gaps(under), gaps(prior))
    return dict(priorEvents=len(pairs(prior)), priorGaps=len(gaps(prior)), absMatched=am,
                absNeed=aN, gapMatched=gm, gapNeed=gN,
                absDecisive=(aN > 0 and am >= aN), gapDecisive=(gN > 0 and gm >= gN),
                refused=(aN > 0 and am >= aN) or (gN > 0 and gm >= gN))


def offgrid(x):
    bad = []
    for e in x.get("events", []):
        for k in ("ts", "at"):
            v = e.get(k)
            if not isinstance(v, (int, float)) or isinstance(v, bool):
                bad.append((e.get("leg"), k, v, "non-numeric"))
                continue
            r = abs(v * 10 - round(v * 10))
            if r > GRID_TOL:
                bad.append((e.get("leg"), k, v, r))
    return bad


W = sys.argv[1]
CASES = [
    "replay-timeline-tol-in-0.049",
    "accept-prior-retimed-0.051-scattered",
    "replay-timeline-abs-at-threshold",
    "accept-prior-abs-below-threshold",
    "replay-timeline-gap-at-threshold",
    "accept-prior-gap-below-threshold",
    "replay-timeline-gaps-added-own-denominator",
    "accept-gaps-added-prior-below",
]
out = {}
for c in CASES:
    pre = "acc-" if c.startswith("accept-") else "neg-"
    under = load(f"{W}/{pre}{c}.case")
    prior = load(f"{W}/prior-{c}.json")
    s = sim(under, prior)
    s["ownGaps"] = len(gaps(under))
    s["ownEvents"] = len(pairs(under))
    s["ownGapFloorOk"] = s["ownGaps"] >= MIN_OWN_GAPS
    out[c] = s

for c in ["replay-timeline-own-gap-49.9", "accept-own-gap-50.1"]:
    pre = "acc-" if c.startswith("accept-") else "neg-"
    u = load(f"{W}/{pre}{c}.case")
    real = load(f"/fast/scratch/hyaku/tabi-r78/R78Review2/lane/corpus/evidence/round78/chromium-file-chooser/receipt.json")
    out[c] = {"ownGaps": len(gaps(u)), "ownEvents": len(pairs(u)),
              "ownGapFloorOk": len(gaps(u)) >= MIN_OWN_GAPS,
              "absMatched_vs_scored": pair_match(u, real), "absNeed_scored": needs(real)[0],
              "gapMatched_vs_scored": match_count(gaps(u), gaps(real)),
              "gapNeed_scored": needs(real)[1],
              "min_gap": min(gaps(u)) if gaps(u) else None}

for c in ["event-time-quantum-bracket-2e-5", "accept-grid-5e-6"]:
    pre = "acc-" if c.startswith("accept-") else "neg-"
    u = load(f"{W}/{pre}{c}.case")
    bad = offgrid(u)
    out[c] = {"offgridEvents": len(bad), "sample": bad[:3]}

print(json.dumps(out, indent=1))
