# ScribePopulationRule — round 30 w1: the release-pin population rule (round-29 routed defect 5)

**Verdict.** Round-29's wording "23 on-release rows pinned to 154.0.8037.97" is a true count of
the rule `scripts/check-release-pins.mjs:178` evaluates, but it is not a statement of that rule:
the rule selects a row only when its **source cell** literally carries `refs/tags/<A.B.C.D>/`
below `--stable`, so six `on-release` rows whose own anchors assert Chromium-release provenance
through the DEPS-selected devtools-frontend commit `66df492…` (S036, S044, S068, S088, S089, S090)
never enter the population and are never named as excluded — plus three `main`-branch rows
(S004, S028, S035) that carry no version at all. At `061e6202` the rule selects 23 of the 89
`on-release` rows and 23 of the 39 on-release rows hosted on Chromium or devtools-frontend URLs;
the remaining 66 split into 50 non-Chromium hosts, 7 pinned at the stable tag itself, 6
DEPS-pinned devtools rows and 3 `main`-branch rows. The DEPS mapping that would admit the six is
one line per tag in a committed `DEPS` blob, and I verified both ends of it today (154 tag line
424 → `66df492…`, 156 tag line 420 → `bf69d041…`); recommendation is a counter v2 that emits the
population as an id set plus a reasoned `excluded` array and binds DEPS-pinned rows through that
committed blob, with this round landing only the disclosure (v2 is not built here, per
`claims.json` `notClaimed`).

## (a) The population rule, named exactly

The counter's own header states the intent (`scripts/check-release-pins.mjs:19-21`):

> Population: every corpus/SOURCES.md registry row (0-3 leading spaces) whose recheck cell is
> `on-release` and whose source cell carries a Chromium Gitiles tag `refs/tags/<A.B.C.D>/` older
> than --stable.

The code that decides membership is one expression at `:178`:

```js
const population = rows.filter((r) => r.recheck === "on-release" && r.tags.some((t) => cmpVersion(t, stable) < 0));
```

and the three facts that make that expression narrower than the header's prose:

- `rows` is every `corpus/SOURCES.md` line matching `ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/`
  (`:75`, applied `:118`) that also splits into exactly 13 `|` cells (`:121`); a row with a
  different cell count is dropped without a diagnostic.
- `recheck` is `cells[10]` (`:127`) and must equal the literal `on-release`; `90d`, `manual` or a
  trailing space are all "not in the population", not errors.
- `tags` is built **from the source cell only** —
  `tags: [...new Set([...cells[2].matchAll(TAG_RE)].map((m) => m[1]))]` (`:128`), with
  `TAG_RE = /refs\/tags\/(\d+\.\d+\.\d+\.\d+)\//g` (`:76`). The anchor cell is never consulted.
  `cmpVersion` (`:108`) is a numeric compare over the four dotted components.

So the exact membership rule is: **a row enters iff its recheck cell is `on-release` and its
source cell is a URL that literally contains `refs/tags/<A.B.C.D>/` for at least one tag that
compares numerically below `--stable`.** Everything else is silently outside. The row that makes
this visible is S044: its anchor cell says `Chromium tag 154.0.8037.97 DEPS line 424` and its
source cell is `https://github.com/ChromeDevTools/devtools-frontend/blob/66df492…/WebMCPView.ts`
— release-coupled by its own registry text, invisible to `:128` because the tag lives in the
anchor and the URL is a GitHub blob URL, not a Gitiles tag URL. S068 (the superseding twin, same
URL) is excluded identically, and S036/S088/S089/S090 carry the same commit.

The wording defect is therefore not "the count is wrong" but "the sentence names a population the
counter does not define". A reader of "23 on-release rows pinned to 154.0.8037.97" will assume
either all `on-release` rows (89) or all release-coupled Chromium rows (39); neither is 23.

## What the 23 is, and what it is not

Measured at `061e62024c0523d3c6c7e819506a773ff2cd7d75` over `corpus/SOURCES.md` (115 registry
rows), re-deriving `:118-128` and `:178` verbatim (`enum3.mjs`, output
`ScribePopulationRule/population-reasons.json`):

| Bucket | Ids | Count |
|---|---|---|
| in the population | S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093 S094 S096 S097 S098 S099 S100 S105 S106 | 23 |
| `at-stable` — source carries `refs/tags/156.0.8078.47/`, not older than `--stable` | S109–S115 | 7 |
| `deps-devtools-commit` — source is a devtools-frontend URL at commit `66df492…`, tag only in the anchor | S036 S044 S068 S088 S089 S090 | 6 |
| `main-branch` — source is `…/chromium/chromium/…/main/…` (no version anchor) | S004 S028 S035 | 3 |
| `non-chromium-host` — Playwright, Chrome docs, whatwg, GitHub project docs, web store, … | 50 rows | 50 |
| **total `on-release`** | | **89** |

The receipt's 23 ids equal the population's 23 ids (`equal: true`), so the round-29 data does
cover the set the counter defines; the gap is purely in what the sentence says the set is.

## (b) DEPS-pinned rows: options, costs, and the v2 recommendation

The six `deps-devtools-commit` rows all pin `66df492aaa0129d090937e933dd44c5389ab24d2` and
reference nine files between them (S036 `WebMCPModel.ts`; S044 `WebMCPView.ts` + `WebMCPModel.ts`;
S068 `WebMCPView.ts` + `Model:249-257` written without a suffix; S088 `WebMCPView.ts` +
`WebMCPModel.ts`; S089 `protocol.ts`; S090 `WebMCPView.test.ts`). Four of them carry registry
digests (S036, S088, S089, S090) and all carry line spans in the anchor, so the existing
`f2`/`f3`/`f4`/`f5`/`f6` checks — path binding, byte filing, span ranges, digest match, independent
refetch — apply unchanged; only the *revision identity* differs (a devtools commit instead of a
Chromium tag).

The revision identity is recoverable from committed bytes. Fetched today (receipts below):

- `refs/tags/154.0.8037.97/DEPS:424` →
  `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',` — exactly the commit
  S044's anchor names as "DEPS line 424".
- `refs/tags/156.0.8078.47/DEPS:420` →
  `'devtools_frontend_revision': 'bf69d041b0ad1f74730204a73bff29f3ef1d4ead',` — the 156 devtools
  commit.

**Option 1 — keep them out and disclose the list in the claim (status quo + wording fix).**
Cost: zero counter work, zero fetches, one sentence naming the six ids and the reason. Loss: six
rows whose anchors assert release coupling are re-checked only by hand — the round-29 closure did
exactly that once ("S044's live spans unchanged at the 156 devtools commit",
`corpus/lessons/round-29-verifier-spotcheck.md` §C3) — so every future release must repeat the hand
check or the rows rot silently. The class is also open-ended: any future row written with a
devtools commit URL joins the invisible set, and nothing fails.

**Option 2 — include them through the committed DEPS mapping (v2).**
Cost: counter — one extra selector (source matches
`(github.com/ChromeDevTools/devtools-frontend/(blob|raw)|raw.githubusercontent.com/ChromeDevTools/devtools-frontend)/<40hex>/`
and the anchor names a Chromium tag) plus one binding check `f7-deps` (the row's tag's committed
`DEPS` carries `devtools_frontend_revision` equal to the row's commit; the `--stable` tag's carries
the receipt's `new_revision`); no network, because the counter reads committed blobs only
(`:13-14`) and the `DEPS` blob is filed under the bytes root like any other file. Data — 9 paths ×
2 revisions = 18 fetches per release re-opening (against 46 for today's 23 rows), plus two `DEPS`
blobs (197,649 and 192,396 decoded bytes as measured today). Registry — no cell edits. Claim —
population becomes 29 at this stable, and the "expected but excluded" list shrinks to the three
`main`-branch rows plus the 50 non-Chromium hosts.

**Option 3 — relabel the six rows' `recheck` cell away from `on-release` (e.g. `90d`).**
Cost: six in-place registry edits with old→new logging; the exclusion becomes explicit and the
rule stays one line. Loss: the rows stop being re-opened *at a release* even though the devtools
consumer they describe ships inside Chrome, so the label would contradict the anchor. Cheapest to
implement, worst for freshness — it converts a measurement gap into a permanent coverage loss.

**Option 4 — admit the whole 39-row Chromium-revision set under a per-row cadence rule**
(release-triggered where a version anchor exists, round- or date-triggered otherwise).
Cost: a second population rule and a due-date ledger; the counter stops being a release counter
and becomes a scheduler, and its `--stable` argument stops being the trigger for part of its
population. Justified only if the `main`-branch rows are meant to be re-opened, which none of
their anchors claims.

**Recommendation.** Land Option 1's disclosure now, as this round's curation; build Option 2 for
counter v2; leave Option 3 rejected and Option 4 out of this counter. Grounds: (i) a rule that
cannot see an assertion the registry already makes is the silent-exclusion defect itself, not a
scoping decision; (ii) the machinery is one committed `DEPS` blob per tag and one equality check,
because every other check is path- and byte-based and host-agnostic; (iii) Option 3 trades a
measurable gap for an unmeasurable one. Concrete v2 shape (not built this round):

1. `population` emitted as an **id set**, not only a count (`:265` today), plus
   `population_rule` (the `:178` expression as a string) and
   `excluded: [{id, reason}]` over a closed vocabulary:
   `at-stable | main-branch | deps-devtools-commit-unmapped | non-chromium-host | malformed-row`.
2. New `f7-deps` check as above; new bytes filed under `bytes/<stable-devtools-revision>/<path>`
   so the 156 side is the DEPS-selected revision, never "latest devtools".
3. New refusal: a row that names a devtools commit but whose tag mapping is absent exits 2
   (`deps-unmapped`) rather than being silently dropped.
4. Self-test cases: id-set equality; one case per `excluded` reason; `f7-deps` positive;
   `f7-deps` mismatch negative (row commit ≠ DEPS revision); `deps-unmapped` refusal (exit 2).
5. The claim sentence is generated from `population_rule` + the id set, so a count can no longer
   stand in for a membership statement.

## (c) Draft QUALITY.md criterion 74

`corpus/QUALITY.md` ends at criterion 73 (line 398, no footer), so the next number is 74. Draft,
house format, **not landed** — this seat wrote no lane file:

```
74. A counter-backed population claim names its membership rule and lists the rows that rule
    excludes but a reader would expect. The claim sentence quotes the expression the counter
    evaluates to select the population and cites the code line; the counter's JSON emits the
    population as an id set plus an `excluded` array carrying one reason per id from a closed
    vocabulary (`at-stable`, `main-branch`, `deps-pinned-unmapped`, `non-chromium-host`,
    `malformed-row`). A row whose own source or anchor asserts the property the population is
    about (same upstream, same release coupling) and that the rule cannot see appears in
    `excluded` with its reason, or the claim is a defect. A count alone never states a
    population; a row excluded only because its anchor is not machine-readable is either
    re-anchored or named. (lesson: corpus/lessons/round-29-verifier-spotcheck.md#routed defects 5;
    neighbour of criterion 73 — 73 binds the predicate to the code, 74 binds the population to
    its exclusions; `scripts/check-release-pins.mjs:178` is the first rule it would bind; draft,
    no instrument yet)
```

## Evidence

Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `S=$HYAKU_SCRATCH/tabi-r30/ScribePopulationRule`.
One `git clone --shared` of the lane, checked out at the freeze commit; no lane tracked file, no
lane index and no lane git state was touched (`git status --porcelain` in the lane lists only the
wave harness files `.ufo/waves/round-30/w1*` and the wave directories).

| # | Command | Exit | Reading |
|---|---|---|---|
| 1 | `git clone --shared …/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75` | 0 | `rev-parse HEAD` = `061e62024c0523d3c6c7e819506a773ff2cd7d75`; `status --porcelain` = 0 lines |
| 2 | `TMPDIR=$S/tmp node scripts/check-release-pins.mjs --rev HEAD --repo "$S/clone" --stable 156.0.8078.47 --json` | 0 | `population 23 resolved 23 unresolved 0 holds 16 drifted 7 clean true`; stderr 0 bytes; raw at `ScribePopulationRule/pins-json.txt` |
| 3 | `git show 97be89bc:scripts/check-release-pins.mjs \| sha256sum` and the same at `061e6202` | 0 | both `567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770` — the rule named above is the round-29 frozen counter |
| 4 | `git log --oneline 97be89bc..061e6202 -- scripts/check-release-pins.mjs \| wc -l` | 0 | `0` commits — the counter was frozen before the round-29 data landed and is unchanged since |
| 5 | `node enum.mjs clone/corpus/SOURCES.md` | 0 | 115 rows, 89 `on-release`, 23 included, 66 excluded; `on-release-enum.json` |
| 6 | `node enum2.mjs clone/corpus/SOURCES.md` | 0 | excluded 66 = 7 `at-stable` + 59 no-tag; `excluded-chromiumish.json` |
| 7 | `node enum3.mjs clone/corpus/SOURCES.md` | 0 | reason counts `{included 23, at-stable 7, deps-devtools-commit 6, main-branch 3, non-chromium-host 50}`; `population-reasons.json` |
| 8 | node compare of `receipt.json` ids vs counter `rows[].id` | 0 | `receipt_rows 23`, `equal: true` |
| 9 | `curl` `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/DEPS?format=TEXT` | 0 (HTTP 200) | 2026-10-26T07:02:52Z, 263,532 encoded bytes, sha256 `643105b3…6e96`; decoded 197,649 bytes, sha256 `dc1d7007…532d`; `devtools_frontend_revision` at line 424 = `66df492aaa0129d090937e933dd44c5389ab24d2` |
| 10 | `curl` `https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/DEPS?format=TEXT` | 0 (HTTP 200) | 2026-10-26T07:02:53Z, 256,528 encoded bytes, sha256 `8684e910…c990`; decoded 192,396 bytes, sha256 `3535b317…0703`; `devtools_frontend_revision` at line 420 = `bf69d041b0ad1f74730204a73bff29f3ef1d4ead` |

Quoted spans are copied from the bytes fetched above (receipts in
`ScribePopulationRule/fetch/receipts.tsv`; decoded `DEPS` bodies kept at
`ScribePopulationRule/fetch/DEPS-<tag>.txt`, extracts at `fetch/devtools-revision-lines.txt`).
No quote exceeds 25 words.

## Limits and out of scope

- I did **not** re-fetch devtools-frontend at `bf69d041…` to re-check the six rows' spans. Whether
  S044/S068 currently drift at the 156 devtools commit is the round-29 closure's reading
  (`corpus/lessons/round-29-verifier-spotcheck.md` §C3, "live spans unchanged at the 156 devtools
  commit"), cited here, not re-measured. My measured claim is the population rule, the excluded
  id sets, and the DEPS mapping endpoints.
- The 9-file count for the six rows is read from source and anchor cells; S068's second reference
  is written `Model:249-257` without a suffix, so that basename (`WebMCPModel.ts`) is inferred from
  the sibling rows, not from S068's own cells.
- Counter v2 is **not built** here (it is in `claims.json` `notClaimed`), and no lane patch is
  proposed: this seat's deliverables are the three texts above plus receipts. The criterion 74
  draft and the corrected claim wording are for the L1 to land.
- Out of scope: C1 (gate-mutants), C2 (frontier admission), routed defects 1–4, 6 and 7, and any
  measurement of the lane's counters other than `check-release-pins.mjs`.
- Tooling: nothing installed or upgraded; no package manager was invoked.

## Artifacts (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ScribePopulationRule/`)

- `pins-json.txt` — raw counter JSON at `061e6202` (exit 0).
- `population-reasons.json` — per-reason id buckets and the six rows' files/commit (`enum3.mjs`).
- `on-release-enum.json`, `excluded-chromiumish.json`, `population-split.json` — intermediate
  enumerations (`enum.mjs`, `enum2.mjs`).
- `fetch/receipts.tsv`, `fetch/DEPS-154.0.8037.97.txt`, `fetch/DEPS-156.0.8078.47.txt`,
  `fetch/devtools-revision-lines.txt` — the two DEPS fetches with UTC time, status, byte counts,
  sha256, and the quoted lines.
- `proposed-claim-wording.md` — paste-ready replacements for the three places the count stands in
  for a population (round-29 claim predicate, report line 13, knowledge entry line 1), each
  naming the rule, the 23 ids and the excluded six plus three.
