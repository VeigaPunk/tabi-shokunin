#!/usr/bin/env python3
"""AUD-B7 read-only checks: (1) note-pin equality vs archived bytes for 3
archive groups; (2) re-derivation of 2 rows of the layer-wins table
(network-evidence-rung.md:334-345) from archived evidence. Writes nothing
outside /tmp/w7-aud-b7-scratch/."""
import hashlib
import json
import os
import re
import sys

REPO = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
EV = os.path.join(REPO, "corpus/evidence")
GROUPS = ["tabi-r4-1-network", "w4-t41-network", "tabi-r4-2-async"]


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def manifest_map(group):
    """{path -> (sha, bytes)} from MANIFEST.txt (sha256␠␠path lines)."""
    out = {}
    with open(os.path.join(EV, group, "MANIFEST.txt")) as f:
        for line in f:
            line = line.rstrip("\n")
            if not line or line.startswith("#"):
                continue
            m = re.match(r"^([0-9a-f]{64})\s+(.+)$", line)
            if m:
                p = os.path.join(EV, group, m.group(2))
                out[m.group(2)] = (m.group(1), os.path.getsize(p) if os.path.exists(p) else None)
    return out


def main():
    print("== A. archive: manifest-pin equality ==")
    all_manifest_hashes = {}
    for g in GROUPS:
        mm = manifest_map(g)
        listed = len(mm)
        on_disk = sum(1 for _ in os.listdir(os.path.join(EV, g)))  # dirs count too
        checked = 0
        bad = []
        for rel, (pinsha, size) in mm.items():
            p = os.path.join(EV, g, rel)
            actual = sha256(p)
            checked += 1
            if actual != pinsha:
                bad.append((rel, pinsha, actual))
        all_manifest_hashes[g] = mm
        print(f"{g}: manifest lines={listed} re-hashed={checked} mismatches={len(bad)}")
        for b in bad:
            print("   MISMATCH", b)

    print()
    print("== A4. note-pin scan: hex tokens >=12 in corpus notes vs archived hashes ==")
    full = {}   # 64-hex -> set(group/path)
    prefix12 = {}  # 12-hex -> set(group/path)
    for g, mm in all_manifest_hashes.items():
        for rel, (h, _) in mm.items():
            full.setdefault(h, set()).add(f"{g}/{rel}")
            prefix12.setdefault(h[:12], set()).add(f"{g}/{rel}")
    note_files = []
    for sub in ("corpus/knowledge", "reports", "corpus/handoffs"):
        d = os.path.join(REPO, sub)
        if os.path.isdir(d):
            for f in sorted(os.listdir(d)):
                if f.endswith(".md"):
                    note_files.append(os.path.join(d, f))
    note_files.append(os.path.join(REPO, "SKILL.md"))
    tok_re = re.compile(r"\b[0-9a-f]{12,64}\b")
    instances = 0
    matched_full = 0
    matched_p12 = 0
    unmatched = []
    for nf in note_files:
        text = open(nf, encoding="utf-8", errors="replace").read()
        for m in tok_re.finditer(text):
            tok = m.group(0)
            instances += 1
            if len(tok) == 64 and tok in full:
                matched_full += 1
            elif tok[:12] in prefix12:
                matched_p12 += 1
            else:
                line = text[:m.start()].count("\n") + 1
                unmatched.append(f"{os.path.relpath(nf, REPO)}:{line}:{tok}")
    print(f"note files scanned={len(note_files)} hex-token instances={instances}")
    print(f"full-64 matches={matched_full} 12-prefix matches={matched_p12} unmatched={len(unmatched)}")
    print("unmatched (first 30):")
    for u in unmatched[:30]:
        print("  ", u)

    print()
    print("== B. layer-wins table rows re-derived ==")
    # Row 1: "which requests/hops/statuses occurred"
    j = json.load(open(os.path.join(EV, "w4-t41-network/run1/journey.json")))
    reqs = j["requests"]
    print(f"B1 run1 requests recorded by client = {len(reqs)}")
    style_events = 0
    for r in reqs:
        url = r.get("url") or ""
        if url.endswith("/style.css"):
            style_events += 1
    # count requestWillBeSent per url from raw events if available
    print("B1 client style.css request entries =", style_events)
    log = open(os.path.join(EV, "w4-t41-network/run1/http.log")).read()
    print("B1 server /style.css lines =", log.count('"GET /style.css'))
    print("B1 server ABORTED marker lines =", log.count("== ABORTED body write"))
    print("B1 server abort marker path =", re.findall(r"== ABORTED body write \(client closed\): (\S+)", log))
    # DOM trace of the aborted fetch?
    srcs = []
    for f in os.listdir(os.path.join(EV, "w4-t41-network/run1")):
        if f.endswith((".domsnapshot.json", ".shape.txt")):
            srcs.append(f)
    hits = [f for f in srcs if "abort" in open(os.path.join(EV, "w4-t41-network/run1", f), errors="replace").read().lower()]
    print(f"B1 DOM/shape files scanned={len(srcs)} referring to 'abort'={len(hits)}")
    # client-side failed request for abort
    for r in reqs:
        u = r.get("url") or ""
        if "abort=1" in u:
            print("B1 abort request client record:", json.dumps({k: r.get(k) for k in r if k in ("url", "failed", "errorText", "status", "wire", "wireStatus")}))
    # cache-served style: client events w/o wire
    for r in reqs:
        u = r.get("url") or ""
        if u.endswith("/style.css"):
            print("B1 style entry:", json.dumps({k: r.get(k) for k in r if k in ("url", "srvCache", "servedFromCache", "wire", "wireStatus", "status", "finEnc", "respEnc")}))

    # Row 2: "the wire status" (304 vs 200), run6-reval
    print()
    log6 = open(os.path.join(EV, "w4-t41-network/run6-reval/http.log")).read()
    statuses = re.findall(r'"GET [^"]*" (\d{3})', log6)
    from collections import Counter
    c = Counter(statuses)
    print("B2 run6-reval http.log request lines =", len(statuses), "status histogram =", dict(sorted(c.items())))
    j6 = json.load(open(os.path.join(EV, "w4-t41-network/run6-reval/journey.json")))
    rows = []
    for r in j6["requests"]:
        rows.append((r.get("url"), r.get("wireStatus") or r.get("wire"), r.get("status"), r.get("respEnc"), r.get("finEnc")))
    for row in rows:
        print("B2 req:", row)
    # prepass log presence
    pp = os.path.join(EV, "w4-t41-network/run6-reval/prepass/http.log")
    print("B2 prepass/http.log exists =", os.path.exists(pp), "bytes =", os.path.getsize(pp) if os.path.exists(pp) else None)


if __name__ == "__main__":
    main()