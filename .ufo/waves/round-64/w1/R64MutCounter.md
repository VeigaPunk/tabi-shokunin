# R64MutCounter — independent mutation of the frozen round-64 counter

Seat: mutation-tester (leaf). Scope: `.ufo/waves/round-64/counters/chromium-wheel-r64.mjs`, frozen,
pin `5cc3c8dd871d8ba38b0bd87b8142c879abf2c3a790392fb7df21c7534c5f01b7` (re-hashed before and after
the run, unchanged; `sha256sum` in `evidence.txt` §0). Input: the live smoke receipt
`.ufo/waves/round-64/controls/smoke/receipt.json`
(`7dc5a2476f6536d9c312b70c55c2b492eabc303109d6eb2692fb1db29641d148`) with its six shots and the
pinned driver `scripts/chrome-cdp-loopback-round64.mjs`
(`1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5`). Declared negatives:
`.ufo/waves/round-64/controls/negatives/` (29). Red-before classes:
`.ufo/waves/round-64/controls/red-before/` (4).

Method: 30 single-line LOOSENING mutants, written by this seat's own harness
`R64MutCounter/mutate-independent-r64.mjs` — **not** derived from
`counters/mutate-r64.mjs` (byte-identical mutant-file overlap with the frozen 16 is 0, `evidence.txt` §5;
no mutant touches the same line+replacement pair as M1–M16). Each mutant is proved single-line
(`matrix.json` `lineCount === 1` for all 30). Each mutant is run on the live receipt, all 29 declared
negatives, all 4 red-before classes, and a **targeted forgery** built for that mutant: a copy of the
live receipt that violates exactly the dropped conjunct (24 of the 30 have one; all 24 are refused by
the pristine bytes, `evidence.txt` §3).

Baseline (pristine bytes): live receipt exit 0 / 29 checks / 0 findings; 29/29 negatives refused;
red-before 1/1/1/0 (the disclosed synthetic-rendering limit stays 0); selftest `clean 31/31`
(`evidence.txt` §1–2). So the counter is not blanket-refusing and every survival below is real.

## Mutant matrix (30)

`liveExit` = mutant on the live smoke receipt. `negsAccepted` = declared negatives the mutant now
accepts (a declared negative noticing the weakening ⇒ the mutant is killed). `forge P→M` = the
targeted forgery under pristine → under the mutant. `survivor` = accepts the live receipt and accepts
no declared negative.

| id | line | check | mutation (find ⇒ replace) | liveExit | negsAccepted | forge P→M | survivor |
|---|---|---|---|---|---|---|---|
| X01-legs-shape-drop-length | 101 | legs-shape | `legs.length === 6 && ` ⇒ ∅ | 0 | — | 1→1 | **dead** |
| X02-wheellog-seq-drop-set-uniqueness | 104 | wheellog-sequence | ` && new Set(wl.map(e=>e.seq)).size === 5` ⇒ ∅ | 0 | — | none | **dead** |
| X03-wheellog-count-widen-ge | 103 | wheellog-count | `legMap[k].wheellogLen === EXPECTED_LEN[k]` ⇒ `>= EXPECTED_LEN[k]` | 0 | wheellog-count | 1→0 | killed |
| X04-delta-y-drop-length | 105 | delta-y-passthrough | `wl.length === 5 && ` ⇒ ∅ | 0 | — | none | **dead** |
| X05-delta-mode-drop-deltaz | 106 | delta-mode-pixels | ` && e.deltaZ === 0` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X06-trusted-drop-cancelable | 107 | trusted-fields | ` && e.cancelable === true` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X07-trusted-drop-type | 107 | trusted-fields | `e.type === 'wheel' && ` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X08-loopback-drop-dsf | 99 | loopback-origin | ` && fixture.deviceScaleFactor === 1` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X09-loopback-drop-bandheight | 99 | loopback-origin | ` && fixture.bandHeight === BAND_HEIGHT` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X10-server-witness-drop-path-allowlist | 143 | server-witness | ` && serverLog.every(path ∈ {/, /favicon.ico})` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X11-survivors-drop-list | 146 | survivors | ` && teardown.survivors.length === 0` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X12-closed-ports-drop-portprobes | 147 | closed-ports | `portProbes.fixture==='closed' && portProbes.devtools==='closed'` ⇒ `true` | 0 | — | 1→0 | **survivor** |
| X13-launch-witness-drop-postkill | 149 | launch-witness | ` && sweeps.postKill === 0` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X14-page-final-state-drop-wheelloglen | 152 | page-final-state | ` && pageState.wheellogLen === 5` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X15-producer-verdict-drop-hypothesis | 151 | producer-verdict | ` && wheelHypothesis === 'CONFIRMED'` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X16-host-identity-drop-version-agreement | 145 | host-identity | version-agreement conjunct ⇒ `true` | 0 | — | 1→0 | **survivor** |
| X17-nonce-pixels-drop-blue | 127 | nonce-pixels | `p[0]!==w \|\| p[1]!==w \|\| p[2]!==w` ⇒ `p[0]!==w \|\| p[1]!==w` | 0 | — | 1→0 | **survivor** |
| X18-scroll-pixels-first-sample-only | 135 | scroll-pixels | `BAND_SAMPLE_Y.every(…)` ⇒ `BAND_SAMPLE_Y.slice(0,1).every(…)` | 0 | — | 1→0 | **survivor** |
| X19-leg-witness-drop-name | 140 | leg-witness | ` && l.witness === l.name` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X20-shot-bytes-drop-bytes | 117 | shot-bytes | ` && s.bytes === l.shotBytes` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X21-shot-bytes-drop-dimensions | 117 | shot-bytes | `s.width===1280 && s.height===900 && ` ⇒ ∅ | 0 | — | 1→1 | **dead** |
| X22-shot-records-drop-name | 114 | shot-records | `l.shot === l.name + '.png' && ` ⇒ ∅ | 0 | shot-records | 1→0 | killed |
| X23-shot-records-drop-positive-bytes | 114 | shot-records | ` && l.shotBytes > 0` ⇒ ∅ | 0 | — | none | **dead** |
| X24-scroll-arithmetic-widen-60px | 102 | scroll-arithmetic | `scrollY === EXPECTED_SCROLL[k]` ⇒ `\|Δ\| <= 60` | 0 | scroll-arithmetic | 1→0 | killed |
| X25-failures-widen-le-one | 150 | failures | `failures.length === 0` ⇒ `<= 1` | 0 | failures | 1→0 | killed |
| X26-nonce-binding-drop-format-regex | 94 | nonce-binding | `/^tabi-r64-[a-z0-9-]+$/` conjunct ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X27-fixture-binding-drop-format-regex | 96 | fixture-binding | `/^[a-f0-9]{64}$/` conjunct ⇒ ∅ | 0 | — | none | **dead** |
| X28-shot-bytes-drop-digest | 117 | shot-bytes | ` && s.sha256 === l.shotSha256` ⇒ ∅ | 0 | — | 1→0 | **survivor** |
| X29-shot-records-drop-digest-format | 114 | shot-records | `/^[a-f0-9]{64}$/` conjunct ⇒ ∅ | 0 | — | none | **dead** |
| X30-scroll-event-witness-hardcode-4 | 113 | scroll-event-witness | `pageState.scrollEvents === wl.filter(!defaultPrevented).length` ⇒ `=== 4` | 0 | — | none | **dead** |

Totals: 30 applied / 30 accept the live receipt (0 blanket refusals) / 4 killed by a declared negative /
26 survive the declared suite / 18 of those 26 accept their targeted forgery (**dangerous survivors**) /
8 are dead conjuncts (no forgery can expose them) / 0 mutants accept any red-before class.
Full data: `R64MutCounter/matrix.json`, exact commands and outputs: `R64MutCounter/evidence.txt`.

## Survivors — 18 unpinned conjuncts, one proposed negative each

| id | dropped conjunct | proposed negative (new receipt in `controls/negatives/<id>/`) |
|---|---|---|
| X05 | `e.deltaZ === 0` | `delta-mode-deltaz`: `wheellog[1].deltaZ = 3` (deltaX 0, deltaMode 0) |
| X06 | `e.cancelable === true` | `trusted-cancelable`: `wheellog[2].cancelable = false` |
| X07 | `e.type === 'wheel'` | `trusted-type`: `wheellog[0].type = 'scroll'` |
| X08 | `fixture.deviceScaleFactor === 1` | `loopback-dsf`: `fixture.deviceScaleFactor = 2` |
| X09 | `fixture.bandHeight === BAND_HEIGHT` | `loopback-bandheight`: `fixture.bandHeight = 60` |
| X10 | server-log path allowlist | `server-witness-path`: append `{path:'/../../etc/passwd', status:200, run:''}` |
| X11 | `teardown.survivors.length === 0` | `survivors-list`: `teardown.survivors = ['pid 4242 chromium']` |
| X12 | `portProbes.* === 'closed'` | `closed-ports-portprobes`: `portProbes = {fixture:'open', devtools:'open'}`, curl still 7/7 |
| X13 | `sweeps.postKill === 0` | `launch-witness-postkill`: `sweeps.postKill = 2` |
| X14 | `pageState.wheellogLen === 5` | `page-final-wheelloglen`: `pageState.wheellogLen = 9` |
| X15 | `wheelHypothesis === 'CONFIRMED'` | `producer-hypothesis`: `wheelHypothesis = 'REFUTED'`, `predicate` true |
| X16 | chromium↔CDP version agreement | `host-identity-agreement`: `chromium = 'Chromium 150.0.1 Linux'`, `cdpProduct` `Chrome/155.0.8059.84` |
| X17 | blue channel of the nonce grid | `nonce-pixels-single-channel`: flip blue only at grid(0,0) in `down1.png` |
| X18 | band samples 2–4 | `scroll-pixels-sample2`: repaint `y=180` at `x=1000..1003` in `up1.png` |
| X19 | `l.witness === l.name` | `leg-witness-name`: `legs[2].witness = 'other'` |
| X20 | `s.bytes === l.shotBytes` | `shot-bytes-count`: `legs[1].shotBytes += 1` (digest untouched) |
| X26 | nonce namespace `/^tabi-r64-[a-z0-9-]+$/` | `nonce-binding-format`: `nonce = nonceOnPage = 'TABI R64 FORGED NONCE'`, fixture sha recomputed from `renderFixture`, six shots re-rendered for that nonce, server-log `run` rebound |
| X28 | `s.sha256 === l.shotSha256` | `shot-bytes-digest-only`: `legs[0].shotSha256 = 'f'.repeat(64)`, `shotBytes` **untouched** |

Forgery receipts for all 18 (plus the 4 killed mutants) are committed under
`R64MutCounter/mutants/<id>/forge/` with their shots.

## Dead conjuncts — property enforced by an implied other check (8)

| id | conjunct dropped | what actually refuses | evidence |
|---|---|---|---|
| X01 | `legs.length === 6` (legs-shape) | shot-records + shot-bytes + nonce-pixels + scroll-pixels + leg-witness each require 6 legs | 7-leg forgery refused by exactly those 5 ids (`evidence.txt` §3) |
| X02 | `new Set(seq).size === 5` | `e.seq === i + 1` already forces uniqueness | no forgery exists |
| X04 | `wl.length === 5` (delta-y) | the six sibling `wl.length === 5` conjuncts (wheellog-sequence, delta-mode-pixels, trusted-fields, cancelation, target-binding, scroll-event-witness) | no forgery exists |
| X21 | shot dimensions 1280×900 | nonce-pixels / scroll-pixels / leg-witness (`at()` returns null out of bounds) | honest 1×1 forgery refused by those 3 (`evidence.txt` §3) |
| X23 | `shotBytes > 0` | shot-bytes' `s.bytes === l.shotBytes` (a decoded file is never 0 B) | no forgery exists |
| X27 | fixture digest format `/^[a-f0-9]{64}$/` | equality to a computed lowercase-hex digest | no forgery exists |
| X29 | shot digest format `/^[a-f0-9]{64}$/` (shot-records) | shot-bytes' `s.sha256 === l.shotSha256` | no forgery exists |
| X30 | `scrollEvents === <prevented count>` | cancelation: exactly one of five is prevented ⇒ the count is identically 4 | no forgery exists |

## Findings

**1. HIGH — the nonce namespace is enforced by no negative and no test: a forged nonce string is
accepted.** Dropping `/^tabi-r64-[a-z0-9-]+$/` from `nonce-binding` (X26) leaves a counter that accepts
a receipt whose `nonce`/`nonceOnPage` is `'TABI R64 FORGED NONCE'` with fixture digest recomputed and
shots re-rendered. The declared `nonce-binding` negative only tests `nonceOnPage !== nonce`, so it
cannot see the format conjunct. Evidence: `R64MutCounter/evidence.txt` §3, `mutants/X26-*/forge/`.
Command:
`node mutants/X26-nonce-binding-drop-format-regex/counter.mjs mutants/X26-nonce-binding-drop-format-regex/forge/receipt.json --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5 --shot mutants/X26-nonce-binding-drop-format-regex/forge --json`
→ `predicate: true, findings: []`; pristine bytes on the same input → `findings: ['nonce-binding']`.

**2. HIGH — the committed-shot digest binding has no isolating negative; a receipt may lie about a
digest.** X28 (`drop s.sha256 === l.shotSha256`) accepts a receipt whose `legs[0].shotSha256` is
`'f'.repeat(64)` while `shotBytes` and dimensions stay honest (`predicate: true, findings: []`,
pristine → `['shot-bytes']`). The declared `shot-bytes` negative cannot kill X28 because it also
changes `legs[1..5].shotBytes/shotSha256` and ships a different PNG set, so `legs[0].shotBytes` (6332)
no longer matches its `start.png` (7061 B) and the *bytes* conjunct refuses it independently
(`evidence.txt` §6). X20 shows the converse: the bytes conjunct is itself unpinned. Each of the three
"recorded vs decoded" bindings is separately unpinned.

**3. MEDIUM — `scroll-pixels` is blind to a 60 px scroll error; the arithmetic check is the only exact
pin on scroll position.** `BAND_SAMPLE_Y = [60,180,300,420]` with `BAND_HEIGHT = 120` samples exactly
one point per band, so a shift of ±60 px lands in the same band index at all four samples.
`expectedBandColor(180, k) === expectedBandColor(240, k)` for every k (`evidence.txt` §4, computed from
the frozen module). Consequence measured: X24 (widen `scroll-arithmetic` to `|Δ| <= 60`) is refused by
the declared `scroll-arithmetic` negative only because that negative also leaves the shot un-rendered —
with a re-rendered shot (X24 forgery) the mutated counter accepts `scrollY = 180` where the receipt
must say 240. The pixel check contributes no independent evidence of scroll position beyond band
alignment.

**4. MEDIUM — the nonce-grid pixel comparison is unpinned channel-by-channel.** X17 (drop the blue
comparison) accepts a shot whose blue channel alone is flipped at grid(0,0) (`predicate: true`), while
the declared `nonce-pixels` negative flips all three channels at once, so no negative isolates the
per-channel comparison. Same class for `leg-witness`'s `l.witness === l.name` (X19) and the second to
fourth band samples (X18).

**5. MEDIUM — eight conjuncts are dead (defence in depth, not defects).** See the table above: X01, X02,
X04, X21, X23, X27, X29, X30. They cannot be reached by any receipt, so the check id that names the
property is not the check that refuses. This is safe for the counter but it means a negative written
against the named conjunct will silently test nothing: e.g. the r63 1×1-PNG class is refused by
`nonce-pixels`/`scroll-pixels`/`leg-witness`, not by `shot-bytes`' dimensions, which is exactly what
X21's forgery shows (`findings: ['nonce-pixels','scroll-pixels','leg-witness']`).

**6. LOW — the declared negative suite kills only 4 of 30 conjunct-level loosenings.** Only
`wheellog-count` (widen), `shot-records` (name), `scroll-arithmetic` (widen) and `failures` (widen) are
isolating; the other 25 negatives exercise a whole check, so any conjunct inside it can be removed
without notice. The frozen `mutate-r64.mjs` avoids this by mutating each check wholesale (its 16/16
distinguished result reproduces exactly, `evidence.txt` §5), but "0 surviving mutants" is therefore a
statement about 16 coarse mutants, not about the counter's conjuncts: at conjunct granularity 18/30
loosened mutants survive the declared suite and accept a forged receipt.

**7. INFO — the r63 failure class stays refused under every mutant.** None of the 30 mutants accepts
`red-before/one-by-one`, `borrowed-shots` or `no-shots` (`matrix.json` `redBeforeAccepted: []`); the
synthetic-rendering control stays exit 0 under all of them, i.e. the disclosed limit did not change
silently. The 1×1/borrowed/no-shot classes are covered by ≥3 independent checks.

**8. INFO — no defect found in the frozen bytes themselves.** Pin unchanged before/after; selftest
`clean 31/31`; pristine baseline exit 0 on the live smoke receipt and 29/29 declared negatives refused;
all 30 mutants accept the live receipt, so every survival above is a coverage result, not a refusal
artefact. The receipt used is the pre-freeze live smoke (design data per `claims.json`); the scored
after-pass receipts are not yet produced at this seat's time of writing.

## Verdict

The frozen counter is **not** blanket-refusing and its 16 declared mutants are genuinely distinguished,
but its conjunct-level coverage is thin: **18 of 30 independent single-line loosenings survive the 29
declared negatives and accept a forged receipt**, concentrated in the run-binding surface that C1
actually rests on (nonce namespace, shot digest, server-log path allowlist) and in the pixel checks
(per-channel nonce comparison, 4-sample band aliasing). 8 further conjuncts are dead and untestable by
construction. Recommended before scoring: add the 18 negatives listed above (each is one receipt edit
plus, for X17/X18/X26, a re-rendered shot) — with `nonce-binding-format` and `shot-bytes-digest-only`
first, since those two let a receipt assert a false run binding with `predicate: true`.
