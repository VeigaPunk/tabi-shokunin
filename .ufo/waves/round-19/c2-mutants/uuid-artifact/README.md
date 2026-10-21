# Playwright GUID-artifact H4 mutant

## Red reason

The wrapper runs the round-18 browser harness at B and injects the real download fixture's marker bytes into a GUID-named file at `processTmpDir/playwright-artifacts-<random>/`, after the harness has recorded its before/after marker scans. This is a deliberate deterministic file-system mutant using the real attempted-download payload; the file is wrapper-created in Playwright's artifact directory/GUID naming convention, not claimed to be a browser-generated download. Round-18 H4 still passes because it only classifies files whose basename matches the suggested download filename (or numbered duplicate), and ignores the new GUID file.

## Command and observed output

Exact argv: `node /fast/scratch/tabi-r19/ExecC2Mutants-4/.ufo/waves/round-18/measure-c2.mjs 66251bfc1aef393e4aec599e950a8deb867736bb --worktree-artifact /fast/scratch/tabi-r19/ExecC2Mutants-4/.ufo/waves/round-19/c2-mutants/uuid-artifact/webmcp-invoke-round19.mjs`

Exit: **0**. The complete observed stdout/results JSON is retained byte-for-byte in `results.json` (7,212 bytes including the final newline; SHA-256 `abad03563f553e56748af291e3fa443d6365c703301d5d2176b143713e5455d0`). It reports `c2_hazards_closed: 5`, `hazards.h4.pass: true`, and H4's explanation ends `fixture files seen live=0, present after run=0` despite the retained artifact path below.

The counter captured this artifact path on its normal run stderr: `/tmp/mc2-n-1Z1F7k/tabi-r18-webmcp-invoke-process-WmHXvw/playwright-artifacts-f7822bd12af45a7a564b0251b3ed5039/6ad0bf683975ecb02435617b10af6732` (GUID `6ad0bf683975ecb02435617b10af6732`, marker SHA-256 `a1c182ad1fc0597bda6908727b455437157d59cab64a8469af7c9833bea31983`).

The counter's unrelated H2 watchdog subprobe did not fire (`watchdog=false`), so this mutant closes H4 only as the assigned red-before demonstration; it does not claim the entire round-18 counter passes.
