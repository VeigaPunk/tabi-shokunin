#!/usr/bin/env python3
"""Independent quote-span audit for the two C2 entries (broader than entryQuotes).

Checks every quoted span >=4 words -- double, curly-double, single, curly-single --
including the title line (line 1) and fenced blocks, against the entry's cited bytes
(after whitespace collapse; HTML tag-stripped for the HTML row) and against the
sibling row's bytes (cross-row attribution probe).
"""
import re, sys, pathlib

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")

def norm(t, html=False):
    if html:
        t = re.sub(r"<script[\s\S]*?(</script>|$)", " ", t)
        t = re.sub(r"<style[\s\S]*?(</style>|$)", " ", t)
        t = re.sub(r"<[^>]*>", " ", t)
    return re.sub(r"\s+", " ", t.replace("\u200b", "").replace("\ufeff", "")).strip()

def spans(text):
    out = []
    pats = [
        (r'"([^"\n]{8,1200})"', "double"),
        (r"\u201c([^\u201d\n]{8,1200})\u201d", "curly-double"),
        (r"'([^'\n]{8,1200})'", "single"),
        (r"\u2018([^\u2019\n]{8,1200})\u2019", "curly-single"),
    ]
    for pat, kind in pats:
        for m in re.finditer(pat, text):
            s = m.group(1).strip()
            if len(s.split()) >= 4:
                out.append((kind, s, m.start()))
    return out

entries = {
    "S116": ("corpus/knowledge/rate-limit-policy-fields.md",
             ["corpus/evidence/round-30/frontier/bytes/S116.txt"],
             False),
    "S117": ("corpus/knowledge/host-published-rate-limit-headers.md",
             ["corpus/evidence/round-30/frontier/bytes/S117.html",
              "corpus/evidence/round-30/frontier/refetch/bytes/S117-refetch.html"],
             True),
}

bytes_by_id = {}
for rid, (_, paths, html) in entries.items():
    bytes_by_id[rid] = [norm((ROOT / p).read_text(errors="replace"), html) for p in paths]

fail = 0
for rid, (epath, _, _) in entries.items():
    text = (ROOT / epath).read_text(errors="replace")
    own = bytes_by_id[rid]
    other = [b for k, v in bytes_by_id.items() if k != rid for b in v]
    print(f"== {rid} ({epath})")
    seen = set()
    for kind, s, pos in spans(text):
        key = s[:80]
        if key in seen:
            continue
        seen.add(key)
        n = norm(s)
        located_own = any(n in b for b in own)
        located_other_only = (not located_own) and any(n in b for b in other)
        line = text[:pos].count("\n") + 1
        words = len(s.split())
        tag = "OWN" if located_own else ("SIBLING-ONLY" if located_other_only else "ABSENT")
        if not located_own:
            fail += 1
        print(f"  line {line:>3} {kind:<13} words={words:<3} {tag:<12} {s[:110]}")
print(f"\nSUMMARY unlocated_spans={fail}")

# S116 line-number citations from the Gate/row must actually carry the field definitions.
s116_lines = (ROOT / "corpus/evidence/round-30/frontier/bytes/S116.txt").read_text(errors="replace").split("\n")
for ln in (302, 308, 309, 310, 311, 432, 444):
    try:
        body = s116_lines[ln - 1]
    except IndexError:
        body = "<out of range>"
    print(f"S116 line {ln}: {body[:120]}")
