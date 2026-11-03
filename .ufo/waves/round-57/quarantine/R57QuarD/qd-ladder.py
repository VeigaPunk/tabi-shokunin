#!/usr/bin/env python3
"""r57 quarantine hand-check, seat R57QuarD: quote location ladder.

Fold functions are byte-identical copies of R57QuarA/laddr.py (same seat
contract, same round) so the two half-slices are checked by one instrument:
  f0 exact substring in raw bytes
  f1 case-insensitive
  f2 whitespace runs collapsed to single spaces
  f3 HTML entities decoded
  f4 HTML tags stripped to text then f2
  f5 f4 + case-insensitive
  f6 backtick/quote/punctuation-stripped then f2
No network access. Reads only the files named in --spec.

Additions over laddr.py (needed for this half-slice, no fold change):
  * crossBins: the same ladder run on other rows' fetched sources, to say
    WHERE a fragment that is absent from its own cited source does live;
  * nearMatch: longest common prefix/suffix and the first divergent char,
    recorded as a diagnostic only - it never changes a verdict;
  * emits the row JSON shape the seat contract names.

Usage:
  qd-ladder.py --spec rows.json --out OUTDIR
"""
import argparse, hashlib, html, json, os, re, string, sys

FOLDS = ["f0", "f1", "f2", "f3", "f4", "f5", "f6"]
_WS = re.compile(r"\s+")
_TAGS = re.compile(r"<[^>]*>")
_PUNCT = set(string.punctuation) | set("`´‘’“”„‟«»‹›，。、；：？！（）【】《》…—–·")


def _collapse(s):
    return _WS.sub(" ", s)


def _strip_punct(s):
    return "".join(ch for ch in s if ch not in _PUNCT)


def variants(raw, text=None):
    srctext = text if text is not None else raw.decode("utf-8", errors="replace")
    ent = html.unescape(srctext)
    notags = _TAGS.sub("", srctext)
    return {
        "f0": (srctext.encode("utf-8") if text is not None else raw, "bytes"),
        "f1": (srctext.lower(), "str"),
        "f2": (_collapse(srctext), "str"),
        "f3": (ent, "str"),
        "f4": (_collapse(notags), "str"),
        "f5": (_collapse(notags).lower(), "str"),
        "f6": (_collapse(_strip_punct(srctext)), "str"),
    }


def needle(fold, frag):
    if fold == "f0":
        return frag.encode("utf-8")
    if fold in ("f1", "f5"):
        return frag.lower()
    if fold == "f2":
        return _collapse(frag)
    if fold == "f3":
        return html.unescape(frag)
    if fold == "f4":
        return _collapse(frag)
    if fold == "f6":
        return _collapse(_strip_punct(frag))
    raise SystemExit("unknown fold " + fold)


def hits(raw, text, fold, frag):
    hay, kind = variants(raw, text)[fold]
    ndl = needle(fold, frag)
    if not ndl:
        return []
    out, start = [], 0
    while True:
        i = hay.find(ndl, start)
        if i < 0:
            break
        if kind == "bytes":
            line = hay.count(b"\n", 0, i) + 1
        else:
            line = hay.count("\n", 0, i) + 1
        out.append((line, i))
        start = i + max(1, len(ndl))
    return out


def near_match(raw, text, frag):
    """Diagnostic only: nearest source window and the first divergent character.

    Prefix-anchored: search f0 for the quote's longest usable prefix, then diff
    the quote against the document at that offset. Falls back to a strided
    window scan when no prefix of the quote occurs at all.
    """
    srctext = text if text is not None else raw.decode("utf-8", errors="replace")
    for k in (len(frag), max(8, len(frag) * 3 // 4), max(6, len(frag) // 2), 6):
        k = min(k, len(frag))
        pre = frag[:k]
        i = srctext.find(pre)
        if i < 0:
            continue
        window = srctext[i:i + len(frag)]
        diffs = [(j, a, b) for j, (a, b) in enumerate(zip(window, frag)) if a != b]
        first = None
        if diffs:
            j, a, b = diffs[0]
            first = {"index": j, "source": a, "sourceCodepoint": "U+%04X" % ord(a),
                     "quote": b, "quoteCodepoint": "U+%04X" % ord(b)}
        ws = sum(1 for _, a, b in diffs if a.isspace() or b.isspace())
        if len(diffs) > max(2, len(frag) // 10):
            return None  # not a near-verbatim hit; a window report would mislead
        return {"method": "prefix-anchored", "prefixMatched": k, "line": srctext.count("\n", 0, i) + 1,
                "char": i, "sourceWindow": window, "mismatches": len(diffs),
                "mismatchKinds": {"whitespace": ws, "character": len(diffs) - ws},
                "firstDivergence": first}
    doc = srctext.lower()
    n = frag.lower()
    best = None
    L = len(n)
    if not L:
        return None
    step = max(1, L // 4)
    for i in range(0, max(1, len(doc) - L + 1), step):
        w = doc[i:i + L]
        d = sum(1 for a, b in zip(w, n) if a != b) + abs(len(w) - len(n))
        if best is None or d < best[0]:
            best = (d, i, w)
            if d == 0:
                break
    if best is None:
        return None
    d, i, w = best
    first = None
    for k, (a, b) in enumerate(zip(w, n)):
        if a != b:
            first = {"index": k, "source": a, "sourceCodepoint": "U+%04X" % ord(a),
                     "quote": b, "quoteCodepoint": "U+%04X" % ord(b)}
            break
    raw_src = (text if text is not None else raw.decode("utf-8", errors="replace"))
    line = raw_src.count("\n", 0, i) + 1
    if d > max(2, L // 10):
        return None
    return {"method": "strided-window", "substitutionsPlusIndel": d, "line": line, "char": i,
            "sourceWindow": raw_src[i:i + L], "firstDivergence": first}


def alt_locates(raw, frag):
    """Boundary-tolerant diagnostics (NEVER a verdict): would the fragment be
    present if tag stripping kept a space, if all whitespace were ignored, or if
    Markdown backticks were dropped as well as punctuation?"""
    text = raw.decode("utf-8", "replace")
    q = _collapse(frag)
    tags_space = _collapse(_TAGS.sub(" ", text))
    tags_none = _collapse(_TAGS.sub("", text))
    stripws = lambda x: re.sub(r"\s+", "", x)
    return {
        "tagsAsSpace": q in tags_space,
        "tagsAsSpace_whitespaceStripped": stripws(q) in stripws(tags_space),
        "whitespaceStripped": stripws(q) in stripws(text),
        "markdownAware": (_collapse(_strip_punct(q.replace("`", ""))) in
                          _collapse(_strip_punct(tags_none))),
    }


def ladder(raw, text, frag):
    table, found = {}, None
    for f in FOLDS:
        h = hits(raw, text, f, frag)
        table[f] = len(h)
        if found is None and h:
            found = {"fold": f, "hits": len(h),
                     "where": [{"line": L, "byte": B} for L, B in h[:5]]}
    return table, found


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args(argv)
    rows = json.load(open(a.spec, encoding="utf-8"))
    os.makedirs(a.out, exist_ok=True)
    for row in rows:
        raw = open(row["bin"], "rb").read()
        out = dict(row)
        out.pop("bin", None)
        out["contentSha256"] = hashlib.sha256(raw).hexdigest()
        out["bytes"] = len(raw)
        frags = []
        for fr in row["fragments"]:
            frag = fr["quote"]
            table, found = ladder(raw, None, frag)
            rec = {"quote": frag, "rawCell": fr.get("rawCell", frag),
                   "fold": found["fold"] if found else None,
                   "located": bool(found),
                   "where": found["where"][0] if found else None,
                   "hitsPerFold": table,
                   "command": (f"python3 .ufo/waves/round-57/quarantine/R57QuarD/qd-ladder.py "
                               f"--spec {os.path.basename(a.spec)} --out {a.out}  # row {row['id']}"),
                   }
            rec["nearMatch"] = None if found else near_match(raw, None, frag)
            rec["altLocates"] = None if found else alt_locates(raw, frag)
            cross = []
            for cb in row.get("crossBins", []):
                craw = open(cb["bin"], "rb").read()
                ctable, cfound = ladder(craw, None, frag)
                cross.append({"label": cb["label"], "row": cb.get("row"),
                              "url": cb.get("url"),
                              "sha256": hashlib.sha256(craw).hexdigest(),
                              "fold": cfound["fold"] if cfound else None,
                              "hits": cfound["hits"] if cfound else 0,
                              "where": (cfound["where"][0] if cfound else None),
                              "hitsPerFold": ctable,
                              "nearMatch": None if cfound else near_match(craw, None, frag)})
            rec["crossBins"] = cross
            frags.append(rec)
        out["fragments"] = frags
        n_loc = sum(1 for f in frags if f["located"])
        cross_loc = [f["quote"] for f in frags if not f["located"] and any(c["fold"] for c in f["crossBins"])]
        out["locatedCount"] = n_loc
        out["locatedAtOtherRow"] = cross_loc
        # consistency asserts: the authored verdict must agree with the ladder
        v = row["verdict"]
        if v == "quote-located":
            assert n_loc == len(frags), (row["id"], "quote-located but not all located")
        elif v == "partial-located":
            assert 0 < n_loc < len(frags), (row["id"], "partial-located but loc=" + str(n_loc))
        else:
            assert n_loc == 0, (row["id"], "non-located verdict with located fragments")
        if v == "mispaired":
            carried_next = row.get("pairingCrossCheck", {}).get("nextStagedRow", {}).get("carriesFragment", 0)
            assert cross_loc or carried_next, (row["id"], "mispaired without a cross-bin or next-staged-row carrier")
        with open(os.path.join(a.out, row["id"] + ".json"), "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, indent=1)
        print(f"{row['id']}: verdict={v} located={n_loc}/{len(frags)} cross={len(cross_loc)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
