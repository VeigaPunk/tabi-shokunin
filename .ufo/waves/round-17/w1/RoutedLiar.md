VERDICT: PASS

# Routed defect 1 — unrooted liar-probe evidence (round 17, wave 1)

Seat TabiR17.RoutedLiar-2 (leaf). Owned path: `corpus/evidence/round-17/routed/liar/**`.
Route: `corpus/lessons/round-16-verifier-spotcheck.md:148`.

## Headline

The premise "the originals are gone" was **false at run time**: `/tmp/tabi-r16-c1liar-93NO`
still existed (on **xfs**, not tmpfs — `findmnt -T /tmp` per CriticRoutedFix-2, verified by the
directory surviving). I extracted the exact original bytes rather than reconstructing them from
prose. The lying blobs hash to exactly the r16-recorded digests, and the rebuild reproduces the
**exact original commit ids and trees** — not merely "the same shape".

Byte-identity: **yes, verified**, by three independent checks, all passing:
1. `blobs/gate.mjs` = `fa1e12e17b03…` and `blobs/selftest.mjs` = `3c92359883994e…`
   (AttackC1Liar.md:35-37); `receipt.json` records `matchesRecordedDigest: true`.
2. `generate.mjs` rebuilds each revision with plumbing (`read-tree`/`update-index --cacheinfo`/
   `write-tree`/`commit-tree`) from the committed blobs + the recorded author/committer metadata;
   commit ids are `9ecfcc91…`/`0754e448…`/`7b497d15…`, trees `53332fd0…`/`b7d9ac92…`/`e96352b6…`
   — all equal to the originals (`receipt.json` → `originals.commits[*].{commit,tree}Reproduced: true`).
3. `originals.bundle` (2010 B, sha256 `18568bfb…`) is a thin bundle; `git bundle verify` passes and
   `refs/original/*` restore the same commits, trees and per-path blob ids.
If `/tmp` is swept later, the claim still stands on the committed blobs + digest pins + bundle; the
`/tmp` path is provenance only, never a dependency.

## What was run (and its output)

`cd corpus/evidence/round-17/routed/liar && node generate.mjs` — exit 0, verdict `pass`.

```
HARDENED     honest b444ca8               b444ca8 exit=0 count=1 failures=0
HARDENED     liar selftest + liar gate    9ecfcc9 exit=0 count=0 failures=4
HARDENED     liar gate + real selftest    0754e44 exit=0 count=0 failures=7
HARDENED     liar selftest + real gate    7b497d1 exit=0 count=0 failures=1
PREHARDENING honest b444ca8               b444ca8 exit=0 count=1 failures=0
PREHARDENING liar selftest + liar gate    9ecfcc9 exit=0 count=1 failures=0
PREHARDENING liar gate + real selftest    0754e44 exit=0 count=0 failures=4
PREHARDENING liar selftest + real gate    7b497d1 exit=0 count=1 failures=0
receipt=…/corpus/evidence/round-17/routed/liar/receipt.json
verdict=pass
```

- **HARDENED** = the counter *at 3254740*, sha256 `c8b4100a…`, materialised from git into the sandbox
  and run as `node .ufo/waves/round-16/measure.mjs <rev> --claim C1`. Counts and **failure strings
  equal `corpus/evidence/round-16/measure/c1-liar-probes.json` exactly** (receipt
  `checks.r16ReceiptMatches: true`; all four runs `matched: true`).
- **PREHARDENING** = the blob at base `b444ca8`, sha256 `bda4e18e…`, same argv. It reproduces
  AttackC1Liar.md's table (:35-37) — 1 / 1 / 0 / 1 — proving the rebuilt liars still behave exactly
  like the originals; the hardened counter is what inverts V1/V3 to 0.
- Honest note on the judge: each run also reports `counterBlobAtRevisionSha256: bda4e18e…`, because
  the blob *at the measured revisions* is the pre-hardening counter (the liar commits sit on
  `b444ca8`). The counter that judged them is the 3254740 blob; the receipt records both facts.
- Reproducibility: re-run from `/` with `--out /tmp/…` gave identical runs, verdict and identities
  (cwd-independent), then the scratch receipt was deleted.

## Checks the generator asserts (any failure → exit 1, receipt still written)

- Base gate/selftest hashes are the r16-measured `5150611c…`/`8c5426f2…` (`realBlobsAtBase.*Verified`).
- Each liar variant's commit **and tree** reproduce the originals; the bundle restores them.
- Hardened engine: 1 for honest `b444ca8`, 0 for all three liars, exit 0 throughout, and the exact
  r16 count+failure arrays per revision.
- Pre-hardening engine: exactly 1/1/0/1 as in AttackC1Liar.md.

## Limits (carried, not softened)

- Defeats **only the three tested shapes**. A liar that branches on the counter's exact argv can
  still pass (AttackC1Liar.md:80); the r16 correction register already says the finite probes are not
  a proof. `receipt.json` carries the same limits verbatim.
- The counter executes revision scripts unsandboxed (measure.mjs header); run only on lane revisions.
- The liar commits are still *not* objects in the lane repo; they exist as committed blobs + a
  generator + a bundle. That is the routed fix as specified; it is **not load-bearing for C1**.
- No non-author review was performed here; this is an author-side reconstruction and run.

## Files written (all under the owned dir, plus this report)

- `corpus/evidence/round-17/routed/liar/blobs/gate.mjs` — sha256 `fa1e12e1…` (exact original)
- `corpus/evidence/round-17/routed/liar/blobs/selftest.mjs` — sha256 `3c923598…` (exact original)
- `corpus/evidence/round-17/routed/liar/originals.bundle` — sha256 `18568bfb…` (3 original commits)
- `corpus/evidence/round-17/routed/liar/generate.mjs` — rebuild + two-counter run, 306 lines
- `corpus/evidence/round-17/routed/liar/receipt.json` — run receipt, verdict `pass`, issues `[]`
- `corpus/evidence/round-17/routed/liar/run.stdout.txt` — captured stdout above
- `corpus/evidence/round-17/routed/liar/README.md` — 30 lines
- `.ufo/waves/round-17/w1/RoutedLiar.md` — this report

Tools installed: none. Sandbox `/tmp/tabi-r17-liar-n8pM8T` removed by the generator; my two scratch
clones and the scratch receipt were removed. No jj/git write ran in LANE; verification used only
sandbox clones.
