#!/usr/bin/env python3
"""r57 quarantine hand-check, seat R57QuarD: build the ladder spec for my rows.

Reads (read-only):
  <register>  the campaign's absent-defect register
  <staged>    the campaign's staged SOURCES.append.md
Writes:
  <scratch>/rows-spec.json   one row per assigned S-id: register cells, staged
                             cells, the next staged row's carrier check, and the
                             quoted fragments the ladder must run.

The register's quote column is parsed into fragments by splitting on '<br>' and
stripping the outer Markdown code-span backticks (rawCell kept verbatim).

Usage:
  build-spec.py --scratch DIR --out SPEC.json \
      [--register PATH] [--staged PATH] [--ids S164,S165,...]
"""
import argparse
import json
import re
import sys

DEFAULT_REGISTER = "/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md"
DEFAULT_STAGED = "/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md"
DEFAULT_IDS = "S164,S165,S166,S167,S174,S175,S176,S171"

# the cited source a fragment is actually carried by, when it is carried by a
# sibling row's page (measured in R57QuD.md; filled only for cross-bin labels)
SIBLING_URL = {
    "S165": "https://googlechromelabs.github.io/webmcp-tools/demos/explainer/",
    "S166": "https://weel.co.jp/media/tech/webmcp/",
    "S167": "https://claude.com/ja/marketplace/connectors/webmcp-evaluator",
    "S168": "https://developer.chrome.com/blog/agent-ready-toolkit?hl=ja",
    "S175": "https://www.np.com.tw/modules/news/article.php?storyid=20",
    "S176": "https://web-mcp.net/security-guide",
    "S177": "https://developer.chrome.com/docs/web-platform/origin-trials",
}
SIBLING_BIN = {
    "S165": "S165.bin", "S166": "S166.bin", "S167": "S167.bin",
    "S168": "XS168.bin", "S175": "S175.bin", "S176": "S176.bin", "S177": "XS177.bin",
}
# the sibling row whose staged anchor carries this row's fragments
NEXT_ROW = {
    "S164": "S165", "S165": "S166", "S166": "S167",
    "S167": "S168", "S174": "S175", "S175": "S176", "S176": "S177",
}
VERDICT = {
    "S164": "mispaired", "S165": "mispaired", "S166": "mispaired",
    "S167": "mispaired", "S174": "mispaired", "S175": "mispaired",
    "S176": "mispaired", "S171": "unreachable",
}
REGISTER_URL = {
    "S164": "https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn",
    "S174": "https://fullstackladder.dev/blog/2026/07/15/webmcp-basic-concepts/",
    "S171": "https://chromestatus.com/features/5117755740913664",
}


def cells(line):
    return [c.strip() for c in line.split("|")]


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("--scratch", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--register", default=DEFAULT_REGISTER)
    ap.add_argument("--staged", default=DEFAULT_STAGED)
    ap.add_argument("--ids", default=DEFAULT_IDS)
    a = ap.parse_args(argv)

    ids = a.ids.split(",")
    reglines = open(a.register, encoding="utf-8").read().splitlines()
    staged_lines = open(a.staged, encoding="utf-8").read().splitlines()
    staged = {}
    for ln, line in enumerate(staged_lines, 1):
        m = re.match(r"\|\s*(S\d+)\s*\|", line)
        if m:
            staged.setdefault(m.group(1), (ln, line))
    regrow = {}
    for ln, line in enumerate(reglines, 1):
        m = re.match(r"\|\s*`tabi`\s*\|\s*(\S+)\s*\|\s*(S\d+)`?\s*\|", line)
        if m and m.group(2) in ids:
            regrow[m.group(2)] = (ln, m.group(1), line)
    missing = [i for i in ids if i not in regrow]
    if missing:
        raise SystemExit("rows not found in register: " + ",".join(missing))

    rows = []
    for sid in ids:
        ln, rnd, line = regrow[sid]
        cs = cells(line)
        malformed = len(cs) < 9  # lane|round|id|class|url|quote|note = 9 cells with edges
        if sid == "S171" or malformed:
            reg_class = cs[4]
            quote_cell = None
            reg_url = cs[5]
            note = None
            malformed = True
        else:
            reg_class = cs[4].strip("`")
            quote_cell = cs[6]
            reg_url = cs[5]
            note = cs[7]
        sln, sline = staged.get(sid, (None, ""))
        scs = cells(sline)
        staged_url = scs[2].split("\u2014")[-1].strip() if len(scs) > 2 else None
        staged_anchor = scs[6] if len(scs) > 6 else None
        nxt = "S%03d" % (int(sid[1:]) + 1)
        nsln, nsline = staged.get(nxt, (None, ""))
        nscs = cells(nsline)
        nxt_url = nscs[2].split("\u2014")[-1].strip() if len(nscs) > 2 else None

        frags = []
        if quote_cell:
            for raw in quote_cell.split("<br>"):
                f = raw.strip().strip("`").strip()
                if f:
                    frags.append({"quote": f, "rawCell": raw.strip()})
        next_carried = [f["quote"] for f in frags if f["quote"] in (nsline or "")]
        own_carried = [f["quote"] for f in frags if f["quote"] in (sline or "")]

        cross = []
        for label in (NEXT_ROW.get(sid),):
            if label and label in SIBLING_BIN:
                cross.append({"label": label, "row": label, "url": SIBLING_URL[label],
                              "bin": a.scratch + "/bin/" + SIBLING_BIN[label]})
        rows.append({
            "id": sid,
            "registerUrl": REGISTER_URL.get(sid, SIBLING_URL.get(sid)),
            "stagedUrl": staged_url,
            "registerLine": ln,
            "stagedLine": sln,
            "registerClass": reg_class,
            "registerRound": rnd,
            "registerNote": note,
            "registerRowMalformed": malformed and sid == "S171",
            "stagedAnchor": staged_anchor,
            "pairingCrossCheck": {
                "registerUrl": REGISTER_URL.get(sid, SIBLING_URL.get(sid)),
                "stagedUrl": staged_url,
                "urlsEqual": staged_url == REGISTER_URL.get(sid, SIBLING_URL.get(sid)),
                "ownStagedRowCarriesFragment": len(own_carried),
                "nextStagedRow": {"id": nxt, "line": nsln, "url": nxt_url,
                                  "carriesFragment": len(next_carried)},
            },
            "bin": a.scratch + "/bin/" + sid + ".bin",
            "crossBins": cross,
            "verdict": VERDICT[sid],
            "fragments": frags,
        })
    json.dump(rows, open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for r in rows:
        print("%s: class=%s urlsEqual=%s frags=%d nextRow=%s carries=%d/%d" % (
            r["id"], r["registerClass"], r["pairingCrossCheck"]["urlsEqual"],
            len(r["fragments"]), r["pairingCrossCheck"]["nextStagedRow"]["id"],
            r["pairingCrossCheck"]["nextStagedRow"]["carriesFragment"], len(r["fragments"])))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
