# ReviewCounterInputs — round21 w2

## Axes

- **Input closure:** every blob read by the counter is declared and present at the measured revision.
- **Provenance binding:** the execution witness cited by the note is tied to the receipt and counted artifacts.
- **Revision binding:** the measurement uses the delivered revision's counter and evidence bytes.

## Findings

### HIGH — Observed HEAD omits the producer blob required for a clean count

At observed `HEAD` `1b5f449ad15525d281fda4558aeef1086f1e4a65`, `git status --short -- scripts/webmcp-lifecycle-round21.mjs` reports `?? scripts/webmcp-lifecycle-round21.mjs`, and `git ls-tree HEAD -- scripts/webmcp-lifecycle-round21.mjs` returns no blob. The counter declares that path as `PRODUCER` (`.ufo/waves/round-21/measure-c1.mjs:22,27`) and rejects an absent producer (`:47`). `filesAt` reads only blobs from the requested revision, not the working tree (`:106-111`). Since this HEAD contains the receipt and note, **[INFERENCE]** invoking the counter against this revision reaches `producer_digest` and cannot yield the target 12; the untracked worktree file cannot supply `get(PRODUCER)`. This finding is limited to the observed HEAD, not a later delivery commit. The producer must be present in the selected measured/delivered commit before measuring it.

### MEDIUM — The execution witness cited by the note is outside both input and serial identity binding

`corpus/knowledge/webmcp-nonautosubmit-round-21.md:2` identifies `.ufo/waves/round-21/runtime-execution-bounded.json` as the location of the producer and exact argv. But `measure-c1.mjs:27` omits that record from `INPUT_PATHS`; `filesAt` therefore does not load it (`:108-110`), and `evaluate` has no `get()` check for it (`:39-104`). The final serial checker also omits it from its `identity_paths` (`.ufo/waves/round-21/run-checks.py:58-65`). The current witness says `producerSha256=5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` and the receipt currently carries the same digest (`runtime-execution-bounded.json:11-12`; `receipt.json:4-6`), but that agreement is not enforced. **[INFERENCE]** changing the witness's producer hash, argv, or exit record while retaining the receipt/raw evidence would leave both the counter result and serial identity hash set unchanged. Bind and validate this witness if it is part of the provenance claim, or stop relying on it as counted provenance.

## Input-closure result

The counter's direct file reads are otherwise covered by its declared paths: producer, note, `SKILL.md`, `corpus/SOURCES.md`, `source-opening.json`, the decoded source body, and `PREFIX` (`measure-c1.mjs:22-27,39-104`). The receipt, each case `.json`, and each `.html` fixture are under `PREFIX`; `filesAt` recursively lists its blobs (`:108-110`). The expected/positive-ordered fixtures and selftest are harness inputs, not direct inputs to `evaluate`; `run-checks.py:58-65` includes the two fixture files and selftest/counter in its recorded artifact identity set.

## Residual risk and verification gaps

- No `lsp` device/server is exposed in the available tool inventory; no LSP status, references, definition, or diagnostics were available. Literal grep was used only to locate mentions; findings above are grounded in direct source and record reads.
- No counter, selftest, build, or other verification was run. The observed execution record says `measuredRevision: "uncommitted"` (`runtime-execution-bounded.json:3-4`), and `SCORECARD.md:975-984` declares the measurement but does not contain a measured/delivered result. No claim is made about a later commit or final serial run.
- No tools were installed or updated.

Report: `.ufo/waves/round-21/w2/ReviewCounterInputs.md`
