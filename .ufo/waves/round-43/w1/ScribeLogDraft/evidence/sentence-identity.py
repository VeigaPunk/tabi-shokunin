#!/usr/bin/env python3
"""ScribeLogDraft — read-only check of the round-43 sentenceIdentity claim.

claims.json declares, per claim, a `sentenceIdentity.sites` list and a `byteIdentical` flag:
the predicate sentence must be byte-identical across the claims file, the counter's
PREDICATE-SENTENCE header comment and the counter's `const PREDICATE` literal.

This re-derives that comparison over the committed bytes, using the sites the freeze itself
declares (for C1 that is claims[0].counterPredicate, not claims[0].predicate), and additionally
reports the relation between the claim-level `predicate` field and the counter predicate.
Read-only; writes nothing outside stdout.
"""
import json
import os
import re
import sys

ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
CLAIMS = os.path.join(ROOT, ".ufo/waves/round-43/claims.json")


def unescape(text):
    return text.replace("\\'", "'").replace("\\\\", "\\")


def main():
    claims = json.load(open(CLAIMS, encoding="utf-8"))
    bad = 0
    for claim in claims["claims"]:
        cid = claim["id"]
        identity = claims["sentenceIdentity"][cid]
        counter_rel = None
        for site in identity["sites"]:
            if site.endswith(".mjs const PREDICATE"):
                counter_rel = site.split(" ")[0]
        counter = os.path.join(ROOT, counter_rel)
        text = open(counter, encoding="utf-8").read()
        header = re.search(r"^// PREDICATE-SENTENCE: (.*)$", text, re.M)
        literal = re.search(r"^const PREDICATE = '(.*)';$", text, re.M)
        head_txt = unescape(header.group(1)) if header else None
        lit_txt = unescape(literal.group(1)) if literal else None

        declared = None
        for site in identity["sites"]:
            m = re.search(r"claims\.json claims\[(\d)\]\.(\w+)", site)
            if m:
                declared = claims["claims"][int(m.group(1))][m.group(2)]
        sites = {
            "claims.json (declared site: %s)" % next(
                s for s in identity["sites"] if s.startswith(".ufo/waves/round-43/claims.json")
            ).split("claims.json ")[1]: declared,
            "%s header PREDICATE-SENTENCE" % counter_rel: head_txt,
            "%s const PREDICATE" % counter_rel: lit_txt,
        }
        print("=== %s (%s) — declared byteIdentical: %s ===" % (cid, claim["kind"], identity["byteIdentical"]))
        print("declared sentence bytes: %d" % len(declared.encode()))
        for name, value in sites.items():
            if value is None:
                print("  ABSENT    %s" % name)
                bad += 1
            elif value == declared:
                print("  IDENTICAL %s" % name)
            else:
                print("  DIFFERS   %s (len %d)" % (name, len(value.encode())))
                bad += 1
        claim_pred = claim["predicate"]
        if claim_pred != declared:
            i = 0
            while i < min(len(claim_pred), len(declared)) and claim_pred[i] == declared[i]:
                i += 1
            print("  claim-level `predicate` field = declared sentence + %d-byte suffix:" % (len(claim_pred) - i))
            print("    %r" % claim_pred[i:])
        else:
            print("  claim-level `predicate` field == declared sentence")
        print("")
    print("mismatches across the freeze-declared sites: %d" % bad)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
