# W2Mistakes — attack on `corpus/lessons/round-23.md` §Mistakes

**Verdict:** M1–M3's fixes exist and do fail on real round-22 bytes, but every captured-by cell
misstates the rule that should have caught its defect (M1 gives the right rule then a false scope
excuse, M2 names no rule, M3 cites the round *after* the defect), M4's fix is prose only, and two
branches the table calls fixture-pinned (c2's round-total arm, c6's `LOG entry lands in` escape)
still pass `--selftest` with the branch deleted.

Bytes attacked: `corpus/lessons/round-23.md` sha256 `d39da4df7ca23f6a873b506a8e2bf5b2ddf3f7d73cc9835ad5e259ea299e251b`;
`scripts/round-evidence-audit.mjs` sha256 `978dfc495b840ab63107761f4ad998bb2ae98aa3241867b2e778792f51ad9578` (write time).
Both moved during this review (lesson `f9344bf8`→`d0b23c96`→`98555c0e`→`d39da4df`; auditor
`94759966`→`325006d2`→`a71048ad`→`e88a078e`→`978dfc49`), and the M4 cell that read "round-21 is a zero-control
only after the auditor accepts `*-task-result.json` receipts and a named non-author deferral" was
replaced mid-review — that contradiction is *not* filed here; the prose-only finding below binds the
current cell.

1. **M1 captured-by is not the rule in force.** The lane's own prose rule predates round 22:
   `corpus/QUALITY.md:143` — "A prose count carries its counting command … including counts outside
   the measurement manifest" (landed `530f40a`, present at baseline). The row cites PROTOCOL and then
   excuses the bypass with "the prompt scoped it to measurements, not prose"; PROTOCOL:352–354 says the
   rules "bind `LOG.md` entries and lane reports too, not only `corpus/`".
   `git show a89f1935:corpus/QUALITY.md | sed -n '143,144p'`; `sed -n '352,354p' /home/vgpnk/Projects/shokunin/PROTOCOL.md`.
2. **M1 fix — confirmed failing (not a defect).** Real bytes: cited `23`, derived `24`. Fixtures:
   `node scripts/round-evidence-audit.mjs --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --round-cap 128 --json`
   → c1 `cited "23", derived 24`; `--selftest` → `cases 12 / passed 12`, c1 red 1-vs-2 and green 2-vs-2.
3. **M2 captured-by names no rule.** The rule is `tabi-round-22.md:190-192` — "Both waves validate
   under policy v1 (…band 32–64); the two waves together stay ≤128 seats" — which supplies both caps
   the row measures. "Nothing read it" is also wrong in kind: a validator *did* read a band, from a
   second authority. `grep -n "Both waves validate under policy v1" /home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-22.md`
   → `191`; `node -e 'console.log(require("./.ufo/waves/round-22/w2b-validation.json").policy)'`
   → `waveMinLanes 64 / waveMaxLanes 100 / source "config"` (policy file: 32/64).
4. **M2 fix: the round-total half is real but unpinned by the claimed 12 cases.** It fires alone
   (probe: two waves at band cap 2, `--round-cap 3`): `.ufo/waves/round-23/scratch/W2Mistakes/probe-c6-c2.mjs`
   → `c2-wave-caps: "round total 4 spawned seats > round cap 3"`. Deleting that push still yields
   `passed 12`: `sed 's/^  if (roundTotal > roundCap) capProblems.push/  \/\/ removed /' scripts/round-evidence-audit.mjs > .ufo/waves/round-23/scratch/W2Mistakes/mut-roundarm4.mjs; node .ufo/waves/round-23/scratch/W2Mistakes/mut-roundarm4.mjs --selftest`
   → `"passed":12, "clean":true`. Smallest correction: a c2-red case with waves in band and round total above cap.
5. **M3 captured-by is a post-hoc citation.** The identical clause is in the round-22 prompt, i.e. the
   rule that was in force when `47bfb5f` landed:
   `grep -n "every change tied to a LOG.md entry" /home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-22.md /home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-23.md`
   → both `:107`. Same wording, so this is miscitation, not fabrication; cite round-22 and note round-23 repeats it.
6. **M3 fix reproduces the surface compliance it condemns.** `bindsElsewhere` is a regex on row text
   (`grep -n "bindsElsewhere" scripts/round-evidence-audit.mjs` → 492/515) and the named hash is never resolved. A row whose *only*
   cited commits touch no `LOG.md`, saying "LOG entry lands in `ccccccc`" where `ccccccc` also carries
   none, clears: `node .ufo/waves/round-23/scratch/W2Mistakes/probe-c6-c2.mjs` → `c6-lands-in-nonLOG(cap4) => []`
   (control without the phrase → `["c6-landed-log-binding"]`). Correction: resolve the named hash and
   require `filesOfCommit(h).includes("LOG.md")`.
7. **M3's green fixture is vacuous for that branch.** The rewritten row still contains `aaaaaaa`, which
   carries `LOG.md`, so `logBound` is true independently of the escape (`grep -n -A6 '"c6-green-entry-bound-elsewhere"' scripts/round-evidence-audit.mjs`, 685–691).
   Deleting the escape still passes: `sed 's/!logBound \&\& !bindsElsewhere/!logBound/' scripts/round-evidence-audit.mjs > .ufo/waves/round-23/scratch/W2Mistakes/mut-c6escape4.mjs; node .ufo/waves/round-23/scratch/W2Mistakes/mut-c6escape4.mjs --selftest`
   → `"passed":12`. So "green fixture binds 'LOG entry lands in `<hash>`' and clears" tests nothing of the escape.
8. **M4 is prose only.** Its fix cell is "control restated in `claims.json` `revisions[2]`": no command,
   no red/green case, and no auditor class compares a declared control with its measurement. The closing
   sentence ("Each fix is a check whose red and green fixtures both run … except M5") is therefore false
   for M4. `node scripts/round-evidence-audit.mjs --selftest | grep '"name"' | grep -c 'control\|round-21'`
   → `0`; `grep -n 'revisions\[2\]' corpus/lessons/round-23.md` → the fix cell.
9. **M4's evidence pointer cannot be reproduced by the command it cites.** `node scripts/round-evidence-audit.mjs --rev 5f585773258b33d2d514b00cd0b0775333578db6 --round 21 --json`
   → exit 2 (refuses without `--round-cap`); with `--round-cap 128` → one class, `c3-gate-spotcheck`,
   not the filed "2 classes". The second class (`c1` "no citation derivable", `.ufo/waves/round-23/w1/ScribeLog.md:72`)
   has no code path in any committed or worktree auditor: `git show HEAD:scripts/round-evidence-audit.mjs | grep -c "no citation derivable"` → `0`;
   `node -e 'console.log(JSON.stringify(require("./corpus/evidence/round-23/c1-measurements.json").controls.round21))'`
   → `findingClasses:["c3-gate-spotcheck"]`. So "recorded in … the receipt" is false; the receipt records 1 class.
10. **M5's captured-by is an absence its own quoted context fills.** The wave specs already say
    "throwaway fixtures under `…/scratch/<YourName>/`" — a throwaway is not a landing — and the row's own
    name-only check is the rule that should have caught it. That check fails at current HEAD:
    `grep -o "throwaway fixtures under" .ufo/waves/round-23/w1-spec.json`; `git ls-tree -r HEAD .ufo/waves/round-23/scratch | wc -l` → `1034` at `2433ed2` (the row's `868` is stale).
11. **Provenance bound (affects any reader of this table).** §Mistakes and the auditor were edited by the
    lane during this review; findings 4, 6 and 7 were re-derived after each script edit (last on `978dfc49`),
    and the earlier M4 contradiction was dropped rather than filed. Any later edit to the table voids the
    hash pin, not the commands.
