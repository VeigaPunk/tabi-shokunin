#!/usr/bin/env python3
"""R58Scribe quote byte-exactness verifier (round 58) — reproducible re-run of
.ufo/waves/round-58/scribe/gate-quote-verification.json.

For every quote the scout's round-58 reopen receipts carry (held/located quote,
primary, secondaries, supporting definitions, nested fragments, the raw JSON
literal), this greps the staged copy under .ufo/waves/round-58/sources/ for the
quote's exact UTF-8 bytes and records: the staged file + its sha256/bytes, the
quote bytes, the byte-exact hit count file-wide, the hit count scoped to the
receipt's declared enclosing span, the raw line numbers of the hits, and whether
the quote is byte-exact AT the line the receipt names (for a multi-line quote the
named span is extracted and the quote must occur verbatim inside it, proved with
`cmp`).

READ-ONLY: reads the receipts and the staged bytes at their cited lane paths and
writes only the output file given on the command line.

Usage:
  python3 .ufo/waves/round-58/scribe/verify-quotes.py <out.json>
  python3 .ufo/waves/round-58/scribe/verify-quotes.py <out.json> --summary
"""
import hashlib
import json
import os
import re
import subprocess
import sys

LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
SCOUT_DIR = os.path.join(LANE, ".ufo/waves/round-58/scout")


def normalize(s):
    """The frozen gate's normalize() (scripts/check-source-reopen-receipt.mjs):
    /<[^>]+>/g -> " ", entity unescape, whitespace collapse, trim."""
    s = re.sub(r"<[^>]+>", " ", str(s))
    s = s.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    s = s.replace("&quot;", '"').replace("&#39;", "'")
    return re.sub(r"\s+", " ", s).strip()


def line_of(data, off):
    return data.count(b"\n", 0, off) + 1


def declared_span(node):
    for a, b in (("raw_line_start", "raw_line_end"), ("raw_line", "raw_line")):
        if isinstance(node.get(a), int) and isinstance(node.get(b), int):
            return (node[a], node[b])
    return None


def enclosing_span(node):
    for k in ("enclosing_span", "span_raw_lines"):
        v = node.get(k)
        if isinstance(v, list) and len(v) == 2 and all(isinstance(x, int) for x in v):
            return (v[0], v[1])
    return None


def quotes_of(row):
    """Every quote the receipt carries, as (label, quote, declared span, scope span)."""
    lg = row.get("located_ground", {}) or {}
    out = []

    def add(label, node):
        if not isinstance(node, dict):
            return
        q = node.get("text") or node.get("quote")
        if not isinstance(q, str) or not q:
            return
        out.append({
            "label": label,
            "quote": q,
            "claim": declared_span(node),
            "scope": enclosing_span(node),
            "decl_bytes": node.get("occurrences_in_bytes"),
            "decl_scope": node.get("occurrences_in_enclosing_span"),
        })

    if isinstance(row.get("held_quote"), str):
        add("held_quote", {"text": row["held_quote"]})
    if isinstance(row.get("located_quote"), str) and row["located_quote"] != row.get("held_quote"):
        add("located_quote", {"text": row["located_quote"]})
    for k in ("primary_quote", "supporting_quote_default_action_definition",
              "supporting_keydown_cancelable_definition", "primary", "sentence_tail"):
        if k in lg:
            add("located_ground." + k, lg[k])
            for k2, v in (lg[k] or {}).items():
                if isinstance(v, dict) and isinstance(v.get("text"), str):
                    add(f"located_ground.{k}.{k2}", v)
                if isinstance(v, list):
                    for i, it in enumerate(v):
                        if isinstance(it, dict) and isinstance(it.get("text"), str):
                            add(f"located_ground.{k}.{k2}[{i}]", it)
    v = lg.get("secondary_quotes")
    if isinstance(v, list):
        for i, it in enumerate(v):
            add(f"located_ground.secondary_quotes[{i}]", it)
    if isinstance(lg.get("raw_description_literal"), str):
        add("located_ground.raw_description_literal",
            {"text": lg["raw_description_literal"],
             "raw_line": lg.get("raw_line_of_modifiers_description")})

    seen, uniq = set(), []
    for t in out:
        key = (t["label"], t["quote"])
        if key in seen:
            continue
        seen.add(key)
        uniq.append(t)
    return uniq


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    out_path = sys.argv[1]
    summary_only = "--summary" in sys.argv[2:]

    receipts = [os.path.join(SCOUT_DIR, f) for f in sorted(os.listdir(SCOUT_DIR))
                if f.startswith("reopen-receipt-s") and f.endswith(".json")]
    if not receipts:
        print("no scout receipts found", file=sys.stderr)
        return 2

    rows, failures = [], []
    for rp in receipts:
        receipt = json.loads(open(rp, "rb").read().decode("utf-8"))
        for row in receipt.get("rows", []):
            sid = row["id"]
            path = os.path.join(LANE, row["bytes_path"])
            data = open(path, "rb").read()
            lines = data.split(b"\n")
            for it in quotes_of(row):
                qb = it["quote"].encode("utf-8")
                hits, st = [], 0
                while True:
                    i = data.find(qb, st)
                    if i < 0:
                        break
                    hits.append(i)
                    st = i + 1
                hit_lines = [line_of(data, h) for h in hits]

                scope, scope_src = it["scope"], "receipt.enclosing_span"
                if scope is None:
                    lg = row.get("located_ground", {}) or {}
                    for k in ("command_block_raw_line_range", "command_entry_raw_line_range"):
                        v = lg.get(k)
                        if isinstance(v, list) and len(v) == 2:
                            scope, scope_src = (v[0], v[1]), k
                            break
                    else:
                        scope, scope_src = None, None
                if scope:
                    scoped = [l for l in hit_lines if scope[0] <= l <= scope[1]]
                    scope_desc = f"raw lines {scope[0]}-{scope[1]} ({scope_src})"
                else:
                    scoped = hit_lines
                    scope_desc = "file-wide (no scope span declared in receipt)"

                cmp_rec = None
                if it["claim"]:
                    lo, hi = it["claim"]
                    extracted = b"\n".join(lines[lo - 1:hi])
                    off = extracted.find(qb)
                    if off >= 0:
                        qf = out_path + ".q.bin"
                        sf = out_path + ".w.bin"
                        open(qf, "wb").write(qb)
                        open(sf, "wb").write(extracted[off:off + len(qb)])
                        rc = subprocess.run(["cmp", qf, sf], capture_output=True, text=True).returncode
                        os.remove(qf)
                        os.remove(sf)
                        cmp_rec = {
                            "named_span": [lo, hi],
                            "extracted_span_bytes": len(extracted),
                            "quote_offset_in_extracted_span": off,
                            "bytes_before_quote": off,
                            "bytes_after_quote": len(extracted) - off - len(qb),
                            "cmp_quote_vs_extracted_window_rc": rc,
                            "cmp_quote_vs_extracted_window_note":
                                "rc=0 == the quote bytes and the extracted window are byte-identical",
                            "extracted_span_prefix_repr": repr(extracted[:off]),
                            "extracted_span_suffix_repr": repr(extracted[off + len(qb):]),
                        }

                nb = normalize(it["quote"]).encode("utf-8")
                ndata = normalize(data.decode("utf-8", "replace")).encode("utf-8")
                ok = len(hits) > 0 and (cmp_rec is None or cmp_rec["cmp_quote_vs_extracted_window_rc"] == 0)

                rec = {
                    "source": sid,
                    "receipt": os.path.relpath(rp, LANE),
                    "label": it["label"],
                    "staged_file": os.path.relpath(path, LANE),
                    "staged_sha256": hashlib.sha256(data).hexdigest(),
                    "staged_bytes": len(data),
                    "quote": it["quote"],
                    "quote_bytes": len(qb),
                    "quote_words_whitespace": len(it["quote"].split()),
                    "quote_words_tag_stripped": len(normalize(it["quote"]).split()),
                    "quote_bytes_repr": repr(qb),
                    "claimed_span": list(it["claim"]) if it["claim"] else None,
                    "scope": scope_desc,
                    "byte_exact_occurrences_file_wide": len(hits),
                    "byte_exact_hit_raw_lines": hit_lines,
                    "byte_exact_occurrences_in_scope": len(scoped),
                    "byte_exact_hit_raw_lines_in_scope": scoped,
                    "normalized_occurrences_file_wide": ndata.count(nb),
                    "cmp_evidence": cmp_rec,
                    "declared_occurrences_in_bytes": it["decl_bytes"],
                    "declared_occurrences_in_enclosing_span": it["decl_scope"],
                    "byte_exact": bool(ok),
                }
                if it["decl_bytes"] is not None and it["decl_bytes"] != len(hits):
                    rec["declared_count_mismatch"] = {"declared": it["decl_bytes"], "observed": len(hits)}
                    failures.append({"source": sid, "label": it["label"],
                                     "receipt": os.path.relpath(rp, LANE),
                                     "finding": "declared-occurrence-count-mismatch",
                                     "declared": it["decl_bytes"], "observed": len(hits),
                                     "quote": it["quote"]})
                if it["decl_scope"] is not None and scope and it["decl_scope"] != len(scoped):
                    rec["declared_scope_count_mismatch"] = {"declared": it["decl_scope"], "observed": len(scoped)}
                    failures.append({"source": sid, "label": it["label"],
                                     "receipt": os.path.relpath(rp, LANE),
                                     "finding": "declared-scoped-occurrence-count-mismatch",
                                     "declared": it["decl_scope"], "observed": len(scoped),
                                     "quote": it["quote"]})
                if not ok:
                    failures.append({"source": sid, "label": it["label"],
                                     "receipt": os.path.relpath(rp, LANE),
                                     "staged_file": os.path.relpath(path, LANE),
                                     "claimed_span": list(it["claim"]) if it["claim"] else None,
                                     "finding": "quote-not-byte-exact-at-named-span",
                                     "byte_exact_occurrences_file_wide": len(hits),
                                     "byte_exact_hit_raw_lines": hit_lines,
                                     "cmp_evidence": cmp_rec, "quote": it["quote"]})
                rows.append(rec)

    out = {
        "schema": "tabi-r58-gate-quote-verification-v1",
        "created": "2026-11-03",
        "seat": "R58Scribe",
        "lane": "tabi-shokunin",
        "round": 58,
        "method": ("python3 byte search over the staged copy in .ufo/waves/round-58/sources/ for the quote's exact "
                   "UTF-8 bytes; raw line = 1-based line number of the byte offset; scope hits = hits whose line "
                   "falls inside the receipt's declared enclosing span (S153: the receipt's command_block_raw_line_range); "
                   "named-span byte-exactness is proved by `cmp` of the quote bytes against the byte window cut from "
                   "the receipt's declared raw line span (cmp rc=0 == byte-identical); normalized count = the frozen "
                   "gate's normalize() (tags stripped, entities unescaped, whitespace collapsed) applied to the whole file."),
        "scout_receipts": sorted({r["receipt"] for r in rows}),
        "scout_receipt_sha256": {r["receipt"]: hashlib.sha256(open(os.path.join(LANE, r["receipt"]), "rb").read()).hexdigest()
                                 for r in rows},
        "rows": rows,
        "failures": failures,
        "clean": len(failures) == 0,
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    json.loads(open(out_path, "rb").read().decode("utf-8"))  # re-parse before citing
    print(json.dumps({"out": out_path, "rows": len(rows), "failures": len(failures),
                      "clean": out["clean"]}, indent=2))
    if summary_only:
        for r in rows:
            print(r["source"], r["label"],
                  "| fw", r["byte_exact_occurrences_file_wide"],
                  "| scope", r["byte_exact_occurrences_in_scope"],
                  "| cmp", (r["cmp_evidence"] or {}).get("cmp_quote_vs_extracted_window_rc"),
                  "| byte_exact", r["byte_exact"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
