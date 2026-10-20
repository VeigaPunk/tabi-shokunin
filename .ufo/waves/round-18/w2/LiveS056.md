VERDICT: ISSUES

# LiveS056 — C1 receipt S056 (round 18, wave 2)

**Split verdict.** Receipt integrity: **held / contract-valid**. Every C1 field checks out; the
quote is present at the recorded offset, the excerpt reconstructs byte-exactly from the fetched body,
and `node .ufo/waves/round-18/measure-c1.mjs 530f40a9...` accepts S056 (`c1_rows_rechecked: 51`,
`rejected: []`). Claim level: **ISSUES**. C1's "freshness" framing treats re-fetching an **immutable
pinned tag** as freshness, and S056 is a row whose own cadence is `on-release` while jj **v0.46.0**
shipped 12 d 21 h 37 m before the receipt. The receipt could not detect it, no `supersedes S056 —`
row exists, and the note's "no row's recheck cell was past due" is false under the row's own
`on-release` cell.

## 1. Inputs read

| Input | Location | Observed |
|---|---|---|
| Receipt | `corpus/evidence/round-18/source-recheck/S056.json` | 24 lines; sha256 at REV `890a6f77ff57b2f5ee7ffceb0419d10506ff495e5140a00bfe6543d14b467e84` (working tree identical) |
| Excerpt | `corpus/evidence/round-18/source-recheck/S056.excerpt.txt` | 1335 B; sha256 `78147ee86ba8901db4c2340a27dd8112fa3431174a73186ae53258f8d02ea6e2` (matches `excerptSha256`; identical at REV) |
| Registry row | `corpus/SOURCES.md:70` at `530f40a9bc3f10436161a2af1ca0fe9bffffc004` | status `queued`, tier `A`, opened `2026-10-20`, **recheck `on-release`**, anchor `v0.45.1 (tag 7c41cdeb16b6b321c64e789a966b6adf723816a5), §0.45.0 Fixed bugs:96-97; §0.45.0 New features:68-71` |
| Quote source | `corpus/lessons/round-17.md:62` (S050 row) | quote present in-byte with backticks, 20 words; line 62 is the S050 row, not S056 |
| Successor correction | `corpus/lessons/round-17.md:77` (S056 row) | `"HEAD equals a bookmark only by coincidence" is not in the source; after \`jj new master\` HEAD = @- = master by construction` |
| Note | `corpus/knowledge/source-recheck-round-18.md:3,7,140` | lines 3/7 claim no row is date-due/past due; line 140 admits quote presence is not claim truth and `anchorObserved` is free text |
| Plan | `.ufo/waves/round-18/PLAN.md:15-18` | C1 "Source rows re-verified against their live source"; target 51 = every row not superseded at B (S056 listed as S050's successor) |
| Lesson | `corpus/lessons/round-18.md:12-16,30-31` | C1 "counts receipts, not overdue rows or current product support"; rejects "overdue-repair framing (no row is date-due)" |
| Producer | `.ufo/waves/round-18/recheck-fetch.mjs:95,123-130` | curl-only fetch at :95; `anchorObserved` and `teachesVerdict` are caller-supplied strings at :129-130 |
| Counter | `.ufo/waves/round-18/measure-c1.mjs:337,467-472` | accepts `teachesVerdict` string at :337; counts held at :467; `freshness_scope` at :471 |
| Cadence checker | `scripts/check-sources.mjs:322` | only validates `on-release` is one of the allowed tokens; computes no due-ness |
| Axis precedent | `SCORECARD.md:476` | round-12 freshness credit: "including two corrected/qualified discrepancies rather than demanding confirmation-only results" |

No lane production file was edited; all probes ran in `/tmp/tabi-s056-falsify-3092` (deleted after
this report). No `git`/`jj` write was made in LANE. No browser, no runtime `jj`, no credentials.

## 2. Independent re-fetch of S056

Exact command (same argv as the receipt, plus a status/size trailer):

```
mkdir -p /tmp/tabi-s056-falsify-3092 && cd /tmp/tabi-s056-falsify-3092
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w 'HTTP:%{http_code} BYTES:%{size_download} URL:%{url_effective}\n' \
  'https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/CHANGELOG.md'
sha256sum body; wc -c body; wc -l body
```

Observed:

```
HTTP:200 BYTES:66028 URL:https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/CHANGELOG.md
05c34fb8d81f4de624c4f6754f6e31abdee14942ce3f32cc6925b7775b393c76  body
212175 body
5635 body
```

`BYTES:66028` is curl's compressed transfer size; `--compressed` writes the decompressed body, whose
length (212175) and sha256 are exactly the receipt's `bytes`/`sha256`. The page is a pinned tag, not
a dynamic page; raw-body equality is expected and observed.

Quote location (producer normalizer: NFC, curly quotes/dashes folded, whitespace runs collapsed):

- raw occurrences: `0` (the sentence is wrapped at `CHANGELOG.md:96-97`);
- normalized occurrences: `1` at offset **3219**, equal to receipt `quoteOffset: 3219`;
- `quoteWords` = 20 = `len(quote.split())` = 20.

Anchor lines in the fetched body, all exact:

| Line | Text |
|---|---|
| 21 | `## [0.45.1] - 2026-09-03` |
| 36 | `## [0.45.0] - 2026-09-02` |
| 68-71 | `* Git HEAD state is now tracked per worktree internally. This prepares` / `  colocated repositories for support of multiple Git worktrees, where each` / `  jj workspace can have its own Git HEAD. Existing repositories are migrated` / `  automatically.` |
| 96-97 | `* In colocated workspaces, \`jj workspace update-stale\` now correctly resets the` / `  Git HEAD to the parent of the fresh working-copy commit.` |
| 98 | `  [#9936](https://github.com/jj-vcs/jj/issues/9936)` |

Excerpt reconstruction from the fetched body (same algorithm as the producer):

```
offset 3219 (receipt 3219)
excerpt sha 78147ee86ba8901db4c2340a27dd8112fa3431174a73186ae53258f8d02ea6e2
receipt sha 78147ee86ba8901db4c2340a27dd8112fa3431174a73186ae53258f8d02ea6e2
exact match True
```

Verdict on the assignment's three-part test:

- **Source identity: held.** HTTP 200, same URL, same 212175-byte body, same sha256; `git ls-remote`
  independently shows `7c41cdeb16b6b321c64e789a966b6adf723816a5 refs/tags/v0.45.1`.
- **Anchor: held.** :21, :36, :68-71, :96-97 all match the receipt's `anchorObserved` and the
  registry anchor cell.
- **Teaches: held, with a derivation split.** The quote supports the first clause (update-stale reset
  to the parent of the fresh working-copy commit). The second clause ("tracks Git HEAD per worktree")
  is supported by the same body at :68-71. The third ("HEAD equals a bookmark exactly while @- is
  that bookmark commit") is not in the quote or :68-71; the receipt's `note` calls it a derived state
  claim grounded by `docs/git-compatibility.md:208`, which I re-fetched (sha256
  `0fb71f992b0ed05d547e597d3f5f1cd33ed9e5d56a4e4e4cb851ba30c766c641`, 12284 B, HTTP 200); line 208
  reads `# Convince jj to update .git/HEAD to point to the working-copy commit's parent`. The
  round-17 lesson's S056 row (`:77`) records the same construction. The verdict is substantively
  correct, but the **quote alone does not support all three clauses** (see F2).
- **Drift: none** (the v0.45.1 text is unchanged). **Unreachable: no.**

## 3. Receipt contract comparison

| Field | Receipt | Observed | Result |
|---|---|---|---|
| `schema` | `tabi-source-recheck-v1` | same | pass |
| `row` | `S056` | present at REV, not in superseded set | pass |
| `rowUrl` | `https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/CHANGELOG.md` | occurs verbatim in `SOURCES.md:70` source cell | pass |
| `url` | same as `rowUrl` | direct URL allowed by `canonicalFetchTarget` | pass |
| `fetchedAt` | `2026-10-20T19:05:57.339Z` | file mtime `2026-10-20 16:05:57.339713724 -0300` = `19:05:57.339Z`; ISO day matches | pass |
| `command` | canonical curl, `-o <tmp>/body` | equals `expectedCurlCommand(url)` | pass |
| `httpStatus` | `200` | `200` | pass |
| `bytes` | `212175` | `212175` | pass |
| `sha256` | `05c34fb8...393c76` | `05c34fb8...393c76` | pass |
| `decode` | `none` | body is UTF-8 markdown | pass |
| `normalizer` | producer string | matches producer | pass |
| `quote` | 20-word sentence with backticks | normalized occurrence at 3219 | pass |
| `quoteWords` | `20` | 20 | pass |
| `quoteSource` | `corpus/lessons/round-17.md:62` | line 62 is the S050 row carrying this quote | pass |
| `quoteFound` | `true` | true | pass |
| `quoteOffset` | `3219` | 3219 | pass |
| `excerpt` / `excerptSha256` | `S056.excerpt.txt` / `78147ee...` | 1335 B; sha matches; exact reconstruction from body | pass |
| `anchorObserved` | free text | :21/:36/:68-71/:96-97 exact; tag resolution true but not produced by `command` | pass with F3 caveat |
| `teachesVerdict` | `held` | mechanically accepted; semantically defensible via quote + :68-71 + docs :208 | pass with F2 caveat |
| `producerSha256` | `f2ba0033...aa360` | sha256 of producer at REV | pass |

Counter at REV (read-only; no `--live`):

```
$ node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
exit=0
```

S056 is in the 51: `held` counts 50 non-own-work held receipts and `own_work` counts S029, so the 51
= 50 + 1. `rejected: []` means S056 passed every mechanical rule.

## 4. Findings

### F1 (high, claim-level) — S056 is event-due under its own `on-release` cell; the receipt re-verified an immutable old tag

**Counterexample, in one line:** S056's `recheck` cell is `on-release` (`corpus/SOURCES.md:70`); jj
**v0.46.0** was tagged `7d382314f9420b4b8d932245b49c99492c812b9f` and published **2026-10-07T21:28:17Z**
(GitHub `releases/latest` returned v0.46.0); the receipt fetched `v0.45.1` at **2026-10-20T19:05:57Z**,
**12 d 21 h 37 m 40 s** later, and found the immutable v0.45.1 bytes unchanged.

Evidence:

- `corpus/SOURCES.md:70` — `recheck` = `on-release`; anchor = v0.45.1; `opened` = 2026-10-20.
- `git ls-remote --tags https://github.com/jj-vcs/jj 'v0.4*'` — `7c41cdeb... refs/tags/v0.45.1`
  and `7d382314f9420b4b8d932245b49c99492c812b9f refs/tags/v0.46.0`.
- `https://api.github.com/repos/jj-vcs/jj/releases/latest` — `v0.46.0 2026-10-07T21:28:17Z`;
  `releases/tags/v0.45.1` — `2026-09-03T16:24:38Z`.
- `https://raw.githubusercontent.com/jj-vcs/jj/v0.46.0/CHANGELOG.md` — HTTP 200, sha256
  `54ee00e57a9bdf652204f0f31458a62af0b39e42f3dbd54f8d547cb212719caf`, 219257 B (two fetches
  identical); `:21` `## [0.46.0] - 2026-10-07`; `:25-27`:
  `* Jujutsu can now colocate workspaces besides the default one by creating Git` /
  `  worktrees. Use \`jj workspace add --[no-]colocate\` and the setting` /
  `  \`git.colocate\` to control this.`
- `corpus/SOURCES.md` at REV has **no** `0.46` row (`grep -n '0.46\|v0.46'` → exit 1, no output) and
  **no** `supersedes S056 —` row. S056 is the jj changelog row; S055 is the separate jj docs row,
  also pinned and also `on-release` at `corpus/SOURCES.md:69`. Both anchor on v0.45.1, which v0.46.0
  supersedes for the multi-worktree subject; neither row was superseded, so the event-due gap is not
  unique to S056.
- The note's line 7 (`corpus/knowledge/source-recheck-round-18.md:7`) says "no row's `recheck` cell
  was past due on this date." Under `on-release`, S056 was past due: v0.45.1 shipped 2026-09-03
  (before the row was opened) and v0.46.0 shipped 2026-10-07 (before the receipt). Readings under
  which it is not due require `on-release` to mean either a release newer than the row's opening or a
  change to the pinned source itself; neither is defined in the contract, and both make the cadence
  untestable (the pinned tag never changes). `corpus/knowledge/source-recheck-round-18.md:3` narrows
  the claim to "date-due", but `on-release` is not a date, and `corpus/lessons/round-18.md:30-31`
  rejects the overdue framing on that date-only premise.
- No code computes cadence: `measure-c1.mjs` never reads `recheck` (grep for `recheck` finds only
  fixture-table text); `scripts/check-sources.mjs:322` only checks that the token is one of
  `90d`/`180d`/`on-release`. The counter's own `freshness_scope` (`measure-c1.mjs:471`) says
  "round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate."
- The 51 receipts are **38 living_live + 12 immutable_pinned + 1 own_work** (replication of the
  counter's `isPinnedUrl`/`urlClass`; the replication's all-row total `immutable_pinned: 17` matches
  the counter output). S056 is one of the 12 pinned rows: `S033, S034, S036, S037, S041, S042, S043,
  S044, S045, S046, S055, S056`. For these, a `held` receipt is near-tautological unless the tag is
  force-moved or serving changes; it is an **availability** check, not a currency check.
- The round-12 freshness precedent (`SCORECARD.md:476`) credited re-verification "including two
  corrected/qualified discrepancies rather than demanding confirmation-only results." Round 18 C1 is
  **50 live confirmations + 1 own-work hygiene, 0 drift** (`drift_superseded: 0`; the note's §2/§5
  say "No drift in this round"). The improvement is receipt quantity, not source correction.

**Why this is a claim-level issue, not a receipt invalidity.** The C1 note is careful in §4 ("live or
pinned") and §6 ("not a statement of current live product support"), and the lesson's gate says it
counts receipts, not overdue rows. But the PLAN's C1 line (`PLAN.md:15`) says "re-verified against
their live source" and the axis is named freshness. For S056 the "live source" is an immutable tag,
and the release that materially extends the same subject (multi-worktree colocation) shipped 13 days
before the row was opened. The receipt is honest about what it fetched; the count and the freshness
label are not supported by it.

**Finite limit.** I did not run jj and did not verify that `jj workspace add --colocate` works. I read
the release note only. The v0.46.0 changelog still carries the 0.45.0 entries verbatim at `:239-241`
and `:267-268` (under the 0.45.0 section at `:207`), so the quote would also be found in the latest
changelog; the defect is the row's stale teaching pointer/currency, not a false quote or a
contradicted source text.

### F2 (medium, provenance) — `teachesVerdict: held` and `anchorObserved` are author-supplied, not receipt-derived

The producer writes `teachesVerdict: o.verdict` and `anchorObserved: o['anchor-observed'] ?? ''`
(`recheck-fetch.mjs:129-130`); the counter only checks the string is `held` or `drift`
(`measure-c1.mjs:337`) and counts it (`:467`). The receipt's `note` (`S056.json:22`) does the actual
grounding. For S056:

- quote (`S056.json:13`) supports clause 1 only;
- clause 2 is at fetched `:68-71`, outside the quote;
- clause 3 is at `docs/git-compatibility.md:208` and `corpus/lessons/round-17.md:77`, outside the
  fetched URL entirely.

The verdict is substantively correct (I checked all three), but it is not established by the
receipt's quote or by the counter. The note's own §6 line 140 says exactly this: quote presence does
not show "that the row's `teaches` claim is correct, that the quote supports it." This is a
provenance boundary the C1 admission rule does not test.

### F3 (medium, provenance) — `anchorObserved`'s tag-resolution clause is not produced by the recorded command

`S056.json:20` says "tag v0.45.1 still resolves to 7c41cdeb16b6b321c64e789a966b6adf723816a5". The
recorded `command` (`S056.json:7`) is a curl of `raw.githubusercontent.com` only; the producer's
fetch argv is curl-only (`recheck-fetch.mjs:95`) and contains no `git ls-remote` or tag resolution.
I independently confirmed the tag resolves to `7c41cdeb...` via `git ls-remote`, so the statement is
**true**, but it is an unrecorded observation, not receipt evidence. The counter does not validate
`anchorObserved`. This matters because the receipt's body sha cannot by itself prove which commit the
tag served.

### F4 (low, semantic) — the `teaches` phrase drops "internally/prepares"

`corpus/SOURCES.md:70` says "tracks Git HEAD per worktree". The 0.45.0 entry says "Git HEAD state is
now tracked per worktree **internally**. This **prepares** colocated repositories for support of
multiple Git worktrees" (`v0.45.1` `:68-71`). The user-facing feature arrives in v0.46.0 (`:25-27`:
"can now colocate workspaces besides the default one"). The `teaches` is accurate for 0.45 if
"internally" is understood, but it reads as a present-tense capability; a reader looking for the
current multi-worktree behavior should be on v0.46.0. This reinforces F1 rather than standing alone;
it is not a false statement about 0.45.

## 5. Secondary control — S029 own-work (git object, no network)

The assignment names S029 explicitly; I verified it with `git show` at the pinned commit rather than
network:

```
git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json
→ 97073 B, sha256 b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7
```

- Receipt `S029.json` `sha256` and `bytes` match; `httpStatus` is `null`; `command` is the recorded
  `git -C ... show 837b33a:...`; the counter's constants `S029_SOURCE_REV/PATH/SHA256`
  (`measure-c1.mjs:16-18`) match.
- Normalized quote occurrence: 1 at offset **74695**, equal to receipt `quoteOffset: 74695`.
- Excerpt reconstruction from the pinned blob: sha256
  `80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff`, equal to the receipt's
  `excerptSha256`; stored excerpt is 1382 B with the same digest.
- Result: **held; contract-valid**. This is a hygiene row, as the lesson says; it is not live
  freshness and I do not count it as such.

## 6. What did not fail

- Body identity: sha256 `05c34fb8...393c76`, 212175 B, HTTP 200, 5635 lines.
- Quote: 20 words, normalized occurrence at 3219, line-wrapped at `:96-97` as the registry says.
- Anchor: :21/:36/:68-71/:96-97 exact in the fetched body.
- Excerpt: exact reconstruction from the body, sha matches receipt.
- Producer: sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` at REV.
- Binding: `S056.json` and excerpt at REV have the same sha as the working tree; no post-commit drift.
- Timestamp: `fetchedAt` equals the file mtime to the millisecond (not backdated).
- Tag identity: v0.45.1 = `7c41cdeb...` (independently confirmed).
- S029 own-work: pinned blob, quote, offset and excerpt all reconstruct exactly.
- Counter: S056 accepted, `rejected: []`, `c1_rows_rechecked: 51`.

## 7. Limits

- **No runtime.** I did not run jj, a browser, or Chromium; the finding is about the release stream
  and the registry, not product behavior. The v0.46.0 highlight is read from the release note, not
  exercised.
- **One S056 fetch.** I fetched v0.45.1 once; it matches the receipt's earlier fetch byte-for-byte
  (two independent fetches, same sha). v0.46.0 was fetched twice with identical sha.
- **Other rows not audited.** I checked only S056 (primary) and S029 (secondary control). The 12/51
  pinned and 34/51 on-release counts are a regex replication of the counter's own classifier,
  validated by the all-row total (17/46/1) matching the counter output; they are not a per-row audit.
- **GitHub API is live.** `releases/latest` reported v0.46.0 at report time; the claim "v0.46.0 is
  the latest release" is bounded to 2026-10-20.
- **No network writes, no credentials.** All public requests were GET; no session content, no
  authenticated endpoint, no page-tool invocation.
- **No producer run into production.** I read `recheck-fetch.mjs` and ran only the read-only counter
  and my own fetches; no receipt was regenerated or replaced.

The `/tmp/tabi-s056-falsify-3092` probe directory was disposable and is deleted; the commands and
full digests above reproduce every observation.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS056.md`
