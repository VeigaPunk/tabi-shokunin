#!/usr/bin/env python3
"""Build scratch git fixtures for the C2 verdict-enum mutation probe.

fixture A: R1+R2+R3 fully satisfied; R4 38 rows, exactly 5 rows carry verdict `ok`
           (outside the frozen enum) -> pristine checker MUST refuse with 5x r4-verdict-enum.
fixture B: control; identical but all 38 verdicts are inside the enum -> pristine exits 0.
           Proves A's refusal is caused solely by the 5 tokens, not by another fixture defect.
"""
import hashlib
import json
import os
import subprocess
import sys

ROOT = "/fast/scratch/hyaku/tabi-r42/MutC2Enum"

SLICE_IDS = """S102
S106
S109
S110
S111
S114
S117
S118
S124
S125
S126
S130
S131
S133
S134
S135
S137
S138
S140
S142
S143
S144
S145
S147
S148
S149
S153
S154
S158
S163
S164
S165
S166
S167
S171
S174
S175
S176""".split("\n")

ENUM = ["present", "absent", "misbound", "partial", "unreachable"]
BAD_ROWS = {0, 7, 15, 26, 33}  # 5 rows -> verdict `ok`

QUOTE = "The CLI now reports loopback sockets per process"


def git(d, *args, **kw):
    return subprocess.run(["git", "-C", d, *args], check=kw.get("check", True),
                          capture_output=True, text=True)


def build(name, bad_rows):
    d = os.path.join(ROOT, name)
    subprocess.run(["rm", "-rf", d], check=True)
    os.makedirs(d)
    toplevel = git(d, "init", "-q")  # init first
    git(d, "init", "-q", check=False)
    top = git(d, "rev-parse", "--show-toplevel").stdout.strip()
    assert top == os.path.realpath(d) == d, f"toplevel {top!r} != {d!r}"
    print(f"[{name}] toplevel-ok {top}")

    def put(rel, data):
        p = os.path.join(d, rel)
        os.makedirs(os.path.dirname(p) or d, exist_ok=True)
        if isinstance(data, str):
            data = data.encode()
        with open(p, "wb") as f:
            f.write(data)
        return data

    # --- R1: receipt + witness (>=1000 bytes, JSON) bound by measure record
    receipt = json.dumps({
        "schema": "fixture-r41-receipt", "nonce": "fixture-nonce-c2enum",
        "runs": [{"run": 1, "browser": "firefox", "sockets": 2},
                 {"run": 2, "browser": "firefox", "sockets": 2}],
        "padding": "x" * 1400,
    }, indent=1).encode()
    witness = json.dumps({
        "schema": "fixture-r41-witness", "nonce": "fixture-nonce-c2enum",
        "independent": True, "padding": "y" * 1200,
    }, indent=1).encode()
    measure = json.dumps({
        "schema": "fixture-c1-measure",
        "receiptSha256": hashlib.sha256(receipt).hexdigest(),
        "witnessSha256": hashlib.sha256(witness).hexdigest(),
    }, indent=1)
    put("corpus/evidence/round41/playwright-egress/receipt.json", receipt)
    put("corpus/evidence/round41/playwright-egress/receipt.witness.json", witness)
    put(".ufo/waves/round-41/measure/c1-measure.json", measure)

    # --- R2: S146 rejected, S148 `supersedes S146` + verbatim quote from staged html
    put(".ufo/waves/round-41/sources/node-cli-v24.21.0.html",
        f"<html><body><h2>net</h2><p>{QUOTE}</p></body></html>\n")
    sources = "\n".join([
        "# SOURCES",
        "| id | register | publisher | kind | opened | slug | teaches | status |",
        "| S146 | node-cli | Node.js | docs | 2026-10-27 | cli-quote | old non-verbatim quote | rejected |",
        f"| S148 | node-cli | Node.js | docs | 2026-10-28 | cli-sockets | supersedes S146 \u2014 {QUOTE} | accepted |",
        "",
    ])
    put("corpus/SOURCES.md", sources)

    # --- R3: baseline control records the ls-tree command and the digit 0
    put(".ufo/waves/round-41/controls/c1-baseline-noop.out",
        "git ls-tree -r --name-only 34e177959d1b7ce04afb85a001420e02631ce79e -- corpus/evidence/round42 | wc -l\n0\n")

    # --- R4: slice ids, 38-row tsv, evidence blobs >=200 bytes
    put(".ufo/waves/round-42/quarantine/slice-ids.txt", "\n".join(SLICE_IDS) + "\n")
    rows = []
    for i, sid in enumerate(SLICE_IDS):
        verdict = "ok" if i in bad_rows else ENUM[i % len(ENUM)]
        ev = f"corpus/evidence/round42/quarantine/ev-{sid}.txt"
        body = (f"staged_id: {sid}\nverdict: {verdict}\n"
                + ("evidence padding for the r4 committed-blob size floor. " * 5)
                + "\n")
        assert len(body.encode()) >= 200, (sid, len(body.encode()))
        put(ev, body)
        rows.append(f"{sid}\t{verdict}\t{ev}")
    put(".ufo/waves/round-42/quarantine/re-adjudication.tsv", "\n".join(rows) + "\n")

    git(d, "add", "-A")
    git(d, "-c", "user.email=seat@fixture", "-c", "user.name=seat",
        "commit", "-q", "-m", f"{name}: fixture")
    rev = git(d, "rev-parse", "HEAD").stdout.strip()
    assert len(rev) == 40
    print(f"[{name}] rev {rev}")
    # byte-identity receipt for the record
    print(f"[{name}] files " + str(len(git(d, "ls-tree", "-r", "--name-only", "HEAD").stdout.splitlines())))
    return d, rev


if __name__ == "__main__":
    a = build("fixtureA", BAD_ROWS)
    b = build("fixtureB-control", set())
    json.dump({"fixtureA": {"dir": a[0], "rev": a[1]},
               "fixtureB": {"dir": b[0], "rev": b[1]}},
              open(os.path.join(ROOT, "fixtures.json"), "w"), indent=1)
    print("wrote fixtures.json")
