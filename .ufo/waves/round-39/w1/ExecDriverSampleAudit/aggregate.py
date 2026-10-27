#!/usr/bin/env python3
"""Aggregate the per-invocation audits into one table + invariant checks."""
import json
import glob
import os

BASE = "/fast/scratch/hyaku/tabi-r39/ExecDriverSampleAudit"
files = {
    "A (invocation 1)": "audit-run2.json",
    "B (invocation 2)": "audit-run2-b.json",
    "C (invocation 3)": "audit-run2-c.json",
    "D (invocation 4)": "audit-receipt-run2-d.json.json",
    "E (invocation 5)": "audit-receipt-run2-e.json.json",
}
committed = "/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-39/playwright-egress/receipt.json"

rows = []
for inv, fn in files.items():
    d = json.load(open(os.path.join(BASE, fn)))
    for r in d["runs"]:
        rows.append((inv, r))

# committed receipt, same measurements, computed with the same rules
c = json.load(open(committed))
for r in c["runs"]:
    s = r["samples"]
    ts = [x["t"] for x in s]
    dl = [ts[i + 1] - ts[i] for i in range(len(ts) - 1)]
    span = ts[-1] - ts[0]
    rows.append(("COMMITTED (repo)", {
        "name": r["name"],
        "sampleCount_actual": len(s),
        "sampleCount_recorded": r["sampleCount"],
        "coverageMs_recorded": r["coverageMs"],
        "sample_span_ms": span,
        "coverage_minus_span_ms": r["coverageMs"] - span,
        "delta_min_ms": min(dl), "delta_max_ms": max(dl),
        "monotonic_strict_increasing": all(x > 0 for x in dl),
        "gap_count_over_300ms": len([x for x in dl if x > 300]),
        "gaps_over_300ms": [x for x in dl if x > 300],
        "samples_missing_ss_surface": [i for i, x in enumerate(s) if x["ss"].get("ticks", 0) < 1 or x["ss"].get("unavailable")],
        "samples_missing_proc_surface": [i for i, x in enumerate(s) if x["proc"].get("ticks", 0) < 1 or x["proc"].get("unavailable")],
        "ss_lines_max": max(x["ss"].get("lines", 0) for x in s),
        "proc_inodes_max": max(x["proc"].get("inodes", 0) for x in s),
        "finalSweep_after_last_sample": r["finalSweep"]["t"] > ts[-1],
        "finalSweep_ms_after_last_sample": r["finalSweep"]["t"] - ts[-1],
        "survivors": r["survivors"], "portClosed": r["portClosed"],
        "egressNonLoopback": r["egressNonLoopback"],
        "recomputed_egressNonLoopback": sum(x["ss"].get("nonLoopback", 0) + x["proc"].get("nonLoopback", 0) for x in s),
        "owned_tree_size": len(r["owned"]["tree"]),
        "roots_in_tree": True,
        "firstShotSha256": r["firstShotSha256"],
    }))

hdr = ("invocation", "run", "samples", "coverageMs", "span_ms", "cov-span", "dmin", "dmax",
       "gaps>300", "mono", "ssMiss", "procMiss", "ssMax", "procMax", "fsAfterLast", "fsDelta",
       "surv", "portClosed", "egress", "recompEgress", "tree", "shot")
print("| " + " | ".join(hdr) + " |")
print("|" + "|".join(["---"] * len(hdr)) + "|")
for inv, r in rows:
    print("| " + " | ".join(str(x) for x in (
        inv, r["name"], r["sampleCount_actual"], r["coverageMs_recorded"], r["sample_span_ms"],
        r["coverage_minus_span_ms"], r["delta_min_ms"], r["delta_max_ms"],
        r["gap_count_over_300ms"], r["monotonic_strict_increasing"],
        len(r["samples_missing_ss_surface"]), len(r["samples_missing_proc_surface"]),
        r["ss_lines_max"], r["proc_inodes_max"],
        r["finalSweep_after_last_sample"], r["finalSweep_ms_after_last_sample"],
        r["survivors"], r["portClosed"], r["egressNonLoopback"], r["recomputed_egressNonLoopback"],
        r["owned_tree_size"], str(r["firstShotSha256"])[:12])) + " |")

spans = [r["sample_span_ms"] for _, r in rows]
counts = [r["sampleCount_actual"] for _, r in rows]
covs = [r["coverageMs_recorded"] for _, r in rows]
offs = [r["coverage_minus_span_ms"] for _, r in rows]
gaps = [r["gap_count_over_300ms"] for _, r in rows]
maxd = [r["delta_max_ms"] for _, r in rows]
print()
print("runs measured:", len(rows))
print("sample counts: min", min(counts), "max", max(counts))
print("sampling window (first->last sample) ms: min", min(spans), "max", max(spans),
      "| runs with span < 1000 ms:", sum(1 for s in spans if s < 1000), "of", len(spans))
print("recorded coverageMs: min", min(covs), "max", max(covs),
      "| runs with coverageMs < 1000 ms:", sum(1 for c in covs if c < 1000))
print("coverageMs - span offset ms: min", min(offs), "max", max(offs))
print("total sample gaps > 300 ms across all runs:", sum(gaps))
print("max inter-sample delta observed ms:", max(maxd))
print("all runs strictly monotonic:", all(r["monotonic_strict_increasing"] for _, r in rows))
print("all runs both surfaces present on every sample:",
      all(not r["samples_missing_ss_surface"] and not r["samples_missing_proc_surface"] for _, r in rows))
print("all runs final sweep after last sample:", all(r["finalSweep_after_last_sample"] for _, r in rows))
print("all runs survivors==0 and portClosed:", all(r["survivors"] == 0 and r["portClosed"] for _, r in rows))
print("all runs egress==0 (recorded == recomputed):",
      all(r["egressNonLoopback"] == 0 == r["recomputed_egressNonLoopback"] for _, r in rows))
print("first-shot sha256 distinct values:", sorted({r["firstShotSha256"] for _, r in rows}))
