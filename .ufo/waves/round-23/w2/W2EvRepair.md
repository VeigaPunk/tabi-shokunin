# W2 · evidence-keyed repair matrix (C1) — mutation probe

Lane root `$LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin`; all commands run there.
Target: `node scripts/round-evidence-audit.mjs --selftest --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --round-cap 128`.

**Verdict: matrix REPRODUCES (7 findings / 6 classes, 6 repairs, each removing exactly its class, exit 0) and KILLS a pure round-keyed instrument (0/6, exit 3) — but it does not establish non-gameability: it certifies the instrument's own fixed point, not derivation from receipts. Two mutants that invent their own oracle survive 6/6, and c6 is cleared by a string naming a nonexistent commit.**

## Reproduction and target

1. Matrix reproduces the declared shape: `baselineFindings 7`, `baselineClasses 6`, `cases 6`, `passed 6`, `clean true`, exit 0; every case's `repairedClasses` is exactly the other five, and c6's repair takes 6→5 findings because c6 has two baseline rows. Command: the target line above.
2. The counted target is live, not just a selftest: `node scripts/round-evidence-audit.mjs --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --round-cap 128 --json` → exit 1, 7 findings, 6 distinct `findings[].class` (c1 cited 23 / derived 24; c6 rows `47bfb5f7…`, `be271a2d…`). Baseline 0 → 6 stands at committed bytes.

## Lottery: what the matrix forbids

3. Input-invariant keys are killed. Mutant `mut1b`: `audit()` returns the six classes whenever `round === 22`, ignoring bytes → `scripts/mut1b.mjs --selftest --rev a89f… --round 22 --round-cap 128` → baseline 6, passed 0/6, exit 3. Any rev-keyed, file-presence-keyed or whole-blob-hash-keyed instrument fails the same way, because each repair changes the bytes it would hash.
4. Extra or missing classes are killed: `pass` requires `after.findings.length === baseline − before` and `afterThis === 0`, so an instrument that leaves one class red, or lights an unrepaired one, fails.

## Lottery: what the matrix still allows

5. **c1's `derived` may be invented.** Mutants `mut2b` (behaviour of 6eeaeda7) and `mut2c` (94759966): both constants in the c1 comparison and in the derived field set to `42` while the committed receipts number 24 → 6/6, exit 0. The harness builds the c1 repair *from the finding's own `derived`* (`fix(t).replace(/\d{1,3}(\s+whole-payload)/g, derived + "$1")`), so it verifies self-consistency only. Command: `scripts/mut2c.mjs --selftest --rev a89f… --round 22 --round-cap 128`.
6. **c3's predicate may key on the harness's own repair string.** `mut4b`/`mut4c` replace `/spot-?check/i.test(gate)` with `/fixture repair/i.test(gate)` (the literal text the c3 repair inserts) → 6/6, exit 0. Any substring predicate passes. Command: `scripts/mut4c.mjs --selftest --rev a89f… --round 22 --round-cap 128`.
7. c3 accepts unverified prose at all: `node --input-type=module -e 'import {audit,fixtureCtx} from "./scripts/round-evidence-audit.mjs"; …'` with `## Gate` = `spot-check pending; nobody has run it.` → 0 findings. No reviewer, no signature, no non-author artifact is required.
8. **c6 is cleared by an assertion, not by binding.** Fixture `scratch/W2EvRepair/report-c6-bogus.md` = the round-22 report with ` (LOG entry lands in \`0000000000000000000000000000000000000000\`)` appended to the `47bfb5f7…` row. Command: `node scripts/round-evidence-audit.mjs --rev a89f… --round 22 --round-cap 128 --json --report .ufo/waves/round-23/scratch/W2EvRepair/report-c6-bogus.md` → c6 2→1 at both 87b9f678 and bf0aff59. The parenthetical is never re-read; the named commit need not exist or touch that row's LOG entry.
9. `--round-cap` is not pinned by the matrix. Honest runs are green at `--round-cap 7`, `64` and `128`; mutant `mut3` (`roundTotal > 128` hardcoded, flag ignored) is green at cap 7 and cap 128. The matrix cannot distinguish reading the declared cap from hardcoding it, because the repair uses the same flag. Command: `scripts/mut3-cap128.mjs --selftest --rev a89f… --round 22 --round-cap 7`.
10. Instrument bytes are unpinned — and moving. `scriptSha256` is printed but never checked against a rev. During this probe the tracked file was rewritten four times: `6eeaeda7` (committed at 03c1b4d) → `3fe9c326` 04:28:44 → `87b9f678` 04:29:48 → `94759966` 04:30:16 → `bf0aff59` 04:31:56; `git diff --stat 03c1b4d -- scripts/round-evidence-audit.mjs` = 92 insertions / 22 deletions uncommitted. Every version reports 7/6/6 green. "The same command" is not the same instrument, so C1's count is not reproducible from a revision. Commands: `sha256sum scripts/round-evidence-audit.mjs`; `stat -c '%y %s' scripts/round-evidence-audit.mjs`.
11. An empty listing is accepted as a valid round. `git -C $LANE ls-tree -r --name-only a89f… -- .ufo/waves/round-22` gives 212 names; `git -C $LANE/.ufo/waves/round-23/scratch/W2EvRepair …` gives 0 (pathspec is CWD-relative), and `:/`-prefixed gives 212. A copy of the script run from that subdirectory reports 4 findings / 3 classes and 3/6 pass (exit 3) instead of refusing; the `--show-toplevel` guard exists only on the direct CLI path, not in `evidenceSelftest`.
12. c4 was gameable and got closed mid-probe — proof the artifact, not the claim, moved. Fixture `report-c4-fake.md` (`Attempt 88 — landed. Attempt 99 — silent.`, no such receipts) cleared c4 at 6eeaeda7 (5 findings) but not at 87b9f678/bf0aff59 (c4 still fires) after `joinedGrades` was added.

## Provenance

13. Mutant/neutral copies live only under `.ufo/waves/round-23/scratch/W2EvRepair/`; copies outside `scripts/` need `const root = "$LANE"` pinned, and `mut0.mjs` establishes that pin is behaviour-neutral (7/6/6, 6/6, exit 0). No tracked file was written or restored by this seat; `scripts/round-evidence-audit.mjs` was never my write, so there are no bytes of mine to restore.
14. External inputs held stable across all runs: round-22 report `sha256 a838b5b4e45dd3f8767639fd18c136db80f47969d0bb3a48a30ed9db4ca9800e`, policy `b5f635af526c8af7aef2…`; lane bytes pinned at `a89f1935f523a64b00991d792fca6a8c0d321948`. No tool installed or upgraded.
