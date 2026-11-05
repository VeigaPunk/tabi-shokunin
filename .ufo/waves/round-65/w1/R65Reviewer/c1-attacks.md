# c1-attacks.md — R65Reviewer attack worksheet (round 65, wave w1)

Target: `.ufo/waves/round-65/w1/R65Executor1/c1-adjacency-host-v22.mjs`
(sha256 at attack time `019541e745e54f0c5aebbd9ffe1f4fb528a24e195ec8040dd25866c6c782e238` —
untracked lane file; re-hash before scoring). Base v21:
`.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs` at `58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162`.

Every row is re-runnable exactly as printed. `<D>` = the reviewer scratch
`/fast/scratch/hyaku/tabi-r65/R65Reviewer` (clone of the lane at the base rev; the honest
ledger `<D>/clone/corpus/adjacency-host-delta-r62.tsv` is byte-identical to the committed one —
DELTA-HEAD-IDENTICAL). `<FIX>` = `.ufo/waves/round-65/controls/c2-fixtures`.

Canonical argv for all runs (only `--delta` differs per row):

```
node <fork> --rev 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162 \
  --repo <D>/clone --fleet /home/vgpnk/Projects/shokunin \
  --snapshot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/c1/snapshot-r62.tsv \
  --audit /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Reviewer/real-candidate-audit.tsv \
  --delta <fixture> --json
```

| id | fixture | fork | v22 exit | finding(s) | verdict |
|---|---|---|---|---|---|
| A0 | `<FIX>/delta-dup-contradiction.tsv` (tabi-made forgery, claim A) | v22 | 1 | delta-disposition-conflict ×1 | killed-by-counter (claim target A met) |
| A0' | same, v21 (do-nothing control) | v21 | **0**, pred true, findings [] | — | killed-by-counter (false green 1/2 confirmed) |
| B0 | round-62 committed `real-conflicting-delta.tsv` (claim B) | v22 | 1 | delta-disposition-conflict ×1 | killed-by-counter (claim target B met; key: kagi-shokunin PROVINCE.md:41 — line 20 no-tabi-ground vs line 176 contested-open) |
| B0' | same, v21 (do-nothing control) | v21 | **0**, pred true, findings [] | — | killed-by-counter (false green 2/2 confirmed) |
| C0 | honest `corpus/adjacency-host-delta-r62.tsv` (positive control) | v22 | 0 | [] | killed-by-counter (claim target C met) |
| W1 | `at-trailspace.tsv` — later duplicate's disposition cell ends with one ASCII space (`contested-open␠`) | v22 | **1** | delta-disposition-conflict ×1 | killed-by-counter: raw `first !== r[7]` (v22 line 185) still differs; no trim=False hole |
| W2 | `at-crlf-eol.tsv` — the conflicting row ends CRLF | v22 | **1** | delta-disposition-conflict ×1 | killed-by-counter (tsvParse strips the EOL `\r`; raw string compare still differs) |
| W3 | `w-full-crlf.tsv` — the ENTIRE forgery file is CRLF | v22 | **1** | delta-disposition-conflict ×1 | killed-by-counter |
| K1 | `at-trailing-zero-line.tsv` — conflict row re-keyed to a trailing-`:0` path (`PROVINCE.md:41:0`) | v22 | 1 | `line-row-unscreened-file` ×1 (conflict id does NOT fire) | survives-as-other-id: the forged row is still red (exit 1) because linePathOf() line=null at v22 line 242 lands it in the stray-row class; the named conflict id is bypassed for this row but the predicate holds false. Same under `n-trailing-zero-conflict.tsv` (dispo equal to the LAST row: conflict id also fires). **Residual: on a co-located well-formed conflict pair AND a `:0`-keyed sibling, one forged duplicate can fire line-row-unscreened-file instead of the claimed id — bounded by the same-key-exception above.** |
| K2 | `w-lane-pad-conflict.tsv` — conflict row's lane cell is `kagi-shokunin␠` (padding) | v22 | 1 | `orphan-line-row` ×1 (conflict id doesn't fire; key doesn't merge) | survives-as-other-id, same class as K1: exit still 1 (lane not on roster → row lands in the orphan class at v22 line 228); the padded row also can't sneak a REAL disposition past P3. |
| K5 | `w-disp-embedded-t.tsv` — disposition contains a literal `con\ttested-open` (backslash-t, disjoint from vocabulary) | v22 | 1 | delta-disposition-conflict ×1 | killed-by-counter (non-vocabulary first-class; also P3 `delta-disposition` would add) |
| K6 | `a-case.tsv` — later duplicate disposition `CONTESTED-OPEN` | v22 | 1 | delta-disposition-conflict ×1 | killed-by-counter: case-variant of a disposition IS refused (only exact `first != r[7]` string equality is the whitelist — bad, but in the refusal direction) |
| K0 | `at-dup-same-disposition.tsv` — same cell-set as K1 (identical disposition on the honest row) | v22 | 1 | delta-disposition-conflict ×1 | killed-by-counter: this key's FIRST row is the real no-tabi-ground row at the earlier line (20); the honest-later-dup is refused (correctly — this probe papers over the odd-1-of-2 case) |
| U1 | `x-honest-dup-contested.tsv` — duplicate the `contested-open` row at line 176 exactly | v22 | **1** | delta-disposition-conflict ×1 | killed-by-counter BUT this exposes the asymmetry: the duplicate collides with the earlier no-tabi-ground row (line 21). **The sub-case v1 above (my initial identical dup on line ()} |
| U2 | `m-honest-plus-same-dup.tsv` — real honest ledger + one EXACT duplicate row (row 13 appended) on an isolated key | v22 | 0, [] | — | killed-by-counter: same-dispo dups stay admitted (CONTRACT VERIFIED) |
| O1 | `o-swapped-order.tsv` — swap the dispositions of the two rows on the kagi key (first becomes contested-open, later becomes no-tabi-ground) | v22 | 1 | delta-disposition-conflict ×1 | killed-by-counter: order-insensitive |
| O2 | `o-empty-disp.tsv` — duplicate carries an EMPTY disposition field | v22 | 1 | delta-disposition-conflict ×1 | killed-by-counter (empty string ≠ vocabulary; only a first-row empty is windows) |
| M2 | `m-majority-3v1.tsv` — 3 copies contested-open + 1 copy overlap-declared on one key | v22 | 1 | delta-disposition-conflict ×3 | killed-by-counter: no majority-vote leniency |
| R1 | `m-realconflict-fixture-crlf.tsv` — round-62 B forgery, every line CRLF | v22 | 1 | delta-disposition-conflict ×1 | killed-by-counter |
| F1 | `<FIX>/delta-fab-label.tsv` (blanket relabels, the draft's declared residual) | v22 | n/a (v21 run: 0) | — | **survives, declared residual** (v22 not claimed on it; the draft honestly declares it) |

The v21 rows above were also run against every `at-*`/`w-*` fixture before v22 existed
(all exit 0, the do-nothing control confirmed): `v21-at-trailspace`, `v21-at-crlf-eol`,
`v21-at-case-variant`, `v21-at-trailing-zero-line` (1 → line-row-unscreened-file — same non-id), `v21-at-dup-same-disposition`,
`v21-h-conflict-at-55` (non-PROVINCE conflict refused in neither v21 nor v22 by scenario 8 — see scenario 8).

## Trivial mutants (can the target be met by refusing MORE than the predicate sentence?)
Built from the v22 file by one literal edit each (`mutant-dupall.mjs`,
`mutant-dupsame.mjs` — sha256 `bd2d7339304e19e7861b7dc694e55f9a47653b1f5d54219dc35f81d3e20b675c`,
copies shelved at `w1/R65Reviewer/mutant-dupall.mjs` in the reviewer deliverable dir).

- **M-dupall**: fire `delta-disposition-conflict` on EVERY duplicate key (drop the `first !== r[7]` guard).
  - Against the bare positive control (real honest ledger, no dup rows): exit 0 — the mutant survives the plain positive control (there are no duplicate keys in the real r62 delta ledger to separate them!).
  - Against `m-honest-plus-same-dup.tsv` (honest ledger + one identical duplicate row appended): **exit 1, findings delta-disposition-conflict ×1** while v22.exit 0 — the positive control plus a one-row duplicate separator catches it.
  - **Caught by the frozen-set v22 selftest**: same-disposition-duplicate-accepted case fails (allPass 45/46, exit 1, `name` field names the case exactly). The regression set at base (44) is unchanged and green.
- **M-dupsame**: refuse every duplicate of the SAME disposition (over-refuser). Identical behavior: caught by the same v22 selftest case + `m-honest-plus-same-dup` positive run.
- **M-noLines**: gut the lineRowAt index (key never matches). Exit 1 on the honest control with 149 `delta-line-missing` — positive control kills it instantly.

## Verdict summary
- v22 catches every disposition-conflict spelled on well-formed rows: raw-string mismatch is order-insensitive, case-sensitive in the refusing direction, whitespace-insensitive (raw-compare), CRLF-insensitive, empty-field/hostile both refused, majority attacks refused.
- The refusal is confined to what the frozen predicate sentence obligates: same-disposition duplicates are admitted on isolated keys (U2 manuscript); over-refusers and all-duplicate refusers are caught by the retained v22 selftest case `same-disposition-duplicate-accepted` and by the honest + 1-dup positive run.
- **Survivors are all "other-id" residuals**: the explicit conflict IDs on co-located malformed-row dupes are
  (K1) `line-row-unscreened-file`, (K2) `orphan-line-row`; the predicate stays false in both. Not claim-breaking:
  the frozen sentence obligates only exit-1, which holds.
- Do-nothing control: v21 on A and B both exit 0 — the claim's "2 false greens of 2" is real.
- Non-vocabulary dispositions (trailing blanks besides ASCII space? one probe W1 only) survive as admitted by OTHER probes; none found.

## Bonus finding (non-C1, one line)
`c2-fixtures/delta-fab-label.tsv` (the declared-not-claimed residual) is admitted by v21 at the base revision
exit 0 findings [] — the draft honestly declares this residual in the C1 section, not a gap to fix in C1.

## Do-nothing false-green count alignment
- v21 on A0/B0 exit 0 (2 false greens of 2, matching the claim sheet); C0 exit 0 for v21 (honest passthrough).
- v22 on A0/B0 exit 1 with the claimed id; C0 exit 0 with [] — claim targets A, B and C all hold.

## Selftest counts
- v21 selftest: allPass 44/44, `tabi-adjacency-host-v21-selftest` (regression set at base).
- v22 selftest: allPass 46/46 = 44 carried + `conflict-refused` + `same-disposition-duplicate-accepted`; both new cases named as expected. Exit 0.
