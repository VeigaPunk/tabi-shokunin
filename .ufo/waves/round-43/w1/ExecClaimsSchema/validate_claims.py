#!/usr/bin/env python3
"""Machine-validate round-43 claims.json (schema tabi-round-claims-v2)."""
import hashlib
import json
import os
import subprocess
import sys

REPO = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
CLAIMS = os.path.join(REPO, ".ufo/waves/round-43/claims.json")
SCRATCH = "/fast/scratch/hyaku/tabi-r43/ExecClaimsSchema"
FROZEN_COMMIT = "7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc"

results = []


def rec(name, ok, detail):
    results.append({"check": name, "ok": bool(ok), "detail": detail})
    print(f"[{'PASS' if ok else 'FAIL'}] {name}: {detail}")


# --- 1. parses ---
raw = open(CLAIMS, "rb").read()
try:
    doc = json.loads(raw.decode("utf-8"))
    rec("parses", True, f"JSON parsed, {len(raw)} bytes, utf-8")
except Exception as e:  # noqa: BLE001
    rec("parses", False, f"JSON parse error: {e}")
    doc = None

if doc is None:
    json.dump(results, open(os.path.join(SCRATCH, "results.json"), "w"), indent=2)
    sys.exit(1)

# --- 2. schema ---
rec("schema==tabi-round-claims-v2", doc.get("schema") == "tabi-round-claims-v2",
    f"schema={doc.get('schema')!r}")

# --- 3. two claims, distinct axes ---
claims = doc.get("claims") or []
rec("claims.length==2", len(claims) == 2, f"length={len(claims)}")
axes = [c.get("axis") for c in claims]
ids = [c.get("id") for c in claims]
rec("claims.axes.distinct", len(set(axes)) == len(axes) and all(axes),
    f"axes={axes} ids={ids}")

# --- 4. controlBindings: length 8, sha256 of working-tree file, quote verbatim ---
bindings = doc.get("controlBindings") or []
rec("controlBindings.length==8", len(bindings) == 8, f"length={len(bindings)}")

bind_rows = []
for b in bindings:
    p = b.get("path")
    expected = b.get("sha256")
    quote = b.get("quote")
    full = os.path.join(REPO, p) if p else None
    row = {"path": p, "expectedSha256": expected, "quote": quote,
           "fileExists": bool(full and os.path.isfile(full))}
    if not row["fileExists"]:
        row.update(actualSha256=None, sha256Match=False, quoteVerbatim=False,
                   note="file missing in working tree")
        rec(f"binding.sha256[{p}]", False, "control file missing in working tree")
        rec(f"binding.quote[{p}]", False, "control file missing in working tree")
        bind_rows.append(row)
        continue
    data = open(full, "rb").read()
    actual = hashlib.sha256(data).hexdigest()
    row["actualSha256"] = actual
    row["sha256Match"] = (actual == expected)
    text = data.decode("utf-8", errors="replace")
    row["quoteVerbatim"] = quote in text
    row["quoteLen"] = len(quote) if quote is not None else None
    row["fileBytes"] = len(data)
    rec(f"binding.sha256[{p}]", row["sha256Match"],
        f"expected={expected} actual={actual} match={row['sha256Match']}")
    rec(f"binding.quote[{p}]", row["quoteVerbatim"],
        f"quoteLen={row['quoteLen']} verbatim={row['quoteVerbatim']}")
    bind_rows.append(row)

rec("controlBindings.all.sha256Match", all(r["sha256Match"] for r in bind_rows),
    f"{sum(1 for r in bind_rows if r['sha256Match'])}/{len(bind_rows)} sha256 match")
rec("controlBindings.all.quoteVerbatim", all(r["quoteVerbatim"] for r in bind_rows),
    f"{sum(1 for r in bind_rows if r['quoteVerbatim'])}/{len(bind_rows)} quotes verbatim")
rec("controlBindings.quoteMinLen>=8", all((r["quoteLen"] or 0) >= 8 for r in bind_rows),
    "all quotes >= 8 chars")

# --- 5. sentenceIdentity sites exist as files ---
si = doc.get("sentenceIdentity") or {}
si_rows = []
for claim_id, block in si.items():
    for site in (block.get("sites") or []):
        # site form: "<path> <locator...>" -> path is up to first space
        fpath = site.split(" ")[0]
        exists = os.path.isfile(os.path.join(REPO, fpath))
        si_rows.append({"claim": claim_id, "site": site, "file": fpath, "exists": exists})
        rec(f"sentenceIdentity.site[{claim_id}] {fpath}", exists,
            f"site={site!r} exists={exists}")
rec("sentenceIdentity.claimsCovered", set(si.keys()) == set(ids),
    f"sentenceIdentity claims={sorted(si.keys())} claims ids={sorted(ids)}")

# --- 6. verdicts pending ---
verdicts = {c.get("id"): c.get("verdict") for c in claims}
rec("claims.verdicts.pending", all(v == "pending" for v in verdicts.values()),
    f"verdicts={verdicts}")

# --- 7. measuredRevision null ---
mrs = {c.get("id"): c.get("measuredRevision", "MISSING") for c in claims}
rec("claims.measuredRevision.null",
    all(v is None for v in mrs.values()), f"measuredRevision={mrs}")

# --- extra: frozen commit parity of claims.json ---
try:
    blob = subprocess.run(["git", "-C", REPO, "rev-parse", f"{FROZEN_COMMIT}:.ufo/waves/round-43/claims.json"],
                          capture_output=True, text=True, check=True).stdout.strip()
    fsha = hashlib.sha256(raw).hexdigest()
    gitsha = subprocess.run(["git", "-C", REPO, "cat-file", "blob", blob],
                            capture_output=True, check=True).stdout
    gitsha = hashlib.sha256(gitsha).hexdigest()
    rec("claims.json.parity-with-frozen-commit", fsha == gitsha,
        f"frozen blob={blob} sha256(worktree)={fsha} sha256(committed)={gitsha}")
except Exception as e:  # noqa: BLE001
    rec("claims.json.parity-with-frozen-commit", False, f"git error: {e}")

# --- extra: frozenDigests parity against working tree ---
fd_rows = []
for rel, dig in (doc.get("frozenDigests") or {}).items():
    full = os.path.join(REPO, rel)
    ok = os.path.isfile(full)
    actual = hashlib.sha256(open(full, "rb").read()).hexdigest() if ok else None
    fd_rows.append({"path": rel, "expected": dig, "actual": actual, "match": actual == dig})
    rec(f"frozenDigest[{rel}]", actual == dig, f"expected={dig} actual={actual}")
rec("frozenDigests.allMatch", all(r["match"] for r in fd_rows),
    f"{sum(1 for r in fd_rows if r['match'])}/{len(fd_rows)} match")

# --- extra: sentenceIdentity byteIdentical truth (declared true) ---
def extract(doc_txt, claim_id, which):
    d = json.loads(doc_txt)
    c = next(x for x in d["claims"] if x["id"] == claim_id)
    return c[which]

byte_rows = []
for claim_id, block in si.items():
    which = "counterPredicate" if claim_id == "C1" else "predicate"
    d = json.loads(raw.decode("utf-8"))
    sentence = next(x for x in d["claims"] if x["id"] == claim_id)[which]
    for site in block.get("sites") or []:
        fpath = site.split(" ")[0]
        if fpath.endswith("claims.json"):
            continue
        text = open(os.path.join(REPO, fpath), encoding="utf-8").read()
        present = sentence in text
        byte_rows.append({"claim": claim_id, "file": fpath, "sentencePresent": present,
                          "sentenceSha256": hashlib.sha256(sentence.encode()).hexdigest(),
                          "sentenceLen": len(sentence)})
        rec(f"byteIdentical[{claim_id}] in {fpath}", present,
            f"sentence occurrence present={present} len={len(sentence)}")
rec("sentenceIdentity.byteIdentical.allPresent", all(r["sentencePresent"] for r in byte_rows),
    f"{sum(1 for r in byte_rows if r['sentencePresent'])}/{len(byte_rows)} occurrences present")

out = {
    "repo": REPO,
    "claimsPath": CLAIMS,
    "frozenCommit": FROZEN_COMMIT,
    "checks": results,
    "summary": {
        "total": len(results),
        "passed": sum(1 for r in results if r["ok"]),
        "failed": sum(1 for r in results if not r["ok"]),
        "failedChecks": [r["check"] for r in results if not r["ok"]],
    },
    "bindingRows": bind_rows,
    "sentenceIdentityRows": si_rows,
    "byteIdenticalRows": byte_rows,
    "frozenDigestRows": fd_rows,
}
json.dump(out, open(os.path.join(SCRATCH, "results.json"), "w"), indent=2)
print("\nSUMMARY: %d/%d passed, %d failed" % (out["summary"]["passed"], out["summary"]["total"],
                                              out["summary"]["failed"]))
if out["summary"]["failedChecks"]:
    print("FAILED: " + ", ".join(out["summary"]["failedChecks"]))
sys.exit(0 if out["summary"]["failed"] == 0 else 2)
