# ExecNoHarmTip — no-harm matrix at the landed tip, round 30 w2 (milestone noharm)

Seat: `ExecNoHarmTip` (leaf executor). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(read-only). Measured revision `072af95fe2822f0785a6ff88a578e2142dd258e5`; baseline matrix
`061e62024c0523d3c6c7e819506a773ff2cd7d75` from
`.ufo/waves/round-30/w1/ExecNoHarmBaseline/`.

## Verdict — holds; zero green→red harm

I attacked the landed tip by re-running the full wave-1 command set — 47 commands: 17 self-tests,
20 production modes from wave 1's runner, and the 10 supplementary rows that runner's report records
(`matrix-tip.tsv`, one row per command, exit code and tally captured from that command's own
stdout/stderr in `raw/`) — and diffed it against the wave-1 baseline. **No row that was green at
`061e620` is red at `072af95`: `harm-findings.tsv` is header-only, 44/47 rows keep their exit class,
and the only three moves are red→green, exactly the claim targets** (`check-gate-mutants` production
= C1; `check-frontier-admission` production-offline and production-live = C2). Beyond exit codes the
tip also holds at the byte level: 32 of 47 raw outputs are byte-identical after normalising only the
scratch path and the measured revision; 18 of the 20 files wave 1 hashed (19 gate scripts plus the mutant catalogue) are digest-identical
to baseline, and the two scripts that differ (`check-s106-evidence.mjs`, `check-release-pins.mjs`) remove 4 lines and add 139
with **no line of either check implementation changed** — the mutant catalogue is digest-identical,
all 40 mutant ids and `find` strings are unchanged, the 13 mutants killed at baseline are still
killed, and no benign mutant was killed. The five remaining reds (rows 19, 27, 28, 35, 37) are the
same five subjects with the same findings as at baseline. **Severity: none — no harm finding.** Two
annotations that are not harms are recorded in §8.

## 1. Method, environment and the one command correction

```
S=/fast/scratch/hyaku/tabi-r30/ExecNoHarmTip                       # scratch, removed after receipt copy
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                    # exit 0
git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5                       # exit 0
git -C "$S/clone" rev-parse HEAD                                     # 072af95fe2822f0785a6ff88a578e2142dd258e5
git -C "$S/clone" status --porcelain | wc -l                         # 0 (before and after the matrix)
node --version                                                       # v24.21.0
```

Frozen counter identity was verified at the tip before measuring, against
`claims.json.frozenDigests`:

```
sha256sum scripts/check-gate-mutants.mjs scripts/gate-mutants.json scripts/check-frontier-admission.mjs
02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55  scripts/check-gate-mutants.mjs
cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833  scripts/gate-mutants.json
cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca  scripts/check-frontier-admission.mjs
```

All three match the frozen digests. The harness is `run-matrix.sh` in this directory: the same
command set as wave 1's runner (rows 1–38) plus the ten supplementary rows documented in wave 1's
report §3/§3a, with wave 1's `<clone>` placeholder in row 38 materialised as `$S/clone`. Every
command ran with `cwd=$S/clone`, `TMPDIR=$S/tmp`, `TZ=UTC`, `timeout 900`:

```
S="$S" OUT="$OUT" REV=072af95fe2822f0785a6ff88a578e2142dd258e5 bash run-matrix.sh   # exit 0, 47 rows, 126.8 s
python3 summarize.py        # exit 0 — curated tallies from raw/, writes tallies-tip.tsv
BASE=…/w1/ExecNoHarmBaseline/matrix.tsv TIP=$PWD/matrix-tip.tsv OUT=$PWD bash compare.sh   # exit 0
python3 classify-raw.py     # exit 0 — normalised stdout/stderr identity, writes raw-diffs.tsv
python3 generate-diff.py    # exit 0 — writes diff-vs-baseline.md
```

Tally rows are machine-derived: `summarize.py` parses each raw JSON body or picks the named summary
line (`*SELFTEST verdict=`, `ARIA_METADATA (check|witness) verdict=`, `report-contract:`, `ok`
census lines); nothing in `matrix-tip.tsv` is typed from memory. `matrix-tip.tsv` row 1's raw tally
grep matched case lines before curation, which is why the curated file, not the harness's inline
echo, is the artifact diffed.

**Correction during measurement (disclosed for integrity).** My first pass reconstructed row 39 with
the fleet path `node /home/vgpnk/Projects/shokunin/scripts/report-contract.mjs …` and got
`exit 1` (`MODULE_NOT_FOUND`). That file does not exist in the fleet repo
(`ls /home/vgpnk/Projects/shokunin/scripts/` → no `report-contract.mjs`); wave 1's recorded command
is the lane's own script from the clone. Re-running the recorded command:

```
cd "$S/clone" && node scripts/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-29/tabi.md
report-contract: PASS …/round-29/tabi.md — 6/6 sections in order; SHONEN 4/4 boxes     # exit 0
```

and the full matrix was re-run after fixing the row, so the shipped `matrix-tip.tsv`/`raw/` are one
consistent capture. The transient red was my path error, not a lane change. A second mechanical
error (a census raw-file lookup that crashed a diff helper with `FileNotFoundError`) was fixed by
matching wave 1's untagged receipt names; both transcripts are superseded and neither touched the
lane.

## 2. Exit-class diff (the harm test)

`compare.sh` joins the two matrices on `script|mode` (never row number: the baseline row-38 command
carries a placeholder):

| class | rows |
|---|---|
| same exit class | 44 |
| red→green (allowed claim targets) | 3 |
| **green→red (harm)** | **0** |

The three flips, with the target each realises (claims.json C1/C2):

| row | command subject | base | tip |
|---|---|---|---|
| 25 | `check-gate-mutants --repo <clone> --rev 072af95 --work $S/work --json` | exit 1, `fault_survivors=14` | exit 0, `fault_total=27 fault_killed=27 fault_survivors=0 benign_total=13 benign_killed=0 clean=true` |
| 24 | `check-frontier-admission --repo <clone> --rev 072af95 --frontier rate-tos-signal --since 2026-10-26 --json` | exit 1, `population=0 admitted=0` | exit 0, `population=2 admitted=2 failing=0 clean=true` |
| 38 | row 24 **plus `--live`** | exit 1, `live=true clean=false` | exit 0, `live=true population=2 admitted=2 clean=true` |

Reds that persist with the same class and findings (not harm; pre-existing):

| row | subject | tip reading | evidence of sameness |
|---|---|---|---|
| 19 | `check-aria-metadata` check arm | exit 1 `verdict=red findings=18` | raw stdout byte-identical to baseline |
| 20 | `check-aria-metadata --witness` | exit 0 `red→clean accepted=true original_unchanged=true` | raw stdout byte-identical |
| 27 | measurement-binding `--check` round-16 manifest | exit 1 `verdict=failed claims=2 bound=0` | `findings` deep-equal, `vocabulary`/`claims`/`bound` equal; only `at` differs (§8) |
| 28 | measurement-binding `--legacy` round-15 manifest | exit 1 `verdict=failed claims=2 bound=0 findings=5` | raw stdout byte-identical |
| 35 | `check-user-round-contract` | exit 1 `history_rewritten … corpus/lessons/round-18.md` | stdout empty at both revs, stderr byte-identical |
| 37 | `round-evidence-audit --round 29` | exit 1 `classes=6 findings=11 (c2:1 c3:1 c6:9)` | all per-class findings equal; only `lessonSha256` differs (§6) |

## 3. Byte-level identity of the outputs

`raw-diffs.tsv` (produced by `classify-raw.py`) normalises only `/fast/scratch/hyaku/tabi-r30/{ExecNoHarmBaseline,ExecNoHarmTip}`
and the two revision strings, then compares stdout and stderr byte-for-byte: **32 rows identical, 15
differ, 0 unpaired**. The 15 differences are, one by one:

- rows 9 and 11 — the two C1 gate self-tests (claim-sanctioned additions, §5);
- rows 24 and 38 — the C2 flips (entries now list S116/S117 as admitted);
- row 25 — the C1 flip (survivors list now empty, `fault_killed` 27);
- row 26 — registry `rows` 34→36 and `skillBytes` 240946→242355; the two `changed` gate entries are
  `check-release-pins` (SKILL.md rows 1→2) and `check-s106-evidence` (3→4), `gates` still 20, none
  added or removed, `nonconformant=0`;
- row 27 — only `"at"` (§8);
- row 32 — `check-selfassessment` restatements only (§6);
- row 34 — `SOURCES_GATE rows=115 → 118`, `tiers=A:100 → A:103`, `mined 87 → 90`, `findings=0`;
- row 37 — only `lessonSha256` (§6);
- rows 40 and 47 — one extra `W04` duplicate-url warning for the new S118 row; exit 0 both;
- rows 6, 42 and 44 — sandbox fixture commit SHAs inside the self-test JSON/refusal detail; same
  length, same verdict, all cases PASS (non-deterministic fixture hashes, not drift).

Everything else — including every pristine self-test except rows 6, 9 and 11, all freshness
readings (`matched=34 unique=34 lane=31 public=3` at both revs), release pins (`population=23
resolved=23 unresolved=0 holds=16 drifted=7`), s106 production evidence, the bfcache receipt, the
adjacency map and the three wave-embedded C1 measures — is identical.

## 4. What the tip changed, and why it cannot hide a weakened gate

```
awk '!/^#/{print $2"  "$1}' …/w1/ExecNoHarmBaseline/scripts-sha256-baseline.txt | sha256sum -c -
… 18 files OK; scripts/check-release-pins.mjs: FAILED; scripts/check-s106-evidence.mjs: FAILED
# 2 computed checksums did NOT match  (exit 1)
```

So of the whole gate set, only the two claim-C1 gates changed, and `scripts/gate-mutants.json` is
byte-identical. Their diff against baseline:

```
git diff 061e620..072af95 -- scripts/check-s106-evidence.mjs scripts/check-release-pins.mjs | grep -c '^-[^-]'   # 4
git diff 061e620..072af95 -- scripts/check-s106-evidence.mjs scripts/check-release-pins.mjs | grep -c '^+[^+]'   # 139
hunks: @@ const CASES (release-pins), @@ function runSelftest(), @@ function main(), @@ header comment,
       @@ const FIXTURE_BYTES, @@ const CASES (s106)
```

The four removed lines are: the `--selftest (7 isolated cases…)` header comment (rewritten to 10),
the old two-term `ok =` assertion in `runSelftest()` (replaced by the stricter terms-plus-`reasonsOk`
form), and two result-reporting lines. No line of either gate's check logic changed, so no gate can
be green because a check was deleted or loosened. `check-selfassessment` confirms the same from the
other side: `mismatches=0`.

## 5. C1 — the flip is real, and no kill power was lost

`check-gate-mutants --rev 072af95 --json` (row 25, exit 0) reports
`counter_sha256_at_rev = counter_sha256_running = 02945f88…` and `catalogue_sha256 = cd1c27a2…`
(frozen bytes executed), `fault_total=27 fault_killed=27 fault_survivors=0 benign_total=13
benign_killed=0`, both gates `pristine_clean=true` (`check-s106-evidence` 10/10, `check-release-pins`
29/29, exit 0, not timed out).

Per-mutant transitions (`c1-attribution.tsv`, 40 ids): ids and `find` strings identical to baseline;
**no mutant killed at baseline survives at the tip** (0 regressions); the 14 baseline survivors are
all killed. Attribution by reading, not by identity: 13 of the 14 name exactly one failing case, and
each is the dedicated new case —

| mutant | failing case at the tip |
|---|---|
| `s106-sha-drop` | `same-length-tamper-invalid` |
| `s106-anchor-unique-drop`, `s106-anchor-unique-true` | `duplicate-anchor-invalid` |
| `s106-byte-count-drop`, `s106-byte-count-true` | `receipt-byte-count-mismatch-invalid` |
| `pins-f1-old-tag` | `f1-old-tag-not-carried-by-row-unresolved` |
| `pins-f2-path-traversal` | `f2-dotdot-inside-filename-unresolved` |
| `pins-f4-range-bounds` | `f4-range-past-last-old-line-unresolved` |
| `pins-f4-anchor-token` | `f4-anchor-lacks-range-token-unresolved` |
| `pins-notfound-status` | `absence-404-present-with-marker-unresolved` |
| `pins-notfound-body` | `absence-404-body-lacks-marker-unresolved` |
| `pins-s1-supersession-prefix` | `drift-superseder-teaches-without-prefix-unresolved` |
| `pins-s1-supersession-tag` | `drift-superseder-not-at-stable-tag-unresolved` |

`pins-f3-bytes-absent` is the exception: killed at `exit=1` with `cases=null failing_cases=[]` — an
exit-1 run that prints no selftest summary (see §8). Each catalogued `find` string is also still present exactly once: the counter throws a refusal when
`n !== 1` (`scripts/check-gate-mutants.mjs:193`) and that refusal is exit 2, while row 25 exited 0.

## 6. C2 — the flip is real, including the live arm

Offline (row 24) and `--live` (row 38) both exit 0 with `population=2 admitted=2 failing=0
clean=true`; entries `corpus/knowledge/host-published-rate-limit-headers.md` (S117) and
`corpus/knowledge/rate-limit-policy-fields.md` (S116), `admitted=true`, `reasons=[]`. The live arm
calls `fetchLive` only per admitted entry (`scripts/check-frontier-admission.mjs:221`), so at
population 2 it fetched both receipts. Independent confirmation made by this seat (read-only public
GETs, `curl -sS -L`, the same form the gate uses):

| UTC time | URL | HTTP | bytes | sha256 |
|---|---|---|---|---|
| 2026-10-26T07:46:01Z | `https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt` | 200 | 67097 | `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` |
| 2026-10-26T07:46:01Z | `https://docs.discord.com/developers/topics/rate-limits` | 200 | 408912 | `b76e9e451622a7bc37d0d7898dec66e2b942ced69bf4980de2776ffddbc3adb0` |
| shortly after 07:46Z (wrapper did not print a timestamp) | `https://docs.discord.com/developers/topics/rate-limits` | 200 | 408912 | `d37da3f84bb00dfb929e1c8f14c67bb2466e7133e7b62068b5fc179640f7b0cd` |

S116's bytes digest equals the committed receipt and bytes file
(`corpus/evidence/round-30/frontier/bytes/S116.txt`). The Discord page is dynamic at the raw byte
level (four distinct raw digests across the two committed copies and my two fetches, all 408912 bytes), so the counter's `l3-live-bytes`
arm compares **normalised** text; running the frozen counter's own `normalise` (extracted verbatim
from `scripts/check-frontier-admission.mjs:138-150`) on my fresh bytes gives
`normalised fresh==committed: true`, 8728 characters on both sides — the live pass is a real byte
comparison, not a vacuous arm. No credentials, cookies, API calls or session material were used; the
gate's own internal fetches are not logged by the counter, so their evidence is the passing l1/l3
arms plus this independent refetch.

## 7. Data changed outside `scripts/` — preserved, not overwritten

Parsing `corpus/SOURCES.md` at both revisions:

```
baseline rows 115, tip rows 118; added ['S116','S117','S118']; removed []
field changes outside the used-by column: 0
used-by changed rows: 23; rows losing a citation: 0 (only the '—' placeholder replaced)
```

So all 115 baseline rows keep source/kind/tier/scope/anchor/teaches/status/opened/recheck verbatim,
three rows were appended, and the 23 used-by rewrites only add the new knowledge entry. Knowledge
edits are append-only errata: `corpus/knowledge/chromium-156-release-pin-recheck.md` (+33) and
`corpus/knowledge/webmcp-invocation-round-17.md` (+6) both add clearly-labelled round-30 sections
below the existing text; `corpus/lessons/round-29.md` gains 13 lines, which is why row 37's
`lessonSha256` moves while its 11 findings stay identical. Row 32's diff is exactly the sanctioned
restatement: `observed` 7→10 and 20→29 with `superseded=true`, two new counted rows for
`SCORECARD.md:1507-1508`, `superseded` 12→15, `mismatches=0`.

## 8. Annotations (not harms) and risks

1. **`laneTip` resolves lane master, not the measured rev.** Row 27 (`--check` mode has no `--at`)
   computes `atRev = laneTip(repo)` (`scripts/check-measurement-binding.mjs:941`); the clone's
   `refs/heads/master` is `af0664ed039af98a5d8c460cf99c71d726dd41af` ("round-30: wave-1 evidence…"),
   one commit *ahead* of the measured tip (verified: `git merge-base --is-ancestor 072af95 master`
   → exit 0). At baseline the same field resolved `38891ca0`, also not the measured rev. Findings are
   deep-equal, so this is environmental, but any future "measure at rev X" claim using row 27 should
   pin `--at`.
2. **One C1 kill is crash-counted, not case-attributed.** The counter's rule is `killed = !res.clean`
   with a self-test named `crash-counts-as-killed`; `pins-f3-bytes-absent` is killed by an exit-1 run
   with no summary. It satisfies C1's predicate but is not evidence that a case sees the check.
   Reported for the C1 review seats; it changes no exit class here.
3. **Row 39's subject is a fleet file** (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-29/tabi.md`),
   read-only and outside the lane; it printed identical PASS bytes at both ends.
4. **Non-determinism to expect in future diffs:** sandbox fixture commit SHAs (rows 6, 42, 44) and the
   Discord page's script payload (row 38's receipts) change between runs; the gate compares
   normalised text, and `raw-diffs.tsv` shows equal lengths and equal verdicts.
5. No build, lint, formatter or test suite of the lane was run beyond the gates' own modes; nothing
   was installed or upgraded (no `uv`/`npx`/binary install was needed, so no tool version is
   recorded); no pacman transaction was attempted.

## 9. Files written

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w2/ExecNoHarmTip/`:

| file | content |
|---|---|
| `matrix-tip.tsv` | 47 rows at the tip: row, seat, rev, script, mode, exit, curated tally, command |
| `tallies-tip.tsv` | the curated one-line tally per row that `summarize.py` derived from `raw/` |
| `exit-class.tsv`, `harm-findings.tsv`, `red-movements.tsv`, `tally-changes.tsv`, `joined.tsv` | the join against wave-1 `matrix.tsv` (0 harm, 3 flips) |
| `raw-diffs.tsv` | normalised stdout/stderr identity per row (32 identical / 15 differing) |
| `c1-attribution.tsv` | all 40 mutants: baseline outcome, tip outcome, exit, cases, failing cases |
| `diff-vs-baseline.md` | the generated per-row diff document |
| `run-matrix.sh`, `summarize.py`, `compare.sh`, `classify-raw.py`, `generate-diff.py`, `run-log.txt` | harness and derivation, reproducible from `raw/` |
| `raw/` | 94 per-row stdout/stderr receipts |

Scratch (`/fast/scratch/hyaku/tabi-r30/ExecNoHarmTip/`) held the single `--shared` clone (porcelain
empty throughout) and the harness `TMPDIR`; it was removed after the receipts were copied here. No
lane tracked file, lane index, lane jj state, fleet repo, sibling lane or `/home/vgpnk/Projects/shokuknow`
was written; every git call on the lane was read-only and every measured command ran in the clone.
