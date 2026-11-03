#!/usr/bin/env python3
"""R59Sentinel fetch-guard compliance checker (read-only over the scout's receipts).

Rule (R57-S3): every network fetch used as evidence records
  final host == cited host, num_redirects == 0, a byte count, and a sha256.

This tool evaluates each fetch_guard block and each evidence row against those four
predicates. It reads only guard METADATA -- never any session or private URL content,
never credential material.

The receipts carry BOTH camelCase and snake_case spellings of the same guard fields
(finalHost / final_host, numRedirects / num_redirects). Either is accepted.
A receipt's CITED host is authoritative from its own `url` when the receipt does not
spell a `cited_host` key out separately.
"""
import json, os, sys
from urllib.parse import urlparse

ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin"


def _pick(d, *names):
    for n in names:
        if n in d and d[n] is not None:
            return d[n]
    return None


# Field-name aliases across the receipt generations in this lane:
#   size_download / sizeDownload / bytes / stagedBytes
#   sha256 / stagedSha256 / transportSha256
#   url / urlEffective / url_effective
#   fetched_at / fetchedAt
def _size(d):
    return _pick(d, "size_download", "sizeDownload", "bytes", "stagedBytes")


def _sha(d):
    return _pick(d, "sha256", "stagedSha256", "transportSha256")


def _url(d):
    return _pick(d, "url", "url_effective", "urlEffective")


def host_of(url):
    try:
        return urlparse(url).hostname
    except Exception:
        return None


def check_guard(g, where, cited_from_url=None):
    """Evaluate ONE fetch record against the four R57-S3 predicates."""
    problems = []
    cited = _pick(g, "cited_host", "citedHost")
    if cited is None:
        cited = cited_from_url
    final = _pick(g, "final_host", "finalHost")
    nr = _pick(g, "num_redirects", "numRedirects")
    size = _size(g)
    sha = _sha(g)
    url = _url(g)

    if cited is None:
        problems.append("cited host undeterminable (no cited_host key and no parsable url)")
    if final is None:
        problems.append("final_host missing")
    elif cited is not None and final != cited:
        problems.append(f"final_host {final!r} != cited_host {cited!r}")
    if nr is None:
        problems.append("num_redirects missing")
    elif nr != 0:
        problems.append(f"num_redirects {nr!r} != 0")
    if size is None:
        problems.append("byte count missing")
    elif not isinstance(size, int) or size <= 0:
        problems.append(f"byte count {size!r} is not a positive int")
    if not sha:
        problems.append("sha256 missing")
    elif not isinstance(sha, str) or len(sha) != 64:
        problems.append(f"sha256 {sha!r} is not a 64-char hex digest")

    code = _pick(g, "http_code", "httpCode", "code")
    if code is not None and code != 200:
        problems.append(f"http_code {code!r} != 200")

    return {
        "where": where,
        "url": url,
        "cited_host": cited,
        "final_host": final,
        "host_match": (cited is not None and final == cited),
        "num_redirects": nr,
        "bytes": size,
        "sha256": sha,
        "http_code": code,
        "verdict": "COMPLIANT" if not problems else "VIOLATION",
        "problems": problems,
    }


def check_receipt(path):
    """A receipt = ONE fetch (its top-level guard fields) + N evidence rows."""
    res = []
    rel = os.path.relpath(path, ROOT)
    try:
        d = json.load(open(path, encoding="utf-8"))
    except Exception as e:
        return [{"where": rel, "verdict": "UNPARSEABLE",
                 "problems": [f"{type(e).__name__}: {e}"]}]

    # -- the receipt's own fetch record (top-level guard fields) --------------
    url = _url(d)
    rows = d.get("rows") or []
    top = {
        "url": url,
        "cited_host": _pick(d, "cited_host", "citedHost") or host_of(url),
        "final_host": _pick(d, "final_host", "finalHost"),
        "num_redirects": _pick(d, "num_redirects", "numRedirects"),
        "size_download": _size(d),
        "sha256": _sha(d),
        "http_code": _pick(d, "http_code", "httpCode", "code"),
    }
    # The digest of the fetched bytes may be recorded at the top level OR on the
    # receipt's evidence row (r58 spells it on the row; r59 spells it at both
    # levels). A receipt records the digest for the fetch either way.
    if top["sha256"] is None:
        for r in rows:
            if isinstance(r, dict) and r.get("sha256"):
                top["sha256"] = r["sha256"]
                break
    # If the receipt nests a fetch_guard block, prefer its (identical) fields.
    fg = d.get("fetch_guard")
    if isinstance(fg, dict):
        for k in ("url", "cited_host", "final_host", "num_redirects",
                  "size_download", "sha256", "http_code"):
            v = fg.get(k)
            if v is not None:
                top[k] = v
    res.append(check_guard(top, rel + " [receipt fetch]"))

    # -- the evidence rows ---------------------------------------------------
    for i, row in enumerate(d.get("rows") or []):
        if not isinstance(row, dict):
            continue
        problems = []
        b = _pick(row, "bytes", "size_download")
        if b is None:
            problems.append("row byte count missing")
        if not row.get("sha256"):
            problems.append("row sha256 missing")
        if not row.get("fetched_at"):
            problems.append("row fetched_at missing")
        res.append({
            "where": f"{rel} [row {i}]",
            "kind": "ROW",
            "id": row.get("id"), "url": row.get("url"),
            "bytes": b, "sha256": row.get("sha256"),
            "fetched_at": row.get("fetched_at"),
            "verdict": "COMPLIANT" if not problems else "VIOLATION",
            "problems": problems,
        })

    # -- any nested fetch_guard blocks beyond the top level -------------------
    def deeper(obj, path):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k == "fetch_guard":
                    continue
                if isinstance(v, dict) and (
                        "cited_host" in v or "num_redirects" in v or "final_host" in v):
                    res.append(check_guard(v, f"{rel} {path}.{k}"))
                else:
                    deeper(v, f"{path}.{k}")
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                deeper(v, f"{path}[{i}]")
    deeper(d, "")
    return res


def main(paths):
    res = []
    seen = []
    for p in paths:
        if not os.path.exists(p):
            res.append({"where": os.path.relpath(p, ROOT) if p.startswith(ROOT) else p,
                        "verdict": "ABSENT", "problems": ["receipt file absent"]})
            continue
        seen.append(os.path.relpath(p, ROOT))
        res.extend(check_receipt(p))
    viol = [r for r in res if r.get("verdict") != "COMPLIANT"]
    out = {
        "schema": "r59-sentinel-fetch-guard-check-v1",
        "seat": "R59Sentinel",
        "rule": "R57-S3: per fetch -> final_host == cited_host, num_redirects == 0, a positive byte count, a 64-hex sha256, and http_code 200. Rows additionally carry bytes + sha256 + fetched_at.",
        "receipts_scanned": seen,
        "checks": res,
        "violation_count": len(viol),
        "violations": viol,
    }
    print(json.dumps(out, indent=1))
    return out


if __name__ == "__main__":
    main(sys.argv[1:])
