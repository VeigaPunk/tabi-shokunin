# W2SHONEN — SHONEN box audit (tabi round 23, wave 2 · seat L1Tabi23.W2SHONEN)

**Verdict: PASS-with-defects.** Four canonical boxes, one bullet + exactly one 2-space evidence line each, all `[~]`; every pointer resolves to a committed regular blob at `a89f1935f523a64b00991d792fca6a8c0d321948`. No box may be `[x]` (no non-author verifier exists; the lane gate fails `[x]` closed). Three `[~]` pointers under-describe their own staleness or range; none is unresolvable, so **no box is blocked at `[~]`**.

**Axes:** 1 structural conformance · 2 pointer existence · 3 pointer currency/truth · 4 marker integrity · 5 gate coverage of axes 2–4.

## Box inventory (`SHONEN.md`: 976 B, 12 lines + final LF, sha `cca7c1cb…`)

| # | Mark | Pointer | Resolves | `[~]` honest as written | `[x]` |
|---|---|---|---|---|---|
| 1 decision tables/sources | `[~]` | `SKILL.md` §Approval table `:697`, §Evidence ladder, §Runbook, `:1598-1617` | yes — `:697` `## Approval table — finalized`, `:361` `## Evidence ladder — climb to the rung the claim needs`, `:87` `## Runbook — loopback capture, start to finish` | partly — naked, over-broad range (F2) | no |
| 2 end-to-end task in LOG.md | `[~]` | `corpus/knowledge/multi-step-journey.md` §1–§2, §7; `LOG.md` round-3 | yes — `:12`/`:71`/`:252`; `LOG.md:76` "round 3: probation-completing round" | yes | no |
| 3 executable w/o oral context | `[~]` | `corpus/knowledge/executor-test-sufficiency.md` §0, §4 | yes — `:20` condition, `:175` verdict, `:177` SUFFICIENT | partly — grades a 576-line SKILL, not HEAD (F3) | no |
| 4 no cross-domain bleed | `[~]` | `PROVINCE.md:3-19`; refusal receipt | yes — `:3-4` Domain, `:6-13` Owns, `:15-19` Refuses; receipt 95 B, blob `6596b7907730` | partly — receipt is lane presence, not "held" (F4) | no |

Box strings equal `check-round-contract.mjs:14-19` `BOXES` verbatim; preamble = the four canonical seed lines (`:212`); no trailing prose.

## Findings

**F1 (info, PASS).** `python3 -c "b=open('SHONEN.md','rb').read();print(b'\r' in b,b.endswith(b'\n'),b.endswith(b'\n\n'))"` → `False True False` — one line per box, LF endings, single trailing newline.
**F2 (medium, box 1).** `` `:1598-1617` `` carries no file token and overshoots: the decision table is `:1604-1608`; `:1610` is `### Sources gate registry`, `:1614` a registry row, `:1616-1617` a note. Command: `awk 'NR>=1595&&NR<=1618{printf "%d: %s\n",NR,$0}' SKILL.md`. `SKILL.md:705` requires line pointers to resolve by quoted rule text, so a naked range is the one form that cannot.
**F3 (medium, box 3).** Sole evidence grades a revision 31 commits behind HEAD: `git show 094c27a:SKILL.md | sha256sum` → `452bc514d387…`, 576 lines (matching `executor-test-sufficiency.md:308`); `git show HEAD:SKILL.md | sha256sum | cut -c1-12` → `a2c540dcc173`, 2453 lines; `git log --oneline 094c27a..HEAD -- SKILL.md | wc -l` → `31`. Still `[~]`-writable, but only with the graded revision named.
**F4 (medium, box 4).** `wc -c corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt` → `95`; `cat` shows four `present <lane>-shokunin` lines — sibling existence, not that "refusal routes … held". Route wording resolves in `PROVINCE.md:15-19`; the receipt alone cannot carry the second clause.
**F5 (info, marker integrity).** No `[x]` written, none eligible: `SHONEN.md:6` records the prior `[x]` verifiers as lane-dispatched; `LOG.md:519-521` "the former `[x]` verifiers TABI-B4 and TABI-R3-4 were lane-dispatched subagents, so not non-author"; `claims.json` `notClaimed[2]`; round entry `LOG.md:1644-1645`, `:1703-1706`. `check-round-contract.mjs:225` fails *any* `[x]` ("no committed non-author verifier allowlist"), so `[x]` is unwritable by construction.
**F6 (medium, gate coverage).** Both gates check existence only: `check-round-contract.mjs:229` (`regularBlob`), `:247` `if (after === before) return;` — an unchanged SHONEN.md skips the policy check entirely (round 23's case) — and `:236-238` compares `sha256(preamble literal + BOXES constant)` to `SHONEN_SEED_SHA256`, constant vs constant: it can never fail although `:184-185` claims it enforces the seed. `check-user-round-contract.mjs:257-262` strips `:N-M` and accepts any committed path, applied at `:296`. F2–F4 are invisible to the gates and only a byte-reading seat catches them.
**F7 (info).** Round 23 moves SHONEN.md not at all: `sha256sum SHONEN.md` equals `git show a89f193:SHONEN.md | sha256sum` → `cca7c1cb4eee90d95f797c7b7ee36242d519563477c6653c3f3eaae4571923f1`. The report's SHONEN section must read as carried-forward `[~]` with historical pointers, not as this round's evidence.
**F8 (low, box 2).** Box 2 gained fresh bytes but they are uncommitted at read time: `git status --porcelain` shows ` M LOG.md`; round-23 entry at `:1649-1708`; it forward-references "the round report" (`:1707-1708`) while `ls /home/vgpnk/Projects/shokunin/.ufo/reports/round-23/tabi.md` → *No such file*.

## Boxes that cannot be written at `[~]`

None. Every pointer path is a committed regular blob at HEAD (`git cat-file -e HEAD:<path>` ok for `SKILL.md`, `PROVINCE.md`, `LOG.md`, `corpus/knowledge/multi-step-journey.md`, `corpus/knowledge/executor-test-sufficiency.md`, `corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt`).
Three lines need a qualifying clause to stay honest — box 1 name `SKILL.md` inside the range and quote the rule text; box 3 name `094c27a`/`452bc514d387` as the graded revision; box 4 say "routes named in PROVINCE.md", not "held". Without the clause they over-claim while passing both gates (F6).

## Residual risk / verification gaps

- The report's SHONEN section (one report line per box) does not exist yet; only SHONEN.md itself was audited.
- `check-round-contract.mjs` was read, not executed (the L1 runs lane gates once); gate statements are static readings of `:208-249` and `:305-337`, cross-checked against committed blobs.
- `[x]` stays unreachable even for a genuine non-author verifier until `:225` gains an allowlist — a gate capability gap recorded here, not a lane request.
