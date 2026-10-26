#!/usr/bin/env python3
"""summarize.py — ExecNoHarmTip, round 30 w2.

Derive a curated tally for every row of matrix-tip.tsv from the raw stdout/stderr
files captured by run-matrix.sh. Nothing is typed from memory: JSON outputs are
parsed and projected onto a fixed key list; text outputs use the last summary
line. Writes matrix-tip.tsv's `tally` column in place (keeping row/seat/rev/
script/mode/exit/command) plus a plain tally-shape file.
"""
import json
import os
import re
import sys

OUT = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(OUT, "raw")
TSV = os.path.join(OUT, "matrix-tip.tsv")

KEYS = [
    "verdict", "clean", "valid", "ok", "sha_match", "anchor_located",
    "anchor_occurrences", "anchor_unique", "byte_count_match",
    "decoded_bytes", "restores", "population", "admitted", "failing",
    "fault_total", "fault_survivors", "benign_total", "benign_killed",
    "rows", "verified", "nonconformant", "mismatches", "unresolved",
    "resolved", "holds", "drifted", "reopened", "matched", "unique",
    "lane", "public", "cases", "passed", "failed", "passed_cases",
    "failed_cases", "c1_lifecycle_observations", "value",
]

# Selection is ordered: a JSON body wins, then a named summary line, then a
# mode banner, then the tool's own verdict rows, then census/contract lines.
NAMED_RE = re.compile(r"[A-Z0-9_]+SELFTEST verdict=")
BANNER_RE = re.compile(r"ARIA_METADATA (check|witness) verdict=")
VERDICT_RE = re.compile(r"^[A-Z0-9_]+(_GATE|_CONTRACT)? verdict=|^verdict=")
UTIL_RE = re.compile(r"report-contract: |\tok\t|^file\tok|lane=")


def read(name):
    p = os.path.join(RAW, name)
    if not os.path.exists(p):
        return ""
    with open(p, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def project(obj):
    parts = []
    for k in KEYS:
        if k in obj:
            v = obj[k]
            if isinstance(v, bool):
                v = "true" if v else "false"
            elif isinstance(v, list):
                v = str(len(v))
            parts.append(f"{k}={v}")
    if isinstance(obj.get("cases"), list) and obj["cases"] and all(
            isinstance(c, dict) and "pass" in c for c in obj["cases"]):
        parts.append(f"cases={len(obj['cases'])}")
        parts.append(f"failed_cases={sum(1 for c in obj['cases'] if not c['pass'])}")
    if isinstance(obj.get("perClass"), list):
        tot = sum(c.get("findings", 0) for c in obj["perClass"])
        parts.append(f"classes={len(obj['perClass'])}")
        parts.append(f"findings={tot}")
    return " ".join(parts)


def tally_for(out, err):
    text = out.strip()
    if text.startswith("{"):
        try:
            return project(json.loads(text))
        except json.JSONDecodeError:
            pass
    for pattern, pick in ((NAMED_RE, -1), (BANNER_RE, 0), (VERDICT_RE, -1), (UTIL_RE, -1)):
        hits = [ln for ln in out.splitlines() if pattern.search(ln)]
        if hits:
            return hits[pick].strip()
    head = text.splitlines()[:1]
    if head:
        return head[0].strip()[:160]
    e_lines = [ln for ln in err.splitlines() if ln.strip()]
    return ("stderr: " + e_lines[-1].strip()[:160]) if e_lines else "(empty)"


def main():
    with open(TSV, "r", encoding="utf-8") as f:
        lines = f.read().rstrip("\n").split("\n")
    header = lines[0].split("\t")
    idx = {h: i for i, h in enumerate(header)}
    out_lines = ["\t".join(header)]
    shapes = []
    for line in lines[1:]:
        cells = line.split("\t")
        slug = re.sub(r"[^A-Za-z0-9._-]", "_", f"{cells[idx['script']]}-{cells[idx['mode']]}")
        tag = "%02d" % int(cells[idx["row"]])
        out_text = read(f"{tag}-{slug}.out")
        err_text = read(f"{tag}-{slug}.err")
        cells[idx["tally"]] = tally_for(out_text, err_text).replace("\t", " ")
        out_lines.append("\t".join(cells))
        shapes.append(f"{cells[idx['row']]}\t{cells[idx['script']]}\t{cells[idx['mode']]}\t{cells[idx['exit']]}\t{cells[idx['tally']]}")
    with open(TSV, "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines) + "\n")
    with open(os.path.join(OUT, "tallies-tip.tsv"), "w", encoding="utf-8") as f:
        f.write("row\tscript\tmode\texit\ttally\n" + "\n".join(shapes) + "\n")
    print("\n".join(shapes))


if __name__ == "__main__":
    sys.exit(main())
