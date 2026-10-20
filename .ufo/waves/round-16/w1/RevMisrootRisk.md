# RevMisrootRisk — wave-1 fleet-root misroot audit

Seat: TabiR16.RevMisrootRisk-5 (reviewer, leaf). Round 16, wave 1. Audit date 2026-10-20.
Scope: read-only. Everything below is from commands run this session; nothing was written except this file.
No gate, selftest, counter, or browser was run (out of scope). No tool installs (none needed).

Lane root (canonical): `/home/vgpnk/Projects/shokunin/tabi-shokunin` — a **nested git repo**.
Fleet root: `/home/vgpnk/Projects/shokunin` — the session cwd, observed:

```
$ pwd
/home/vgpnk/Projects/shokunin
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --show-toplevel
/home/vgpnk/Projects/shokunin/tabi-shokunin
$ head -1 /home/vgpnk/Projects/shokunin/.gitignore
*-shokunin/
```

Consequence: tabi's repo is **invisible** to fleet `git status`; conversely any tabi-relative path
that resolves at the fleet root lands in the fleet repo and is *visible* there as `??`/` M`.

Summary: the dispatch ships **84/84 Report paths as relative strings** and carries **no `cwd` field**;
every seat inherits the fleet-root cwd. Nothing has misrooted yet (fleet status has no tabi-shaped
entry), but four relative write targets collide with *existing tracked fleet files/dirs*, one of
them destructively (`LOG.md`, `SCORECARD.md`).

---

## 1. Relative path strings in PLAN.md

PLAN.md states at :2 "all paths below are relative to it" (the lane root), and every path literal is
repo-relative. Three classes:

### 1a. Write set (ownership table, `PLAN.md:98,102-112`)

| PLAN line | Relative literal |
|---|---|
| 98 | `.ufo/waves/round-16/<wave>/<Name>.md` (report convention) |
| 102 | `scripts/check-measurement-binding.mjs` |
| 103 | `scripts/selftest-measurement-binding.mjs` |
| 104 | `.ufo/waves/round-16/measure.mjs` |
| 105 | `corpus/evidence/round-16/binding/r15-counter-identity.json` |
| 106 | `scripts/webmcp-loopback-round16.mjs` |
| 107 | `corpus/evidence/round-16/webmcp/fixtures/` |
| 108 | `corpus/evidence/round-16/webmcp/protocol-domain.json` |
| 109 | `corpus/evidence/round-16/webmcp/runtime-pin.json` |
| 110 | `.ufo/waves/round-16/probes/<SeatName>.mjs`, `.ufo/waves/round-16/probes/<SeatName>.json` |
| 111 | `.ufo/waves/round-16/drafts/<SeatName>.md` |
| 112 | `LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`, `corpus/README.md`, `corpus/QUALITY.md`, `corpus/SOURCES.md`, `corpus/knowledge/*`, `corpus/lessons/round-16.md` (L1 only) |

Additional write/receipt literals inside the claim contracts:

| PLAN line | Relative literal |
|---|---|
| 75 | `corpus/evidence/round-16/binding/selftest.json` |
| 76 | `corpus/evidence/round-16/binding/legacy-r15.json` |
| 83 | `corpus/evidence/round-16/webmcp/fixtures/*.html` |
| 88 | `corpus/evidence/round-16/webmcp/receipt.json` |
| 91 | `corpus/knowledge/webmcp-chromium-loopback-round-16.md` |

### 1b. CWD-dependent commands embedded in PLAN.md (read/execute)

| PLAN line | Literal |
|---|---|
| 14 | `node .ufo/waves/round-16/measure.mjs REV --claim C1` |
| 29 | `node .ufo/waves/round-16/measure.mjs REV --claim C2` |
| 57 | `git diff --name-only measuredRevision REV -- <countedInputs + counter.path>` (paths are repo-relative by gate design) |
| 66 | `.ufo/waves/round-15/measure.mjs` (the `--legacy` adapter input) |
| 74 | `measure.mjs --claim C1` |

### 1c. Read-only source/evidence literals

| PLAN line | Literal |
|---|---|
| 11 | `corpus/lessons/round-15-verifier-spotcheck.md:120-121` |
| 82 | `scripts/aria-loopback-round13.mjs:118-140` |

The 84 deployed prompts add 22 distinct relative path strings beyond PLAN, e.g.
`.ufo/waves/round-15/measure.mjs`, `corpus/evidence/round-15/measurements.json`,
`corpus/evidence/round-13/aria/`, `corpus/evidence/round-14/aria-metadata/corrected.json`,
`corpus/evidence/pstack-20261015/baseline-census.tsv`, `corpus/knowledge/*.md`,
`scripts/check-aria-metadata.mjs`, `scripts/check-freshness.mjs`, `scripts/check-round-contract.mjs`,
`scripts/check-sources.mjs`, `scripts/check-user-round-contract.mjs`
(extracted from `.ufo/waves/round-16/w1/spec.json` items' `prompt` fields).

## 2. `Report:` trailer convention — and its one weakness

Three declarations, all relative:

- `PLAN.md:98`: `## Ownership (disjoint write sets; reports at \`.ufo/waves/round-16/<wave>/<Name>.md\`)`
- `.ufo/waves/round-16/w1/spec.json:3`: `"reportDir": ".ufo/waves/round-16/w1"`
- `.ufo/waves/round-16/w1/spec.json:5` (shared context, verbatim):
  "Every `Report:` trailer path is relative to /home/vgpnk/Projects/shokunin/tabi-shokunin — write it at
  /home/vgpnk/Projects/shokunin/tabi-shokunin/<that path>. Use absolute paths under
  /home/vgpnk/Projects/shokunin/tabi-shokunin for every read/write; a relative path resolves to the fleet root and is a misroot."

Measured facts about the *deployed* prompts (`.ufo/waves/round-16/w1/validation.json`,
`taskCall.tasks`, 84 entries; cross-checked `dispatch-result.json`, 168 occurrences = 84×2):

- 84/84 tasks carry `Report: write your scoped findings to .ufo/waves/round-16/w1/<Name>.md`.
- 84/84 are **relative** (0 absolute).
- 84/84 basenames equal the task name.
- `assignments.json` (name→agent-id map) and the task objects have **no `cwd` field**; spawn inherits the
  session cwd, observed as the fleet root.

So the only thing standing between a seat and a fleet-root write is the seat honoring the prefix clause.
This is a convention, not a mechanism: nothing in dispatch/validation canonicalises the path.

## 3. Fleet status snapshot (read-only, taken 2026-10-20 ~11:33 -0300)

```
$ git -C /home/vgpnk/Projects/shokunin status --porcelain
```
54 entries: **1 modified + 53 untracked**, every one under the fleet `.ufo/` tree. None is in
`tabi-shokunin` (which the fleet `.gitignore:1` hides anyway).

- Modified (fleet-owned, do not touch): `.ufo/watchdog.log`
- Untracked, fleet launcher baselines — `.ufo/state/<lane>.report-baseline` (9):
  `kaidoku`, `kake`, `kama`, `mado`, `mori`, `souji`, `tabi`, `tameshi`, `tsukuroi`.
  `tabi.report-baseline` (68 B, mtime 2026-10-20 10:51:14, body `16 e3b0c442…b855` = field separator +
  sha256 of the empty string) is written by the hyaku fleet driver, **not** by tabi's repo. L1 must not
  touch, stage or commit it.
- Untracked, fleet lanes' reports — `.ufo/waves/hyaku/jj-w1/reports/` (44 `.md`):
  `JjAuditAudio, JjAuditChousa, JjAuditClosurePrompt, JjAuditFleetCommit, JjAuditGameDev2d, JjAuditGameDev3d,
  JjAuditInlineSh, JjAuditKagi, JjAuditKaidoku, JjAuditKake, JjAuditKama, JjAuditKasegi, JjAuditKengaku,
  JjAuditKotoba, JjAuditKotodama, JjAuditKumitate, JjAuditLore, JjAuditMado, JjAuditMori, JjAuditPromptText,
  JjAuditRevenger, JjAuditSouji, JjAuditSourcesCensus, JjAuditTabi, JjAuditTameshi, JjAuditTsukuroi,
  JjAuditWatchdog, JjConnectorProvinces, JjCriticProtocol, JjDocAutoTrack, JjDocConcurrency, JjDocGitIndex,
  JjDocHeadAttachment, JjDocHooksAttributes, JjDocIdentity, JjDocImmutable, JjDocLargeRepo, JjDocOpLogGrowth,
  JjDocPush, JjDocRecovery, JjDocWorktrees, JjRevengerLaneJjState, JjRevengerPriorProbe, JjTrialRevenger`
  (all `.md`; this is a different fleet round's lane, `hyaku/jj-w1`, not tabi's).

Also pre-existing and **tracked in the fleet repo**, occupying the same relative namespace tabi's PLAN
uses (these are never to be edited by tabi seats):

```
$ git ls-files .ufo/waves/round-16
.ufo/waves/round-16/before.md
.ufo/waves/round-16/clobber/classify.out
.ufo/waves/round-16/clobber/classify.sh
.ufo/waves/round-16/dispatch.md
.ufo/waves/round-16/gate/mutate.sh
.ufo/waves/round-16/gate/runs.md
$ git ls-files LOG.md SCORECARD.md
LOG.md
SCORECARD.md
```

No tabi-shaped residue exists right now:

```
$ git status --porcelain | grep -E 'corpus/|scripts/(check-measurement|webmcp-loopback)|round-16/w1|^ M (LOG|SCORECARD)'
NO-TABI-SHAPED-ENTRIES
```

## 4. Collision analysis — what each relative write target does at the fleet root

Per-path existence probe at fleet root vs lane root (`os.path.lexists`, observed):

| PLAN write literal | exists@fleet | exists@tabi | effect if resolved at fleet root |
|---|---|---|---|
| `LOG.md` | **True** (941 lines, `# shokunin (main repo) — Iteration log`, tracked) | True (961 lines, `# tabi-shokunin — Iteration Log`) | **overwrites a tracked fleet file** (`cmp` → DIFFERENT) |
| `SCORECARD.md` | **True** (505 lines, `# shokunin (main repo) — Scorecard`, tracked) | True (730 lines, `# tabi-shokunin — Scorecard`) | **overwrites a tracked fleet file** (`cmp` → DIFFERENT) |
| `.ufo/waves/round-16/w1/<Name>.md` | dir `.ufo/waves/round-16/` **True** (`w1` absent) | True (`w1` present) | creates `w1/` **inside the fleet's tracked round-16 wave dir** |
| `.ufo/waves/round-16/measure.mjs` | dir True, file absent | file absent (wave-1 not landed yet) | new stray in fleet wave dir |
| `.ufo/waves/round-16/probes/`, `drafts/` | dir True, subdirs absent | subdirs present | new strays in fleet wave dir |
| `scripts/check-measurement-binding.mjs` | dir `scripts/` **True**; file absent | file absent | new untracked file in fleet `scripts/` (fleet dir holds `hyaku/`, `fixtures/`, `shokunin-watchdog.sh`, `sources-census.sh`) |
| `scripts/selftest-measurement-binding.mjs` | same | same | same |
| `scripts/webmcp-loopback-round16.mjs` | same | same | same |
| `corpus/evidence/round-16/…` (5 paths) | `corpus/` **absent** | present | creates a brand-new fleet-root `corpus/` tree |
| `corpus/knowledge/webmcp-chromium-loopback-round-16.md` | `corpus/` absent | present | same |
| `SKILL.md`, `PROVINCE.md` | absent | present | new stray at fleet root |

Name-collision check for the fleet `scripts/` dir returned no overlap:
`ls /home/vgpnk/Projects/shokunin/scripts | grep -Ei 'measure|webmcp|binding'` → `NONE`.
So the `scripts/*` case is pollution, not overwrite. The `LOG.md`/`SCORECARD.md` case *is* overwrite.

Silent-read hazard (the inverse direction): L1/scribes reading `LOG.md` or `SCORECARD.md` with a
relative path from the fleet root would silently read the **fleet's** documents (941/505 lines,
different content) instead of tabi's (961/730) — no error, wrong source. All other read targets are
fleet-absent, so they fail loudly with ENOENT (safe failure): `corpus/…`,
`scripts/aria-loopback-round13.mjs`, `.ufo/waves/round-15/measure.mjs` (fleet `round-15/` exists but has
no `measure.mjs` — verified `ls` ENOENT), `corpus/evidence/round-15/measurements.json`.

## 5. Anomaly observed (not a finding against any seat)

Fleet `.ufo/waves/round-16` has directory mtime `2026-10-20 11:14:04`, while every child is
`2026-10-19 20:10` and no child matches `-newermt '2026-10-20 00:00'`:

```
$ stat -c '%n %y' .ufo/waves/round-16 .ufo/waves/round-16/*
.ufo/waves/round-16 2026-10-20 11:14:04
.ufo/waves/round-16/before.md 2026-10-19 20:10:14
...   (all children 2026-10-19 20:10:14)
```
A directory mtime advances on child create/delete, so something was created and removed there at 11:14
(the tabi wave launched 10:51:16 per `.ufo/watchdog.log`). `[INFERENCE]` plausible near-miss: a
`w1`/report mkdir resolved against the fleet root and then cleaned up. **No residue is present now**
(fleet status has no tabi-shaped entry; `.ufo/waves/round-16/w1` absent). Cause not proven; recorded so
L1 does not mistake a later stray for this wave's normal output.

## 6. Residual risk and verification gaps

- I observed only my own cwd (`pwd` = fleet root) and the absence of a `cwd` field in
  `assignments.json` / `taskCall.tasks`. I cannot observe the runtime cwd of the other 83 seats; I did
  not read their processes or transcripts.
- I did not verify that the runtime layer rewrites a relative Report path before writing. Observational
  support only: 11 wave-1 reports have already landed correctly under tabi
  `.ufo/waves/round-16/w1/` (BindLegacyEvidence.md, ErratumAnchors.md, Draft*.md, WebmcpProtocol.md,
  WebmcpRuntimePin.md, mtimes 11:28–11:30), and the fleet root has no `w1/`.
- The fleet status snapshot is moment-in-time and other lanes (kaidoku, souji, mado, kama) are live, so
  the 54-entry baseline will legitimately change; only tabi-shaped entries are a signal.
- Not run (by scope): any gate, counter, selftest, browser, or `measure.mjs` — unrun.

## 7. Cheap post-wave guards for L1 (read-only, in order)

1. `git -C /home/vgpnk/Projects/shokunin status --porcelain | grep -E 'corpus/|scripts/(check-measurement|selftest-measurement|webmcp-loopback)|round-16/(w|drafts|probes)|^ M (LOG|SCORECARD)\.md'`
   → must be empty.
2. `test ! -e /home/vgpnk/Projects/shokunin/.ufo/waves/round-16/w1 && test ! -e /home/vgpnk/Projects/shokunin/corpus`
   → both must exit 0.
3. `git -C /home/vgpnk/Projects/shokunin diff --quiet -- LOG.md SCORECARD.md` → exit 0 (fleet docs untouched).
4. `git -C /home/vgpnk/Projects/shokunin status --porcelain | grep '^??' | grep -vE '^.. \.ufo/state/[a-z-]+\.report-baseline$|^.. \.ufo/waves/hyaku/jj-w1/reports/'`
   → must be empty apart from live-lane churn; the 9 baselines and 44 `jj-w1` reports are never staged.
5. Tabi side: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain` must contain only
   `.ufo/waves/round-16/` and round-16 owned paths — a bare `LOG.md`/`SCORECARD.md` modification there is
   expected (L1 writes them), a *missing* one is not.

## 8. Bottom line

- Write every PLAN/report path through the absolute lane root; the dispatch gives you a relative path
  and no cwd guarantee (84/84 relative, 0 absolute, no cwd field).
- Hardest collision: relative `LOG.md` / `SCORECARD.md` overwrite **tracked fleet files** — silent and
  destructive. Next: `.ufo/waves/round-16/…` writes land inside the fleet's tracked round-16 wave dir.
  Then `scripts/*` strays, then a new fleet-root `corpus/`.
- As of this audit the fleet status is clean of tabi-shaped paths; the one anomaly is the
  11:14:04 mtime bump on fleet `.ufo/waves/round-16` with no surviving child (`[INFERENCE]`, no residue).
