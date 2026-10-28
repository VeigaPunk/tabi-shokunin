#!/usr/bin/env python3
"""Blob-ness probes for the frozen round-42 C2 checker.

The frozen predicate and the checker's own header comment both require
"a committed blob". The checker's gitBlobSize() uses `git cat-file -s`, which
also succeeds on tree objects, so two of its conditions accept a directory.

Each probe resets the scratch fixture to its predicate-satisfying commit
(4249b6e), moves exactly one property, and reports the checker's verdict.
"""
import json
import os
import re
import shutil
import subprocess
import sys

REPO = "/fast/scratch/hyaku/tabi-r42/RevC2Freeze/fixture-repo"
CHECK = "/fast/scratch/hyaku/tabi-r42/RevC2Freeze/checker-freeze.mjs"
GREEN = "4249b6edd0c521ca1eb942773aea205332060a90"


def sh(*a, **kw):
    return subprocess.run(a, capture_output=True, text=True, cwd=REPO, **kw)


def reset():
    sh("git", "reset", "--hard", "-q", GREEN)
    sh("git", "clean", "-qfd")


def commit(msg):
    sh("git", "add", "-A")
    sh("git", "commit", "-q", "-m", msg)
    return sh("git", "rev-parse", "HEAD").stdout.strip()


def obj(rev, path):
    t = sh("git", "cat-file", "-t", f"{rev}:{path}").stdout.strip()
    s = sh("git", "cat-file", "-s", f"{rev}:{path}").stdout.strip()
    return t, s


def check(rev, label, want_exit, want_green_predicate=None):
    r = sh("node", CHECK, "--rev", rev, "--repo", REPO, "--json")
    d = json.loads(r.stdout)
    ids = [f["id"] for f in d["findings"]]
    line = (f"{label}\n  checker exit={r.returncode} predicate={d['predicate']} "
            f"findings={ids if ids else '[]'}")
    ok = r.returncode == want_exit
    if want_green_predicate is not None:
        ok = ok and d["predicate"] is want_green_predicate
    print(line)
    print(f"  expectation: exit {want_exit} -> {'OK' if ok else 'MISMATCH'}\n")
    return ok


def main():
    ok = True
    print("=== reference: predicate-satisfying fixture tree ===")
    reset()
    print(f"green rev = {GREEN}")
    ok &= check(GREEN, "G  green tree (all four clauses met by real blobs)", 0, True)

    print("=== B1: r4 evidence path names a TREE, not a blob ===")
    reset()
    tsv = ".ufo/waves/round-42/quarantine/re-adjudication.tsv"
    rows = [l.split("\t") for l in open(os.path.join(REPO, tsv)).read().rstrip("\n").split("\n")]
    rows[0][2] = ".ufo/waves/round-42/quarantine/evidence"
    open(os.path.join(REPO, tsv), "w").write("\n".join("\t".join(r) for r in rows) + "\n")
    b1 = commit("B1: evidence cell names a directory")
    t, s = obj(b1, ".ufo/waves/round-42/quarantine/evidence")
    print(f"  evidence object type={t} size={s}")
    ok &= check(b1, "  frozen predicate r4: 'every evidence path a committed blob of at least 200 bytes'", 0, True)

    print("=== B2: r3 control path names a TREE whose entry names carry 'ls-tree' and '0' ===")
    reset()
    p = os.path.join(REPO, ".ufo/waves/round-41/controls/c1-baseline-noop.out")
    os.remove(p)
    os.makedirs(p)
    open(os.path.join(p, "ls-tree"), "w").write("x")
    open(os.path.join(p, "0"), "w").write("y")
    b2 = commit("B2: baseline control is a directory with entries named ls-tree and 0")
    t, s = obj(b2, ".ufo/waves/round-41/controls/c1-baseline-noop.out")
    raw = subprocess.run(["git", "show", f"{b2}:.ufo/waves/round-41/controls/c1-baseline-noop.out"],
                         capture_output=True, cwd=REPO).stdout
    print(f"  control object type={t} size={s} "
          f"contains b'ls-tree'={b'ls-tree' in raw} "
          f"standalone '0'={bool(re.search(rb'(^|[^0-9])0([^0-9]|$)', raw, re.M))}")
    ok &= check(b2, "  frozen predicate r3: 'a committed nonempty blob recording the ls-tree counting command and the digit 0'", 0, True)

    print("=== B3: r1a receipt path names a TREE (expected fail-closed) ===")
    reset()
    rp = os.path.join(REPO, "corpus/evidence/round41/playwright-egress/receipt.json")
    os.remove(rp)
    os.makedirs(rp)
    open(os.path.join(rp, "filler.txt"), "w").write("z" * 1500)
    b3 = commit("B3: receipt.json is a directory")
    t, s = obj(b3, "corpus/evidence/round41/playwright-egress/receipt.json")
    print(f"  receipt object type={t} size={s}")
    ok &= check(b3, "  r1a tree substitution (JSON parse must refuse)", 1, False)

    reset()
    print("RESULT:", "all probes behave as reported" if ok else "UNEXPECTED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
