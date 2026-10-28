#!/usr/bin/env python3
"""Extra boundary/adversarial probes against the same pristine checker."""
import json
import os
import sys
import tempfile

sys.path.insert(0, "/fast/scratch/hyaku/tabi-r42/ExecSelftestSynthetic")
import build_and_run as B

S = B.S
FIXROOT = B.FIXROOT


def case(name, mutate, **kw):
    d = tempfile.mkdtemp(prefix=name + ".", dir=FIXROOT)
    B.build(d, **kw)
    mutate(d)
    head = B.gitify(d)
    res = B.run_checker(head, d)
    res["fixture"] = d
    res["head"] = head
    print(f"{name}: exit={res['exit']} predicate={res['predicate']} "
          f"count={res['findingCount']} findings={res['findings']}")
    return res


def rewrite(d, rel, data):
    B.w(d, rel, data)


def m_baseline_no_zero(d):
    rewrite(d, B.BASELINE,
            "git ls-tree -r --name-only 9bcdeaf9bcdeaf9bcdeaf9bcdeaf9bcdeaf9bcde -- corpus/evidence/round42\n")


def m_verdict_typo(d):
    p = os.path.join(d, B.TSV)
    lines = open(p).read().rstrip("\n").split("\n")
    c = lines[0].split("\t")
    c[1] = "presentt"
    lines[0] = "\t".join(c)
    rewrite(d, B.TSV, "\n".join(lines) + "\n")


def m_slice_37(d):
    rewrite(d, B.SLICE, "\n".join(B.SLICE_IDS[:-1]) + "\n")


def m_digest_mismatch(d):
    doc = B.receipt_doc("FORGED")
    doc["note"] = "different bytes, same shape"
    rewrite(d, B.RECEIPT, B.sized_json(doc, 1200))


def m_unparseable(d):
    rewrite(d, B.RECEIPT, b"{" + b"not json" * 200)


W25 = " ".join(B.QUOTE30.split()[:25])
W26 = " ".join(B.QUOTE30.split()[:26])

CASES = [
    ("N1-baseline-no-zero", m_baseline_no_zero, {}),
    ("N2-verdict-typo", m_verdict_typo, {}),
    ("N3a-quote-25-words", lambda d: None, dict(quote=W25)),
    ("N3b-quote-26-words", lambda d: None, dict(quote=W26)),
    ("N4-slice-37", m_slice_37, {}),
    ("N5-digest-mismatch", m_digest_mismatch, {}),
    ("N6-unparseable-receipt", m_unparseable, {}),
]

res = {}
for name, mut, kw in CASES:
    res[name] = case(name, mut, **kw)

with open(os.path.join(S, "results-extra.json"), "w") as f:
    json.dump(res, f, indent=1)

EXPECT = {
    "N1-baseline-no-zero": (1, ["r3-zero-not-recorded"]),
    "N2-verdict-typo": (1, ["r4-verdict-enum"]),
    "N3a-quote-25-words": (0, []),
    "N3b-quote-26-words": (1, ["r2-quote-word-count"]),
    "N4-slice-37": (1, ["r4-slice-size", "r4-ids-extra"]),
    "N5-digest-mismatch": (1, ["r1a-digest-mismatch"]),
    "N6-unparseable-receipt": (1, ["r1a-unparseable"]),
}
print("\n--- expectation check ---")
ok = True
for k, (xe, xf) in EXPECT.items():
    g = res[k]
    m = g["exit"] == xe and g["findings"] == xf
    ok &= m
    print(f"{k}: {'PASS' if m else 'FAIL'} got exit={g['exit']} findings={g['findings']}")
print("\nALL_PASS" if ok else "\nSOME_FAIL")
sys.exit(0 if ok else 1)
