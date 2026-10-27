# RevNoHarm — scope review: frozen round-40 instruments vs baseline

Seat: RevNoHarm (leaf, read-only). Round 40, attempt 2. Freeze `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4`; baseline `a1b1e939048885d2793759b7f49b10c5c820d70d`. Question: do the frozen instrument additions only add round-40 evidence, without altering existing production scripts, corpus entries, or historical receipts?

Axes (godspeed): diff coverage (every changed file classified), classification accuracy (gated vs unguarded hunks), evidence completeness (exact commands/outputs below), non-mutation of the tree.

## Repo and commit identity

- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --show-toplevel` → `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- `git cat-file -t` on both SHA-256s → `commit` / `commit`.
- `git merge-base --is-ancestor a1b1e939 07e99cf` → ok; `BASELINE_IS_ANCESTOR_OF_FREEZE`.
- `git merge-base --is-ancestor 07e99cf HEAD` → ok; HEAD = `c925d9230c3f7908152fad7bc0f0dd1cdd9af45f`, 4 commits beyond freeze.
- Commits in `a1b1e939..07e99cf` (13, all message-prefixed `round-40:`): cb35339, ade9923, af86ec4, 1db426e, c130477, c2b8981, c451a3c, 046f63a, 8a387c0, bf6a7cf, c025690, 18bac4e, 07e99cf. No unrelated-branch commits enter the freeze.

## `git diff --name-only` (baseline → freeze), exact

`git diff --name-status a1b1e939… 07e99cf…` → 25 files: 22 `A`, 3 `M`, 0 `D`, 0 `R`, 0 type/mode changes.

Added (22 — all round-40 evidence or round-40 instruments):
```
.ufo/waves/round-40/assimilation/quarantine-slice
.ufo/waves/round-40/claims.json
.ufo/waves/round-40/controls/c1-measure-selftest-v2.json
.ufo/waves/round-40/controls/c1-round39-noop-v2.json
.ufo/waves/round-40/controls/c1-round39-noop.json
.ufo/waves/round-40/controls/c1-round39-replay-v3.json
.ufo/waves/round-40/controls/c1-selftest-v2.json
.ufo/waves/round-40/counters/c1-sample-span-v2.mjs
.ufo/waves/round-40/counters/c1-sample-span-v3.mjs
.ufo/waves/round-40/counters/c1-sample-span.mjs
.ufo/waves/round-40/counters/selftest-c1-sample-span-v2.mjs
.ufo/waves/round-40/gen-w1-spec.py
.ufo/waves/round-40/measure/census-start.txt
.ufo/waves/round-40/sources/S145-open.txt
.ufo/waves/round-40/sources/proc_pid_net.html
.ufo/waves/round-40/w1-dispatch.json
.ufo/waves/round-40/w1-plan.json
.ufo/waves/round-40/w1-spec.json
.ufo/waves/round-40/w1.ready
.ufo/waves/round-40/w1/swarm-registry.json
scripts/measure-c1-round40.mjs
scripts/selftest-measure-c1-round40.mjs
```
Modified (3): `LOG.md` (+27/−0), `SCORECARD.md` (+22/−0), `scripts/playwright-firefox-egress-round39.mjs` (+43/−19 — carries all 19 deleted lines of the whole diff). `git diff --numstat` for exactly these: `27 0 LOG.md`, `22 0 SCORECARD.md`, `43 19 scripts/playwright-firefox-egress-round39.mjs`.

## Historical receipts and corpus: untouched

No path under `corpus/` or under any earlier `.ufo/waves/round-*/` appears in the diff. In particular `corpus/evidence/round-39/playwright-egress/receipt.json` (the "before" artifact) is byte-identical at baseline and freeze. All round-40 additions live in `.ufo/waves/round-40/` or are new `scripts/*round40*` files.

## The only production-script modification: `scripts/playwright-firefox-egress-round39.mjs`

Hunk-by-hunk classification (file mode unchanged `100755`):

Gated behind a new `--round40` argv flag — legacy path byte-equivalent in behavior:
1. `SCHEMA`: `tabi-pw-firefox-egress-receipt-v2` preserved without the flag; `…-receipt-r40` only with it.
2. `observeSs`: flag-less branch keeps `sh('ss -Htnp 2>/dev/null')`; the `spawnSync` path is `ROUND40`-only.
3. `observeProc`: new `if (ROUND40 && nets.some(n => n === null)) return null;` (stricter both-surfaces requirement is flag-only); the `anyReadable` rewrite (`for…if` → `nets.some(n => n !== null)`) is equivalence-preserving without the flag.
4. `sampleSockets`: added `if (ROUND40 && (ss === null || pr === null)) return { unavailable: true };` before the unchanged both-null check.
5. `runOnce`: awaited `server.close(resolveClose)` and the ≥1000 ms sample-span enforcement loop are `if (ROUND40)`-guarded; legacy keeps fire-and-forget close and no span enforcement.
6. `portClosed`: strict fail-closed listening check is `ROUND40`-only; legacy expression `(sh(\`ss -ltn 2>/dev/null | grep -c ':${port} '\`) || '0') === '0'` preserved verbatim.
7. `main`: new `--scratch`/`--nonce` args; usage-exit condition `!out || (ROUND40 && …)` reduces to the old `!out` without the flag; scratch prefix `tabi-r39-pwegress-` preserved; receipt `runNonce`/`--round40` driver string and `{flag:'wx'}` write are flag-gated.

Unguarded changes (the only ones touching flag-less behavior):
- **pid regex**: `new RegExp(\`pid=(?:${tree.join('|')})[,\)]\`)` → `[,\\)]`. As RegExp-constructor source: old class `{, )}`, new class `{, \, )}`. For real `ss -Htnp` output (`pid=<digits>` followed by `,` or `)`), matching is identical; the added literal-backslash alternative cannot occur in that output. No-op escape hardening; no behavior change on real inputs.
- **additive `runNonce: null` field**: `runOnce` now always records `runNonce` (passed as `null` in legacy mode) into each run record, and the stdout summary gains `runNonce`. Legacy receipts/stdout gain one inert JSON field; control flow and all measured values unchanged. The historical round-39 receipt on disk is not regenerated.

No legacy code path changed its decisions, observations, exit codes, or outputs beyond that inert field.

## LOG.md / SCORECARD.md: pure appends

Both hunks are EOF-only additions (`@@ -2562,3 +2562,30 @@` and `@@ -2167,3 +2167,25 @@`, zero `-` lines). They add the round-40 claim narrative, freeze/amendment history, control receipts, and the declared-claim table. No prior ledger lines were edited or removed. Informational note for downstream seats: the SCORECARD table still names the superseded first-freeze counter (`cb35339` / `c1-sample-span.mjs`) because the ledger is append-only; the operative counting command per `.ufo/waves/round-40/claims.json` is `scripts/measure-c1-round40.mjs`, with the amendment recorded in later appended sections. Consistent with the append-only convention, not an alteration.

## Frozen-bytes pinning (post-freeze drift check)

`claims.json.frozenDigests` vs `git show 07e99cf:<path> | sha256sum` vs worktree `sha256sum` — all four match exactly:
```
scripts/measure-c1-round40.mjs                     a0e564c7…ca0735  (freeze == worktree)
scripts/selftest-measure-c1-round40.mjs            5a0b702d…13995d82  (freeze == worktree)
scripts/playwright-firefox-egress-round39.mjs      1f8a15f0…6994545b  (freeze == worktree)
.ufo/waves/round-40/counters/c1-sample-span-v3.mjs 0b452eac…02ef253c  (freeze == worktree)
```

Working tree: `git status --porcelain=v1 --untracked-files=no` → empty (zero tracked modifications); the 46 raw porcelain entries are untracked wave/lane files. Post-freeze commits (`250a380`, `df9f1b6`, `f8e89d7`, `c925d92`) touch only `.ufo/waves/round-40/{gen-w1-spec.py,w1-dispatch.json,w1-plan.json,w1-spec.json,w1/swarm-registry.json,measure/census-start-exit.txt}` plus LOG/SCORECARD appends — no production script, no corpus path.

## Diagnostics channel note

No `lsp` device is mounted in this session (not in the tool inventory; no server to query), so caller/definition checks were done by direct hunk inspection of the git diff, which for a scope review is the complete evidence surface. Recorded per protocol; no grep output is offered as semantic proof.

## Scope issues

- The production driver was modified, not bypassed — but the modification is the declared, digest-frozen round-40 mode, gated so legacy behavior is preserved except for the two unguarded deltas above (regex class widening that is input-equivalent; inert `runNonce: null` field). Neither affects corpus entries, historical receipts, counters, or the refusal behavior the claim relies on ("old" refers to the baseline state, which is unchanged).
- No deletion, rename, mode change, or earlier-round path appears anywhere in the diff.
- Scratch discipline: no scratch dir was created and nothing was written outside this report path; no `/tmp` files; no git/jj mutation (read-only porcelain only). Tool installs: none.

VERDICT ok — 25 changed files: 22 pure round-40 additions, 2 append-only ledger files, 1 gated production-driver amendment with two verified behavior-preserving unguarded micro-deltas; corpus entries and historical receipts untouched; frozen digests match freeze and worktree.

Report: .ufo/waves/round-40/w1/RevNoHarm/report.md
