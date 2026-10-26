# Decisions — AdjKagi2 (C1 build, 14 kagi candidates)

Decision rule applied in order: `SKILL.md:2861-2881` (round-33 "decision rule: a map row or a screen row"),
with `QUALITY.md:545-556` (88), `:585-590` (91), `:670-675` (97).

**Outcome: 14 screens, 0 map rows.** Every line in this chunk sits on ground this lane has already answered:

- kagi's `corpus/knowledge/adjacency-scope.md` is kagi's own ownership-partition record (its path matches the
  frozen counter's `THIRD_LANE` class: `adjacen`). Twelve of its lines cite kake's `SKILL.md` / corpus bytes as
  citation-gate evidence, or restate the kake/kagi musketeer-profile contest. A map row citing that path is
  refused under n3 (`n3-third-lane-record`) and, more importantly, would be a second row for a surface the map
  already owns (`musketeer-cdp-9222-profile-lease`, kagi) — QUALITY 91 says a fact on the sibling's own side of an
  already-mapped split is a scan, not a row.
- kagi's `corpus/knowledge/cdp-bridge-1password.md` is the 1Password NMH-manifest entry. Its three candidate lines
  are the burner-Chrome-profile premise for the manifest write — the exact fact kagi's `PROVINCE.md:43` states and
  the existing `musketeer-cdp-9222-profile-lease` row (contested-open) already dispositions. A second row would
  need a new surface name for the same contested lease, i.e. double-counting one open question; screen instead.
- No line in this chunk is a real overlap the map must answer: none states a **new** side of a browser surface that
  no baseline row owns (rule 5 never fires), and none is `not-browser-sense` (all 14 are genuinely about Chrome/CDP
  substrate, not another sense of the words).

Verified surface used by every `same-surface` row: `musketeer-cdp-9222-profile-lease` / sibling `kagi` — a
verification-passing row at the freeze (`ADJACENCY verdict=clean rows=16 verified=16`, exit 0).

## Per-line

| key | decision | ground in both sides' lines |
|---|---|---|
| `kagi-shokunin@69b61db`…`adjacency-scope.md:36` | screen: third-lane-report | kagi measures its own README:76 citation against kake's `SKILL.md:104-107` (`musketeer` 0 times); tabi's CDP-evidence surface (PROVINCE.md:9) is not what the line is about, and kagi claims nothing there. |
| `…adjacency-scope.md:37` | screen: third-lane-report | continuation: the grep count is on kake's slice and the claim is placed at kagi's own README:161, so the line reports another lane's bytes. |
| `…adjacency-scope.md:58` | screen: third-lane-report | kagi's `~/.local/bin` breadth census notes one child is kake's `musketeer-chrome` launcher symlink; it reports kake's asset inside kagi's partition and asserts nothing about browser inventory/launch (tabi, PROVINCE.md:7-8). |
| `…adjacency-scope.md:64` | screen: same-surface | the group row `…/the-musketeer/chrome-profile \| kake \| contested \| presence-only` is the partition form of kagi `PROVINCE.md:43` ("contested with kake", "kagi pins only the 1Password native-messaging manifest") — already the `musketeer-cdp-9222-profile-lease` contested-open row. |
| `…adjacency-scope.md:71` | screen: same-surface | kagi's `cdp-bridge ensure` is the documented writer of the NMH dir + manifest while the enclosing profile stays `owner=kake`; that is the manifest-pinning half of the same row's split, not a second surface. |
| `…adjacency-scope.md:125` | screen: third-lane-report | an R6 failing-input example cites kake's `SKILL.md:104-107` with token `musketeer` to show `STALE-BASIS` firing; gate mechanics over kake's line, no claim on tabi's surface. |
| `…adjacency-scope.md:161` | screen: same-surface | "kake/kagi both claim the musketeer profile in writing" and the gate prints it exit-neutral — the contested lease the map already holds open. |
| `…adjacency-scope.md:217` | screen: third-lane-report | bound 6 reports an executed citation of kake's `mirror-pitfalls.md:48` launcher line to prove the `token` floor is not relevance; it is a report about kake's line. |
| `…adjacency-scope.md:276` | screen: third-lane-report | a `--falsify` step cites kake's `SKILL.md:104-107` to produce `STALE-BASIS` — kagi's own test over another lane's bytes. |
| `…adjacency-scope.md:304` | screen: third-lane-report | a reproduction command grepping kake's `SKILL.md:104-107` for `musketeer`; measurement only. |
| `…adjacency-scope.md:305` | screen: third-lane-report | the paired command repeats the check on kagi's README:161 and kake's `mirror-pitfalls.md:48`; measurement only. |
| `…cdp-bridge-1password.md:1` | screen: same-surface | the entry title names the 1Password↔Chrome CDP bridge — the NMH-manifest/profile substrate the `musketeer-cdp-9222-profile-lease` row already covers; a title adds no claim (rule 2 precedes any reading of it as an overlap). |
| `…cdp-bridge-1password.md:13` | screen: same-surface | kagi states the burner Chrome profile (`the-musketeer`) is a separate directory so its NMH manifest must be written into it — the profile/manifest split with kake already mapped, restated as a premise. |
| `…cdp-bridge-1password.md:14` | screen: same-surface | same premise continued; no second row for a browser-profile surface already answered. |

## Not proposed

- No map row, so no `DECL<n>` line, no `SKILL.md` append, no `corpus/adjacency.tsv` row, no `l0.txt`.
- No `contested-open` draft: the kake/kagi lease question is already open as fleet L0 (cited by the existing row);
  a second L0 line for the same lease would duplicate a question, not open a new one.
