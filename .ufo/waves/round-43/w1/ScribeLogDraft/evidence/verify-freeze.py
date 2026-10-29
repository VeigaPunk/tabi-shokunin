#!/usr/bin/env python3
"""ScribeLogDraft — read-only re-derivation of the round-43 freeze bindings.

Re-computes the sha256 of every instrument pinned in claims.json's frozenDigests
and of every control named in controlBindings, and checks that each control's
bound verbatim quote line is present in the control bytes. Read-only over the
lane tree; writes nothing outside stdout.

Run from the repo root:
  python3 .ufo/waves/round-43/w1/ScribeLogDraft/evidence/verify-freeze.py
"""
import hashlib
import json
import os
import sys

ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
CLAIMS = os.path.join(ROOT, ".ufo/waves/round-43/claims.json")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    claims = json.load(open(CLAIMS, encoding="utf-8"))
    print("repo:      %s" % ROOT)
    print("claims:    %s" % CLAIMS)
    print("claims sha256: %s" % sha256(CLAIMS))
    print("")
    print("--- frozenDigests ---")
    bad = 0
    for path, expected in claims["frozenDigests"].items():
        full = os.path.join(ROOT, path)
        got = sha256(full) if os.path.isfile(full) else "MISSING"
        ok = got == expected
        bad += 0 if ok else 1
        print("%-9s %s\n          got  %s\n          want %s" % ("OK" if ok else "MISMATCH", path, got, expected))
    print("")
    print("--- controlBindings (sha256 + verbatim quote line) ---")
    for binding in claims["controlBindings"]:
        path = binding["path"]
        full = os.path.join(ROOT, path)
        got = sha256(full) if os.path.isfile(full) else "MISSING"
        digest_ok = got == binding["sha256"]
        quote_ok = False
        if digest_ok:
            text = open(full, encoding="utf-8").read()
            quote_ok = binding["quote"] in text
        bad += 0 if (digest_ok and quote_ok) else 1
        print("%-9s %-9s %s" % ("OK" if digest_ok else "MISMATCH",
                                "quote-OK" if quote_ok else "QUOTE-MISSING", path))
    print("")
    print("mismatches: %d" % bad)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
