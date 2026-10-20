VERDICT: ISSUES

# W2 / LiveS029 — C1 receipt S029 attack (immutable own-work recheck)

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only). Baseline B `2bff864fdfee684ddbcd066cc8e735adaba2735c`; measured candidate REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (lane tip, `git rev-parse refs/heads/master`). No LANE writes except this report; no git writes; no subagent dispatch; no browser; no network egress.

Mechanical reproduction of `corpus/evidence/round-18/source-recheck/S029.json` is **held**. The semantic `teachesVerdict: held` is **not** supported as written: the receipt's own note and the S029 row's `teaches` cell reproduce the "inverted cleanup-summary proposition" that `corpus/lessons/round-13-verifier-spotcheck.md:100,:158` routed and `corpus/evidence/round-14/aria-metadata/corrected.json` corrected, and the round-18 receipt neither cites that correction nor opens a superseding row. A separate, lower-severity presentation issue: the C1 count of 51 includes one immutable own-work row while the claim sentence says "live source" (disclosed in the lesson/note, not in the metric label).

## 1. Independent fetch / body identity (observed)

S029 is own-work; per the assignment I used the receipt's recorded command, not curl (its `url`/`rowUrl` is a repo path, `httpStatus` is `null` by design; a curl of a repo path would be meaningless).

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json > /tmp/r18-s029-LiveS029/receipt.json
exit=0
$ sha256sum /tmp/r18-s029-LiveS029/receipt.json
b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  /tmp/r18-s029-LiveS029/receipt.json
$ wc -c < /tmp/r18-s029-LiveS029/receipt.json
97073
$ git rev-parse 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json
eea79f8af447c043c1b2f3d7f75af0588faca55a
```

- Body bytes: **97073**; SHA-256: **b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7**; git blob `eea79f8af447c043c1b2f3d7f75af0588faca55a`.
- HTTP status: **none / null** (git object, no network).
- `decode`: `none` (receipt value, correct; body is JSON text).
- Receipt comparison: `bytes` (S029.json:9) and `sha256` (:10) match exactly.
- Raw-body equality applies and holds: S029 is an immutable git object, so the dynamic-page exemption is not applicable. Same digest at `837b33a`, B `2bff864`, and REV `530f40a9`:

```
$ for c in 837b33a3988ebeea7f6b4ef5c04698da88909a73 2bff864fdfee684ddbcd066cc8e735adaba2735c 530f40a9bc3f10436161a2af1ca0fe9bffffc004; do git show "$c":corpus/evidence/round-13/aria/receipt.json | sha256sum; done
b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
```

## 2. Quote location and anchor (observed)

- Receipt quote (S029.json:13), 17 words (`:14`; independently split: 17).
- Location in body: JSON paths `cleanup.server.listeningAfter` and `cleanup.server.perWorker[0].listeningAfter`; lines **2521–2529** of the pretty-printed blob; first token `"listeningAfter": true` at line 2521.
- Offsets: raw byte **94775**, raw character **94765**, normalized character **74695**. Receipt `quoteOffset: 74695` is the normalized-character offset, and the producer reproduces it exactly:

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode none \
    --body /tmp/r18-s029-LiveS029/receipt.json \
    --quote "$(jq -r .quote corpus/evidence/round-18/source-recheck/S029.json)"
{"found":true,"offset":74695,"normalizedLength":76376,...}   exit=0
```

The chosen quote is **unique** in the normalized body (1 occurrence). Note the quote is not contiguous in raw bytes (raw `indexOf` = −1) because JSON pretty-printing puts newlines/indentation inside the span; the schema defines "verbatim" after the recorded normalizer, so this is consistent, but any independent verifier must apply the same normalizer.
- `quoteFound: true`; `quoteWords` 17 = observed; excerpt file `S029.excerpt.txt` is exactly the producer's `normalize(body).slice(offset−600, offset+quoteLen+600)+"\n"`; reconstructed SHA-256 **80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff** equals `excerptSha256` and the committed excerpt blob (`git show REV:...excerpt.txt` → same digest; 1382 B).
- Receipt blob at REV: `d01f6c970416024f6ea156229015e806e84bd364538165b914b833c73fd7b860` (worktree identical).
- Producer digest: `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` equals `.ufo/waves/round-18/recheck-fetch.mjs` at REV.

Original quote source (round-14 opening, not the round-18 quote): `corpus/lessons/round-14.md:19` records location `cleanup.server.perWorker[0].listeningAfter` and quote `"listeningAfter": false`; `corpus/lessons/round-15.md:18` adds "line2529". Observed: line 2529 is exactly `          "listeningAfter": false,` under `cleanup.server.perWorker[0]`. Caveat: the bare 2-word string first occurs earlier (normalized offset 17698, under the worker `proof` object), so the line/path is what disambiguates; the round-18 17-word quote avoids that ambiguity (unique).

## 3. Source identity, anchor and teaches

| Facet | Verdict | Evidence |
|---|---|---|
| Source identity | **held** | Commit `837b33a…` exists; blob `eea79f8…`; SHA-256 identical at B and REV; receipt `sha256`/`bytes` match. |
| `anchorObserved` ("byte-identical at lane tip 2bff864…") | **held** | Commit times: B `2026-10-20T15:35:44-03:00` = 18:35:44Z; receipt `fetchedAt` `2026-10-20T19:06:54.809Z`; REV `2026-10-20T16:58:00-03:00` = 19:58:00Z. B was the lane tip at production, and the blob is still identical at REV. |
| Anchor paths | **held** | `cleanup.server.perWorker[0].listeningAfter=false` (line 2529), `runtime.node=26.12.0` (line 19–20), `pin.node.recorded=24.21.0`, `minimumMajor=20` (line 48). |
| `teaches` | **not held as written** (literal field values present; taught contrast is the lane-corrected inverted proposition) | See F1. |
| Unreachable | no | Own-work git object read at the pinned commit. |

`rowUrl` occurs verbatim in the S029 `source` cell at REV (`corpus/SOURCES.md:43`), satisfying `measure-c1.mjs:343`; the counter accepts the receipt (`rejected: []`).

## 4. Findings

### F1 (primary) — the quote supports the literal field bytes, not the taught contrast; the `held` verdict re-asserts the routed inverted cleanup summary

Observed:
- S029 `teaches` at REV (`corpus/SOURCES.md:43`): "The retained worker records listeningAfter=false while the aggregate says true; observed Node26.12.0 differs from descriptive recorded24.21.0". That phrase was introduced at `4a300f6` (round 14) and is unchanged (`git log -S` shows only that one commit; `grep -c 'supersedes S029'` at REV = **0**).
- The same pinned commit's producer defines the aggregate as the all-not-listening predicate: `scripts/aria-loopback-round13.mjs:605` (identical at REV): `listeningAfter: serverProofs.length > 0 ? serverProofs.every((proof) => proof.listeningAfter === false) : null`. So `cleanup.server.listeningAfter=true` means "all workers not listening after"; it is the success predicate, not a competing observation that the server was still listening.
- The lane's own review already says this: `corpus/lessons/round-13-verifier-spotcheck.md:100` — "The aggregate field `cleanup.server.listeningAfter=true` is inverted by runner605 and is a routed metadata defect, not evidence of a still-listening server"; `:152` — "not conformant for the retained contradictory cleanup-summary field"; `:158` routed item 1 asks for corrected field semantics in new evidence.
- The correction is committed: `corpus/evidence/round-14/aria-metadata/corrected.json` (SHA-256 `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745`, byte-identical at REV; verification measured revision `e570380…`, ancestor of REV) sets `derivedListeningAfter:false` (:20), rule "raw post-close state is true iff any complete nonempty perWorker proof reports listeningAfter===true; false only when every proof reports false" (:30,:38), and correction `from:true` (:36) → `to:false` (:40).
- `corpus/lessons/round-14.md:39` classifies exactly this as `number-drift — inverted cleanup-summary proposition` and says "checker rejects original contradiction and accepts only digest-bound corrected metadata."
- The round-18 receipt nevertheless records `teachesVerdict: "held"` (S029.json:21) and its note (:22): "Held: cleanup.server.perWorker[0].listeningAfter=false while cleanup.server.listeningAfter=true; runtime.node=26.12.0 vs pin.node.recorded=24.21.0 (minimumMajor=20)." It never mentions `corrected.json`/any-listening semantics (`grep -ci 'correct\|invert\|any-listening' S029.json` → **0**).

Finite counterexample: take the receipt's own quote at normalized offset 74695 (lines 2521–2529). Read with `scripts/aria-loopback-round13.mjs:605`, the two values are **consistent** (`every(proof.listeningAfter === false)` is true), whereas the row/receipt's "while the aggregate says true" presentation is the inverted proposition that was routed as a defect. The quote therefore proves byte presence and uniqueness, not the taught meaning; `held` is a semantic over-claim. Under the C1 gate (`corpus/lessons/round-18.md:12-16`), a no-longer-supportable row claim is the drift path, which requires a superseding row — none exists.

Mitigating observation: the row's scope is "exact recorded" fields, and `corpus/knowledge/source-recheck-round-18.md:147` says the values "are quoted as they are". The defect is the uncorrected contrast + `held` verdict, not a false byte claim. The mechanical counter does not evaluate teaches truth (`measure-c1.mjs:343,371` check only S029 path/digest/offset/excerpt), so `c1_rows_rechecked` is unaffected.

### F2 (bounded) — the receipt's quote/excerpt evidence only half of the two-part `teaches`

`teaches` has two components. The Node-metadata half is at normalized offsets 784 (`"node": "26.12.0"`, line 19–20) and 2039 (`"recorded": "24.21.0"`, line 48), i.e. **73,911** and **72,656** normalized characters before the quote at 74695. The producer's excerpt window is ±600 around the quote, so it cannot contain either field: reconstructed excerpt contains no `runtime.node`, `pin.node`, `26.12.0` or `24.21.0` (verified by exact reconstruction, F2 digest above). The values are true in the body and are carried in the free-text `note` (:22), not in the receipt's quote/excerpt artifacts. This is a coverage limit of the one-quote schema, not a false statement, but "quote supports teaches" holds for the cleanup half only.

### F3 (lower severity) — immutable availability vs live freshness in the headline metric

- `PLAN.md:15` states C1 as "Source rows re-verified against their **live source** with a committed recheck receipt: 0 → N (target 51 …)".
- Counter at REV (exit 0): `c1_rows_rechecked: 51`, `held: 50`, `own_work: 1`, `drift_superseded: 0`, `eligible_rows: 58`, `rejected: []`. `held` explicitly excludes own-work (`measure-c1.mjs:467`), but `c1_rows_rechecked` counts all accepted receipts (`:472`). So the 51 includes exactly one row with no live source, and S029 cannot demonstrate freshness or drift: the round-13 receipt was generated `2026-10-20T05:42:38.729Z` and the round-18 "recheck" ran `2026-10-20T19:06:54.809Z` — a 13h24m same-day re-read of an immutable artifact.
- Disclosed: `corpus/lessons/round-18.md:14` "Own-work S029 is explicitly hygiene, not live freshness"; `corpus/knowledge/source-recheck-round-18.md:15,:147` (own-work is a git blob, not network; hygiene, not a new observation). No hidden claim of live product support was found. The headline should read 50 live + 1 own-work, not 51 live re-verifications.
- Denominator nuance at REV: `eligible_rows: 58` = 64 rows at REV − the counter's 6 superseded (`measure-c1.mjs:15`; S057 is **not** in that set although S058 supersedes it, and S058–S064 are seven rows opened this round). The 51 is exactly B's declared target set, so this is not a missing-receipt claim, but 51 should not be read as "all rows eligible at REV".

## 5. Mechanical receipt comparison (all observed by reading the pinned blob)

| Field | Receipt | Observed | Result |
|---|---|---|---|
| schema / row / rowUrl / url | `tabi-source-recheck-v1` / S029 / `corpus/evidence/round-13/aria/receipt.json` | same; rowUrl in SOURCES.md:43 source cell | match |
| fetchedAt | `2026-10-20T19:06:54.809Z` | 2026-10-20 (UTC) | match |
| httpStatus | `null` | own-work git object | match |
| bytes / sha256 | 97073 / `b458b351…89b7` | 97073 / `b458b351…89b7` | match |
| decode / normalizer | none / NFC+fold+whitespace | body JSON text; producer normalize-only finds quote | match |
| quote / quoteWords / quoteFound | 17 words / true | 17 words, unique, normalized offset 74695 | match |
| excerpt / excerptSha256 | `S029.excerpt.txt` / `80b5de21…96ff` | exact producer-derived excerpt, same digest | match |
| anchorObserved | commit 837b33a; sha b458…; byte-identical at B | verified at 837b33a, B and REV | match |
| teachesVerdict / note | `held` / inverted-summary comparison | producer semantics contradict the contrast; correction uncited | **F1** |
| producerSha256 | `f2ba0033…a360` | sha256 of `.ufo/waves/round-18/recheck-fetch.mjs` at REV | match |

Counter (committed-input, no `--live`):

```
$ node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004 > /tmp/r18-s029-LiveS029/c1.out; echo exit=$?
exit=0
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

`counterSha256` equals the REV blob and the worktree file (`df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`). The S029 special case pins `S029_SOURCE_REV`/`S029_SOURCE_SHA256` (`measure-c1.mjs:16,18`), i.e. a code constant rather than an external witness; it agrees with the immutable commit, but it does not add independent authority.

## 6. What this attack did not do (unrun checks are not passes)

- No network fetch: S029 is own-work; no curl was run. S029's live behavior, product support and "freshness" were not measured and are not claimed.
- No rerun of the round-13 producer; no browser; no runtime observation; the `runtime.node=26.12.0` value is historical and read-only.
- No non-author adjudication; this is author-side falsification with committed inputs only.
- `--live` on the counter was not run (it would re-fetch 50 HTTP rows; outside this one-receipt assignment).
- No `recheck-fetch.mjs` receipt-writing run was performed; only the read-only `--normalize-only` probe (its own usage: "writes nothing"). All git commands were read-only (`show`, `rev-parse`, `merge-base --is-ancestor`, `log -S`). Scratch only under `/tmp/r18-s029-LiveS029/`.

## 7. Recommendation to the integrator (repair scope is main's; not applied here)

1. S029 must not stand as `held` without qualification: either mark it a bounded own-work hygiene receipt whose `note` cites `corpus/evidence/round-14/aria-metadata/corrected.json` and states the raw aggregate is the all-not-listening predicate (not a contradiction), or open a superseding row with corrected `teaches` and cite it from the S029 row.
2. Restate C1's headline as 50 live-source held + 1 own-work (51 receipts), and keep the own-work/hygiene disclaimer adjacent to the number.
3. If a single receipt is expected to evidence a two-part `teaches`, add body offsets and digests for the Node fields (lines 19–20 and 48) to the note; the ±600 excerpt cannot contain them.

Files written (absolute):
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS029.md
- /tmp/r18-s029-LiveS029/receipt.json (read-only extracted body)
- /tmp/r18-s029-LiveS029/c1.out (counter stdout)
- /tmp/r18-s029-LiveS029/c1.err (empty)
