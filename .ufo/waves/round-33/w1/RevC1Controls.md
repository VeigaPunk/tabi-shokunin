# RevC1Controls — C1 controls review, round 33 w1 (attempt 1)

## Verdict

**HOLDS — no defect found in the frozen C1 control set or its receipts.** I re-ran the frozen controls harness (controls.mjs, sha256 `2d0cf841…` = frozenDigests) at the freeze commit `e6b0a9074d434ccc307badd312ae7379d1193fea` in a scratch fleet mirror of real shared clones, and **all seven receipts reproduced exactly**: `controls-summary.json` is field-for-field identical (`identical: true`), every counted field of every receipt matches the committed bytes, all exit codes match (1 = evaluated, predicate false, expected pre-data), all stderr empty, and the regenerated `c1-candidates.tsv` is byte-identical (52 candidates, frozen pins). The claims.json C1 predicate text matches the frozen counter code condition-for-condition (`c1-adjacency-sweep.mjs:239`: `gate.verdict === 'clean' && unaccounted === 0 && newMapped >= 4`), the before value (52/5/0/47/0, clean, rows 10 verified 10) matches `c1-J1-do-nothing.json`, the target and kill rule match the code, and both questioned controls genuinely skip the claimed work: do-nothing scores the untouched lane tree (no screen ledger exists at baseline; `--repo` scored before any mutation), and screen-all writes only `corpus/adjacency-screen.tsv` (47 rows, map untouched, `adjacency rows 10 verified 10` unchanged) and still fails on `newMapped 0 < 4`. One operational trap cost a first failed attempt and is recorded below (the gate refuses a symlinked fleet **by design**); it is an environment requirement, not a harness defect. Residual notes: the junk-rows control pins live `refs/heads/master` of four siblings (non-hermetic bytes, stable outcome), and the provenance label `repo=lane` is positional. No lane file was edited; scratch deleted; no chromium/chromedriver processes left.

## Evidence

### 1. Frozen-byte verification (preconditions)

```
sha256sum (lane @ e6b0a90, HEAD == e6b0a90, tracked files clean):
  counters/c1-adjacency-sweep.mjs     da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380  == frozenDigests
  counters/c2-bidi-forgery-battery.mjs 51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b == frozenDigests
  baseline/controls.mjs                2d0cf8416a35c2440cc1b6478f90b0f7a6d8a3436d617ea3527b0b8f3f5a451e == frozenDigests
  scripts/check-adjacency.mjs          4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac == ADJ_GATE_SHA256 pin
  .ufo/waves/round-33/measure.sh       ca6b830e1c9b685664da7db0ebb30674175c4c95f9fb11f8b2ce75a033784c7e == frozenDigests
git diff --stat b7d16fb8 e6b0a90 -- corpus/adjacency.tsv scripts/check-bidi-runtime.mjs \
  corpus/knowledge/webdriver-bidi-runtime-round-32.md corpus/SOURCES.md   -> empty (worktree inputs controls.mjs
  reads are byte-identical at baseline and freeze), exit 0
```

All exit 0. `git log -1 -- .ufo/waves/round-33/baseline/controls-summary.json` → `e6b0a90 round-33: freeze claims C1 adjacency + C2 operability, counters, controls before data`; the receipts are the frozen-before-data artifacts.

### 2. Re-run environment (faithful reproduction)

The C1 gate refuses a non-real fleet: `scripts/check-adjacency.mjs:37-38` — "both must be non-symlink directories that are exactly a git toplevel whose absolute git dir is `<dir>/.git`". My first attempt pointed `--fleet` at a directory of **symlinks** to the sibling repos: gate verdict `failed`, `verified 0, findings 15` (`sibling_unresolved`/`ruling_unresolved`, "absent or not a git toplevel"). This is the gate's documented anti-impersonation rule working as intended, so I rebuilt a faithful mirror:

```
F=/fast/scratch/hyaku/tabi-r33/RevC1Controls/fleetmirror
git clone -q --shared --no-checkout /home/vgpnk/Projects/shokunin "$F"          # fleet repo (fleet@ rulings)
git clone -q --shared --no-checkout …/$l-shokunin "$F/$l-shokunin"              # all 20 PINS siblings
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$F/tabi-shokunin"
git -C "$F/tabi-shokunin" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea
TMPDIR=/fast/scratch/hyaku/tabi-r33/RevC1Controls/tmp \
  node "$F/tabi-shokunin/.ufo/waves/round-33/baseline/controls.mjs"             # exit 0, 10.4 s
```

Strong determinism anchors beyond counted fields: rerun `c1-J1-do-nothing.provenance` `rev=b7d16fb8… tree=c7999ee70b633f0f54a639069816bce53326e4b7` — **tree identical** to the committed provenance's tree, i.e. the exact same lane tree was scored; every `counter_sha256=` line equals the frozen digest; rerun `c2-J2`/`c2-J3` `gateSha256` equal the committed ones (`d327300f…`, `7cc8f233…`) → the constructed control gates are byte-identical to the baseline run's.

### 3. Receipt-by-receipt counted-field comparison (rerun vs committed)

| receipt | counted fields (both sides) | match |
|---|---|---|
| c1-J1-do-nothing | predicate false; candidates 52; mapped 5; screened 0; unaccounted 47; newMapped 0; adjacency clean rows 10 verified 10 findings 0; screenFindings 0; unaccountedKeys sha12 `d98f1b3a2d95` both | **exact** |
| c1-J2-screen-all | predicate false; 52/5/**47**/**0**/0; clean 10/10/0; unaccountedKeys `4f53cda18c2b` (empty) both | **exact** (rev differs: fresh control commit `5722dd63…` vs `a6b709d1…` — internal scratch clone, expected) |
| c1-J3-junk-rows | predicate false; 52/5/0/47/0; clean rows **14** verified **14** findings 0; unaccountedKeys `d98f1b3a2d95` both | **exact** (see residual R2 on tree bytes) |
| c1-J4-mislabel-unnamed | predicate false; 52/**9**/0/**43**/0; clean 14/14/0; unaccountedKeys `e406a1dd66bc` both | **exact** |
| c2-J1-do-nothing | predicate false; honest H0/H1/H2 true; forgeriesAccepted **8**/8 F1–F8; digestLiterals []; selftest exit 0 | **exact** |
| c2-J2-reject-all | predicate false; honest all false; forgeriesAccepted 0; digestLiterals []; selftest 0 | **exact** |
| c2-J3-whitelist | predicate false; honest true; forgeriesAccepted 0; digestLiterals [5×12-hex]; selftest exit 3 | **exact** |

`controls-summary.json`: `identical: true` (whole file, including all seven `exit: 1`). `c1-candidates.tsv`: `diff` → identical. stderr: 0 B on both sides for all seven.

### 4. Claims C1 text vs counter code (file:line)

- **Predicate** (claims.json:26 "verdict clean at REV AND unaccounted == 0 AND newMapped >= 4") = `c1-adjacency-sweep.mjs:239` `out.predicate = gate.verdict === 'clean' && out.unaccounted === 0 && out.newMapped >= NEW_TARGET;` (`NEW_TARGET = 4`, line 66). Same condition.
- **newMapped definition**: claims "verified map rows absent at the baseline that map a sweep candidate and name the other side: ruled / contested-open, or split-declared / refused-route whose sibling_quote names tabi or whose tabi_quote names the sibling" = `:217-224` — `verifiedRows.filter` (verified = not flagged by the gate), `baseKeys.has(fold(surface)+' '+sibling)` absence (:218), row covers ≥1 candidate via `mappedRowNos` (:219), `ruled|contested-open` (:220), else `split-declared|refused-route` with `/\btabi\b/i.test(siblingQuote) || \b<sibling>\b/i.test(tabiQuote)` (:222). Same condition.
- **mapped/screened/unaccounted**: code matches the frozen definitions (sibling column == lane token of ref, cited line at its own pin equals candidate text after trim — `:154,177,184-189`; screen row needs exact `sibling_ref` key, reason in `SCREEN_REASONS` (:62, the same four), quote verbatim 4–25 words ≥20 non-space (:111, :202), same-surface needs a verified surface of the same sibling, other reasons require surface `-`, duplicates flagged (:207)).
- **before** (claims.json:28) = c1-J1 receipt exactly: 52/5/0/47/0, clean (rows 10, verified 10). ✔
- **target** (claims.json:29) = the code predicate. ✔
- **killRule** (claims.json:31): counter emits exit 2 on any `Refusal` (unresolvable rev, git failure, gate digest mismatch at `:141`), exit 1 predicate false, exit 0 met — matches "Counter exit 2 … not verified"; byte-freeze and check-adjacency-digest checks are enforced here by `ADJ_GATE_SHA256` (:141) and externally by measure.sh/frozenDigests (both digests verified above).

### 5. Do the controls really skip the claimed work?

- **doNothing (c1-J1)** — yes. `controls.mjs:45` scores `--rev BASELINE --repo LANE` **before any mutation**; provenance says `repo=lane` and no control commit exists for it. At the baseline there is no `corpus/adjacency-screen.tsv` (the counter reads it `optional`, → screened 0) and the 10-row round-17 map is untouched. It is the pure unmoved-surface measurement: unaccounted 47, newMapped 0, predicate false. ✔
- **screenAll (c1-J2)** — yes, it skips exactly the predicate-bearing work. `controls.mjs:54-58`: `reset()` to BASELINE in the fresh internal clone, writes **only** `corpus/adjacency-screen.tsv` (header + one `not-browser-sense`, surface `-`, 12-word-prefix quote per unaccounted key, note `control`), no map row. The counter accepts all 47 screens (screenFindings 0 — quotes pass `goodQuote` + substring), giving unaccounted 0, but `newMapped 0 < 4` → predicate false. This demonstrates (a) screening alone cannot satisfy the target and (b) the counter cannot judge screen reasons — exactly what `feasibilityDisclosed` states ("a candidate screened with a wrong reason counts as accounted"). ✔
- **junkRows (c1-J3)** — reproduces its lesson: 4 real-quote `split-declared` rows on kama/mori/souji/tameshi **line 3** (non-candidates) verify clean (rows 14 verified 14) yet `newMapped 0` — check-adjacency verifies quotes, not overlap. ✔
- **mislabelUnnamed (c1-J4)** — reproduces: 4 `split-declared` rows on kake candidates whose text has no `\btabi\b` (filter at `controls.mjs:72`) and whose tabi_quote names no sibling → mapped rises to 9 but `newMapped 0` — the naming clause is what gates newMapped. ✔

## Per-item verdicts

| item | verdict |
|---|---|
| Controls re-run reproduces committed receipts (counted fields, exit codes, stderr, summary, candidate list) | **holds** |
| claims.json C1 predicate text vs counter code | **holds** (identical condition, :239) |
| before value | **holds** (matches c1-J1-do-nothing.json) |
| target | **holds** (matches code predicate) |
| kill rule | **holds** (exit 2 Refusal path + ADJ_GATE_SHA256 pin present; external byte checks verified for all 5 frozenDigests entries) |
| doNothing control skips claimed work | **holds** (no mutation, no screen ledger at baseline) |
| screenAll control skips claimed work | **holds** (screen ledger only; fails on newMapped 0; proves wrong-reason screens count — matches feasibilityDisclosed) |

No `defect` finding. The two failed-then-fixed reproductions were my environment, not the harness.

## Residual risk & verification gaps

- **R1 — fleet-shape requirement (operational):** any seat reproducing C1 outside the real fleet path must present `--fleet` as real directories that are exact git toplevels (gate rule, check-adjacency.mjs:37-38); symlinks are refused by design. The lane's own contract (C1 counter `--fleet /home/vgpnk/Projects/shokunin`) satisfies this. I used 22 shared clones under scratch.
- **R2 — junk control non-hermetic:** c1-J3 pins kama/mori/souji/tameshi at **live** `refs/heads/master` at run time (`controls.mjs:63-64`), so its control-commit bytes can drift between runs (rerun tree `5b022cee…` vs committed `99b96a02…` — control commits are dangling objects of removed scratch clones, so the byte diff itself is not inspectable). Counted fields are stable (reproduced exactly); only a history rewrite of those lines could shift them. Low.
- **R3 — provenance label `repo=lane`** is positional (whatever LANE resolved to); in my rerun it named the scratch mirror, not the fleet checkout. Cosmetic; counted fields unaffected.
- **R4 — goal-text paraphrase:** the task prompt says contested-open needs an L0 line `tabi | round-33 | …`; the gate accepts `tabi | round-<N> |` (any N) and claims.json (the frozen source) says only "contested-open". No claims-vs-code mismatch; executors should not read the round-33 restriction as counter-enforced.
- **Verification gap:** no `lsp` device/server is mounted in this session (no MCP lsp route), so all caller/definition checks here are direct reads of digest-pinned bytes, not semantic-index-backed; the digests make the text review sound. The C2 predicate code itself was not line-reviewed (out of my seat's scope); its three control receipts did reproduce exactly.
- Tooling: nothing installed or upgraded (no need); no network fetches; no browser launched. `pgrep -fa 'chromedriver|chromium'` → only system `earlyoom` (its cmdline contains the word "chromium" as an --prefer pattern; no chromedriver/chromium process exists). Scratch tree `/fast/scratch/hyaku/tabi-r33/RevC1Controls/` deleted after receipts were copied out.

## Deliverables

- Report: `.ufo/waves/round-33/w1/RevC1Controls.md` (this file)
- Receipts (rerun, 25 files: 7×.json/.provenance/.stderr, controls-summary.json, c1-candidates.tsv, rerun2-summary.json, rerun2.stderr): `.ufo/waves/round-33/w1/RevC1Controls/`
- Commands (paste): as in §2; comparison snippet used `node -e` over each receipt pair for `predicate/candidates/mapped/screened/unaccounted/newMapped/adjacency/screenFindings/unaccountedKeys-sha` and `predicate/honest/forgeriesAccepted/acceptedForgeries/digestLiterals/selftest.exit`; exit codes shown inline above.
