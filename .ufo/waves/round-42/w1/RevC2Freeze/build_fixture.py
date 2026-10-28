#!/usr/bin/env python3
"""Differential fixture for the frozen round-42 C2 checker.

Builds a throwaway git repo in scratch that satisfies the frozen C2 predicate,
then commits single-property mutants. Nothing is written outside scratch.
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys

ROOT = "/fast/scratch/hyaku/tabi-r42/RevC2Freeze/fixture-repo"
CHECKER = "/fast/scratch/hyaku/tabi-r42/RevC2Freeze/checker-freeze.mjs"

QUOTE = "A space-separated list of command-line options."


def run(args, cwd=ROOT, check=True):
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if check and r.returncode != 0:
        sys.exit(f"FAILED {args}: {r.returncode}\n{r.stdout}\n{r.stderr}")
    return r


def w(rel, data):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    if isinstance(data, str):
        data = data.encode()
    with open(p, "wb") as f:
        f.write(data)


def commit(msg):
    run(["git", "add", "-A"])
    run(["git", "commit", "-q", "-m", msg])
    return run(["git", "rev-parse", "HEAD"]).stdout.strip()


def check(rev, label, expect_exit, expect_ids=()):
    r = subprocess.run(
        ["node", CHECKER, "--rev", rev, "--repo", ROOT, "--json"],
        capture_output=True, text=True,
    )
    try:
        doc = json.loads(r.stdout)
    except json.JSONDecodeError:
        print(f"{label}: UNPARSEABLE stdout={r.stdout!r} stderr={r.stderr!r}")
        return False
    ids = [f["id"] for f in doc["findings"]]
    ok = r.returncode == expect_exit and all(i in ids for i in expect_ids)
    if expect_exit == 1 and not expect_ids:
        ok = r.returncode == 1
    print(f"{label}: exit={r.returncode} (want {expect_exit}) findings={ids} "
          f"predicate={doc['predicate']} -> {'OK' if ok else 'MISMATCH'}")
    return ok


def main():
    shutil.rmtree(ROOT, ignore_errors=True)
    os.makedirs(ROOT)
    run(["git", "init", "-q", "-b", "main"], check=True)
    run(["git", "config", "user.email", "fixture@local"])
    run(["git", "config", "user.name", "fixture"])

    receipt = json.dumps({"schema": "fixture-receipt", "pad": "x" * 1200}).encode()
    witness = json.dumps({"schema": "fixture-witness", "pad": "y" * 1200}).encode()
    w("corpus/evidence/round41/playwright-egress/receipt.json", receipt)
    w("corpus/evidence/round41/playwright-egress/receipt.witness.json", witness)
    w(".ufo/waves/round-41/measure/c1-measure.json", json.dumps({
        "schema": "fixture-measure",
        "receiptSha256": hashlib.sha256(receipt).hexdigest(),
        "witnessSha256": hashlib.sha256(witness).hexdigest(),
    }))
    w(".ufo/waves/round-41/sources/node-cli-v24.21.0.html",
      f"<html><body><p>{QUOTE} Some surrounding text.</p></body></html>\n")
    w(".ufo/waves/round-41/controls/c1-baseline-noop.out",
      "ls-tree -r --name-only <rev> -- corpus/evidence/round42 | wc -l\n0\n")

    header = ("| id | source | kind | tier | scope | anchor | teaches | status | "
              "opened | recheck | used-by |\n"
              "|---|---|---|---|---|---|---|---|---|---|---|\n")
    s146 = ("| S146 | Node.js CLI docs | docs | A | scope-text | anchor-text | "
            "A space-separated list of command-line options; interpreted before "
            "command-line options | rejected | 2026-10-28 | on-release | "
            "corpus/lessons/round-42.md |\n")
    s148 = (f"| S148 | Node.js CLI docs | docs | A | supersedes S146 — scope text | "
            f"anchor text | supersedes S146 — {QUOTE} | mined | 2026-10-28 | "
            f"on-release | corpus/knowledge/x.md |\n")
    w("corpus/SOURCES.md", header + s146 + s148)

    ids = [f"Q{i:03d}" for i in range(1, 39)]
    w(".ufo/waves/round-42/quarantine/slice-ids.txt", "\n".join(ids) + "\n")
    tsv = []
    for i, sid in enumerate(ids):
        ev = f".ufo/waves/round-42/quarantine/evidence/{sid}.txt"
        w(ev, ("e" * 220) + "\n")
        tsv.append(f"{sid}\tpresent\t{ev}")
    w(".ufo/waves/round-42/quarantine/re-adjudication.tsv", "\n".join(tsv) + "\n")

    green = commit("fixture: predicate-satisfying tree")
    print(f"green rev = {green}")
    ok = True
    ok &= check(green, "G0 GREEN baseline (want exit 0)", 0)

    # M1: r3 threshold edge -- 9-byte blob 'ls-tree 0' satisfies the predicate text
    # (nonempty, records the ls-tree command, records digit 0) but not size>=10.
    w(".ufo/waves/round-41/controls/c1-baseline-noop.out", "ls-tree 0")
    m1 = commit("mutant: r3 nine-byte control")
    ok &= check(m1, "M1 r3 9-byte 'ls-tree 0' (predicate-satisfying text)", 1,
                ["r3-baseline-file-empty"])

    # restore
    w(".ufo/waves/round-41/controls/c1-baseline-noop.out",
      "ls-tree -r --name-only <rev> -- corpus/evidence/round42 | wc -l\n0\n")

    # M2: r2 separator edge -- teaches begins 'supersedes S146' but with no dash,
    # remainder after the prefix is still a verbatim substring of the staged html.
    s148_nodash = (f"| S148 | Node.js CLI docs | docs | A | scope | anchor | "
                   f"supersedes S146 {QUOTE} | mined | 2026-10-28 | on-release | "
                   f"corpus/knowledge/x.md |\n")
    w("corpus/SOURCES.md", header + s146 + s148_nodash)
    m2 = commit("mutant: r2 teaches without dash separator")
    ok &= check(m2, "M2 r2 no-dash separator", 1, ["r2-quote-not-verbatim"])

    # restore
    w("corpus/SOURCES.md", header + s146 + s148)

    # M3: r1a digest drift
    w("corpus/evidence/round41/playwright-egress/receipt.json",
      json.dumps({"schema": "fixture-receipt", "pad": "z" * 1200}).encode())
    m3 = commit("mutant: r1a receipt bytes drift")
    ok &= check(m3, "M3 r1a digest mismatch", 1, ["r1a-digest-mismatch"])
    w("corpus/evidence/round41/playwright-egress/receipt.json", receipt)

    # M4: r4 duplicate id
    tsv_dup = tsv[:-1] + [f"Q001\tpresent\t.ufo/waves/round-42/quarantine/evidence/Q001.txt"]
    w(".ufo/waves/round-42/quarantine/re-adjudication.tsv", "\n".join(tsv_dup) + "\n")
    m4 = commit("mutant: r4 duplicate id")
    ok &= check(m4, "M4 r4 duplicate + missing", 1, ["r4-duplicate-ids", "r4-ids-missing"])

    # M5: r4 verdict outside enum
    tsv2 = list(tsv)
    tsv2[0] = f"Q001\tverified\t.ufo/waves/round-42/quarantine/evidence/Q001.txt"
    w(".ufo/waves/round-42/quarantine/re-adjudication.tsv", "\n".join(tsv2) + "\n")
    m5 = commit("mutant: r4 verdict enum")
    ok &= check(m5, "M5 r4 verdict outside enum", 1, ["r4-verdict-enum"])

    # M6: r4 thin evidence (199 bytes)
    w(".ufo/waves/round-42/quarantine/evidence/Q002.txt", "t" * 199)
    m6 = commit("mutant: r4 thin evidence")
    ok &= check(m6, "M6 r4 evidence <200 bytes", 1, ["r4-evidence-thin"])
    w(".ufo/waves/round-42/quarantine/evidence/Q002.txt", "e" * 220 + "\n")

    # M7: malformed row (2 cells)
    tsv3 = list(tsv)
    tsv3[3] = "Q004\tpresent"
    w(".ufo/waves/round-42/quarantine/re-adjudication.tsv", "\n".join(tsv3) + "\n")
    m7 = commit("mutant: r4 malformed row")
    ok &= check(m7, "M7 r4 malformed row", 1, ["r4-row-malformed"])

    # restore to green and re-verify reversibility
    w(".ufo/waves/round-42/quarantine/re-adjudication.tsv", "\n".join(tsv) + "\n")
    w(".ufo/waves/round-42/quarantine/evidence/Q002.txt", "e" * 220 + "\n")
    g2 = commit("restore: green again")
    ok &= check(g2, "G1 GREEN restored (want exit 0)", 0)

    print("ALL EXPECTATIONS HELD" if ok else "EXPECTATION MISMATCH PRESENT")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
