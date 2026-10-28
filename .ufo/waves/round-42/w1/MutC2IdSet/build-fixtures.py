#!/usr/bin/env python3
"""Build scratch git fixtures for the C2 r4 id-set mutation probe.

Every fixture repo lives under SCRATCH/fixtures/<name>/ and is committed with
exactly one commit; the checker is then pointed at that commit's sha.
Nothing here writes outside SCRATCH.
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys

SCRATCH = "/fast/scratch/hyaku/tabi-r42/MutC2IdSet"
FIXROOT = os.path.join(SCRATCH, "fixtures")

SLICE_IDS = """S102 S106 S109 S110 S111 S114 S117 S118 S124 S125 S126 S130 S131 S133
S134 S135 S137 S138 S140 S142 S143 S144 S145 S147 S148 S149 S153 S154 S158 S163
S164 S165 S166 S167 S171 S174 S175 S176""".split()

assert len(SLICE_IDS) == 38 and len(set(SLICE_IDS)) == 38, SLICE_IDS

VERDICT_CYCLE = ["present", "absent", "misbound", "partial", "unreachable"]
QUOTE = "A space-separated list of command-line options."


def sha256(b):
    return hashlib.sha256(b).hexdigest()


def w(root, rel, data):
    p = os.path.join(root, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    mode = "wb" if isinstance(data, bytes) else "w"
    with open(p, mode) as f:
        f.write(data if isinstance(data, (bytes, str)) else str(data))
    if isinstance(data, str):
        data = data.encode()
    return data


def git(repo, *args, check=True):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True)
    if check and r.returncode != 0:
        sys.exit(f"git {' '.join(args)} failed in {repo}: {r.stderr}")
    return r


def build(name, rows, evidence_overrides=None, extra_slice=None, tsv_exclude=()):
    repo = os.path.join(FIXROOT, name)
    shutil.rmtree(repo, ignore_errors=True)
    os.makedirs(repo)

    # --- r1a/r1b: receipt + witness, >=1000 bytes, valid JSON objects
    receipt = {"schema": "fixture-receipt", "seed": name, "pad": "r" * 1400}
    witness = {"schema": "fixture-witness", "seed": name, "pad": "w" * 1400}
    rb = w(repo, "corpus/evidence/round41/playwright-egress/receipt.json",
           json.dumps(receipt, indent=1) + "\n")
    wb = w(repo, "corpus/evidence/round41/playwright-egress/receipt.witness.json",
           json.dumps(witness, indent=1) + "\n")
    measure = {
        "schema": "fixture-measure",
        "receiptSha256": sha256(rb),
        "witnessSha256": sha256(wb),
    }
    w(repo, ".ufo/waves/round-41/measure/c1-measure.json",
      json.dumps(measure, indent=1) + "\n")

    # --- r2: SOURCES.md rows; teaches = cell 7, status = cell 8
    def row(sid, teaches, status):
        cells = [sid, "Node.js CLI documentation — https://nodejs.org/docs/latest-v24.x/api/cli.html",
                 "docs", "A", "fixture scope", "§NODE_OPTIONS, fixture anchor",
                 teaches, status, "2026-10-28", "on-release", "fixture"]
        return "| " + " | ".join(cells) + " |"

    sources = "\n".join([
        "# SOURCES (fixture)",
        "",
        "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |",
        "|---|---|---|---|---|---|---|---|---|---|---|",
        row("S146", "A space-separated list of command-line options.", "rejected"),
        row("S148", "supersedes S146 — " + QUOTE, "mined"),
        "",
    ])
    w(repo, "corpus/SOURCES.md", sources)

    # --- staged source copy carrying the verbatim quote
    w(repo, ".ufo/waves/round-41/sources/node-cli-v24.21.0.html",
      "<html><body><h2>NODE_OPTIONS=options...</h2>\n<p>" + QUOTE + "</p></body></html>\n")

    # --- r3: baseline noop control records ls-tree and a zero
    w(repo, ".ufo/waves/round-41/controls/c1-baseline-noop.out",
      "# fixture baseline control\n"
      "#   git -C <fixture> ls-tree -r --name-only <rev> -- corpus/evidence/round41 | wc -l\n"
      "0\n")

    # --- r4 inputs
    slice_ids = list(SLICE_IDS) + list(extra_slice or [])
    w(repo, ".ufo/waves/round-42/quarantine/slice-ids.txt",
      "\n".join(SLICE_IDS) + "\n")

    evidence_overrides = evidence_overrides or {}
    committed_rows = [r for r in rows if r[0] not in tsv_exclude]
    for i, (sid, verdict) in enumerate(committed_rows):
        ev = f".ufo/waves/round-42/evidence/{sid}.md"
        if sid in evidence_overrides:
            w(repo, ev, evidence_overrides[sid])
        else:
            w(repo, ev, (f"# evidence {sid}\n" + (f"fixture evidence body for {sid}\n" * 8)))
        size = len(open(os.path.join(repo, ev), "rb").read())
        if sid not in evidence_overrides:
            assert size >= 200, (sid, size)
    tsv = "".join(f"{sid}\t{verdict}\t.ufo/waves/round-42/evidence/{sid}.md\n"
                  for sid, verdict in committed_rows)
    w(repo, ".ufo/waves/round-42/quarantine/re-adjudication.tsv", tsv)

    # --- commit exactly once
    git(repo, "init", "-q")
    top = git(repo, "rev-parse", "--show-toplevel").stdout.strip()
    if os.path.realpath(top) != os.path.realpath(repo):
        sys.exit(f"toplevel mismatch: {top} != {repo}")
    git(repo, "add", "-A")
    git(repo, "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
        "commit", "-q", "-m", f"fixture {name}")
    rev = git(repo, "rev-parse", "HEAD").stdout.strip()
    return {"name": name, "repo": repo, "rev": rev,
            "rowCount": len(committed_rows), "rows": [r[0] for r in committed_rows]}


def main():
    os.makedirs(FIXROOT, exist_ok=True)
    allrows = [(sid, VERDICT_CYCLE[i % len(VERDICT_CYCLE)]) for i, sid in enumerate(SLICE_IDS)]
    drop5 = ["S102", "S124", "S153", "S171", "S176"]
    rows33 = [r for r in allrows if r[0] not in drop5]
    assert len(rows33) == 33

    fixtures = []
    # F1 primary: TSV carries only 33 of the 38 slice ids; every row otherwise valid
    fixtures.append(build("F1-33of38", rows33))
    # F2 control: complete 38-row TSV, all rows valid
    fixtures.append(build("F2-all38", allrows))
    # F3 control: 33 rows, one verdict outside the enum
    rows_bad_verdict = [(sid, ("present-ish" if sid == "S106" else v)) for sid, v in rows33]
    fixtures.append(build("F3-bad-verdict", rows_bad_verdict))
    # F4 control: 33 rows, one evidence blob below the 200-byte floor
    fixtures.append(build("F4-thin-evidence", rows33,
                          evidence_overrides={"S106": "thin\n"}))

    for f in fixtures:
        f["repo"] = os.path.relpath(f["repo"], SCRATCH)
    with open(os.path.join(SCRATCH, "fixtures.json"), "w") as fh:
        json.dump(fixtures, fh, indent=1)
    print(json.dumps([{k: f[k] for k in ("name", "repo", "rev", "rowCount")} for f in fixtures], indent=1))


if __name__ == "__main__":
    main()
