## Round 30 — 2026-10-26 — gate mutation-kill coverage and the rate/ToS frontier

Not a fresh-start round (round 29 admitted). Claims frozen before data in `061e62024c0523d3c6c7e819506a773ff2cd7d75`
(`.ufo/waves/round-30/claims.json`), measured at tip `072af95fe2822f0785a6ff88a578e2142dd258e5` over baseline
`f7c0317e4f8445502005e79e3d65767430912dab`; a do-nothing and three junk controls per claim were scored before any
claim data (`.ufo/waves/round-30/baseline/`, provenance `baseline/README-receipts.md`). C1 (operability) is round-29
routed defect 7 made mechanical: whether the self-tests of `scripts/check-s106-evidence.mjs` and
`scripts/check-release-pins.mjs` can see the checks those gates claim to make. C2 (coverage) is the §10 assimilation of
one `merge/tabi/` theme onto the open frontier item "Rate/ToS surface for site-interaction records". Routed defects 1–6
were handled as curation inside the step, not as claims. Waves: w1 build + first falsifiers (32 seats,
`.ufo/waves/round-30/w1/`), w2 falsify (`.ufo/waves/round-30/w2/`). Integrated by TabiR30.

C1, gate mutation-kill coverage. Before, at the freeze rev with counters added: `fault_total 27, fault_survivors 14,
benign_total 13, benign_killed 0`, exit 1 (`.ufo/waves/round-30/measure/c1-before-at-freeze.json`); the 14 survivors were
`s106-sha-drop, s106-anchor-unique-drop, s106-anchor-unique-true, s106-byte-count-drop, s106-byte-count-true,
pins-f1-old-tag, pins-f2-path-traversal, pins-f3-bytes-absent, pins-f4-range-bounds, pins-f4-anchor-token,
pins-s1-supersession-prefix, pins-s1-supersession-tag, pins-notfound-status, pins-notfound-body`. Counting command
(both readings): `node scripts/check-gate-mutants.mjs --rev <REV> --json | jq '{fault_total,fault_survivors,benign_total,benign_killed,survivors}'`.
Implementation touched only the self-test tables, their fixtures and the declared case counts: `check-s106-evidence.mjs` gained three
field-pinned cases (`same-length-tamper-invalid`, `duplicate-anchor-invalid`, `receipt-byte-count-mismatch-invalid`,
now 10 cases) that assert `field`/`fieldValue` rather than a tally; `check-release-pins.mjs` gained nine cases that pin
the failing row's `reasons` and a runner clause (`reasonsOk`) comparing them (now 29 cases), plus
`f4-anchor-lacks-range-token-unresolved`, which moves the verdict and not only the reason. Every catalogued check line stayed byte-identical — no diff hunk touches either gate's check body: the six hunks sit at
`check-release-pins.mjs:353` (CASES), `:407` (self-test runner), `:451` (self-test print) and `check-s106-evidence.mjs:5`
(header case count), `:158` (fixtures), `:224` (CASES); the counter and catalogue bytes are the frozen
`02945f88…3a55` / `cd1c27a2…3833` at the measured rev (`counter_sha256_at_rev` in the receipt). After:
`fault_total 27, fault_killed 27, fault_survivors 0, benign_total 13, benign_killed 0`, `clean true`, both pristine
self-tests clean (s106 10/10, release-pins 29/29, exit 0) at `072af95f…` (the L1's reading; limit (c) gives the receipt
position). Kill attribution by reading, not by count:
26 of the 27 faults fail a named case, and 13 of the 14 former survivors die at a case added for them
(e.g. `s106-anchor-unique-drop` → `duplicate-anchor-invalid`; `pins-f4-anchor-token` →
`f4-anchor-lacks-range-token-unresolved`; `pins-s1-supersession-tag` →
`drift-superseder-not-at-stable-tag-unresolved`). The exception is `pins-f3-bytes-absent`: the catalogue replaces the
absent-bytes guard with `if (false)`, so the null blob reaches `sha256(ob)` at `check-release-pins.mjs:215` and the
self-test dies with an uncaught TypeError — exit 1, `cases: null`, `failing_cases: []`. The branch is covered by the
pristine case `f3-old-bytes-never-committed-unresolved` (`:378`, exit 1, unresolved 1, reason `f3-bytes absent`), so the
kill is genuine but carries no per-case attribution.

C1's counter hole and the compensation. Wave 1 (`w1/CritC1Counter.md` §1–§2) showed the frozen counter hands the code
under test its own identity — each mutant copy runs with `cwd = <work>/mutant-<catalogue index>` and the full parent
environment (`scripts/check-gate-mutants.mjs:142,148,152,215`) — so a one-line `process.cwd()` case "kills" all 27 faults
with the frozen digests and no check exercised. Counter v2 is not built (the counter is frozen for C1). The round
compensates three ways and records the limit as lesson M5: the reading above is re-derived with an identity-blinded copy
of the same counter (random run directory, `measure/c1-identity-blind-harness.diff`; the rerun's receipt, wave 2, records
`counter_sha256_running 358839ca…06df7` against `counter_sha256_at_rev 02945f88…3a55`); each kill is attributed to a
named case by reading `failing_cases`; and QUALITY criterion 76 makes the mutant battery, not the tally, the instrument.
The freeze controls closed the other three cheat shapes that did not need an environment: a byte-length fingerprint
kills all 13 benign (`benign_killed 13`), a site-grep leaves 9 faults alive and kills 3 benign, and a literal blacklist
is refused as mutant-aware (exit 2).

C2, frontier admission. Before: `population 0, admitted 0`, exit 1 at the freeze rev
(`.ufo/waves/round-30/measure/c2-before-at-freeze.json`); the staged package rows admitted nothing as-is
(`admitted 0, r4-opened`), a date bump without receipts admitted nothing (`g1-receipt`), and the self-quoting junk
receipt admitted 2 offline but 0 with `--live` (`l3-live-bytes`), which is why `--live` is part of the predicate.
Counting command: `node scripts/check-frontier-admission.mjs --rev <REV> --frontier rate-tos-signal --since 2026-10-26 --live --json | jq '{population,admitted,failing}'`.
After: `population 2, admitted 2` at `072af95f…` with `--live` (the L1's reading; no raw capture of it is committed at
this rev — limit (c)). The two entries are `corpus/knowledge/rate-limit-policy-fields.md`
(tag `frontier: rate-tos-signal`, cites S116, the IETF HTTPAPI RateLimit header-fields draft at `-11`) and
`corpus/knowledge/host-published-rate-limit-headers.md` (same tag, cites S117, Discord's own rate-limit documentation).
Each row carries a committed receipt (`corpus/evidence/round-30/frontier/S116.json`, `S117.json`: HTTP 200, 67,097 B
sha256 `d6016dd0…d412` and the Discord page sha256 `b73dc7d1…83c3`), a located ≤25-word quote recorded in the Gate table
of `corpus/lessons/round-30.md`, and an independent refetch by a different seat (`refetch/S116.json` seat
`ScribeEntryRateLimitFields`, bytes byte-identical; `refetch/S117.json` seat `ScribeEntryDiscordHeaders`, raw bytes vary
per response while the normalised text is identical). Registry: 115 → 118 rows (`corpus/SOURCES.md` S116, S117, S118).
The counter's self-test is 24/24.

C2's counter hole and the compensation. Wave 1 (`w1/SentinelFetchScope.md`, `w1/CritC2Counter.md` §2) showed the frozen
`--live` leg is not network-bound by construction: `fetchLive` shells out to `curl` with no `-q`/`--config`/`--proto`/
`--max-redirs`/host pinning (`scripts/check-frontier-admission.mjs:175`), accepts `file://` sources (:180, self-test
cases :340-342), follows redirects off-host, reaches loopback, and inherits `~/.curlrc`/`~/.netrc`; a `file://` receipt
reaches `admitted 2` with no network. Not repaired this round (the counter is frozen for C2); recorded as lesson M6.
Compensation, all review rather than gate: both committed receipt urls are `https://` and equal their rows' source urls;
the compensating check named in lesson M6 retakes the live reading inside a network namespace with no network, where the
https receipts must fail `l1-live`; the counter header's "never reads credentials or session material" claim is marked as
not holding in general. Two surfaces held clean in the
same review: `bytes_path` cannot escape the repo (rejected at :110, git refuses the show), and curl refuses `file://` on
a redirect.

Assimilation (§10) of the rate/ToS theme from `/home/vgpnk/Projects/shokuknow/merge/tabi/` (read-only). Admitted,
re-grounded in-round: `host-rate-limit-signal-classes-r14.md` → `knowledge/rate-limit-policy-fields.md` (staged S159 →
S116, anchor re-pinned `-09` → `-11`; live on 2026-10-26 `-09`, `-10`, `-11` all return 200 and `-12` returns 404, so the
staged "`-10` and later currently return 404" was false and is dropped); `host-rate-limit-header-set-r16.md` →
`knowledge/host-published-rate-limit-headers.md` (staged S182 → S117; its per-guild caveat narrowed to the emoji-control
routes the page scopes it to). Rejected with flip conditions: `rate-and-tos-signal-vocabulary.md` (staged S106/S110 —
its quotes are absent from the cited RFCs; the round-27 quarantine re-fetched RFC 9309 and RFC 6585 on 2026-10-25, HTTP
200, and found none of the five recorded spans, which belong to WebMCP documents) and `host-rate-limit-signal-classes-r13.md`
(staged S147/S148/S149 — quote drift across sibling rows; S147's `Error 1020` is verbatim on S148's page and absent from
S147's). Flip: each quote corrected onto the page it was actually fetched from, re-opened in-round with a receipt and a
different-seat refetch. Reject spot-check: `w1/RevQuarantineCarry.md` re-fetched all five cited URLs on 2026-10-26
(HTTP 200 ×5, byte-identical to the round-27 fetches); the quotes remain absent, flips not met. Id collisions: 14
(S102–S115), none of them an adopted staged id; guard proof in `.ufo/waves/round-30/assimilation/guard-proof.txt`
(a 0–3-space row pattern finds an indented `S159`, the column-zero pattern does not). The 38-row quarantine slice is
carried unchanged (register sha256 `5afe1810…d833`, unchanged since round 27).

Routed defects 1–6 (round-29 verifier spot-check), all fixed as curation. (1) `used-by` reciprocity: 23 rows re-opened
by `knowledge/chromium-156-release-pin-recheck.md:3` now name it back — 23 in-place appends logged old→new in
`corpus/lessons/round-30.md` §"`used-by` changes"; the entry is named in 31 `SOURCES.md` cells. (2) Gate quotes that did
not ground their own row: S110, S114 and S115 each get a contiguous span from the row's own bytes and scope
(`form_mcp_schema.cc:215-217`; `html_form_element.cc:867`; `html_form_element.cc:203-206`), and the round-29 S110/S115
quote "The document was detached while filling out the form" is recorded as never a contiguous substring — it spans two
C++ literals at `:207`/`:208`, so a quote of it is only ever one literal or an around-the-boundary span. (3) The
round-29 mistakes table listed M1–M3 only; M4 and M5 got table rows in an appended section of
`corpus/lessons/round-29.md`, prose untouched. (4) The line-shift errata conflict (`:110-111` "+10" vs `:117-118` "+11")
is marked superseded in `knowledge/chromium-156-release-pin-recheck.md`, with the guard-block arithmetic restated
(:201–209 is nine lines; the ten-line insertion is those nine plus the blank at :210). (5) The "23 on-release rows"
population is stated as the rule that selects it, with the excluded classes named: six rows pinned only through the
DEPS-selected devtools commit `66df492…` (S036, S044, S068, S088, S089, S090) and three `main`-branch rows (S004, S028,
S035); measured at the freeze rev, 23 of 89 `on-release` rows are selected. (6) S044's anchor path
`front_end/panels/application/WebMCPModel.ts` returns HTTP 404 at `66df492…` (154.0.8037.97 DEPS line 424) and at
`bf69d041…` (M156); the model is `front_end/models/web_mcp/WebMCPModel.ts` at the same lines, 8,553 B sha256
`c23d575e…b632`, byte-identical at both commits — superseded row S118, with the correction appended to
`knowledge/webmcp-invocation-round-17.md` and byte-level receipts under `corpus/evidence/round-30/s118/`.

Step outputs. `corpus/lessons/round-30.md` (241 lines): Gate table for S116–S118 with located quotes, the §10
assimilation record, the 23-row `used-by` ledger, the re-grounded S110/S114/S115 quotes, mistakes M1–M6 (six table
rows in the `CORPUS.md` §5 vocabulary, each with class, evidence pointer, capture status and fix; M1–M4 also carry a
subsection whose red state a stored command turns on), and the release-pin population rule.
`corpus/QUALITY.md` criteria 74–79: quote contiguity in the row's own bytes and grounding of its own `teaches`; two-way
`used-by`; a case names the check it targets; one table row and one subsection per numbered mistake; an appended
correction cites by document and line; a counted population states its selecting rule and its excluded classes.
`SCORECARD.md` carries an appended correction superseding the stale self-test tallies at `:1438`, `:1466`, `:1479`
(s106 10/10) and `:1485` (release-pins 29/29), each citing the stale line in its own document. `SKILL.md` gains
eight-field registry rows for the two new gates. `corpus/README.md` gains two knowledge rows and restates the frontier
item as docs-held / runtime open, with the gate self-test kill coverage item marked held for the two gates.

Re-verification result: at `072af95fe2822f0785a6ff88a578e2142dd258e5`, `check-gate-mutants` reports 27 of 27 catalogued
fault mutants killed (26 by a named case; `pins-f3-bytes-absent` by a crash) and 0 of 13 benign rewrites killed, `clean
true`, both pristine self-tests clean (s106 10/10, release-pins 29/29); `check-frontier-admission --live` reports
population 2 / admitted 2 for `rate-tos-signal` at `--since 2026-10-26`. Neither counter was modified: counter and
catalogue bytes are the frozen digests at the measured rev.

Round-30 commit ledger (lane `master`): `061e6202` claims freeze, both counters, the mutant catalogue, assimilation
id/collision receipts, baseline and control receipts; `38891ca0` C1 self-test cases in both gates, C2 entries and
receipts for S116/S117, `SOURCES.md` rows and the 23 `used-by` appends, lesson Gate and tally corrections, the two claim
receipts under `measure/`; `072af95f` S118 and its byte receipts, the round-29 lesson and knowledge addenda, lesson
mistakes M1–M6 and the population rule, QUALITY 74–79, README frontier restatement. Later commits: see report.

Limits recorded, not repaired. (a) The mutant-identity leak (M5) and the `--live` scope holes (M6) are counter-v2 work;
both counters stay frozen and the compensations above are review, not gates. (b) `r3-used-by` runs only on entries
carrying a `frontier:` tag, so reciprocity between a non-frontier entry and its rows is still unenforced — the 23-row fix
is the curation edit, not a gate. (c) At `072af95f…` `.ufo/waves/round-30/measure/` holds the two before-receipts only
(`c1-before-at-freeze.json`, `c2-before-at-freeze.json`): the frozen-bytes C1 run and the `--live` C2 run at the tip are
the L1's readings, and no raw capture of either is committed at this rev, which `claims.json:measurementRule` requires
before the report. (d) Release-pin counter v2 semantics (id-set population, DEPS-pinned rows, refetch provenance) are
named in `claims.json:notClaimed`, not built. (e) This round's own lesson fails the criterion it added: QUALITY 77
compares mistake table rows against subsections, and `corpus/lessons/round-30.md` has six rows (M1–M6) against four
subsections (M1–M4), so M5 and M6 — the two counter weaknesses — carry no able-to-fail record (criterion 77 itself says
no lane instrument asserts the count).
