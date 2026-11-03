# R57Reviewer — attack report (round 57, wave w1)

Seat: R57Reviewer (ATTACK, read-only). Everything below was re-derived or
measured by this seat unless explicitly marked as another seat's receipt.
Review window: 2026-11-03 15:57–16:1x (pre-freeze-commit: lane HEAD still at
baseline ef43ecec; claims.json, v17 meter, r57 counter/runner present as
working-tree bytes awaiting the freeze commit — attacks on those bytes assume
they land verbatim).

Instruments state at review time: v17 meter + v16-v17-meter.diff LANDED (v17
sha256 7305b6726ff5da8060f063422e87dde4de1018e80a08cf98416c2f68b21a6054,
34,736 B, unchanged since 16:06 — all meter attacks below are against these
bytes); r57 counter chromium-receipt-r57.mjs + fixtures LANDED (selftest
70/70 green, exit 0); runner chrome-cdp-loopback-round57.mjs was STILL BEING
ITERATED at the review cut (sha changed 16:03→16:15: 87560256…→ba5ba927… —
the L1 must re-pin the digest at the freeze commit); gate v2 LANDED 16:15
(measured below); QuarA 10/10 verdicts, QuarD 8/8 (incl. S175), QuarB (S142)
pending at the cut; w1-results.json not yet in existence.

---

## A. Attacks on the frozen claims (claims.json)

### A1. [ATTACK-SUCCEEDED, medium] The C1 counting command does not enumerate the full universal set — malformed map rows fail OPEN

Clause: "every corpus/adjacency.tsv data row has exactly one audit row …".
Counting command: the v17 meter's `tsvParse(mapRaw, 9)` — whose final filter
`.filter((parts) => parts.length === cols)` **silently drops** any row whose
column count is not exactly 9. A map row corrupted at the data revision (8 or
10 tab-separated fields) vanishes from `inputs.mapRows`: no `audit-missing`,
no status re-derivation, no finding — and its existing audit row becomes an
orphan that `verify()` never enumerates (it only looks up by map ref). The
asymmetry: the LEDGERS fail closed (a malformed audit/delta row drops out and
its map row then flags `audit-missing`/`delta-line-missing`), but the MAP —
the row that defines the universal set — fails open. `exit 2` fires only if
the whole map file is unreadable, never for a partial row. After.expected pins
`mapRows=N` **unfrozen**; only the before receipt pins mapRows=16 (at the
baseline). So a data-rev map that silently loses a row prints
`mapRows=15 … predicate true, findingCount 0` and satisfies the letter of C1.
Not exploitable by a do-nothing (the baseline map is intact and the meter is
frozen), but the universal clause "every … data row" is not fully enumerated
by the committed counting command. Because the meter is frozen this round,
the fix is a reporting duty: the L1's data receipt should pin
`mapRows=16` (or diff the data-rev map against the baseline map) — otherwise
this is a live hole in the green state's meaning.

Evidence: meter core lines (`tsvParse` filter; `verify()` iterates
`inputs.mapRows` only; orphan audit rows never read), reproduced in my copy
`.ufo/waves/round-57/reviewer/v16-v17-observed-by-reviewer.diff` context; v16
== v17 here (verify() byte-identical, confirmed).

### A2. [ATTACK-SUCCEEDED, low] "Exactly one" is one-directional; orphan audit rows are invisible

Companion of A1: `audit-duplicate` fires only for rows whose key equals a
SECOND row's key during the scan; an audit row keyed by a ref absent from the
map (or unparseable) is never flagged by any finding id. Inflation of the
audit ledger is invisible to the predicate. No green-state impact found (the
obligations come from the map), recorded for the ledger-hygiene record.

### A3. [ATTACK-SUCCEEDED, low] The map ref's pinned `rev` cell is decorative

`parseRef()` extracts `lane@rev:path:line` but `verify()` and
`makeSibRefGit()` read sibling bytes at the per-run snapshot head only; the
ref's rev is never compared to anything. A map row citing a WRONG sibling rev
passes green as long as the line text still matches at the snapshot head.
Drift is still caught (by the line-text legs), so this is a provenance nit,
not a coverage hole.

### A4. [ATTACK-SUCCEEDED, low] C2's before-control is not re-derivable at the freeze instant

The C2 `before` command invokes
`.ufo/waves/round-57/counters/chromium-receipt-r57.mjs` on an absent receipt —
that file did not exist at frozenAt (it landed in w1). The "one command over
committed bytes" property for the C2 before-state holds only AFTER the freeze
commit lands. The claims' own freezeRule discloses this (instruments authored
in w1, committed code-only before the data pass); recorded so the L1's freeze
commit is not credited with a reproducibility it cannot have at the frozen
instant. The leg-1 half (`git ls-tree … | wc -l` → 0) IS re-derivable now; I
measured 0 at baseline myself.

### A5. [ATTACK-SUCCEEDED, low] C2's after "selftest N/N" pins no floor

After.expected: "counter selftest N/N green at the freeze commit" — N is
unfrozen. The r56 base measures **39/39** (I ran the committed r56 counter's
selftest: allPass true, pass 39, cases 39; fixtures dir holds exactly 39
.json fixture specs). A regressed r57 counter that dropped 34 fixtures and
shipped 5/5 would satisfy "N/N green" literally. The kill rule's "no check
may be dropped or weakened" is the only backstop and is not machine-checkable
from the frozen text. Measured on the real r57 bytes once its fixtures landed
(~16:10): selftest **70/70 allPass, exit 0**, and a finding-id set diff r56→r57
shows **29 r56 ids carried, NONE dropped, 14 new ids** — all on the declared
modifier-chord domain (shift-*, chord-*, keylog-*, field3-named,
field2-final-mismatch, server-field2-mismatch, boolean-mismatch). The
no-drop rule is thus MEASURABLY satisfied by the actual instrument; the
frozen text's unpinned N remains a wording gap only.

### A6. [FAILED-TO-BREAK] C1 do-nothing control

Verified real and do-nothing-unreachable:
- Round-open red receipt (a w1 control file, written at round open before any
  seat data; its bytes match the declared expected exactly): exit-1 state,
  predicate false, findingCount 1, `lane-screen-head-mismatch kengaku-shokunin`,
  counts roster=20 mapRows=16 auditRows=16 deltaLanes=16 — all four counts
  verified by me against the receipt.
- The flagged finding is a REAL sibling movement, not a file-absent artifact:
  the r56 delta ledger (baseline bytes, `git show ef43…:corpus/adjacency-host-delta-r56.tsv`)
  binds kengaku at `9ebde3a7…`; the round-open snapshot saw `6b0908a5…`; the
  live head is now `5f517fe7…` (I ran rev-parse + log on kengaku-shokunin).
- A no-op cannot reach green: at the baseline (or at a data rev without the
  r57 ledgers) AUDIT_REL/DELTA_REL resolve to nothing → `audit-missing` ×16
  and `roster-lane-uncovered` ×16 → red. Green requires the rebind at a fresh
  snapshot. No do-nothing path found.
- Independent re-run of the declared before-command (my own execution, ~16:10):
  predicate false, counts identical (20/16/16/16), findings now **2**
  (lane-screen-head-mismatch kengaku-shokunin AND souji-shokunin — both heads
  moved further since round open: kengaku snapshot 6b0908a5→859ac24f, souji
  ab8c1fcf→fbf1ea3c). Exactly the disclosed "LATER re-runs may show more
  findings" behavior; the before-state re-derives as red with the same
  finding class.

### A7. [FAILED-TO-BREAK] C1 after-state properties, measured at the declared bytes

- v17 `--selftest`: 18/18 allPass (incl. predicate-assert-green pred=true n=0;
  predicate-assert-partial pred=false n=1) — the frozen ">= 18/18 including
  the two new predicate-assert cases" holds at sha 7305b672….
- The m4' kill demanded by after.expected re-derived independently (see B).
- Kill-rule clause "adjudications may not be changed to match a sibling head
  that moved after the snapshot" is mechanically enforced: the delta lane
  rows' `head` cells are compared to the run's own snapshot (`lane-screen-head-mismatch`),
  which is exactly the finding that fired at round open.

### A8. [FAILED-TO-BREAK] C2 cross-refusals, both directions, measured

- r57 counter ← r56 green receipt
  (`chromium-receipt-r56-fixtures/receipts/green-synthetic.receipt.json`):
  exit 1, predicate false, 7 findings — `schema-wrong` (tabi-chrome-cdp-r56),
  `nonce-shape` (tabi-r56-…), `driver-sha-mismatch`, plus the four r57-domain
  absences (`shift-trace-missing`, `chord-missing`, `field3-named`,
  `keylog-absent`); `couldNotEvaluate` gracefully scopes the nonce-derived
  checks (`nonce-unusable` — "only shape checks below ran").
  Receipt: reviewer/fixtures/crossrefusal-r57counter-on-r56-green.json.
- r56 counter ← r57-shaped minimal receipt (authored by me,
  reviewer/fixtures/r57-shaped-minimal-receipt.json): exit 1, predicate
  false, 13 findings — `schema-wrong` (tabi-chrome-cdp-r57), `nonce-shape`,
  `driver-sha-mismatch`, `profile-not-throwaway`, `host-browser-mismatch`, …
- Driver digests measured: r57 driver bytes sha256
  `8756025673a275d33323695291d9438817dd56d71d58eac7f1f3c4c8f06aabd8` (what
  `<FROZEN-DRIVER-SHA>` must pin at the freeze commit); r56 driver
  `26da87bbfcc2eb7034f6815fd48430ce6bd8a12bf5ba21ae766950a840893b7d` (derived
  by the r56 counter itself). Caveat: measured on working-tree r57 bytes;
  re-run at the freeze rev when committing.

### A9. [FAILED-TO-BREAK, with residuals] C2 do-nothing / canned-receipt

Baseline evidence tree = 0 files (measured: `git ls-tree -r --name-only
ef43… -- corpus/evidence/round57 | wc -l` → 0). The counter refuses an absent
receipt (usage/`receipt-missing` class). A canned receipt must additionally
defeat: driver-sha pin (measured binding), nonce shape + invocation binding +
per-keystroke re-derivation from the nonce (`nonce-not-invocation-bound`,
`plain-trace-*`, `shift-*`, `chord-*`, `keylog-entry-mismatch` — ids verified
present in the counter), server-log echo count, PNG sha/signature pins,
step ordering, teardown survivor probe. Static review only at review time
(selftest fixtures not yet landed); the mutation seat owns the dynamic probe.
Residuals recorded under "Residual risk" below.

---

## B. The v17 meter change set (diff review + weaker mutants)

### B1. [FAILED-TO-BREAK] Diff review against the declared change set

My independent unified diff of v16 (committed bytes at ef43…) vs v17
(working tree, sha 7305b672…) has **+58/−15 lines; the ±-line bodies are
IDENTICAL, line for line, to the declared `counters/v16-v17-meter.diff`**
(73 = 73 bodies). R57Adj's `adj/v17-line-audit.txt` classifies every changed
LOGIC line (28) as `<a>` relabel or `<b>` predicate fix — UNCLASSIFIED: 0 —
and my diff agrees: the only logic changes are
(a) AUDIT_REL/DELTA_REL r56→r57; schema strings v16→v17 (die, selftest,
run-output); predicate-sentence r56→r57 (ledger names + sentence token);
usage lines and header;
(b) `export const predicateFrom = (findings) => findings.length === 0;` used
by the run output AND the selftest harness, plus the two new cases
(predicate-assert-green / predicate-assert-partial) with the
assertPredicate/assertFindingCount terms.
`verify()` has ZERO hunks — byte-identical, as frozen. No differing logic
line outside the declared change set. The harness lines
(`okPredicate`/`okCount`, result fields `predicate`/`findingCount`) are the
mechanism entailed by "shared by the main output and the selftest" — inside
(b)'s letter.

### B2. Weaker mutants (task B list) — measured, at the canonical v17 bytes

| mutant | selftest | verdict |
|---|---|---|
| m4': `findings.length !== 0` (routed OR-class) | 16/18, both new cases fail | KILLED (triple-corroborated: my run; `mutant/m4-kill.json`; `adj/m4-kill-selfdev.json` — same mutant sha a6f87595…, same failing pair) |
| `true` (constant) | 17/18, predicate-assert-partial fails | KILLED |
| `findings.length === 0 \|\| true` | 17/18, predicate-assert-partial fails | KILLED |
| `findings.length <= 0` | 18/18 | SURVIVES — EQUIVALENT mutant (length is an unsigned integer; `<= 0` ⟺ `=== 0`); unkillable by any black-box test; not a weakening |
| `!findings.length` | 18/18 | SURVIVES — EQUIVALENT mutant, same class |
| harness drop: `const ok = okFindings` (assertions not consulted), predicateFrom honest | 18/18 | silent (honest meter passes its own weakened harness) |
| harness drop + `true` constant | 18/18 | **SURVIVES — named survivor** (mG) |

Mutant files preserved: reviewer/fixtures/mutant-*.mjs.

### B3. [FINDING, residual] The two new cases' assertion strength is itself unguarded

The routed fix makes the emitted predicate observable, but the observability
is enforced by two harness expressions (`okPredicate`, `okCount`) that no
selftest case or mutation receipt covers: dropping them (mutant mG) restores
the m4/constant-true blind spot at 18/18 green. THIS round's bytes are frozen
and correct (both lines are inside the declared diff, so the freeze-commit
review sees them), but a FUTURE generation could weaken them while keeping
the case names. Recommendation: route to the next meter generation's diff
review — pin `okPredicate`/`okCount` as named-protected lines (the v17
line-audit pattern applied to the harness), or add a selftest case that
mutates the harness. Not a break of the frozen claims.

---

## C. Cited-receipts gate — adversarial fixtures (v1 measured; v2 measured)

v2 (`scripts/check-cited-receipts-v2.mjs`) landed at 16:15. Its declared
widening: an UNPREFIXED token starting with a wave-dir component
(`counters|measure|controls|adj|gate(-fixtures)|sources|scout|reviewer|critic|connector|mutant|sentinel|labrat|scribe|quarantine|assimilation`)
plus `/` + ≥1 path char is a RELATIVE citation resolved against
`.ufo/waves/round-<--round>/`; `..` inside such a token is REFUSED outright
(`relative-citation-traversal`, never resolved); full-prefix spans are masked
before the relative scan. v1's CLI/exit/full-prefix rule is frozen inside it
(the differential selftest runs v1 as a child).

Fixture repo: scratch git repo (toplevel-asserted before each mutation per
the host guard), three commits — r56 tree carries
`.ufo/waves/round-56/measure/{exists,cross-only}.json`; r57 HEAD carries
`.ufo/waves/round-57/measure/exists.json`, `.ufo/waves/round-57/counters/keep.txt`,
`.ufo/waves/round-57/secret.txt`, and ten fixture docs. All 28 run receipts
are preserved in reviewer/fixtures/ (v1-f1…f6, v2-f1…f6, v1/v2-g1…g5).

| fixture | probe | v1 | v2 |
|---|---|---|---|
| f1 prose-path | prose that looks like a path (`see counters/ below`, `.ufo/waves/round-57/ below.`) + one real token | GREEN, checked 1 — **holds** | GREEN, checked 1 — **holds** (bare prose never a token) |
| f2 relative forms | `measure/exists.json`, `counters/keep.txt` (both EXIST under r57 in the repo) | checked 0 (blind — the R56Gate-F1 gap) | **widening works**: both extracted as relative tokens, both resolve present, GREEN |
| g1 crossround-rel | `measure/cross-only.json` exists ONLY under round-56, gate `--round 57`; plus an r57-existing relative | checked 0, GREEN (blind) | `relative-citation-missing` (resolved `.ufo/waves/round-57/measure/cross-only.json`); the r57-existing token passes — **strict-by-design, distinct finding id, not a false positive under the declared rule** |
| g2 traversal-rel | `measure/../secret.txt` (normalized destination EXISTS at r57) | invisible | **`relative-citation-traversal`, resolved:null — refused even though the normalized path exists** — holds |
| g3 masking | `.ufo/waves/round-56/measure/cross-only.json` (other-round full prefix; inner `measure/…` must not be re-read) | otherRound 1, GREEN | relativeTokens 0, otherRound 1, GREEN — **masking holds** (no false positive from the inner span) |
| g5 prose-rel | bare `mutant/`, `sources/`, `measure/`, `controls/` in prose + a real relative citation | GREEN (blind) | bare wave-dir words NEVER matched (≥1 path char after `/` required); the real citation extracted — **prose false-positive resistance holds** |
| f3 ../ | bare `../round-56/…` + inline `.ufo/waves/round-57/../round-56/…` | bare invisible; inline RED (git trees cannot resolve `..`) — correct-by-bytes | identical; v2's traversal refusal covers wave-dir-relative `..` only — a LEADING-`../` citation is still invisible to BOTH (edge gap, recorded) |
| f4 case | `Measure/exists.json`, `counters/Keep.txt` | RED both — **holds** (case-sensitive tree) | RED both — **holds** |
| f5 url-encoded | `measure%2Fexists.json`, `…exists.json%20` | **FALSE NEGATIVE**: truncation at `%` leaves a token that resolves as a DIRECTORY → green although the citation names no existing path | **FALSE NEGATIVE PERSISTS** (v2 froze v1's full-prefix rule byte-for-byte; the masked remainder `%2F…` starts no wave-dir token). Carried residual of the generation — route to the next gate generation, not a v2 regression |
| f6 control | plain missing path | RED — holds | RED — holds |

### v2 red-before, independently re-derived on committed lane bytes

At the r55 close revision 545b251d over `corpus/lessons/round-55.md` +
`SCORECARD.md` (`--round 55`): v1 = 12 checked / 6 findings / 5 distinct
missing (matches v1's own frozen red-before exactly — differential equality
✓); v2 = same 12/6 PLUS 105 relative tokens checked → 77
`relative-citation-missing` occurrences over **68 distinct** paths, traversal
[], predicate false. BOTH relative forms the r56 lesson named are CAUGHT:
`measure/c1-meter-green-at-correction1.json` (SCORECARD) and
`measure/d54-1-landing-note-r55.txt` (lesson:67). [FINDING, C1-material]:
the widening re-quantifies the r55 receipt loss — **72 distinct missing
paths** across just those two documents, an order of magnitude beyond the
"six lost receipts" the r56 closure narrative carries. The L1 must not
repeat "six" as exhaustive anywhere in round-57 materials (defect-6
discipline applies to this count too); the red-before receipt
(`gate/v2-red-before-545b251d.json`) should carry the v2 totals.

---

## D. Independent quarantine sample (S106, S142, S175)

Full detail: `.ufo/waves/round-57/reviewer/independent-sample.md`. One-paragraph
state: my verdicts, produced independently before reading any seat's receipt —
S106 **absent-confirmed** (RFC 9309 fetched clean 200/25,265 B: zero CJK, zero
`WebMCP`; both Chinese fragments impossible under any fold), S142
**absent-confirmed** (RFC 9110 clean 200/502,941 B; `which tool list do I see`
nowhere), S175 **absent-confirmed as written with a ONE-CHARACTER near-miss**
(page real and on-topic 200/73,627 B; the long fragment differs from page text
by exactly one character — register 審核**佪**列 vs page 審核**佇**列; the
corrected variant locates f0 at byte~39895 line 711; `Explicit Tool
Registration` genuinely absent, page uses 註冊 ×8). All three fragments sets
also live in shokuknow's staged knowledge files (leak answer recorded per
QuarA step 5).

Cross-checks against the seats: R57QuarA's S106 ladder FACTUALLY agrees with
mine (0 hits on identical bytes) and adds a true discovery — both fragments
locate f0-exact at the chrome devtools webmcp-debugging?hl=zh-tw page (I
re-fetched it guard-checked: 200/176,286 B, byte~147621 and byte~149035) —
but its verdict LABEL `mispaired` stretches the frozen vocabulary (the frozen
trigger is "located at the STAGED url but not the register's"; here staged ==
register URL). **FINDING (D1): S106 verdict-label deviation; facts
corroborated independently.** Recommend the L1 adjudicate the label
explicitly (frozen text ⇒ absent-confirmed) and record QuarA's extension as
a deviation, so the register reconciliation isn't fed two different
vocabularies. QuarD's S175 counterpart landed at 16:13: verdict `mispaired`
again, but its receipt is WEAKER than QuarA's — `reason` null (contract
requires it), `httpCode` null while bytes=73627 (fetched, unrecorded code),
and NO carrier evidence for the mispaired label anywhere in the receipt;
its factual ladder (0/2 on the same 73,627-byte page) agrees with mine.
**FINDING (D2): QuarD S175 — label unevidenced and out of the frozen
vocabulary; mandatory reason omitted; the one-character near-miss
(佪列→佇列) unrecorded.** S142 (QuarB) had not landed by the review cut;
agreement would corroborate, disagreement is a finding.

---

## E. r56 closure routed defects 6 + 7 in this round's draft materials

**Defect 6 (seat/role counts from w1-results.json, never prose memory).**
claims.json: no measured seat/role count anywhere (the single `w1-results`
string is the defect's own carryIn wording; "16 seats" appears only in the
w1-spec milestone as a PLAN count, and w1-spec.json contains it once). No
pre-repeat found. w1-results.json did not exist at review time; the L1's
final counts must come from it — the reviewer holds the same discipline: this
report quotes NO seat/role counts from prose.

**Defect 7 (byte-exact quotes incl. inline markup).** The two re-open grounds
are already byte-verified by me in the r57 staged sources:
- S153 staged `.ufo/waves/round-57/sources/browser_protocol.json`: 1,423,170 B,
  sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` —
  IDENTICAL to the r56 re-open fetch recorded in the S153 row (byte-identity
  between rounds confirmed). Byte-exact modifiers description in these bytes:
  `"Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0)."`
  (note the embedded newline and `Meta/Command` — any recorded quote MUST
  carry both). `Alt=1, Ctrl=2, Meta/Command=4, Shift=8` greps 5× (1 in
  dispatchKeyEvent + 4 sibling Input commands), matching the r56 re-open log.
- S161 staged `uievents.html`: sha256
  `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` —
  IDENTICAL to the r55-registered fetch (920,762 B). The ctrlKey definition
  greps verbatim WITH its inline markup, 1 hit:
  `<code>true</code> if the <code class="keycap">Control</code> (control) key modifier`
  — the exact keycap-markup class defect 7 protects.
- Nit (comment-level, values correct): the r57 counter header paraphrases the
  bits as "(Alt=1, Ctrl=2, Meta=4, Shift=8)", dropping "/Command"; claims.json
  uses the numeric paraphrase "bits 2/1/4" (not a located quote — no
  violation). The scribe's receipts must carry the byte-exact forms above.
No pre-repeat of defect 7 found in claims.json or w1-spec.json (both contain
shape paraphrases, not located-quote claims).

---

## Findings ledger (severity order)

1. [MEDIUM] A1 — universal-set escape: malformed map rows fail open; count
   command does not enumerate the full set; mapRows unfrozen at the data rev.
   Attack-succeeded. (Reporting duty on the L1; meter frozen.)
2. [FINDING] D1 — S106 verdict-label deviation (QuarA `mispaired` vs frozen
   vocabulary ⇒ absent-confirmed); facts corroborated independently.
3. [FINDING] D2 — QuarD S175: `mispaired` label unevidenced in its own
   receipt (no carrier, no locatedElsewhere), mandatory `reason` null,
   `httpCode` unrecorded; factual ladder agrees with mine.
4. [RESIDUAL] B3 — harness-level survivor (mG): the predicate-assert cases'
   strength rests on two unguarded harness lines; route the named-line
   protection to the next meter generation.
5. [LOW] A5 — C2 "selftest N/N" unpinned; measured floor r56 = 39/39; real
   r57 bytes measure 70/70 with zero r56 ids dropped (gap is wording only).
6. [LOW] A3 — map ref `rev` cell unaudited (decorative).
7. [LOW] A2 — orphan audit rows invisible (one-directional "exactly one").
8. [LOW] A4 — C2 before-control not re-derivable at the freeze instant
   (disclosed by freezeRule; record only).
9. [NIT] E — counter header drops "/Command" from the S153 bit paraphrase.
10. [MEDIUM, count-integrity] C-red-before — v2's re-derivation shows 72
    distinct missing receipt paths across the two r55 documents (v1 saw 6/5);
    any round-57 material repeating "six lost receipts" as exhaustive would
    pre-repeat a prose-count error (defect-6 class).
11. [LOW, carried residual] C-f5 — URL-encoded citations stay a false
    negative in v2 (full-prefix rule frozen by design); route the
    truncation-then-dir-hit class to the next gate generation.
12. [LOW, edge] C-f3 — a LEADING-`../` relative citation
    (`../round-56/measure/x.json`) is invisible to v1 AND v2 (the traversal
    refusal covers wave-dir-relative tokens only).

Failed-to-break (controls/predicates that held under attack): C1 do-nothing
(real movement verified; no-op red path proven; before-command re-run
independently — red, same finding class, disclosed drift), C1 after selftest
18/18, m4' kill (triple-corroborated), C2 evidence-tree-empty, C2 cross-refusals
both directions (measured), C2 selftest 70/70 + zero r56 finding ids dropped,
gate v1 AND v2 prose false-positive resistance, case-sensitivity, control
red, v2 relative-form widening (f2/g1), v2 traversal refusal (g2), v2
full-prefix masking (g3), v2 red-before strictly-greater-than-v1 with both
named r55 forms caught (re-derived on committed bytes).

## Residual risk and verification gaps

- Sibling-side sabotage is OUTSIDE the meter's trust boundary (recorded, not
  a claim break): a lane dir with `.git` removed drops off the roster
  (`laneExists`); a deleted PROVINCE.md turns its delta lane row into a
  placeholder whose `head` cell is never verified (the head-binding check
  runs only in the file-present branch) and whose lines/bgHits cells go
  unchecked; the meter cannot screen bytes that do not exist.
- C2's dynamic defenses (nonce re-derivation, keylog boolean correspondence,
  per-keystroke read-backs, field3 emptiness, server echo) were reviewed
  STATICALLY (finding-id inventory + cross-refusals + selftest) — the
  MUTATE-RUN-REVERT kill evidence for the counter is R57MutCounter's to
  produce; my cross-refusal measurements used the 16:12 counter bytes and
  the pre-16:15 runner bytes (the runner was still moving) — re-run at the
  freeze rev.
- QuarB (S142) and w1-results.json had not landed by the review cut; the
  S142 agreement/disagreement is UNRESOLVED at cut time, and the E discipline
  (seat/role counts from w1-results.json) could not be end-checked on the
  L1's final report — only the draft materials were checkable (clean).
- The freeze commit had not landed (HEAD still ef43ecec); every "committed
  bytes" statement about v17/r57 instruments is a statement about the bytes
  EXPECTED to be committed verbatim (v17 sha stable since 16:06; runner sha
  NOT stable at cut).

## Receipts

- reviewer/independent-sample.md — D verdicts + evidence; fetched bytes and
  per-row JSON preserved under reviewer/fixtures/independent-sample/
  (S106/S142/S175 .json + raw fetches incl. the chrome zh-tw carrier page).
- reviewer/fixtures/ — 28 gate receipts: v1-f1…f6.json, v2-f1…f6.json,
  v1/v2-g1…g5.json; crossrefusal-r57counter-on-r56-green.json;
  r57-shaped-minimal-receipt.json; mutant files (m4prime, const-true,
  or-true, le0, bang-len, harness-drop-const-true).
- reviewer/v16-v17-observed-by-reviewer.diff — my independent meter diff.
- Cross-checks cited from other seats (not my evidence, corroborating only):
  .ufo/waves/round-57/mutant/m4-kill.json, adj/m4-kill-selfdev.json,
  adj/v17-line-audit.txt.
