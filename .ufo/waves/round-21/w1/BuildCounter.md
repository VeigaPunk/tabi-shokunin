# BuildCounter — round21 C1 counter

Seat: `TabiR21.BuildCounter`, executor/leaf. Production change was made only in the assigned `clones/BuildCounter` clone. That directory was empty at intake, so I created it from baseline `e7cf11a810003d4a65cc85bd265f2c17dd65b738`; no lane production files or lane Git index were changed. No tools were installed or updated.

## Files and commit

- `.ufo/waves/round-21/measure-c1.mjs` in the assigned clone; commit `3fa97a9f061ca2904ee9b93d0fcbcc1f9192eb27` (`3fa97a9`); SHA-256 `d24abd2626dc9f721aeebafa05f58d3aee819b35bbadabffdf6d3855b6cb1997`.
- Advisory report: `.ufo/waves/round-21/w1/BuildCounter.md`.

## Behavior implemented

- Exports pure `evaluate(files)`, `INPUT_PATHS`, `FINDINGS`, and fixed-case constants (`IDS`, `CASE_PLAN`, `PREFIX`, `PRODUCER`, `NOTE`). `INPUT_PATHS` includes the full runtime prefix tree, producer, note, `SKILL.md`, source registry and reopened S100 artifacts.
- CLI reads only full-40-hex revision Git blobs with direct `spawnSync('git', …)` calls, `shell:false`, and a minimal Git environment; it does not read the worktree or execute browser/runtime code. `--selftest` invokes sibling `selftest-c1.mjs`.
- Both note and receipt absent yield baseline metric 0/exit 0. Partial or malformed committed evidence and any stable finding yield metric 0/exit 1; input/Git evaluation errors yield exit 2. Only an exact, clean fixed-12 set can produce 12.
- Checks the complete producer SHA-256 against its committed blob, pinned Node/Chromium/Playwright and exact feature flags, receipt-wide cleanup, exact case ID set and fixed `{autosubmit, action, mode}` scenario plan, unique per-case nonces, fixture-derived `toolautosubmit`, fixture/evidence digests, raw `WebMCP.invokeTool` send plus matching result/error command, invocation-ID-correlated `toolInvoked`/`toolResponded`, finite positive pre-action/after windows, raw frame/page-observation order, summary-to-evidence consistency, per-case context/process cleanup and empty blocked/download records.
- Checks that the note names all 12 IDs and S100, SKILL references the note, and the registry links S100 to the note. No lifecycle status, source-branch outcome, or navigation-as-submit classifier is encoded. `formActive` is compared only with the direct pre-action observation; it is not interpreted as focus/pause success. Navigation summaries are independently derived from `Page.frameNavigated` frames.

## Exact retained evidence inspected

- `corpus/evidence/round-21/runtime/receipt.json` declares schema `tabi-round21-runtime-v1`, producer blob digest `a273fe77161bf6b29e1f98efbb4568d615fe1aa8109e3cb6a33dc0070f905c3d`, environment `v24.21.0` / `154.0.8037.97` / `1.64.0`, and cleanup flags true. Its fixed IDs are `na-pending`, `na-click`, `na-requestsubmit`, `na-native-submit`, `na-reset`, `na-remove`, `na-reject`, `na-throw`, `na-delayed`, `na-invalid-submit`, `auto-positive`, and `auto-invalid`.
- Per-case records and served fixture files are retained under `corpus/evidence/round-21/runtime/<id>.json` and `<id>.html`. Inspected examples included `na-pending.json` (pre-action observation and zero correlated response summary), `na-click.json` (raw outbound command/result), `auto-positive.json` (matching response ID and nonce-bearing output), and `na-native-submit.json` (separate navigation and response evidence). Counter implementation validates all twelve from Git blobs; no counter invocation was run here.
- Reopened source metadata is `.ufo/waves/round-21/source-opening.json` (`sourceId:S100`, Chromium tag URL) and `.ufo/waves/round-21/sources/html_form_element.cc`, decoded SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`; `corpus/SOURCES.md` records S100 and the round21 note. These support upstream source interpretation only, not equivalence to the Arch Chromium binary.
- Documentation inspected: `corpus/knowledge/webmcp-nonautosubmit-round-21.md` and `SKILL.md`'s round21 note pointer.

## Risks and blockers

- No tests, builds, linters, formatters, selftest, or counter execution were run during this wave; L1 owns serial post-integration verification.
- `preAction.formActive` remains an observed pseudo-state only. The source metadata check does not establish focus/pause acknowledgement or bind every scenario's interpretation to S100 anchors; in particular reset/removal remain observation-only under the registered anchor bounds. Semantic review remains separate.
- Counter consistency/digests do not provide an out-of-band freshness challenge; a self-consistent replayed bundle is not independently proven fresh. No challenge input was part of this assignment, so this implementation does not claim anti-replay protection.
- A clean count, source-to-runtime binary equivalence, universal WebMCP semantics, and actor quiescence are not claimed.

— `TabiR21.BuildCounter` · trailer relative to lane root: `.ufo/waves/round-21/w1/BuildCounter.md`
