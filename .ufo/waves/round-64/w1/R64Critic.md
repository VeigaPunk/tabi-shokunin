# R64Critic — tabi round 64, wave w1

Seat: critic (leaf). Assignment: falsify C1 and C2 **on their text**, not on their instruments.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline `6c19979f`; instrument/controls freeze
`0fc68043`. All commands below were run read-only from the lane root unless a scratch path is named;
receipts are in `.ufo/waves/round-64/w1/R64Critic/`.

Pin re-check before anything else (`sha256` of all ten `pins` in `claims.json`):

```
python3 -c "…sha256 each pin…"                       → 10/10 OK in the worktree
git show 0fc68043:<pin> | sha256sum                  → 10/10 OK at the freeze revision
git diff --name-only 32726b8d 0fc68043               → only .ufo/waves/round-64/claims.json
```

No frozen byte has changed; the freeze is intact and the controls were committed in the parent commit
`32726b8d`, i.e. **before** the freeze (see F21).

---

## Findings

### C1 — coverage, capability `chromium-wheel-scroll-domain-linux`

**F1 (medium) — `liveRuns: 2` has no emitter and cannot fail.**
- claim line: C1 `target.liveRuns: 2`; kill rule 2 "runs fewer than two live runs".
- command: `node scripts/verify-live-r64.mjs --scratch <ABS> --driver … --counter … --evidence … --evidence-shots … --json`
- observed: the verifier emits `runs` (an array) and never a count. The array is filled by
  `for (const name of ['a','b']) { … out.runs.push(entry) }` — one entry per name, unconditionally, even
  when both attempts of a run fail. `--no-run` is the only path that yields `runs: []`
  (`live-no-run.json`: `runs 0`, `findings ['live-run-required']`). Receipt: `live-verify-critic.json`
  (`runs` length 2, `attempts [0]`).
- verdict: the value is a structural constant of the loop; the kill clause "runs fewer than two" can only
  fire on the no-work control, which is expected to fail anyway. **Unemitted + vacuous.**

**F2 (medium) — `mutantsDistinguished` / `mutantsSurviving` are not emitted fields (D5 class repeats).**
- claim line: C1 `target.mutantsDistinguished: 16`, `target.mutantsSurviving: 0`; statement "the 16
  exact-line mutants are all distinguished".
- command: `node .ufo/waves/round-64/counters/mutate-r64.mjs run --counter … --negatives … --receipt .ufo/waves/round-64/controls/smoke/receipt.json --shot .ufo/waves/round-64/controls/smoke --driver … --out <ABS> --json`
- observed: `{"mutants":16,"applied":16,"liveAccepted":16,"killed":16,"loadBearing":16,"redundant":[],"surviving":[]}`
  — the key `distinguished` does not exist in the matrix (`'distinguished' in d` → False); the human line
  prints `killed=16 … survived=0`. The r63 matrix *did* carry `distinguished:true` per row (r63 spot-check §2 C1),
  so the r64 matrix regressed the vocabulary while the claim kept the word.
- verdict: 16/16 and 0 are true of `killed`/`surviving`; two of the claim's target names have no producing
  command. **Unemitted.**

**F3 (low) — `redBeforeRefused: 4` and `disclosedLimitAccepted: 1` have no emitting command.**
- claim line: C1 `target.redBeforeRefused`, `target.disclosedLimitAccepted`.
- command: `python3 -c "…read controls/summary.json…"`; `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs .ufo/waves/round-64/controls/red-before/synthetic-rendering/receipt.json --driver … --shot … --json`
- observed: `summary.json` lists 14 results with `exit`/`expect`/`ok`; no `redBeforeRefused` or
  `disclosedLimitAccepted` key exists anywhere. Both are derived by the reader (4 refused = the four
  exit-1 controls; 1 accepted = `red-synthetic-rendering` exit 0). The synthetic control does pass:
  `predicate True findings []`, exit 0 (`counter-synthetic.json`).
- verdict: derived, not emitted. **Unemitted (minor).**

**F4 (high) — the verifier does not run "the frozen driver"; it runs whatever bytes you hand it.**
- claim line: C1 statement "runs the frozen r64 driver twice cold"; kill rule 1 (pins); `limits`
  "its own runs are the same driver it verifies".
- command: `cp scripts/chrome-cdp-loopback-round64.mjs /fast/scratch/hyaku/tabi-r64/R64Critic/driver-mod.mjs && printf '\n// modified\n' >> driver-mod.mjs && node scripts/verify-live-r64.mjs --scratch <ABS> --driver <ABS>/driver-mod.mjs --counter .ufo/waves/round-64/counters/chromium-wheel-r64.mjs --evidence .ufo/waves/round-64/controls/smoke/receipt.json --evidence-shots .ufo/waves/round-64/controls/smoke --json`
- observed: `predicate False`, `findings ['evidence-counter']`, `driverSha256 14a89b6c…` (frozen pin is
  `1ff560cc…`), and **both live runs passed the frozen counter**: `runs [('a',0,0),('b',0,0)]` (exit 0,
  counterExit 0). Only the pre-existing smoke evidence receipt (which records the frozen hash) refused it.
  Cause, in the frozen bytes: `const driverSha = sha(fs.readFileSync(driver))` is passed to the counter as
  `--expect-driver-sha256`, so `driver-binding` inside the verifier compares the receipt to the same file
  it just executed. Nothing in `verify-live-r64.mjs` or `chromium-wheel-r64.mjs` compares against the pin.
- verdict: "frozen driver" is a prose property of the design, not an enforced one. A scored evidence receipt
  produced by the modified driver would satisfy every clause. **Overreach in the claim text.**

**F5 (medium-high) — `evidenceAgreement` does not bind the committed evidence.**
- claim line: C1 statement "requires the committed evidence receipt to agree with its own live run on those
  fields"; `target.evidenceAgreement: true`.
- command: `node scripts/verify-live-r64.mjs --scratch <ABS> --evidence .ufo/waves/round-64/controls/red-before/synthetic-rendering/receipt.json --evidence-shots .ufo/waves/round-64/controls/red-before/synthetic-rendering … --json`
  (and, pre-existing, the committed `controls/live-verify.command.json`, whose `--evidence` is the **design
  smoke receipt**, not the committed evidence at all).
- observed: `SYNTH_RESULT` (see `live-verify-synthetic-evidence.json`). The synthetic-rendering forgery — a
  receipt the lane itself commits as a **disclosed limit**, never produced by a browser, counter exit 0
  (`counter-synthetic.json`) — is accepted as "the evidence receipt": its legs/wheellog/pageState are copied
  from the smoke receipt, so the agreement clause is satisfied by construction. The committed control already
  demonstrated this: `controls/live-verify.stdout` prints `"agreement": {"crossRun": true, "evidence": true}`
  while `evidence.path` is `…/controls/smoke/receipt.json`.
- verdict: the clause adds nothing beyond "the evidence receipt passes the counter". The claim's sentence
  "the **committed** evidence receipt … agree[s] with its own live run" describes a binding the instrument
  does not implement. **Overreach.**

**F6 (low) — "twice cold" is up to four launches.**
- claim line: C1 statement "runs the frozen r64 driver twice cold in its own scratch (nonces tabi-r64-live-a/-b)".
- command: read `scripts/verify-live-r64.mjs:76-101`; receipt `live-verify-critic.json` `attempts [0]`.
- observed: `for (let attempt = 1; attempt <= 2; attempt++)` per run: a failed launch is retried with fresh
  ports and a fresh dir. The claim text does not mention the retry; `attempts` is emitted per run but no
  target names it.
- verdict: text omits the retry; a scored run may be the second attempt. **Minor text gap.**

**F7 (medium) — kill rule 2's run-count clause is unreachable on the scored path.** Covered by F1.
- claim line: C1 kill rule 2.
- command: as F1.
- observed: `out.runs` always has two entries on the normal path; only `--no-run` yields 0.
- verdict: **vacuous** (see vacuity list V1).

**F8 (medium) — kill rules 5/6/8 assert counts that are structural constants of the frozen bytes.**
- claim line: C1 kill rules 5 ("29 declared negatives"), 6 ("16 exact-line mutants"), 8 ("case count is not 31").
- command: `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs --selftest --scratch <ABS>` →
  `TABI_R64_COUNTER_SELFTEST verdict=clean cases=31 passed=31`; `make-negatives` → `negatives 29`; `mutate` → `mutants 16`.
- observed: `cases = 1 clean + CHECK_IDS.length (29) + 1 positive control = 31`; `negatives` iterates
  `CHECK_IDS`; `mutants` is the literal `MUTANTS` array. All three are frozen by the pins, so post-freeze
  they can only move if a pin moves — already kill rule 1.
- verdict: the count clauses carry no coverage signal; only the "exits nonzero / accepted" clauses do.
  **Vacuity (V2).**

**F9 (low) — kill rule 6 contradicts the matrix's own exit predicate.**
- claim line: C1 kill rule 6 "…or a mutant refuses the live receipt (blanket refusal is never a kill)".
- command: read `.ufo/waves/round-64/counters/mutate-r64.mjs:115` (`process.exitCode = … liveAccepted === matrix.mutants …`).
- observed: a mutant that refuses the live receipt makes `liveAccepted < 16` → matrix exit 1, i.e. a red
  control, i.e. the battery reports a failure the rule says is not a kill.
- verdict: rule and instrument disagree on what a refusing mutant means. **Inconsistency.**

**F10 (low) — the r63 failure class is miscounted and mislocated.**
- claim line: C1 statement "a hand-written receipt with **six** 1x1 PNGs"; `before` "a hand-written receipt
  with **four** 1x1 PNGs (r63 spot-check §2 C1 no-work row)"; `controlsCommittedBeforeFreeze.redBefore`
  "red-before/* — one-by-one, borrowed-shots, no-shots, **r63-receipt**, synthetic-rendering".
- command: `sed -n '25,70p' corpus/lessons/round-63-verifier-spotcheck.md`; `ls .ufo/waves/round-64/controls/red-before/`;
  `python3 -c "…r63 receipt legs…"`
- observed: the r63 spot-check records **four** 70-byte 1×1 PNGs; the r64 six-PNG class is a *new* forgery over
  the six-leg r64 receipt. `red-before/` holds four dirs (`borrowed-shots`, `no-shots`, `one-by-one`,
  `synthetic-rendering`) — there is no `red-before/r63-receipt`; that control is
  `controls/red-r63-receipt.command.json` pointing at `corpus/evidence/round63/chromium-wheel-scroll/receipt.json`
  (whose legs carry **no** shot fields at all; it exits 1 with 14 findings, `red-r63-receipt.stdout`).
- verdict: two prose inaccuracies inside one claim (count, path). **Text fidelity.**

**F11 (medium) — `afterCommand` is not a runnable command and its evidence does not exist.**
- claim line: C1 `afterCommand` (`--scratch <ABS>`), and `--evidence corpus/evidence/round64/chromium-wheel-scroll/receipt.json`.
- command: `ls corpus/evidence/round64` → `No such file or directory`; `git ls-tree -r --name-only 0fc68043 -- corpus/evidence/round64/ | wc -l` → 0.
- observed: the placeholder `<ABS>` is not a path; the evidence tree is absent at the freeze and now. The
  claim's `freezeRule` says "Every scored command names a committed revision" — this one names neither a
  revision nor a path.
- verdict: the scored command cannot be run as written; `evidenceAgreement` is unmeasurable until the wave
  writes the tree. **Unrunnable as written.**

**F12 (medium) — the mutant matrix is killed by construction.**
- claim line: C1 statement "the 16 exact-line mutants are all distinguished"; `target.mutantsDistinguished: 16`.
- command: `mutate-r64.mjs run …` (F2) + `make-negatives-r64.mjs` (F8).
- observed: each mutant loosens exactly one named check; the negative generated for that same check (by the
  counter's own `forge`) is the one the mutant then accepts → `negativesAccepted == [m.check]` for all 16 rows
  (`mutants.json` rows). `loadBearing` (`checkStillReported === false`) is implied by `killed` and adds nothing.
- verdict: 16/16 shows the negatives are sensitive to the mutated line, not that any check catches an
  independent forgery. The r63 spot-check's independent 29-mutant battery (9 distinguished / 19 survivors)
  is the relevant prior; nothing here re-runs it. **Calibration caveat.**

### C2 — calibration, receipt provenance

**F13 (high) — the matrix checks never run on the committed population.**
- claim line: C2 statement "…and a matrix file naming its input and its producing command"; kill rule 5;
  the r63 D4 class this claim says it closes.
- command: `node scripts/check-receipt-provenance.mjs --dir .ufo/waves/round-64/controls --repo . --json`
- observed: `checked 16 matrices 0 failures 0 ok True`. The scan is
  `readdir(dir).filter(f => /^matrix.*\.json$/.test(f) && !f.endsWith('.command.json'))` — a filename must
  **start** with `matrix`. The committed aliases are `mutants-matrix.json` and `negatives-matrix.json`, so
  `matrices` is 0 and neither `matrix-input` nor `matrix-command` ever evaluates. Renaming a copy to
  `matrix.json` makes the branch fire (`gate-matrix-name.json`: `matrices 1 failures 1 byCheck {'matrix-command':1}`).
- verdict: D4's repair is dead code against the lane's own naming. **Instrument defect (report, do not edit).**

**F14 (medium-high) — `matrix-input` checks neither existence nor digest.**
- claim line: C2 statement "a matrix file naming its input and its producing command".
- command: `node scripts/check-receipt-provenance.mjs --dir <ABS>/fabricated --repo . --rev 0fc68043 --require-committed --min-receipts 1 --json`
- observed: a matrix with `input.path = "never/read.json"` (nonexistent) and `input.sha256 = "a"*64` (bogus)
  yields `checked 2 matrices 1 failures 0 ok True`, exit 0. `checkMatrix` only tests
  `typeof inp.path === 'string' && HEX64.test(inp.sha256)`.
- verdict: "naming" is literally what it does; the class is counted but nothing is compared to repo state.
  **Weak check, honestly worded.**

**F15 (medium-high) — "real argv (not prose)" is not enforced.**
- claim line: C2 statement "real argv (not prose)".
- command: `node scripts/check-receipt-provenance.mjs --dir <ABS>/prose --repo . --rev 0fc68043 --require-committed --min-receipts 1 --json`
- observed: `argv: ["node","verify the wheel receipt twice cold"]` → `failures 0 ok True`, exit 0. The prose
  heuristic only rejects empty args, double spaces, `inline:` and `…`; `argv[0]` need only be one of
  node/python3/bash/sh/curl/git.
- verdict: a sentence with single spaces is a "real argv". **Overreach.**

**F16 (medium-high) — "a committed stdout file" is not checked against the commit.**
- claim line: C2 statement "a committed stdout file whose digest matches its bytes".
- command: as F14/F15 (`fake.stdout` is untracked, `rev` = `0fc68043`).
- observed: `failures 0 ok True`. `checkReceipt` reads `stdoutFile` with `fs.readFileSync(path.join(path.dirname(file), stdoutFile))`
  — the working tree, never `readAt(repo, r.rev, …)`. Only `inputs` go through `readAt`.
- verdict: the digest is bound to whatever bytes sit on disk; "committed" is unenforced. **Overreach.**

**F17 (medium) — kill rule 5 has no emitter.**
- claim line: C2 kill rule 5 "…the report names every receipt it counts".
- command: as F13.
- observed: the gate emits `checked` (a number), `matrices` (a number) and `findings` (failures only). No
  list of counted files. To name them I had to `ls .ufo/waves/round-64/controls/*.command.json | wc -l` (16).
- verdict: the anti-gaming rule depends on prose the instrument cannot produce. **Unenforceable (V3).**

**F18 (low) — kill rule 2's case count is structural.**
- claim line: C2 kill rule 2 "case count is not 9".
- command: `node scripts/check-receipt-provenance.mjs --selftest --scratch <ABS>` → `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=9 passed=9`.
- observed: `cases = 1 clean + 8 CHECK_IDS = 9`, frozen by the pin.
- verdict: tautology post-freeze (V2).

**F19 (high) — the after-population does not exist and has no producer.**
- claim line: C2 `afterCommand` (`--dir .ufo/waves/round-64/controls/scored … --min-receipts 12`), `target.checked: ">=12"`, kill rule 3.
- command: `ls .ufo/waves/round-64/controls/scored` → absent; `grep -o "controls/scored[^\"]*" .ufo/waves/round-64/w1-spec.json .ufo/waves/round-64/w1-dispatch.json` → no match;
  `node scripts/check-receipt-provenance.mjs --dir .ufo/waves/round-64/controls --repo . --rev 0fc68043 --require-committed --min-receipts 12 --json`
- observed: no such dir at the freeze or now, and no seat in the 12-seat spec is assigned to produce it. The
  lane's *existing* 16 round-64 control receipts, run through the afterCommand's own flags, give
  `checked 16 failures 16 byCheck {'rev-committed': 16}` exit 1 — every one names `rev: "worktree"`.
  With `--rev worktree` they are clean (`checked 16 matrices 0 failures 0 ok True`).
- verdict: the after-state is a population that must be written to satisfy the gate; nothing in the round
  commits to writing it. **Target without a producing command.**

**F20 (medium) — the before-state is bound to the worktree, not to the revision its argv names.**
- claim line: C2 `before` "…`--rev <baseline>` -> exit 1, checked 11, failures 34 (schema 11, stdout-bound 11, inputs-bound 11, argv-real 1)"; `controlsCommittedBeforeFreeze.gateBefore` "at baseline".
- command: `node scripts/check-receipt-provenance.mjs --dir .ufo/waves/round-63/controls --repo . --rev 6c19979f… --json`
- observed: reproduced exactly — `checked 11 failures 34 byCheck {'schema':11,'stdout-bound':11,'inputs-bound':11,'argv-real':1}`,
  exit 1. But `controls/gate-before.command.json` records `"rev": "worktree"` while its own `argv` carries
  `--rev 6c19979f…`; the gate binds `inputs` at `r.rev` (= worktree), not at the argv revision. `summary.json`
  likewise records `"revs": ["worktree"]` for the whole pre-freeze battery.
- verdict: the number is real and reproducible, but "at baseline" is true of the receipt's `dir`, not of the
  bytes its inputs were hashed against. **Minor provenance gap.**

### Cross-cutting

**F21 (verified, not a defect) — the frozen-before-scoring ordering holds.**
- claim line: `ordering` "The failing-before controls … were EXECUTED AND COMMITTED BEFORE this freeze".
- command: `git diff --name-only 32726b8d 0fc68043` → `.ufo/waves/round-64/claims.json` only;
  `git show 0fc68043:<pin> | sha256sum` → 10/10 match; `git cat-file -s 32726b8d:.ufo/waves/round-64/controls/smoke/receipt.json` → 5291.
- observed: the whole controls tree (incl. `summary.json`, `smoke/receipt.json`, the 29 negative dirs, the 16
  mutant dirs) is byte-identical at the parent commit and at the freeze; the freeze adds only `claims.json`.
- verdict: **the ordering claim is true.**

**F22 (medium) — r63 D2 is unfixed and undeclared.**
- claim line: `ordering` "Read the … r63 rejected verifier spot-checks and the r63 lesson before declaration".
- command: `grep -n "194 could-not-evaluate" SCORECARD.md`
- observed: `SCORECARD.md:3465` still prints "194 could-not-evaluate and 58 superseded"; no correction line
  naming 142/59 exists (the r63 correction block corrects `:3427`, artifact durability and note counts only).
- verdict: a routed defect read before declaration, left unfixed with no disclosed limit. **Silent drop.**

**F23 (medium-high) — D8 recurs verbatim in the round-64 knowledge note.**
- claim line: C1 `limits` / the round's knowledge note provenance.
- command: `git ls-files --error-unmatch corpus/knowledge/chromium-wheel-scroll-round-64.md`;
  `sed -n '1,8p' corpus/knowledge/chromium-wheel-scroll-round-64.md`
- observed: the note is **untracked** (`did not match any file(s) known to git`) and carries
  `verified-at: 0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741`, a revision at which the note does not exist; it
  also states "Written from committed bytes only: … and the scored receipt
  `corpus/evidence/round64/chromium-wheel-scroll/receipt.json` with its shot bytes" — that path is absent at
  the freeze and now.
- verdict: same class as r63 D8, unfixed. **Recurrence.**

**F24 (observation, medium) — the verifier is not reproducible under fleet load.**
- claim line: C1 `afterCommand` / `target.livePredicate`.
- command: the afterCommand invocation with `--evidence` pointed at the committed smoke receipt, run at 22:02–22:17
  under load average 12.6: `node scripts/verify-live-r64.mjs --scratch <ABS>/verify-synth-evidence … --json`
- observed: all four driver attempts failed — `run-a`, `run-a-retry`, `run-b`, `run-b-retry` each wrote a
  receipt with `failures [{'id':'drive-error','detail':'no loopback page target'}]`, `sweeps {preLaunch:0,midRun:0,postKill:0}`
  after the driver's 1600×150 ms poll budget (~240 s per attempt). The same frozen driver invoked directly
  completes in **3.93 s** (`predicate True`, six legs, `driver-direct.out`), and a fresh verifier run at
  load 5.0 completes in **8.21 s** (`live-verify-critic.json`, `predicate true`, `attempts [0]`).
- verdict: not a text defect, but the scored after-pass needs two cold runs and the retry budget (2×240 s)
  did not rescue a loaded host. **Reproducibility risk; disclose it or the scored pass will be read as red.**

**F25 (low) — "14 controls" vs 16 counted receipts.**
- claim line: `controlsCommittedBeforeFreeze.summary` "14 controls; each with argv/exit/stdout digest/inputs".
- command: `ls .ufo/waves/round-64/controls/*.command.json | wc -l` → 16; `python3 -c "…summary.json…"` → `controls 14`.
- observed: 14 battery entries plus the two matrix alias receipts (`negatives-matrix`, `mutants-matrix`) =
  16 `.command.json` files, which is what the gate counts.
- verdict: harmless but the claim's count and the gate's `checked` differ by 2. **Minor.**

---

## Vacuity list

| # | Rule | Why it cannot fire / why it is satisfied by a broken instrument |
|---|---|---|
| V1 | C1 kill rule 2, clause "runs fewer than two live runs" | `out.runs` receives exactly one entry per name in `['a','b']` on every non-`--no-run` path, even when both attempts fail. Only the no-work control yields 0 runs. |
| V2 | C1 kill rules 5/6/8 count clauses (`29`, `16`, `31`) and C2 kill rule 2 (`9`) | Each count is `CHECK_IDS.length` / `MUTANTS.length` of frozen bytes: `cases = 1 + CHECK_IDS + 1`. Post-freeze they can only change with a pin change (kill rule 1). A broken counter with 29 always-firing checks still prints `checks 29`, `cases 31`. |
| V3 | C2 kill rule 5, "the report names every receipt it counts" | No command emits the counted-file list; the gate prints `checked` as a count and `findings` for failures only. A population reduced to 12 clean receipts is indistinguishable from a population of 12 re-derivable ones. |
| V4 | C1 kill rule 6, parenthetical "blanket refusal is never a kill" | The mutant matrix exits nonzero when `liveAccepted !== mutants`, so a live-refusing mutant *is* reported as a failed control by the battery. The rule and the instrument disagree. |

**Blanket refusal is otherwise well guarded**: the counter selftest includes `positive-control-accepted`
(31 cases = 1 clean + 29 negatives + 1 positive), `make-negatives` requires the pristine live receipt to be
accepted, and the gate selftest's `clean` case requires 0 failures on a good receipt. A counter or gate that
refused everything would fail those three. No kill rule is satisfiable by a *wholly* broken instrument.

---

## Axis verdict

- **C1 = coverage (new surface).** Correct per `AXES.md`: coverage is "fraction of the domain's real surfaces
  the skill governs", and a capability claim lands a per-axis verdict with the type recorded. Caveat: every
  C1 target number measures *instrument strength* on one loopback fixture, one browser and one host; none
  measures surface fraction. That is disclosed in `limits`, and the capability row is separate from the six
  scored axes (D10), so the assignment stands but the number is not a coverage number.
- **C2 = calibration (self-assessment vs repo state).** Correct axis, weaker object than r63's: r63 counted
  SCORECARD claims against observed state; r64 counts *receipt records* against repo state. Its own limit
  says a fabricated but well-formed receipt passes — which this seat confirmed twice (F14/F15/F16).
- **Distinct axes, causally separable:** yes. C2 verifies on any directory; C1 needs only the browser.
- **Do-nothing reach:**
  - C1 — the cheapest do-nothing for the *counter* target is the committed `red-synthetic-rendering`
    (exit 0, disclosed). The cheapest do-nothing for the *verifier* target is `live-no-run` (committed,
    exit 1, `findings ['live-run-required']`). No committed do-nothing reaches the verifier target.
    **Committed.**
  - C2 — the cheapest do-nothing reaches the target: a fabricated receipt plus a fabricated matrix in any
    directory gives `failures 0 ok True` exit 0 (F14). A no-work variant (`--min-receipts 12` on an empty dir)
    would exit 1 but was never committed. **No C2 no-work or fabrication control is committed**, although the
    `ordering` paragraph enumerates the committed failing-before controls. The claim's `limits` says the
    fabrication is "demonstrated by the wave" — i.e. deferred to a post-freeze artifact.
- **Net:** C1's *design* survives the do-nothing test (a live re-run is genuinely required); its *text* does not
  survive F4/F5. C2's target is reachable without work and its repair for the r63 D4 class is dead code (F13).

---

## r63 D-items — one sentence each

1. **D1** (SKILL.md digest pin unresolvable) — **closed**: `SKILL.md:3045` now records
   `d376dc707747…c05cfb` and `:3047` names the r63 D1 defect explicitly.
2. **D2** (SCORECARD r63 row contradicts its receipt) — **not closed, undeclared**: `SCORECARD.md:3465`
   still prints "194 could-not-evaluate and 58 superseded" with no 142/59 correction (F22).
3. **D3** (C2 after-receipt one commit short of the landing revision) — **recurring in form**: the r64
   `afterCommand` carries a `<DATA_REV>` placeholder and names no revision at all (F11/F19).
4. **D4** (mutation matrix cannot show which receipt it ran on) — **nominally fixed, effectively open**: the
   matrix records `input {path, sha256}` and a `*.command.json` exists, but the gate never evaluates either
   because of the filename regex (F13) and would not verify the digest if it did (F14).
5. **D5** (`forgedGreen` not emitted; one negative misnamed) — **half closed**: `forgedGreen` is now emitted
   (`0`) and negative ids are generated from `CHECK_IDS` so the misnamed-negative class is gone; but
   `mutantsDistinguished`/`mutantsSurviving` re-introduce the unemitted-name class (F2).
6. **D6** (gate citation misattribution to `QUALITY.md` 114) — **dropped, not fixed**: no round-64 file cites
   QUALITY 114, so the citation cannot recur, but no `QUALITY.md` criterion stating the rule was added.
7. **D7** (census outputs do not print the counts; stability-direct has no generator or stdout digest) —
   **dropped**: `controls/census-start.txt` is committed but no census count is claimed this round, and the
   stability-direct instrument is replaced by the live verifier without a replacement digest receipt.
8. **D8** (knowledge-note `verified-at` names a revision where the note does not exist) — **recurring**:
   `corpus/knowledge/chromium-wheel-scroll-round-64.md` is untracked with `verified-at: 0fc68043` and cites a
   scored receipt that does not exist (F23).
9. **D9** (evidence-pointer precision on the S166 size pair) — **dropped**: no r64 source-row work touches
   S166, so the imprecise pair stands uncorrected.

---

## Verdict

**C1 — the demonstration design is sound, the claim text overstates it.** A live re-run is genuinely
required and no committed do-nothing reaches the verifier target (the committed synthetic forgery reaches
only the counter, as disclosed). But three sentences are not backed by the frozen bytes: the verifier accepts
any driver bytes while the text says "the frozen driver" (F4, demonstrated live with `runs [('a',0,0),('b',0,0)]`
on a modified copy), `evidenceAgreement` is satisfied by a receipt that was never produced by a browser (F5),
and five of the fifteen target values have no emitting command (F1–F3). All ten pins resolve, the counter
selftest is 31/31 clean, 29/29 negatives are refused with `forgedGreen 0`, and 16/16 mutants are killed —
those numbers reproduce exactly. **Recommendation: admit only with the driver pin asserted inside the
verifier and the evidence clause re-scoped; as written, "frozen" and "committed evidence" are prose.**

**C2 — reject on its own do-nothing standard.** The before-state reproduces exactly (11 receipts / 34 failures,
byCheck identical), the gate selftest is 9/9 clean, and the gate bytes are pinned. But the after-population
does not exist and no seat is assigned to produce it (F19), the existing 16 control receipts fail the
afterCommand's own flags 16/16 on `rev-committed` (all `worktree`), the r63 D4 repair never executes on the
lane's matrix names (F13), `matrix-input`/`argv-real`/`stdout-bound` are presence-only (F14–F16), and a
fabricated population reaches `failures 0 ok True` (demonstrated). Zero failures here means "well-formed",
which the claim's own limit admits — but the limit is deferred to the wave instead of controlled, and the
target is reachable without work.

**Cross-cutting.** The frozen-before-scoring ordering holds (F21) and no pin moved. The round nevertheless
carries two unfixed r63 routed defects (D2, D8) with no disclosed limit, and the after-pass has a real
reproducibility risk on a loaded host (F24: four consecutive 240 s driver timeouts at load 12.6, 3.9 s for
the same driver at load 5.0).

Findings: 25 (F1–F25; F21 is a verified pass). Severity: high 3 (F4, F13, F19), medium 12, low 8, pass 1,
observation 1.
