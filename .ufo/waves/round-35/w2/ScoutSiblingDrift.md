# ScoutSiblingDrift — sibling drift since C1 pins (round 35 w2)

## Verdict: HOLDS (no drift on browser ground; no screened line or the kagi row changes disposition)

Four of the 19 pinned siblings have commits after their pin that touch `SKILL.md` or `corpus/knowledge`: kaidoku (4 commits), mado (1), tameshi (1), tsukuroi (1). Zero lines added or removed in those commits match the frozen BG regex, so no new candidate or changed candidate exists. Zero changed lines name tabi. The other 15 siblings have no commits in those paths after their pin. kama, kasegi and kengaku have HEAD past their pin, but only in other paths (tools/, lessons, SCORECARD and similar), which are out of scope. kagi, the owner of the one new map row, is at its pin (`69b61db`). Nothing changes any of the 382 screens or the kagi row (`cdp-bridge-vault-dom-refusal`, adjacency.tsv:18).

Observations that are not defects:
- The pin set is not stale for the swept surface. A future sweep would see no new candidates from these four.
- kama and kasegi have uncommitted working-tree edits (kama `SKILL.md` modified; kasegi `SKILL.md` modified plus untracked `corpus/knowledge/*.md`). Neither matches BG, and neither is a pinned object, so the frozen counter is unaffected.
- The one wider non-BG hit in the four drifted siblings was a kaidoku `recheck: 180d — curl -fsSL <S129 URL> | sha256sum` line. It is unrelated to browser ground.

## Evidence

Lane HEAD at time of run: `083c5c643be7aa5965a5de3458a32ed0d289ead3` (`git -C tabi-shokunin rev-parse HEAD`). Pins read from `.ufo/waves/round-35/baseline/c1-pins.json`. The BG regex was copied verbatim from `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:82`, case-insensitive.

1. Per-sibling drift count (all exit 0):
   `git -C <lane>-shokunin log --oneline <pin>..HEAD -- SKILL.md corpus/knowledge | wc -l`, plus `git merge-base --is-ancestor <pin> HEAD`.
   - kaidoku: pin `49096c7e`, HEAD `c4a38ea2`, 4 commits, pin is an ancestor.
   - mado: pin `e0be61e4`, HEAD `60edb66e`, 1 commit.
   - tameshi: pin `f181a961`, HEAD `e3729de8`, 1 commit.
   - tsukuroi: pin `a968393c`, HEAD `6951ead9`, 1 commit.
   - kama, kasegi, kengaku: HEAD ≠ pin, 0 commits in the two paths.
   - All the rest: HEAD == pin.
2. Commits and diffstat of the drifted siblings:
   - kaidoku (2026-10-26, round-41):
     - `d764389e` freeze.
     - `042b8769` R41-C1 landing documents.
     - `e1c83313` binwalk v3 assimilation.
     - `74064474` lesson/QUALITY.
     - `SKILL.md` +82/-4, plus new entries `2026-10-26-binwalk-v3-unit-of-work.md`, `2026-10-26-r41-avm-be-squashfs-core.md`, `2026-10-26-r41-sqfs-triage-v3.md`.
   - mado: `1001bda0` round-46, `SKILL.md` +43, new `hyprland-input-devices-r46.md` (+73).
   - tameshi: `54a52365` round-49, `SKILL.md` 8 lines changed, `pbt-generator-pilot.md` +22/-10.
   - tsukuroi: `e2407a9d` round-42, `SKILL.md` +19/-2, new `btrfs-scrub-record-r42.md` (+34), `pacman-hook-order-r38.md` +8.
3. Exact BG test: `node -e` ran `git diff -U0 <pin> HEAD -- SKILL.md corpus/knowledge` for the four siblings and applied the BG regex to every added or removed line.
   - Result: kaidoku BGhits 0, mado 0, tameshi 0, tsukuroi 0.
   - A wider pattern (browser, chrome, firefox, tabi, headless, selenium, webdriver, devtools, dom, http) found one line, the unrelated kaidoku `recheck: 180d` line above.
4. Dirty-tree check: `git status --porcelain -- SKILL.md corpus/knowledge` in every sibling.
   - Only kama (`M SKILL.md`) and kasegi (`M SKILL.md`, 8 untracked `corpus/knowledge/*.md`) are dirty.
   - `git diff -U0 HEAD -- SKILL.md` for both, and a BG grep over the kasegi untracked files, returned no BG-matching lines.
5. kagi: at pin, no later commits, so the kagi `SKILL.md:40` quote cited by adjacency.tsv:18 is unchanged.

Not checked: PROVINCE.md and the non-SKILL/knowledge paths of drifted siblings (out of scope per counter lines 27-28). I made no edits and ran no browser or counter.

## Deliverable
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/ScoutSiblingDrift.md` (this report)
