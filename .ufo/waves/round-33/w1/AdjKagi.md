# AdjKagi — C1 build, kagi disposition drafts (kagi :20, :59, :81)

**Verdict.** All three unaccounted kagi browser-domain candidates are restatements of the one
kagi ground this lane already dispositions — the the-musketeer profile / CDP-9222 lease mapped
`contested-open` at `kagi PROVINCE.md:43` — so each is screened `same-surface`
(`musketeer-cdp-9222-profile-lease`) with a verbatim quote; I drafted **no new map row**
(`rows.tsv` is empty). In a scratch clone at commit `487197e` the three screens verify clean
(frozen counter: `screened=3`, `screenFindings=[]`, kagi absent from `unaccountedKeys`, unaccounted
44 of the fleet's 47 baseline, adjacency `clean` rows 10 / verified 10), but `newMapped` is
unchanged at 0 **for this slice**: honest disposition of the kagi lines cannot supply the fleet's
four new rows, because the only real overlap on them is already mapped and a second row on the same
(surface, sibling) pair is `duplicate_row`.

## Evidence

Candidate keys are from `.ufo/waves/round-33/baseline/c1-candidates.tsv`; the baseline receipt
`.ufo/waves/round-33/baseline/c1-J1-do-nothing.json` lists exactly my three keys in
`unaccountedKeys` (checked with a Python filter over that JSON; filtered list =
`[kagi…:PROVINCE.md:20, :59, :81]`).

Sibling side read at the frozen pin:
`git -C /home/vgpnk/Projects/shokunin/kagi-shokunin show 69b61db46be4ed955994f6f1d1cba522bc5f4e97:PROVINCE.md`
→ lines 20, 43, 59, 67, 81 plus the round-18 substrate erratum at :10-17. Tabi side read:
`PROVINCE.md:6-10` (owns browser inventory + profile surfaces, CDP session discipline; refuses
secrets → kagi at :16), `SKILL.md:556` (fresh throwaway profile per run), and the existing map rows
in `corpus/adjacency.tsv` (kagi has `musketeer-cdp-9222-profile-lease` and `secrets-vault-ops`; no
other kagi surface).

Quote checks (each `grep -F` against the `git show` bytes of the pinned line; exit 0 = present):

```
$ sed -n '20p' kagi-province.md | grep -qF 'the CLI: `status`/`start`/`stop`/`request`/`run`/`refs`/`whoami`/`cdp-bridge`/`tac-check`/`tac-register`/`_serve` (hidden)'   # OK words=4 nonspace=119
$ sed -n '59p' kagi-province.md | grep -qF 'the CDP lease/profile ownership question is reported to the integrator'                                                        # OK words=10 nonspace=61
$ sed -n '81p' kagi-province.md | grep -qF 'method, secret-scanner ownership, browser leases or authenticated endpoint'                                                    # OK words=8 nonspace=67
```

The first :81 quote I tried ("… operations from siblings") exited 1 — the sentence wraps at
`:81/:82` — and was corrected to the line-81 prefix before any file was written. All three final
quotes are 4..25 words and ≥ 20 non-space characters.

Validation (clean clone of the lane at the freeze commit, `TMPDIR` under
`/fast/scratch/hyaku/tabi-r33/AdjKagi/tmp`):

```
$ git -C "$D" rev-parse --show-toplevel        # /fast/scratch/hyaku/tabi-r33/AdjKagi/clone
$ git -C "$D" rev-parse HEAD                   # e6b0a9074d434ccc307badd312ae7379d1193fea (checkout --detach)
# cp screen.tsv -> corpus/adjacency-screen.tsv (header + 3 rows, 5 TAB cols each);
# rows.tsv is empty so corpus/adjacency.tsv is appended-not-at-all
$ git -C "$D" -c user.name=AdjKagi -c user.email=AdjKagi@scratch.local commit -m 'r33 w1 AdjKagi: adjacency screen rows for kagi PROVINCE:20,59,81'
# HEAD 487197ead5f9c7096d8eb39f5538bd500406d935 — 1 file changed, 4 insertions(+)
$ node "$D/scripts/check-adjacency.mjs" --at 487197e… --repo "$D" --fleet /home/vgpnk/Projects/shokunin --json
  exit=0  {"verdict":"clean","rows":10,"verified":10,"selfRulings":[2]}   (findings 0)
$ node "$D/.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs" --repo "$D" --fleet /home/vgpnk/Projects/shokunin --rev 487197e… --json
  exit=1  candidates=52 mapped=5 screened=3 unaccounted=44 newMapped=0 predicate=false
          adjacency={'verdict':'clean','rows':10,'verified':10,'findings':0}
          screenFindings=[]   unaccountedKeys naming kagi=[]
```

Exit 1 is the fleet-level predicate (`newMapped 0`, other lanes' 44 candidates still open); it is
not a finding against these rows — the counter's own screen validation is empty and every one of my
three rows is counted (`screened` 0 → 3, unaccounted 47 → 44, kagi contribution 3 → 0).

Frozen-input digests at the clone: `scripts/check-adjacency.mjs`
`4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` (= claims.json pin);
`c1-adjacency-sweep.mjs` `da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380`
(= `frozenDigests`). My `screen.tsv` sha256 `c3830f7db4eab55eb88b07ac572315dcc4857794c4135840fd9450d8796cd4bd`.

## Per-candidate dispositions

| candidate | decision | reason (grounded in both sides) |
|---|---|---|
| kagi `PROVINCE.md:20` | screen `same-surface` → `musketeer-cdp-9222-profile-lease` | The line is the-janitor's CLI verb inventory; its only browser token is `cdp-bridge`, whose ground — CDP 9222 + `~/.local/share/the-musketeer/chrome-profile` — is the lease/profile surface kagi:43 files contested and tabi answers with the throwaway-profile rule (`SKILL.md:556`). A verb list adds no second browser claim. |
| kagi `PROVINCE.md:59` | screen `same-surface` → `musketeer-cdp-9222-profile-lease` | kagi's Deliberate-refusals sentence names "the CDP lease/profile ownership question" and reports it to the integrator — a restatement of kagi:43, declaring no new surface. |
| kagi `PROVINCE.md:81` | screen `same-surface` → `musketeer-cdp-9222-profile-lease` | "browser leases" in the non-absorption sentence is the the-musketeer profile lease kagi attributes to kake at :67 and records contested at :43; the sentence declares a boundary, not a distinct surface. |

No surface was invented (nothing for the L1 to dedupe against the AdjKake seats). The declined
alternative, recorded so the L1 can overrule deliberately: a `contested-open` row on a NEW
`cdp-bridge`/manifest surface with a draft L0 line. I declined it because (i) the lease row already
covers the 9222/profile ground and a duplicate (surface, sibling) pair is `duplicate_row`, and
(ii) this lane's own round-17 accounting groups that ground inside the lease
(`corpus/lessons/round-17.md:117`: kagi `corpus/adjacency.tsv:83` = "NMH manifest inside kake's
lease"). If the L1 prefers the contested-open reading, it must file a `tabi | round-33 | …` L0 line
naming kagi first; I drafted none because I judge the overlap already dispositioned.

## Limits

- The counter cannot judge overlap semantics, and `same-surface` is a semantic judgement: a wave-2
  attacker may argue `cdp-bridge` is its own overlap rather than the lease's tooling. My defence is
  the mapped kagi:43 line plus round-17.md:117; the attack surface is real.
- `same-surface` screening names an existing mapped surface of the same sibling, so it is only valid
  while `musketeer-cdp-9222-profile-lease`/kagi stays verified — if an integrator ruling rewrites or
  drops that row, these three screens fail `screen-surface-unmapped`.
- My slice leaves `newMapped` untouched: the ≥ 4 new-row target must come from other seats' genuine
  overlaps (kake, kaidoku, revenger, kama, kumitate…), not from these kagi restatements.
- No `--selftest` of the gate was run (not in this seat's assignment; the gate is unmodified).

## Hygiene

No browser launched (`pgrep -fa 'chromedriver|chromium'` filtered on `tabi-r33/AdjKagi` → empty: no
chromedriver/chromium owned by this seat); no network fetch; no tool installed or upgraded (pacman
untouched); no lane tracked file, lane index, fleet repo or sibling repo written (only my output
dir and the scratch clone, one commit inside it). Scratch `/fast/scratch/hyaku/tabi-r33/AdjKagi`
removed after receipts were copied.

## Deliverables

- `.ufo/waves/round-33/w1/AdjKagi/screen.tsv` — 3 screen rows, 5 TAB columns, no header
- `.ufo/waves/round-33/w1/AdjKagi/rows.tsv` — empty (no map rows drafted)
- `.ufo/waves/round-33/w1/AdjKagi/candidates.md` — per-candidate table
- `.ufo/waves/round-33/w1/AdjKagi/receipts/` — `check-adjacency-at-487197e.json`, `c1-sweep-at-487197e.json`, both `.stderr` (empty), `digests.txt`
