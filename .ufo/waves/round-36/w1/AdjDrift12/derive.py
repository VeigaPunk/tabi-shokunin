#!/usr/bin/env python3
"""AdjDrift12 derivation (recorded evidence copy; run from anywhere).

Independent re-derivation of the C1 drift-audit status of the 20 rows in
.ufo/waves/round-36/w1-chunks/AdjDrift12.tsv, from git objects only, compared
against the committed ledger corpus/adjacency-screen-drift.tsv.
Writes receipt.tsv next to this file.
"""
import json
import os
import subprocess

FLEET = "/home/vgpnk/Projects/shokunin"
LANE = os.path.join(FLEET, "tabi-shokunin")
CHUNK = os.path.join(LANE, ".ufo/waves/round-36/w1-chunks/AdjDrift12.tsv")
PINS = os.path.join(LANE, ".ufo/waves/round-36/baseline/c1-delta-pins.json")
LEDGER = os.path.join(LANE, "corpus/adjacency-screen-drift.tsv")
MYDIR = os.path.join(LANE, ".ufo/waves/round-36/w1/AdjDrift12")
OUT = os.path.join(MYDIR, "receipt.tsv")

pins = json.load(open(PINS))
blob_cache = {}


def show(repo, rev, path):
    key = (repo, rev, path)
    if key not in blob_cache:
        r = subprocess.run(["git", "-C", repo, "show", f"{rev}:{path}"], capture_output=True)
        blob_cache[key] = (r.returncode, r.stdout)
    return blob_cache[key]


def lines_of(rc, blob):
    if rc != 0:
        return None
    out = blob.decode("utf-8", "replace").split("\n")
    if out and out[-1] == "":
        out = out[:-1]
    return out


def derive(ref):
    lhs, line = ref.rsplit(":", 1)
    lane_pin, path = lhs.split(":", 1)
    lane, pin = lane_pin.split("@", 1)
    line = int(line)
    repo = os.path.join(FLEET, lane)
    rc, blob = show(repo, pin, path)
    if rc != 0:
        return "stale", "stale: pin file absent"
    rows = lines_of(rc, blob)
    if line < 1 or line > len(rows):
        return "stale", "stale: pin line absent"
    cited = rows[line - 1].strip()
    head = pins.get(lane[: -len("-shokunin")])
    if head is None:
        return "stale", "stale: no frozen delta head for lane"
    rc2, hblob = show(repo, head, path)
    if rc2 != 0:
        return "stale", "stale: head file absent"
    hrows = lines_of(rc2, hblob)
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

rows = []
with open(CHUNK, encoding="utf-8") as f:
    for raw in f:
        if raw.strip():
            rows.append(raw.rstrip("\n").split("\t")[0])

out, bad = [], 0
for ref in rows:
    mine, note = derive(ref)
    lg = ledger.get(ref, "ABSENT-FROM-LEDGER")
    verdict = "agree" if lg == mine else "MISMATCH"
    bad += verdict == "MISMATCH"
    out.append((ref, mine, note, lg, verdict))

with open(OUT, "w", encoding="utf-8") as f:
    f.write("sibling_ref\tmy-status\tmy-note\tledger-status\tverdict\n")
    for r in out:
        f.write("\t".join(r) + "\n")
    f.write(f"# AdjDrift12: {len(out)} rows, {bad} mismatches\n")
print(f"rows={len(out)} mismatches={bad}")
