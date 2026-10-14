#!/usr/bin/env python3
"""Cross-run comparison: PNG artifacts (sha256/bytes/WxH) + state fields."""
import json, sys, hashlib, struct, os

def png_dims(p):
    with open(p, 'rb') as f:
        head = f.read(24)
    assert head[:8] == b'\x89PNG\r\n\x1a\n', p
    w, h = struct.unpack('>II', head[16:24])
    return w, h

def art_summary(p):
    b = open(p, 'rb').read()
    w, h = png_dims(p)
    return {"file": os.path.basename(p), "sha256": hashlib.sha256(b).hexdigest(),
            "bytes": len(b), "WxH": f"{w}x{h}"}

runs = []
for run_dir in sys.argv[1:]:
    cj = os.path.join(run_dir, 'capture.json')
    with open(cj) as f:
        cap = json.load(f)
    entry = {"run": os.path.basename(run_dir), "ok": cap.get("ok"),
             "artifacts": [art_summary(os.path.join(run_dir, a["tag"] + ".png"))
                           for a in cap.get("artifacts", [])],
             "state": cap.get("state"),
             "actionPairDiffers": cap.get("actionPairDiffers")}
    runs.append(entry)

out = {"runs": runs}
if len(runs) == 2:
    a, b = runs
    same_sha = {x["file"]: y["sha256"] for x, y in zip(a["artifacts"], b["artifacts"])} if \
        len(a["artifacts"]) == len(b["artifacts"]) else {}
    cmp = {}
    for x, y in zip(a["artifacts"], b["artifacts"]):
        cmp[x["file"]] = {
            "sha_equal_across_runs": x["sha256"] == y["sha256"],
            "dims_equal": x["WxH"] == y["WxH"],
        }
    out["cross_run"] = cmp
    # per-run within-run idempotence (c1 vs c2)
    for r in runs:
        arts = {a["file"]: a for a in r["artifacts"]}
        if "det-before-c1.png" in arts and "det-before-c2.png" in arts:
            out.setdefault("within_run_idempotence", {})[r["run"]] = \
                arts["det-before-c1.png"]["sha256"] == arts["det-before-c2.png"]["sha256"]
    out["action_pair_differs_both_runs"] = [r["actionPairDiffers"] for r in runs]
    out["state_url_equals_input"] = [r["state"].get("urlEqualsNavigatedInput") for r in runs]
    out["dom_node_count_both"] = [r["state"].get("domNodeCount") for r in runs]
print(json.dumps(out, indent=2))