import json, os, subprocess, shutil, pathlib
S = "/fast/scratch/hyaku/tabi-r30/CritC1CasesPinsA"
src = pathlib.Path(S, "clone/scripts/check-release-pins.mjs").read_text()

def variant(name, edits):
    t = src
    for find, repl in edits:
        assert t.count(find) >= 1, (name, find)
        t = t.replace(find, repl, 1)
    p = pathlib.Path(S, "vars", name + ".mjs")
    p.write_text(t)
    return p

CASES = {
 "p2_real_traversal_fixture": [('const odd = "content/public/common/feature..cc";',
                               'const odd = "content/public/../../../etc/passwd";')],
 "trav_false":   [('f.path.includes("..")', 'false')],
 "trav_segment": [('f.path.includes("..")', 'f.path.split("/").includes("..")')],
 "trav_regex":   [('f.path.includes("..")', '/(^|\\/)\\.\\.(\\/|$)/.test(f.path)')],
 "trav_literal": [('f.path.includes("..")', 'f.path.includes("feature..cc")')],
 "f3_false":     [('if (ob === null || nb === null)', 'if (false)')],
 "f1_false":     [('if (!row.tags.includes(f.old_tag))', 'if (false)')],
 "f4_bounds":    [('a < 1 || b < a || b > oldLines.length || !anchorHasRange(row.anchor, a, b)',
                   '!anchorHasRange(row.anchor, a, b)')],
 "f4_anchor":    [('a < 1 || b < a || b > oldLines.length || !anchorHasRange(row.anchor, a, b)',
                   'a < 1 || b < a || b > oldLines.length')],
 "reason_drift_f3": [('reasons.push(`f3-bytes absent ${label}`)', 'reasons.push(`f3-bytes absent-and-renamed ${label}`)')],
 "reason_other_f3": [('reasons.push(`f3-bytes absent ${label}`)', 'reasons.push(`something else ${label}`)')],
 "reason_other_f2": [('reasons.push(`f2-path-bound ${label}`); continue;', 'reasons.push(`bound-ok ${label}`); continue;')],
}
# combinations: real-traversal fixture on top of a correct guard
real = CASES["p2_real_traversal_fixture"]
combos = {
 "p2_real_plus_trav_segment": real + CASES["trav_segment"],
 "p2_real_plus_trav_false":   real + CASES["trav_false"],
}
paths = {}
for n, e in {**CASES, **combos}.items():
    paths[n] = variant(n, e)
paths["pristine"] = variant("pristine", [])

out = {}
tmp = os.path.join(S, "tmp")
for n, p in paths.items():
    r = subprocess.run(["node", str(p), "--selftest", "--json"], capture_output=True, text=True,
                       env={**os.environ, "TMPDIR": tmp})
    rep = None
    try: rep = json.loads(r.stdout)
    except Exception: pass
    out[n] = {
      "exit": r.returncode,
      "parsed": rep is not None,
      "cases": rep and rep.get("cases"), "passed": rep and rep.get("passed"),
      "failing": [x["id"] for x in rep["results"] if not x["ok"]] if rep else None,
      "reasons_f2": next((x["reasons"] for x in rep["results"] if x["id"]=="f2-dotdot-inside-filename-unresolved"), None) if rep else None,
      "stderr_head": r.stderr.splitlines()[0] if r.stderr else "",
      "stderr_type": next((l for l in r.stderr.splitlines() if "Error" in l), ""),
      "stdout_len": len(r.stdout),
    }
print(json.dumps(out, indent=1))
