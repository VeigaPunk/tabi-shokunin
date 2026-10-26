# AdjKaidoku8 — C1 build: dispositions for 16 kaidoku candidate lines (round 35, w1)

## Verdict

All 16 candidates in `.ufo/waves/round-35/w1-chunks/AdjKaidoku8.tsv` are dispositioned and **all 16 are
screens**: five `same-surface` (surface `cdp-runtime-observation`) and eleven `third-lane-report`; **no map
row is proposed**, so `rows.tsv` is empty and there is no `DECL<n>` and no `l0.txt`. The kaidoku bytes are
two round-10/11 REA probe entries (`corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md`,
`corpus/knowledge/2026-10-14-r11-01-queue-ops.md` at pin `49096c7e6f226af0c750c4b003be58883cb6049f`); every
line is genuinely browser material (chromium / Chromium / playwright / CDP), so none is screened as a false
match, and five of them (launch, target, teardown, profile, pid/log files of kaidoku's own self-launched
chromium tree) are facts on the sibling side of the split the verified `cdp-runtime-observation` row already
rules — QUALITY 91's exact case — while the other eleven report REA's own env gate, engine id, observed stdout
and substrate digests, claiming nothing on tabi's surfaces (rule 3). Measured with the frozen counter at my
scratch-clone commit `7c965bb6c8c2b2c478ae5444b6de4f8d466c8942`: adjacency clean (16 rows, 16 verified, 0
findings), `screenFindings 0`, all 16 of my keys accounted (0 of 16 in `unaccountedKeys`); the lane predicate
is **not** met at my commit (`unaccounted 367`, `newMapped 0`, exit 1) because my chunk is 16 of the 383
candidates — the lane's `newMapped >= 2` must come from the other chunks, and I did not manufacture rows to
reach it.

## Evidence

Scratch clone (one per seat, never the lane checkout):

```
mkdir -p /fast/scratch/hyaku/tabi-r35/AdjKaidoku8            # exit 0
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone -q               # exit 0
git -C $S/clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83            # exit 0
git -C $S/clone rev-parse HEAD                -> a4bfef0f75027c915e715649950b1d46dcb33d83
git -C $S/clone rev-parse --show-toplevel     -> /fast/scratch/hyaku/tabi-r35/AdjKaidoku8/clone
```

Sibling bytes read at the pin with read-only `git show` (both files dumped whole: 385 and 283 lines), and
kaidoku's `PROVINCE.md` at the same pin read whole; context read around each candidate (`sed -n '<n-6>,<n+6>p'`
plus the file's opening lines, so each line is judged as part of its document — a round-11 Queue-A residue
drain entry and a round-10 census-defect entry, both REA-probe receipts).

Decision inputs read: `SKILL.md:2861-2881` (decision rule), `PROVINCE.md` (tabi surfaces),
`corpus/adjacency.tsv` (16 existing rows; kaidoku's verified surfaces there are `cdp-runtime-observation`,
`reverse-engineering-of-shipped-artifacts`, `recorded-har-producer-channel`,
`screenshot-pair-compare-semantics`), `corpus/QUALITY.md:545-556, 585-590, 670-675` (88 / 91 / 97),
`scripts/check-adjacency.mjs:1-170` (column and disposition contract),
`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:1-335` (BG, SIDE, THIRD_LANE, `goodQuote`,
screen rules), `corpus/lessons/round-16-verifier-spotcheck.md:138-146` (the ruling that grounds the
`cdp-runtime-observation` row: tabi owns live browser/CDP page observation; kaidoku keeps CDP only as an REA
provider surface).

Build and self-checks (all in `$S`):

```
node build.mjs
  -> rows=16 same-surface=5 third-lane-report=11                              # exit 0
     (asserts per row: quote is a verbatim substring of the cited line, words 4..25,
      >= 20 non-space chars, no TAB inside any field)
node verify-keys.mjs
  -> chunk=16 screen=16 missing=0 extra=0                                     # exit 0
```

Commit inside the clone (toplevel asserted first; `-C "$D"` on every git call):

```
git -C $S/clone -c user.name=AdjKaidoku8 -c user.email=AdjKaidoku8@scratch.local \
    commit -q -m "round35 w1 AdjKaidoku8: browser-overlap screen ledger for 16 kaidoku candidate lines"
  -> 7c965bb6c8c2b2c478ae5444b6de4f8d466c8942
git -C $S/clone show --stat --oneline HEAD
  -> corpus/adjacency-screen-browser.tsv | 17 +++++++++++++++++  1 file changed, 17 insertions(+)
```

The commit adds only `corpus/adjacency-screen-browser.tsv` (header + 16 rows): no `SKILL.md` append, no
`corpus/adjacency.tsv` row, because there is no `DECL<n>` to cite. `corpus/adjacency-screen-browser.tsv` did
not exist at the freeze (`git show a4bfef0f…:corpus/adjacency-screen-browser.tsv` -> `fatal: path … does not
exist`; header written by me as `sibling_ref<TAB>reason<TAB>surface<TAB>quote<TAB>note`).

Frozen counter (TMPDIR under my scratch):

```
TMPDIR=$S/tmp node $S/clone/.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
  --rev 7c965bb6c8c2b2c478ae5444b6de4f8d466c8942 --repo $S/clone \
  --fleet /home/vgpnk/Projects/shokunin --json > out/counter-check.json
  -> exit 1   (evaluated; predicate not met, as expected for one chunk)

adjacency        {"verdict":"clean","rows":16,"verified":16,"findings":0}
candidates       383            priorCandidatesSkipped 22
mapped           0              screened 16            unaccounted 367
newMapped        0              newMappedRows []       newRowRefusals []
screenFindings   0 ([])
my 16 keys in unaccountedKeys: 0 / 16      perLane.kaidoku: 137
predicate        false
```

Re-runnable quote check (shipped in my output dir; reads each cited line again with read-only
`git show <pin>:<path>`):

```
node verify-quotes.mjs screen.tsv
  -> VERIFY_QUOTES rows=16 ok=16 fails=0                                      # exit 0
```

Per-line decisions with file:line evidence are in `decisions.md` (16 rows, each with the deciding quote and
both sides' ground); the ledger rows themselves are `screen.tsv`.

Disposition summary (key -> reason):

| # | candidate | reason | surface |
|---|---|---|---|
| 1 | `…r10-02-queue-ops-2.md:234` | same-surface | cdp-runtime-observation |
| 2 | `…r11-01-queue-ops.md:1` | same-surface | cdp-runtime-observation |
| 3 | `…r11-01-queue-ops.md:13` | third-lane-report | - |
| 4 | `…r11-01-queue-ops.md:30` | same-surface | cdp-runtime-observation |
| 5 | `…r11-01-queue-ops.md:63` | third-lane-report | - |
| 6 | `…r11-01-queue-ops.md:68` | third-lane-report | - |
| 7 | `…r11-01-queue-ops.md:74` | third-lane-report | - |
| 8 | `…r11-01-queue-ops.md:77` | third-lane-report | - |
| 9 | `…r11-01-queue-ops.md:83` | third-lane-report | - |
| 10 | `…r11-01-queue-ops.md:91` | third-lane-report | - |
| 11 | `…r11-01-queue-ops.md:101` | third-lane-report | - |
| 12 | `…r11-01-queue-ops.md:108` | third-lane-report | - |
| 13 | `…r11-01-queue-ops.md:280` | third-lane-report | - |
| 14 | `…r11-01-queue-ops.md:284` | same-surface | cdp-runtime-observation |
| 15 | `…r11-01-queue-ops.md:310` | third-lane-report | - |
| 16 | `…r11-01-queue-ops.md:330` | same-surface | cdp-runtime-observation |

## Findings for the attack wave (named, not repaired)

1. **Teardown vs observation.** The five `same-surface` rows rest on the ruled `cdp-runtime-observation`
   row covering the self-launched chromium tree's whole lifecycle. Rows 1/14/16 are teardown facts ("kill
   chromium/node/http trees", "Cleanup: chromium tree and http.server killed by PID", "`chromium.{log,pid}`
   (tree killed)"), not observations. An attack seat reading that surface name narrowly could prefer
   `third-lane-report` for those three; both reasons keep the line accounted, but the ground differs —
   rule 2 was asked first (decision rule order) and QUALITY 91 makes a fact on the already-ruled side a
   screen either way.
2. **Mechanical SIDE words that are not sides.** `2026-10-14-r11-01-queue-ops.md:63` matches the SIDE regex
   on `refuses` (REA's verb refusing without an env var) and `:310` matches on `reported` inside the literal
   `exact-reported-url`. A `split-declared` map row could be built mechanically on either line and would
   verify clean (BG and SIDE both hold) while naming no sibling side — exactly QUALITY 97's red state. I did
   not build such rows; flagged so an attack seat does not have to rediscover it.
3. **No `not-browser-sense` and no `no-claim-declared` screens in this chunk.** Every line's BG match is a
   real browser (a launched chromium, REA's caller-supplied Chromium, a playwright-class tooling census), and
   none of the 16 declares a boundary in side-stating words. If an attack seat thinks a reason is wrong, the
   replacement is another screen reason on the same bytes, not a missing overlap.

## Limits

- I did not run browsers, make network fetches or install tools: the seat is C1-only, needs neither, and
  nothing here claims runtime evidence.
- The counter validates screen vocabulary, quote membership/shape and `same-surface` naming only; it does not
  judge overlap semantics. My reasons are the judgement, and findings 1-3 are where they are weakest.
- The lane predicate (`unaccounted 0` AND `newMapped >= 2`) is **not** met at my commit and is not reachable
  from this chunk alone: 367 candidates remain unaccounted across the other chunks and `newMapped` 0 needs
  real overlaps from siblings whose lines state their side.
- `newMappedRows` / `newRowRefusals` are empty JSON arrays in `counter-check.json` — that is "no rows of mine
  proposed", not a measured refusal list.

## Deliverables

- `.ufo/waves/round-35/w1/AdjKaidoku8/screen.tsv` — 16 ledger rows, no header, verbatim quotes.
- `.ufo/waves/round-35/w1/AdjKaidoku8/rows.tsv` — empty (0 map rows; no `DECL` placeholders to substitute).
- `.ufo/waves/round-35/w1/AdjKaidoku8/decl.md` — states that no declaration is proposed and why.
- `.ufo/waves/round-35/w1/AdjKaidoku8/l0.txt` — not written (no `contested-open` row).
- `.ufo/waves/round-35/w1/AdjKaidoku8/decisions.md` — 16 rows: key | screen reason | sibling bytes | tabi side.
- `.ufo/waves/round-35/w1/AdjKaidoku8/verify-quotes.mjs` — re-runnable 16/16 quote + surface check.
- `.ufo/waves/round-35/w1/AdjKaidoku8/counter-check.json` — frozen-counter JSON at commit
  `7c965bb6c8c2b2c478ae5444b6de4f8d466c8942`.
- This report.
