# HistoricalSourceIndex — S029 identity audit (round 15, w1)

Author-side, read-only audit. Not a non-author certification. No gate, counter, selftest, suite, census or browser was executed. No source, registry, lesson or evidence file was edited. Digests were computed with `sha256sum` and one inline `node -e` hash of key-sorted JSON (the checker's `stableStringify` form, reimplemented, not the checker).

## Scope

Index: `corpus/evidence/round-15/source-index.json` (uncommitted), `corpus/SOURCES.md` S029 row (working tree, uncommitted), `corpus/lessons/round-14.md` (committed, immutable).
Immutable machine evidence: `corpus/evidence/round-13/aria/{receipt.json,runtime-pin.json,manifest.json,aria-loopback.spec.mjs,playwright.config.mjs}`, `corpus/knowledge/aria-loopback-round-13.md`, `corpus/evidence/round-14/aria-metadata/{corrected.json,verification.json}`, producer `scripts/aria-loopback-round13.mjs`, checker `scripts/check-aria-metadata.mjs`.

## Verified identities (match, no defect)

| Claim | Anchor | Observed |
|---|---|---|
| S029 commit pin | `SOURCES.md:43` "committed at 837b33a3…" | `git cat-file` ok; receipt blob at 837b33a = `b458b351…a1989b7`; HEAD and worktree identical; `git log --all -- receipt.json` lists only 837b33a (unchanged since) |
| receipt sha in index | `source-index.json` historicalReceipt.sha256 | `b458b351…a1989b7` = blob at 837b33a = sidecar `original.receipt.sha256` = sidecar `binding.receiptSha256` |
| anchor path | `receipt.json:2529` | `cleanup.server.perWorker[0].listeningAfter` = `false` |
| aggregate | `receipt.json:2521` | `cleanup.server.listeningAfter` = `true` (contradiction the lesson describes) |
| quote | `receipt.json:2529` | `"listeningAfter": false` present |
| Node fields | `receipt.json` `.runtime.node`, `runtime-pin.json` `.node` | `"26.12.0"`; `{"recorded":"24.21.0","minimumMajor":20}` |
| pin sha | sidecar `pinSha256` | `4d894756…cd16ccd2` = file on disk = blob at 837b33a |
| note sha | `receipt.noteSha256` | `a720f541…c27128c9` = worktree = blob at 837b33a |
| producer sha | `receipt.sourceSha256`, sidecar `producer.sourceSha256` | `1d54c9e9…e4af9c` = `scripts/aria-loopback-round13.mjs` on disk |
| spec / config / manifest | receipt `.source.specSha256`, `.source.configSha256`, sidecar `source.manifest` | `03cb4e17…d7e4fc`, `87ae779b…707b3f4`, `56764241…0d72112`, all match on disk |
| worker proof set | sidecar `binding.proofSetSha256` | recomputed `49e64adb…6c6633` (node, sorted-key JSON) = recorded |
| worker proof 0 | sidecar `binding.perWorker[0].sha256` | recomputed `3fec21b5…f4` = recorded |
| sidecar sha | `verification.json` `sidecar.sha256` | `e156b922…a56745` = `corrected.json` on disk |
| checker sha | `verification.json` `checkerSha256` | `ef373872…3f6` = `scripts/check-aria-metadata.mjs` on disk; last change e570380 = `codeRevision` |
| Registry counts (manual read, not a counter) | `SOURCES.md` table | 29 rows; A23/B4/C2; mined24/queued3/rejected2 — matches lesson |
| Producer inversion | producer `:605` | `listeningAfter: serverProofs.every(p => p.listeningAfter === false)` stores `true` when all proofs are false — matches checker header and sidecar `correction` |
| Producer pin scope | producer `:390–402`, `:487` | pin match covers playwright, chromium, browser version only; `pin.node` never read; `node` is `process.versions.node` (`:92`, `:405`) — round-15 index boundary claim "historical producer never enforced pin.node" is true |
| Checker node floor | checker `:95`, `:431–441`, `:476` | `minimumMajor` enforced retrospectively; `exactMatch` computed separately |

## Defects / gaps

**D1 — wording contradiction in `source-index.json` `boundary` (medium).**
Text: "Original corrected sidecar note is retained unchanged and superseded by this qualification." The round-14 sidecar `corrected.json` is not superseded: `corpus/README.md` round-15 section says "The round14 correction remains the same historical sidecar and input pair," and the checker only re-evaluates it. The phrase also mixes "note" (`corpus/knowledge/aria-loopback-round-13.md`, sha `a720f541…`, unchanged) with "sidecar". Fix in the uncommitted index (not immutable): replace with "round14 `corrected.json` (sha `e156b922…`) and the round13 note (sha `a720f541…`) are retained unchanged; the round15 checker adds stricter mirror checks without rewriting either."

**D2 — index carries one anchor; registry carries three (medium).**
`SOURCES.md:43` anchor cell names `cleanup.server.perWorker[0].listeningAfter`, `runtime.node` and `pin.node`. `source-index.json` `historicalReceipt.anchor` names only the first. The Node fields are only in prose (`boundary`). Fix: add `runtime.node` (`26.12.0`) and `pin.node` (`recorded 24.21.0`, `minimumMajor 20`) as JSON-pointer entries with values, or state explicitly that the index is cleanup-only.

**D3 — the quote is not unique in the receipt (low).**
`"listeningAfter": false` occurs at `receipt.json:656` (`server.perWorker[0].proof`), `:2529` (`cleanup.server.perWorker[0]`), and `"listeningAfter": true` at `:2521`. The index is correct only because the pointer disambiguates. Any tool that matches the quote alone would pass on `:656`. Keep the pointer as the authority; add a note that the quote is a secondary witness.

**D4 — S029 identity is not machine-checked (medium).**
- `scripts/check-sources.mjs:324` requires only a non-empty anchor. The commit `837b33a…` and the blob sha are never compared with anything.
- `scripts/check-sources.mjs:322` accepts `on-change` only through the date/`Nd` regex; `365d` passes.
- No file under `corpus/evidence/round-14/` contains the id `S029` (grep: 0 hits in all round-14 JSON). The round-14 sidecar cannot be edited without breaking its own digest checks, so the link from the sidecar to the registry row is one-way and prose-only.
- `corpus/evidence/round-15/source-index.json` is referenced by no script (grep of `scripts/check-aria-metadata.mjs` returns nothing for `source-index` or `round-15`).
Proposed tests are T1–T3 below.

**D5 — forward reference to a missing lesson (integration, low).**
Uncommitted `SOURCES.md:43` used-by now reads `corpus/lessons/round-14.md, corpus/lessons/round-15.md`. `corpus/lessons/round-15.md` does not exist yet. `check-sources` `used_by_missing` (fixture `used-by-missing`, `scripts/check-sources.mjs:431`) and the used-by citation rule (fixture `used-by-uncited`, `:433`) will fail until L1 writes the lesson and it names `S029`. Owner: L1.

**D6 — ambiguous sidecar correction fields (low, documentation only).**
`corrected.json` `correction.corrected: false`, `correction.derived: false`, `corrections[0].derived: false`, next to `qualified: true` and `corrections[0].to: false`. Reading from `check-aria-metadata.mjs:997` ("correction.derived must equal cleanupDerived.listeningAfter"), `derived` is the derived boolean value, not a provenance flag. `corrected` appears to mean "historical receipt field rewritten" (false). The round-14 lesson says "the qualified corrected field is false." The sidecar cannot be edited; a glossary line in `corpus/QUALITY.md` or `corpus/README.md` (uncommitted, L1-owned) would remove the ambiguity.

**D7 — stale premise in the lesson (informational).**
`corpus/lessons/round-14.md:19` says S029 "C2 cites S029". The sidecar cites no id, and the checker does not read S029. The claim is true only as author prose. It should not be cited as machine linkage.

## Proposed tests (not executed)

- **T1 (S029 commit identity):** parse the 40-hex commit from `SOURCES.md` S029 anchor; `git show <commit>:corpus/evidence/round-13/aria/receipt.json | sha256sum` must equal `source-index.json` `historicalReceipt.sha256` and sidecar `original.receipt.sha256`. Expected pass now (`b458b351…a1989b7`). Negative fixture: one byte flipped → fail.
- **T2 (pointer-first quote):** resolve `cleanup.server.perWorker[0].listeningAfter` in the receipt; it must be `false`, and the text `"listeningAfter": false` must appear on that pointer's line. Negative: the aggregate pointer `cleanup.server.listeningAfter` must not satisfy the quote (it is `true`). Also assert that `server.perWorker[0].proof.listeningAfter` is not accepted as the S029 anchor.
- **T3 (anchor-field coverage):** the index must carry every pointer named in the S029 anchor cell (`runtime.node`, `pin.node`, plus the cleanup pointer), with values `26.12.0`, `24.21.0`, `20`.
- **T4 (used-by closure, after L1 lands):** `corpus/lessons/round-15.md` exists and contains `S029`; the index `boundary` contains no "superseded" for `corrected.json`.
- **T5 (sidecar binding reproduction):** recompute `binding.proofSetSha256` and `binding.perWorker[0].sha256` from the receipt with the checker's key-sorted `JSON.stringify(…, null, 2)+"\n"` form. Both reproduced here (`49e64adb…`, `3fec21b5…`), so the test should pass on the committed bytes; the negative mutation is a changed `listeningAfter` in a copy.

## Commands and tools

Read-only: `git cat-file -t`, `git show <commit>:path`, `git log --all -- path`, `git ls-files`, `git status`, `git diff`, `sha256sum`, `stat`, `jq` (existing `~/.local/bin/jq`), `node -e` (existing, hashing only), `grep`/`read` on the files above.
Not run: `check-sources.mjs`, `check-aria-metadata.mjs`, `check-user-round-contract.mjs`, `check-round-contract.mjs`, `check-freshness.mjs`, `sources-census.sh`, any `measure.mjs`, any Playwright/browser.
Tools installed or updated: none.

## Limits

- Not verified: round-15 uncommitted edits in `SOURCES.md`, `README.md`, `QUALITY.md`, `SKILL.md` beyond the S029 row and the README section; QUALITY20 wording; checker behaviour under mutation (not run).
- `binding` digests reproduce with my reimplementation of `stableStringify`; that matches the checker source at `scripts/check-aria-metadata.mjs:156` and `:908–911`, not a checker execution.
- No independent non-author verdict. Author-side only.

## Routing

- Code-related follow-ups (T1–T3, D4 checker coverage) belong to the metadata/source-checker owners. I did not message any peer by a guessed id; the exact ids for `MetadataEnforce` and `CounterDiagnostics` are not in my roster.
- Docs/registry follow-ups (D1, D2, D5, D6): L1 owns `SOURCES.md`, `README.md`, `QUALITY.md`, `LOG.md`, `SCORECARD.md`, `SKILL.md`, and the round-15 lesson.
- Checks for L1 to run after integration: `node scripts/check-sources.mjs` (structure, expect E11 until D5 is fixed), and the T1–T5 commands above, once implemented.
