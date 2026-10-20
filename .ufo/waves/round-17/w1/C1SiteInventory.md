VERDICT: PASS

# C1SiteInventory — every git invocation in `scripts/*.mjs` at tabi@5859243

Deliverable: `.ufo/waves/round-17/c1-sites.json` (83,574 bytes, `node -e JSON.parse` ok).
Source of truth: committed blobs, `git show 5859243183c4d7ac5429dfdb8a73ce0d9a43d583:scripts/<file>`,
line-numbered in a private `/tmp/tabi-r17-C1SiteInventory-aPNU` copy. Rows: `file`, `line`, `argv` (as
written), `class` (live|fixture), `anchor` (HEAD|rev-pinned|branch|none), `audit`
(`JjAuditTabi.md:<line>` or `new-since-audit`), plus `kind`, `enclosing_function`, `line_text`, `note`.

## Inventory (observed at 5859243)

`git ls-tree --name-only 5859243 scripts/` → 13 `.mjs`. Git invocations are constructed in **5** of them:

| file | direct sites | live | fixture | HEAD |
|---|---|---|---|---|
| `scripts/check-freshness.mjs` | 11 | 6 | 5 | 1 (fixture) |
| `scripts/check-round-contract.mjs` | 23 | 10 | 13 | 9 |
| `scripts/check-user-round-contract.mjs` | 32 | 18 | 14 | 13 |
| `scripts/check-measurement-binding.mjs` | 7 | 7 | 0 | 1 |
| `scripts/selftest-measurement-binding.mjs` | 7 | 0 | 7 | 2 |
| **total** | **80** | **41** | **39** | **26** |

No git in `aria-loopback-round13`, `check-aria-metadata`, `check-sources` (`:442` is the word
"digit"), `pstack-aggregate`, `pstack-seat`, `user-aggregate`, `user-seat`, `webmcp-loopback-round16`.
`selftest-measurement-binding.mjs:74` is a string literal that *emits* a fixture counter; recorded
under `non_invocation_mentions`, not counted.

Records total 119 = 80 direct argv construction sites + 39 **helper-mediated** `show/blob/list(…,'HEAD')`
call sites (round 16, user 23). All 39 are live; see the C1 exposure note below.

Anchor totals over 119 records: HEAD 65, rev-pinned 25, branch 0, none 29. Direct-only: HEAD 26,
rev-pinned 25, none 29.

## Reconciliation with JjAuditTabi.md

- **12 live R1** — reconciles exactly, same rows: `check-round-contract.mjs:119,231,232,504`
  (`JjAuditTabi.md:230-235`) and `check-user-round-contract.mjs:167,237,255,308,309,325,327,529`
  (`:258-266`).
- **4 live R2** — reconciles: `check-round-contract.mjs:1007` (`:249`);
  `check-user-round-contract.mjs:790,874,955` (`:274,277,280`). No new R2 site at 5859243.
- **Fixture counts** — reconciles: 25 class-B + 7 class-D fixture rows, all still at the audited lines
  (`:217-221`, `:236-249`, `:267-286`). New files add 7 more fixture sites.
- **F6** — holds: `check-freshness.mjs:49` accepts any non-`--` `--witness` token (including literal
  `HEAD`); no hex test for `witness` exists. Sibling gates still test `/^[a-f0-9]{7,40}$/` at
  `check-round-contract.mjs:211` and `check-user-round-contract.mjs:291,295`.
- **Input-driven shell git** — 3 commands, unchanged: `corpus/evidence/pstack-20261015-r01/slices.json:115`,
  `…-r02/slices.json:108`, `…-r04/slices.json:128`, run via `bash -c` by `scripts/pstack-seat.mjs:34`
  and `scripts/user-seat.mjs:34`. Pinned historical evidence bytes, **not live gate code**; they use
  `HEAD:<path>` and carry the same moving-HEAD exposure (audit `:299-301`).

## Drift (explicitly requested)

- **Table rows: 66 checked, 0 drifted.** Machine check: for each row, the cited script line still holds
  the row's subcommand. The three audited gates are byte-identical between the audit's sandbox base
  `e38d259` and `5859243`: `git diff --stat e38d259 5859243 -- scripts/` lists only three *added* files.
- **One narrative line drifted:** `JjAuditTabi.md:186` says "`scripts/check-freshness.mjs:51` accepts
  `--witness <anything>`"; at 5859243 the acceptance is `:49` and `:51` is `}` (delta +2).
- **Scope drift (stale, not line drift):** `JjAuditTabi.md:23-24` says "ten `.mjs`" and "Git appears in
  exactly three"; at 5859243 there are 13 and five. `check-measurement-binding.mjs` and
  `selftest-measurement-binding.mjs` were added by `8f7feb3`, hardened by `3254740`, after the audit;
  the audit's grep table at `:27-31` cannot show them.
- New-since-audit direct sites = 14: `check-measurement-binding.mjs:232,242,268,283,300,308,323` and
  `selftest-measurement-binding.mjs:61,62,63,120,226,227,377`. The assignment's example is confirmed
  at the blob: `check-measurement-binding.mjs:833` `const atRev = resolveCommit(repo, options.at ?? 'HEAD', '--at')`.

## Critical nuance for C1 (audit R1 undercounts the change surface)

The audit's 12 counts **direct argv sites only**. The gates also read HEAD through helpers, and those
call sites are absent from the audit table (its own F3 quotes only the three witness `blob(...'HEAD')`
lines). Live HEAD-dependent sites at 5859243:

- 12 direct R1 + 4 direct R2 (receipt fields) + 1 new (`check-measurement-binding.mjs:232`, HEAD via
  the `--at` default) = 17 direct;
- **39 helper-call `show/blob/list(root,'HEAD',…)` sites** (all live: production checks, witness
  modes, and `check-user-round-contract.mjs:1268` in `--self-test`, which reads `defaultRoot`);
- 1 selector line (`check-measurement-binding.mjs:833`) → **57 HEAD-dependent lines, 56 invocation sites**.

C1's contract ("thread the 40-hex through every former `'HEAD'` read") therefore edits 56 sites, not 12.
A counter that only re-checks the audit's 12 rows can pass a gate that still reads HEAD through the 39
helper calls. Recommended counter assertion: after the fix, no literal `'HEAD'` revision operand remains
outside fixture blocks and the witness `committed` comparison in `check-round-contract.mjs` /
`check-user-round-contract.mjs` / `check-measurement-binding.mjs` (the JSON `sites` array is the
fixed list; `kind:"helper-call"` records name helper, `helper_line`, and the helper's argv template).

## Other findings and risks

- `check-freshness.mjs` is byte-frozen (`protectedPath` in both round gates; PLAN byte-frozen list), so
  its 6 live + 5 fixture sites are inventoried for completeness but are **out of C1 change scope**; F6
  cannot be fixed in code, only via the SKILL registry invocation rule.
- `check-measurement-binding.mjs:219` `gitMust` has no call sites at 5859243 (dead helper); listed under
  `transports`, not counted as a site.
- Provenance caveat: while this ran, sibling seats had modified the worktree
  (`M check-measurement-binding.mjs`, `M check-round-contract.mjs`, `M check-user-round-contract.mjs`,
  `M selftest-measurement-binding.mjs`; `laneTip` additions). All line numbers here are 5859243 blob
  lines — e.g. the `--at` default is `:833` in the blob and `:842` in the in-flight worktree. Apply the
  inventory by symbol/argv, not by saved line numbers.
- No `jj`/git write was run; no tool installed; the five byte-frozen/protected surfaces were not touched.

## Checks actually run

1. `git show 5859243:scripts/*.mjs` → 13 blobs in `/tmp/tabi-r17-C1SiteInventory-aPNU`.
2. `node -e "JSON.parse(...)"` → `ok sites=119 direct=80 helper=39`.
3. Line fidelity: 119/119 `line_text` equal the blob line.
4. Audit map: 66/66 table-row mappings and 39/39 helper mappings land on a row whose first column is
   the stated site line; audit section matches the file for all 105 mapped records.
5. Counts recomputed from `sites` equal `counts` (`by_class`, `by_anchor`, `by_kind`).
6. Drift checker over the 66 audit rows: 0 drifted.

Files written:
- `.ufo/waves/round-17/c1-sites.json`
- `.ufo/waves/round-17/w1/C1SiteInventory.md`
