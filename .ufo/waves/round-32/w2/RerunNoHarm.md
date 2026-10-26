# RerunNoHarm — round 32 / w2 (falsify) — no-harm matrix, freeze → wave-1 build

## Verdict

**One real harm, and it is new at the integrated revision: `check-release-pins` goes green → red.**
At the freeze `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`, every network-free production
invocation listed in the matrices below and every one of the 20 self-tests is green, except the inherited
`history_rewritten` red of `check-user-round-contract` (identical text at both revisions); at the wave-1 build
`b234a58920134424e0d104f137311ff54a16d26b` everything reproduces **except** `check-release-pins.mjs`,
which exits 0 with `population=23 resolved=23 unresolved=0` at the freeze and exits 1 with
`population=24 resolved=23 unresolved=1` / `UNRESOLVED id=S125 reasons=r1-entry missing or no files`
at `b234a58`; the new row `corpus/SOURCES.md:139` (S125, `recheck=on-release`, source pinned to
`refs/tags/154.0.8037.97`) therefore enters the gate's population without the receipt entry the gate
requires (`corpus/evidence/round-29/release-pins/receipt.json` still holds exactly the 23 pre-round rows,
none `S12x`). Severity **high**: a frozen lane gate is red at the revision every round-32 item attacks,
and the wave-1 integration did not re-run it (w1 `ExecNoHarmBase` measured it only at the freeze, and
`SCORECARD.md:1481` still claims "population 23, unresolved 23 → 0"). No self-test tally moved at any
point (all 20 identical, the only byte differences being the synthetic fixture commit hashes that
`check-gate-mutants` and `check-s106-evidence` print). The intended turns are real and hold: C1
`BIDI_RUNTIME` 1 → 0 (`population=16 admitted=16 failing=0`, target ≥ 14), C2 `SELFASSESSMENT` 1 → 0
(`mismatches=18` → `mismatches=0`) with the four C2 docs still append-only (`--numstat` 0 deletions), the
decision-table counter clean offline **and** `--live` at `b234a58` (`population=13 admitted=13 failing=0`),
and every other gate verdict identical or better.

## Provenance

- Two live clones, seat-scoped, one per revision (scratch since deleted):
  `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/{freeze,tip}` then
  `git -C … checkout -q --detach <rev>`; `rev-parse HEAD` = the revision each is named for;
  `git status --porcelain | wc -l` = `0` **before and after** every run (so no gate wrote into a tree).
- `TMPDIR=/fast/scratch/hyaku/tabi-r32/RerunNoHarm/tmp` on every command; both the passphrase-free
  suites and `check-gate-mutants` made their fixture trees there and removed them.
- Lane checkout untouched: `git -C …/tabi-shokunin status --porcelain` shows only sibling/orchestrator
  untracked wave machinery (`.ufo/waves/round-32/w1/MutC2*`, `w2-*.json`, `w2.ready*`, `w2/`) — no tracked
  file modified, no lane byte, index or jj state written by this seat.
- Driver bytes unchanged between the two revisions: `git diff --name-only 4181fffb… b234a58… -- scripts/`
  = `scripts/bidi-loopback-round32.mjs` only (added); the three claim counters
  (`check-bidi-runtime.mjs`, `check-selfassessment.mjs`, `check-decision-table.mjs`) are untouched.
- No tool installed or updated. No chromium/chromedriver started by this seat;
  `pgrep -fa 'chromedriver|chromium'` at the end lists only `1371 /usr/bin/earlyoom …` (unrelated, not mine).
- Receipts: `RerunNoHarm/receipts/` (`verdicts.tsv`, `rc-{freeze,tip}.tsv`, `selftests.tsv`,
  `p3-release-pins-*.out`, `p8-sources-census-*.out`, `a4-user-round-contract-*.err`,
  `r01-round-evidence-*.err`, `m01-gate-mutants-*.out`, `live-fetches.tsv`, `extra-commands.txt`,
  `live-netns-control.out`, `probe-decision-live.log`).

## Matrix — production gates (cwd = clone, no network unless marked)

| Gate (command) | freeze rc / verdict | tip rc / verdict | change |
|---|---|---|---|
| `check-gate-registry.mjs --rev HEAD` | 0 `clean rows=40 gates=22 nonconformant=0` | 0 `clean rows=40 gates=22 nonconformant=0` | none |
| `check-sources.mjs` | 0 `clean rows=122 tiers=A:107,B:6,C:9 … findings=0` | 0 `clean rows=126 tiers=A:111,B:6,C:9 … findings=0` | counts move with the 4 appended rows, verdict clean |
| **`check-release-pins.mjs --rev HEAD --stable 156.0.8078.47`** | **0** `clean population=23 resolved=23 unresolved=0 holds=16 drifted=7` | **1** `failed population=24 resolved=23 unresolved=1 holds=16 drifted=7` + `UNRESOLVED id=S125 reasons=r1-entry missing or no files` | **green → red (defect 1)** |
| `check-s106-evidence.mjs --rev HEAD` | 0 `valid … sha_match=true anchor_located=true` | 0 idem | none |
| `check-bfcache-receipt.mjs --rev HEAD` | 0 `valid:true restores:1 clean:true` | 0 idem | none |
| `check-frontier-admission.mjs --rev HEAD --frontier rate-tos-signal --since 2026-10-26` | 0 `clean live=false population=2 admitted=2 failing=0` | 0 idem | none |
| `check-decision-table.mjs … --entry corpus/knowledge/rate-signal-decision-table.md` (offline) | 0 `clean live=false population=13 admitted=13 failing=0` | 0 idem | none |
| `check-decision-table.mjs … --live` (4 receipt URLs, `curl -q -sS --proto =https`) | 0 `clean live=true population=13 admitted=13 failing=0` | 0 idem | none |
| `sources-census.sh validate --file <clone>/corpus/SOURCES.md` | 0, 19 × `W04 duplicate url …` + `file ok` | 0, 20 × `W04` + `file ok` | one new advisory (see obs. 2) |
| `check-source-reopen-receipt.mjs --rev HEAD` | 0 `reopened 6 resolved 6 unresolved 0` | 0 idem | none |
| `check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` | 0 `ok:true reason=clean` | 0 idem | none |
| `check-round-contract.mjs` | 0 `clean rounds=10 consequential=0` | 0 idem | none |
| `check-user-round-contract.mjs` | **1** `failed finding=history_rewritten detail=Pstack bytes changed: A corpus/lessons/round-18.md` (stderr) | **1** same line, byte-identical | inherited, unchanged |
| `check-adjacency.mjs --at 4181fffb… --fleet …` | 0 `clean rows=10 verified=10` | 0 idem | none |
| `check-measurement-binding.mjs --check .ufo/waves/round-21/measurement-binding.json --at 2d5eaaa…` | 0 `clean claims=1 bound=1` | 0 idem | none |
| `check-freshness.mjs --worktree` | 0 `clean matched=34 unique=34 lane=31 public=3` | 0 idem | none |
| `check-freshness.mjs --witness HEAD` | 0 `clean … revision=HEAD` | 0 idem | none |
| `freshness-witness.mjs --rev <rev>` (wrapper) | 0 `FRESHNESS_GATE clean … revision=4181fffb…` | 0 `… revision=b234a58…` | none |
| `check-gate-mutants.mjs --rev <rev>` (production, committed blobs) | 0 `clean fault_total=27 fault_killed=27 fault_survivors=0 benign_total=13 benign_killed=0 catalogue_sha256=cd1c27a2…` | 0 identical numbers, same catalogue sha | none |
| **C1 before/after** `check-bidi-runtime.mjs --rev HEAD --baseline d805d1d6… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md` | **1** `failed population=0 admitted=0 failing=0 entry=e1-entry-absent` | **0** `clean population=16 admitted=16 failing=0` | intended turn, holds (≥ 14) |
| **C2 before/after** `check-selfassessment.mjs --rev HEAD` | **1** `failed mismatches=18 could_not_evaluate=104 superseded=21` | **0** `clean mismatches=0 could_not_evaluate=106 superseded=39` | intended turn, holds |

`git diff --numstat 4181fffb… b234a58… -- SKILL.md corpus/README.md SCORECARD.md LOG.md` (plus QUALITY,
the two knowledge entries, lesson, SOURCES) prints **0 in the deletion column on every file**
(106/0, 62/0, 135/0, 37/0, 41/0, 6/0, 20/0, 192/0, 136/0) — corrections are appended, so the C2
"0 deletions" leg holds.

## Matrix — every self-test at `b234a58` (all 20 exit 0; all identical at the freeze)

`ADJACENCY cases=57`, `ARIA_METADATA ok:true`, `BFCACHE cases=17 passed=17`,
`BIDI_RUNTIME cases=27 passed=27`, `DECISION_TABLE cases=34 passed=34`, `FRESHNESS cases=12`,
`FRONTIER_ADMISSION cases=24 passed=24`, `GATE_MUTANTS cases=12 passed=12`,
`GATE_REGISTRY cases=22 passed=22`, `MEASUREMENT_BINDING cases=76 reasons=13`,
`RELEASE_PINS cases=29 passed=29`, `ROUND_CONTRACT cases=38 alias_checks=1`,
`S106 cases=10 passed=10`, `SELFASSESSMENT cases=41 passed=41`,
`SOURCE_REOPEN cases=18 passed=18`, `SOURCES cases=26`,
`USER_ROUND_CONTRACT cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1`,
`FRESHNESS_WITNESS cases=8 failed=0`, `round-evidence-audit 13/13`,
`selftest-measurement-binding cases=76 reasons=13`. A byte-level diff of the two revisions' self-test
stdout is empty for 18 of 20; `s08-gate-mutants` and `s13-s106` differ only in the *synthetic fixture*
commit ids each run creates in its own temp repo, with `PASS` on both sides — **no tally change anywhere**.

## Decision-table counter at `b234a58` (round-32 errata live in that entry)

```
$ node scripts/check-decision-table.mjs --rev HEAD --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc \
    --entry corpus/knowledge/rate-signal-decision-table.md            # rc=0
DECISION_TABLE verdict=clean rev=b234a589… baseline=96a2d1a3… entry=corpus/knowledge/rate-signal-decision-table.md live=false population=13 admitted=13 failing=0
$ … --live                                                            # rc=0, rows D1..D13 all ADMITTED
DECISION_TABLE verdict=clean … live=true population=13 admitted=13 failing=0
```

The `--live` leg is genuinely network-bound, not a rubber stamp: under `unshare -rn` the same command
returns `verdict=failed … live=true population=13 admitted=0 failing=13` with 13 × `l1-live`
(`receipts/live-netns-control.out`), and a scratch copy that logs inside `curlFetch` shows 13 real
`curl` calls, one per row (`receipts/probe-decision-live.log`). The 4 distinct receipt URLs fetched,
recorded directly (`receipts/live-fetches.tsv`, UTC):

| URL | status | bytes | sha256 |
|---|---|---|---|
| `https://www.rfc-editor.org/rfc/rfc9309.txt` | 200 | 25,265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` |
| `https://www.rfc-editor.org/rfc/rfc6585.txt` | 200 | 17,164 | `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58` |
| `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` | 200 | 337,116 | `552faa2dd98967237a56fcc7d80d254ffbcf85a9707ca018af75c653aa04c422` |
| `https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api` | 200 | 328,088 | `94c112d444dd717809509ae4f12dff89b0724ce0ea8bb4735b5cacdbf3521daa` |

(Honesty note: my first attempt probed `…/best-practices-for-the-rest-api` — *not* the URL the receipt
carries — and saw 404; re-reading the receipt programmatically corrected the path, and the table above is
the receipt's own URLs. The round-32 errata section itself is 20 appended lines, 0 deletions, and admits
no new table row: population stays 13.)

## Defect 1 — `check-release-pins` green at the freeze, red at `b234a58` (severity: high)

Attack: the wave-1 integration's *registry growth* against the frozen freshness gate.

Evidence:

- `corpus/SOURCES.md:139` — `| S125 | ChromeDriver 154's BiDi enabling path — session_commands.cc —
  https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc
  | code | A | … | mined | 2026-10-26 | on-release | corpus/knowledge/webdriver-bidi-runtime-round-32.md |`
  (`recheck=[ on-release ]`, tag `154.0.8037.97`).
- `scripts/check-release-pins.mjs:178` — the population is every row with `recheck === "on-release"` and
  a tag `cmpVersion(tag, stable) < 0`; `154.0.8037.97 < 156.0.8078.47`, so S125 joins it: 23 → 24.
- `scripts/check-release-pins.mjs:182-197` — the row resolves only through
  `corpus/evidence/round-29/release-pins/receipt.json`, and that file at `b234a58` holds
  `rows=23 S033,…,S106` — **no `S12x` row** — so S125 hits `r1-entry missing or no files` and the gate
  prints `verdict=failed … unresolved=1` and exits 1.
- Reproduced twice at `b234a58` (plain and `--json`: `clean false population 24 unresolved 1`), and the
  other 23 rows are byte-identically resolved (`holds=16 drifted=7` at both revisions), so the red is
  exactly the new row, not drift in old ones.
- Why nobody saw it: w1 `ExecNoHarmBase.md:47` measured release-pins **at the freeze only**; no w1 seat
  re-ran it after integration (`grep` over `.ufo/waves/round-32/w1/*.md` shows no post-integration
  reading), and `SCORECARD.md:1481` still carries `population 23, unresolved 23 → 0`.

Smallest append-only fix (a re-pin seat, not a counter patch — the counter is frozen and correct):

1. Append **one** row to `corpus/evidence/round-29/release-pins/receipt.json` `rows[]` for `S125`
   (keep the existing 23), `fetched_by` a seat other than the refetch witness, with
   `files[0] = { path: "chrome/test/chromedriver/session_commands.cc", old_tag: "154.0.8037.97",
   new_tag/status: 200 at stable 156.0.8078.47, old_bytes/new_bytes:
   corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/chrome/test/chromedriver/session_commands.cc,
   sha256 pair, ranges: [[287,289],[332,338],[378,378],[407,410],[429,464],[510,510]] }` — those tokens all
   occur in the S125 anchor cell, as `f4-ranges` (`:221-241`) demands.
2. Commit both byte copies under that `bytes/` root (the gate recomputes sha256 from the blobs).
3. Commit `corpus/evidence/round-29/release-pins/refetch/S125.json` written by a **second** seat with
   `tag = 156.0.8078.47` and the new sha, because `f6-refetch` (`:217-220`) refuses a self-confirmed
   re-pin.

A one-cell alternative — changing S125's `recheck` away from `on-release` — would drop the row out of the
population and turn the gate green, but it downgrades a real freshness obligation on a tag-pinned code
row to dodge the gate. **Reported as a non-fix.**

## Other observations (no verdict change; for the L1's ledger)

1. **Source-gate counts move as designed.** `SOURCES_GATE` goes `rows=122 tiers=A:107 … mined:98` →
   `rows=126 tiers=A:111 … mined:102`, `findings=0` both sides; the four appended rows (S123–S126) are
   the whole delta and the census accepts the file.
2. **One new census advisory:** `file W04 S123 duplicate url www.rfc-editor.org/rfc/rfc9309.txt across
   scopes` (19 → 20 W04 lines, exit 0). It is the documented `supersedes S119` reuse of the same URL
   (`corpus/knowledge/rate-signal-decision-table.md` errata), an advisory class the census reports as
   `ok`; no `E`-class finding at either revision.
3. **C2 counters moved in the healthy direction but not monotonically:** `could_not_evaluate` 104 → 106
   and `superseded` 21 → 39 alongside `mismatches` 18 → 0. Expected from appending corrections
   (later claim rows become superseded), but any doc that quotes "104" or "21" as current is now stale.
4. **`SCORECARD.md:1481` is falsified by the integration itself** ("population 23, unresolved 23 → 0"):
   measured at `b234a58` the population is 24 with 1 unresolved. Same root cause as defect 1; fixing
   defect 1 makes the sentence true again, so no separate correction is needed — but it is the clearest
   witness that the wave did not re-measure.
5. **S125's id had earlier, different meanings in `LOG.md`** (`LOG.md:1878` "S125 pre-noted refuse as S102
   duplicate", `LOG.md:1986` "S125 was freshly reopened and remains rejected"). `corpus/lessons/round-32.md:26-30`
   records that the intended Chrome-docs candidate does not exist and S125 now cites the driver source
   instead, so the reuse is explained in the lesson but the LOG narrative still reads as two different
   S125s. Low severity (prose consistency), not a gate input.
6. **`check-user-round-contract.mjs` stays red, unchanged**: `history_rewritten … corpus/lessons/round-18.md`,
   byte-identical to the freeze, i.e. the inherited round-20..31 red this wave neither fixed nor grew.

## Not run, with reason

- `round-evidence-audit.mjs --rev <40> --round 32 --round-cap 12` — production **refuses at both
  revisions** with `cannot read the round report at /home/vgpnk/Projects/shokunin/.ufo/reports/round-32/tabi.md;
  c4/c6 cannot be decided without it and a clean verdict would be a false green` (exit 2). It reads fleet
  state outside the lane, and the round is still in flight, so it cannot yield a freeze→tip comparison.
  (Its `--selftest` is 13/13.)
- Browser legs (`bidi-loopback-round32.mjs`, `aria-loopback-round13.mjs`, webmcp drivers) — not gates, need
  chromium/chromedriver, and are owned by the C1 seats; no browser was started here.
- Nothing was skipped for being slow or awkward; the only deliberately omitted scripts are the
  non-gate one-off `.ufo/waves/round-1x/…` instruments the registry lists as historical gates.

## Files written

- `tabi-shokunin/.ufo/waves/round-32/w2/RerunNoHarm.md` (this report)
- `tabi-shokunin/.ufo/waves/round-32/w2/RerunNoHarm/receipts/*` (evidence listed above)
- Scratch `/fast/scratch/hyaku/tabi-r32/RerunNoHarm` (two clones, tmp, probe copy, fetched bytes) is
  deleted after the receipts were copied; no lane tracked file, index, jj state, fleet repo or sibling
  lane was written, and no counter was patched.
