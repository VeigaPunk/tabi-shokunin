# R63MutDriver — driver-side mutation probe: producer verdict, leg arithmetic, shot bytes

Seat `R63MutDriver`, round 63, wave w1. Lane repo `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(read-only for this seat; `git -C … rev-parse HEAD` = `e5325ad8805df86cb0109373d2ac695f558c2a1f`).
Frozen instrument under attack, both re-hashed **after** all work and matching the freeze pins:

| file | sha256 |
|---|---|
| `scripts/chrome-cdp-loopback-round63.mjs` | `b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040` |
| `.ufo/waves/round-63/counters/chromium-wheel-r63.mjs` | `084705695a394256198b45c15fb7568b629e3bc750bbd46cfcb81cdb312d7178` |

Also re-verified unchanged: `counters/mutate-r63.mjs` `4bf6e614…`, `counters/make-negatives-r63.mjs`
`598a19da…`, `counters/old-generation-r63.mjs` `1ee9cda2…`, `counters/mutants-r63.json` `5f0efd8f…`,
`sources/s166b-mdn-wheelevent.html` `78bd40dc…`, `sources/s167-cssom-view.html` `51a7efdb…`
(full list in `R63MutDriver/hashes.txt`). No frozen file was edited; every mutation is a byte copy in
my scratch, and the mutated copies now live in `R63MutDriver/mutants/` so the cited bytes outlive the
scratch.

Environment: Chromium `155.0.8059.84 Arch Linux`, node `v24.21.0`, python3 + Pillow `13.0.0` (pixel
reads only), cwd for every browser run `/fast/scratch/hyaku/tabi-r63/R63MutDriver` (now deleted).
Ports: HTTP `19497` / CDP `19498`; fresh nonce per run `tabi-r63-mutdriver-<id>`.

## 0. VERDICT

The frozen counter kills every *incoherent* producer lie (4/4: false leg, verdict over false leg,
forged shot hash, foreign receipt) by its own constant comparison, but it cannot detect a *coherent*
fabrication: a driver that publishes the full `0→120→240→120→120→240` arithmetic and four valid PNGs
while the page never scrolls passes with exit 0 and zero findings — so the pin certifies "the verifier
chose these bytes", not "the browser scrolled".

## 1. Mutations (each is a byte copy of the frozen driver; only the named span differs)

All line numbers are the frozen driver's. Diffs: `R63MutDriver/mutations.diff`.

| id | site(s) in frozen driver | mutation | why it is a plausible defect |
|---|---|---|---|
| A1 | `:298` | `receipt.wheelHypothesis = 'CONFIRMED';` (condition dropped) | producer verdict forced green |
| A2 | `:254` + `:298` | `down1` recorded as `scrollY: 240` (true 120) **and** verdict forced | a green producer over a wrong measured leg |
| A3 | `:254` | `down1` recorded as `240` (true 120), verdict logic untouched | transcription error at receipt assembly |
| A4 | `:239` | `sha256: sha256(Buffer.from('not-the-captured-png'))` while writing the real PNG | lying shot hash |
| A4b | `:239` | write/record the **first** capture for all four steps (hash truthful) | stale shot bytes, self-consistent |
| A5 | fixture `:148` | `#tall` height `3000px → 6000px`, fixture sha recorded honestly | edited fixture with an honest hash |
| A6 | fixture `:147` + inserted getter/movement (mutant `:157-158`, `:166`) | `html{overflow:hidden}` (unscrollable) + fake `window.scrollY` getter + scripted `__scrollEvents` | fabricated measurement domain, nothing scrolls |
| A7 | fixture `:147` | `html{overflow:hidden}` **only** | physical ground-truth control for A6 |

Mutant sha256 (also in `hashes.txt` and `summary.json`): A1 `60b61a9c…`, A2 `59585700…`, A3 `31923981…`,
A4 `445211f5…`, A4b `10b043b4…`, A5 `cdf5a33f…`, A6 `45b6f600…`, A7 `4d0e97a5…` (full values in
`R63MutDriver/hashes.txt`).

## 2. Runs — argv, exits, findings

Driver argv (identical shape for every run, `<id>` substituted; full arrays in
`R63MutDriver/summary.json`):

```
node /fast/scratch/hyaku/tabi-r63/R63MutDriver/{driver-pristine|mutants/<id>}.mjs \
  --scratch /fast/scratch/hyaku/tabi-r63/R63MutDriver/runs/<id>/scratch \
  --out     /fast/scratch/hyaku/tabi-r63/R63MutDriver/runs/<id>/receipt.json \
  --nonce   tabi-r63-mutdriver-<id> --http-port 19497 --cdp-port 19498
# cwd /fast/scratch/hyaku/tabi-r63/R63MutDriver
```

Counter argv (cwd `/fast/scratch/hyaku/tabi-r63/R63MutDriver`; `--driver` is the same byte object whose
sha is passed, so the invocation pin always matches the file under test):

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-63/counters/chromium-wheel-r63.mjs \
  /fast/scratch/hyaku/tabi-r63/R63MutDriver/runs/<id>/receipt.json \
  --driver <same driver file> --expect-driver-sha256 <its sha256> \
  --shot /fast/scratch/hyaku/tabi-r63/R63MutDriver/runs/<id> --json
```

| run | driver exit | receipt predicate / verdict | counter exit | counter findings | shape digest¹ |
|---|---|---|---|---|---|
| B0 pristine | 0 | true / CONFIRMED | **0** | `[]` | `f396677f122602c77058e93d98fcbffda3d536acc544df6e9a766670a3a99b73` |
| A1 verdict force | 0 | true / CONFIRMED | **0** | `[]` | `f396677f…` (identical to B0) |
| A2 verdict force + false `down1` | **0** | true / CONFIRMED | **1** | `["scroll-arithmetic"]` | `57af5c7bb4d9de2a…` |
| A3 false `down1` only | **1** | false / REFUTED | **1** | `["scroll-arithmetic","producer-verdict"]` | `57af5c7b…` |
| A4 lying shot hash | 0 | true / CONFIRMED | **1** | `["shot-bytes"]` | `f396677f…` |
| A4b stale shot bytes, truthful hash | 0 | true / CONFIRMED | **0** | `[]` | `f396677f…` |
| A5 edited fixture (6000 px) | 0 | true / CONFIRMED | **0** | `[]` | `f396677f…` |
| A6 fabricated scroll domain | **0** | true / CONFIRMED | **0** | `[]` | `f396677f…` (identical to B0) |
| A7 unscrollable control | **1** | false / REFUTED | **1** | `["scroll-arithmetic","target-binding","scroll-event-witness","producer-verdict","page-final-state"]` | `001a4357…` |

¹ `sha256` of `{legs, wheellog-without-ts, pageState}` — the exact cold-run stable fields named in
`claims.json` C1 `coldRunStableFields`. Full receipt sha256 per run (all cited receipts are in
`R63MutDriver/runs/<id>/receipt.json`):

```
B0 22e334b51a5fbf926de5a37c0762cd5c602bcdae213905b83b91e529eee6ffe6
A1 acb89af0c64f7613063e8b5d6fd90e11a60708f05b2835efe50fc94304645245
A2 0ce3fbcaf72ac55f1d599a55d7e5959d4449b7e577fcefd441bd226382782914
A3 c59982d7a463e683750824cc60862300657577aec0cc190aab8c42a2b7682f99
A4 0e9e2a49dcd24f43f3004be3bdc3f457c3b08ef13f90b30e8b3dcbaceeb9d08c
A4b 99596afddb2e3d6d1aaad3d4d5fb18974405816a57edc3af5db496831bde8e18
A5 55320f54854e110bb2222985f308edbc32a7e263fad48d58928b178ab4c5916b
A6 956b6dffc967651f226da9cbf6f851e0b3a8742848542891a0795ab0386c433a
A7 275b30ef007b4801ba6bc48ceaca71d0e3210f33fd61d67ea6e4fce02e8026a9
```

Frozen counter `--selftest` (probe P5): exit **0**, `verdict=clean`, `cases=22`, `passed=22` — so none
of the escapes below is a selftest failure; they are the intended, unenumerated boundary.

Pin-boundary probes (counter only, no browser; outputs in `R63MutDriver/probes/`):

| probe | invocation | exit | result |
|---|---|---|---|
| P1 | B0 receipt + A1 driver + A1 sha | 1 | `["driver-binding"]` |
| P2 | A1 receipt + frozen driver + frozen pin `b00efd59…` | 1 | `["driver-binding"]` |
| P3 | A1 receipt + A1 driver + frozen pin `b00efd59…` | **2** | `{"error":"counter invocation driver pin mismatch"}` |
| P4 | A6 receipt + frozen driver + frozen pin `b00efd59…` | 1 | `["driver-binding","fixture-binding"]` |

## 3. Findings by severity

### F1 — HIGH (escape): a coherently fabricated scroll domain is accepted with zero findings

`chromium-wheel-r63.mjs:37` (`scroll-arithmetic`), `:45` (`target-binding`), `:46`
(`scroll-event-witness`), `:55` (`page-final-state`) all compare producer-supplied numbers against
constants. A6 (mutant `45b6f600…`) serves a fixture with `html{overflow:hidden}` (frozen fixture CSS
line `:147`), so the viewport has no scrollable overflow, and replaces `window.scrollY` with a getter
driven by `deltaY` (inserted at mutant `:157-158`; fake event counter at mutant `:166`). The receipt then
carries the exact expected legs
`[0,120,240,120,120,240]`, `wheellog.scrollYAtDispatch [0,120,240,120,120]`, `pageState.scrollY 240`,
`scrollEvents 4`, `wheellogLen 5`, verdict CONFIRMED, exit 0 — and the counter returns exit 0,
`findings []`.

Ground truth: A7 (`4d0e97a5…`) is the same fixture with `overflow:hidden` and **no** fake getter; it
records `[0,0,0,0,0,0]`, `scrollEvents 0`, REFUTED, exit 1. A6 and A7 are pixel-identical outside the
nonce glyphs: `R63MutDriver/pixel-witness.json` reports 67 differing pixels — bbox `[131,19,139,30]`,
the nonce text — between `A6/d-release.png` and `A7/d-release.png` (0 differing pixels after masking
`[0,0,200,40]`), while both are 1280×813. Pristine B0's `d-release` (scroll 240) differs from its
`a-wheel-down` (scroll 120) over 1,029,035 pixels (bbox `[0,0,1277,813]`). So the page in A6 never
moved, yet the receipt's arithmetic is exact and the counter blessed it. (A7 vs B0 differs over the full
1,040,640 pixels.)

The check that should have caught it (absent): any binding between shot pixels and reported scroll
offsets — the four A6 PNGs are all `80af59b6…`, i.e. one physical position, and nothing in the counter
requires the 120-position and 240-position views to differ. This is inside C1's declared limit ("a
caller that changes the driver and passes the new pin is outside this claim's boundary"), so it is not
a kill of C1 as written; it is the precise boundary of the phrase "the counter re-derives the
arithmetic": it re-derives against constants, not against the browser, and every input is
producer-authored. It also means the cold-run criterion `coldRunStableFields` + identical PNG sha256 is
satisfiable by construction by this driver (A6's shape digest equals B0's).

### F2 — MEDIUM (escape): `shot-bytes` is hash-of-file, not content authenticity

`chromium-wheel-r63.mjs:122-128` validates only: name matches `^[a-z-]+\.png$`, file exists, `sha256(file)
=== s.sha256`, `size === s.bytes`, PNG magic, width/height > 0. A4b (mutant `10b043b4…`) records the
first capture (`a-wheel-down`, scroll 120) under all four labels with truthful hashes; the counter
returns exit 0. That makes `d-release` claim the scroll-240 view while the file holds the 120 view
(B0's true `d-release` is `1bc648c8…`, A4b's is `c8de4967…`). The bytes are "wrong" in exactly the sense
the C1 target's `stepLabel` binding was meant to stop, and the counter cannot see it.

Note for the integrator: in the pristine run B0, `a-wheel-down`, `b-wheel-up` and `c-swallow` are
byte-identical (`c8de4967…`) because all three are at scroll 120 by design; only `d-release` differs.
So PNG identity between steps is not by itself diagnostic, and the counter has no expected-hash table.

The check that should have caught it: a step↔position binding against an independent reference (or at
minimum a rule that `d-release.png` ≠ `a-wheel-down.png`), which the frozen counter lacks.

### F3 — MEDIUM (escape): the fixture hash is re-derived from the supplied driver, never pinned

`chromium-wheel-r63.mjs:118-121` extracts the `WHEEL_HTML` template from the `--driver` bytes and
substitutes the receipt nonce; `:31` compares `receipt.fixture.sha256` to that freshly derived hash.
There is no constant anywhere. A5 (mutant `cdf5a33f…`) grows `#tall` to 6000 px, records the honest new
fixture sha `af5016e8…`, and is accepted (exit 0, `[]`). P4 shows the binding does work when the
receipt comes from *different* driver bytes (`["driver-binding","fixture-binding"]`), so the mechanism
is receipt↔driver consistency, not fixture authenticity.

The check that should have caught it: compare the re-derived fixture hash (or the fixture template
text) to a frozen constant, e.g. the sha produced by the pinned driver at `b00efd59…`.

### F4 — INFO (survival, benign): forcing the producer verdict alone is observationally inert

A1 (`:298` → unconditional `'CONFIRMED'`) produces a receipt whose legs/wheellog-minus-ts/pageState are
identical to B0 (`f396677f…`); the remaining differences are the run's nonce, `driverSha256` and fixture
sha, and the counter accepts. This is
correct behaviour, not a hole: there is no false datum to catch (`chromium-wheel-r63.mjs:54` is
self-consistency, and the data checks are the load-bearing ones). It does mean the producer-verdict
field carries no evidential weight on a valid run; the counter never uses it to justify acceptance.

### F5 — KILLED (the counter's re-derivation works for incoherent lies)

* **A2** — the assignment's core case: one recorded leg falsified at receipt assembly (`:254`,
  `down1 = 240` vs true 120) while `:298` forces CONFIRMED, driver exit **0**, receipt predicate
  **true**. The counter exits **1** with exactly one finding, `["scroll-arithmetic"]` (`:37`) — i.e. the
  refusal comes from its own constant comparison, not from `producer-verdict`. This is the r62 red-before
  class (producer green over false data) and it is closed for this lie shape.
* **A3** — same leg lie without forcing: driver exit 1, REFUTED; counter exit 1 with
  `["scroll-arithmetic","producer-verdict"]`, proving the arithmetic finding is independent of the verdict.
* **A4** — recorded hash of a constant string while the real PNG is written: counter exit 1,
  `["shot-bytes"]`.
* **P1/P2/P4** — foreign receipt vs driver bytes: `driver-binding` (and `fixture-binding` for A6 under the
  frozen driver). **P3** — `--expect-driver-sha256` ≠ hash of `--driver`: exit 2 before any content check.

## 4. What the driver pin protects when the caller supplies the pin (question 5)

**Protects (mechanism, verified):**
1. `chromium-wheel-r63.mjs:116` — the file named by `--driver` must hash to the `--expect-driver-sha256`
   argument (else exit 2; P3).
2. `:30` — `receipt.driverSha256` must equal the hash of the `--driver` bytes. The driver computes it
   from its own `SELF` path (`chrome-cdp-loopback-round63.mjs:181`), so this binds receipt↔driver bytes
   (P1, P2).
3. `:31` + `:118-121` — `receipt.fixture.sha256` must equal the fixture template hash re-derived from
   those driver bytes (P4). A receipt from another driver fails 2, and fails 3 as well whenever that
   driver's fixture template differs (P4: A6's fixture, so both findings fire).

**Does not protect:**
1. **Provenance/authorship.** There is no signature and no trust root; the receipt self-reports its own
   driver hash. A mutated driver paired with its own sha is internally consistent and passes 1–3. Every
   mutation outside the fixture block (A1–A4b) is invisible in this configuration, and fixture edits
   (A5, A6) are equally invisible for the reason in point 2; the only reasons A2/A3/A4 were caught are
   that the *data* contradicts the counter's constants, not that the driver was detected.
2. **Fixture identity.** The fixture hash is derived from the supplied driver (F3), so any fixture edit
   passes when accompanied by the mutated driver and its pin (A5, A6).
3. **Measurement authenticity.** Legs, `wheellog`, `pageState`, `host.argv`, `nonceOnPage`, `sweeps`,
   `teardown` and `serverLog` are all producer-authored fields. The single out-of-band artifact is the
   shot files, and their check is self-consistency plus PNG header/dimensions (F2), not a binding to
   scroll position (F1). Hence "the counter re-derives the arithmetic" means: it re-derives *the
   producer's numbers against hardcoded expectations*, not from an independent observation.

**Consequence for scoring.** The C1 `afterCommand` names the frozen constant `b00efd59…`, so under the
declared verification procedure the pin is meaningful: a substituted driver or an imported receipt is
refused (P2, P4). Its guarantee is exactly "the verifier chose these bytes", never "these bytes are
honest". A driver that fabricates coherently — A6: unscrollable page, scripted `scrollY`, four identical
PNGs — reproduces C1's stable fields byte-for-byte and passes; the claim's `limits` already place that
caller outside the boundary, and F1/F2/F3 show how completely that outside can be exercised.

No defect in the frozen files is claimed for A1/A5/A6/A4b: each is admitted by the bytes as written
under a caller-chosen pin. The three items above name the checks that would have to exist for the
counter to *certify the browser behaviour* rather than the receipt's internal consistency; per the seat
contract I did not repair them.

## 5. Checks not run (explicitly skipped)

* The ten committed negatives and the eight exact-line counter mutants
  (`counters/make-negatives-r63.mjs`, `counters/mutate-r63.mjs`, `controls/mutation/`) — other seats' scope.
* The scored cold-run stability comparison and `compare-stability-r63.mjs`; the lane self-assessment gate
  (C2) and `scripts/check-selfassessment.mjs`.
* Any git/jj mutation. Only read-only `git -C … rev-parse/status` was used; nothing was committed.
* No pixel analysis outside B0/A6/A7; no external network beyond the loopback fixture; no browser other
  than `/usr/bin/chromium`.

Driver exit codes in §2 were observed at run time; the driver maps them mechanically at `:303`
(`process.exitCode = receipt.predicate ? 0 : 1`), consistent with the stored receipts. Counter exits
were re-executed against the preserved receipts and recorded in `R63MutDriver/runs/<id>/counter.exit`;
`counter.stdout`/`counter.stderr` beside them are the full logs.

## 6. Artefacts (all under this seat's wave directory)

```
R63MutDriver/summary.json          full matrix: argv, cwd, driver/receipt/fixture/shot hashes, exits, findings
R63MutDriver/runs/<id>/            receipt.json, driver.stdout|stderr, counter.stdout|stderr, counter.exit, pngs.sha256
R63MutDriver/mutants/A1..A7.mjs    the mutated driver bytes (byte-identical to those executed)
R63MutDriver/mutations.diff        unified diffs vs the frozen driver
R63MutDriver/probes/P1..P5         pin-boundary probes + frozen counter selftest
R63MutDriver/pixel-witness.json    A6/A7/B0 PNG hashes, diff bboxes and pixel counts
R63MutDriver/pngs/{B0,A6,A7}/      the 12 witness PNGs + SHA256SUMS
R63MutDriver/hashes.txt            frozen pins re-verified, mutant hashes
```

## 7. Scratch and footprint

Scratch root `/fast/scratch/hyaku/tabi-r63/R63MutDriver` deleted before yield:
`rm -rf …` exit `0`; `test -e …` exit `1` (absent). Nothing was written outside
`.ufo/waves/round-63/w1/R63MutDriver/`, `.ufo/waves/round-63/w1/R63MutDriver.md` and that scratch root;
no `MANIFEST.json`, `.ufo/state`, fleet-repo or sibling-lane path was touched. No tools were installed
(no pacman, no uv/npx installs, no PATH writes); the only non-node tool used was preinstalled
python3+Pillow for read-only pixel comparison.

**VERDICT:** counter catches incoherent producer lies (A2/A3/A4 and every foreign-receipt probe killed
by its own constants) but accepts coherent fabrication — A6 publishes the full expected scroll
arithmetic and four valid PNGs from a page that never scrolled (exit 0, zero findings), so the
driver pin guarantees only verifier-chosen bytes, not measured browser behaviour.
