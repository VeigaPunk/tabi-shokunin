# RevC1Gate — s106 gate `evaluate()` semantics the C1 self-test must pin

Seat: RevC1Gate (review, leaf) · round-29 w1 · milestone C1 · 2026-10-26
Report path (lane-relative): `.ufo/waves/round-29/w1/RevC1Gate.md`

## 0. Scope, state reviewed, method

- Reviewed the frozen semantics of `evaluate()` in `scripts/check-s106-evidence.mjs` at baseline
  `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb` (blob dumped to seat scratch, 367 lines) and diffed
  against lane HEAD `35045d7d9f6cf0bbdc4c734881ab77b48deedb81` (working tree clean for this file:
  `git status --porcelain` empty). The baseline→HEAD diff (15 insertions, 4 deletions) touches only
  the header comment, the fs import (`existsSync`), three `fieldValue` case keys, a trailing
  `d.commit()` in the mismatch case, and the runner's field assertion. **`evaluate()` is
  byte-identical in both** — the table below therefore holds for baseline, HEAD, and the REV C1 lands on.
- All line refs are `B:<n>` = baseline blob, `H:<n>` = HEAD file.
- `lsp` device: **not mounted in this seat's tool inventory** (no `lsp`/`xd://lsp` route available);
  status could not be queried. Semantic checks were done by full-text reads of the baseline blob and
  HEAD file plus an executed probe — text fallback used, per role disclosure.
- Tooling: nothing installed (no authorization used).

## 1. What `revision_match` compares (B:108-127)

`evaluate(repo, revArg)` does, in order:

1. `rev = resolveRev(repo, revArg)` (B:109; charset check B:75, `rev-parse --verify --quiet <rev>^{commit}` B:76-77).
2. Reads the receipt blob at the **evaluated** rev: `RECEIPT_PATH = corpus/evidence/round-26/sources/s106.json`
   (B:110-111; absent → Refusal → exit 2).
3. `parseReceipt` (B:112) — Refusal on any violation → exit 2.
4. `measuredRev = resolveRev(repo, receipt.measured_rev)` (B:113) — unresolvable → Refusal → exit 2.
5. **`revision_match = (bytes read at `receipt.measured_rev` at `receipt.bytes_path`) !== null AND sha256(those bytes) === receipt.decoded_sha256`** (B:114-116).
   - It compares **measured-revision bytes vs the receipt's declared sha**, *not* measured-rev bytes vs
     evaluated-rev bytes, and *not* `receipt.measured_rev == evaluated rev`. `readBlob` returning null
     (bytes missing in the measured_rev tree) silently yields `revision_match = false` (B:114-116) — a
     Refusal is **not** thrown for the measured side (derived from code; not probed).
6. Only afterwards reads the evaluated-rev bytes (B:117-118; absent → Refusal → exit 2) and computes
   `sha_match` (B:119-120), `anchor_located` (B:122-123, 1-based `lines[anchor.line - 1]`, trim-compared),
   `anchor_unique` (B:124-125, `occurrences === 1` over trim-equal lines), `byte_count_match`
   (B:126, `Buffer.byteLength === receipt.decoded_bytes`).
7. `valid = revisionMatch && shaMatch && anchorLocated && anchorUnique && byteCountMatch` (B:127);
   `revision_match` is reported as a field (B:139 H-numbering B:138).

Both hashes compare against the *same* `receipt.decoded_sha256`, so in the canonical mismatch fixture
`sha_match=true` while `revision_match=false` — that conjunction is the discriminator that isolates the
revision comparison. `revision_match=true` does **not** imply `measured_rev == rev`: the self-test's own
auto-fill (B:268-271, H:273-280) sets `measured_rev` to a commit *earlier* than the evaluated tip, and a
correct gate still reports `revision_match=true` because the bytes are identical (observed, probe A/B2).

## 2. Required receipt fields (`parseReceipt`, B:87-105) — violation ⇒ exit 2, never 1

| Requirement | Ref |
|---|---|
| Body parses as JSON; is a non-null object | B:88-94 |
| `schema === "tabi-s106-evidence-v1"` (`RECEIPT_SCHEMA`) | B:95 |
| `url`, `decoded_sha256`, `bytes_path`, `measured_rev` each a non-empty string | B:96-98 |
| `measured_rev` matches `/^[0-9a-f]{40}$/` (full lowercase commit id) | B:99 |
| `decoded_bytes` is a `number` | B:100 |
| `anchor` is an object; `anchor.line` a number; `anchor.text` a non-empty string | B:101-104 |

Not validated (informational only, no effect on exit): `row`, `fetched_at`, `transfer`,
`anchor.comment_line/comment/occurrences_in_file`. Note `decoded_sha256` is only checked to be a
non-empty string — a malformed hash gives `sha_match=false`/`revision_match=false` ⇒ exit **1**, not 2.

## 3. Exit taxonomy — what makes 1 vs 2

CLI (`--rev`): `valid=true` → 0 (B:364); evaluation **completed** with `valid=false` → 1 (B:364);
**any** `Refusal` → 2 (unknown arg B:333, usage/no `--rev` B:350, evaluate B:358); `--help` → 0 (B:337).
Header contract (B:3-5): "0 valid, 1 invalid (receipt present but committed bytes disagree), 2
could-not-evaluate (usage, unreadable revision, receipt or bytes absent at the measured revision,
malformed receipt). Any other nonzero code is undeclared and reads as could-not-evaluate."

The boundary in one line: **2 = evaluation could not complete** (bad args; revision doesn't resolve;
receipt absent/unparseable/schema-mismatch/missing fields; decoded bytes absent at the *evaluated* rev).
**1 = evaluation completed and ≥1 of the five validity terms failed.** `--selftest` exits 0/3 (B:346);
its runner reimplements the exit mapping per case — `valid ? 0 : 1`, `Refusal` → 2 (B:293-297) — over
`evaluate()` directly (it never spawns the CLI; `--repo` exists for exactly this, B:35 usage comment).

## 4. Expected-behaviour table for the two revision cases (what W2 must check)

Fixture constants (B:167-175): `FIXTURE_BYTES` = header line + 184 `// filler k` lines (k=2..185) +
`FIXTURE_COMMENT` (line 186) + `FIXTURE_LINE` (line 187) + `// tail` + trailing newline; anchor
`{line: 187, text: FIXTURE_LINE}`; `decoded_sha256 = sha256(FIXTURE_BYTES)`; `decoded_bytes` = its byte length.

| Case id | Exact fixture state (two commits in the sandbox repo) | exit | valid | revision_match | Other fields on a correct gate |
|---|---|---|---|---|---|
| `measured-revision-bytes-match` (B:184-189, H:185-191) | c1: `bytes_path` = `FIXTURE_BYTES` + receipt written **without** `measured_rev`; `rev()` auto-fills `receipt.measured_rev = <c1>` (B:270, H:276) and commits c2. Evaluate c2. Equivalent minimal shape: any repo whose bytes at `measured_rev` hash to `decoded_sha256` (incl. `measured_rev == rev`; observed as probe B2) | **0** | **true** | **true** | `sha_match`, `anchor_located`, `anchor_unique`, `byte_count_match` all true |
| `measured-revision-bytes-mismatch` (B:191-200, H:192-205) | c1: `bytes_path` = `FIXTURE_BYTES` with `"// tail"` → `"// prior source bytes"` (so sha(c1 bytes) ≠ `decoded_sha256`); `measuredRev = <c1>`. c2: `bytes_path` = canonical `FIXTURE_BYTES`, receipt with `measured_rev: <c1>`, **and the receipt committed at c2** (H:203 `d.commit()`). Evaluate c2 | **1** | **false** | **false** | `sha_match=true` (evaluated bytes match the receipt), anchor/count true — only `revision_match` false |

**H:203's trailing `d.commit()` is load-bearing:** without it the receipt is absent from the evaluated
tree → Refusal → the case yields (2, null, `receipt absent`) and false-fails even on a correct gate
(defect 3). And the case only *specifically* falsifies the revision comparison when everything else is
green (fixture as specified): under the mutation "revision comparison removed" (B:115-116 → e.g.
`const revisionMatch = true;`), the mismatch case flips to (0, true, true) ⇒ FAIL — it is the **only**
case that flips under that mutant; the match case still passes. Hence the claims' mutation receipt must
show `measured-revision-bytes-mismatch FAIL` specifically.

Boundary rows (observed unless marked derived):

| State | Result |
|---|---|
| receipt present & valid, `bytes_path` absent at evaluated rev | exit 2, `decoded bytes absent at <rev>: <path>` (B:118) |
| receipt absent at evaluated rev | exit 2, `receipt absent at <rev>` (B:111) |
| `measured_rev` = 40 zeros | exit 2, `revision does not resolve: 000…0` (B:77) |
| bytes absent in the `measured_rev` tree (measured_rev resolvable) | `revision_match=false`, rest as evaluated ⇒ exit 1 (derived, B:114-116 — no Refusal on the measured side) |
| evaluated bytes tampered, measured_rev bytes canonical | (1, false, revision_match=**true**), `sha_match=false` — the mirror image; not one of the two cases |

## 5. Observed evidence (commands + exit codes)

```
$ git -C tabi-shokunin rev-parse HEAD            → 35045d7d9f6cf0bbdc4c734881ab77b48deedb81
$ git -C tabi-shokunin status --porcelain -- scripts/check-s106-evidence.mjs   → (empty)
$ git -C tabi-shokunin diff --stat 856fa9e… -- scripts/check-s106-evidence.mjs
  scripts/check-s106-evidence.mjs | 15 +++++++++++++---- (1 file changed)
$ git -C tabi-shokunin show 856fa9e…:scripts/check-s106-evidence.mjs > $S/baseline-check-s106.mjs  (367 lines)
$ node $S/probe.mjs                              (fixtures via `git -C <tmpdir> …`, toplevel verified == dir before first commit; TMPDIR=$S)
A match      {"exit":0,"valid":true,"revision_match":true,"sha_match":true}
B mismatch   {"exit":1,"valid":false,"revision_match":false,"sha_match":true}
B2 control   {"exit":0,"valid":true,"revision_match":true,"sha_match":true}
C bytes-abs  {"exit":2, … "decoded bytes absent at 0677e0e…: corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc"}
D receipt-abs{"exit":2, … "receipt absent at 6c32df83…"}
E bad-mrev   {"exit":2, … "revision does not resolve: 0000000000000000000000000000000000000000"}
SELFTEST exit: 1 | err: "baseline-check-s106.mjs:267 / if (existsSync(receiptPath)) { / ^"
probe_exit=0
```

Baseline `--selftest` crash observed: exit 1, no stdout tally, code frame at B:267 — matches claims.json
C1 `before` (ReferenceError `existsSync`).

## 6. Baseline defects — confirmed at line level (all three already repaired at HEAD 35045d7)

1. **B:37** fs import omits `existsSync`; first use **B:267** (`rev()` auto-fill) throws ReferenceError
   before any case runs → exit 1, no tally. Repaired at H:38.
2. **B:301** `if (c.field) ok = ok && out[c.field] === false;` — hard-codes every field case to expect
   `false`, so `measured-revision-bytes-match` (field `revision_match`, correct gate ⇒ `true`) could
   never pass: the runner's field assertion was inverted/unsatisfiable. Repaired at H:307-311
   (`out[c.field] === c.fieldValue` with per-case `fieldValue`, H:189/H:197/H:211/H:219).
3. **B:191-200** mismatch case build writes the receipt but never commits it → at the evaluated rev the
   receipt is absent ⇒ Refusal (2, null) ≠ expected (1, false, false): the case false-fails and its
   mutation signal is bogus. Repaired at H:203 (`d.commit()`).

No new defect found in `evaluate()` (B:108-145 ≡ H:109-146): the five-term conjunction, the receipt
validation, and the exit mapping match the frozen round-26 contract quoted in the header.

## 7. W2 checklist (check the repaired self-test against exactly this)

- [ ] `--selftest` exits 0, prints `S106_SELFTEST verdict=clean cases=7 passed=7` (N ≥ 7 per claims C1) with both revision case ids present.
- [ ] Match case asserts the triple **(exit 0, valid true, revision_match true)** — i.e. `fieldValue: true` present (H:189) and the runner compares `=== c.fieldValue` (H:311), not `=== false`.
- [ ] Mismatch case asserts **(exit 1, valid false, revision_match false)** on the two-commit fixture with the receipt **committed at the evaluated rev** (H:203) and measured-rev bytes differing only by the `"// tail"` edit (keeps `sha_match=true`, isolating `revision_match`).
- [ ] `existsSync` imported (H:38) so `rev()` auto-fill (H:273-280) runs; no ReferenceError.
- [ ] Mutation receipt: a gate copy with B:115-116's comparison removed (e.g. `const revisionMatch = true;`) makes `--selftest` exit nonzero with `measured-revision-bytes-mismatch FAIL` — and only that case fails.
- [ ] `node scripts/check-s106-evidence.mjs --rev REV --json` reports `valid=true` at the measured REV (claims C1 predicate).

## 8. Findings by severity

- **High: none.** No actionable defect found in `evaluate()`'s semantics at baseline or HEAD; the three
  baseline defects are exactly as claimed (§6) and the HEAD repair matches the expected triples (§4)
  by construction; empirical runs (§5) were against the baseline blob.
- **Medium: none** within this item's scope (semantics specification for C1).
- **Low / informational (out of C1 scope; report only, no repair):**
  1. `--selftest` pins `evaluate()` semantics by reimplementing the exit mapping (B:293-297), never
     spawning the CLI — a mutant in `main()`'s final mapping (B:364, e.g. 0↔1 inversion) is invisible to
     `--selftest`. Consistent with the round-26 frozen scope; noting as residual risk only.
  2. `sha256()`/`Buffer.byteLength` operate on utf8-decoded `git show` stdout (B:68-71, B:81-83,
     B:126) — non-UTF-8 blob bytes would hash the re-encoded text. Latent, pre-existing; real S106
     bytes are ASCII. Unchanged by the C1 diff.
  3. `decoded_sha256` is format-unvalidated (B:96-98 string-only): a malformed hash yields exit 1
     (invalid), not exit 2 (could-not-evaluate). Debatable but frozen behavior; do not change under C1.

## 9. Residual risk & verification gaps

- Triples in §4 are observed on the **baseline** blob via probe fixtures; the HEAD/REV self-test run
  itself (`cases=7 passed=7`, mutation receipt red, `--rev valid=true`) is W2/main's verification and
  was deliberately not run by this seat (no duplicate verification of sibling work).
- The measured-side-absent-bytes row (§4, last derived row) is code-derived, not probed.
- Non-UTF-8 byte handling (§8.2) unprobed.
- Seat scratch `/fast/scratch/hyaku/tabi-r29/RevC1Gate` (baseline blob copy, probe script, fixture
  dirs) is removed after this report; all evidence is embedded above. Fixture repos were created only
  under seat scratch with `git -C <dir>` and `rev-parse --show-toplevel` verified before first commit;
  the lane tree, index, and jj state were untouched (read-only git only). No tools installed.
