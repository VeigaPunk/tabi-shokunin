# CritAxisCapability — commands run (round 32 w1)

All lane reads were read-only from /home/vgpnk/Projects/shokunin/tabi-shokunin.
Every lane script run happened inside the scratch clone below, never in the lane checkout.

Scratch root: /fast/scratch/hyaku/tabi-r32/CritAxisCapability (deleted before yield)
Clone: git clone --shared <lane> $S/clone ; git -C $S/clone checkout -q --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 (exit 0)
Scratch commits (my clone only):
- 86ed04e666ccbe4026d521ae85489b792289ee44 — synthetic `## Round 32` group, no capability promotion
- 36808374837f6bd991dcbf22d1f6baeba1f482de — counterfactual: `First-working round: 27` and `First-working round: 31` capability entries (the lane's own round-24/25 gate-promotion practice)

| # | Command (cwd = scratch clone unless noted) | Exit | Output file |
|---|---|---|---|
| 1 | `sha256sum clone/scripts/check-selfassessment.mjs` | 0 | 77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9 (== claims.frozenDigests) |
| 2 | `git -C <lane> show 4181fffb:scripts/check-bidi-runtime.mjs \| sha256sum` | 0 | 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393 (== frozenDigests) |
| 3 | `node scripts/check-selfassessment.mjs --rev 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 --json` | 1 | A-freeze.json (mismatches 18, cne 104) |
| 4 | `node scripts/check-selfassessment.mjs --rev 86ed04e666ccbe4026d521ae85489b792289ee44 --json` | 1 | B1-synthetic32.json (round 32 derived `active`) |
| 5 | `node scripts/check-selfassessment.mjs --rev 36808374837f6bd991dcbf22d1f6baeba1f482de --json` | 1 | B2-counterfactual.json (rounds 29/30 derive `inactive`, round 31/32 flip) |

Read-only inspections (lane checkout, no writes): AXES.md:57-73; SCORECARD.md sections round 22-31;
corpus/knowledge/webdriver-bidi-capability-matrix.md §2 (17 rows, lines 60-76, all last cell `no`);
corpus/README.md:168,191; LOG.md:551; scripts/hyaku/lane-addendum.md:342-346;
.ufo/waves/round-32/claims.json; baseline/README-receipts.md, baseline/c2-J1-do-nothing.json;
.ufo/waves/round-32/w1-dispatch.json (seat map).

No network fetch was made. No browser or chromedriver was started by this seat (`--live` was never invoked).
No tool was installed or upgraded. No pacman transaction.
