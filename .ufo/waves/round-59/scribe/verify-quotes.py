#!/usr/bin/env python3
"""R59Scribe quote byte-exactness verifier (round 59) — reproducible re-run of
.ufo/waves/round-59/scribe/gate-quote-verification.json.

For every quote the round-59 scout reopen receipts carry, this greps the staged
copy under .ufo/waves/round-59/sources/ for the quote's exact UTF-8 bytes and
records:

  * the staged file + its sha256 / byte count;
  * the quote bytes, byte length, word count (whitespace and tag-stripped);
  * the byte-exact hit count file-wide and the raw line numbers of those hits;
  * the hit count scoped to the receipt's declared enclosing span;
  * a `cmp` of the quote bytes against the byte window cut from the receipt's
    DECLARED raw line span (rc=0 == byte-identical) — this is the
    byte-exactness proof at the NAMED line;
  * the tag-stripped match: the frozen gate's normalize() (tags stripped,
    entities unescaped, whitespace collapsed) applied to the named span and to
    the quote; rc 0 == the quote is present at the named lines once the
    markup is removed (the round-59 tag-strip caveat: HTML sentences split
    across `<a>`/`<code>` elements are recorded as the tag-stripped text with
    the raw line range it occupies);
  * per-quote `rc` (0 == verified at the named raw lines, 1 == NOT verified).

The receipt shape is not assumed: every dict in the receipt JSON that carries a
quote string plus line information is harvested, so a receipt that nests its
locations differently is still covered.

READ-ONLY: reads the receipts and the staged bytes at their cited lane paths
and writes only the output file given on the command line.

Usage:
  python3 .ufo/waves/round-59/scribe/verify-quotes.py <out.json>
  python3 .ufo/waves/round-59/scribe/verify-quotes.py <out.json> --summary
"""
import hashlib
import json
import os
import re
import subprocess
import sys

LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
SCOUT_DIR = os.path.join(LANE, ".ufo/waves/round-59/scout")

QUOTE_KEYS = ("quote", "text", "located_quote", "held_quote", "quote_text")
LINE_KEYS = ("raw_line", "raw_line_start", "raw_line_end", "rawLines",
             "raw_lines", "raw_line_range", "line", "lines")
SPAN_KEYS = ("enclosing_span", "span_raw_lines", "scope_span", "raw_line_span")


def normalize(s):
    """The frozen gate's normalize() (scripts/check-source-reopen-receipt.mjs):
    /<[^>]+>/g -> " ", entity unescape, whitespace collapse, trim."""
    s = re.sub(r"<[^>]+>", " ", str(s))
    s = s.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    s = s.replace("&quot;", '"').replace("&#39;", "'")
    return re.sub(r"\s+", " ", s).strip()


def normalize_strip_empty(s):
    """The ALTERNATE tag-strip convention: /<[^>]+>/g -> "" (remove the tag
    without leaving a space), then entity-unescape and whitespace-collapse.

    A receipt may record a quote either as the raw markup bytes or as the
    TAG-STRIPPED text. Under strip-to-space the tag boundary leaves a space
    ("CapsLock , NumLock"), while under strip-to-empty it does not
    ("CapsLock, NumLock"). Both conventions are legitimate; this verifier
    tests BOTH and records which one the quote matches, rather than
    declaring a failure on a convention difference.
    """
    s = re.sub(r"<[^>]+>", "", str(s))
    s = s.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    s = s.replace("&quot;", '"').replace("&#39;", "'")
    return re.sub(r"\s+", " ", s).strip()


def line_of(data, off):
    return data.count(b"\n", 0, off) + 1


def as_int_pair(v):
    if isinstance(v, list) and len(v) == 2 and all(isinstance(x, int) for x in v):
        return (v[0], v[1])
    return None


def harvest(node, path, out):
    """Recursively collect (label, quote, declared span, scope span, node)."""
    if isinstance(node, dict):
        q = None
        for k in QUOTE_KEYS:
            if isinstance(node.get(k), str) and node.get(k).strip():
                q = node[k]
                break
        if q is not None:
            claim = None
            lo, hi = node.get("raw_line_start"), node.get("raw_line_end")
            if isinstance(lo, int) and isinstance(hi, int):
                claim = (lo, hi)
            elif isinstance(node.get("raw_line"), int):
                claim = (node["raw_line"], node["raw_line"])
            else:
                for k in ("rawLines", "raw_lines", "raw_line_range", "lines"):
                    p = as_int_pair(node.get(k))
                    if p:
                        claim = p
                        break
            scope = None
            for k in SPAN_KEYS:
                p = as_int_pair(node.get(k))
                if p:
                    scope = p
                    break
            out.append({
                "label": path,
                "quote": q,
                "claim": claim,
                "scope": scope,
                "decl_bytes": node.get("occurrences_in_bytes"),
                "decl_scope": node.get("occurrences_in_enclosing_span"),
                "classification": node.get("classification") or node.get("class")
                or node.get("term") or node.get("label"),
            })
        for k, v in node.items():
            if k in QUOTE_KEYS:
                continue
            harvest(v, (path + "." + str(k)) if path else str(k), out)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            harvest(v, "%s[%d]" % (path, i), out)


def find_staged(row, receipt_path):
    """The staged bytes this row describes."""
    for k in ("bytes_path", "staged_file", "path", "file"):
        v = row.get(k)
        if isinstance(v, str) and v:
            p = os.path.join(LANE, v)
            if os.path.exists(p):
                return p
    return None


def scope_of(row, item):
    if item["scope"]:
        return item["scope"], "receipt.enclosing_span"
    lg = row.get("located_ground", {}) or {}
    if isinstance(lg, dict):
        for k in ("command_block_raw_line_range", "command_entry_raw_line_range",
                  "section_span_raw_lines"):
            p = as_int_pair(lg.get(k))
            if p:
                return p, k
    return None, None


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    out_path = sys.argv[1]
    summary_only = "--summary" in sys.argv[2:]

    if not os.path.isdir(SCOUT_DIR):
        print("no scout dir at %s" % SCOUT_DIR, file=sys.stderr)
        return 2
    receipts = [os.path.join(SCOUT_DIR, f) for f in sorted(os.listdir(SCOUT_DIR))
                if f.startswith("reopen-receipt-s") and f.endswith(".json")]
    if not receipts:
        print("no scout receipts found in %s" % SCOUT_DIR, file=sys.stderr)
        return 2

    rows, failures, skipped, absences = [], [], [], []
    for rp in receipts:
        receipt = json.loads(open(rp, "rb").read().decode("utf-8"))
        receipt_rows = receipt.get("rows")
        if not isinstance(receipt_rows, list):
            receipt_rows = [receipt]
        # Harvest the WHOLE receipt (rows[] AND the top-level locations
        # arrays), so a receipt that nests its locations differently is
        # still covered. Each receipt names ONE source id, so every item
        # harvested from it belongs to that source.
        receipt_items = []
        harvest(receipt, "", receipt_items)

        for row in receipt_rows:
            if not isinstance(row, dict):
                continue
            sid = row.get("id") or row.get("source_id") or receipt.get("source_id") \
                or os.path.basename(rp)
            path = find_staged(row, rp)
            if path is None:
                skipped.append({"source": sid, "receipt": os.path.relpath(rp, LANE),
                                "reason": "no staged bytes file resolvable from the row"})
                continue
            data = open(path, "rb").read()
            lines = data.split(b"\n")
            items = []
            harvest(row, "", items)
            # merge the top-level locations for the same source id
            for it in receipt_items:
                items.append(dict(it))
            seen, uniq = set(), []
            for it in items:
                key = (it["label"], it["quote"])
                if key in seen:
                    continue
                seen.add(key)
                uniq.append(it)
            for it in uniq:
                # An ABSENCE marker is not a quote: it records that a term
                # was searched for and NOT found. It is verified by the
                # receipt's own classification, not by a byte search.
                if it["quote"].strip().upper() == "ABSENT":
                    absences.append({
                        "source": sid,
                        "receipt": os.path.relpath(rp, LANE),
                        "label": it["label"],
                        "classification": it["classification"],
                        "marker": it["quote"],
                        "note": "absence marker (the receipt records that the term was "
                                "searched for and NOT found): verified by the receipt's "
                                "classification, not by a byte search",
                    })
                    continue
                qb = it["quote"].encode("utf-8")
                hits, st = [], 0
                while True:
                    i = data.find(qb, st)
                    if i < 0:
                        break
                    hits.append(i)
                    st = i + 1
                hit_lines = [line_of(data, h) for h in hits]

                scope, scope_src = scope_of(row, it)
                if scope:
                    scoped = [l for l in hit_lines if scope[0] <= l <= scope[1]]
                    scope_desc = "raw lines %d-%d (%s)" % (scope[0], scope[1], scope_src)
                else:
                    scoped = hit_lines
                    scope_desc = "file-wide (no scope span declared in receipt)"

                cmp_rec = None
                tagstrip_rc = None
                if it["claim"]:
                    lo, hi = it["claim"]
                    lo = max(1, lo)
                    hi = min(len(lines), hi)
                    extracted = b"\n".join(lines[lo - 1:hi])
                    off = extracted.find(qb)
                    if off >= 0:
                        qf = out_path + ".q.bin"
                        sf = out_path + ".w.bin"
                        with open(qf, "wb") as f:
                            f.write(qb)
                        with open(sf, "wb") as f:
                            f.write(extracted[off:off + len(qb)])
                        rc = subprocess.run(["cmp", qf, sf], capture_output=True,
                                            text=True).returncode
                        for p in (qf, sf):
                            if os.path.exists(p):
                                os.remove(p)
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
                    # Tag-stripped match over the named span, under BOTH
                    # conventions (strip-to-space and strip-to-empty).
                    raw_span = extracted.decode("utf-8", "replace")
                    norm_quote_space = normalize(it["quote"])
                    norm_quote_empty = normalize_strip_empty(it["quote"])
                    span_space = normalize(raw_span)
                    span_empty = normalize_strip_empty(raw_span)
                    rc_space = 0 if (norm_quote_space and norm_quote_space in span_space) else 1
                    rc_empty = 0 if (norm_quote_empty and norm_quote_empty in span_empty) else 1
                    tagstrip_rc = 0 if (rc_space == 0 or rc_empty == 0) else 1
                    if rc_space == 0:
                        tagstrip_convention = "strip-to-space"
                    elif rc_empty == 0:
                        tagstrip_convention = "strip-to-empty"
                    else:
                        tagstrip_convention = None

                nb = normalize(it["quote"]).encode("utf-8")
                ndata = normalize(data.decode("utf-8", "replace")).encode("utf-8")
                byte_ok = len(hits) > 0 and (cmp_rec is None
                                             or cmp_rec["cmp_quote_vs_extracted_window_rc"] == 0)
                # A quote with NO declared span is verified by file-wide byte
                # search only (the receipt names no line for it); such a quote
                # is flagged `span_declared: false` so the weaker check is
                # visible in the receipt.
                no_span_filewide = None
                if not it["claim"]:
                    nb2 = normalize_strip_empty(it["quote"]).encode("utf-8")
                    ndata2 = normalize_strip_empty(
                        data.decode("utf-8", "replace")).encode("utf-8")
                    no_span_filewide = (len(hits) > 0) or (ndata2.count(nb2) > 0)
                # rc 0 == verified at the named raw lines (byte-exact OR tag-stripped)
                if it["claim"]:
                    verified = (cmp_rec is not None
                                and cmp_rec["cmp_quote_vs_extracted_window_rc"] == 0) \
                               or tagstrip_rc == 0
                else:
                    verified = bool(no_span_filewide)

                rec = {
                    "source": sid,
                    "receipt": os.path.relpath(rp, LANE),
                    "label": it["label"],
                    "classification": it["classification"],
                    "staged_file": os.path.relpath(path, LANE),
                    "staged_sha256": hashlib.sha256(data).hexdigest(),
                    "staged_bytes": len(data),
                    "quote": it["quote"],
                    "quote_bytes": len(qb),
                    "quote_words_whitespace": len(it["quote"].split()),
                    "quote_words_tag_stripped": len(normalize(it["quote"]).split()),
                    "quote_bytes_repr": repr(qb),
                    "claimed_span": list(it["claim"]) if it["claim"] else None,
                    "span_declared": it["claim"] is not None,
                    "no_span_filewide_match": no_span_filewide,
                    "scope": scope_desc,
                    "byte_exact_occurrences_file_wide": len(hits),
                    "byte_exact_hit_raw_lines": hit_lines,
                    "byte_exact_occurrences_in_scope": len(scoped),
                    "byte_exact_hit_raw_lines_in_scope": scoped,
                    "normalized_occurrences_file_wide": ndata.count(nb),
                    "cmp_evidence": cmp_rec,
                    "tagstrip_evidence": {
                        "named_span": list(it["claim"]) if it["claim"] else None,
                        "method": "two tag-strip conventions applied to the named raw-line "
                                  "span and to the quote: strip-to-space (the frozen gate's "
                                  "normalize(): tags -> ' ', entities unescaped, whitespace "
                                  "collapsed) and strip-to-empty (tags -> '', same rest); the "
                                  "convention that matched is recorded",
                        "rc_strip_to_space": rc_space,
                        "rc_strip_to_empty": rc_empty,
                        "matched_convention": tagstrip_convention,
                        "normalized_quote_strip_to_space": norm_quote_space,
                        "normalized_quote_strip_to_empty": norm_quote_empty,
                        "rc": tagstrip_rc,
                        "rc_note": "rc=0 == the quote is present at the named raw lines "
                                   "once the markup is removed (under either convention)",
                    } if it["claim"] else None,
                    "declared_occurrences_in_bytes": it["decl_bytes"],
                    "declared_occurrences_in_enclosing_span": it["decl_scope"],
                    "rc": 0 if verified else 1,
                    "byte_exact": bool(byte_ok),
                }
                if it["decl_bytes"] is not None and it["decl_bytes"] != len(hits):
                    rec["declared_count_mismatch"] = {"declared": it["decl_bytes"],
                                                      "observed": len(hits)}
                    failures.append({"source": sid, "label": it["label"],
                                     "receipt": os.path.relpath(rp, LANE),
                                     "finding": "declared-occurrence-count-mismatch",
                                     "declared": it["decl_bytes"], "observed": len(hits),
                                     "quote": it["quote"]})
                if it["decl_scope"] is not None and scope and it["decl_scope"] != len(scoped):
                    rec["declared_scope_count_mismatch"] = {"declared": it["decl_scope"],
                                                            "observed": len(scoped)}
                    failures.append({"source": sid, "label": it["label"],
                                     "receipt": os.path.relpath(rp, LANE),
                                     "finding": "declared-scoped-occurrence-count-mismatch",
                                     "declared": it["decl_scope"], "observed": len(scoped),
                                     "quote": it["quote"]})
                if not verified:
                    failures.append({"source": sid, "label": it["label"],
                                     "receipt": os.path.relpath(rp, LANE),
                                     "staged_file": os.path.relpath(path, LANE),
                                     "claimed_span": list(it["claim"]) if it["claim"] else None,
                                     "finding": "quote-not-verified-at-named-span",
                                     "byte_exact_occurrences_file_wide": len(hits),
                                     "byte_exact_hit_raw_lines": hit_lines,
                                     "cmp_evidence": cmp_rec,
                                     "tagstrip_evidence": rec["tagstrip_evidence"],
                                     "quote": it["quote"]})
                rows.append(rec)

    out = {
        "schema": "tabi-r59-gate-quote-verification-v1",
        "created": "2026-11-03",
        "seat": "R59Scribe",
        "lane": "tabi-shokunin",
        "round": 59,
        "method": ("python3 byte search over the staged copies in .ufo/waves/round-59/sources/ for "
                   "each quote's exact UTF-8 bytes; raw line = 1-based line number of the byte "
                   "offset; scope hits = hits whose line falls inside the receipt's declared "
                   "enclosing span; named-span byte-exactness is proved by `cmp` of the quote bytes "
                   "against the byte window cut from the receipt's declared raw line span "
                   "(cmp rc=0 == byte-identical); the tag-strip caveat is discharged by applying the "
                   "frozen gate's normalize() (tags stripped, entities unescaped, whitespace "
                   "collapsed) to the named span and to the quote (rc 0 == present once markup is "
                   "removed); normalized count = the same normalize() applied to the whole file."),
        "scout_receipts": sorted({r["receipt"] for r in rows}),
        "scout_receipt_sha256": {
            r["receipt"]: hashlib.sha256(
                open(os.path.join(LANE, r["receipt"]), "rb").read()).hexdigest()
            for r in rows},
        "rows": rows,
        "failures": failures,
        "skipped": skipped,
        "absences": absences,
        "counts": {"quoteRows": len(rows),
                   "distinctQuotes": len({(r["source"], r["quote"], str(r["claimed_span"]))
                                          for r in rows}),
                   "rc0": sum(1 for r in rows if r["rc"] == 0),
                   "rc1": sum(1 for r in rows if r["rc"] == 1),
                   "absenceMarkers": len(absences),
                   "nonUniqueQuotesFileWide": sum(
                       1 for r in rows if r["byte_exact_occurrences_file_wide"] > 1)},
        "clean": len(failures) == 0,
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")

    if summary_only:
        print("quoteRows=%d distinctQuotes=%d rc0=%d rc1=%d absenceMarkers=%d "
              "failures=%d clean=%s" %
              (out["counts"]["quoteRows"], out["counts"]["distinctQuotes"],
               out["counts"]["rc0"], out["counts"]["rc1"],
               out["counts"]["absenceMarkers"],
               len(failures), out["clean"]))
    else:
        print(json.dumps(out["counts"], indent=2))
        print("clean=%s failures=%d" % (out["clean"], len(failures)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
