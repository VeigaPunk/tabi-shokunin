VERDICT: ISSUES

Lane tip `refs/heads/master` = `2bff864fdfee684ddbcd066cc8e735adaba2735c` (`git symbolic-ref -q --no-recurse HEAD` exit 1, detached). `corpus/QUALITY.md` ends at criterion 32. No tool installed. The wrapper self-test and `check-freshness.mjs` were not executed.

Axes: calibration (a criterion cites a real miss and a red case a counter can show), operability (the red case is an exit, a command output, or a missing blob), freshness (F6 refuses `HEAD` without editing the frozen checker). Coverage and adjacency scalars are untouched.

Move: land 33–37 below for routed defects 4, 1, 2, 5, 3. Put open item F6 in 38. Leave the C1 recheck shape (`quote` + excerpt sha256 + producer sha256) in `.ufo/waves/round-18/PLAN.md:67-77`, where `measure-c1.mjs` already fails a receipt. `.ufo/waves/round-18/drafts/quality-append.md` 34–37 are the same rules; its 33 sweeps “every row,” which would rewrite S053/S057, and its 38 cites `round-17-verifier-spotcheck.md:157-165` for a recheck rule that block does not state.

## Ledger

| Item | Where it is | Nearest criterion | Why that wording stays green | Draft |
|---|---|---|---|---|
| 1 sibling count | `corpus/lessons/round-17.md:116`; fleet report `af41737b8faafab6d392c898dacc88f3be0ebcd1:.ufo/reports/round-17/tabi.md:35`; spot-check `:159` | 22 | 22 binds a manifest count through `scripts/check-measurement-binding.mjs`. The integer 7 is lesson and report prose. | 34 |
| 2 harm revision | `.ufo/waves/round-17/w2/HarmAfter.md:3,20`; spot-check `:160` | 26 | 26 requires a receipt of the revision that was run. HarmAfter records `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` and 20/20 equal exits. The round’s measured revision is `93bfead1f5f25f584353df3152a60209bbd89a2e`. | 35 |
| 3 self-test receipt | `.ufo/waves/round-17/w1/C3Checker.md:103`; `SKILL.md:1940`; spot-check `:161` | 26 (30 once a receipt exists) | The 57-case line sits in the only committed document, with a full producer sha256 at `:101`. 26 does not require a separate `corpus/evidence/` object carrying argv, exit, revision, and stdout. | 37 |
| 4 falsified premise | `corpus/SOURCES.md:71` anchor; spot-check `:162` | 31, with 4 | 4 is met by appending S057. 31 names a sha-pinned note line in `corpus/README.md`. S057 is a SOURCES row, and its anchor is a copy of S053’s. | 33 |
| 5 abbreviated digests | `.ufo/waves/round-17/w2/ReRunHarness.md:31-33,117-118`; spot-check `:163` | 28 | The “7 reruns passed” claim has a committed report as its root. 28 allows a `/tmp` path as labelled history beside that report. The receipt sha256s in the report are 8 hex digits plus an ellipsis. | 36 |
| F6 freshness `HEAD` | spot-check `:165`; `SKILL.md:1920-1922`; `scripts/check-freshness.mjs:49,63-65`; fleet `JjAuditTabi.md:61-62,184-188` | 29 | 29’s carve-out keeps the frozen parser and tells callers to pass `"$(git rev-parse --verify refs/heads/master)"`. `SKILL.md:1922` says that invocation rule is not enforced by code. | 38 |

`round-17.md` is absent at `93bfead` (`git cat-file -e` fails; the file exists on disk). The “7” was written after the measured map.

## Evidence

Sibling count at `93bfead1f5f25f584353df3152a60209bbd89a2e:corpus/adjacency.tsv`:

```
$ git show 93bfead1f5f25f584353df3152a60209bbd89a2e:corpus/adjacency.tsv | cut -f2 | tail -n +2 | sort | uniq -c
      2 kagi
      2 kaidoku
      2 kake
      1 kama
      1 kumitate
      2 revenger
$ git show 93bfead1f5f25f584353df3152a60209bbd89a2e:corpus/adjacency.tsv | cut -f2 | tail -n +2 | sort -u | wc -l
6
$ git show 93bfead1f5f25f584353df3152a60209bbd89a2e:corpus/adjacency.tsv | tail -n +2 | wc -l
10
```

`corpus/lessons/round-17.md:116` says “Map: 10 rows, 7 siblings.” The row count matches. The sibling count does not. Fleet `.ufo/reports/round-17/tabi.md:35` (commit `af41737b8faafab6d392c898dacc88f3be0ebcd1`, author `tabi-shokunin`) says `corpus/adjacency.tsv` (10 rows, 7 siblings). That path is absent from lane `refs/heads/master`.

Harm set. `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` is an ancestor of `93bfead1f5f25f584353df3152a60209bbd89a2e` (`merge-base --is-ancestor`, exit 0). `.ufo/waves/round-17/harm-baseline.json` has 20 `gates[]` entries (`jq '.gates | length'` → 20) over six scripts. `git diff --exit-code 6c97851 93bfead --` those six scripts exits 0. The same span changes `scripts/check-adjacency.mjs` by 117 insertions and 36 deletions. HarmAfter.md:3 calls `6c97851` “M” and `:20` records 20/20 exits equal. HarmAfter.md:61 records `ADJACENCY_SELFTEST … cases=51`. C3Checker.md:103 records `cases=57`. Byte-identity of the twenty-gate scripts is why criterion 26 stays green; it is also why a later harm verdict still needs a receipt at `93bfead`.

Self-test. `git cat-file -e refs/heads/master:corpus/evidence/round-17/routed/adjacency-selftest.json` fails (path absent). C3Checker.md:101 sha256 `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` equals `git show 93bfead1f5f25f584353df3152a60209bbd89a2e:scripts/check-adjacency.mjs | sha256sum`. The producer digest is full. The missing object is the receipt.

Premise. `corpus/SOURCES.md:71` (S057) anchor cell contains `Offered by François Beaufort (individual publisher)`. The teaches cell begins `supersedes S053 —` and names `developer Google Ireland, Ltd.` S053’s anchor (`:67`) keeps the same span; its teaches cell says `individual-publisher` (hyphen). `scripts/check-sources.mjs:296-297` allows a repeated URL when teaches matches `^supersedes S[0-9]{3,}`. Self-test case `supersedes-correction` (`:53`, fixture `:424`) exits 0 when the new row changes teaches and copies the anchor.

Digests. ReRunHarness.md:31-33 records receipt sha256s as `0cfaeb7e…`, `302cf584…`, `15dbb149…`, `1722b7dd…`, `f788cc21…`, `aef61aa4…`, `2bc456c6…`, `a2f8462f…`. Committed receipt bytes at `93bfead:corpus/evidence/round-17/webmcp-invoke/receipt.json` sha256 to `0cfaeb7ed1b81ba797d81c23de41a4b9a24ad46b17c412f445278c26d17ce346` (worktree file clean). The `0cfaeb7e…` prefix matches; the seven rerun prefixes have no committed bytes. ReRunHarness.md:117-118 removes sandbox `/tmp/tabi-r17w2-ReRunHarness-3092` and writes no rerun receipt. The producer sha256 on `:14-15` is already the full `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`.

F6. `scripts/check-freshness.mjs:49` stores `--witness` as the next argv token. `:63-65` passes that token to `git show` with no 40-hex test. Fleet `JjAuditTabi.md:61-62` records `node scripts/check-freshness.mjs --witness HEAD` printing `FRESHNESS_GATE verdict=clean … revision=HEAD`. `:184-188` is finding F6. `SKILL.md:1920-1922` tells callers to pass the master 40-hex and says the rule is not enforced by code. `git cat-file -e refs/heads/master:scripts/freshness-witness.mjs` fails. A worktree file of that name is untracked (`git status --porcelain` → `??`); it is not a root for this criterion.

## Draft append (after `corpus/QUALITY.md` criterion 32)

33. A row whose teaches cell begins `supersedes <id> —` carries none of the falsified span in any cell (`premise_survives`). The superseded row keeps its bytes. A later row that repeats the span as a current locator is the same finding. Refines 4 and 31. (lesson: corpus/lessons/round-18.md#mistakes; corpus/lessons/round-17-verifier-spotcheck.md:162 — S057 anchor still contains `individual publisher`; `scripts/check-sources.mjs` case `supersedes-correction` exits 0 on a copied anchor)

34. A prose count in a lesson, registry row, or report is the output of a command fenced beside it and re-run at the cited revision. An integer carried forward with no fence is a finding, including when a later re-run happens to match. A byte-frozen sentence is corrected by a later fence. Refines 22. (lesson: corpus/lessons/round-18.md#mistakes; corpus/lessons/round-17-verifier-spotcheck.md:159 — `round-17.md:116` says 7 siblings; `cut -f2 | sort -u | wc -l` on `93bfead:corpus/adjacency.tsv` prints 6)

35. A harm verdict at a measured revision cites a committed receipt whose `revision` is that full 40-hex, naming every baseline gate, each with exit and stdout and stderr sha256. A run at an ancestor stays history, including when the gate scripts are byte-identical across the span. Refines 26. (lesson: corpus/lessons/round-18.md#mistakes; corpus/lessons/round-17-verifier-spotcheck.md:160 — HarmAfter.md:3 records `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`; measured revision `93bfead1f5f25f584353df3152a60209bbd89a2e`)

36. A sha256 that is the root of a claim is the full 64-hex of a committed path or blob (`digest_abbreviated`, `digest_uncommitted`). A git object name of 7–40 hex is not a sha256. A removed sandbox is not the bytes. Abbreviated history may stay when the full hex or the committed path is the root. Refines 28. (lesson: corpus/lessons/round-18.md#mistakes; corpus/lessons/round-17-verifier-spotcheck.md:163 — ReRunHarness.md:31-33; committed receipt `0cfaeb7ed1b81ba797d81c23de41a4b9a24ad46b17c412f445278c26d17ce346`)

37. A self-test pass claim cites a committed receipt under `corpus/evidence/` recording argv, exit, stdout, the revision, and the producer sha256 of the gate blob. A wave-report line is not that receipt. Refines 26 and 30. (lesson: corpus/lessons/round-18.md#mistakes; corpus/lessons/round-17-verifier-spotcheck.md:161 — `cases=57` only at C3Checker.md:103; no `corpus/evidence/round-17/` adjacency self-test receipt)

38. A caller of byte-frozen `scripts/check-freshness.mjs` is a committed wrapper. It resolves the lane tip by the rule in 29 and refuses `HEAD`, a symbolic ref, and any revision that is not 40 hex, exiting 2 with `witness_revision_refused` before the frozen script is spawned. A missing wrapper, or a wrapper that forwards `HEAD`, is the finding. The frozen script stays unedited. Refines 29. (lesson: corpus/lessons/round-18.md#mistakes; corpus/lessons/round-17-verifier-spotcheck.md:165 — SKILL.md:1920-1922; JjAuditTabi.md F6)

Red cases a counter can show:

- 33: S058 (or a fixture row `supersedes S057 —`) with `individual publisher` in any cell → `premise_survives`. S053 and S057 stay byte-stable.
- 34: re-run the fenced `sort -u | wc -l`; printed `6` against prose `7` → `sibling_count_mismatch`. The fenced row count `10` matches and stays green.
- 35: harm receipt `revision` ≠ `93bfead1f5f25f584353df3152a60209bbd89a2e`, or a gate name missing from the 20 in `harm-baseline.json` → `harm_revision_mismatch`. `git diff --exit-code` 0 on the six scripts does not satisfy it.
- 36: a cited sha256 matching `^[0-9a-f]{8}…$` with no committed blob, or a 64-hex that is not the sha256 of the named bytes. `6c97851` as a commit name stays legal.
- 37: `SKILL.md:1940` “self-test 57 cases” while `git cat-file -e <rev>:corpus/evidence/round-18/routed/adjacency-selftest.json` fails, or the receipt stdout lacks `cases=57`, or producer sha256 ≠ `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac`.
- 38: wrapper absent at the admitted revision, or `--rev HEAD` exits other than 2, or stderr lacks `finding=witness_revision_refused`, or the child argv reaches `scripts/check-freshness.mjs`. At this tip the wrapper path is absent.

## Risks

`corpus/lessons/round-18.md` is not at this tip, so the `#mistakes` anchors resolve when that lesson is integrated. Criterion 10 already requires the lesson file.

Landing draft 33 as written (“every row carrying that premise”) contradicts PLAN’s append-only SOURCES rule (`PLAN.md:57-58`): S053 and S057 would have to change. The superseded row keeps the span; the superseding row must not.

Landing draft 38 as written adds a QUALITY sentence whose cited block is the five routed defects plus F6, L0 lines, and the freshness hazard. The recheck binding remains the C1 counter contract. A receipt that counts a quote the excerpt does not contain is already outside `PLAN.md:71-74` (`quoteFound`, `excerptSha256`, `producerSha256`).

Criterion 36 applied to every historical git abbreviation would fail frozen reports. It applies to sha256 roots of claims admitted from this round on.

The twenty harm-gate scripts do not change between `6c97851` and `93bfead`. Criterion 35 still demands a receipt at the measured revision, because that byte-identity is the argument that left the spot-check defect open. Adjacency, run in the same HarmAfter report, does change (`cases=51` to `cases=57`).

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/ConnQuality.md
