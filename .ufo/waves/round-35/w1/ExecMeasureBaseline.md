# ExecMeasureBaseline — round-35 w1: the frozen measurement at the freeze

Seat: ExecMeasureBaseline (leaf). Milestone C1. Freeze `a4bfef0f75027c915e715649950b1d46dcb33d83`,
baseline `2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684`. Nothing in the lane was edited; findings only.

## Verdict

The frozen measurement ran once at the freeze in a clean `--shared` clone and produced exactly the
pre-registered before-state on both claims, with no unexplained line. **C1**: 383 candidates, mapped 0,
screened 0, unaccounted 383, newMapped 0, adjacency clean 16/16, predicate false — the output is
byte-identical to the do-nothing control `baseline/c1-J1-do-nothing.json` apart from `rev`. **C2**:
population 0, `entryFinding: e1-entry-absent`, predicate false, byte-identical to
`baseline/c2-J1-do-nothing.json` apart from `rev`; because the counter returns before the live leg, this
measurement starts **no browser at all** — the only Firefox/geckodriver evidence it records is the
`--version`/sha256 pair in provenance. All five frozen digests match `claims.json` `frozenDigests` when
read back from both the worktree and the freeze commit. All 28 no-harm lines exit 0, the round-34 C2
counter keeps 20/20 killed, and `check-selfassessment` reports `mismatches 0` (`clean: true`). Four lines
are not exit 0: `c1` and `c2` (the expected false predicates), plus `r34-c1` and `r33-c1`, whose exit is
their **historical** `NEW_TARGET`, not the "unaccounted stays 0" property they are labelled with — that
property holds in both (unaccounted 0, `screenFindings []`). `measure.sh` has eight defects, one
material: it has **no failure path** (`set -u -o pipefail` without `-e`, no `||` after the checkout, a
final `echo`), so an unresolvable REV silently measures the branch tip and the script still exits 0.

## 1. Command and result

```
HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r35/ExecMeasureBaseline-h \
  /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/measure.sh \
  a4bfef0f75027c915e715649950b1d46dcb33d83 \
  /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ExecMeasureBaseline/measure-at-freeze \
  a4bfef0f75027c915e715649950b1d46dcb33d83
```
Wall 168.9 s, `MEASURE_EXIT=0` (that 0 is the script's last `echo`, see D1). No tool was installed or
upgraded for this seat; no pacman transaction was made.

## 2. Provenance (`measure-at-freeze/provenance-a4bfef0.txt`)

| line | value | vs claim |
|---|---|---|
| `rev=` / `freeze=` | `a4bfef0…d83` / `a4bfef0…d83` | equal, as requested |
| `porcelain=` | `0` | clone clean (but see D4: read before any counter) |
| c1 counter freeze / at-rev | `5707a937…b436b9` / same | = `claims.frozenDigests` c1 |
| c2 counter freeze / at-rev | `7cc7f17f…9cd954e` / same | = `claims.frozenDigests` c2 |
| `scripts/check-adjacency.mjs` | `4e2c2a64…92324aac` | = claims pin (c1) |
| `scripts/check-bidi-runtime.mjs` | `370e8e95…db7d86c87` | = claims pin (c2) |
| `scripts/check-selfassessment.mjs` | `77b5c8ed…b6d4c6a9` | informational |
| firefox | `Mozilla Firefox 158.0.1`, `firefox-bin` `46e2c204…6e7294` | as named in the item |
| geckodriver | `geckodriver 0.37.1 (300705c65d1b 2026-07-17)`, `f831b7e6…51f6e39f` | as named in the item |

Digests re-read by hand from the lane (`sha256sum` in the worktree and `git show a4bfef0:<path> |
sha256sum`), because `measure.sh` prints them but asserts nothing (D5): c1 `5707a937…`, c2
`7cc7f17f…`, `check-adjacency` `4e2c2a64…`, `check-bidi-runtime` `370e8e95…`, `controls.mjs`
`32c0f6bc…`, `measure.sh` itself `1fdbe8c4…` — all six equal `claims.json` `frozenDigests`.

## 3. C1 at the freeze (`c1-at-a4bfef0.json`, `c1-at-a4bfef0.stderr` 0 bytes, exit 1)

`candidates 383 · priorCandidatesSkipped 22 · mapped 0 · screened 0 · unaccounted 383 · newMapped 0 ·
screenFindings [] · adjacency {verdict clean, rows 16, verified 16, findings 0} · adjGateSha256
4e2c2a64… · perLane {kaidoku 137, kumitate 66, kagi 56, kake 51, kotoba 20, mado 20, tsukuroi 20, kama
9, mori 2, chousa 1, tameshi 1} · predicate false`. Matches the item's expectation and `claims.C1.before`
exactly.

Two independent checks beyond the counter's own output:

* `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --list-candidates --repo <clone> --fleet
  /home/vgpnk/Projects/shokunin` → 383 lines, `diff` against the frozen
  `baseline/c1-candidates.tsv` → **0 differences, exit 0** (`recheck-candidates-at-freeze.tsv` is that
  output, copied into the measurement dir).
* A standalone re-implementation of the counter's derivation over the frozen `PINS` (BG regex,
  `\btabi\b` exclusion, prior set keyed `lane\0path\0text` from
  `.ufo/waves/round-34/baseline/c1-candidates.tsv` column 3): **405** sibling SKILL.md /
  corpus/knowledge lines match BG and do not name tabi; **22** of them are in the round-34 prior set;
  405 − 22 = **383** with no duplicates. The claims' "minus the 67 round-34 candidates" names the input
  set; the actual intersection is 22 (the other 45 fall outside the v3 universe because they name tabi or
  carry no BG term). The residual count agrees with the claim and with the frozen TSV.

Equality to the control: `strip(rev)` of `c1-at-a4bfef0.json` **equals** `baseline/c1-J1-do-nothing.json`
(`byte-identical apart from rev: true`), i.e. the freeze added no map row and no screen row.

## 4. C2 at the freeze (`c2-at-a4bfef0.json`, stderr 0 bytes, exit 1)

`population 0 · admitted 0 · failing 0 · unmeasured 0 · entryFinding e1-entry-absent · entryDetail null ·
receiptFinding null · binding null · provenance [] · live null · rows [] · predicate false`. Exactly the
item's expectation, and `strip(rev)` equals `baseline/c2-J1-do-nothing.json`.

The early return is `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs:342`
(`if (entryBuf === null) { out.entryFinding = 'e1-entry-absent'; … return out; }`), so **no geckodriver or
Firefox process starts at the freeze**. That is by design, but it means this measurement cannot detect a
broken geckodriver↔Firefox handshake, a bad `--websocket-port` bind, or a `captureScreenshot` regression:
the first real Firefox exercise happens only once `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`
exists (C2 seats own that). `ps` after the run found no geckodriver/firefox of this seat.

## 5. No-harm counters and gates

| line | exit | reading |
|---|---|---|
| `r34-c1` | **1** | unaccounted **0**, `screenFindings []`, newMapped **1** < `NEW_TARGET 3` (`.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs:71`) → the property in the label holds; the exit is the historical target |
| `r34-c2` | 0 | killed 20/20 (M01–M19 + M01b), survivors 0, unappliable 0, pristine selftest clean, `predicate true` |
| `r33-c1` | **1** | unaccounted **0**, `screenFindings []`, newMapped **3** < `NEW_TARGET 4` (`.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:64`) → same pattern |
| `selfassessment` | 0 | `mismatches 0`, `clean true`, 232 findings of which 48 `superseded`, `couldNotEvaluate 116` |
| `noharm-*.txt` | 0 ×28 | 10 explicit gates + 18 self-tests, all exit 0; highlights: `ADJACENCY verdict=clean rows=16 verified=16`, `GATE_REGISTRY … rows=42 gates=22 nonconformant=0`, `RELEASE_PINS … population=23 resolved=23 unresolved=0 holds=16 drifted=7`, `S106_EVIDENCE … valid=true`, `FRONTIER_ADMISSION … clean`, `DECISION_TABLE clean`, `BIDI_RUNTIME verdict=clean population=17`, `SOURCES_GATE rows=133 findings=0`, `sources-census validate … ok`, self-test case counts 57/17/56/34/12/24/12/22/76/29/38/10/41/18/26/45/13 |

`numstat-at-a4bfef0.txt`: `13 0 LOG.md`, `36 0 SCORECARD.md` — 0 deletions on every listed append-only
surface between baseline and freeze.

## 6. Defects in `measure.sh` (findings only; the file was not edited, digest `1fdbe8c4…` unchanged)

**D1 (material) — the script cannot report failure.** `measure.sh:4` is `set -u -o pipefail` (no `-e`);
`measure.sh:11` is `git clone -q --shared "$LANE" "$d" && git -C "$d" checkout -q --detach "$REV"` with
no `||`; `measure.sh:58` is `echo "measured $short"`. Reproduced the checkout path in scratch:
`git clone --shared` → `clone_rc=0`, `git checkout -q --detach 0123…456789` → `checkout_rc=128`,
`head_after_failed_checkout=a4bfef0…` (the tip is kept). The script would then run every counter against
the tip, write files named for the tip, print `measured a4bfef0`, and exit 0. This run itself shows the
same blindness: four inner lines carry `exit=1` and `MEASURE_EXIT=0`. The only tell is provenance line 1
(`rev=`), i.e. a human comparison, not a check.

**D2 — scratch path is shared by construction.** `measure.sh:8`
`S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r35/L1/m` and `measure.sh:9` `rm -rf -- "$S"` delete a path
derived from neither `REV`, `OUT` nor the seat. Two seats handed the same `HYAKU_SCRATCH` destroy each
other's clone mid-run. This seat avoided it only by passing a private
`HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r35/ExecMeasureBaseline-h`, which the script then nests as
`…/ExecMeasureBaseline-h/tabi-r35/L1/m` instead of the contract's `$HYAKU_SCRATCH/tabi-r35/<seat>/`.

**D3 — the trap leaves a tree behind.** `measure.sh:10` `trap 'rm -rf -- "$S"' EXIT` removes only `$S`;
after the run `find /fast/scratch/hyaku/tabi-r35/ExecMeasureBaseline-h` still printed
`…/ExecMeasureBaseline-h/tabi-r35/L1` (two empty directories). A run therefore leaves a husk on disk every
time.

**D4 — the porcelain check cannot fail.** `measure.sh:26`
`porcelain=$(git -C "$d" status --porcelain | wc -l)` runs inside the provenance block that closes before
the first counter (`measure.sh:32`), on a tree the script just cloned: it is 0 by construction. Nothing
re-checks the clone (or the lane worktree) after the counters, so a counter that wrote into the clone or
into the lane would pass this measurement unnoticed.

**D5 — the frozen-counter copy is unasserted.** `measure.sh:21-22`
`git -C "$LANE" show "$FREEZE:$f" > "$S/k/$f"` has no `-e`, no non-empty test and no digest test. A wrong
`FREEZE` path writes a 0-byte file; `node` on an empty `.mjs` exits 0 (measured here:
`empty_js_exit=0`), so the provenance would read `c1 exit=0` next to a 0-byte JSON. The equality with
`claims.json` `frozenDigests` is only printed, never asserted — I checked all five by hand (§2).

**D6 — two no-harm labels do not describe their exit.** `measure.sh:34` and `measure.sh:36` label
`r34-c1`/`r33-c1` "no-harm: unaccounted stays 0" but print the counters' full predicate exit, which is
hardwired to 1 because `NEW_TARGET` (3 and 4) already exceeded `newMapped` (1 and 3) at their own rounds.
The line can never be green and cannot distinguish `unaccounted 0` from a regression: a no-harm line
should read the JSON field (`unaccounted`, `screenFindings`) rather than the exit code.

**D7 — the self-test set can silently shrink.** `measure.sh:52-53` discovers the flag with
`grep -oE -- '--self-?test' "$g" | head -1` and `[ -n "$f" ] || continue`: a gate that loses its self-test
drops out of the no-harm set instead of failing, and the first textual occurrence is used even if it sits
in prose. Latent this round only — all 17 `scripts/check-*.mjs` plus `scripts/round-evidence-audit.mjs`
carried a flag and produced the 18 self-test lines.

**D8 — the append-only diff surface misses the two new trees.** `measure.sh:57` names
`corpus/adjacency-screen.tsv` and `corpus/adjacency-screen-skill.tsv` but not the new
`corpus/adjacency-screen-browser.tsv`, and no `corpus/evidence/**`. Deletions in the C1 screen ledger or in
the C2 receipt/transcripts are therefore outside the diff half of the no-harm rule (they are still
content-checked: the C1 counter re-parses every screen row, the C2 counter re-hashes every receipt file).

Checked and clean on the item's specific concerns: every counter that accepts `--repo` receives it
(`measure.sh:32-36`); the gates run with cwd `$d` and the census gets an absolute `--file`
(`measure.sh:39-51`), so no `--repo` is missing; the string `/tmp` appears nowhere in the script and
`TMPDIR` is exported at line 9 before the first child at line 11, so this measurement wrote no `/tmp`
file; every referenced path exists at the freeze (all gates, both counters, all three prior counters, both
entries and both binaries produced output or a thin version line).

## 7. What this run does not establish

* No browser ran (§4), so Firefox BiDi operability on this host is untested by the freeze measurement.
* The tie between the counter's live candidate derivation and the frozen `c1-candidates.tsv` is not part
  of `measure.sh`; I checked it separately (`diff` 0, §3).
* Control reachability (J2–J8, the J8 forgery path) is frozen in `baseline/`; I did not re-run the
  controls, so this report adds nothing to or against `feasibilityDisclosed`.

## 8. Command ledger

```
measure.sh a4bfef0f… <OUT> a4bfef0f…                                  exit 0 (MEASURE_EXIT=0; inner: c1 1, c2 1, r34c1 1, r34c2 0, r33c1 1, selfassessment 0)
sha256sum .ufo/…/measure.sh, both counters; git show a4bfef0:<path>|sha256sum   exit 0, digests equal claims.json
git clone --shared lane <scratch>/clone; checkout --detach a4bfef0; toplevel assert   exit 0
c1-adjacency-sweep-v3.mjs --list-candidates --repo <clone> --fleet …  exit 0, 383 lines
diff <(sort list.tsv) <(sort baseline/c1-candidates.tsv)               exit 0, 0 differences
node <counter> (import) candidates(fleet, clone)                      printed 383 / priorSkipped 22
standalone PINS/BG/prior replication                                  405 BG-non-tabi lines, 22 prior, 383
git clone + git checkout --detach 0123…456789 (failure path)          clone_rc=0, checkout_rc=128, HEAD unchanged
node <empty>.mjs                                                      empty_js_exit=0
J1 comparison (c1 and c2 json vs baseline/c1-J1, c2-J1)                identical apart from rev
ps -eo pid,args | grep geckodriver|firefox-158                          no process of this seat
```

## 9. Deliverables

* This report: `.ufo/waves/round-35/w1/ExecMeasureBaseline.md`.
* Measurement outputs (written by `measure.sh`, unmodified):
  `.ufo/waves/round-35/w1/ExecMeasureBaseline/measure-at-freeze/` —
  `provenance-a4bfef0.txt`, `c1-at-a4bfef0.json`, `c2-at-a4bfef0.json`, `r34c1-at-a4bfef0.json`,
  `r34c2-at-a4bfef0.json`, `r33c1-at-a4bfef0.json`, `selfassessment-at-a4bfef0.json`,
  `noharm-at-a4bfef0.txt`, `numstat-at-a4bfef0.txt`, five `*.stderr` (all 0 bytes).
* Added by this seat: `recheck-candidates-at-freeze.tsv` (the counter's `--list-candidates` output, 383
  lines, byte-equal to `baseline/c1-candidates.tsv`) — a re-derivation, not a measurement output.
* Scratch `/fast/scratch/hyaku/tabi-r35/ExecMeasureBaseline/` and `…/ExecMeasureBaseline-h/` deleted
  before yield; no lane file, lane index, jj state, fleet file or sibling repo touched.
