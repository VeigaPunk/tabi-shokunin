# R63Critic — attack on the C1 evidence discipline

Seat: R63Critic (leaf, wave w1, round 63). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Freeze commit `816592612dd2a8073437c595d3fe3c477125cf3c`; baseline `f098bcf8843c8a5a723a83995352180f897a6ff9`; HEAD at review `e5325ad8805df86cb0109373d2ac695f558c2a1f`.
Node `v24.21.0`. No browser was launched by this seat; every number below comes from re-running the frozen counter / comparator / mutator through their production CLI, or from my own scripts in `w1/R63Critic/scripts/`.

Receipts beside this report: `w1/R63Critic/{critic-matrix.json, donothing.json, shape-rederive.json, repro-matrix-smoke.json, repro-matrix-data.json, stability-clone.json, stability-repro.json, selftest.json, nowork-rerun.json, hashes.txt, mutants/, fab/, clone/, scripts/}`.

---

## 1. The frozen surface, re-verified first

| check | argv / method | cwd | exit | result |
|---|---|---|---|---|
| 8 declared pins vs `claims.json` | `sha256sum` over the 8 pinned paths | lane root | 0 | all 8 match the pin strings |
| pins at the freeze commit | `git -C tabi-shokunin show 81659261:<path> \| sha256sum` | fleet root | 0 | all 8 MATCH worktree bytes |
| counter selftest | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs --selftest` | lane root | 0 | `verdict=clean cases=22 passed=22` |
| C1 afterCommand, verbatim | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs corpus/evidence/round63/chromium-wheel-scroll/receipt.json --driver scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040 --shot corpus/evidence/round63/chromium-wheel-scroll --json` | lane root | 0 | `predicate true`, `findings []` |
| 10 declared negatives | same argv per file in `.ufo/waves/round-63/controls/negatives/n*.json` | lane root | 1 ×10 | findings exactly as `matrix.json` (n1/n2 `producer-verdict`, n3 `scroll-arithmetic`, n4 `wheellog-sequence`, n5 `delta-y-passthrough`, n6 `cancelation`, n7 `shot-bytes`, n8 `survivors`, n9 `nonce-binding`, n10 `launch-guards`) |
| 8 committed mutants, smoke live | `node .ufo/waves/round-63/counters/mutate-r63.mjs run --counter … --mutants …/mutants-r63.json --driver … --expect-driver-sha256 b00e… --live .ufo/waves/round-63/controls/smoke/receipt-run1.json --shot …/controls/smoke --negatives …/controls/negatives --work <wave>/work-smoke --out w1/R63Critic/repro-matrix-smoke.json` | lane root | 0 | `survived []`, `allKilled true` |
| 8 committed mutants, scored live | same, `--live corpus/evidence/round63/chromium-wheel-scroll/receipt.json --shot corpus/evidence/round63/chromium-wheel-scroll` | lane root | 0 | `survived []`, `allKilled true` |
| 6 no-work controls | argv replayed verbatim from `controls/no-work/*.command.json` | lane root | 2,2,1,2,0,0 | matches each control's recorded exit; `nowork-rerun.json` |

The eight committed mutant files hash exactly to the `counterSha256` values recorded in `controls/mutation/matrix.json`; `M1-…` = `3924a3db…`, … `M8-…` = `a1939b26…`.

**Attribution failure found while doing this:** my two reproductions (smoke live vs scored live) and *both* committed matrices are one and the same byte string,
`7e5b4691a9c3188614ed49e320c1291af8ac103ce6ced465fd6f1e88ccd432d0`
(`controls/mutation/matrix.json`, `controls/mutation/matrix-data.json`, `w1/R63Critic/repro-matrix-smoke.json`, `w1/R63Critic/repro-matrix-data.json`). See F3.

---

## 2. Findings by severity

### F1 — HIGH — the counter greens a hand-authored receipt with no browser run; `forgedGreen: 0` and the `limits` boundary are false under any plain reading

Attacks: `counters/chromium-wheel-r63.mjs:48` (`shot-bytes`), `:28-55` (the whole check list), `:127` (what "shot bytes" actually validates), `claims.json:39` (statement), `claims.json:47` (`forgedGreen: 0`), `claims.json:63` (limits).

I authored a complete receipt from prose (`w1/R63Critic/scripts/fabricate.mjs`, `w1/R63Critic/fab/receipt-tiny.json`, sha `70b44afc3f86f557818f250e174e27b10d7366dd934fc4661c900df97fced5e1`): nonce `tabi-r63-critic-fabricated`, `ts = 1..5`, `host.argv` naming `--user-data-dir=/nonexistent/fabricated-profile` and port `1`, `fixture.sha256` computed from the frozen driver template with that nonce (`585a921f62f557815cd5e56e84d5b13cdc753183fc1f657062d8b03475f7aafe`). Its four "step" PNGs are four copies of one 70-byte 1×1 PNG (`c414cd0e204de974f73753c7e28d7638e7b3691bb8b1a2bab6b25bb7fed7ce77`). No browser process was started.

| scenario | receipt | `--shot` | exit | findings |
|---|---|---|---|---|
| A | `fab/receipt-tiny.json` | `fab/shots-empty` | **1** | `["shot-bytes"]` |
| B | `fab/receipt-tiny.json` | `fab/shots-tiny` | **0** | `[]` — `predicate true` |
| C | `fab/receipt-borrow.json` (steps declared from the real bytes) | committed evidence dir | **0** | `[]` |
| D | `fab/receipt-tiny.json` | committed evidence dir | **1** | `["shot-bytes"]` |

Exact argv for B (`w1/R63Critic/donothing.json` records all four with cwd and hashes):

```
cwd=/home/vgpnk/Projects/shokunin/tabi-shokunin
node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs \
  .ufo/waves/round-63/w1/R63Critic/fab/receipt-tiny.json \
  --driver scripts/chrome-cdp-loopback-round63.mjs \
  --expect-driver-sha256 b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040 \
  --shot .ufo/waves/round-63/w1/R63Critic/fab/shots-tiny --json
=> exit 0, {"predicate": true, "findingCount": 0, "findings": []}
```

A and D isolate the barrier: the **only** thing standing between a fabricated receipt and a green is `shot-bytes`, and `shot-bytes` reduces to "each declared `sha256`/`bytes` pair matches some file in `--shot` that carries the PNG signature and non-zero IHDR width/height" (`counters/chromium-wheel-r63.mjs:124-127`). The `sha256` and `bytes` are receipt-declared, so the author chooses the files. PNG dimensions are never compared with the declared `viewport` 1280×900, and the 1×1 images pass. Every other field — nonce, nonceOnPage, driverSha256, fixture.sha256, origin, argv, legs, wheellog, pageState, steps, serverLog, teardown, sweeps, failures, predicate, wheelHypothesis — is self-declared and only cross-checked against other self-declared fields (the fixture hash is computed from the *frozen driver* plus the receipt's own nonce, so it is computable by the author too).

Consequences, stated precisely:
- `claims.json:47` `"forgedGreen": 0` is **1** under the plain reading ("a forged receipt the counter accepts"); scenario C makes it 2. `claims.json` never defines "forged". If the L1 means only "a real receipt with one field falsified", it must say so — nothing else excludes the do-nothing class.
- `claims.json:63` says "…it does not authenticate the receipt (a caller that changes the driver and passes the new pin is outside this claim's boundary)". The parenthetical is **false as a boundary statement**: no driver change is needed. Scenario B keeps the frozen driver and the pinned hash and still greens. The honest sentence is "any caller that authors the receipt and supplies any four valid PNGs is outside this claim's boundary."
- The claim's first sentence ("produces a receipt the counter accepts") remains true of the real run, but acceptance carries no provenance: where no run exists the counter greys nothing.

Smallest safe correction (no instrument edit): rewrite `claims.json:63`'s parenthetical and `:47` to state that the acceptance predicate is internal-consistency only and that a hand-authored receipt with arbitrary PNG bytes is accepted; or commit an `n11-do-nothing-fabricated-receipt` control that is expected to be refused — which, on these frozen bytes, it would not be.

### F2 — MEDIUM — 11 of my 14 exact-line mutants survive the entire committed control suite; the `deltaMode 0` clause the statement asserts is deletable

Attacks: `counters/chromium-wheel-r63.mjs:31,38,42,43,45,46,49,51,52,53,55`; `controls/mutation/matrix.json`; `claims.json:39`, `:50`.

14 mutants, each an exact single-site replacement of the frozen counter (`w1/R63Critic/mutants/critic-mutants.json` records line/col/pre/post and each mutant's `counterSha256`; the full per-mutant × per-negative exit and finding map is `w1/R63Critic/critic-matrix.json`). Every mutant accepts the live receipt (`liveExit 0` for all 14).

| id | frozen line | edit | live exit | false-greens | class |
|---|---|---|---|---|---|
| X1 | 54 | drop the whole producer check → `check(true,'producer-verdict')` | 0 | n1, n2 | distinguished |
| X2 | 54 | keep `r.predicate===true` only | 0 | n1 | distinguished |
| X3 | 54 | keep `r.wheelHypothesis==='CONFIRMED'` only | 0 | n2 | distinguished |
| X4 | 42 | drop `&& e.deltaMode === 0` | 0 | — | **survivor** |
| X5 | 43 | drop `&& e.isTrusted === true` | 0 | — | **survivor** |
| X6 | 45 | drop `&& e.scrollYAtDispatch === EXPECTED_AT_DISPATCH[i]` | 0 | — | **survivor** |
| X7 | 55 | drop `page-final-state` → `check(true,…)` | 0 | — | **survivor** |
| X8 | 38 | drop `wheellog-count` → `check(true,…)` | 0 | — | **survivor** |
| X9 | 53 | `failures.length === 0` → `Array.isArray(failures)` | 0 | — | **survivor** |
| X10 | 46 | drop `scroll-event-witness` | 0 | — | **survivor** |
| X11 | 49 | drop `server-witness` | 0 | — | **survivor** |
| X12 | 51 | drop `closed-ports` | 0 | — | **survivor** |
| X13 | 52 | drop `sweeps.midRun > 0` | 0 | — | **survivor** |
| X14 | 31 | drop `fixture-binding` | 0 | — | **survivor** |

For each survivor, all ten declared negatives still exit 1 (details per negative in `critic-matrix.json`). So the full committed control suite — ten negatives plus eight mutants — cannot see these eleven deletions.

**The producer-verdict question, answered directly.** A different edit from M1 *can* be written, and it is caught: dropping the producer check entirely (X1) false-greens **both** polarity negatives; predicate-only (X2) false-greens n1; hypothesis-only (X3) false-greens n2. The two-polarity negative design at `counters/make-negatives-r63.mjs:17-19` closes that line — the matrix's claim of producer coverage holds. The surviving deletions lie in the checks that have **no** negative, and the matrix is one mutant per named check rather than one per counter check (8 mutants covering 9 of the 10 negatives; n9 has no mutant), so it never exercises them.

The clause-level consequence is the sharpest one: `claims.json:39` asserts "deltaY passthrough with deltaMode 0". X4 deletes exactly the `deltaMode === 0` conjunct (`counters/chromium-wheel-r63.mjs:42`) and nothing in the committed suite distinguishes it. A receipt with `deltaMode: 1` would be accepted by X4 and is untested by any committed negative against the pristine counter. The counter itself still refuses such a receipt; what is false is any reading of `mutantsSurviving: 0` (`claims.json:50`) as "the counter's checks are mutation-covered".

Smallest safe correction: scope `:50` to "of the eight declared mutants", and either add a `deltaMode:1` negative plus mutants for the uncovered checks (next freeze — not this one), or disclose the eleven survivors as a limit.

### F3 — MEDIUM — the mutation matrix artifact is input-blind; it cannot be attributed to the scored receipt

Attacks: `counters/mutate-r63.mjs:121-124` (result object), `controls/mutation/matrix.json`, `controls/mutation/matrix-data.json`.

The result object records `counter`, `counterSha256`, `baseline.liveExit`, `negativeExits`, `mutants` — but not the live receipt, the shot directory, the driver pin, or the negatives directory. Running the frozen mutator twice, once on `.ufo/waves/round-63/controls/smoke/receipt-run1.json` (pre-freeze design data) and once on `corpus/evidence/round63/chromium-wheel-scroll/receipt.json` (scored), produced two files that are **byte-identical to each other and to both committed matrices** (`7e5b4691…`). The artifact therefore cannot witness the kill rule "the mutation matrix over the scored receipt": it is equally the smoke matrix. Related: the ten negatives are clones of the smoke receipt (`controls/negatives/n1…n10` carry `nonce: tabi-r63-smoke-one`), so no negative falsifies a scored-receipt-only field either.

Smallest safe correction: at scoring, cite `matrix` together with the exact `--live` receipt sha (`3aa3ce40…`) and the afterCommand, and state that the matrix is input-blind; next generation, add `live`, `shot`, `negatives`, `driver` to the result object.

### F4 — MEDIUM — "two independent cold runs" is not evidenced; the comparator is unpinned and a field-edited clone passes it

Attacks: `claims.json:39` (second sentence), `claims.json:52` (`coldRunIdenticalPngs: 4`), `counters/compare-stability-r63.mjs:31,39,41-42` (untracked, unpinned, sha `39e76c98…`).

`counters/compare-stability-r63.mjs` is **not** in the freeze pins and is untracked at HEAD, yet it is the only instrument behind `coldRunStableFields`/`coldRunIdenticalPngs`. Its check is shape equality plus index-wise PNG equality; it never tests independence. I made the counterexample: took the scored run-1 receipt, changed only `nonce`/`nonceOnPage`/`fixture.sha256` (recomputed) and copied the four PNGs (`w1/R63Critic/clone/receipt-clone.json`), then ran

```
cwd=lane root
node .ufo/waves/round-63/counters/compare-stability-r63.mjs \
  --a corpus/evidence/round63/chromium-wheel-scroll/receipt.json \
  --b .ufo/waves/round-63/w1/R63Critic/clone/receipt-clone.json \
  --a-shots corpus/evidence/round63/chromium-wheel-scroll \
  --b-shots .ufo/waves/round-63/w1/R63Critic/clone/shots \
  --out .ufo/waves/round-63/w1/R63Critic/stability-clone.json
=> exit 0, {"verdict":"STABLE","shapeEqual":true,"pngsIdentical":true,"sameDriver":true}
```

A byte-copy is "STABLE". Also `recordedMatches` at `compare-stability-r63.mjs:31` checks only receipt **a**'s declared sha against a's file; b's declared sha is never compared with b's bytes. And `sameFixture:false` in `controls/stability-data.json` is structural, not a divergence: `fixture.sha256` is `sha(template with ${nonce})`, so any two different nonces force different fixture hashes (counter `:121`).

The real data pair does satisfy the claimed equalities (see §3), and the real pair is stored in two directories; but the evidence that they were two runs, not one receipt copied, is only the self-declared nonce/host/ts fields.

Smallest safe correction: reword `:39` to "two runs whose receipts differ only in nonce/host/timestamps produce identical shapes and PNG bytes" (which is what the bytes show), and pin `compare-stability-r63.mjs` in the next freeze. Do not cite it as an independence proof.

### F5 — LOW — `fixture-binding` is a tautology and the selftest shares the tautology

Attacks: `counters/chromium-wheel-r63.mjs:31`, `:72` (`const ext = { …, fixtureSha256: 'b'.repeat(64) }` vs the synthetic fixture sha `'b'.repeat(64)`), `:130`.

`external.fixtureSha256` is computed by the counter from `--driver` + `r.nonce`; the receipt declares its own `fixture.sha256`; an author who has the frozen driver (everyone) computes the accepted value. X14 deletes the check and survives. In the selftest the synthetic receipt's fixture sha is the same `'b'.repeat(64)` constant as `ext.fixtureSha256`, so the selftest cannot fail this check for the right reason. Not a false claim (the claim doesn't say the fixture hash proves provenance), but it is one of the "binding" checks a reader may over-read.

### F6 — LOW — the scored evidence is untracked at HEAD; the afterCommand targets an untracked tree

`git -C tabi-shokunin status --porcelain` shows `?? corpus/evidence/round63/`, `?? .ufo/waves/round-63/counters/compare-stability-r63.mjs`, `?? .ufo/waves/round-63/controls/{stability-data.json,negatives-data/,mutation/matrix-data.json}`. `claims.json`'s freeze rule permits post-freeze scored evidence, so this is not a freeze violation — but C1's afterCommand names `corpus/evidence/round63/…`, and the kill rule "the counter exits nonzero … at the data revision" is only evaluable once that tree is committed. Landing obligation for the L1; also `M SCORECARD.md`, `M corpus/SOURCES.md` are dirty (C2 territory, not mine).

### F7 — LOW — the four step images are two distinct images, and image content is never bound to the declared scroll states

Attacks: `counters/chromium-wheel-r63.mjs:47-49,124-127`; `scripts/chrome-cdp-loopback-round63.mjs:264-274`.

The driver captures `a` after `down1` (scrollY 120), `b` after `up1` (120), `c` after `swallowed` (120) and `d` after `released` (240) — `scripts/chrome-cdp-loopback-round63.mjs:264-274`. So `a=b=c` byte-for-byte is expected, and the four records carry **two** distinct shas (`c8de4967…` ×3, `1bc648c8…`). The counter checks neither dimension nor content against `scrollY`, and accepts four 1×1 images (F1). The swallow's visual evidence (c must equal b) is never asserted. Consequently "identical PNG sha256 bytes" across runs (true) is determinism of a static fixture: the same four shas appear in the pre-freeze smoke runs and in both scored runs, so the PNG bytes carry no run identity.

### F8 — INFO — one committed source file is not pinned

`.ufo/waves/round-63/sources/s166-mdn-wheel.html` (`6ec7ec37…`) exists at the freeze commit and in `git ls-tree 81659261` but is absent from `claims.json.pins`; only `s166b-mdn-wheelevent.html` (`78bd40dc…`) and `s167-cssom-view.html` (`51a7efdb…`) are pinned. A post-freeze edit to `s166-mdn-wheel.html` would invalidate no claim. Either pin it or drop it; the C1 knowledge entry must cite the pinned `s166b`.

### F9 — INFO — redundant uniqueness clause

`counters/chromium-wheel-r63.mjs:40`: `new Set(wl.map(e=>e.seq)).size === 5` is implied by `wl.every((e,i)=>e.seq===i+1)`; n4 is caught by the seq clause alone. M3 deletes the whole expression, so the matrix does not distinguish the two; not a defect, but the "uniqueness" language in the statement rests on `seq===i+1`.

---

## 3. The three assigned questions, answered from bytes

**(1) Own mutants.** 14 written at lines I chose; results in §F2 and `critic-matrix.json`. Survivors: X4–X14 (11). No survivor's edit is caught by any committed negative. The producer line is *not* the weak point: X1/X2/X3 are each distinguished.

**(2) Do-nothing control.** A hand-authored receipt with plausible fields and no browser run **greens** (scenario B, exit 0, zero findings) as soon as `--shot` contains any four valid PNGs; with an empty `--shot` it is refused on `shot-bytes` alone (A), and with mismatched declared bytes it is refused on `shot-bytes` alone (D). So: `shot-bytes` is the only barrier, and it is a file-existence+self-consistency barrier, not a provenance barrier. Scenario C shows real committed bytes can be borrowed by a fabricated receipt (the receipt's nonce is nowhere in the pixels).

**(3) Exactness, re-derived from committed bytes** (`w1/R63Critic/shape-rederive.json`):

| pair | legs | wheellog−ts | pageState | declared step shas | distinct shas/run | PNG files across dirs |
|---|---|---|---|---|---|---|
| smoke run1 vs run2 (`controls/smoke/receipt-run{1,2}.json`, `844f9fac…`/`954cee8a…`) | equal | equal | equal | equal | 2 | **same four files** — both receipts resolve to `controls/smoke/*.png`; there is no second smoke shot dir |
| scored run1 vs run2 (`corpus/evidence/round63/chromium-wheel-scroll/receipt.json` `3aa3ce40…` vs `stability/receipt-run2.json` `680e8c20…`) | equal | equal | equal | equal | 2 | two dirs, byte-identical (`c8de…` ×3, `1bc6…`) |

So the sentence is literally true for both pairs — with two qualifications: for the smoke pair the "identical PNG bytes" are the *same four files* (one copy), and in every run only two of the four images are distinct, for the capture-order reason in F7.

**(4) Weakest sentence + falsifying control.** Weakest: `claims.json:63`, second sentence —

> "The counter validates internal consistency against the invocation-supplied driver pin; it does not authenticate the receipt (a caller that changes the driver and passes the new pin is outside this claim's boundary)."

The first clause is true; the parenthetical boundary is false. Falsifying control: scenario B / `w1/R63Critic/donothing.json` — no driver change, pin unchanged, exit 0, zero findings.
Second weakest: `claims.json:39` "Two independent cold runs…" — falsified as *evidence* by the clone control (`stability-clone.json`, STABLE exit 0).

---

## 4. What I did not do

- Did not rebuild or edit any committed control (`controls/` untouched), any frozen instrument, `claims.json`, or anything outside `w1/R63Critic/` and my scratch.
- Did not launch Chromium or the driver; no browser run of mine is claimed. (The "no browser run" in F1 refers to the fabricated receipt, which is why it is a do-nothing control.)
- Did not run C2's self-assessment gate; C2 is out of this seat's scope.
- No tool installs or upgrades were needed (node 24.21.0, python 3, sha256sum, git read-only).
- Scratch `/fast/scratch/hyaku/tabi-r63/R63Critic/` deleted before yielding (only my wave-dir copies of fabricated/cloned inputs remain, because the report cites them).

---

## VERDICT

C1's positive run and its shape/PNG exactness re-derive clean and its producer-polarity control holds (X1/X2/X3 all distinguished), but the acceptance predicate is provenance-blind — a hand-authored receipt plus four 70-byte 1×1 PNGs exits 0 with zero findings — so `forgedGreen: 0` and the `limits` boundary are false as written, and 11 of my 14 exact-line counter deletions (including the `deltaMode 0` clause) survive the entire committed control suite, which makes `mutantsSurviving: 0` a property of the chosen eight rather than of the counter.
