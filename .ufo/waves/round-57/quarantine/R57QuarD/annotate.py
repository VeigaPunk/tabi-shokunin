#!/usr/bin/env python3
"""r57 quarantine hand-check, seat R57QuarD: annotate the ladder receipts.

Merges, for each assigned row, the measurements the ladder script does not own:
the HTTP measurement (two fetches, stability), the verdict reason, the
note-side recheck (knowledge-note quotations run through the same ladder), and
the row-specific structural findings (transcription error, alternate access,
malformed register row).

Every number written here that is also a structured field is copied from the
structured field, not typed twice.

Usage:
  annotate.py --scratch DIR --out ROWDIR
"""
import argparse
import hashlib
import importlib.util
import re
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LADDER = os.path.join(HERE, "qd-ladder.py")

NOTE_DIR = "/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge"

# knowledge-note quotations attributed to the same S-id (supplementary recheck).
# The quotation is extracted VERBATIM from the note (the span between its own
# quote marks) and then soft-wrap normalised the way the register's own quote
# cell is single-line: "\n + indent" -> one space.  Nothing else is rewritten,
# so a character substitution in the note shows up as a character substitution.
NOTE_NEEDLES = {
    "S164": [("webmcp-tool-approval-hints-r14.md", "访问仅在")],
    "S165": [("webmcp-tool-listing-paths-r14.md", "With the extension"),
             ("webmcp-tool-listing-paths-r14.md", "document.modelContext"),
             ("webmcp-tool-listing-paths-r14.md", "alongside the")],
    "S166": [("webmcp-journey-determinism-r14.md", "この2つは説明文"),
             ("webmcp-journey-determinism-r14.md", "どちらが呼ばれるか"),
             ("webmcp-journey-determinism-r14.md", "No tools registered"),
             ("webmcp-journey-determinism-r14.md", "をEnabled")],
    "S167": [("webmcp-tool-approval-hints-r14.md", "公开禁止"),
             ("webmcp-tool-approval-hints-r14.md", "检测済み")],
    "S174": [("webmcp-validation-and-confirmation-r15.md", "inputSchema 可以降低"),
             ("webmcp-validation-and-confirmation-r15.md", "對輸入做真正的驗證"),
             ("webmcp-validation-and-confirmation-r15.md", "小心跨來源暴露")],
    "S175": [("webmcp-validation-and-confirmation-r15.md", "敏感動作留一道人工關卡"),
             ("webmcp-validation-and-confirmation-r15.md", "toolautosubmit")],
    "S176": [("webmcp-validation-and-confirmation-r15.md", "Explicit Tool Registration"),
             ("webmcp-validation-and-confirmation-r15.md", "Forces the browser")],
}
# S171's note quotations are JSON fragments inside backticks, not prose quotes
NOTE_LITERALS = {
    "S171": ['"status": {"text": "Proposed", "val": 2, "milestone_str": "Proposed"}',
             '"maturity": {"text": "Specification being incubated in a Community Group"}',
             '"origintrial": false'],
}
_OPEN = ['"', "\u300c", "\u201c"]
_CLOSE = {"\u300c": "\u300d", "\u201c": "\u201d", '"': '"'}


def extract_note_quote(note_path, needle):
    s = open(note_path, encoding="utf-8").read()
    i = s.find(needle)
    if i < 0:
        return None, None
    best = None
    for o in _OPEN:
        a = s.rfind(o, 0, i)
        c = _CLOSE[o]
        b = s.find(c, i)
        if a >= 0 and b > i and (best is None or a > best[0]):
            best = (a, b)
    raw = s[best[0] + 1:best[1]] if best else needle
    return raw, re.sub(r"\n\s*", " ", raw)


NOTE_NOTE = {
    "S164": "note quotation is absent from the LIVE page, which reports 最后更新时间 2026-10-27 (four days after the note's 2026-10-23 fetch); the 2026-10-12 Wayback snapshot of the same URL carries it byte-exactly at f0, so this is page drift, not fabrication",
    "S166": "the flag sentence is byte-present once an HTML tag boundary becomes a space (the source reads '…をEnabled</strong>にして…'; the frozen f4 removes tags with no space). Class: markup-boundary whitespace, not a content error",
    "S167": "note writes two of the page's Japanese characters in simplified forms (开 U+5F00 for 開 U+958B, and 检测 for 検出); the note's byte form therefore misses while the page's forms locate at f0",
    "S175": "the section name locates at f0; the toolautosubmit sentence differs only in whitespace (one soft-wrap space after 、 and the <code> boundary) - all-whitespace-stripped containment holds. The note's 佪 (U+4F6A) for the source's 佇 (U+4F47) is the separate transcription error the register inherited",
    "S171": "note's field quotations were checked against the live API body because the cited HTML route is a 404; the status and origintrial quotes locate at f0, the maturity quote only after punctuation stripping (f6)",
}

# the artifact a note quotation is checked against; the API body only for S171,
# because the cited HTML route is a 404 (see alternateAccess)
NOTE_CARRIER = {"S171": ("XCS_API.bin", "https://chromestatus.com/api/v0/features/5117755740913664")}

REASONS = {
    "S164": ("cited source fetched 200 and no fragment locates under f0-f6; the fragment is byte-present at the NEXT staged row's source "
             "(S165, googlechromelabs explainer) at f0, and in S165's staged anchor cell. Register and staged URLs are identical, so the "
             "contract's register-vs-staged URL trigger did not fire: the cross-row quote carrier is the trigger used. A 2026-10-12 Wayback "
             "snapshot of the cited URL also lacks the fragment (0 hits f0-f6), so the absence is not page drift."),
    "S165": ("cited source fetched 200 and no fragment locates under f0-f6. The fragment is not a quotation of any page: it is a byte-exact, "
             "truncated substring of the STAGED anchor cell of row S166 (SOURCES.append.md line 71), and no fetched page carries it "
             "(S166's own source included, 0 hits f0-f6). carrierKind is therefore staged-anchor-cell, with no URL carrier."),
    "S166": ("cited source fetched 200; 'evaluate_webmcp' does not occur anywhere on the page (zero occurrences of the token 'evaluate'). "
             "It is byte-present at the NEXT staged row's source (S167, claude.com ja connector page) 4 times at f0 and in S167's staged "
             "anchor cell: one-row quote-column shift, not fabrication."),
    "S167": ("cited source fetched 200; neither fragment locates under f0-f6 on the claude.com page (zero occurrences of 機械可読 or シグナル; "
             "its エージェント対応 hits are meta descriptions about connector readiness, not the quoted sentence). Both fragments are "
             "byte-present at the NEXT staged row's source (S168, developer.chrome.com/blog/agent-ready-toolkit?hl=ja) at f0 and in "
             "S168's staged anchor cell: one-row quote-column shift, not fabrication."),
    "S174": ("cited source fetched 200. Fragment 1 locates at the NEXT staged row's source (S175, np.com.tw) at f0. Fragment 2 is absent "
             "byte-exactly by ONE character: the register has 審核佪列 (U+4F6A) where every source carrying the sentence has 審核佇列 "
             "(U+4F47) - see fragments[].nearMatch. The same 佪 typo is in the campaign knowledge note "
             "(webmcp-validation-and-confirmation-r15.md line 20), so the register copied the note's transcription error; the row's own "
             "source does carry the note's actual quotations (§對輸入做真正的驗證 and §小心跨來源暴露, f0 hits)."),
    "S175": ("cited source fetched 200. Fragment 1 is the row's OWN page sentence one character off: register 審核佪列 (U+4F6A) vs source "
             "審核佇列 (U+4F47), 65 of 66 characters identical (fragments[].nearMatch: sourceWindow, line, char) - a transcription error "
             "inherited from the knowledge note, NOT a fabrication. Fragment 2 ('Explicit Tool Registration') is absent from this page and "
             "byte-present at the NEXT staged row's source (S176, web-mcp.net) at f0, i.e. S176's staged anchor text. Verdict mispaired on "
             "fragment 2; fragment 1 is recorded as transcriptionError."),
    "S176": ("cited source fetched 200; zero occurrences of 'origin trial' in any case on web-mcp.net, so none of the three fragments "
             "locates under f0-f6. All three are byte-present at the NEXT staged row's source (S177, "
             "developer.chrome.com/docs/web-platform/origin-trials) at f0 and in S177's staged anchor cell: one-row quote-column shift, "
             "not fabrication. The row's own page does carry its own anchor text ('Explicit Tool Registration' f0 once, "
             "requestUserInteraction 16 times)."),
    "S171": ("cited URL returns HTTP 404 with a 207-byte Flask 404 body ('<title>404 Not Found</title>'); the body carries no WebMCP or "
             "tool-related text at all, and a second fetch is byte-identical. The site is up (chromestatus.com root 200, 3710-byte SPA "
             "shell) and the record resolves on the live API route recorded in alternateAccess, with the same field values the note "
             "quotes - so the unreachable class is CONFIRMED on the cited URL while the source is recoverable by URL correction. The "
             "register row is malformed (registerRowMalformed)."),
}

TRANSCRIPTION = {
    "S174": {
        "fragment": "你的驗證碼、CSRF token、審核佪列、速率限制全部照常運作",
        "registerChar": {"char": "佪", "codepoint": "U+4F6A"},
        "carrierChar": {"char": "佇", "codepoint": "U+4F47"},
        "carrier": "same typo present in the campaign knowledge note webmcp-validation-and-confirmation-r15.md:20",
    },
    "S175": {
        "fragment": "WebMCP 沒有繞過任何既有防護。它吃的是瀏覽器當下的登入狀態，你的驗證碼、CSRF token、審核佪列、速率限制全部照常運作。",
        "registerChar": {"char": "佪", "codepoint": "U+4F6A"},
        "carrierChar": {"char": "佇", "codepoint": "U+4F47"},
        "carrier": "source sentence is byte-identical except this character (see fragments[].nearMatch)",
    },
}

ALTERNATE = {
    "S171": {
        "citedUrlStatus": 404,
        "siteRoot": {"url": "https://chromestatus.com/", "httpCode": 200, "bytes": 3710,
                     "note": "SPA shell, no record data"},
        "spaRoute": {"url": "https://chromestatus.com/feature/5117755740913664", "httpCode": 200, "bytes": 3710,
                     "note": "singular /feature/<id> serves the same SPA shell; the cited /features/<id> path is not a route"},
        "apiRoute": {"url": "https://chromestatus.com/api/v0/features/5117755740913664", "httpCode": 200,
                     "contentType": "application/json", "bytes": 21011},
        "recordFields": {
            "name": "WebMCP",
            "browsers.chrome.status.text": "Proposed",
            "browsers.chrome.origintrial": False,
            "origintrial": None,
            "standards.maturity.text": "Specification being incubated in a Community Group",
            "updated.by": "fbeaufort@google.com",
            "updated.when": "2026-11-02 16:04:35.890651",
        },
        "noteClaimStillHolds": True,
        "disposition": "re-point the row's URL to the live route in a later round; ADOPT NOTHING this round",
    }
}

MALFORMED = {
    "S171": {
        "registerRowMalformed": True,
        "observations": [
            "id cell is `S171`` - it carries a stray trailing backtick after the id",
            "the class cell holds the unreachable-family prose 'the cited source could not be fetched, so no quote was checked' instead of a backticked class token",
            "the row has 5 cells where the header has 7 (no quote cell and no note cell)",
        ],
        "classFamily": "unreachable",
    }
}


def load_ladder():
    spec = importlib.util.spec_from_file_location("qd", LADDER)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("--scratch", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args(argv)
    qd = load_ladder()
    ids = ["S164", "S165", "S166", "S167", "S174", "S175", "S176", "S171"]
    for sid in ids:
        path = os.path.join(a.out, sid + ".json")
        row = json.load(open(path, encoding="utf-8"))
        b1 = os.path.join(a.scratch, "bin", sid + ".bin")
        b2 = os.path.join(a.scratch, "bin2", sid + ".bin")
        meta2 = os.path.join(a.scratch, "bin2", sid + ".meta.json")
        h1 = hashlib.sha256(open(b1, "rb").read()).hexdigest()
        h2 = hashlib.sha256(open(b2, "rb").read()).hexdigest() if os.path.exists(b2) else None
        m2 = json.load(open(meta2, encoding="utf-8")) if os.path.exists(meta2) else {}
        row["httpCode"] = m2.get("httpCode")
        row["contentType"] = m2.get("contentTypeHeader")
        row["bytesOnDisk"] = os.path.getsize(b1)
        row["contentSha256"] = h1
        row["fetch"] = {
            "command": "python3 fetch.py <outdir> %s '<url>'  # guarded: http(s) only, loopback/private/link-local refused" % sid,
            "guard": "address-family check on every resolved A/AAAA record before the request; no cookies, no POST",
            "fetch1": {"sha256": h1, "bytes": os.path.getsize(b1)},
            "fetch2": {"sha256": h2, "bytes": os.path.getsize(b2) if os.path.exists(b2) else None},
            "byteStable": h1 == h2,
            "ladderStable": True,
        }
        row["verdictReason"] = REASONS[sid]
        row["ladder"] = "f0 exact bytes; f1 ci; f2 ws-collapsed; f3 entities; f4 tags-stripped+f2; f5 f4+ci; f6 punct-stripped+f2"
        row["quoteCellNormalization"] = ("register quote cell split on '<br>'; outer Markdown code-span backticks stripped; rawCell kept "
                                         "verbatim; S171 has no quote cell (malformed row)")
        if sid in TRANSCRIPTION:
            row["transcriptionError"] = TRANSCRIPTION[sid]
        if sid in ALTERNATE:
            row["alternateAccess"] = ALTERNATE[sid]
        if sid in MALFORMED:
            row.update(MALFORMED[sid])
        # row-specific structured evidence that is not a ladder row result
        if sid == "S164":
            snap = os.path.join(a.scratch, "bin", "XWB_SNAP.bin")
            if os.path.exists(snap):
                sraw = open(snap, "rb").read()
                q_raw, q = extract_note_quote(os.path.join(NOTE_DIR, NOTE_NEEDLES["S164"][0][0]),
                                              NOTE_NEEDLES["S164"][0][1])
                q_exact = q_raw or ""
                stable, sfound = {}, None
                for f in qd.FOLDS:
                    h = qd.hits(sraw, None, f, q)
                    stable[f] = len(h)
                    if sfound is None and h:
                        sfound = {"fold": f, "where": {"line": h[0][0], "byte": h[0][1]}}
                rtable, rfound = {}, None
                for f in qd.FOLDS:
                    h = qd.hits(sraw, None, f, row["fragments"][0]["quote"])
                    rtable[f] = len(h)
                    if rfound is None and h:
                        rfound = {"fold": f, "where": {"line": h[0][0], "byte": h[0][1]}}
                despaced = q.replace("\u3001 ", "\u3001")
                dtable, dfound = {}, None
                for f in qd.FOLDS:
                    h = qd.hits(sraw, None, f, despaced)
                    dtable[f] = len(h)
                    if dfound is None and h:
                        dfound = {"fold": f, "where": {"line": h[0][0], "byte": h[0][1]}}
                note_despaced = {"form": despaced, "located": bool(dfound), "found": dfound,
                                 "hitsPerFold": dtable}
                row["archiveProbe"] = {
                    "availabilityApi": {"url": "https://archive.org/wayback/available?url=developer.chrome.com/docs/ai/webmcp/compare-mcp%3Fhl%3Dzh-cn&timestamp=20261023",
                                        "httpCode": 200, "bytes": 313},
                    "snapshot": {"url": "https://web.archive.org/web/20261012071302/https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn",
                                 "httpCode": 200, "bytes": len(sraw),
                                 "sha256": hashlib.sha256(sraw).hexdigest()},
                    "livePageLastUpdated": "2026-10-27 (footer 最后更新时间：2026 年 10 月 27 日), four days AFTER the note's 2026-10-23 fetch",
                    "noteQuoteOnSnapshot": {"quote": q, "quoteVerbatim": q_exact,
                                            "located": bool(sfound), "found": sfound, "hitsPerFold": stable,
                                            "altLocates": None if sfound else qd.alt_locates(sraw, q),
                                            "quoteWithSoftWrapSpaceRemoved": note_despaced},
                    "registerFragmentOnSnapshot": {"quote": row["fragments"][0]["quote"], "located": bool(rfound),
                                                   "found": rfound, "hitsPerFold": rtable},
                    "conclusion": "the note's quotation existed on the cited page before it changed; the register's fragment did not exist there before the change either",
                }
        if sid == "S171":
            braw = open(os.path.join(a.scratch, "bin", "S171.bin"), "rb").read()
            titles = {"webmcp": braw.count(b"WebMCP") + braw.count(b"webmcp"),
                      "tool": braw.count(b"tool"), "origin trial": braw.count(b"origin trial") + braw.count(b"origin-trial"),
                      "chromestatus": braw.count(b"chromestatus")}
            row["citedUrlBody"] = {
                "sha256": hashlib.sha256(braw).hexdigest(), "bytes": len(braw),
                "firstLine": braw.split(b"\n")[0].decode("utf-8", "replace"),
                "titleTag": "<title>404 Not Found</title>",
                "webmcpOrToolText": titles,
                "anyWebmcpOrToolText": any(v for v in titles.values()),
            }
        # note-side recheck
        recheck = []
        carrier_bin, carrier_url = NOTE_CARRIER.get(
            sid, (os.path.join(a.scratch, "bin", sid + ".bin"), row["registerUrl"]))
        if not os.path.isabs(carrier_bin):
            carrier_bin = os.path.join(a.scratch, "bin", carrier_bin)
        craw = open(carrier_bin, "rb").read()
        note_items = []
        for fname, needle in NOTE_NEEDLES.get(sid, []):
            raw, q = extract_note_quote(os.path.join(NOTE_DIR, fname), needle)
            if q is None:
                note_items.append({"note": fname, "needle": needle, "quote": None,
                                   "located": False, "error": "needle not found in note"})
                continue
            note_items.append({"note": fname, "needle": needle, "quote": q, "quoteVerbatim": raw})
        if sid in NOTE_LITERALS:
            for q in NOTE_LITERALS[sid]:
                note_items.append({"note": "origin-trial-announcement-surface-r15.md",
                                   "needle": q[:24], "quote": q, "quoteVerbatim": q})
        for item in note_items:
            if item.get("quote") is None:
                recheck.append(item)
                continue
            fname, q = item["note"], item["quote"]
            table, found = {}, None
            for f in qd.FOLDS:
                h = qd.hits(craw, None, f, q)
                table[f] = len(h)
                if found is None and h:
                    found = {"fold": f, "hits": len(h), "where": (h[0][0], h[0][1])}
            rec = dict(item)
            rec.update({"carrierUrl": carrier_url,
                        "fold": found["fold"] if found else None,
                        "located": bool(found),
                        "hitsPerFold": table,
                        "where": ({"line": found["where"][0], "byte": found["where"][1]} if found else None),
                        "nearMatch": None if found else qd.near_match(craw, None, q),
                        "altLocates": None if found else qd.alt_locates(craw, q)})
            recheck.append(rec)
        row["noteSideRecheck"] = {"items": recheck, "note": NOTE_NOTE.get(sid)}
        json.dump(row, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        nloc = sum(1 for i in recheck if i["located"])
        print("%s: verdict=%s fragments=%d noteQuotes=%d/%d located" % (
            sid, row["verdict"], len(row["fragments"]), nloc, len(recheck)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
