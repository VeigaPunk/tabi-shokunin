#!/usr/bin/env python3
"""Compare the Python client's captured values (two runs) with the Node counter's
own liveRecord session values.

Per-session identifiers (browsing-context ids, intercept UUIDs, wire indices,
ports, websocket URLs) are structurally excluded or normalised; everything else
must match exactly across python-run-1, python-run-2 and node-counter.
"""
import json
import re
import sys

IGNORE = {
    "schema",
    "commands",
    "events",
    "webSocketUrl",
    "chromedriverExit",
    "sessionDeleteStatus",
    # per-session identifiers / client-internal wire indices
    "r13_interceptId",
    "r13_blockedEventIndex",
    "r13_continueCommandIndex",
    "r14_pathnamePolls",
}


def load(path):
    d = json.load(open(path))
    return d.get("values", d)


def strip(v):
    if isinstance(v, dict):
        return {k: strip(x) for k, x in v.items() if k != "context"}
    if isinstance(v, list):
        return [strip(x) for x in v]
    if isinstance(v, str):
        return re.sub(r"127\.0\.0\.1:\d+", "127.0.0.1:PORT", v)
    return v


def canon(v):
    return json.dumps(strip(v), sort_keys=True)


def main(argv):
    py1_path, py2_path, node_path, out_json, out_md = argv
    py1, py2, node = load(py1_path), load(py2_path), load(node_path)
    fields = sorted((set(py1) | set(node)) - IGNORE)
    rows = []
    for f in fields:
        a, b, c = py1.get(f), py2.get(f), node.get(f)
        rows.append(
            {
                "field": f,
                "python_run1": strip(a),
                "python_run2": strip(b),
                "node_counter": strip(c),
                "py1_eq_py2": canon(a) == canon(b),
                "py_eq_node": canon(a) == canon(c),
            }
        )
    mismatches = [r for r in rows if not (r["py1_eq_py2"] and r["py_eq_node"])]
    shots = [py1.get("firstScreenshotSha256"), py2.get("firstScreenshotSha256"), node.get("firstScreenshotSha256")]
    out = {
        "schema": "tabi-python-bidi-client-compare-v1",
        "inputs": {"python_run1": py1_path, "python_run2": py2_path, "node_counter": node_path},
        "ignored_fields": sorted(IGNORE),
        "fields_compared": len(rows),
        "mismatch_count": len(mismatches),
        "mismatches": mismatches,
        "screenshot": {"python_run1": shots[0], "python_run2": shots[1], "node_counter": shots[2], "all_equal": len(set(shots)) == 1},
        "rows": rows,
    }
    with open(out_json, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=1, sort_keys=True)
        fh.write("\n")
    with open(out_md, "w", encoding="utf-8") as fh:
        fh.write("| Field | Python run 1 | Python run 2 | Node counter liveRecord | py1==py2 | py==node |\n")
        fh.write("|---|---|---|---|---|---|\n")
        for r in rows:
            fh.write(
                "| `%s` | %s | %s | %s | %s | %s |\n"
                % (
                    r["field"],
                    json.dumps(r["python_run1"]),
                    json.dumps(r["python_run2"]),
                    json.dumps(r["node_counter"]),
                    r["py1_eq_py2"],
                    r["py_eq_node"],
                )
            )
    print(json.dumps({"fields_compared": out["fields_compared"], "mismatch_count": out["mismatch_count"], "mismatches": out["mismatches"], "screenshot": out["screenshot"]}, indent=1))
    return 0 if not mismatches and out["screenshot"]["all_equal"] else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
