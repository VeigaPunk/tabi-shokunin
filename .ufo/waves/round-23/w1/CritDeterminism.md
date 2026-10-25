# C1 determinism / rev-independence — counter (CritDeterminism, r23 attempt 1)

**Verdict:** C1 survives only under one mandated primitive — `git cat-file blob <rev>:<path>` /
`ls-tree -r <rev>`, no shell, allowlisted env, cwd pinned, every input read *through* `--rev`.
Six vectors return different bytes or a false verdict for the same 40-hex rev: unguarded, "reads
committed bytes only" is false and C1 must stop honestly. As written the in-progress auditor
(`scripts/round-evidence-audit.mjs`, untracked, snapshot sha256 `1092ef14f5635c46`, mtime 2026-10-25T04:13:52) carries
**four** of them.

## Live-tree vectors → guard → severity (proofs: scratch/CritDeterminism/proof.sh, proof2.sh)

| # | Vector | Evidence at one rev | Guard | § |
|---|---|---|---|---|
| 1 | `readFile` on tracked evidence | `blob_at_rev=[blob-B]` / `readFile_live=[dirty-uncommitted]` | blobs only | **FATAL** |
| 2 | `refs/replace` rewrites the tree | `plain=[blob-B]` → `with_replace_ref=[replaced-C]`, `same_rev_oid` unchanged | `GIT_NO_REPLACE_OBJECTS=1` | **FATAL** |
| 3 | uncaught throw = exit 1 = "finding" | `uncaught_rc=1` vs `explicit_rc=2`; absent path → `128` | catch-all → exit 2 | **FATAL** |
| 4 | relative/unbounded date query | `--since="3 days ago"`→4, `"4 days ago"`→26, same rev | absolute `--since/--until`, `rev-list <rev>` | **FATAL** |
| 5 | any ref accepted as `--rev` | `rev-parse --verify HEAD^{commit}`→rc 0, `head_eq_tip=no` | `^[0-9a-f]{40}$` + `cat-file -t`==commit | **FATAL** |
| 6 | shell glob / `readdir` over wave dir | `fs_glob_count=1` vs `tree_count=0` | match over `ls-tree -r -z` | **FATAL** |
| 7 | inherited `GIT_DIR`/`GIT_OBJECT_DIRECTORY` | `GIT_DIR_leak=[blob-B]` from a *different* cwd; `-C` does not win | build env from allowlist; delete `GIT_*` | **FATAL** |
| 8 | input outside the rev (policy, report) | fleet policy 13 KB, no lane copy at rev; fleet `round-22/tabi.md` mtime **2026-10-25 03:39** | every input read at `--rev`; else a pinned constant | **FATAL** |
| 9 | data-driven git options (`filesOfCommit`) | `git show --name-only --pretty=format: --all` → file list, rc 0 (option, not revision) | 40-hex-validate + `--end-of-options` | high |
| 10 | inherited `GIT_GLOB/LITERAL_PATHSPECS` | `GIT_GLOB_PATHSPECS=1 … ls-tree … -- .` → `fatal: pathspec magic …` | `GIT_LITERAL_PATHSPECS=1`, no env spread | high |
| 11 | missing blob read as empty | `absent_path_rc=128`; callers use `read(f) \|\| ""` | read error → exit 2 | high |
| 12 | symlink/gitlink entries | `mode=120000` → `catfile_symlink=[x.txt]`; 2 such in tree | accept 100644/100755 only | med |
| 13 | filters/`checkout` vs blob | `show_bytes=a\r\nb\r\n` raw under live `.gitattributes` | blobs only (verified filter-free) | med |
| 14 | object format / buffer | sha256 repo `rev_len=65`; largest blob `811507` B, wave `7960926` B | assert sha1; streaming, no `execSync` | med |
| 15 | skip-work: expected-file read | committed `a89f193:.ufo/waves/round-22/fixtures/expected.json` | `--selftest` in memory only | **FATAL** |
| 16 | c3 cites an absent rule file | `ls-tree a89f193 \| grep -ic learning\.md` → `0` | c3 is a constant; cite `round-22.md` §Gate | med |
| 17 | c1 anchored on the filed report | no `report*` path in `ls-tree a89f193 -- .ufo/waves/round-22` | anchor on `SCORECARD.md:1111` + `round-22.md:130` | med |
| 18 | `git status`/clean-tree precondition | would refuse on any dirty operator tree | none needed | note |
| 19 | script itself unpinned | `node scripts/round-evidence-audit.mjs` runs live code | disclose; optional script sha256 in JSON | note |

## As-written status (snapshot above; all four are fail-**open or mute**, not loud)
1. `GIT_ENV = { ...process.env, … }` (l.53) inherits `GIT_DIR`/`GIT_OBJECT_DIRECTORY` → vector 7 sits open
   behind `-C root`. Fix: spread an allowlist (`PATH`, `HOME`, `TMPDIR`) and add `GIT_LITERAL_PATHSPECS=1`.
2. `reportPath` default `/home/vgpnk/Projects/shokunin/.ufo/reports/round-<N>/tabi.md` (l.504) — **fleet repo, live,
   written 03:39 today**, outside the rev and outside the lane; `reportText` decides c4. Editing that file changes
   the verdict for a fixed `--rev` — the claim's own skip-work control. c4 is derivable without it
   (`w2-attempt*-result.json` = 9 at rev, `rev-list <rev> --since=<abs>`), so read it *at rev* or drop the input.
3. `policyPath` default fleet `/…/shokunin/scripts/hyaku/ufo-wave-policy.json` (l.503; `"waveMaxLanes": 64`) — same
   class for c2. Hash is recorded, which documents but does not pin: fixed rev + mutated policy → different findings.
   Fix: lane copy at rev, or a constant with the hash asserted against it.
4. `ctx.read` returns `null` on any git failure and callers do `(ctx.read(f) || "")` (l.180) — a listed-but-unreadable
   blob reads as "no refusal marker", i.e. can clear a red (vector 11). Fix: throw `AuditRefusal` → exit 2; keep
   `tryRead` only for semantics that genuinely allow absence.

Also unguarded: `filesOfCommit(commit)` (l.91) validates nothing (vector 9) and could be handed `--all` from
`integration-changes.json` — `git show … --all` succeeds with rc 0 and a wrong answer; no blob oid/sha256 is
recorded per evidence pointer, so a finding cannot be re-verified as byte-identical; `--rev` is not type-checked
to a commit, so a 40-hex tree/blob oid is accepted (fail-closed only by accident).

## Derivability (supports the claim)
Both controls are reachable from rev bytes alone: `w2_refusals=13`, `w2b_refusals=11` (vs the cited 23),
`maxLanes` 64/65 → 129 > 128, `agentId: null` in `w2b/swarm-registry.json`,
`git show --name-only --format="" 47bfb5f | grep -c '^LOG.md$'` → `0`, round-22 lesson `## Gate` has no spot-check row.

## Smallest safe correction
`readAtRev`: 40-hex + `cat-file -t`==commit → `spawnSync('git',['-C',LANE,'cat-file','blob',rev+':'+p],{shell:false,env:ALLOWLIST})`
→ Buffer → `{blobOid, sha256, len}` in `evidence`; enumerate `ls-tree -r -z <rev>`; history `rev-list <rev> --since=<abs>`;
every report/policy/lesson input read through `readAtRev`; one `die(exit 2)` wrapper. Twice-run byte equality
(dirty tree, `GIT_DIR` set, mutated fleet policy between runs) is the acceptance test.

## Findings (each with its command)
1. Same rev, two answers — `proof.sh` P1 (`blob_at_rev` vs `readFile_live`).
2. Replace ref rewrites a fixed oid silently — `proof.sh` P2 (`with_replace_ref` vs `with_no_replace`).
3. Exit 1 conflation — `node -e 'JSON.parse(require("fs").readFileSync("nope.json"))'; echo $?` → 1.
4. Today-dependence — `git log a89f193 --since="3 days ago" --oneline | wc -l` → 4; `"4 days ago"` → 26.
5. `HEAD` accepted as rev — `git rev-parse --verify --end-of-options "HEAD^{commit}"` → rc 0.
6. Untracked file enters a glob — `proof.sh` P6 (`fs_glob_count=1` / `tree_count=0`).
7. Env picks the repo — `GIT_DIR=…/r1/.git git show <rev>:x.txt` from `r2` → `blob-B`.
8. Live report gates c4 — `stat -c '%y' /home/vgpnk/Projects/shokunin/.ufo/reports/round-22/tabi.md` → 2026-10-25 03:39.
9. Data as option — `git show --name-only --pretty=format: --all | head -3` → file list, rc 0.
10. Pathspec env flip — `GIT_GLOB_PATHSPECS=1 git ls-tree -r --name-only HEAD -- .` → `fatal: pathspec magic`.
11. Unreadable blob clears a red — `sed -n '180p;84,88p' scripts/round-evidence-audit.mjs` (`|| ""`, `null` on error).
12. Absent rule/report anchors — `git ls-tree -r a89f193 | grep -ic learning\.md` → 0; no `report*` under `.ufo/waves/round-22`.

Tooling: no installs/upgrades; no pacman. Probe repos live only in `scratch/CritDeterminism/proof/`; lane repo read-only.
