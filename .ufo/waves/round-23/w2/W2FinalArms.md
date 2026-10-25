# W2FinalArms — every C1 arm re-run against the bytes as filed

**Verdict: C1 MET as the script behaves (6/6 classes, exit 1), but the frozen `countingCommand`
exits 2, and the control's round-21 clause is falsified (1 of 6 classes fires on genuine bytes).**

Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; no tracked file edited (38 dirty
entries are other seats' wave work, unchanged by me); no git/jj writes; no spawns; no installs.
Inputs: auditor **`6eeaeda7…` = the bytes committed at the landing tip `03c1b4d`**
(`git cat-file blob 03c1b4d:scripts/round-evidence-audit.mjs | sha256sum`), which is what arms
1–9 ran; fleet report-22 `a838b5b4…`, policy `b5f635af…`, control `262cd9fc…`, receipt
`380360be…`. HEAD moved a89f193→03c1b4d and the worktree auditor has since drifted to
`94759966…` (see finding 9); every row reproduces on all three byte versions.

## Arm table (exact command → exit)

| # | Arm | Command (node scripts/round-evidence-audit.mjs is the prefix) | Exit | Observed |
|---|---|---|---|---|
| 1 | `--selftest` (12) | `--selftest` | 0 | `cases 12, passed 12, clean true`; 6 red classes + 6 green with 0 findings |
| 2 | 6 repairs, evidence-keyed | `--selftest --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --round-cap 128` | 0 | `baselineFindings 7 / 6 classes`, `cases 6, passed 6`; each repair removes exactly its class (c6: 2→0, total 7→5) |
| 3 | round-22 counter | `--rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --round-cap 128 --json` | 1 | 7 findings / 6 classes: c1 cited 23 vs derived 24; c2 maxLanes 65>64 and total 129>128; c3 no spot-check line; c4 9 attempt receipts / 0 graded; c5 65/65 members no agentId; c6 two rows (`47bfb5f…`, `be271a2…`) |
| 4 | round-21 counter | `--rev a89f193… --round 21 --round-cap 128 --json` | 1 | 1 finding, 1 class: `c3-gate-spotcheck` only |
| 5 | refusal: no cap | `--rev a89f193… --round 22` | 2 | `--round-cap is required … a verdict without it would be fail-open` |
| 6 | refusal: bad rev | `--rev a89f193 --round 22 --round-cap 128` | 2 | `--rev must be a full 40-hex commit, got "a89f193"` |
| 7 | refusal: `--root` | `--rev a89f193… --round 22 --round-cap 128 --root /tmp` | 2 | `unsupported argument "--root": usage: …` |
| 8 | refusal: foreign policy | `--rev a89f193… --round 22 --round-cap 128 --policy <scratch>/foreign-policy.json` | 2 | `--policy must name one of the fleet authority files (…ufo-wave-policy.json, …-v2.json)` |
| 9 | skip-work receipt | `node .ufo/waves/round-23/fixtures/skipwork-control.mjs` and `… --clean` | 1 / 1 | both print 6 classes, `reads: "nothing"`, `clean:false`; real auditor: 6 on round-22, `0,0,0,0,0,0` on its six green fixtures — control refused, receipt numbers reproduce exactly |

## Findings

1. **The frozen counting command refuses.** `claims.json` C1 `countingCommand`
   (`--rev <REV> --round 22 --json`) exits 2 (`--round-cap is required`); the 6 is only
   reachable with `--round-cap 128` appended. `node scripts/round-evidence-audit.mjs --rev
   a89f1935… --round 22 --json; echo $?` → 2.
2. **The round-21 control clause is falsified as written.** C1 `control` says round-21
   "must not yield the round-22 classes at all"; it yields `c3-gate-spotcheck`. That instance
   is real, not a false positive: `git show a89f193:corpus/lessons/round-21.md | grep -ci
   'spot.check\|owed to closure'` → 0, while its `## Gate` records only an author-gate admission.
   Detector right, control sentence wrong (it needs "must not yield the routed round-22
   instances", or c3 exempted).
3. **The 6-repair matrix is not unconditional.** Same matrix on round 21 exits 3, `passed 1/6`
   (`c3` only) — `--selftest --rev a89f193… --round 21 --round-cap 128; echo $?`. Strongest
   anti-skip evidence in the wave; it belongs in the round report verbatim.
4. **c6 is fail-open on a report without a landed-changes table.** `--report /dev/null` exits 1
   with 5 classes and no refusal: a missing `## Landed changes` section silently clears c6
   instead of refusing, though the header promises "refuses rather than guessing". Grounded:
   `node scripts/round-evidence-audit.mjs --rev a89f193… --round 22 --round-cap 128 --report
   /dev/null --json | jq '.findingClasses|length'` → 5 (c6 absent).
5. **c3 advertises an acceptance route it does not implement.** Both the code comment and the
   finding detail name "a named non-author deferral" as acceptable; the test is only
   `/spot-?check/i || /owed to closure/i`. Cosmetic today, a wrong-green path tomorrow.
6. **C2's counter measures 0→1 at the tip.** `git grep -lE '^source: S10[23] ' a89f193 -- corpus/knowledge`
   → 0; same at `03c1b4d` → 1 (`csrf-defense-shape-boundary.md`); `SOURCES.md` rows at the tip
   → 2 (`S102`, `S103`). The count is met on committed bytes, not on unlanded work.
7. **Receipt fidelity confirmed, not trusted.** Re-running the control reproduces
   `skipwork-receipt.json` exactly (6/6 defective, 6 clean, real auditor 12/12 and six zero
   green cases, exits 1/0), so the receipt is not a stale claim.
8. **Determinism holds where it was attacked.** Two round-22 runs are byte-identical; the
   auditor exposes `reportSha256`/`scriptSha256`, so a later run can be bound to these bytes.
9. **A committed lane artifact is being edited in place mid-wave.** Landing tip `03c1b4d`
   commits the auditor at `6eeaeda7…`; the worktree now holds `94759966…`
   (`git diff --stat -- scripts/round-evidence-audit.mjs` → 83 insertions, 21 deletions: a
   `joinedGrades`/attempt-id narrowing for c4, plus c3/c6 rewrites), i.e. an uncommitted
   mutation of the very bytes C1 is measured on, two of them (`3fe9c326…` at 04:28:44 was an
   additive selftest inventory). Behaviour is stable across all three (`1`/6 classes, `0`
   12/12, `0` 6/6); at the tip rev the findings differ only in c4/c5 derived wording
   ("0 graded and joined", "65 of 65"). The receipt must name a sha.
10. **Stale scratch inflates c4.** Sibling `W2Cls4` already showed round-23's own scratch
    `attempt*.json` fixture copies trip c4 at a landing commit; my run is on `a89f193` and does
    not include them (`--rev a89f193… --round 22` → 9 attempt receipts). This is a live tripwire
    for the post-landing re-run, not a round-22 figure.
