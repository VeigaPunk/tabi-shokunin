# CritC2Surface — C2's axis and surface naming (round 30, w2, falsify)

**Verdict.** I attacked the coverage claim's surface: (a) whether marking frontier row
`corpus/README.md:182` "Rate/ToS surface for site-interaction records" as `docs-held` at
`:651` is credit for ground the lane did not hold, (b) whether the appended Round 30
README section (commit 072af95, `:632-652`) is accurate and append-only, and (c) whether the
two entries duplicate S107's `Retry-After` ground. **The core holds**: at baseline
`f7c0317` the lane held *zero* rate-signal vocabulary (baseline `git grep` for
`x-ratelimit|ratelimit-policy|RateLimit-|6585|discord|quota` outside `.ufo/waves` returns only
three incidental "quota" lines about wave death quotas and a hex digest containing `6585`), so
the two entries do add un-held documented ground; the README change is pure addition (0
deleted lines baseline→tip) and every one of its factual cells re-locates in the fetched
bytes; the two entries do not re-sell S107 (S107 is §15.4 + §10.2.3 only — `Retry-After` on
3xx/503 — and the appended restatement attributes the `Retry-After` shape to S107 rather than
claiming it); all 36 ≥4-word quoted spans of the two entries locate in their committed receipt
bytes; and the frozen counter, run by me in a clean `--shared` clone at tip, reports
population 2 / admitted 2 with and without `--live`. **Three low-severity defects survive,
all in the labelling/attribution layer, none in the ground**: the `docs-held` token is applied
to a *conjunctive* "Rate/ToS" item while only the rate half moved (F1); the S116 `ground:`
header points the 429/403 status class at a note that holds neither 429 nor 403 (F2); the
lesson Gate's line span for S116 names one line more than its quote occupies (F3). One
instrument bound: the counter's population is the `frontier: <slug>` header alone — it never
reads README (F4), so novelty of ground is reading-verified here, not counter-verified.

## 1. What I attacked, and the answer

| Question | Answer | Evidence |
|---|---|---|
| Did the lane already hold the documented quota vocabulary? | **No.** Baseline has no `RateLimit-Policy`, `RateLimit`, `X-RateLimit-*`, RFC 6585, Discord or quota-vocabulary ground. The only prior rate ground is instrumental: loopback `429/403` stop rule (`SKILL.md:329`, `external-class-fixture-v2.md:85` `STATUS_TRIP = [429, 403]`) and `Retry-After` on 3xx/503 (S107). | `git grep -n -i -E 'x-ratelimit\|ratelimit-policy\|RateLimit-\|6585\|discord\|\bquota\b' f7c0317 -- '*.md' '*.json' '*.mjs' \| grep -v '.ufo/waves/'` → 5 hits, all incidental (`LOG.md:1123` "weekly quota", `SCORECARD.md:971` "row quota", `browser-surface-census.md:243` digest substring, two lesson "quota" lines). No vocabulary hit. |
| Is `docs-held` a coverage move (§9 "frontier → core")? | **Yes for the rate half; the ToS half gains nothing** (F1). | Entries carry only rate vocabulary; the item title is "Rate/ToS". |
| Does the claim name the surface it moves? | **Yes.** `claims.json` C2 surface names the item *and* the narrowed surface ("the documented rate-limit signal vocabulary a journey records against (RateLimit / RateLimit-Policy fields; one real host's published X-RateLimit-* header set)"), and the delivered rows are exactly those two. | `claims.json` `claims[1].surface`; `README.md:638-639`. |
| Is the appended README section append-only? | **Yes.** Only commit 072af95 touches README this round; baseline→tip diff has **0** non-additive lines; the new block is `:632-652` after EOF `:631`. | `git log --oneline f7c0317..072af95 -- corpus/README.md` → 1 commit; `git diff f7c0317 072af95 -- corpus/README.md \| grep -c '^-[^-]'` → `0`. |
| Do the two entries duplicate S107? | **No.** S107's scope is `§15.4, §15.4.2-15.4.4, §15.4.8-15.4.9, §10.2.3`, `Retry-After` on 3xx (minimum wait) and 503 (outage bound); it contains **no** 429 or 403 sentence (`grep -n '429\|403' corpus/knowledge/redirect-and-retry-after-semantics.md` → 0 hits; only `:44` 503). New ground: the draft's two fields and their stability split, `Retry-After` *precedence* over `RateLimit`, the `t` reset→window change, and one host's header set. The restatement attributes the `Retry-After` shape to S107 explicitly (`README.md:643-644`), so no double credit. | Read of S107 header + `:38-45`; `grep -c '^429' ...`; entry quotes. |
| Is the README row accurate? | **Yes on every checkable cell.** `q`, `qu` (default `requests`, `-11:340-346`), `w`, `pk` (`-11:325-420`); `r` REQUIRED, `t` OPTIONAL effective window (`-11:464`); "SHOULD remain consistent" / "MAY change on every request" (`-11:308-311`); no status implication (`-11` "A server MAY return RateLimit header fields independently of the response status code"); `Retry-After` precedence (`-11:733-735`); Internet-Draft, expiry 24 Nov 2026 (**Observed**: `-09/-10/-11` all HTTP 200, `-12` HTTP 404); `t` changed meaning (`-10:479` "4.1.2. Reset Parameter" vs `-11:488` "4.1.2. Effective Window Parameter"; `-10:720` "the reset parameter MAY be ignored" vs `-11:734` "the effective window MAY be ignored"). Discord row: all seven headers, per-guild emoji caveat, global 50 rps, `Interaction endpoints are not bound to the bot’s Global Rate Limit`, invalid-request cap, shape-only capture rule — all located in the committed bytes. | Fetches §4; `norm-compare.txt`; `quote-locate.txt`. |
| Are the receipts real and independent? | **Yes.** `S116.json` sha256 `d6016dd0…d412` = my independent `-11` fetch byte-for-byte (67097 B); `S117.json` sha is per-response raw (408912 B; my fetch `e4a217cc…`, committed `b73dc7d1…`) but the **normalised** body is identical across three independent fetches (mine, committed, refetch): 8728 chars, sha256 `c719ecca…` — so `l3-live-bytes` holds, not just `l1`. Refetch seat names differ from `fetched_by` in both receipts. Rows are `mined`, `opened 2026-10-26`, and their `used-by` names the entry (both directions). | `corpus/evidence/round-30/frontier/{S116,S117}.json`, `refetch/*.json`, `norm-compare.txt`. |
| Does C2's predicate hold at tip? | **Yes, by my own run.** Clean `--shared` clone at `072af95`, porcelain empty; offline and `--live` both `population 2, admitted 2, failing 0`, exit 0. | `c2-offline.json`, `c2-live.json`; `clone-porcelain.txt`. |

## 2. Findings

### F1 — defect (low, coverage label): `docs-held` labels a conjunctive item on half its ground
`README.md:651` sets the status token for "**Rate/ToS** surface for site-interaction records"
to `docs-held`. The ground actually added is rate-only: S116's `ground:` header and S117's are rate vocabulary;
neither entry mines any ToS document, and the cell itself names only rate fields. S117 is the
sharper instance — its own `ground:` line (`host-published-rate-limit-headers.md:7`) says
"site-interaction records — the **rate/ToS surface**" while every fact under it is a rate
header set; a reader who stops at the header line inherits a ToS claim the body never makes.
S116's `ground:` line has the same "rate/ToS" wording. The ToS conjunct is exactly as open as
at `:182` (approval table C3
"ToS/robots surface **unmeasured**", `interaction-approval-table.md:92-95`, file untouched this
round). A reader scanning the frontier table now sees one item with status `docs-held` and one
pointer set that documents only half of it.
*Smallest safe correction*: make the token carry its scope — "docs-held (rate half only) —
…; ToS half open — no documented ToS vocabulary mined; runtime open — no measured real-site
rate or ToS datum". One cell. No ground re-opened.

### F2 — defect (low, false provenance): the entry sends a reader to a note that holds neither 429 nor 403
`corpus/knowledge/rate-limit-policy-fields.md:7` reads "…on top of the **429/403 status class**
and RFC 9110 `Retry-After` already held in
`corpus/knowledge/redirect-and-retry-after-semantics.md`". That note's declared scope is
`§15.4 … §10.2.3` and it contains no 429 and no 403 sentence (0 grep hits; its only status
mention is 503 at `:44`). The 429/403 class *is* held in the lane, but at `SKILL.md:329`
("a loopback 429 is an instrument, never a C6 datum") and
`external-class-fixture-v2.md:85` (`STATUS_TRIP = [429, 403]`). A reader following the pointer
to re-derive "what the lane already held" finds a shorter scope than the sentence implies.
*Smallest safe correction*: split the attribution in the `ground:` line —
"…the 429/403 stop class (`SKILL.md:329`; `knowledge/external-class-fixture-v2.md` §4–§5) and
RFC 9110 `Retry-After` (`knowledge/redirect-and-retry-after-semantics.md`)". The entry body's
class-3 sentence already cites the draft correctly and needs no change.

### F3 — defect (low, span arithmetic): the Gate's S116 location over-names one line
`corpus/lessons/round-30.md:15` locates S116's Gate quote at "-11 lines 308–311". The quote as
printed ("The field value SHOULD remain consistent over a sequence of HTTP responses. It is this
characteristic that differentiates it from the RateLimit (Section 4) field") occupies
**308–310**: line 311 is `on every request. The "RateLimit-Policy" field enables clients to`.
The quote is contiguous under whitespace collapse (QUALITY 74 passes); the *line description*
is one line long. Given QUALITY 78 ("a described span … counts the lines it names"), the fix
is `308–310` (or extend the quote to `on every request.`, which would touch S116's byte-for-byte
Gate row instead — the line fix is cheaper).

### F4 — bound, not a defect: the surface novelty is outside what the counter can see
`check-frontier-admission.mjs` decides population from the header line `frontier: <slug>` only
(`:27-31`); `grep -c 'README' scripts/check-frontier-admission.mjs` → **0**. No check binds an
entry to a README frontier item, reads the coverage map, or tests that the ground was
uncovered (checks are `e1, r1-r4, g1-g7, l1, l3, q1`). Consequently the C2 predicate would
report 2/2 for two entries restating already-held ground just as readily; the coverage *credit*
is established by the reading in §1, not by the instrument. This is a limit of the claim, not
an error in it — but a future round should not cite `admitted 2` as evidence of novelty.

## 3. What I did not find (attacked and cleared)

- **No deleted or rewritten README byte** in the round; `:182` still reads `open` and the
  appended block says both "Frontier restatement (append-only; earlier rows keep their bytes)"
  and "runtime open" — the same two-status convention round 1 (`:167-190`), round 12 (`:225-233`)
  and round 29 used. The row does not claim the item is closed.
- **No phantom quote**: 22/22 (S116) and 14/14 (S117) ≥4-word spans locate in the committed
  receipt bytes under the counter's own `normalise()`; the one MISS in `norm-compare.txt` is my
  control (an S116 quote tested against the Discord bytes — correctly absent).
- **No receipt/sha mismatch**: `S116.txt` = 67097 B, `d6016dd0…` (entry, row, receipt, refetch,
  my fetch all agree); S117 raw varies per response but normalised identity is exact (8728,
  `c719ecca…`).
- **No held-rule edit under cover of the new vocabulary**: `SKILL.md` gained only 16 added
  lines (registry rows, `git log --numstat` → `2/0` + `14/0`, 0 deletions); the 429 rule
  (`:329`), C3/C6, U1, and the fixture are byte-unchanged this round (empty `git log … --`
  for those three files).
- **Tag population is exactly the two entries** (`grep -rl '^frontier: rate-tos-signal$'
  corpus/knowledge/ | wc -l` → 2), so `population 2` is not padded.

## 4. Axes impacted

- **coverage**: credit stands for the rate half (un-held ground, un-held at baseline, verified);
  the ToS half is unmoved — F1 asks the label to say so, not to withdraw the credit.
- **calibration**: F3 is a location-inflation of the round-29 defect-4 family (a described span
  that does not add up), now in a Gate row; F2 is a provenance pointer, both low.
- **operability / depth / freshness / adjacency**: untouched by this finding set.

## 5. Commands run (exit codes)

```
git -C <lane> log --oneline f7c0317..072af95 -- corpus/README.md          exit 0 (1 commit)
git -C <lane> diff f7c0317 072af95 -- corpus/README.md | grep -c '^-[^-]' exit 0 (0)
git -C <lane> show 072af95:corpus/README.md | tail -40                    exit 0
git -C <lane> diff 072af95^ 072af95 -- corpus/README.md                   exit 0 (additions only)
git grep -n -i -E 'x-ratelimit|ratelimit-policy|RateLimit-|6585|discord|\bquota\b' f7c0317 ... exit 0 (no vocabulary)
sha256sum scripts/{check-gate-mutants.mjs,gate-mutants.json,check-frontier-admission.mjs} exit 0 (frozen digests match)
git clone --shared <lane> $S/clone; git -C $S/clone checkout -q 072af95        exit 0
git -C $S/clone rev-parse HEAD; git -C $S/clone status --porcelain            exit 0 (tip; empty)
node scripts/check-frontier-admission.mjs --rev 072af95 --frontier rate-tos-signal --since 2026-10-26 --json
                                                                              exit 0 (2/2, failing 0)
node scripts/check-frontier-admission.mjs ... --live --json (2026-10-26T07:41:51Z)  exit 0 (2/2, failing 0)
node q.mjs (entry quote locate, counter's normalise)                          exit 0 (22+14 spans, 0 misses)
node n2.mjs (committed/refetch/mine normalised compare)                        exit 0 (all three equal)
awk -F'|' (S116/S117 row status/opened/recheck/used-by)                        exit 0
grep -c 'README' scripts/check-frontier-admission.mjs                          exit 1 (0 hits)
```

## 6. Network fetches (read-only HTTPS GET, UA `tabi-lane-critic/1.0 (read-only doc fetch)`)

| UTC | Status | Bytes | sha256 | URL |
|---|---|---|---|---|
| 2026-10-26T07:38:00Z | 200 | 67876 | `e088940d98218985c88a0693d71e9d979cc4b4aff58a353b558b1cf5d58173ee` | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-09.txt |
| 2026-10-26T07:38:00Z | 200 | 67803 | `f40a241153d69329e2cbfee86cb39512d42007a2355769b35b1ce68cd16b7aa5` | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-10.txt |
| 2026-10-26T07:38:00Z | 200 | 67097 | `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt |
| 2026-10-26T07:38:44Z | 200 | 408912 | `e4a217cc88bc18226c9ae1607af80afc30b4d23515d108d1d8f9c36cebf7f8aa` | https://docs.discord.com/developers/topics/rate-limits |
| 2026-10-26T07:42:13Z | 404 | 77297 | `db9919c05eddf8565b54deab5c54e4a49e4ad835ad075652f27d83e5faa6c898` | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-12.txt |

## 7. Receipts in this output dir

`fetch-log.txt`, `bytes-sha256.txt`, `quote-locate.txt`, `norm-compare.txt`,
`c2-offline.json`, `c2-live.json`, `clone-porcelain.txt`
(`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w2/CritC2Surface/`).
Scratch `$HYAKU_SCRATCH/tabi-r30/CritC2Surface` removed after copying. No tool installed or
upgraded; no lane file, index, or jj state written; no repair attempted (attack seat).
