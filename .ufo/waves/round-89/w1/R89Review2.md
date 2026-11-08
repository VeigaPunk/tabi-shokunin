# R89Review2 — new-leg attribution attack (w1)

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`; base `5a901163`; D `7bde5e6c2f2d`
- Scored receipt: `corpus/evidence/round89/chromium-showpicker/receipt.json` (nonce `tabi-r89-l1-7bde5e6c2f2d`, 41 legs, driver `76b69b4f…`, fixture `69acad57…`, sha256 `78eb6ceac46ae68b3d49ac748e18746af05b94232d05f1521fb81ea00704b938`)
- Instruments used: recovered from commit `0791b191` and hash-verified against `freeze.txt` at that
  commit: counter `33d4b927…`, negatives `7951d40e…`, kill-power `319534b9…`. The scored receipt is
  scored with these bytes. The lane working tree has since re-pinned the counter to `53593b5c…` and
  the negatives to `bc7ed0e5…` (F8); the frozen counter's count is 108, the working tree's 107.
- Read-only seat. No lane/corpus/scored writes; scratch `/fast/scratch/hyaku/tabi-r89/R89Review2` removed at yield.
  No tools installed or upgraded (node v24.21.0, python3 already present).

## Method

The scored receipt itself is the vehicle. Under the **pinned** counter it scores `verdict clean`,
`checkCount 108`, `findings []`, exit 0:

```
node <pinned>/check-showpicker-round89.mjs --lane <ABS lane> \
  --receipt corpus/evidence/round89/chromium-showpicker/receipt.json \
  --expect-driver-sha256 76b69b4f… --expect-nonce tabi-r89-l1-7bde5e6c2f2d \
  --expect-fixture-sha256 69acad57… --prior-set .ufo/waves/round-89/controls/c1/prior-set.txt --json
```

Each mutation is applied to a JSON copy in scratch and scored with those same pins (baseline exit 0,
so an *uncaught* mutation shows exit 0 / 108 checks / no findings). Per-leg facts cross-checked in the
pinned driver: fixture HTML `chrome-cdp-showpicker-round89.mjs:108`, page parser `:142`,
settle-time read `:597`.

### Mutation table (pinned counter, scored receipt as base)

| # | mutation | exit | findings |
|---|---|---|---|
| m0 | none (baseline) | 0 | — clean, 108 |
| A1 | all four legs' `domRead` reduced to the single target entry | **0** | **none** |
| A2 | all four `domRead` replaced by a fabricated 1-entry array | **0** | **none** |
| A3 | settle `window.__inputs()` evaluate (send id 24) replaced by `window.__state()` on all four legs | **0** | **none** |
| A4 | png leg's `domRead` replaced by the text leg's | **0** | **none** |
| A5 | target `domRead` entry's `rect`/`tag`/`type` forged | **0** | **none** |
| A6 | non-target entry (`k`) accept+Tokens set to `totally/bogus`, all four legs | **0** | **none** |
| A7 | forged duplicate target entry (`video/*`) appended after the correct one | **0** | **none** |
| A8 | per-leg `fixtureInputs` truncated to the target entry | **0** | **none** |
| B1 | swap `stateAfter` text↔multimime | 1 | `leg-sp89-accept-domread-text`, `leg-…-multimime`, `accept-domread-law`, `no-selection-law` |
| B2 | swap `stateAfter` png↔whitespace | 1 | same four, png/whitespace |
| B3 | text `stateAfter.aw` size 22→23 | 1 | `leg-…-text`, `accept-domread-law`, `no-selection-law` |
| B4 | whitespace `stateAfter.aws` type `image/png`→`text/plain` | 1 | `leg-…-whitespace`, `accept-domread-law`, `no-selection-law` |
| B5 | text leg read `ret` → `hex:deadbeef` | 1 | `accept-domread-law` |
| C1 | `answer.setParams.backendNodeId` 19→999 | **0** | **none** |
| C2 | `uploadPng.sha256` → 64 zeros (also name/size forged: **0**) | **0** | **none** |
| C3 | `answer.setError` → `{code:1,message:"forged"}` | **0** | **none** |
| C4 | `answer.setResult` → `{forged:true}` | **0** | **none** |
| D1 | top-level `fixtureInputs.aw.acceptTokens` → `["image/png"]` | 1 | `fixture-descriptors` |
| D2 | leg `domRead.aw.acceptTokens` → `["image/png"]` | 1 | `accept-domread-law` |
| D3 | leg `domRead.aw.accept` → `"image/png"` | 1 | `accept-domread-law` |
| D4 | `aws` tokens untrimmed (`"  image/png "`, `"  .txt  "`) | 1 | `accept-domread-law` |
| D5 | `aws` raw+tokens uppercased | 1 | `accept-domread-law` |
| D6 | `aws` raw → `"image/png , .txt"` (same tokens after trim) | 1 | `accept-domread-law` |

Top-level normalisation is also bound independently of the domread legs: `ac` tokens `["IMAGE/PNG"]`
and `aws` tokens untrimmed both exit 1 on `fixture-descriptors`.

## Findings

### F1 — HIGH — the settle-time page read is not required by the receipt

`accept-domread-law` (`check-showpicker-round89.mjs:782-800`) reads `leg.domRead` as data; it never
requires a `Runtime.evaluate` with `window.__inputs()` to exist for `kind: 'showpicker-domread'`.
The send-log allowlist (`:526`) *permits* that expression, and `plan-calls` (`:563-602`) builds its
`want` sequence without it — so the settle read can be replaced by any other allowlisted evaluate and
the receipt still scores clean (A3: exit 0, 108 checks).

Consequence: "Four new legs re-read `window.__inputs()` on the page at settle" is true of the driver
(`chrome-cdp-showpicker-round89.mjs:597`) but is not a property the scored receipt can be refused for.
The claim's Type sentence presents the re-read and the raw/token binding in the same breath; only the
second is counter-bound.

### F2 — HIGH — two fields of one entry are bound; the snapshot itself is not

The law's only read of the snapshot is `arr(leg.domRead).find(x => x.id === target)` followed by
`desc.acceptTokens` and `desc.accept` equality (`:794-796`). Everything else about `domRead` is free:

- **All four legs' `domRead` are byte-identical to each other and to top-level `fixtureInputs`**
  (digest `852c5f1d4e0bff591e85e0226b46bfcebd22536eee085959b86b69153ec2f571` in the scored receipt
  and in both probes). Swapping one leg's array for another's is therefore a literal no-op (A4) —
  "not caught" is vacuous here, and nothing in the receipt ties a leg's snapshot to that leg's page.
- A fabricated single-entry array passes (A2); truncating to the target entry passes (A1); an entry
  can carry a forged `rect`/`tag`/`type` (A5); non-target entries are entirely unbound (A6).
- `.find` is first-wins: a conflicting forged entry appended *after* the correct one passes (A7).

Consequence: the Limit sentence "Attribution rides on the top-level fixtureInputs snapshot plus each
domread leg's own domRead" overstates the per-leg half. The top-level snapshot is genuinely bound
(`fixture-descriptors:870` requires exact equality with `FIXTURE_INPUTS`, which pins ids, rects, raw
strings and tokens — D1 plus the `ac`/`aws` top-level probes). The per-leg `domRead` contributes two
fields of one entry and attributes nothing to the producing page.

### F3 — MEDIUM — the answer's own record is not self-consistent-checked on the four legs

`accept-domread-law:797` checks only `answer.files` name, `stateAfter[target]`, one `read` event and
its hex. The sibling `accept-grammar-law:777` additionally checks `setParams` length, basename,
`setParams.backendNodeId === chooser-recorded node id`, `setResult === {}` and `setError === null`.
Those three are unbound for the new legs:

- `answer.setParams.backendNodeId` 19→999: exit 0. The send log still targets node 19, so the receipt
  holds two contradictory records of the delivered node and nothing notices (C1).
- forged `setError` (C3) and `setResult` (C4): exit 0.

The *landing* is still bound (`stateAfter` + `no-selection-law` + `plan-calls` basename), so this is a
provenance inconsistency, not a hole in "the file lands in the input".

### F4 — MEDIUM — "hashes" in the Limit sentence do not hold for these legs

`upload` / `uploadPng` are never read by `accept-domread-law`; changing `sha256` to 64 zeros or
`name`/`size` to `forged.png`/999 leaves the receipt clean (C2). The Limit says "the counter binds
names, sizes, types, hex and hashes". That is true for `sp84-accept-answer` /
`sp84-accept-mime-answer` (`:731`, `:749` compare the whole `upload`/`uploadPng` object) and false for
all four sp89 legs. Delivered-file name/size/type/hex *are* bound (B3, B4, B5), so the impact is
confined to the on-disk file record.

### F5 — LOW — the declared per-leg-mirror narrowing now covers the only per-leg page copy

A8 (per-leg `fixtureInputs` truncated to one entry) exits 0. The claim already declares "per-leg
fixtureInputs mirrors are unenforced on grammar legs"; the same mirror exists on the four domread legs
and is equally unenforced. For the domread legs this mirror is the only per-leg copy of the page
snapshot, so the declared narrowing is exactly the binding that would have supplied F2's attribution.

### F6 — MEDIUM — the failure message names the wrong conjunct

`accept-domread-law` is one composite boolean over {accept, tokens, answer name, state, read count,
read hex}; its detail string always prints `raw … toks … want …`. For a state or hex failure those
three values are identical, so the message asserts the accept fields are wrong when they are not:

```
accept-domread-law :: … sp89-accept-domread-text: raw "image/*" toks ["image/*"] want ["image/*"]   # B5 (hex forged)
accept-domread-law :: … sp89-accept-domread-text: raw "image/*" toks ["image/*"] want ["image/*"]   # B3 (size 22→23)
```

The failure is real and correctly identified by check id; only its detail is misleading. This is the
only per-leg diagnostic for the four new legs.

### F7 — INFO — mutant/negative coverage of the new legs is two fields deep

`negatives-showpicker-round89.mjs` (pinned `7951d40e…`) carries exactly one domRead negative
(line 359: target `acceptTokens` → `["image/png"]`). `kill-power-round89.mjs` (pinned `319534b9…`,
unmodified in the working tree) carries exactly two domread mutants
(`domread-tokens-dropped:172`, `domread-raw-dropped:173`), both weakening the two target-entry
comparisons. No mutant or negative exists for the settle read (F1), the entry shape or snapshot
identity (F2), the answer conjuncts (F3), or the upload block (F4). "Kill power 0 survivors" is
therefore not evidence about any of F1–F4.

### F8 — HIGH (witness, for the integrator) — the frozen bytes and the working tree disagree on the witness count

I reviewed the state named by the assignment: commit `0791b191` (D `7bde5e6c2f2d`), counter
`33d4b927…`. The lane working tree has since diverged. Semantic diff of `claims.json` HEAD↔working
tree (unicode escapes normalised) yields exactly five changes:

| field | HEAD (frozen) | working tree |
|---|---|---|
| `C1.legs.a` | checkCount **108** | checkCount **107** |
| `C1.pins[check-showpicker-round89.mjs]` | `33d4b927…` | `53593b5c…` |
| `C1.pins[negatives-showpicker-round89.mjs]` | `7951d40e…` | `bc7ed0e5…` |
| `C2.killRule` | before mismatches != **2** | before mismatches != **3** |
| `C2.legs.b` | mismatches 2 | mismatches 3 (+ gate-selftest) |

`freeze.txt` was re-pinned in the same movement (`33d4b927→53593b5c`, `7951d40e→bc7ed0e5`).
Measured on the same clean scored receipt: pinned counter `33d4b927…` = **108 checks, clean**;
working-tree counter `53593b5c…` = **107 checks, clean**. The working-tree diff removes the numbered
`replay-limit-consistency` check (moved into `out.limit.replayConsistency`).

Two consequences:

- `frozenAmendments` documents **only** the C2 pair. The C1 numeral and the two C1 instrument pins
  moved without an entry.
- `--expect-driver-sha256` pins the driver; nothing in `countingCommand` pins the counter, so an
  executor that picks up the working tree silently reports a different check count than the frozen
  witness. All mutation results above are on the frozen bytes and reproduce at 108.

The selftest's `pins-match-freeze` gate (`selftest-r89-gates.mjs`, `gate('pins-match-freeze')`) reads
`freeze.txt` from the same working tree it is checking, so a coordinated re-pin of file + freeze.txt
is green by construction; it cannot witness the move described here.

### F9 — HIGH (calibration) — at the frozen pins, C1 leg (c) "selftest green" is red

The frozen selftest (`35235eff…`, `freeze.txt` line 5) asserts in `gate('counter-clean')`:

```js
r.json.checkCount === 102
```

The frozen counter (`33d4b927…`) reports **108** on the same clean scored receipt, with the same pins
and the same `--prior-set`. `pins-match-freeze` passes (file == freeze.txt at HEAD), so the failure
lands on `counter-clean`: `ok` is false at `102 !== 108`.

So C1 leg (c) cannot be green at the frozen instrument set; the working tree repairs it by changing
the literal to `107`, which agrees only with the re-pinned counter. Both numbers cannot be the
witness for the same receipt, and the frozen pair (counter 108 / selftest 102) is self-contradictory.

## The four assigned questions

1. **Own element, exact raw accept string?** Yes. Pinned driver `:108` emits four distinct
   `<input type="file">` elements `aw`(`image/*`), `am`(`image/png, .txt`),
   `a2`(`image/png,application/pdf`), `aws`(`"  image/png ,  .txt  "`); `FIXTURE_INPUTS:457-464`
   pins id/tag/type/rect/raw/tokens for each and `fixture-descriptors:870` requires exact equality.
   The scored receipt matches all four (raw + tokens + target + delivered file).
2. **Is `domRead` from that leg's own page — can one leg's be swapped for another's without a
   finding?** It cannot be established, and yes: all four arrays are byte-identical (digest
   `852c5f1d…`), a swap is a no-op (A4), a fabricated array passes (A2), and the settle evaluate need
   not exist (A3). No check ties `domRead` to a send, to `fixtureInputs`, or to the leg.
3. **Is the delivered file's name/size/type/hex bound?** Yes: `answer.files` name (law), state
   `[[name,size,type,'']]` (B3, B4), single `read` event with `hex:` (B5). The `upload`/`uploadPng`
   record — including its `sha256` — is **not** bound (C2), contrary to the Limit sentence.
4. **Can one leg's `stateAfter` be swapped for another's without a finding?** No. B1 and B2 (and the
   single-key edits B3/B4) all exit 1 through `leg-<name>`, `accept-domread-law` and
   `no-selection-law`. Per-leg `state` is inside the frozen `LEG_SHAPE` (`acceptShape:218-225`).

## Wording verdict

- **Falsified for the new legs:** "the counter binds … hex and hashes" (F4/C2).
- **Overstated:** "Attribution rides on … each domread leg's own `domRead`" (F2), and the Type
  sentence's implication that the settle re-read is counter-verified (F1/A3).
- **Holds:** raw accept string bound exactly, including a variant that normalises identically
  (D3, D6); the DOM-parsed token list bound per target entry (D2, D4, D5); delivered
  name/size/type/hex bound (B3–B5); per-leg `stateAfter` attribution (B1, B2); top-level snapshot and
  normalisation (D1 + `ac`/`aws` top-level probes); "accept is not a validator" on a programmatic
  answer.
- No predicate, counter, pin, prior, threshold or kill rule is proposed for amendment here; the
  observations above are the attack surface for the integrator to weigh.

## Residual risk and verification gaps

- **Receipt-level only.** The driver was not executed (no browser): every driver fact cited is read
  from the pinned source, not observed. A live re-run could differ.
- **Concurrent rewriting.** During the review the scored receipt changed twice
  (`80e7b8cc…` → `13f30a60…` → `78eb6ce…`, at one point 4 legs with no sp89 legs). All tables are
  against `78eb6ce…` (41 legs). The instrument set, `freeze.txt` and `claims.json` were also edited
  mid-review: the frozen counter reports 108, the working-tree counter 107 (F8), and the frozen
  selftest expects 102 (F9). A later reader must re-establish which byte set is being scored before
  comparing check counts with this report.
- **The scored receipt is not immutable evidence.** It sits inside the tree the counter walks
  (`prior-set-complete`) and is exempted by content hash, so each rewrite shifts the exempt value;
  runs taken during a rewrite carry `prior-set-unmatched-exempt` noise that is bookkeeping, not a
  leg finding.
- **Negatives/kill-power not executed** (they spawn the driver and dozens of counter runs);
  F7 is a source-level census, not a run.
- **`toLowerCase()` vs ASCII-lowercase.** The page parser (`:142`) uses JS `toLowerCase()`
  (Unicode-aware) where spec §2.3.8 says ASCII-lowercase. No fixture token exercises the difference
  (all non-ASCII-free), so the claim's "ASCII lowercasing" is unmeasured, not wrong.
- **`git` boundary.** Only read-only git (`status`, `diff`, `show`, `log`) was used; nothing was
  added, committed, checked out or stashed.
