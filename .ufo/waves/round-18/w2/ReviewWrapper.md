VERDICT: PASS

# WAVE2 FALSIFY — `scripts/freshness-witness.mjs` + selftest at REV 530f40a9bc3f10436161a2af1ca0fe9bffffc004

Reviewer: TabiR18.ReviewWrapper-2. Lane read-only; all git-write probes ran in a private
`git clone --no-hardlinks` sandbox at REV (deleted after; every command/output below is reproducible
from the report alone). Baseline B = `2bff864fdfee684ddbcd066cc8e735adaba2735c`; REV = lane tip
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse refs/heads/master` →
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Producer identity: `git show 530f40a…:scripts/freshness-witness.mjs | sha256sum` =
`a348912911ce63577147b4b4610ce88fa73cba888d888d158b092a74db8ecad1`; identical for the lane working
tree and the sandbox clone; matches the digest committed at
`.ufo/waves/round-18/w1/C2FreshWrapper.md:20`. Frozen target `scripts/check-freshness.mjs` untouched
(`--witness` parser `check-freshness.mjs:49-52`, git calls `:63-71`).

## Findings

### LOW-1 — `--rev` accepts an annotated-tag object sha, not only commit shas
- Evidence (sandbox, attached master): `node scripts/freshness-witness.mjs --rev 3717a53ad87f593e6be5ecca40f3e75d359832f5 --dry-run` → exit **0**,
  `FRESHNESS_WITNESS tip=3717a53ad87f593e6be5ecca40f3e75d359832f5 source=--rev` and argv
  `[..., "scripts/check-freshness.mjs", "--witness", "3717a53a…"]`. That sha is the *tag object*
  (`refs/tags/revwrap-tag^{commit}` = `530f40a…`). Cause: `merge-base --is-ancestor` peels tags
  (`scripts/freshness-witness.mjs:141-148`), while the refusal message (`:120`) and docs say
  "40-hex commit revision".
- Impact: none exploitable — the frozen CLI peels the same object (`git show -s --format=%ct`,
  `merge-base --is-ancestor baseline`), so semantics equal the peeled commit and the baseline-ancestry
  and epoch gates still run. The printed `tip=` can, however, record a non-commit object id where a
  commit id is documented. Implementation matches the documented acceptance rule
  (`corpus/knowledge/harness-hardening-round-18.md:41`), so this is contract precision, not a defect
  vs. spec.

### LOW-2 — selftest covers 8 of the wrapper's ~12 hardening behaviors
- `node scripts/freshness-witness.mjs --self-test` → `FRESHNESS_WITNESS_SELFTEST cases=8 failed=0`,
  exit 0 (sandbox and LANE). Cases (`scripts/freshness-witness.mjs:219-243`): detached-poison→master,
  attached branch, `--rev HEAD`, short hash, dash-led value, non-ancestor, valid ancestor, symbolic
  HEAD to a tag. Not covered by any selftest case (each verified green by my probes below):
  (a) hostile inherited `GIT_*` env; (b) nonexistent 40-hex / non-commit objects; (c) `refs/replace`
  ancestry forgery; (d) branch-as-symref and symbolic HEAD to a missing branch; (e) tag-object sha.
  Coverage gap only — no behavior defect found.

### INFO-1 — child death by signal exits 1 with no diagnostic
`main` returns `result.status ?? 1` (`scripts/freshness-witness.mjs:266`) with no `finding=` line when
the frozen child is killed by a signal (spawnSync `status:null`). Observability nit; the H1
signal contract targets the harness, not this wrapper; every wrapper-side refusal path is
diagnosed (exit 2 + `finding=`).

### INFO-2 — replace-object forgery is a concrete shape of the still-open global hazard
Direct callers of the frozen CLI (bypass route) inherit their own env, so a crafted `refs/replace`
entry fakes the frozen CLI's own ancestry gate. Demonstration in sandbox (attached master):
`git replace -f $MASTER $REWRITE` where `REWRITE=$(git commit-tree 'master^{tree}' -p $POISON -m forged-parents)`:
plain `git merge-base --is-ancestor $POISON refs/heads/master` → **rc=0** (acceptance faked);
`GIT_NO_REPLACE_OBJECTS=1 git …` → rc=1. The wrapper refuses the same poison under the same
replacement: exit **2**, `finding=witness_revision_refused detail=--rev must be an ancestor of
refs/heads/master` — the wrapper's forced `GIT_NO_REPLACE_OBJECTS=1` (`:22`) is **load-bearing**.
Replacing a *non-history* commit fakes nothing (rc=1 both ways): ancestry walks by original object
ids. Wrapper users are protected; the residual exposure belongs to the documented open bypass.

### INFO-3 — `git` is resolved through the caller's PATH (absolute entries only)
`gitEnvironment` filters PATH to entries starting with `/` (`:38-40`); a caller who controls PATH
controls which `git` runs. Outside the threat model (PATH control implies full control); recorded so
the env hardening is not over-read.

## Verification matrix (exact argv / exit / observed output; sandbox = /tmp/tabi-r18-reviewwrap at REV unless marked LANE)

| # | Boundary | Command (cwd = sandbox) | Exit | Observed |
|---|---|---|---|---|
| T1 | selftest | `node scripts/freshness-witness.mjs --self-test` | 0 | `cases=8 failed=0` |
| T2 | detached poison, default | poison `d012fad665c580deefaa7751696c872b9a8a63a1` detached; `node scripts/freshness-witness.mjs --dry-run` | 0 | `tip=530f40a… source=refs/heads/master`; argv `--witness 530f40a…`; never bare HEAD |
| T3 | `--rev HEAD` while detached | `--rev HEAD` | 2 | `finding=witness_revision_refused detail=--rev requires a 40-hex commit revision` |
| T4 | attached nonmaster | `git checkout -q -b side` at poison; `--dry-run` | 0 | `tip=d012fad… source=refs/heads/side` (anchor = HEAD's plain branch, printed transparently; unreachable in the jj lane where HEAD is detached) |
| T5 | descendant refused | `--rev $POISON` | 2 | `…must be an ancestor of refs/heads/master` |
| T6 | symbolic HEAD → tag | `git symbolic-ref HEAD refs/tags/nope-tag`; `--dry-run` | 2 | `…HEAD does not name a local branch` |
| T7 | branch-as-symref | `git symbolic-ref refs/heads/mirror refs/heads/side`; HEAD→mirror; `--dry-run` | 2 | `…refs/heads/mirror is not a plain local branch` |
| T8 | symbolic HEAD → missing branch | HEAD→refs/heads/ghost; `--dry-run` | 2 | `…is not a plain local branch` |
| T9 | attached master | `--dry-run` | 0 | `tip=530f40a… source=refs/heads/master` |
| T10 | hostile inherited GIT_* (16 vars) | `env GIT_DIR=<evil>/.git GIT_WORK_TREE=<evil> GIT_INDEX_FILE=… GIT_OBJECT_DIRECTORY=… GIT_ALTERNATE_OBJECT_DIRECTORIES=… GIT_CEILING_DIRECTORIES=/ GIT_COMMON_DIR=<evil>/.git GIT_NAMESPACE=evilns GIT_CONFIG_COUNT=2 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0='*' GIT_CONFIG_KEY_1=core.bare GIT_CONFIG_VALUE_1=false GIT_CONFIG_SYSTEM=… GIT_GRAFT_FILE=… GIT_NO_REPLACE_OBJECTS= GIT_CONFIG_NOSYSTEM= node scripts/freshness-witness.mjs --dry-run` | 0 | `tip=530f40a… source=refs/heads/master` (evil repo master `145c2ffbc5a183f8ba3b99409c539f25f71ac35b` ignored) |
| T11 | invalid fullhash / shapes | `--rev 0000…0000` / `--rev deadbeef…` / `--rev aaaa…` (all 40-hex, nonexistent) | 2 each | `…must be an ancestor…` |
| T11b | 64-hex, 40-hex uppercase, missing value, `--bogus`, `--self-test --dry-run` | as listed | 2 each | first two + missing value: `…requires a 40-hex commit revision`; `--bogus`/combo: `finding=witness_usage` |
| T12 | explicit self-ancestor intentional | `--rev $MASTER --dry-run` | 0 | `tip=530f40a… source=--rev` |
| R1 | replacement forgery | see INFO-2 | 2 | refused; plain git rc=0 control; after `git replace -d` plain rc=1 |
| R1b | default path under replacement | `--dry-run` with `refs/replace` present | 0 | true master printed (sha-based resolution unaffected) |
| R2 | tag object sha | see LOW-1 | 0 | accepted (precision note) |
| R3 | non-commit objects | `--rev <tree-sha>` | 2 | `…must be an ancestor…` |
| P1 | child env sanitization, real run | T10 env set, no `--dry-run` | 0 | `FRESHNESS_GATE verdict=clean … revision=530f40a…` (frozen CLI's own git calls ran against the sandbox, not evil GIT_DIR) |
| P2 | child failure passthrough + explicit old ancestor | `--rev c24eaea14dfc0c4a3848742d31673db5675f9183` (baseline) | 1 | `FRESHNESS_WITNESS tip=c24eaea… source=--rev` then child `verdict=failed finding=witness_too_early detail=epoch=1792018171 threshold=1792022400`; wrapper exit = child exit |
| R4 | global hazard still open (LANE bytes, sandbox run) | `node scripts/check-freshness.mjs --witness HEAD` | **0** | `PIN_MATCH …` then clean gate — bypass demonstrated with HEAD |
| R4b | hazard broader than HEAD | `node scripts/check-freshness.mjs --witness refs/heads/side` | **0** | clean gate on an off-branch tip — frozen parser accepts any non-`--` token |
| T16 | foreign cwd | `cd /tmp && node $SB/scripts/freshness-witness.mjs --dry-run` | 0 | `tip=530f40a… source=refs/heads/master` |
| T18 | selftest under hostile parent env | T10-style env + `--self-test` | 0 | `cases=8 failed=0` |
| LANE | selftest in lane | `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/freshness-witness.mjs --self-test` | 0 | `cases=8 failed=0`; zero `tabi-freshness-witness-*` residue in /tmp (fixture `rmSync` in `finally`, `:251`) |

"Reads lane tip once": `laneRef` produces the tip from exactly one
`rev-parse --verify --end-of-options <ref>^{commit}` (`scripts/freshness-witness.mjs:98-107`); the
explicit path validates the caller literal and never re-resolves. Code-read; consistent with every
dry-run above.

## Doc honesty on the global hazard — no false closure found

Every checked location states the frozen CLI remains directly callable and the wrapper is scoped:
- `corpus/lessons/round-18.md` §Gate: "The guarded wrapper does not prevent direct use of the
  byte-frozen old freshness CLI."
- `corpus/knowledge/harness-hardening-round-18.md:58`: "The wrapper is a guarded entry point, not a
  gate. … It does not stop a direct call to the byte-frozen … which remains bypassable by any caller."
- `corpus/README.md:386-387`: "Frozen `check-freshness.mjs --witness HEAD` remains callable directly;
  `scripts/freshness-witness.mjs` is a guarded caller, not global enforcement."
- `LOG.md:1055`: "guards its own invocation, not direct calls to the frozen CLI."
- Counter probe `.ufo/waves/round-18/measure-c2.mjs:758-781` is behavioral and its evidence string
  itself records "frozen scripts/check-freshness.mjs --witness HEAD remains directly callable";
  `tipPrinted` requires the true `refs/heads/master` hash in detached-poison dry-run output; negative
  control stubs exist (`measure-c2.mjs:1153-1164`).
- Drafts (`.ufo/waves/round-18/drafts/skill-append.md:67-87`, `log-scorecard.md:27`) describe refusal
  semantics without claiming global closure; SCORECARD cells are `L1 FILL` placeholders, not
  measurements. My R4/R4b runs show the honest claim is, if anything, understated (any non-`--`
  witness token works, not just HEAD).

## Residual risk / verification gaps

- LOW-1/LOW-2 as above; no MEDIUM/HIGH finding. Wrapper behavior is fail-closed at every probed
  boundary (all refusals exit 2 with `finding=`; missing `refs/heads/master`, old git without
  `symbolic-ref --no-recurse`, and dubious-ownership would all refuse, not guess).
- The frozen CLI's replace-forgery exposure (INFO-2) is part of the documented open bypass; docs do
  not claim it is closed, but no doc names the refs/replace vector either.
- Not exercised here: the C2 counter's own full red-at-B / green-at-REV run (counter-owned; sibling
  executor lane) and h1–h4/s1 probes — outside this assignment's target. LSP unavailable in this
  environment; verification was by exact-command execution against the REV blob (digest above), not
  by LSP.
- No tools were installed or updated. Sandboxes `/tmp/tabi-r18-reviewwrap`, `/tmp/revwrap-evil` and
  probe scripts removed after evidence capture.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/ReviewWrapper.md
