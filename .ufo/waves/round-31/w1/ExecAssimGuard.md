# ExecAssimGuard — round 31 / w1 — §10 assimilation checks (adoption: none)

**Verdict.** Every §10 assimilation check re-derives exactly in scratch and matches the committed round-31 artifacts byte for byte: `reg-ids` 118 (S001–S118, contiguous, 0 duplicates), `staged-ids` 148 (S102–S249, contiguous), `collisions` 17 (S102–S118), `quarantine-slice` 38 data rows, with the ABSENT register's sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833` — the `5afe1810…d833` the claims require, and identical to round-30's recorded digest, so the register is unchanged. All four committed files compare `IDENTICAL` under `cmp`, and my derived files carry the same sha256s. The guard is proven able to fail: a scratch registry row written as `  | S102 |` produces a nonempty collisions file (`S102`) under the 0–3-space pattern and an **empty** one under a column-zero-only pattern on the same bytes; a column-zero control row produces a collision under the narrow pattern too, so the empty result is a blind spot, not a dead extractor, and a four-space row stays ignored (bounded, not merely wider). Neither real input currently carries an indented row (0 in the lane registry, 0 in the staged append), so the false green is latent, not active. Access was read-only: only `grep`/`sed`/`awk`/`comm`/`sha256sum` reads of the shokuknow package and register, no campaign tool run, no write into shokuknow, and nothing under scripts/ or the lane index touched. For the round's new ids: S119–S122 are absent from the lane registry at the freeze tree (118 rows, max S118; still absent in the live tree at 2026-10-26T08:40:17Z), while the staged package *does* hold rows at S119–S122 — Chromium 146/147/148/149 `runtime_enabled_features.json5`, kind `code`, tier `A`, used by the staged `webmcp-version-floor-source-resolution.md`. Those four staged rows are entirely different documents from the lane's new rows at the same ids (RFC 9309, RFC 6585, two GitHub REST pages), so **a by-id join would confuse all four** — identity has to stay by document. Recorded for the L1, not repaired: three of the lane's four new documents already exist in the staged package under *other* ids (RFC 9309 = staged S106, RFC 6585 = staged S110, GitHub rate-limits = staged S126), and the GitHub best-practices document has no staged counterpart; the lane registry itself holds none of the four under any id.

## Evidence (commands, exit codes)

Scratch clone (lane tree), freeze commit, clean:
```
git clone --shared …/tabi-shokunin "$S/clone"                   # exit 0
git -C "$S/clone" checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d   # exit 0
git -C "$S/clone" rev-parse HEAD -> 9505a10eb80b2a0b273ebaba3f7f872ad302192d
git -C "$S/clone" status --porcelain | wc -l -> 0
```

Re-derivation, exactly the 0–3-space pattern from round-27's README (`^ {0,3}\|[[:space:]]*S[0-9]{3,}`):
```
OUT=<own output dir> sh derive.sh                                # exit 0
  reg-ids 118 / staged-ids 148 / collisions 17 / quarantine-slice 38
cmp <derived>/reg-ids           .ufo/waves/round-31/assimilation/reg-ids            # exit 0, IDENTICAL
cmp <derived>/staged-ids        .ufo/waves/round-31/assimilation/staged-ids         # exit 0, IDENTICAL
cmp <derived>/collisions        .ufo/waves/round-31/assimilation/collisions         # exit 0, IDENTICAL
cmp <derived>/quarantine-slice  .ufo/waves/round-31/assimilation/quarantine-slice   # exit 0, IDENTICAL
sha256sum  (derived == committed)
  reg-ids          0b6a17f52f241e9957f5e4fe78ae9a5cf17104e4a6b59074d1576ee04afa7446
  staged-ids       82d68117e103d92e93c30a303c2347bd31da7b181085a2663d376b461f2d858e
  collisions       d9a19be0309c2890e2b8d7b67a75100ecd8a5e73c7e2ab1dfc334f19eb7626d9
  quarantine-slice 79ea7557572ff6ff81c9c70fc582ae39ce35d35f437e44ec5d901b98d9fd3772
```

Independent cross-checks (not the same reader):
```
awk row count, lane registry      -> 118     # exit 0; 0 rows with 1–3 leading spaces (grep -c -> 0, exit 1)
awk row count, staged append      -> 148     # exit 0; 0 rows with 1–3 or 4+ leading spaces
gap sweep reg  (seq 1..118)       -> 0 missing;  staged (seq 102..249) -> 0 missing;  duplicate ids -> 0
sha256sum register -> 5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833
sha256sum staged   -> 7f646b3b787350d96125faed95f8d6d49daca529b7df4098196954823a86cab6
```
The slice's 38 rows reconcile with the register's own `## By lane` figure: 37 `tabi` rows in `## Rows` (`| \`tabi\` | 37 |`) plus the one `tabi` row in `## Rows whose quotes were NEVER CHECKED` (S171). The derivation reproduces a register shape quirk verbatim rather than repairing it: register line 362 has a stray backtick in the id cell (`S171\``) and an unquoted class cell, so the slice line reads ` S171\`   the cited source could not be fetched, so no quote was checked `. Observed, not fixed.

Guard proof (`FX=… sh guard.sh`, exit 0; transcript in `guard-proof.txt`, fixtures retained):
```
F1  2-space row "  | S102 |"   0–3-space: reg=[S102] collisions=[S102] lines=1
F1  same bytes                 col-0-only: reg=[]     collisions=[]     lines=0   # false green
F2  column-zero "| S102 |"     col-0-only: reg=[S102] collisions=[S102] lines=1   # extractor alive
F3  4-space row "    | S103 |" 0–3-space: reg=[]      lines=0                     # bounded
F4  "| S001 |" + "  | S102 |"  0–3-space: reg=[S001 S102] collisions=[S102]
F4  same bytes                 col-0-only: reg=[S001]     collisions=[]            # S102 missed
F5  real lane registry rows with 1–3 leading spaces: 0; staged append: 0
```
Static note (read, not run): `scripts/check-sources.mjs:25` still uses the column-zero-only form `const rowPattern = /^\|[ \t\v\f\r]*S[0-9]{3,}[ \t\v\f\r]*\|/;`, so that lane gate would not see an indented duplicate. The assimilation derivation is independent of it because it uses the 0–3-space form.

New ids S119–S122 (details in `new-ids.txt`):
```
grep -nE '\| *S11[9]|\| *S12[0-2]' corpus/SOURCES.md            # no match, exit 1 (freeze tree)
live tree 2026-10-26T08:40:17Z: registry 118 rows, no S119–S122 row; git status only untracked .ufo/waves/round-31/*
staged SOURCES.append.md:24-27  -> S119..S122 = Chromium 146/147/148/149 runtime_enabled_features.json5, code/A,
                                   used-by corpus/knowledge/webmcp-version-floor-source-resolution.md (staged entry only)
grep lane registry for the four new documents -> 0 rows (rfc9309, rfc6585, rate-limits-for-the-rest-api,
                                   best-practices-for-using-the-rest-api, robots.txt)
staged counterparts BY DOCUMENT -> S106 (RFC 9309), S110 (RFC 6585), S126 (GitHub rate limits), none for best-practices
```
So: by id, staged S119–S122 collide with the lane's new S119–S122 and mean different documents (id collisions would grow 17 → 21 after the rows land); by document, the lane's new rows mirror staged S106/S110/S126 under new ids. Neither fact changes this round's adopt-nothing decision; both need document-level identity at any future adoption.

Read-only attestation: the register and staged package were only read; re-hashing them at the end of the seat returns the same two sha256 values; neither file's mtime changed (register 2026-10-24T08:37:00Z, staged 2026-10-24T23:33:20Z). No campaign tool, no `api.github.com`, no network fetch, no lane gate, no formatter/linter/build, and no git write outside the scratch clone (the only git operations were its `clone`/`checkout` and read-only `rev-parse`/`status`). Scratch under `$HYAKU_SCRATCH/tabi-r31/ExecAssimGuard` removed after receipts were copied out. No tool install or upgrade was needed or performed.

## Files (all relative to the lane root)
- `.ufo/waves/round-31/w1/ExecAssimGuard.md` — this report.
- `.ufo/waves/round-31/w1/ExecAssimGuard/` — `guard-proof.txt`, `new-ids.txt`, `derive.sh`, `guard.sh`,
  re-derived `reg-ids`, `staged-ids`, `collisions`, `quarantine-slice`, `input-sha256.txt`,
  `derived-sha256.txt`, `register-sha256.txt`, and `guard-fixtures/` (four fixtures + the wide/narrow
  collision files: `S102\n` = 5 bytes vs 0 bytes).

## Risks / blockers
- None blocking. Two shape findings for the curators, not repaired here: (1) the ABSENT register's S171 row is malformed (stray backtick in the id cell, unquoted class cell), so any future parser that expects the register's stated format will mis-key that row; (2) three of the round's four new documents duplicate staged sources under other ids (S106/S110/S126), so an id-keyed adoption later would create a second id for one source.
- The committed round-31 `assimilation/` directory carries no `guard-proof.txt` or `register-sha256.txt` (round 30 had both); this seat's output supplies them, and the L1 chooses whether to commit them alongside the four id files.
- I did not run any lane gate; the no-harm checks and both claim counters remain the parent's post-integration gate work.
