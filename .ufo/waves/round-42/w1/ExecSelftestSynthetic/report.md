# ExecSelftestSynthetic — checker negative-surface selftest

Round 42, wave 1, seat `ExecSelftestSynthetic`. Axis: **calibration**. Item: checker negative selftest.
Leaf seat: no subagents, no git/jj mutation outside the throwaway fixtures, no network.

## Frozen inputs (read-only, digest-recorded)

| input | value |
|---|---|
| checker | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs` |
| checker sha256 (before **and** after all runs) | `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8` |
| claims | `.ufo/waves/round-42/claims.json` (C2, predicate frozen at commit `9b6de3a19de11abdb80e82a1310abc64a40215bb`, baseline `34e177959d1b7ce04afb85a001420e02631ce79e`) |
| lane HEAD during this seat | `0081bfdb93b6bd1bf2853bb128996f1a976b7218` |

The checker was executed **from the lane path, never copied or edited**; its digest is identical before and
after (quoted above), so the bytes tested are the frozen lane bytes. It shells out only to
`git -C <repo> show|cat-file` and writes nothing (`spawnSync` results are read-only; verified below by
`git status --porcelain` returning empty in every fixture worktree after all checker runs).

## Method

Scratch root `/fast/scratch/hyaku/tabi-r42/ExecSelftestSynthetic/` (created, used, deleted — see Cleanup).
Per case: `tempfile.mkdtemp(dir=fixture/)` (== `mktemp -d`), `git init -q -b main`, then the toplevel was
**asserted** equal to the fixture dir:

```
git -C <fixture> rev-parse --show-toplevel   # asserted == <fixture>
```

Hermetic git identity/config per fixture (`GIT_AUTHOR_*`, `GIT_COMMITTER_*`, `GIT_CONFIG_GLOBAL=/dev/null`,
`GIT_CONFIG_SYSTEM=/dev/null`), one commit per case, head recorded. Invocation:

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs \
     --rev <fixture head> --repo <fixture dir> --json
```

Fixture shapes were copied from the real lane artefacts, not guessed: the SOURCES.md row indices the checker
reads (`cell(row,7)` = teaches, `cell(row,8)` = status) match the real committed rows S146/S148 at lane HEAD;
the 38 staged ids are the real `.ufo/waves/round-42/quarantine/slice-ids.txt` contents; evidence paths use the
real `.ufo/waves/round-42/w1/<seat>/evidence-SNNN.txt` shape. Receipt/witness/measure/TSV bytes are
**deliberately arbitrary** ("genuine repair, arbitrary content") except where a case mutates one property.

Reproduce scripts are archived at `evidence/build_and_run.py`, `evidence/run_extra.py`, `evidence/run_mutants.py`.

## Required cases — all PASS

| case | mutation | exit | findings | verdict |
|---|---|---|---|---|
| **F1** | 38 valid TSV rows; 5 evidence blobs never committed (S102,S106,S109,S110,S111) | 1 | `r4-evidence-absent` ×5 | PASS |
| **F2** | 39 rows, S102 duplicated | 1 | `r4-duplicate-ids` | PASS |
| **F3** | receipt 500 B valid JSON + 300 B witness + self-authored measure with matching digests | 1 | `r1a-too-small`, `r1b-too-small` | PASS |
| **F4** | S148 quote = 30 invented words (also present in staged HTML) | 1 | `r2-quote-word-count` | PASS |
| **F5** | clean full fixture, all four repairs, arbitrary bytes | **0** | none — `predicate: true` | PASS |

Exact F1 output (`evidence/checker-F1.s7jitc62.json`):

```
"findingCount": 5,
 "findings": [
  { "id": "r4-evidence-absent", "detail": "S102: evidence .ufo/waves/round-42/w1/QuarR4200/evidence-S102.txt not committed at REV" },
  ... S106, S109, S110, S111 ...
```

Exact F3 output (`evidence/checker-F3.sf6dpob5.json`):

```
{ "id": "r1a-too-small", "detail": "...receipt.json committed blob is 500 bytes (<1000)" },
{ "id": "r1b-too-small", "detail": "...receipt.witness.json committed blob is 300 bytes (<1000)" }
```

Exact F4 output (`evidence/checker-F4.bvv4cw1_.json`):

```
{ "id": "r2-quote-word-count", "detail": "S148 quote has 30 words, need 1..25" }
```

Exact F5 output — the load-bearing result (`evidence/checker-F5.b6qk59d6.json`):

```
{"schema":"tabi-r42-routed-defects","rev":"083b1c4f704c12e0ad1bcae49c8d76b47fee5dd1","predicate":true,"findingCount":0,"findings":[]}
```

**F5 exit 0 proves the checker is not red-by-construction**: a clean tree containing all four repairs, with
arbitrary content, satisfies the frozen predicate. Determinism: F5 run twice → `exits=0,0 identical=yes`.

## Boundary and adversarial probes — all PASS

| case | mutation | exit | findings |
|---|---|---|---|
| N1 | baseline control keeps `ls-tree` but loses the digit `0` | 1 | `r3-zero-not-recorded` |
| N2 | one verdict spelled `presentt` | 1 | `r4-verdict-enum` |
| N3a | quote = **25** words, verbatim in HTML | **0** | — (upper bound inclusive) |
| N3b | quote = **26** words, verbatim in HTML | 1 | `r2-quote-word-count` |
| N4 | `slice-ids.txt` holds 37 ids, TSV still 38 rows | 1 | `r4-slice-size`, `r4-ids-extra` |
| N5 | receipt rewritten, measure left naming the old digest | 1 | `r1a-digest-mismatch` |
| N6 | receipt 1200 B but not JSON | 1 | `r1a-unparseable` |
| E1 | one evidence blob committed but **0 bytes** | 1 | `r4-evidence-thin` |
| E2 | baseline control committed but **0 bytes** (the D3 defect) | 1 | `r3-baseline-file-empty` |
| E3 | 3-cell row carrying unknown id `S999` | 1 | `r4-ids-extra`, `r4-evidence-absent` |
| E4 | empty quote (`supersedes S146 —` then nothing) | 1 | `r2-quote-word-count` only |
| M1 | teaches no longer begins `supersedes S146` | 1 | `r2-supersedes-prefix-missing` |
| M2 | staged HTML deleted | 1 | `r2-staged-html-absent` |
| M3 | baseline keeps `0` but loses `ls-tree` | 1 | `r3-command-not-recorded` |
| M4 | 2-cell TSV row appended | 1 | `r4-row-malformed` only |
| M5 | one TSV row removed (37 rows) | 1 | `r4-ids-missing` |
| M6 | S146 row removed | 1 | `r2-s146-absent` |
| M7 | baseline control deleted | 1 | `r3-baseline-file-absent` |
| M8 | measure record deleted | 1 | `r1-measure-absent` only (no spurious binding findings) |
| M9 | measure record 3 bytes, unparseable | 1 | `r1-measure-unparseable` |
| M10 | witness 1204 B, not JSON | 1 | `r1b-unparseable` |
| M11 | witness rewritten, digest not updated | 1 | `r1b-digest-mismatch` |
| M12 | `corpus/SOURCES.md` deleted | 1 | `r2-sources-absent` |
| M13 | measure valid JSON but missing both digest keys | 1 | `r1a-binding-unavailable`, `r1b-binding-unavailable` |

Negative-surface coverage, computed against the id vocabulary extracted verbatim from the checker source
(`evidence/coverage.txt`):

```
finding-id vocabulary: 34   observed live: 32   coverage: 32/34
NEVER OBSERVED: r1a-unreadable, r1b-unreadable
```

The two unobserved ids are the `cat-file -s` succeeded / `git show` failed branch. Both commands address the
same `rev:path`, so a committed blob that sizes cannot be made to fail `show`; the branch is unreachable
through repo state [code-read, `checker:70-79`].

## Grounding against real lane bytes (read-only)

1. **Lane HEAD `0081bfd`** — `exit=1`, exactly one finding:

```
{ "id": "r4-quarantine-absent",
  "detail": ".ufo/waves/round-42/quarantine/re-adjudication.tsv not committed at REV" }
```

This matches the claim's "at the freeze only r4 is red, by design" (`controls/c2-at-freeze.json` records the
same single finding at freeze rev `9b6de3a`). Evidence: `evidence/repro-HEAD-0081bfd.json`.

2. **Baseline `34e1779`** — `exit=1`, 7 findings, and the output is **byte-identical** to the committed red
control:

```
byte-identical to c2-baseline-red.json: true
ids equal: true   details equal: true
```

Evidence: `evidence/repro-r34e1779.json`. This is the strongest determinism result: the harness reproduces the
checked-in control exactly, so the fixture method is faithful to the frozen instrument.

## Findings (routed, no amendment proposed)

- **F-1 — the checker is not red-by-construction.** F5 (exit 0) plus N3a (exit 0) show the green path is
  reachable and that it is not gated on an impossible condition. The instrument is falsifiable in both
  directions.
- **F-2 — the negative surface is essentially total.** 32 of 34 frozen finding ids were produced live, each
  from the single property it names, with no collateral findings in 20 of the 25 cases; where two fire, the
  pair is causally correct (N4, E3, M13). This is the calibration evidence the round wanted.
- **F-3 — boundary discipline is exact and inclusive where documented.** 25-word quote passes, 26 fails; the
  1000-byte receipt/witness floor and the 200-byte evidence floor are `<` comparisons, so exactly-at-floor
  passes; `slice-ids.txt` must hold exactly 38 ids.
- **F-4 — r1a/r1b proves *consistency*, not *authenticity*.** The digest in `c1-measure.json` is itself a
  committed, self-authored file. F5's receipt is 1200 bytes of arbitrary JSON whose own `note` field reads
  `"selftest fixture, arbitrary bytes, no browser run"`, and it greens r1a/r1b. So the checker enforces "the
  committed receipt is the blob the committed measure record names", never "a browser ran". C2's killRule
  routes *"any accepted fabricated/empty evidence"*; this seat shows the **empty/thin** limb is enforced (E1,
  E2, F3) but the **fabricated-but-well-formed** limb is not enforceable by this instrument — only C1's
  nonce-bound counter can. This is inherent to C2's stated ledger-closure scope, not a defect to patch; it is
  routed so the closure does not claim more than the instrument measures.
- **F-5 — claims prose understates its own red control.** `claims.json` C2 `beforeState` lists 5 ids at the
  baseline rev (`r1a-receipt-absent, r1b-witness-absent, r2-supersession-absent, r3-baseline-file-empty,
  r4-quarantine-absent`), but the committed `c2-baseline-red.json` and the live run both give **7** — the prose
  omits `r2-s146-not-rejected` and `r4-slice-absent`. The control is correct and reproduced exactly; only the
  frozen prose is incomplete. Routed as a documentation discrepancy; no amendment.
- **F-6 — a malformed TSV row is dropped before set comparison.** A 2-cell row yields `r4-row-malformed` only,
  so its id is neither "missing" nor "extra" unless it was the sole provider (then `r4-ids-missing` fires, M5).
  Consequence: duplicating a *malformed* line cannot trip `r4-duplicate-ids`. Observed, coherent, low risk —
  recorded because a mutation seat testing duplicate detection through a malformed row would misread the result.
  (My own first expectation here was wrong; the checker was right.)
- **F-7 — `--json` is parsed and unused.** Output is JSON unconditionally; verified identical bytes and exit
  with and without the flag. Harmless, but any script keying on the flag's absence sees JSON anyway.
- **F-8 — no double-counting on an empty quote.** The verbatim check is skipped at zero length, so an empty
  quote reports exactly one finding, not two. Verified (E4), not inferred.

## Limitations

- Fixtures are arbitrary bytes. This seat proves **predicate mechanics**, not the authenticity or truth of the
  real round-41 repairs; that is owned by the other wave seats and by C1's counter.
- No browser was run, no network was used, nothing outside loopback/local files was touched.
- `r1a-unreadable` / `r1b-unreadable` are unexercised and argued unreachable (2/34).
- F1's five absent evidence ids are the first five of `slice-ids.txt`; the choice is arbitrary and does not
  affect the result.
- Scratch fixtures were deleted per lane bounds, so the fixture commits cited in `evidence/manifest.txt` no
  longer exist on disk. Every checker stdout, the manifest with all 25 fixture heads, the repro scripts, and
  both real-lane reproduction outputs are archived under the seat dir.
- No tools were installed or upgraded (nothing was needed); no pacman transaction was attempted.

## Evidence index (`…/w1/ExecSelftestSynthetic/evidence/`)

`manifest.txt` (25 fixtures + heads + exits) · `coverage.txt` (32/34 accounting) · `results.json`,
`results-extra.json`, `results-mutants.json`, `results-mutants2.json` · `checker-<case>.json` (raw stdout per
case, 25 files) · `repro-r34e1779.json`, `repro-HEAD-0081bfd.json` · `build_and_run.py`, `run_extra.py`,
`run_mutants.py` · `commands.txt`.

## Cleanup

`rm -rf -- /fast/scratch/hyaku/tabi-r42/ExecSelftestSynthetic` executed; `ls -d` confirms
`No such file or directory`. Seat evidence intact (42 files, 124 K). Lane checker digest unchanged.

VERDICT ok: F1-F5 all reproduce their specified findings and exit codes (F5 exit 0 with `predicate: true`, so the checker is not red-by-construction); 32/34 frozen finding ids exercised live with exact boundary behaviour (25 words pass / 26 fail, 1000 B and 200 B floors), and both real-lane runs reproduce the committed controls byte-identically; routed hole: r1a/r1b prove consistency with a self-authored measure, so C2's "fabricated evidence" kill-rule limb is not enforceable by this instrument (only its empty/thin limb is), and claims prose lists 5 baseline ids where the committed control and live runs give 7.
