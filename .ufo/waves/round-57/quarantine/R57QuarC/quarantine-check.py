#!/usr/bin/env python3
"""R57QuarC quarantine hand-check runner (scratch tool, not committed).

Sub-commands
  fetch   --rows rows.json --out DIR [--scratch DIR]   guarded curl fetch of every
          register URL, staged URL (when it differs) and declared companion doc
  ladder  --manifest fetched.json --rows rows.json --out DIR
          fold ladder f0..f6 for every fragment of every row against every doc;
          prints per-fragment per-fold hit counts and writes the per-row JSON
  single  --file BIN --fold fN --fragment TEXT
          one fold for one fragment (the recorded command form)

Folds (frozen by the round-57 seat spec):
  f0 exact substring in raw bytes
  f1 case-insensitive (per-character lowercase, offsets mapped to the decoded text)
  f2 whitespace runs collapsed to single spaces
  f3 HTML entities decoded
  f4 HTML tags stripped to text then f2
  f5 f4 + case-insensitive
  f6 backtick/quote/punctuation-stripped then f2

Every fold keeps a char map back to the decoded text so hits report the original
line and byte offset. No network access outside `fetch`; no credentials/cookies;
fetch refuses non-http(s) schemes and any host resolving into loopback/private/
link-local/reserved/multicast/unspecified space.
"""
import argparse
import hashlib
import html
import ipaddress
import json
import os
import re
import socket
import string
import subprocess
import sys
from urllib.parse import urlsplit

FOLDS = ["f0", "f1", "f2", "f3", "f4", "f5", "f6"]

_WS = re.compile(r"\s+")
_TAGS = re.compile(r"<[^>]*>")
_ENT = re.compile(r"&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);")
# f6 character class: backticks, straight/typographic quotes, and ASCII+CJK punctuation
_PUNCT = set(string.punctuation) | set("`´‘’“”„‟«»‹›，。、；：？！（）【】《》…—–·")


class Refused(Exception):
    pass


# ---------------------------------------------------------------- folding ----

def _collapse(s, m):
    out, om, i = [], [], 0
    for mt in _WS.finditer(s):
        a, b = mt.start(), mt.end()
        out.append(s[i:a]); om.extend(m[i:a])
        out.append(" ")
        om.append(m[a] if a < len(m) else -1)
        i = b
    out.append(s[i:]); om.extend(m[i:])
    return "".join(out), om


def _strip_tags(s, m):
    out, om, i = [], [], 0
    for mt in _TAGS.finditer(s):
        out.append(s[i:mt.start()]); om.extend(m[i:mt.start()])
        i = mt.end()
    out.append(s[i:]); om.extend(m[i:])
    return "".join(out), om


def _strip_punct(s, m):
    out, om = [], []
    for ch, j in zip(s, m):
        if ch not in _PUNCT:
            out.append(ch); om.append(j)
    return "".join(out), om


def _lower(s, m):
    out, om = [], []
    for ch, j in zip(s, m):
        lo = ch.lower()
        for c in lo:
            out.append(c); om.append(j)
    return "".join(out), om


def _entities(s, m):
    out, om, i = [], [], 0
    for mt in _ENT.finditer(s):
        out.append(s[i:mt.start()]); om.extend(m[i:mt.start()])
        dec = html.unescape(mt.group(0))
        for c in dec:
            out.append(c); om.append(m[mt.start()])
        i = mt.end()
    out.append(s[i:]); om.extend(m[i:])
    return "".join(out), om


def variants(text):
    """Return {fold: (haystack, charmap)} over one decoded document."""
    m0 = list(range(len(text)))
    notags, mtags = _strip_tags(text, m0)
    v = {}
    v["f1"] = _lower(text, m0)
    v["f2"] = _collapse(text, m0)
    v["f3"] = _entities(text, m0)
    nt2, nt2m = _collapse(notags, mtags)
    v["f4"] = (nt2, nt2m)
    v["f5"] = _lower(nt2, nt2m)
    st, stm = _strip_punct(text, m0)
    v["f6"] = _collapse(st, stm)
    return v


def needle(fold, frag):
    if fold in ("f1", "f5"):
        parts = [c.lower() for c in frag]
        return "".join(parts)
    if fold in ("f2", "f4"):
        return _WS.sub(" ", frag)
    if fold == "f3":
        return _ENT.sub(lambda mt: html.unescape(mt.group(0)), frag)
    if fold == "f6":
        st = "".join(c for c in frag if c not in _PUNCT)
        return _WS.sub(" ", st)
    return frag


def find_hits(raw, text, fold, frag, var=None):
    """All occurrences of one fragment under one fold: [(line, byte_offset, ctx)]."""
    ndl = needle(fold, frag)
    if not ndl:
        return []
    hits = []
    if fold == "f0":
        nb = frag.encode("utf-8")
        start = 0
        while True:
            i = raw.find(nb, start)
            if i < 0:
                break
            line = raw.count(b"\n", 0, i) + 1
            ctx = raw[max(0, i - 40):i + len(nb) + 40].decode("utf-8", "replace").replace("\n", " ")
            hits.append((line, i, ctx))
            start = i + max(1, len(nb))
        return hits
    if var is None:
        var = variants(text)
    hay, cmap = var[fold]
    start = 0
    while True:
        i = hay.find(ndl, start)
        if i < 0:
            break
        oi = cmap[i] if i < len(cmap) else -1
        if oi is None or oi < 0:
            oi = 0
        line = text.count("\n", 0, oi) + 1
        boff = len(text[:oi].encode("utf-8"))
        ctx = text[max(0, oi - 40):oi + len(frag) + 40].replace("\n", " ")
        hits.append((line, boff, ctx))
        start = i + max(1, len(ndl))
    return hits


def locate(raw, text, frag, var=None):
    """Return {fold: [hits]} for the whole ladder plus the first locating fold."""
    if var is None:
        var = variants(text)
    table, first = {}, None
    for f in FOLDS:
        h = find_hits(raw, text, f, frag, var)
        table[f] = [{"line": L, "byte": B, "ctx": C} for L, B, C in h[:5]]
        table[f + "_n"] = len(h)
        if first is None and h:
            first = f
    return table, first


# ------------------------------------------------------------------ fetch ----

def guard(url):
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https"):
        raise Refused(f"scheme {parts.scheme!r} not http(s)")
    host = parts.hostname
    if not host:
        raise Refused("no host")
    port = parts.port or (443 if parts.scheme == "https" else 80)
    addrs = sorted({ai[4][0] for ai in socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)})
    for a in addrs:
        ip = ipaddress.ip_address(a)
        if ip.version == 6 and ip.ipv4_mapped is not None:
            ip = ip.ipv4_mapped
        if (ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_reserved
                or ip.is_multicast or ip.is_unspecified):
            raise Refused(f"host {host} resolves to non-public {a}")
    return addrs


def fetch(url, binpath):
    rec = {"url": url, "bin": os.path.basename(binpath)}
    try:
        rec["resolved"] = guard(url)
    except Refused as e:
        rec.update(httpCode=None, bytes=0, contentType=None, guard=str(e), ok=False)
        return rec
    # prescribed fields in order (http_code size_download content_type); the
    # effective URL is appended as a fourth field so redirects stay observable
    fmt = "%{http_code} %{size_download} %{content_type}\\t%{url_effective}"
    cmd = ["curl", "-sL", "--max-time", "90", "--max-filesize", "25000000",
           "--proto", "=http,https", "--proto-redir", "=http,https",
           "-o", binpath, "-w", fmt, url]
    rec["cmd"] = " ".join(cmd)
    p = subprocess.run(cmd, capture_output=True, text=True)
    code_s, rest = (p.stdout.strip().split(" ", 1) + [""])[:2]
    code = int(code_s) if code_s.isdigit() else None
    fields = rest.split("\t") if "\t" in rest else [rest]
    head = fields[0].split(" ")
    size = int(head[0]) if head and head[0].isdigit() else 0
    ctype = " ".join(head[1:]) if len(head) > 1 else None
    eff = fields[1] if len(fields) > 1 else url
    raw = open(binpath, "rb").read() if os.path.exists(binpath) else b""
    rec.update(httpCode=code, bytes=len(raw), contentType=ctype, urlEffective=eff,
               ok=(code is not None and 200 <= code < 300 and len(raw) > 0),
               sha256=hashlib.sha256(raw).hexdigest(), curlStderr=p.stderr.strip()[:400])
    return rec


# ------------------------------------------------------------------- main ----

def cmd_fetch(a):
    rows = json.load(open(a.rows, encoding="utf-8"))
    docs = json.load(open(a.docs, encoding="utf-8"))
    out = os.path.join(a.out, "docs")
    os.makedirs(out, exist_ok=True)
    man = {}
    for doc_id, url in docs.items():
        binpath = os.path.join(out, doc_id + ".bin")
        print(f"fetch {doc_id} {url}", flush=True)
        man[doc_id] = fetch(url, binpath)
        print(json.dumps(man[doc_id], ensure_ascii=False), flush=True)
    with open(os.path.join(a.out, "fetched.json"), "w", encoding="utf-8") as fh:
        json.dump(man, fh, ensure_ascii=False, indent=1)
    return 0


def load_text(binpath):
    raw = open(binpath, "rb").read()
    try:
        return raw, raw.decode("utf-8"), "utf-8"
    except UnicodeDecodeError:
        pass
    for enc in ("gb18030", "cp1252"):
        try:
            return raw, raw.decode(enc), enc
        except UnicodeDecodeError:
            continue
    return raw, raw.decode("utf-8", "replace"), "utf-8-replace"


def cmd_ladder(a):
    rows = json.load(open(a.rows, encoding="utf-8"))
    man = json.load(open(a.manifest, encoding="utf-8"))
    texts, reported = {}, {}
    for doc_id, rec in man.items():
        bp = os.path.join(a.out, "docs", doc_id + ".bin")
        if os.path.exists(bp):
            raw, text, enc = load_text(bp)
            texts[doc_id] = (raw, text, enc)
    results = {}
    for sid in sorted(rows):
        row = rows[sid]
        frags = [f.strip() for f in row["quotes"].split("<br>")]
        # unwrap one layer of backticks around each fragment (the register's quoting)
        unwrapped = []
        for f in frags:
            u = f[1:-1] if len(f) >= 2 and f.startswith("`") and f.endswith("`") else f
            unwrapped.append(u)
        per_doc = {}
        for doc_id in man:
            if doc_id not in texts:
                continue
            raw, text, enc = texts[doc_id]
            per_doc[doc_id] = {"fragments": [], "charset": enc, "textChars": len(text)}
            var = variants(text)
            for f in unwrapped:
                table, first = locate(raw, text, f, var)
                per_doc[doc_id]["fragments"].append({"quote": f, "fold": first,
                                                     "located": first is not None,
                                                     "folds": table})
                print(f"{sid} {doc_id} frag={f[:60]!r} first={first}", flush=True)
        results[sid] = {"quotesCell": row["quotes"], "fragments": unwrapped,
                        "docs": per_doc}
    with open(os.path.join(a.out, "ladder.json"), "w", encoding="utf-8") as fh:
        json.dump(results, fh, ensure_ascii=False, indent=1)
    return 0


def cmd_single(a):
    raw, text, _enc = load_text(a.file)
    hs = find_hits(raw, text, a.fold, a.fragment)
    for n, (L, B, C) in enumerate(hs):
        print(f"hit {n} line={L} byte={B} ctx={C[:120]!r}")
    print(f"hits={len(hs)} fold={a.fold}")
    return 0


def main(argv):
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("fetch")
    f.add_argument("--rows", required=True)
    f.add_argument("--docs", required=True)
    f.add_argument("--out", required=True)
    f.add_argument("--scratch", default=os.environ.get("TMPDIR", "."))
    f.set_defaults(fn=cmd_fetch)
    l = sub.add_parser("ladder")
    l.add_argument("--rows", required=True)
    l.add_argument("--manifest", required=True)
    l.add_argument("--out", required=True)
    l.set_defaults(fn=cmd_ladder)
    s = sub.add_parser("single")
    s.add_argument("--file", required=True)
    s.add_argument("--fold", required=True)
    s.add_argument("--fragment", required=True)
    s.set_defaults(fn=cmd_single)
    a = ap.parse_args(argv)
    return a.fn(a)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
