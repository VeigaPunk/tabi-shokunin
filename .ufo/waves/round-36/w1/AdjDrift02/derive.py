#!/usr/bin/env python3
"""Exact re-derivation of drift-audit status from sibling git objects only.

Semantics mirrored 1:1 from .ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs
(lines 391-415): undefined vs empty-string are DISTINCT; `trim()` is applied to the
cited/head line, not to the file.
"""
import json
import subprocess
import sys

FLEET = "/home/vgpnk/Projects/shokunin"
TABI = f"{FLEET}/tabi-shokunin"
PINS = f"{TABI}/.ufo/waves/round-36/baseline/c1-delta-pins.json"


def git(repo, *args):
    p = subprocess.run(["git", "-C", repo, *args], capture_output=True)
    return None if p.returncode != 0 else p.stdout


def blob(repo, rev, path):
    """None when the object is absent (matches `blob(..., {optional:true})`)."""
    out = git(repo, "show", f"{rev}:{path}")
    return out


def lines(buf):
    """Split like the counter's lines(): drop the single trailing newline only."""
    if buf is None:
        return None
    text = buf.decode("utf-8", "replace")
    if text.endswith("\n"):
        text = text[:-1]
    return text.split("\n") if text != "" else []


def observe(repo, pin, head, path, n):
    pinbuf = blob(repo, pin, path)
    if pinbuf is None:
        return "stale", "pin file absent"
    pl = lines(pinbuf)
    pin_text = pl[n - 1] if n - 1 < len(pl) else None
    if pin_text is None:
        return "stale", "pin line absent"
    cited = pin_text.strip()
    hb = blob(repo, head, path) if head else None
    if hb is None:
        return "stale", "no/absent head file"
    hl = lines(hb)
    head_at_n = hl[n - 1].strip() if n <= len(hl) else None
    if head_at_n == cited:
        return "unchanged", "-"
    reloc = [i + 1 for i, t in enumerate(hl) if t.strip() == cited]
    if reloc:
        return "moved", ":" + ",:".join(map(str, reloc))
    return "stale", "cited text absent at head"


def main(chunk, ledger, pins_path, out_path):
    delta = json.load(open(pins_path))
    rows = [l.rstrip("\n").split("\t") for l in open(chunk) if l.strip()]
    ledger_status = {}
    for i, l in enumerate(open(ledger)):
        if i == 0 or not l.strip():
            continue
        f = l.rstrip("\n").split("\t")
        ledger_status[f[0]] = (f[1], f[2] if len(f) > 2 else "")
    res, mism = [], 0
    for ref, _cstatus, _cnote in rows:
        lane, rest = ref.split("@", 1)
        lane = lane[: -len("-shokunin")]
        pin, rest = rest.split(":", 1)
        path, n = rest.rsplit(":", 1)
        mine, note = observe(f"{FLEET}/{lane}-shokunin", pin, delta.get(lane), path, int(n))
        lstat, lnote = ledger_status.get(ref, ("ROW-ABSENT", ""))
        ok = "agree" if mine == lstat else "MISMATCH"
        if ok == "MISMATCH":
            mism += 1
        res.append((ref, mine, note, lstat, ok))
    with open(out_path, "w") as fh:
        fh.write("sibling_ref\tmy-status\tmy-note\tledger-status\tverdict\n")
        for r in res:
            fh.write("\t".join(r) + "\n")
        fh.write(f"# AdjDrift02: {len(res)} rows, {mism} mismatches\n")
    print(f"rows={len(res)} mismatches={mism}")


if __name__ == "__main__":
    main(*sys.argv[1:5])
