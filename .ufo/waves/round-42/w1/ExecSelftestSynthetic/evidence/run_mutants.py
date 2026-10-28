#!/usr/bin/env python3
"""Complete the negative surface: exercise the remaining r1-r4 finding ids."""
import json
import os
import shutil
import sys
import tempfile

sys.path.insert(0, "/fast/scratch/hyaku/tabi-r42/ExecSelftestSynthetic")
import build_and_run as B

S, FIXROOT = B.S, B.FIXROOT


def case(name, mutate):
    d = tempfile.mkdtemp(prefix=name + ".", dir=FIXROOT)
    B.build(d)
    mutate(d)
    head = B.gitify(d)
    r = B.run_checker(head, d)
    r["fixture"], r["head"] = d, head
    print(f"{name}: exit={r['exit']} count={r['findingCount']} findings={r['findings']}")
    return r


def rw(d, rel, data):
    B.w(d, rel, data)


def m_prefix(d):
    txt = open(os.path.join(d, B.SOURCES)).read()
    txt = txt.replace("supersedes S146 — ", "see also S146: ")
    rw(d, B.SOURCES, txt)


def m_no_html(d):
    os.remove(os.path.join(d, B.STAGED_HTML))


def m_no_lstree(d):
    rw(d, B.BASELINE, "count command: enumerate corpus/evidence/round42\n0\n")


def m_malformed_row(d):
    p = os.path.join(d, B.TSV)
    lines = open(p).read().rstrip("\n").split("\n")
    lines.append("S999\tpresent")
    rw(d, B.TSV, "\n".join(lines) + "\n")


def m_missing_row(d):
    p = os.path.join(d, B.TSV)
    lines = open(p).read().rstrip("\n").split("\n")
    rw(d, B.TSV, "\n".join(lines[1:]) + "\n")


def m_no_s146(d):
    txt = open(os.path.join(d, B.SOURCES)).read().split("\n")
    txt = [l for l in txt if not l.startswith("| S146 ")]
    rw(d, B.SOURCES, "\n".join(txt))


def m_no_baseline(d):
    os.remove(os.path.join(d, B.BASELINE))


def m_no_measure(d):
    os.remove(os.path.join(d, B.MEASURE))


def m_bad_measure(d):
    rw(d, B.MEASURE, b"{not json")


CASES = [
    ("M1-supersedes-prefix-missing", m_prefix, ["r2-supersedes-prefix-missing"]),
    ("M2-staged-html-absent", m_no_html, ["r2-staged-html-absent"]),
    ("M3-command-not-recorded", m_no_lstree, ["r3-command-not-recorded"]),
    ("M4-row-malformed", m_malformed_row, ["r4-row-malformed"]),
    ("M5-ids-missing", m_missing_row, ["r4-ids-missing"]),
    ("M6-s146-absent", m_no_s146, ["r2-s146-absent"]),
    ("M7-baseline-file-absent", m_no_baseline, ["r3-baseline-file-absent"]),
    ("M8-measure-absent", m_no_measure, ["r1-measure-absent"]),
    ("M9-measure-unparseable", m_bad_measure, ["r1-measure-unparseable"]),
]

res, ok = {}, True
for name, mut, want in CASES:
    r = case(name, mut)
    res[name] = r
    m = r["exit"] == 1 and r["findings"] == want
    ok &= m
    if not m:
        print(f"   MISMATCH expected {want}")

with open(os.path.join(S, "results-mutants.json"), "w") as f:
    json.dump(res, f, indent=1)

print("\nALL_PASS" if ok else "\nSOME_FAIL")
sys.exit(0 if ok else 1)
