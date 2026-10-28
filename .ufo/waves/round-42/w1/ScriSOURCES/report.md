# ScriSOURCES — registry rows census check (round 42, wave 1)

Milestone: registry census check against the CURRENT working tree
`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`.
Lane: leaf scribe. No subagents, no commits, no writes outside this seat dir + `/fast/scratch/hyaku/tabi-r42/ScriSOURCES/` (deleted before yield).

## Provenance / subject identity

```
$ git log -1 --format='HEAD=%H %ad' --date=iso
HEAD=0081bfdb93b6bd1bf2853bb128996f1a976b7218 2026-10-28 12:26:20 -0300
$ git status --porcelain -- corpus/SOURCES.md     # (no output) clean
$ git diff --stat -- corpus/SOURCES.md            # (no output) clean
$ md5sum corpus/SOURCES.md
365d1b1253855636b5c69114e0fcc0c9  corpus/SOURCES.md      # 146805 bytes
$ git log --oneline -3 -- corpus/SOURCES.md
9b6de3a round-42: freeze C1 ... land r41 defects D1..., D2 (S148 supersedes S146, S146 rejected), D3 ...; open S149
8c32528 round-41 freeze: ...
22883df round-40: ...
```

The 149-row content is committed (tree clean); the row set landed in `9b6de3a`, the round-42 freeze commit.

## Axis results — observed vs the item's expected numbers

| axis | expected (item) | observed | match |
|---|---|---|---|
| row count | 149 (147 + S148 + S149) | **149** | yes |
| tier A | 131 | **133** | **no (+2)** |
| tier B | 7 | **7** | yes |
| tier C | 9 | **9** | yes |
| status mined | 122 | **124** | **no (+2)** |
| status rejected | 10 | **10** | yes |
| status queued | 15 | **15** | yes |
| duplicate ids | none | **none** | yes |
| enum violations (E05/E06/E07/E09/E10) | none | **none (0)** | yes |
| S148/S149 11-column rows (`NF==13`) | yes | **13, 13** | yes |
| literal or escaped `\|` in S148/S149 | none | **none** | yes |
| `sources-census.sh validate` exit | 0 | **0** | yes |
| W04 duplicate-URL warnings | may grow by 1 (S148 shares S146's URL) | **20 → 21, delta = S148 only** | yes |

Diagnostics present in the live run: 21 × `W04` + 1 × `ok`. Zero `E0x` codes.

## Commands and outputs

### 1. Authoritative validator (real fleet root)

```
$ bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi \
    > $S/validator.out 2>&1; echo "TRUE_EXIT=$?"
TRUE_EXIT=0
$ wc -l < $S/validator.out   → 22
$ grep -c W04 $S/validator.out → 21
$ grep -vc W04 $S/validator.out → 1        # the final "tabi ok" line
$ grep -c 'E0' $S/validator.out → 0
$ tail -2 $S/validator.out
tabi	W04	S148 duplicate url nodejs.org/docs/latest-v24.x/api/cli.html across scopes
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
```

Exit code captured before any pipe (the earlier `| tail` form reports `tail`'s status, so it was not used as evidence).

### 2. Script's own `census` subcommand

```
$ bash scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi
tabi	rows	149
tabi	tier.A	133
tabi	tier.B	7
tabi	tier.C	9
tabi	status.mined	124
tabi	status.queued	15
tabi	status.rejected	10
FLEET	rows	149
FLEET	tier.A	133   FLEET.tier.B 7   FLEET.tier.C 9   FLEET.tier.invalid 0
FLEET	status.queued	15	FLEET.status.mined	124	FLEET.status.rejected	10	FLEET.status.invalid	0
FLEET	missing	0
```

`FLEET` == `tabi` (single lane at this root). `*.invalid` = 0 confirms the enum axes from the script's side.

### 3. Independent recomputation (my own parser, not the script's)

```
$ awk -F'|' '/^\| S[0-9][0-9][0-9] /{ ... }' corpus/SOURCES.md
ROWS=149
TIER A 133 / TIER B 7 / TIER C 9
STATUS mined 124 / STATUS queued 15 / STATUS rejected 10
(no DUP_ID lines, no NF_BAD lines)
```

Full-file row-column check: no row produced `NF_BAD`, i.e. all 149 registry rows are `NF==13` (11 cells + 2 delimiter empties).

```
$ for n in 148 149; do ... done
S148 line=162 delims=12 trailingWS=0 CR=0
S149 line=163 delims=12 trailingWS=0 CR=0
$ grep -nE '\\\|' corpus/SOURCES.md      # (no output) — zero escaped pipes anywhere in the file
$ grep -oE '^\| S[0-9]{3} ' corpus/SOURCES.md | tr -d '| ' | sort | uniq -d | wc -l
dups: 0
$ seq -f 'S%03g' 1 149 | diff - got.ids && echo SEQ_OK
SEQ_OK 1..149 contiguous
```

Kind enum (field 4) and opened dates:

```
KIND code 50   community 5   dataset 1   docs 66   own-work 3   paper 4   spec 17   tool 3   → 149
opened_nondate=0
```

All kinds inside the script's enum `spec|docs|paper|code|tool|dataset|talk|book|community|own-work`; no tier outside `A|B|C`; all `opened` cells ISO `2026-*`.

### 4. W04 delta isolation (filtered scratch root)

Scratch root with `S148`/`S149` rows removed (147 rows), real `corpus/*` dirs and `.ufo` symlinked, fleet `shokunin.conf` copied in:

```
$ bash scripts/sources-census.sh validate --root $S/root tabi
PRE_EXIT=0
W04_PRE=20
tabi	ok	/fast/scratch/.../root/tabi-shokunin/corpus/SOURCES.md
$ bash scripts/sources-census.sh census --root $S/root tabi
tabi	rows	147
tabi	tier.A	131   tier.B 7   tier.C 9
tabi	status.mined	122   status.queued 15   status.rejected 10
$ diff <(grep W04 pre148.out | cut -f3) <(grep W04 validator.out | cut -f3)
20a21
> S148 duplicate url nodejs.org/docs/latest-v24.x/api/cli.html across scopes
```

So the entire diagnostic delta between the 147-row and 149-row states is the single allowed `S148` W04 for sharing S146's URL; no new E-codes, no new duplicate ids, exit stays 0.

## Finding (expectation vs tree, not a registry defect)

The item's two histogram expectations are **the pre-S148/S149 baseline, not the post state**, and they contradict the item's own row count:

- `131 + 7 + 9 = 147` and `122 + 10 + 15 = 147`, yet the same item declares `149` rows.
- I reproduced exactly those numbers on the 147-row (S148/S149-removed) tree: `A131/B7/C9`, `mined 122 / queued 15 / rejected 10`.
- The item's prose intent ("S148/S149 tier A", "S148/S149 arrive mined") is what the tree actually does: observed = expected + the two new rows on both axes (`A133`, `mined 124`), with `B7/C9/rejected 10/queued 15` unchanged and reconciled by `133+7+9 = 149 = 124+10+15`.
- The item's inline arithmetic `mined 121-1+2=122` does not reconcile either: the pre-S146-flip baseline must have been `mined 123` for the observed pre-state `mined 122` and observed post-flip `mined 124` to hold. That is the same off-by-two carry-over, not a second error in the tree.

Consequence for consumers: `tier.A 133` and `status.mined 124` are the correct numbers for this tree; a checker keyed to `131`/`122` would false-fail a clean registry. Nothing in the registry needs to change, and per the item's frozen-counter rule I propose no amendment.

Also confirmed as intended by the item, not defects: `S146` is `rejected` (line 160) and `S148` supersedes it (its `scope` cell reads "supersedes S146 — ...", `teaches` opens "supersedes S146 —"); `S148`/`S149` carry verbatim-substring quotes; `S149`'s `used-by` path `corpus/knowledge/committed-bytes-verification-round-42.md` passes E11.

## Limitations

- Structural only. Per the SOURCES contract header, `sources-census.sh`/`check-sources.mjs` "cannot see whether a source was opened"; this check asserts row/column/enum/URL bookkeeping, never source content or admission (admission stays in `corpus/QUALITY.md`).
- W04 is a warning class and stays non-fatal by design; 21 duplicate-URL warnings remain, 20 of them pre-existing and out of this item's scope.
- My first scratch-root attempt emitted a spurious `E11 ... .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` because the fake root did not yet symlink `.ufo`/all `corpus/*` subdirs; it disappeared (exit 0, `missing 0`) once the harness mirrored the repo layout. It was a harness artifact, not a tree finding — the real-root run above is the authoritative one and had zero E-codes on the first try.
- Two `corpus` subdirs (`evidence`, `handoffs`) could not be symlinked into the scratch root (parent-path gap for the trailing-slash `ln`); no `used-by` path in the 147-row subset pointed there, since that run exited 0.
- No tool was installed or upgraded during this check (no pacman, no network).
- Scratch `/fast/scratch/hyaku/tabi-r42/ScriSOURCES/` deleted before yield; receipts copied here as `validator.out` and `pre148.out`.

## Evidence files (this directory)

- `report.md` — this report
- `validator.out` — live `validate --root /home/vgpnk/Projects/shokunin tabi` output, 22 lines, 21 W04 + ok, exit 0
- `pre148.out` — 147-row baseline run, 20 W04 + ok, exit 0

VERDICT finding — census itself is clean (149 rows, NF=13, no dup ids, no enum violations, validator exit 0, W04 20→21 for S148 only); the item's stated expected histograms (A131, mined 122) are the pre-S148/S149 baseline and sum to 147 while the item declares 149 rows — observed A133/mined 124 is correct.
