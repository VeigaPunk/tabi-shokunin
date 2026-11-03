#!/usr/bin/env python3
"""r57 quarantine hand-check part A (R57QuarA): generate one verdict receipt per
register row.

Inputs (all read-only):
  register rows  /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
  staged rows    /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md
  fetched bytes  <scratch>/*.bin (+ pdftotext extractions)

Output: <wave>/quarantine/R57QuarA/S<id>.json

Decision rule (frozen here, before the receipts are read):
  1. all register fragments located in the row's cited artifact        -> quote-located
  2. some located, some not, in the same artifact set                  -> partial-located
  3. none in the row's own artifacts, but >=1 located in another row's
     cited artifact                                                    -> mispaired
  4. fetch non-2xx / guard refusal                                     -> unreachable
  5. text extraction impossible for a binary source                    -> extraction-unavailable
  6. fetched clean 2xx non-empty and no fragment under the whole ladder-> absent-confirmed
The row's "artifact set" = the register URL, plus the staged URL when it is a
different URL string, plus companions the staged row names for the same id.
"""
import hashlib
import json
import os
import re
import sys

WAVE = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-57/quarantine/R57QuarA"
S = "/fast/scratch/hyaku/tabi-r57/R57QuarA"
sys.path.insert(0, WAVE)
import laddr

REG = "/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md"
STAGED = "/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md"
MINE = ["S102", "S106", "S109", "S110", "S111", "S114", "S117", "S118", "S124", "S125"]


def load_register():
    out = []
    for line in open(REG, encoding="utf-8"):
        if not line.startswith("| `"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 7 and cells[0] == "`tabi`" and cells[2] in MINE:
            out.append({
                "id": cells[2], "round": cells[1], "class": cells[3].strip("`"),
                "url": cells[4].strip("`"), "quoteCell": cells[5], "note": cells[6],
            })
    return out


def load_staged():
    out = {}
    for line in open(STAGED, encoding="utf-8"):
        if not line.startswith("| S"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if cells and cells[0] in MINE:
            out[cells[0]] = {"source": cells[1], "anchor": cells[5] if len(cells) > 5 else "",
                             "rowCells": len(cells)}
    return out


def url_in(text):
    m = re.search(r"https?://[^\s()]+", text or "")
    return m.group(0).rstrip(".,;") if m else None


def deq(cell):
    c = cell.strip()
    return c[1:-1] if len(c) > 2 and c[0] == "`" and c[-1] == "`" else c


def token_regex(frag, fold):
    toks = [t for t in re.split(r"\s+", frag) if t]
    sep = r"\s+"
    if fold in ("f4", "f5"):
        sep = r"(?:\s|<[^>]*>)+"
    if fold == "f6":
        toks = [re.sub(r"[^\w\u3000-\u9fff]+", "", t) for t in toks]
        toks = [t for t in toks if t]
        sep = r"[^A-Za-z0-9\u3000-\u9fff]*"
    body = sep.join(re.escape(t) for t in toks)
    flags = re.I if fold in ("f1", "f5") else 0
    return re.compile(body, flags)


def locate(text, frag, fold):
    """(hits[(line,char)], span) for the first hit, on the given text."""
    hs = laddr.hits(text.encode("utf-8"), text, fold, frag)
    span = None
    if hs:
        m = token_regex(frag, fold).search(text)
        if m:
            span = m.group(0)
    return hs, span


ARTIFACTS = {
    # name: (path, url, text_path)
    "S102": ("S102.bin", "https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/README.md", None),
    "S106": ("S106.bin", "https://www.rfc-editor.org/rfc/rfc9309.txt", None),
    "S109": ("S109.bin", "https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md", None),
    "S109blob": ("S109blob.bin", "https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md", None),
    "S110": ("S110.bin", "https://www.rfc-editor.org/rfc/rfc6585.txt", None),
    "S111": ("S111.bin", "https://developer.chrome.com/docs/ai/webmcp/secure-tools", None),
    "S111zh": ("S111zh.bin", "https://developer.chrome.google.cn/docs/ai/webmcp/secure-tools?hl=zh-cn", None),
    "S114": ("S114.bin", "https://www.juse.jp/sqip/symposium/2025/timetable/files/B1-2_ronbun.pdf", "S114.txt"),
 "S117": ("S117.bin", "https://webmachinelearning.github.io/webmcp/", None),
    "S118abs": ("S118.bin", "https://arxiv.org/abs/2305.11506", None),
    "S118pdf": ("S118.pdf", "https://arxiv.org/pdf/2305.11506v1", "S118.txt"),
    "S118p4": ("S118.pdf", "https://arxiv.org/pdf/2305.11506v1 [page 4, reading-order extraction]", "p4.txt"),
    "S124": ("S124.bin", "https://www.rfc-editor.org/rfc/rfc9110.txt", None),
    "S125": ("S125.bin", "https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt", None),
    "N_S103": ("N_S103.bin", "https://developer.chrome.com/docs/extensions/reference/api/debugger", None),
    "N_S107": ("N_S107.bin", "https://developer.chrome.com/docs/devtools/agents/webmcp-debugging?hl=zh-tw", None),
    "N_S126": ("N_S126.bin", "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api", None),
}

# row -> (cited artifact, [same-id companion artifacts])
OWN = {
    "S102": ("S102", []),
    "S106": ("S106", []),
    "S109": ("S109", ["S109blob"]),
    "S110": ("S110", []),
    "S111": ("S111", ["S111zh"]),
    "S114": ("S114", []),
 "S117": ("S117", []),
    "S118": ("S118abs", ["S118pdf", "S118p4"]),
    "S124": ("S124", []),
    "S125": ("S125", []),
}

TEXTS = {}
for k, (p, u, t) in ARTIFACTS.items():
    raw = open(os.path.join(S, p), "rb").read()
    txt = open(os.path.join(S, t), encoding="utf-8").read() if t else None
    TEXTS[k] = (raw, txt)


def search(artifact, frag):
    raw, txt = TEXTS[artifact]
    table = {f: len(laddr.hits(raw, txt, f, frag)) for f in laddr.FOLDS}
    hitfold = next((f for f in laddr.FOLDS if table[f]), None)
    res = {"artifact": artifact, "fold": hitfold, "hitsPerFold": table, "where": None,
           "sourceSpan": None}
    if hitfold:
        text = txt if txt is not None else raw.decode("utf-8", errors="replace")
        hs, span = locate(text, frag, hitfold)
        res["where"] = [{"line": L, "char": C} for L, C in hs[:5]]
        res["sourceSpan"] = span
        res["command"] = (f"python3 {WAVE}/laddr.py --file {os.path.join(S, ARTIFACTS[artifact][0])}"
                          + (f" --text {os.path.join(S, ARTIFACTS[artifact][2])}" if ARTIFACTS[artifact][2] else "")
                          + f" --fold {hitfold} --fragment {frag!r}")
    return res



DETAIL = {
 "S102": ("register quote cell carries S103's page-footer date, not this README. The README (gitiles HTML) "
          "contains the staged anchor's headings 'Scope and contributions', 'API stability' and 'Security "
          "considerations' but has zero occurrences of 'Last updated' (probe count 0). Both the staged S103 row "
          "and knowledge/corpus/knowledge/extension-cdp-transport-contract.md pin 'page footer \"Last updated "
          "2026-10-05 UTC\"' to S103; S103's live footer today reads 'Last updated 2026-10-29 UTC.' (drifted "
          "since the 2026-10-23 fetch, so the old date is unverifiable from the live page). No fabrication: the "
          "quote belongs to another row."),
 "S106": ("both Chinese fragments locate verbatim at f0 in S107's cited zh-TW page (lines 5631 and 5652) and in "
          "neither RFC 9309 nor any companion. RFC 9309 does carry the anchor's sections (2.3.1.3, 2.3.1.4, 2.4, "
          "2.5 all present). The quote cell carries S107's anchor text."),
 "S109": ("'429 Too Many Requests' locates at f0 (4 hits, first at RFC 6585 line 68 = the section-4 heading) and "
          "'too many requests in a given amount of time' at f2 (1 hit) in RFC 6585 (S110's cited source); neither "
          "appears in tool-reference.md, raw rendering or the staged github.com blob rendering. The quote cell "
          "carries S110's quoted text."),
 "S110": ("'Expose your tools carefully' (f0, 2 hits) and 'Last updated 2026-09-01 UTC' (f0, 2 hits) locate in "
          "S111's cited secure-tools page; 'Add hints to your tools' locates nowhere - the page's h2 is 'Use "
          "annotation hints' (id=use_annotation_hints) and the paraphrase already sits in the staged S111 anchor. "
          "RFC 6585 carries none of the three fragments."),
 "S111": ("fragment 1 locates byte-exactly at f0 in the zh-CN mirror the staged row names (line 3862: "
          "'\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c\u5176\u4ed6\u7f51\u7ad9\u6216\u8de8\u6e90 iframe "
          "\u65e0\u6cd5\u89c2\u5bdf\u6216\u4e0e\u60a8\u7684\u5de5\u5177\u4e92\u52a8\u3002'); fragment 0 "
          "'Add hints to your tools' is absent from the canonical English page, whose section is titled 'Use "
          "annotation hints'. The page also carries the anchored footer text 'Last updated 2026-09-01 UTC'."),
 "S114": ("no fragment under f0-f6. Near miss outside the ladder: the PDF abstract reads 'naive set-of mark "
          "prompting technique' where the register quotes 'set-of-marks prompting technique' - one added 's', "
          "edit distance 1. The cited claim is present; the quote has a transcription slip, not an invented "
          "sentence. Anchor sections 'Abstract' and '(2) \u7d50\u679c\u3068\u8003\u5bdf' both present."),
 "S117": ("'User awareness' locates at f1 (4 hits in the paper) in S118's PDF, not in the WebMCP Community Group "
          "draft (which does carry the anchored IDL surface: ModelContext, annotations, toolchange, exposedTo). "
          "The quote cell carries S118's section-2.3 heading."),
 "S118": ("the register URL is the arXiv ABSTRACT landing page, which carries none of the paper body; the staged "
          "row's own source string names 'arXiv:2305.11506, PDF v1 dated 2023-05-31', so the paper PDF was fetched "
          "and the ladder run on its text layer. All three fragments locate there: fragments 0 and 2 are the section "
          "2.3 run-in heading 'User awareness' (f0: 1 hit in the full-document text layer at line 257, 1 on page 4 at line 29), and fragment 1 locates at f2 with the byte-exact span "
          "'Chromium notifies users by\\nrendering an infobar across all open browser tabs' (source continues "
          "' [74] as shown in Figure 2.'). Fragment 1 is only locatable under page-level reading-order extraction "
          "(pdftotext -f 4 -l 4): the full-document -layout extraction interleaves the two columns mid-sentence. "
          "Quote is genuine; only the artifact URL pairing (landing page vs PDF) is loose."),
 "S124": ("neither fragment is in RFC 9110. Fragment 0 is a paraphrase: section 10.2.3 reads 'When sent with a 503 "
          "(Service Unavailable) response, Retry-After indicates how long the service is expected to be "
          "unavailable' and 'When sent with any 3xx (Redirection) response, Retry-After indicates the minimum "
          "time...' - same semantics, not the quoted wording. Fragment 1 is the tail of S125's staged anchor cell "
          "(section 5.5.7.1 '(Strict' and 'Lax' enforcement), section 8.8 (SameSite Cookies); draft-13) with an "
          "unbalanced opening backtick: table-cell contamination, not a quote."),
 "S125": ("both fragments locate at f0 (10 and 5 hits) in S126's cited GitHub rate-limits page, none in "
          "draft-ietf-httpbis-rfc6265bis-13, which does carry the anchored section 5.5.7 'The SameSite Attribute'. "
          "The quote cell carries S126's anchor text."),
}

ANCHOR_PROBES = {
 "S102": ["Scope and contributions", "API stability", "Security considerations", "Last updated"],
 "S106": ['2.3.1.3.', '"Unavailable" Status', '"Unreachable" Status', '2.4.  Caching', '2.5.  Limits'],
 "S109": ["WebMCP", "Extensions", "Input automation", "Navigation automation", "fill_form", "navigate_page"],
 "S110": ["429 Too Many Requests", "Retry-After"],
 "S111": ["Use annotation hints", "Add hints to your tools", "Expose your tools carefully", "Last updated 2026-09-01 UTC"],
 "S114": ["Abstract", "(2) \u7d50\u679c\u3068\u8003\u5bdf", "set-of-marks", "set-of mark"],
 "S117": ["ModelContext", "annotations", "toolchange", "exposedTo"],
 "S118": ["User awareness", "infobar"],
 "S124": ["303 See Other", "307 Temporary Redirect", "10.2.3.  Retry-After", "Retry-After can be used"],
 "S125": ["5.5.7.  The SameSite Attribute", "SameSite", "8.8."],
}


def main():
    reg = load_register()
    staged = load_staged()
    # http metadata from the fetch pass, transcribed with digests computed on the bytes
    meta = json.load(open(os.path.join(S, "http-meta.json"), encoding="utf-8"))
    for row in reg:
        sid = row["id"]
        staged_url = url_in(staged[sid]["source"])
        frags = []
        for rawcell in row["quoteCell"].split("<br>"):
            frag = deq(rawcell)
            own_hits = []
            for art in [OWN[sid][0]] + OWN[sid][1]:
                r = search(art, frag)
                if r["fold"]:
                    own_hits.append(r)
            elsewhere = []
            for art in ARTIFACTS:
                if art in [OWN[sid][0]] + OWN[sid][1]:
                    continue
                r = search(art, frag)
                if r["fold"]:
                    elsewhere.append({"artifact": art, "url": ARTIFACTS[art][1],
                                      "fold": r["fold"], "hits": r["hitsPerFold"][r["fold"]],
                                      "where": r["where"], "sourceSpan": r["sourceSpan"]})
            fold_records = {}
            for art in [OWN[sid][0]] + OWN[sid][1]:
                araw, atxt = TEXTS[art]
                apath = os.path.join(S, ARTIFACTS[art][0])
                atflag = f" --text {os.path.join(S, ARTIFACTS[art][2])}" if ARTIFACTS[art][2] else ""
                fold_records[art] = [{
                    "fold": f,
                    "hits": len(laddr.hits(araw, atxt, f, frag)),
                    "command": f"python3 {WAVE}/laddr.py --file {apath}{atflag} --fold {f} --fragment {frag!r}",
                } for f in laddr.FOLDS]
            first = own_hits[0] if own_hits else None
            frags.append({
                "quote": frag,
                "rawCell": rawcell,
                "fold": first["fold"] if first else None,
                "located": bool(first),
                "where": (first["where"][0] if first else None),
                "carrierArtifact": first["artifact"] if first else None,
                "carrierUrl": ARTIFACTS[first["artifact"]][1] if first else None,
                "sourceSpan": first["sourceSpan"] if first else None,
                "hitsPerFold": {f: sum(r["hitsPerFold"][f] for r in own_hits) for f in laddr.FOLDS},
                "command": first["command"] if first else None,
                "allOwnArtifacts": [{"artifact": r["artifact"], "fold": r["fold"],
                                     "where": r["where"], "sourceSpan": r["sourceSpan"]}
                                    for r in own_hits],
                "locatedElsewhere": elsewhere,
                "foldRecords": fold_records,
            })
        n = len(frags)
        nloc = sum(1 for f in frags if f["located"])
        cited = own_hits_cited = sum(1 for f in frags if any(a["artifact"] == OWN[sid][0] for a in f["allOwnArtifacts"]))
        own_any = nloc
        other = sum(1 for f in frags if f["locatedElsewhere"])
        if own_any == n:
            verdict = "quote-located"
            reason = (f"all {n} fragment(s) located in the row's own artifact set"
                      + ("" if cited == n else " (carrier is a same-id companion the staged row names, not the register URL)"))
        elif own_any:
            verdict = "partial-located"
            reason = f"{own_any}/{n} fragment(s) located in the row's own artifact set; {n-own_any} absent under f0-f6"
        elif other:
            carriers = sorted({f["locatedElsewhere"][0]["artifact"] for f in frags if f["locatedElsewhere"]})
            verdict = "mispaired"
            reason = (f"no fragment in the cited source; {other}/{n} located at another row's cited artifact "
                      f"({', '.join(carriers)}) - the quote cell carries a sibling S-id's text")
        elif meta[sid]["httpCode"] < 200 or meta[sid]["httpCode"] >= 300:
            verdict = "unreachable"
            reason = f"fetch returned {meta[sid]['httpCode']}"
        else:
            verdict = "absent-confirmed"
            reason = "fetched clean 2xx non-empty; no fragment under f0-f6 in the cited source or its companions"

        rec = {
            "id": sid,
            "registerUrl": row["url"],
            "stagedUrl": staged_url,
            "httpCode": meta[sid]["httpCode"],
            "bytes": meta[sid]["bytes"],
            "contentType": meta[sid]["contentType"],
            "contentSha256": meta[sid]["sha256"],
            "registerClass": row["class"],
            "registerRound": row["round"],
            "registerNote": row["note"],
            "stagedAnchor": staged[sid]["anchor"],
            "fragments": frags,
            "verdict": verdict,
            "reason": reason + " | " + DETAIL[sid],
            "extraction": None,
            "ladder": "f0 exact bytes; f1 ci; f2 ws-collapsed; f3 entities; f4 tags-stripped+f2; f5 f4+ci; f6 punct-stripped+f2",
            "quoteCellNormalization": "outer Markdown code-span backticks removed before the ladder; rawCell kept verbatim",
        }
        if sid == "S114":
            rec["extraction"] = ("pdftotext -enc UTF-8 -layout S114.bin S114.txt (poppler, already installed); "
                                 "ladder runs on the extracted text layer, raw bytes carry no text")
        if sid == "S118":
            rec["extraction"] = ("cited register URL is the arXiv ABSTRACT page (no body text); the staged anchor names "
                                 "'PDF v1', so the paper PDF was fetched (arxiv.org/pdf/2305.11506v1) and the ladder ran on "
                                 "its text layer. The full-document -layout extraction interleaves the two columns and splits "
                                 "the sentence; page-4 reading-order extraction (pdftotext -f 4 -l 4) keeps it contiguous.")
        # anchor probes against the cited artifact (f2: whitespace-collapsed)
        art = OWN[sid][0]
        raw_c, txt_c = TEXTS[art]
        probes = []
        for probe in ANCHOR_PROBES[sid]:
            cnt = len(laddr.hits(raw_c, txt_c, "f2", probe))
            probes.append({"probe": probe, "fold": "f2", "hits": cnt, "present": cnt > 0})
        rec["anchorChecks"] = probes
        rec["refetch"] = (f"curl -sL --max-time 90 --max-filesize 25000000 -o \"$SCRATCH\"/{ARTIFACTS[OWN[sid][0]][0]} "
                          f"'{row['url']}'  # expect sha256 {meta[sid]['sha256']}")
        rec["stagedUrlDiffers"] = staged_url is not None and staged_url != row["url"]
        if sid == "S109":
            blob = open(os.path.join(S, "S109blob.bin"), "rb").read()
            rec["stagedFetch"] = {"url": staged_url, "httpCode": 200, "bytes": len(blob),
                                  "contentType": "text/html; charset=utf-8",
                                  "sha256": hashlib.sha256(blob).hexdigest(),
                                  "fragmentsPresent": 0}
        if sid == "S118":
            rec["companionFetches"] = [{"url": "https://arxiv.org/pdf/2305.11506v1", "httpCode": 200,
                                        "bytes": 553958, "contentType": "application/pdf"}]
        if sid == "S111":
            zh = open(os.path.join(S, "S111zh.bin"), "rb").read()
            rec["companionFetches"] = [{"url": "https://developer.chrome.google.cn/docs/ai/webmcp/secure-tools?hl=zh-cn",
                                        "httpCode": 200, "bytes": len(zh), "contentType": "text/html; charset=utf-8",
                                        "sha256": hashlib.sha256(zh).hexdigest()}]
        with open(os.path.join(WAVE, sid + ".json"), "w", encoding="utf-8") as fh:
            json.dump(rec, fh, ensure_ascii=False, indent=1)
        print(sid, verdict, "|", reason[:100])


if __name__ == "__main__":
    main()
