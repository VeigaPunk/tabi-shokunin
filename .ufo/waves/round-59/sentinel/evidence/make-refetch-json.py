#!/usr/bin/env python3
"""Build sentinel/independent-refetch.json: my independent re-fetch vs the scout's staged bytes.

Compares by BYTE (cmp) and by sha256. Records the R57-S3 guard fields for my own fetch:
final host (must equal the cited host), num_redirects (must be 0), byte count, sha256.
"""
import json, os, subprocess, hashlib, time

LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
MY   = "/fast/scratch/hyaku/tabi-r59/R59Sentinel/refetch"
SOURCES = os.path.join(LANE, ".ufo/waves/round-59/sources")

SPEC = [
  {"id": "S161",
   "url": "https://www.w3.org/TR/uievents/",
   "cited_host": "www.w3.org",
   "my_file": "uievents.html",
   "scout_candidates": ["uievents.html"],
   "registry_anchor_sha256": "8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918",
   "registry_anchor_bytes": 920762},
  {"id": "S153",
   "url": "https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json",
   "cited_host": "raw.githubusercontent.com",
   "my_file": "browser_protocol.json",
   "scout_candidates": ["browser_protocol.json"],
   "registry_anchor_sha256": "d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7",
   "registry_anchor_bytes": 1423170},
]

def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()

def cmp_bytes(a, b):
    r = subprocess.run(["cmp", "-s", a, b])
    return "identical" if r.returncode == 0 else "DIFFERENT"

def fetch_guard_fields(name):
    """Re-derive the guard fields from the recorded fetch log (the fetch itself already ran)."""
    log = open("/fast/scratch/hyaku/tabi-r59/R59Sentinel/fetch-log.txt", encoding="utf-8").read()
    blocks = log.split("### ")
    for b in blocks:
        if b.startswith(name + " "):
            lines = [l for l in b.splitlines() if l.strip()]
            meta = lines[1].split("|")
            bsha = lines[2]
            return {
                "http_code": int(meta[0]),
                "num_redirects": int(meta[1]),
                "url_effective": meta[2],
                "size_download": int(meta[3]),
                "content_type": meta[4],
                "time_total_s": float(meta[5]),
                "bytes_on_disk": int(bsha.split("bytes=")[1].split(" ")[0]),
                "sha256": bsha.split("sha256=")[1].strip(),
            }
    return None

results = []
for s in SPEC:
    myp = os.path.join(MY, s["my_file"])
    g = fetch_guard_fields(s["id"])
    row = {
        "id": s["id"],
        "cited_url": s["url"],
        "cited_host": s["cited_host"],
        "my_independent_fetch": {
            "method": "curl 8.23.0 -sS --max-time 120 -o <file> -w '%{http_code}|%{num_redirects}|%{url_effective}|%{size_download}|%{content_type}|%{time_total}'",
            "guard": g,
            "final_host": s["cited_host"] if g and g["url_effective"].split("/")[2] == s["cited_host"] else (g["url_effective"].split("/")[2] if g else None),
            "host_match": bool(g and g["url_effective"].split("/")[2] == s["cited_host"]),
            "num_redirects": g["num_redirects"] if g else None,
            "guard_ok": bool(g and g["num_redirects"] == 0 and g["url_effective"].split("/")[2] == s["cited_host"]),
        },
        "registry_anchor": {"sha256": s["registry_anchor_sha256"], "bytes": s["registry_anchor_bytes"]},
    }
    if g:
        row["my_independent_fetch"]["matches_registry_anchor_sha256"] = (g["sha256"] == s["registry_anchor_sha256"])
        row["my_independent_fetch"]["matches_registry_anchor_bytes"] = (g["bytes_on_disk"] == s["registry_anchor_bytes"])
    # locate the scout's staged copy
    found = None
    for cand in s["scout_candidates"]:
        p = os.path.join(SOURCES, cand)
        if os.path.exists(p):
            found = p
            break
    if found:
        ssha = sha(found)
        row["scout_staged"] = {
            "path": os.path.relpath(found, LANE),
            "bytes": os.path.getsize(found),
            "sha256": ssha,
            "cmp_vs_independent": cmp_bytes(myp, found),
            "sha256_equal_to_independent": (ssha == (g["sha256"] if g else None)),
            "sha256_equal_to_registry_anchor": (ssha == s["registry_anchor_sha256"]),
        }
        row["verdict"] = "MATCH" if (row["scout_staged"]["cmp_vs_independent"] == "identical"
                                     and row["scout_staged"]["sha256_equal_to_registry_anchor"]) else "MISMATCH"
    else:
        row["scout_staged"] = None
        row["verdict"] = "NOT_COMPARED_SCOUT_BYTES_ABSENT"
    results.append(row)

out = {
    "schema": "r59-sentinel-independent-refetch-v1",
    "seat": "R59Sentinel",
    "lane": LANE,
    "round": 59,
    "checked_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    "rule": "R57-S3 guard fields per fetch: final host == cited host, num_redirects == 0, byte count, sha256. The sentinel re-fetched both sources INDEPENDENTLY (own curl invocation, own bytes) and byte-compared against the scout's staged copies.",
    "scout_staged_dir": os.path.relpath(SOURCES, LANE),
    "sources": results,
    "summary": {
        "sources_checked": len(results),
        "match": sum(1 for r in results if r["verdict"] == "MATCH"),
        "mismatch": sum(1 for r in results if r["verdict"] == "MISMATCH"),
        "not_compared": sum(1 for r in results if r["verdict"].startswith("NOT_COMPARED")),
        "independent_fetches_guard_ok": sum(1 for r in results if r["my_independent_fetch"]["guard_ok"]),
    },
}
print(json.dumps(out, indent=1))
