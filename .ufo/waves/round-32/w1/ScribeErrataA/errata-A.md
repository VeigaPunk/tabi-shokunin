# Errata-A — routed defect 4, queue items E1–E9 re-checked at `4181fff`

Scope: `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` (43 queue items, committed as wave evidence; round-31 lesson
`:333-335` records the split: 9 corrected in that block, 3 corrected as a rule with enforcement carried, 27 carried to
round 32, 4 no action). This file dispositions **E1–E9 only**, by the queue's own numbering.

Revision: re-checked against the lane at `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (round-32 freeze), in a
`--shared` clone under `/fast/scratch/hyaku/tabi-r32/ScribeErrataA/clone`. The queue was written at `4860483`; two
commits moved the bytes it points at (`ae15a37` salvage, `cad607b` attempt-2 integration) plus the round-32 counter
freeze (`2f8535c`, `5ad1fcb`) — every line number below was re-derived, none copied.

Method per item: (a) read the cited bytes at `4181fff`; (b) where the item is a counter behaviour, re-measure it
against the frozen counter's own `evaluate()` with injected fetchers (no network, no packet to any external host);
(c) state whether the item's *rule* half landed in a living document, since a queue item can have one half landed and
one half open.

Re-measured at this revision (probe `receipts/probe-erratas.mjs`, output `receipts/probe-out.txt`):

| probe case | exit | population | admitted | failing | what it shows |
|---|---|---|---|---|---|
| `E3-a-example-admitted` | 0 | 1 | 1 | 0 | quote keeps "(for example, 30 days)", threshold `30 days` — admitted |
| `E3-b-example-marker-truncated` | 0 | 1 | 1 | 0 | same figure, "for example" deleted — still admitted |
| `E6-pathstub-live` | 0 | 1 | 1 | 0 | **default** `curlFetch`; a stub `curl` earlier in `PATH` serves a fabricated 200 — admitted, stub call recorded, nothing sent to the named host |
| `E7-echo-page-live` | 0 | 1 | 1 | 0 | 200 soft-404 body ("Your query matched: <quote>") passes `l1-live` |
| `E8-prefix-url-live` | 0 | 1 | 1 | 0 | receipt url = site root `https://example.org` while the row cites `/spec.txt` — admitted |
| `E9-null-host-guard` | 0 | 1 | 1 | 0 | both urls unparseable ⇒ same-host guard vacuous; `hostOf` sliced from lane bytes returns `null` for both |

The probe imports a byte-identical copy of the frozen counter with only the trailing `main();` bootstrap removed
(`receipts/counter-nocli.mjs`, sha256 `b79159bc…`; original `scripts/check-decision-table.mjs` sha256
`d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`, 482 → 481 lines). All predicates are untouched;
`Frozen counter selftest` was also run from the original file (`verdict=clean cases=34 passed=34`, exit 0).

---

## E1 — the "held ground before" sentence is wider than the corpus

**Re-check.** The sentence exists in exactly one place: `.ufo/waves/round-31/claims.json:21` (frozen). The corpus
numbers it contradicts are still where the queue says: `corpus/knowledge/host-published-rate-limit-headers.md:96`
("All bots can make up to 50 requests per second to our API."), `:97` (the interaction-endpoint exemption), `:101-103`
(the recording rule), `:105` ("a documented 10,000 per 10 minutes"). The queue's replacement sentence
("no entry maps an observed signal to a driver action with a sourced numeric threshold") exists **only** inside the
wave artifact `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md:16`; no file under `corpus/`, `SKILL.md`, `SCORECARD.md`,
`LOG.md`, `README.md` carries it (`grep` over those paths: 0 hits).

**Verdict.** Holds, and the "corrected here" disposition is not durable: the correction lives beside the queue, not in
a document a reader of the round-31 claim consults. Second drift since the queue: the narrower sentence is *also* false
now — the round-31 landing added D1–D13, signal→action rows with sourced numbers
(`corpus/knowledge/rate-signal-decision-table.md:51-61`).

**Disposition — DRAFT.** Target: `corpus/lessons/round-31.md`, append at EOF under a new heading (the file's last
section is "## Mistakes — attempt 2", so the block starts a new `##` section; nothing is inserted above a cited line,
which keeps correction E30's positional property intact).

```markdown
## Corrections — round 32 (append-only)

- **The freeze sentence "no entry gives a sourced numeric threshold for any decision" is wider than the corpus at its
  own freeze.** `.ufo/waves/round-31/claims.json:21` carries it; before this round
  `corpus/knowledge/host-published-rate-limit-headers.md:96` ("All bots can make up to 50 requests per second to our
  API."), `:97` (the interaction-endpoint exemption) and `:105` ("a documented 10,000 per 10 minutes") were sourced
  numbers attached to a recording rule. The sentence that was true at `9505a10e` is "no entry maps an observed signal
  to a driver action with a sourced numeric threshold"; since this round landed D1–D13
  (`corpus/knowledge/rate-signal-decision-table.md:51-61`) that one is no longer true either. Quote the frozen wording
  only as the round-31 claim's text, never as the lane's state. (w1 CritC1Axis Q1; a2w1 ScribeErrata E1; re-checked at
  `4181fff`)
```

**Evidence.** `claims.json:21` (grep count 1); `host-published-rate-limit-headers.md:96,97,101-103,105`; durable-copy
grep 0 hits outside `.ufo/waves/round-31/**`; `receipts/verification.txt` §"round-31 frozen claim sentence",
§"durable copies of the narrower sentence".

---

## E2 — actor and scope of the GitHub numbers

**Re-check.** The queue's remedy landed: `corpus/QUALITY.md:463-464` reads "The row names the actor and the scope the
source binds the number to (a vendor's policy is that vendor's, at the access date)." The rows obey it:
`rate-signal-decision-table.md:55-61` name `GitHub REST API policy`, `GitHub secondary limit`, `GitHub secondary
compute limit` in the Decision cell (D1–D5 cite RFC 9309, no vendor). The approval table is untouched.

**Verdict.** Closed — no drift, no new gap. The clause is prose; the frozen counter reads none of it, which criterion
80's own last sentence already declares (`:464-465`).

**Disposition — CLOSED (already landed), no append.** Flip condition: if criterion 80 is superseded or renumbered
without carrying the actor/scope clause, reopen at the clause's new home; and if a future row omits the vendor name,
that row is the red state a counter v2 would fail on (carried under E3's refusal).

**Evidence.** `corpus/QUALITY.md:463-464`; `rate-signal-decision-table.md:55-61`.

---

## E3 — example values are admitted as thresholds, and control J4 does not see them

**Re-check.** The rule half landed: `corpus/QUALITY.md:461-463` ("A sample or example value (a specimen response block,
an illustrative figure) sources no row; an RFC example period kept as a row says \"example\" in its own cells").
The sensor half did not move: the counter is byte-identical to the one the queue measured (`d15f3bd7…`), `q1` is
`words 6..25` (`scripts/check-decision-table.mjs:283`), `n1` is
`numbersIn(quote).has(tnum)` (`:286`) — nothing reads "for example", "sample", "illustrat*". The self-test is 34 cases
with no example-value case (`DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34`, exit 0); the nearest is
`threshold-not-in-quote` (fabricated number). Control `c1-J4` is still "genuine RFC 9309 bytes/quotes, own thresholds"
(`.ufo/waves/round-31/baseline/README-receipts.md:14`) — it attacks fabricated numbers, not example ones.
Re-measured at `4181fff`, both halves of the queue's fixture reproduce (probe cases `E3-a`, `E3-b`, above): the figure
is admitted with the parenthetical intact **and** with "for example" truncated away.
The full eight-row scope-misread fixture is committed at `.ufo/waves/round-31/w1/CritSourceChoice.md:132-166`
(population 8, admitted 7, failing 1, the one refusal `n1-threshold-sourced`).

**Verdict.** Holds. Rule landed, enforcement open; the enforcement is explicitly out of this round's claims
(`.ufo/waves/round-32/claims.json` §notClaimed: "decision-table counter v2 (routed defect 2)").

**Disposition — REFUSE the counter change, LAND a limit record.** Reason: `scripts/**` is frozen after the round-32
freeze and v2 is not claimed; editing the counter would be an unfrozen measurement instrument. Flip condition: when a
decision-table v2 is frozen, its cases must include (a) the `(for example, 30 days)` quote admitted → refused
`n1-example-value`, (b) the same quote with the marker truncated → refused, (c) a row whose Source cell omits the vendor
name → refused or flagged per E2, and (d) the eleven genuinely-stated bounds of `CritSourceChoice.md:179-183` all
admitted. Draft record (target: `corpus/knowledge/rate-signal-decision-table.md`, append inside the last section
"## Errata — round 31, attempt-2 falsify wave a2w1", i.e. at EOF):

```markdown
- **The admitting counter cannot see an example figure.** `q1` caps the quote at 25 words
  (`scripts/check-decision-table.mjs:283`) and `n1` only asks that the threshold's number occur somewhere in the quote
  (`:286`); no predicate reads "for example". Re-measured at `4181fff`: a row whose quote keeps
  "(for example, 30 days)" is admitted (exit 0) and the same row with the marker truncated away is admitted (exit 0) —
  `.ufo/waves/round-32/w1/ScribeErrataA/receipts/probe-out.txt` (the counter's own `evaluate`, injected fetcher, no
  network). Control `c1-J4` attacks fabricated numbers only. Criterion 80 (`corpus/QUALITY.md:461-463`) is the rule;
  until counter v2 exists, read every row's number by the criterion before counting the row. (w1 CritSourceChoice §5;
  a2w1 ScribeErrata E3; re-checked at `4181fff`)
```

**Evidence.** `QUALITY.md:461-463`; `check-decision-table.mjs:283,286`; selftest run in
`receipts/verification.txt`; `CritSourceChoice.md:132-166`; `baseline/README-receipts.md:14`; `probe-out.txt` E3-a/E3-b.

---

## E4 — criterion 80's boundary case: the lower-case modal

**Re-check.** The queue's instance moved and narrowed. The row is **D12**, not D14
(`corpus/knowledge/rate-signal-decision-table.md:60`), its Decision cell reads "SHOULD strength (GitHub REST API
policy)" over a quote whose only modal is the vendor's lower-case "you should not", and the entry's own errata already
records the fact: `:199-201` "its directive is the vendor's lower-case \"you should not\", which the cell renders as
SHOULD strength without RFC 2119 capitals in the quote". The entry's marker rule (`:36-41`) defines `(derived)` as the
case with "no RFC 2119 keyword in capitals, no lower-case directive addressed to the caller" — so a lower-case
directive is force and the marker is correctly absent. Criterion 80 (`QUALITY.md:457-460`) lists the same three force
classes, so **the marker half of E4 is decided by the criterion as written**; the queue's premise ("the criterion does
not say") is now too strong.

What is genuinely open is the **rendering**: criterion 80 takes "the source's normative keyword **as written**", and
D12's cell capitalises a lower-case modal. Nothing in the criterion forbids it, and a reader can read "SHOULD strength"
as a quotation.

**Verdict.** Partly expired, partly open. The instance is decided and disclosed; the criterion-level ambiguity that
remains is capitalisation in a Decision cell.

**Disposition — DRAFT (criterion) + DRAFT (entry record).** Target 1: `corpus/QUALITY.md`, append at EOF (file ends at
`:491`, criterion 82; a new `## Round 32 additions (append-only; never edit above)` heading precedes it — the L1 assigns
the number):

```markdown
83. A lower-case modal in a located quote ("you should not", "must not", "may assume") is a directive the page
    addresses to its reader — force under criterion 80 — so a row resting on it does not carry `(derived)`. Because
    criterion 80 takes the source's keyword "as written", a Decision cell must not render that modal as a capitalised
    keyword: state the directive and its case ("directive — the vendor's lower-case 'you should not'") and leave
    MUST/SHOULD/MAY to quotes that carry them in capitals. Red state:
    `corpus/knowledge/rate-signal-decision-table.md:60` (D12, "SHOULD strength" over a lowercase-only quote).
    (source: a2w1 ScribeErrata E4; entry errata `:199-201`; re-checked at `4181fff`)
```

Target 2: the entry, appended at EOF inside "## Errata — round 31, attempt-2 falsify wave a2w1":

```markdown
- **D12's "SHOULD strength" is a rendering, not a quotation.** The located quote carries no RFC 2119 capitals; the
  cell's capitalisation reads as one. Read the row as the vendor's lower-case directive (`:199-201`) and write later
  cells in the directive's own case (criterion 83). (a2w1 ScribeErrata E4; re-checked at `4181fff`)
```

**Evidence.** `rate-signal-decision-table.md:36-41,60,199-201`; `QUALITY.md:457-460`; `receipts/verification.txt`
§"D12 row and its errata bullet".

---

## E5 — M7's evidence pointer cites a constant nothing reads

**Re-check.** Holds, and it is one instance of a **class that grew**. At v3 (`scripts/check-selfassessment.mjs` sha256
`77b5c8ed…`): `TALLY_PATTERNS` is declared at `:130-135` and still has **one** `git grep` hit — the declaration
(no reader). The live extraction is inline in `m1Findings` (`:202-260`), forms at `:212` and `:216`, mirrored for the
SKILL/README windows in `m1LogFindings` (`:308-411`, forms at `:318`/`:322`). The queue's proposed replacement pointer
(`:189-203`) was read against v2 and is **itself stale** at v3 (`:189-203` now spans the tail of `gateTally` and the
head of `m1Findings`, which starts at `:202`).
M7's substantive claim survives: no `cli_cases`/`<name>_cases` detector exists anywhere in v3 (`grep "_cases"`: 0
hits), and `SKILL.md:2474` still reads `(cli_cases=36, helpers=4)`.
Wider class at this revision — every `scripts/check-selfassessment.mjs:<line>` pointer in
`corpus/lessons/round-31.md` was read against v2 (`4860483`) and lands on different code after the v3 rewrite
(`2f8535c`), which *added* code above them:

| lesson line | pointer as written | v3 reality | state |
|---|---|---|---|
| `:66` (M1 row) | `:172-179` summary oracle; regression case `:685` | oracle `:183-190`; case at `:806` | drifted |
| `:67` (M2 row) | `:422-425` windows; `:315-320` association | windows `:524-527`; association `:333-338` | drifted |
| `:72` (M7 row) | `:122-127` = the detector | `:130-135` = dead constant; live forms `:216`, `:322` | drifted, misleading |
| `:73` (M8 row) | `:167` parent env forwarded | `:175` | drifted |
| `:91` (M1 subsection) | `:172-179` | `:183-190` | drifted |
| `:123` (M2 subsection) | `:286-320`, `:422-425` | `:308-338`, `:524-527` | drifted |
| `:159` (M4 subsection) | `:167` | `:175` | drifted |
| `:212` (M7 subsection) | `:122-127` | `:130-135` / `:216` | drifted, misleading |
| `:236` (M4 subsection) | `:167` | `:175` | drifted |
| `:346` (M11 row) | `:180-181`; `gateTally :159-186` | `:183-190`; `gateTally :153-200` | drifted |

Two of the ten are actively misleading (`:72`, `:212`): a reader is told the detector is the constant, which reads
nothing. The rest land on neighbouring code.

**Verdict.** Holds, wider than recorded; the queue's own corrected pointer has already rotted once.

**Disposition — DRAFT.** Target: `corpus/lessons/round-31.md`, appended at EOF under the same
`## Corrections — round 32 (append-only)` heading as E1:

```markdown
- **Every `scripts/check-selfassessment.mjs` line pointer in this lesson predates v3.** The counter was rewritten at
  `2f8535c` (v3 adds the m4 class and the non-clean refusal; sha256 `77b5c8ed…`), and v3 inserted code above every
  line this lesson cites. Symbol map at `4181fff`: `gateTally` `:153-200` with the summary-line oracle and its
  `verdict=` read at `:183-190`; `m1Findings` `:202-260` (the four tally forms inline at `:212` and `:216`;
  `TALLY_PATTERNS` `:130-135` has no reader — one `git grep` hit, the declaration); `m1LogFindings` `:308-411` with
  the per-line association at `:333-338` and the same forms at `:318`/`:322`; m3 `:412-424`; m4 `:426-513`;
  `evaluate` `:517`; self-test `:542`; the SKILL/README window reads `:524-527`; the regression case
  `v2-oracle-reads-summary-line-not-first-cases-token` `:806`.
  Re-based pointers: `:66` (`:172-179`→`:183-190`, `:685`→`:806`), `:67` (`:422-425`→`:524-527`,
  `:315-320`→`:333-338`), `:72` and `:212` (`:122-127`→`:130-135`, and the live forms are `:216`/`:322`),
  `:73`, `:159` and `:236` (`:167`→`:175`), `:91` (`:172-179`→`:183-190`), `:123` (`:286-320`→`:308-338`,
  `:422-425`→`:524-527`), `:346` (`:180-181`→`:183-190`, `gateTally :159-186`→`:153-200`).
  M7's finding is unchanged: no `<name>_cases` detector exists in v3 (`grep "_cases"`: 0 hits), so
  `SKILL.md:2474`'s `(cli_cases=36, helpers=4)` is still read by nothing. Rule for the next frozen-counter
  reference: cite the function or constant by name plus the counter's sha256, not a bare line span, in any document
  that outlives the counter's revision. (w1 RevCountersCode C2-7; a2w1 ScribeErrata E5; re-checked at `4181fff`,
  counter freeze `2f8535c`)
```

**Evidence.** `git grep -n TALLY_PATTERNS -- scripts/` → 1 hit (`:130`); `:202,212,216,318,322` line dump;
`lesson:66,67,72,73,91,123,159,212,236,346`; `grep "_cases"` 0 hits; `SKILL.md:2474`; `receipts/verification.txt`.

---

## E6 — `--live` attests the environment, not the cited origin

**Re-check.** Code unchanged at this revision: `curlFetch` (`scripts/check-decision-table.mjs:194-201`) is
`spawnSync("curl", [...])` — binary resolved through `PATH`, **no** `env:` option, `-q` only as the first curl argument,
no `--proxy ""`, no `--cacert`. Re-measured at the frozen bytes with the **default** fetcher (no injection): probe case
`E6-pathstub-live` exits 0, `admitted 1`, and the stub at `receipts/fakebin/curl` recorded the exact argv
(`-q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60 -o - -w …`). Nothing left the host.
This is the queue's arm A5 (fake binary on `PATH`); arm A3 (`HTTPS_PROXY` + `SSL_CERT_FILE` against a loopback CONNECT
MITM) was **not** re-run by this seat — it is read from the queue, not upgraded here.

**Verdict.** Holds. A `--live` pass is evidence about this host's `curl` resolution and environment, not about the
cited origin.

**Disposition — REFUSE the sensor change, LAND the quotation limit.** Reason: same freeze/not-claimed basis as E3.
Flip condition: a fetcher that pins the binary path, passes `--proxy ""` and an explicit `--cacert`, and runs with a
minimal child `env`; its red state is a `PATH`-substitution case (`receipts/probe-erratas.mjs` case
`E6-pathstub-live` fails once the binary is absolute) plus a proxy-set case. Draft record: see criterion 84, clause (a),
below.

**Evidence.** `check-decision-table.mjs:194-201`; `probe-out.txt` `E6-pathstub-live`; `receipts/fakebin/curl.calls`.

---

## E7 — a 200 page that merely echoes the quote passes `l1-live`

**Re-check.** `liveOk` (`:210-215`) ends in `normalise(res.body).includes(quote)`; `normalise` strips `<script>` and
`<style>` before tags (`:137`). Probe case `E7-echo-page-live` (injected fetcher, 200, body "We could not find that
page. Your query matched: <quote>") exits 0, `admitted 1`. The mirror-image false negative (a quote present only inside
`<script>`/JSON) follows from the same `normalise`, and the selftest pins the byte-side half of it
(`html-script-text-not-located`, `:357`); the live-side half is code-level [INFERENCE] — this seat did not build that
case.

**Verdict.** Holds.

**Disposition — REFUSE the sensor change, LAND the limit.** Reason and basis as E6. Flip condition: a canonical-URL or
byte-digest oracle on the fetched page (the receipt's `sha256` compared to the live body, normalised) with a soft-404
case and a script-only-quote case as red states. Draft record: criterion 84, clause (b), below.

**Evidence.** `check-decision-table.mjs:137,210-215,363`; `probe-out.txt` `E7-echo-page-live`.

---

## E8 — the fetched URL need only be a substring of the cited source cell

**Re-check.** `:251` unchanged: `!rows.get(id).source.includes(rc.url)` gates only that the receipt's URL is a
substring of the row's Source cell, and `liveOk(g.url, …)` then fetches the **receipt's** URL. Probe case
`E8-prefix-url-live`: receipt url `https://example.org` (site root), row cites
`https://example.org/spec.txt` — substrings hold, exit 0, `admitted 1`.

**Verdict.** Holds.

**Disposition — REFUSE the sensor change, LAND the limit.** Flip condition: require `rc.url` to equal the single
`https://` URL in the registry row's source cell (or the row's own anchor), with the prefix case as red state. Draft
record: criterion 84, clause (c), below.

**Evidence.** `check-decision-table.mjs:251`; `probe-out.txt` `E8-prefix-url-live`.

---

## E9 — two unparseable hosts compare equal

**Re-check.** `hostOf` (`:204-206`) returns `null` on a parse failure and the guard at `:212` tests `!==`. Demonstrated
on the lane's own bytes: the `hostOf` source sliced from `scripts/check-decision-table.mjs` and evaluated verbatim
returns `null` for `https://[::1` and for `https://[::1/spec`, so `!(a !== b)` is `true` — the guard passes. End to
end, probe case `E9-null-host-guard` (receipt url and effective url both unparseable, injected fetcher) exits 0,
`admitted 1`. Severity stays low for the **real** fetcher: `curlFetch` must return status 0 and `code === 200` before
the guard is consulted, and a refused authority does not produce a 200 — the queue's "no repro" reasoning is intact.
The vacuity is reachable for any fetcher that does return a 200 with an unparseable `%{url_effective}`, and for the
injected fetcher used in proofs.

**Verdict.** Holds, low.

**Disposition — REFUSE the one-line change this round, LAND the limit + the fix text.** Flip condition: the guard
becomes `if (!a || !b || a !== b) return false;` with a case whose two URLs both fail `new URL()` refused as
`l1-live`. Draft record: criterion 84, clause (d), below.

**Evidence.** `check-decision-table.mjs:204-206,212`; `probe-out.txt` `HOSTOF … guard_passes=true` and
`E9-null-host-guard`.

---

## Shared draft for E6–E9 (criterion 84)

Target: `corpus/QUALITY.md`, appended at EOF after criterion 83 (L1 assigns the number; if E4's criterion is not
landed, this one still stands alone).

```markdown
84. A `--live` pass attests only that this host, through `curl` as resolved by `PATH` with the operator's environment,
    received a 200 whose normalised body contains the quote. It is not an origin attestation and not a
    document-identity check: (a) `curlFetch` (`scripts/check-decision-table.mjs:194-201`) inherits the environment and
    resolves the binary by `PATH`, so a stub binary earlier on `PATH` — or `HTTPS_PROXY` plus `SSL_CERT_FILE` — reaches
    the same verdict (re-measured at `4181fff`: `.ufo/waves/round-32/w1/ScribeErrataA/receipts/probe-out.txt` case
    `E6-pathstub-live`, exit 0, admitted 1, no packet to the named host); (b) the test is `includes(quote)` on a
    normalised body (`:210-215`), so a soft-404 page that echoes the query and a page that serves the string anywhere
    both pass (`E7-echo-page-live`, exit 0), while a quote present only in a `<script>` block is invisible in the other
    direction; (c) the URL fetched is the receipt's, gated only by being a substring of the row's Source cell (`:251`),
    so a site root can stand in for the cited document (`E8-prefix-url-live`, exit 0); (d) two URLs that `new URL()`
    cannot parse compare equal (`:204-206`, `:212`), so the same-host guard is vacuous when both sides fail
    (`E9-null-host-guard`, exit 0). Until a counter pins the binary, clears proxy/TLS variables, requires the receipt
    URL to equal the documented URL and refuses an unparseable host on either side, a `--live` reading is quoted with
    the URL, time and digest of the fetch it actually made — never as "the cited host still says this".
    (source: a2w1 SentinelC1Live F1-F4; a2w1 ScribeErrata E6-E9; re-measured at `4181fff`)
```

---

## Queue delta for the L1

| item | queue's disposition | re-checked disposition at `4181fff` |
|---|---|---|
| E1 | corrected here | **not durable** — draft lesson correction (E1 block) |
| E2 | corrected here, no further action | **closed**, verified landed at `QUALITY.md:463-464` |
| E3 | rule landed, counter v2 carried | **rule landed**; sensor refused this round, limit record drafted; flip condition named |
| E4 | carried (wave-2 row read must rule) | **half expired** (marker decided by `:36-41`), rendering open → criterion 83 draft + entry bullet |
| E5 | corrected here | **not durable and widened** — 10 stale pointers in the lesson; symbol-map correction drafted |
| E6 | carried | **holds, re-measured (A5 arm only)** → criterion 84(a) |
| E7 | carried | **holds, re-measured** → criterion 84(b) |
| E8 | carried | **holds, re-measured** → criterion 84(c) |
| E9 | carried, low | **holds, re-measured, low** → criterion 84(d) |

Nothing above changes a frozen counter, a claim predicate, a control or a measured reading. No line of any lane file
was edited by this seat; every draft is text for the L1.
