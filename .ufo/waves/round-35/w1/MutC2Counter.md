# MutC2Counter — round 35 w1 mutation report

Seat: MutC2Counter-4 (leaf, no subagent dispatch). Target: the frozen C2 counter
`.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` at freeze a4bfef0f75027c915e715649950b1d46dcb33d83
(sha256 7cc7f17fa0a86355b582f506af619dd2807e925fe836fe39e95a436d59cd954e).
Detector: the frozen control battery `.ufo/waves/round-35/baseline/controls.mjs`
(sha256 32c0f6bc17060d9d71550961c5783b5293a08610760355fc81db22da7533d8b1), re-run inside
scratch clones of the freeze commit, exactly as the assignment specifies
(`TMPDIR=<scratch>/ctl node .ufo/waves/round-35/baseline/controls.mjs` inside the clone).

## Verdict (one paragraph)

The frozen controls fail to exercise thirteen of the counter's clauses: single-point removal of the
`browserName` check, the `moz:geckodriverVersion` capability check, the ws-url session-segment check,
the transcript path-distinct check, the s1 `!regThen.has(id)` registry exclusion, the `failing == 0`
predicate conjunct, the `TARGET` threshold (14), the transcript-content sha check, the binding
geckodriverVersion-live comparison, the cross-run sessionId-distinct check, the browsing-context UUID
filter, the fixtureSha256 check, and the entry-absent refusal — each leaves every control outcome byte-
identical (survived, unguarded). The live first-screenshot comparison is the only clause whose removal
lets a control forgery through: with it removed, control J3 (relabelled Chromium) flips from refused
(exit 1, predicate false) to fully admitted (exit 0, predicate true, admitted 16/16, failing 0) —
killed by J3 only. The UUID-shape check and the transcript sha-distinct check are each backed by a
second catcher in the same fixtures (browserName; sessionId shape), so their removal only softens the
refusal message. Two frozen-counter/claim discrepancies are reported: (1) the frozen counter uses
`TARGET = 14` while the frozen claim predicate (claims.json:162) says `admitted >= 16` — the counter
is weaker than its claim; (2) the C1 controls could not reproduce the frozen adjacency "clean" verdict
under the sandbox fleet view (the adjacency gate requires non-symlink sibling toplevels), which does
not affect any C2 verdict. The lane copy was never modified (sha unchanged, 7cc7f17f…); every mutant
clone's counter was restored to the frozen bytes before deletion.

## Method and commands (all exit codes PC)

```text
# frozen digest verification (git show <freeze>:<path> | sha256sum), all matched claims.json frozenDigests
# scratch clone: git clone -q --shared <lane> $S/clone-<m>; git -C $S/clone-<m> checkout -q --detach a4bfef0...
#   $S=/fast/scratch/hyaku/tabi-r35/MutC2Counter; toplevel verified == clone dir on every clone
# fleet view for C1 controls (read-only symlinks under $S to the 21 real sibling lanes):
#   node <clone>/.../c1-adjacency-sweep-v3.mjs --list-candidates --repo <clone> --fleet $S -> LIST_EXIT=0
#   diff <list> vs frozen baseline/c1-candidates.tsv -> CANDIDATES_MATCH_FROZEN (383 lines, byte-identical)
# pristine run:  TMPDIR=$S/ctl-pristine node <clone>/.../baseline/controls.mjs; PRISTINE_EXIT=0 (23.65s)
# mutant runs:   TMPDIR=$S/ctl-<m> node <clone-<m>>/.../baseline/controls.mjs; m<k>_exit=0 for all 17 (29-37s each)
# comparison:    node $S/compare.mjs <ref-baseline> <mut-baseline> c2-J1..J5
#                (projects receipts to deterministic fields; sessionIds/context-UUIDs/revs excluded)
# restore demo:  git -C $S/clone-m7 checkout -q -- .ufo/waves/round-35/counters/c2-firefox-bidi.mjs
#                -> sha256 7cc7f17f... (frozen bytes restored)
# lane copy:     sha256sum <lane>/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs = 7cc7f17f... (before and after; untouched)
# stray browsers: pgrep -af (my scratch profile roots) -> NO_STRAY_BROWSER_PROCESSES
```

The pristine run reproduced every frozen C2 control summary exactly: J1 `e1-entry-absent`, J2
`run1: sessionId is not geckodriver-shaped (UUID)`, J3 binding `first screenshot differs from this
counter's live session`, J4 `transcript sha256 repeated across runs`, J5 `driver imports this counter`;
live first-shot 7a3ae6a9… (Firefox headless rendering deterministic on this host), 28 cmds / 20
events.

## Mutant table

Each mutant = one single-point edit in a scratch clone of the frozen counter. `killed-by` = control
whose outcome **flipped** to accept (exit 1→0 / predicate false→true). `changed` = outcome changed but
still refused (new refusal message). `survived` = all five controls byte-identical to pristine.

| mutant | clause edited (line at freeze) | before→after sha256 | J1 | J2 | J3 | J4 | J5 | verdict |
|---|---|---|---|---|---|---|---|---|---|
| m1 | UUID regex loosened to `/.+/` (const UUID, :81) | 7cc7…→cfec9a… | SAME | changed | SAME | SAME | SAME | changed, still refused (browserName now catches J2) |
| m2 | `browserName !== 'firefox'` check removed (:301) | 7cc7…→3dcaf5… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m3 | `moz:geckodriverVersion` capability check removed (:302) | 7cc7…→9606e6… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m4 | ws-url session-segment equality removed (:305) | 7cc7…→4cb19d… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m5 | transcript sha-distinct check removed (:399) | 7cc7…→40c4d5… | SAME | SAME | SAME | changed | SAME | changed, still refused (J4 now caught by sessionId shape) |
| m6 | transcript path-distinct check removed (:398) | 7cc7…→8000c4… | SAME | SAME | SAME | SAME | SAME | **survived** (fully redundant: sha-distinct + sids hold) |
| m7 | live first-screenshot comparison removed (:432) | 7cc7…→0f91d0… | SAME | SAME | **flip** | SAME | SAME | **killed-by J3** (admitted 16/16, failing 0, exit 0) |
| m8 | driverFinding returns null (:161) | 7cc7…→4a9a16… | SAME | SAME | SAME | SAME | changed | changed, still refused (J5 now caught by sessionId shape) |
| m9 | s1 `!regThen.has(id)` removed (:359) | 7cc7…→a64a75… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m10 | `failing === 0` conjunct dropped (:462) | 7cc7…→745339c8… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m11 | TARGET 14→1 (:77) | 7cc7…→b98ba5… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m12 | transcript-content sha check disabled (:394) | 7cc7…→e85becd… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m13 | binding geckodriverVersion-live comparison removed (:433) | 7cc7…→c007a1… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m14 | cross-run sessionId-distinct check removed (:410) | 7cc7…→be48c8… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m15 | browsing-context UUID filter disabled (:405) | 7cc7…→d232a7… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m16 | receipt fixtureSha256 check removed (:378) | 7cc7…→0df9cc4… | SAME | SAME | SAME | SAME | SAME | **survived** |
| m17 | entry-absent early return removed (:342) | 7cc7…→1778e1… | changed | SAME | SAME | SAME | SAME | changed, still refused (J1 refusals now `s1-source-row` + `receipt absent`) |

(`changed` rows' receipts are in the output dir; each shows exit 1 / predicate false.)

## Clauses no control guards

Empirically survived (mutants above): browserName shape (m2), moz:geckodriverVersion presence (m3),
ws-url session-segment (m4), transcript path-distinct (m6), s1 registry-new exclusion (m9),
failing==0 conjunct (m10), TARGET threshold (m11), transcript-content sha integrity (m12), binding
gdv-live (m13), cross-run sessionId distinctness (m14), context-id UUID shape (m15), fixtureSha256
(m16), entry-absent refusal (m17 — only softened by J1, never exercised by J2-J5).

Reasoned-only (not empirically mutated; single-point mutants on these were not part of the assigned
probe set): receipt `schema` string check; driver path == gate/counter path check; driver byte-copy
of gate/counter check; entry row checks x1-unknown / x3-duplicate / x2-R16-no-counterpart /
x4-measured-cell; `MEASURED` cell regex; `HEX64` + host-match on lesson `## Gate` rows; the
`source:` line S-id extraction; the live-leg `Refusal` rethrow; the receipt `browserVersion` field
type check. Each is a clause the five frozen controls cannot currently observe (J1 has no entry; J2-J5
all violate earlier checks first).

Only the **live first-screenshot comparison** (m7) and (in soft form) the **UUID shape check** (m1)
and the **transcript sha-distinct check** (m5) are load-bearing in the frozen battery.

## Findings

1. **Frozen counter vs frozen claim mismatch**: the counter's `TARGET = 14` (line 77; header comment
   "admitted >= 14") vs claims.json C2 predicate "admitted >= 16" (claims.json:162) and target
   "admitted 16 of 16". The counter would pass with 14 or 15 admitted rows (e.g. two rows flaking to
   unmeasured `no`), which the frozen claim forbids. Not mine to change; flagged for L1.
2. **C1 canary limitation**: under the sandbox fleet view (symlinks), the C1 controls report
   `adjacency: failed` (verified 0, findings 21) instead of frozen `clean` — the adjacency gate
   requires non-symlink sibling toplevels under the fleet root. C1 receipts were invariant across all
   17 mutant runs (same fleet view), so C2 deltas are unaffected. If a C1 verdict is needed in this
   seat's outputs, rerun with a real siblings fleet layout.
3. **Live leg determinism**: Firefox headless first-shot sha 7a3ae6a9… reproduced across every run
   (pristine + all mutants), consistent with the frozen instrument check (c2-instrument-check.json).
4. Controls' hardening depth: the duplicate-run control (J4) is caught by three stacked checks
   (sha-distinct, path-distinct, sessionId-distinct); removing any single one leaves J4 refused by a
   later check — but the J4 fixture's transcripts are Chromium-shaped, so those later checks are the
   same ones that catch J2/J5, i.e. the stacked redundancy is not independent.

## Restoration evidence

- Mutated counter files (17 clones): before sha 7cc7f17f… everywhere; after-shas in the table.
  Restored in-clone via `git checkout` → sha256 7cc7f17f… (demo on clone-m7 after its run).
- Lane copy: sha256 7cc7f17f… before and after all work (never written).
- Scratch `/fast/scratch/hyaku/tabi-r35/MutC2Counter` removed after copying receipts (below).

## Deliverables (output dir)

- `.ufo/waves/round-35/w1/MutC2Counter/mutant-summary.tsv` — machine-readable per-control table.
- `.ufo/waves/round-35/w1/MutC2Counter/receipts/` — all c2-J1..J5 receipts (json/provenance/stderr)
  per mutant (`m<k>-c2-J*.{json,provenance,stderr}`) plus pristine copies (`pristine-c2-J*`).
- This report.
