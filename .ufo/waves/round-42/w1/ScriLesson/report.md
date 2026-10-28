# ScriLesson — round-42 lesson skeleton draft (tabi, wave 1)

Seat: `ScriLesson` (scribe, leaf — no subagent dispatch). Judged axis: quality.
Milestone: lesson skeleton draft. Date: 2026-10-28.
Lane root (read-only except this seat dir): `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
HEAD observed: `0081bfdb93b6bd1bf2853bb128996f1a976b7218` ("round-42: SCORECARD declared-claims
section (frozen predicates, C1/C2)"). Baseline `34e177959d1b7ce04afb85a001420e02631ce79e`;
claims freeze `9b6de3a19de11abdb80e82a1310abc64a40215bb`.
No commits, no pushes, no git/jj mutation, no spawned agents, no writes outside
`.ufo/waves/round-42/w1/ScriLesson/` and scratch `/fast/scratch/hyaku/tabi-r42/ScriLesson/`
(deleted before yield). Loopback and local files only; no network fetch.

## Axes named

1. **CORPUS conformance** — the draft carries the structure `CORPUS.md:18-20` requires
   (`## Gate` with candidates/admitted/rejected-with-reasons) plus the `## Mistakes` table
   shape at `CORPUS.md:166-168` (class · evidence pointer · captured-by · fix).
2. **Falsifiability** — every number in the draft carries its command; every claim about a
   byte is re-derived in this seat from committed bytes (`git show`), not from prose.
3. **Evidence-class honesty** — measured / inferred / `PENDING-WAVE` kept separate; nothing
   unrun is written as passed.
4. **Routed-not-amended** — frozen claims, checker and controls are quoted, never changed;
   contradictions are routed as candidate rows.
5. **Bounds** — writes confined to the seat dir; scratch removed.

## Deliverable

- `.ufo/waves/round-42/w1/ScriLesson/round-42-lesson-draft.md` — 281 lines, 25,039 bytes,
  sha256 `ce47beea1f7f31f9d9b15fdb196d5d2ab3b309b8e31a52b635acb8b57c426f27`.
  Sections in order: title `# Round 42 — committed-bytes verification and the round-41
  routed-defect ledger`; `## Gate` (candidates; C1; C2; the r41 dispatch failure; sources);
  `## Mistakes` (M1–M5); `## Registry log` (S146/S148/S149 old→new + C-1/C-2/C-3); `## Census`;
  `## Limitations`; `## Evidence index`; `## What the L1 still owes`.
  18 `PENDING-WAVE` placeholders, all named in an aggregate block at the end of `## Mistakes`
  and in `## What the L1 still owes`.
- `.ufo/waves/round-42/w1/ScriLesson/evidence/` — 11 files, indexed in the draft.

Nothing was written into `corpus/`; `corpus/lessons/round-42.md` still does not exist (see F1).

## Required rows, as written

Each row below exists in the draft with the class, evidence pointer, captured-by and fix the
seat was assigned. Captured-by and fix are quoted from the draft; the evidence column adds the
re-derivation this seat performed.

| Row | Class assigned | Draft's captured-by | Draft's fix | Re-derived here? |
|---|---|---|---|---|
| M1 (D1) | landing — cited durable receipt untracked | `none`: QUALITY 66 (`:354-356`) governs which revision a receipt *records*; 72 (`:390-393`) governs prose-command captures; `grep -c` for `ls-tree` / `git cat-file` / `committed at` in QUALITY → 0/0/0 | S149 + checker R1 landed; corpus entry `committed-bytes-verification-round-42.md` | yes — `evidence/03-d1-committed-digests.txt` |
| M2 (D2) | reference-drift — spliced S146 quote | CORPUS.md:42-45 quote-location rule; census never tests quote membership (`round-41-verifier-spotcheck.md` §4) | S148 + checker R2 | yes — `evidence/04-d2-verbatim-quote.txt` |
| M3 (D3) | landing — empty committed control file | CORPUS.md:34-38 count-carries-command | populated file + checker R3 | yes — `evidence/05-d3-baseline-control.txt` |
| M4 (D4) | process — stale extraction accepted | `none` | gsub extraction + `MutSliceExtraction` red/green | yes — `evidence/06-d4-quarantine-state.txt`; the seat's own report read in full |
| M5 | provider/landing — ready pointed at the spec, no `taskCall` | `none` | ready must name the validator's dispatch output; verified by `ExecWaveAudit` | yes — `evidence/08-r41-dispatch-failure.txt` |

## Commands run and exact observed output

All from `/home/vgpnk/Projects/shokunin/tabi-shokunin`, read-only, 2026-10-28.

### 1. Frozen instruments and their digests

```
$ sha256sum .ufo/waves/round-42/counters/check-routed-defects-round42.mjs .ufo/waves/round-42/claims.json
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
ce7b56799cae7593d315330ffce460ac9236c1f343e40cf7212f334f7fd41d7a  .ufo/waves/round-42/claims.json
```

### 2. Frozen C2 checker — red arm, green limbs

```
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs \
    --rev 34e177959d1b7ce04afb85a001420e02631ce79e --repo … --json
predicate false  findingCount 7
r1a-receipt-absent, r1b-witness-absent, r2-s146-not-rejected, r2-supersession-absent,
r3-baseline-file-empty, r4-slice-absent, r4-quarantine-absent                 EXIT=1
```
Byte-identical to the committed `controls/c2-baseline-red.json` (7 findings).

```
$ node … --rev 9b6de3a19de11abdb80e82a1310abc64a40215bb --repo … --json
{"predicate":false,"findingCount":1,"findings":[{"id":"r4-quarantine-absent",…}]}   EXIT=1
$ node … --rev 0081bfdb93b6bd1bf2853bb128996f1a976b7218 --repo … --json
{"predicate":false,"findingCount":1,"findings":[{"id":"r4-quarantine-absent",…}]}   EXIT=1
```
Matches the freeze note ("only r4 still red, by design") and `controls/c2-at-freeze.json`.

### 3. D1 — committed bytes bind to the committed measure record

```
$ git show 9b6de3a:corpus/evidence/round41/playwright-egress/receipt.json | sha256sum
416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1   (blob 1,167,198 B)
$ git show 9b6de3a:…/receipt.witness.json | sha256sum
d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3   (blob 1,153,988 B)
```
Both equal `receiptSha256` / `witnessSha256` in the committed
`.ufo/waves/round-41/measure/c1-measure.json`; both parse as JSON. D1's landing limb is green
over committed bytes.

### 4. D2 — S148 supersession and verbatim quote

```
S148 teaches cell -> "supersedes S146 — A space-separated list of command-line options."
residual quote    -> "A space-separated list of command-line options."   (6 whitespace tokens; cap 25)
html.includes(quote) -> true   occurrences 1   UTF-8 byte offset 243279 (line 3687)
S146 status cell  -> "rejected"
```
The r41 verifier's own D2 example is this quote; it is now verbatim, and the byte offset agrees
with the independent `ExecQuoteVerify` seat (243279).

### 5. D3 — baseline control populated

```
$ git cat-file -s 34e1779:.ufo/waves/round-41/controls/c1-baseline-noop.out      -> 0
$ git cat-file -s 9b6de3a:.ufo/waves/round-41/controls/c1-baseline-noop.out      -> 343
records ls-tree: true   records digit 0: true
```

### 6. D4 — extraction fixed; the 38-row TSV is not built

```
slice-ids.txt: 38 ids; evidence-S###.txt files found: 38; ids covered: 38; ids missing: (none)
verdict histogram (in-flight): {"misbound":25,"absent":6,"partial":4,"present":2,"unreachable":1}
re-adjudication.tsv exists: false            <-- the one red r4 finding
evidence sizes: min 1777 B, max 5460 B (all >=200 B)
```
`ls .ufo/waves/round-42/quarantine/re-adjudication.tsv` → ENOENT. The builder
(`quarantine/build-quarantine-tsv.mjs`) refuses unless all 38 ids carry a parseable verdict, so
r4 stays red until it runs and the TSV is committed.

### 7. C1 — measurement green, committed-bytes limb unsatisfied

```
measure/c1-measure.json: driverExit 0, counterExit 0, nonceMatches true, elapsedMs 38384,
  counter.predicate true, counter.findings [], receipt 3984455276…1fd317b7e, witness 163f4eba…a57d339
producer digests re-computed against claims.json pins: 3/3 match (committed == worktree)
receipt runs: run1 126 samples / 16,356 ms / ss observations 82, nonLoopback 0;
              run2 134 samples / 17,790 ms / ss observations 80, nonLoopback 0;
              both egressNonLoopback 0, survivors 0, portClosed true, firstShot 252cafa6…f656
controls: c1-battery-r42.json 6/6 pass (5 × exit 2 environment-loader-contamination, clean exit 0);
          R39_REPLAY_EXIT=1, R40_REPLAY_EXIT=1, R41_REPLAY_EXIT=1
$ git ls-tree -r --name-only HEAD -- corpus/evidence/round42      -> (no output, 0 files)
$ git status --porcelain -- corpus/evidence/round42               -> ?? corpus/evidence/round42/
$ git check-ignore -v corpus/evidence/round42/…/receipt.json      -> exit 1 (not ignored)
```
The receipt and witness exist only as working-tree files, so the frozen C1 predicate's
"committed at the measured revision" clause is not satisfied at this instant. Recorded as
candidate C-3 in the draft; no amendment proposed.

### 8. r41 dispatch failure vs r42 dispatch shape

```
r41 w1.ready.dispatch -> …/round-41/w1-spec.json ; keys: wave,maxLanes,reportDir,context,items (no taskCall)
r41 w1.ready.dispatched -> "never-dispatched: ready pointed at w1-spec.json (no taskCall; swarm
   compile skipped); dispatcher KeyError(taskCall) …"
r42 w1.ready.dispatch -> …/round-42/w1-dispatch.json ; keys include taskCall
   taskCall keys context,tasks ; tasks 64 ; tasks opening /skill:godspeed 64
r42 registry: members 64, agentId non-null 0, updatedAt 2026-10-28T15:19:52.640Z
   .ufo/waves/round-42/w1-results.json and WAVE-DONE: both ENOENT
```
The r42 wave is mid-flight at draft time (59 of 64 seat trailers present), so the draft's
wave-settlement cells are `PENDING-WAVE`, not green.

### 9. Lane SOURCES gate and census (read-only)

```
$ node scripts/check-sources.mjs
FINDING id=rejected_without_flip fleet=- row=S146 detail=rejection_requires_reason_and_flip
FINDING id=used_by_missing      fleet=E11 row=S146 detail=path_missing
SOURCES_GATE verdict=failed rows=149 tiers=A:133,B:7,C:9 status=queued:15,mined:124,rejected:10 findings=2    EXIT=1

$ git diff --stat 34e1779 HEAD -- scripts/check-sources.mjs   -> (empty; instrument unchanged)
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root …/shokunin tabi
tabi ok … EXIT=0, 21 W04 warnings (delta vs the committed 20 is S148 sharing S146's URL)
$ grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md   -> 149
$ git show 34e1779:corpus/SOURCES.md | grep -cE …                        -> 147
tiers A=133 B=7 C=9 ; statuses mined=124 queued=15 rejected=10
$ ls corpus/lessons/round-42.md   -> ENOENT
```
Both arms of that gate were re-executed here (baseline `34e1779` archived whole into scratch and
run with its own script bytes → `verdict=clean rows=147 tiers=A:131,B:7,C:9
status=queued:15,mined:123,rejected:9 findings=0`, `EXIT=0`; HEAD → `findings=2`, `EXIT=1`, both
naming S146, instrument byte-identical). Registry transition: S146 `status mined→rejected`,
`used-by` → `corpus/lessons/round-42.md` (nonexistent); S148/S149 new rows `mined`. Both gate
findings trace to S146 and are cleared by landing this lesson with an S146 row reading
`REJECTED: …; flip: …`.

## Findings (routed, not amended)

- **F1 — the freeze commit turned the lane's own SOURCES gate from clean to failed.** I
  re-executed both arms: baseline `34e1779` archived whole into scratch and run with its own
  script bytes → `SOURCES_GATE verdict=clean rows=147 tiers=A:131,B:7,C:9
  status=queued:15,mined:123,rejected:9 findings=0`, `EXIT=0`; HEAD →
  `findings=2`, `EXIT=1`, both on S146, with `scripts/check-sources.mjs` byte-identical
  (`git diff --stat 34e1779 HEAD -- scripts/check-sources.mjs` → empty). The two arms differ
  only in `corpus/SOURCES.md`. Cause: S146 was flipped to `rejected` while its teaches cell
  still carried the old spliced quote (contract requires `REJECTED: <reason>; flip: …`, enforced
  at `scripts/check-sources.mjs:325-326`) and `used-by` points at a file that does not exist yet
  (`:334-338`). This is the same file-agreement class as M1/M3: a cell was changed without the
  artifact that makes it true. Independent confirmation: `w1/ScriC2Entry` F1/F2 report the same
  two findings from its own baseline extract. Fix: the lesson landing itself (this seat's
  output path) plus an S146 teaches cell that carries `REJECTED:`/`flip:`.
- **F2 — the round-42 C1 receipt reproduces D1's shape one round later.** `git ls-tree` at
  HEAD lists 0 files under `corpus/evidence/round42` while the frozen C1 predicate requires the
  bytes committed at the measured revision; no instrument refuses the uncommitted state (the C2
  checker reads round-41 paths only, and the C1 counter is handed a working-tree path). Fix
  requires a commit, which is outside a leaf's bounds: routed to the L1 as C-3.
- **F3 — `corpus/knowledge/environment-injection-measurement-integrity-round-41.md:81` states
  "7 words" for a 6-token quote.** `ExecQuoteVerify` and this seat both measure 6; the cell is
  an append-only errata, so the fix is a correction line in the round lesson, not an edit.
- **F4 — the draft's census-blindness claim is sourced, not observed here.** The draft says
  `sources-census.sh validate` does not test quote membership; the support is the r41 verifier's
  own note (`round-41-verifier-spotcheck.md` §4, "the census does not detect D2"), not a
  re-run against a deliberately bad cell in this seat. Stated as such in the draft row.
- **F5 (observation, not this seat's to fix) — two self-referential symlinks sit untracked in
  the lane tree.** `git status --porcelain -- corpus` reports `?? corpus/knowledge/knowledge`
  and `?? corpus/lessons/lessons`; both point at their own parent
  (`corpus/knowledge/knowledge -> …/corpus/knowledge/`, `corpus/lessons/lessons ->
  …/corpus/lessons/`), mtime `2026-10-28 12:39:23 -0300` — before this seat's first evidence
  file (12:49) and outside its write scope. A recursive count over `corpus/knowledge/*.md`
  could walk them, so they threaten the lesson's own census numbers. Left in place (production
  tree is read-only for a leaf); routed to the L1 for removal before the census re-run.

## Limitations

- The draft is a skeleton: 18 occurrences of the `PENDING-WAVE` marker (some in prose
  aggregates, some in cells) name the unrun limbs — C1 admission, C2's r4 limb, the wave
  settlement, the outside non-author spot-check, and the round-end census.
- The quarantine histogram is in-flight and is not the TSV the frozen r4 limb reads.
- No live network fetch was made (S149's URL was not re-opened; only the committed staged copy
  at `.ufo/waves/round-42/sources/git-ls-tree.html` was read: 38,955 B, sha256
  `2c298383…8b64`, S149 quote verbatim at byte 25967).
- F1 is fully re-executed here on both arms (baseline from a full `git archive`, HEAD
  in-tree), so it does not rely on the r41 record or on `ScriC2Entry` alone.
- F4 (census quote-blindness) rests on the r41 verifier's note rather than a bad-cell probe of
  my own; the draft marks it as such.
- M4's evidence rests on `MutSliceExtraction`'s own red→green→red→green run, which I read in
  full rather than re-executed; its register sha256 guard (`5afe1810…bad833`) and committed
  `slice-ids.txt` (38 ids, byte-identical to the seat's fixed extraction) I did verify
  independently.

## Tool installs / updates

None. No pacman invocation (host-wide pause respected), no `uv tool`, no binary install — the
seat needed only `node`, `git`, `awk`, `grep`, `sha256sum`, all present.

## Cleanup

- Scratch `/fast/scratch/hyaku/tabi-r42/ScriLesson/` deleted (contained one generator script and
  its JSON receipt); all receipts that matter were copied into the seat evidence dir first.
- `/tmp` helpers (`census-scri.out`, `census-scri.err`, `base-SOURCES.md`, `cs.out`) removed.
- No file under `corpus/`, `scripts/`, `.ufo/waves/round-42/quarantine/` or any sibling repo was
  written; `/home/vgpnk/Projects/shokuknow` was not touched.

VERDICT ok — draft written at `.ufo/waves/round-42/w1/ScriLesson/round-42-lesson-draft.md`
(281 lines, 25,039 B, sha256 `ce47beea…c426f27`) with the required `## Gate`/`## Mistakes`
structure, all five required rows plus the r41 dispatch failure, and 18 clearly-marked
PENDING-WAVE cells; D1, D2, D3 re-derived green over committed bytes, D4 reproducing the one red
`r4-quarantine-absent` that is this wave's job; routed findings: the freeze turned
`check-sources` red on S146 (`used_by_missing` + `rejected_without_flip`, both arms re-executed
here), the r42 C1 receipt is untracked in exactly D1's shape, the r41 errata mis-counts its own
quote as 7 words (measured 6), and two self-referential symlinks sit untracked under
`corpus/knowledge/` and `corpus/lessons/`.
