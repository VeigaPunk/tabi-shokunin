#!/usr/bin/env python3
"""R59Sentinel instrument-integrity monitor.

The round contract says: "the canonical instrument files are never mutated by anyone
but their author, and attackers never edit them at all." This monitor snapshots the
sha256 of every canonical r59 instrument file (author seats' deliverables) at two
points in time and reports any drift, plus which seat's declared dir each file sits in.
"""
import os, sys, json, hashlib, time

LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
OWNER = [
  (".ufo/waves/round-59/runner/",        "R59Runner"),
  (".ufo/waves/round-59/counters/",      "R59Counter/R59Meter"),
  (".ufo/waves/round-59/adj/",            "R59Rebind"),
  (".ufo/waves/round-59/probes/",         "R59Probes"),
  (".ufo/waves/round-59/scout/",         "R59Scout"),
  (".ufo/waves/round-59/sources/",       "R59Scout"),
  (".ufo/waves/round-59/scribe/",        "R59Scribe"),
  (".ufo/waves/round-59/connector/",     "R59Connector"),
  (".ufo/waves/round-59/reviewer/",      "R59Reviewer"),
  (".ufo/waves/round-59/critic/",        "R59Critic"),
  (".ufo/waves/round-59/mutant-meter/",  "R59MutMeter"),
  (".ufo/waves/round-59/mutant-counter/","R59MutCounter"),
  (".ufo/waves/round-59/sentinel/",      "R59Sentinel"),
  ("scripts/chrome-cdp-loopback-round59.mjs", "R59Runner"),
  # L1-owned round artifacts (claims freeze, round-open controls, L1 measurements,
  # wave dispatch/plan files) -- not seat instruments, but tracked for drift.
  (".ufo/waves/round-59/claims.json",     "L1/TabiR59"),
  (".ufo/waves/round-59/controls/",       "L1/TabiR59"),
  (".ufo/waves/round-59/measure/",        "L1/TabiR59"),
  (".ufo/waves/round-59/w1",              "L1/TabiR59"),
  (".ufo/waves/round-59/w1.",             "L1/TabiR59"),
  (".ufo/waves/round-59/w1-",             "L1/TabiR59"),
]
WAVE = os.path.join(LANE, ".ufo/waves/round-59")

def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()

def owner_of(rel):
    for d, o in OWNER:
        if rel.startswith(d) or rel == d:
            return o
    return "UNOWNED"

def snapshot():
    out = {}
    for dp, dns, fns in os.walk(WAVE):
        dns[:] = [d for d in dns if d != "sentinel"]
        for fn in fns:
            p = os.path.join(dp, fn)
            rel = os.path.relpath(p, LANE)
            try:
                out[rel] = {"sha256": sha(p), "bytes": os.path.getsize(p),
                            "mtime": os.path.getmtime(p), "owner": owner_of(rel)}
            except OSError as e:
                out[rel] = {"error": str(e), "owner": owner_of(rel)}
    for extra in ("scripts/chrome-cdp-loopback-round59.mjs",):
        p = os.path.join(LANE, extra)
        if os.path.exists(p):
            out[extra] = {"sha256": sha(p), "bytes": os.path.getsize(p),
                          "mtime": os.path.getmtime(p), "owner": owner_of(extra)}
    return out

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "snap"
    if cmd == "snap":
        print(json.dumps(snapshot(), indent=1, sort_keys=True))
    elif cmd == "diff":
        a = json.load(open(sys.argv[2])); b = json.load(open(sys.argv[3]))
        changed, added, removed = [], [], []
        for k in sorted(set(a) | set(b)):
            if k not in a: added.append(k)
            elif k not in b: removed.append(k)
            elif a[k].get("sha256") != b[k].get("sha256"):
                changed.append({"path": k, "before": a[k].get("sha256"), "after": b[k].get("sha256"),
                                "before_bytes": a[k].get("bytes"), "after_bytes": b[k].get("bytes"),
                                "owner": b[k].get("owner")})
        print(json.dumps({"changed": changed, "added": added, "removed": removed,
                          "changed_count": len(changed), "added_count": len(added), "removed_count": len(removed)}, indent=1))
