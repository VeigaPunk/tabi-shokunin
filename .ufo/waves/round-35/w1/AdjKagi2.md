# AdjKagi2 — C1 build (round 35, wave w1): 14 kagi candidates dispositioned

**Verdict.** All 14 candidate lines in `.ufo/waves/round-35/w1-chunks/AdjKagi2.tsv` are accounted for: **14 screens,
0 map rows** — 6 `same-surface` on the already-verified kagi surface `musketeer-cdp-9222-profile-lease`, 8
`third-lane-report`. The frozen counter accepts every row (`screenFindings []`), none of my keys remains in
`unaccountedKeys` (14/14), the adjacency gate is clean at both the freeze (16/16 verified, exit 0) and my commit
(exit 0), and the counter exits 1 only because `predicate` also needs `newMapped >= 2` and the remaining 369
unaccounted candidates in my lone clone belong to the wave's other Adj\* chunks. This chunk cannot honestly supply a
new map row: kagi's `corpus/knowledge/adjacency-scope.md` is a third-lane ownership record (its path matches the
frozen counter's `THIRD_LANE` class `adjacen`, so a row citing it is refused under n3), and
`corpus/knowledge/cdp-bridge-1password.md` states only the burner-Chrome-profile / NMH-manifest premise that
kagi `PROVINCE.md:43` already supplies to the existing contested-open row — a second row would double-count one open
lease question (QUALITY 91, 97).

## Behaviour

Decision rule `SKILL.md:2861-2881` applied in order to each line, after reading tabi's `PROVINCE.md` (surfaces:
CDP session discipline `:9`, browser inventory/profile census `:7-8`, secrets refused to kagi `:15-16`) and kagi's
own `PROVINCE.md` at the pin (`69b61db`).

| group | lines | reason | ground |
|---|---|---|---|
| citation-gate evidence over kake's bytes | `adjacency-scope.md:36,37,125,217,276,304,305` | `third-lane-report` | kagi measures kake's `SKILL.md:104-107` / `mirror-pitfalls.md:48` (README:76 decay, `STALE-BASIS` falsifier, bound 6, reproduction commands); it claims nothing on tabi's surface. |
| kake's launcher symlink in kagi's bin census | `adjacency-scope.md:58` | `third-lane-report` | kagi reports another lane's asset while counting `$HOME/.local/bin` children; no browser-launch claim. |
| the kake/kagi musketeer profile contest, restated | `adjacency-scope.md:64,71,161`, `cdp-bridge-1password.md:13,14` | `same-surface` | kagi `PROVINCE.md:43` (`contested with kake`, `presence-only` profile dir, `kagi pins only the 1Password native-messaging manifest`) is already carried by the verified row `musketeer-cdp-9222-profile-lease` / `kagi`. |
| the bridge entry's title | `cdp-bridge-1password.md:1` | `same-surface` | names the same NMH/CDP-bridge substrate; a heading states no side of its own. |

No line was `not-browser-sense` (all 14 genuinely concern Chrome/CDP substrate) and none reached rule 5 (a real
overlap the map must newly answer).

## Evidence (commands, exit codes)

All in a shared clone of the lane at the freeze; `TMPDIR=/fast/scratch/hyaku/tabi-r35/AdjKagi2/tmp`.

| # | command | exit | outcome |
|---|---|---|---|
| 1 | `git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83` | 0 | `HEAD = a4bfef0f75027c915e715649950b1d46dcb33d83` |
| 2 | `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --list-candidates --repo $S/clone --fleet /home/vgpnk/Projects/shokunin` | 0 | 383 candidates; all 14 chunk keys present (verified key-by-key) |
| 3 | `node scripts/check-adjacency.mjs --at a4bfef0f… --repo $S/clone --fleet … --json` | 0 | `verdict clean rows 16 verified 16`, findings 0 |
| 4 | `git -C $S/clone -c user.name=AdjKagi2 -c user.email=AdjKagi2@scratch.local commit -m 'r35 w1 AdjKagi2: screen ledger for 14 kagi candidates'` | 0 | `HEAD = 5b4c9d4b28a9281fdccaf61767c76fc1888389c3`; `git diff --numstat a4bfef0f 5b4c9d4b` = `15 0 corpus/adjacency-screen-browser.tsv` (header + 14 rows, nothing else) |
| 5 | `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 5b4c9d4b28a9281fdccaf61767c76fc1888389c3 --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json` | **1** | `C1_ADJACENCY_SWEEP_V3 predicate=not-met rev=5b4c9d4b… adjacency=clean candidates=383 mapped=0 screened=14 unaccounted=369 newMapped=0 screenFindings=0` |
| 6 | `node scripts/check-adjacency.mjs --at 5b4c9d4b… --repo $S/clone --fleet …` | 0 | `ADJACENCY verdict=clean rows=16 verified=16` |

Counter fields demanded of this seat:

- `adjacency`: `{"verdict":"clean","rows":16,"verified":16,"findings":0}`.
- `screenFindings`: `[]` (all 14 rows accepted: closed reason, verbatim quote inside the pinned line, `same-surface`
  naming the verified `musketeer-cdp-9222-profile-lease` / `kagi` pair, `surface` `-` elsewhere).
- my keys absent from `unaccountedKeys`: **14 / 14** (`myKeys.stillUnaccounted = []`).
- `newMappedRows`: `[]`; `newRowRefusals`: `[]` — no row was proposed, so none was refused.

Ledger bytes: `sha256(corpus/adjacency-screen-browser.tsv at 5b4c9d4b) =
491e0aed4054397e9bbd85ae5c5cb19d4b7d614dafa186db0dea73e59e7a8fc7` (15 lines, exactly 5 TAB columns per row).

## Touched surfaces

- Written (deliverables only): `.ufo/waves/round-35/w1/AdjKagi2/` and this report.
- Scratch clone only: `corpus/adjacency-screen-browser.tsv` (new ledger). **No** `SKILL.md` append and **no**
  `corpus/adjacency.tsv` row: with zero map rows there is no `DECL<n>` to append. `SKILL.md` and
  `corpus/adjacency.tsv` are byte-identical to the freeze in the clone (`git diff --numstat` shows one path).
- Lane checkout, lane index/jj, fleet repo, sibling repos: untouched (read-only `git show` only).
- No browser/driver launched; no tool installed or upgraded; no network fetch.

## Findings for the L1 / wave 2

1. **Double-count hazard on kagi's CDP-bridge entry.** `corpus/knowledge/cdp-bridge-1password.md` does **not** match
   the counter's `THIRD_LANE` regex, so a peer could still get `newMapped` credit for a *new surface name* on the
   same lease question (e.g. `burner-chrome-profile-nmh-write`). That row would be a fact on kagi's side of the
   already-mapped split — a screen by QUALITY 91, whatever its surface name. Worth an explicit wave-2 attack if any
   seat ships a row citing that path.
2. **`adjacency-scope.md` is categorically un-mappable.** Its path matches `THIRD_LANE` (`adjacen`), so n3 refuses
   any row citing it. Any seat that maps a line from that file burns a row into `newRowRefusals` rather than
   `newMapped`; the screens here are the only shape that can count.
3. **My chunk supplies no `newMapped`.** The round's `newMapped >= 2` must come from the other Adj\* chunks
   (kaidoku 137, kumitate 66, kake 51, kotoba 20, mado 20, tsukuroi 20, kama 9, mori 2, chousa 1, tameshi 1, and
   kagi's `SKILL.md` / `adjacency-breadth.md` lines). This seat's 14 were profile-lease and citation-gate lines.
4. **Not repaired, per seat bounds:** the counter's `same-surface` test only checks that the *surface name* exists as
   a verified row for the sibling — it does not check that the candidate line is about that surface. My six
   `same-surface` rows are argued line by line in `decisions.md` and are open to attack.

## Artifacts

- `.ufo/waves/round-35/w1/AdjKagi2/screen.tsv` — 14 screen rows, no header, 5 TAB columns.
- `.ufo/waves/round-35/w1/AdjKagi2/rows.tsv` — 0 bytes (no map rows proposed).
- `.ufo/waves/round-35/w1/AdjKagi2/decl.md` — states no `DECL<n>` exists and why.
- `.ufo/waves/round-35/w1/AdjKagi2/decisions.md` — per-key decision + both-sides ground.
- `.ufo/waves/round-35/w1/AdjKagi2/counter-check.json` — commands, exit codes, extracted fields, ledger digest.
- `.ufo/waves/round-35/w1/AdjKagi2/counter-raw.json` — verbatim frozen-counter JSON at `5b4c9d4b`.
- No `l0.txt` (no `contested-open` row drafted).
- Scratch `/fast/scratch/hyaku/tabi-r35/AdjKagi2` removed after the receipts above were copied out.
