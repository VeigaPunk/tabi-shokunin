#!/usr/bin/env python3
"""Run pristine (lane bytes, read-only) and mutant checkers over each fixture."""
import json
import os
import subprocess

SCRATCH = "/fast/scratch/hyaku/tabi-r42/MutC2IdSet"
PRISTINE = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs"
MUTANT = os.path.join(SCRATCH, "check-mutant.mjs")
OUT = os.path.join(SCRATCH, "out")

fixtures = json.load(open(os.path.join(SCRATCH, "fixtures.json")))
os.makedirs(OUT, exist_ok=True)
results = []
for f in fixtures:
    for variant, script in (("pristine", PRISTINE), ("mutant", MUTANT)):
        cmd = ["node", script, "--rev", f["rev"], "--repo", f["repo"], "--json"]
        p = subprocess.run(cmd, capture_output=True, text=True, cwd=SCRATCH)
        tag = f"{f['name']}.{variant}"
        with open(os.path.join(OUT, tag + ".stdout.json"), "w") as fh:
            fh.write(p.stdout)
        with open(os.path.join(OUT, tag + ".stderr.txt"), "w") as fh:
            fh.write(p.stderr)
        with open(os.path.join(OUT, tag + ".exit"), "w") as fh:
            fh.write(str(p.returncode) + "\n")
        with open(os.path.join(OUT, tag + ".cmd"), "w") as fh:
            fh.write(" ".join(cmd) + "\n")
        try:
            doc = json.loads(p.stdout)
        except Exception:
            doc = {"predicate": None, "findings": [], "parse_error": p.stdout[:200]}
        results.append({
            "fixture": f["name"], "rev": f["rev"], "variant": variant,
            "script": script, "exit": p.returncode,
            "predicate": doc.get("predicate"),
            "findingCount": doc.get("findingCount"),
            "findingIds": [x["id"] for x in doc.get("findings", [])],
            "findings": doc.get("findings", []),
            "stderr": p.stderr.strip(),
        })
json.dump(results, open(os.path.join(SCRATCH, "matrix.json"), "w"), indent=1)

print(f"{'fixture':<18} {'variant':<9} {'exit':<4} {'pred':<5} findings")
for r in results:
    print(f"{r['fixture']:<18} {r['variant']:<9} {r['exit']:<4} {str(r['predicate']):<5} "
          f"{','.join(r['findingIds']) or '(none)'}")
