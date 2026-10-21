# ReviewIdentity — round21 receipt identity first-falsification

## Finding — Medium: counter accepts incomplete or forged runtime flags

**Failure shape (static; not executed):** Keep the current `node`, `chromium`, and `playwright` strings, case evidence, and all other receipt fields unchanged, but replace only `receipt.environment.flags` with `["--enable-features=DeclarativeWebmcp"]`. The canonical counter's environment predicate at `.ufo/waves/round-21/measure-c1.mjs:42-43` checks the three version strings and only requires that some flag contain the substring `DeclarativeWebmcp`. It does not require the complete configured flags, nor does a later counter path re-check them. This mutated receipt therefore evades the environment finding even though it omits the remaining required WebMCP/Blink features and the loopback host-resolver rule. If all other required blobs are clean, the fixed-12 metric can be credited for a run whose environment summary contradicts the contract.

**Evidence:** The round21 contract requires the pinned Chromium/Playwright/Node runtime and the round19 flags. Round19's producer names all four required features, both Blink features, and the host-resolver denial at `scripts/webmcp-validation-round19.mjs:44-52`; its retained runtime receipt records the actual flagged launch arguments at `corpus/evidence/round-17/webmcp-invoke/receipt.json:31-39` and effective argv thereafter. The current canonical round21 receipt presently records the full configured list at `corpus/evidence/round-21/runtime/receipt.json:8-17`, but the counter does not enforce that list.

**Minimum acceptance:** Make the counter reject any missing, altered, duplicated, or unexpected environment flag by matching the complete pinned round21 flag list (currently the exact four entries in `corpus/evidence/round-21/runtime/receipt.json:12-16`), or validate a complete captured effective-argv record. A substring-presence check is insufficient.

## Current identity observations (not a counter-admission claim)

The current acquisition record names `scripts/webmcp-lifecycle-round21.mjs` and SHA-256 `847d046710a0dd5e61d966f4cb985052bca1966c75481a16d9cc931aa3a786d4` at `.ufo/waves/round-21/runtime-execution-final.json:5-12`. The current canonical receipt records the same relative path and digest, plus Node `v24.21.0`, Chromium `154.0.8037.97`, Playwright `1.64.0`, and the flags above at `corpus/evidence/round-21/runtime/receipt.json:4-17`. A direct file hash read returned that same digest for the current root producer. The producer code checks `process.version` at `scripts/webmcp-lifecycle-round21.mjs:78-80`, checks Playwright package version during resolution at `:33-43`, and obtains and checks `browser.version()` at `:118-121`. No path/hash or version-string mismatch is observed among those current artifacts.

Older runtime acquisitions are not current inputs: `.ufo/waves/round-21/history/index.json:2-18` classifies v1/v2 as historical and the root `runtime-execution-final.json` as the current qualified acquisition. Relevant prior evidence reviewed: round17's runtime identity receipt (`corpus/evidence/round-17/webmcp-invoke/receipt.json:1-29`), round19's declarative-validation note and receipt, and round20's source-scoped lifecycle note/lesson. Round20 adds no new runtime observation.

## Residual risk and verification gaps

- `runtime-execution-final.json:3-4` records baseline revision `e7cf11a810003d4a65cc85bd265f2c17dd65b738` and `measuredRevision: "uncommitted"`. Thus the observed producer digest is aligned with the current working-tree file and receipt, but this review cannot establish that it matches the producer Git blob at the eventual measured commit. Final measurement must bind the receipt digest to that commit's blob.
- An LSP device/status was unavailable (`xd://lsp` returned “No such tool”); the required references/definition/diagnostics requests could not be made. File reads provide the cited evidence; no grep result is treated as semantic proof.
- No checks, tests, or browser execution were run; this is a static bounded review.

Report: `.ufo/waves/round-21/w1/ReviewIdentity.md`