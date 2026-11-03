#!/usr/bin/env python3
"""Shape-only credential sweep (R59Sentinel). No credential CONTENT is ever read or echoed.

Patterns are matched as shapes. For every hit we record file:line and the SHAPE LABEL plus a
redacted context marker (the matched class only, never the matched literal).
"""
import os, re, sys, json, hashlib

ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin"

# (label, regex) -- shape only
PATTERNS = [
    ("openai-style-sk-key",      re.compile(r"\bsk-[A-Za-z0-9_\-]{16,}\b")),
    ("github-pat-ghp",           re.compile(r"\bghp_[A-Za-z0-9]{16,}\b")),
    ("github-pat-gho",           re.compile(r"\bgho_[A-Za-z0-9]{16,}\b")),
    ("github-pat-ghs",           re.compile(r"\bghs_[A-Za-z0-9]{16,}\b")),
    ("github-pat-github_pat",    re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b")),
    ("aws-akia-access-key",      re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("aws-akia-other-prefix",    re.compile(r"\b(ASIA|ABIA|ACCA)[0-9A-Z]{16}\b")),
    ("op-1password-uri",         re.compile(r"\bop://[A-Za-z0-9._\-]+/[A-Za-z0-9._\-]+")),
    ("age-secret-key",           re.compile(r"\bAGE-SECRET-KEY-1[0-9A-Z]{58}\b")),
    ("private-key-pem",          re.compile(r"-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----")),
    ("password-assignment",      re.compile(r"(?i)\b(password|passwd|pwd)\s*[:=]\s*[\"'][^\"'\s]{3,}[\"']")),
    ("token-assignment",         re.compile(r"(?i)\b(token|api[_-]?key|apikey|secret|access[_-]?token|auth[_-]?token|bearer)\s*[:=]\s*[\"'][^\"'\s]{8,}[\"']")),
    ("bearer-literal",           re.compile(r"(?i)\bbearer\s+[A-Za-z0-9._\-]{16,}")),
    ("jwt-literal",              re.compile(r"\beyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}")),
]

BINARY_EXT = {".png",".jpg",".jpeg",".gif",".webp",".ico",".pdf",".zip",".gz",".xz",".bz2",
              ".woff",".woff2",".ttf",".otf",".eot",".mp3",".mp4",".webm",".wasm",".so",".dylib",
              ".class",".jar",".pyc",".node",".bin",".sqlite",".db"}

def scan_file(path):
    hits = []
    try:
        with open(path, "rb") as fh:
            raw = fh.read()
    except Exception as e:
        return [{"file": path, "error": f"{type(e).__name__}: {e}"}]
    if b"\x00" in raw[:8192]:
        return []  # binary
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        return []
    for lineno, line in enumerate(text.splitlines(), 1):
        for label, rx in PATTERNS:
            m = rx.search(line)
            if m:
                hits.append({
                    "file": os.path.relpath(path, ROOT),
                    "line": lineno,
                    "shape": label,
                    "match_len": len(m.group(0)),
                    "redacted": "<shape-only; content not read>",
                })
    return hits

def main(targets):
    all_hits = []
    nfiles = 0
    skipped = []
    for t in targets:
        if os.path.isfile(t):
            files = [t]
        elif os.path.isdir(t):
            files = []
            for dp, dns, fns in os.walk(t):
                if ".git" in dns: dns.remove(".git")
                for fn in fns:
                    files.append(os.path.join(dp, fn))
        else:
            skipped.append(t); continue
        for f in sorted(files):
            if os.path.splitext(f)[1].lower() in BINARY_EXT: continue
            nfiles += 1
            all_hits.extend(scan_file(f))
    return {
        "schema": "r59-sentinel-secret-sweep-v1",
        "seat": "R59Sentinel",
        "method": "shape-only regex sweep; matched literals are NEVER read, printed or stored (only the shape label, the line number and the match length are recorded)",
        "patterns": [p[0] for p in PATTERNS],
        "targets": [os.path.relpath(t, ROOT) if t.startswith(ROOT) else t for t in targets],
        "targets_skipped_absent": skipped,
        "files_scanned": nfiles,
        "hit_count": len(all_hits),
        "hits": all_hits,
    }

if __name__ == "__main__":
    out = main(sys.argv[1:])
    print(json.dumps(out, indent=1))
