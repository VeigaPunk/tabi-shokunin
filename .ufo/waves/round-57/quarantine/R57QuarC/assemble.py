#!/usr/bin/env python3
"""R57QuarC: assemble the per-row quarantine JSON receipts and summary.json."""
import hashlib
import json
import os
import shlex
import sys
import importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("qc", os.path.join(HERE, "quarantine-check.py"))
qc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qc)

OUT = HERE
WAVE = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-57/quarantine/R57QuarC"

ARTIFACTS = {
    "art_S150_ops": "/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md",
    "art_S164_capture": "/home/vgpnk/Projects/shokuknow/lanes/tabi/round4/.work/compare-mcp-zhcn.txt",
}

# fragment -> carrier document id (fetched doc id, or artifact id, or None)
CARRIER = {
    ("S143", 0): "reg_S144",
    ("S144", 0): "reg_S145",
    ("S144", 1): "reg_S145",
    ("S145", 0): None,
    ("S145", 1): "comp_S146_owasp",
    ("S147", 0): "reg_S148",
    ("S148", 0): "reg_S149",
    ("S148", 1): "reg_S149",
    ("S149", 0): "art_S150_ops",
    ("S149", 1): "art_S150_ops",
    ("S153", 0): "reg_S154",
    ("S153", 1): "reg_S154",
    ("S154", 0): "comp_S156_zapstudio",
    ("S158", 0): "comp_S159_ratelimit09",
    ("S163", 0): None,
    ("S163", 1): "art_S164_capture",
    ("S163", 2): None,
}

VERDICT = {sid: "mispaired" for sid in
           ("S143", "S144", "S145", "S147", "S148", "S149",
            "S153", "S154", "S158", "S163")}

NOTES = {
 "S143": ["quote is genuine puppeteer text: Page.ts `webmcp` accessor doc comment (line 1085), the staged S144 row's source",
          "cited file is the CDP domain wrapper (imports devtools-protocol, EventEmitter); it carries no Chrome-floor sentence",
          "register/staged URL pair differ only in rendering (raw.githubusercontent vs github.com/blob): both were fetched, neither carries the span"],
 "S144": ["both spans are genuine draft-13 text: §8.8.1 heading (f0) and the same paragraph's CSRF sentence (f2, the sentence wraps across lines)",
          "cited Page.ts carries neither span under any fold",
          "register/staged URL pair differ only in rendering; both were fetched"],
 "S145": ["`Limitations of SameSite` is a real OWASP Cheat Sheet heading (f0 x5)",
          "`Common CSRF weaknesses and protection mechanisms` is NOT byte-exact in the OWASP sheet, its round3 capture, or any fetched doc; the sheet's headings are `Defense In Depth Techniques`, `SameSite (Cookie Attribute)`, `Limitations of SameSite` - a campaign anchor paraphrase, not a source quote"],
 "S147": ["`Error 1020: Access denied` is real text of the 1020 page (f0 x3: option value, h2, in-page nav link)",
          "cited 1015 page carries no `Error 1020` string"],
 "S148": ["both fragments are robots.txt section headings/examples (S149's source)",
          "the only `Sitemap` occurrence in the cited 1020 page is an incidental HTML `<link rel=\"sitemap\" href=\"/sitemap-index.xml\">` in the document head (f1, line 109) - not the robots directive and not evidence for the row"],
 "S149": ["both fragments are the own-work reference's headings (`## The daemon` line 5, `## /status JSON fields` line 28); the artifact is local (no URL)",
          "`The daemon` also occurs incidentally as English prose in the agent-browser.dev page (S163's source); that is not the cited heading",
          "the register row's own staged S149 source is robots.txt, which carries neither fragment"],
 "S153": ["register S153 is the SHOKUNOW staging id (modern-web-guidance-src guide.md); this lane's registry S153 is the CDP browser_protocol.json row - the register's URL was the one checked",
          "the getTools() span needs f4 because a `<code>` element splits it in the HTML",
          "the cited guide.md is the English guidance page and carries no Chinese span"],
 "S154": ["the intervening staged S155 mcp-b page was fetched clean and carries no `WebMCPNotSupportedError`, so the shift skipped S155 (its anchor cell contains no quoted span)",
          "the token is the Zap Studio library's error name, a real third-party page"],
 "S158": ["cited `src/tools/webmcp.ts` is only 2451 B and carries no rate-limit vocabulary",
          "the heading is the IETF ratelimit-headers-09 §3 heading; the round4 captures (rl-04.txt, rl-05.txt) carry it under f1"],
 "S163": ["the cell reproduces the staged S164 anchor cell section names and its locator tail `(line 189); zh-CN locale`; the opening backtick of that tail is unclosed in the register row",
          "`实时会话数据` is byte-exact in round4's captured copy of the S164 page (line 188) but the live page has reworded the sentence (`工具在包含用户会话的页面中运行`) - page drift, not fabrication",
          "`WebMCP 与 MCP 的区别` is a paraphrase: the live nav/title read `WebMCP 与 MCP`, the capture has no exact heading, and the exact string occurs only in the staging prose and an OpenReplay zh article",
          "fragment 3 is a locator, not a quote: it can never be located"],
}
REASONS = {
 "S143": "cited WebMCP.ts carries the span under no fold; the span is byte-exact f0 at line 1085 of packages/puppeteer-core/src/api/Page.ts (the `webmcp` accessor doc comment) - the staged S144 row's source; the register paired S143's URL with S144's quoted span (genuine puppeteer text, wrong row)",
 "S144": "cited Page.ts carries neither span under any fold; both are byte-exact in draft-ietf-httpbis-rfc6265bis-13 §8.8.1 (f0 heading at line 2813; the CSRF sentence at f2, line 2817) - staged S145's source; register paired S144's URL with S145's quoted spans",
 "S145": "cited draft-13 carries neither span; `Limitations of SameSite` is byte-exact f0 x5 in the OWASP Cross-Site Request Forgery Prevention Cheat Sheet (staged S146's source), while `Common CSRF weaknesses and protection mechanisms` is not byte-exact anywhere checked (the sheet's headings are `Defense In Depth Techniques` / `SameSite (Cookie Attribute)` / `Limitations of SameSite`) - the register paired S145's URL with S146's anchor cell and that cell itself paraphrases one heading",
 "S147": "cited error-1015 page carries no `Error 1020: Access denied` under any fold; the string is byte-exact f0 x3 in the error-1020 page (staged S148's source) - register paired the 1015 URL with S148's anchor",
 "S148": "cited error-1020 page carries `Crawl-delay` under no fold; both fragments are robots.txt material (staged S149's source: `Crawl-delay` f0 x2 line 130, `Sitemap:` f0 line 424); the sole `Sitemap` hit in the cited page is an incidental `<link rel=\"sitemap\">` in the document head (f1, line 109), not the robots directive - register paired the 1020 URL with S149's anchor cell",
 "S149": "cited robots.txt carries neither fragment; both are byte-exact f0 headings in the lane's own-work reference operations.md (staged S150's source: `## The daemon` line 5, `## /status JSON fields` line 28) - register paired robots.txt with S150's own-work anchors",
 "S153": "cited modern-web-guidance-src guide.md carries neither span; both are byte-exact in the zh-CN imperative-api page (staged S154's source: `从 Chrome 153 开始` f0 line 3986, the getTools() sentence f4 line 4015 after tags are stripped) - register paired the guidance URL with S154's anchors; this register S153 is the SHOKUNOW staging id, not this lane's registry S153 (CDP browser_protocol.json)",
 "S154": "cited zh-CN imperative-api page carries no `WebMCPNotSupportedError` under any fold; the token is byte-exact f0 x6 in the Zap Studio webmcp/errors page (staged S156's source; the intervening S155 mcp-b page was fetched and carries nothing, and its anchor cell has no quoted span - which is why the shift skips it) - register paired S154's URL with S156's anchor",
 "S158": "cited src/tools/webmcp.ts (2451 B) carries no `RateLimit-Policy Field`; the heading is byte-exact f0 in draft-ietf-httpapi-ratelimit-headers-09 §3 (staged S159's source) and f1 in the round4 rl-04/rl-05 captures - register paired the webmcp.ts URL with S159's anchor",
 "S163": "cited agent-browser.dev/webmcp carries none of the three cell pieces; the cell reproduces the quoted section names of the staged S164 anchor cell (`WebMCP 与 MCP 的区别` line 179, `实时会话数据` line 188) plus that anchor cell locator tail `(line 189); zh-CN locale`; `实时会话数据` was byte-exact in round4's captured copy of that page (line 188) but the live page has reworded the sentence (page drift), `WebMCP 与 MCP 的区别` is a paraphrase (live nav/title read `WebMCP 与 MCP`), and the third piece is a locator, not a quote",
}
FRAG_EXTRA = {
 ("S148", 1): {"incidentalCitedSourceHit": True,
               "incidentalWhy": "HTML <link rel=\"sitemap\"> in the document head, f1 line 109; the quoted directive is in robots.txt f0 line 424"},
 ("S163", 2): {"locatorFragment": True},
 ("S145", 0): {"paraphrase": True},
 ("S163", 0): {"paraphrase": True},
}


def sha256(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


def mtime_iso(p):
    import datetime
    return datetime.datetime.fromtimestamp(os.path.getmtime(p)).astimezone().isoformat(timespec="seconds")


def main():
    reg = json.load(open(os.path.join(HERE, "register-rows.json"), encoding="utf-8"))
    pairing = json.load(open(os.path.join(HERE, "staged-pairing.json"), encoding="utf-8"))
    ladder = json.load(open(os.path.join(HERE, "ladder.json"), encoding="utf-8"))
    fetched = json.load(open(os.path.join(HERE, "fetched-all.json"), encoding="utf-8"))
    know = json.load(open(os.path.join(HERE, "provenance-knowledge.json"), encoding="utf-8"))

    # ladder results for the local artifact carriers
    artifacts = {}
    for aid, path in ARTIFACTS.items():
        raw, text, enc = qc.load_text(path)
        var = qc.variants(text)
        artifacts[aid] = {"path": path, "sha256": sha256(path), "bytes": len(raw),
                          "charset": enc, "var": var, "raw": raw, "text": text}

    os.makedirs(OUT, exist_ok=True)
    summary = {"seat": "R57QuarC", "wave": "w1", "round": 57,
               "rows": ["S143", "S144", "S145", "S147", "S148", "S149", "S153", "S154", "S158", "S163"],
               "folds": qc.FOLDS,
               "foldDefinitions": {
                   "f0": "exact substring in raw bytes (UTF-8 encoding of the quote)",
                   "f1": "case-insensitive (per-character lowercase; offsets mapped to the decoded text)",
                   "f2": "whitespace runs collapsed to single spaces",
                   "f3": "HTML entities decoded",
                   "f4": "HTML tags stripped to text then f2",
                   "f5": "f4 + case-insensitive",
                   "f6": "backtick/quote/punctuation-stripped then f2 (punctuation set = string.punctuation + `´‘’“”„‟«»‹›，。、；：？！（）【】《》…—–·)",
               },
               "fetchGuards": {
                   "schemes": "http/https only (curl --proto =http,https --proto-redir =http,https)",
                   "dns": "every resolved address checked; loopback/private/link-local/reserved/multicast/unspecified refused",
                   "credentials": "none; no cookies, no POST",
                   "limits": "--max-time 90 --max-filesize 25000000",
               },
               "instruments": {"curl": "8.23.0", "python": "3.14.8",
                               "runner": "quarantine-check.py (sha256 " + sha256(os.path.join(HERE, "quarantine-check.py")) + ")",
                               "provenance": "provenance.py (sha256 " + sha256(os.path.join(HERE, "provenance.py")) + ")"},
               "rowsOut": {}}

    for sid in summary["rows"]:
        row = reg[sid]
        pair = pairing[sid]
        lad = ladder[sid]
        cited_doc = "reg_" + sid
        staged_doc = "staged_" + sid
        cited = fetched[cited_doc]
        staged = fetched.get(staged_doc)
        out = {
            "id": sid,
            "registerRowMalformed": bool(FRAG_EXTRA.get((sid, 2), {}).get("locatorFragment")),
            "registerClass": row["class"].strip("`"),
            "registerRound": row["round"],
            "registerUrl": row["url"],
            "registerQuoteCell": row["quotes"],
            "registerNote": row["note"],
            "stagedUrl": pair["stagedUrl"],
            "stagedUrlDiffersFromRegister": pair["stagedUrl"] != row["url"],
            "httpCode": cited["httpCode"],
            "bytes": cited["bytes"],
            "contentType": cited["contentType"],
            "sha256": cited["sha256"],
            "urlEffective": cited.get("urlEffective"),
            "fetchedAt": mtime_iso(os.path.join(HERE, "docs", cited_doc + ".bin")),
            "fetchCommand": cited["cmd"],
            "stagedFetch": None,
            "fragments": [],
            "verdict": VERDICT[sid],
            "reason": REASONS[sid],
            "notes": NOTES[sid],
            "checks": {"citedSource": cited_doc, "docsFetched": len(fetched)},
            "knowledgeHits": {},
        }
        if staged_doc in fetched:
            s = fetched[staged_doc]
            out["stagedFetch"] = {"url": s["url"], "httpCode": s["httpCode"], "bytes": s["bytes"],
                                  "contentType": s["contentType"], "sha256": s["sha256"],
                                  "fetchedAt": mtime_iso(os.path.join(HERE, "docs", staged_doc + ".bin")),
                                  "cmd": s["cmd"]}
        # staged row cells (own id)
        src = None
        for line in open("/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md", encoding="utf-8"):
            if line.startswith("| " + sid + " |"):
                cells = [c.strip() for c in line.rstrip("\n").split("|")[1:-1]]
                src = {"source": cells[1], "anchor": cells[5], "teaches": cells[6],
                       "recheck": cells[9]}
                break
        out["stagedRow"] = src

        for n, frag in enumerate(lad["fragments"]):
            cited_frag = lad["docs"][cited_doc]["fragments"][n]
            entry = {
                "quote": frag,
                "fold": cited_frag["fold"],
                "located": cited_frag["located"],
                "where": cited_frag["folds"].get(cited_frag["fold"], []) if cited_frag["located"] else None,
                "hitsPerFold": {f: cited_frag["folds"][f + "_n"] for f in qc.FOLDS},
                "foldRuns": [],
            }
            # runnable single-fold commands with the hit counts actually measured
            for f in qc.FOLDS:
                cmd = ("python3 quarantine-check.py single --file docs/%s.bin --fold %s --fragment %s"
                       % (cited_doc, f, shlex.quote(frag)))
                entry["foldRuns"].append({"fold": f, "hits": cited_frag["folds"][f + "_n"],
                                          "cmd": cmd})
            cid = CARRIER[(sid, n)]
            if cid:
                if cid in fetched:
                    raw, text, enc = qc.load_text(os.path.join(HERE, "docs", cid + ".bin"))
                    var = qc.variants(text)
                    table, first = qc.locate(raw, text, frag, var)
                    entry["carriedBy"] = {
                        "docId": cid, "url": fetched[cid]["url"],
                        "httpCode": fetched[cid]["httpCode"], "sha256": fetched[cid]["sha256"],
                        "fold": first, "hits": table[first + "_n"] if first else 0,
                        "where": table[first][:3] if first else None,
                        "hitsPerFold": {f: table[f + "_n"] for f in qc.FOLDS},
                    }
                else:
                    a = artifacts[cid]
                    table, first = qc.locate(a["raw"], a["text"], frag, a["var"])
                    entry["carriedBy"] = {
                        "docId": cid, "path": a["path"], "sha256": a["sha256"],
                        "fold": first, "hits": table[first + "_n"] if first else 0,
                        "where": table[first][:3] if first else None,
                        "hitsPerFold": {f: table[f + "_n"] for f in qc.FOLDS},
                    }
            else:
                entry["carriedBy"] = None
            entry.update(FRAG_EXTRA.get((sid, n), {}))
            out["fragments"].append(entry)
            out["knowledgeHits"][frag] = know["hits"].get(sid + "#" + str(n + 1), [])

        out["fragmentsLocatedInCitedSource"] = sum(1 for f in out["fragments"] if f["located"])
        out["incidentalCitedSourceHits"] = sum(
            1 for f in out["fragments"] if f["located"] and f.get("incidentalCitedSourceHit"))
        out["fragmentsLocatedInCarrier"] = sum(
            1 for f in out["fragments"] if f["carriedBy"] and (f["carriedBy"].get("fold") is not None))
        out["fragmentsNotLocatedAnywhere"] = [
            f["quote"] for f in out["fragments"]
            if not f["located"] and not (f["carriedBy"] and f["carriedBy"].get("fold"))]
        out["registerClassConfirmedAtCitedUrl"] = (
            out["fragmentsLocatedInCitedSource"] - out["incidentalCitedSourceHits"] == 0)
        with open(os.path.join(OUT, sid + ".json"), "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, indent=1)
        summary["rowsOut"][sid] = {
            "verdict": out["verdict"],
            "citedSourceFragments": out["fragmentsLocatedInCitedSource"],
            "carrierFragments": out["fragmentsLocatedInCarrier"],
            "fragments": len(out["fragments"]),
            "carrier": [f["carriedBy"]["docId"] for f in out["fragments"] if f["carriedBy"]],
        }
        print(sid, out["verdict"], out["fragmentsLocatedInCitedSource"], "/", len(out["fragments"]))

    summary["verdictCounts"] = {}
    for v in summary["rowsOut"].values():
        summary["verdictCounts"][v["verdict"]] = summary["verdictCounts"].get(v["verdict"], 0) + 1
    summary["knowledgeQuestion"] = {
        "question": "does the quote text appear anywhere under shokuknow/merge/tabi/knowledge/",
        "answer": "yes - every one of the 17 fragments is byte-exact (f0/f6) in at least one staged knowledge file",
        "files": sorted({h["file"] for hs in know["hits"].values() for h in hs}),
    }
    with open(os.path.join(OUT, "summary.json"), "w", encoding="utf-8") as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=1)
    print(json.dumps(summary["verdictCounts"], ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
