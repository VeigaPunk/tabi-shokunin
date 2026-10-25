# ScribeLog — round-23 LOG.md draft (append-only; not landed)

Status: DRAFT for the landing commit; no revision beyond the baseline exists at draft time (`git log --oneline -1` → `a89f193`), so each "after" is an observation on uncommitted bytes (auditor sha256 `1092ef14f5635c46dbea9fceda55279f5afe8dafb64c0e8ac03e7dc10bbac7fb`) at 2026-10-25 04:13–04:16 -03:00. L1 must re-run the commands at the landing revision.

## Entry to append to LOG.md

## Round23 — pre-data defect auditor and one CSRF admission gate (2026-10-25)
Claims frozen before data (`.ufo/waves/round-23/claims.json`, `frozenBeforeData:true`) at baseline
`a89f1935f523a64b00991d792fca6a8c0d321948`. C1 operability (lowest non-retired tie at 8; capability
acquisition): a lane-owned fail-closed auditor `scripts/round-evidence-audit.mjs` deriving six defect classes
from a round's committed wave bytes, reproducing what the round-22 non-author spot-check routed
(`corpus/lessons/round-22-verifier-spotcheck.md` §Routed defects); target 0→6 distinct `findings[].class`
on round-22 evidence. C2 coverage (documented-upstream only, no credit measured): admit one staged shokuknow
entry (CSRF defence-shape boundary; frontier "CSRF-checked submits untested by rule") only after this lane
re-opens every cited source and appends the two SOURCES rows it cites, re-pointed by document; target 0→1.
Wave: one W1 wave `tabi-r23-w1`, 44 declared lanes (`w1-spec.json` `maxLanes:44`, `items.length:44`) inside
the 32–64 band (`w1-dispatch.json` `policy.waveMinLanes:32`, `waveMaxLanes:64`); round total 44, inside the
≤128 cap. Roles: scout10, critic4, reviewer10, executor8, scribe8, connector2, mutation-tester1, sentinel1.
Measurements (commands exact; provisional standing in the bounds):
- before: `git cat-file -e a89f193:scripts/round-evidence-audit.mjs` → fatal ("exists on disk, but not in
  the revision"), so 0 classes were mechanically detectable at baseline.
- `node scripts/round-evidence-audit.mjs --rev a89f193 --round 22 --json` → exit1, 7 findings over 6
  distinct classes: c1-refusal-arithmetic (cited 23, derived 24, `w2-cap-refusal-*` + `w2b-cap-refusal-*`);
  c2-wave-caps (w2b `maxLanes:65` > `waveMaxLanes:64`, round 129); c3-gate-spotcheck (`no-spotcheck-line`);
  c4-stale-attempts (one "Stale-lane: none" line against 12 attempt artifacts); c5-registry-identities
  (65 spawned, 65/65 without `agentId`); c6-landed-log-binding (2 rows citing commits touching no `LOG.md`).
- `node scripts/round-evidence-audit.mjs --selftest` → `cases:12, passed:12`, exit0, one red (trips) and one
  green (clears) mutant per class.
- Control miss, recorded not hidden: round-21 evidence is NOT clean —
  `… --rev 5f585773258b33d2d514b00cd0b0775333578db6 --round 21 --json` → exit1, 2 findings (c1 "no citation
  derivable", c3 no-spotcheck-line). The declared control ("must not yield the round-22 classes") does not
  hold as written; the clean-fixture control dir `.ufo/waves/round-23/fixtures/` is empty at draft time.
Six routed-defect corrections, each made mechanically derivable rather than restated:
1. refusal arithmetic — the superseding figure is 24 (13 W2 + 11 W2b whole-payload refusals); "23" is
   superseded and the filed report is not rewritten.
2. wave/round caps — this round stays at 44 lanes and 44 seats; the round-22 65-lane wave and 129-seat total
   are not repeated.
3. Gate spot-check row — the round-23 lesson Gate must carry the result or an explicit "owed to closure"
   line; its absence is exactly what c3 detects.
4. stale-lane grading — graded per dispatch attempt, not as one round-level line.
5. registry identities — every spawned member must carry `agentId`; at draft the round-23 registry holds
   44/44 `agentId: null` (`swarm-registry.json` `createdAt` == `updatedAt` `2026-10-25T07:09:04Z`), so c5
   will fire on this round's own evidence unless bound.
6. LOG binding — each landed-changes row names the commit that carries its LOG entry; this entry lands in the
   landing commit that carries the auditor and the evidence.
Frontier step: C2 before 0 (`git grep -lE '^source: S10[23] ' a89f193 -- corpus/knowledge | wc -l`) and
SOURCES 101→103 in the worktree (`grep -cE '^\| *S[0-9]+ *\|' corpus/SOURCES.md` → 103), uncommitted, so no
after value is asserted. Both cited sources were reopened: SrcS102 refused the staged singular "offers a
robust defense against CSRF attack" (absent from draft-13, which reads "offer" at line 2815) and the entry now
quotes the source form; SrcS103 confirmed both OWASP spans verbatim but found both section paths misplaced,
and the appended rows cite "Employing Custom Request Headers for AJAX/API" and "Dealing with Client-Side CSRF
Attacks (IMPORTANT)", with access date 2026-10-25, fetched-byte digests and `used-by`
`corpus/knowledge/csrf-defense-shape-boundary.md`. Id note: staged append rows S102/S103 are CDP documents,
so the entry's documents — that file's S145 (RFC 6265bis §8.8.1) and S146 (OWASP CSRF sheet) — were
re-pointed by document, not by id.
Landed paths (untracked at draft, `git status --porcelain`): `scripts/round-evidence-audit.mjs`,
`.ufo/waves/round-23/**`, `corpus/evidence/round-23/c1-measurements.json`,
`corpus/knowledge/csrf-defense-shape-boundary.md`, `corpus/SOURCES.md` (+2 rows). Seats: 6/44 reports present,
0 dead, 0 replaced; final counts owed to L1.
Tooling: nothing installed or upgraded (no pacman/uv/cargo/npm transaction run; host pacman transactions remain paused by the orchestrator ruling).
Honest bounds: the auditor is uncommitted at draft, so its six-class reading is a provisional observation on
frozen round-22 input, not a landed measurement; the round-21 control is clean neither in the auditor's
behaviour nor by an empty fixture directory. Every seat is lane-dispatched, so every finding is author-side;
no non-author admit/reject agreement, no axis movement (all axes unchanged at 8/9/8/8/9/8) and no browser run,
real site or served-wire identity is asserted.

## Findings (each with its command)

1. C1 after-value provisional, not landed: `node scripts/round-evidence-audit.mjs --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --json` → exit1, 6 distinct classes / 7 findings, on an untracked script.
2. C1 selftest green: `node scripts/round-evidence-audit.mjs --selftest` → `cases:12, passed:12`, exit0.
3. C1 baseline absence: `git cat-file -e a89f193:scripts/round-evidence-audit.mjs` → fatal, path not in revision.
4. Declared round-21 control FAILS: `node scripts/round-evidence-audit.mjs --rev 5f585773258b33d2d514b00cd0b0775333578db6 --round 21 --json` → exit1 with c1 (no citation derivable) and c3; frozen claims.json calls round-21 a 0-finding control. L1 must either keep them as true round-21 findings and restate the control, or drop those two checks from the counted set.
5. Clean-fixture control absent: `ls .ufo/waves/round-23/fixtures` → empty; no on-disk clean round yields 0.
6. Own-wave c5 exposure: `node -e` over `.ufo/waves/round-23/w1/swarm-registry.json` → 44/44 `agentId: null`, so c5 fires on round-23 itself until identities are bound.
7. C2 uncommitted, committed value 0: `git grep -lE '^source: S10[23] ' a89f193 -- corpus/knowledge | wc -l` → 0; worktree `grep -lE` → 1 file, `grep -cE '^\| *S[0-9]+ *\|' corpus/SOURCES.md` → 101→103.
8. C2 quote correction: `grep -n 'offer a robust defense' corpus/knowledge/csrf-defense-shape-boundary.md` → line 20 plural; SrcS102's refusal resolved by correcting the span, not by a note.
9. C2 section paths corrected: `sed -n '116,117p' corpus/SOURCES.md` → "Employing Custom Request Headers for AJAX/API", "Dealing with Client-Side CSRF Attacks (IMPORTANT)" (SrcS103's two findings).
10. C2 id-collision hazard: `grep -nE '^\| *S10[23] ' /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` → CDP README + `chrome.debugger`; the entry's documents are that file's S145/S146, so re-pointing by document was required.
11. Tooling: none — no install/upgrade command was run by this seat, and no tracked file was written by it.
