#!/usr/bin/env python3
"""Three-site predicate-sentence identity extractor (round-43, seat ExecSentence).

Extracts, for each of C1 and C2, the predicate sentence at three sites:
  1. claims.json member (C1 -> claims[0].counterPredicate, C2 -> claims[1].predicate)
  2. header "PREDICATE-SENTENCE:" comment line in the counter/checker
  3. "const PREDICATE" string literal in the counter/checker, with \' unescaped
Computes sha256 of each and reports the diff verdict.
"""
import hashlib, json, re, sys, os

FROZEN = sys.argv[1] if len(sys.argv) > 1 else "/fast/scratch/hyaku/tabi-r43/ExecSentence/frozen"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/fast/scratch/hyaku/tabi-r43/ExecSentence/out"

def sha(b):
    return hashlib.sha256(b).hexdigest()

def read(p):
    with open(p, "rb") as f:
        return f.read()

def extract_header_comment(text):
    """Return the sentence text after the '// PREDICATE-SENTENCE:' marker (single line)."""
    hits = []
    for line in text.split("\n"):
        s = line.strip()
        m = re.match(r"^//\s*PREDICATE-SENTENCE:\s*(.*)$", s)
        if m:
            hits.append(m.group(1))
    return hits

def extract_const_predicate(text):
    """Return the literal value of `const PREDICATE = '...'` with \\' unescaped."""
    hits = []
    for m in re.finditer(r"const\s+PREDICATE\s*=\s*'((?:[^'\\]|\\.)*)'", text):
        raw = m.group(1)
        # unescape JS single-quoted string escapes: \' -> '  \\ -> \
        val = raw.replace("\\'", "'").replace("\\\\", "\\")
        hits.append((raw, val))
    return hits

def norm_bytes(s):
    return s.encode("utf-8")

claims = json.loads(read(os.path.join(FROZEN, "claims.json")).decode("utf-8"))
c1_src = read(os.path.join(FROZEN, "c1-signature-bound-v5.mjs")).decode("utf-8")
c2_src = read(os.path.join(FROZEN, "check-routed-defects-round43.mjs")).decode("utf-8")

results = {}

# --- C1 ---
c1_claim = next(c for c in claims["claims"] if c["id"] == "C1")
site_claims = c1_claim["counterPredicate"]
hdr = extract_header_comment(c1_src)
cst = extract_const_predicate(c1_src)
assert len(hdr) == 1, f"C1 header comment count = {len(hdr)}"
assert len(cst) == 1, f"C1 const PREDICATE count = {len(cst)}"
results["C1"] = {
    "sites": {
        "claims.json claims[0].counterPredicate": site_claims,
        "c1-signature-bound-v5.mjs header PREDICATE-SENTENCE comment": hdr[0],
        "c1-signature-bound-v5.mjs const PREDICATE (\\' unescaped)": cst[0][1],
    },
    "const_raw_escaped": cst[0][0],
}

# --- C2 ---
c2_claim = next(c for c in claims["claims"] if c["id"] == "C2")
site_claims2 = c2_claim["predicate"]
hdr2 = extract_header_comment(c2_src)
cst2 = extract_const_predicate(c2_src)
assert len(hdr2) == 1, f"C2 header comment count = {len(hdr2)}"
assert len(cst2) == 1, f"C2 const PREDICATE count = {len(cst2)}"
results["C2"] = {
    "sites": {
        "claims.json claims[1].predicate": site_claims2,
        "check-routed-defects-round43.mjs header PREDICATE-SENTENCE comment": hdr2[0],
        "check-routed-defects-round43.mjs const PREDICATE (\\' unescaped)": cst2[0][1],
    },
    "const_raw_escaped": cst2[0][0],
}

os.makedirs(OUT, exist_ok=True)
summary = {}
for cid, r in results.items():
    site_info = {}
    vals = []
    for name, val in r["sites"].items():
        h = sha(norm_bytes(val))
        site_info[name] = {"sha256": h, "bytes": len(norm_bytes(val)), "chars": len(val)}
        vals.append((name, val, h))
    uniq = sorted({h for _, _, h in vals})
    verdict = "IDENTICAL" if len(uniq) == 1 else "DIVERGENT"
    # pairwise byte diff detail
    diffs = []
    base_name, base_val, base_h = vals[0]
    for name, val, h in vals[1:]:
        if val != base_val:
            diffs.append(f"{base_name} != {name}")
    summary[cid] = {
        "sites": site_info,
        "distinct_sha256_count": len(uniq),
        "verdict": verdict,
        "divergences": diffs,
        "three_site_sha256": {n: h for n, _, h in vals},
        "text": {n: v for n, v, _ in vals},
    }
    with open(os.path.join(OUT, f"{cid}-sites.json"), "w") as f:
        json.dump({"id": cid, "sites": site_info}, f, indent=2, ensure_ascii=False)
        f.write("\n")
    with open(os.path.join(OUT, f"{cid}-sentence.txt"), "w") as f:
        for n, v, _ in vals:
            f.write(f"=== {n} ===\n{v}\n")
    with open(os.path.join(OUT, f"{cid}-sentence-sha256.txt"), "w") as f:
        for n, v, h in vals:
            f.write(f"{h}  {n}\n")

with open(os.path.join(OUT, "summary.json"), "w") as f:
    json.dump(summary, f, indent=2, ensure_ascii=False)
    f.write("\n")

for cid, s in summary.items():
    print(f"[{cid}] verdict={s['verdict']} distinct_sha256={s['distinct_sha256_count']}")
    for n, h in s["three_site_sha256"].items():
        print(f"  {h}  {n}  ({s['sites'][n]['bytes']} bytes)")
    for d in s["divergences"]:
        print(f"  DIVERGENCE: {d}")
