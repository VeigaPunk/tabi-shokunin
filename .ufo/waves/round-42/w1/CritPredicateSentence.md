# CritPredicateSentence — predicate sentence identity audit (tabi round 42, wave 1)

Leaf seat. No lane edits, no commits, no pushes, no agents. All writes are inside
`.ufo/waves/round-42/w1/CritPredicateSentence/` (plus the mandated trailer file
`.ufo/waves/round-42/w1/CritPredicateSentence.md`, identical content). Scratch repo for
the probe matrices lived at `/fast/scratch/hyaku/tabi-r42/CritPredicateSentence/` and was
deleted before yielding; all receipts were copied into this seat dir first.

Environment: `node --version` → `v26.12.0`; `git --version` → `git version 2.56.0`;
repo HEAD `0081bfdb93b6bd1bf2853bb128996f1a976b7218` (short `0081bfd`), unchanged since
2026-10-28 12:26:20 -0300 (`git reflog --date=iso`).

Axes named before starting: **sentence identity** (claims ↔ counter code ↔ receipt label),
**enforcement direction** (false-green admission vs false-red refusal), **instrument
provenance** (cited source vs primitive actually used).

---

## Task item 1 — C2 predicate vs checker header vs each code branch

Full predicate (1070 chars, `.ufo/waves/round-42/claims.json` `claims[C2].predicate`,
saved verbatim at `01-c2-predicate.txt`):

> At the measured revision the checker exits 0: (r1a) corpus/evidence/round41/playwright-egress/receipt.json is a committed blob of at least 1000 bytes whose sha256 equals receiptSha256 in the committed .ufo/waves/round-41/measure/c1-measure.json and whose bytes parse as JSON; (r1b) receipt.witness.json likewise equals witnessSha256 and parses; (r2) corpus/SOURCES.md at the revision carries row S148 whose teaches cell begins `supersedes S146` and whose remainder is a verbatim substring of the committed .ufo/waves/round-41/sources/node-cli-v24.21.0.html of at most 25 words, and row S146's status cell is `rejected`; (r3) .ufo/waves/round-41/controls/c1-baseline-noop.out is a committed nonempty blob recording the ls-tree counting command and the digit 0; (r4) .ufo/waves/round-42/quarantine/re-adjudication.tsv is committed with exactly the 38 identifiers of the committed .ufo/waves/round-42/quarantine/slice-ids.txt, no duplicates, every verdict in {present, absent, misbound, partial, unreachable}, and every evidence path a committed blob of at least 200 bytes.

Clause-by-clause result (checker = `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`,
header sentence at `03-checker-header-sentence.txt`):

| clause | implemented as stated? | drift, quoted |
|---|---|---|
| r1a | yes semantically; two unstated extras | header drops the word **blob** ("committed at REV, >=1000 bytes"); code also requires `typeof doc === 'object'` |
| r1b | **no (stricter)** | sentence: "receipt.witness.json likewise equals witnessSha256 and parses" — no size floor; code applies the same `size < 1000` branch to the witness (`r1b-too-small`), proven in P-F |
| r2 | yes; **separator hardcoded** | sentence: "whose remainder is a verbatim substring"; code strips only `/^supersedes S146\s*[—-]\s*/` and requires >=1 word; proven in P-H |
| r3 | **no (stricter)** | sentence: "committed nonempty blob"; code: `else if (size < 10) add('r3-baseline-file-empty', ...)`; proven in P-D |
| r4 | **no (weaker, false-green)** | sentence: "every evidence path a committed **blob** of at least 200 bytes"; code checks size only via `git cat-file -s` (line 61) and never `git cat-file -t`; proven in P-A |
| exits | yes | findings→1, clean→0, usage→2 |

### F1 (critical, false-green) — r4 accepts a git *tree* as "a committed blob"

`gitBlobSize()` uses `git cat-file -s <rev>:<path>`, which succeeds for trees. Proof in a
scratch repo (evidence `05-r4-and-sentence-drift-probes.json`):

```
$ git cat-file -t 2348276:evidence-dir   -> tree
$ git cat-file -s 2348276:evidence-dir   -> 720
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev 2348276… --repo <scratch> --json
P-A-evidence-directory-tree exit 0 predicate True findings None
```

while the control with a real 199-byte blob is refused:

```
$ git cat-file -t 39c57fa:thin.blob -> blob
$ git cat-file -s 39c57fa:thin.blob -> 199
P-B-control-evidence-199B-blob exit 1 predicate False findings ['r4-evidence-thin', …]
```

So a quarantine row may cite a *directory* with a >=200-byte tree object and r4 greens.
Reachability: `build-quarantine-tsv.mjs` emits file paths, but it is a helper, not a gate —
the TSV is whatever is committed, so a hand-written row (or a seat dir path such as
`.ufo/waves/round-42/w1/<seat>/`) passes. This is exactly the r39-class counter-proxy shape
for C2.

Smallest safe correction: verifier-level type check (`git cat-file -t <rev>:<path>` must be
`blob`) on every TSV evidence path before accepting r4; route the checker defect to round 43.
Do **not** amend the frozen checker this round (C2 kill rule: "No post-data predicate
amendment").

### F4/F5/F6 (moderate, false-red) — sentence is narrower than the code

* r3: `printf 'ls-tree 0'` is 9 bytes, nonempty, records the command token and a standalone
  `0` — the sentence's conditions hold, the checker refuses: `P-D-r3-nine-byte-ls-tree exit 1
  findings ['r3-baseline-file-empty']` (size 9). Code's floor is 10, sentence says
  "nonempty".
* r1b: a 461-byte witness with the correct digest — `P-F-r1b-461B-witness exit 1 findings
  ['r1b-too-small']`. The sentence states no floor for r1b.
* r2: replacing the cell separator with `:` — `P-H-r2-colon-separator exit 1 findings
  ['r2-quote-not-verbatim']`, although the remainder is a verbatim substring of the staged
  HTML. `P-I-control-emdash-restored exit 0 predicate True`.

All three are conservative (false red), so none greens a do-nothing; they break the identity
rule in the other direction. Smallest safe correction: record the extra bounds in the next
round's sentence (size floor for r1b/r3, the `—`/`-` separator for r2) instead of leaving
the code as an unstated superset; no amendment this round.

### F7 (minor, provenance) — S149 does not name the instrument R1/R4 use

Claims `restsOn`: "S149 (git-ls-tree documentation …) — the committed-bytes instrument this
checker's R1 and R4 checks are built on". The checker's primitives are `git show <rev>:<path>`
(line 56) and `git cat-file -s <rev>:<path>` (line 61); `git ls-tree` appears only as the
regex `/ls-tree/` inside the r3 control-text check (line 128). The staged copy
`.ufo/waves/round-42/sources/git-ls-tree.html` (sha256 `2c2983…`, matches the claims) does
not document `git show` (`grep -c 'git show'` → 0). The cited source does not document the
reading primitive used.

Smallest safe correction: cite the `git-show`/`git-cat-file` documentation for R1/R4 (or
change the sentence to name ls-tree and implement with ls-tree), next round.

### F8 (moderate, identity rule) — the third site is missing and the beforeState drifts

* The r37 rule is "one predicate must be the same sentence at three sites". Here the checker
  header is a **paraphrase** (e.g. it drops "blob" from r1a) and the checker's JSON output
  carries **no sentence at all** (`grep predicateSentence check-routed-defects-round42.mjs`
  → no match; output keys are `schema, rev, predicate, findingCount, findings`). The r41
  counter does echo `predicateSentence`, so the two instruments in this round are
  inconsistent about the label site.
* Claims `C2.beforeState` enumerates **5** finding ids; the committed red control
  `.ufo/waves/round-42/controls/c2-baseline-red.json` (in the 9b6de3a freeze tree) records
  **7**:

```
claims:  r1a-receipt-absent, r1b-witness-absent, r2-supersession-absent,
         r3-baseline-file-empty, r4-quarantine-absent
control: + r2-s146-not-rejected, + r4-slice-absent   (findingCount 7)
fresh run at 34e1779: findingCount 7, same seven ids (04-c2-checker-runs.json)
```

Smallest safe correction: echo the sentence in the checker output for the next instrument
(e.g. `predicateSentence` field), and quote the beforeState enumeration verbatim from the
committed control; no post-data amendment.

---

## Task item 2 — C1 inheritance from r41

Measured bytes (`02-c1-predicates.txt`):

```
v4 PREDICATE byte-equal to r41 claims predicate: True   (both 1221 chars)
r42 C1 === r41 C1: False
longest common substring (r42 C1, r41 C1): 'measure-c1-round41' (len 18)
```

r42 C1 predicate (716 chars), whole text:

> The counting command exits 0 on a fresh nonce with driver exit 0, counter exit 0, predicate true and empty findings AND the produced receipt.json and receipt.witness.json are committed at the measured revision AND node scripts/measure-c1-round41.mjs --battery reports all six cases pass (five contamination vectors exit 2 with environment-loader-contamination, clean probe exit 0) AND direct counter v4 replay of the committed r39, r40 and r41 receipts each refuses (nonzero exit) AND the round's validated policy-v2 wave settled with WAVE-DONE over at least 64 seats and no settled seat report demonstrates a do-nothing reach of this predicate (a forgery or counter hole that produces exit 0 without a browser run).

**Inherited verbatim: none.** No technical clause of the r41 sentence survives in the r42
sentence; the chain is inherited **by reference** through "predicate true and empty findings"
scored by counter v4, whose `PREDICATE` constant is byte-identical to the r41 claims
predicate (1221/1221).

**New in r42:** counting-command exit triad on a fresh nonce; commitment of receipt+witness at
the measured revision; the six-case `--battery`; replay refusal extended to the **r41** receipt
(the r41 sentence required only r39/r40); wave settlement `WAVE-DONE` over >=64 seats plus the
no-do-nothing-reach condition.

**Inherited clause NOT enforced by counter v4** (full table in
`09-c1-inheritance-and-labels.md`):

* "every sample carries a **refreshed** identity-bound owned tree" — there is no cross-sample
  comparison anywhere in `evaluate()`. Probe M1 gives every sample the identical `treePids`
  array: `M1-refresh-unenforced-identical-treePids exit 0 predicate true findings []`.
* "every pid startTicks **inside the run window**" — both window checks are guarded
  (`if (Number.isFinite(r.runStartTicks) && …)`), and nothing requires `runStartTicks` to
  exist. Probe M2 deletes it and sets every pid/root `startTicks: -999999`:
  `M2-runWindow-omitted-pid-startTicks-outside exit 0 predicate true findings []`.
* "the round-39 and round-40 receipts … are refused" — not implemented in `evaluate()` at
  all; the counter reads exactly one receipt file. It is done out-of-band by two separate
  control invocations (`c1-r39-replay-r42.exit=1`, `c1-r40-replay-r42.exit=1`).
  `grep -niE 'round-39|round40|replay' c1-session-bound-v4.mjs` matches only the PREDICATE
  string.
* "producer digests equal the frozen pins" — 3 of the 7 `frozenDigests` keys are checked
  (`playwright-firefox-egress-round41.mjs`, `measure-c1-round41.mjs`, `c1-session-bound-v4.mjs`);
  the four fixture/checker pins are never read; any key absent from the pins file is skipped
  (`if (digests[k])`); and the whole block is skipped when `--pins` is absent —
  `M4-no-pins-flag-digest-clause-skipped exit 0 predicate true findings []`.

Enforced as stated (probes/controls): two runs + env gate; 64-hex nonce carriage; >=8
strictly increasing samples and >=1000 ms span; ss/proc availability with positive ticks
including final sweep; >=1 owned socket observation per surface; all nonLoopback zero;
witness driver pid + firefox descendant on >=10 samples (M3 shows removing `nodePid` yields
both `witness-driver-unseen` and `witness-no-owned-firefox`); identical `firstShotSha256`;
zero survivors + closed port; bound `browserVersion`; summary agreement; wall-clock when
`--measure` is supplied.

### F2 (major, kill-rule trigger) — a fabricated receipt reaches exit 0 with no browser run

The r41 committed control `.ufo/waves/round-41/controls/c1-mutants.json` already records
`honest-positive exit 0 pass True got []`. That case is a receipt, witness and measure record
**written by the harness** (`mkReceipt`/`mkWitness`/`measureDoc` in `c1-mutants.mjs`); no
Firefox, no driver, no Playwright is spawned. I reproduced it (evidence
`06-counter-v4-conditional-clause-probes.json`, pins file = r41 claims minus `nodeSha256` so
the host's node version does not mask the result):

```
M0-honest-synthetic-positive              exit 0 predicate true findings []
M1-refresh-unenforced-identical-treePids  exit 0 predicate true findings []
M2-runWindow-omitted-pid-startTicks-outside exit 0 predicate true findings []
M4-no-pins-flag-digest-clause-skipped     exit 0 predicate true findings []
```

Under the frozen r42 C1 kill rule — "no settled seat report demonstrates a do-nothing reach of
this predicate (a forgery or counter hole that produces exit 0 without a browser run)" — this
seat demonstrates exactly that reach, on the inherited instrument, with the exact commands
above. The frozen text therefore refuses C1 admission as written.

Nuance to record honestly: the *counting command* path adds a driver spawn plus digest pins,
so a hand-written receipt cannot be injected through the wrapper; the counter hole matters
because counter v4 is the only judge of "predicate true" and it cannot distinguish a real
browser run from a structurally identical fabricated one (all "proof of browser" fields —
`browserVersion` string, `firstShotSha256` hex, firefox `exe` path in `treePids` — are
constants in the r41 harness).

Smallest safe correction: apply the frozen kill rule (no capability row, coverage holds,
route to round 43) — do not reword the predicate or kill rule post-data. For the next round,
the counter needs at least one leg a synthetic writer cannot fabricate (e.g. witness-bound
`/proc/<driver-pid>/net/tcp` inode equality with the driver's own snapshot, or a
per-sample monotonic uptime-tick chain that is inconsistent with wall clock).

### F3 (major, commitment — D1 recurrence at round 42)

```
$ git status --porcelain -- corpus/evidence/round42
?? corpus/evidence/round42/
$ git cat-file -e 0081bfdb93b6bd1bf2853bb128996f1a976b7218:corpus/evidence/round42/playwright-egress/receipt.json
fatal: path '...receipt.json' exists on disk, but not in '0081bfdb…'   (exit 128)
$ git log --all --oneline -- corpus/evidence/round42
(no commit ever contained the path)
```

Meanwhile `.ufo/waves/round-42/measure/c1-measure.json` **is** committed and records
`receiptSha256 3984455…`, `witnessSha256 163f4eb…`, `counter.predicate true`, `findings []`;
those shas equal the untracked files' actual shas (receipt 1,145,258 B, witness 1,122,212 B)
— evidence `08-commitment-gap-round42.md`. Commit `236c4f4` is titled "C1 live measurement
(predicate true, spans 16356/17790ms)" yet does not carry the bytes.

Consequence: the C1 clause "the produced receipt.json and receipt.witness.json are committed
at the measured revision" is false at audit time, and no frozen instrument checks it
(`causalSeparation` keeps C2 off round-42 receipts). This is the same shape as the round-41
verifier defect D1 that C2 is closing for the r41 receipt.

Smallest safe correction: commit exactly those two blobs (bytes unchanged, shas must equal
the committed measure record) before any C1 admission decision; otherwise refuse C1 under the
frozen kill rule.

### F9 (minor, label/settlement) — the settlement clause has no instrument

`WAVE-DONE` appears only in prose (claims, spec prompts, seat drafts). `w1-spec.json` has 64
items (matches "at least 64 seats"), but `w1-results.json` does not exist yet and
`.ufo/waves/round-42/parse-w1-results.mjs` neither emits nor checks `WAVE-DONE` and contains
no `64`. The clause is verifier judgement, not a counter; that is acceptable, but the claims
name no artifact for it, unlike every other clause.

---

## Task item 3 — receipt label schema (tabi-r42 paths) vs claims

Full table in `09-c1-inheritance-and-labels.md`. Summary:

* **C2 matches.** `countingCommand` path/flags are the real file (`counters/check-routed-defects-round42.mjs`,
  present in the 9b6de3a freeze tree); output schema `tabi-r42-routed-defects`; the red
  control path quoted in `beforeState` exists and is committed **at the freeze** with the same
  schema. Only the enumeration drift (F8) breaks the match.
* **C1 paths match, labels do not exist on the claims side.** The out path
  `corpus/evidence/round42/playwright-egress/receipt.json` and its derived witness name
  `receipt.witness.json` match the wrapper's `outPath.replace(/\.json$/, '.witness.json')`;
  the scratch root is under `tabi-r42`. But the artifacts carry r41 labels:
  receipt `tabi-pw-firefox-egress-receipt-r41`, witness `tabi-r41-witness`, measure
  `tabi-r41-c1-measure`, counter output `tabi-r41-c1-measured-v4`, battery
  `tabi-r41-battery`. The r42 claims declare **no** receipt schema string, so there is no
  third site to compare — the `tabi-r42` identity exists only at directory level for C1.
* **Freeze attribution.** `c1-baseline-tree-count.txt` is in 9b6de3a;
  `c1-r41-replay-refused.json` and `c1-battery-r42.json` (both cited by the C1 predicate/beforeState)
  were first committed in `236c4f4` at 12:23:38, after the freeze (12:07:26) and after the
  spec/dispatch artifacts (12:19-12:20), though before any seat result. Paths resolve today;
  their "pre-data" status holds only from `236c4f4`.

---

## Checker state observed (all read-only)

| rev | command | exit | findings |
|---|---|---|---|
| `34e1779` (baseline) | `node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev 34e1779… --repo <lane> --json` | 1 | 7 (see F8) |
| `9b6de3a` (freeze) | same | 1 | `r4-quarantine-absent` |
| `0081bfd` (HEAD) | same | 1 | `r4-quarantine-absent` |

The freeze/HEAD state matches the assignment ("only r4 still red, by design"). C2's *sentence*
still contains the r4 type hole (F1), so closing r4 with the sanctioned builder (file paths)
is safe, but the checker alone does not prove the evidence is a blob.

---

## Evidence files (this seat dir)

| file | content |
|---|---|
| `01-c2-predicate.txt` | C2 predicate verbatim with length (1070) |
| `02-c1-predicates.txt` | r42 C1 (716) vs r41 C1 (1221), byte-equality and longest-common-substring results |
| `03-checker-header-sentence.txt` | checker header sentence block as committed |
| `04-c2-checker-runs.json` | exact command + stdout + exit for baseline, freeze, HEAD |
| `05-r4-and-sentence-drift-probes.json` | P-A…P-I scratch-repo matrix: tree evidence greens; blob control; 9-byte r3; 461-byte witness; colon r2; all restores green |
| `06-counter-v4-conditional-clause-probes.json` | M0-M4 counter v4 probes (synthetic receipt/witness/measure, no browser) |
| `07-labels-beforeState-instruments.txt` | claims beforeState vs control vs fresh run; freeze-tree membership; first-commit of cited controls; battery summary; WAVE-DONE instrument search |
| `08-commitment-gap-round42.md` | untracked receipt/witness vs committed measure record, shas, commit message, env |
| `09-c1-inheritance-and-labels.md` | 15-clause enforcement table, composed r42 clause table, label/schema table |

## Limitations

* No amendment proposed or applied; everything above is a routed finding.
* The r4 tree probe uses a synthetic scratch git repo (allowed scratch root); the checker
  binary and the production tree were only read. The lane repo was never written, committed,
  or fetched.
* Counter probes M0-M2/M4 used a pins copy without `nodeSha256` (host node v26.12.0 is not the
  pinned fnm v24.21.0). The three producer-file digests and the firefox binary pin were still
  enforced in those runs. M0 with the untouched pins returns only `digest-mismatch:node`,
  which is an environment artefact, not a receipt defect.
* No browser was launched by this seat (loopback/local only).
* One earlier `git ls-tree -r --name-only HEAD -- corpus/evidence/round42` printed the two
  receipt paths, while the same command later printed nothing with HEAD unchanged at
  `0081bfd` since 12:26:20; the reproducible checks (`git status`, `git cat-file -e`,
  `git log --all`) all show the path is untracked, and F3 rests only on those.

VERDICT finding
