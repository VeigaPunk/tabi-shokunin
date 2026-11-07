# tabi round 74 — verifier spot-check (non-author)

author: hyaku closure (non-author integrator, @m_zfl)

Scope: lane-round tabi r74, base `c72235d6aebca89269809050e983d53df36273f5` → tip
`1f60b113b87b7fc83f9d5f837d89e53fab6a99e5`; report `.ufo/reports/round-74/tabi.md` (fleet repo).
Driver digest (`.ufo/watchdog.log` lines 3126/3144):
`2026-11-06T23:08:55-03:00 launch tabi round=74 pgid=212300 driver=hyaku-inline attempt=1`;
`2026-11-07T01:24:43-03:00 complete tabi round=74; hyaku-inline attempt=1`.
Gates were not executed (§Gate standard, Closure consequence): their committed evidence was read.
Plain counts and the source re-opens below were re-run by this closure on 2026-11-07.

## 1. Step-1 conformance

- Report commit: `git log --format='%an %H' -- .ufo/reports/round-74/tabi.md` →
  `tabi-shokunin 65cab8b96ee971120c489831ebc9a331c3cbafe1` (committer date 01:24:18, after the lane
  tip 01:22:55 and before the driver's `complete` 01:24:43). Lane identity: pass.
- `## SHONEN` heading: `grep -c '^## SHONEN'` → 1; four `[~]` lines, one per `SHONEN.md` box (4 boxes). Pass.
- Cited commits: `b70e0a27 8faa903a ca30e1a3 19c301da db59ed42 503fde39 1f60b113` and base `c72235d6`
  each resolve and `git merge-base --is-ancestor <full> master` holds (8/8). All seven round commits
  are authored and committed by `tabi-shokunin <tabi@shokunin.local>`.
- Lane state: `jj-lane.sh state` → `branch=master local=1f60b113… remote=1f60b113… ahead=0 behind=0
  head=detached tracked=0 untracked=0`; `git status --porcelain | wc -l` → 0;
  `git ls-remote origin refs/heads/master` → `1f60b113b87b7fc83f9d5f837d89e53fab6a99e5`. Pass.
- Prompt `.ufo/prompts/tabi-round-74.md` (fleet commit `afbbd111`, 23:08:25, before launch) carries the
  template sections 1–5 (MISSION/AXES, claims, frontier step, L2 floor, report contract with SHONEN,
  commit scope) and the hyaku addendum §6. Pass.
- Freeze ordering: claims `8faa903a` (00:23:04) → digests D `ca30e1a3` (00:23:10) → scored run
  `19c301da` (00:29:47). `b70e0a27` carries author date 23:08:07 (inherited jj change date, equal to
  the base's) and committer date 00:22:57, so no pre-launch work. `freeze.txt` digests re-hashed at
  the tip with `sha256sum`: driver `afacee1b…2dc2`, counter `5901d895…d251`, battery `8c0dd93a…fb26`,
  kill power `dcc8308b…7c69`, claims `423ae94f…f6d6`, `run-scored.sh` `c6527ccf…9c3c`: 6/6 match.
- Defects: none that bear on status.

## 2. Claim C1 (coverage): capability `chromium-ime-composition-linux`, generation r74

Re-measured (plain counts over committed bytes, base → tip):

| Measure | Command | Reported | Observed |
|---|---|---|---|
| capability row | `git show <rev>:SCORECARD.md \| grep -c '^| \`chromium-ime-composition-linux\` |'` | 0 → 1 | 0 → 1 |
| notes citing `imeSetComposition` | `git grep -l imeSetComposition <rev> -- corpus/knowledge \| wc -l` | 0 → 1 | 0 → 1 |
| knowledge files | `git ls-tree -r --name-only <rev> corpus/knowledge \| wc -l` | 86 → 87 | 86 → 87 |
| SOURCES rows | `git show <rev>:corpus/SOURCES.md \| grep -cE '^\| S[0-9]{3} '` | 186 → 195 | 186 → 195 |

Evidence-verified (committed outputs of lane-owned gates; not re-executed):

- Leg (a): `scored/c1-counter-a.json` → `verdict: clean`, `checkCount: 148`, nonce
  `tabi-r74-l1-ca30e1a3b7b2`; `c1-counter-a.exit` and `c1-driver-a.exit` = 0. The receipt
  `corpus/evidence/round74/chromium-ime-composition/receipt.json` lands in `19c301da`.
- Leg (b): `w1/R74Exec1/counter.json` → `verdict: clean`, `checkCount: 148`.
- Leg (c): `c1-negatives-a.json` → `allOk: true`, `passed: 239`, `positiveOk: true`;
  `c1-kill-power-a.json` → `holds: true`, `unmutatedExit: 0`, forceTrue 148/148, semantic 26/26.
- Leg (d): row 0 → 1 (re-measured above); the note's `source:` line cites S187–S193.
- Self-test: `scored/selftest-r74-gates.out` ends `clean=true cases=12 failed=none`, `exit=0`.
  Registry row `check-imecompose-r74` exists at `SKILL.md:3188` `## Round 74 gate registry`.
- Do-nothing control: `controls/c1/controls-summary.json` `allOk: true`. With no receipt the counter
  exits 2; with the r73 pinch receipt it exits 1. Both replay forgeries and `replay-forged-1e-12` exit 1.
  The declared limit witness `limit-full-identifier-rewrite` exits 0.
- Post-freeze: `lesson-proof/postfreeze-checks.json` `allOk: true`. With the three probe receipts
  added as priors, the scored receipts stay clean, so they are not relabels of the uncounted probes.

Falsified frozen sentences (`claims.json` `priorSet` and `limit`). R74Critic and R74Review1 showed
that probe relabels pass, and that a receipt with one focus event added or removed escapes the
near-match. Ruling: these sentences describe a weakness of the instrument. They do not make the
scored receipts fake. The receipts are two independent cold runs (L1 and R74Exec1, distinct
nonces). The post-freeze check rules out relabelling of the uncounted probes. The correction is
recorded append-only in SCORECARD `## Round 74`, in Mistakes rows 4–5 and in QUALITY 139–140. The
note's `## Limits` (lines 106–107) carries the same correction.
`git grep` finds the old sentence only in the frozen `claims.json`, the correction, and the wave
output, so it stands nowhere uncorrected. **C1 verifies.**

### Per-axis verdicts

| Axis | Verdict | Basis |
|---|---|---|
| coverage | improved | C1: capability row 0 → 1, legs (a)–(d) hold |
| calibration | unchanged | No claim. The false frozen sentences were corrected and marked in the same round (LEARNING: harm = false and left unmarked). No calibrated entry was made false. |
| depth | unchanged | no claim; `SCORECARD.md` diff adds only the `## Round 74` section (`git diff --numstat` shows 0 deleted lines across all 451 files) |
| freshness | unchanged | no claim |
| operability | unchanged | no claim |
| adjacency | unchanged | no claim; R74Connector overlap none; `PROVINCE.md` untouched |

## 3. Discernment spot-check (`corpus/lessons/round-74.md` `## Gate`)

Sources were re-opened from `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`
and decoded from base64. The line counts and the sha256 prefix/suffix of all five fetched files match the rows (Input.pdl 336 `5bbc6e23…6e3d`,
input_handler.cc 2343 `72cf0d1d…24f4`, input_method_controller.cc 2163 `7c72e618…bde4`, event_target.cc
1175 `46bfd353…92d0`, editing_utilities.cc 1999 full `dda549bb…b1a0`).

| Item | Decision | Re-opened source | Agree? | Reason |
|---|---|---|---|---|
| `knowledge/chromium-ime-composition-runtime-round-74.md` | admit | S189 l.1084 `!DispatchCompositionStartEvent(GetFrame().SelectedText())) {`; l.409 `EventDispatcher::DispatchScopedEvent(*target, *event);`; S190 l.868 `event.SetTrusted(true);`; S193 l.1772–1773 null-target return | agree | Every located quote is present verbatim at the cited line. They source the selected-text start data, the scoped (queued, untrusted) `compositionend`, and the missing `beforeinput` with no target. The note opens with `source:`, `verified-at:` and `recheck:`. |
| "IME composition delivers keydown keyCode 229 before each update" | reject | S188 `InputHandler::InsertText` (l.1281) / `ImeSetComposition` (l.1306–1355) | agree | The handlers call only `ImeCommitText`/`ImeSetComposition` on the widget input handler. No key event is constructed in l.1281–1365. |
| "`Input.imeCommitComposition` commits the composition" | reject | S187 `grep -n 'imeCommitComposition\|command ime\|command insertText' Input.pdl` → l.143 `command insertText`, l.149 comment, l.151 `command imeSetComposition` | agree | The name appears only in a comment (l.149). No command of that name is declared at this tag. |

SOURCES.md row re-opened: **S193**. The scope "only lines 1767–1780 are mined" matches the decoded
file: `DispatchBeforeInputInsertText`, with the null-target return at 1772–1773. The located quote in
the Gate section, "if (!target) return DispatchEventResult::kNotCanceled;", is 4 words (≤25) and is
present verbatim. The full sha256 `dda549bb5a5c97d3455c648f7a211daac858b037453deeddf52a017a8dc8b1a0`
matches.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → `tabi ok
…/corpus/SOURCES.md`, exit 0, 27 W04 (S187/S188 duplicate URLs across scopes, as reported).

## 4. Trend verdicts

- **expansion: improved.** One capability was admitted (row 0 → 1). One knowledge entry was added on
  ground the coverage map did not hold (86 → 87); its `source:` cites `mined` rows S187–S193. The
  registry went from 186 to 195 rows.
- **quality: improved.** The round-73 1e-12 timeline escape is refused (`replay-forged-1e-12` exit 1).
  S194–S195 source the note's two mechanisms that were only measured before. The falsified frozen
  sentences are marked in SCORECARD, the lesson, QUALITY and the note. No admitted entry failed its
  re-check here.
- **discernment: improved.** The spot-check agrees with the gate on 1 admit and 2 rejects. Five
  mistakes were mined with proofs that can fail, and they produced QUALITY 139–140.
  Disagreements: none.

## 5. Routed defects (lane fixes next round)

1. Before any further IME claim, enumerate the prior set by schema at the freeze parent (QUALITY 140).
   Make the near-match survive inserted or deleted events (R74Review1 b4/b5).
2. Kill power must refuse a crash as a kill. The battery must require its laundered receipts
   (R74Review2 F1/F2). Add the tolerance weakenings F4/F5 as battery cases.
3. R74Mut1: 28 of 54 extra mutants survive, 19 of them with acceptance witnesses. Fold those cases
   into the next generation.
4. The counter output must record its prior set (R74Review3 F1).
5. Carried from r73: the pinch cross-generation prior set (QUALITY 138), the R73Mut1 survivors, and
   r73 routed defect 4.

Operator note (promotion is operator-owned): SHONEN boxes 1, 2 and 4 look checkable by a non-author
from the pointers given (`SKILL.md` registry and decision sections, `LOG.md ## Round 74`,
`PROVINCE.md` plus R74Connector). Box 3 rests on lane seats only.
