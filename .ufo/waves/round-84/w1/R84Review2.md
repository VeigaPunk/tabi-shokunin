# R84Review2 — attack the r84 battery (collateral passes, r83 defect-4 witnesses, no-ops)

Seat: R84Review2 (godspeed; leaf, no subagents). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
base `a5d6ffbf`, freeze `84ebfa95`, identity `d90b7f55` (D `a5bdb15ec9a7`). No commits; read-only git only.
Method: every claim below is exercised against the committed counter
(`scripts/check-showpicker-r84.mjs`, frozen pin `e88e9fc7…d315a7`, verified) run by path from scratch copies,
never against lane-tree bytes. Scratch `/fast/scratch/hyaku/tabi-r84/R84Review2/`, removed after receipts
were copied to `.ufo/waves/round-84/w1/R84Review2-receipts/`.

**HEADLINE — the battery pin is being violated in the lane worktree.** Frozen pin for
`scripts/negatives-showpicker-r84.mjs` (`freeze.txt`/claims): `828dfcb7b0d4c467341411f3fd211682add7294474d910d426f0aab415103cba`.
Worktree bytes: `42fcfedc164fbe2185a52a720b0cfa788abd9e98a609757723de54eb7296e431` (`git status`: `M scripts/negatives-showpicker-r84.mjs`).
The diff is exactly 9 added lines (see `battery-frozen-vs-worktree.diff`):

```diff
+  'sp84-cross-origin-tel': (r) => { legOf(r, 'sp84-cross-origin-tel').stateAfter.sValue = 'x'; },
+  'sp84-cross-origin-search': (r) => { legOf(r, 'sp84-cross-origin-search').stateAfter.sValue = 'x'; },
+  'sp84-cross-origin-text': (r) => { legOf(r, 'sp84-cross-origin-text').stateAfter.sValue = 'x'; },
+ LEG_ALSO gains tel/search/text -> ['no-selection-law']
+add('cross-origin-tel-law', … childResult = { ok: true, ret: 'undefined' })
+add('cross-origin-search-law', …)
+add('cross-origin-text-law', …)
+add('cross-origin-tel-message', … childResult.message = 'SecurityError')
+add('cross-origin-search-activation', … childActivationAfter = { isActive: false, hasBeenActive: true })
+add('cross-origin-text-late', … childLate = 1)
```

Consequence, measured with the frozen battery (`--lane` abs, receipt `corpus/evidence/round84/chromium-showpicker/receipt.json`,
driver `f436b229…`, nonce `tabi-r84-l1-a5bdb15ec9a7`, fixture `64817252…`, prior-set `.ufo/waves/round-84/controls/c1/prior-set.txt`,
counter by path, `--work` scratch): frozen battery **fails**:

```json
{"cases":156,"failed":3,"coverage":{"declared":80,"covered":74,"uncovered":["leg-sp84-cross-origin-tel","leg-sp84-cross-origin-search","leg-sp84-cross-origin-text","sp84-cross-origin-tel-law","sp84-cross-origin-search-law","sp84-cross-origin-text-law"]}}
```

`leg-sp84-cross-origin-tel/search/text` fail with `got ["leg-…","no-selection-law"]` — the frozen fallback
mutator (`stateAfter.sValue='x'`) fires a collateral `no-selection-law` the case does not allow. The worktree
battery (162 cases) passes 162/0 with 80/80 coverage. Receipts: `battery-frozen.json`, `battery-worktree.json`.
So "battery exit 0" is true only of UNPINNED bytes; the frozen instrument does not cover the counter's 80 ids.
This is independent of Q1–Q3 below and frames them: all measurements report both versions.

## (1) Collateral passes — can a case pass because a collateral check fires?

Gate (battery line 460–462): refusal passes iff exit 1, `expect` present, and no id outside `expect ∪ alsoAllowed`.
So a collateral firing alone cannot pass a case. Measured full finding lists for all 159 receipt-mutating cases
(`all-findings.txt`, counter invoked exactly as the battery invokes it, incl. `--tree-exempt-sha256`):

- **127/159 refuse with exactly their expect id** (all `w-*` witnesses included). No case in the worktree battery
  passes on a collateral alone; no case omits its expect id.
- **32/159 fire expect PLUS a named `alsoAllowed` id** — the battery is structurally incapable of telling the
  named check from its collateral. Flagship: `leg-sp84-cross-origin-tel` → `['leg-sp84-cross-origin-tel','no-selection-law']`.
  The mutator writes `stateAfter.sValue='x'`; the counter reads `stateAfter` in two places — the frozen leg-shape
  sum (`legSummary` → `leg-<name>`) and the empty-state test (`no-selection-law`, counter line ~603).
  Either check alone would fail the receipt; the battery allows both, so the case witnesses "state went non-empty",
  not "this leg's five-field shape is frozen". Same coupling for every cross-origin `leg-*` case and
  `multiple-mode-law-state` / `accept-mime-answer-law`. This is the frozen-battery failure above: without the
  `LEG_ALSO` entry the verdict flips to fail on the extra id, not on a missing expect.
- The strongest instance is counter-structural: `cross-origin-tel-law` → `['sp84-cross-origin-tel-law','intercept-law']`.
  `intercept-law` derives `want=0` from `childResult.ok` (counter line ~619) while `sp84-cross-origin-tel-law`
  compares the whole `childResult` object — one byte (`ok:true`) fires both by construction.
  Symmetrically `cross-origin-search-activation` (mutates `childActivationAfter`) fires only
  `['sp84-cross-origin-search-law']`; its `alsoAllowed: ['activation-law', …]` is dead weight covering a collateral
  that never fires (parent `activation-law` reads `activationBefore/After`, not `childActivation*`).
- One genuine tell for "the expected id can be fired by the wrong mutation": `probe-tel-messageonly` (only
  `childResult.message='wrong message'`, `ok/name` intact) → `['sp84-cross-origin-tel-law']` — the expect id
  fires on any byte of the object, so the battery's three tel cases (ok-flip, message, no-chooser) do not isolate
  which conjunct is load-bearing. The `probe-tel-chooser` push gives
  `['plan-calls','cdp-event-log-closed','leg-sp84-cross-origin-tel','sp84-cross-origin-tel-law','intercept-law']`:
  the no-chooser clause of the law is reachable only with 3 collateral ids, all of which the shipped case
  `cross-nonfile-chooser` must allowlist.

## (2) r83 spot-check routed defect 4 — witnesses for the cross-origin droppability fields?

Defect 4 (`corpus/lessons/round-83-verifier-spotcheck.md:73`): "add one [narrowing] for the six cross-origin legs'
`parentCrossAccess`/`childActivation`/`childLate`/no-chooser droppability; add the missing battery witnesses for those fields."
The six (r83 review's count; the loop covers color/month/week/time/number/range in both rounds — defect 4 is
about the extra-loop legs, where R83Review2's HIGH row lived). Witness inventory in the r84 battery, per field class:

| Field class | Witness cases (r84 battery) | Legs covered |
|---|---|---|
| `parentCrossAccess` flip | `cross-origin-nonfile-law` (only) | **1 of 11** cross legs (`sp84-cross-origin-nonfile`). tel/search/text/color/month/week/time/number/range: **none** |
| `childActivation` flip | `w-cross-nonfile-childact-after/before-dropped` (nonfile only), `cross-origin-search-activation` (search, after-only) | 2 legs; month/week/time/number/range/tel/text/color: **none** |
| `childLate` | `w-cross-nonfile-childlate-dropped`, `w-order-cod-childlate-dropped` (nonfile-disabled), `cross-origin-text-late` (text) | 3 legs |
| no-chooser (push `fileChooserOpened`) | `cross-nonfile-chooser`, `intercept-law` (nonfile-disabled) | 2 legs |

The three new tel/search/text law cases each witness only `childResult` (the worktree battery does not import
R82Mut1-style `w-*` witnesses for the new legs). `cross-origin-search-activation` and `cross-origin-text-late` are
the only new-leg witnesses for activation/late — so the tel leg still has zero activation/late/PCA witnesses.

**Mutant (built in scratch, run, quoted):** counter with the `parentCrossAccess` conjunct deleted from both the
`cross-origin-nonfile-law` check and the extra-loop `<leg>-law` check (2 occurrences; `order-law` never read it).
Full worktree battery against the mutant: **162 cases, 1 failed**, coverage still 80/80:

```json
{"case":"cross-origin-nonfile-law","accept":false,"expect":"cross-origin-nonfile-law","ok":false,"detail":"exit 0 expected cross-origin-nonfile-law got []"}
```

Receipt `battery-mutant-PCA-dropped.json`. Interpretation: the battery does catch a dropped `parentCrossAccess`
conjunct — but by exactly one case (`cross-origin-nonfile-law`), the only PCA witness in the battery; and the
mutant counter still verifies the real receipt clean (`verdict clean []`), i.e. the law's prose ("throw
SecurityError and open nothing — cross …") is wider than what any case can detect being missing. For 10/11 cross
legs a dropped-PCA counter mutant is undetectable in principle: there is no case mutating PCA on those legs to
fail against it. Defect 4 is therefore only partly closed: witnesses exist for 1–3 legs per field class, not for
"the six cross-origin legs".

## (3) No-op cases — mutates a byte the counter never reads?

Literal no-ops: **none.** Every refusal case's mutation changes a byte the counter compares (verified case-by-case
against the real receipt; the only clean outcomes from `all-findings.txt` are the two must-accept cases). But the
counter never reads the VALUES of five receipt-required fields — required by `LEG_KEYS` (presence only), value-free:

- `childState` (the per-input `{s,dis,dtValue,…,teValue,seValue,txValue}` — the field that actually names `type=tel/search/text`),
- `childResult2` (null), `deferredResult` (null), `childClosedAt`, per-leg `fixtureInputs`.

Probes (real receipt + poisoned values, counter by path): **all five verify `clean []`** —
`probe-D-childstate` (`teValue`/`seValue`/`txValue` = `"WRONG"`), `probe-E-childresult2` (non-null),
`probe-F-deferred` (non-null), `probe-G-childclosed` (1), `probe-H-legfixture` (`fixtureInputs: []`).
So `childState` — the receipt's only record that the measured input was `te`/`se`/`tx` — is entirely unchecked:
the tel/search/text claim ("cross-origin `type=tel|search|text` throw SecurityError") is carried by `childResult`'s
message + `childEvents` shapes, not by any input-identity field. The battery contains zero cases mutating any of
the five (grep for `childState|childResult2|deferredResult|childClosedAt` in the battery: none), which is consistent
— a case mutating them could not pass. They are not no-op *cases*; they are blind *coverage*, and the battery's
coverage metric (declare ids → cases) cannot see them. Near-miss redundancy (not a no-op): `w-cdp-open-backendnode-nonpositive-ok`
writes `backendNodeId=0` in the chooser event AND `answer.setParams` AND `DOM.setFileInputFiles` params; only the
first is read by `cdp-event-log-closed` (`backendNodeId <= 0`), the other two writes are inert for this case.

## Other findings

- **CRITICAL (unpinned battery, see headline):** the lane worktree battery differs from the frozen identity-commit
  battery; the frozen battery does not cover 6/80 counter ids and fails 3 cases. Any "battery exit 0" citation in
  the wave must name which bytes.
- **MAJOR (Q2):** defect-4 witnesses cover at most 3/11 cross legs per field class; PCA has exactly 1 witness.
  A PCA-dropped counter mutant leaves the real receipt clean and the battery fails exactly one case.
- **MINOR (Q1):** the battery is collateral-tolerant by design; `leg-*` cases cannot distinguish leg-shape from
  `no-selection-law` (one byte, two checks), and `cross-origin-*-law` cannot distinguish `childResult` from
  `intercept-law`. A case passing with the wrong collateral is possible for any future `alsoAllowed` edit; the
  current 32 two-id cases all pass for the right reason (both checks derive from the same mutated byte).
- Battery gate details worth noting: invocation cases `prior-set-*` never write a receipt (exit-1 with the expect id
  via flags/mirror lane), and `accept-real`/`accept-retimed` are must-accept controls — the "162 cases" count
  conflates 3 invocation cases + 2 accepts + 157 refusal cases.

## Commands (all run from scratch copies; lane tree only read)

```bash
S=/fast/scratch/hyaku/tabi-r84/R84Review2; LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
# baseline + pin check
node $S/bin/negatives-showpicker-r84.mjs --lane $LANE --real $LANE/corpus/evidence/round84/chromium-showpicker/receipt.json \
  --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e \
  --expect-nonce tabi-r84-l1-a5bdb15ec9a7 --expect-fixture-sha256 64817252bbb79267b6256a0b004b54ea899358d503b878608621be861ff7738a \
  --prior-set $LANE/.ufo/waves/round-84/controls/c1/prior-set.txt --work $S/run-{frozen,cur} --json
# per-case finding lists: counter by path on every $S/run-cur/cases/*.json (with --tree-exempt-sha256 = sha256 of real receipt)
# PCA mutant: counter minus `&& same(co|ex.parentCrossAccess, {contentDocument:null,windowDocument:'SecurityError'})`, battery beside it, same invocation
# probes: poisoned copies of the real receipt (childState/childResult2/deferredResult/childClosedAt/leg fixtureInputs), counter by path
```

Tooling: node 24 (pre-installed, host channel) + python3 only; no installs, no RULES.md read needed (no packages
touched). Verification left to the main agent: re-run the frozen battery command above and confirm 156/3 vs 162/0;
the mutant receipt is checked in as data.
