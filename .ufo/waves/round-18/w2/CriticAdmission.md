VERDICT: PASS

# CriticAdmission — attack on declared C1/C2/C3 at measured REV and w1 critic conditions

Scope: admission-level falsification of the three claims at REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` against baseline
`2bff864fdfee684ddbcd066cc8e735adaba2735c`, plus the four target conditions:
scalars stay same; C1 is receipt-volume not depth/overdue work; C2 preserves
original scenarios; C3 reruns are new, not recovered history. All probes were run
by me this session; no claim rests on another seat's assertion.

## Axes under attack

C1 → freshness (8, lowest tie); C2 → operability (8, lowest tie); C3 →
calibration (9). Three claims, three distinct axes — satisfied.

## Executed probes (exact argv / exit)

All commands run in LANE `/home/vgpnk/Projects/shokunin/tabi-shokunin`; the only
writes the counters perform are their own mkdtemp sandboxes (`git clone
--no-hardlinks` to `/tmp/tabi-r18-mc2-*`, removed on exit).

| Probe | Exit | Result |
|---|---|---|
| `node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` | 0 | `c1_rows_rechecked=51`, `held=50`, `drift_superseded=0`, `own_work=1`, `rejected=[]`, counterSha256 `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` |
| `node .ufo/waves/round-18/measure-c2.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` | 0 (33.58 s) | `c2_hazards_closed=6`; artifact `scripts/webmcp-invoke-round18.mjs` sha `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155` |
| `node .ufo/waves/round-18/measure-c2.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c` | 0 (33.28 s) | `c2_hazards_closed=0`; artifact `scripts/webmcp-invoke-round17.mjs` sha `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` |
| `node .ufo/waves/round-18/measure-c3.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` | 0 | `c3_routed_closed=5`; d1–d5 all `pass:true` (`correction_line_verified`, `20_historical_gates_verified`, `adjacency_selftest_verified`, `S058_supersession_verified`, `7_reruns_verified`), counterSha256 `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a` |
| `git diff --name-only B..REV` | 0 | 221 paths; no `SCORECARD.md`, no `SKILL.md`, no `scripts/check-*.mjs`, no non-round-18 lessons/knowledge/evidence |
| `git status --porcelain` | 0 | only `?? .ufo/waves/round-18/w2/` (in-flight wave-2 reports, untracked) |

Full counter JSON at `/tmp/tabi-r18-mc2-rev.json`, `/tmp/tabi-r18-mc2-b.json`
(session-private; key fields quoted below).

## Per-claim findings

### C1 — freshness, source-recheck receipts 0 → 51 — verified, honest volume

- Counter independently counts **51** receipts at REV; the diff shows exactly
  the 51 expected `S###.json + S###.excerpt.txt` pairs (no S004/S039/S047/
  S049/S050/S053 receipts — the at-B superseded set is correctly excluded).
- Spot-checked receipts S001/S028/S057/S029/S036: schema
  `tabi-source-recheck-v1`, `fetchedAt` all 2026-10-20, `quoteFound=true`,
  `teachesVerdict=held`, `httpStatus=200` for HTTP rows (S029 own-work has
  `httpStatus=null`, per the repo-path special case). `recheck-fetch.mjs` blob
  at REV sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`.
- w1 CriticClaims accept-if (a) *scalar 8→8*: met — `SCORECARD.md` is
  byte-identical to B (absent from the 221-path diff) and the LOG.md round-18
  entry states "No scalar move or exploratory claim".
- accept-if (b) *count broken down by row class*: met — counter output carries
  `row_classes` histograms (`url: 17 immutable_pinned / 46 living_live /
  1 own_work`; `status: 48 mined / 8 queued / 8 rejected` over the 64-row
  universe). The ~18 low-information receipts (pinned/own-work/queued/rejected)
  are disclosed, not hidden.
- accept-if (c) *drift produces superseding rows*: vacuous — `held=50` +
  own-work 1, `drift_superseded=0`; no drift to record.
- "receipt-volume not depth or overdue work": met — LOG entry "no row
  date-due", README row "not overdue repair or new product support", lesson
  :12-14 "not overdue rows or current product support".
- Cosmetic observation (non-blocking): counter prints `eligible_rows:58` —
  the universe of non-superseded rows at REV (64 minus 6); the seven rows
  opened this round (S058–S064) are eligible-but-not-rechecked, so the
  headline is "51 of 58". Correctly labeled, contract-legal (the claim targets
  current-at-B rows only); a hasty reader could misread it as 7 missing.

### C2 — operability, hazards 0 → 6 — verified red-at-B / green-at-REV, scenarios preserved

- At REV all six probes green with substantive facts: h1 exit=2 + no pass/fail
  receipt + 0 surviving processes; h2 TMPDIR empty after SIGTERM, SIGINT,
  normal and watchdog runs; h3 zero `--remote-debugging-port`, zero
  `DevToolsActivePort`, 0 browser-owned listeners across 79 `ss` scans; h4
  download-refused case passed with marker-sha + refusal event + clean
  pre/post-close scans; s1 3 observed browser argv with 0 feature-union
  violations; f6 `--rev HEAD` refused exit=2 while `refs/heads/master` resolves
  under a detached poison HEAD.
- At B all six red with the original defect facts recorded: h1 exit=1 and a
  `verdict=fail` receipt on external SIGTERM; h2 `tmpEmpty=false` on
  SIGINT/watchdog; h3 `--remote-debugging-port seen=true`,
  `DevToolsActivePort seen=true`, 3 browser-owned listeners; h4 download case
  absent; s1 `feature-union violations=2`; f6 wrapper absent.
- "C2 must preserve original scenarios": met two ways — (i) committed receipt
  `corpus/evidence/round-18/webmcp-invoke/receipt.json` at REV: verdict pass,
  all 11 round-17 case ids + `invoke-download-refused` pass (12/12), all 4
  controls pass; (ii) the counter's own live normal run at REV:
  `originalCasesPassed=11/11`, `originalControlsPassed=4/4`, `downloadCasePass`,
  zero duplicates. The w1 critic's proposed coverage-floor assertion is
  implemented inside the counter (`coverage` block, gate on every hazard).
- Byte-frozen: `scripts/webmcp-invoke-round17.mjs`, `webmcp-loopback-round16.mjs`,
  `check-freshness.mjs`, `check-*.mjs`, `SHONEN.md`, `PROVINCE.md`,
  `corpus/adjacency.tsv` all byte-identical at REV (diff-verified).
- F6 honest scope: counter records "frozen scripts/check-freshness.mjs
  --witness HEAD remains directly callable" — the wrapper is a guarded caller,
  not global enforcement; README says the same. No overreach claim.
- Cosmetic observation (non-blocking): at B each hazard's `why` leads with
  "retained-coverage precondition failed (invoke-download-refused is missing…)"
  before the hazard's own red facts. The red facts are still recorded verbatim,
  so red-at-B is demonstrated substantively; the ordering just makes the B
  output read oddly.

### C3 — calibration, routed defects 0 → 5 — verified, new reruns

- Counter: d1–d5 all pass at REV; absent at B → 0 (all five paths new).
- d2 `harm-at-93bfead.json`: `revision` = full 40-hex `93bfead…`, 20 gate
  entries, names matching `harm-baseline.json` set; producer digest bound to
  REV per plan.
- d5 "new reruns not recovered historical evidence": met explicitly —
  `index.json` note "These are new reruns performed on 2026-10-20 … they are
  not the same runs"; README "seven **new** fully retained round-18 reruns;
  the lost original bytes were not recovered"; lesson :73-74 "they do not
  reconstruct lost /tmp bytes". Each run receipt carries full 64-hex sha256
  and producer sha `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`
  (the round-17 harness blob — consistent with its byte-frozen status).
- The seven reruns' receipts legitimately record the old artifact's hazardous
  argv (`--remote-debugging-port=0` in `launchedArgs`) — evidence of the old
  hazard, not a new one; consistent with the w1 critic's d5 note.

## Cross-claim / admission conditions

- **Scalars stay same**: `SCORECARD.md` and `SKILL.md` have zero diff
  B..REV. LOG round-18 entry declares "No scalar move". Met.
- **Byte-frozen registry**: no modifications to any frozen path; SOURCES.md
  diff is 9 pure additions (rows S058–S064 + 2 changelog lines) — append-only
  rule honored.
- **Separability**: C1 wrote only `source-recheck/**`; C2 only the two new
  scripts + note + new source rows; C3 only `routed/**`, S058, lesson
  `## Corrections`. Disjoint as planned.
- **CriticLowestAxis deferral correction applied**: LOG entry records
  "Depth8 deliberately deferred: next viable move is substrate re-verification
  of the r3/r8/r9 evidence ladder" — the w1 smallest-safe-correction #1 landed.
- **w1 conformance defect disclosed, not concealed**: lesson :104-109 and LOG
  record that wave-1 writers used disjoint files but no separate worktrees.

## Unmet acceptance criteria

None blocking. Residual honest observations a judge may weigh:

1. `eligible_rows:58` vs `c1_rows_rechecked:51` headline — seven round-18
   rows carry no recheck receipt (contract-legal; cosmetic confusion only).
2. C1's 51 includes ~18 structurally-guaranteed or hygiene receipts
   (17 pinned + own-work S029 + queued/rejected living rows). Disclosed by
   the counter's own histogram; scalar correctly stays 8. A judge weighting
   receipt *information content* rather than count may discount ~35% of the
   sweep — the count itself is honest.
3. B-side hazard `why` strings prepend the coverage-precondition failure
   ahead of each hazard's genuine red facts (cosmetic ordering, not logic).
4. Depth remains unclaimed (7th consecutive round) — now a *recorded*
   deferral with a named next move, which is what the w1 critic required;
   it remains a frontier observation, not an admission defect.

## Conformance statement

No installs/updates performed (none needed; pacman paused). No lane writes
outside this report. No `jj`/git writes in LANE — the only git writes were the
counter's own `/tmp` sandbox clones, auto-removed. No browser use by me (the
measure-c2 probes drive fixture-owned loopback Chromium inside private /tmp
profiles per their own contract). Reads: `git show/diff/log/status` only.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/CriticAdmission.md
