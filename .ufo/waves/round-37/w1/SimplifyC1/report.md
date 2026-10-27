# SimplifyC1 — YAGNI review of the round-37 frozen instrument diffs

Round 37 (attempt 1), wave w1. Lane: `tabi-shokunin`. Freeze: `99437d29de036415a9f2d0524343617a3b19988a`.
Assignment: diff v5 vs v4, v3 vs v2, build tool v2 vs v1, harness v2 vs v1; map every hunk to a
routed defect; name dead code, duplicated helpers, drive-bys; list anything deletable.

Read-only seat: no repo bytes were written outside this seat dir, no git mutation, no browser, no
subagents. Scratch root `/fast/scratch/hyaku/tabi-r37/w1/SimplifyC1/` (deleted before yield).

## 0. Digest gate (all claims inputs are the frozen bytes)

| file | sha256 | claims.frozenDigests |
|---|---|---|
| `counters/c1-adjacency-sweep-v5.mjs` | `9c6289b7…7bdd91752c` | `c1` ✓ |
| `counters/c2-firefox-bidi-v3.mjs` | `eda339eb…706b62e019` | `c2` ✓ |
| `counters/c1-drift-audit-build-v2.mjs` | `a85152cd…07762a9a96` | `buildTool` ✓ |
| `measure.sh` | `9f89697c…c3d6843302` | `measure` ✓ |

Predecessors extracted from the freeze commit (`git show 99437d29:…/round-36/counters/…`), so both
sides of every diff are the frozen bytes. Diff sizes: **C1 +33/−11 (10 hunks)**,
**C2 +90/−10 (11 hunks)**, builder +4/−1 semantics (3 hunks), harness +21/−9 (8 hunks).

## 1. Hunk → routed-defect map

### 1a. `c1-adjacency-sweep-v5.mjs` (v4 → v5)

Lesson numbering = `corpus/lessons/round-36-verifier-spotcheck.md` §"Routed defects and notes for
round 37"; counter labels = the header's own B1/B2/B3.

| # | v5 lines | change | defect |
|---|---|---|---|
| 1 | 1–21 | header rewrite: title + `B1/B2/B3` amendment block, each citing its lesson number | routed defects 1/3/4 (traceability; header is a `predicateSites` entry) |
| 2 | 74–82 | `// Predicate (frozen)` prose → the canonical one sentence | defect 4 (B3) |
| 3 | 87 | `SCHEMA = 'tabi-r37-c1-adjacency-sweep-v5'` | version identity |
| 4 | 95–96 | `const DELTA_PINS_SHA256` | defect 1 (B1) |
| 5 | 131 | `const PREDICATE_SENTENCE` | defect 4 (B3) — `predicateSites` |
| 6 | 387–389 | digest refusal on the pins blob at REV | defect 1 (B1) |
| 7 | 456–458 | `/:(\d)\b/` → `/\bverbatim at :(\d)\b/` | defect 3 (B2) |
| 8 | 539 | `deltaPinsSha256`, `predicateSentence` in the JSON out | defects 1/4 (evidence + `receipt.predicateSentence`) |
| 9 | 587 | `&& pinsDigest === DELTA_PINS_SHA256` | defect 1 (B1) — see N3 |
| 10 | 632/636/639 | console tag `V4` → `V5` | version identity |

Every hunk is accounted for. No hunk lacks a routed item.

### 1b. `c2-firefox-bidi-v3.mjs` (v2 → v3)

| # | v3 lines | change | routed item |
|---|---|---|---|
| 1 | 1–23 | header: `B1/B2/B3` + S143 grounding, each citing "routed defect 8" | routed defect 8 (traceability) |
| 2 | 67–75 | predicate prose → canonical sentence | claim target / `predicateSites` |
| 3 | 86–88 | `SCHEMA` bump **and** `COUNTER_PATH` → self | identity; `COUNTER_PATH` is semantic (the A4 self-sniff must name *this* file, else a driver that is a copy of v3 is missed) |
| 4 | 113–121 | `PREDICATE_SENTENCE`; `GIT_NO_REPLACE_OBJECTS: '1'` in the single `git()`; `replaceRefs()` | claim target (B4 label — N1) + defect 8 (B1) |
| 5 | 337–342 | teardown survivor scan/SIGKILL/count | defect 8, abnormal-exit arm (B2) |
| 6 | 401–431 | `observedFinding()` | defect 8, `CritC2b` unauthenticated decoration (B3) |
| 7 | 465–475 | `scratchSurvivors()` | same as #5 |
| 8 | 526–528 | refuse a clone carrying any `refs/replace/*` | defect 8 (B1) |
| 9 | 599 | invoke `observedFinding()` per receipt run | B3 |
| 10 | 681–683 | `out.survivors`, `out.predicateSentence`, `survivors === 0` in the predicate | B2 + `predicateSites` |
| 11 | 703/707 | console tag `V2` → `V3` | version identity |

### 1c. `c1-drift-audit-build-v2.mjs` (v1 → v2)

| # | v2 lines | change | defect |
|---|---|---|---|
| 1 | 1–9 | header states the 39-hex repair + the new failure mode | routed defect 2 |
| 2 | 24 | `kama` 39-hex → `e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d` | routed defect 2 |
| 3 | 62–64 | resolve every `PINS` entry in its sibling repo before any work | routed defect 2 ("loud, never silent") + C1 target "resolves every PINS entry" |

No other change: no output-format change, no delta-pin handling change, no argument change.

### 1d. `measure.sh` (r36 → r37)

| # | lines | change | routed item |
|---|---|---|---|
| 1 | 1–6 | header names both repaired arms | defect 5 |
| 2 | 9 | `OUT=$(realpath -m "$2")` | defect 5 (numstat written into a directory the harness had left) |
| 3 | 13 | scratch root → `tabi-r37/L1/m` | mechanical |
| 4 | 19–24 | `C1`/`C2` → v5/v3; add `R36C1`/`R36C2`; **drop** `R34C1`/`R34C2` | mechanical + rolling window (see §3) |
| 5 | 25–26 | fetch + run the two round-36 counters | **not routed** — see D1 |
| 6 | 56 | `--worktree --repo $d` (was `--worktree --rev HEAD`) | defect 5, freshness arm — verified legal: `scripts/check-freshness.mjs:48-52` accepts `--worktree` + `--repo PATH`, and `--rev` is not a flag at all |
| 7 | 67–69 | numstat from the clone (`git -C "$d"`) | defect 5 |
| 8 | 65–66 | comment wording | nit (N6) |

## 2. Nothing semantic was deleted

The 11 removed C1 lines and 10 removed C2 lines are, exhaustively: 2 title lines each, the
superseded predicate prose block, one `SCHEMA` literal (`+ COUNTER_PATH` in C2), one `git()` env
literal, the replaced predicate conjunct, and the console tag strings. **No check, refusal,
invariant paragraph or write-scope statement was removed.** The amendments are additive plus
identity renames.

Builder: the only removed token is the 39th character of the kama pin.

## 3. Dead code, duplication, drive-bys

- **No duplicated helper.** `observedFinding()` reuses pre-existing `sessionOf`/`capsOf`/
  `contextIds`/`firstShot`/`WS_SESSION` (all present in v2 at lines 315/328/340/341/89 — grepped
  both files). `scratchSurvivors()` is new but has no prior twin (`egressPids` is a different
  /proc walk with a different predicate). One `git()` helper in v3; the only other `spawnSync` is
  binary `--version` probing (line 221), unchanged.
- **Accepted duplication:** the 20-entry `PINS` table exists in both `c1-adjacency-sweep-v5.mjs`
  and `c1-drift-audit-build-v2.mjs`. Verified equal, programmatically, entry for entry; the kama
  value now agrees with `round-35/baseline/c1-pins.json:9`. Sharing a module would couple two
  independently-digested frozen instruments — keep the duplication.
- **No drive-by at commit level:** `git show --name-only 99437d29` = 17 files, all under
  `.ufo/waves/round-37/`, **0 deletions**, **0 files outside `.ufo/`** (no corpus/SKILL/SCORECARD
  bytes touched).
- **Rolling window is not a drive-by.** Dropping the round-34 legs looks asymmetric next to
  adding round-36 legs, but round-36's harness carried r35+r34 and round-35's carried r34+r33;
  r37's r36+r35 keeps the window at exactly two prior rounds. Consistent, not a loss of policy.

## 4. Falsifiers run (cheap, decisive, read-only)

1. **Builder v1 ≡ builder v2, and v2 ≡ the committed ledger.** `node c1-drift-audit-build-v2.mjs
   --out <scratch>` → `307 rows (304 unchanged, 3 moved, 0 stale)`, byte-identical to
   `drift-v1.tsv` and to `corpus/adjacency-screen-drift.tsv`. ⇒ the pin correction and the
   startup resolution loop are **output-neutral / validation-only**.
2. **The new loop catches the exact routed defect.** `git -C kama-shokunin rev-parse --verify
   --quiet e8fa87ef19ec5eb28f5fd9701a0a42a45bd688d^{commit}` (the 39-hex literal) → exit 1. The
   startup loop would have refused it.
3. **Why the old bug was inert — corrected mechanism.** `round-36/baseline/c1-delta-pins.json`
   carries kama at head `3a600d2f…` (drifted) and kama has 9 rows in
   `adjacency-screen-browser.tsv`. `drifted` is `head !== PINS[s]`, so while kama is drifted the
   pin's own value is invisible. The exposure is a *stable-kama* round: the 39-hex literal then
   marks kama drifted and emits those 9 rows. Sharper than the lesson's "inert on this round's
   pin set", and it confirms the pin is now load-bearing.
4. **Predicate sentences are byte-identical across all three sites, both claims** (programmatic
   `===` of `claims.json.predicate` vs header sentence vs `PREDICATE_SENTENCE`): C1 true/true,
   C2 true/true.
5. **`DELTA_PINS_SHA256` is the real blob digest** at the freeze:
   `810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655` = `sha256(git show
   99437d29:.ufo/waves/round-36/baseline/c1-delta-pins.json)`.
6. **`--worktree --repo` is per-contract** for `check-freshness.mjs` (§1d #6) — the round-36
   `--rev` flag does not exist, so the old leg genuinely could not pass.
7. **The C2 `'uuid'` exemption is grounded, and narrow.** `corpus/evidence/round-35/bidi-firefox/
   receipt.json` really carries `"sessionId": "uuid"` in both runs, and both also carry a real
   `webSocketUrl` whose session segment is still cross-checked against the transcript sid — so
   the exemption cannot launder the identity.
8. **Control receipts read as the claims' before/target states:** J1 v4 exit 0 / v5 exit 2
   (digest refusal); J2 v4 exit 1 / v5 exit 0; J3 v5 exit 0 predicate true; J1 v2 exit 0 / v3
   exit 2 (`refs/replace/88f73cf2…`); J2 v2 exit 0 / v3 exit 1 (`observed captureScreenshot.sha256
   != transcript first screenshot`); J3 v3 predicate true, admitted 16, survivors 0.
9. `node --check` clean on all three counters.

## 5. Deletion / fix candidates (ranked; none blocks a claim term or a kill rule)

- **D1 — `measure.sh` lines 25–26 (r36c1/r36c2 legs): the one unrouted harness addition.**
  Nothing in either claim's predicate/target needs the *old* counters re-run at REV, and `r36c2`
  launches a second live Firefox+geckodriver session per measurement (round-36 ran 2 live C2
  counters, round-37 now runs 3: v3 + r36 v2 + r35 v1). Counter-argument: the baseline receipts
  for v4/v2 are attack fixtures (J1/J2), so these legs are the *only* honest-state control for
  the old instruments, and they isolate "the amendment did not change the honest verdict".
  **Recommendation:** keep `r36c1` (cheap, offline); either drop `r36c2` or keep it and make the
  round report cite it explicitly as the old-instrument honest-state control. Do not let it be
  cited as a defect repair.
- **D2 (fix, one line) — survivor count inflation, v3:341.** `survivors = survivors.concat(
  scratchSurvivors(scratch))` re-lists pids already counted, so a process still alive after
  SIGKILL is counted twice. `rec.survivors` is consumed only as `=== 0`, and the header's
  semantics are "survivors are SIGKILLed and counted", so the verdict is unaffected; the receipt
  magnitude is. Minimal form: `if (survivors.length) await sleep(500); rec.survivors =
  scratchSurvivors(scratch).length;` (or name the field `killed` if the current semantics are
  intended).
- **D3 (fix, one line) — phantom `B4`.** v3:113 says `// B4 discipline:` but the header lists only
  B1–B3, and B3 is the observed-decoration binding. The predicate-sentence work is a claim-target
  term, not an amendment over v2 — so either relabel to `// target:` or add a fourth amendment
  line. Traceability is the header's whole purpose.
- **D4 (optional, one line) — tautological conjunct, v5:587.** `pinsDigest === DELTA_PINS_SHA256`
  is unreachable-false: v5:389 already threw a `Refusal` on mismatch. It costs nothing and mirrors
  the declared sentence term, so keep it if desired — but do not count it as an independent guard,
  and do not let a future reviewer "fix" the digest check thinking there are two.
- **D5 (optional, ~4 lines) — double derivation on moved rows, v5:461–465.** `obs` (built at
  v5:430) already carries `relocations`, derived from the same head bytes, so `hl`/`cited`/`nn`
  re-reads the pin and head blobs for a value the run already holds; `obs.relocations.includes(nn)`
  is equivalent. Pre-existing v4 code that the B2 hunk had to touch anyway. Keep as deliberate
  double-entry or consolidate — genuine 50/50, not a defect.
- **D6 (nit) — harness comment, `measure.sh:65`.** "numstat stays inside the clone's cwd" — the
  cwd is not changed; `git -C "$d"` selects the repo. The code is right, the sentence is not.

## 6. Preserved contract

- v5 keeps every v4 semantic and adds exactly three behaviours: pins-blob digest refusal,
  canonical-clause relocation parse, single predicate sentence. v3 keeps every v2 semantic and adds
  exactly three: replace-object refusal (env-wide + clone enumeration), teardown survivor leg,
  observed-decoration binding.
- The round's actual target — one byte-identical predicate sentence in `claims.json`, the counter
  header and the counter's own constant — holds for both claims (§4.4).
- Frozen bytes were not amended after data: all four instrument digests equal
  `claims.frozenDigests` (§0).
- Do-nothing lane remains falsifiable: v4/v2 attack receipts still exit 0 (§4.8).

## 7. Tradeoffs accepted (name them, don't fix them)

- **Over-broad replace refusal:** any `refs/replace/*` in the measured clone refuses, even a
  legitimate one. Correct for a verifier; it fails closed.
- **Canonical-clause parse is a contract, not a courtesy:** a truthful moved note that words its
  relocation differently is now refused (`audit-moved-no-relocation`). Soundness is unaffected —
  the parsed line is still checked against the cited text (v5:463) — so B2 loosens an over-strict
  parse without weakening verification.
- **Builder is not replace-hardened:** `c1-drift-audit-build-v2.mjs` has no
  `GIT_NO_REPLACE_OBJECTS`. Harmless: the counter re-derives every drift status from git bytes in
  its own hardened `git()`, so it never trusts the ledger it audits.

## Verdict

VERDICT ok — both counter diffs are minimal: every hunk traces to a routed defect or a version
identity rename, nothing semantic was deleted, no duplicated helper, no drive-by (the freeze
commit touches 17 files, all under `.ufo/waves/round-37/`, zero deletions). Preserved contract:
v4/v2 semantics intact on the honest state, both predicate sentences byte-identical across their
three sites, and all four instrument digests equal the frozen claims. Six non-blocking items:
D1 one unrouted harness addition (one extra live Firefox session per measurement — keep offline,
justify or drop the live one); D2 survivor field can double-count an already-failing case; D3 a
phantom `B4` label in the v3 header; D4 a tautological predicate conjunct in v5 (harmless, keep or
drop); D5 an optional double derivation on moved rows; D6 one inaccurate harness comment.
