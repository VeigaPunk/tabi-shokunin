#!/usr/bin/env python3
"""R61 sentinel guard harness. Read-only. Emits a markdown report section set."""
import json, os, re, subprocess, sys, hashlib, glob, datetime

LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
FLEET = "/home/vgpnk/Projects/shokunin"
WAVE = os.path.join(LANE, ".ufo/waves/round-61")
SINCE = "2026-11-03 19:50"

def sh(cmd):
    p = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr

def g1():
    out = []
    src = os.path.join(WAVE, "sources")
    files = sorted(glob.glob(os.path.join(src, "*")))
    receipts = [f for f in files if f.endswith(".json") and "receipt" in os.path.basename(f)]
    htmls = [f for f in files if f not in receipts]
    out.append(f"files under sources/: {len(files)} ({len(receipts)} json receipt(s), {len(htmls)} staged)")
    flags = []
    for f in receipts:
        rel = os.path.relpath(f, LANE)
        try:
            r = json.load(open(f))
        except Exception as e:
            flags.append(f"{rel}: unparseable JSON ({e})")
            continue
        # field presence (accept the r60 receipt naming)
        def pick(*names):
            for n in names:
                if n in r: return r[n]
            return None
        url = pick("url", "sourceUrl", "citedUrl")
        final = pick("finalUrl")
        fhost = pick("finalHost")
        nred = pick("numRedirects", "num_redirects")
        status = pick("httpStatus", "http_status", "status")
        nbytes = pick("bytes", "byteCount", "byte_count")
        sha = pick("sha256")
        missing = []
        for label, v in (("url", url), ("finalUrl", final), ("finalHost", fhost),
                         ("numRedirects", nred), ("httpStatus", status),
                         ("bytes", nbytes), ("sha256", sha)):
            if v is None or v == "":
                missing.append(label)
        detail = [f"- `{rel}`"]
        if missing:
            detail.append(f"  - **FLAG** missing field(s): {', '.join(missing)}")
            flags.append(f"{rel}: missing {', '.join(missing)}")
        if url and final:
            cited_host = re.sub(r"^https?://", "", url).split("/")[0]
            fin_host = re.sub(r"^https?://", "", final).split("/")[0]
            if fhost and fhost != fin_host:
                detail.append(f"  - **FLAG** finalHost `{fhost}` != host of finalUrl `{fin_host}`")
                flags.append(f"{rel}: finalHost/finalUrl mismatch")
            if cited_host != fin_host:
                detail.append(f"  - **FLAG** cited host `{cited_host}` != final host `{fin_host}`")
                flags.append(f"{rel}: cited/final host mismatch")
            else:
                detail.append(f"  - host match: `{fin_host}`")
        if status is not None:
            if str(status) != "200":
                detail.append(f"  - **FLAG** HTTP status {status} != 200")
                flags.append(f"{rel}: HTTP {status}")
            else:
                detail.append("  - HTTP 200")
        if nred is not None:
            detail.append(f"  - numRedirects={nred}")
        if nbytes is not None:
            # verify the staged file named by the receipt, if any
            sp = pick("staged_file", "bytes_path")
            if sp:
                p = os.path.join(LANE, sp)
                if os.path.exists(p):
                    b = os.path.getsize(p)
                    h = hashlib.sha256(open(p, "rb").read()).hexdigest()
                    detail.append(f"  - staged `{sp}`: {b} bytes, sha256 {h[:16]}…")
                    if int(nbytes) != b:
                        detail.append(f"  - **FLAG** receipt bytes {nbytes} != staged {b}")
                        flags.append(f"{rel}: byte-count mismatch")
                    if sha and sha != h:
                        detail.append("  - **FLAG** receipt sha256 != staged sha256")
                        flags.append(f"{rel}: sha mismatch")
                else:
                    detail.append(f"  - **FLAG** staged file `{sp}` absent")
                    flags.append(f"{rel}: staged file absent")
            # sha256 shape
            if sha and not re.fullmatch(r"[0-9a-f]{64}", str(sha)):
                detail.append("  - **FLAG** sha256 not 64 hex chars")
                flags.append(f"{rel}: malformed sha256")
        out.extend(detail)
    if not receipts:
        out.append("- NOTE: no receipt JSON present at scan time (scout seat may not have landed)")
    return out, flags

WRITE_TOKENS = re.compile(r"\b(write|wrote|created|mv|rm|cp|tee|append|generated|saved|emit)\b", re.I)

def g2():
    out, flags, major = [], [], []
    rc, so, se = sh(f"find {LANE} -newermt '{SINCE}' -type f -not -path '*/.git/*' | sort")
    paths = [p for p in so.splitlines() if p]
    allowed_prefix = os.path.join(WAVE)
    runner = os.path.join(LANE, "scripts/chrome-cdp-loopback-round61.mjs")
    out.append(f"lane-tree files with mtime > {SINCE}: {len(paths)}")
    inside, vcs, bad = [], [], []
    for p in paths:
        if "/.jj/" in p or p.endswith("/.jj") or "/.jj/" == p:
            vcs.append(p)
        elif p == allowed_prefix or p.startswith(allowed_prefix + "/"):
            inside.append(p)
        elif p == runner:
            inside.append(p)
        else:
            bad.append(p)
    out.append(f"- inside .ufo/waves/round-61/** or the one runner: {len(inside)}")
    out.append(f"- VCS internals (.jj/, lane commits — not source writes): {len(vcs)}")
    out.append(f"- other lane-tree paths: {len(bad)}")
    for p in bad:
        out.append(f"  - **FLAG** {os.path.relpath(p, LANE)}")
        flags.append(os.path.relpath(p, LANE))
    # fleet root + siblings
    rc, so, se = sh(f"find {FLEET} -maxdepth 3 -newermt '{SINCE}' -type f -name '*tabi*' -not -path '*/.git/*' -not -path '*/.jj/*' 2>/dev/null | sort")
    ext = [p for p in so.splitlines() if p]
    out.append(f"fleet-root paths (depth<=3) newer than {SINCE} with 'tabi' in the name: {len(ext)}")
    for p in ext:
        rel = os.path.relpath(p, FLEET)
        if rel.startswith("tabi-shokunin/"):
            out.append(f"  - (lane-internal, counted above) {rel}")
        else:
            out.append(f"  - **MAJOR FLAG** {rel}")
            major.append(rel)
    # sibling repos: any tracked-name tabi file newly written inside them
    rc, so, se = sh(f"find {FLEET} -maxdepth 2 -mindepth 1 -type d -name '*shokunin' -newermt '{SINCE}' 2>/dev/null | sort")
    out.append("sibling repo roots modified since window start:")
    for d in [x for x in so.splitlines() if x]:
        rel = os.path.relpath(d, FLEET)
        if rel == "tabi-shokunin":
            out.append(f"  - {rel} (self)")
        else:
            out.append(f"  - {rel} — repo-root mtime moved")
    return out, flags, major

def g3():
    out, flags = [], []
    rc, so, se = sh("ss -ltn 2>&1")
    listeners = [l for l in so.splitlines() if l.startswith("LISTEN")]
    out.append(f"listening TCP sockets: {len(listeners)}")
    round_ports = re.compile(r":(19[0-9]{3}|1808[0-9])\b")
    hot = [l for l in listeners if round_ports.search(l)]
    out.append("- listeners on 19xxx/1808x (round-scale ephemeral range used by the runner): "
               + ("none" if not hot else "; ".join(hot)))
    if hot:
        flags.append("listener in round port range: " + "; ".join(h.strip() for h in hot))
    rc, so, se = sh("ps -eo pid,ppid,etime,args 2>/dev/null | grep -F 'user-data-dir=/fast/scratch/hyaku/tabi-r61' | grep -v grep")
    procs = [p for p in so.splitlines() if p]
    out.append(f"processes with --user-data-dir under /fast/scratch/hyaku/tabi-r61: {len(procs)}")
    for p in procs:
        out.append(f"  - **MAJOR FLAG** {p}")
        flags.append("survivor: " + p.strip()[:160])
    rc, so, se = sh("ps -eo pid,args 2>/dev/null | grep -Ei 'chrom(e|ium)' | grep -v grep || true")
    allchr = [p for p in so.splitlines() if p]
    out.append(f"all chromium-named processes: {len(allchr)}")
    for p in allchr[:15]:
        out.append(f"  - {p.strip()[:200]}")
    # scratch profile dirs from this round
    rc, so, se = sh("ls -la /fast/scratch/hyaku/tabi-r61 2>/dev/null || true")
    out.append("scratch roots under /fast/scratch/hyaku/tabi-r61:")
    for l in so.splitlines():
        out.append(f"  - {l}")
    return out, flags

URL_RE = re.compile(r"https?://[^\s)>\]\"'`|]+")

def _fence_lines(text):
    """Return the set of line indices (0-based) that sit inside a ``` fence."""
    inside, out = False, set()
    for i, line in enumerate(text.split("\n")):
        if line.lstrip().startswith("```"):
            inside = not inside
            out.add(i)
            continue
        if inside:
            out.add(i)
    return out

def g4():
    out, flags = [], []
    src = os.path.join(WAVE, "sources")
    rec_hosts = set()
    rec_urls = set()
    for f in sorted(glob.glob(os.path.join(src, "*.json"))):
        try:
            r = json.load(open(f))
        except Exception:
            continue
        for k in ("url", "finalUrl"):
            if r.get(k):
                rec_urls.add(r[k].rstrip("/"))
                rec_hosts.add(re.sub(r"^https?://", "", r[k]).split("/")[0])
    docs = sorted(glob.glob(os.path.join(WAVE, "w1", "*.md"))) + \
           sorted(glob.glob(os.path.join(WAVE, "w1", "*", "*.md"))) + \
           sorted(glob.glob(os.path.join(WAVE, "*.md")))
    # do not grade our own outputs
    docs = [d for d in docs if "R61Sentinel" not in d]
    out.append(f"seat docs scanned for cited URLs: {len(docs)}")
    inquote = []
    for d in docs:
        try:
            text = open(d, errors="replace").read()
        except Exception:
            continue
        fenced = _fence_lines(text)
        lines = text.split("\n")
        urls = set(URL_RE.findall(text))
        urls = {u.rstrip(".,;:") for u in urls}
        cited = sorted(u for u in urls if not u.startswith("http://127.0.0.1")
                       and not u.startswith("http://localhost"))
        missing = [u for u in cited if u.rstrip("/") not in rec_urls
                   and re.sub(r"^https?://", "", u).split("/")[0] not in rec_hosts]
        rel = os.path.relpath(d, LANE)
        if cited:
            out.append(f"- `{rel}`: {len(cited)} external URL(s), {len(cited)-len(missing)} host-covered by a receipt")
        for u in missing:
            ctx = []
            for i, line in enumerate(lines):
                if u in line or u.rstrip(".,;:") in line:
                    kind = "in-fence" if i in fenced else ("href" if "href=" in line else "prose")
                    ctx.append(f"L{i+1}:{kind}")
            # a URL quoted from receipted bytes is not a fetch claim
            if ctx and all(("in-fence" in c or "href" in c) for c in ctx):
                inquote.append(f"{rel} {u} ({', '.join(ctx[:3])})")
            else:
                out.append(f"  - **FLAG** cited with no receipt: {u} ({', '.join(ctx[:3])})")
                flags.append(f"{rel}: {u}")
    if inquote:
        out.append("- the following URL strings occur only inside quoted receipted bytes / href markup "
                   "(not fetch claims, no receipt required):")
        for c in inquote:
            out.append(f"  - {c}")
    return out, flags

def main():
    res = {}
    for name, fn in (("G1", g1), ("G2", g2), ("G3", g3), ("G4", g4)):
        try:
            r = fn()
        except Exception as e:
            r = ([f"- ERROR {e}"], ["harness error: %s" % e])
        res[name] = r
    print(json.dumps(res, indent=1))

if __name__ == "__main__":
    main()
