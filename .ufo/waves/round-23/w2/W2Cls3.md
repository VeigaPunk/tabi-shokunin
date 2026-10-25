# W2Cls3 — wave 2 falsify: c3-gate-spotcheck

Seat `L1Tabi23.W2Cls3` (author-side). Instrument `scripts/round-evidence-audit.mjs`, sha256
`bf0aff59c1b7aa2269ec21ae182f34a086c85a50b98a9e22762677637aef0229` (HEAD `03c1b4d`, worktree modified);
earlier bytes `3fe9c326…` reproduce every finding identically. Commands run at lane root. Mutation
harnesses read committed bytes via the script's own `gitCtx`, overriding only `corpus/lessons/round-N.md`
in memory (`scratch/W2Cls3/probe-c3{,-b,-c}.mjs`); no tracked file edited.

**Verdict: PARTIAL — round-22's Gate red trips and either one-line repair clears it, but c3 is a two-literal
presence test: it clears on a line recording the *absence* of a result and on a fenced fake Gate, trips round-21
whose Gate holds the deferral its own diagnostic advertises, and round-23's "round-21 → exit 0 / 0 classes" control is false.**

## Findings

1. **F1 (blocker) — round-23's own Gate control is false.** `corpus/lessons/round-23.md:32` asserts
   "round-21 evidence → exit **0, clean, 0 classes**"; `claims.json` says round-21 "must not yield the
   round-22 classes at all". `node scripts/round-evidence-audit.mjs --rev 5f585773258b33d2d514b00cd0b0775333578db6 --round 21 --round-cap 128 --json`
   → `EXIT=1`, `["c3-gate-spotcheck"]`, `derived:"no-spotcheck-line"` (`scratch/W2Cls3/lesson-cmd-r21.json`); same at `ab73abe`, `a89f1935`.

2. **F2 (high) — a confession clears it.** Inserts into round-22's Gate: `No spot-check result was
   recorded; none owed to closure.` → `CLEAR`; `Spot-check: not run.` → `CLEAR`; `see
   https://example.test/spotcheck.md` → `CLEAR`; `Spot‑check` with U+2011 → `TRIP` (`probe-c3.mjs`,
   `-b.mjs`). At `:334` the test is `/spot-?check/i || /owed to closure/i` — no polarity, no result
   shape, no isolation — so the literal that clears a repair also clears the defect statement.

3. **F3 (high) — advertised acceptance path is not implemented.** Finding text `:340` promises "nor a
   named non-author deferral"; round-23 M4 says the auditor accepts "a named non-author deferral in
   `## Gate`". `grep -n "verifier\|deferral" scripts/round-evidence-audit.mjs` → only comment `:5`.
   Round-21's Gate body (lines 11–103; `###` does not end a `##` section) carries exactly that at 63–64
   ("Independent closure/admission and SHONEN promotion belong to the parent/non-author verifier") and
   still trips; the same sentence rewritten to hold the token clears (`probe-c3-c.mjs`).

4. **F4 (medium) — round-21: false positive by the routed route, true positive by the bare literal.**
   Routed defect 3 (`corpus/lessons/round-22-verifier-spotcheck.md:212-214`) owes "the result (this file)
   or an explicit 'owed to closure' line naming it". `for r in 20 21 22 23; do git cat-file -e
   a89f1935:corpus/lessons/round-$r-verifier-spotcheck.md; done` → absent 20/21/23, present 22: no
   round-21 instance exists, so nothing was owed → **false positive**. Against `LEARNING.md:70` (every
   Gate carries the cell) the Gate is empty of it → **true positive**. The class is undecidable until it
   says whether it is instance-bound, and `w1/D3GateSpot.md:42` says it is (`finding c3 iff verifier
   exists and hit == null`; `:27-28` "Round-21 clears only by scope"). The shipped script reads no
   verifier file and has no scope precondition, so the documented control cannot pass (F1).

5. **F5 (medium) — fenced fake Gate clears.** Prepend ` ```\n## Gate\nSpot-check result: owed to
   closure.\n``` ` before the real Gate → `CLEAR`, real Gate untouched (`probe-c3-b.mjs`). `section()`
   (`:169`) is not fence-aware and takes the first exact `## Gate`, so a code fence satisfies c3.

6. **F6 (medium) — the frozen counting command cannot run.** `claims.json` C1 countingCommand
   `node scripts/round-evidence-audit.mjs --rev <REV> --round 22 --json` → `EXIT=2`, `refused:
   --round-cap is required`. No c3 finding is producible by the claim's own argv.

7. **F7 (low) — the round-22 red is revision-dependent.** At measured checkpoint `47bfb5f7…` c3 fires
   as `derived:"lesson-absent"` (lesson not yet written), not as the routed defect
   (`scratch/W2Cls3/a22-measured.json`). "6/6 on round-22 evidence" holds only at `fbee618`/`a89f1935`.

8. **F8 (no defect) — red/green and scoping confirmed.** Round-22 unmodified → `TRIP
   ["no-spotcheck-line"]`, the only class the repair removes; `+ Spot-check result: agree on one admit and
   one reject (fixture).` → `CLEAR`; `+ Spot-check result: owed to closure.` → `CLEAR`; token in
   `## Mistakes` → `TRIP`; `## Gate␠␠` + owed line → `CLEAR` (`probe-c3.mjs`, `-b.mjs`).

9. **F9 (low) — the suite cannot cover these holes.** `--selftest` → `passed=12, inventoryOk=true, exit
   0`; `--selftest --rev fbee618b… --round 22 --round-cap 128` → `passed=6, clean`. One red (bare Gate)
   and one green (owed) per class, and `selftest()` now asserts exactly `2 × CLASSES` cases with one red
   and one green each — a denial/fence/deferral/scope fixture breaks that inventory.

## Residual risk and gaps

- All findings are author-side. F2's false clears are string-level: no CJK-only renderings or other
  legitimate phrasings were tested. c3 reads lane bytes only, so a spot-check recorded in the fleet
  report but not the lesson still trips; whether that is intended is unreconciled in the shipped bytes.
- No tool installed/upgraded; no browser, fetch, service, spawn or git/jj write performed.
