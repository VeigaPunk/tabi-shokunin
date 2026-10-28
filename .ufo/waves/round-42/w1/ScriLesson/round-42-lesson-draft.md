# Round 42 — committed-bytes verification and the round-41 routed-defect ledger

> **DRAFT — scribe seat `ScriLesson`, round 42 wave 1.** Skeleton for the L1 to finish and
> land at `corpus/lessons/round-42.md`. Nothing here is written into `corpus/`. Every value
> marked `PENDING-WAVE` is filled after `WAVE-DONE`; every number written here carries, in
> this file, the command that produced it. No claim verdict in this draft is an admission:
> the L1 owns admission (CORPUS.md:53-57, append-only). Evidence files for every measured
> cell: `.ufo/waves/round-42/w1/ScriLesson/evidence/` (index at the end of this file).

Round type: fresh start after three rejected closures (r39 proxy counter + self-referential D6;
r40 F4 wrapper bypass; r41 wave never dispatched plus routed defects D1–D4). Frozen before any
seat data: `.ufo/waves/round-42/claims.json`
(sha256 `ce7b56799cae7593d315330ffce460ac9236c1f343e40cf7212f334f7fd41d7a`) at freeze commit
`9b6de3a19de11abdb80e82a1310abc64a40215bb`, baseline
`34e177959d1b7ce04afb85a001420e02631ce79e`. Instruments frozen with it: the C2 checker
`.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`
(sha256 `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8`) and the r41
measurement chain pinned in `.ufo/waves/round-41/claims.json`.

Axes at round start (claims.json `axesAtRoundStart`): adjacency 8 (lowest), operability 9,
depth 9, coverage 9, freshness 9, calibration 9; saturation 8, stagnation window 3. No
capability entered rounds 39–41, so the stagnation nudge waives the lowest-axis obligation and
C1 is the required frontier/capability move.

## Gate

Candidates considered: the two frozen claims (C1 coverage capability, C2 calibration
instrument repair) and the 38-row staged quarantine set
(`.ufo/waves/round-42/quarantine/slice-ids.txt`, 38 ids — `wc -l` → 38; derivation
`quarantine/slice-derivation.txt`, fixed this round). The pre-data controls committed at the
freeze are the do-nothing arms: `.ufo/waves/round-42/controls/c2-baseline-red.json`
(7 findings at baseline) and `.ufo/waves/round-42/controls/c1-baseline-tree-count.txt` (`0`).

### C1 — coverage capability, Playwright Firefox loopback TCP observation (admission PENDING-WAVE)

Frozen predicate (claims.json C1, quoted not paraphrased): counting command
`node scripts/measure-c1-round41.mjs --out corpus/evidence/round42/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r42/L1-measure/run`
must exit 0 on a fresh nonce with driver exit 0, counter exit 0, predicate true and empty
findings; **the produced `receipt.json` and `receipt.witness.json` must be committed at the
measured revision**; `--battery` must report all six cases pass; direct counter v4 replay of the
committed r39, r40 and r41 receipts must each refuse; and the round's validated policy-v2 wave
must settle with `WAVE-DONE` over at least 64 seats with no settled seat report demonstrating a
do-nothing reach.

Observed at the pre-wave measurement (`measure/c1-measure.json`, read 2026-10-28):

- `counterExit 0`, `driverExit 0`, `predicate true`, `findings []`, `nonceMatches true`,
  `elapsedMs 38384`; nonce `94c0f0ef…8e4e21ab` (64 hex) echoed in the receipt's `envCheck`
  (`envNonceEcho: "match"`, `forbiddenNames: []`, `execArgvClean: true`).
- `receiptSha256 3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e`,
  `witnessSha256 163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339`.
- Receipt runs: run 1 — 126 samples, first-to-last 16,356 ms, `sockets.ss {observations: 82,
  nonLoopback: 0}`; run 2 — 134 samples, 17,790 ms, `sockets.ss {observations: 80,
  nonLoopback: 0}`. Both: `egressNonLoopback 0`, `survivors 0`, `portClosed true`, identical
  first-shot `252cafa6e9b2f656…`; Playwright 1.64.0, Firefox 157.0,
  `measuredAt 2026-10-28T15:09:21.182Z`.
- Controls: `--battery` 6/6 pass, `controls/c1-battery-r42.exit` → `BATTERY_EXIT=0` (five
  vectors exit 2 `environment-loader-contamination`: `forger-r39-verbatim`,
  `forger-r41-retargeted`, `node-path`, `ld-preload`, `esm-loader`; clean probe exit 0);
  replays refuse with `R39_REPLAY_EXIT=1`, `R40_REPLAY_EXIT=1`, `R41_REPLAY_EXIT=1`.
- Committed-bytes limb — **not satisfied at HEAD**:
  `git ls-tree -r --name-only HEAD -- corpus/evidence/round42` → empty (0 files) and
  `git status --porcelain -- corpus/evidence/round42` → `?? corpus/evidence/round42/`
  (`git check-ignore -v` exit 1: not ignored). The measured bytes exist only in the working
  tree. This is routed, not amended (see candidate row C-3 below).

Admitted / rejected: **PENDING-WAVE.** Admission requires the settled wave and committed
receipt bytes; the kill rule (any do-nothing reach, any refusing control, uncommitted receipt)
is unchanged and frozen. On pass only, one capabilities-table row
`playwright-firefox-loopback-tcp` enters SCORECARD with first-working round 42. On any kill,
coverage holds its score and the finding routes to round 43.

### C2 — calibration, round-41 routed-defect ledger D1–D4 (D1–D3 closed; D4 PENDING-WAVE)

Frozen predicate: at the measured revision
`node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev <REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json`
exits 0 with (r1a/r1b) the r41 receipt and witness committed, ≥1000 bytes, valid JSON, sha256
equal to the committed `.ufo/waves/round-41/measure/c1-measure.json` digests; (r2) `SOURCES.md`
S148 teaches begins `supersedes S146`, remainder a verbatim ≤25-word substring of the committed
`.ufo/waves/round-41/sources/node-cli-v24.21.0.html`, and S146 status `rejected`; (r3)
`.ufo/waves/round-41/controls/c1-baseline-noop.out` a committed nonempty blob recording the
`ls-tree` counting command and the digit `0`; (r4) `.ufo/waves/round-42/quarantine/re-adjudication.tsv`
committed with exactly the 38 slice ids, no duplicates, verdict in
`{present,absent,misbound,partial,unreachable}`, evidence path a committed blob ≥200 bytes.

Red arm (committed pre-data, `.ufo/waves/round-42/controls/c2-baseline-red.json`): at
`34e1779` the checker returns `predicate false`, `findingCount 7` —
`r1a-receipt-absent`, `r1b-witness-absent`, `r2-s146-not-rejected`, `r2-supersession-absent`,
`r3-baseline-file-empty`, `r4-slice-absent`, `r4-quarantine-absent`. Re-derivation in this
seat reproduced exactly those 7 ids.

Green limbs observed at the freeze (`9b6de3a`) and at HEAD (`0081bfdb…`), same output:

```
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs \
    --rev 9b6de3a19de11abdb80e82a1310abc64a40215bb \
    --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
{"schema":"tabi-r42-routed-defects","rev":"9b6de3a…","predicate":false,"findingCount":1,
 "findings":[{"id":"r4-quarantine-absent",…}]}                                          EXIT=1
```

- **D1 (landing) closed:** `git show 9b6de3a:corpus/evidence/round41/playwright-egress/receipt.json | sha256sum`
  → `416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1` (1,167,198 bytes);
  witness → `d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3` (1,153,988
  bytes). Both equal the committed r41 `c1-measure.json` values.
- **D2 (reference-drift) closed under the frozen r2 predicate:** S148 teaches cell reads
  `supersedes S146 — A space-separated list of command-line options.`; the residual quote is
  **6** whitespace tokens and `html.includes(quote)` → `true` against the committed staged
  copy. S146 status flipped `mined` → `rejected` (old→new, logged below in §Registry log).
- **D3 (landing) closed:** `git show 9b6de3a:.ufo/waves/round-41/controls/c1-baseline-noop.out`
  → 343 bytes, 4 lines, carrying
  `git -C … ls-tree -r --name-only fecbdf0a… -- corpus/evidence/round41 | wc -l` and `0`
  (was a 0-byte committed blob at baseline: `r3-baseline-file-empty`).
- **D4 (process) partially landed, r4 red by design:** the fixed extraction
  (`gsub(/[^A-Za-z0-9]/,"",id)`) reproduces the 38-id set byte-identically
  (`MutSliceExtraction`, red→green→red→green hash-guarded; canonical register sha256
  `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`), and all 38
  `evidence-S###.txt` files exist across the 19 quarantine seats. `re-adjudication.tsv` is
  **not yet built**: `.ufo/waves/round-42/quarantine/re-adjudication.tsv` returns ENOENT, so
  r4 is the one red finding. Interim in-flight histogram over
  `w1/QuarR42*/evidence-S*.txt` (n=38): misbound 25, absent 6, partial 4, present 2,
  unreachable 1 — **PENDING-WAVE**: the authoritative figures come from the built TSV via
  `node .ufo/waves/round-42/quarantine/build-quarantine-tsv.mjs`, which refuses unless all 38
  ids are present with a parseable verdict.

Admitted / rejected: **PENDING-WAVE** on r4. D1–D3 are closed over committed bytes; no numeric
axis score changes without a later rubric (claims.json C2 admission).

### Round-41 dispatch failure — the wave that never ran (closed by r42's dispatch shape)

Candidate for the gate because it is the class this round had to not repeat. Evidence:
`.ufo/waves/round-41/w1.ready` `dispatch` field →
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/w1-spec.json`, and that file's
keys are `wave,maxLanes,reportDir,context,items` — **no `taskCall`**. The marker
`.ufo/waves/round-41/w1.ready.dispatched` reads `never-dispatched: ready pointed at
w1-spec.json (no taskCall; swarm compile skipped); dispatcher KeyError(taskCall)`.
`.ufo/waves/round-41/w1/swarm-registry.json` retains 64 members with no spawn.

Round 42's shape, verified: `.ufo/waves/round-42/w1.ready` `dispatch` names
`w1-dispatch.json`, whose keys are
`schema,wave,policy,counts,registry,compaction,taskCall,resumeSends,note` with
`taskCall.tasks` length 64 (`ExecWaveAudit` audit, and this seat's own key read). The
wave-readiness check remains: **PENDING-WAVE** (`w1/swarm-registry.json` still has 64 members
with `agentId: null` for every seat, `updatedAt 2026-10-28T15:19:52.640Z`, and no `WAVE-DONE` /
`w1-results.json` at the time of this draft; 59 of 64 seat trailers exist, i.e. the wave is
mid-flight, not settled).

Rejected as candidates in this round: none of the four r41 defects may be re-scoped as
"closed by report" — each closes only through the frozen checker limb named above, and D4 does
not close until r4 is green over committed bytes.

### Sources opened / changed this round

- **S148** (new row, supersedes S146) — Node.js CLI docs,
  https://nodejs.org/docs/latest-v24.x/api/cli.html §`NODE_OPTIONS=options...`, opened
  2026-10-28; teaches-cell quote `A space-separated list of command-line options.` (6 tokens,
  verbatim in the committed staged copy of node v24.21.0 docs).
- **S149** (new row) — git-ls-tree manual, https://git-scm.com/docs/git-ls-tree, opened
  2026-10-28; opened copy `.ufo/waves/round-42/sources/git-ls-tree.html`, 38,955 bytes, sha256
  `2c298383476164238c6e25ba804412a335c405ab9540650bb603778e2f4f8b64`; quote
  `Lists the contents of a given tree object, like what "/bin/ls -a" does` (13 words).
- Outside non-author spot-check: **PENDING-WAVE**. Dispatched seats are lane-authored and do
  not qualify (same standing limit as rounds 39–41).

## Mistakes

One row per mistake: class · evidence pointer · captured-by · fix. Rows M1–M5 are the round-41
verifier's routed defects plus the dispatch failure; rows are written against committed bytes at
the freeze unless the cell says otherwise.

| Class | Evidence pointer | Captured-by | Fix |
|---|---|---|---|
| **M1 `landing` (D1)** — a cited "durable receipt" existed only as untracked working-tree bytes | `corpus/lessons/round-41-verifier-spotcheck.md:20` (`git status --porcelain` → `?? corpus/evidence/round41/`, two files 1.17 MB + 1.15 MB) while `git ls-tree -r --name-only ef41e53 -- corpus/evidence/round41` piped to `wc -l` → 0; the r41 report, SCORECARD and lesson all called it durable | **none** — the two nearest criteria miss the shape: `corpus/QUALITY.md:354-356` (66) governs *which revision a receipt records*, not whether the receipt is committed at all; `corpus/QUALITY.md:390-393` (72) governs *command output quoted in prose* being a committed capture, not the evidence blob a claim cites as its receipt. `grep -c 'ls-tree' corpus/QUALITY.md` → 0, `grep -c 'git cat-file' corpus/QUALITY.md` → 0, `grep -c 'committed at' corpus/QUALITY.md` → 0, so no criterion says "evidence exists when a revision addresses it" | Landed at the freeze: bytes committed as explicit files, sha256 equal to the committed r41 measure record (verified, `evidence/03-d1-committed-digests.txt`). Enforcement: S149 + checker limb R1 (`r1a`/`r1b`), red at baseline with `r1a-receipt-absent`/`r1b-witness-absent`. Corpus side: `corpus/knowledge/committed-bytes-verification-round-42.md`. **PENDING-WAVE:** QUALITY criterion that states the rule for all later rounds (not landed at this draft). |
| **M2 `reference-drift` (D2)** — SOURCES S146 carried a spliced, non-verbatim quote | The carried cell read `A space-separated list of command-line options; interpreted before command-line options`; the committed staged copy reads `…command-line options. options... are interpreted before command-line options…`, so `includes()` is `false` and each fragment alone is also 0 hits (`w1/ScriC2Entry` check 3, re-derived here) | **CORPUS.md:42-45 "A quote names its location"** (frontmatter vs body, header vs code, script vs installed skill) — the rule exists and was not applied to a spliced cell; `sources-census.sh validate` does not test quote membership — it printed `ok` while the bad cell was live (`corpus/lessons/round-41-verifier-spotcheck.md` §4: "the census does not detect D2; note for lane") | Append-only correction, landed: **S148** `supersedes S146 — A space-separated list of command-line options.` (6 tokens, verbatim, 1 occurrence in the staged bytes), S146 status `mined` → `rejected`. Enforcement: checker limb R2 (`r2-supersession-absent` and `r2-s146-not-rejected` were the baseline red ids). **PENDING-WAVE:** a census/lint check that a quote cell is a substring of its staged copy (r41 verifier D2's own suggestion; not landed this round). |
| **M3 `landing` (D3)** — the committed baseline control file was empty | `git cat-file -s 34e1779:.ufo/waves/round-41/controls/c1-baseline-noop.out` → `0`; the `0` count existed only in prose (checker baseline red: `r3-baseline-file-empty`) | **CORPUS.md:34-38 "A count carries its command"** — a count with no command in the file that is supposed to carry it; the file existed but carried nothing, which the rule does not spell out as a rejection | Landed at the freeze: 343-byte file re-deriving the count with `git -C … ls-tree -r --name-only fecbdf0a… -- corpus/evidence/round41` piped to `wc -l` → `0`, plus a header naming the defect. Enforcement: checker limb R3 (`r3-command-not-recorded`, `r3-zero-not-recorded` are its mutants). |
| **M4 `process` (D4)** — a stale extraction was accepted as the round's slice | `.ufo/waves/round-41/assimilation/quarantine-slice` row 38's id cell holds a leading space plus a trailing backtick (a Markdown code span that never closed before the pipe): `cat -A` renders it as ` S171` + backtick + `   the cited source could not be fetched…`. The malformed token silently drops the S171 row at any id join (`grep -cx 'S171' old-ids.txt` → 0 vs 1 on the fixed set) | **none** — no rule rejected a trailing punctuation mark after an id, and the round accepted the prior round's extracted file instead of re-deriving it from the register | Fixed extraction `gsub(/[^A-Za-z0-9]/,"",id)` landed at the freeze; `slice-ids.txt` holds 38 clean ids matching the register. Falsifier: `w1/MutSliceExtraction` red→green→red→green hash-guarded (register sha256 `5afe1810…bad833`), plus the routed residual that the id-set detector is blind to a leading space (only a character-anchored `^S[0-9]{3} ` sees it). **PENDING-WAVE:** the 38-row TSV that uses the clean ids. |
| **M5 `provider`/`landing` — the round-41 wave was never dispatched** (ready file pointed at the spec, which carries no `taskCall`) | `.ufo/waves/round-41/w1.ready` `dispatch` → `…/round-41/w1-spec.json` (keys `wave,maxLanes,reportDir,context,items`); `.ufo/waves/round-41/w1.ready.dispatched` → `never-dispatched: ready pointed at w1-spec.json (no taskCall; swarm compile skipped); dispatcher KeyError(taskCall)`; registry 64 members, 0 spawned | **none** — the ready handoff was trusted without a shape check, so a spec path satisfied it while carrying no dispatch envelope | Fix: the ready file must name the **validator's dispatch output**, not the spec — `.ufo/waves/round-42/w1.ready` `dispatch` → `w1-dispatch.json`, whose top-level `taskCall{context,tasks}` exists with 64 tasks, every task opening `/skill:godspeed`, names 1:1 with the spec in order, no model parameters. Verified by `w1/ExecWaveAudit/report.md`. **PENDING-WAVE:** the r42 wave's own settlement (registry still `agentId: null` × 64, no `WAVE-DONE`) is the second half of this row and is not yet demonstrable. |

**PENDING-WAVE placeholders in this table:** (a) the QUALITY criterion number/text for
committed-bytes verification (M1); (b) whether the quote-substring lint lands this round (M2);
(c) the settled-wave statement that replaces "still mid-flight" in M5; (d) the TSV histogram
that closes M4's remaining limb (D4).

## Registry log (contract: every `status` / `recheck` / `used-by` change old→new)

Measured with `git show 34e1779:corpus/SOURCES.md` and `git show 9b6de3a:corpus/SOURCES.md`,
cells read by column name (`id|source|kind|tier|scope|anchor|teaches|status|opened|recheck|used-by`):

- S146 `status`: `mined` → `rejected`.
- S146 `used-by`: `corpus/knowledge/environment-injection-measurement-integrity-round-41.md` →
  `corpus/lessons/round-42.md`.
- S148: **new row** — `status mined`, `recheck on-release`, `used-by
  corpus/knowledge/environment-injection-measurement-integrity-round-41.md`.
- S149: **new row** — `status mined`, `recheck 180d`, `used-by
  corpus/knowledge/committed-bytes-verification-round-42.md`.
- S145, S147: unchanged — their registry rows compare byte-identical between `34e1779` and
  `9b6de3a` (`row(a,id)===row(b,id)` per id → `true` on both; S146 compares `false`, matching
  the flip above).

Three observations from this transition, recorded not amended (**PENDING-WAVE** for the L1's
disposition; they are candidate rows, not verdicts):

- **C-1 (candidate, `landing`)** — S146's new `used-by` target `corpus/lessons/round-42.md`
  does not exist at HEAD (`ls` → No such file). The lane's own gate says so:
  `node scripts/check-sources.mjs` → `SOURCES_GATE verdict=failed rows=149 tiers=A:133,B:7,C:9
  status=queued:15,mined:124,rejected:10 findings=2`, `EXIT=1`, with
  `used_by_missing row=S146 detail=path_missing` and
  `rejected_without_flip row=S146 detail=rejection_requires_reason_and_flip`
  (`scripts/check-sources.mjs:326`, `:334-338`). The instrument is byte-identical to baseline
  (`git diff --stat 34e1779 HEAD -- scripts/check-sources.mjs` → empty), so the freeze commit
  caused the regression. Consequence for this lesson: landing it at
  `corpus/lessons/round-42.md` with an S146 row whose teaches cell reads `REJECTED: …; flip: …`
  is what turns this back to `findings=0`.
- **C-2 (candidate, `count-drift`)** — `corpus/knowledge/environment-injection-measurement-integrity-round-41.md:81`
  says S148's quote is "verbatim, 7 words". Measured: the residual quote
  `A space-separated list of command-line options.` is **6** whitespace tokens
  (`node -e 'q.split(/\s+/)…'` → 6), and the whole teaches cell including
  `supersedes S146 — ` is 9. The r42 `ExecQuoteVerify` seat and this seat both measured 6, so
  the defect is the errata's tally, not the quote. Captured-by: CORPUS.md:34-38 count rule.
  Fix: the round-42 lesson states 6 and names the command; the errata is append-only and is
  not rewritten (route a correction line instead).
- **C-3 (candidate, `landing`)** — **the r42 C1 receipt is in exactly D1's shape**: the frozen
  C1 predicate requires the receipt and witness "committed at the measured revision", but at
  HEAD `git ls-tree -r --name-only HEAD -- corpus/evidence/round42` → 0 files while
  `git status --porcelain` → `?? corpus/evidence/round42/`. No instrument refuses this
  uncommitted state (the C2 checker reads only the round-41 paths; the C1 counter reads the
  working-tree file it is handed). Captured-by: none — the committed-bytes rule exists this
  round only as a knowledge entry plus two checker limbs over round-41 paths. Fix:
  **PENDING-WAVE** — commit the measured receipt and witness before any C1 admission, and
  extend the falsifier class to the claim's own evidence paths.

## Census

- Round-start census (committed at the freeze): `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
  → exit `0`, `tabi ok`, 20 W04 duplicate-URL warnings
  (`.ufo/waves/round-42/measure/census-start.{out,err,exit}`).
- Re-run in this seat, read-only, 2026-10-28:
  `sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit `0`,
  `tabi ok`, **21** W04 warnings; the delta is S148, which shares S146's URL
  (`W04 S148 duplicate url nodejs.org/docs/latest-v24.x/api/cli.html across scopes`).
- Rows: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → 149
  (baseline `git show 34e1779:corpus/SOURCES.md | grep -cE …` → 147). Histogram
  `awk -F'|' … {tiers[$5]++; status[$9]++}` → A133/B7/C9, mined 124 / queued 15 / rejected 10.
- **PENDING-WAVE:** the round-end census re-run and its receipt, plus the final
  added-row / touched-row list after the lesson itself lands.

## Limitations

- This is a skeleton: C1's admission, C2's r4 limb, the wave's own settlement and every
  number marked `PENDING-WAVE` are unfilled, and an unrun check has not passed.
- The quarantine histogram above is in-flight (wave mid-run: 59 of 64 seat trailers present
  when this draft was written, `ScriLesson` and four others still open); it is not the TSV the
  frozen r4 limb reads.
- Nothing in this draft amends `claims.json`, the checker, or any control; C-1/C-2/C-3 are
  routed observations for the L1, not verdicts.
- No source was re-opened beyond the committed staged copies (`.ufo/waves/round-41/sources/node-cli-v24.21.0.html`,
  `.ufo/waves/round-42/sources/git-ls-tree.html`); the S149 live URL was not re-fetched.

## Evidence index (`.ufo/waves/round-42/w1/ScriLesson/evidence/`)

| file | what it holds |
|---|---|
| `01-checker-baseline.txt` | frozen C2 checker at baseline `34e1779`: `predicate false`, 7 findings, `EXIT=1` |
| `02-checker-freeze-and-head.txt` | same checker at freeze `9b6de3a` and at HEAD `0081bfdb`: `predicate false`, 1 finding (`r4-quarantine-absent`), `EXIT=1` both |
| `03-d1-committed-digests.txt` | committed r41 receipt/witness blob sha256 vs committed measure digests: both `match: true`, both parse as JSON |
| `04-d2-verbatim-quote.txt` | S148 teaches cell, residual quote (6 tokens), `html.includes → true`, 1 occurrence, UTF-8 byte 243279 / line 3687, S146 status `rejected` |
| `05-d3-baseline-control.txt` | baseline control 0 bytes → 343 bytes; records `ls-tree` and digit `0`; full file bytes |
| `06-d4-quarantine-state.txt` | 38 ids, 38 `evidence-S###.txt` files, in-flight histogram, `re-adjudication.tsv exists: false`, plus the per-id table |
| `07-c1-receipt-committed-state.txt` | r42 receipt `git ls-tree` → 0 files, `??` untracked, not ignored; measure record fields; three producer digests re-computed and matching their pins |
| `08-r41-dispatch-failure.txt` | r41 ready → spec (keys without `taskCall`) vs r42 ready → dispatch (`taskCall.tasks` 64, 64 opening `/skill:godspeed`); registry spawn state; no `WAVE-DONE` |
| `09-sources-gate-census.txt` | `node scripts/check-sources.mjs` → failed, 2 findings, `EXIT=1`; instrument unchanged vs baseline; census `ok` with 21 W04; row counts 147→149; tier/status histograms; S146/S148/S149 cells old→new; `corpus/lessons/round-42.md` ENOENT |
| `10-c1-producer-digests-and-controls.txt` | producer digests at freeze-vs-worktree; both pre-data do-nothing controls verbatim |
| `11-row-identity.txt` | registry row text compared between baseline and freeze: S145/S147 identical, S146 changed, S148/S149 new |

## What the L1 still owes (carry list, not a TODO)

Everything marked `PENDING-WAVE` in this draft, plus the two corpus actions this lesson's own
landing creates: (1) write the lesson to `corpus/lessons/round-42.md` with an S146 row whose
teaches cell reads `REJECTED: …; flip: …` (this clears both `scripts/check-sources.mjs`
findings named in §Registry log C-1); (2) commit the round-42 receipt and witness so C1's
committed-bytes limb is satisfiable (C-3).
