# R89Critic — claims vs instruments (calibration)

Falsification of `.ufo/waves/round-89/claims.json` as written. Instruments and receipts
were read at committed pins (`freeze.txt`, D `7bde5e6c2f2d`). No predicate/counter/pin
was proposed for amendment; defects are labelled fixable vs tradeoff.

## C1 — `chromium-showpicker-linux` DOM-parsed token list (`C1-SHOWPICKER-R89`)

Claims to test: `accept` is not a validator on a programmatic answer **over a DOM-parsed
token list**; four `sp89-*` legs bind raw string **and** token list from WHATWG §2.3.8
(comma-split, ASCII-trim, ASCII-lowercase); counter at `checkCount 108`.

### What the bytes actually measure

Counter law (`scripts/check-showpicker-round89.mjs:785-800`): hard-coded expected
`[raw, toks, file]` quadruples, `toksOk = desc.acceptTokens === toks && desc.accept === raw`,
plus `answer.files`/`stateAfter`/single `read` hex. The driver tokenises **itself**
(`scripts/chrome-cdp-showpicker-round89.mjs:142`):

```js
a.split(',').map(p => p.trim().toLowerCase()).filter(Boolean)  // via PATCH_ACCEPT_TO
```

- `trim()` is Unicode-trim, not ASCII-whitespace trim; `toLowerCase()` is full Unicode
  lowercasing, not ASCII lowercasing. `filter(Boolean)` drops empty tokens (trailing
  comma → silently dropped). Non-file inputs return `null`.
- The counter never re-derives tokens by the cited §2.3.8 algorithm; it compares the
  fixture's output to a constant. A paired fixture+constant error (e.g. tabs/form-feeds/
  NBSP handling, which neither the claim nor the law probes) agrees green.
- The C1 **limit** already concedes this ("fixture's normalization … rather than
  Chromium's internal tokenization; lowercasing is the fixture's own rule"). The `type`
  sentence ("from WHATWG §2.3.8 … plus ASCII lowercasing") overstates the limit. The
  honest reading is **fixture-emulated** tokenisation; the strong reading (Chromium's
  parser) is false and unfalsified by no leg.

### Whitespace leg (`sp89-accept-domread-whitespace`, `aws`)

`'  image/png ,  .txt  '` → `['image/png','.txt']` (probes `prior1/2.json`, verified).
This exercises only the fixture's `trim()` on SPACE characters. It does not measure:

- Chromium's trimming (Chromium is never asked to tokenise; `DOM.setFileInputFiles`
  bypasses dialog filtering — limit admits "acceptance law, not dialog-filter law"),
- ASCII set membership (tab/newline/form-feed/CR probes absent; JS `trim` would also
  strip U+00A0/U+2028/U+FEFF, so the fixture can diverge from §2.3.8 silently),
- empties / internal spaces / case (`IMAGE/PNG` is `ac`, not a domread leg).

Answer: **parser-trimming is not measured; fixture-emulation consistency is.**
Smallest safe correction (to wording, not to instrument): "the whitespace leg shows the
fixture's split-and-`-trim` normalisation is recorded and does not filter the answer;
no claim about Chromium's or the spec's whitespace set follows." Not a counter defect.

### Does any leg measure Chromium's own matching?

No. All four legs are `showpicker-domread`: `showPicker()` opens a dialog
(`selectSingle`), then the driver answers via `DOM.setFileInputFiles` (`:583-596`).
The subsequent `read` hex + `stateAfter` prove the programmatic store accepts **any**
file. The dialog's own accept-filtering is never observed — `mode-law` checks the
`mode` string, nothing else about filtering. The claim's law sentence is therefore
correct **only** when scoped to programmatic answers; any reading that tokens govern
delivery is counterexemplified by the receipts themselves:

- `sp89-text` (`aw`, tokens `['image/*']`) delivers `tabi-r89-a.txt` (text/plain) —
  delivered file matches **neither** token.
- `sp89-multimime` (`a2`, tokens `['image/png','application/pdf']`) delivers the same
  `.txt` — again outside the token set.
- `sp89-png`/`sp89-whitespace` deliver `.png` into `image/png`-containing lists
  (matching) — necessary but not informative.

That is falsification of the "tokens would accept" reading and **support** for
"accept is not a validator". No measured fact contradicts the scoped claim. Raw vs
tokens never diverge in `prior1/2` (re-derived: all four `domRead` entries exactly
match `fixtureInputs`; top-level `dc`/`ac` case-folding consistent). Claim "the raw
string and the tokens are both read from the page" holds — both are `window.__inputs()`
descriptors.

### Does the counter enforce exactly that scope (no wider)?

No — two wider attributions, both partially conceded in the limit:

1. **Whole-array `domRead` swap is invisible.** `domRead` is the full 21-descriptor
   `__inputs()` array, byte-identical across the four legs (verified; each equals the
   top-level `fixtureInputs`). `domRead` carries no leg identity. Replacing leg A's
   `domRead` with leg B's undoes nothing a check sees — `find(x => x.id === target)`
   succeeds with the same descriptor. Per-leg `fixtureInputs` mirrors are never
   compared to `domRead` (limit: "mirrors are unenforced on grammar legs — carried
   narrowing"; the same holds for domread legs). **Tradeoff the canonical judge must
   reject** unless the claim is narrowed to "attribution rides on the `id` inside a
   shared snapshot", which the limit already half-says.
2. **Single-descriptor swap *is* caught** (`accept-domread-law` battery cases:
   tokens→`['image/png']`, hex→`00`, `stateAfter.aws`→`[]`). And LEG_SHAPE
   `leg-sp89-*` + `plan-calls` + `mode-law` bind file name/size/type, single `read`
   hex, chooser `backendNodeId`, trusted input/change seq. So the law is *weaker*
   than its neighbours on `setParams`/`upload` sha (grammar-law checks
   `basename(setParams.files[0])` + `setResult`/`setError`; domread-law checks only
   `answer.files` names). A mutant that keeps names/hex/state but corrupts
   `setParams.backendNodeId` is caught only via `plan-calls`, not via `accept-domread-law`
   itself. Kill-power `domread-tokens-dropped`/`domread-raw-dropped` confirm the law
   is the intended binding; no mutant targets `setParams` on domread legs. **Fixable
   defect** (kill-power survivor class; battery has no domread `setParams` case).

Battery coverage for the law is 3 cases (tokens/bytes/state) — the swappable-array
and `setParams` gaps are real survivors for `R89Mut1`/`R89Review2`.

### Stale count — C1 leg (c) "selftest green" is currently false

`scripts/selftest-r89-gates.mjs` `counter-clean` gate asserts `checkCount === 102`
(line 55). The claim and probe controls assert 108; `nowork-r88-under-r89.json`
(checkCount 104 on the 37-leg r88 receipt; 108 on 41-leg probes — arithmetic, not a
contradiction). On committed bytes the selftest gate **cannot** be green: 108 ≠ 102.
This is a dated-counter defect, not a threshold. It also means the frozen battery's
"full coverage" (`declared.length`) includes 108 ids while selftest expects 102 —
either number is a claim; the claim sentence (108) is the re-measured one.
`R89Exec2`/`R89Sentinel` should confirm; the critic records it as a C1-leg-(c)
counterexample on the pins as frozen.

## C2 — record drift (`C2-RECORDDRIFT-R89`)

### The four statements (`scripts/check-record-drift-r89.mjs`)

| id | real repo-state test? | do-nothing construction that satisfies it without the work |
|---|---|---|
| `scorecard-tallies` | Yes — the only substantive one. Seven swept rounds must have `9/9`, no `10/10`, and every `10/10` line must sit in a Round 87/88 section. Missing section = `round-N-missing` red, so deletion fails closed. | — (cannot satisfy by deletion) |
| `selftest-wording` | Textual. Fails only if any of SKILL/note/plan87/lesson87 matches `/selftest 10\/10 at D7/i`; needs `D6` + the correction phrase in `lesson88`. | Reword the stale sentence to `10/10 at D7` (drop `selftest `) in all four files + add `D6` to lesson89 → green while the stale meaning survives. The gate measures a string, not the wording. **Fixable defect** (broaden regex) but concede it is a statement-checker, not a meaning-checker. |
| `gate-selftest` | String presence: `/--selftest/` in counter/battery/kill/drift sources; `record-drift|check-record-drift-r89` in the selftest runner. | A comment containing `--selftest` in each of the four files satisfies `gate-selftest` with no isolated-fixture behaviour. **Fixable defect** — do-nothing control (add comment) reproduces the green. |
| `quality161-sweep` | String presence in the `161.` block: `/SCORECARD\|selftest\|tally/i` + `/check-record-drift-r89/`. | A COMMENT in QUALITY 161 naming `check-record-drift-r89` with the word "tally" satisfies it without enumerating the tally set the claim describes. Same class. |

The `--selftest` fixture repairs are real: it now writes **all seven** swept sections
(lines 62-63) and the harness asserts causality (`okC`: `/round-44-has-10/` and
`/staleHolds=true/`, line 80), so the `scorecard-tallies`/`selftest-wording` reds are
not absentee. `gate-selftest`/`quality161-sweep` are red on the fixture for the
intended reasons too (missing gates, missing QUALITY 161) — but that proves the
fixture can be red, not that the statements are substantive. The fixture tree is
removed in-process (`rmSync`, line 84, swallowed errors); "0 left behind" depends on
`rmSync` succeeding and on `TMPDIR||HYAKU_SCRATCH` naming — a kill mid-`spawnSync`
leaks. **Tradeoff**, disclosed by the `try/catch`, not a causal gap.

### `replay-limit-consistency` does not bind the sentence

What the check actually is (`check-showpicker-round89.mjs:939-943`):

```js
limBad = absNeed !== ceil(FRAC*np)  // recomputes the same constant the code used to build sims
sims.every(p => p.refused === (p.absMatched >= p.absNeed) || p.absNeed === 0)
```

The printed `limit.sentence` is built by interpolation of `sims.map(x => x.absNeed)`
(line 953) but **never parsed back**. No check compares the literal "(105,105)" in
the sentence to recomputed `absNeed`s; a mutant that hard-codes a wrong numeral in
the prose while keeping `perPrior` fields correct passes `replay-limit-consistency`
(no battery or kill-power case mutates the sentence; kill-power
`replay-limit-printed-drift` instead replaces `sims.findIndex` with `-1`, i.e. it
targets `replay-event-timeline`, not the prose). The check binds **the math to the
same constant** (FRAC = 0.5 used three times by construction), not the prose to the
math. **Fixable defect** (parse the parenthesised list, compare to recomputed
values), currently a restatement. Impacted axis: **calibration** — C2's strongest
"binds" verb overclaims.

Two further scope notes on C2:

- The replay-limit repair is in the **C1 counter**, not the drift gate; C2's `type`
  claims credit for it. Leg (c) also folds in the two **C1** do-nothing controls —
  cross-claim dependency the readers should not mistake for drift-gate evidence.
- The "before mismatches 2 (`selftest-wording`, `quality161-sweep`)" implies
  `scorecard-tallies` was already green at base `5a901163`. If so, the headline
  repair (fixture causality for `scorecard-tallies`) repairs the **test**, not the
  **repo state** — legitimate but distinct from "mismatch fixed". The claim's
  framing ("three statement repairs") blurs test-repair vs state-repair.

## Verdicts and smallest safe corrections

- **C1 law direction: holds at scoped strength.** The two non-matching deliveries
  (`image/*`+txt, `image/png,application/pdf`+txt) falsify token-governance and
  support non-validation; raw/token agreement re-derived on `prior1/2`. Quoted
  strength ("DOM-parsed … §2.3.8 ASCII") must be downgraded to "fixture-emulated"
  — **calibration** axis. The limit already says this; the `type` sentence does
  not. Counter **wider than attribution** (shared-array swap invisible) — tradeoff
  to reject unless the claim names the carrying mechanism (the limit half does).
- **C1 `checkCount 108` vs selftest `102`: real counterexample** to leg (c) as
  frozen on committed bytes. Correction is to the runner's expectation, not the
  counter; recorded here as an observed mismatch, not a proposed pin change.
- **C2 `scorecard-tallies`: real mismatch test, causally validated;** the other
  three statements are string-presence checks satisfiable by comments/rewording —
  **fixable defect class**, exemplified by the do-nothing constructions above
  (ran as reasoning against `check-record-drift-r89.mjs:106-167`; no lane bytes
  altered, nothing executed beyond reads).
- **`replay-limit-consistency` restates the math;** it does not bind the printed
  sentence to computed `absNeed`s, and no battery/kill-power case distinguishes
  the two. **Fixable**; impact: **calibration** (the claim's strongest repair is
  its weakest binding).
- No C1 fact contradicts "accept is not a validator on a programmatic answer"
  when the scope clause ("acceptance, not dialog-filter; DOM.setFileInputFiles
  bypasses the dialog") is kept attached. Detaching it is the overclaim risk the
  critic names.

Report written at `.ufo/waves/round-89/w1/R89Critic.md`; no lane records edited,
no fixture mutated, scratch `/fast/scratch/hyaku/tabi-r89/R89Critic` removed.
