# RevQualityCriteria — QUALITY criteria 83–86 review (round-32 w2 falsify)

## Verdict

All four criteria hold on their substance: each cites a lesson row that exists and names it, each states an enforcement that exists in committed bytes or labels its limit as criterion 73 requires, 85's red state reproduces byte-for-byte at the content lines (mutant rebuilt in scratch from the frozen counter, exit 3, 39/41), 84 contradicts no earlier criterion and its four cited SCORECARD lines are verified gate rows inside the capability table, and 86's plain counts are runnable in both directions (green exit 0 on the lane receipt, four forgery shapes exit 1). Two blemishes, neither substantive: (1) **low** — criterion 85's second source pointer `corpus/lessons/round-32.md M4` is misdirected (M4's own fix clause names criterion 83; the lesson line that binds 85 is the E19 disposition); (2) **informational** — the committed capture `measure/c1-distinct-red-green.txt` v1 block pairs `driverSha256: null` with `driverReexports: true`, a pair the committed tool cannot emit in one run (single try/catch); the verdict (ok:false, exit 1) reproduces regardless.

## Per-criterion verdicts

### 83 (nudge-state re-derivation) — holds

- **Lesson citation:** `corpus/lessons/round-32.md` M1 exists (`:56`), class `stale-premise`, fix clause names "criterion 83 + class `m4-nudge-state` (v3)".
- **Enforcement exists:** `scripts/check-selfassessment.mjs` m4 section `:426-506` (statement match `:486`, class/doc hardcoded `SCORECARD.md` `:500`, wired `m4Findings(scorecard)` `:528`) — the criterion's "over `SCORECARD.md` round groups only" matches the code. Frozen-counter selftest: all nine `m4-*` cases PASS, `SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41`, exit 0 (`green-selftest.txt` in my output dir).
- **Rule citation accurate:** `AXES.md:66-69` §The stagnation nudge: "every axis the lane owns sits at or above the lane's saturation line and no capability has entered the table within the lane's stagnation window" — the criterion's quoted rule ("at or above", no capability entered within the window) is the source's own wording.
- **Red state reproduces as committed:** `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` (rev `5ad1fcbf`) has `mismatches: 18` with m4 findings at `SCORECARD.md:1473`, `:1515`, `:1576`, each `claimed: inactive, observed: active` — exactly the criterion's red-state sentence. The cited SCORECARD lines do carry `nudge inactive` statements (read at `:1473`, `:1515`, `:1576`).
- **Limits labeled and true:** "the same statement in `LOG.md`, a frozen `claims.json` or a lesson is read by hand" — code scans the scorecard only; "a round group without a six-axis `Axes at round start:` line is unread, not correct" — selftest case `m4-inputs-missing-not-counted` PASSes.

### 84 (capability-table rule) — holds

- **Lesson citations:** `corpus/lessons/round-32.md` M1 (`:56`) and `.ufo/waves/round-32/w1/CritAxisCapability.md` F1 (`:142`) both exist; F1 is the medium defect with counterfactual `B2-counterfactual.json` and the adopted-rule fix 84 states.
- **No contradiction with earlier criteria:** the only other `capabilit` occurrences in `corpus/QUALITY.md` are `:52` (round-13 runtime-harness sense — "admitting a capability" for worker results, unrelated to the table) and criterion 83's own text. No earlier criterion defines capability-table membership, so nothing to contradict. `AXES.md:60-64` ("Rows enter only through a round that demonstrates the capability running; a capability without a passing demonstration in the round report is pre-claiming") composes with 84's "names an operation the shokunin can now run, with its demonstration in the round report" — same rule, not a conflict.
- **Cited lines verified:** `SCORECARD.md:1243` ("`--selftest` (cases=22) … First-working round: 24"), `:1249` ("(cases=13) … First-working round: 24"), `:1306` ("(cases=17) … First-working round: 25"), `:1314` ("First-working round: 25") — all four are gate rows inside the "**Capability rows (appended; …)**" table (header `:1237`).
- **Enforcement exists for the backward clause:** "counted as entries by the nudge rule, which reads the table as committed" — `capabilityRounds()` parses `First-working round` naming from the committed scorecard text (`check-selfassessment.mjs:445-460`); the J1 control's observed states (rounds ≤30 `inactive` — correct while the window still held the round-25 rows — vs rounds 29–31 statements false) match the criterion's account. The forward clause ("a gate or counter never enters the table") is a curation rule with no code line behind it today; the criterion does not claim a counter enforces it, and it is the rule F1's fix adopts — within criterion 73's discipline this is a stated operative rule, not a false enforcement claim. Residual risk noted below.

### 85 (non-clean self-test is not an oracle) — holds; one low citation defect

- **Lesson citations:** `corpus/lessons/round-31.md` M11 exists (`:346`, class `vacuous`, fix "carried to round 32") ✓. `corpus/lessons/round-32.md` M4 exists (`:59`) but is the **m4-inputs instrument limit** whose own fix clause reads "criterion 83 requires the inputs be named" — it sources no clause of 85. The only lesson line binding criterion 85 is the E19 disposition (`:95`: "half-closed — v3 enforces the exit/verdict arm (criterion 85)").
  - **Defect (low):** 85's second source pointer is misdirected, and the M4 pointer it carries is the one 83's inputs-naming clause needs (83 cites only M1). Smallest append-only fix: a correction paragraph (round report errata or a future QUALITY append — `corpus/QUALITY.md` is append-only, never edit above) noting that 85's round-32 source is the E19 disposition and that M4 belongs to 83.
- **Enforcement exists:** refusal branch `scripts/check-selfassessment.mjs:190`; selftest case ids `v3-failed-summary-is-not-an-oracle` (`:854`), `v3-nonzero-exit-is-not-an-oracle` (`:860`).
- **Red state reproduces (rebuilt in scratch from the frozen counter):**
  1. `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b` → HEAD `b234a589…`; `sha256sum` → `check-selfassessment.mjs` `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`, `check-bidi-runtime.mjs` `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` = `frozenDigests`.
  2. Mutant: copy → `$S/m.mjs` (sha = frozen before edit), single edit at `:190`: condition `r.status !== 0 || (verdict && verdict[1] !== "clean")` → `false` (the documented mutant).
  3. `TMPDIR=$S/tmp node m.mjs --selftest` → **exit 3**; the two v3 cases FAIL (`expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL` ×2); `SELFASSESSMENT_SELFTEST verdict=failed cases=41 passed=39`.
  4. `grep -E "FAIL|SELFTEST" red-selftest.txt | diff - <committed capture>` → the two CASE lines and the summary line are identical; the only differences are the capture's framing lines (the `# mutant:` header, the `$` command line, the trailing `exit=3`).
  5. Green control: `TMPDIR=$S/tmp node clone/scripts/check-selfassessment.mjs --selftest` → exit 0, both v3 cases PASS, `verdict=clean cases=41 passed=41`.
- **Remaining limit correctly labeled:** "a gate that prints no summary line still falls back to the first `cases=` or `N/M` token" — code `:187` implements exactly that fallback; criterion 82's remaining limit is stated, not claimed enforced.

### 86 (plain distinct counts beside the gate) — holds; one informational capture note

- **Lesson citation:** `corpus/lessons/round-32.md` M2 (`:57`) exists; its fix clause names "criterion 86 and the plain distinct counts … (`measure/c1-distinct.mjs`; red on the v1/v2/v3 forgeries, green on the lane receipt: `measure/c1-distinct-red-green.txt`)".
- **Red state real:** `.ufo/waves/round-32/w1/CritC1Forgery.md` documents the four constructions (v1 re-export driver, v2 `R2`×16, v3 same path twice, v4 identical copies) all reaching `admitted: 16` under the frozen gate.
- **Plain counts runnable, both directions** (committed tool `measure/c1-distinct.mjs`, sha256 `64cad7c6926b5d12e6a4f8c1801205e4e2c56143c539360ba0a07aa667e57280`, run in my scratch clone at `b234a589`):
  - Green (lane receipt + entry): `rowsMarkedYes 16, distinctRowIds 16, duplicateListings 0, transcripts 2, distinctTranscriptPaths 2, distinctTranscriptDigests 2, driverSha256 55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a ≠ gate 2f25af5a…, driverImportsFromGate ["FIXTURE_SHA256, VIEWPORT, serveFixture"], ok: true` → **exit 0**; byte-identical to the committed capture's green block.
  - Red v2 (entry with every row id replaced by `R2`): `distinctRowIds 1, duplicateListings 15` → **exit 1**.
  - Red v3 (receipt citing the same transcript path twice): `distinctTranscriptPaths 1` → **exit 1**.
  - Red v1 (2-line re-export driver, path resolvable): `driverReexports true` → **exit 1**.
  - Red v4 (driver = the counter's own bytes): `driverEqualsGate true` → **exit 1**.
  - Each output covers the criterion's four named counts: distinct row ids, distinct transcript digests, driver digest vs the gate's, and the driver's imports.
- **Note (informational):** the committed capture's v1 block shows `driverSha256: null` together with `driverReexports: true`; under the committed tool the driver read is one try/catch (`:26-27`), so that pair is unreachable in a single run (resolvable → sha set ∧ reexport read; unresolvable → both unset). The capture is labeled "lane working tree (pre-commit; re-run at the measured revision in measure/)", and my rerun at the committed tool reproduces the verdict (ok:false, exit 1) but not that exact line pair. Smallest fix: re-capture the v1 block at the committed tool with a resolvable driver path (sha set ∧ `driverReexports: true`).

## Residual risk and verification gaps

- I did not re-run the live C1 gate or the full C2 `--rev` reading; those are other seats' scope. 85's and 86's assigned reproductions were run in full.
- 84's forward clause ("a gate or counter never enters the table") is a curation rule with no code line behind it today; if a future round lands a gate row in the table, the window resets by bookkeeping again and only the round report's disclosure would catch it.
- 83's "unread, not correct" behavior for a round group without an `Axes at round start:` line is verified via the selftest case (`m4-inputs-missing-not-counted`), not by a hand-built scorecard fixture.
- The mutant was built with one `edit` at `:190` on a byte-verified copy; no other byte differs (copy sha = frozen digest before the edit).

## Honesty / provenance

- Commands and exit codes (all run in `$S=/fast/scratch/hyaku/tabi-r32/RevQualityCriteria`, clone detached at `b234a58920134424e0d104f137311ff54a16d26b`):
  - `git clone --shared … && git checkout -q --detach b234a589…` → exit 0, HEAD verified.
  - `sha256sum clone/scripts/check-selfassessment.mjs clone/scripts/check-bidi-runtime.mjs` → both equal `frozenDigests` (exit 0).
  - `TMPDIR=$S/tmp node clone/scripts/check-selfassessment.mjs --selftest` → exit 0, `verdict=clean cases=41 passed=41`.
  - `TMPDIR=$S/tmp node m.mjs --selftest` (mutant) → exit 3, 2 FAIL cases, `verdict=failed cases=41 passed=39`; filtered output identical to the committed capture's content lines.
  - `node clone/.ufo/waves/round-32/measure/c1-distinct.mjs clone <entry> <receipt>` → green exit 0; four red fixtures exit 1 each. First red attempt used entry paths relative to the wrong root and crashed ENOENT (exit 1 for the wrong reason); rerun with absolute fixture paths — recorded here rather than hidden.
  - `git diff --numstat 4181fff b234a58 -- corpus/QUALITY.md` → `37 0` (append-only held); `git diff 4181fff b234a58 -- scripts/check-selfassessment.mjs scripts/check-bidi-runtime.mjs` → empty (counters frozen through the wave-1 integration).
- Network: none (no fetches needed). Tooling: nothing installed or upgraded. Browsers: none started — no `--live` leg was in scope; `pgrep -fa 'chromedriver|chromium'` after all work shows only `/usr/bin/earlyoom` (its `--prefer` argument contains the word "chromium"; not a browser process, not mine).
- Writes: lane untouched except this report, my output dir `.ufo/waves/round-32/w2/RevQualityCriteria/` (receipts copied: `green-distinct.json`, `green-selftest.txt`, `red-selftest.txt`, `red-filtered.txt`, `red-v1-reexport.out`, `red-v2-duplicate-rows.out`, `red-v3-same-path.out`, `red-v4-counter-driver.out`), and scratch `$S` (deleted after copy-out). Commits: none needed (no scratch-repo mutation beyond the detached clone).
