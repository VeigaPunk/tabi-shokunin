# Round 19 W1 — C2 mutant evidence

## Result

The B round-18 counter credits both routed H4 mutant shapes. The mutants, runnable commands and captured outputs are committed only under `.ufo/waves/round-19/c2-mutants/` in the seat clone. No tools were installed or updated.

## Pasted-record mutant

- `pasted-record/pasted-receipt.json` is a verbatim copy of `corpus/evidence/round-18/webmcp-invoke/receipt.json`; both SHA-256 values are `43b3711eba135b6558df595637435acb0d3500519317bfeaa285da805af2e376`.
- Probe command: `node /fast/scratch/tabi-r19/ExecC2Mutants-4/.ufo/waves/round-19/c2-mutants/pasted-record/run-h4.mjs` (argv contains that executable only); exit 0.
- Captured stdout is exactly retained in `pasted-record/results.json` and printed in `pasted-record/README.md`. It reports `verdict=pass`, coverage `pass=true` (11/11 required cases, 4/4 controls; download case passing), and `h4.pass=true` against the copied receipt. Executed counter SHA-256: `99ad9ff7ca664eaa3e64948308a53d1827e34983ce874c8b26f6e5dc6a49e4dc`.
- This is an isolated execution of the exact B `retainedCoverage` and `h4Hazard` function bodies, not a browser run; the result explicitly records that no browser-execution evidence was supplied. It demonstrates the H4 predicate itself credits the pasted record, not a full-counter pass.

## UUID-artifact mutant

- Counter command: `node /fast/scratch/tabi-r19/ExecC2Mutants-4/.ufo/waves/round-18/measure-c2.mjs 66251bfc1aef393e4aec599e950a8deb867736bb --worktree-artifact /fast/scratch/tabi-r19/ExecC2Mutants-4/.ufo/waves/round-19/c2-mutants/uuid-artifact/webmcp-invoke-round19.mjs`; observed completed exit 0.
- Exact counter stdout/results JSON is retained in `uuid-artifact/results.json` (7,212 bytes including final LF; SHA-256 `abad03563f553e56748af291e3fa443d6365c703301d5d2176b143713e5455d0`) and summarized in `uuid-artifact/README.md`. It reports `c2_hazards_closed=5`, coverage `pass=true`, and `h4.pass=true` even though stderr records a new GUID-named file under `processTmpDir/playwright-artifacts-<random>/` with the real download fixture marker bytes. H4's explanation reports `fixture files seen live=0, present after run=0`: those counts are the suggested-filename filter results, not a count of every file.
- The wrapper injects the marker file after the round-18 harness records its before/after scans. It deliberately emulates the Playwright artifact directory/GUID layout; it does **not** claim Chromium/Playwright itself created the file. This isolates the counter's filename-only blind spot while preserving the real browser run and original refused-download receipt. Runtime identity in the counter output: Chromium 154.0.8037.97, Playwright 1.64.0, Node 24.21.0. The unrelated H2 watchdog subprobe did not fire, so this is H4 red-before evidence, not a claim that every round-18 hazard passed.

## Round-18 counter shapes not tested

- Signals: `measure-c2.mjs:1085-1090` launches the default H1 run and one explicit `signal: 'SIGINT'` run. `:730-735` defines H2's signal trigger solely from that SIGINT probe. There is no SIGHUP probe or SIGHUP-specific predicate. The default H1 signal is SIGTERM (`:363-369`).
- F6: `:885-908` creates a detached off-branch commit and invokes the wrapper with `--rev HEAD` (`:896-900`), then checks `--dry-run` prints the master tip (`:901-907`). The off-branch hash is only used to set up detached HEAD; the wrapper is never invoked with `@`, `master`, a short hash, or that off-branch full hash. The self-test likewise covers only master dry-run and HEAD rejection (`:1463-1464`).

## Source anchors and hashes

- `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs`, lines 730-743, 773-816, 885-908, 1085-1090, 1463-1464; accessed 2026-10-21; SHA-256 `99ad9ff7ca664eaa3e64948308a53d1827e34983ce874c8b26f6e5dc6a49e4dc`.
- `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs`, lines 1652-1662; accessed 2026-10-21; SHA-256 `d1443344c745a3e60417e19edf3d173054e085b912fa0ba1b58943d407896baa`.
- `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/webmcp-invoke/receipt.json`; accessed 2026-10-21; SHA-256 `43b3711eba135b6558df595637435acb0d3500519317bfeaa285da805af2e376`.

## Isolation

- Clone: `/fast/scratch/tabi-r19/ExecC2Mutants-4`
- Branch: `r19/ExecC2Mutants-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `5538d6223715e123597949ce7fb51e3f98c40779`
- Changed paths: `.ufo/waves/round-19/c2-mutants/pasted-record/README.md`, `.ufo/waves/round-19/c2-mutants/pasted-record/pasted-receipt.json`, `.ufo/waves/round-19/c2-mutants/pasted-record/results.json`, `.ufo/waves/round-19/c2-mutants/pasted-record/run-h4.mjs`, `.ufo/waves/round-19/c2-mutants/uuid-artifact/README.md`, `.ufo/waves/round-19/c2-mutants/uuid-artifact/results.json`, `.ufo/waves/round-19/c2-mutants/uuid-artifact/webmcp-invoke-round19.mjs`.
