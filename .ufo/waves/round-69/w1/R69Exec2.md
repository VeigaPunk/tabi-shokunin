REPRODUCED

# R69Exec2 — calibration re-derivation of the round-69 pre-freeze controls and pins

Seat: R69Exec2 (calibration, leaf). Lane: tabi. Round 69, wave w1.
Read-only. No git/jj mutation, no production or lane-root writes. Instruments were **not** amended
(claims freeze: "any pinned instrument byte or the snapshot changes after freeze → killed, never amended").

| anchor | value |
|---|---|
| lane tip at time of run | `d65546b30332d41b51b074b1944a8a3ded47a79f` |
| freeze commit | `a033979c55c92dca2913a8f94ac9f1cb6c4b38da` (parent `a70c231d`, verified) |
| pre-freeze controls | `a70c231d484ece2031d26e6c44104419cc8705d7` |
| base | `58d84eda992ffc11d77d76a2c1019bfe061f9241` |
| snapshot | `.ufo/waves/round-69/c1/sibling-heads-r69.tsv`, 20 lanes, captured `2026-11-06T15:46:41-03:00` |
| scratch used (deleted) | `/fast/scratch/hyaku/tabi-r69/R69Exec2/` |

Verdict word: **REPRODUCED** — every pinned byte and every committed control re-derives exactly from
committed bytes at the freeze, with one instrument-robustness defect that is fail-closed (finding F1).

---

## 1. Freeze digests — 6/6 verified at `a033979c` (snapshot included)

Command per row: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show a033979c:<path> | sha256sum`

| path | digest at `a033979c` | vs `freeze.txt` |
|---|---|---|
| `scripts/check-sibling-matrix-r69.mjs` | `b62f9c7daebfbd0a1494e9a60a9ee06665574f1f98969ba1c08da0d698c58b20` | OK |
| `scripts/negatives-sibling-matrix-r69.mjs` | `dac61e1b829003da4ef2b1b1de64ba014f194721d20d7a0597ecb6857394ba92` | OK |
| `scripts/chrome-cdp-synthscroll-round69.mjs` | `13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3` | OK |
| `scripts/check-synthscroll-r69.mjs` | `c1b3763c9781ad4cebd26d5298de46529258c4fe40b54cd2c6c62080492da795` | OK |
| `scripts/negatives-synthscroll-r69.mjs` | `37e8f9627d12a229d0a24a6bcabf5fcf07d6f82caaf27d61e15d87b5b20c7f97` | OK |
| `.ufo/waves/round-69/c1/sibling-heads-r69.tsv` (snapshot) | `5aa91a5886f6eb64eec56673861532967d80f18ae9b833d8e58b9caf6a5fbdf4` | OK |

Working-tree bytes at run time were byte-identical for all six (same digests recomputed from disk), so
no post-freeze drift of any pinned instrument or of the snapshot.

Freeze provenance:
- `d65546b3` is the child of `a033979c` (`git log --format='%h %p'` → `d65546b3 a033979c`), committed
  `2026-11-06T15:50:10-03:00`, i.e. after the freeze commit and before any scored run — matches
  `claims.json` "frozenAt".
- `freeze.txt` at `d65546b3` and in the worktree are the same bytes:
  `1aeac24af3ab4c31b90b2877e003ed5f47746b48f99a1bff8f9112043f99da5a`.
- `claims.json` at `a033979c` and in the worktree are the same bytes:
  `1a3769eb1ef1016f6be5059cda387bafca5f242b831a02aad4b074a41cfa91a4`.
- Staged source S174 `.ufo/waves/round-69/sources/input_handler.cc` =
  `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4` — matches the digest named in
  the C2 claim. S173 `.ufo/waves/round-68/sources/Input.pdl` =
  `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d`.

## 2. Probe re-runs — exit codes and agreement with committed controls

All outputs are in this directory; `EXITS.json` is the machine-readable index.

| # | probe | exit | committed counterpart | agreement |
|---|---|---|---|---|
| 1 | C1 do-nothing on base `PROVINCE.md` (`58d84eda`) | **1** (expected 1) | `controls/c1/donothing-head.out` | **byte-identical JSON**: `verdict=red, siblings=20, rows=0, bound=0, findings=[matrix-missing], outbound=[kagi,kaidoku,kake,revenger]` |
| 2 | C1 fixture battery | **0** (expected 0) | `controls/c1/fixture-battery.json` | `negatives=19, refusedForExpectedReason=19, positiveOk=true, failed=[]`; `results` array **identical**; `counterSha256` `b62f9c7d…` match |
| 3 | C1 real-mode battery on base (extra control) | 1 | none committed | reached by an uncaught `TypeError`, not a verdict → **F1** |
| 4 | C2 no-receipt | **2** (expected 2) | `controls/c2/donothing-no-receipt.out` | same `verdict=unreadable`, same `id=receipt-unreadable`; detail differs only by the path I passed |
| 5 | C2 degenerate `js-scroll` | **1** (expected 1) | `controls/c2/degenerate-js-scroll-counter.out` | **IDENTICAL** `verdict/checkCount/nonce/findings` (62 checks, 18 findings) |
| 6 | C2 degenerate `dispatch-wheel` | **1** (expected 1) | `controls/c2/degenerate-dispatch-wheel-counter.out` | **IDENTICAL** (62 checks, 6 findings) |
| 7 | C2 degenerate `skip-touch` | **1** (expected 1) | `controls/c2/degenerate-skip-touch-counter.out` | **IDENTICAL** (62 checks, 10 findings) |
| 8 | C2 battery, scored receipt + 3 laundered degenerates | **0** (expected 0) | `scored/c2-negatives-a.json` | `negatives=44, refusedForExpectedReason=44, positiveOk=true, failed=[]`; `results` **identical**; `counterSha256` `c1b3763c…` match |
| 9 | C2 counter on scored receipt with driver pin (predicate (a)) | **0** (expected 0) | `scored/c2-counter-a.json` | **identical** modulo the receipt path string: `clean, checkCount=63, nonce=tabi-r69-scored-81ac744e, findings=[]` |

Extra details worth recording:
- The 3 laundered degenerates are refused *after* their `degenerate` field is nulled:
  `laundered-js-scroll` → 15 ids, `laundered-dispatch-wheel` → 3 ids, `laundered-skip-touch` → 6 ids.
  None greens. The 44 negatives = 41 synthetic + 3 laundered; the positive is result 0 of 45.
- C1 fixture battery refuses each of the 19 forgeries for its expected id, and the 19 are distinct
  attack classes: `matrix-missing, matrix-header, lane-missing, duplicate-lane, unknown-lane,
  relation-vocab, head-not-snapshot, cite-shape, cite-file-absent, cite-line-absent, quote-off-line,
  quote-off-line(fabricated), quote-length, tabi-side-empty, inbound-unanswered,
  inbound-contested-unnamed, inbound-relation-none, outbound-relation-none,
  refuses-paragraph-missing`.
- Scored receipt internals are self-consistent with the frozen plan: 5 legs with `expectScrollY`
  0/600/300/900/900, observed 0/600/300/900/900; `driverSha256` in the receipt equals the pin;
  `nonce=tabi-r69-scored-81ac744e` matches `nonceOnPage`; 45 CDP sends, 171 events, teardown clean
  (`survivors=[]`, both port probes `closed`). The `touch` leg's expected scroll is deliberately
  `900` (no scroll) and the counter enforces exactly that at
  `scripts/check-synthscroll-r69.mjs:82` (`leg-touch-no-scroll`) together with touch event presence —
  so the receipt matches the frozen plan by design, not by omission.

**Disagreements: none.** Every comparable artifact reproduced byte-identically or differed only by a
path string I supplied.

## 3. Snapshot heads vs current sibling tips

Method: `git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin merge-base --is-ancestor <snapshot head> <branch tip>`
(siblings live at `<fleet>/<lane>-shokunin`, which is how the counter resolves `--fleet`).
Receipt: `ancestry-r69.tsv`.

- **20/20 snapshot heads are ancestors-or-equal of the current branch tip.** The snapshot is not stale
  in the sense of having been rewritten or rebased away.
- **7 lanes moved since capture `15:46:41 -03:00`** (tip ≠ snapshot head):

| lane | commits since snapshot | tip | tip committed | `PROVINCE.md` changed since snapshot |
|---|---|---|---|---|
| kagi | 1 | `44808ced5635` | 15:49:07 | same |
| kumitate | 3 | `4f3a8d633f2f` | 15:49:06 | same |
| kasegi | 1 | `9d0b1eb0709e` | 15:49:47 | same |
| chousa | 6 | `b1ed9b6ad61f` | 15:54:21 | same |
| souji | 4 | `0d8ce29a5e53` | 15:54:29 | same |
| tsukuroi | 3 | `69915b8603d9` | 15:54:02 | same |
| kama | 5 | `138a75437bcd` | 15:55:22 | **CHANGED** |

- The other 13 lanes are at exactly the snapshot head.
- **kama is the only movement that touches a C1-relevant surface.** The added `PROVINCE.md` block
  (round-88 llama.cpp router text) does not mention `tabi` at the snapshot head nor at the tip, so
  inbound reciprocity for kama is unchanged (`none`-grade) either way. Every other moved lane left
  `PROVINCE.md` byte-identical, so no cited line number or quote can shift under C1 as long as rows
  cite **at the snapshot head**, which the counter mandates (`head-not-snapshot` is a refusal).

Independent re-derivation of the two routing sets (useful for C1's inbound 3/3 and outbound 4/4):
- **Inbound** — siblings whose `PROVINCE.md` at the snapshot head names `tabi` (word match):
  `kake` (lines 40, 45, 67, 310, 329, 344, 368, 505), `kengaku` (line 103), `kotoba` (line 76) = **3**.
  `kake`'s line 45 says "contested scope (kagi/tabi/kake)", so the `kake` row must be `contested`.
  This matches the claim's inbound 3/3.
- **Outbound** — lanes named in tabi's base `**Refuses:**` paragraph: `kagi, kaidoku, kake, revenger` = **4**.
  This matches the counter's `outbound` array on the do-nothing run.

## 4. Findings

### F1 (instrument robustness, fail-closed) — real-mode C1 battery crashes instead of grading when the matrix is absent

`scripts/negatives-sibling-matrix-r69.mjs:65`

```js
const kakeRow = cellsOf(lines[rowIdx('kake')]);
```

`rowIdx` (`:62`) returns `-1` when no `| kake |` row exists, so `lines[-1]` is `undefined` and
`cellsOf` (`:63`) throws `TypeError: Cannot read properties of undefined (reading 'replace')`.
`noneLane` at `:66` has the same exposure. The throw happens at module scope, before any mutation
runs, so no `--out` file is written and node's own exit 1 is reported instead of a battery verdict.

Reproduction (from the lane root, scratch dir required to be absolute):

```
node scripts/negatives-sibling-matrix-r69.mjs \
  --province <scratch>/base-PROVINCE.md \
  --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv \
  --fleet /home/vgpnk/Projects/shokunin \
  --work <scratch>/realwork --out <scratch>/out.json
# => TypeError at negatives-sibling-matrix-r69.mjs:63 (via :65), exit 1, no out.json
```

Observed here writing `c1-real-baseline.err` / `.out` (out is empty).

Assessment: **not a predicate killer and not a false-green path.** The predicate's real-mode clause
runs against the implemented `PROVINCE.md`, which will carry 20 rows, so `rowIdx` resolves. If an
implementer omits a row, the battery still exits non-zero, so the predicate stays false — it fails
**closed**. The defect is diagnostic quality only: a candidate with a missing `kake`/`none`-lane row
is reported as a crash rather than as `lane-missing`, and the run leaves no `--out` receipt. Under the
freeze I did not amend it; flagging for the integration owner to decide (it is a pinned byte, so any
change is a new freeze, not an edit).
Fixture mode is unaffected: it synthesises a complete 20-lane matrix at `:52-58` before these lines
run, which is why the 19/19 battery is valid.

### Observations (no judgment, outside my predicate authority)

- O1 — the scored receipt's fixture origin is `http://127.0.0.1:40501`. This seat's bounds name
  `41000-48999` for loopback ports; the scored run predates the wave and I did not re-run the driver,
  so I record the port only as a fact. My own probes opened no ports.
- O2 — `kakeRow` (`:65`) appears to be unused later in the file; it exists only to feed the mutation
  table built at `:69-86`. This is part of the F1 surface, not a separate defect.

## 5. Limits of this verification

- This is a **calibration** seat: I re-ran committed instruments on committed inputs and compared
  bytes. I did not adjudicate any relation label, the meaning of any finding id, or whether the C1/C2
  predicates should be satisfied by this round's candidate — those are the reviewer's and the L1's calls.
- I did not re-run the C2 driver (no scored runs are mine to make; kill rule: "no further scored runs
  to fish for green"). The scored receipt and the three degenerate receipts were taken as committed.
- `git merge-base --is-ancestor` proves reachability only, not that a lane's work is reviewed; 7 lanes
  moving mid-wave is normal sibling activity and is not by itself a defect.
- No whole-repo build, lint, or test was run, per wave-in-flight rules.

## Files in this directory

`report.md` (this file) · `EXITS.json` · `ancestry-r69.tsv` · `base-PROVINCE.md` ·
`c1-donothing.out`/`.err` · `c1-fixture.out`/`.err`/`.json` · `c1-real-baseline.out`/`.err` ·
`c2-noreceipt.out` · `c2-degenerate-js-scroll.out` · `c2-degenerate-dispatch-wheel.out` ·
`c2-degenerate-skip-touch.out` · `c2-negatives.out`/`.err`/`.json` · `c2-scored-counter.out`
