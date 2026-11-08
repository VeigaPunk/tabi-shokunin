# R83Review2 — attack on the C1 battery and kill power

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Instruments reviewed at their frozen digests
(verified with `sha256sum`, equal to `freeze.txt`):
`scripts/negatives-showpicker-r83.mjs` = 12c09cc15a4602c77faf7624d4556eb964545cf3a6277990c8a49ae89bd4a817,
`scripts/kill-power-r83.mjs` = 09c2202d55d6f9e05c9d1286de74f77aeba463ecc0d36a2759f64d9b251a0e1e,
counter `scripts/check-showpicker-r83.mjs` = 7b9f9ec429427cfb4cf9b974f860e9726ce72b3d1127cb9e50a00d2d9ee5f841.
No tools installed or upgraded (node v24.21.0 as-found).

## Measured baselines

| run | command result |
|---|---|
| counter on scored receipt | exit 0, `verdict=clean`, **74 checks**, `findings=[]` |
| battery | exit 0, **153 cases, 0 failed**, coverage `declared 74 / covered 74 / uncovered [] / unknown []` |
| kill-power (ground truth) | exit 0 in 66.6 s, **50 mutants, 50 killed, 0 survived, 0 crashed, unapplied []** |

Instrumented reruns (scratch copies of the battery that additionally dump every case's finding ids,
`/fast/scratch/hyaku/tabi-r83/R83Review2/neg-dump.mjs`) produced per-case id lists for all 153 cases,
plus one counter run per mutant on the real receipt and one battery run per mutant with per-case
failure attribution. Receipts copied to this seat dir (`battery.json`, `kill.json`, `dump2.json`,
`attrib.json`, `counter-real.json`, `clause-probes.txt`).

---

## Q1 — does every refusal case fail for the id it names, or can a case pass because a collateral check fires?

**Verdict on the literal question: measured no.** The battery's pass rule
(`negatives-showpicker-r83.mjs:451-453`) requires `ids.includes(c.expect)` **and** no finding outside
`alsoAllowed`. Because the expected id is mandatory, a case cannot pass on collateral alone.

Measurements across all 151 refusal cases:

- **0 cases** fired without the expected id (`expect ∉ ids` count = 0).
- **0 cases** were vacuous: every refusal case produced ≥1 finding, and all 150 per-case receipts
  differ from the real receipt (`accept-real.json` is identical by design — it is the unmutated copy).
- Finding-width distribution: **115 single-id, 27 two-id, 5 three-id, 3 four-id, 1 five-id**.
  So 115/151 cases give clean single-id attribution; **36/151 are multi-id**, all collateral ids
  pre-whitelisted in `alsoAllowed` (list below).
- The three prior-set walk cases are genuine, not collateral: a mirror lane carrying only
  `controls/c1` is **clean** (exit 0) and refuses **only** `prior-set-complete` once the stray r83
  receipt is written (probe `mirror-no-stray` / `mirror-with-stray`). `prior-set-unmatched-exempt`
  and `prior-set-unparsable` fire from invocation state, not from a receipt mutation.

Multi-id cases (case → expect → ids): `nonce-shape`→`nonce-shape`+`nonce-expected`;
`ports-declared`→+`context-binding`; `leg-order`→`plan-frozen`,`leg-records`;
`leg-records`→`host-argv`; all twelve `leg-sp83-*` cases→+`no-selection-law`
(`webkitdirectory-answer` also +`webkitdirectory-answer-law`, `multiple-mode`/`accept-mime-answer`/
`second-chooser-answer` +their own `*-law`); `gesture-law`→+`intercept-law`; `mode-law`→+leg;
`order-law`/`order-law-message`→+`gesture-law`; `intercept-law`→4 ids; `cancel-law`→4 ids;
`cross-nonfile-chooser`→4 ids; `cross-{number,range,month,week,time}-law`→+`intercept-law`;
`cross-nonfile-result`→+`intercept-law`; `trust-law`→+leg; the three `replay-*` cases→3–5 ids.

### HIGH — the r83 headline "same backendNodeId" attribution has no witness anywhere in the battery

`second-chooser-answer-law` (`check-showpicker-r83.mjs:575`) asserts four identity conjuncts. Each one
is individually droppable and the battery still exits **0 / 153 cases / 0 failed** (probe receipts in
`clause-probes.txt`):

| drop (valid weakening) | battery result |
|---|---|
| `sc.firstChooserBackendNodeId === scOpens[0].params.backendNodeId &&` | exit 0 |
| `sc.secondChooserBackendNodeId === scOpens[1].params.backendNodeId &&` | exit 0 |
| `sc.answer.setParams.backendNodeId === sc.secondChooserBackendNodeId &&` | exit 0 |
| `sc.firstChooserBackendNodeId === sc.secondChooserBackendNodeId &&` | exit 0 |
| all four at once | exit 0 |

Cause: the only case that touches these fields is `second-chooser-answer-law-id`
(`negatives-showpicker-r83.mjs:165`), which sets `secondChooserBackendNodeId = 999` and therefore breaks
three conjuncts plus `cdp-event-log-closed`/`intercept-law`/`leg-sp83-second-chooser-answer` at once, all
whitelisted. No case varies `firstChooserBackendNodeId` or the opens order. The claims' limit sentence
("second-chooser answer is byte-attributed, id shared") is therefore half-verified: distinct bytes are
witnessed (`second-chooser-bytes-dropped` is killed by `second-chooser-answer-law-bytes`), the shared id
is not.

### HIGH — per-type cross-origin legs: the cross-origin property itself is unguarded

For the six loop-generated legs `sp83-cross-origin-{color,month,week,time,number,range}` (the r83
number/range legs among them), three conjuncts of the law check
(`check-showpicker-r83.mjs:537`) are droppable with the battery still at exit 0:

| drop | battery result |
|---|---|
| `same(ex.parentCrossAccess, {contentDocument:null, windowDocument:'SecurityError'}) &&` | exit 0 |
| `same(ex.childActivationBefore, …) && same(ex.childActivationAfter, …) &&` | exit 0 |
| ` && ex.childLate === 0` | exit 0 |
| the no-chooser clause (`…fileChooserOpened).length === 0`) | exit 0 (redundant with `intercept-law`) |
| control: `same(ex.childResult, CHILD_RESULT_LAW[extra])` | **killed by 6 cases** (`cross-{number,range,color,month,week,time}-law`) |
| control: `childEvents` shape/length/act block | **killed** (`w-extras-child-act-dropped`) |

Why: battery coverage for those legs is one `childResult` mutation each (`negatives:166-180`) plus the
default `leg-*` mutator (`stateAfter.sValue`, `negatives:148`). The witnesses for `parentCrossAccess`,
child activation and `childLate` exist **only for the nonfile leg** (`w-cross-nonfile-*`,
`negatives:283-286`). A receipt whose per-type cross-origin iframe is actually same-origin-readable, or
whose child lost/replayed activation, passes the battery, and the counter's only assertion of that
property was the clause removed. `parentCrossAccess` is the sole observable proof that the iframe is
cross-origin, so this is a material verification gap, not cosmetic redundancy.

---

## Q2 — is any mutant a no-op on the real receipt?

**Yes, all of them, literally:** each of the 50 mutant counters run on the scored receipt returns
exit 0 / `verdict=clean` / **74 identical checks** / `findings=[]` — byte-identical `checks` object to
the original (50/50). That is expected for weakening mutants and is not itself a defect, but it means
all kill evidence rests on the negative cases; a mutant that is a no-op on both the golden path and the
cases would survive, and none does (0 survivors).

No mutant is *vacuous*: all 50 applied (`from` occurs exactly once, 0 `unapplied`), all 50 change
behaviour on ≥1 case, and **49/50 are killed by a case whose expected id is the mutated check's own id**.
The exception is a mis-targeted mutant (below).

### MEDIUM — `cross-number-result-dropped` does not touch the number leg

Its `from`/`to` (`kill-power:75`) is
`same(co.childResult, CHILD_RESULT_LAW['sp83-cross-origin-nonfile'])` → `isObj(co.childResult)` — the
same clause as `cross-nonfile-result-dropped` (`kill-power:63`), only without the `isObj` prefix. `co`
is the nonfile leg; the per-type loop uses `ex`. Measured attribution: killed by case
`cross-nonfile-result` (expect `cross-origin-nonfile-law`), never by `cross-number-law`/`cross-range-law`.
Consequence: the per-type result law has **no** mutant in the frozen 50, even though the battery does
witness it (6 cases, control row above). The r83 number/range legs' result law is kill-power-uncovered.

### MEDIUM — `first` is always null in kill-power output

`kill-power:114` reads `.name` from battery failure records, which carry `case`
(`negatives:455`). Measured: **50/50** killed results report `first: null`, so the per-mutant
attribution the harness is designed to print is never produced.

### MEDIUM — "killed" cannot distinguish a rule kill from the counter breaking on clean input

A mutant that makes the counter reject the *pristine* receipt fails `accept-real`, so every refusal case
also reports an extra id. Probe `multimode-mode-not-selectmultiple` (stronger, therefore not a valid
mutant, used only as a control) produced `exit 1, failed=152` — the harness would file that as
`killed`. For the frozen 50 this ambiguity is moot (all measured clean on the real receipt), but the
harness has no assertion that a mutant counter still accepts the baseline, so the "50/50 killed" number
is only as strong as that unmeasured precondition.

### LOW — other observations

- `kill-power:125` increments `crashed` for `unapplied` as well as real crashes, while also listing
  `unapplied` separately; the two counters can disagree in a bad run.
- Mutant work dirs are deleted (`kill-power:112`) before the summary is emitted, so an attribution
  dispute cannot be re-run from the harness output.
- Two clauses are redundant (thus unkillable by design): the per-type no-chooser clause and the
  `opened` key of `legSummary` (`leg-shape-seq-dropped` without `opened` still exits 0). The properties
  remain enforced by `intercept-law`/`plan-calls`, so this is redundancy, not a hole.
- `host-node-any` (`=== 24` → `>= 20`) is killed, but no case probes a major > 24, so the mutant's
  admitted range is not exercised at its weak end.
- Shares of responsibility: 41 of 74 checks are covered by exactly one case; of these 15 are the
  generated `leg-sp83-*` per-leg checks, whose single witness mutates only `stateAfter`.

---

## Identity / freeze drift (observation for the integration owner; nothing amended)

- `claims.json` carries `base 518f6b84…`, `digestsCommit b6496e6f…`, `nonce tabi-r83-l1-b6496e6f5d4f`;
  this seat's spec states `base 4cdf4def…`, `digests D = 9d90392aca79…`, `nonce tabi-r83-l1-9d90392aca79`;
  the scored receipt carries `nonce tabi-r83-l1-c016710129da`. Measured: only the receipt nonce gives
  exit 0; both other nonces exit 1 with `nonce-expected`. So the instrument digests in `freeze.txt`
  match the tree, but no stated nonce besides the receipt's own binds the scored output, and the claims
  file's own identity fields do not match this wave's spec.
- `claims.json` C1 leg a says "clean **72** checks"; the counter reports **74**. Leg b's numbers
  (153 cases incl. 69 imported `w-*` witnesses; 50 mutants, 0 survivors, 0 crashed) are exact.

## Residual risk and verification gaps

1. My clause probes are single-clause deletions of the frozen counter; they bound what the battery can
   notice, not what the driver produces. A same-id property could still be enforced producer-side.
2. I did not mutate the driver or the fixture; `fixtureInputs`/`PORTS`/`PLAN` drift beyond the
   witnesses listed in the battery is out of scope here.
3. The multi-id cone list above is measured on the current receipt; the whitelists are static text, so
   adding a check can silently turn a future multi-id case into an "extra id" failure or, worse, an
   allowed collateral — the whitelists are not derived from measurement.
4. Kill power was run with 8-way concurrency on the real lane and real `--prior-set`; the walk reads the
   live tree, so results are only comparable while the frozen digests hold.

## Tooling

None installed or upgraded. Commands run used the existing node v24.21.0; no pacman, no `~/.local/bin`
writes, no git/jj mutation anywhere.

Report: .ufo/waves/round-83/w1/R83Review2.md
