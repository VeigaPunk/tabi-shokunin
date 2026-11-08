# R89Review1 — count reproduction and pin audit

## Verdict
**C1 count reproduces clean at 108 on the final scored bytes.** All 8 freeze pins verify against committed bytes (freeze commit `0791b191` = D `7bde5e6c2f2d`). The fixture pin is **counter-enforced, not declaration-level**, and was independently re-derived out-of-band to the exact scored value. Prior set is genuine r89 (41 legs, r89 schema, disjoint launch tokens/browser ids). The four `sp89-accept-domread-*` legs are present with non-null `domRead`. One caveat observed mid-review: the scored driver was still in-flight during the first count attempts — details below.

## 1. Counting-command reproduction (scored receipt)
Command run (read-only, `--lane` absolute, from scratch dir):
```
node scripts/check-showpicker-round89.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round89/chromium-showpicker/receipt.json \
  --expect-driver-sha256 76b69b4f691d24c8c94a92897e33635d2386b9191f5aaa66640515dc998bd2d0 \
  --expect-nonce tabi-r89-l1-7bde5e6c2f2d \
  --expect-fixture-sha256 69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed \
  --prior-set .ufo/waves/round-89/controls/c1/prior-set.txt --json
```
**Final result: exit 0, verdict `clean`, checkCount 108, zero failing checks.** Matches claims.json predicate `C1-SHOWPICKER-R89` leg-a exactly (108 checks, driver/fixture/nonce pins).

**In-flight caveat (transient, now resolved):** the scored run (PID 2039019, nonce `tabi-r89-l1-7bde5e6c2f2d`, ports 19960/19961/19962) was still executing during this review. Early re-runs on the partial file (2→8→14→22→34 legs, `finishedAt: null`) correctly returned exit 1 with `plan-frozen`/`leg-order`/`leg-records` + law failures and checkCount 77 — the counter refused the incomplete receipt rather than scoring it. Final file: 41 legs, `finishedAt: 2026-11-08T12:43:31.853Z`, `failures: []`, exit 0 / 108. The mid-flight reds were honest truncation, not defects. Reviewers must re-run on quiescent bytes; do not treat the partial-run findings as counter instability.

## 2. Freeze-pin audit (`.ufo/waves/round-89/freeze.txt`, D `7bde5e6c2f2d`)
All 8 sha256 sums verified against working-tree bytes, which equal the freeze commit `0791b191` bytes:
| path | sha256 | result |
|---|---|---|
| `scripts/chrome-cdp-showpicker-round89.mjs` | `76b69b4f…bd2d0` | OK (also the scored `driverSha256` and `driver-pin`) |
| `scripts/check-showpicker-round89.mjs` | `33d4b927…1f07` | OK |
| `scripts/negatives-showpicker-round89.mjs` | `7951d40e…2fe16` | OK |
| `scripts/kill-power-round89.mjs` | `319534b9…4faa` | OK |
| `scripts/selftest-r89-gates.mjs` | `35235eff…80a` | OK |
| `scripts/check-record-drift-r89.mjs` | `c54d5edf…37308c` | OK |
| `…/probes/prior1.json` | `528090e5…37f3d` | OK |
| `…/probes/prior2.json` | `22114833…54255` | OK |
Freeze commit `0791b191` ("freeze D 7bde5e6c2f2d instruments …") is the parent of all wave inputs; the scored receipt itself is untracked (produced post-freeze, as designed) and is not named in freeze.txt — correct, the nonce binds it instead.

## 3. Fixture sha256: counter-enforced and independently re-derived
- **Counter-enforced, not declaration-level.** `check-showpicker-round89.mjs:487` checks `r.fixture.sha256 === expectFixture` (plus viewport/child-shape), driven by `--expect-fixture-sha256`. A wrong fixture pin fails `fixture-hash`. The `run-window`/`ports-declared` checks further bind `fixture.origin` to the declared http port and `fixture.child.origin` to the child port. NOTHING about the fixture is taken on faith from the receipt's own word.
- **Out-of-band re-derivation (the r87 spot-check method):** re-implemented the driver's fixture construction in node from the frozen driver bytes: extract `FIXTURE_TEMPLATE` from `scripts/chrome-cdp-filechooser-round78.mjs` (the byte-identical r78 template), apply the four asserted patches (`PATCH_STYLE/BODY/FL/INPUTS/STATE/ACCEPT` from `chrome-cdp-showpicker-round89.mjs`), then `replaceAll('__CHILD_ORIGIN__', 'http://127.0.0.1:19962')` + `replaceAll('__NONCE__', 'tabi-r89-l1-7bde5e6c2f2d')`:
  - derived fixture = `69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed` — **exact match** to the scored receipt's `fixture.sha256` and to the counting command's `--expect-fixture-sha256`.
  - derived child = `7d15ea8281c583baa87604260d9b46d7b192f8ec04f762fb6cf36e98b29362df` — **exact match** to the scored `fixture.child.sha256`.
  - The derivation is deterministic given (driver bytes, nonce, child port) — all three are pinned/declared. The fixture pin is therefore both counter-enforced AND reproducible from first principles.

## 4. Prior-set audit (`controls/c1/prior-set.txt` → `probes/prior1.json`, `probes/prior2.json`)
- Both receipts carry the **r89 schema** `tabi-chrome-cdp-showpicker-r89` and **41 legs** including all four `sp89-accept-domread-*` legs (verified in their `legs[].name` arrays), each with `domRead` a non-null 21-descriptor list (full `__inputs()` snapshot; per-leg `domRead.find(id === target)` is the counter's binding).
- Nonces match the claim: prior1 `tabi-r89-probe1-probe0001`, prior2 `tabi-r89-probe2-probe0002`; driver pin `76b69b4f…bd2d0` on both; 0 failures.
- **Disjointness vs scored receipt: clean.** Scored launchTokens (41 unique, e.g. `9f7b0ce739ab…`), prior1 (41 unique, e.g. `6dc5e393c6ac…`), prior2 (41 unique, e.g. `b696f18ea0eb…`) — pairwise intersections empty. Same for `devtoolsListening.url` browser ids (ports 19921 / 19931 / 19961, 41 distinct ids each, zero overlap). These are three independent fresh-browser runs, not re-exports of one another.
- **Prior scoring:** both priors score 108 checks against self/cross prior sets; the frozen `probe-score-probe1.txt` / `probe-score-probe2.txt` ("exit 0 … clean 108 checks") reproduce modulo the `prior-set-complete` pairing semantics — with the full two-prior set the check passes on the scored receipt (exit 0 above); single-prior invocations fail only on `prior-set-complete` (which expects both priors present), i.e. the pairing is structural, not a correctness gap. `nowork-r88-under-r89.json` (r88 receipt under the r89 counter, exit 1 with `schema` + `plan-frozen`) and `noreceipt.txt` (exit 2 `receipt-unreadable`) are consistent with their claimed do-nothing behaviour; I did not re-run those controls (read-only bound, no need).

## 5. Scored receipt: leg count and `sp89-accept-domread-*` presence
- **41 legs** (full PLAN), `failures: []`, `finishedAt` set. The four legs are present, in PLAN order (`sp89-accept-domread-text`, `…-png`, `…-multimime`, `…-whitespace`), each with **`domRead` non-null** (21-element descriptor lists). Per-leg target descriptors match the claim:
  - `sp89-accept-domread-text` (aw): `accept: "image/*"`, `acceptTokens: ["image/*"]`
  - `sp89-accept-domread-png` (am): `accept: "image/png, .txt"`, tokens `["image/png", ".txt"]`
  - `sp89-accept-domread-multimime` (a2): `accept: "image/png,application/pdf"`, tokens `["image/png", "application/pdf"]`
  - `sp89-accept-domread-whitespace` (aws): raw `accept: "  image/png ,  .txt  "`, tokens `["image/png", ".txt"]` (comma-split + ASCII-trim + lowercased, per WHATWG §2.3.8 as claimed)
- `fixtureInputs` (top-level, 21 inputs) also carry the matching raw/token pairs, so attribution rides on both the top-level snapshot and each leg's `domRead` as claimed. (Known narrowing carried forward, not a finding: per-leg `fixtureInputs` mirrors are unenforced on grammar legs — the counter binds fixture descriptors at top level plus each domread leg's own `domRead`.)

## 6. Residual risk / gaps
- **None blocking for C1 count/pins.** The predicate leg-a is fully reproduced.
- Battery (0 failed, full coverage), kill power (0 survivors), selftest green, and C2 drift legs are outside this seat's scope (other seats own them); I make no claim on them.

## Tooling recorded
No tools installed or upgraded. Only `node` (v24, pre-existing) and `python3` (stdlib) used. No pacman/uv/npx calls. Scratch (`/fast/scratch/hyaku/tabi-r89/R89Review1/`, plus `/tmp/r89_*.json` temp files) removed after submission. Read-only seat: no commits, no edits to lane records, nothing written into `corpus/evidence/round89` or `.ufo/waves/round-89/scored/`.

Report: .ufo/waves/round-89/w1/R89Review1.md
