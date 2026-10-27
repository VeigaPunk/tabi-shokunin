# RevNoHarm — scoped findings (milestone: scope-review)

Freeze `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4` vs baseline `a1b1e939048885d2793759b7f49b10c5c820d70d`, repo `tabi-shokunin`. Full evidence: .ufo/waves/round-40/w1/RevNoHarm/report.md

- `git diff --name-status`: 25 files — 22 `A` (all under `.ufo/waves/round-40/` or new `scripts/*round40*`), 3 `M`, 0 `D`/`R`/mode changes.
- Modified pre-existing files: `LOG.md` +27/−0 and `SCORECARD.md` +22/−0 (EOF-only appends, zero deleted lines — no prior ledger text altered); `scripts/playwright-firefox-egress-round39.mjs` +43/−19 (sole production-script change, carries all 19 deletions).
- Driver amendment analysis: all new behavior (`-r40` schema, spawnSync ss, both-surfaces requirement, unavailable short-circuit, awaited close, ≥1000 ms span enforcement, strict port closure, `--scratch`/`--nonce`, `wx` write, nonce-bound receipt) is gated on the `--round40` flag; legacy paths preserved. Two unguarded deltas, both verified behavior-preserving: (1) pid regex class `[,\)]`→`[,\\)]` adds a literal-backslash alternative that cannot occur in real `ss -Htnp` output (input-equivalent); (2) legacy receipts/stdout gain an inert `runNonce: null` field (additive; no decision or measured value changes).
- Corpus/historical receipts: no `corpus/` or pre-round-40 `.ufo/waves/` path in the diff; `corpus/evidence/round-39/playwright-egress/receipt.json` untouched.
- Digest pinning: all four `claims.json.frozenDigests` match `git show 07e99cf:<path>` sha256 and current worktree sha256 (no post-freeze instrument drift); zero tracked worktree modifications; the 4 post-freeze commits touch only round-40 wave metadata + log appends.
- Baseline is ancestor of freeze (13 commits, all `round-40:`-prefixed); freeze is ancestor of HEAD `c925d92`.
- No lsp device mounted this session; hunk-level git inspection used as evidence surface.
- No scratch created, no writes outside this seat's report paths, no git/jj mutation, no tool installs.

Scope issues: none blocking. Informational: SCORECARD's frozen table still names the superseded first-freeze counter (`cb35339` / `c1-sample-span.mjs`) per append-only convention; operative command per claims.json is `scripts/measure-c1-round40.mjs`.

VERDICT ok — additions only; corpus entries and historical receipts unaltered; sole production change is the digest-frozen gated round-40 mode with two verified behavior-preserving micro-deltas.
