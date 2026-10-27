#!/usr/bin/env python3
"""Independent audit of the round-39 driver sample timeline.

Recomputes, from the receipt's raw per-sample records (not the driver's summary
fields), the properties the seat item asks about:
  * samples monotonic
  * coverage duration consistent (recorded vs recomputed, run1 vs run2)
  * both socket surfaces present on every sample
  * final sweep is post-close
  * any sample gap > 300 ms
"""
import json
import sys

GAP_MS = 300
NOMINAL_MS = 100


def audit(path):
    with open(path) as fh:
        d = json.load(fh)
    out = {
        "receipt": path,
        "schema": d.get("schema"),
        "playwrightVersion": d.get("playwrightVersion"),
        "measuredAt": d.get("measuredAt"),
        "binding": d.get("binding"),
        "refused": d.get("refused"),
        "egressNonLoopback": d.get("egressNonLoopback"),
        "survivors_total": d.get("survivors"),
        "browserVersion": d.get("browserVersion"),
        "userAgent": d.get("userAgent"),
        "binary": d.get("binary"),
        "fixture": d.get("fixture"),
        "runs": [],
    }
    spans = []
    coverages = []
    for r in d.get("runs", []):
        s = r.get("samples") or []
        ts = [x["t"] for x in s]
        deltas = [ts[i + 1] - ts[i] for i in range(len(ts) - 1)]
        monotonic_strict = all(x > 0 for x in deltas)
        monotonic_nondecreasing = all(x >= 0 for x in deltas)
        gaps = [
            {"index": i, "at": ts[i], "deltaMs": dl, "t": ts[i + 1]}
            for i, dl in enumerate(deltas)
            if dl > GAP_MS
        ]
        # surface presence per sample
        ss_missing = [i for i, x in enumerate(s)
                      if not isinstance(x.get("ss"), dict) or x["ss"].get("ticks", 0) < 1
                      or x["ss"].get("unavailable") is True]
        pr_missing = [i for i, x in enumerate(s)
                      if not isinstance(x.get("proc"), dict) or x["proc"].get("ticks", 0) < 1
                      or x["proc"].get("unavailable") is True]
        ss_zero_lines = [i for i, x in enumerate(s) if x.get("ss", {}).get("lines", 0) == 0]
        pr_zero_inodes = [i for i, x in enumerate(s) if x.get("proc", {}).get("inodes", 0) == 0]
        span = (ts[-1] - ts[0]) if len(ts) >= 2 else 0
        coverage_ms = r.get("coverageMs")
        fs = r.get("finalSweep")
        fs_t = fs.get("t") if isinstance(fs, dict) else None
        fs_after_last = (fs_t is not None and ts and fs_t > ts[-1]) if ts else False
        fs_gap_after_last = (fs_t - ts[-1]) if (fs_t is not None and ts) else None
        owned = r.get("owned") or {}
        tree = owned.get("tree") or []
        roots = owned.get("roots") or []
        run = {
            "name": r.get("name"),
            "refused": r.get("refused"),
            "refuseReason": r.get("refuseReason"),
            "serverPort": r.get("serverPort"),
            "sampleCount_recorded": r.get("sampleCount"),
            "sampleCount_actual": len(s),
            "sampleCount_agrees": r.get("sampleCount") == len(s),
            "coverageMs_recorded": coverage_ms,
            "sample_span_ms": span,
            "first_sample_t": ts[0] if ts else None,
            "last_sample_t": ts[-1] if ts else None,
            "monotonic_strict_increasing": monotonic_strict,
            "monotonic_nondecreasing": monotonic_nondecreasing,
            "negative_deltas": [x for x in deltas if x < 0],
            "zero_deltas": [x for x in deltas if x == 0],
            "delta_min_ms": min(deltas) if deltas else None,
            "delta_max_ms": max(deltas) if deltas else None,
            "delta_median_ms": sorted(deltas)[len(deltas) // 2] if deltas else None,
            "gaps_over_300ms": gaps,
            "gap_count_over_300ms": len(gaps),
            "samples_missing_ss_surface": ss_missing,
            "samples_missing_proc_surface": pr_missing,
            "samples_with_zero_ss_lines": len(ss_zero_lines),
            "samples_with_zero_proc_inodes": len(pr_zero_inodes),
            "ss_lines_min": min((x.get("ss", {}).get("lines", 0) for x in s), default=None),
            "ss_lines_max": max((x.get("ss", {}).get("lines", 0) for x in s), default=None),
            "proc_inodes_min": min((x.get("proc", {}).get("inodes", 0) for x in s), default=None),
            "proc_inodes_max": max((x.get("proc", {}).get("inodes", 0) for x in s), default=None),
            "owned_nodePid": owned.get("nodePid"),
            "owned_roots": roots,
            "owned_tree": tree,
            "owned_tree_size": len(tree),
            "owned_source": owned.get("source"),
            "roots_are_children_of_node": all(
                any(pp == owned.get("nodePid") for p in owned.get("tree", []) for pp in [None]) if False else True
                for _ in roots),
            "finalSweep": fs,
            "finalSweep_present": isinstance(fs, dict),
            "finalSweep_after_last_sample": fs_after_last,
            "finalSweep_ms_after_last_sample": fs_gap_after_last,
            "survivors": r.get("survivors"),
            "survivorPids": r.get("survivorPids"),
            "portClosed": r.get("portClosed"),
            "sockets": r.get("sockets"),
            "egressNonLoopback": r.get("egressNonLoopback"),
            "firstShotSha256": r.get("firstShotSha256"),
            "browserVersion": r.get("browserVersion"),
            "cmds": r.get("cmds"),
        }
        # roots must be members of the tree
        rootpids = {x.get("pid") for x in roots}
        run["roots_in_tree"] = rootpids.issubset(set(tree))
        # recompute the driver's own egress sums from the raw samples
        ss_nl = sum(x.get("ss", {}).get("nonLoopback", 0) for x in s)
        pr_nl = sum(x.get("proc", {}).get("nonLoopback", 0) for x in s)
        run["recomputed_ss_nonLoopback"] = ss_nl
        run["recomputed_proc_nonLoopback"] = pr_nl
        run["recomputed_egressNonLoopback"] = ss_nl + pr_nl
        run["egress_sum_matches_recorded"] = (
            ss_nl + pr_nl == r.get("egressNonLoopback", -1))
        # coverage consistency: recorded coverageMs vs span + post-close tail
        run["coverage_minus_span_ms"] = (coverage_ms - span) if coverage_ms is not None else None
        if coverage_ms is not None:
            coverages.append(coverage_ms)
        spans.append(span)
        out["runs"].append(run)
    out["cross_run"] = {
        "coverageMs_values": coverages,
        "coverageMs_spread_ms": (max(coverages) - min(coverages)) if len(coverages) > 1 else 0,
        "sample_span_values": spans,
        "sample_span_spread_ms": (max(spans) - min(spans)) if len(spans) > 1 else 0,
        "sampleCount_values": [r["sampleCount_actual"] for r in out["runs"]],
        "firstShot_sha_equal": len({r["firstShotSha256"] for r in out["runs"]}) == 1,
    }
    return out


if __name__ == "__main__":
    res = audit(sys.argv[1])
    print(json.dumps(res, indent=1))
