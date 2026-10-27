# ExecFreezeIntegrity — freeze-integrity execution receipt

**Lane:** tabi · **Round:** 37 (attempt 1) · **Wave:** w1 (build + first falsifiers)
**Seat:** `ExecFreezeIntegrity` (executor, leaf — no subagents spawned)
**Lane repo:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`
**Freeze commit:** `99437d29de036415a9f2d0524343617a3b19988a`
**Round-start baseline** (`claims.json` `frozenAt`/`baseline`): `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`
**Verbatim command/exit log:** `.ufo/waves/round-37/w1/ExecFreezeIntegrity/freeze-integrity.txt`
**Date:** 2026-10-27 · **Host:** linux 7.2.11-arch1-1 · node v24.21.0

All git calls were read-only (`ls-remote`, `rev-parse`, `merge-base --is-ancestor`, `diff-tree`,
`diff`, `log`, `status`, `cat-file`, `show`, `for-each-ref`, `replace -l`). No mutating git/jj
command was run in any repo. Scratch root
`/fast/scratch/hyaku/tabi-r37/w1/ExecFreezeIntegrity/` was used for the extracted freeze bytes and
removed on exit; the durable receipt is the seat-dir log above.

---

## The five assigned checks

### (1) `git ls-remote origin refs/heads/master` — equals the freeze commit?

**Literal answer: NO.** `origin` = `https://github.com/VeigaPunk/tabi-shokunin.git`.

```
$ git ls-remote origin refs/heads/master
f76da094f0ff0ad9856d2232858241e3f7841379	refs/heads/master      exit=0
$ git rev-parse HEAD
f76da094f0ff0ad9856d2232858241e3f7841379                      exit=0
```

`99437d29…` is **not** the origin tip; it is one commit behind it. The freeze commit is an
**ancestor** of the tip (`git merge-base --is-ancestor 99437d29… f76da09…` → exit 0), and the
single intervening commit is dispatch scaffolding:

```
$ git log --oneline 99437d29..f76da09
f76da09 round-37: validated w1 spec, dispatch payload and ready handoff (34 seats)
$ git diff-tree -r --no-renames --name-only 99437d29..f76da09
.ufo/waves/round-37/gen-w1-spec.py
.ufo/waves/round-37/w1-dispatch.json
.ufo/waves/round-37/w1-dispatch.stderr
.ufo/waves/round-37/w1-spec.json
.ufo/waves/round-37/w1.ready
```

**The freeze itself is intact.** Every byte the contract freezes is byte-identical between the
freeze commit and the current origin tip:

| frozen path | freeze commit | origin tip | verdict |
|---|---|---|---|
| `.ufo/waves/round-37/claims.json` | `eade07a2…f48` | same | IDENTICAL |
| `.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs` | `9c6289b7…752` | same | IDENTICAL |
| `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` | `eda339eb…019` | same | IDENTICAL |
| `.ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs` | `a85152cd…96a` | same | IDENTICAL |
| `.ufo/waves/round-37/measure.sh` | `9f89697c…302` | same | IDENTICAL |
| `.ufo/waves/round-37/baseline/run-controls.sh` | `3a08367f…25e` | same | IDENTICAL |
| `.ufo/waves/round-37/baseline/census-start.txt` | `4b08af72…f96` | same | IDENTICAL |

`git diff --name-only 99437d29..f76da09 -- .ufo/waves/round-37/{counters,claims.json,measure.sh,baseline}`
→ **empty output, exit 0**. No counter byte, claim byte, harness byte or control receipt was
amended after the freeze. The claim contract's `measurementRule` ("counters taken from the FREEZE
commit, not the worktree") is therefore satisfiable as written: `measure.sh` resolves the counter
bytes with `git -C "$LANE" show "$FREEZE:$f"`.

*Calibration note:* the check's literal phrasing ("equals the freeze commit?") encodes a state the
lane cannot hold — the wave dispatcher commits `.ufo/waves/round-37/` dispatch artifacts to
`master` after the freeze, so origin tip necessarily advances. The invariant that actually matters
is the byte-identity table above, and it holds.

### (2) `git merge-base --is-ancestor ed8ccfc… 99437d29…` — freeze builds on the round-start tip

**exit=0** — expected value confirmed.

```
$ git merge-base --is-ancestor ed8ccfc00ad3784bc424aa118e056f8edf4ee803 99437d29de036415a9f2d0524343617a3b19988a
exit=0
$ git log --format=%P -1 99437d29
ed8ccfc00ad3784bc424aa118e056f8edf4ee803
```

`ed8ccfc…` is the **sole parent** of the freeze commit — a direct child of the round-start tip, so
the freeze is a one-commit delta on the baseline with no intervening history.

### (3) The freeze commit touches ONLY `.ufo/waves/round-37/` paths

**Confirmed.** The command as specified (`diff-tree --name-only`, no `-r`) prints the top-level
tree `.ufo`; the recursive listing enumerates the 17 paths, and **all 17 are under
`.ufo/waves/round-37/`**:

```
$ git diff-tree --no-renames --name-only ed8ccfc..99437d29
.ufo                                                            exit=0
$ git diff-tree -r --no-renames --name-only ed8ccfc..99437d29   exit=0
.ufo/waves/round-37/baseline/c1r37-J1-pins-reorder-v4.json
.ufo/waves/round-37/baseline/c1r37-J1-pins-reorder-v5.json
.ufo/waves/round-37/baseline/c1r37-J2-decoy-note-v4.json
.ufo/waves/round-37/baseline/c1r37-J2-decoy-note-v5.json
.ufo/waves/round-37/baseline/c1r37-J3-honest-v5.json
.ufo/waves/round-37/baseline/c2r37-J1-replace-ref-v2.json
.ufo/waves/round-37/baseline/c2r37-J1-replace-ref-v3.json
.ufo/waves/round-37/baseline/c2r37-J2-observed-tamper-v2.json
.ufo/waves/round-37/baseline/c2r37-J2-observed-tamper-v3.json
.ufo/waves/round-37/baseline/c2r37-J3-honest-v3.json
.ufo/waves/round-37/baseline/census-start.txt
.ufo/waves/round-37/baseline/run-controls.sh
.ufo/waves/round-37/claims.json
.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs
.ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs
.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs
.ufo/waves/round-37/measure.sh
```

`git show --stat` confirms 17 files, 1812 insertions, 0 deletions — a pure add of round-37 material.
No lane content file (`SKILL.md`, `SCORECARD.md`, `LOG.md`, `corpus/*`, `scripts/*`) is touched by
the freeze, so the no-harm append-only surface is untouched by the freeze itself.

### (4) `git status --porcelain` — worktree clean

**Not literally empty; the tracked tree IS clean.** At the time of the check the worktree carried
three untracked entries; with `-uall` it now carries the L1 dispatch artifacts plus the sibling
seats' evidence directories:

```
$ git status --porcelain                 exit=0
?? .ufo/waves/round-37/L1-notes/
?? .ufo/waves/round-37/w1.ready.dispatched
?? .ufo/waves/round-37/w1/
$ git status --porcelain --untracked-files=no   exit=0   (empty)
$ git diff --stat HEAD                          exit=0   (empty)
```

**No tracked file is modified, staged or deleted** — the two tracked-only probes are both empty.
Every untracked entry is either an L1 dispatcher artifact (`.ufo/waves/round-37/L1-notes/`,
`w1.ready.dispatched`, `w1/swarm-registry.json`) or a wave seat's own evidence directory under
`.ufo/waves/round-37/w1/`. `.gitignore` covers `.ufo/waves/*/scratch/` and `.ufo/waves/*/*.err` but
**not** `.ufo/waves/round-37/w1/`, so seat directories surface as untracked until the L1 integrates
them. Round-36 precedent (287 files under `.ufo/waves/round-36/w1/` are landed in the repo)
confirms seat dirs are meant to be landed by the integrator, not by seats.

*Calibration note:* "expect empty" cannot hold for a live wave — the dispatcher writes into the
repo tree and every seat writes its evidence under `.ufo/waves/round-37/w1/<seat>/`. The
meaningful invariant (no tracked byte changed since the freeze) holds.

### (5) `node --check` on both frozen counters, from the freeze bytes

Both counters were extracted with `git show 99437d29…:<path>` (not copied from the worktree) and
syntax-checked:

```
$ node --version                                  → v24.21.0        exit=0
$ node --check c1-adjacency-sweep-v5.mjs          (freeze bytes)    exit=0
$ node --check c2-firefox-bidi-v3.mjs             (freeze bytes)    exit=0
$ node --check c1-drift-audit-build-v2.mjs        (freeze bytes)    exit=0
$ bash -n measure.sh                              (freeze bytes)    exit=0
```

(The build tool and the harness are included because both are frozen artifacts of this round and
both are named in `claims.json.frozenDigests`.)

---

## Independent corroboration (beyond the five checks)

### All five `claims.json.frozenDigests` reproduce from the frozen bytes

```
c1        9c6289b70d67bb6da1bf5578e66ccfa2c40ea33c307adb33c454dc7bdd91752c  → counters/c1-adjacency-sweep-v5.mjs   MATCH
c2        eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019  → counters/c2-firefox-bidi-v3.mjs      MATCH
buildTool a85152cdb8c0201e2ec08e8694b567f9ebb9735203e540a5b37f0207762a9a96  → counters/c1-drift-audit-build-v2.mjs MATCH
measure   9f89697c0509a93bfe748db7a72a9303c429f4dc680707b2dab503c3d6843302  → measure.sh                          MATCH
controls  3a08367f9c11eb1e05aedc0a9c45dfc6e11aa5d0b041e1dfd74ac78eeed4f25e  → baseline/run-controls.sh            MATCH
```

All five digests in the contract are pinned to bytes that exist and match.

### Worktree bytes of the frozen artifacts == freeze-commit bytes

`claims.json`, both counters, the build tool and `measure.sh` in the live worktree hash **IDENTICAL**
to their freeze-commit blobs (sha256 compared per file, exit 0). No post-freeze in-place edit has
occurred in the worktree either.

### Embedded pins/digests inside the frozen counters resolve against frozen objects

| embedded constant | frozen blob it must match | result |
|---|---|---|
| `DELTA_PINS_SHA256` (c1 v5) `81019362…655` | `.ufo/waves/round-36/baseline/c1-delta-pins.json` at the freeze | sha256 `81019362…655` — MATCH |
| `ADJ_GATE_SHA256` (c1 v5) `4e2c2a64…aac` | `scripts/check-adjacency.mjs` at the freeze | sha256 `4e2c2a64…aac` — MATCH |
| `GATE_SHA256` (c2 v3) `370e8e95…c87` | `scripts/check-bidi-runtime.mjs` at the freeze | sha256 `370e8e95…c87` — MATCH |
| `BASELINE` (c1 v5) `11c64b96…dc0` | commit object | `cat-file -t` → `commit` |
| `BASELINE` (c2 v3) `2d2c8a77…b684` | commit object | `cat-file -t` → `commit` |

### Predicate sentence — three-site byte identity (C1 and C2)

Both counters carry the sentence in a header comment **and** in `const PREDICATE_SENTENCE`, and
both are byte-identical to `claims.json`'s `predicate`; the emitted receipt field
`out.predicateSentence` is assigned from the same constant.

```
C1 site1 claims.json.predicate == site2 header-comment : true
C1 site2 header-comment   == site3 PREDICATE_SENTENCE : true
C2 site1 claims.json.predicate == site2 header-comment : true
C2 site2 header-comment   == site3 PREDICATE_SENTENCE : true
```

`claims.json` names the third site `receipt.predicateSentence`; the counters emit it at
`c1-adjacency-sweep-v5.mjs:539` and `c2-firefox-bidi-v3.mjs:682`. (The *baseline control
receipts* under `.ufo/waves/round-37/baseline/` are a different artifact with a different shape —
`{control,counter,fixtureRev,exit,predicate,summary}` — and carry no `predicateSentence` field;
that is expected, they are run-controls.sh control receipts, not counter JSON output.)

### C2's B1 ground is present in the measured lane

`git for-each-ref refs/replace` → empty (exit 0); `git replace -l` → empty (exit 0); no
`.git/info/grafts`, no `.git/objects/info/alternates`. The measured clone has no replace refs, and
the frozen v3 counter runs every git read with `GIT_NO_REPLACE_OBJECTS: '1'` (c2 v3:121) and
refuses a clone carrying `refs/replace/*` (c2 v3:527-528). The frozen c1 v5 counter likewise
passes `GIT_NO_REPLACE_OBJECTS: '1'` on every git read (c1 v5:137).

### Routed-defect repairs are present in the frozen bytes (read-only inspection)

Routed defects for round 37 live in `corpus/lessons/round-36-verifier-spotcheck.md` §"Routed
defects and notes for round 37". All five routed items are visibly addressed in the frozen
artifacts:

1. **C1 delta-pins digest binding** — `DELTA_PINS_SHA256` present and enforced
   (c1 v5:96, refusal at :389), and the frozen pins blob at the freeze hashes to exactly that
   value.
2. **Build tool kama pin 39 hex** — round-36 `.ufo/waves/round-36/baseline/c1-drift-audit-build.mjs`
   carries `kama: 'e8fa87ef19ec5eb28f5fd9701a0a42a45bd688d'` (39 chars, missing the `d`); the
   round-37 `c1-drift-audit-build-v2.mjs` carries the 40-hex `e8fa87ef…42da45bd688d`, **identical
   to the counter's own `PINS.kama`**. All 20 pins in build-tool v2 and in counter v5 agree
   pairwise and every one is 40 hex (0 mismatches, 0 short); all 20 resolve against their
   sibling repos (20 resolvable, 0 unresolvable).
3. **Moved-note parser** — c1 v5 parses the relocation only from the canonical clause:
   `/\bverbatim at :([1-9][0-9]*)\b/` (c1 v5:458), with `audit-moved-no-relocation` /
   `audit-moved-wrong-relocation` refusals (c1 v5:459,463).
4. **Predicate sentence alignment** — byte-identical across all three sites (above).
5. **Harness `numstat` path + `check-freshness` invocation** — `measure.sh` resolves `OUT` to an
   absolute path up front (`OUT=$(realpath -m "$2")`), writes the numstat through that absolute
   path while diffing inside the clone (measure.sh:69), and invokes
   `node scripts/check-freshness.mjs --worktree --repo $d` (measure.sh:56) — the contract-correct
   `--worktree --repo` form, not the round-36 `--worktree --rev` form that exited 2.

### Frozen control receipts, as recorded at the freeze

```
c1r37-J1-pins-reorder-v4    exit=0  predicate=true   (v4 admits unfrozen pins — the old defect)
c1r37-J1-pins-reorder-v5    exit=2  predicate=null   (v5 refuses: pins sha256 mismatch)
c1r37-J2-decoy-note-v4      exit=1  predicate=false  (v4 refuses the truthful note)
c1r37-J2-decoy-note-v5      exit=0  predicate=true   (v5 admits via the verbatim-at clause)
c1r37-J3-honest-v5          exit=0  predicate=true   (honest floor at ed8ccfc)
c2r37-J1-replace-ref-v2     exit=0  predicate=true   (v2 honours the graft — the old defect)
c2r37-J1-replace-ref-v3     exit=2  predicate=null   (v3 refuses: refs/replace present)
c2r37-J2-observed-tamper-v2 exit=0  predicate=true   (v2 ignores the tampered decoration)
c2r37-J2-observed-tamper-v3 exit=1  predicate=false  (v3 receipt-finds the tampered sha256)
c2r37-J3-honest-v3          exit=0  summary: predicate=true, admitted=16, survivors=0, egress=0
```

These match `claims.json`'s `before`/`target` narrative for both claims (old instruments admit the
attack fixtures; new instruments refuse them; honest floors are met).

---

## Findings, risks, blockers

**Findings (calibration-relevant, none is a freeze-integrity break):**

- **F1 — origin tip ≠ freeze commit, by exactly one dispatch commit.** The frozen *bytes* are
  provably unchanged (7/7 paths IDENTICAL), so the freeze is intact. Recorded because a
  literal reading of check (1) yields "no".
- **F2 — `git status --porcelain` is non-empty during a live wave.** The tracked tree is clean;
  the noise is the L1 dispatcher plus sibling seat evidence dirs, and `.gitignore` does not
  exclude `.ufo/waves/*/w1/`. If the integrator wants a literally-empty worktree, the ignore rule
  or the landing order must change; that is the L1's call, not mine.
- **F3 — the frozen baseline control receipts do not carry a `predicateSentence` field.** The
  `claims.json` third predicate site (`receipt.predicateSentence`) is satisfied by the counters'
  own JSON output field (`out.predicateSentence`), not by the control receipts, whose shape is
  `{control,counter,fixtureRev,exit,predicate,summary}`. Two distinct artifacts share the word
  "receipt"; worth the L1 naming them apart if the scorecard parses the control receipts.

**Risks:**

- R1 — `measure.sh` reads counter bytes from `$FREEZE` but `run-controls.sh` reads them from
  `$LANE`'s worktree (`V5=$LANE/.ufo/waves/round-37/counters/…`). Today the worktree bytes are
  byte-identical to the freeze bytes (verified), so both paths agree; but if a seat edits a
  counter in the worktree after the freeze, the controls would silently measure the edited file
  while `measure.sh` would measure the frozen one. Not a defect today — a divergence trap later.
- R2 — the wave keeps writing into the lane worktree while counters are being scored; the
  no-harm harness leg should be run only once the seat dirs are quiesced.

**Blockers:** none.

**Not done (out of this seat's scope, and deliberately):** no counter was executed against a
fixture clone, no Firefox/geckodriver was launched, no gate was run. This seat establishes freeze
integrity only; the falsifier legs belong to the C1/C2 seats.

---

VERDICT ok — freeze integrity confirmed: the freeze commit is a direct child of the round-start
tip (`merge-base --is-ancestor` exit 0), touches only `.ufo/waves/round-37/` (17 added paths), all
five `claims.json.frozenDigests` reproduce byte-exactly from the freeze bytes, both frozen
counters (plus the build tool and the harness) pass `node --check`/`bash -n` on the freeze bytes,
every embedded pin resolves against frozen objects, both predicate sentences are byte-identical
across their three sites, and the tracked worktree is clean. Two literal deviations recorded and
explained, neither a break of the freeze: (1) `origin/master` is one dispatch commit ahead of the
freeze (frozen bytes provably unchanged), and (2) `git status --porcelain` is non-empty from
dispatcher/seat artifacts with the tracked tree clean.
