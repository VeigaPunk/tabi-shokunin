# W2CorrArith — §Corrections arithmetic, re-derived from committed bytes

**Verdict: 4 of the 6 named figures reproduce exactly; 2 do not** — the "85-hour gap" is attached to an
interval that is 30.70 h, and "9 wave files" is 7 files (11 occurrences) for the quoted string.
Round-22 bytes at `a89f1935f523a64b00991d792fca6a8c0d321948`; round-23 working tree otherwise.

## Reproduced

| figure | derived | command |
|---|---|---|
| **24 = 13 + 11** | 13 + 11 = 24; refusal `attempt` fields are exactly `1–9,11–14` and `1–11`, no filename/attempt mismatch; all 24 carry `spawnedSeats: 0` | `git ls-tree -r --name-only a89f193 \| grep -cE 'w2b?-cap-refusal-[0-9]+\.json$'` (13 / 11) + python json read of both series |
| **attempt 10 missing** | no `w2-cap-refusal-10.json`; note at `w2-cap-refusal-11.json:16`: "attempt 10 by dead TabiR22 is unrecorded: slot granted 16:10:37Z, kernel died 16:10:51Z before any result; no seat transcripts exist, so 0 seats spent"; refusal 11's `at` = `2026-10-21T16:28:27.783022+00:00` > death time | `git show a89f193:.ufo/waves/round-22/w2-cap-refusal-11.json` (keys incl. `note`) |
| **65 > 64** | fleet policy `waveMaxLanes: 64`; `w2b-spec.json` `maxLanes: 65`; `w2b-validation.json` stored `waveMinLanes: 64, waveMaxLanes: 100`; spawn text "Spawned 65 background agents" | `grep -n waveMaxLanes scripts/hyaku/ufo-wave-policy.json` → 64; `git show a89f193:.ufo/waves/round-22/w2b-spec.json` |
| **129 > 128** | 64 (`w1-spawn-result` "Spawned 64…") + 0 (W2) + 65 = 129; cap 128 = 2 × `waveMaxLanes` | both spawn files + `.ufo/reports/round-22/tabi.md:191` ("129 seats (64 + 0 + 65) — one over the ≤128 two-wave cap") |
| **47bfb5f / fbee618 LOG binding** | `47bfb5f` → 0 `LOG.md` paths, `fbee618` → 1 | `for h in 47bfb5f fbee618; do git show --name-only --format='' $h \| grep -c '^LOG.md$'; done` |
| **three dispatches, per-attempt grades** | `:609` 2026-10-21T11:47:45-03, `:1087` 2026-10-23T20:41:38-03, `:1257` 2026-10-25T03:23:44-03, `:1263` complete 03:40:22; window-2 commits = 0; window-1 commits = `0f24164` 12:35:37, `e3cf4e0` 13:38:27; attempt-3 commits `47bfb5f` 03:31:37 / `fbee618` 03:36:54 / `be271a2` 03:38:49 all inside 03:23:44–03:40:22 | `grep -nE 'tabi round=22' /home/vgpnk/Projects/shokunin/.ufo/watchdog.log`; `git log --since=2026-10-23T20:41:38-03:00 --until=2026-10-25T03:23:44-03:00 a89f193 \| wc -l` → 0 |
| **44 + 44 = 88, both in 32–64** | both specs `maxLanes: 44`, 44 items; both spawn texts "Spawned 44 background agents" | `python -c 'json.load(open(".ufo/waves/round-23/w2-spec.json"))'`; `w{1,2}-spawn-result.json` |
| **registry identities (65 / 65 null, `updatedAt == createdAt`; round 23 recorded)** | w2b registry 65 members, 65 null `agentId`, both stamps `2026-10-21T16:40:54.992Z`; `w1-record.json`/`w2-record.json` 44 members, 0 null | `git show a89f193:.ufo/waves/round-22/w2b/swarm-registry.json`; python read of the two record files |

## Findings

- **F1 (high) — "an 85-hour gap" is bound to a 30 h 42 m 06 s interval.**
  `corpus/lessons/round-23.md:108-109` says "no lane commit between 2026-10-23T20:41:38 and
  2026-10-25T03:23:44, an 85-hour gap". Those two stamps differ by **30.7017 h**. 85 reproduces only
  from other anchors: last W2b receipt `2026-10-21T17:14:05Z` → first landing commit
  `2026-10-25T06:31:37Z` = **85.2922 h** (the derivation at
  `.ufo/waves/round-23/w1/D4StaleAttempts.md:9`), last-commit→next-commit `16:38:27Z`→`06:31:37Z` =
  85.886 h, and last receipt→attempt-3 dispatch `06:23:44Z` = 85.16 h. Command:
  `python3 -c "from datetime import datetime;print((datetime.fromisoformat('2026-10-25T03:23:44-03:00')-datetime.fromisoformat('2026-10-23T20:41:38-03:00')).total_seconds()/3600)"`.
  One of the two — interval or number — must change; as written the sentence states a duration its own
  timestamps contradict. `LOG.md:1682` repeats it as "an 85-hour commit gap", defensible only as the
  85.89 h commit-to-commit gap, not as the dispatch-2 → dispatch-3 window it is chained to.
- **F2 (low) — "9 wave files say '14 whole-payload'" is 7 files / 11 occurrences.**
  `git grep -l "14 whole-payload" a89f193` → 7 files (11 occurrences): `w2b-spec.json`,
  `w2b-validation.json`, `CriticReviewScope.md`, `CriticWaveConformance.md`,
  `ScoutChronologyEvidence.md`, `ScoutCrashRecord.md`, `ScoutRegistry.md`. The loosest tested reading,
  `git grep -lE "14 (whole-payload|attempts|refusals)" a89f193 -- .ufo/waves/round-22` → 8 (adds
  `ConnectScope.md`); 9 is unreachable under exact-string, any-phrase, and 14-near-refusal patterns
  (the last → 8 as well). The substantive point (13 receipts vs a committed "14") stands; the count of
  offending files does not.

## Residual risk / gaps

- The 16:10:37Z / 16:10:51Z slot-grant and kernel-death pair exists **only** in the self-authored `note`
  (`git grep -n "16:10:3[7]\|16:10:51" a89f193` → every other hit quotes that line; the host transcript
  tail `CriticReviewScope.md:50` cites is not committed). The lesson is faithful to the note, but the
  note has no independent corroboration in committed bytes — that figure is *reported*, not *derived*.
- The ≤128 round cap has no key in `scripts/hyaku/ufo-wave-policy.json` (only `waveMinLanes: 32`,
  `waveMaxLanes: 64`, `maxLanes: 256`); 128 is 2 × wave band as stated in the round-22 fleet report.
  The inequality holds, but it is a derived cap, not a policy field — worth naming as such.
- I did not verify item 3's "closed above" beyond presence of the spot-check paragraph in `## Gate`,
  and item 6's forward-looking "this round's rows name the commit that carries each LOG entry" (round-23
  rows are not committed yet).
- No tool installs were needed. No browser, network, services, or tracked-file writes.
