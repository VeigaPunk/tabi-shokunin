# CritNoHarm — round 25 w1: byte inventory, append-only integrity, S106 duplicate scan, held-note consistency

Seat `L1Tabi25.CritNoHarm` (critic, leaf). Writes: this file, plus throwaway fixtures and one checker
under `.ufo/waves/round-25/scratch/CritNoHarm/` (git-ignored by `.gitignore:5`). No tracked file was edited.
No git or jj write was made. No process was started. No tool was installed or upgraded.
Lane HEAD at read time was `c8ef3084c6363f265b9d23285296ab3547654f57`. It is baseline `9e13666` plus the
round-25 freeze commit, and that commit touches only `.ufo/waves/round-25/**`
(`git diff --stat 9e13666 HEAD` → 7 files, all under `.ufo/waves/round-25/`).

## Verdict

**No planned byte has to rewrite prior evidence. The plan is not safe as drafted, though.** Six
items would land a rewrite, a trade or a false statement unless the L1 applies the corrections in §3.
They are listed here by severity:

1. **The SCORECARD/LOG draft names a CDP method that does not exist.** It says the history step was an
   executed `Page.goBack`. The pinned PDL has no `goBack` command. The harness recorded
   `-32601 'Page.goBack' wasn't found` and stepped back with `Page.navigateToHistoryEntry`.
2. **The bfcache entry draft is stale.** It is written on the "U1-open, no restore" branch, but the
   positive harness run now reports `restores=1`.
3. **The C2 counter is about to be changed after the data came in.** ExecFreshnessReceipt recommends
   dropping the legacy-digest equality check because it "blocks the target". The as-specified
   prototype scored `resolved=1 unresolved=5`.
4. **Up to eight in-place `used-by` edits have no log.** Rows S104, S105, S013, S015, S016, S020, S023
   and S024 would need them. CORPUS.md rule 2 requires each change to be logged old→new in the round
   lesson, and the lesson draft has no such section.
5. **Ids collide with the staged package.** The lane's new S106 collides with staged S106 (RFC 9309).
   An optional S107 drafted to re-anchor S020 would collide with staged S107.
6. **The assimilation candidate's only cited row is malformed.** Staged S242 has 14 fields instead of
   13. Adopting it verbatim fails the census with E01 and E11.

The S106 duplicate scan is clean. The census over the proposed row exits 0, its findings are identical
to baseline, and there is no fleet-wide or staged hit for the URL. The observed runtime agrees with every
claim in the held bfcache note except one capture requirement: the run took no DOM snapshots (see §4).

## Axes (godspeed)

- **A1 append-only integrity.** Every baseline byte of every tracked file survives. The only in-place
  changes are the cells CORPUS.md rule 2 allows (`status`, `recheck`, `used-by`), and each is logged.
- **A2 identity.** Ids, filenames and claim predicates keep their meaning. Nothing is renumbered or
  renamed silently.
- **A3 provenance.** Every landed statement matches what was actually run or fetched.
- **A4 held-note consistency.** The new entry does not contradict `navigation-history-bfcache-evidence.md`
  or the S104/S105 wording.

## 1. Byte inventory (what the round would change)

These are the planned targets, read from the w1 spec (`w1-spec.json` items) and the landed drafts in
`w1/*.md`. For each target the table gives the planned change, whether it is in place or an append,
whether prior bytes stay intact, and how a closure could misread it.

| Target | Planned bytes | In-place? | Prior bytes intact? | How a closure could read it |
|---|---|---|---|---|
| `corpus/SOURCES.md` Registry | +1 row S106. C2 adds 0 rows: all six quotes hold (`w1/ExecFreshnessReceipt.md:54`, `w1/ScribeSOURCESRows.md:82`). ScribeSOURCESRows also drafted an optional S107 that re-anchors S020 (`w1/ScribeSOURCESRows.md:92`) | No. Inserted mid-file at line 120, before `## Paths` | Yes, if inserted inside the table. An end-of-file append would be census E12 (`sources-census.sh` prints E12 for a row outside the Registry) | A byte-prefix check fails by design. The right check is "no baseline row lost or changed in an immutable cell" (§5) |
| `corpus/SOURCES.md` `used-by` cells | S104, S105 gain the bfcache entry. S013, S015, S016, S020, S023, S024 gain the source-recheck note. No draft plans these edits | **Yes** (allowed cell) | Yes, if the old value stays a prefix | **A rewrite, if unlogged.** CORPUS.md:116-118 requires an old→new log, and `w1/ScribeLesson25.md` has none (`grep -ciE 'mutable\|used-by'` → 0) |
| `corpus/SOURCES.md` S104 anchor | ScribeLesson25 records the fresh S104 digest `46dac3cd…` in the lesson Gate (`w1/ScribeLesson25.md:31`) | Must stay **No** | Yes, if the digest goes in the lesson only | **A rewrite, if the anchor cell is "refreshed".** The round-24 precedent did exactly this: `2f35bd4` rewrote S105's anchor in place |
| `corpus/SOURCES.md` Search log | +1 line, round-25 reopening (`w1/ScribeSOURCESRows.md:103`) | No. Inserted before `## Leads` | Yes | — |
| `corpus/knowledge/bfcache-runtime-observed-round-25.md` | New file (`ls corpus/knowledge \| grep -ci bfcache-runtime` → 0, so no collision) | No | Yes | **False provenance if the U1-open draft lands.** The receipt shows `restores=1` (§4) |
| `corpus/knowledge/source-recheck-round-25.md` | New file (0 collisions, same grep) | No | Yes | — |
| `corpus/knowledge/navigation-history-bfcache-evidence.md` | No change planned | Must stay **No** | Yes | **A rewrite, if U1 (:79-80) is "closed" in place.** The new entry supersedes it by pointer |
| `scripts/check-bfcache-receipt.mjs`, `scripts/check-source-reopen-receipt.mjs` | New files | No | Yes | **A trade,** if the C2 counter drops the equality check silently (§3 H3) |
| `SKILL.md` registry | New block `## Round 25 — gate registry additions` appended after :2479 (`w1/ScribeScorecardLog.md:139-144`) | No. End-of-file block | Yes. `check-gate-registry.mjs` reads every table in document order and the latest row wins (`scripts/check-gate-registry.mjs:32-38`), so nothing has to go into the round-24 table | False provenance only if rows are appended inside the round-24 table, which claims "nonconformant=0 at the round-24 tip" |
| `SCORECARD.md` | Three blocks appended after :1270 (`w1/ScribeScorecardLog.md:55-118`) | No | Yes | **False text.** The draft's lines 76, 93 and 158 say `Page.goBack` was executed (§3 H1). The axis rows at :95-100 and :146-151 must stay untouched, since nothing is promoted |
| `LOG.md` | Entry appended after :1790 | No | Yes | Same `Page.goBack` wording risk (`w1/ScribeScorecardLog.md:155-177`) |
| `corpus/README.md` | New `## Frontier — round 25` block appended (`w1/ScribeScorecardLog.md:193-196`). The draft says "after :585", but the file has 584 lines (`wc -l`) | No | Yes. The round-24 row at :582 ("docs-held, runtime open") stays historical | **A rewrite, if :582 is edited.** README:173 sets the lane's "stays unedited" convention |
| `corpus/QUALITY.md` | Criterion 66 appended after 65, which ends at :353 = end of file (`wc -l` → 353) | No | Yes | — |
| `corpus/lessons/round-25.md` | New file | No | Yes | Must carry the mutable-cells log (H4) |
| `corpus/evidence/round-25/bfcache/receipt.json` and raw events | New. `git ls-tree -r --name-only HEAD -- corpus/evidence/round-25 \| wc -l` → 0 | No | Yes | — |
| `corpus/evidence/round-25/freshness/reopened.json` and raw bodies | New (same sweep → 0) | No | Yes | — |
| `corpus/evidence/round-24/*` | M1 is about round-24 receipt pinning. ExecLessonEvidence corrected its premise (`w1/ExecLessonEvidence.md:16`) | Must stay **No** | Yes, if untouched | **A rewrite, if "fixed".** `8bc1d32` already re-pinned c1-tip/c2-tip in place: `git show --stat 8bc1d32` → 1051 insertions, 1051 deletions |
| `corpus/adjacency.tsv` (11 lines) | Only if ConnSiblings proposes a row | No | Yes | — |
| `.ufo/waves/round-25/claims.json` | `revisions: []` | Must stay unrevised for the predicate | — | **A trade,** if "Page.goBack" or the C2 resolve rule is edited after data |
| Assimilation: entry `webmcp-devtools-agent-surface-r25.md` and its cited row | New entry plus one row, conditional | No | Yes | **An identity change.** S242 must be renumbered and the malformed row repaired (H5) |

## 2. S106 duplicate scan (as requested)

**Proposed row:** the content_features.cc URL at tag 154.0.8037.97, kind `code`, tier A, decoded lines
186-187, sha256 `9b93fe64…`, `used-by` the bfcache entry. The fixture is in `scratch/CritNoHarm/prop/`.
The row is inserted at line 120, inside the Registry.

| Fixture | Command | Exit | Non-W04 findings | W04 count |
|---|---|---|---|---|
| base (copy of HEAD SOURCES) | `scripts/sources-census.sh validate --today 2026-10-25 <fixture>/tabi-shokunin` | 0 | `ok` | 16 |
| prop (+S106) | same | 0 | `ok` | 16 |
| mut (+S106 reusing S105's Page.pdl URL and scope, no `supersedes`) | same | **1** | `E04 S106 duplicate url …Page.pdl?format=TEXT within scope …` | 16 |

- `diff base.validate.out prop.validate.out` differs only in the fixture path on the `ok` line. **No new
  finding.** The W04 count of 16 matches the 16 W04 lines in `census-before.txt`.
- The mutant shows the scan can fail, so the clean result means something.
- **Fleet and staged sweep:** `cat /home/vgpnk/Projects/shokuknow/merge/*/SOURCES.append.md
  /home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md | grep -c content_features` → **0**, over 21
  lane dirs and 21 staged packages.
- The fresh bytes match across two independent fetches: ScoutOpenS106 and ScribeSOURCESRows both decode
  to 73952 bytes, sha256 `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44`.
- The host build matches the pinned tag: `/usr/bin/chromium --version` → `Chromium 154.0.8037.97 Arch Linux`.

## 3. Findings: counterexample, evidence, axes, smallest correction

### H1 — "Page.goBack" is false provenance (A3, A2)
- **Counterexample.** The landed SCORECARD/LOG text would state "history step `Page.goBack` A → B"
  (`w1/ScribeScorecardLog.md:76,93,158`).
- **Evidence.**
  - `grep -c goBack scratch/ScoutOpenS106/Page.pdl` → 0. The PDL has `command getNavigationHistory` at
    :850 and `command navigateToHistoryEntry` at :913.
  - `scratch/ExecHarnessC1/runs/positive/steps.json` seq 3 records
    `"goBackAttempt": {"code": -32601, "message": "'Page.goBack' wasn't found"}` and
    `"cdpMethod": "Page.navigateToHistoryEntry"`, with `historyBefore.currentIndex 2 → historyAfter.currentIndex 1`.
- **Correction.**
  - Leave `claims.json` unrevised; the kill rule's predicate is "executed a history step … with a
    matching before/after target", which the run meets.
  - Every landed sentence should say "history step via `Page.navigateToHistoryEntry` (CDP 154 has no
    `Page.goBack`; the attempt is recorded as -32601)".
  - The receipt keeps the failed `Page.goBack` attempt verbatim.

### H2 — the U1-open entry draft contradicts the receipt (A3, A4)
- **Counterexample.** `w1/ScribeEntryBfcache.md:14-15` takes the "U1-open, records no restore" branch,
  but `scratch/ExecHarnessC1/out-positive.json` has `"restores": 1` and
  `mainFrameNavigatedTypes: ["Navigation","Navigation","BackForwardCacheRestore"]`.
- **Correction.** Redraft on the observed branch from the committed receipt. If the receipt does not
  land, the entry must not land under the `…-observed-…` filename.

### H3 — the C2 counter change is a trade unless disclosed (A1, A2)
- **Counterexample.**
  - The as-specified prototype scores the real receipt `reopened=6 resolved=1 unresolved=5`, and all five
    fail on `digest_is_legacy_2026-10-19` (`scratch/ExecFreshnessReceipt/counter-out.json`).
  - The cause is that today's bytes are identical to the held digests (`w1/ScribeSOURCESRows.md:9`).
  - ExecFreshnessReceipt recommends dropping that check (`w1/ExecFreshnessReceipt.md:10,95`).
- **Correction.**
  - Any counter that ships without the check must be named as a counter change made after data.
  - The prototype's 1/6 result stays in wave evidence.
  - The frozen control (`control/skipwork-freshness.json`, `fetchDigest: "legacy-2026-10-19"`) must still
    fail under the shipped counter.
  - Freshness is then proven by the committed raw bytes and the fetch time, not by digest inequality.

### H4 — in-place `used-by` edits need the old→new log (A1)
- **Rule.** CORPUS.md:116-118: only `status`, `recheck` and `used-by` change in place, "and each change
  is logged old→new in the round lesson".
- **Precedent.**
  - `corpus/lessons/round-21.md:87-93` ("Mutable cells, old→new").
  - Round 12 extended `used-by` for S013, S017, S023, S024, S025 and S028 (`0d82098`).
- **Gap.** `grep -ciE 'mutable|used-by' w1/ScribeLesson25.md` → 0.
- **Correction.** Add a "Mutable cells, old→new" section to `round-25.md` listing every changed cell, or
  state "No existing status, recheck or used-by cell changed".

### H5 — id identity against the staged package (A2)
- **S106 collision.**
  - Staged `SOURCES.append.md:11` is `S106 | Robots Exclusion Protocol — RFC 9309`.
  - The lane's S106 grows the collision list from 4 ids (`assimilation/collisions.txt`, S102–S105) to 5.
  - S102–S105 already followed lane-sequential numbering over staged ids. Keeping S106 follows that
    precedent.
  - `w1/ScribeEntryFreshness.md:52-53` (F4) proposes new ids "after S249", which is a second id policy.
    Since C2 needs no superseding rows, F4 has nothing to apply to. Do not adopt it silently.
- **Optional S107.** `w1/ScribeSOURCESRows.md:92` drafts S107 to re-anchor S020.
  - It would collide with staged S107, the zh-tw DevTools page.
  - It also contradicts the round-18 rule "no superseding row is opened for a moving anchor"
    (`corpus/knowledge/source-recheck-round-18.md:118,127`, as cited in `w1/ScribeSOURCESRows.md:87`).
  - Smallest correction: do not open it. Record the S020 revision drift in the receipt and note only.
- **Assimilation candidate.**
  - It cites exactly one id: `grep -oE 'S[0-9]{3}' <candidate> | sort | uniq -c` → `1 S242`. S242 is not
    in `assimilation/quarantine-ids.txt` (`grep -c '^S242$'` → 0).
  - **But S242 is malformed.** It has 14 fields where the contract needs 13, because a `|` from a
    `curl … | grep` recheck command splits the cell. 19 staged rows have the same defect
    (`awk -F'|' '/^\| *S[0-9]{3} /{if(NF!=13)c++}'` → 19).
  - Proof: appending it renumbered to S107 in fixture `asm/` gives census exit 1, with
    `E01 S107 fields=12` and `E11 S107 missing used-by grep -c 'list_webmcp_tools'…`.
  - The package also carries the same zh-tw URL twice (S107 tier A, S242 tier B; `grep -c` → 2).
  - ScoutReopenCandidate rates the entry's tool-surface sentence "PARTIAL / unsupported"
    (`w1/ScoutReopenCandidate.md:10-14`).
- **Correction for adoption.** Adoption must be disclosed as a transform, not a verbatim adoption:
  - renumber S242 to the next lane id;
  - rewrite its `recheck` cell to `180d`, with the command moved into the entry;
  - rewrite the entry's `source: S242` line;
  - drop the unsupported inference;
  - append only that one row, never staged S107.
- **Otherwise** report "Assimilation: none — the cited row S242 is malformed (NF=14) and the entry's
  tool-surface claim does not re-ground".

### H6 — round-24 receipts and the held note must stay byte-intact (A1)
- The M1 fix ("receipts record the exact terminal rev") applies forward only.
- Editing `corpus/evidence/round-24/c{1,2}-tip.json` again would repeat `8bc1d32` (1051 deletions).
- Editing `navigation-history-bfcache-evidence.md` U1 would rewrite a dated statement.
- Corrections go in `corpus/evidence/round-25/` and `corpus/lessons/round-25.md`.

## 4. Held-note consistency (bfcache runtime vs S104, S105 and the held note)

These observations come from the harness scratch at 09:20. **The files were being rewritten while I
read them:** the port in `steps.json` changed from 45671 to 35729 between two reads. The committed
receipt is authoritative.

| Held statement (location) | Runtime observation | Agrees? |
|---|---|---|
| A restore causes "zero network requests" (held note :26-27; S104 line 2531 "…without having to go to the network at all", located at :2531 in both fresh copies) | In `runs/positive/events.jsonl`, no `Network.requestWillBeSent` follows the b.html one. Event 57 is the restore. `http-server.log` has no GET after `/b.html` | Yes |
| The document stays live and script state survives (held note :27-28) | `receipt.draft.json` nonce `ferby0qy2fb` is the same before and after the back step | Yes |
| `Page.frameNavigated.type = BackForwardCacheRestore` is the positive marker (held note :38-41; S105 :1342-1352, PDL sha `e944a3b1…` equals the held anchor) | Observed once | Yes. U1 closes **for loopback on this host only** |
| A restore is build- and flag-scoped (held note §4.3) | Chromium 154.0.8037.97; the positive argv lacks `--disable-back-forward-cache` | Yes |
| U3: `notRestoredExplanations` may never be emitted for loopback | `backForwardCacheNotUsed: []` | Yes. U3 stays open |
| U4: the article is a live page with per-response digests | Two more digests: `46dac3cd…` (157663 B) and `0832def1…` (157667 B), neither equal to the held `0dd45292…` (`sha256sum`) | Yes, and it extends U4. **Do not change S104's anchor** |
| §3 row 1: a restore must be captured with the pre- and post-restore **DOM snapshots** | 0 DOM capture commands (`grep -c 'DOM.getDocument\|DOMSnapshot\|outerHTML' commands.jsonl` → 0). Only screenshots and a `Runtime.evaluate` state marker | **No, a divergence.** Capture DOM snapshots, or the entry must name the state-marker substitution as a deviation from held §3 |
| The step is a `history.back()` (held note :20) | Browser-initiated `Page.navigateToHistoryEntry` | Different mechanism. The entry must scope to it; renderer `history.back()` stays unprobed |
| S106 scope (content_features.cc :193-205) | `kBackForwardCache` is ENABLED_BY_DEFAULT, but memory controls disable it on low-memory Android | The row and entry must not say "always enabled". ScribeSOURCESRows' "Build-scoped" scope is fine |

## 5. Checks for the L1 after integration (failure-capable)

1. **Row-cell append-only:**
   `node .ufo/waves/round-25/scratch/CritNoHarm/sources-cell-diff.mjs 9e13666759bcf30665abec84dec13adefc1fa86a <TIP>`.
   It fails on a deleted row, on an immutable cell change, or on a `used-by` change that drops or
   reorders a path. Proven:
   - baseline→HEAD: exit 0, `violations=0`;
   - `0d82098~1..0d82098` (used-by and status only): exit 0;
   - `7ac9fff~1..7ac9fff`: exit 1, `FAIL S102 immutable anchor changed`;
   - `2f35bd4~1..2f35bd4`: exit 1, `FAIL S105 immutable anchor changed`;
   - an unknown revision: exit 2.
2. **Whole-file appends:** `git diff --numstat 9e13666 <TIP> -- SCORECARD.md LOG.md corpus/README.md
   corpus/QUALITY.md SKILL.md corpus/adjacency.tsv corpus/knowledge/navigation-history-bfcache-evidence.md
   corpus/evidence/round-24` must show 0 deletions. SOURCES.md deletions must equal the number of
   `used-by` rows logged under H4.
3. **Census:** `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` must exit 0,
   and the W04 set must equal `census-before.txt` (16 lines).
4. **No false method name:** `grep -n 'Page.goBack' SCORECARD.md LOG.md corpus/README.md corpus/knowledge/bfcache-runtime-observed-round-25.md`.
   Every hit must be the recorded -32601 attempt, never "executed".
5. **Assimilation guard after S106:** rerun `comm -12` on the reg and staged id lists. Expect S102–S106,
   and report it.
