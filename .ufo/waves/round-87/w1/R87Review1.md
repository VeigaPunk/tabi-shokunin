# R87Review1 — C1 count reproduction, pin audit, and the narrow-pass hunt (independent)

Seat: reviewer, round 87 wave w1 (leaf; no subagent dispatch). Scope: C1
(`C1-SHOWPICKER-R87`, coverage axis) — re-run the counting command from the lane's
script bytes against the scored receipt with every pin, verify `freeze.txt` against
`sha256sum`, then hunt for checks that pass for a reason narrower than C1's sentence.
Nothing was edited in the lane; nothing was committed; no mutating git/jj command was
run. Tooling: none installed or upgraded.

State basis at report time (the lane moved twice while this review ran — see §6):

| item | value |
|---|---|
| lane HEAD | `24765dd95b5ef01ffc24a19ae5f293315216f4e5` (base `24765dd9`) |
| `git status --porcelain` | 19 entries, 12 untracked (all r87 instruments, receipt, wave records) |
| receipt sha256 | `5d38d03703f717877376217d51df44ffb8ab2f47c93031e46717207c6c15b4ef` |
| receipt nonce | `tabi-r87-l1-3dd4b0802d67` (D3) |
| `freeze.txt` sha256 | `b1d06cf8db577d90103adf55348157e48546e8ad7937bcbb5164f8aa86ef6644` (D4) |
| `claims.json` sha256 | `78e4e5e9473020c4c2af806522a763344ed8cb71b817e3b9f4254d82469ecc48` (mtime 07:19:44) |

## 1. Count reproduction — clean, 99

Command executed verbatim from the current frozen `claims.json` (`C1.countingCommand`),
with `<ABS lane>` filled and the fixture placeholder set to the pin the receipt carries
(`10e444f7…d94c4`):

```
node scripts/check-showpicker-r87.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round87/chromium-showpicker/receipt.json \
  --expect-driver-sha256 7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f \
  --expect-nonce tabi-r87-l1-3dd4b0802d67 \
  --expect-fixture-sha256 10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4 \
  --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json
```

Result, reproduced on both executions of this exact command (initial and final state):
**`verdict: "clean"`, `checkCount: 99`, `findings: []`, `priorSet: 2`, exit 0.**

The four new legs are inside the counted set, each with its per-leg check true:
`leg-sp87-accept-audio-png`, `leg-sp87-accept-video-text`,
`leg-sp87-accept-multimime-text`, `leg-sp87-accept-whitespace-png`, plus
`accept-grammar-law`. Their targets (`aa`, `av`, `a2`, `aws`) each produce one
`Page.fileChooserOpened` (`selectSingle`), one `input`, one `change`, one `read`, and
`stateAfter[target] = [[name, size, type, '']]` with the expected file.

Receipt self-fields agree with the pins: `driverSha256 = 7c54e786…e5f`,
`fixture.sha256 = 10e444f7…d94c4`, `nonce = tabi-r87-l1-3dd4b0802d67`, and
`fixture.child.sha256 = bbb22189…f671`.

## 2. Pin audit — all six match, and the digest chain closes

`sha256sum` of the six files named by `freeze.txt` equals the six stated digests, byte for
byte:

| file | freeze.txt | on-disk sha256 | match |
|---|---|---|---|
| `scripts/chrome-cdp-showpicker-round87.mjs` | `7c54e786…e5f` | `7c54e786…e5f` | yes |
| `scripts/check-showpicker-r87.mjs` | `6a2bb03b…181` | `6a2bb03b…181` | yes |
| `scripts/negatives-showpicker-r87.mjs` | `9883807a…2a5` | `9883807a…2a5` | yes |
| `scripts/kill-power-r87.mjs` | `c95b5305…002c4` | `c95b5305…002c4` | yes |
| `scripts/selftest-r87-gates.mjs` | `4346700a…541` | `4346700a…541` | yes |
| `scripts/check-record-drift-r87.mjs` | `603fb587…7f7` | `603fb587…7f7` | yes |

The digest chain is sound and content-addressed, not a commit id:
`claims.digestsCommit = b1d06cf8db57` equals the first 12 hex of the current
`freeze.txt` sha256. Reconstructing the pre-D4 freeze (same five lines plus
`3e41bd2e…c82  scripts/selftest-r87-gates.mjs`) yields
`3dd4b0802d67 8454ad5706b56a59a4aa350568764d3b7a6cfe6ba4fd5f650005` — the D3 digest,
which is also the nonce suffix and the nonce the scored receipt carries. So D1→D2→D3→D4
are freeze-content digests, and the scored receipt is D3 while the wave record is D4.

Two audit qualifications:

- **The bytes are not committed.** HEAD is the frozen base `24765dd9`; all six
  instruments, `freeze.txt`, `claims.json` and the receipt are untracked working-tree
  files (`??` in `git status`). The audit above is a working-tree audit. Nothing in this
  repository currently pins these bytes to a commit.
- **The fixture closure is anchored one round back, not here.** The r87 driver builds the
  served page from `scripts/chrome-cdp-filechooser-round78.mjs` at run time
  (`chrome-cdp-showpicker-round87.mjs:55,103-107`). That file is not in `freeze.txt`,
  but its current sha256 `0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f`
  matches the pin in the committed round-78 `claims.json` (commit `bf94adaa`). No r87
  gate checks it.

## 3. Findings (severity order)

### F1 — [High, coverage] The driver and fixture pins are receipt-field echoes; the counter never reads instrument bytes

`check-showpicker-r87.mjs:414-415`:

```js
check('driver-pin', r.driverSha256 === pin, …)
check('fixture-hash', isObj(r.fixture) && r.fixture.sha256 === expectFixture && …)
```

Both compare a receipt field to a CLI argument. The counter's only `readFileSync` sites
are the prior set (88), the priors (97), the receipt (104), the walked-tree files (825)
and the prior set again (848); it never opens the driver, the fixture template, or any
lane script. The selftest inherits the same shape: `selftest-r87-gates.mjs:42` sets
`expect.driver = rec.driverSha256` and `expect.fixture = rec.fixture.sha256` from the
receipt itself. The current `claims.json` counting command likewise says
`--expect-fixture-sha256 <the scored receipt fixture sha256>` — the expectation is
defined by the artifact it is meant to constrain.

Runtime proof, two ways:

1. `driverSha256 = "0"×64`, `fixture.sha256 = "1"×64`, with those same values passed as
   the two CLI pins → **clean, 99, 0 findings** (`mutD`).
2. A scratch lane (`/fast/scratch/.../lane/tabi-shokunin`) whose
   `scripts/chrome-cdp-showpicker-round87.mjs` was replaced by the single line
   `GARBAGE-DRIVER-NOT-THE-INSTRUMENT`, with the real receipt and the real pins →
   **clean, 99, 0 findings**.

This matters because the fixture hash is *reconstructible and correct*: I rebuilt the
served HTML from the pinned r87 driver (`7c54…`) + the pinned r78 template (`0ae89d92…`)
+ the receipt's nonce and child origin, and got exactly
`10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4`; the child page
recomputes to `bbb22189…f671`. Round 78's counter did derive the fixture expectation from
the pinned driver beside the counter (`check-filechooser-r78.mjs:230-239`). The r87
counter does not. Consequence: C1 leg (a) ("clean under the driver/fixture/nonce pins")
proves the receipt *declares* the pinned strings; it does not prove the receipt was
produced by the pinned driver. The fixture hash is additionally run-specific (it embeds
the run's child-origin port), so as written the pin can only ever be an echo of the
receipt.

### F2 — [Medium, coverage] The four new legs' own page-read `accept` descriptors are never checked

C1's sentence says "Four new page inputs, each with its raw accept attribute read back by
`window.__inputs()`". The counter reads only the top-level snapshot:
`check-showpicker-r87.mjs:627` (mode-law) and `:699` (accept-grammar-law) do
`arr(r.fixtureInputs).find(...)`, and `:774` compares the whole top-level array to
`FIXTURE_INPUTS`. The string `leg.fixtureInputs` occurs **zero** times in the counter,
although `LEG_KEYS` (`:403`) requires the field to exist on every leg. Every one of the
four new legs carries its own 18-entry `fixtureInputs` in the receipt (identical to the
top-level copy — e.g. `sp87-accept-audio-png.fixtureInputs[aa].accept = "audio/*"`), and
none of them is consulted.

Runtime proof (`mutA`): setting `accept` to `BOGUS/<leg-name>` inside the per-leg
`fixtureInputs` of all four new legs, leaving the top-level array untouched →
**clean, 99, 0 findings**. The positive control (`mutB`: top-level `aws.accept` changed
to `image/jpeg`) fails `fixture-descriptors` and `accept-grammar-law`, as expected. So
the metric verifies the accept form once, from one page snapshot; if the four legs had
run against different markup, nothing in the receipt would catch it. The battery's r87
accept mutants (`negatives-showpicker-r87.mjs:294-298`) mutate the same top-level
location, so "full coverage" (99/99 check ids) is not contradicted — the per-leg location
is simply outside the covered surface.

### F3 — [Low, honest measurement] `trust-law` is satisfied for `read` events by a fixture-authored literal

`acceptShape` (`check-showpicker-r87.mjs:170-180`) and `LEG_SHAPE` (`:251-260`) require
`input@target`, `change@target`, `read@target` with `trusted` all true. For `input` and
`change` the page copies the browser's flag (`chrome-cdp-filechooser-round78.mjs:179`
`isTrusted: e.isTrusted`) — genuinely measured. For `read` the fixture hardcodes
`isTrusted: true` (`chrome-cdp-filechooser-round78.mjs:187`) because a `FileReader`
callback is not an event at all. `trust-law` (`check-showpicker-r87.mjs:755`) then states
"every page event must be trusted", which for the read event is asserted by the fixture,
not observed. C1's sentence ("fires trusted input+change") is therefore sound; the
check's wider wording is not. Receipt pointer: e.g.
`sp87-accept-audio-png.pageEvents[2]` (`type: "read"`, `isTrusted: true`).

### F4 — [Info, record; resolved mid-review] The D3 counting command named the superseded D2 nonce

At the D3 freeze (claims as first read during this review), `C1.countingCommand` carried
`--expect-nonce tabi-r87-l1-42a489b9d4be` (D2) while the scored receipt carries D3.
Executed verbatim it exits **1** with `nonce-expected` — reproduced. The wave's own
`scored/counter-a.json` was produced with the receipt-derived nonce (selftest line 42),
so the wave output was never affected. The D4 re-freeze (claims mtime 07:19:44) replaced
the literal with the D3 nonce; the command now exits 0 clean 99 (§1). Neither C2's five
statements nor any selftest gate covers the C1 counting-command literal itself.

## 4. What held (positive controls)

- **Raw whitespace attribute is measured as a raw string.** The page reads
  `e.getAttribute('accept')` (`chrome-cdp-filechooser-round78.mjs:196`), the receipt's
  top-level descriptor for `aws` is `"  image/png ,  .txt  "`, and the checker's pinned
  `FIXTURE_INPUTS` / `GRAMMAR` require exactly that string. This matches C1's declared
  limit (raw attribute, not a parsed token list).
- **The token-form set is anchored in pinned checker literals.** `GRAMMAR`
  (`:686-695`) holds nine leg rows over eight raw attribute strings — extension `.png`,
  `image/*`, `image/png, .txt`, `application/pdf`, `audio/*`, `video/*`,
  `image/png,application/pdf`, and the whitespace spelling — i.e. seven token forms plus
  the whitespace variant, consistent with the claim.
- **The bytes check is tight.** Replacing one `read.ret` hex for
  `sp87-accept-audio-png` with `hex:00` (`mutC`) fails both `leg-sp87-accept-audio-png`
  and `accept-grammar-law`; it is not passed by the file name alone.
- **Delivery events are checked per leg.** `acceptShape` requires the exact eight-event
  sequence including `input@target`, `change@target`, `read@target`, all trusted, with the
  full `[name, size, type, '']` tuple on both file events, plus `state` and the single
  `selectSingle` chooser.
- **Artifacts report the claimed battery/kill-power/selftest values, and the selftest
  artifact post-dates the D4 runner.** `battery-a.json`: 209 cases, 0 failed, coverage
  99/99, uncovered/unknown empty. `killpower-a.json`: 66 mutants, 66 killed, 0 survived,
  0 crashed, 0 unapplied. `selftest.json` (mtime 07:18:56, after the D4 selftest script
  mtime 07:16:18): clean, 9/9 gates green, including the counter gate at 99 and the
  drift gate at 5/0.

## 5. Residual risk and verification gaps

- **No commit anchors any of this.** The entire wave is working-tree only (HEAD = base).
  The D4 freeze and all six pins are verifiable today only because the files have not
  moved; a later commit that differs would invalidate this audit until re-run.
- **The counter cannot tell a real run from a crafted receipt.** All 99 checks are
  receipt-internal plus a two-receipt prior set (`absNeed` 77; observed `absMatched` 0 vs
  both priors, `gapMatched` 0/1). The pinned strings are echoes (F1), so an author who
  fabricates mutually consistent leg events, event logs, argv, teardown probes and
  server logs also fabricates the pins. The declared replay limit (constant-offset
  retiming escapes) is the remaining boundary.
- **I did not re-run the battery, kill power or selftest.** I re-ran the counter directly
  (repeatedly, including the final state) and the five receipt mutations above. The
  battery/kill-power/selftest figures are cited from the captured artifacts; the selftest
  artifact was produced by the D4 script (post-fix) and is green.
- **I did not run the driver**, so the four legs' page-side facts are verified through the
  receipt plus the independent fixture reconstruction (§3 F1), not through a fresh
  observation. The dialog itself remains unmeasured, as C1's limit states.
- **D3 vs D4.** The scored receipt is D3; the wave record now freezes D4 (selftest-only
  change). The D3 pins for the counter/battery/kill-power/drift are unchanged across the
  two freezes, and the D4 selftest scored the D3 receipt green, so the split is
  internally consistent — but a reader of `claims.json` alone would not know the receipt
  pre-dates the freeze it is scored under unless they read `frozenAt`.

## 6. Reproductions (mutations used)

All mutations were copies of the scored receipt under
`/fast/scratch/hyaku/tabi-r87/R87Review1/` (removed before yield); the lane was never
written. Each counter invocation used the real `--lane`, `--prior-set`, driver pin, D3
nonce, fixture pin `10e444f7…`, and (for the scratch receipts) a
`--tree-exempt-sha256 5d38d037…` naming the real receipt so the tree walk stayed closed.

| id | mutation | result |
|---|---|---|
| mutA | per-leg `fixtureInputs[*].accept = "BOGUS/<leg>"` for all four sp87 legs | clean 99 (F2) |
| mutB | top-level `fixtureInputs[aws].accept = "image/jpeg"` | findings: `fixture-descriptors`, `accept-grammar-law` |
| mutC | `sp87-accept-audio-png` read event `ret = "hex:00"` | findings: `leg-sp87-accept-audio-png`, `accept-grammar-law` |
| mutD | `driverSha256 = "0"×64`, `fixture.sha256 = "1"×64`, same values passed as pins | clean 99 (F1) |
| mutE | top-level + per-leg `aa.accept = "BOGUS/audio"`, `fixture.sha256` moved and passed as the pin | findings: `accept-grammar-law`, `fixture-descriptors` |
| lane | scratch lane with `scripts/chrome-cdp-showpicker-round87.mjs` = one garbage line | clean 99 (F1) |

## 7. Verdict

C1's counting command reproduces from the lane's current script bytes against the scored
receipt: **clean, checkCount 99, no findings, exit 0**, with the driver, nonce and fixture
pins as frozen; every `freeze.txt` sha256 matches the on-disk bytes and the freeze digest
chain (`3dd4b0802d67` D3 → `b1d06cf8db57` D4) is verified. The two weaknesses that
survive attack: the pins are receipt echoes rather than instrument-byte checks (F1, with
two runtime demonstrations), and the four new legs' own `accept` descriptors are never
read (F2, with a clean 99 after corrupting all four). F3 is a wording/honesty nit; F4 was
a real reproduction defect in the D3 record, fixed by D4 before this report.
