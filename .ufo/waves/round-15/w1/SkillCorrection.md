# Round-15 w1 — SkillCorrection (author-side scoped audit)

- Seat: `TabiR15.SkillCorrection` (scribe, leaf). Read-only. No source, SKILL, lesson, SCORECARD or evidence edits. No gate, counter, test, suite or browser executed.
- Scope: round-14 SKILL Node enforced wording (`SKILL.md:1744`, registry `:1751-1762`) and the current trust-boundary supersession (`SKILL.md:1680-1686` superseded by `:1719-1727`).
- Tools installed or updated by this seat: none.
- Only digest/grep reads were run (`sha256sum`, `grep -c`, `grep -n`) to bind anchors. None of these is a gate or check.

## Axes

1. Enforcement-claim accuracy: does each "enforced / never enforced" statement match the code that ran?
2. Wording precision: are versions, enforcers and descriptive records attributed to the right artifact?
3. Supersession accuracy: does `:1719-1727` truly supersede `:1680` on the counting path, and is the scope anchored?
4. Test coverage: which claims lack a failure-capable fixture?

## Summary verdict

- **Trust-boundary supersession (`:1719-1727`): substantively verified.** No shell execution remains in the counting paths. Remaining defects are anchoring and placement only.
- **Node wording: one factual defect with routed-input impact.** The round-15 wording "historical producer never did" (`.ufo/waves/round-15/w1/spec.json:10`) and the round-14 routed item (`corpus/lessons/round-14-verifier-spotcheck.md:184`) are contradicted by the producer code. The producer does enforce `pin.node.minimumMajor`.
- **Node fixture coverage: gaps** in the checker's sidecar-node and pin-minimum paths.

## F1 — HIGH — "historical producer never enforced the minimum" is false

Anchors:
- `corpus/evidence/round-13/aria/aria-loopback.spec.mjs:262-270` — `assertPinnedRuntime()` includes `:269 expect(RUNTIME.nodeMajor).toBeGreaterThanOrEqual(PIN.node.minimumMajor);`
- `:923-924` — called unconditionally inside every case after the `LOAD_ERROR`/`SETUP_ERROR` guards (`:916-917`), phase `'runtime-pin'`.
- `:226-227` — `RUNTIME.nodeMajor` = major of `process.versions.node`.
- The only `PIN.node` read in the spec is `:269`. `pin.node.recorded` is never read by the producer (`grep` over the spec: one hit).
- `:241-259` `runtimePinStatus()` — `matched` covers playwright/chromium/browserVersion only; Node is excluded.
- Provenance: `sha256sum aria-loopback.spec.mjs` = `03cb4e17…e4fc`, equal to `corpus/evidence/round-13/aria/receipt.json:15` `specSha256`. The executed spec bytes contain `:269`. Pin `4d894756…ccd2` equals `receipt.json` `pinSha256` (`:37`, `:2208`).

Defective wording (all must be corrected append-only in round-15 artifacts; historical lessons stay immutable):
- `.ufo/waves/round-15/w1/spec.json:10` (MetadataEnforce prompt): "retrospective checker enforces minimum; historical producer never did."
- `corpus/lessons/round-14-verifier-spotcheck.md:129`: "the historical producer does not read pin.node."
- `corpus/lessons/round-14-verifier-spotcheck.md:184` (routed item 1): "the historical producer, which never enforces pin.node."

Correct statement (grounded):
- Producer: enforces `pin.node.minimumMajor` only (`:269` via `:924`). Never reads `pin.node.recorded`. Never checks exact equality. Node is outside the runtime pin match (`:245-259`).
- Checker: independently re-evaluates the minimum (`scripts/check-aria-metadata.mjs:441`, finding `R14-ARIA-NODE-MINIMUM-01` at `:476`). Reads `recorded` only as descriptive (`:431`, `:468-475`, sidecar check `:1027-1029`). Exact equality is not checked by either artifact.

Proposed fix: state the producer/checker split explicitly in the round-15 lesson and the SKILL append. Do not edit `round-14-verifier-spotcheck.md` in place.

## F2 — MEDIUM — `SKILL.md:1744` enforcer unattributed and missing spaces

- `SKILL.md:1744` (raw): "Report observed version, enforced minimum and descriptive record separately ... Original runtime26.12.0, descriptive24.21.0, minimumMajor20". `grep -c 'runtime26.12.0' SKILL.md` = 1, so the missing space is literal in the file.
- "enforced minimum" names no enforcer, so a reader cannot tell the producer (`:269`) from the checker (`R14-ARIA-NODE-MINIMUM-01`).
- No artifact pointers in the row. Anchors exist: `receipt.json:20` (`"node": "26.12.0"`), `runtime-pin.json:15` (`"recorded": "24.21.0"`), `runtime-pin.json:16` (`"minimumMajor": 20`).
- Same literal missing space appears in the historical `corpus/lessons/round-14.md:12` (`recorded24.21.0`, 2 hits). Historical, record only; do not edit.

Proposed replacement row (SKILL append, not a rewrite of `:1744` history if the policy requires append-only):

| observed Node differs from pin.node.recorded | Report observed version, the enforced minimum (producer `aria-loopback.spec.mjs:269` via `:924`; checker `R14-ARIA-NODE-MINIMUM-01`) and the descriptive record separately; neither artifact checks exact equality, so do not claim it | Original runtime 26.12.0 (`receipt.json:20`), descriptive 24.21.0 (`runtime-pin.json:15`), minimumMajor 20 (`runtime-pin.json:16`) |

## F3 — LOW/MEDIUM — sidecar note names no enforcer; the template is a determinism constraint

- `corpus/evidence/round-14/aria-metadata/corrected.json:58`: "node.minimumMajor=20 is the enforced floor" — unattributed.
- Generated by the derive template `scripts/check-aria-metadata.mjs:1258-1261`.
- The sidecar is digest-bound and historical. `--check` does not compare sidecar bytes to a recorded hash (`corpus/lessons/round-14-verifier-spotcheck.md:131`).
- Constraint for MetadataEnforce: changing the template changes what `--derive` emits. Any clarification must go to a fresh-path derived artifact (registry `SKILL.md:1755` write-scope), not to `corrected.json`.

## F4 — MEDIUM — Node fixture coverage gaps (proposed tests)

Visible Node fixtures (from `check-aria-metadata.mjs` self-test generation, `:1697-1763`):
- `receipt-min` (`:1697-1700`, node `18.20.0`): minimum red.
- `sidecar-exactnode` (`:1753-1757`): exact-equality claim red.
- `sidecar-wrongto`, `sidecar-baddigest`, `sidecar-auto`.

Not observed in the fixture lines read (lines `:1703-1740` were not read in full, so verify with `grep` before asserting absence):
- (a) sidecar `node.minimumMajorSatisfied` flipped while `observed` is intact. Checked at `:1024-1025`. Expected finding `R14-ARIA-SIDECAR-NODE-CLAIM-01`.
- (b) sidecar `node.descriptiveOnly` or `recordedRole` flipped. Checked at `:1027-1029`. Expected `R14-ARIA-SIDECAR-NODE-CLAIM-01`.
- (c) sidecar `node.observed` or `node.recorded` not equal to the receipt/pin. Checked at `:1012-1013`. Expected `R14-ARIA-SIDECAR-NODE-CLAIM-01`.
- (d) pin `node.minimumMajor` raised above observed (e.g. 27). Expected pin-digest finding (`:713`, `receipt.runtime.pinned.pinSha256`) before the minimum finding. The test must assert which finding fires, not just "red".
- (e) negative control: `R14-ARIA-NODE-RECORDED-01` stays `pass` when `exactMatch` is false (`:468-475`). This pins the descriptive-only design.

## F5 — trust boundary: supersession verified; anchoring defects

Verified (no shell on counting paths):
- `scripts/check-round-contract.mjs`: `git()` uses `spawnSync('git', args)` argv (`:59-60`). `treeLineCount` `git ls-tree -r --name-only <rev>` argv (`:415`). `grepLineCount` `git grep -h -e <pattern> <rev> -- <paths>` argv (`:433`). Revision 40-hex (`:313`, `:356`, `:430`). Path charset excludes `:`, `*`, `?`, `[`, leading `-`, `..` (`:361`). Pattern rejects leading `-` (`:369`).
- `scripts/check-user-round-contract.mjs`: argv `git` (`:96-97`); `TREE_COUNT` / `GREP_COUNT` 40-hex (`:345-346`); `GREP_PATH` (`:350`) and `countPattern` (`:352-359`); `--literal-pathspecs` plus `-e` (`:402`).
- No `shell: true`, `bash -c` or `exec` in the three gate scripts (grep: matches are comments only, `check-round:39-41`, `:331-342`; `check-user:339-344`).
- `SKILL.md:1719-1727` accurately describes this for the counting path.

Defects:
- (a) Placement: `:1680-1684` ("these legacy gates execute ... through a shell") remains unannotated in place, 39 lines above the supersession under a different heading. Add an in-place pointer under the round-13 paragraph (append-only).
- (b) Unanchored scope: "after the measured round14 cutover" names no revision. The shell-arm witness revision is `bebe2efc4565bb068efd905e9ef78011bb6b4efd` (`check-round-contract.mjs:42-43`). Name the cutover revision and the shell-arm revision in the supersession.
- (c) Residual (disclaimed, untested): git runs with inherited environment and repo-local config (`check-round:60`, `check-user:97,403`). [INFERENCE] inert for `ls-tree`/`grep`. Proposed negative control: a fixture with repo-local config setting a sentinel-writing hook-type option; assert no sentinel after a count. If it fails, the "argv-only" wording overclaims.
- (d) Latent: `grepLineCount` (`check-round:433`) has no `--literal-pathspecs`. Currently unreachable because `countPath` excludes glob/magic characters. Proposed test: `:(glob)*` as a path operand must be `score_mismatch`, so a future charset widening fails.

## Proposed tests (summary)

1. Pin-minimum mutation (`pin.node.minimumMajor` = 27): expects the pin-digest finding first (F4d).
2. Sidecar `minimumMajorSatisfied` flip: expects `R14-ARIA-SIDECAR-NODE-CLAIM-01` (F4a).
3. Sidecar `descriptiveOnly` / `recordedRole` flip: expects `R14-ARIA-SIDECAR-NODE-CLAIM-01` (F4b).
4. Sidecar `node.observed` / `node.recorded` mismatch: expects `R14-ARIA-SIDECAR-NODE-CLAIM-01` (F4c).
5. Descriptive-only control: `RECORDED-01` pass with `exactMatch` false (F4e).
6. Git-config inert control for counts (F5c).
7. Glob-pathspec rejection for the round grep path (F5d).

## Commands L1 should run (not run by this seat)

- `node scripts/check-aria-metadata.mjs --self-test`
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json`
- `node scripts/check-round-contract.mjs --self-test`
- `node scripts/check-user-round-contract.mjs --self-test`
- Doc-consistency (read-only): `grep -n "never did\|does not read pin.node\|never enforces pin.node" .ufo/waves/round-15/w1/spec.json corpus/lessons/round-14-verifier-spotcheck.md SKILL.md`
- Re-derive digests after any edit: `sha256sum corpus/evidence/round-13/aria/aria-loopback.spec.mjs corpus/evidence/round-13/aria/runtime-pin.json`

## Out of scope / not touched

- Counter-diagnostic, mirror, sidecar-identity and tamper-classification items (routed items 2-4 of `round-14-verifier-spotcheck.md`): not assessed here.
- `corpus/lessons/*`, `SKILL.md`, `SCORECARD.md`, `LOG.md`, evidence and sibling directories: not edited.
- No tool installs. No pacman, uv or npm actions.

## Messages sent

- `TabiR15.MetadataEnforce` (code-related, exact known id from spec): F1, F3, F4 pointers.
- `TabiR15` (L1 planner): report path and F1 wording correction.
