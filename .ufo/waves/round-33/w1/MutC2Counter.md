# MutC2Counter — C2 battery mutation test (tabi round 33, wave w1, attempt 1)

**Verdict.** I applied 16 single-point mutants to a copy of the frozen C2 counter `.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs` (sha256 `51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b`, verified before derivation) and scored each on the three committed C2 controls — `c2-J1-do-nothing`, `c2-J2-reject-all`, `c2-J3-whitelist` — rebuilt verbatim from the committed `baseline/controls.mjs` (sha256 `2d0cf841…`, C2 sections only, counter path and receipt dir parametrized) with `TMPDIR` under `/fast/scratch/hyaku/tabi-r33/`. The harness was validated first: the pristine copy reproduces all three committed control receipts exactly (after normalizing fresh commit timestamps: `rev` and per-variant `commit` dropped; every other byte compared). Result: **8 killed, 8 survived**. Exactly one mutant flips a control's predicate verdict (M12, do-nothing false→true); the other kills are receipt-fingerprint detections (field values, exit-2 refusals) — the three controls' power comes from the do-nothing predicate flip, rich per-variant JSON fingerprinting, and the golden/honest digest pins surfaced as crashes. The 8 survivors are coverage limits: the H1/H2 predicate clauses, the digest-literal clause, the selftest clause, the admitted-16 threshold, the gate-bytes no-tamper assertion, the executed-gate-path pinning, and F3's construction are each invisible to all three controls. These are limits of the three committed controls (what a defective battery could get away with while every control still reproduces its committed receipt), not defects in the frozen battery; the battery's bytes are digest-pinned in claims.json regardless. No gate code was changed by any mutant — every finding is about the counter's own redundancy, which is what the v2 round's counter contract inherits.

## Axes (godspeed)

- **Coverage** — mutants applied: 16 (target ≥ 10), spanning predicate clauses, acceptance semantics, construction builders, golden/honest pinning, and reporting.
- **Fidelity** — pristine copy reproduces all three committed receipts before any mutant ran; every mutant derived by an asserted exactly-once string replacement from the verified frozen bytes; all mutants `node --check` clean.
- **Cost** — 17 targets (pristine + 16 mutants) × 3 controls at 5-way concurrency: 161 s total mutant wave, 11 s pristine; no wasted reruns.

## Method

Scratch: `/fast/scratch/hyaku/tabi-r33/MutC2Counter/` (removed after receipts were copied; `TMPDIR=$PWD/tmp` for every run). Harness (copied to the output dir under `harness/`):

- `run-controls.mjs <counter> <outdir>` — the committed controls' C2 sections verbatim: `git clone -q --shared --no-checkout <lane> clone`, toplevel verified, J1 scored at `--rev b7d16fb8… --repo <lane>`, then the J2 reject-all patch and J3 whitelist patch applied to the lane worktree's v1 gate bytes (read-only) and committed in the scratch clone with `-c user.name=tabi-r33-control …`, each scored with `node <counter> --rev <commit> --repo <clone> --json`. Receipts (`.json`, `.stderr`, `.provenance`) land in `<outdir>`.
- `make-mutants.mjs` — reads the frozen battery, asserts its sha256 equals `51ace65f…`, writes `battery-pristine.mjs` plus 16 mutants; each `from`-string asserted to occur exactly once (split length 2), manifest records line number, edit, expected verdict, mutant sha256.
- `driver.mjs [--pristine] [targets…]` — runs targets at concurrency 5, then compares every produced receipt against the committed baseline receipt (normalize: delete `rev`, delete `results[*].commit`), writing `out/verdicts.json`. KILLED := any of the three receipts differs, is missing, or is unparseable (battery could not evaluate); SURVIVED := all three byte-identical (normalized).

Commands and exit codes (all run from the scratch dir):

```
sha256sum <frozen battery> <baseline/controls.mjs> <lane scripts/check-bidi-runtime.mjs>
  → 51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b   (== claims.json frozenDigests)
  → 2d0cf8416a35c2440cc1b6478f90b0f7a6d8a3436d617ea3527b0b8f3f5a451e   (== claims.json frozenDigests)
  → 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393   (v1 gate, matches battery GOLDEN_GATE_SHA256)
node make-mutants.mjs                     → exit 0, mutants=16, all from-strings unique
node --check <17 files>                   → all clean
node driver.mjs --pristine pristine       → exit 0; pristine SURVIVED (= all three receipts == committed)
node driver.mjs                           → exit 0; 16 targets, every runner exit 0, 150 s wall
node -e "<independent re-comparison of the 8 survivors>"  → all eight: all-three-identical
```

Committed control expectations (from `baseline/c2-J{1,2,3}-*.json`, reproduced by pristine): J1 exit 1, predicate false, honest T/T/T, forgeriesAccepted 8, digestLiterals [], selftest 0; J2 exit 1, predicate false, honest F/F/F, forgeriesAccepted 0, selftest 0 (gate sha `d327300f…`); J3 exit 1, predicate false, honest T/T/T, forgeriesAccepted 0, digestLiterals 5 (`8aa97463c238`, `9918a716da71`, `92bd413caab0`, `b9dab912f0af`, `55dbef88ed4b`), selftest 3 (gate sha `7cc8f233…`).

## Results

Line numbers cite the pristine battery (`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:<line>`). "predicate-flip" = a control's `predicate` changed; "field" = a receipt field changed while every predicate stayed as committed; "crash" = battery exit 2, receipt missing.

| mutant | line | single-point edit | verdict | killedBy | mechanism |
|---|---|---|---|---|---|
| M01-drop-h2-predicate | 229 | predicate drops `out.honest.H2 &&` | SURVIVED | — | no control rejects only H2 |
| M02-drop-h1-predicate | 229 | predicate drops `out.honest.H1 &&` | SURVIVED | — | no control rejects only H1 |
| M03-drop-digest-scan | 222 | `digestLiterals:` scan → `[]` (field + clause gone) | KILLED | J3 | field: `digestLiterals` 5 entries → `[]` |
| M04-drop-digest-clause | 229 | predicate drops `&& out.digestLiterals.length === 0` (field kept) | SURVIVED | — | J3 already false via selftest=3; clause unwitnessed |
| M05-accept-exit-1 | 207 | `accepted: r.status === 0 \|\| r.status === 1` | KILLED | J2+J3 | field: `forgeriesAccepted` 0→8 on both (rejected F variants exit 1); predicates stay false |
| M06-skip-gate-bytes-assert | 201 | delete the `onDisk`/`gateSha` no-tamper assertion | SURVIVED | — | no control tampers the gate between commit and run |
| M07-worktree-gate | 203 | execute `join(lane, GATE)` instead of the clone's | SURVIVED | — | repo worktree gate is byte-identical to REV's blob in all three controls |
| M08-F7-decorates-no-row | 189 | F7 → `put(ENTRY, entryText)` | KILLED | J1+J2+J3 | crash: `git commit` fails on a no-op → Refusal → exit 2 (implicit guard) |
| M08b-F7-decorates-non-first-yes-row | 189 | first `yes` row honest, R2–R17 decorated | KILLED | J1+J3 | field: `results.F7` population/admitted 15/15 → 1/1 (v1 drops `yes (live)` cells from the population); predicate unchanged |
| M09-F3-distinct-paths | 181 | F3 → byte copy of run1 at a new path | SURVIVED | — | collapses into F4: v1 accepts, reject-all rejects, whitelist rejects on `ds[0]==ds[1]`; all receipts identical |
| M10-selftest-clause-drop | 229 | predicate drops `&& st.status === 0` (selftest still run + reported) | SURVIVED | — | no control has a gate failing selftest while otherwise clean |
| M11-admitted-relaxed | 217 | `admitted === HONEST_ADMITTED` → `admitted >= 1` | SURVIVED | — | no control presents a partially-admitting gate |
| M12-drop-forgery-clause | 229 | predicate drops `out.forgeriesAccepted === 0 &&` | KILLED | J1 | predicate-flip: do-nothing `predicate` false→true (exit 1→0) |
| M13-golden-from-REV | 141 | golden gate read at REV instead of GOLDEN_REV | KILLED | J2+J3 | crash: `golden gate digest mismatch` → exit 2 (J1's REV == GOLDEN_REV passes) |
| M14-H2-golden-transcripts | 169 | H2 uses `goldenLines()` transcripts | KILLED | J3 | field: `honest.H2` true→false (whitelist refuses golden digests) |
| M15-prefix-len-40 | 222 | digest prefix 12-hex → 40-hex | KILLED | J3 | field: `digestLiterals` entries become 40-hex strings (same 5 digests); predicate unchanged — fingerprint-only |

Observed refusal messages (stderr, verbatim):

```
M08 (all three controls): C2_FORGERY_BATTERY verdict=could-not-evaluate detail=git -C <tmp>/tabi-r33-c2-*/clone commit -q --no-verify -m battery F7:
M13 (J2, J3):             C2_FORGERY_BATTERY verdict=could-not-evaluate detail=golden gate digest mismatch
```

## Survivors as limits (coverage findings)

Each survivor means: a battery carrying this defect scores byte-identically on all three committed controls — the control suite cannot catch it.

1. **M01/M02 — H1/H2 acceptance uncontrolled.** No committed control constructs a gate that rejects exactly the re-layout (H1) or exactly the RerunDriver pair (H2) while passing everything else. A battery that ignores either honest leg is invisible. The honest legs beyond H0 are pinned only through the whitelist control's transcript-digest membership (which is what kills M14), not through any predicate verdict.
2. **M04 — digest-literal clause unwitnessed.** With the reported field kept, dropping the clause from the predicate changes nothing: J3's predicate is false anyway via selftest=3. The clause is witnessed only by the reported `digestLiterals` field (which is what kills M03 when the scan itself is dropped). A battery that reports but ignores the scan would pass.
3. **M06 — no-tamper assertion uncontrolled.** No control presents a worktree whose gate bytes changed after the variant commit. If a future battery variant grew code that touched the gate, nothing in the three controls would notice.
4. **M07 — executed-gate path uncontrolled.** A battery that executes `repo`'s worktree gate (or any byte-identical copy) instead of its own clone's gate scores identically: the controls always leave the worktree consistent with REV. Path pinning and the byte assertion are currently redundant with each other, and only the assertion is exercised against drift (by M13's crash on the golden side, not on the executed side).
5. **M09 — F3 redundant with F4.** Collapsing F3 (same path twice) into F4 (byte copy at a new path) changes no control receipt: v1 accepts both, reject-all rejects both, the whitelist rejects both on `ds[0] === ds[1]`. F3's distinct construction adds no discriminating power these controls can see; the real F3 killer in the gate is the distinct-path check, not the battery's construction choice.
6. **M10 — selftest clause uncontrolled.** No control presents a gate that fails `--selftest` while otherwise clean (J3's whitelist gate fails selftest 25/27 but is already false via digestLiterals, so it cannot witness the clause). A battery ignoring selftest scores identically.
7. **M11 — admitted-16 threshold uncontrolled.** No control presents a gate that admits only part of the honest runs (e.g. 15/16 with one honest row failing). A battery accepting `admitted >= 1` scores identically.

**Fingerprint-only kills (nuance).** M05, M08b and M15 are killed although no control's predicate flips — the detection rides entirely on the battery's rich reported JSON (`forgeriesAccepted`/`acceptedForgeries`, per-variant `population`/`admitted`, `digestLiterals` format) and on exit-2 refusals (M08, M13). Only M12 flips a predicate verdict. Practical reading for the v2 round: keep the per-variant JSON fields and the golden/honest digest pins — they carry most of the controls' detection power; the predicate clauses for H1/H2, digest literals, selftest and admitted-16 currently have no killing control and would need new controls (e.g. a gate that rejects only H2, a gate failing selftest while clean, a gate admitting 15/16) if the battery is ever rewritten.

## Provenance and hygiene

- No tools installed or upgraded (node v24.21.0, git 2.56.0 already present; pacman untouched; no `~/.local/bin` writes).
- No network fetches (all sources local; zero HTTPS GETs, so nothing to log).
- No browser launches: the battery is offline by construction (receipt leg, no `--live`); it spawns only `node` and `git` inside its own `mkdtemp` clones. Final `pgrep -fa 'chromedriver|chromium'` → one line, `/usr/bin/earlyoom -r 3600 … --prefer (^|/)(java|node|chromium|python3?)$` — the host OOM daemon's regex, not a browser process; zero chromedriver/chromium processes owned by this seat.
- All git writes happened inside the harness's own `mkdtemp` clones (toplevel verified before first commit, identity `battery`/`tabi-r33-control` `@scratch.local`); the lane checkout, lane git index, fleet repo and sibling repos were only read. No lane tracked file was edited.
- `TMPDIR=/fast/scratch/hyaku/tabi-r33/MutC2Counter/tmp` for every run; batteries and the controls runner remove their temp dirs in `finally`; scratch dir removed after receipts were copied (verified below).

## Deliverable paths

- Report: `tabi-shokunin/.ufo/waves/round-33/w1/MutC2Counter.md` (this file)
- Output dir: `tabi-shokunin/.ufo/waves/round-33/w1/MutC2Counter/`
  - `mutants-manifest.json` — 16 mutants: exact from/to strings, pristine line numbers, expected verdicts, mutant sha256s
  - `receipts/verdicts.json` — machine verdict table (killedBy + field diffs per control)
  - `receipts/out/<target>/` — for pristine + each mutant: `c2-J1-do-nothing.json/.stderr/.provenance`, `c2-J2-reject-all.json/.stderr/.provenance`, `c2-J3-whitelist.json/.stderr/.provenance`, `summary.json`, `runner.log` (192 files total)
  - `harness/run-controls.mjs`, `harness/make-mutants.mjs`, `harness/driver.mjs` — the rebuild, the mutant maker, the driver/scorer
