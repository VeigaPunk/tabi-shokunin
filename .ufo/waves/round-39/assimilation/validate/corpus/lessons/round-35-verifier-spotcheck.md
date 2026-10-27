# Round 35 verifier spot-check

author: hyaku closure (non-author integrator, @m_opus)

Lane round: tabi 35. Before `2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684` → after `1c432f2aaa10d15a7793b967f596871ee5d14280`. Claims were measured at
`8de96c2986979112d4161b1961949db3258c26e8`; the freeze is `a4bfef0f75027c915e715649950b1d46dcb33d83`.
Driver digest (`.ufo/watchdog.log`, copied at closure; lines 1564 and 1583 when read):
`2026-10-26T17:44:02-03:00 launch tabi round=35 pgid=1139653 driver=hyaku-inline attempt=1`;
`2026-10-26T19:07:47-03:00 complete tabi round=35; hyaku-inline attempt=1`.

**Verdict: rejected-honest-stop.** C1 (adjacency) misses its frozen target, newMapped ≥ 2, at 0. C2 (coverage +
capability, sourced) is met. No axis is harmed.

## Conformance

- **Report.** `.ufo/reports/round-35/tabi.md`: `git log --format='%an %H' -- <report>` → `tabi-shokunin 9f2a51f49dabefc209c0fec9c0e9be127a034806`.
  - Committer date 19:07:13-03:00: after the last lane commit (`1c432f2a`, 19:05:13) and before the completion line
    (19:07:47). Author date 19:05:35 (jj change-creation stamp), also after `1c432f2a`. Not filed before its commits.
  - `## SHONEN` heading present, 4 lines for the 4 boxes, all `[~]`.
- **Cited commits.** All 6 resolve and `git -C tabi-shokunin merge-base --is-ancestor <hash> master` exits 0 for each:
  `2d2c8a77`, `a4bfef0f`, `083c5c64`, `8de96c29`, `1c432f2a` (and the report's full hashes). All four round commits
  are authored by `tabi-shokunin <tabi@shokunin.local>`.
- **Lane state.** `scripts/hyaku/jj-lane.sh state` printed
  `branch=master local=1c432f2a… remote=1c432f2a… ahead=0 behind=0 head=detached tracked=0 untracked=0`;
  `git status --porcelain` printed 0 lines; `git ls-remote origin refs/heads/master` → `1c432f2a…`.
- **Prompt.** `.ufo/prompts/tabi-round-35.md` committed as `1a83320f` by `tabi-shokunin` at 17:44:00, before launch
  (17:44:02). Every non-placeholder line of `kimi-shokunin/templates/round-prompt.md` (140 lines) is present verbatim
  in the prompt (scripted line-containment check: 0 missing); `diff` of prompt lines 1–140 against the template shows
  22 changed lines, all placeholder substitutions; no `{{…}}` placeholder remains. §1–§5 with the five child-lane
  items, the §6 hyaku addendum and §7 scratch discipline are present. No L2 route map quoted
  (`grep -ciE 'route map|bucket'` → 0).
- **Waves.** `w1-results.json`: 51 seats, 51 non-empty outputs; `w2-results.json`: 34 seats, 34 non-empty outputs
  (jq over `.results[].output`). Total 85, dead 0. No `"model"` key in either file. Matches the report.
- **Freeze.** Frozen bytes identical at freeze and HEAD, each equal to `claims.json` `frozenDigests` (sha256 prefix):
  `c1-adjacency-sweep-v3.mjs` 5707a937…, `c2-firefox-bidi.mjs` 7cc7f17f…, `baseline/controls.mjs` 32c0f6bc…,
  `measure.sh` 1fdbe8c4…. `scripts/check-adjacency.mjs` and `scripts/check-bidi-runtime.mjs` unchanged
  `2d2c8a77..1c432f2a` (`git diff --quiet` exit 0). Controls (`baseline/controls-summary.json`): C1 J1–J7 exit 1,
  C1 J8 exit 0 (the disclosed lexical-forgery residual), C2 J1–J5 exit 1 — matches the report.
- **Step-1 defects.** None bear on status. Routed defect 1 below (an evidence pointer to a 0-byte file left standing in
  the entry) is a conformance defect under §Evidence standard.

## Claim re-checks

No lane gate or counter was executed (Gate standard, Closure consequence). C1 and C2 were both **re-measured** from
committed bytes with plain `git show` / `cut` / `sort` / `comm` / `jq` / `sha256sum`; the no-harm readings were
**evidence-verified** from committed `measure/` files.

### C1 adjacency — not met (re-measured)

| Check | Command (lane repo, rev `1c432f2a`) | Observed | Reported |
|---|---|---|---|
| candidates | `git show $R:.ufo/waves/round-35/baseline/c1-candidates.tsv \| cut -f1 \| sort -u \| wc -l` | 383 | 383 |
| screened | `git show $R:corpus/adjacency-screen-browser.tsv \| tail -n +2 \| cut -f1 \| sort -u \| wc -l` | 383 | 383 |
| unaccounted | `comm -23 <candidates> <screened> \| wc -l`; reverse `comm -13` | 0; 0 | 0 |
| new map rows | `git diff --quiet 2d2c8a77 1c432f2a -- corpus/adjacency.tsv` | exit 0 (unchanged, 17 lines both) → newMapped 0 | 0 |
| screen reasons | `cut -f2 \| sort \| uniq -c` | same-surface 226, not-browser-sense 119, third-lane-report 30, no-claim-declared 8 | same-surface 226 (README w2 correction) |
| per lane | `cut -d@ -f1 \| sort \| uniq -c` | kaidoku 137, kumitate 66, kagi 56, kake 51, kotoba/mado/tsukuroi 20, kama 9, mori 2, chousa 1, tameshi 1 | equals `claims.json` C1 surface |
| committed reading | `jq` over `measure/c1-at-8de96c2.json` | mapped 0, screened 383, unaccounted 0, newMapped 0, adjacency clean 16/16, predicate false | same |

The kagi row (`cdp-bridge-vault-dom-refusal`) was appended in `083c5c64` (`git diff --stat 2d2c8a77 083c5c6 --
corpus/adjacency.tsv` → 1 insertion) and removed at `8de96c29`; it now sits in the ledger as
`same-surface secrets-vault-ops`. Target newMapped ≥ 2 missed → honest stop. Axis adjacency 8 → 8.

### C2 coverage + capability, sourced — met (re-measured)

| Check | Command | Observed | Reported |
|---|---|---|---|
| row verdicts | `jq -r '.rows[]\|[.id,.admitted]'` over `measure/c2-at-8de96c2.json` | R1–R15, R17 `true` (16); R16 `false` | admitted 16, unmeasured 1 (R16) |
| R16 has no BiDi command | entry table row R16 (entry line ~123) | "none — the draft's `browsingContext` command list has no navigation stop" | same |
| transcript binding | `sha256sum` of `run1.jsonl` / `run2.jsonl` vs `receipt.json .runs[].transcriptSha256` | 0ef2e7e5… / 6754ec2d…, both equal | — |
| first screenshot | base64-decode first `recv` `.frame.result.data` in each run, `sha256sum` | run1 and run2 both `7a3ae6a9b0d6…cfd02` = receipt `firstScreenshotSha256` = counter live `firstShotSha256` | `7a3ae6a9…` |
| engine | `jq` receipt / `measure` `.live` | firefox 158.0.1, geckodriver 0.37.1, live 28 commands / 20 events | same |
| command coverage | distinct `send` methods per run | 15 in each run, 0 error frames | — |
| sourced | entry `source:` line; `grep -cE '^\| *S[0-9]{3,} *\|' corpus/SOURCES.md` at `2d2c8a77` / `1c432f2a` | cites S134–S141; rows 133 → 141 | 133 → 141 |
| committed reading | `measure/c2-at-8de96c2.json` | population 17, admitted 16, failing 0, binding null, sourceWitness S134 → `corpus/lessons/round-35.md:15`, predicate true | same |
| M1 red state | `measure/c2-M1-boundary-15.json`; counter `:77` | admitted 15, predicate true; `const TARGET = 14;` | M1 disclosed |

The claim's declared sentence (`admitted >= 16`, failing 0, binding null) holds on my re-measurement; the counter's
threshold-14 defect (M1) does not change this reading. Capability row `webdriver-bidi-runtime-firefox` enters with a
running demonstration (the measured live session plus two committed runs). Axis coverage: improved (score held at 9).

### No-harm (evidence-verified)

- `git diff 2d2c8a77 1c432f2a -- SCORECARD.md`: append-only (79 insertions, 0 deletions); no axis score lowered.
- `git diff --numstat 2d2c8a77 1c432f2a | awk '$2>0'`: prints nothing — 0 deleted lines in the whole round diff.
- `measure/noharm-at-8de96c2.txt`: 28 lines, every one `exit=0` (gates in production mode + self-tests).
- `measure/freshness-worktree-at-8de96c2.txt`: `FRESHNESS_GATE verdict=clean … matched=34 unique=34`.
- `measure/provenance-8de96c2.txt`: porcelain 0, counter digests equal frozenDigests, gate pins equal, `firefox-bin`
  sha256 `46e2c204…`, geckodriver `f831b7e6…`; r33/r34 C1 and r34 C2 legs as reported; `selfassessment exit=0`.
- `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` (run at closure): `tabi ok`, exit 0,
  20 W04 — all on S058–S123, none on S134–S141 (pre-existing).

### Per-axis verdicts

| Axis | Verdict | Basis |
|---|---|---|
| adjacency | unchanged | C1 re-measured: newMapped 0, target ≥ 2 missed; adjacency gate clean 16/16 (no harm) |
| coverage | improved | C2 re-measured: admitted 16 / failing 0 / binding null on a second engine |
| depth | unchanged | no claim; no-harm 28/28 |
| operability | unchanged | no claim; no-harm 28/28 |
| freshness | unchanged | no claim; `check-freshness --worktree` clean 34/34 at `8de96c2` |
| calibration | unchanged | no claim; `check-selfassessment` mismatches 0 |

## Discernment spot-check (LEARNING.md)

Sources re-opened at closure (2026-10-26, `curl -sSL`):

| Item | Decision | Re-opened source | Agree / disagree | Reason |
|---|---|---|---|---|
| S134 geckodriver Flags.html | admit (A, mined) | https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html — 200, 41404 B, sha256 `2b023afe…` (= lesson §Gate) | agree | `grep -n 'Defaults to 9222'` → `496:<p>Port to use to connect to WebDriver BiDi. Defaults to 9222.</p>`: quote and line match; vendor docs are tier A for geckodriver flags |
| S137 geckodriver v0.37.1 marionette.rs | admit (A, mined) | raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/marionette.rs — 200, 66012 B, sha256 `757e3955…` (= lesson) | agree | line 767 is `capabilities.insert("moz:geckodriverVersion".into(), build::build_info().into());` verbatim; source at the tag is primary |
| S140 Firefox 158.0.1 release dir | admit (A, mined) | https://ftp.mozilla.org/pub/firefox/releases/158.0.1/SHA256SUMS — 200, 551210 B | agree | line 235 is `dce45470…eb41a  linux-x86_64/en-US/firefox-158.0.1.tar.xz`, the quoted digest and line |
| Firefox 158.0.1 release notes | reject (not registered) | https://www.mozilla.org/en-US/firefox/158.0.1/releasenotes/ — 200, 104555 B, sha256 `6a6b86ea…` (= lesson) | agree | the page lists a OneCRL update and UI/crash fixes; `grep -ciE 'webdriver\|bidi\|geckodriver\|marionette\|remote agent'` finds none, so it teaches nothing the entry relies on beyond S140's pinned digest; the flip condition is sound |
| C1 kagi `SKILL.md:40` map row | reject (withdrawn at w2) | `git -C kagi-shokunin show 69b61db4:SKILL.md` line 40 | agree | the line is kagi's own runbook row for its `cdp-bridge` CLI (`open-popup` hard refusal; "scraping vault DOM" as an anti-pattern); it names no lane and asserts no side of a tabi boundary, and the map already carries kagi `secrets-vault-ops` (row 9) — screening it as same-surface is right |

SOURCES row re-open: **S138** (Firefox Remote Prefs.html), written this round. Re-fetched 200, 31971 B, sha256
`72cd6162…` (= row and lesson). Quote "With the end of the CDP support, WebDriver BiDi is the only available protocol,
and the preference was removed in Firefox 141." is 22 words (≤ 25) and found at body lines 296–298 (`grep -n 'only
available protocol'` → 297). Agree.

Result: agrees with the gate on 4 admits and 2 rejects; no disagreement to learn from.

## Trend verdicts

- **expansion: improved.** One admitted knowledge entry on ground the coverage map did not hold (BiDi runtime on a
  second engine; README round-35 row), `source:` citing mined rows S134–S141 (8 new rows, re-opened sample above);
  capability row `webdriver-bidi-runtime-firefox` with a demonstration I re-measured.
- **quality: improved.** QUALITY 98–101 each name a lesson mistake and a committed red state (98's red state
  re-checked: `c2-M1-boundary-15.json` admitted 15 predicate true, counter `TARGET = 14`); round-34 errata landed
  append-only (README `:794`/`:799`, lesson-34 corrections); the census-append no-harm regression was withdrawn before
  measurement (freshness 34/34). No admitted entry found false and left unmarked; defect 1 below is a weak pointer whose
  measurement exists elsewhere in committed evidence.
- **discernment: improved.** The outside spot-check agrees on admits and rejects; the lane overturned its own
  integrator-admitted row on the sibling's bytes and recorded the reversal.

## Routed defects (lane fixes next round)

1. **Entry D11 cites a 0-byte evidence file.** `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md:279` (D11)
   and `corpus/lessons/round-35.md:76` cite `.ufo/waves/round-35/measure/driver-egress-sample.txt` for "0 non-loopback
   sockets"; `git cat-file -s 1c432f2a:<path>` → 0. The lesson note at `:130` re-points the claim to w2
   SentinelDriverEgress (`w2/SentinelDriverEgress/evidence/sockets-summary.txt`, 27 samples) but the entry sentence was
   not corrected (§Evidence standard, "Corrections sweep every mention"; the lane's own QUALITY 100 requires the entry to
   cite the sample). Fix: an appended correction in the entry/README pointing at the committed sample.
2. **C2 counter threshold 14 vs declared 16** (M1), **caller-named binaries** (M4), **non-loopback live leg** (M3),
   **byte-cloned run2 passes** (w2 MutDriverReceipt): carried as the planned operability amendment; stays routed.
3. **S125 cadence `on-release`** (round-34 routed defect 5): second carry; land the cell with its four companion files
   in one commit.
4. **C1 meter.** A fixed newMapped quota on a closed, fully screened pool cannot be met honestly; the planned split
   (completeness vs delta discovery) is the lane's own next step.

## Note for the operator

SHONEN box 2 (end-to-end domain task) looks checkable by a non-author: this closure re-derived the two committed
Firefox runs, the receipt binding and the live-session digest without lane context, and LOG carries "Round 35
disposition". Promotion is operator-owned; no `[x]` written.
