# ScribeEntryFreshness — draft of `corpus/knowledge/source-recheck-round-25.md` (report-only)

Seat: `L1Tabi25.ScribeEntryFreshness` (scribe, wave 1). Written 2026-10-25. Read-only. This file is the
only one written. No tracked file was edited and no git write was run. No network fetch was made by
this seat: every digest below is computed from bytes that other seats saved in this round's scratch.
No tool was installed or upgraded.

## 0. Status of inputs (read this first)

- **`ScoutFreshnessReopen` report: absent.** `ls .ufo/waves/round-25/w1` at write time listed only
  `ScoutOpenS106.md` and `ScoutWavePolicy.md`. Its scratch bytes exist:
  `.ufo/waves/round-25/scratch/ScoutFreshnessReopen/S0NN.{html,headers}`, mtime 2026-10-25 09:15:24 -0300.
- **`ExecFreshnessReceipt` report and assembled JSON: absent.** Only its fetched bytes exist:
  `.ufo/waves/round-25/scratch/ExecFreshnessReceipt/bytes/S0NN.{html,headers,status,fetched_at}`.
- **`ExecCounterC2Proto` scratch: absent** (`ls scratch/ExecCounterC2Proto` returned "No such file or directory").
- **What that means for the draft:** under the assignment rule ("never invent a verdict"), every
  per-row **verdict** cell and the counter values are `<PLACEHOLDER>`. The digests, byte counts,
  HTTP statuses and quote offsets are filled in, because they are reproducible observations of
  bytes already on disk. They are labelled as this scribe's cross-check, not as a seat's verdict.

## 1. Observations behind the draft (each with its command)

| # | Observation | Command (cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin`) |
|---|---|---|
| O1 | Three separate fetch sets made today, all HTTP 200. Scout's headers carry `date: Sun, 25 Oct 2026 12:15:24 GMT`. Exec's `fetched_at` values are 2026-10-25T12:15:51Z / 12:15:52Z. ScribeSOURCESRows records `2026-10-25T12:15:58Z`. | `head -1 S0NN.headers; grep -i '^date:' S0NN.headers` in `scratch/ScoutFreshnessReopen`; `cat scratch/ExecFreshnessReceipt/bytes/S0NN.{status,fetched_at}`; `cat scratch/ScribeSOURCESRows/fetched-at.txt` |
| O2 | For all six rows, the sha256 and byte count of each of the three fetch sets **equal** the round-18 receipt's `sha256` / `bytes` (table in §3 of the draft). | `sha256sum`, `stat -c %s` over the three scratch sets; `node -e` read of `corpus/evidence/round-18/source-recheck/S0NN.json` |
| O3 | The round-18 held quote (`quote` field of each round-18 receipt) occurs in today's Scout bytes for 6/6 rows, at the **same normalized offset** as round-18's `quoteOffset` (S013 3529, S015 1230, S016 1402, S020 586, S023 4509, S024 4648). | `node --input-type=module` importing `decodeBody`/`normalize` from `.ufo/waves/round-18/recheck-fetch.mjs` (sha256 `1cfdc3fd…caa18`), decode per receipt, `indexOf(normalize(quote))` |
| O4 | S020 today serves `<meta content="51ed75653aaa7f174f8dbe05d1bc327359bbc57c" name="revision">`, `<time class="dt-updated" datetime="2026-10-20">`, header `last-modified: Tue, 20 Oct 2026 14:58:56 GMT`. Registry anchor cell still says `CG-DRAFT 2026-10-16, revision f14762e6`. | `grep -o '<meta[^>]*revision[^>]*>'` and `cat S020.headers` in Scout scratch |
| O5 | No `supersedes S013/S015/S016/S020/S023/S024` text exists in `corpus/SOURCES.md` at the working tree. | Grep `supersedes S0(13\|15\|16\|20\|23\|24)\b` over `corpus/SOURCES.md` → 0 matches |
| O6 | Registry max id is S105 (105 rows). `.ufo/waves/round-25/assimilation/staged-ids.txt` lists S102–S249. `collisions.txt` lists S102–S105. C1 claims S106. | `grep -oE '^\| S[0-9]{3} ' corpus/SOURCES.md \| sort \| tail`; `grep -c '^\| S[0-9]'`; `cat assimilation/{staged-ids,collisions}.txt` |
| O7 | HEAD is `c8ef308` ("round-25: freeze claims…"). Its parent is the declared baseline `9e13666`, and `merge-base --is-ancestor` succeeds. `corpus/evidence/round-25/` and `scripts/check-source-reopen-receipt.mjs` do not exist yet. | `git log --oneline -5`; `git merge-base --is-ancestor 9e1366… HEAD`; `ls` |
| O8 | Skip-work control `control/skipwork-freshness.json` marks all six rows `holds` with `fetchDigest: "legacy-2026-10-19"` and summary 6/6/0. | Read of the file |

## 2. Findings for integration (the L1 and the C2 counter owner should read these)

- **F1 — Digest novelty cannot be the freshness test (from O2).** Today's real fetches have exactly
  the round-18 digests. If "a sha256 digest of THIS round's fetch" (in the ExecCounterC2Proto spec)
  means "a digest different from earlier rounds", all six honest rows become unresolved. If it means
  only "a digest is present", a forger can copy the round-18 `sha256` and pass. The control
  (O8) is caught only because it uses a non-hex placeholder digest. The counter should bind
  freshness to evidence from this round, such as a retained body whose sha256 equals the claimed
  digest plus a retained response `date:` header dated 2026-10-25 or later, not to digest novelty.
  [INFERENCE: neither the counter nor the receipt exists yet, so this is a design risk, not an
  observed defect.]
- **F2 — Where the "held quote" comes from.** `corpus/SOURCES.md` has no quote column. Its `teaches`
  cells paraphrase, for example S013's "A first-run failure that passes on retry is classed flaky…".
  The verbatim held quote exists only in the round-18 receipt `quote` field. The note and the
  receipt must name that source, or a reader cannot reproduce "quote located".
- **F3 — S020 has a moving anchor, not drift (O4).** This is the same situation as round-18 §4.
  The quote holds, the served revision is newer than the anchor cell, and no superseding row
  follows. This is consistent with SOURCES rule 2 and the round-18 precedent.
- **F4 — Superseding-row id range (O6).** ExecFreshnessReceipt is told to use "S107+", but S107–S249
  are already staged by assimilation. If any row is superseded, its id must come after the last id
  admitted this round (S106 and any assimilation rows), and the id-collision guard decides. Under O3
  no supersession is expected, so this may be moot.
- **F5 — The sample is the same six rows, unchanged since 2026-10-19.** The round-18 `anchorObserved`
  fields already record identical bytes to the 2026-10-19 seat fetches for S013, S015, S016 and S024.
  These pages have not changed for six days, so a 6/6 "holds" result is a weak freshness signal.
  That is a scope point for RevEntryFreshnessScope and CritC2Vacuity, not a defect in the note.

---

## 3. DRAFT NOTE — `corpus/knowledge/source-recheck-round-25.md`

> Everything below this line is the proposed file body. `<…>` marks a value that the owning seat
> must supply. The L1 should replace the placeholders from `ExecFreshnessReceipt` and the committed
> counter output, and should not copy them from this scribe.

```markdown
source: S013 S015 S016 S020 S023 S024 — six on-release rows of `corpus/SOURCES.md`, re-opened for round-25 claim C2; URLs and anchors per row in §3; receipt `corpus/evidence/round-25/freshness/reopened.json` (schema `tabi-source-reopen-v1`)
verified-at: 2026-10-25 — author-side re-open on 2026-10-25 by round-25 wave-1 seats; each row's `fetched_at` is on that date; not independent non-author verification
recheck: 90d — reopen every row this note cites on 2027-01-23 (90 days after verified-at), or sooner when a Playwright stable-docs release or a WebMCP CG-draft revision ships (all six rows' own `recheck` cell is `on-release`, which governs each row)

# Round 25 — source recheck (C2 freshness)

This note records a bounded re-open of six registry rows whose `recheck` cell is `on-release`
(S013, S015, S016, S020, S023, S024) against their live sources, on 2026-10-25. It corrects nothing
in place (SOURCES rule 2). It does not make any knowledge entry true. For each row it records
whether the row's held quote is present in the bytes fetched on 2026-10-25, and what the fetch did
and did not establish. Layout follows `corpus/knowledge/source-recheck-round-18.md`.

## 1. What was rechecked and how

**Scope.** Six rows, frozen before data in `.ufo/waves/round-25/claims.json` (C2). They are a fixed
selection, not a sample of the 80 `on-release` mentions in `corpus/SOURCES.md`
(`grep -c 'on-release' corpus/SOURCES.md` → 80 at 2026-10-25). Five are Playwright stable docs and
one is the WebMCP CG draft.

**Held quote.** For each row, the held quote is the verbatim `quote` field of its round-18 receipt
`corpus/evidence/round-18/source-recheck/<row>.json`. The SOURCES `teaches` cell paraphrases and is
not matched.

**Fetch.** `<PRODUCER: command/argv and producer sha256 from ExecFreshnessReceipt>`. HTTP GET only, to
the row URL. Fetched 2026-10-25 between 12:15:51Z and 12:15:52Z (`<confirm from receipt fetched_at>`).

**Decode and normalize.** `html-text` for all six. The normalizer is the round-18 `normalize()`
(`.ufo/waves/round-18/recheck-fetch.mjs`): NFC, curly quotes folded to ASCII, dashes folded to `-`,
NBSP to space, whitespace collapsed. `<confirm the round-25 producer reuses it, or name its own>`.

**Counter.** `node scripts/check-source-reopen-receipt.mjs --rev <REV> --json` → `{reopened, resolved,
unresolved, supersessions}`. Before: 0 rows re-opened (no receipt at baseline
`9e13666759bcf30665abec84dec13adefc1fa86a`).

## 2. Verdict summary

| Measure | Value | Derived from |
|---|---|---|
| Rows re-opened | `<reopened from counter at REV>` | counter `reopened` |
| Verdict = holds | `<n>` | receipt `verdict` per row |
| Verdict = superseded (drifted/absent + supersession pointer) | `<n>` | receipt `verdict` + pointer |
| Unresolved | `<unresolved from counter at REV>` | counter `unresolved` |
| Could-not-evaluate (fetch failed at measure time) | `<n>` | receipt; killRule: >1 at tip = honest miss |
| HTTP 200 | 6 of 6 (scratch observation; confirm from receipt) | `status` / headers |
| Held quote located (scribe cross-check, not the verdict) | 6 of 6, each at its round-18 `quoteOffset` | round-18 `decodeBody`+`normalize` over 2026-10-25 bytes |
| Body sha256 equal to round-18 receipt | 6 of 6 | `sha256sum` vs round-18 `sha256` |
| Skip-work control `control/skipwork-freshness.json` | `<unresolved=6 expected; value from ExecControlScore>` | frozen counter over the control |

## 3. Rows re-opened: URL, anchor and fetch record

Columns: row; registry status and tier; HTTP status; bytes; sha256 of the 2026-10-25 body (full);
equal to round-18; held-quote normalized offset; verdict; URL; registry anchor cell.

| Row | Status / tier | HTTP | Bytes | sha256 (2026-10-25) | = R18 | Quote offset | Verdict | URL | Anchor (registry cell) |
|---|---|---|---|---|---|---|---|---|---|
| S013 | mined / A | 200 | 99073 | cf48ff4db0a305f9c1a8a829b60c295041e22daa0e018c4286ae182832ffbdfa | yes | 3529 | `<VERDICT>` | https://playwright.dev/docs/test-retries | stable docs served 2026-10-19, §Failures, §Retries |
| S015 | mined / A | 200 | 47845 | 31075410ae19edfe13f6f1cd5ec4d980ee9be0303009f4273563231db610fe8d | yes | 1230 | `<VERDICT>` | https://playwright.dev/docs/actionability | stable docs served 2026-10-19, §Introduction |
| S016 | mined / A | 200 | 159543 | 1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c | yes | 1402 | `<VERDICT>` | https://playwright.dev/docs/test-assertions | stable docs served 2026-10-19, §Auto-retrying assertions |
| S020 | mined / A | 200 | 511987 | 5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40 | yes | 586 | `<VERDICT>` | https://webmachinelearning.github.io/webmcp/ | CG-DRAFT 2026-10-16, revision f14762e6 |
| S023 | mined / A | 200 | 268087 | 234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6 | yes | 4509 | `<VERDICT>` | https://playwright.dev/docs/locators | stable docs read 2026-10-19, §Locate by role |
| S024 | mined / A | 200 | 125426 | bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194 | yes | 4648 | `<VERDICT>` | https://playwright.dev/docs/aria-snapshots | stable docs read 2026-10-19, §Aria snapshots |

Held quotes (round-18 receipt `quote`, verbatim):

- S013: `"flaky" - tests that failed on the first run, but passed when retried`
- S015: `It auto-waits for all the relevant checks to pass and only then performs the requested action.`
- S016: `Playwright also includes web-specific async matchers that will wait until the expected condition is met.`
- S020: `The WebMCP API enables web applications to provide JavaScript-based tools to AI agents.`
- S023: `role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines`
- S024: `aria snapshots provide a YAML representation of the accessibility tree of a page.`

The digests in this table come from the wave-1 scratch fetches. The `ScoutFreshnessReopen`,
`ExecFreshnessReceipt` and `ScribeSOURCESRows` sets are byte-identical per row. The committed
receipt's digests govern: `<confirm equal at REV>`.

## 4. Live rows, and what the fetch can show

- **All six are live URLs** (unversioned Playwright stable docs, plus the WebMCP CG draft on
  GitHub Pages). A digest pins one response only.
- **Bytes unchanged since round 18.** All six 2026-10-25 bodies have the same sha256 as their round-18
  receipts. For S013, S015, S016 and S024 the round-18 `anchorObserved` already recorded identical
  bytes to the 2026-10-19 seat fetch. So "holds" here means the pages did not change between those
  fetches. It is not evidence that a new release was checked.
- **S020 still serves a later revision than its anchor.** On 2026-10-25 the page has
  `meta name=revision 51ed75653aaa7f174f8dbe05d1bc327359bbc57c`, `dt-updated 2026-10-20`, and response
  header `last-modified: Tue, 20 Oct 2026 14:58:56 GMT`. The anchor cell records
  `CG-DRAFT 2026-10-16, revision f14762e6`. The quote is present. As in round-18 §4 this is a moving
  anchor, not drift, and no superseding row is opened for it.

## 5. Drift handling

- **Drift this round:** `<none | list rows; from ExecFreshnessReceipt>`. The scribe cross-check found
  no drift: every held quote is at its round-18 offset.
- **Superseding rows proposed:** `<none | row id, target anchor, teaches opening "supersedes S0NN —", ≤25-word quote from 2026-10-25 bytes; from ExecFreshnessReceipt>`.
  Any new id must come after the last id admitted this round (S106 is C1's; assimilation staged
  S102–S249). The id-collision guard decides, and the id is not fixed in this note.
- **Counting.** A drifted or absent row counts as resolved only with a supersession pointer to a row
  committed in the same round (C2 killRule). A dangling pointer is unresolved.
- **Could-not-evaluate.** A fetch that fails at measure time (network error or non-200) is neither
  resolved nor unresolved. If more than one row is in that state at the tip, the target misses
  honestly.

## 6. Limits

- **Quote presence is not claim truth.** A located quote shows that the normalized quote occurs in
  one normalized 2026-10-25 response. It does not show that the row's `teaches` cell is right.
- **Digest equality is not freshness evidence by itself.** Today's honest digests equal round-18's,
  so a copied round-18 digest would look the same. Freshness rests on `fetched_at`, the retained
  response `date:` header and retained bytes whose sha256 matches, not on the digest alone.
  `<state the binding the committed counter enforces>`.
- **Source-only, no runtime.** No browser was launched for C2. The receipts describe the documents,
  not product behaviour.
- **Normalization is tolerant.** `html-text` strips tags and folds typography, so a match can hide a
  typographic change. The same limit as round-18 §6.
- **Selection.** Six fixed rows. This is not a registry-wide freshness statement and it does not
  promote any axis (claims.json `notClaimed`).
- **Authorship.** Lane seats wrote the fetches and the receipt. Independent re-open (SOURCES rule 1)
  is not claimed.
```

---

## 4. Out of scope and not done

- I didn't run the C2 counter or the skip-work control. Neither the counter nor the
  prototype exists yet (O7, §0), and scoring the control belongs to ExecControlScore.
- I didn't fetch anything over the network. All bytes come from peer scratch.
- I didn't propose any superseding row. No seat has proposed one, and O3 gives no reason to.
- I didn't edit `corpus/knowledge/source-recheck-round-25.md`. The note above is a draft for the L1
  to land.

## 5. Artifact paths

- This report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/w1/ScribeEntryFreshness.md`
- Bytes used: `.ufo/waves/round-25/scratch/ScoutFreshnessReopen/`, `.ufo/waves/round-25/scratch/ExecFreshnessReceipt/bytes/`, `.ufo/waves/round-25/scratch/ScribeSOURCESRows/`
- Round-18 receipts used: `corpus/evidence/round-18/source-recheck/{S013,S015,S016,S020,S023,S024}.json`
