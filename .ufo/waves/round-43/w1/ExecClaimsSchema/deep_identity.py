#!/usr/bin/env python3
"""Deeper identity checks for round-43 claims.json:
   - PREDICATE const literal in each counter == claims.json sentence (exact equality)
   - header PREDICATE-SENTENCE comment == same sentence (exact equality)
   - control files: working-tree sha256 == committed blob bytes at frozen commit 7ca6f018
   - claims.json committed blob at frozen commit == working-tree bytes
"""
import hashlib
import json
import os
import re
import subprocess
import sys

REPO = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
FROZEN = "7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc"
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

SPEC = {
    "C1": {
        "sentence_key": "counterPredicate",
        "counter_rel": ".ufo/waves/round-43/counters/c1-signature-bound-v5.mjs",
    },
    "C2": {
        "sentence_key": "predicate",
        "counter_rel": ".ufo/waves/round-43/counters/check-routed-defects-round43.mjs",
    },
}

for cid, spec in SPEC.items():
    sentence = claims[cid][spec["sentence_key"]]
    ctext = open(os.path.join(REPO, spec["counter_rel"]), encoding="utf-8").read()

    # const PREDICATE = '...'  (single-quoted JS literal, no embedded quote issues expected)
    m = re.search(r"^const PREDICATE = '(.*)';$", ctext, re.M)
    rec(f"{cid}.constPREDICATE.present", m is not None,
        f"const PREDICATE literal found in {spec['counter_rel']}")
    if m:
        const_val = m.group(1)
        rec(f"{cid}.constPREDICATE.equals.claimsSentence", const_val == sentence,
            f"len(const)={len(const_val)} len(claims)={len(sentence)} "
            f"sha(const)={hashlib.sha256(const_val.encode()).hexdigest()[:16]} "
            f"sha(claims)={hashlib.sha256(sentence.encode()).hexdigest()[:16]}")

    # header comment: // PREDICATE-SENTENCE: <sentence>
    hm = re.search(r"^// PREDICATE-SENTENCE: (.*)$", ctext, re.M)
    rec(f"{cid}.headerPREDICATE.present", hm is not None,
        f"PREDICATE-SENTENCE header comment found in {spec['counter_rel']}")
    if hm:
        hval = hm.group(1)
        rec(f"{cid}.headerPREDICATE.equals.claimsSentence", hval == sentence,
            f"len(header)={len(hval)} len(claims)={len(sentence)} "
            f"sha(header)={hashlib.sha256(hval.encode()).hexdigest()[:16]} "
            f"sha(claims)={hashlib.sha256(sentence.encode()).hexdigest()[:16]}")

# control files: committed blob at FROZEN vs working tree
for b in doc["controlBindings"]:
    rel = b["path"]
    wt = open(os.path.join(REPO, rel), "rb").read()
    wtsha = hashlib.sha256(wt).hexdigest()
    try:
        blob = subprocess.run(["git", "-C", REPO, "rev-parse", f"{FROZEN}:{rel}"],
                              capture_output=True, text=True, check=True).stdout.strip()
        csha = hashlib.sha256(subprocess.run(
            ["git", "-C", REPO, "cat-file", "blob", blob],
            capture_output=True, check=True).stdout).hexdigest()
        ctype = subprocess.run(["git", "-C", REPO, "cat-file", "-t", blob],
                               capture_output=True, text=True, check=True).stdout.strip()
    except subprocess.CalledProcessError as e:
        blob, csha, ctype = None, None, f"error:{e.returncode}"
    rec(f"control.committed@freeze[{rel}]",
        ctype == "blob" and csha == b["sha256"] == wtsha,
        f"type={ctype} sha(committed)={csha} sha(worktree)={wtsha} sha(claims)={b['sha256']}")

# duplicate path check across controlBindings
paths = [b["path"] for b in doc["controlBindings"]]
rec("controlBindings.paths.unique", len(set(paths)) == len(paths),
    f"{len(paths)} entries, {len(set(paths))} unique")

# claims.json itself committed at freeze == worktree
wt = open(os.path.join(REPO, CLAIMS_REL), "rb").read()
blob = subprocess.run(["git", "-C", REPO, "rev-parse", f"{FROZEN}:{CLAIMS_REL}"],
                      capture_output=True, text=True, check=True).stdout.strip()
csha = hashlib.sha256(subprocess.run(["git", "-C", REPO, "cat-file", "blob", blob],
                                     capture_output=True, check=True).stdout).hexdigest()
rec("claims.json.committed@freeze==worktree",
    csha == hashlib.sha256(wt).hexdigest(), f"blob={blob} sha(committed)={csha}")

# no control binding points at a file outside .ufo/waves/round-43/controls/
outside = [p for p in paths if not p.startswith(".ufo/waves/round-43/controls/")]
rec("controlBindings.allUnderControlsDir", not outside, f"outside={outside}")

# every control file named anywhere in claims text is bound? (coverage of the freeze)
text_all = json.dumps(doc)
named = set(re.findall(r"\.ufo/waves/round-43/controls/[A-Za-z0-9._-]+", text_all))
unbound = sorted(named - set(paths))
rec("controls.namedInClaims.allBound", not unbound, f"unbound={unbound}")

json.dump({"checks": out, "failed": fails}, open(
    "/fast/scratch/hyaku/tabi-r43/ExecClaimsSchema/deep-results.json", "w"), indent=2)
print("\nDEEP SUMMARY: %d/%d passed" % (len(out) - len(fails), len(out)))
sys.exit(1 if fails else 0)
