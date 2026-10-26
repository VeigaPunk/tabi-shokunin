# AdjKagi1 — C1 build: kagi chunk (14 candidate lines, pin 69b61db4)

**Verdict.** All 14 candidate lines in `.ufo/waves/round-35/w1-chunks/AdjKagi1.tsv` are dispositioned against the frozen C1 counter `c1-adjacency-sweep-v3.mjs`: **1 map row** (`split-declared`, surface `cdp-bridge-vault-dom-refusal`, sibling line `kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:SKILL.md:40`, tabi side DECL1 at `SKILL.md:2963` of my validation commit) and **13 screen rows** in a new `corpus/adjacency-screen-browser.tsv` (9 `same-surface` on the already-verified row `musketeer-cdp-9222-profile-lease` — 3 in `SKILL.md`, 6 in the two kagi `adjacency-*.md` docs — 3 `not-browser-sense`, 1 `no-claim-declared`; 9 + 3 + 1 = 13). Validation in a scratch clone at the freeze `a4bfef0f`: `ADJACENCY verdict=clean rows=17 verified=17 findings=0`, `screenFindings []` (so no screen is malformed), none of my 14 keys appears in `unaccountedKeys`, `mapped 1`, `screened 13`, `newMapped 1` with `newRowRefusals []`. The lane predicate is still **not met** at my commit (`unaccounted 369`) because my chunk is 14 of 383 candidates and the other seats' chunks were not in that clone; my own chunk's unaccounted count is **0**. I did not merge anything into the lane checkout, and I ran no browser, no lint, no build.

## Evidence (commands, exit codes, file:line)

Scratch: `S=/fast/scratch/hyaku/tabi-r35/AdjKagi1`, `TMPDIR=$S/tmp`, clone `--shared` of the lane checked out at `a4bfef0f75027c915e715649950b1d46dcb33d83` (`git rev-parse HEAD` → `a4bfef0f…`).

1. Sibling ground read at the frozen pin (kagi `master` == pin; `git -C …/kagi-shokunin rev-parse refs/heads/master` → `69b61db46be4ed955994f6f1d1cba522bc5f4e97`, `merge-base --is-ancestor` exit 0):
   - `git -C kagi-shokunin show 69b61db4:SKILL.md | sed -n '30,50p'` (line 40 = the 1Password-in-musketeer-Chrome decision-table row), `'100,120p'` (110 = flock topology), `'155,180p'` (164/172 = verb probes + NMH-dir finding), `'428,445p'` (438 = metadata-only quoting), `'552,575p'` (564 = falsification verb list), `'665,690p'` (676 = round-22 execution boundary).
   - `git -C kagi-shokunin show 69b61db4:corpus/knowledge/adjacency-breadth.md | sed -n '15,32p;68,82p'` and `adjacency-scope.md | sed -n '1,40p'` — kagi's own count-only breadth/partition records for `the-musketeer/chrome-profile`.
   - `git -C kagi-shokunin show 69b61db4:corpus/knowledge/cdp-bridge-1password.md` lines 1-30, 55-95 — kagi's bridge doc: knobs `MUSKETEER_CHROME_PROFILE` (L20), NMH dir/manifest, `MUSKETEER_CDP_PORT 9222` (L27), `open-popup` "refused by design … will not scrape vault DOM" (L57-63), "Port `9222` and the `the-musketeer` Chrome profile are **shared**" (L77).
   - `git -C kagi-shokunin show 69b61db4:PROVINCE.md | sed -n '30,50p'` — the CDP 9222 + profile line "**contested with kake**", manifest-only pin, profile presence-only.
2. Candidate set confirmed from the frozen counter itself (`--list-candidates`, exit 0): `comm -23` of my 14 keys against the 383-line list printed nothing — every key in my chunk is a live candidate, and each chunk text equals the counter's trimmed candidate text (asserted in `build.py`, exit 0).
3. Before reading (`.ufo/waves/round-35/w1/AdjKagi1/baseline-counter.json`, counter exit **1**, expected for a pre-edit rev): `adjacency {verdict: clean, rows: 16, verified: 16, findings: 0}`, `candidates 383`, `mapped 0`, `screened 0`, `unaccounted 383`, `newMapped 0`, `screenFindings []`; `perLane.kagi = 56`.
4. Applied in the scratch clone: appended `## Round 35 — scratch declarations` + DECL1 to `SKILL.md` (DECL1 lands at `SKILL.md:2963`), appended the 9-column map row (`corpus/adjacency.tsv` row 18), wrote `corpus/adjacency-screen-browser.tsv` (header + 13 rows). Commits `6f5c9003` (SKILL.md + map) and `9f53cf98` (screen ledger; the first commit's `-a` had left the new file untracked — that is the ONLY reason my first counter run showed `screened 0`), each with `-c user.name=AdjKagi1 -c user.email=AdjKagi1@scratch.local`, toplevel asserted `= $S/clone` before each.
5. Frozen counter at my commit (exit **1**, predicate not met globally):
   `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 9f53cf982d03c3ccbb756d28b3912bdeb93d662b --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json`
   → `adjacency {verdict: clean, rows: 17, verified: 17, findings: 0}`, `candidates 383`, `mapped 1`, `screened 13`, `unaccounted 369`, `newMapped 1`, `newMappedRows [{row 18, surface cdp-bridge-vault-dom-refusal, sibling kagi, disposition split-declared}]`, `newRowRefusals []`, `screenFindings []`, my 14 keys **not** in `unaccountedKeys` (checked list-wise).
6. The map row as committed (`git show 9f53cf98:corpus/adjacency.tsv | tail -1`, TAB-separated):
   `cdp-bridge-vault-dom-refusal` | `kagi` | `kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:SKILL.md:40` | whole sibling line (24 words: the decision-table row carrying `cdp-bridge` + "hard refusal") | `SKILL.md:2963` | `` the `open-popup` refusal kagi states at `kagi-shokunin/SKILL.md:40` `` | `split-declared` | `-` | `tabi's CDP session discipline (PROVINCE.md:9) drives browsers and captures DOM/screenshot evidence`.
   Gate arithmetic on it: BG matches `cdp`; SIDE matches `refusal` (n4); the declaration line names the sibling token `kagi` and the cited sibling path `SKILL.md` (n1); the sibling line is not cited by any baseline row (n2); `SKILL.md` does not match THIRD_LANE (n3); only one new row uses this tabi_ref.

## Decision record (rule order `SKILL.md:2861-2881`)

Only `SKILL.md:40` states kagi's **side** of shared ground with a side-stating word: kagi owns the 1Password→Chrome native-messaging bridge and refuses `open-popup` and vault-DOM scraping — the custody end of the split whose evidence-capture end is tabi's CDP session discipline (`PROVINCE.md:9`) with shape-only session material (`PROVINCE.md:16`). Everything else in my chunk is screened:

- `same-surface` (9): `SKILL.md:11` (domain list naming the bridge whose knobs kagi pins to port 9222 / the musketeer profile), `:164` and `:172` (probe/writer findings on that same profile), and `corpus/knowledge/adjacency-breadth.md:23,75,76` plus `adjacency-scope.md:9,28,31` (kagi's own count-only breadth and partition records for `the-musketeer/chrome-profile`, or the `PROVINCE.md:34` "contested with kake" CDP surface) — every one names the already-verified row `musketeer-cdp-9222-profile-lease`.
- `not-browser-sense` (3): `SKILL.md:110` (flock topology), `:438` (metadata-only output quoting), `:564` (falsification verb list) — the regex match is one subcommand name in a sentence about file-internal discipline, not a browser, driver, protocol or capture statement.
- `no-claim-declared` (1): `SKILL.md:676` — kagi's round-22 boundary ("Do not execute … browser/CDP … recipes unattended", line 677), a refusal to act rather than a claim on tabi's surface.

Screen quotes are the whole trimmed candidate line in every row (7-17 words each, so the counter's 4-25-word floor and its whole-line fallback both hold); notes are one sentence each and quote kagi's own paths/lines.

## Limits / honesty

- My chunk yields **1** new map row, not 2: I found no second line in these 14 where kagi states its side with browser ground and a side-stating word. The `newMapped >= 2` target therefore depends on other w1 chunks; I did not manufacture a second row (QUALITY 88/97).
- The overlap judgment of row 18 is **wave 2's**: the frozen counter explicitly does not judge overlap semantics, only the mechanical floor (BG/SIDE, naming, newness, path class).
- The three `not-browser-sense` screens are the weakest rows here and are named as such: a critic can argue `cdp-bridge` is the real bridge rather than a mere verb name; my ground is each line's subject (locks, quoting, command list), stated in the note.
- `same-surface` on `musketeer-cdp-9222-profile-lease` is an existing verified row (16/16 at the freeze, 17/17 at my commit), so those six screens do not depend on my own new row surviving attack.
- Nothing was merged into the lane; the clone's commits are scratch-only. No tool was installed or upgraded this seat; no browser was launched; no network fetch was made. Scratch dir deleted after the copies below (receipts copied first).

## Deliverables (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKagi1/`)

| file | sha256 (first 16) | content |
|---|---|---|
| `screen.tsv` | `93acef9bdb2dfd7f` | 13 screen rows, no header, 5 TAB columns |
| `rows.tsv` | `1fe40dfe6c814f79` | 1 map row, 9 TAB columns, tabi_ref resolved (`SKILL.md:2963`) |
| `rows-decl.tsv` | `76c6af31aba868e8` | same row with `SKILL.md:DECL1` placeholder for L1 re-application |
| `decl.md` | `8deb8a1b6ce6398b` | DECL1 text + the heading it is appended under |
| `decisions.md` | `fbb9c009597b5b2e` | per-key verdict + one sentence grounded in both sides |
| `counter-check.json` | `e1ee380e033d1648` | frozen counter output at `9f53cf98` |
| `baseline-counter.json` | `41274eaf38099d66` | frozen counter output at the freeze `a4bfef0f` |
| `candidate-list.tsv` | `9efd0407d3f4bf1c` | `--list-candidates` dump used to confirm membership |
| `build.py` | `754aba193942f966` | generator/validator (asserts quotes, BG/SIDE, word floors) |

`l0.txt` is intentionally absent: no `contested-open` row was proposed, so no fleet L0 line was drafted.
