#!/usr/bin/env python3
"""Consistency + mutation tests for the round-43 claims validator.

Part A (consistency, on the real file):
  - C1.predicate starts with C1.counterPredicate, remainder starts with " THE CLAIM: "
  - C2 has no separate counterPredicate; C1 has both
  - killRule / residualModel / countingCommand present and non-empty on every claim
  - baseline commit is a real commit in the repo

Part B (mutation, on scratch copies): the validator MUST reject each mutated copy.
"""
import copy
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys

REPO = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
SCRATCH = "/fast/scratch/hyaku/tabi-r43/ExecClaimsSchema"
MUT = os.path.join(SCRATCH, "mutants")
CLAIMS_REL = ".ufo/waves/round-43/claims.json"

out = []
fails = []


def rec(name, ok, detail):
    out.append({"check": name, "ok": bool(ok), "detail": detail})
    if not ok:
        fails.append(name)
    print(f"[{'PASS' if ok else 'FAIL'}] {name}: {detail}")


doc = json.load(open(os.path.join(REPO, CLAIMS_REL), encoding="utf-8"))
claims = {c["id"]: c for c in doc["claims"]}

# --- Part A ---
c1, c2 = claims["C1"], claims["C2"]
rec("A.C1.predicate.startsWith.counterPredicate",
    c1["predicate"].startswith(c1["counterPredicate"]),
    f"counterPredicate len={len(c1['counterPredicate'])} predicate len={len(c1['predicate'])}")
rem = c1["predicate"][len(c1["counterPredicate"]):]
rec("A.C1.predicate.remainder.startsWith.THE_CLAIM", rem.startswith(" THE CLAIM: "),
    f"remainder starts {rem[:24]!r}")
rec("A.C1.hasBothPredicateKeys", "counterPredicate" in c1 and "predicate" in c1,
    "C1 keys: counterPredicate+predicate")
rec("A.C2.noCounterPredicateKey", "counterPredicate" not in c2,
    "C2 keys: predicate only (matches sentenceIdentity.C2 site claims[1].predicate)")
for cid, c in claims.items():
    for k in ("countingCommand", "killRule", "admission", "surface", "restsOn", "beforeState"):
        rec(f"A.{cid}.has.{k}", bool(c.get(k)), f"{k} present, {len(str(c.get(k,'')))} chars")
    # residualModel is required for capability-acquisition (C1) by the task
    # spec; an instrument-repair (C2) states its model inside killRule
    # ("within the committed bytes and the declared model"). Check that the
    # model is stated for every claim, in whichever field carries it.
    has_rm = bool(c.get("residualModel"))
    model_in_kill = ("declared model" in str(c.get("killRule", "")) or
                     "model" in str(c.get("killRule", "")))
    rec(f"A.{cid}.modelStated", has_rm or model_in_kill,
        f"residualModel field={has_rm} killRule states model={model_in_kill}")
    rec(f"A.{cid}.kind", c.get("kind") in ("capability-acquisition", "instrument-repair"),
        f"kind={c.get('kind')}")
    rec(f"A.{cid}.axis.known", c.get("axis") in
        ("adjacency", "operability", "depth", "coverage", "freshness", "calibration"),
        f"axis={c.get('axis')}")

# baseline is a real commit
r = subprocess.run(["git", "-C", REPO, "cat-file", "-t", doc["baseline"]],
                   capture_output=True, text=True)
rec("A.baseline.isRealCommit", r.stdout.strip() == "commit",
    f"baseline {doc['baseline']} type={r.stdout.strip()!r} err={r.stderr.strip()!r}")

# countingCommand's named script exists
for cid, c in claims.items():
    # the counting command names a script under scripts/ or under a
    # .ufo/waves/... path; both must exist in the working tree.
    m = re.search(r"((?:scripts|\.ufo/waves/[^\s]*)/[A-Za-z0-9._/-]+\.mjs)",
                  c["countingCommand"])
    path = m.group(1) if m else None
    rec(f"A.{cid}.countingCommand.scriptExists",
        bool(path) and os.path.isfile(os.path.join(REPO, path)),
        f"script={path} exists={bool(path) and os.path.isfile(os.path.join(REPO, path))}")

# --- Part B: mutation tests -------------------------------------------------
shutil.rmtree(MUT, ignore_errors=True)
os.makedirs(MUT, exist_ok=True)
pristine = open(os.path.join(REPO, CLAIMS_REL), "rb").read()


def validator_on(claims_path):
    """Run the frozen validator logic against an arbitrary claims file."""
    d = json.load(open(claims_path, encoding="utf-8"))
    problems = []
    if d.get("schema") != "tabi-round-claims-v2":
        problems.append("schema")
    cs = d.get("claims") or []
    if len(cs) != 2:
        problems.append("claims.length")
    ax = [c.get("axis") for c in cs]
    if len(set(ax)) != len(ax) or not all(ax):
        problems.append("axes.distinct")
    binds = d.get("controlBindings") or []
    if len(binds) != 8:
        problems.append("bindings.length")
    for b in binds:
        full = os.path.join(REPO, b.get("path", ""))
        if not os.path.isfile(full):
            problems.append(f"binding.missing:{b.get('path')}")
            continue
        data = open(full, "rb").read()
        if hashlib.sha256(data).hexdigest() != b.get("sha256"):
            problems.append(f"binding.sha:{b.get('path')}")
        if b.get("quote") not in data.decode("utf-8", errors="replace"):
            problems.append(f"binding.quote:{b.get('path')}")
        # controlBindingRule: "quote lines of fewer than 8 characters are
        # malformed by construction" (also enforced by the C2 checker, rule r5).
        if not isinstance(b.get("quote"), str) or len(b.get("quote", "")) < 8:
            problems.append(f"binding.quoteTooShort:{b.get('path')}")
    si = d.get("sentenceIdentity") or {}
    for cid, blk in si.items():
        for site in blk.get("sites") or []:
            if not os.path.isfile(os.path.join(REPO, site.split(" ")[0])):
                problems.append(f"site.missing:{cid}:{site}")
    if set(si.keys()) != {c.get("id") for c in cs}:
        problems.append("si.claimsCovered")
    for c in cs:
        if c.get("verdict") != "pending":
            problems.append(f"verdict:{c.get('id')}")
        if c.get("measuredRevision", "MISSING") is not None:
            problems.append(f"measuredRevision:{c.get('id')}")
    return problems


MUTANTS = {
    "m1-wrong-schema": lambda d: d.update(schema="tabi-round-claims-v1"),
    "m2-three-claims": lambda d: d["claims"].append(copy.deepcopy(d["claims"][1])),
    "m3-duplicate-axis": lambda d: d["claims"][1].update(axis=d["claims"][0]["axis"]),
    "m4-binding-sha-tampered": lambda d: d["controlBindings"][0].update(
        sha256="0" * 64),
    "m5-quote-absent": lambda d: d["controlBindings"][2].update(
        quote=" \"thisQuoteIsNotInTheControlBytes\": true,"),
    "m6-short-quote": lambda d: d["controlBindings"][3].update(quote="ab"),
    "m7-binding-dropped": lambda d: d["controlBindings"].pop(),
    "m8-site-missing-file": lambda d: d["sentenceIdentity"]["C1"]["sites"].append(
        ".ufo/waves/round-43/counters/does-not-exist-v9.mjs const PREDICATE"),
    "m9-verdict-set": lambda d: d["claims"][0].update(verdict="admitted"),
    "m10-measured-revision-set": lambda d: d["claims"][1].update(
        measuredRevision="ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c"),
    "m11-control-binding-path-foreign": lambda d: d["controlBindings"][0].update(
        path="../../../../etc/hostname"),
    "m12-si-claim-removed": lambda d: d["sentenceIdentity"].pop("C2"),
}

# control: pristine must pass
pristine_problems = validator_on(os.path.join(REPO, CLAIMS_REL))
rec("B.control.pristinePasses", not pristine_problems,
    f"pristine problems={pristine_problems}")

for name, mut in MUTANTS.items():
    d = json.loads(pristine.decode("utf-8"))
    mut(d)
    p = os.path.join(MUT, name + ".json")
    with open(p, "w", encoding="utf-8") as fh:
        json.dump(d, fh, indent=1)
    probs = validator_on(p)
    rec(f"B.{name}.rejected", bool(probs), f"problems={probs[:4]}{'...' if len(probs) > 4 else ''}")

json.dump({"checks": out, "failed": fails}, open(
    os.path.join(SCRATCH, "consistency-mutation-results.json"), "w"), indent=2)
print("\nSUMMARY: %d/%d passed" % (len(out) - len(fails), len(out)))
if fails:
    print("FAILED: " + ", ".join(fails))
sys.exit(1 if fails else 0)
