VERDICT: ISSUES

# C1 / S052 — independent re-open (TabiR18.LiveS052-2)

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Baseline B: `2bff864fdfee684ddbcd066cc8e735adaba2735c`
Measured candidate REV: `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (at read time `refs/heads/master` = `HEAD` = this value)
Probe date: 2026-10-20 (live fetch at `2026-10-20T20:04:31Z`)
Producer: `.ufo/waves/round-18/recheck-fetch.mjs`, sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (matches receipt)
Tools installed/updated: none; no installation was needed.

Axes attacked (kept distinct): **A** fetch/byte reproducibility; **B** anchor identity (tag object, manual
version marker, source line); **C** does the quote support `teaches`; **D** claim scope (document
availability vs live product freshness); **E** what the receipt contract actually machine-binds.

## Result

The S052 **data** is fully reproducible and held: the live body is byte-identical to the receipt, the
13-word quote is present exactly once at the receipt's offset, the committed excerpt is a byte-exact
derivation of that body, and the anchor (manual `2.56.0`, tag object ids, raw adoc) is exact.

The **claim** is not fully held: the row's `teaches` has two conjuncts, the quote binds only the second,
the first conjunct sits outside the committed excerpt and is only asserted in the receipt's prose
`note`, and the trailing clause “not a branch” is stated nowhere in the cited anchor (and is false
under the attached-HEAD reading). The receipt's `teachesVerdict: held` therefore covers more than its
committed bytes show. Separately, every HTTP receipt's `command` string is not shell-replayable.

The freshness metric itself is honestly scoped: `corpus/knowledge/source-recheck-round-18.md:7,140-141,148-149`
and `.ufo/waves/round-18/PLAN.md:67-69` explicitly deny that quote presence establishes claim truth or
product behaviour, so the main claim does **not** confuse availability with live product freshness —
the overreach is in the row's `teaches` and in the field name `teachesVerdict`.

## 1. Receipt vs live fetch

Producer argv used (from `.ufo/waves/round-18/recheck-fetch.mjs:95`; the receipt's `command` string is
this argv joined without shell quoting, see §6):

```
UA='Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18'
curl -sSL --compressed --max-time 90 -A "$UA" -o body1 -w '%{http_code}' 'https://git-scm.com/docs/git-rev-parse'
```

Observed (two independent fetches, ~1 min apart; `cmp` exit 0, `IDENTICAL`):

| field | receipt | observed |
|---|---|---|
| `httpStatus` | 200 | 200 |
| `bytes` | 122459 | 122459 (`wc -c`) |
| `sha256` | `1e84fc200220b2cd356b78f2344766ee7cbaafa8bcef64679dbf47ec585f19da` | **same full 64-hex** |
| redirects / effective URL | not recorded | 0 redirects; effective `https://git-scm.com/docs/git-rev-parse` |
| content type | not recorded | `text/html; charset=utf-8`; transfer size 20723 B compressed, 122459 B decoded |
| `fetchedAt` | `2026-10-20T19:05:53.104Z` | re-fetched `2026-10-20T20:04:31Z`, same UTC day |
| `producerSha256` | `f2ba00…a360` | `sha256sum` of the file = `f2ba00…a360` |

Alternative rendering for the same identity (not a replacement): `https://git-scm.com/docs/git-rev-parse/2.56.0`
→ HTTP 200, 122330 B, sha256 `1bceac2fd808774488e18fb46c33feee0ada562e80a04ecf37b9b6e58b241df4`, and it
contains the same sentence. It differs in bytes from the unversioned page (version banner), as expected.

No drift and no unreachability: identity, bytes and anchor all held on 2026-10-20.

## 2. Quote location and excerpt derivability

Decode/normalize were run by importing the producer's own exported `decodeBody`/`normalize` read-only
(no receipt was written, no producer `main()` path was executed):

```
node probe.mjs   # imports decodeBody, normalize from .ufo/waves/round-18/recheck-fetch.mjs
{"normalizedLength":33929,"quoteOffset":33561,"quoteFound":true,"quoteWords":13}
{"occurrences":1,"offsets":[33561]}
```

- `quoteOffset` **33561** equals the receipt field exactly; the quote occurs **once** in the normalized body.
- `quoteWords` 13 equals `split(/\s+/)` on the quote.
- Excerpt window is `[32961, 34222)` of the normalized text. `derive.mjs` re-derived
  `normalize(text).slice(at-600, at+len+600) + "\n"`:
  - derived bytes **969**, sha256 `a32bc6bd7368e6a82957190b86ed939b4c4e0879804474c191fbbdc378d42db5`
  - committed `corpus/evidence/round-18/source-recheck/S052.excerpt.txt` bytes 969, **byte-equal** (`equal:true`)
  - `excerptSha256` in the receipt equals the committed file digest.
- This derivation is **stronger than the committed counter performs for non-S029 rows**:
  `measure-c1.mjs:362-376` re-derives the excerpt only for S029; for every other row it only compares
  the committed excerpt's sha and substring (`:368-369`). I supplied the missing derivation for S052.

## 3. Anchor identity

| claim | observed |
|---|---|
| page marker `last updated in 2.56.0` | present, normalized offset 1658, exact string |
| version table `2.56.0 2026-09-28` | present, exact string |
| tag object `2478544319491bbd2a42cc57a83e3d2f4730a280` peels to `a018953688f1b10bddf91bff8747068f5f4746a4` | `git ls-remote https://github.com/git/git 'refs/tags/v2.56.0*'` → exactly those two lines (`v2.56.0`, `v2.56.0^{}`) |
| raw `Documentation/git-rev-parse.adoc` at v2.56.0 | 17036 B, sha256 `4d8e9aca13f6ea6808272eb44e417687a5cca7d23cf1ed311f25e9fdeb148902` |
| raw `Documentation/revisions.adoc` at v2.56.0 | 17266 B, sha256 `b23a9eb17d9b193adccee6b79cb1c1fef450703dae925a33b8a1c6f6639d82ff` |
| quote in raw adoc | `git-rev-parse.adoc:505` (verbatim, no markup escaping) |
| HEAD definition in raw adoc | `revisions.adoc:50-51` |
| latest v2.x.y release tag | `git ls-remote --tags` tail: `v2.51.2 v2.52.0 v2.53.0 v2.54.0 v2.55.0 v2.56.0` |
| host binary | `git version 2.56.0` |

Both raw digests match the values recorded in `.ufo/waves/round-17/sources/JjColocation.md:79-82` and
`corpus/lessons/round-17.md:64`, so the pinned files are unchanged, and the live page's manual marker
matches the pinned tag. On this date the document is also current for both the latest release and the
host binary, so the availability-vs-live-product question resolves **held**, not drifted.

### Anchor line-number drift (minor)

- The quote is at **line 505** of `git-rev-parse.adoc` at v2.56.0.
- `corpus/lessons/round-17.md:64` and `.ufo/waves/round-17/sources/JjColocation.md:83` say **504** (off by one).
- The registry row at `corpus/SOURCES.md:66` cites the range **498-505**, which does contain line 505 — the row is correct.
- The receipt's `quoteSource` is `corpus/lessons/round-17.md:64`; that line does contain the quote text,
  so the receipt contract is not violated. This is a frozen-lesson residual, recorded not repaired.

## 4. Does the quote support `teaches`?

Row `corpus/SOURCES.md:66` teaches: “HEAD names the commit the working tree is based on, **not a
branch**, and rev-parse --verify --end-of-options errors on empty or invalid revisions.”

- **Conjunct 2 (quoted, supported).** The quote is the sentence immediately after the
  `git rev-parse --verify --end-of-options $REV^{commit}` example (adoc 499-505). Behavioural probe on
  host git 2.56.0 in a private `/tmp` repo:
  - `git rev-parse --verify --end-of-options ""` → `fatal: Needed a single revision`, exit **128**
  - `git rev-parse --verify --end-of-options "^{commit}"` → same, exit **128**
  - `git rev-parse --verify --end-of-options "nope^{commit}"` → same, exit **128**
  - `git rev-parse --verify --end-of-options "HEAD^{commit}"` → `37b00b2f…`, exit **0**
  So the generalization without `^{commit}` still holds on the host binary.
- **Conjunct 1 (present in body, not in the receipt's bytes).** The sentence
  `HEAD names the commit on which you based the changes in the working tree` is at normalized offset
  **16317** of the same 122459-byte body — outside the committed excerpt window `[32961,34222)`.
  The receipt's `note` asserts it; `anchorObserved` does not. `measure-c1.mjs:315-377` never reads
  `note` or `anchorObserved`, and its own fixture receipts (`:588-610`) omit both fields while the
  `honest receipt` case (`:713`) still counts 1. A reader with only `S052.json` + `S052.excerpt.txt`
  cannot verify conjunct 1; I had to re-fetch. Verdict is true in fact, but unbound by committed evidence.
- **The “not a branch” clause is not in the source.** Zero occurrences of `not a branch` in the
  122459-byte body; `revisions.adoc:26-27` calls a `<refname>` “A symbolic ref name”, and
  `revisions.adoc:50-51` only says HEAD names the commit. In an attached-HEAD repo on host git 2.56.0:
  `git symbolic-ref HEAD` → `refs/heads/master`, `git rev-parse --abbrev-ref HEAD` → `master`.
  Under the reading “HEAD is a symbolic ref, not itself a branch ref” the clause is true; under
  “HEAD does not name a branch” it is false. The cited anchor states neither, so `held` covers an
  unsupported, ambiguous gloss.

## 5. Claim scope — availability vs live product freshness

- The committed text does **not** confuse them. `corpus/knowledge/source-recheck-round-18.md:140`
  says “Quote presence is not claim truth… does not show that the row's `teaches` claim is correct,
  that the quote supports it”; `:141` says the receipts “say nothing about how any product behaves”;
  `:148` says the producer does not re-run the `command`. `.ufo/waves/round-18/PLAN.md:67-69` defines
  the receipt as an integrity-checked record, and `PLAN.md:15` says the counter is not product support.
- What S052's receipt establishes: on 2026-10-20 the docs site served the same manual bytes as round 17,
  with the quote, the two source definitions, and the 2.56.0 marker. That is document availability and
  stability, not a runtime check. The `git rev-parse` behaviour corroboration in §4 is **my** probe, not
  the receipt's.
- Residual naming tension: the field is `teachesVerdict: held`, while the note says the receipt does
  not establish the teaches. For S052 the difference is exactly the “not a branch” clause.

## 6. Producer/counter defect — `command` is not shell-replayable (all HTTP receipts)

- Producer builds the display string at `.ufo/waves/round-18/recheck-fetch.mjs:98` by
  `argv.slice(0,-1).join(' ')` — no quoting. The `-A` value contains spaces and `(`/`)`.
- Exact replay of `S052.json`'s `command`:

```
bash -c "curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o x -w %{http_code} 'https://git-scm.com/docs/git-rev-parse'"
bash: -c: line 1: syntax error near unexpected token `('
exact_exit=2
ls: cannot access 'x': No such file or directory
```

- The counter re-derives the same unquoted string (`measure-c1.mjs:233-236`) and enforces equality
  (`:356`), so it cannot detect the ambiguity; the receipt passes by construction.
- Scope: every HTTP receipt (50 of 51; S029 uses the separate `git show` body path).
- The true argv is still recoverable from `recheck-fetch.mjs:95`, and I reproduced the fetch with it.
  This is a fidelity defect in the recorded reproduction recipe, not a falsification of the bytes.

## 7. Counter run and denominator

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Observed: `c1_rows_rechecked` **51**, `eligible_rows` **58**, `held` **50**, `drift_superseded` **0**,
`own_work` **1**, `rejected` `[]`, `live` `null`, `counterSha256`
`df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`.

- 58 = 64 registry rows at REV (57 at B + S058–S064) − 6 superseded. The 7 new rows have no recheck
  receipts (they are new this round, not rechecked).
- C1's declared target is **51 = every row not superseded at B** (`PLAN.md:15-17`), so 51 is correct
  against its target. But 51/58 is the revision-relative ratio; it must not be reported as
  “all eligible rows”, and the note §2 table (`:42`) reports the counter only at B (51/0), not at REV.

## 8. S029 secondary check (non-HTTP boundary named by the assignment)

Read from git, no network:

```
git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json | sha256sum
b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
... | wc -c  → 97073
```

Matches `S029.json` `sha256` and `bytes`. `jq` on the pinned blob:
`{"server_listeningAfter":true,"perWorker0_listeningAfter":false,"perWorker0_origin":"http://127.0.0.1:40983","runtime_node":"26.12.0","pin_node":{"recorded":"24.21.0","minimumMajor":20}}`
— exactly the note's claim (per-worker closed, parent still listening; runtime vs pin recorded).
`sha256sum corpus/evidence/round-18/source-recheck/S029.excerpt.txt` =
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` = receipt `excerptSha256`.
No defect found in the non-HTTP path; its `command` is a real `git -C <lane> show …` invocation.

## 9. Findings (path:line)

- **F1 — committed bytes bind only half of `teaches`.** Receipt quote/excerpt cover conjunct 2 only;
  the HEAD sentence is at body offset 16317, outside excerpt `[32961,34222)`. Counter never reads
  `note`/`anchorObserved` (`measure-c1.mjs:315-377`; fixture `:588-610`; case `:713`).
  Counterexample: a receipt with the same quote/excerpt and no `anchorObserved`/`note` still counts.
  Observed verdict true; binding gap.
- **F2 — `teaches` clause “not a branch” is unsupported by the cited source and ambiguous.** Body has
  0 occurrences; `revisions.adoc:26-27,50-51` state only the commit meaning; attached HEAD
  `git symbolic-ref HEAD` → `refs/heads/master`. `held` covers the gloss.
- **F3 — receipt `command` is not replayable.** `recheck-fetch.mjs:98` unquoted argv join;
  `S052.json` command exits 2 at `(` under bash and creates no output. Counter duplicates the join
  (`measure-c1.mjs:233-236,356`), so it cannot flag it. 50 HTTP receipts affected.
- **F4 — REV denominator is 58, not 51.** `c1_rows_rechecked` 51 / `eligible_rows` 58; C1's target is
  the B set (51), but the revision-relative ratio must not be cited as all-eligible.
- **F5 — line-number drift in the frozen record.** adoc quote at 505; `corpus/lessons/round-17.md:64`
  and `.ufo/waves/round-17/sources/JjColocation.md:83` say 504. `corpus/SOURCES.md:66` range 498-505 is
  correct. Not a receipt failure.
- **F6 — no availability/freshness conflation in the committed claim text**, but the
  `teachesVerdict` field name implies a claim-truth judgment the note disclaims
  (`corpus/knowledge/source-recheck-round-18.md:140-141`). This is the boundary the scalar must not cross.

Held (positive) findings: body sha/bytes/status; quote offset/uniqueness/word count; excerpt byte
derivation; `2.56.0`/`2026-09-28` markers; tag object ids; raw adoc digests; host git 2.56.0 behaviour;
latest release tag v2.56.0; version-specific rendering contains the quote; S029 pinned blob.

## 10. Finite limits

- One URL and one row. Two live fetches only; no CDN-edge or second-network comparison. The page is a
  living URL; the digest pins one snapshot, and identity held today, not indefinitely.
- I did not run `measure-c1.mjs --live` for the other 50 rows (broad network sweep) and did not run
  `recheck-fetch.mjs`'s receipt path at all. Only its exported `decodeBody`/`normalize` were imported
  read-only for independent decoding; nothing was written by the producer.
- `rev-parse`/`symbolic-ref` probes ran in a fresh `/tmp` repo on host git 2.56.0, not in LANE, and
  are not a WebMCP or browser observation.
- Raw-adoc line numbers are from GitHub's v2.56.0 tag; the rendered page is generated from the same
  tag (its marker and text match), but the raw tag is the authoritative pin.
- The `command` replay defect was demonstrated on S052 only and inferred for the other HTTP receipts
  from the shared producer line; no per-row replay was attempted. `/tmp/tabi-s052` was removed after
  the probes; every command needed to regenerate the evidence is in §1–§3 and §8.

## Files written

/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS052.md
