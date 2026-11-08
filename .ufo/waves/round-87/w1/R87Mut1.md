# R87Mut1 — independent mutation sweep (C1 showpicker counter, C2 record-drift gate)

Seat: mutation-tester, round 87 wave `w1`. Milestone: independent mutant sweep. Axes: coverage,
calibration. Nothing judged, integrated or shipped; no lane bytes were written by this seat.

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `24765dd9`, D `3dd4b0802d67`, nonce
`tabi-r87-l1-3dd4b0802d67`. Scratch: `/fast/scratch/hyaku/tabi-r87/R87Mut1/` (removed at close).

## 0. Identity and mid-sweep re-freeze (read this first)

The wave re-froze **while this sweep was running**. I bind every result below to the bytes it
actually executed:

| instrument | bytes executed | binding |
|---|---|---|
| `scripts/check-showpicker-r87.mjs` | `6a2bb03b63feb4835d9bf61b4b8970a27b81ac266e2e1e4cc130cd620bf9b181` | unchanged by both freezes; current pin |
| `scripts/negatives-showpicker-r87.mjs` | `9883807a5a60e20fb18cd28e4599c2e769c568a20f67e1e099527b4b652d22a5` | current pin |
| `scripts/check-record-drift-r87.mjs` (sweep A) | `603fb5874bf3743259a62209d9b41c023ccb78619239564e7f2a8a9e3c4397f7` | the pin I copied at 07:16; **superseded** by the 07:25 re-freeze |
| `scripts/check-record-drift-r87.mjs` (sweep B) | `eea04278daf02e94094fabe8f7968d1413cfe32c6f2635c0db3da5f2abae69f6` | current `freeze.txt`/`claims.json` pin (D5) |
| `scripts/chrome-cdp-showpicker-round87.mjs` | `7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f` | current pin |
| scored receipt | `5d38d03703f717877376217d51df44ffb8ab2f47c93031e46717207c6c15b4ef`; fixture `10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4` | current |

No mutation was applied to a lane file: each mutant is a copy under my scratch, the frozen
`negatives-showpicker-r87.mjs` resolves the counter beside itself, and all mutated runs therefore
execute only the copy. Lane hashes were re-read after the sweep (showpicker `6a2bb03b…`, drift
`eea04278…`, battery `9883807a…`); the copies under `bin/` still hash to their pins.

Because C2's pin changed mid-sweep I report both: **sweep A** against `603fb587` (the pre-freeze
pin, my baselines and defect fixtures), and **sweep B** against `eea04278` (the current freeze,
with the live record snapshot). The live record snapshot I used matches the lane at close for all
nine files read by the gate:

```
SKILL.md aed838a9… plans/round-86.md da9f241b… corpus/lessons/round-86.md 3bab07d7…
corpus/lessons/round-87.md b58ee0ed39a39c06ccba005063a0245e741c2e689e949581475853d32cab21d2
corpus/SOURCES.md 04ae5564… corpus/QUALITY.md 60129c5c…
.ufo/waves/round-86/claim-falsification.tsv c14a6c6b…
.ufo/waves/round-86/lesson-proof/README.md 8a6543bd…
.ufo/waves/round-86/scored/witness-a.json ccb8c45d…
```

## 1. Method

Axes were named as coverage and calibration; every mutant was chosen to attack one clause, then
run against the frozen detector, not against a hand-written expectation.

- **C1 detector = the frozen battery** (`negatives-showpicker-r87.mjs`: 209 cases). A mutant is
  KILLED when the battery exits 1 (a case fails), SURVIVED when it exits 0 with full coverage,
  CRASHED when the counter does not run. I did not use `scripts/kill-power-r87.mjs` or its list.
- **C2 detector = the lane records plus the BEFORE worktree** at `/fast/scratch/hyaku/tabi-r87/base`
  (`24765dd9`). The frozen pair is: clean lane exit 0 / mismatches 0, BEFORE exit 1 / mismatches 5.
  KILLED-CLEAN = the mutant breaks the clean leg; KILLED-BEFORE = the mutant changes the BEFORE
  count away from 5. For survivors I additionally built one defect mirror per statement (a copy of
  the lane records with exactly that statement broken) and verified the pristine gate refuses it;
  the mutant's failure to refuse that same mirror is the reachability evidence. A mirror the
  pristine gate does not refuse is reported INCONCLUSIVE, never as a kill.
- **Restored bytes** were re-run after the sweeps on the pristine copies and on the lane itself.

Baselines (all observed):

| run | output |
|---|---|
| pristine counter on the scored receipt | verdict `clean`, `checkCount 99`, no findings, exit 0 |
| pristine battery | `cases 209`, `failed 0`, coverage `declared 99 / covered 99 / uncovered []` |
| pristine drift, sweep-A pin, snapshot lane | `claims 5, mismatches 0`, exit 0 |
| pristine drift, sweep-A pin, BEFORE worktree | `mismatches 5`, exit 1, all five claims failed |
| pristine drift, sweep-B pin (current), snapshot lane | `claims 5, mismatches 0`, exit 0 |
| pristine drift, sweep-B pin, BEFORE worktree | `mismatches 5`, exit 1, all five claims failed |
| restored battery after all mutants | `cases 209`, `failed 0`, coverage 99/99, exit 0 |

The battery's acceptance rule matters for reading the table: a refusal case passes only when the
counter exits 1, the **expected id is present**, and every other id is in that case's
`alsoAllowed`. `alsoAllowed` is extras-only, not a substitute. That is why row drops (S01–S05) are
killed even though a sibling check still fires.

## 2. C1 — showpicker counter: 25 mutants

Pass rate: **19 killed, 5 survived, 1 crashed, 0 unapplied**. Coverage stayed `99/99` for every
mutant except the four whole-check neutralizations whose ids vanished (listed in the table).
"Witness" is the aimed receipt run against the pristine counter and the mutant counter (exit /
finding ids): an `ESC` there is a whole-counter escape for that clause, independent of whether the
battery kills the edit through another case.

| id | edit (see §2.4 for verbatim) | outcome | case or check that noticed | witness |
|---|---|---|---|---|
| S01 | drop `sp87-accept-audio-png` GRAMMAR row | killed | `accept-grammar-law-r87-audio` | ESC: 1 `[accept-grammar-law]` vs 0 `[]` |
| S02 | drop `sp87-accept-video-text` row | killed | `accept-grammar-law-r87-video` | ESC: 1 vs 0 |
| S03 | drop `sp87-accept-multimime-text` row | killed | `accept-grammar-law-r87-multimime` | ESC: 1 vs 0 |
| S04 | drop `sp87-accept-whitespace-png` row | killed | `accept-grammar-law-r87-whitespace` | ESC: 1 vs 0 |
| S05 | `GRAMMAR.slice(0,5)` — drop all four r87 rows | killed | all four `accept-grammar-law-r87-*` cases | ESC: 1 vs 0 |
| S06 | `desc.accept === accept` → `typeof desc.accept === 'string'` | killed | `accept-grammar-law-token`, `-r87-audio`, `-r87-multimime`, `-r87-whitespace` | shadowed: 1 `[accept-grammar-law, fixture-descriptors]` vs 1 `[fixture-descriptors]` |
| S07 | drop `answer.setParams.backendNodeId === nodeReport[name][0]` | **survived** | none (battery green, 0 failed) | **ESC: 1 `[accept-grammar-law]` vs 0 `[]`** |
| S08 | `answer.files` equality → `length === 1` | **survived** | none (battery green) | **ESC: 1 vs 0** |
| S09 | `stateAfter` equality → `Array.isArray` | killed | `accept-grammar-law-state`, `-r87-video` | shadowed: 1 `[leg-…, accept-grammar-law, no-selection-law]` vs 1 `[leg-…, no-selection-law]` |
| S10 | drop page-read `hex:` equality | killed | `accept-grammar-law-bytes` | ESC on the witness class, but the battery kills the edit on the sp86 case |
| S11 | read count `=== 1` → `>= 1` | **survived** | none (battery green) | shadowed: extra-read witness 1 `[leg-…, accept-grammar-law]` vs 1 `[leg-…]` |
| S12 | drop `setResult {}` and `setError null` | **survived** | none (battery green) | **ESC: 1 vs 0** |
| S13 | duplicate the whitespace GRAMMAR row verbatim | **survived** | none (battery green) | equivalent: 1 `[accept-grammar-law]` vs 1 `[accept-grammar-law]` |
| S14 | PLAN audio leg `gesture:false` → `true` | killed | over-strict: 207 cases fail, incl. `accept-real`; direct clean receipt gives `[plan-frozen, plan-calls]` | — |
| S15 | `FIXTURE_INPUTS[aa].accept` `audio/*` → `video/*` | killed | over-strict: 203 cases fail, incl. `accept-real`; direct gives `[fixture-descriptors]` | — |
| S16 | `LEG_SHAPE[whitespace]` PNG → ANSWER | killed | over-strict: 208 cases fail, incl. `accept-real`; direct gives `[leg-sp87-accept-whitespace-png]` | — |
| S17 | `if (opens !== want)` → `if (false && …)` | killed | `intercept-law`; **`intercept-law` uncovered** | shadowed: 1 `[plan-calls, leg-…, same-origin-no-picker-law, intercept-law]` vs 1 `[plan-calls, leg-…, same-origin-no-picker-law]` |
| S18 | short-circuit `same-origin-no-picker-law` to true | killed | `same-origin-activated-opens-none`; **`same-origin-no-picker-law` uncovered** | shadowed |
| S19 | `isTrusted === true` → `typeof boolean` | killed | `trust-law` | shadowed: mutant still finds `leg-sp84-accept-answer` |
| S20 | drop `no-selection-law`'s empty-state push | killed | `no-selection-law` | shadowed: `leg-…` still fires |
| S21 | `accept-grammar-law` condition → true | killed | 8 grammar cases; **`accept-grammar-law` uncovered** | ESC: 1 vs 0 on the read-ret witness |
| S22 | per-leg shape comparison drops `'state'` | killed | 26 `leg-*` cases; those `leg-*` ids uncovered | witness `stateAfter.sValue='x'`: 1 `[leg-sp84-accept-answer, no-selection-law]` vs 1 `[no-selection-law]` |
| S23 | `mode-law`: drop the mode equality | killed | `mode-law`; **`mode-law` uncovered** | shadowed: `leg-…` still fires |
| S24 | `event-leg-window` condition → `isObj(e)` only | killed | `event-leg-window` + 3 `w-event-window-*`; **`event-leg-window` uncovered** | ESC: at=0.1 witness 1 `[event-leg-window]` vs 0 |
| S25 | `const gBad = undefinedGrammarProbe();` | **crashed** | direct run: `ReferenceError: undefinedGrammarProbe is not defined` at line 696; no JSON, so the battery never scores it | n/a |

### 2.1 Survivors and the escapes they demonstrate

| id | clause lost | aimed receipt (one field changed on the scored receipt) | pristine | mutant | class |
|---|---|---|---|---|---|
| S07 | answer echo `setParams.backendNodeId` is the chooser's node | `sp87-accept-audio-png.answer.setParams.backendNodeId = 999` | exit 1 `[accept-grammar-law]` | exit 0 `[]` | battery escape, whole-counter |
| S08 | answer echo `files[0]` is the delivered name | `sp87-accept-whitespace-png.answer.files = ['forged.txt']` (echo `setParams.files` untouched) | exit 1 `[accept-grammar-law]` | exit 0 `[]` | battery escape, whole-counter |
| S12 | answer echo `setResult = {}` / `setError = null` | `sp87-accept-multimime-text.answer.setResult = {ok:1}` | exit 1 `[accept-grammar-law]` | exit 0 `[]` | battery escape, whole-counter |
| S11 | exactly one `read` event | duplicate the `sp87-accept-audio-png` read event (seq N+1) | exit 1 `[leg-sp87-accept-audio-png, accept-grammar-law]` | exit 1 `[leg-sp87-accept-audio-png]` | battery-blind, shadowed by the per-leg seq |
| S13 | none (row duplicated verbatim) | backendNodeId witness as S07 | exit 1 `[accept-grammar-law]` | exit 1 `[accept-grammar-law]` | equivalent mutant |

The three whole-counter escapes share one shape: the four r87 legs have no battery case that
mutates the *answer echo* (`answer.setParams.backendNodeId`, outer `answer.files`,
`answer.setResult/setError`). `plan-calls` binds the send log to `answer.setParams.files` and the
chooser's backendNodeId, but not to the echoed `setParams.backendNodeId`, the outer `files`, or
`setResult`; `leg-<name>` binds page events; so those three fields are grammar-only, and the
`GRAMMAR` row is the only witness — with no case, a forged receipt passes the mutant counter.

### 2.2 Killed edits that still hide an unwitnessed clause

The battery kills S01–S05, S10, S21 and S24, but their witness column shows the removed clause was
not itself witnessed: the battery notices a *different* mutation of the same check (the accept
attribute, the sp86 read ret, or the expected id disappearing from coverage). This is kill power on
the edit, not on the clause. In particular:

- each row drop (S01–S04) is killed by the accept/state mutation of its own leg, yet the
  backendNodeId forgery still passes that mutant (witness ESC);
- S10's global bytes clause is killed by `accept-grammar-law-bytes` on the **sp86** mixed-text leg;
  no r87 leg has a read-ret case;
- S21 (whole law true) is killed by the same sp86 bytes case; the r87 echo fields remain unwitnessed.

### 2.3 Whole-check escapes

No mutant that removed an entire check **as a whole** survived the battery. S17 (`intercept-law`),
S18 (`same-origin-no-picker-law`), S21 (`accept-grammar-law`), S23 (`mode-law`) and S24
(`event-leg-window`) were all killed by the combination of the expected-id rule and the battery's
coverage accounting, which marks the id uncovered. The escapes found are clause-level, and the three
demonstrated whole-counter escapes are S07, S08 and S12; S11 is shadowed and S13 is equivalent.

### 2.4 Exact edits (verbatim, `\n` shown escaped)

- **S01**: `  ['sp87-accept-audio-png', 'aa', 'audio/*', PNG],\n` → ``
- **S02**: `  ['sp87-accept-video-text', 'av', 'video/*', ANSWER],\n` → ``
- **S03**: `  ['sp87-accept-multimime-text', 'a2', 'image/png,application/pdf', ANSWER],\n` → ``
- **S04**: `  ['sp87-accept-whitespace-png', 'aws', '  image/png ,  .txt  ', PNG],\n` → ``
- **S05**: `for (const [name, target, accept, f] of GRAMMAR) {` → `for (const [name, target, accept, f] of GRAMMAR.slice(0, 5)) {`
- **S06**: `isObj(desc) && desc.accept === accept;` → `isObj(desc) && typeof desc.accept === 'string';`
- **S07**: ` && leg.answer.setParams.backendNodeId === arr(nodeReport[name])[0]` → ``
- **S08**: `same(leg.answer.files, [f.name])` → `arr(leg.answer.files).length === 1`
- **S09**: `same(st, [[f.name, f.size, f.type, '']])` → `Array.isArray(st)`
- **S10**: ` && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex` → ``
- **S11**: `arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex` → `arr(leg.pageEvents).filter((e) => e.type === 'read').length >= 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex`
- **S12**: ` && same(leg.answer.setResult, {}) && leg.answer.setError === null` → ``
- **S13**: `  ['sp87-accept-whitespace-png', 'aws', '  image/png ,  .txt  ', PNG],\n` → the same line twice
- **S14**: `  { name: 'sp87-accept-audio-png', kind: 'showpicker-answer', target: 'aa', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r87-b.png'] },` → same with `gesture: true`
- **S15**: `accept: 'audio/*', rect: { left: 100, top: 880, width: 120, height: 40 }` → `accept: 'video/*', rect: { left: 100, top: 880, width: 120, height: 40 }`
- **S16**: `  'sp87-accept-whitespace-png': acceptShape('aws', PNG),` → `  'sp87-accept-whitespace-png': acceptShape('aws', ANSWER),`
- **S17**: `if (opens !== want) intBad.push(leg.name + ':opened-' + opens + '-want-' + want);` → `if (false && opens !== want) intBad.push(leg.name + ':opened-' + opens + '-want-' + want);`
- **S18**: `check('same-origin-no-picker-law', ['sp85-same-origin-tel-activated', 'sp85-same-origin-search-activated', 'sp85-same-origin-text-activated'].every((n) => {` → `check('same-origin-no-picker-law', true || ['sp85-same-origin-tel-activated', 'sp85-same-origin-search-activated', 'sp85-same-origin-text-activated'].every((n) => {`
- **S19**: `events.length > 0 && events.every((e) => e.isTrusted === true) &&` → `events.length > 0 && events.every((e) => typeof e.isTrusted === 'boolean') &&`
- **S20**: `if (!empty) stateBad.push(leg.name + ':state');` → `if (false && !empty) stateBad.push(leg.name + ':state');`
- **S21**: `check('accept-grammar-law', gBad.length === 0,` → `check('accept-grammar-law', true,`
- **S22**: `for (const k of ['seq', 'trusted', 'act', 'xy', 'files', 'opened', 'state'])` → `for (const k of ['seq', 'trusted', 'act', 'xy', 'files', 'opened'])`
- **S23**: `if (!d || opens.some((e) => e.params.mode !== wantMode)) modeBad.push` → `if (!d) modeBad.push`
- **S24**: `return arr(l.pageEvents).every((e, i, a) => isObj(e) && e.leg !== 'start' && num(e.at) && e.at >= (pre ?? 0) && e.at <= (settle ?? l.closedAt) && (i === 0 || (num(a[i - 1].at) && e.at >= a[i - 1].at)));` → `return arr(l.pageEvents).every((e) => isObj(e));`
- **S25**: `const gBad = [];` → `const gBad = undefinedGrammarProbe();`

## 3. C2 — record-drift gate

### 3.1 Sweep A, pin `603fb587` (the pin at copy time, superseded)

13 mutants, defect mirrors built from the lane snapshot at 07:16. **4 killed, 9 survived,
0 crashed, 0 inconclusive.** Killed: D07 and D11 by the BEFORE leg (their neutralization removes a
BEFORE failure, so BEFORE becomes 4), D08 and D12 by the clean leg (inversions). All nine survivors
keep the clean leg at 0 and the BEFORE leg at 5 and fail to refuse their defect mirror, which the
pristine gate refuses with the named claim.

| id | exact edit | target | outcome | evidence |
|---|---|---|---|---|
| D01 | stale regex → impossible phrase | accept-headline | survived | DD1: pristine `[accept-headline]`, mutant `[]` |
| D02 | wording regex → `/not a validator/i` | accept-headline | survived | DD2: pristine `[accept-headline]`, mutant `[]` |
| D03 | `criterion = true` | accept-headline | survived | DD3 (QUALITY 161 loses its narrowing): pristine `[accept-headline]`, mutant `[]` |
| D04 | `stalePointer = false` | mistake-evidence | survived | DD4 (rows regain `witness-a.json first two runs`): pristine `[mistake-evidence]`, mutant `[]` |
| D05 | `before === 3` → `before !== null` | mistake-evidence | survived | DD5 (witness before = 2): pristine `[mistake-evidence]`, mutant `[]` |
| D06 | drop `/included 0/` | sources-searchlog | survived | DD6 (round-86 `included 1`): pristine `[sources-searchlog]`, mutant `[]` |
| D07 | `item = true` | ledger-pointer | killed-before (4) | the whole section item is neutralized; BEFORE notices |
| D08 | invert the §Narrowings pointer | ledger-pointer | killed-clean | clean lane exit 1 |
| D09 | drop `/40/` | report-corrections | survived | DD8 (both 40 tokens changed): pristine `[report-corrections]`, mutant `[]` |
| D10 | drop `/carried|not re-opened/` | report-corrections | survived | DD9 (all carried/re-opened wording changed): pristine `[report-corrections]`, mutant `[]` |
| D11 | whole claim `sources-searchlog` → true | sources-searchlog | killed-before (4) | whole-statement neutralization is caught |
| D12 | invert the mismatches channel | verdict | killed-clean | clean lane reports 5 |
| D13 | drop `/not retained/` from noteOk | mistake-evidence | survived | DD10 (proof note omits the retention statement): pristine `[mistake-evidence]`, mutant `[]` |

### 3.2 Sweep B, pin `eea04278` (current freeze/D5), same live record snapshot

13 mutants; D08/D09 retargeted to the D5 predicates. **3 killed, 9 survived, 0 crashed,
1 inconclusive**: D08 killed-clean, D11 killed-before, D12 killed-clean; D01–D07, D10, D13 survive;
D09 is inconclusive because the D5 gate itself does not refuse its defect mirror (see §3.3).

The D5 re-freeze fixed D07's *D4* kill (the pointer is now `§Narrowings item 9`) but introduced two
new conjunct-level holes, both demonstrated:

| id | D5-specific edit / target | outcome | evidence |
|---|---|---|---|
| D07 | `item = true` (same edit) | **survived under D5** | DD7 (remove the `9. **The accept-headline narrowing` heading from `plans/round-86.md` §Narrowings): pristine `[ledger-pointer]`, mutant `[]`. The live `pointer` only checks the ledger cell's text for `item 9`; it does not verify item 9 exists, and forcing the section item true hides the heading removal. On the BEFORE worktree the ledger cell says `item 1`, so the base failure is `pointer=false`, not `item=false`; neutralizing `item` no longer changes the BEFORE count (5 stays 5). |
| D08 | invert the D5 `item 9` pointer | killed-clean | clean lane exit 1 |
| D09 | D5 directional count → broad `/39/ && /40/ && /control/` | inconclusive | DD8L (swap the correction bullet to `says "40 findings" … **39**`) is **already green under the pristine D5 gate**, so the mutant comparison has no baseline. |
| D10 | drop `/carried|not re-opened/` | survived | DD9: pristine `[report-corrections]`, mutant `[]` |
| others | unchanged from §3.1 | as in §3.1 | DD1–DD6, DD10 mirrors behave identically |

#### 3.3 The current D5 directional count is satisfied by the file's own description of the gate

`corpus/lessons/round-87.md` (snapshot hash `b58ee0ed…`) carries, in its corrections table, a row
for R87Critic C2-4 that describes the new check and quotes its pattern: the phrase
`says "39 findings"` followed by `committed control has **40**`. The D5 regex

```js
const count = /says "39 findings"[^.]{0,120}committed control has\s+\*\*40\*\*/i.test(lesson87);
```

is applied to the **whole file**, so that row satisfies it. Consequences, both observed with the
pristine D5 gate (exit 0, mismatches 0):

- **DD8** — change the bullet's `**40**` to `**forty**` and `carry 40 only` to `carry forty only`:
  D5 exits 0 (sweep A's pin exited 1 on the same defect). The correction's numbers can be corrupted
  while the gate stays green.
- **DD8L / PB_direction_reversed** — swap the bullet to `says "40 findings"; the committed control has
  **39**`: D5 exits 0. The direction can be inverted while the gate stays green.

This makes the D5 count **weaker than the D4 token test for the DD8 class**, because the record now
contains a quotable copy of the pattern. The predicate needs to be anchored to the correction
bullet (or the self-describing row excluded), not merely made longer.

### 3.4 Predicate-coverage probes (pristine gate, no checker mutant)

Each probe is a lane copy with exactly one statement broken; all four are green under **both** pins
unless noted. These are blind spots of the frozen statement set, independent of any checker mutant:

| probe | defect | D4 pin | D5 pin (current) |
|---|---|---|---|
| PB_quality_single_phrase | remove `A narrowing sweeps every distilled copy` from QUALITY 161, leave the item's other `sweep` word | exit 0 | exit 0 |
| PB_searchlog_unscoped_counts | change the round-86 entry to `identified 3 / screened 3 / … / excluded 3`; ambient entries still contain `identified 2` and `excluded 2` | exit 0 | exit 0 |
| PB_report_carried_sentence | change the correction sentence's `**carried, not re-opened**` to `**opened**`; the heading and S219 still contain `carried` | exit 0 | exit 0 |
| PB_direction_reversed | invert the 39/40 direction in the correction bullet | exit 0 | exit 0 |
| (extra) DD8 | replace the bullet's 40 tokens with `forty` | **exit 1** (caught) | **exit 0** (missed, §3.3) |

The first three have the same shape as C2's own routed defects: a conjunct that tests a token over a
whole document is satisfied by ambient prose. The search-log counts are especially exposed:
`identified 2`, `screened 2` and `excluded 2` occur in other search-log entries (2/4/2 occurrences
after `## Search log`); only `included 0` and `round-86` are unique. The carried/not-re-opened
conjunct is satisfied by `carried from r86` (S219) and by the heading `Report corrections carried
into this round`.

### 3.5 Whole-check escapes

Whole-statement neutralizations did not escape the frozen pair: D11 (whole `sources-searchlog`
claim true) and D07 under D4 are killed by the BEFORE leg, and D08/D12 by the clean leg. The nine
survivors are single-conjunct edits; each is demonstrated by a defect mirror that the pristine gate
refuses and the mutant accepts. Under D5, D07 (whole §Narrowings item neutralized) is a fresh
whole-conjunct escape; D09's class is a predicate gap rather than a mutant escape.

### 3.6 Exact edits (D4 pin; D5 deltas named)

- **D01**: `const stale = /never a validator|filters the dialog, never a programmatic answer/i;` → `const stale = /THIS_PHRASE_CANNOT_APPEAR_ANYWHERE_12345/;`
- **D02**: `const wording = /not a validator on a programmatic answer/i;` → `const wording = /not a validator/i;`
- **D03**: `const criterion = /^161\.\s/m.test(quality) && /narrowing|sweep/i.test((quality.match(/^161\.[\s\S]*?(?=\n\d+\.|\n##|$)/m) || [''])[0]);` → `const criterion = true;`
- **D04**: `const stalePointer = rows.some((l) => /witness-a\.json.*first two runs/i.test(l));` → `const stalePointer = false;`
- **D05**: `claim('mistake-evidence', rows.length === 2 && !stalePointer && repointed && noteOk && before === 3,` → `claim('mistake-evidence', rows.length === 2 && !stalePointer && repointed && noteOk && before !== null,`
- **D06**: ` && /included 0/.test(log)` → ``
- **D07**: `const item = /accept.headline|accept headline/i.test(section);` → `const item = true;`
- **D08 (D4)**: `const pointer = scribeRow ? /plans\/round-86\.md §Narrowings/i.test(scribeRow) : false;` → `const pointer = scribeRow ? !/plans\/round-86\.md §Narrowings/i.test(scribeRow) : false;`
- **D09 (D4)**: `const count = /39/.test(lesson87) && /40/.test(lesson87) && /control/i.test(lesson87);` → `const count = /39/.test(lesson87) && /control/i.test(lesson87);`
- **D10**: `const sourcesFix = /S221\/S222/.test(lesson87) && /carried|not re-opened/i.test(lesson87);` → `const sourcesFix = /S221\/S222/.test(lesson87);`
- **D11**: `claim('sources-searchlog', ok, 'round86-entry=' + ok);` → `claim('sources-searchlog', true, 'round86-entry=' + true);`
- **D12**: `const mismatches = results.filter((r) => !r.ok).length;` → `const mismatches = results.filter((r) => r.ok).length;`
- **D13**: `const noteOk = !!proofNote && /not retained/i.test(proofNote) && /before/i.test(proofNote) && /3/.test(proofNote);` → `const noteOk = !!proofNote && /before/i.test(proofNote) && /3/.test(proofNote);`
- **D08 (D5)**: `const pointer = scribeRow ? /plans\/round-86\.md §Narrowings item 9/i.test(scribeRow) : false;` → the same with `!/plans…/` (inverted)
- **D09 (D5)**: `const count = /says "39 findings"[^.]{0,120}committed control has\s+\*\*40\*\*/i.test(lesson87);` → `const count = /39/.test(lesson87) && /40/.test(lesson87) && /control/i.test(lesson87);`

Defect mirrors (all applied to scratch copies only):

- DD1 append `Legacy note: accept is never a validator.` to `SKILL.md`.
- DD2 replace the programmatic-answer wording in `SKILL.md` with `not a validator`.
- DD3 replace `A narrowing sweeps every distilled copy` and `stale-phrase sweep inside claim` in
  `corpus/QUALITY.md` item 161 with non-matching phrases.
- DD4 append the literal pointer text "see scored/witness-a.json first two runs" to both Mistakes rows of
  `corpus/lessons/round-86.md` (rows 1 and 2 by `witness-polarity|guard-inversion`).
- DD5 truncate `before.survivors` in `.ufo/waves/round-86/scored/witness-a.json` to 2.
- DD6 replace `included 0 / excluded 2 for NEW rows` with `included 1 / excluded 2 for NEW rows`.
- DD7 replace `9. **The accept-headline narrowing` in `plans/round-86.md` with `9. **The accept-law narrowing`.
- DD8 replace `**40**`→`**forty**` and `carry 40 only`→`carry forty only` in
  `corpus/lessons/round-87.md`.
- DD8L replace `says "39 findings"; the committed control has\n  **40**` with
  `says "40 findings"; the committed control has\n  **39**`.
- DD9 replace every `carried`→`handled` and `re-opened`→`opened` in `corpus/lessons/round-87.md`.
- DD10 replace `Not retained:`→`Omitted:` in `.ufo/waves/round-86/lesson-proof/README.md`.

## 4. Calibration findings (no amendment proposed; all are attack surface)

1. **C1 clause escapes are the answer echo.** The four r87 legs have four grammar cases (three
   accept-attribute, one `stateAfter`) plus one per-leg page-event/files case each, and no case
   mutates
   `answer.setParams.backendNodeId`, outer `answer.files`, `answer.setResult` or `answer.setError`.
   Those three conjuncts are grammar-only; dropping them yields receipts the mutant counter calls
   clean (`0 findings`, exit 0) while the pristine counter refuses (`accept-grammar-law`).
2. **Battery kill power is expected-id + coverage power.** Whole-check neutralizations are caught
   because the expected id disappears and the coverage table reports it uncovered; row drops are
   caught by the sibling case of the same leg. Neither mechanism sees a dropped conjunct when the
   check still fires on the existing case mutations (S07/S08/S12), nor a narrowed comparison whose
   case mutation is refused by another check (S06, shadowed by `fixture-descriptors`; S09/S11/S19/
   S20/S23 shadowed by `leg-<name>` or another law).
3. **C2's conjuncts are token tests over whole documents.** Three live record defects are green on
   both pins: QUALITY 161's narrowing sentence, the round-86 search-log counts (`identified`/
   `screened`/`excluded` are not scoped to the entry), and the S221/S222 carried-not-reopened
   wording (ambient `carried` satisfies it). These are the same class as the routed defects the
   gate is supposed to count.
4. **The D5 directional count is defeated by the record's own description of the gate.** The
   corrections table quotes the regex pattern, so `count=true` even when the bullet's direction is
   reversed or its numbers are replaced (DD8, DD8L). Anchor the predicate to the bullet, or exclude
   the gate-description row.
5. **The D5 ledger pointer is textual.** `pointer` tests the ledger cell for `item 9`; `item` tests
   the §Narrowings section for `accept headline`. The two are not cross-bound: heading removal is
   caught (pristine DD7), but forcing `item=true` hides it (D07 survives under D5). Under D4 the
   same mutant was killed only because the BEFORE worktree's ledger cell says `item 1`; the D5
   pointer makes the BEFORE failure reason different, so the item conjunct loses its BEFORE kill.
6. **Equivalent/near-miss mutants are labeled, not counted as coverage.** S13 duplicates a row
   verbatim (no behavior); S11's clause is shadowed by the per-leg seq; D08/D12 are over-strict
   inversions killed by the clean leg. These are not evidence of battery strength.

## 5. Restoration evidence

- The lane's instrument hashes before and after: showpicker `6a2bb03b…` (= pin), battery
  `9883807a…` (= pin), drift `eea04278…` (= current pin). The pre-freeze drift byte
  `603fb587…` exists only in my scratch copy and was never written back.
- The scratch `bin/` copies still hash to `6a2bb03b…`, `9883807a…` and `603fb587…`.
- Restored detector runs: battery `209 / 0 failed / coverage 99/99 / exit 0`; pristine drift on the
  live snapshot lane `0`; pristine drift on the BEFORE worktree `5` with all five claims failed.
- No mutating git/jj command was run; the BEFORE worktree was read-only. No writes to
  `corpus/evidence/round87`, lane records, the fleet repo or a sibling lane.
- No tools were installed or upgraded. Scratch root removed at close.

## 6. Incidental observations (not mutant results)

- The 07:13 `claims.json` snapshot's C1 `countingCommand` carried the superseded D2 nonce
  `tabi-r87-l1-42a489b9d4be`; running it verbatim on the scored receipt gives exit 1 with
  `["nonce-expected"]`. The 07:25 re-freeze repaired it to the D3 nonce; the live claims file now
  carries `tabi-r87-l1-3dd4b0802d67`. The live lesson's corrections table row 1 records the fix.
- The 07:25 re-freeze changed `check-record-drift-r87.mjs` (603fb587 → eea04278) and
  `selftest-r87-gates.mjs` (→ 4346700a) and rewrote three lane records (lesson86, lesson87, ledger)
  while this sweep ran. The D4 tables above are bound to the pre-freeze snapshot; the D5 tables to
  the current one. The C1 instrument was untouched by the re-freeze.
