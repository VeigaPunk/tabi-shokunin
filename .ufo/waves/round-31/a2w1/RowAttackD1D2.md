# RowAttackD1D2 — C1 rows D1–D2 (RFC 9309 redirect bound), tabi round 31, a2w1

Seat: RowAttackD1D2 (attack, M1). Target: `corpus/knowledge/rate-signal-decision-table.md`
lines 49–50 (rows D1, D2) at `486048356f0712e4396588c9dab58cd419243120`; entry blob sha256
`2371692dc50ca81124f8b451c816dd6331105bc78ee074caae4388b463951b86` (identical in the lane
working tree and at REV). Source: S119 = `https://www.rfc-editor.org/rfc/rfc9309.txt`, §2.3.1.2.

## Verdict

**Both rows hold on their own content; three low-severity row defects and one disclosed predicate
gap.** The two quotes are verbatim in §2.3.1.2 — located in the committed receipt bytes
(`corpus/evidence/round-31/decision-table/bytes/S119.txt`, 25,265 B, sha256 `f633915d…b207`), in
my own live fetches of that URL at 12:26:26Z and 12:28:23Z (bytes byte-identical, same sha256), and
in a second authority's rendering (`datatracker.ietf.org/doc/html/rfc9309`, HTTP 200, 111,924 B) —
and the number each Threshold cell states (`5`) is the consecutive-redirect count the sentence
itself bounds, not a status code, section number, document number, year or pronoun. Bound words
(`at least` / `more than`) and units (`redirects`) match the source exactly; the forces are the
RFC's own `SHOULD` and `MAY`, neither row needs the `(derived)` marker under the entry's own rule,
and the two rows are distinct (different sentence, force, action and trigger) rather than one rule
restated. What does **not** hold is scope and internal consistency: (i) both Signal cells replace
the RFC's class — "a redirect, such as HTTP 301 or HTTP 302 in the case of HTTP" — with its two
named examples, so a `303`/`307`/`308` robots.txt redirect lands in no row while the entry's own
prose speaks of redirects generally; (ii) D2's "which re-enters the 400–499 outcome" is a
cross-section inference from §2.3.1.3 that the section D2 cites (§2.3.1.2) does not state, and it
carries the verb `stop` for exactly the "assume unavailable" disposition that D3 labels `allow`
while D12 uses `stop` to mean "make no further request"; (iii) neither row's own cells name the
actor/scope QUALITY 80 requires (crawler rule vs browser journey) — only the quote's subject noun
and the entry's U4 do. Separately I reproduced, on the landed rows themselves, that the frozen
counter cannot certify letter (c): with D1's bound inverted to `at most 5 redirects` and D2's unit
swapped to `more than 5 seconds`, the counter still returns exit 0, population 13, admitted 13,
failing 0. So the rows' (c) correctness is author hygiene, not a checked property — which is what
QUALITY 80 already says ("unit, bound word, force and distinctness are read row by row") and what
w1 CritC1Counter A1/A2 showed on fixture rows.

## What was attacked (rows as landed)

| Row | line | Signal | Decision | Threshold | Source | quote words |
|---|---|---|---|---|---|---|
| D1 | 49 | `` `robots.txt` fetch answered with `301` or `302` `` | follow — SHOULD, across authorities (RFC 9309 §2.3.1.2) | at least 5 redirects | S119 | 20 |
| D2 | 50 | `` `robots.txt` redirect chain longer than the bound (another `301`) `` | stop — stop following the chain; MAY treat robots.txt as unavailable, "which re-enters the 400–499 outcome" (§2.3.1.2) | more than 5 redirects | S119 | 17 |

Source text, receipt lines 373–385 (`sed -n '373,385p'`, exit 0), whitespace-collapsed by
`normalise()` (`scripts/check-decision-table.mjs:134-146`; the `.txt` branch is whitespace collapse
only, no HTML stripping):

```
375   It's possible that a server responds to a robots.txt fetch request
376   with a redirect, such as HTTP 301 or HTTP 302 in the case of HTTP.
377   The crawlers SHOULD follow at least five consecutive redirects, even
378   across authorities (for example, hosts in the case of HTTP).
380   If a robots.txt file is reached within five consecutive redirects,
381   the robots.txt file MUST be fetched, parsed, and its rules followed
382   in the context of the initial authority.
384   If there are more than five consecutive redirects, crawlers MAY
385   assume that the robots.txt file is unavailable.
```

## Letter-by-letter

| | D1 | D2 |
|---|---|---|
| (a) quote verbatim + located | **holds** — exact substring of `normalise(live bytes)` and of the receipt bytes (offset found, 1 occurrence, 20 words, inside `q1`'s 6–25); also located in datatracker's HTML rendering after the counter's HTML branch | **holds** — same, 17 words, 1 occurrence |
| (b) number is the bounded quantity | **holds** — `5` is the consecutive-redirect count in "at least five consecutive redirects"; the `301`/`302` status codes appear only in the Signal cell, never in the Threshold cell | **holds** — `5` is the consecutive-redirect count in "more than five consecutive redirects" |
| (c) unit + bound word | **holds** — `at least` … `redirects` matches "at least five consecutive redirects" (the cell drops "consecutive", which changes no count inside a chain: nit only) | **holds** — `more than` … `redirects` matches "more than five consecutive redirects" |
| (d) verb + stated force | **holds** on force — RFC `SHOULD`, cell says SHOULD, no `(derived)` needed (RFC 2119 keyword present); verb `follow` is the quote's own action | **partly** — force `MAY` correct; verb `stop` is the author's gloss on "MAY assume unavailable" and the "400–499 outcome" clause is inference (defect D-A2, D-A3) |
| (e) observable at that point | **holds conditionally** — observable only where a driver chooses to fetch robots.txt; entry U4 (`:168-172`) says exactly that and says the entry does not bind a browser journey. Row-level: not stated (D-A4) | **same** |
| (f) scope stated | **partly** — the quote's subject is "The crawlers"; the cell cites the section, not "crawler rule, not browser journey" (D-A4) | **same**, plus the §2.3.1.2 vs §2.3.1.3 citation split (D-A2) |
| (g) distinct from other rows | **holds** — different sentence, force, action and trigger from D2; the pair is one bound's two halves (floor 5 / ceiling >5) and the boundary is consistent: reached within five → follow, a sixth redirect → may stop. No off-by-one, no restatement | **holds** — same argument from the >5 side; not a restatement of D1 |

### Sentences in context — what the rows omit

- **The MUST beside D1 is not a row.** §2.3.1.2's second paragraph (`:380-382`) makes the reached
  case obligatory: "the robots.txt file MUST be fetched, parsed, and its rules followed in the
  context of the initial authority." D1's cell states only the `SHOULD` to follow. A reader using
  the table alone can conclude that following is merely optional and never learns of the MUST that
  attaches on arrival. The entry's prose carries it (`:72-74`, "inside five the file must be
  fetched, parsed and followed in the context of the initial authority"), so the entry as a whole
  holds; the row alone understates. This is an omission, not a miscitation (no defect grade; w1
  ScribeRowsRobots drafted this MUST as its D2 and L1 dropped it — `corpus/lessons/round-31.md:36`).
- **"such as" is the source's qualifier on the codes, and the signal cells drop it.** See D-A1.
- **No limiting exception surrounds either quote.** D2's fallback is unconditional in §2.3.1.2 (no
  "in general", no exception clause); D1's `SHOULD` is not narrowed by anything else in the section.
- **RFC 2119 semantics of `SHOULD`** do allow a reasoned deviation, so D1's force wording is right
  and its "keep following" gloss does not overstate.

## Defects

### D-A1 — low — signal cells narrow the RFC's redirect class to the source's two examples

- Evidence: source `:375-376` "It's possible that a server responds to a robots.txt fetch request
  with a redirect, **such as** HTTP 301 or HTTP 302 in the case of HTTP." The rule that follows
  (`:377-385`) is triggered by *a redirect*, and the codes are introduced as examples. Landed
  signals: entry `:49` "answered with `301` or `302`"; `:50` "… (another `301`)". §2.3.1.2 contains
  no `3xx`, `303`, `307` or `308` (checked by regex over the collapsed section — all false), and no
  other row covers a robots.txt redirect (`grep` of rows D1–D13: the only other redirect sentence is
  the S122 prose at `:111-113` about which URL a record keeps).
- Impact: a driver that receives `303`, `307` or `308` for robots.txt matches no row, while the
  entry's own prose states the class without restriction — `:71-72` "The redirect budget is five
  consecutive hops, across authorities included". The table and the prose therefore disagree on
  scope, and the table under-covers the rule it claims to tabulate. The entry's Limits section
  declares the RFC's *example values* (30 days, `Retry-After: 3600`) as examples but says nothing
  about the redirect codes, so the narrowing is undisclosed.
- Smallest safe correction: name the class and mark the codes as the source's examples in the
  Signal cells — D1 "`robots.txt` fetch answered by a redirect (the source names `301` and `302` as
  examples)", D2 "(a further redirect)" — and add the codes to the Limits sentence that already
  lists the RFC's example values. No threshold, force or quote changes; the counter reading is
  unaffected.

### D-A2 — low — D2's "re-enters the 400–499 outcome" is an inference from a section D2 does not cite

- Evidence: §2.3.1.2 (`:384-385`) says only "crawlers MAY assume that the robots.txt file is
  unavailable." The consequence the cell records comes from §2.3.1.3 (`:394-396`): "If a server
  status code indicates that the robots.txt file is unavailable to the crawler, then the crawler
  MAY access any resources on the server." The RFC makes that link explicitly exactly once, in
  §2.3.1.4 (`:405-408`): "…may assume that the robots.txt file is unavailable **as defined in
  Section 2.3.1.3**" — not in §2.3.1.2. D2's Decision cell cites "(RFC 9309 §2.3.1.2)" only.
- Impact: the row states a disposition (unavailable ⇒ the 400–499 outcome) that the cited section
  does not state. The same inference is repeated in the entry's prose (`:74`, "beyond five the
  crawler may treat it as unavailable (S119 §2.3.1.2), which re-enters the 400–499 outcome"), so
  the entry asserts it in two places and cites §2.3.1.2 for it in both. The inference is sound —
  "unavailable" is §2.3.1.3's defined term and the RFC points at it one paragraph later — but it is
  the author's, and the entry's marking rule covers
  only declared limits ("a derived cap must not be read as a rule the page states"), so this
  inference falls outside both marking conventions and is invisible to a reader checking the cited
  section.
- Smallest safe correction: cite the second section in the same cell — "(RFC 9309 §2.3.1.2;
  disposition per §2.3.1.3)".

### D-A3 — low — `stop` carries a disposition the table elsewhere calls `allow`, and means something else in D12

- Evidence: D2 (`:50`) "stop — stop following the chain; MAY treat robots.txt as unavailable, which
  re-enters the 400–499 outcome". D3 (`:51`), the same "assume unavailable" disposition, reads
  "allow — MAY treat the file as unavailable after the example period (or keep a cached copy)".
  D12 (`:59`) uses `stop` for "make no further request". The closed verb set is
  `scripts/check-decision-table.mjs:85` (`wait, stop, retry, allow, disallow, cap, follow, refetch,
  backoff, cache, limit, pause, serialize`), and `t3-decision` (`:270-271`) checks membership only.
- Impact: read as a lookup (signal → verb), D2 tells a driver `stop` where the source's consequence
  is "MAY access any resources" — the disposition D3 correctly labels `allow`. A rules engine
  reading the verb column cannot tell "stop the redirect chase" from D12's "send no request".
  Human-readable cells disambiguate; the verb column does not.
- Smallest safe correction: set D2's verb to `allow` and keep "stop following the chain" as the
  cell's gloss (no counter or quote change), or, at the next freeze, add a distinct verb for
  stopping a redirect chase to `DECISIONS` — which is frozen counter bytes this round and therefore
  not repairable here.

### D-A4 — low — the row's cells do not name the actor and scope (QUALITY 80)

- Evidence: `corpus/QUALITY.md:457-470` requires that "the row names the actor and the scope the
  source binds the number to". D1's cell names the section, not "a crawler rule, not a browser
  journey rule"; the actor survives only as the quote's subject "The crawlers" and the scope only
  in the entry's U4 (`:168-172`: RFC 9309 addresses crawlers; "a browser does not fetch
  `robots.txt` on its own; a row in that group applies only where a driver chooses to fetch the
  file"). The entry's "What this table decides" says "a robots.txt fetch outcome", which is entry-
  level, not row-level.
- Impact: a reader of the lookup alone applies a crawler obligation to the lane's CDP browser
  journeys — the exact reading U4 refuses. Also (e): the signal is only observable where the driver
  chooses to fetch robots.txt.
- Smallest safe correction: append to both cells "(crawler rule; applies only to a deliberate
  robots.txt fetch)". No counter effect.

## Predicate gap reproduced on the landed rows (not a row defect; disclosed in QUALITY 80)

Fixture commit `d934b8fbd6775f5ec9bda0555b66143ce5e724ab` in my scratch clone: D1's Threshold set to
`at most 5 redirects` (bound inverted against a quote saying "at least five") and D2's to
`more than 5 seconds` (unit swapped against a quote about redirects); quotes, signals, decisions
untouched.

```
node scripts/check-decision-table.mjs --rev HEAD --baseline 96a2d1a3… \
  --entry corpus/knowledge/rate-signal-decision-table.md --json
# exit 0 → {"population":13,"admitted":13,"failing":0}
# rows D1 and D2 each admitted:true, threshold:5
```

So `n1-threshold-sourced` (`:286`) compares the number only; the bound prefix and the unit that
`UNIT_RE` (`:86`) parses are never compared with the quote. The landed D1/D2 bound words and units
are correct — I read them and verified them mechanically against the quotes (both `in_quote=true`,
see `bound-check.txt`) — but a future edit could invert them silently. This reproduces w1
CritC1Counter A1/A2 on the landed rows rather than fixture rows; QUALITY 80 already requires the
row-by-row read that catches it, so I am not asking for a repair.

## Evidence: commands and exit codes

Setup (all in `/fast/scratch/hyaku/tabi-r31/RowAttackD1D2`, `HYAKU_SCRATCH=/fast/scratch/hyaku`):

```
git clone --shared -q …/tabi-shokunin "$S/clone"                                    # exit 0
git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120              # exit 0
git -C "$S/clone" rev-parse HEAD   → 4860483…                                       # exit 0
git -C "$S/clone" status --porcelain | wc -l → 0                                    # exit 0
sha256sum "$S/clone/scripts/check-decision-table.mjs"
  d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832                  # = frozenDigests
git -C <lane> show 4860483…:corpus/knowledge/rate-signal-decision-table.md | sha256sum
  2371692dc50ca81124f8b451c816dd6331105bc78ee074caae4388b463951b86                  # = working-tree blob
```

Counter readings at REV, `TMPDIR="$S/tmp"`, run in the clone (`git status --porcelain` = 0):

```
node scripts/check-decision-table.mjs --rev 4860483… --baseline 96a2d1a3… \
  --entry corpus/knowledge/rate-signal-decision-table.md --json > "$S/c1.offline.json"
# exit 0 → population 13, admitted 13, failing 0, live=false
node … --live --json > "$S/c1.live.json"
# exit 0 → population 13, admitted 13, failing 0, live=true
node … --live --json > "$S/c1.live.final.json"      (after the fixture, clean checkout restored)
# exit 0 → {"rev":"4860483…","population":13,"admitted":13,"failing":0,"live":true,"clean":true}
```

Quote location (`normalise()` = whitespace collapse for `.txt`; extracted cell text, not retyped):

```
node -e '… q = cell[5] …'        → D1 liveLocated=true receiptLocated=true words=20
                                   D2 liveLocated=true receiptLocated=true words=17
```

Bound/unit comparison against the quote: D1 `bound= at least in_quote= true unit= redirects
unit_in_quote= true`; D2 `more than / true / redirects / true` (`bound-check.txt`).

Section scope checks over the collapsed §2.3.1.2 span: `3xx` false, `303` false, `307` false,
`308` false. `sed -n '373,385p'` of the receipt shows the four sentences quoted above.

Fetches (all `curl -q -sS --proto =https`, no cookies, no credentials, no API endpoints):

| UTC | URL | HTTP | bytes | sha256 | note |
|---|---|---|---|---|---|
| 2026-10-26T12:26:26Z | `https://www.rfc-editor.org/rfc/rfc9309.txt` | 200 | 25265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` | `cmp` with the committed receipt bytes: **identical** |
| 2026-10-26T12:28:23Z | `https://www.rfc-editor.org/rfc/rfc9309.txt` | 200 | 25265 | `f633915d…b207` | second fetch, same bytes |
| 2026-10-26T12:28:24Z | `https://datatracker.ietf.org/doc/html/rfc9309` | 200 | 111924 | `134b4ef0c8d4c4b5a7340face207259d4de1b63168fc748e32e4d4aa62d889b5` | both quotes located after the counter's HTML normalisation; `url_effective` = requested URL, no off-host redirect |

All three fetches exited 0. Receipt files copied into this seat's output directory:
`c1.offline.json`, `c1.live.json`, `c1.live.final.json`, `c1.boundflip.json`, `quote-check.txt`
(per-row location/word-count + the collapsed §2.3.1.2 span), `bound-check.txt` (bound/unit vs
quote), `fetch-513c4116` (RFC text), `fetch-4f154cbc` (datatracker HTML).

## Scope and hygiene

Read-only on the lane (`git log`, `git show`, `grep`, `read`; no tracked file, index or jj state
touched). Writes: this report, `.ufo/waves/round-31/a2w1/RowAttackD1D2/` (receipts), and scratch
under `/fast/scratch/hyaku/tabi-r31/RowAttackD1D2` (one `--shared` clone at REV; the fixture commit
`d934b8f` made inside that clone with `-c user.name=RowAttackD1D2`, after
`git -C "$S/clone" rev-parse --show-toplevel` = the clone). No subagent dispatched; no lane build,
linter or formatter run; no tool installed or upgraded; no message to `agent://all`. Findings only —
no repair applied to any row, entry, receipt or counter.
