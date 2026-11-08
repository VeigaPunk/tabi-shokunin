# tabi — round 88

L1 `TabiR88`. Base `f16f992d` (lane clean; the round-87 verifier spot-check commit). The round-87
non-author spot-check admitted r87 C1 (`chromium-showpicker-linux` generation r87) but **rejected
the round as rejected-harmed**: it rewrote seven historical SCORECARD selftest tallies
9/9 → 10/10 with no evidence and no named correction, and its D7 wording contradicted its own
lesson. Claims: C1 coverage — capability `chromium-showpicker-linux` generation r88 (MIME
parameters, case variants, combined lists); C2 calibration — the r87 spot-check routed defects
D1–D4 (the seven tallies, D2 wording, D3 gate self-tests, D4 freeze batching, and the
QUALITY 161 sweep extended to the SCORECARD set).

D **`abfd00a2`** (D7; D1 `86f1dcec` first freeze, D2 `138bb883` the selftest re-pin and the genuine
37-leg priors, D3 `93500a4e` the `gate-selftest` gate, D4 the kill-power mutant from-string, D5 the
runner gate's own read bug, D6 the critic-driven tally/selftest strengthening, D7 the counter guard/real-witness
batch — `plans/round-88.md` §Re-freeze history). The scored receipt was produced once, at the nonce
`tabi-r88-l1-86f1dcec`; every later freeze touched only non-receipt instruments, so the receipt is
the same receipt under test throughout. A pre-freeze probe run at `tabi-r88-probe1-probe0001`
(37 legs, 0 failures) confirmed the driver before the freeze, and the two 37-leg probes are the
prior set.

Census start: exit 0, 223 rows (`census/start.txt`); end: pending.

## Gate

### Sources — opened this round

The L1 re-opened the living WHATWG input page on 2026-11-08 (HTTP 200, 687,515 bytes, sha256
`b0202de1c0b4…`, staged at `.ufo/waves/round-88/sources/whatwg-input.html`).

- **S223** — the `accept` attribute's own sentence. Located quote: "attribute may be specified to
  provide user agents with a hint of what file types will be accepted." This is the normative
  ground for the acceptance law over ten attribute-string values, nine of them in-grammar (a
  hint, not a validator on a programmatic answer).
- **S219** — the `showPicker()` colour exemption, re-opened this round as the ground of the
  colour arm. Located quote (21 words, `printf '%s' … | wc -w`): "Throws a 'SecurityError'
  DOMException if input is inside a cross-origin iframe, unless input is in the File Upload or
  Color states." (The page's own quotation marks are straight double quotes; the nested single
  quotes here render the inner DOMException name.)

Identified 2 / screened 2 / included 0 / excluded 2 for NEW rows; no registry change. The
round-88 `## Search log` entry is added at `corpus/SOURCES.md` (this round's bounded re-opening).

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-88.md` (cites S223, S219, S216
and the r87 carrier rows).

Rejected (with flip conditions):

- **"The accept grammar is fully enumerated"** — ten attribute-string values are measured, nine of
  them in-grammar; `image/png;q=0.9` is out of the spec's grammar and is measured as a
  non-conforming value (R88Scout located "A valid MIME type string with no parameters", byte
  425136); the parser's whitespace/comma normalization read from the DOM stays frontier. Flip: one leg reading the
  DOM-parsed form rather than the raw string.
- **"The dialog filters what the user sees"** — the receipt answers programmatically; the dialog
  is unmeasured. Flip: an interactive-dialog harness.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Report corrections carried into this round (round-87 spot-check §2, defects D2)

- The round-87 records' "selftest 10/10 at D7" wording is corrected to the D6 value: the
  committed tally is at the D6 freeze (`6d4a63d29e0c`), and the round-87 lesson's scored line
  and this SCORECARD's r87 row now carry "10/10 at D6" (the D7 freeze changed the drift
  gate's item-heading/directional checks only, never the selftest). This lesson names the
  correction explicitly, so the drift gate's `selftest-wording` statement holds.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-88/claims.json` (nonce `tabi-r88-l1-86f1dcec`,
receipt D `86f1dcec`; instrument freeze D1 `86f1dcec`). Scored: counter clean **102** checks;
battery **215** cases / 0 failed / coverage 102/102; kill power **69** mutants / 69 killed /
0 survivors / 0 crashed / 0 unapplied; selftest **11/11**; record drift **4 → 0**.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `fleet-root-misroot` — two files this round's own tooling wrote landed at the fleet root instead of the lane: `docs_placeholder` (a stray copy of the plan header, created by a shell redirect) and `plans/round-88.md` (an early plan draft written with a lane-relative path from the fleet cwd). The stale fleet copy was 6,824 B while the lane's authoritative plan is 15,091 B, so a byte-exact copy-back would have REGRESSED the lane | `git -C /home/vgpnk/Projects/shokunin status --porcelain` before the report; `cmp plans/round-88.md tabi-shokunin/plans/round-88.md` → differ at line 5; `wc -c` 6824 vs 15091 | none — the addendum's misroot sweep is manual and gives no rule for a stale fleet copy | both fleet-root paths deleted after the comparison; the lane plan kept; recorded here. Rule for r89: write every lane file by ABSOLUTE path, and before deleting a misroot compare sizes so a stale copy never overwrites the authoritative one |
| `mid-wave-re-freeze-churn` — five re-freezes (D2–D7) after the wave spawned, each triggered by a defect a seat then measured: the selftest count compiled as 99, r87-derived priors with 34 legs, the runner's own read bug, the kill-power mutant's stale from-string, the critic's tally/selftest escapes, the simplifier's vacuous selftests | `plans/round-88.md` §Re-freeze history; `w1/R88Exec2.md` F1 (load-sensitive selftest), `w1/R88Critic.md` C2-A/C2-B, `w1/R88Simplifier.md` H1–H3 | none — the freeze ran before each gate had executed green once on the final bytes | all repairs batched per trigger and disclosed with digests; r89 rule: freeze only after a full selftest run on the exact bytes, and let one post-wave repair batch be the maximum |
| `frozen-control-numeral` — C2's before-value was declared as 3 mismatches from an estimate, not a measurement; the seat's base-worktree run measured 4 | `w1/R88Exec3.md` (base `f16f992d`: exit 1, 4 mismatches); `scored/drift-before.json` | the freeze checked the predicate but not that the before-value came from an executed control | numeral corrected post-scoring to the measured 4 and disclosed in `claims.json` `frozenAmendments` + `plans/round-88.md` §Frozen-amendment note; r89 rule: run the do-nothing control before freezing its number |
| `selftest-witness-vacuity` — the battery and kill-power `--selftest` modes I first wrote asserted "battery exited 1" on a one-leg fixture that crashed the counter, so `red: true` / `killed` were unearned; the drift fixture was red for absent records rather than the injected defect | `w1/R88Simplifier.md` H1/H3 (measured table: stock and mutant both 179/179 failed; removing all seven `put()` calls leaves the same four reds) | none — the `gate-selftest` gate only required exit 0 | rebuilt at D7 as real witnesses on the scored receipt (mutated `fixtureInputs.ac` → `accept-grammar-law`; stock-vs-mutant difference on `fixture-descriptors`; drift fixture asserts `bad=["round-44-has-10"]` and `staleHolds=true`). Residual overdetermination routed to r89 (Narrowings 4) |
