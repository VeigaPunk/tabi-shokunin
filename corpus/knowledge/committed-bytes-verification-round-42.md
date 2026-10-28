---
source: S149 — git-ls-tree manual, https://git-scm.com/docs/git-ls-tree (also S148 for the
  verbatim-quote discipline this entry's sibling check enforces)
verified-at: 2026-10-28 — opened copy sha256 2c298383476164238c6e25ba804412a335c405ab9540650bb603778e2f4f8b64
  (.ufo/waves/round-42/sources/git-ls-tree.html, HTTP 200, 38,955 bytes)
recheck: 180d or on git-scm.com doc revision — re-open the page and re-run the R1/R4
  commands of .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
---

# Committed-bytes verification (round 42)

## Claim

Round-41 verifier defect D1 was a landing-class calibration failure: the round-41
report, SCORECARD and lesson called `corpus/evidence/round41/playwright-egress/`
receipt files a "durable receipt" while `git ls-tree` at the pushed tip listed zero
files under that path — the bytes existed only as untracked working-tree files. A
claim's evidence exists when a revision addresses it, not when a path exists on a
checkout. `git ls-tree` "Lists the contents of a given tree object, like what
"/bin/ls -a" does" (S149, NAME/DESCRIPTION) — the instrument that would have caught
D1 before filing, and the instrument the round-42 checker's R1/R4 checks are built on.

## Decision table — where evidence is read from

| Surface | Reads | Catches | Misses |
|---|---|---|---|
| working-tree path (`test -f`, `wc -c`) | the checkout | nothing about history | untracked files (D1's exact failure), index-vs-HEAD skew, jj working-copy sweeps |
| `git ls-tree -r --name-only <rev> -- <path>` | the committed tree | absence from the revision under claim | blob validity (pair with `cat-file`) |
| `git show <rev>:<path>` + sha256 | committed bytes | byte drift between claimed and delivered revisions | nothing about reachability (pair with `ls-remote` for the branch tip) |
| `git ls-remote origin refs/heads/<branch>` | the pushed tip | "committed but never pushed" (the §4 pre-report gate) | local-only revisions |

## Rules distilled (each falsifiable by the cited incident)

1. Every report/SCORECARD/lesson evidence pointer names a path **and** the revision
   that must contain it; the verifier's first command is `git ls-tree` at that
   revision (D1: cited-as-durable, absent at `ef41e539`).
2. A baseline count stored as a control file carries its counting command next to
   the digit; an empty control file is a missing control, not a zero (D3:
   `c1-baseline-noop.out` committed 0 bytes in round 41).
3. Sources rows carry quotes as verbatim substrings of a committed staged copy of
   the source, so quote fidelity is checkable from bytes alone (D2: spliced S146
   quote; corrected by S148).
4. Large evidence files must be committed as explicitly named files: the lane
   helper skips new files over 1 MiB inside a named directory, so D1's two
   ~1.1 MB files silently stayed untracked when the directory was committed.

## Falsification

The round-42 checker (`.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`)
returns exit 1 with `r1a-receipt-absent`/`r1b-witness-absent` at baseline
`34e177959d1b7ce04afb85a001420e02631ce79e` (committed red control
`.ufo/waves/round-42/controls/c2-baseline-red.json`) and exit 0 once the receipt
bytes and their sha256 binding to the committed measure record are present at the
measured revision. Mutation seats attack the checker's refusal surfaces in the
round-42 wave.

## Limitations

- `git ls-tree` sees the named revision only; a claim about "the repo" must pin the
  revision (branch tip moves).
- Byte presence is not provenance: sha256 binding to an independently recorded
  measure document (as R1 does) is the weakest binding used here; producer digests
  (round-41 chain) remain the stronger instrument for executable evidence.
