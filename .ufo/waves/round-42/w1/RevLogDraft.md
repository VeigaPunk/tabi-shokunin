# RevLogDraft — LOG.md round-42 draft audit (count discipline, append-only, admission)

Seat: RevLogDraft (reviewer). Lane: tabi round 42, policy-v2 wave w1.
Audit target: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only for this seat).
Nothing in the production tree, fleet repo, sibling repos or `shokuknow` was written.
No commits, no git/jj mutation, no subagents, no pacman. **Tools installed: none**
(the task needed only `git`, `node`, `python3`, `bash`, all preinstalled).

## 0. Pins and method

```
$ git rev-parse HEAD
0081bfdb93b6bd1bf2853bb128996f1a976b7218
$ sha256sum LOG.md .ufo/waves/round-42/claims.json
ee25ee673be3f1bdec32059b984731384fd2b12eb24d3ea0c5a2c802540824b6  LOG.md
ce7b56799cae7593d315330ffce460ac9236c1f343e40cf7212f334f7fd41d7a  .ufo/waves/round-42/claims.json
$ git status --porcelain=v1 | grep -vE '^\?\?'
(empty — zero tracked modifications or deletions)
```

Round commits: `9b6de3a` (freeze) → `236c4f4` (measurement + controls + dispatch) → `0081bfd`
(SCORECARD declared-claims section). Baseline `34e1779`. Registry/lesson/README bytes are read
at `34e1779`, `9b6de3a` and `HEAD`, and all counts below carry the command that produced them
(CORPUS.md §Rules: "A count carries its command … `<number> — <command> <date>`").

Evidence copies in `evidence/`: `status-snapshot.txt`, `class.txt`, `head.txt`,
`c2-baseline-rerun.json`, `c2-baseline-rerun.err`, `census-live.out`, `census-live.err`.

## 1. Check 1 — do the `beforeState` counts carry their commands?

| Claim | `beforeState` site | Command present | Date present | Reproduced by me |
|---|---|---|---|---|
| C1 | `claims.json:31` | **yes**, inline: `git ls-tree -r --name-only <baseline> -- corpus/evidence/round42 lists 0 files` | pointer only: control `controls/c1-baseline-tree-count.txt` carries `… → 0 (run 2026-10-28, tabi round 42 pre-data)` | `git ls-tree -r --name-only 34e1779… -- corpus/evidence/round42 \| wc -l` → `0` ✔ |
| C2 | `claims.json:46` | **not in the `beforeState`**; the command exists only in the sibling `countingCommand` (`claims.json:45`) | **no** inline date; only top-level `declaredAt` | `node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev 34e1779… --repo … --json` → `exit=1`, `predicate False`, `count 7` ✔ |

C1 is compliant-by-pointer: the number, the command and the date all exist, split across the
claim and its control file. C2 is not:

- the baseline control `controls/c2-baseline-red.json` carries `schema`, `rev`, `predicate`,
  `findingCount`, `findings` — **no command, no date, no invocation**. It therefore violates the
  rule this very round wrote into the corpus:
  `corpus/knowledge/committed-bytes-verification-round-42.md:41-42` — "A baseline count stored as
  a control file carries its counting command next to the digit; an empty control file is a
  missing control, not a zero". `controls/c2-at-freeze.json` has the same shape, and
  `controls/c2-baseline-red.exit` contains the findings text, **not an exit code**, although
  `LOG.md:2651` and `SCORECARD.md:2236` both assert "exit 1". (My rerun confirms exit 1; the
  receipt does not record it.)
- the `beforeState` names **five of the seven** finding ids the control records. Reproduced set:
  `r1a-receipt-absent`, `r1b-witness-absent`, `r2-s146-not-rejected`, `r2-supersession-absent`,
  `r3-baseline-file-empty`, `r4-slice-absent`, `r4-quarantine-absent`.
  Omitted: `r2-s146-not-rejected`, `r4-slice-absent`.

## 2. Check 2 — the r41 entry's final paragraph

`LOG.md:2625` (final line of the round-41 entry), exact text:

> Trend verdicts: expansion unchanged, quality unchanged, discernment unchanged. No tools were
> installed. Final wrap-up was requested while the wave remained queued; this log does not claim
> W1 completion.

Preceding paragraph (`LOG.md:2619`) also says: "Neither claim is admitted: the 64-seat wave is
queued at 0 spawned and no WAVE-DONE/non-author findings exist. No numeric score or capability
row is added." Cross-check: `.ufo/waves/round-41/w1-results.json` does not exist (`ls` → No such
file), and `.ufo/waves/round-41/` contains only `w1/`, `w1-spec.json`, `w1.ready`,
`w1.ready.dispatched`. **No wave-completion claim. PASS.**

The same discipline holds for the round-42 draft: `LOG.md:2674-2675` — "Results pending
WAVE-DONE; no admission is claimed before it"; `claims.json` both claims `verdict: "pending"`,
`measuredRevision: null`; `SCORECARD.md:2221-2245` adds only the declared-claims table, no
capability row (`git diff 236c4f4 0081bfd -- SCORECARD.md` = 23 added lines, all declared
claims/prose). **No admission asserted pre-WAVE-DONE. PASS.**

## 3. Check 3 — are the uncommitted round-42 bytes limited to expected landing paths?

Snapshot taken during the live wave, so the count grows as seats write (three observations):

```
12:33  git status --porcelain=v1 --untracked-files=all | wc -l   →  17
12:41                                                            → 373
12:43:15 (classifier)                                            → 621
12:43:22                                                         → 649
```

Classification at 12:43:15 (`evidence/class.txt`, classifier over `git status --porcelain=v1
--untracked-files=all`):

```
621 total
574 seat-dir-file            .ufo/waves/round-42/w1/<Seat>/…        expected seat evidence (in flight)
 41 seat-md-at-wave-root     .ufo/waves/round-42/w1/<Seat>.md       duplicate of <Seat>/report.md
  2 round42-evidence         corpus/evidence/round42/playwright-egress/{receipt,receipt.witness}.json
  2 wave-root-file           .ufo/waves/round-42/parse-w1-results.mjs, w1.ready.dispatched
  2 production-tree-symlink  corpus/lessons/lessons, corpus/knowledge/knowledge
```

Verdict on this check: **FAIL — not limited to expected landing paths.** Details in F2/F3/F5/F7.

## 4. Findings, by severity

### F1 (high) — `LOG.md:2677-2678`: the registry breakdown is wrong, unreproducible, and internally inconsistent

```
$ git show 9b6de3a19de11abdb80e82a1310abc64a40215bb:corpus/SOURCES.md \
    | grep -cE '^\| *S[0-9]{3,} *\|'
149
$ … | awk -F'|' '{gsub(/ /,"",$5);print "tier:"$5}' | sort | uniq -c
    133 tier:A
      7 tier:B
      9 tier:C
$ … | awk -F'|' '{gsub(/ /,"",$9);print "status:"$9}' | sort | uniq -c
    124 status:mined
     15 status:queued
     10 status:rejected
```
(identical at `HEAD` and in the working tree; `34e1779` = 147 rows / A131 B7 C9 / mined123
queued15 rejected9 — commands as above with `git show 34e1779…`)

`LOG.md:2677-2678` states: "Registry working-tree state: 149 rows (A131/B7/C9; mined 122 /
queued 15 / rejected 10) — S146 flip + S148/S149 arrivals."

- `131+7+9 = 147 ≠ 149` and `122+15+10 = 147 ≠ 149`: both breakdowns belong to a 147-row tree.
- The real 149-row breakdown is A133/B7/C9 and mined124/queued15/rejected10 — tier A and mined
  are each **two low** (S148 and S149 are tier-A mined rows).
- The number is labelled "working-tree state" and does not reproduce at either `9b6de3a` or `HEAD`.
- No command and no date accompany the three numbers.

Provenance of the error: `.ufo/waves/round-42/gen-w1-spec.py:236` froze the same stale
expectation into the ScriSOURCES seat prompt — "tier histogram (A131/B7/C9 expected …) status
histogram (mined 122… mined 121-1+2=122, rejected 9+1=10, queued 15)" — derived from the
round-40 baseline arithmetic (145: A129/B7/C9, mined121) instead of the round-41 end state
(147: A131/B7/C9, mined123/rejected9). The LOG line is that expectation copied out as an
observation, not a census result.

The wave's own seat evidence refutes it: `.ufo/waves/round-42/w1/ScriSOURCES/report.md:29-33`
records `tier A`: expected 131 → observed **133**, verdict "**no (+2)**"; `status mined`:
expected 122 → observed **124**, "**no (+2)**"; and
`.ufo/waves/round-42/w1/ExecCensus/manual-census.txt` prints `A=133 B=7 C=9` /
`mined=124 queued=15 rejected=10`. So the entry contradicts the seats it dispatched.

### F2 (high) — a seat wrote into the production corpus tree: two self-referential symlinks

```
$ ls -la corpus/lessons/lessons corpus/knowledge/knowledge
lrwxrwxrwx 1 vgpnk vgpnk 59 Oct 28 12:39 corpus/lessons/lessons -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/
lrwxrwxrwx 1 vgpnk vgpnk 61 Oct 28 12:39 corpus/knowledge/knowledge -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/
```

Both are untracked and both point at their own parent directory (unbounded recursion:
`corpus/knowledge/knowledge/knowledge/…`). This is a write to the production tree, which this
round's bounds declare read-only, and it is the same class as the named round-39 incident. Hazard:
any tool that follows symlinks (`grep -r`, `cp -r`, `du`, archive steps, `tar` on the corpus)
recurse forever; `git` itself lists them as two ordinary untracked paths, so a
`git add corpus/` at landing would commit them.

Attribution evidence: `.ufo/waves/round-42/w1/ScriSOURCES/report.md:116` — "Scratch root with
`S148`/`S149` rows removed (147 rows), real `corpus/*` dirs and `.ufo` symlinked, fleet
`shokunin.conf` copied in" — and `:152` — "Two `corpus` subdirs (`evidence`, `handoffs`) could not
be symlinked into the scratch root (parent-path gap for the trailing-slash `ln`)". The
trailing-slash `ln` executed with a `corpus/<subdir>` cwd created the self-links in place.
They are still present at 12:43 (audit end); L1 must `rm` them before any landing and run
`git status corpus/` as a WAVE-DONE gate.

### F3 (medium-high) — four committed references to `corpus/lessons/round-42.md`, which has never existed

```
$ git log --oneline --all -- corpus/lessons/round-42.md
(no output — the file has never been committed)
$ ls corpus/lessons/round-42.md
ls: cannot access 'corpus/lessons/round-42.md': No such file or directory
```

References:
- `LOG.md:2656` — "S146 used-by → `corpus/lessons/round-42.md` (old→new logged in the round-42 lesson)"
- `corpus/SOURCES.md:160` — S146 row `used-by` cell is exactly `corpus/lessons/round-42.md`
- `corpus/README.md:879` — the `knowledge/committed-bytes-verification-round-42.md` index row cites `corpus/lessons/round-42.md` as evidence
- `corpus/knowledge/environment-injection-measurement-integrity-round-41.md:82`

CORPUS.md §Rules: "**An index row is a claim.** Write the row when the file exists, not before."
The registry cell and the README index row are false as committed, at `HEAD`, pre-WAVE-DONE. The
frozen C2 predicate only tests S146's `status` (`rejected`), so the checker cannot catch this; it
must be closed by writing the lesson and appending an erratum, not by editing frozen bytes.

### F4 (medium) — `SCORECARD.md:2236` states "7 findings" and lists six

The C2 "Before" cell reads: "exit 1, 7 findings (r1a/r1b receipt+witness uncommitted, S146 not
rejected, no S148, baseline file empty, no quarantine TSV)". That is 2+1+1+1+1 = 6 classes; the
missing one is `r4-slice-absent` (registry/TSV slice absent), confirmed by my rerun
(`evidence/c2-baseline-rerun.json`, `findingCount: 7`). Same omission class as `claims.json:46`
(5 of 7 ids). Frozen-file unfixable → route.

### F5 (medium) — `LOG.md:2676-2677`: the census count carries no command, and the tree it censuses is unrecoverable

```
$ cat .ufo/waves/round-42/measure/census-start.out | grep -c W04        # captured 11:59
20
$ bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi > census-live.out
exit=0 ; grep -c W04 census-live.out
21
$ tail -1 census-live.out
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
```
(`evidence/census-live.out`, `.err`; run 2026-10-28 12:43 -03)

The entry says "Census start (2026-10-28): exit 0, `tabi ok`, 20 pre-existing W04 warnings
(`measure/census-start.{out,err,exit}`). Registry working-tree state: 149 rows …". Problems:

- **No command anywhere.** `measure/` holds only `census-start.{out,err,exit}` and
  `c1-measure.{exit,json,stderr.txt}` — no `.command` file, unlike the lane's own precedent
  (`git show HEAD:.ufo/waves/round-41/measure/census-end.command` →
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`)
  and round 40's inline command (`LOG.md:2571`). This is a regression in the same file.
- **The tree is ambiguous and the number is stale for the working tree.** 20 is the pre-S148
  count of `census-start.out` (11:59, before D2 added S148); the current working tree yields
  **21** because S148 duplicates S146's URL — exactly the delta the seat recorded
  (`ScriSOURCES/report.md`: "W04 duplicate-URL warnings: **20 → 21, delta = S148 only**").
  Juxtaposing a 20-warning baseline census with a "working-tree state" sentence invites the
  reader to take 20 as the working-tree number, which is false.

### F6 (medium) — the three replay exit codes in `LOG.md:2645-2646` carry no command

`controls/c1-r39-replay-r42.json`, `c1-r40-replay-r42.json`, `c1-r41-replay-refused.json` have
exactly the keys `schema, predicateSentence, receiptSha256, nonceMatched, predicate, findings` —
no command, no date, no nonce text. The paired `.exit` files hold only `R39_REPLAY_EXIT=1` /
`R40_REPLAY_EXIT=1` / `R41_REPLAY_EXIT=1`. So the entry's "r39 exit 1, r40 exit 1,
r41-committed-receipt exit 1" is a number set with no recorded invocation, and the C1 kill rule
depends on exactly this refusal behaviour. (Lesser instance: `LOG.md:2644` abbreviates the
battery to "`--battery`"; I reproduced its six cases from `controls/c1-battery-r42.json` — 5
vectors `exit 2` with `environment-loader-contamination`, `clean` `exit 0` — matching the prose.)

### F7 (medium) — out-of-path and duplicate-location artifacts in the uncommitted set

- **Duplicate report locations (41 at 12:43).** Every seat prompt instructs
  `<reportDir>/<YourSeatName>/report.md` (`w1-spec.json` `items[0].prompt`), yet 41 regular files
  `w1/<Seat>.md` sit next to `<Seat>/report.md` (same for `ExecBaselineCount`, `MutC2Digest`,
  `QuarR4201`…). At WAVE-DONE two paths claim to be "the seat report"; the `<Seat>.md` copies
  must not be landed alongside the canonical `report.md`.
- **`parse-w1-results.mjs`** (`.ufo/waves/round-42/parse-w1-results.mjs`, 12:28) is a wave-level
  tool created after the ready handoff; it is named nowhere in `w1-spec.json`, `w1-dispatch.json`
  or `w1.ready`. Wave-root tooling is precedented (`gen-w1-spec.py` is committed), so this is
  "commit it deliberately or delete it" rather than a violation.
- **`.err` captures are untracked and not ignored.** 19 untracked `*.err` seat captures exist;
  `.gitignore` line `.ufo/waves/*/*.err` only matches depth 2, so:
  `git check-ignore -v .ufo/waves/round-42/w1/ExecC1ColdRunbook/case1.err` → **exit 1 (not
  ignored)**. The round-24 rule ("dispatch/record captures are never landed") therefore does not
  protect seat-subdirectory `.err` files — a landing landmine, not a live violation.
- **Transient nested-path doubling (observed, self-resolved).** At 12:40 seven files existed at
  `.ufo/waves/round-42/.ufo/waves/round-42/w1/ExecWaveAudit/evidence/*` (wave-dir-relative path
  written from inside the wave dir); `test -e .ufo/waves/round-42/.ufo` → **NO** at 12:43, so the
  seat removed its own doubled tree. Recorded for the no-harm sweep, no action needed.
- **`corpus/evidence/round42/playwright-egress/{receipt,receipt.witness}.json`** is an expected
  landing path but is **uncommitted**: `git ls-tree -r --name-only HEAD -- corpus/evidence/round42
  | wc -l` → `0`. The frozen C1 predicate requires those two files "committed at the measured
  revision" and `claims.json` has `measuredRevision: null`; `LOG.md:2638-2642` reports the
  measurement (hashes, spans, exits) without stating that this predicate component is still
  unmet. Not an admission claim — a missing obligation in the draft.

## 5. Count-discipline table for the round-42 entry (every number, `LOG.md:2627-2678`)

| Line | Count | Command+date? | Verified |
|---|---|---|---|
| 2632-2633 | axes 8/9, saturation 8, window 3 | no command (scores; source `claims.json`) | advisory |
| 2640 | elapsed 38,384 ms; spans 16,356/17,790 ms; 126/134 samples | command at 2637 + date ✔ | `measure/c1-measure.json` `elapsedMs 38384`; receipt runs: `samples 126 span 16356`, `samples 134 span 17790` ✔ |
| 2641-2642 | receipt/witness sha256 | hashes, no command | `sha256sum` matches exactly ✔ |
| 2644 | 6 cases, 5 × exit 2, clean exit 0 | abbreviated `--battery` | `controls/c1-battery-r42.json` 6 cases, 5×`exit 2` + clean `0` ✔ |
| 2645-2646 | r39/r40/r41 exit 1 | **no command** (F6) | `.exit` files only |
| 2648 | baseline tree count 0 | **yes** (control carries command + 2026-10-28) | `git ls-tree … 34e1779 -- corpus/evidence/round42 \| wc -l` → 0 ✔ |
| 2651-2652 | exit 1, findings r1a/r1b/r2/r3/r4 classes | command at 2650; no date | rerun: exit 1, 7 findings ✔ |
| 2656-2657 | S146 mined→rejected; 38-row TSV | status ✔; 38 from `quarantine/slice-derivation.txt` (command + 2026-10-28) ✔ | `wc -l slice-ids.txt` → 38 ✔ |
| 2662-2663 | HTTP 200, 38,955 B, sha256, 13 words | **no fetch command recorded** (`sources/` holds the html only) | `ls -l` 38955 ✔, sha256 ✔, quote word count = 13 ✔ (same pattern as r40/r41, no regression) |
| 2669-2673 | 64 seats, 23/64 = 35.9%, role mix 20/9/9/8/6/5/4/1/1/1 | no command (spec cited) | `w1-spec.json`: 64 items; roles exactly those counts; attack reviewer8+critic6+mutation9 = 23; 23/64 = 35.94% ✔ |
| 2676-2677 | 20 W04 warnings | **no command** (F5) | baseline 20 ✔ / working tree 21 ✘ for "working-tree" reading |
| 2677-2678 | 149 rows; A131/B7/C9; mined 122/queued 15/rejected 10 | **no command**; numbers wrong (F1) | A133/B7/C9, mined124/queued15/rejected10 ✘ |

Append-only and non-amendment checks (all PASS):
```
$ git diff 34e1779..HEAD -- LOG.md | grep -c '^-'        → 1   (the `---` header only: pure append)
$ git diff --stat 9b6de3a..HEAD -- .ufo/waves/round-42/claims.json
(empty — claims bytes immutable since freeze)
$ git diff 9b6de3a..HEAD --stat
27 files  +3681  -0        (no deletions anywhere in the round)
```

Advisory A1: `w1-run-output.json` is byte-identical to `w1-dispatch.json`
(`sha256sum` both `9f4ac9a0a7ee248a61947a60fdd2d8220fb3c662095c77a761cbd56aca9f87c4`): it records
the dispatch input, not a run outcome. WAVE-DONE accounting must not read it as a seat-result
receipt.
Advisory A2: `corpus/knowledge/committed-bytes-verification-round-42.md:20-22` asserts "`git
ls-tree` at the pushed tip listed zero files" at `ef41e539` without the sweep; I ran it —
`git ls-tree -r --name-only ef41e539 -- corpus/evidence/round41 | wc -l` → `0` (claim true,
citation gap).
Advisory A3: `LOG.md:2638` says "on committed bytes"; the receipt bytes it cites are not yet
committed (F7, last bullet).

## 6. Residual risk and verification gaps

- Census/registry counts were verified against `HEAD`/`9b6de3a`/`34e1779` and the working tree at
  12:43 -03; seats still writing can change the working-tree untracked set (17 → 373 → 621 → 649
  during this audit). The F1 registry numbers are revision-stable, so the finding does not decay.
- The `LOG.md:2676` census line cannot be tied to a specific tree; I verified only that its number
  matches the 11:59 capture and that the current tree yields 21. Which tree L1 intended is
  unrecoverable from the recorded artifacts — that is the finding.
- Replay controls (F6) were not re-executed by me: re-running them would require the round-39/40
  receipts and fresh nonces, and the recorded exit codes plus the frozen counter pin are another
  seat's scope (`RevC1Battery`, `RevC1Receipt`). I verified only that no invocation is recorded.
- F2 attribution rests on the ScriSOURCES harness prose plus symlink target/mtime (12:39); I did
  not observe the creating command line itself.
- Freezing forbids amendment of `claims.json`, the checker and the LOG errata text; every
  claims/SCORECARD defect above is therefore routed, not fixed.

## 7. Summary against the three assigned checks

1. `beforeState` counts carry commands — **partial**: C1 yes (with a control that carries command
   + date); C2 no (no date inline, control has neither command nor date, and the enumeration is
   5 of 7).
2. r41 entry's final paragraph claims no wave completion — **pass**.
3. Uncommitted round-42 bytes limited to expected landing paths — **fail**: two production-tree
   symlinks, 41 duplicate report files, 19 unprotected `.err` captures, an uncommitted
   predicate-required evidence pair, and two undeclared wave-root files.

VERDICT finding — LOG.md:2677-2678 registry breakdown unreproducible (A133/B7/C9, mined124 vs the entry's A131/B7/C9, mined122; both sum to 147≠149), LOG.md:2676 census count carries no command and reads 21 on the working tree, SCORECARD.md:2236 says 7 findings but lists 6, claims.json:46 lists 5 of 7, corpus/lessons/round-42.md is referenced four times but has never existed, controls/c2-baseline-red.json records no command and its `.exit` no exit code, and two seat-created self-referential symlinks sit untracked in the production corpus tree (corpus/lessons/lessons, corpus/knowledge/knowledge) — no admission or wave-completion is claimed (r41 final paragraph and the r42 draft both explicitly disclaim it), and LOG.md is append-only (+56/-0).
