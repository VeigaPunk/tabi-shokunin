#!/usr/bin/env python3
"""Build the round-42 checker negative-surface selftest fixtures and run the
REAL pristine checker (lane bytes, read-only) against each.

Cases:
  F1  38 valid TSV rows, 5 evidence blobs absent  -> r4-evidence-absent x5
  F2  TSV with one duplicated id (39 rows)        -> r4-duplicate-ids
  F3  receipt 500 B + tiny witness + self-authored measure -> r1a/r1b-too-small
  F4  S148 quote = 30 invented words (in html too) -> r2-quote-word-count
  F4b same 30-word quote NOT in html (compound)   -> word-count + not-verbatim
  F5  clean full fixture (arbitrary but genuine repairs) -> exit 0, predicate true
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile

S = "/fast/scratch/hyaku/tabi-r42/ExecSelftestSynthetic"
FIXROOT = os.path.join(S, "fixture")
CHECKER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs"

SLICE_IDS = """S102 S106 S109 S110 S111 S114 S117 S118 S124 S125 S126 S130 S131
S133 S134 S135 S137 S138 S140 S142 S143 S144 S145 S147 S148 S149 S153 S154
S158 S163 S164 S165 S166 S167 S171 S174 S175 S176""".split()
assert len(SLICE_IDS) == 38, len(SLICE_IDS)
VERDICTS = ["present", "absent", "misbound", "partial", "unreachable"]

CLEAN_QUOTE = "A space-separated list of command-line options."
QUOTE30 = ("alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi "
           "omicron pi rho sigma tau upsilon phi chi psi omega one two three four five six")
assert len(QUOTE30.split()) == 30, len(QUOTE30.split())

RECEIPT = "corpus/evidence/round41/playwright-egress/receipt.json"
WITNESS = "corpus/evidence/round41/playwright-egress/receipt.witness.json"
MEASURE = ".ufo/waves/round-41/measure/c1-measure.json"
SOURCES = "corpus/SOURCES.md"
STAGED_HTML = ".ufo/waves/round-41/sources/node-cli-v24.21.0.html"
BASELINE = ".ufo/waves/round-41/controls/c1-baseline-noop.out"
TSV = ".ufo/waves/round-42/quarantine/re-adjudication.tsv"
SLICE = ".ufo/waves/round-42/quarantine/slice-ids.txt"


def sized_json(obj, target):
    """Serialize obj to exactly `target` bytes by adjusting a pad key."""
    obj = dict(obj)
    obj["pad"] = ""
    for _ in range(400):
        s = json.dumps(obj, separators=(",", ":"))
        diff = target - len(s)
        if diff == 0:
            return s.encode()
        p = obj.get("pad", "")
        newlen = max(0, len(p) + diff)
        if newlen == len(p):
            break
        obj["pad"] = "x" * newlen
    raise SystemExit(f"could not size json to {target}: got {len(s)}")


def receipt_doc(tag):
    return {
        "schema": "tabi-r41-c1-receipt",
        "round": 41,
        "nonce": hashlib.sha256(tag.encode()).hexdigest(),
        "runs": [{"run": 1, "driverExit": 0, "counterExit": 0, "nonceMatches": True}],
        "note": "selftest fixture, arbitrary bytes, no browser run",
    }


def w(d, rel, data):
    p = os.path.join(d, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    if isinstance(data, str):
        data = data.encode()
    with open(p, "wb") as f:
        f.write(data)
    return len(data)


def sources_md(quote):
    h = "| id | source | type | grade | summary | location | teaches | status | date | channel | pointer |\n"
    h += "|----|--------|------|-------|---------|----------|---------|--------|------|---------|---------|\n"
    s146 = ("| S146 | Node.js CLI documentation — https://nodejs.org/docs/latest-v24.x/api/cli.html "
            "| docs | A | the `NODE_OPTIONS` loader channel "
            "| §`NODE_OPTIONS=options...`, opened 2026-10-28 "
            "| A space-separated list of command-line options "
            "| rejected | 2026-10-28 | on-release | corpus/lessons/round-42.md |\n")
    s148 = ("| S148 | Node.js CLI documentation — https://nodejs.org/docs/latest-v24.x/api/cli.html "
            "| docs | A | supersedes S146, quote corrected to a verbatim substring "
            "| §`NODE_OPTIONS=options...`, node v24.21.0 docs; opened 2026-10-28 "
            f"| supersedes S146 — {quote} "
            "| mined | 2026-10-28 | on-release | corpus/knowledge/round-41.md |\n")
    return h + s146 + s148


def build(d, *, missing_evidence=(), dup_id=False, receipt_target=1200,
          witness_target=1100, quote=CLEAN_QUOTE, html_has_quote=True):
    rec = sized_json(receipt_doc("receipt"), receipt_target)
    wit = sized_json(receipt_doc("witness"), witness_target)
    w(d, RECEIPT, rec)
    w(d, WITNESS, wit)
    measure = {
        "schema": "tabi-r41-c1-measure",
        "out": RECEIPT,
        "witness": WITNESS,
        "receiptSha256": hashlib.sha256(rec).hexdigest(),
        "witnessSha256": hashlib.sha256(wit).hexdigest(),
        "driverExit": 0,
        "counterExit": 0,
    }
    w(d, MEASURE, json.dumps(measure, indent=1))
    html = "<html><body><h1>node cli</h1><pre><code>\n"
    if html_has_quote:
        html += quote + "\n"
    html += "</code></pre><p>A space-separated list of command-line options.</p></body></html>\n"
    w(d, STAGED_HTML, html)
    w(d, SOURCES, sources_md(quote))
    w(d, BASELINE,
      "git ls-tree -r --name-only 34e177959d1b7ce04afb85a001420e02631ce79e -- corpus/evidence/round42\n"
      "0\n")
    w(d, SLICE, "\n".join(SLICE_IDS) + "\n")
    rows = []
    for i, sid in enumerate(SLICE_IDS):
        seat = f"QuarR42{i:02d}"
        ev = f".ufo/waves/round-42/w1/{seat}/evidence-{sid}.txt"
        if sid not in missing_evidence:
            body = (f"staged id: {sid}\nseat: {seat}\nverdict: {VERDICTS[i % 5]}\n"
                    f"observed: fixture evidence blob for {sid}, arbitrary bytes, "
                    "padded to exceed the 200-byte committed-blob floor for the r4 check.\n")
            body += "pad " + "y" * 160 + "\n"
            assert len(body.encode()) >= 200, (sid, len(body))
            w(d, ev, body)
        rows.append(f"{sid}\t{VERDICTS[i % 5]}\t{ev}")
    if dup_id:
        rows.append(rows[0])
    w(d, TSV, "\n".join(rows) + "\n")


def gitify(d):
    env = dict(os.environ, GIT_AUTHOR_NAME="selftest", GIT_AUTHOR_EMAIL="selftest@fixture.invalid",
               GIT_COMMITTER_NAME="selftest", GIT_COMMITTER_EMAIL="selftest@fixture.invalid",
               GIT_CONFIG_GLOBAL="/dev/null", GIT_CONFIG_SYSTEM="/dev/null")
    subprocess.run(["git", "init", "-q", "-b", "main", d], check=True, env=env)
    top = subprocess.run(["git", "-C", d, "rev-parse", "--show-toplevel"],
                         check=True, capture_output=True, text=True, env=env).stdout.strip()
    assert os.path.realpath(top) == os.path.realpath(d), (top, d)
    subprocess.run(["git", "-C", d, "add", "-A"], check=True, env=env)
    subprocess.run(["git", "-C", d, "commit", "-q", "-m", "selftest fixture"],
                   check=True, env=env)
    head = subprocess.run(["git", "-C", d, "rev-parse", "HEAD"],
                          check=True, capture_output=True, text=True, env=env).stdout.strip()
    assert len(head) == 40, head
    return head


def run_checker(rev, d):
    r = subprocess.run(["node", CHECKER, "--rev", rev, "--repo", d, "--json"],
                       capture_output=True, text=True)
    try:
        doc = json.loads(r.stdout)
    except Exception:
        doc = {"unparsed": r.stdout, "stderr": r.stderr}
    return {
        "exit": r.returncode,
        "predicate": doc.get("predicate"),
        "findingCount": doc.get("findingCount"),
        "findings": [f["id"] if isinstance(f, dict) else f
                     for f in (doc.get("findings") or [])],
        "raw": doc if r.returncode not in (0, 1) else None,
        "stderr": r.stderr.strip()[:400],
    }


CASES = [
    ("F1", dict(missing_evidence=SLICE_IDS[:5])),
    ("F2", dict(dup_id=True)),
    ("F3", dict(receipt_target=500, witness_target=300)),
    ("F4", dict(quote=QUOTE30, html_has_quote=True)),
    ("F4b", dict(quote=QUOTE30, html_has_quote=False)),
    ("F5", dict()),
]

def main():
    os.makedirs(FIXROOT, exist_ok=True)
    results = {}
    for name, kw in CASES:
        d = tempfile.mkdtemp(prefix=name + ".", dir=FIXROOT)
        build(d, **kw)
        head = gitify(d)
        res = run_checker(head, d)
        res["fixture"] = d
        res["head"] = head
        results[name] = res
        print(f"{name}: exit={res['exit']} predicate={res['predicate']} "
              f"count={res['findingCount']} findings={res['findings']} head={head[:12]}")
    with open(os.path.join(S, "results.json"), "w") as f:
        json.dump(results, f, indent=1)

    expect = {
        "F1": (1, ["r4-evidence-absent"] * 5),
        "F2": (1, ["r4-duplicate-ids"]),
        "F3": (1, ["r1a-too-small", "r1b-too-small"]),
        "F4": (1, ["r2-quote-word-count"]),
        "F4b": (1, ["r2-quote-word-count", "r2-quote-not-verbatim"]),
        "F5": (0, []),
    }
    ok = True
    print("\n--- expectation check ---")
    for name, (xexit, xfind) in expect.items():
        got = results[name]
        match = got["exit"] == xexit and got["findings"] == xfind
        ok &= match
        print(f"{name}: {'PASS' if match else 'FAIL'} expected exit={xexit} "
              f"findings={xfind} | got exit={got['exit']} findings={got['findings']}")
    print("\nALL_PASS" if ok else "\nSOME_FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
