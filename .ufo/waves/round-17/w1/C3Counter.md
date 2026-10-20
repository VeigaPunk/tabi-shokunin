VERDICT: PASS

# C3 counter - `.ufo/waves/round-17/measure-c3.mjs`

Owner: C3Counter (PLAN ownership row). Read-only on everything else. No lane git writes:
every fixture/probe ran in `/tmp` clones (`git clone --shared`), removed by trap. No tool
installs were needed (no pacman/uv/npx), so no tool record follows.

## Baseline 5859243 -> 0 (verbatim)

`node .ufo/waves/round-17/measure-c3.mjs 5859243183c4d7ac5429dfdb8a73ce0d9a43d583`, exit 0, one line:

```
{"c3_adjacency_verified":0,"by_disposition":{"contested-open":0,"ruled":0,"split-declared":0,"refused-route":0},"rows":[],"probes":{"revision":"5859243183c4d7ac5429dfdb8a73ce0d9a43d583","lane_repo":"/home/vgpnk/Projects/shokunin/tabi-shokunin","fleet_root":"/home/vgpnk/Projects/shokunin","tsv":{"path":"corpus/adjacency.tsv","present":false,"sha256":null,"header":[],"header_ok":false,"data_rows":0,"absent_reason":"absent"},"checker":{"path":"scripts/check-adjacency.mjs","present":false,"sha256":null,"probe_rows":0,"probe_base_matches_map":false,"expected_real_exit":2,"status":"checker_absent","real":{"exit":null,"ok":false,"status":"checker_absent"},"mutations":[]},"error":null}}
```

Both `corpus/adjacency.tsv` and `scripts/check-adjacency.mjs` are absent at 5859243
(`git cat-file` path returns `absent`), so N=0 is structural, not a red map.

## What the counter re-derives (does not trust the checker)

`measure-c3.mjs:1092 main` -> `measure-c3.mjs:486 verifyRow` per row; map blob read with
`git ls-tree` + `git cat-file blob` at REV (`measure-c3.mjs:358 blobAt`). No shell: every child
is an argv `spawnSync` under a minimal Git env (`GIT_CONFIG_NOSYSTEM`, global `/dev/null`,
`GIT_LITERAL_PATHSPECS`, `GIT_NO_REPLACE_OBJECTS`, no fsmonitor, ceiling at `dirname(fleetRoot)`).

- sibling: `sibling == sibling_ref lane`, never this lane; commit resolves, is a regular-file blob
  at the pinned path, is reachable from the sibling lane-tip ladder (master -> main, attached
  branch as fallback), and `sibling_quote` is a verbatim substring of exactly that line
  (`measure-c3.mjs:509-534`). Quote floor 4 words / 20 non-space chars, cap 25 words.
- tabi: `tabi_ref` must be `<path>:<line>` (non-`.ufo`, non-map), quote verbatim on that exact
  line at REV (`measure-c3.mjs:537-562`).
- disposition: closed four-value set. `ruled` venue = `fleet` or a self
  `corpus/lessons/*-verifier-spotcheck.md` line whose last-touching author at the pinned commit is
  not this lane and whose line is byte-identical at REV (`measure-c3.mjs:296 checkSelfVenue`,
  `:385 lastAuthor`); `contested-open` = `fleet` `.ufo/l0-questions.md` `tabi | round-N |` line that
  names the sibling; `split-declared|refused-route` = `-` plus a second quote present in the tabi
  file (`measure-c3.mjs:564-660`). `ruled` quote must name the sibling.
- duplicates: folded surface + sibling lane, matching the checker (one row per overlap).

Output is one JSON line with `c3_adjacency_verified`, `by_disposition`, `rows[]` (line, fields,
per-row `verified`/`reasons`) and `probes` (tsv identity, checker sha256, real run, 7 mutations).

## Synthetic positive proof (real kaidoku line, sandbox, discarded)

Fixture `/tmp/tabi-r17-c3proof2.sh` (sha256 `fec96811...`, kept as a scratch script; the clones it
builds are removed). Layout `$T/fleet/{tabi-shokunin,kaidoku-shokunin}` as `--shared` clones, the
delivered checker blob copied in, one row committed:

| column | value |
|---|---|
| surface | `kaidoku CDP loopback observation` |
| sibling | `kaidoku` |
| sibling_ref | `kaidoku-shokunin@b2aad08c...:PROVINCE.md:53` (kaidoku `main` tip) |
| sibling_quote | `Runtime observation (CDP) \| self-launched targets:` (kaidoku `PROVINCE.md:53`) |
| tabi_ref | `corpus/lessons/round-16-verifier-spotcheck.md:142` |
| tabi_quote | `keeps CDP only as an REA provider surface for shipped-artifact analysis` |
| disposition | `ruled` |
| ruling_ref | `tabi-shokunin@5859243...:corpus/lessons/round-16-verifier-spotcheck.md:142` |
| ruling_quote | `**kaidoku** keeps CDP only as an REA provider surface` |

Run `node .ufo/waves/round-17/measure-c3.mjs --repo $T/fleet/tabi-shokunin --fleet-root $T/fleet REV`
(REV `8c330c8d...`, sandbox commit; TSV blob sha256 `e2bf5a9b...`): exit 0, `n=1`,
`by_disposition.ruled=1`, `rows[0].verified=true`, `checker.status=ran`, `real.exit=0`,
`count_agreement=true`, `probe_base_matches_map=true`, `probe_base_exit=0`, and all 7 mutations
applied, each dropping the counter below its eligible row count and forcing `checker_exit=1`:

| mutation | note | counter reason | checker |
|---|---|---|---|
| quote_from_other_line | quote drawn from `PROVINCE.md:1` | sibling_quote_absent | exit 1 |
| one_word_quote | `Runtime` only | quote_too_short | exit 1 |
| orphan_pin | pin -> `0000...` (no `refs/jj/keep` candidate) | sibling_unresolved | exit 1 |
| self_tabi_ref | tabi_ref -> the map itself | tabi_ref_invalid | exit 1 |
| ruling_unnamed | `an REA provider surface` | ruling_unnamed | exit 1 |
| duplicate_surface | appended case-fold duplicate | duplicate_row | exit 1 |
| tabi_line_shift | tabi_ref moved to line 1 | tabi_quote_absent | exit 1 |

This is the `ruled` self-venue path exactly as the checker admits it: 5859243's last-touching
author on the spot-check file is `protocol-shokunin`, not `tabi-shokunin`
(`git log -1 --format=%an 5859243 -- corpus/lessons/round-16-verifier-spotcheck.md`).

## Falsifier history (kept, not silently fixed)

1. REV `dcc3ebc4...` -> 0, reasons `[tabi_quote_absent, ruling_quote_absent]`: my fixture quote
   `kaidoku keeps CDP ...` skipped the `**` bold delimiters around `kaidoku` in the spot-check
   line, so it was not verbatim. Fixed the fixture, not the counter.
2. REV `83e8f7ca...` -> 0, reason `[ruling_quote_absent]`: a shell `sed` had written `\*\*kaidoku\*\*`
   into the row. Fixed the fixture.
3. Both were fixture defects, visible as 0 with real reasons rather than a crash: the counter
   reported exactly why the row failed.

## Real-map read (L1's in-flight `corpus/adjacency.tsv`, sandbox commit)

`/tmp/tabi-r17-c3real.sh`: lane clone + the L1's current untracked map + checker, committed in the
sandbox, `--fleet-root` the real fleet (real sibling pins), REV `66b80768...`, TSV blob sha256
`7319cccc...`. Result: `n=9`, `rows_total=9`, every row verified, dispositions contested-open 2 /
ruled 1 / split-declared 2 / refused-route 4; checker `ran`, `exit=0`, `[9 rows, 9 verified]`,
`agreement=true`, `base_exit=0`, all 7 mutations applied with checker exit 1. This is a snapshot of
a map the L1 still owns; it is evidence that the counter's contract accepts the delivered row
shapes, not a count for the round.

## Negative and coverage controls (all sandbox, all discarded)

- forged map (`/tmp/tabi-r17-c3neg2.sh`): real map row with a nonexistent sibling pin -> N=0,
  reason `sibling_unresolved`, `real.exit=1`, `count_agreement=true`, `mutations=[]`
  (`no_verified_row`).
- contested-open (`/tmp/tabi-r17-c3l0.sh`, sandbox fleet whose `l0-questions.md` gains two
  `tabi | round-17 |` lines): row naming `kaidoku` verified, row naming nobody dropped
  `l0_line_absent`; N=1 of 2, checker `[2 rows, 1 verified]`, exit 1, agreement true.
- split/refused (`/tmp/tabi-r17-c3split.sh`): `split-declared` and `refused-route` rows verified
  (ruling_ref `-`, second quote in the tabi file); a path-only `tabi_ref` row dropped
  `tabi_ref_invalid`; N=2 of 3, checker `[3 rows, 2 verified]`, exit 1, agreement true.

## Contract notes the L1 should see

- PLAN §C3's text says `tabi_ref = <lane-relative path>`; the wave-1 steer and the landed
  `scripts/check-adjacency.mjs` both require `<path>:<line>`. The counter follows the tighter
  steer/checker, so adjacency scouts and the L1 concatenation must emit `:line`. PLAN is L1-owned
  and untouched here.
- The counter emits two reasons the checker folds into others: `ruling_venue` (checker:
  `ruling_ref_invalid`) and `ruling_unnamed` (checker: `ruling_quote_absent`). Counts agree; only
  labels differ. Quote floor 4/20 matches the checker exactly.
- `siblingTip` uses master -> main and then the attached branch, per the steer; the checker's
  ladder is master -> main only. A sibling pin reachable only from a non-master attached branch
  would be admitted by this counter and refused by the checker; no current lane is in that state.
- Probe expectations: `real.exit` must be 0 iff `N == rows`, 1 when a row is red, 2 when the map
  is absent/schema-invalid. Each mutation must both drop the counter's N and force checker exit 1;
  `probe_base_exit=0` re-checks the counter's own green classification against the checker on the
  verified subset. All three are reported, never inferred.

## Files written

- `.ufo/waves/round-17/measure-c3.mjs` (new; 1181 lines; sha256
  `8dec49726e968934df85c53c72ec30e09d8fb6e1d8cd67c125ea9759fca007c3`)
- `.ufo/waves/round-17/w1/C3Counter.md` (this report)

No other lane file was written; `corpus/adjacency.tsv`, `scripts/check-adjacency.mjs` and every
byte-frozen surface were read only.
