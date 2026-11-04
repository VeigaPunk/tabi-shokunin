# R63Reviewer — adversarial review of C1 (round 63, wave w1)

Seat: R63Reviewer (leaf). Scope: C1's frozen predicate and counter at freeze
`816592612dd2a8073437c595d3fe3c477125cf3c`, baseline `f098bcf8`, lane HEAD at review
`e5325ad8805df86cb0109373d2ac695f558c2a1f`. No frozen instrument, control, claim or
sibling file was edited. cwd for every counter run:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`.

## 1. Frozen bytes reviewed (all hashes re-derived, not copied)

| byte | sha256 | provenance |
|---|---|---|
| `scripts/chrome-cdp-loopback-round63.mjs` | `b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040` | claims.json:18 pin; SAME at freeze and worktree |
| `.ufo/waves/round-63/counters/chromium-wheel-r63.mjs` | `084705695a394256198b45c15fb7568b629e3bc750bbd46cfcb81cdb312d7178` | claims.json:19 pin; SAME at freeze and worktree |
| `.ufo/waves/round-63/claims.json` | `e996d4335515379ee42c5117f000ee70a88f90ad659c3f370580aeaf4f8b80ef` | unchanged since freeze (`git diff --name-only 8165926..HEAD` empty for it) |
| `.ufo/waves/round-63/controls/smoke/receipt-run1.json` | `844f9facd15de4bd6ceb83ef5ae22765486062e66f1ffa241197ab8d2defd48f` | committed at freeze |
| `.ufo/waves/round-63/controls/smoke/receipt-run2.json` | `954cee8a2acaf191c328058ccc60674d300b10e217b1e9c149bf8bd7711b6250` | committed at freeze |
| `.ufo/waves/round-63/controls/smoke/{a,b,c}-*.png` | `c8de49678abad8433a822370a92ab3b2b35ac53603d5122193f21d66fdd95b9a` (each) | committed at freeze |
| `.ufo/waves/round-63/controls/smoke/d-release.png` | `1bc648c80b682620cf2eef31942be3e90ad1b928a2d09580bcf48ea7b7605ce0` | committed at freeze |
| `.ufo/waves/round-63/controls/mutation/matrix.json` | `7e5b4691a9c3188614ed49e320c1291af8ac103ce6ced465fd6f1e88ccd432d0` | committed at freeze |
| `.ufo/waves/round-63/counters/compare-stability-r63.mjs` | `39e76c98876824ab95035b8bed921a44ff23889dc9c24758f90068d61a77e3c0` | **untracked at HEAD; absent from the freeze tree; not in claims.json pins** |

The remaining six pins (`mutate-r63.mjs 4bf6e614…`, `make-negatives-r63.mjs 598a19da…`,
`old-generation-r63.mjs 1ee9cda2…`, `mutants-r63.json 5f0efd8f…`, `s166b…html 78bd40dc…`,
`s167…html 51a7efdb…`) were each hashed from `git cat-file -p 8165926:<path>` and from the
worktree; all 8/8 claims.json pins are SAME on both sides. `git cat-file -t 8165926…` = `commit`.

## 2. What I ran (exact argv, cwd, exit)

All commands are read-only executions of frozen bytes; receipts and outputs are in
`receipts/` beside this file. Full argv for every run is recorded inside the JSON receipts.

| # | argv | exit | result |
|---|---|---|---|
| 1 | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs .ufo/waves/round-63/controls/smoke/receipt-run1.json --driver scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59…d6c040 --shot .ufo/waves/round-63/controls/smoke --json` | **0** | predicate true, findingCount 0, findings `[]` |
| 2 | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs --selftest` | **0** | `verdict=clean cases=22 passed=22` |
| 3 | baseline replay: all 10 negatives from `controls/negatives/index.json` through the same counter argv + live receipt | **1 ×10, 0 ×1** | findings match matrix.json exactly (11/11, `receipts/matrix-baseline-rerun.json`) |
| 4 | exact argv from 6 `controls/no-work/*.command.json` | declared 2,2,1,2,0,0 — **all six match** | `receipts/no-work-rerun.json` |
| 5 | 31 variant runs `node …/chromium-wheel-r63.mjs receipts/attacks/<v>.json --driver scripts/… --expect-driver-sha256 b00efd59… --shot <dir> --json` | see §4 | `receipts/attack-results.json` (13 entries incl. replay), `receipts/falsifier-results.json` (12), `receipts/falsifier2-results.json` (6) |
| 6 | `node .ufo/waves/round-63/counters/compare-stability-r63.mjs --a smoke/receipt-run1.json --b smoke/receipt-run2.json --a-shots smoke --b-shots <copy> --out …` | **0** | `STABLE`, shapeEqual true, pngsIdentical true, sameDriver true, sameFixture false (different nonces) |
| 7 | same comparator, b receipt mutated (b-side recorded hash lie; b-side step rename) | **0, 0** | both wrongly `STABLE` (§5 M6) |
| 8 | byte check of the 8 mutant files vs matrix: sha256 and line-diff count | **0** | 8/8 sha match `matrix.mutants[].counterSha256`; each differs from the frozen counter on exactly 1 line |

Cold-run claim on committed bytes (no instrument involved): run1 vs run2 `legs` equal,
`wheellog`-minus-`ts` equal, `pageState` equal, 4/4 step PNG sha256 equal. So the
`coldRunStableFields`/`coldRunIdenticalPngs: 4` target is true of the committed smoke bytes —
but it is not enforced by any frozen instrument (§5 H2).

**Skipped:** mutant execution (8 mutants × 10 negatives) — assigned to the mutation-tester
seat; I verified mutant bytes and one-line deltas instead. No live browser run (leaf seat;
the scored after-run belongs to the L1). No tool installs; pacman untouched.

Read-only state observation, not cited as evidence: at review time
`git status --porcelain -- corpus/evidence/round63` prints `?? corpus/evidence/round63/`,
i.e. the C1 afterCommand target has no committed data revision yet; the counter does exit 0
on that working-tree file. That is mid-wave state, not a defect.

## 3. Answers to the five assigned questions

**(1)** The frozen counter accepts the committed smoke receipt at the pinned driver sha with
exit 0 and zero findings (§2 #1). Selftest is clean at the declared 22 cases.

**(2)** All 25 check ids are falsifiable by a single receipt field; see the table. Two
*clauses* are dead (cannot be the sole failing condition): the Set-uniqueness clause in
`wheellog-sequence` (counter:40) and the 64-hex regex in `driver-binding` (counter:30). No
check passes on an empty array: every array check is length-guarded (`legs.length===6`
:36, `wl.length===5` :40-45, `steps.length===4` :47) or paired with `.some` (`serverLog`
:49). The only empty arrays that pass are `survivors` (:50) and `failures` (:53), which are
negative claims where empty is the intended state; a hand-written receipt satisfies both.

**(3)** Yes, a contradiction passes — through `pageState.scrollEvents`, not through the
pinned numeric pairs. `scroll-arithmetic` (:37) reads only `legs`, and `target-binding` (:45)
pins `wheellog[i].scrollYAtDispatch` to the same constant vector, so the two logs cannot
disagree on scroll positions while both pass. But `scroll-event-witness` (:46) accepts any
integer 1..5, while both committed runs measure 4. A receipt with `scrollEvents: 5` claims the
page scrolled on the leg the event log says was `defaultPrevented` (:44) and the legs say did
not move (:37); a receipt with `scrollEvents: 1` claims one scroll for four non-prevented
wheel events. Both exit 0 (`v2`, `v3`). **Missing cross-check:**
`pageState.scrollEvents === wheellog.filter(e => e.defaultPrevented === false).length` (i.e.
pinned to 4, the count of leg transitions), and the same count derived from the legs.

**(4)** Yes. A do-nothing run can produce an accepted receipt with no browser work:
`receipts/attacks/v12-fully-forged.json` + `receipts/shots-forged/*.png` (four 1×1 PNGs
generated with zlib, never a screenshot) exits **0**, zero findings. Every field is
hand-written: fake `host.chromium`, five-token `host.argv`, `ts: 0` on every event,
`scrollEvents: 1`, `origin: http://127.0.0.1:1`, one `serverLog` entry, `midRun: 1`,
recomputed `fixture.sha256` from the public driver template and chosen nonce. The reason is
structural: every check is a predicate over receipt-owned fields plus three anchors that a
caller can satisfy without a browser — the driver bytes at the invoked path (:115), the
fixture hash derived from those bytes plus the receipt's own nonce (:119-121, :130), and
arbitrary PNG bytes (:122-129). The counter's own `synthetic()` (:58-70) is such a receipt,
and its selftest asserts that it passes (`:86`).

**(5)** All 8 pins verified at the freeze commit and in the worktree (SAME); claims.json is
unchanged since freeze; matrix baseline is 11/11 (10 negatives + live) with the declared
findings (`receipts/matrix-baseline-rerun.json`). One instrument is **not** pinned: the
stability comparator (§5 H2).

## 4. Findings by severity

### HIGH

**H1 — The counter has no no-work boundary; a hand-written receipt is green.**
`chromium-wheel-r63.mjs:25-55` is a pure predicate over receipt fields; the only external
inputs are the invocation driver's hash (`:115`), the fixture template hash (`:119-121`,
`:130`) and PNG bytes (`:122-129`). Demonstrated: `v12-fully-forged` exit 0 with four 1×1
PNGs, timestamps all 0, `scrollEvents: 1`, origin port 1, browser string
`ForgedBrowser 0.0`, one server-log entry. The counter's `synthetic()` (`:58-70`) plus
selftest case `valid` (`:86`) is the same fact asserted by the frozen artifact itself.
`claims.json:63` narrows the out-of-boundary case to "a caller that changes the driver and
passes the new pin"; the actual hole is wider — with the unchanged pinned driver a caller can
hand-write the receipt. Consequence: `target.livePredicate` (`claims.json:43`) is not
evidence that a browser ran; it is evidence that 25 predicates over a JSON object hold.

**H2 — The stability clause's instrument was never frozen.**
`claims.json:16` says scored evidence including "the stability comparison" is produced after
freeze "by these instruments", and `claims.json:17-26` is the instrument set; it contains no
stability comparator. The only comparator on disk,
`.ufo/waves/round-63/counters/compare-stability-r63.mjs` (`39e76c98…`, 2931 bytes), is
untracked (`??`), absent from `git ls-tree -r 8165926 -- .ufo/waves/round-63/counters`
(that tree has five files, not this one), and its mtime 16:03 is after the freeze commit
(`2026-11-04 15:59:56 -0300`). So
`coldRunStableFields`/`coldRunIdenticalPngs` (`claims.json:51-52`) and kill rule 5 have no
frozen instrument: the file can change after freeze without violating "a changed byte
invalidates its claim" (claims.json:16), because it is not a pinned byte. If it is committed
later with the data revision it is still outside the pin set.

### MEDIUM

**M1 — `scroll-event-witness` admits the page-side contradiction** (`chromium-wheel-r63.mjs:46`).
Range 1..5 admits 5 (scroll on the prevented leg) and 1 (one scroll for four wheel events);
both measured cold runs give 4. `v2`/`v3` exit 0. Missing cross-check named in §3(3).

**M2 — No timestamp ordering** (`chromium-wheel-r63.mjs:43`). `ts` is only checked finite
and ≥0; `v1` (all zero) and `v1b` (descending `100..96`) exit 0. Missing
`wheellog[i].ts <= wheellog[i+1].ts`. The claim's "strictly increasing unique sequence"
(`claims.json:39`) is seq-only; the event log can be temporally impossible while green.

**M3 — The Chromium/Linux identity is never checked.** No check reads `r.host.chromium`;
`v5` (`Definitely Not Chromium 0.0.0 Arch Linux`) exits 0. `launch-guards` (`:33`) only
tests four substring tokens: `v5`'s five-token argv has no `--remote-debugging-port`, no
`--user-data-dir` and no `about:blank`, yet passes. The capability string
(`claims.json:38`) is Chromium/Linux-specific; the predicate is not.

**M4 — Origin and server evidence are unbound.** `loopback-origin` (`:32`) accepts any
`http://127.0.0.1:<digits>`, including `:1` (`v6`, exit 0) and `:0`; nothing ties it to a
listening server. `server-witness` (`:49`) accepts a single `{path:'/'}` (`v4`, exit 0):
no request count, query or status, and `/favicon.ico` is optional.

**M5 — Shot bytes are arbitrary and not bound to the step semantics.**
`shot-records` (`:47`) + `shot-bytes` (`:48`, loop `:122-129`) require only a valid PNG
header with non-zero IHDR dimensions. `v12` passes with 1×1 PNGs; `v8` passes with
`d-release.png` bytes under all four step names. A real run has `d-release` at scrollY 240
and the other three at 120, so `steps[3].sha256 !== steps[0].sha256` (or a nonce-bearing
pixel) is a cheap missing invariant. (The a/b/c identity in the committed smoke is
semantically correct — all three are captured at scrollY 120 — the defect is that the
counter would accept identical bytes even if the page never moved.)

**M6 — The stability comparator ignores the b-side receipt's own bookkeeping**
(`compare-stability-r63.mjs:31`). `recordedMatches: x.sha === x.recorded` is computed only
over `pa` (the a receipt); b's `steps[*].sha256` is never compared to b's files. Demonstrated:
b with `steps[0].sha256 = 'f'*64` → exit 0 `STABLE`; b with `steps[1].name = 'zzz'` → exit 0
`STABLE` (no step-name equality between runs). b with zero steps → exit 1 `DIVERGENT`, so the
count guard works. This is a defect in an unpinned instrument (H2), not in the counter.

### LOW

**L1 — Two dead clauses.** `wheellog-sequence`'s `new Set(...).size === 5` (`:40`) can never
be the sole failing condition because `seq === i+1` already implies uniqueness.
`driver-binding`'s `/^[a-f0-9]{64}$/` (`:30`) can never be the sole failing condition under
the CLI because `external.driverSha256` is always a sha256 hex (`:115`). Both ids still fail
through their other clauses; the declared check surface is slightly larger than the
independent one.

**L2 — Unbounded/self-declared closure fields.** `launch-witness` (`:52`) accepts any
`midRun > 0` (`v7` `midRun: 1` vs observed 13); `survivors` (`:50`) and `closed-ports`
(`:51`) pass on hand-written values. Inherent to a receipt scanner, but they add no
witness beyond honesty.

**L3 — The negative controls are not hashed by any pinned file.** `matrix.json` records their
names and expected findings, not their bytes; `controls/negatives/*.json` are committed at
freeze but outside the pin set, so a post-freeze edit to a negative would not violate kill
rule 1 as written. Observed at review: `controls/negatives/index.json` is
`772827c269f081899e0b5899756cb6a94056cdfe19cce7831f27ec590b121fc8` both at freeze and in
the worktree — no edit seen, coverage gap only.

**L4 — Cosmetic.** The afterCommand's `--json` flag is accepted but unused; `fixture.viewport`
is never validated; the origin regex admits port 0 and ports above 65535.

## 5. Per-check table (all 25 ids; line numbers in the frozen counter)

`v12` = the fully forged receipt (exit 0). "Falsifier" is a single-field change run through
the CLI and observed to fire that id (`receipts/falsifier-results.json`,
`receipts/falsifier2-results.json`, and the declared negatives in
`receipts/matrix-baseline-rerun.json`).

| # | check (line) | vacuously satisfied by | one-field falsifier (exit) |
|---|---|---|---|
| 1 | `schema` (28) | `v12` literal | `v25` (1) |
| 2 | `nonce-binding` (29) | `v12` sets `nonce` = `nonceOnPage` (field compared to itself) | `n9` (1) |
| 3 | `driver-binding` (30) | `v12` copies the public pin | `v22` (1) |
| 4 | `fixture-binding` (31) | `v12` recomputes sha(template+nonce) from the public driver | `v21` (1) |
| 5 | `loopback-origin` (32) | `v12` origin port 1 | `v26` (1) |
| 6 | `launch-guards` (33) | `v5` five-token argv, fake browser | `n10` (1) |
| 7 | `legs-shape` (36) | `v12` | `v28` (1) |
| 8 | `scroll-arithmetic` (37) | `v12` | `n3` (1) |
| 9 | `wheellog-count` (38) | `v12` | `v29` (1) |
| 10 | `wheellog-sequence` (40) | `v12` | `n4` (1); Set clause dead |
| 11 | `delta-y-passthrough` (41) | `v12` | `n5` (1) |
| 12 | `delta-mode-pixels` (42) | `v12` all zeros | `v30` `deltaMode: 1` (1) |
| 13 | `trusted-fields` (43) | `v1` `ts: 0`; `v1b` descending ts | `v18` (1) |
| 14 | `cancelation` (44) | `v12` | `n6` (1) |
| 15 | `target-binding` (45) | `v12` | `v10`, `v11` (1) |
| 16 | `scroll-event-witness` (46) | `v2` = 5, `v3` = 1 | `v16` `scrollEvents: 0` (1), `v17` `6` (1) |
| 17 | `shot-records` (47) | `v12` 1×1 PNG hashes | `v14` (1) |
| 18 | `shot-bytes` (48,122-129) | `v12` 1×1 PNGs; `v8` same bytes ×4 | `v13` (1) |
| 19 | `server-witness` (49) | `v4` single `/` entry | `v15` empty (1) |
| 20 | `survivors` (50) | `v12` empty array (negative claim) | `n8` (1) |
| 21 | `closed-ports` (51) | `v12` hand-written probes/curl 7 | `v19` curl 0 (1) |
| 22 | `launch-witness` (52) | `v7` `midRun: 1` | `v23` pre 1, `v24` mid 0 (1) |
| 23 | `failures` (53) | `v12` empty array (negative claim) | `v27` (1) |
| 24 | `producer-verdict` (54) | `v12` `true` + `CONFIRMED` (self-declared) | `n1`, `n2` (1) |
| 25 | `page-final-state` (55) | `v12` | `v9` (1) |

No check id is unfalsifiable; no check passes on an empty array except the two negative
claims. The vacuity is uniform: each id's passing field is receipt-owned and writable.

## 6. Advisory (no repairs performed)

To make C1's green mean browser work: have the counter issue an invocation challenge nonce
that the driver must echo into the page (`nonceOnPage`) and into a pixel of each shot; require
`pageState.scrollEvents` to equal the non-prevented event count; require non-decreasing `ts`;
require `host.chromium` to start with `Chromium ` and `--remote-debugging-port=` in argv;
require `steps[3].sha256 !== steps[0].sha256`; pin the stability comparator and check both
receipts' recorded hashes and step names; hash the ten negatives into a pinned manifest.

## 7. VERDICT

**VERDICT:** C1's frozen counter reproduces green on the committed smoke bytes and its
declared controls (11/11 baseline, 22/22 selftest, 8/8 mutant bytes verified), but it has no
no-work boundary — a fully hand-written receipt with 1×1 PNGs exits 0 — and its cold-run
stability clause depends on a post-freeze, unpinned comparator, so the capability is
described, not evidenced.

## 8. Receipts

All paths under `.ufo/waves/round-63/w1/R63Reviewer/receipts/`; `HASHES.txt` lists the
sha256 of every artifact. `attack-results.json` (13 entries: the replay plus 12 attack
variants), `falsifier-results.json` (12) and `falsifier2-results.json` (6) carry full argv,
cwd, exit and findings; `matrix-baseline-rerun.json` and `no-work-rerun.json`
carry the control re-runs; `cmp-*.json` carry the comparator tests; `attacks/` holds every
mutated receipt; `shots-forged/` holds the four 1×1 PNGs accepted by `v12`.
