#!/usr/bin/env python3
"""R59Sentinel write-scope audit (read-only).

Rule (from the seat item): every dirty path must belong to
  (a) a seat's DECLARED wave dir,
  (b) scripts/chrome-cdp-loopback-round59.mjs,
  (c) .ufo/waves/round-59/
Anything else is flagged.

Additionally flags, by contract, the paths the round contract forbids ANY seat from
writing even if they sit inside a declared dir:
  .ufo/state/**, .ufo/watchdog.log, MANIFEST.json, and the fleet repo (outside the lane).
"""
import subprocess, json, os, sys, hashlib, time

LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
FLEET = "/home/vgpnk/Projects/shokunin"

DECLARED = {
  "R59Runner":   [".ufo/waves/round-59/runner/", "scripts/chrome-cdp-loopback-round59.mjs"],
  "R59Counter":  [".ufo/waves/round-59/counters/"],
  "R59Meter":    [".ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs"],
  "R59Rebind":   [".ufo/waves/round-59/adj/"],
  "R59Probes":   [".ufo/waves/round-59/probes/"],
  "R59Scout":    [".ufo/waves/round-59/scout/", ".ufo/waves/round-59/sources/"],
  "R59Scribe":   [".ufo/waves/round-59/scribe/"],
  "R59Connector":[".ufo/waves/round-59/connector/"],
  "R59Reviewer": [".ufo/waves/round-59/reviewer/"],
  "R59Critic":   [".ufo/waves/round-59/critic/"],
  "R59MutMeter": [".ufo/waves/round-59/mutant-meter/"],
  "R59MutCounter":[".ufo/waves/round-59/mutant-counter/"],
  "R59Sentinel": [".ufo/waves/round-59/sentinel/"],
  "L1/TabiR59":  [".ufo/waves/round-59/measure/", ".ufo/waves/round-59/controls/",
                  ".ufo/waves/round-59/w1/", "corpus/adjacency-host-delta-r59.tsv",
                  "corpus/evidence/round59/", "corpus/lessons/round-59.md",
                  "QUALITY.md", "SCORECARD.md", "LOG.md", "README.md", "corpus/SOURCES.md"],
}
WAVE_ROOT = ".ufo/waves/round-59/"
RUNNER_SCRIPT = "scripts/chrome-cdp-loopback-round59.mjs"
# paths the round contract forbids every seat from writing
FORBIDDEN = [
  (".ufo/state/", "round contract: .ufo/state/ is never written by a seat"),
  (".ufo/watchdog.log", "round contract: .ufo/watchdog.log is never written by a seat"),
  ("MANIFEST.json", "round contract: MANIFEST.json is never written by a seat"),
]

def git(*args):
    r = subprocess.run(["git","-C",LANE]+list(args), capture_output=True, text=True)
    return r.returncode, r.stdout, r.stderr

def dirty_paths():
    rc, out, err = git("status","--porcelain","-uall")
    if rc != 0:
        return None, err
    paths = []
    for line in out.splitlines():
        if not line.strip(): continue
        # XY<space>path  (rename/copy have 'orig -> new')
        st = line[:2]; rest = line[3:]
        if " -> " in rest:
            orig, new = rest.split(" -> ", 1)
            paths.append((st, orig.strip(), "RENAME_FROM"))
            paths.append((st, new.strip(), "RENAME_TO"))
        else:
            paths.append((st, rest.strip(), "PLAIN"))
    return paths, None

def classify(p):
    # returns (verdict, seat_or_reason)
    for pref, why in FORBIDDEN:
        if p == pref or p.startswith(pref):
            return "FORBIDDEN", why
    if p.startswith(WAVE_ROOT):
        # inside the wave root: find the owning declared dir
        for seat, dirs in DECLARED.items():
            for d in dirs:
                if d.startswith(WAVE_ROOT) and (p.startswith(d) or p == d.rstrip("/")):
                    return "IN_SCOPE", seat
        return "IN_SCOPE", "wave-root (L1/dispatch artifacts)"
    if p == RUNNER_SCRIPT:
        return "IN_SCOPE", "R59Runner"
    for seat, dirs in DECLARED.items():
        for d in dirs:
            if d.startswith(WAVE_ROOT) or d.startswith("scripts/"): continue
            if p == d or p.startswith(d):
                return "IN_SCOPE", seat
    return "OUT_OF_SCOPE", "no declared seat owns this path"

def main():
    paths, err = dirty_paths()
    if paths is None:
        print(json.dumps({"error": err}, indent=1)); return 2
    rc, tip, _ = git("rev-parse","master")
    tip = tip.strip()
    rc2, head, _ = git("rev-parse","HEAD")
    head = head.strip()
    rc3, base, _ = git("rev-parse","4e7fb89d7b71a6fdf661680891440be6577759e8")
    base = base.strip()
    rc4, log, _ = git("log","--format=%H|%an <%ae>|%ad|%s","-5","master")
    entries = []
    counts = {"IN_SCOPE":0,"OUT_OF_SCOPE":0,"FORBIDDEN":0}
    for st, p, kind in paths:
        v, owner = classify(p)
        counts[v] += 1
        entries.append({"status": st, "path": p, "form": kind, "verdict": v, "attributed_to": owner})
    out = {
        "schema": "r59-sentinel-write-scope-audit-v1",
        "seat": "R59Sentinel",
        "checked_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "repo": LANE,
        "command": "git -C %s status --porcelain -uall" % LANE,
        "dirty_count": len(paths),
        "counts": counts,
        "branch_tip_master": tip,
        "head": head,
        "tip_equals_head": tip == head,
        "lane_base_revision": base,
        "base_is_ancestor_of_tip": subprocess.run(["git","-C",LANE,"merge-base","--is-ancestor",base,tip]).returncode == 0,
        "recent_commits": [l for l in log.splitlines()],
        "declared_scope": DECLARED,
        "entries": entries,
        "out_of_scope_paths": [e["path"] for e in entries if e["verdict"]=="OUT_OF_SCOPE"],
        "forbidden_paths": [e["path"] for e in entries if e["verdict"]=="FORBIDDEN"],
    }
    print(json.dumps(out, indent=1))
    return 0

if __name__ == "__main__":
    sys.exit(main())
