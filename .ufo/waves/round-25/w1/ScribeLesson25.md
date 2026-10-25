# ScribeLesson25 — round-25 lesson skeleton (report-only draft)

Seat: `L1Tabi25.ScribeLesson25` (scribe, wave 1). Lane tip at drafting: `c8ef3084c6363f265b9d23285296ab3547654f57`
(`git rev-parse HEAD`; baseline `9e13666…` is its parent, `git merge-base --is-ancestor 9e13666 HEAD` → ok).
Shape source: `corpus/lessons/round-24.md` (H1 + intro, `## Gate` table, `## Mistakes` with
Class / Evidence pointer / Captured-by / Fix, `## Corrections` table, carried items).
Nothing in the tracked tree was edited; no fetch was made by this seat; no tool installed.

Axes worked by this draft: fidelity (every figure carries its command), resolvability (every pointer
is a committed path at a named rev), and falsifiability (each fix names a red case).

---

## Draft text (proposed `corpus/lessons/round-25.md`)

```markdown
# Round 25 — observed bfcache restore, on-release source re-open

Round 25 (hyaku run 6), baseline `9e13666759bcf30665abec84dec13adefc1fa86a`. Two claims, frozen in
`.ufo/waves/round-25/claims.json` before data (C1 depth: observed BackForwardCacheRestore receipt;
C2 freshness: six on-release rows re-opened). Verdicts: `SCORECARD.md` §"Round 25 — …" [TO FILL at integration].

## Gate

Sources opened this round (quotes located in bytes fetched 2026-10-25, ≤25 words). [L1: re-fetch
yourself before landing; the values below are the ScoutOpenS106 scratch copy, hashed by ScribeLesson25.]

| Row | URL | Opened | Located quote |
|---|---|---|---|
| S106 (new) | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT | 2026-10-25, 73952 bytes decoded from a 98604-byte base64 transfer, sha256 `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` | decoded lines 186–187: "// Enable using the BackForwardCache." / `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);` |
| S104 (re-opened) | https://web.dev/articles/bfcache | 2026-10-25, 157663 bytes, sha256 `46dac3cd4155100d983a8b307f01e5329cfc1a69954d3c76befcceae3906515e` | line 2531 (raw bytes carry `<em>` around "essentially instant"): "Loading the previous page is essentially instant, because the entire page can be restored from memory, without having to go to the network at all." |
| S105 (re-opened) | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT | 2026-10-25, 61911 bytes decoded from an 82548-byte base64 transfer, sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` | decoded line 1345: `BackForwardCacheRestore` (NavigationType enum); line 1706: `experimental event backForwardCacheNotUsed` |

Freshness note: S105 is tag-pinned and byte-identical to its round-24 open (same sha256 as
`corpus/lessons/round-24.md:16`). S104 is a live page and drifted again: round 24 recorded 157667
bytes / `0dd45292…` (`round-24.md:15`), today's copy is 157663 bytes / `46dac3cd…`. The held quote
is still located at line 2531. The row's quote is dated, not stable (round-24 entry U4).

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` at round
start → [exit TO FILL from the L1's record; `.ufo/waves/round-25/census-before.txt` is 17 lines,
16 W04 + `tabi ok`, and carries no exit field]; at round end → [TO FILL].
Id-collision: S106 is free in the lane registry at `9e13666` (`grep -nE '^\| S10[4-9]'
corpus/SOURCES.md` → S104, S105 only). [Staged-package collision check TO FILL from ScoutAssimilationPrep.]
Assimilation: [TO FILL — admitted theme, or "Assimilation: none" with reason].

## Mistakes

### M1 — receipt-pinning revision mismatch (routed by the round-24 non-author spot-check)

- **Class:** reference-drift (a receipt and the report that cites it name different revisions for
  one measurement).
- **Evidence pointer:** `corpus/lessons/round-24-verifier-spotcheck.md:78-80` at `9e13666`:
  "Receipt-pinned measurement revision `4722dba` differs from the report claim table's cited commit
  `8bc1d32`; the delta is only the two receipt files". The committed bytes show four revisions
  named for the one round-24 "after" measurement, all at `9e13666`:
  `corpus/evidence/round-24/c1-measurements.json:28` and `c2-measurements.json:48` → `2f35bd4…`;
  `c1-tip.json:3` and `c2-tip.json:3` → `4722dba…`; `corpus/lessons/round-24.md:102` → "measured
  at `3069ca9`"; spot-check `:7`, `:34-36` → `8bc1d32` (report tip). Commit `8bc1d32` ("receipt revs to
  the final tip") changed only the two `*-tip.json` files. Parsed, they are identical apart from
  `rev` (`2f35bd4` → `4722dba`). The measurements files were left at `2f35bd4`. Verdicts are
  unaffected: `git diff --name-only 2f35bd4 8bc1d32` touches only `corpus/evidence/round-24/` and
  `corpus/lessons/round-24.md`.
- **Captured-by:** none. No gate compares a receipt's `rev` with the hash the report or lesson
  cites for the same claim. The spot-check found it by reading.
- **Fix (shown able to fail):** each receipt records the exact terminal measured revision (the
  40-hex whose tree the counter read). The report and lesson cite that same hash for the
  measurement. A later receipt-only landing commit is named separately as the landing commit,
  never as the measured rev. A receipt cannot name the commit that contains it, so "the final tip"
  is never a value a receipt can hold. Red-before: the ExecLessonEvidence fixture
  (`.ufo/waves/round-25/w1/ExecLessonEvidence.md` [TO FILL: exact finding id and exit of
  `node scripts/check-measurement-binding.mjs --check <manifest> --at 9e13666… --reproduce` on the
  mismatched manifest; exit 0 on the matching one]). Proposed QUALITY criterion 66 (below).

### M2 — this round's own dispatch carried the drift forward (this round's own)

- **Class:** reference-drift (a summary of a receipt substituted for the receipt's bytes).
- **Evidence pointer:** `.ufo/waves/round-25/w1-spec.json:80` (committed in `c8ef308`) states
  "c2-measurements.json pins measurement revision 4722dba…". The committed
  `corpus/evidence/round-24/c2-measurements.json:48` at `9e13666` reads `"rev":
  "2f35bd4c79951e35a3241a600bb47a0d36d48f3d"`. `4722dba` lives only in `c2-tip.json:3`.
  The spot-check row `:35` makes the same attribution ("`c2-measurements.json` … after `4722dba`").
  The round-25 spec copied the reviewer's prose, not the receipt.
- **Captured-by:** none at dispatch. Caught by ScribeLesson25 reading the bytes
  (`git show 9e13666:corpus/evidence/round-24/c2-measurements.json`).
- **Fix:** a dispatched premise that names a receipt field quotes the field from `git show <rev>:<path>`,
  never a reviewer's paraphrase. The fix for M1 removes the source of the confusion, since one rev
  per measurement leaves nothing to misattribute.

### Probe / harness hazard (candidate M3 — [TO FILL or drop])

[No harness hazard observed by this seat: `.ufo/waves/round-25/scratch/` held only `ScoutOpenS106/`
at drafting, and `.ufo/waves/round-25/w1/` held no sibling report. Fill from ExecHarnessC1 /
ExecBfcacheDiagnostics if a hazard (e.g. a restore suppressed by an eligibility disqualifier, or a
stray chromium after cleanup) is actually observed; otherwise drop this heading.]

## Corrections

| Superseded figure | Where it stood | Superseding statement |
|---|---|---|
| "measured at `3069ca9`" | `corpus/lessons/round-24.md:102` | receipts at `3069ca9` record `rev` `2f35bd4…`; the tip receipts were relabelled to `4722dba…` in `8bc1d32` with an otherwise identical body |
| "`c2-measurements.json` … after `4722dba`" | `corpus/lessons/round-24-verifier-spotcheck.md:35` | `c2-measurements.json:48` reads `2f35bd4…`; `4722dba…` is `c2-tip.json:3` |
| [TO FILL at integration] | | |
```

### Proposed QUALITY criterion 66 (draft text, for the L1; not appended)

> 66. A measurement has one revision. Every receipt for a claim (`*-measurements.json`, `*-tip.json`,
> or any successor) records the same 40-hex terminal measured revision in its `rev`/`after.rev`
> field. The report claim table, the lesson and the SCORECARD cite that same hash for the
> measurement. A receipt-only commit landed afterwards is cited separately as the landing commit,
> with `git diff --name-only <measured> <landing>` showing receipts only. A receipt never claims to
> pin "the final tip", because it cannot name the commit that contains it. (lesson:
> corpus/lessons/round-25.md#m1 #m2; round-24 spot-check `:78-80`.) Falsifier: the round-24 receipts
> at `9e13666` carry `2f35bd4` (measurements) and `4722dba` (tip) for one measurement, while the
> report cites `8bc1d32`. The criterion fails if the ExecLessonEvidence mismatched manifest exits 0
> under `scripts/check-measurement-binding.mjs --check … --reproduce`.

---

## Commands and outcomes (this seat)

| Fact | Command | Outcome |
|---|---|---|
| tip / baseline relation | `git rev-parse HEAD`; `git merge-base --is-ancestor 9e13666… HEAD` | `c8ef308…`; ancestor ok; `git log 9e13666..HEAD` = 1 commit (`c8ef308` freeze) |
| scout bytes | `wc -c *; sha256sum *` in `.ufo/waves/round-25/scratch/ScoutOpenS106/` | Page.pdl 61911 / `e944a3b1…`; Page.pdl.b64 82548; bfcache.html 157663 / `46dac3cd…`; content_features.cc 73952 / `9b93fe64…`; .b64 98604 |
| S106 line | `grep -n -B1 -A4 'kBackForwardCache,' content_features.cc` | lines 186–187 as quoted |
| S105 lines | `grep -nE 'BackForwardCacheRestore\|event backForwardCacheNotUsed' Page.pdl` | 1345, 1706 |
| S104 line | `grep -noE 'Loading the previous page is.{0,160}' bfcache.html` | 2531 |
| receipt revs across commits | `git show <r>:corpus/evidence/round-24/{c1,c2}-{measurements,tip}.json` parsed for `after.rev`/`rev`, r ∈ {ad125e8, 2f35bd4, 3069ca9, 4722dba, 8bc1d32, 9e13666} | ad125e8/2f35bd4: `b973fde`; 3069ca9/4722dba: all `2f35bd4`; 8bc1d32/9e13666: measurements `2f35bd4`, tip `4722dba` |
| 8bc1d32 scope | `git show --stat 8bc1d32` | only `c1-tip.json`, `c2-tip.json` (1051+/1051−, reindent) |
| tip bodies identical bar rev | node: parse `3069ca9` vs `8bc1d32` tip JSON, delete `rev`, compare | c1-tip true, c2-tip true |
| inputs unchanged | `git diff --name-only 2f35bd4 8bc1d32 \| grep -vE '^corpus/evidence/round-24/\|^corpus/lessons/round-24.md$' \| wc -l` | 0 |
| QUALITY 66 free | `grep -cE '^[0-9]+\. ' corpus/QUALITY.md` at HEAD and `c8ef308` | 65 / 65; last is `65.` at line 343 |
| S106 free | `grep -nE '^\| S10[4-9]' corpus/SOURCES.md` | S104 (line 118), S105 (line 119) only |
| spec premise | `grep -noE 'c2-measurements.json pins measurement revision 4722dba…' w1-spec.json w1-dispatch.json` | `w1-spec.json:80`, `w1-dispatch.json:316` |

## Findings (verbatim conflicts for the judge)

1. **ExecLessonEvidence premise is off at bytes.** Its item (`w1-spec.json:80`) says c2-measurements
   pins `4722dba`. The committed value is `2f35bd4…` (`c2-measurements.json:48` at `9e13666`), and
   `4722dba` is in `c2-tip.json:3`. Its part (a) should quote both receipts.
2. **Spot-check `:35` carries the same misattribution.** It is reported here, not judged. The spot-check bytes are
   frozen, so the correction goes in the round-25 corrections block.
3. **`round-24.md:102` names `3069ca9` as the measured revision.** The receipts committed in
   `3069ca9` record `2f35bd4`.
4. **`8bc1d32` relabelled `rev` only.** The tip-receipt bodies are identical bar `rev`.
   [INFERENCE] Whether a re-run happened is unknown: identical inputs would reproduce an
   identical body, and the reindent suggests a regenerating serializer, so the bytes cannot tell
   a re-run from a relabel.
5. **S104 drifted again today** (157663 B / `46dac3cd…` vs the round-24 row's 157667 B /
   `0dd45292…`). The quote is still located. The S104 citation in the C1 entry should carry
   today's digest.

## Out of scope / not done

- The round-24 fleet report (`/home/vgpnk/Projects/shokunin/.ufo/reports/…`) was not read, per the
  fleet-repo read ban. The "report cites `8bc1d32`" fact rests on spot-check `:7`, `:17`, `:21`.
- No fetch, no browser, no measurement-binding run (that is ExecLessonEvidence's job).
- ScoutOpenS106 / ExecLessonEvidence / ExecHarnessC1 reports were absent at drafting
  (`ls .ufo/waves/round-25/w1/` empty). The `[TO FILL]` slots name exactly what they supply.

Artifact: `.ufo/waves/round-25/w1/ScribeLesson25.md` (this file). No scratch files created.
