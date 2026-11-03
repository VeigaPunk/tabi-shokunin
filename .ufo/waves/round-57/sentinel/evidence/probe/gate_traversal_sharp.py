#!/usr/bin/env python3
"""Sentinel: SHARP traversal test for check-cited-receipts-v2.mjs.

The property under test is precise:
  (P1) NO token containing '..' is ever RESOLVED (the finding carries
       resolved: null and the gate reports id relative-citation-traversal).
  (P2) NO resolved path lies OUTSIDE .ufo/waves/round-<N>/.
  (P3) A token that names a file which EXISTS OUTSIDE the round dir is NOT
       treated as 'present' (the gate must not silently accept it).
  (P4) v1 semantics on full-prefix tokens are unchanged (differential).
"""
import json, os, re, subprocess, sys

REPO = sys.argv[1]
GATE = sys.argv[2]
V1 = sys.argv[3]
ROUND = sys.argv[4]
DOC = sys.argv[5]

ROUNDDIR = ".ufo/waves/round-%s/" % ROUND


def run(gate, args):
    p = subprocess.run(["node", gate] + args, capture_output=True, text=True, timeout=180)
    return p.returncode, p.stdout, p.stderr


rc, out, err = run(GATE, ["--repo", REPO, "--round", ROUND, "--doc", DOC, "--json"])
d = json.loads(out)

print("=== gate v2 on the hostile fixture ===")
print("exit:", rc, " schema:", d.get("schema"))
print("checked(full-prefix):", d.get("checked"), " relativeChecked:", d.get("relativeChecked"),
      " otherRoundTokens:", d.get("otherRoundTokens"))
print()
for f in d.get("findings", []):
    print("  id=%-28s kind=%-16s path=%-52s resolved=%s line=%s"
          % (f.get("id"), f.get("kind"), f.get("path"), f.get("resolved"), f.get("line")))

print()
print("=== P1: every '..'-bearing token must be reported as traversal with resolved=null ===")
p1_fail = []
for f in d.get("findings", []):
    if ".." in (f.get("path") or ""):
        if f.get("id") != "relative-citation-traversal" or f.get("resolved") is not None:
            p1_fail.append(f)
# a '..' token that produced NO finding at all is also a failure (silent accept)
seen_paths = {f.get("path") for f in d.get("findings", [])}
doc = subprocess.run(["git", "-C", REPO, "show", DOC], capture_output=True, text=True).stdout
for line in doc.split("\n"):
    for tok in re.findall(r"[A-Za-z0-9._/-]*\.\.[A-Za-z0-9._/-]*", line):
        if not tok.startswith(".ufo/waves/"):
            if tok not in seen_paths:
                p1_fail.append({"path": tok, "why": "no finding at all (silent accept)"})
print("P1 violations:", p1_fail if p1_fail else "NONE")
print("P1:", "FAIL" if p1_fail else "PASS")

print()
print("=== P2: no resolved path may lie outside the round dir ===")
p2_fail = []
for f in d.get("findings", []):
    r = f.get("resolved")
    if r is None:
        continue
    if not r.startswith(ROUNDDIR):
        p2_fail.append(f)
print("P2 violations:", p2_fail if p2_fail else "NONE")
print("P2:", "FAIL" if p2_fail else "PASS")

print()
print("=== P3: the OUTSIDE decoy must NOT be treated as present ===")
# .ufo/waves/round-57/measure/../SECRET-OUTSIDE-ROUND.json would name the decoy
# at the repo root. Any spelling of it must be refused, never silently accepted.
decoy_accepted = []
for f in d.get("findings", []):
    r = f.get("resolved")
    if r and "SECRET-OUTSIDE-ROUND" in r:
        decoy_accepted.append(f)
print("decoy resolved anywhere:", decoy_accepted if decoy_accepted else "NONE")
print("P3:", "FAIL" if decoy_accepted else "PASS")

print()
print("=== P4: differential v1 vs v2 on full-prefix tokens ===")
rc1, out1, err1 = run(V1, ["--repo", REPO, "--round", ROUND, "--doc", DOC, "--json"])
d1 = json.loads(out1)
v1_paths = sorted({f["path"] for f in d1.get("findings", [])})
v2_full = sorted({f["path"] for f in d.get("findings", []) if f.get("id") == "full-prefix-citation-missing"})
print("v1 findings:", v1_paths)
print("v2 full-prefix findings:", v2_full)
print("v1 == v2 on full-prefix:", "PASS" if v1_paths == v2_full else "FAIL")
print("v2 relative-only findings (the NEW widening):")
for f in d.get("findings", []):
    if f.get("id") != "full-prefix-citation-missing":
        print("   ", f.get("id"), f.get("path"))
