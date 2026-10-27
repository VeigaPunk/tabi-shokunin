# LabratC1 — round 37 w1 probe: v5's diagnostic read paths

**Seat:** `LabratC1` (executor, milestone C1, axis calibration) · **lane:** tabi ·
**freeze:** `99437d29de036415a9f2d0524343617a3b19988a` · **counter under test:**
`.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs`

## Verdict

`VERDICT finding — CONFIRMED with a positive measurement. v5's --list-delta/--list-drift resolve the
delta pins from lane HEAD or from the ON-DISK worktree file with NO digest binding (v5 lines
606-628), while the predicate path binds the same file at REV (lines 385-389, 587). Measured on a
fixture that repoints one delta head to a commit carrying new browser-ground lines: --list-delta
printed 2 unfrozen rows (CDP / musketeer lines) where the frozen reading is 0, and --list-drift
printed 363 rows where the frozen reading is 307 — exit 0, no warning, on BOTH unbound read paths
(HEAD blob and the on-disk cat fallback). The list modes are strictly DISPLAY: an instrumented
marker at the top of evaluate() never fires on them (they process.exit(0) at line 627, before
evaluate() is called at line 630), so C1's predicate is unaffected and the frozen kill rule is not
tripped. The routed defect is the counter header's FALSE claim ("the lane at --rev", "git objects
only", "at REV" — lines 42-45) plus the missing binding on two of three entry points. The L1 should
either bind the list modes to the same digest or document them as unbound diagnostics; and the
JSON.parse on line 614 needs a Refusal wrapper (a corrupt/absent pins file currently exits 1 with an
uncaught SyntaxError instead of the documented exit 2).`

Severity: **low-to-moderate, display-only** for the C1 predicate; **real** for any caller that
treats a list mode's output as evidence (the round-37 `ExecSelftest` seat's expected counts
`383 / 307 / 0` come from exactly these modes).

---

## 1. What the probe tested

Hypothesis (from the dispatch): *v5's `--list-delta`/`--list-drift` modes read the delta pins from
lane HEAD or the on-disk file WITHOUT the digest binding, so a caller could be misled by unfrozen
pins in a display context.*

Three sub-questions:
1. Does `--list-delta`/`--list-drift` list using unfrozen bytes?
2. Does any predicate evaluation use these modes (read `evaluate()`'s code path), or are they
   strictly display?
3. Verdict: acceptable display-only divergence (documented in the counter header) or a routed
   defect requiring the L1 to bind the list modes too?

## 2. Code lines quoted (frozen bytes, `sha256 9c6289b7…752c` = `claims.json:frozenDigests.c1`)

Counter bytes taken with `git show 99437d29…:.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs`;
`node --check` exit 0; digest verified equal to `claims.json frozenDigests.c1`.

**The predicate path IS digest-bound** (lines 384-397):

```
384:  // ---- delta pins (frozen heads) ----
385:  const pinsBuf = blob(lane, REV, DELTA_PINS_PATH);
386:  if (pinsBuf === null) throw new Refusal(`${DELTA_PINS_PATH} absent at ${REV}`);
387:  // B1: the pins file is bound to its frozen digest at REV.
388:  const pinsDigest = sha256(pinsBuf);
389:  if (pinsDigest !== DELTA_PINS_SHA256) throw new Refusal(`${DELTA_PINS_PATH} at ${REV} sha256 ${pinsDigest} != frozen ${DELTA_PINS_SHA256}`);
```

and the predicate term itself (line 587): `&& pinsDigest === DELTA_PINS_SHA256;`

**The list modes are NOT** (lines 606-628) — note there is **no `sha256`, no `DELTA_PINS_SHA256`,
and no `REV`** anywhere in this block:

```
606:    if (o.list) { for (const c of candidates(o.fleet, lane)) console.log(`${c.key}\t${c.text.trim()}`); process.exit(0); }
607:    if (o.listDelta || o.listDrift) {
608:      const headRev = git(lane, ['rev-parse', 'HEAD']).stdout.toString('utf8').trim();
609:      let pinsBuf = blob(lane, headRev, DELTA_PINS_PATH, { optional: true });
610:      if (pinsBuf === null) {
611:        try { pinsBuf = spawnSync('cat', [join(lane, DELTA_PINS_PATH)], { encoding: 'buffer' }).stdout; } catch { /* below */ }
612:      }
613:      if (pinsBuf === null) throw new Refusal(`${DELTA_PINS_PATH} absent at lane HEAD and on disk`);
614:      const deltaPins = JSON.parse(pinsBuf.toString('utf8'));
615:      if (o.listDelta) {
616:        for (const c of deltaCandidates(o.fleet, deltaPins)) console.log(`${c.key}\t${c.text.trim()}`);
617:      } else {
618:        const drifted = new Set(Object.entries(deltaPins).filter(([sib, head]) => head !== PINS[sib]).map(([sib]) => sib));
619:        const sb = blob(lane, headRev, SCREEN);
...
627:      process.exit(0);
628:    }
```

Two independent unbound reads:
- **line 608-609** — `HEAD` of the lane, not `--rev`: `git rev-parse HEAD` then
  `git show HEAD:.ufo/waves/round-36/baseline/c1-delta-pins.json`.
- **line 610-611** — the **on-disk worktree file**, via a bare `cat` (no digest, no `lstat`
  symlink check, unlike the counter's own `safeWrite` helper).

The `--list-drift` mode additionally reads the screen ledger at `headRev` (line 619), so it also
ignores `--rev`.

**The counter header is wrong about this** (lines 42-45):

```
42:// Inputs are git objects only: the lane at --rev and at BASELINE; each sibling at its frozen
43:// round-35 pin (completeness) and at its frozen round-36 delta head (drift leg — heads are
44:// read from .ufo/waves/round-36/baseline/c1-delta-pins.json at REV and verified resolvable;
45:// a sibling working tree is never touched). scripts/check-adjacency.mjs is taken from --rev,
```

"the lane at `--rev`", "at `REV`", "git objects only" are all false for `--list-delta` /
`--list-drift`, which read `HEAD` and can read the **worktree file**. The header's usage block
(lines 36-39) also still names `c1-adjacency-sweep-v4.mjs` — a stale filename in v5.

**The list block is byte-identical v4 → v5.** `diff` of the `if (o.listDelta || o.listDrift)` block
between `.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs` and v5 is empty: **B1 bound the
predicate path only and left the diagnostic modes untouched.** This is the direct answer to
"is this a v5 regression?" — no, it is an *un-repaired* v4 inheritance, and round-36's routed
defect 1 ("C1 counter does not digest-bind `c1-delta-pins.json`") was repaired in one path only.

## 3. Empirical results

All fixtures are `git clone --shared` copies of the lane under
`/fast/scratch/hyaku/tabi-r37/w1/LabratC1/fx/`, each asserted
`git -C "$D" rev-parse --show-toplevel` = `"$D"` before its first commit; each fixture commit used
`-c user.name=fixture -c user.email=fixture@local`. `TMPDIR` pointed at the seat scratch. No file
in the lane repo or any sibling repo was written. Baseline at the lane tip: `--list-delta` = 0
lines, `--list-drift` = 307 lines.

| # | Fixture | Mode | Result |
|---|---|---|---|
| 1 | worktree-only reorder (uncommitted) | both | **identical to baseline** — the HEAD blob wins over the worktree file |
| 2 | reorder **committed** at HEAD | `--list-delta` | exit 0, 0 lines; **no digest refusal** (predicate over the same clone: exit 2, `sha256 ef7ca… != frozen 81019362…`) |
| 3 | **de-pin** one drifted lane (chousa → its round-35 pin) **committed** at HEAD | `--list-drift` | **306 lines vs 307 baseline — the listing CHANGED** |
| 4 | same de-pinned file **on disk only**, HEAD tree lacks the path (checked out `11c64b96`) | `--list-drift` | **306 lines vs 307** — the `cat` fallback path (line 611) consumed it |
| 5 | de-pinned file committed at HEAD | `--list-drift` | **306 lines vs 307** |
| 6 | one extra screen row appended + committed at HEAD | `--list-drift` | **308 lines** — the screen ledger is read at HEAD, not `--rev` |
| 7 | `--rev 11c64b96…` passed to `--list-drift` | `--list-drift` | 307 lines, identical — **`--rev` is ignored by the list modes** |
| 8 | pins naming an unknown sibling (`zombie-lane`), committed at HEAD | `--list-delta` | **exit 2, `delta pin names an unknown sibling: zombie-lane`** — the pins *content* drives the listing and its refusals |
| 9 | pins file absent at HEAD **and** on disk | `--list-delta` | **exit 1 with an uncaught `SyntaxError: Unexpected end of JSON input`** — the documented exit for "could not evaluate" is 2. The `cat` fallback yields an **empty Buffer** (not `null`), so the `pinsBuf === null` guard on line 613 never fires and `JSON.parse('')` throws outside the `Refusal` handler |
| 10 | pins file present but not JSON, committed at HEAD | `--list-drift` | exit 1, same uncaught `SyntaxError` (line 614 parses with no `try`) |
| 11 | instrumented counter: marker printed at the top of `evaluate()` | `--list-delta` / `--list-drift` | marker **absent** (0 occurrences); over `--rev` the marker **is** present |
| 12 | kagi delta head repointed to `8a6ec166…` (a commit carrying new BG lines), committed at HEAD | `--list-delta` | **2 lines** (frozen: 0) — `kagi-shokunin@8a6ec166…:corpus/knowledge/adjacency-scope.md:8` and `:9`, text naming `CDP` and `musketeer` |
| 13 | same fixture, `--list-drift` | `--list-drift` | **363 lines** (frozen: 307) |
| 14 | same fixture, predicate over the same clone | `--rev … --json` | **exit 2**, `sha256 d4f88cc8… != frozen 81019362…` — the predicate refuses what the list modes happily print |
| 15 | same fixture delivered via the **on-disk fallback** (path absent at HEAD) | `--list-delta` | **2 lines** — identical unfrozen rows via the `cat` on line 611 |

**Cases 3-5 and 12-15 are the core answer to Q1: yes, the list modes list using unfrozen pins.**
The divergence is not a count artefact — the actual *set of rows* changes (307 → 306 and
307 → 363; `--list-delta` 0 → 2), because `--list-drift` derives its drifted-lane set from the
unfrozen pins (line 618) and filters the screen ledger with it, and `--list-delta` walks the
unfrozen heads in `deltaCandidates` (line 616).

**Case 11 answers Q2: the list modes are strictly display.** `evaluate()` is never reached from
the list block: lines 606-628 `process.exit(0)` before line 629-630 (`--rev` required, then
`evaluate(o)`). The instrumented build proves it — the marker inside `evaluate()` fires only on
the `--rev` path. Therefore **no predicate evaluation can be influenced by the list modes.**

## 4. Who consumes the list modes (the residual risk)

- **No gate consumes them.** `grep -rn "list-delta\|list-drift\|list-candidates" scripts/` in the
  lane → no hits.
- **The round-37 harness does not consume them.** `.ufo/waves/round-37/measure.sh` → no hits;
  `.ufo/waves/round-37/baseline/run-controls.sh` → no hits. The `run_c1` helper
  (`run-controls.sh:103-106`) invokes only `--rev … --json`.
- **The frozen predicate command does not consume them.** `claims.json C1.countingCommand` is
  `node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --rev <REV> --repo <clean clone>
  --fleet /home/vgpnk/Projects/shokunin --json`.
- **But a round-37 seat does.** `.ufo/waves/round-37/gen-w1-spec.py:93` assigns `ExecSelftest` the
  item "(3) v5 list modes: `--list-candidates | wc -l` (expect 383), `--list-drift | wc -l`
  (expect 307), `--list-delta | wc -l` (expect 0)". Those expected counts are produced by exactly
  the unbound read paths, so the seat's receipt is the place where an unfrozen-pins divergence
  would surface as a *count mismatch* — or, worse, be silently blessed if the fixture and the
  expectation drift together.
- **Historical precedent for the pattern.** `.ufo/waves/round-36/baseline/controls.mjs:73` uses
  `--list-drift` to derive `driftRefs` for the J2 control fixture — a control whose correctness
  rests on the unbound read.

## 5. `--list-delta` **does emit rows** from unfrozen pins — measured

`deltaCandidates` (lines 213-233) lists BG non-tabi lines at the delta head that are **absent from
the round-35 pin line set**. On the honest state the delta pool is genuinely empty, so the naive
"repoint the pins" fixture still printed 0 rows and *looked* safe. A full-history scan over all 20
sibling repos (evidence/scan5.err) found a kagi commit carrying such a line:
`8a6ec16657789f11a6e8e24cff6e6353e79756ce`.

Fixture: clone the lane, repoint **only** `kagi` in the delta pins file to that commit, commit it
at HEAD. Then:

| mode | frozen pins | unfrozen pins |
|---|---|---|
| `--list-delta` | **0 lines** | **2 lines** — `kagi-shokunin@8a6ec166…:corpus/knowledge/adjacency-scope.md:8` and `:9`, whose text names `CDP` and `musketeer` |
| `--list-drift` | 307 lines | **363 lines** |
| `--rev … --json` (predicate) | exit 0, predicate true | **exit 2** — `sha256 d4f88cc8… != frozen 81019362…` |

The two emitted rows are browser-ground lines (`CDP`, `musketeer`) that a caller would read as the
counter's *delta candidate pool* — i.e. exactly the "new browser-domain lines a sibling added
post-pin" the counter is built to surface. They are produced from **unfrozen** pins with **no
digest check** and **no warning**.

The **on-disk fallback reproduces it identically**: with the path absent at HEAD, the bare `cat` on
line 611 yields the same 2 rows / 363 drift rows. So both unbound read paths (HEAD blob and
worktree file) surface unfrozen content.

**This closes the probe's first question with a positive, not a null result: yes — the list modes
list using the unfrozen bytes.**

## 6. Related observation: the build tool has the same unbound read, one step downstream

`.ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs` reads the delta pins the same way
(lines 65-71): `git show HEAD:<path>`, falling back to `readFileSync(join(repo, DELTA_PINS_PATH))`
— **no `sha256`, no digest constant, no `createHash` import anywhere in the file** — while its
own header (line 7-8) claims *"Delta heads still come from the digest-bound delta pins file."*
That claim is false: the file is digest-bound nowhere. This is not a regression — the round-36
builder (`c1-drift-audit-build.mjs:61-65`) had the identical unbound read; v2 repaired the kama
pin (routed defect 2) but not the pins binding.

Measured impact (probe5, case b): building the ledger from a **de-pinned** clone yields
**306 audit rows (303 unchanged, 3 moved)** versus the honest **307 (304 unchanged, 3 moved)**.
Adopting that unfrozen-built ledger into a clone whose pins are **frozen at REV** makes the
predicate go **false** (`exit 1`, `drift.total=307`, `auditCoverage=306`) — i.e. the predicate
**fails closed** on an unfrozen-built ledger, it does not false-green. Good: the C1 predicate
cannot be fooled this way. The build tool's exposure is to producing a *wrong ledger*, which the
predicate then (correctly) rejects — a loud failure, not a silent pass.

## 7. Documentation gap — the specific defect to route

The counter header (lines 42-45) tells the reader the pins come from `REV` and that inputs are
"git objects only". For `--list-delta`/`--list-drift` the truth is:

| | predicate (`--rev`) | `--list-delta` / `--list-drift` |
|---|---|---|
| pins read at | `REV` (line 385) | `HEAD` (line 608-609) **or the on-disk worktree file** (line 611) |
| digest bound | yes — `DELTA_PINS_SHA256` (lines 388-389, 587) | **no** |
| screen ledger read at | `REV` | `HEAD` (line 619) |
| `--rev` honoured | yes | **no** |
| can change the predicate | — | **no** (case 11) |

## 8. Recommended repair (for the L1 — not applied here; the counter is frozen)

The cheapest correct repair is to make the list modes use the *same* bound read as the predicate,
and to say so in the header. Minimal form:

- resolve the pins once at `REV` (or at `HEAD` if `--rev` is absent) and apply the same
  `sha256(buf) !== DELTA_PINS_SHA256` refusal the predicate applies (lines 388-389);
- refuse when the on-disk fallback would be used, or bind the on-disk bytes to the same digest;
- either honour `--rev` in the list modes or document that they are `HEAD`-relative;
- fix the header sentence (lines 42-45) and the stale `c1-adjacency-sweep-v4.mjs` usage lines
  (36-39);
- wrap the `JSON.parse` on line 614 in a `try` that raises a `Refusal`, so a corrupt/absent pins
  file yields the documented **exit 2 (could-not-evaluate)** rather than exit 1 with an uncaught
  `SyntaxError` (cases 9 and 10).

The same unbound read should be fixed in `c1-drift-audit-build-v2.mjs` (lines 65-71), or its
header's "digest-bound delta pins file" sentence must be corrected — as frozen, that sentence is
false.

**Scope note.** If the L1 judges that binding the list modes would alter the `ExecSelftest`
receipt's expected counts (`383 / 307 / 0`), the alternative is to keep the modes unbound and
**document them as unbound diagnostics in the header** — that is the "acceptable display-only
divergence" branch, but it must be *written down*, because today the header asserts the opposite.

## 9. Method, tools and hygiene

- Node v24.21.0 (preinstalled); `git` from the host; `python3` for fixture construction. **No new
  tools were installed** (nothing in the task needed a tool the host lacked).
- **Probe series:** `probe.sh` (cases 1-6, 11) → `probe2.sh` (cases 7-13) → `probe3.sh` (cases
  14-16 + build tool) → `probe4.sh` (all-lanes repoint) → `probe5.sh` (build-tool isolation) →
  `probe6.sh`/`probe7.sh` (scan attempts) → `probe8.sh` (content-dependence) → `probe9.sh`
  (decisive `--list-delta` row emission). Raw logs in `evidence/probe*.log`.
- The decisive kagi commit was found by scanning **every commit in every sibling repo**
  (`git rev-list --all`) for a browser-ground line absent from the frozen pin set — evidence in
  `evidence/scan5.err`. The scan's own script is `evidence/scan5.mjs`.
- Scratch root `/fast/scratch/hyaku/tabi-r37/w1/LabratC1/` with `TMPDIR` pointed inside it; the
  scratch root was removed on completion.
- **Writes performed:** only this seat's directory
  `.ufo/waves/round-37/w1/LabratC1/` (this report + `evidence/`) and the seat summary at
  `.ufo/waves/round-37/w1/LabratC1.md`. No lane file, no sibling repo, no fleet-root file, no
  `.ufo/state`, no `MANIFEST.json` was touched. **No mutating git command was run outside the
  seat's scratch fixtures**; every git call named `-C "$D"` and every fixture asserted its
  toplevel before its first commit. No browser was launched.
- Raw probe logs are under `evidence/` (`probe*.log`, `out/*.stdout`, `out/*.stderr`,
  `code-excerpts-*.txt`, `v4-v5-listblock-diff-and-consumers.txt`).

## 10. Files changed

- `.ufo/waves/round-37/w1/LabratC1/report.md` (this file)
- `.ufo/waves/round-37/w1/LabratC1/evidence/*` (raw probe logs and captured outputs)

No other file was created or modified.

VERDICT finding — CONFIRMED with a positive measurement. v5's `--list-delta`/`--list-drift` read the
delta pins from lane HEAD or the on-disk worktree file with NO digest binding (v5 lines 606-628),
while the predicate path binds the same file at REV (lines 385-389, 587). Measured on a fixture
that repoints one delta head to a commit carrying new browser-ground lines: `--list-delta` printed
**2 unfrozen rows** (CDP / musketeer lines) where the frozen reading is 0, and `--list-drift`
printed **363 rows** where the frozen reading is 307 — exit 0, no warning, on BOTH unbound read
paths (HEAD blob and the on-disk `cat` fallback). The list modes are strictly DISPLAY: an
instrumented marker at the top of `evaluate()` never fires on them (they `process.exit(0)` at
line 627, before `evaluate()` is called at line 630), so **C1's predicate is unaffected** and the
frozen kill rule is not tripped. The routed defect is the counter header's FALSE claim ("the lane
at `--rev`", "git objects only", "at `REV`" — lines 42-45) plus the missing binding on two of
three entry points; the L1 should either bind the list modes to the same digest or document them
as unbound diagnostics. Also: the list modes ignore `--rev` entirely, and the `JSON.parse` on
line 614 needs a `Refusal` wrapper (a corrupt/absent pins file currently exits 1 with an uncaught
`SyntaxError` instead of the documented exit 2). Adjacent: `c1-drift-audit-build-v2.mjs:65-71` has
the same unbound read while its header claims "digest-bound"; its unfrozen-built ledger makes the
predicate go false (fail-closed), so C1 is safe there too.
