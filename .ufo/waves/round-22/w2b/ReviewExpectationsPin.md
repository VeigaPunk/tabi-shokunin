# ReviewExpectationsPin — EXPECTATIONS/PRODUCER pins, partial-absence handling, coherent-edit resistance

**Item:** W2b attack item 12 — "EXPECTATIONS_SHA256 / PRODUCER_SHA256 pins in measure-c1.mjs versus actual blob digests at the review revision; partial/absent expectations handling; can a revision edit expectations and evidence coherently to stay at 12?"

**Review revision:** `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (lane `tabi-shokunin`, HEAD at review time; `git log --oneline -6` → `e3cf4e0` HEAD, `0f24164` parent, `5f58577` BASE).
**Method:** static only. Every production byte cited as `git -C <lane> show e3cf4e0:<path>`; every digest as `git cat-file blob e3cf4e0:<path> | sha256sum`.
**Not run (bounds: "no execution of lane scripts"):** `measure-c1.mjs`, `selftest-c1.mjs`, `run-checks.py`, `check-review-chronology.mjs`. No browser, no installs, no delegation, no VCS writes. Claims below that describe what a script *would* print are static deductions and are labelled as such.
**Tools:** none installed or updated this session (no package manager invoked).

---

## 0. Answer to the item's three questions (short form)

1. **Do the pins match the actual blob digests at the review revision?** **Yes, exactly.** `EXPECTATIONS_SHA256` (`measure-c1.mjs:22`) = `4a693dce…b60e1e` = sha256 of the committed `corpus/evidence/round-22/semantic-expectations.json` blob at `e3cf4e0`. `PRODUCER_SHA256` (`measure-c1.mjs:23`) = `bc11e4d6…48a811` = sha256 of the committed `scripts/webmcp-lifecycle-round21.mjs` blob at `e3cf4e0`. No drift.
2. **Partial/absent expectations handling:** fail-closed and mutant-covered. Both absent → `verdict "baseline"`, value 0, exit 0 (`measure-c1.mjs:384`); exactly one absent → exit 1, value 0, finding `source_binding` (`:387`, `:388`). Covered by selftest cases `baseline`, `partial-missing-note`, `partial-missing-expectations` (`fixtures/expected.json:13,23,33`). Substitution of the expectations path by a symlink/gitlink/directory is refused by `filesAt()`'s `^(100644|100755) blob` mode filter → `revision_input:non-regular-or-unlisted-blob`, exit 2.
3. **Can a revision edit expectations and evidence coherently and stay at 12?** **Split answer, and this is the substantive part of the review:**
   - **Evidence: no.** The 26 round-21 acquisition artifacts (12 raw JSON + 12 fixtures + `receipt.json` + `.ufo/waves/round-21/runtime-execution-finalized.json`) are frozen by blob oid in `.ufo/waves/round-22/preservation-baseline.json` and verified **intact at `e3cf4e0`** (0 mismatches). Any edit trips `run-checks.py:75` (`mismatches`) or `:85` (`scope_errors`) → `raise RuntimeError` at `:109` → verdict `could-not-evaluate`.
   - **Expectations: yes, and the measurement will not notice.** `EXPECTATIONS_SHA256` lives *inside the checker it protects* (`measure-c1.mjs:22`), `measure-c1.mjs` is not in its own `INPUT_PATHS` and its digest is pinned nowhere in the measurement, and `run-checks.py`'s scope check diffs `BASE..revision` (`run-checks.py:85`), so every round-22 path shows as `A` forever and a later `M` on `corpus/evidence/round-22/semantic-expectations.json` + the constant at `measure-c1.mjs:22` is invisible to every automated gate. The metric stays `clean`/12 as long as the rewritten expectations remain consistent with the frozen round-21 bytes. **The only remaining signals are the git diff and the committed digest trail** (`.ufo/waves/round-22/review-snapshot.json` `paths[]`, and `.ufo/waves/round-22/post-crash-repair.json` `filesAfter`) — i.e. reviewer diligence, not a machine gate. The oracle note itself already discloses the general limit (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:25-26`: "Cryptographic self-consistency is necessary, not an outcome oracle or a guarantee against an author changing both the evidence and the independent expectations"), so this is an *acknowledged* residual risk, not a concealed defect. The findings below sharpen it into three concrete, fixable gaps.

---

## 1. Verified positives (no action)

**P1 — Both pins equal the committed blob digests at `e3cf4e0`.**

| Pin | Constant (path:line) | Constant value | sha256 of committed blob at `e3cf4e0` | Equal |
|---|---|---|---|---|
| expectations | `.ufo/waves/round-22/measure-c1.mjs:22` | `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` | `4a693dce…b60e1e` | yes |
| producer | `.ufo/waves/round-22/measure-c1.mjs:23` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | `bc11e4d6…48a811` | yes |
| oracle note (unpinned, see F2) | `.ufo/waves/round-22/measure-c1.mjs:14` | — | `6f6439558531d7f51bc7c47fa90e38f5133db9ee94473a3c05ed27181893116e` | — |

The producer pin is *quadruply* enforced against the same constant: `measure-c1.mjs:414` (actual producer bytes), `:83` (`expectations.producerSha256`), `:427` (`execution.producerSha256`), `:447` (`receipt.producer.sha256`). At `e3cf4e0` all four agree: `execution.producerSha256 = bc11e4d6…`, `receipt.producer.sha256 = bc11e4d6…`, `expectations.producerSha256 = bc11e4d6…`.

**P2 — The post-crash repair did not touch the pinned oracle data.** `.ufo/waves/round-22/review-snapshot.json` (committed at `e3cf4e0`, `paths[]`) records the W2-checkpoint digests: `semantic-expectations.json` = `4a693dce…` and the oracle note = `6f643955…`. Both equal the current committed blobs (§1 table), i.e. the `e3cf4e0` repair changed **only** the checker (`measure-c1.mjs` `76b47edd…` → `47176aed…`), the selftest (`be5d362c…` → `985aa9c7…`) and the fixture expectations (`cfe81b47…` → `b1380a0b…`), exactly as `post-crash-repair.json` `unchanged[]`/`filesAfter` claims. The repaired checker therefore still measures the *same* pinned expectations, not a re-authored set.

**P3 — Partial/absent oracle handling is fail-closed.** `measure-c1.mjs:384` (both absent → `baseline`, exit 0, value 0); `:387`/`:388` (exactly one absent → `source_binding` finding); `:386` (present-but-not-bytes → `input_shape`); `:392-394` (digest and schema); `:397-400` (the note's first line must equal `SOURCE_HEADER`, and `expectations.sourceHeader`/`sourceNotePath` must equal it). Selftest coverage exists for all three oracle-presence states (`fixtures/expected.json:13`, `:23`, `:33`).

**P4 — The round-21 evidence is frozen and currently intact.** `.ufo/waves/round-22/preservation-baseline.json` lists 4865 frozen paths; the 26 acquisition artifacts carry oids that match the `e3cf4e0` tree exactly (verified: 0 mismatches), e.g. `corpus/evidence/round-21/runtime/na-reset.json` → `6dd1f24e4e291627af1e495c59479225c277dff6`, `corpus/evidence/round-21/runtime/receipt.json` → `59912421a0051187990f9e4ceab4473aba44b01d`, `.ufo/waves/round-21/runtime-execution-finalized.json` → `e76b0d8590685d674a4333542c9b1dd7a403a199`. The acquisition record's own `artifacts` map holds all 25 required digests and `measuredRevision: "uncommitted"` — the only soft spot, discussed in R1.

**P5 — Note prose checked for the one claim that looked wrong, and it is right.** The note's `na-native-submit` row (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:40`) says "output array containing the landing JSON-LD object". `scripts/webmcp-lifecycle-round21.mjs:137` serves `/landing` as `<script type="application/ld+json">{"dummy":"landing"}</script>`, and the retained raw frame (`corpus/evidence/round-21/runtime/na-native-submit.json`, `WebMCP.toolResponded` seq 16) carries `output: [{"dummy":"landing"}]` — the parsed landing JSON-LD object. The prose and the pinned expectation agree; **no finding here**. (Recorded so a later reviewer does not re-raise it as a defect.)

---

## 2. Findings by severity

### F1 — MEDIUM — the `EXPECTATIONS_SHA256` guard has no selftest mutant that uniquely requires it

**Where:** `.ufo/waves/round-22/measure-c1.mjs:392-393` (the guard) vs `.ufo/waves/round-22/selftest-c1.mjs` `mutate()` and `.ufo/waves/round-22/fixtures/expected.json` (44 cases).

**Defect.** The digest guard is the only thing that makes *any* byte change to the pinned expectations file fail closed, but no mutant isolates it. The only selftest case that touches the expectations bytes is `malformed-expectations` (`selftest-c1.mjs:300-304`, fixture `:401`), which sets `expectations.cases = {}`. That mutation trips **both** the digest guard (`:392`) and the schema guard (`:394`), and `checkOracle` in `selftest-c1.mjs` only requires `ids.includes(expected.finding)` — with `expected.finding === "input_shape"`, which both guards produce. Therefore:

> **Smallest counterexample (static deduction, not executed):** delete the single line `if (expectationsBytes && sha256(expectationsBytes) !== EXPECTATIONS_SHA256)` at `measure-c1.mjs:392` (keeping `:393`). Every one of the 44 selftest cases keeps its expected exit/value/verdict/finding, so the `oracle22-selftest` gate (`run-checks.py:100`, expectedExit 0) still reports 44/44 clean. The gate that is supposed to prove the expectations are pinned cannot tell a pinned oracle from an unpinned one.

Why this matters beyond coverage: with the guard removed, a revision that lowers a *permissive* bound in the expectations — e.g. `corpus/evidence/round-22/semantic-expectations.json` `cases[].pre.minMs` `250 → 1`, or `post.maxMs` `10000 → 999999` — still measures `clean`/12 with **zero findings**, because the timing window check is `preMs < expected.pre.minMs || preMs > expected.pre.maxMs` (`measure-c1.mjs`, finite-summary-windows) and a loosened bound is satisfied by the frozen bytes. With the guard present, that edit is a hard `input_shape: semantic-expectations-digest` failure unless the constant is bumped in the same revision, which makes the co-edit visible in the diff. The guard is load-bearing; nothing tests it.

**Preserving positive.** The identical pattern for the *producer* **is** covered: `producer-unpinned` (`selftest-c1.mjs:284-287`, fixture `:370`) appends a byte to `scripts/webmcp-lifecycle-round21.mjs` and expects finding `evidence_binding`; the actual-bytes check at `measure-c1.mjs:414` is the *only* check that fires for it (the three constant-vs-constant comparisons at `:83`, `:427`, `:447` are unaffected by mutating the file's bytes). So the lane already knows how to test a byte-pin; the expectations twin was simply never written. `raw-unpinned` (`selftest-c1.mjs:293-299`, fixture `:390`) is a second precedent using the identical "append `\n`" idiom.

**Smallest fix** (2 files, ~10 lines, no change to any existing expectation):

```js
// .ufo/waves/round-22/selftest-c1.mjs, inside mutate(), next to 'raw-unpinned'
case 'expectations-bytes-unpinned':
  files[EXPECTATIONS] = text(files[EXPECTATIONS]) + '\n';
  return;
```
```json
// .ufo/waves/round-22/fixtures/expected.json
{ "name": "expectations-bytes-unpinned",
  "mutation": { "kind": "expectations-bytes-unpinned" },
  "exit": 1, "value": 0, "verdict": "failed", "finding": "input_shape" }
```
Appending one newline keeps the JSON valid and `expectationShape()` true, so the digest guard at `:392` is the *only* source of the failure: with the guard removed this case yields exit 0 / `clean` / value 12 and therefore fails, which is exactly the property to assert. All 44 existing cases keep their current outcomes (the new case is additive), so the `oracle22-selftest` gate and the `checks-at-e3cf4e0` expectations stay valid. If the lane prefers an `evidence_binding` id for symmetry with `producer-bytes-unpinned`, change the guard's finding id at `:393` from `input_shape` to `evidence_binding` — but that would re-label the existing `malformed-expectations` expectation at fixture `:401`, so `input_shape` is the smaller change.

---

### F2 — MEDIUM-LOW — the human-readable oracle note is not digest-pinned; only its first line is bound

**Where:** `.ufo/waves/round-22/measure-c1.mjs:14` (`NOTE_PATH`), `:24` (`SOURCE_HEADER`), `:396-400` (note handling); `.ufo/waves/round-22/selftest-c1.mjs:281-283` (`bad-source-header`); `.ufo/waves/round-22/fixtures/expected.json:360`.

**Defect.** `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` is the artifact the expectations declare as their source (`expectations.sourceNotePath`, and `expectations.sourceHeader` must equal the note's first line, `measure-c1.mjs:83`, `:398`). It is the only place where the *per-case required distinctions* are stated in prose (the 12-row table at note lines 37-48). The measurement binds only the note's **first line** (`:398-399`); the remaining ~8.6 KB are bound by nothing. There is no digest constant for the note, and no selftest mutant that rewrites the note body (the only note mutants are delete-note twice and `bad-source-header`, which rewrites line 1 only).

> **Smallest counterexample (static):** at a later revision, change the note's `na-reset` row from "Canceled, exactly “Tool execution cancelled by a form reset”" to any other wording (keeping line 1 intact). `evaluate()` produces no finding; the measurement still reports `clean`/12; the note's sha256 silently changes from `6f643955…` with no gate signal. The expectations file (`4a693dce…`) stays pinned and untouched, so the pinned machine oracle and the prose oracle of record can drift apart with a green build. This is a documentation-honesty hole in the *declared* independence chain ("The fixed case expectations are in `…semantic-expectations.json`" — note line 22-24 asserts the expectations and the note are one artifact).

**Preserving positive.** The note's digest is already published in a committed record at `e3cf4e0`: `.ufo/waves/round-22/review-snapshot.json` `paths[]` → `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` = `6f6439558531d7f51bc7c47fa90e38f5133db9ee94473a3c05ed27181893116e`, `bytes: 8590` — equal to the committed blob at `e3cf4e0` (§1 table). The note's *first line* is already fail-closed (`bad-source-header` mutant, fixture `:360`, expects `source_binding`). Adding a digest check extends an existing, working pattern rather than inventing one.

**Smallest fix** (mirrors the expectations/producer pattern exactly):

```js
// .ufo/waves/round-22/measure-c1.mjs, next to :23
const NOTE_SHA256 = '6f6439558531d7f51bc7c47fa90e38f5133db9ee94473a3c05ed27181893116e';
// next to :392
if (noteBytes && sha256(noteBytes) !== NOTE_SHA256)
  addFinding(findings, 'input_shape', 'oracle-note-digest');
```
plus the matching selftest mutant `note-bytes-unpinned` (append `\n`) with expected `exit 1, value 0, verdict "failed", finding "input_shape"`. **Trade-off to state explicitly:** pinning the note forbids routine note edits (a future lesson append would need a constant bump, exactly like the expectations). If the lane prefers prose to stay editable, the alternative is to machine-cross-check the note's per-case status column against `expectations.cases[].response.status` — larger and more brittle. Recommendation: pin the digest; note edits then go through the same visible co-edit protocol as the expectations.

---

### F3 — MEDIUM-LOW — both pins are revision-local, and the harness's scope check cannot observe edits to round-22 paths

**Where:** `.ufo/waves/round-22/measure-c1.mjs:22-23` (pins inside the file they protect); `:31-35` (`INPUT_PATHS` — `measure-c1.mjs` is **not** among them); `.ufo/waves/round-22/run-checks.py:83-87` (scope check), `:75` / `:108-109` (preservation); `.ufo/waves/round-22/preservation-baseline.json` (covers round-21 paths only — verified: it lists neither `corpus/evidence/round-22/semantic-expectations.json` nor `.ufo/waves/round-22/measure-c1.mjs`).

**Defect.** Two independent blind spots stack:

1. *The pin is revision-local.* `EXPECTATIONS_SHA256` is a constant in the same file that enforces it, and `measure-c1.mjs` is not in its own `INPUT_PATHS` (`:31-35`), so no digest of the checker is pinned by the measurement. A revision that edits `corpus/evidence/round-22/semantic-expectations.json` **and** `measure-c1.mjs:22` is internally consistent; `sha256(expectationsBytes) === EXPECTATIONS_SHA256` holds again and the metric stays `clean`/12.
2. *The scope check is BASE-relative, so it cannot see the edit.* `run-checks.py:85` computes `git diff --name-status BASE revision`. Every round-22 path is absent at `BASE` (`5f58577`), so it appears as `A` at *every* later revision regardless of how many times it was modified afterwards. `allowed_new` (`:83`) therefore admits the expectations file unconditionally, and `preservation-baseline.json` does not cover round-22 paths, so `mismatches` (`:75`) stays empty.

> **Smallest counterexample (static):** a revision `R` that (a) rewrites `corpus/evidence/round-22/semantic-expectations.json` (e.g. relaxes `pre.minMs` to 1, or rewords any case's expected status in a way still consistent with the frozen raw bytes) and (b) updates `measure-c1.mjs:22` to the new digest. Every automated gate stays green: `run-checks.py` scope (path shows `A`), preservation (round-21 blobs untouched → 0 mismatches), `oracle22-selftest` (44/44, since the new expectations are shape-valid), `c1-after` (`expectedMetrics` `c1_semantically_checked_lifecycle_rows == 12`, `verdict == "clean"`). The wave's own guard against exactly this — the expectations digest published in the committed `review-snapshot.json` — is **not** consulted by any script.

**Preserving positive.** The evidence half of the property is real and verified: the 26 round-21 acquisition artifacts are frozen by oid and intact at `e3cf4e0` (P4), so a *coherent rewrite of the evidence* is blocked by `run-checks.py:108-109` (`RuntimeError` → `could-not-evaluate`). The expectations/constant half is the half that is not machine-enforced. The digests needed to close it are already published in committed records at `e3cf4e0`: `review-snapshot.json` `paths[]` (expectations `4a693dce…`, note `6f643955…`, producer `bc11e4d6…`, and the pre-repair `measure-c1.mjs` `76b47edd…`) and `post-crash-repair.json` `filesAfter` (post-repair `measure-c1.mjs` `47176aed…`, `selftest-c1.mjs` `985aa9c7…`, `fixtures/expected.json` `b1380a0b…` — all three verified equal to the current committed blobs).

**Smallest fix.** Add a check to `run-checks.py` that the revision's blobs for the six oracle artifacts equal the digests recorded in the committed records — i.e. `corpus/evidence/round-22/semantic-expectations.json`, `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` and `scripts/webmcp-lifecycle-round21.mjs` against `review-snapshot.json` `paths[]`, and `.ufo/waves/round-22/{measure-c1.mjs,selftest-c1.mjs,fixtures/expected.json}` against `post-crash-repair.json` `filesAfter`. A future legitimate repair then updates one record (the same pattern `post-crash-repair.json` already establishes) instead of being invisible. Folding it into the existing `if mismatches or … scope_errors …: raise RuntimeError` at `:108-109` keeps the fail-closed shape. *Minimum viable alternative if the lane prefers no new gate:* state in the C1 claim text that the oracle pins are revision-local and that the binding evidence is the committed `review-snapshot.json` / `post-crash-repair.json` digest trail plus reviewer diff — i.e. make the limitation part of the claim instead of leaving it implicit. (This part is already disclosed in the note at `:25-26`; the missing piece is that the *machine* gates do not carry it.)

---

### F4 — LOW — the `35/35` serial receipt for the repair revision is not committed at the review revision

**Where:** `.ufo/waves/round-22/checks-at-e3cf4e0.json` — present in the lane working tree but **untracked** at `e3cf4e0` (`git show e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` → "fatal: path … exists on disk, but not in 'e3cf4e0'"; `git status --porcelain -uall` → `?? .ufo/waves/round-22/checks-at-e3cf4e0.json`), whereas its sibling `checks-pre-w2-0f24164.json` **is** committed at `e3cf4e0` (it is in the `e3cf4e0` commit's file list).

**Defect.** The repair receipt is the only artifact that records, for the repaired revision, the executed oracle's producer digest (`producerSha256: 47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` for `oracle22-selftest`, `c1-before`, `c1-after`), the `c1-after` observed metrics (`c1_semantically_checked_lifecycle_rows: 12`, `verdict: "clean"`), and `run-checks.py`'s own digest `c501034d…`. While it is untracked, that trail is not part of the revision's immutable content: it can be edited or deleted without leaving a trace in the commit history, and a reviewer working from git alone (as this review must) cannot confirm the 35/35 claim from the revision.

**Preserving positive.** The same digests are recoverable from git history at `e3cf4e0` itself: the committed `measure-c1.mjs` blob hashes to `47176aed…` (verified) and the committed `run-checks.py` blob hashes to `c501034d…` (verified), and `post-crash-repair.json` (committed) records the same `filesAfter` trio. So the *content* claim is independently checkable; only the *receipt* is unanchored.

**Smallest fix.** Commit `.ufo/waves/round-22/checks-at-e3cf4e0.json` (it is the wave's own receipt and is the exact artifact the wave boundary cites) — no code change, no re-run. If the lane's convention is that receipts stay untracked until the next wave's commit, record that convention explicitly next to the receipt so a reviewer knows the receipt is deliberately out-of-band rather than accidentally dropped.

---

## 3. Residual risk and verification gaps

**R1 — run-time identity of the producer is asserted, not proven (pre-existing, acknowledged).** `expectations.acquisition.measuredRevision` is the literal string `"uncommitted"` (`corpus/evidence/round-22/semantic-expectations.json`, `acquisition.measuredRevision`), and `measure-c1.mjs:87` *requires* that exact value. The round-21 acquisition therefore ran against an uncommitted tree; the `PRODUCER_SHA256` pin proves the *committed* producer bytes, and `execution.producerSha256` proves the *record's claim*, but nothing proves the bytes executed at acquisition time were those bytes. W1 already noted this (`.ufo/waves/round-22/w1/Semantic02.md`). Smallest strengthening (not required now): require `acquisition.measuredRevision` to be a 40-hex commit whose `scripts/webmcp-lifecycle-round21.mjs` blob equals `PRODUCER_SHA256`. Out of scope for this wave (it would change the pinned expectations digest and thus the C1 pin).

**R2 — the C1 metric counts rows, not semantic strength.** `value` is the number of rows whose expectations matched (`measure-c1.mjs`, `row.counted = !blocked && row.semanticMatch`). It cannot distinguish "12 rows checked against a strong oracle" from "12 rows checked against a weakened oracle" — the latter is a code-level weakening of `measure-c1.mjs`, which is revision-local (F3) and only partly covered by the 44 mutants. Any claim of "12 semantically checked rows" is therefore a claim about *this* `measure-c1.mjs` blob (`47176aed…` at `e3cf4e0`), not a property of the metric. Recommend the C1 claim text name the measured checker blob digest, the way `review-snapshot.json`/`post-crash-repair.json` already do.

**R3 — verification gaps (stated honestly; nothing below was executed).**
- No lane script was run: I did **not** execute `measure-c1.mjs e3cf4e0…`, `selftest-c1.mjs`, or `run-checks.py`. The 12/0/35 figures I cite are read from committed/untracked receipt files and from static reading of the code, not reproduced.
- F1's central claim ("deleting `measure-c1.mjs:392` leaves the selftest at 44/44") is a **static deduction** from `selftest-c1.mjs`'s `mutate()` switch and `checkOracle`'s `ids.includes(expected.finding)` test. It was not demonstrated by running a mutated checker (that would require executing a lane script, which my bounds forbid). The deduction is tight: the only expectations-touching mutant is `malformed-expectations`, whose expected finding id `input_shape` is produced by the schema guard at `:394` as well.
- F3's claim that `run-checks.py:85` cannot see round-22 modifications is derived from reading `git diff --name-status BASE revision` semantics; I did not run the harness with a forged revision.
- The untracked `checks-at-e3cf4e0.json` was read from the working tree; its internal claims were not reproduced.

**R4 — explicitly out of scope for this item** (recorded so they are not silently folded in): malicious-author authenticity, publisher authentication, general browser semantics of `WebMCP`/`ld+json`, and any request for new capability or coverage. Nothing in F1-F4 depends on such a judgement; each is a defect or gap in *this repository's* pinning and test structure.

---

## 4. Commands exercised (all read-only; exit 0)

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --oneline -6                      # exit 0
git -C … show e3cf4e0:<path>            (measure-c1.mjs, selftest-c1.mjs, fixtures/expected.json,
                                         semantic-expectations.json, the oracle note, run-checks.py,
                                         review-snapshot.json, post-crash-repair.json,
                                         preservation-baseline.json, receipt.json,
                                         runtime-execution-finalized.json, producer script,
                                         na-native-submit.{html,json})                        # exit 0
git -C … cat-file blob e3cf4e0:<path> | sha256sum          (5 paths)                       # exit 0
git -C … ls-tree -r -z e3cf4e0            (tree oids vs preservation-baseline.json)        # exit 0
git -C … status --porcelain=v1 -uall                        # exit 0 (read-only)
python3 - <<'PY' … (JSON/digest comparison only; no lane code)                            # exit 0
```
No writes to the lane, no VCS mutation, no package installation, no network, no browser.
