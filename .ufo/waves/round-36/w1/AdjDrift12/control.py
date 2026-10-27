#!/usr/bin/env python3
"""AdjDrift12 positive control (recorded evidence copy, self-contained).

Re-derives the three rows the committed ledger calls `moved`, with the same
git-objects-only method used for the AdjDrift12 chunk. Proves the method detects
relocations instead of emitting `unchanged` unconditionally.
Writes control-kaidoku.tsv next to this file. Read-only against sibling repos.
"""
import json
import os
import subprocess

FLEET = "/home/vgpnk/Projects/shokunin"
LANE = os.path.join(FLEET, "tabi-shokunin")
PINS = os.path.join(LANE, ".ufo/waves/round-36/baseline/c1-delta-pins.json")
LEDGER = os.path.join(LANE, "corpus/adjacency-screen-drift.tsv")
OUT = os.path.join(LANE, ".ufo/waves/round-36/w1/AdjDrift12/control-kaidoku.tsv")

REFS = [
    "kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f:SKILL.md:585",
    "kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f:SKILL.md:621",
    "kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f:SKILL.md:652",
]

pins = json.load(open(PINS))


def lines_of(repo, rev, path):
    r = subprocess.run(["git", "-C", repo, "show", f"{rev}:{path}"], capture_output=True)
    if r.returncode != 0:
        return None
    out = r.stdout.decode("utf-8", "replace").split("\n")
    if out and out[-1] == "":
        out = out[:-1]
    return out


def derive(ref):
    lhs, line = ref.rsplit(":", 1)
    lane_pin, path = lhs.split(":", 1)
    lane, pin = lane_pin.split("@", 1)
    line = int(line)
    repo = os.path.join(FLEET, lane)
    rows = lines_of(repo, pin, path)
    if rows is None:
        return "stale", "stale: pin file absent"
    if line < 1 or line > len(rows):
        return "stale", "stale: pin line absent"
    cited = rows[line - 1].strip()
    head = pins.get(lane[: -len("-shokunin")])
    if head is None:
        return "stale", "stale: no frozen delta head for lane"
    hrows = lines_of(repo, head, path)
    if hrows is None:
        return "stale", "stale: head file absent"
    if line <= len(hrows) and hrows[line - 1].strip() == cited:
        return "unchanged", "-"
    found = [str(n) for n, x in enumerate(hrows, 1) if x.strip() == cited]
    if found:
        return "moved", ":" + ",".join(found)
    return "stale", "stale: cited text absent at head"


ledger = {}
with open(LEDGER, encoding="utf-8") as f:
    next(f)
    for raw in f:
        p = raw.rstrip("\n").split("\t")
        if len(p) >= 2:
            ledger[p[0]] = p[1]

res, bad = [], 0
for ref in REFS:
    mine, note = derive(ref)
    exp = ledger.get(ref, "ABSENT-FROM-LEDGER")
    verdict = "agree" if mine == exp else "MISMATCH"
    bad += verdict == "MISMATCH"
    res.append((ref, mine, note, exp, verdict))

with open(OUT, "w", encoding="utf-8") as f:
    f.write("sibling_ref\tmy-status\tmy-note\tledger-status\tverdict\n")
    for r in res:
        f.write("\t".join(r) + "\n")
    f.write(
        f"# control: {len(res)} rows, {bad} mismatches "
        "(rows the committed ledger calls `moved`, re-derived from git objects only)\n"
    )
print(f"control rows={len(res)} mismatches={bad}")
