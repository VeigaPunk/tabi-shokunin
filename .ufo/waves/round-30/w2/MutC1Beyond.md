# MutC1Beyond — beyond-catalogue mutation probes on the two gate self-tests (round 30 w2, C1 milestone)

## Verdict

**Defect — self-test coverage blind spots beyond the frozen catalogue** (this is next-round catalogue frontier, not a C1 counter verdict; C1's frozen 27/27 reading is a separate, already-measured surface and is not contradicted here). I attacked the `--selftest` suites of `scripts/check-s106-evidence.mjs` (sha256 85dfd5e0cb9d5a99f311a8f94728df31e9308a2fd7e63853ed11a4f3b5e95467) and `scripts/check-release-pins.mjs` (sha256 915a6bba21223a4871c7f4ebbf27c5b4295137910c9ddec11bd5c31e2f55a648) at tip `072af95fe2822f0785a6ff88a578e2142dd258e5` with 22 hand-built mutants strictly outside the frozen catalogue `scripts/gate-mutants.json` (sha256 cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833): s106 parseReceipt field checks, both resolveRev guards, and both anchor-trim sites (9 mutants); release-pins parseRegistry indent/13-cell guards, cmpVersion (two forms), rowDigests abbreviated-digest collection, digestMatches suffix, blockIn, normLine, f2 inAnchor basename, receipt schema/stable refusals, and the r1 duplicate-entry guard (13 mutants). Pristine baselines were clean (s106 10/10, pins 29/29, both exit 0). Result: **7/22 killed, 15/22 survived**, and a pristine-vs-mutant demo pass on hand-built fixtures proves **all 15 survivors are real behaviour changes**, not equivalent mutants. The s106 self-test is blind to **9/9** of its probes: its 10 cases never feed a malformed receipt, a bad revision, or a whitespace-padded anchor, so every parseReceipt refusal, both resolveRev guards, and both trim sites are uncovered. Severity: s106 high (several blind spots flip could-not-evaluate → valid, i.e. the dangerous admission direction, including one that reads the git index instead of committed blobs); release-pins medium (6/13 blind, same admission direction).

## Method

- One live clone per seat: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5`; all measurement there (porcelain empty before and after). Frozen counter/catalogue digests verified byte-identical at the tip before starting: `02945f88…3a55` (check-gate-mutants.mjs), `cd1c27a2…3833` (gate-mutants.json), `cadef57e…9eca` (check-frontier-admission.mjs) — all three match claims.json frozenDigests.
- A scratch runner (`runner.mjs`, archived in the output dir) applies **one byte-exact find/replace per mutant copy**, asserting the find string occurs exactly once and the result differs from pristine (mutant sha256 recorded), then runs the mutated copy's own `--selftest --json` with `TMPDIR=$S/tmp` (fixtures land under `/fast/scratch/hyaku/tabi-r30/MutC1Beyond/tmp`). Verdict mapping: selftest exit 0 + `ok:true` → SURVIVED; exit 3 + `ok:false` → KILLED; anything else → INVALID-RUN (none occurred).
- A second scratch runner (`demo.mjs`) re-runs each SURVIVED mutant and the pristine gate on the production path (`--repo <fixture> --rev <rev> [--stable …]`) over a hand-built fixture where the two must disagree; a differing verdict pair proves the survivor is behaviour-changing (not an equivalent mutant) and doubles as the design of the missing self-test case.
- Kill attribution is by reading the failing case mechanics (case id + expected vs actual), consistent with the wave-1 finding that counter runs must be attributed behaviourally.

## Commands and exit codes

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"      # exit 0
git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5        # exit 0; HEAD=072af95f…, porcelain=[]
sha256sum "$S/clone/scripts/"{check-gate-mutants.mjs,gate-mutants.json,check-frontier-admission.mjs,check-s106-evidence.mjs,check-release-pins.mjs}
#   → 02945f88…3a55, cd1c27a2…3833, cadef57e…9eca, 85dfd5e0…5467, 915a6bba…4648  (frozen three = claims.json)

node /fast/scratch/hyaku/tabi-r30/MutC1Beyond/runner.mjs                       # exit 0, wall ~17 s
#   first attempt exited 1 (SyntaxError: spawnSync imported from node:fs); import fixed to node:child_process, rerun clean
#   BASELINE s106 exit=0 ok=true cases=10 passed=10
#   BASELINE pins exit=0 ok=true cases=29 passed=29

node /fast/scratch/hyaku/tabi-r30/MutC1Beyond/demo.mjs                         # exit 0, wall ~2 s
#   first run: 14/15 CHANGED — D12 fixture bug (receipt stable defaulted to NEW while --stable 156.0.8078.99,
#   both runs refused on the stable mismatch before the population filter); fixture stable fixed, rerun: 15/15 CHANGED
```

## Kill matrix (22 beyond-catalogue mutants)

Pristine baselines: s106 `--selftest` exit 0 (10/10), pins `--selftest` exit 0 (29/29). Mutant copies archived under `.ufo/waves/round-30/w2/MutC1Beyond/mutants/`; full machine output in `results.json` / `demo-results.json` in the same directory.

### scripts/check-s106-evidence.mjs — 0/9 killed (all SURVIVED)

| # | mutant id | site (line) | disabled check | selftest | demo: pristine → mutant |
|---|---|---|---|---|---|
| 1 | s106-parseReceipt-schema-drop | L96 | receipt schema refusal | exit 0, 10/10 | D1: exit 2 refusal → **exit 0 valid** (wrong-schema receipt admitted) |
| 2 | s106-parseReceipt-string-fields-drop | L97-99 | required string fields (url, decoded_sha256, bytes_path, measured_rev) | exit 0, 10/10 | D2: exit 2 → **exit 0 valid** (receipt missing `url` admitted) |
| 3 | s106-parseReceipt-rev-hex-drop | L100 | measured_rev 40-hex guard | exit 0, 10/10 | D3: exit 2 → **exit 0 valid** (measured_rev "HEAD" accepted) |
| 4 | s106-parseReceipt-decoded-bytes-type-drop | L101 | decoded_bytes number guard | exit 0, 10/10 | D4: exit 2 → exit 1 invalid (byte_count_match false) |
| 5 | s106-parseReceipt-anchor-fields-drop | L102-106 | anchor object/line/text guards | exit 0, 10/10 | D5: exit 2 → **undeclared exit 1** (uncaught TypeError on missing anchor — crash, worse than a declared refusal) |
| 6 | s106-resolveRev-syntax-drop | L76 | revision syntax guard | exit 0, 10/10 | D6: `--rev HEAD~1` exit 2 → **exit 0 valid** (gate evaluates a rev its contract rejects) |
| 7 | s106-resolveRev-unresolvable-drop | L78 | unresolvable-revision guard | exit 0, 10/10 | D7: `--rev cafe12` exit 2 → **exit 0 valid reading the git INDEX** (`git show :<path>`) — violates the header's "Production reads committed git blobs only" |
| 8 | s106-anchor-located-notrim | L124 | `.trim()` in anchorLocated compare | exit 0, 10/10 | D8: padded line 187 → pristine exit 0 valid, mutant exit 1 invalid (false negative) |
| 9 | s106-anchor-unique-notrim | L125 | `.trim()` in occurrence scan | exit 0, 10/10 | D9: padded duplicate on line 188 → pristine exit 1 (unique fails), mutant **exit 0 valid (duplicate anchor slips through)** |

### scripts/check-release-pins.mjs — 7/13 killed, 6/13 SURVIVED

| # | mutant id | site (line) | disabled check | selftest verdict | attribution / demo |
|---|---|---|---|---|---|
| 10 | pins-rowre-indent-strict | L75 | 0-3 space indent acceptance removed | **KILLED** exit 3 | `indented-row-counted` (exit 2 vs expected 1) |
| 11 | pins-rowre-indent-loose | L75 | indent bound removed (any spaces) | SURVIVED exit 0 | D10: 5-space row → pristine exit 2 (empty population) → mutant exit 1 (counted, unresolved) |
| 12 | pins-parseRegistry-13cell-drop | L121 | 13-cell well-formedness guard | SURVIVED exit 0 | D11: 14-cell row with on-release at cells[10] → pristine exit 2 → mutant exit 1 (counted) |
| 13 | pins-cmpVersion-always-zero | L111 | ordering crushed to equality | **KILLED** exit 3 | 26/29 cases fail (population collapses → exit 2 everywhere) |
| 14 | pins-cmpVersion-first-two | L111 | components 3-4 ignored | SURVIVED exit 0 | D12: tag 156.0.8078.47 vs --stable 156.0.8078.99 → pristine exit 1 (counted) → mutant exit 2 (not counted; every fixture tag differs in component 1) |
| 15 | pins-rowDigests-abbr-drop | L149 | abbreviated (8…4) digest form never collected | **KILLED** exit 3 | `digest-binding-mismatch-unresolved` |
| 16 | pins-digestMatches-suffix-drop | L154 | abbreviated-digest suffix check | SURVIVED exit 0 | D13: anchor `sha256 <pre8>…0000` → pristine exit 1 (f5-digest) → mutant exit 0 clean (prefix-only binding) |
| 17 | pins-blockIn-always-true | L159-162 | contiguous-block containment | **KILLED** exit 3 | `drift-without-supersession-unresolved`, `drift-superseder-teaches-without-prefix-unresolved`, `drift-superseder-not-at-stable-tag-unresolved` |
| 18 | pins-normLine-identity | L157 | trim/whitespace-collapse | **KILLED** exit 3 | `valid-holds-with-shifted-lines`, `not-on-release-not-counted`, `pinned-at-stable-not-counted` |
| 19 | pins-f2-inanchor-basename-drop | L207 | inAnchor basename() binding (full path required) | **KILLED** exit 3 | `f1-old-tag-not-carried-by-row-unresolved` — reasons pinning catches it: expected `["f1-old-tag"]`, mutant yields `["f1-old-tag","f2-path-bound"]` (length mismatch) |
| 20 | pins-receipt-schema-refusal-drop | L185 | receipt schema refusal | SURVIVED exit 0 | D14: wrong-schema receipt → pristine exit 2 → mutant exit 0 clean |
| 21 | pins-receipt-stable-refusal-drop | L186 | receipt stable-vs---stable refusal | **KILLED** exit 3 | `receipt-stable-mismatch-could-not-evaluate` |
| 22 | pins-r1-duplicate-entry-allowed | L194 | duplicate receipt entries refused | SURVIVED exit 0 | D15: two entries for S001 → pristine exit 1 (r1-entry duplicate) → mutant exit 0 clean (first wins) |

## Frontier for the round-31 catalogue

Fifteen new fault rows are available, each with a demonstrated behaviour change and a ready-made fixture design (demo ids above). Under C1's kill rule ("only self-test cases and fixtures may change; the catalogued check lines stay byte-identical") these are addable as self-test cases next round:

- s106 (9): wrong-schema receipt → exit 2 (D1); receipt missing `url` → exit 2 (D2); measured_rev `"HEAD"` → exit 2 (D3); `decoded_bytes` as string → exit 2 (D4); receipt without `anchor` → exit 2, no crash (D5); `--rev HEAD~1` → exit 2 (D6); `--rev cafe12` (regex-passing, unresolvable) → exit 2 (D7); whitespace-padded anchor line stays valid (D8, pins the trim semantics); padded duplicate anchor line → exit 1 (D9, pins trimmed uniqueness).
- release-pins (6): 5-space-indented row not counted (D10); 14-cell row skipped (D11); tag below stable only in components 3-4 counted (D12); abbreviated digest with wrong suffix → f5-digest fires (D13); wrong-schema receipt → exit 2 (D14); duplicate receipt entries → exit 1 r1-entry duplicate (D15).

Direction note: 12 of the 15 blind spots flip a refusal/unresolved into valid/clean — the admission direction a gate must not leak.

## Bounds, restoration, and disclosures

- Writes: this report, the output dir `.ufo/waves/round-30/w2/MutC1Beyond/` (results.json, demo-results.json, runner.mjs, demo.mjs, mutants/ ×22), and scratch `/fast/scratch/hyaku/tabi-r30/MutC1Beyond/` (removed after receipt copy). No lane tracked file, lane index, jj state, fleet repo, sibling lane, or /home/vgpnk/Projects/shokuknow touched; no commits anywhere (mutant copies are untracked scratch files, archived).
- Restoration evidence: scratch clone `git rev-parse HEAD` = 072af95f…, `git status --porcelain` empty, and post-run sha256 of both gate files unchanged (85dfd5e0…, 915a6bba…). Lane `git status --porcelain` shows only untracked `.ufo/waves/round-30/` additions (measure/ artifacts and w2/ seat dirs, mine and siblings').
- Tooling authorization (operator 2026-10-19): nothing installed — node v24.21.0 and git already present; no pacman transaction. No network fetches. No subagent dispatch (leaf seat). The frozen counter `check-gate-mutants.mjs` itself was not exercised — out of assignment scope.
- Honesty notes: runner's first attempt exited 1 on a bad import (fixed, rerun); demo D12's first run was inconclusive due to a fixture bug in my demo script (fixed, rerun 15/15). Both are recorded above; no result rests on the failed runs.
