#!/usr/bin/env python3
"""AUD-B7 re-derivations (read-only). Row 1 + Row 2 of the layer-wins table
(network-evidence-rung.md:334-345) + in-flight r6 archive observation."""
import json
import os
import re
from collections import Counter

EV = "/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence"


def events(req):
    return {e["kind"]: e for e in req["events"]}


def summarize(path, label):
    j = json.load(open(path))
    print(f"--- {label} ({os.path.relpath(path, EV)}) ---")
    print("requests recorded by client:", len(j["requests"]))
    for r in j["requests"]:
        ev = events(r)
        req = ev.get("req", {})
        url = req.get("url", "?")
        hops = [e.get("url", "?") for e in r["events"] if e["kind"] == "req"]
        wire = ev.get("wire", {}).get("statusCode")
        wire_line = ev.get("wire", {}).get("statusLine")
        client = ev.get("resp", {}).get("status")
        fin = ev.get("finished", {}).get("encodedDataLength")
        cache = "cache" in ev
        fail = ev.get("failed", {})
        print(f"  {r['requestId']:34s} {url.split('19431')[-1] or url:55s} hops={hops} "
              f"wire={wire} client={client} finEnc={fin} cacheEvent={cache}"
              + (f" FAILED={fail.get('errorText')}" if fail else ""))
        if wire_line:
            print(f"       wire statusLine: {wire_line}")


print("== ROW 'which requests/hops/statuses occurred' (D4, D6) ==")
summarize(os.path.join(EV, "w4-t41-network/run1/journey.json"), "cold run1")
log1 = open(os.path.join(EV, "w4-t41-network/run1/http.log")).read()
print("server request lines:", len(re.findall(r'"GET [^"]*" \d{3}', log1)))
print("server /style.css lines:", log1.count('"GET /style.css'))
print("server /style.css statuses:", re.findall(r'"GET /style.css" (\d{3})', log1))
print("server abort-marker lines:", log1.count("== ABORTED body write"))
print("abort marker:", re.findall(r"== ABORTED body write \(client closed\): (\S+)", log1))
print("server line for the aborted fetch:", re.findall(r'"GET /slow\.json\?abort=1" (\d{3})', log1))
# DOM/screenshot trace of the attempt
d = os.path.join(EV, "w4-t41-network/run1")
files = [f for f in os.listdir(d) if f.endswith((".domsnapshot.json", ".shape.txt"))]
n_err = sum(open(os.path.join(d, f), errors="replace").read().count("ERR_ABORTED") for f in files)
n_words = {f: open(os.path.join(d, f), errors="replace").read().count("abort") for f in files}
print("DOM/shape files:", len(files), "total 'ERR_ABORTED' occurrences:", n_err)
print("DOM/shape files containing 'abort' (authored script text):", {k: v for k, v in n_words.items() if v})

print()
print("== ROW 'the wire status' (D7) ==")
summarize(os.path.join(EV, "w4-t41-network/run6-reval/journey.json"), "run6-reval recorded journey")
log6 = open(os.path.join(EV, "w4-t41-network/run6-reval/http.log")).read()
st = re.findall(r'"GET [^"]*" (\d{3})', log6)
print("run6-reval http.log request lines:", len(st), "statuses:", dict(sorted(Counter(st).items())))
print("304 lines:", [l.split('"GET ')[1].split('"')[0] for l in log6.splitlines() if re.search(r'" 304 -$', l)])
print("prepass journal dir contents:", sorted(os.listdir(os.path.join(EV, "w4-t41-network/run6-reval/prepass"))))
print()

print("== in-flight observation: r6 archive extension (mtime 15:24 local) ==")
for g in ("w6-aud-b6-scratch", "w6-tabi-b61", "w6-ver-b6"):
    p = os.path.join(EV, g)
    if not os.path.isdir(p):
        print(g, "absent"); continue
    man = os.path.join(p, "MANIFEST.txt")
    n = sum(1 for line in open(man) if re.match(r'^[0-9a-f]{64}  ', line)) if os.path.exists(man) else 0
    nf = sum(len(fs) for _, _, fs in os.walk(p))
    print(f"{g}: on-disk files={nf} manifest-lines={n} mtime={os.path.getmtime(man) if os.path.exists(man) else None}")