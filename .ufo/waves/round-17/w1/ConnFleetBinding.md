VERDICT: ISSUES

Scope: what `corpus/evidence/round-17/measurement-binding.json` must contain for
`scripts/check-measurement-binding.mjs --check <manifest> --at <tip> --reproduce` to pass, and what C1
editing that gate does to the r16 manifest. Line numbers are the current worktree gate (anchored
variant, 912 lines, uncommitted: `git status` shows M on the four gate scripts); the registered r16 gate
(`1f84fb54…`, 869 lines) differs only by `laneTip` and `--at` resolution (`:876`).

## 1. Enforced shape — `manifestProblems` `scripts/check-measurement-binding.mjs:387-441`
- `schema` exactly `tabi-measurement-binding-v1`; `round` integer (17); `baseline` 40-hex
  (`5859243183c4d7ac5429dfdb8a73ce0d9a43d583`); `claims` non-empty.
- per claim: `id` `/^[A-Za-z][A-Za-z0-9_-]{0,31}$/`; `axis` optional string; `counter.path` clean and
  repo-relative (`.ufo/...` fine; only `.`/`..`/leading-`-` segments refused, `:288-297`);
  `counter.countField` `/^[A-Za-z_][A-Za-z0-9_]*$/`; `countedInputs[]` clean paths; `measuredRevision`
  40-hex; `before`/`after` `{revision: 40-hex, count: safe integer}`.
- `after.revision` MUST equal `measuredRevision` (`:441`) — anything else is `exit 2
  manifest_schema_invalid`, not a finding.
- `argv` is a finding (`:452`, `argv_unsupported` `:146`): `["node", counter.path, …]`, exactly one
  `{REV}`, no NUL. The gate spawns `process.execPath -- <argv[1..]>`, so `{REV}` is the counter's argv[2].

## 2. Reproduce semantics — `evaluateClaim` `:500-596`
- `counter.sha256` must equal the blob at `measuredRevision` (`:520-524`, `counter_digest_mismatch`) and
  at `--at` (`:526`, `counter_changed_since_measurement`). It is the **content** digest:
  `git cat-file blob <M>:<path> | sha256sum`, not the git blob oid (r16 counter `c8b4100a…`; gate
  `1f84fb54…` at 3254740, unchanged through 5859243).
- each `countedInputs` entry must cover ≥1 tree entry at `measuredRevision` (`:536-542`,
  `counted_inputs_undeclared`); drift = `git diff --name-only M <at> -- <countedInputs…> <counter.path>`
  must be empty (`:545-546`, `counted_input_changed`).
- `--reproduce` requires the **worktree** counter bytes to equal the blob at `--at` (`:573`,
  `counter_failed`), then runs `before.revision→before.count` and `--at→after.count` (`:578-590`).
  `after.count` is reproduced at `--at`, not at `measuredRevision`; the drift check keeps them equal.

## 3. Required content
```json
{"schema":"tabi-measurement-binding-v1","round":17,"baseline":"5859243183c4d7ac5429dfdb8a73ce0d9a43d583",
 "claims":[
  {"id":"C1","axis":"operability","counter":{"path":".ufo/waves/round-17/measure-c1.mjs","sha256":"<at M>",
    "argv":["node",".ufo/waves/round-17/measure-c1.mjs","{REV}"],"countField":"c1_anchor_safe"},
   "countedInputs":["scripts/check-round-contract.mjs","scripts/check-user-round-contract.mjs",
     "scripts/check-measurement-binding.mjs","scripts/selftest-measurement-binding.mjs",
     "corpus/evidence/round-16/measurement-binding.json"],
   "measuredRevision":"<M>","before":{"revision":"5859243…","count":0},"after":{"revision":"<M>","count":7}},
  {"id":"C2","axis":"coverage","counter":{"path":".ufo/waves/round-17/measure-c2.mjs","sha256":"<at M>",
    "argv":["node",".ufo/waves/round-17/measure-c2.mjs","{REV}"],"countField":"c2_invocation_held"},
   "countedInputs":["corpus/knowledge/webmcp-invocation-round-17.md","corpus/README.md",
     "corpus/SOURCES.md","corpus/evidence/round-17/webmcp-invoke/receipt.json",
     "scripts/webmcp-invoke-round17.mjs"],
   "measuredRevision":"<M>","before":{"revision":"5859243…","count":0},"after":{"revision":"<M>","count":1}},
  {"id":"C3","axis":"adjacency","counter":{"path":".ufo/waves/round-17/measure-c3.mjs","sha256":"<at M>",
    "argv":["node",".ufo/waves/round-17/measure-c3.mjs","{REV}"],"countField":"c3_adjacency_verified"},
   "countedInputs":["corpus/adjacency.tsv","scripts/check-adjacency.mjs"],
   "measuredRevision":"<M>","before":{"revision":"5859243…","count":0},"after":{"revision":"<M>","count":N}}]}
```
Grounds, read from the counters as they stand:
- **C1**: `ENTRIES` is hard-coded (`measure-c1.mjs:66-109`), so do NOT declare `c1-sites.json`. The r16
  manifest IS a real input: entry `measurement-binding-round16-manifest` (`:103-108`) passes it as an
  argument, so an undeclared edit to it would move the count silently.
- **C2** (`measure-c2.mjs:47-53`): `NOTE`, `README`, `SOURCES`, `RECEIPT`, `HARNESS` are the only blobs
  read; `fixtures/` is not (the receipt is the only browser evidence inspected). Declare fixtures only if
  receipt-vs-fixture staleness (not just tampering) should red; `receipt-first-run-failed.json` only if read.
- **C3** (`measure-c3.mjs:50-51`): TSV + checker. All 8 fragment rows use `PROVINCE.md`/`SKILL.md` as
  `tabi_ref`; do NOT declare them — both are `APPEND_ONLY` (`check-round-contract.mjs:25`) with prefix
  enforcement (`:266`), so a verbatim-substring match is monotone under legal edits, while declaring them
  would red C3 at every later L1 append. Any non-append-only `tabi_ref` in the final TSV must be declared;
  that union is only knowable after `corpus/adjacency.tsv` is concatenated.
`before.count=0` is measured, not assumed: `measure-c1/2/3.mjs 5859243…` each print 0 with exit 0 (C1
reports all 7 entries failing — correct before arm).

## 4. Ordering protocol (mandatory)
1. Commit every declared input in one integration commit: four anchored gates, the **L1 identity-constant
   update**, C2 harness/fixtures/receipt/note + README/SOURCES rows, C3 TSV/checker/PROVINCE append, all
   three counters. `scripts/check-user-round-contract.mjs` is both a C1 input and the file L1 edits
   (`ROUND_SCRIPT_CURRENT_SHA256` `:32`, archived/accepted `:33-40`); it still holds baseline digest
   `8a573b4e…` while the worktree `check-round-contract.mjs` is `15f0796e…` — update it in the same
   commit or `counted_input_changed` fires.
2. `M` = that commit (last one touching any declared input). Run each counter at `M`; record what it
   prints — do not assume `c1=7`.
3. Commit the manifest (`measuredRevision=M`, `after.revision=M`) → `T`.
4. `… --check corpus/evidence/round-17/measurement-binding.json --at T --reproduce --json > receipt`;
   commit. Verified in a sandbox: clean at `T` with `measuredRevision` one commit back.
5. Never list the manifest in its own `countedInputs` — writing counts changes its bytes, so the drift
   check would red it by construction (fixed point impossible).

## 5. C1 edits the binding gate: the r16 manifest at later revisions
Empirical, `/tmp` clone, one comment appended to `scripts/check-measurement-binding.mjs` (simulating
GateBindAnchor) plus one line appended to `corpus/SOURCES.md`:
- simulated r17 tip → `MEASUREMENT_BINDING verdict=failed claims=2 bound=0`:
  `claim=C1 counted_input_changed paths=scripts/check-measurement-binding.mjs`,
  `claim=C2 counted_input_changed paths=corpus/SOURCES.md`. **Both** r16 claims die, not just C1.
- at 5859243 and at 1205d26 → `verdict=clean claims=2 bound=2`, including `--reproduce` (4.9 s).

Consequences:
- The r16 manifest is receiptable only at an anchor ≤ 5859243; the PLAN's defect-3 anchor (1205d26) is
  right, and a post-r17 "delivered-tip" run of it is expected red — not a regression. Re-cutting the r16
  manifest is not a fix (r16 evidence; `measuredRevision` is part of its content).
- Defect 3 must run the **registered** gate: the manifest first appears at `6c8e0ff` and is absent at
  3254740, so `--check` cannot be receipted there (only defect 2's `--self-test`/`--legacy`, whose
  `corpus/evidence/round-15/measurements.json` is present at 3254740). Verified: sandbox at 1205d26
  (gate sha256 `1f84fb54…`, manifest present) → clean. After GateBindAnchor commits, the LANE worktree
  gate is no longer `1f84fb54…`, so route the receipt through the sandbox regardless of timing.
- The r17 manifest has the same one-round lifetime: r17 C1 declares the binding gate, so r18's C1 edit
  reds r17 C1 exactly as r17 reds r16 C1; ditto r17 C2's README/SOURCES. Label it as designed decay.

## 6. C1Counter defect: its binding entry cannot pass at the measured revision
`measure-c1.mjs:103-108` runs `--check corpus/evidence/round-16/measurement-binding.json` (text mode).
A sandbox commit of the current worktree gates + counters (identity constant advanced per 4.1) gives
`c1_anchor_safe = 6 of 7`; the failing entry is `measurement-binding-round16-manifest`,
`exits=1/1/1`, `checks.arm_c_differs=false`.
Cause: at the r17 tip the r16 claim is already red on `scripts/check-measurement-binding.mjs`, the same
path `POISON_APPENDS` touches (`:115-118`); arm C (master=P) yields a byte-identical finding set, so the
counter's own sensitivity clause fails. The PLAN's other poison target (`scripts/check-round-contract.mjs`)
is not an r16 input and collapses identically (verified by hand). `--json` alone does not help: arm C's
`"at":"<poison>"` is JSON-quoted 40-hex, which `REV_FIELD_RE` (`:121`, text form `key=<hex>`) does not
classify, so normalization rule 3 erases it to `<HEX40>` in both arms (verified: still 6/7).
Fix verified: add `corpus/evidence/round-15/measurements.json` (r16 C1's undrifted counted input) to
`POISON_APPENDS` → `c1_anchor_safe = 7 of 7`, entry passes with all three checks true. Alternative
(more semantic, needs 4.3's fixed point): point the entry at the **r17** manifest — green at `M`, red
under P via `scripts/check-round-contract.mjs` — but then it must exist at `M` and is an undeclared input
of its own claim. General rule: a poison must perturb a declared input the round has not already
drifted, and the difference must survive normalization (i.e. land in a non-hex finding detail).

## 7. Anchor proof on real bytes
Sandbox `refs/heads/master=1607d31…`, `HEAD` detached at an off-branch child that rewrites
`scripts/check-round-contract.mjs` (jj `new`-like): new gate → `at=1607d31… verdict=clean bound=1`;
registered gate → `at=80566b4… verdict=failed bound=0`. JjAudit F1/F3 reproduced on the binding gate.

## 8. Residual risks (cannot be closed by this manifest)
- Out-of-lane inputs: C3's `sibling_ref`/`ruling_ref` read sibling and fleet repos at pinned 40-hex;
  `countedInputs` is lane-relative, so the gate cannot cover them. Pins must be commits reachable from a
  branch (jj rebase/abandon orphans local-only pins). Checked: kaidoku `9011581d…` is in `main`; the two
  `contested-open` rows still carry `ruling_ref=NEEDS-L0`, so C3's count stays under the row count until
  L0 pins a `fleet@<40-hex>:.ufo/l0-questions.md:<line>`.
- `REPRODUCE_TIMEOUT_MS=120000` per arm (`:115`): measure-c1 is ~9 s wall at 7 entries; a
  `--no-hardlinks` clone is 0.07 s, so C3's probe clones fit.
- C2 is shape-and-provenance only (it does not re-run Chromium): the manifest binds who measured, not
  that the receipt's events happened. Keep that in the note's limits, not in the manifest.

Verification run (read-only in LANE; writes only in /tmp clones, now removed): r16 check clean at
5859243/1205d26 (text+json, with and without `--reproduce`); r16 red `bound=0` at a simulated r17 tip
(gate edit, then SOURCES edit); arm-C collapse and fix reproduced with hand-built poison commits;
`measure-c1/2/3.mjs 5859243…` → 0 exit 0; measure-c1 6/7 → 7/7 with the one-line poison fix; old-vs-new
gate detached-HEAD A/B as in §7. No tool installed or upgraded.

Files written:
- `.ufo/waves/round-17/w1/ConnFleetBinding.md`
