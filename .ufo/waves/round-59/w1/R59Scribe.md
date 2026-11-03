# R59Scribe — round 59 wave w1 seat report

seat: **R59Scribe** (role: scribe) · lane: **tabi-shokunin** · round: **59**, wave **w1**
host: linux 7.2.11-arch1-1 x64 (node v24.21.0; /usr/bin/chromium 155.0.8059.84)
lane base revision: `4e7fb89d7b71a6fdf661680891440be6577759e8`
written: 2026-11-03

**This seat wrote NOTHING in `corpus/`.** Every corpus-facing artifact below is a DRAFT for
the L1 to integrate. Nothing in the fleet repo, in a sibling lane, in `.ufo/state/`, in
`.ufo/watchdog.log`, in `MANIFEST.json` or in `corpus/` was written by this seat. No VCS
mutation was performed (no `git commit/add/push/stash/checkout/reset`, no mutating `jj`).

---

## 1. What this seat produced

| Artifact (under `.ufo/waves/round-59/scribe/`) | sha256 | bytes |
|---|---|---|
| `gate-quote-verification.json` | `2f74e64ef16e98020a7aa2d0711c55b170b6e912d55fcacf4e3689252edf191f` | 185,233 |
| `verify-quotes.py` | `fe7e54c6f7c6c51afd440f229c7087a70a88a24137d10b4f1cbefe0579a0f04b` | 21,648 |
| `usedby-oldnew.txt` | `c1ad35b2423eb940c28bbac5096781f43a8aff044067bffbbee3f3f98c125c33` | 23,706 |
| `knowledge-note-draft.md` | `7d8060b4afe404efc93312a2fc398821b6469c2f71d87894f286918ab7f99802` | 24,576 |
| `quality-and-scorecard-drafts.md` | `ce1f7ac8ca46ddaa2e336c5b6d10724fbcbb5d9444cd296779533e053c4574db` | 16,330 |
| `corrections-of-record-draft.md` | `501ee45a72eb0abb9e53510363a09a6189eb45d36850b929370f68f969abba70` | 11,355 |
| `log-and-readme-drafts.md` | `604b72da1ee6f7bbb803f1cc3056a31a73915bd598a0fc84f3575ab10d5e644e` | 15,375 |

Each draft file was written **once**, fully composed, into the lane path. The
pre-final drafts were composed under this seat's scratch
(`/fast/scratch/hyaku/tabi-r59/R59Scribe/`) and copied in; the copies were then edited
**in the lane path only** (the `usedby-oldnew.txt` S162 guard section, the
`knowledge-note-draft.md` S162 grounding and limits, the `quality-and-scorecard-drafts.md`
D9 three-term table and D10 statement, the `log-and-readme-drafts.md` C2 bullet / registry
count / README row). The digests above are the **final** bytes.

`verify-quotes.py` is the reproducible instrument behind `gate-quote-verification.json`; the
JSON was produced by running it, not hand-written.

**Scratch deleted before yield** — `/fast/scratch/hyaku/tabi-r59/R59Scribe/` removed.

---

## 2. Item 1 — quote verification: **DONE, 34/34 distinct quotes rc=0**

`gate-quote-verification.json` (schema `tabi-r59-gate-quote-verification-v1`).

**Method.** Python byte search over the staged copies in `.ufo/waves/round-59/sources/`.
Per quote: the exact UTF-8 bytes, the byte length, the word count (whitespace and
tag-stripped), the byte-exact hit count file-wide, the raw line numbers of those hits, the
hit count scoped to the receipt's declared enclosing span, a `cmp` of the quote bytes
against the byte window cut from the receipt's **declared raw line span** (cmp rc=0 ==
byte-identical), and a tag-stripped match under **both** tag-strip conventions.

**Result.**

```
quoteRows=70  distinctQuotes=34  rc0=70  rc1=0  absenceMarkers=6  failures=0  clean=True
```

- **34 distinct quotes**, all **rc = 0** (verified at their named raw lines). 0 failures.
- The 70 rows are the 34 distinct quotes counted across the receipts' two parallel
  location arrays (the S161 receipt carries the same 21 locations under both the
  `locatiions` and `locations` keys — the scout's own spelling — and the nested
  `rows[0].located_ground` tree repeats them); the receipts are audited in full, so no
  located quote is skipped.
- **6 absence markers** recorded separately: the terms `latch`, `toggle` and the
  "CapsLock toggle/latch state machine" (S161), each classified by the receipt as absent.
  An absence marker is **not** a quote and is not byte-searched; it is recorded with the
  receipt's own classification.

**The tag-strip caveat, discharged explicitly.** The receipts record some quotes as the
**tag-stripped text** (markup removed) rather than as raw markup bytes. Two conventions are
in play and the verifier tests **both**, recording which one matched:

| convention | behaviour | quotes matched |
|---|---|---|
| strip-to-space | `<[^>]+>` -> `" "` (the frozen gate's `normalize()`), entities unescaped, whitespace collapsed | most |
| strip-to-empty | `<[^>]+>` -> `""` (no space left at the tag boundary) | 8 |

The difference is real and load-bearing: under strip-to-space the §4.3.1 prose reads
`"…such as CapsLock , NumLock , or ScrollLock ."`, while under strip-to-empty it reads
`"…such as CapsLock, NumLock, or ScrollLock."`. **The first verifier run reported 20
failures on this axis alone**; they were convention differences, not misquotes, and the
verifier was corrected to test both conventions rather than to declare a failure. Every
quote matches under at least one convention, and the matched convention is recorded per
quote in `tagstrip_evidence.matched_convention`.

**Verification of the receipts themselves** (read-only, this seat):

| Receipt | sha256 | staged bytes | digest == staged | guard |
|---|---|---|---|---|
| `scout/reopen-receipt-s161.json` | `db250d138e6655314ba0607726a7da0e322901fe5d35fb98f890bdc40ffec915` | `sources/uievents.html` 920,762 B | **yes** (`8ded5eaf…`) | final host `www.w3.org` == cited host; `num_redirects 0`; HTTP 200; `size_download 920762`; `content_type text/html; charset=utf-8`; `refused false`; `anchorMatch true` |
| `scout/reopen-receipt-s153.json` | `9e12ae4c2c8109b0964dfc621763824f7cf0ab181824a872a55763c51810c38d` | `sources/browser_protocol.json` 1,423,170 B | **yes** (`d6737c31…`) | final host `raw.githubusercontent.com` == cited host; `num_redirects 0`; HTTP 200; `size_download 1423170`; `content_type text/plain; charset=utf-8`; `refused false`; `anchorMatch true` |

Both fetch guards satisfy R57-S3 in full (final host = cited host, `num_redirects 0`, byte
count, sha256).

**Reproducibility.** Re-running the verifier over the same receipts and staged bytes
reproduces `gate-quote-verification.json` **byte-identically** (`cmp` rc=0 against the
committed copy, sha256 `2f74e64e…` unchanged) — the receipt is an instrument output, not a
hand-written claim.

**Notable locations** (all confirmed by this seat's own byte search, independently of the
receipt):

| term | raw line | classification |
|---|---|---|
| `getModifierState(keyArg)` | 3327 | **definition site** (`<dfn … id="dom-keyboardevent-getmodifierstate" data-dfn-for="KeyboardEvent" data-dfn-type="method" data-export>`) |
| `getModifierState` return contract | 3333–3334 | prose (normative return-value contract) |
| `modifierCapsLock` | 3569 | definition site (`id="dom-eventmodifierinit-modifiercapslock"`) |
| §4.3.1 state activation | 4790–4791 | **prose in a normative section** |
| §4.3.1 state change on keydown | 4791–4792 | prose in a normative section |
| §7.3.3 CapsLock VK 20 | 6370–6372 | table entry |
| `modifiers` bit field | 14323 (S153) | parameter description (5 file-wide, 1 in scope) |

---

## 3. Item 2 — registry used-by extension (old -> new) + anchor re-open notes

`usedby-oldnew.txt`. **Old and new cell strings are byte-exact** — copied from the
committed registry programmatically and re-verified after writing (the OLD strings compare
equal to the registry's cell 11; the NEW strings are the OLD strings plus exactly the two
round-59 paths).

| row | OLD | NEW | Δ |
|---|---|---|---|
| **S153** (line 167) | 20 paths, ending `…chromium-preventdefault-swallow-round-58.md, corpus/lessons/round-58.md` | the same + `corpus/knowledge/chromium-capslock-boundary-round-59.md, corpus/lessons/round-59.md` | 22 paths |
| **S161** (line 175) | 8 paths, ending `…chromium-preventdefault-swallow-round-58.md, corpus/lessons/round-58.md` | the same + the same two paths | 10 paths |
| **S162** | — (NEW row, no old cell) | `corpus/knowledge/chromium-capslock-boundary-round-59.md, corpus/lessons/round-59.md` | new row |

**Registry count 161 -> 162** (S162 is new this round; S153 and S161 are re-opens that
extend existing rows). The L1 confirmed this count.

**Anchor-cell re-open notes** are drafted for both re-opened rows, in the r56/r57 shape
(an appended `; RE-OPENED 2026-11-03 (round 59): …` clause carrying the digest and the
located ground), and **flagged as riding outside the strict v1 columns** under the pending
operator/aggregator ruling (the r56 lesson's routed defect N4; the r57 lesson's routed
defect 5). The drafts state explicitly that no id, quote, status, tier or opened cell
changes.

**Apply-order warnings carried in the file** (verified against
`scripts/sources-census.sh`): both new paths must exist on disk before the registry edit
lands, or the census emits `E11 used-by path missing on disk` (the census's
`usedby_findings()` checks every used-by path of every `mined` row under the `## Registry`
heading with `[ -e "$dir/$path" ]`); status must stay `mined` for the extended rows (the
E11 check only runs on `mined` rows — changing the status would skip the check, not
satisfy it).

---

## 4. Item 3 — knowledge-note draft

`knowledge-note-draft.md` — drafts `corpus/knowledge/chromium-capslock-boundary-round-59.md`.

Opens with the **provenance trio** (`source:` S161 + S153 + S162 with URLs and anchors;
`verified-at:` this round; `recheck:` the round's recheck command plus the Gate check, with
`on-release` for S161 and `90d` for S153 per the rows). Then: the question-and-scope line,
the Grounding section (S161's `getModifierState` definition site, §4.3.1's latch prose,
§7.3.3's CapsLock VK 20, S153's `dispatchKeyEvent` parameters and four-bit modifiers field,
S162's `GetEventModifiers` definition), the measured table, the disclosed CDP injection
limit, the D4 positive control, the D1/D2 counter checks, Limits, and the D9 note.

**Re-anchored to the L1's pre-data restatement of C2.** The original frozen C2 asserted a
latch sequence; the L1 restated C2 (pre-data, disclosed in `claims.json`'s
`preDataCorrection.c2Restatement`) as the **measured-negative delivery-boundary** claim
`chromium-keyevent-delivery-boundary-linux`. The note's measured model is therefore:

> the CapsLock events **DELIVER** (key, code, keyCode 20, cancelable true, defaultPrevented
> false) on every recorded event, while the page's own `getModifierState('CapsLock')` reads
> **FALSE** on every recorded event — down, up, and every subsequent letter.

The note keeps an explicit **"What S161 does and does not define here"** section, with the
**three separate D9 classifications** never collapsed into one verdict: `getModifierState` =
definition site; the CapsLock latch semantic = **prose in a normative section, not a
`<dfn>`-marked term definition**; `GetEventModifiers` = the function definition. It also
records that S161's **Modifier Keys table is a cross-reference** to the external
`[UIEvents-Key]` specification and that the terms "latch" and "toggle" are **absent** from
S161's specification text.

**Cells the L1 fills** are marked `L1-at-data` (the live run's facts: receipt path, nonce,
driver and counter digests, the field-value column, the note's own limits paragraph) and
`L1-at-S162` (the S162 fetch's guard fields and anchor). **No digest, byte count or anchor
is invented for S162.**

---

## 5. Item 4 — QUALITY.md criterion 111 draft + the D10 SCORECARD statement

`quality-and-scorecard-drafts.md`.

**Criterion 111** (the next number after 110, the current maximum), to be appended under a
new `## Round 59 additions (append-only; never edit above)` header with **no criterion above
110 edited, renumbered or moved**. The criterion text names the definition-site sweep as
RUN + RECORD before the freeze, distinguishes a local definition site from a
cross-reference anchor, and carries the **red state**: the r58 claim cited S161 for
`defaultPrevented` and passed freeze with no sweep; the sweep over the r58 staged bytes
finds **no** definition site (all four occurrences resolve to the DOM Standard by
reference), citing `.ufo/waves/round-59/probes/d9-red-before-defaultprevented.txt`. The
draft's scope is written to match the probe receipt's own scope note — *the obligation is
to run and record, not to require the term to be defined in the cited source*.

**The D9 green sweep's four terms** are tabulated with their separate classifications (see
item 1's table above), and the middle one is flagged as the round's honesty case. The green
receipt (sha256 `7e4c71b4…`) **landed** during this seat's work; the drafts cite it, and
this seat's independent byte sweep **agrees with it on every term** and **caught a
mis-attribution in its first write** (finding F6 below), which the probes seat corrected
with a disclosed correction-of-record note. The draft carries that correction forward so
the lesson's Gate rows cite the **scoped** `dispatchKeyEvent` lines rather than the
unscoped first-file-wide hits.

**The D10 SCORECARD statement** is drafted verbatim for the round-59 block: C2 is a
capability-only claim; the **coverage axis score is held at 9** because `AXES.md`
§Capabilities keeps the capabilities table separate from the six scored axes (the AXES.md
sentence is quoted verbatim and was re-read against the fleet file this seat); repertoire
growth is not axis movement. A second paragraph covers the case this round actually
raised: **a capability that is a measured negative still enters the table on the same
terms** — admitted on the strength of a passing, committed, counter-verified demonstration,
with the "what it can now do" line describing the *measurement*, not a working CapsLock
modifier.

---

## 6. Item 5 — D3/D6 corrections-of-record paragraphs

`corrections-of-record-draft.md`. Both are drafted as **append-only** items for the round-59
lesson's corrections section; `corpus/lessons/round-58.md` is **not** edited.

**D3 — the absent-receipt refusal shape.** The draft records that the r58 spot-check's
"couldNotEvaluate []" wording was measured against a **working-copy snapshot**
(sha `7ff9846f…`, untracked, changed twice during the review — `.ufo/waves/round-58/reviewer/R58Reviewer.md:13`),
while the **frozen** counter at `632e62e4…` (unchanged at the round-59 baseline `4e7fb89d`)
emits **exit 1, `predicate: false`, `findingCount: 1`, `findings: [{id: "receipt-missing"}]`
and a NON-EMPTY `couldNotEvaluate: [{check: "receipt-load", code: "receipt-absent"}]`** —
the `receipt-absent` entry is pushed at `.ufo/waves/round-58/counters/chromium-receipt-r58.mjs:717`,
on the same branch as the finding at line 716. It cites the round-open control
(`.ufo/waves/round-59/controls/c2-counter-absent-receipt.json`) and the independent re-run
(`.ufo/waves/round-59/probes/d3-absent-receipt-shape.json`, `shapeIdenticalApartFromPaths:
true`) and notes that the frozen r59 claim text already carries the corrected shape. The
standing rule it installs: *a refusal shape is recorded against the frozen instrument
bytes, never against a working-copy snapshot.*

**D6 — the citation re-pointed at committed bytes, with the six keys named and the match's
nature stated.** The draft names the six swallow-block keylog entries behind "6 block
entries → 6 page entries" — the control digit **7**, the control digit **5**, the swallowed
**Backspace**, the swallowed digit **b**, the **Control** modifier, the **Enter** of the
Ctrl+Enter chord — with their triples, and states that the match is an **EXISTENCE match by
value, not a positional match** (the page keylog interleaves keyDown/keyUp pairs, 138
entries / 69 keydowns, while the swallow block occupies indices 126–137). It discloses the
**uniqueness caveat** (7 matches 6 page entries, 5 matches 14, Control matches 4; only
Backspace/b/Enter carry a unique triple), and points at the committed
`.ufo/waves/round-58/sentinel/evidence/page-vs-recorded-attack.json` (1,059 B, sha256
`2419d147…`) as the citable replacement for the r58 lesson's scratch path
`/fast/scratch/hyaku/tabi-r58/L1/forge` (`corpus/lessons/round-58.md:60`).

**This seat independently re-derived the six-entry match** from the committed r58 receipt
(`corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json`, 70,689 B, sha256
`1d0c1389…`, nonce `tabi-r58-75b513ebbf9f`): **6/6 existence matches**, with the same
match-index sets (7 → [18,19,78,79,126,127]; 5 → 14 indices; Backspace → [130]; b → [132];
Control → [114,117,134,137]; Enter → [135]). The draft's numbers agree with the probe
seat's `probes/d6-six-entries.json` (sha256 `e4e5d885…`, 10,876 B).

**The maskability is now MEASURED, and the draft carries it.** The probe receipt's six-case
`maskabilityTest` (in-memory clones of the committed receipt; no lane bytes mutated) shows
the D1-style existence-by-value rule **catching a contradicted swallow** (forging the
swallowed Backspace at page index 130 → red, `misses: backspace-swallow`; the Enter at 135
→ red, `misses: ctrl-enter-enter`) while a forge on any of the three **non-unique** entries
(control digit 7 at 126, control digit 5 at 12, Control modifier at 134) leaves the rule
**green** — an equal-valued twin survives. The honest consequence, which the draft states:
the D1 check as specified protects **exactly the entries the claim's witness rests on** (the
swallowed keys) and cannot, by itself, assert the non-swallow control entries' flags; a
counter that also matched per-window occurrence counts, or matched the keyDown only, would
be strictly stronger.

---

## 7. Item 6 — LOG.md round-59 entry skeleton + README.md row draft

`log-and-readme-drafts.md`.

**LOG.md skeleton** — appended below the round-58 block, same shape as the round-58 entry
(baseline → freeze → data → work commit; the two claims; the attack wave; findings routed;
SOURCES; mistakes mined; carry-in performed; assimilation; wave shape). Every cell this
seat cannot know is marked **`L1-at-data`** — the freeze commit, the data revision, the
driver and counter digests, the nonce, the PNG count, the selftest case count, the kill
verdicts, the seat verdicts and the census end. The draft states plainly that **no
`L1-at-data` marker may be landed unfilled**.

The C1 bullet carries the **L1's corrected counts** `{roster 20, mapRows 16, auditRows 16,
deltaLanes 20, bgScreenSiblings 20}` (claims.json's `preDataCorrection`, pre-data). The C2
bullet carries the **restated** capability and the measured negative. The SOURCES bullet
says **`registry 161 -> 162`**.

**README.md row** — `## Round 59 coverage addition — the CapsLock delivery boundary
(2026-11-03, Linux host)` with the three-column `| Note | Holds | Sources |` row for
`knowledge/chromium-capslock-boundary-round-59.md` and the closing line
`Registry 161 -> 162 (S162 NEW this round …)`.

---

## 8. Findings this seat raised (reported to the L1, `agent://TabiR59`)

**F1 — the S162 guard receipt at `sources/s162-guard.txt` did not describe the staged
bytes. RAISED, AND NOW RESOLVED.** At this seat's first measurement the file read verbatim:
`final_url=…/input_handler.cc?format=TEXT redirects=0 code=503 size=0` — HTTP 503, size 0,
**no sha256** — while the file beside it was 89,463 B of real Chromium source. This seat
reported the mismatch to the L1; **R59Sentinel raised it independently as its finding F-3
(HIGH, "S162 had no conforming fetch-guard record") and the L1 remediated it**. The
conforming receipt now in the lane is
`.ufo/waves/round-59/sources/s162-fetch-receipt.json` (final host
`chromium.googlesource.com` == the cited host, `numRedirects 0`, HTTP 200; transport
119,284 B base64 sha256 `847c531e…`; staged decoded 89,463 B sha256 `72cf0d1d…`;
`locatedQuote` at raw 92; the four branches and the "NO CapsLock branch" note), with
`.ufo/waves/round-59/sources/README-S162.md` beside it; `s162-guard.txt` stays as the
historical record of the failed probes. This seat's own cross-checks stand: `cmp` between
the runner's staged copy and the L1's staged copy **exits 0 — byte-identical**, both
sha256 `72cf0d1d…`; the runner's meta receipt records the same fetch fields. **The row's
anchor must carry the DECODED digest plus the transport digest and the base64 note** —
`usedby-oldnew.txt` carries a drafted anchor text for it.

**F2 — the claims' `kCapsLockOn` half is not in the S162 bytes.** `claims.json`'s
`preDataCorrection.c2Restatement` says "Blink reads WebInputEvent::kCapsLockOn (1<<9) and
CDP's GetEventModifiers maps only bits 1/2/4/8". The second half is exactly what the bytes
prove; the first is **absent** — a case-insensitive sweep for "caps" over all 89,463 bytes
returns **0 hits**, and `kCapsLockOn` is 0 hits in the file. The constant lives in a
different Chromium header (`third_party/blink/public/web_input/web_input_event.h`), not
staged and not in the registry. **This is the D9 class the round exists to close.**
The lane has independently reached the same scoping in **five** places: this seat's byte
sweep; the runner seat's probe header (`runner/probe-capslock.mjs:14-16`) and its meta
file's `locate` field ("the caps-flag half of the boundary is the measured absence
below"); the runner's report (`w1/R59Runner.md:115` — "no `kCapsLockOn`/`1<<9` identifier
appears in the driver"); the sentinel's report (`w1/R59Sentinel.md` F-3 — "no CapsLock
branch - the CDP channel exposes no CapsLock bit"); and the L1's own
`sources/s162-fetch-receipt.json` `locatedGround` field, which credits this seat's
verification. **This seat's drafts adopt that scoping**; the L1's call remains whether to
stage a second source for the Blink constant.

**F3 — the D9 classification of the CapsLock latch semantic is "prose", not "definition
site".** S161 §4.3.1 states the latch model in normative prose (raw 4785–4792) with no
`<dfn>`-marked term; the terms "latch" and "toggle" are absent from S161's specification
text, and the Modifier Keys table is a cross-reference to `[UIEvents-Key]`. The D9 green
probe **landed and confirms this seat's reading on every term** — `getModifierState` = a
local dfn (raw 3327); `CapsLock` = **no dfn for the string**, with the same four local loci
(4791 / 6370–6371 / 3574 / 3569, the last being the `EventModifierInit` initializer, a
DIFFERENT term); `key` and `windowsVirtualKeyCode` = dispatchKeyEvent parameter
definitions; S162 = zero CapsLock occurrences. The L1 ruled to KEEP raw 3569 in the note,
classified exactly as this seat worded it. The probe's verdict is GREEN (3 of 4 terms carry
a dfn; CapsLock carries no dfn but four local loci). **Four separate D9 classifications
must survive into the lesson and the note, never collapsed.**

**F4 — the note name changes.** `chromium-capslock-boundary-round-59.md`, **not**
`-toggle-`, following the restated claim. The used-by extension names the boundary note.

**F5 — the registry count is 161 -> 162**, not 161 -> 161.

**F6 — the D9 green receipt's structural block mis-attributed two raw lines. RAISED BY THIS
SEAT, CORRECTED BY THE PROBES SEAT.** The receipt's first write printed the first
**file-wide** hit for two terms — `"name": "key"` at raw **3053** (`EventMetadata.properties`)
and `"name": "code"` at raw **2702** (`InspectorIssue.properties`) — because its line lookup
was unscoped; both are unrelated domain types, not `dispatchKeyEvent` parameters. The
correct scoped lines (the `dispatchKeyEvent` block starts at raw 14307) are **code 14352 /
key 14358 / windowsVirtualKeyCode 14364 / text 14334 / modifiers 14322**. This seat's
independent byte sweep caught it; the L1 relayed it; **R59Probes corrected the receipt**,
re-verified the scoped lines with `awk 'NR>=14307 && NR<=14460 && /"name":/ …'` (15
parameters in order), and kept the wrong values **only inside a correction-of-record note
that names them**. Final receipt: sha256
`7e4c71b47ae875c1dbd0017eb90de93ec7ef67425b3cfce2486df3ab2dc453ad`, 32,218 B. **The
lesson's Gate rows must cite the SCOPED lines** — 3053 / 2702 would point readers at
unrelated domain types in the same 1.4 MB file, which is the same class of defect
criterion 111 exists to close. This seat's drafts already carry the scoped lines (they are
the spans its own byte-exact quote verification confirmed).

---

## 9. Commands run by this seat (every one, with its outcome)

| # | command (cwd) | outcome |
|---|---|---|
| 1 | `jq -r '.claims[] \| …'` on `.ufo/waves/round-59/claims.json` | read C1/C2 statements, kill rules, do-nothing controls, frontierStep; exit 0 |
| 2 | `jq -r '.preDataCorrection'` (same) | read the L1's two pre-data corrections (C1 counts; C2 restatement); exit 0 |
| 3 | `sed -n '167p;175p' corpus/SOURCES.md` | read the S153 / S161 rows; exit 0 |
| 4 | `split(' \| ')` on lines 167/175 | cell map confirmed: 11 cells, used-by = cell index 10 (registry cell 11) |
| 5 | `git show 71f71dd5:corpus/SOURCES.md` / `git show 71f71dd5^:…` + per-cell diff | r58's only change to the two rows was the used-by cell; the anchor cell was NOT touched in r58 |
| 6 | `git log --oneline -- corpus/SOURCES.md` | 12 commits; r56/r57/r58 used-by + anchor precedents read |
| 7 | `grep -n 'fast/scratch/hyaku/tabi-r58' corpus/lessons/round-58.md …` | located the D6 stale scratch citation at `corpus/lessons/round-58.md:60` |
| 8 | `sha256sum` / `wc -c` on the r58 staged `uievents.html` + `browser_protocol.json` | 920,762 B `8ded5eaf…`; 1,423,170 B `d6737c31…` |
| 9 | `grep -n -i 'getmodifierstate'` on the staged uievents.html | 40 hits; the `<dfn>` definition site at raw 3327 isolated |
| 10 | `grep -n -i 'capslock'` on the staged uievents.html | 10 hits; the modifierCapsLock dfn (3569), the §4.3.1 prose (4790–4792), the §7.3.3 table row (6370–6371) isolated |
| 11 | `grep -n -E 'id="[^"]*defaultprevented"'` + `grep -c -i 'defaultprevented'` | 4 occurrences, all DOM-Standard cross-references — corroborates the D9 red state |
| 12 | python tag-strip of raw 4789–4791 under both conventions | strip-to-space vs strip-to-empty differ at the tag boundary (`CapsLock , NumLock` vs `CapsLock, NumLock`) — the cause of the 20 first-run failures |
| 13 | python: locate `dispatchKeyEvent` params in the staged S153 | `code` 14352, `key` 14358, `windowsVirtualKeyCode` 14364, `text` 14334, `modifiers` 14322/14323 |
| 14 | python: the r58 receipt's swallow-block entries vs `pageKeylog` | **6/6** existence matches; the three unique and three non-unique entries identified |
| 15 | `sha256sum` + `grep -n "receipt-absent"` on the r58 counter | frozen sha `632e62e4…` at the baseline; the `receipt-absent` push at line 717, the `receipt-missing` finding at 716 |
| 16 | `cat .ufo/waves/round-58/reviewer/receipts/r58-counter-absent-receipt.json` | the `couldNotEvaluate: []` receipt being corrected — measured at the untracked snapshot sha `7ff9846f…` |
| 17 | `sha256sum` + `sed -n '85,115p'` on `sources/input_handler.cc` | 89,463 B `72cf0d1d…`; `GetEventModifiers` at raw 92; the four branches at 103–110 |
| 18 | `grep -c -i 'caps' input_handler.cc` + `grep -o 'blink::WebInputEvent::k[A-Za-z]*' \| sort -u` | **0** caps hits; the 10 `k*` constants listed — F2 |
| 19 | `cat sources/s162-guard.txt` | the HTTP-503 / size-0 / no-sha256 record — F1 |
| 20 | `cmp runner/probe-source-input_handler.cc.txt sources/input_handler.cc` | **rc=0, byte-identical**; the runner's independent S162 staging corroborates the bytes |
| 21 | `python3 .ufo/waves/round-59/scribe/verify-quotes.py …/gate-quote-verification.json` (run 1) | 12 quotes, 12 rc0 — **INCOMPLETE**: the verifier harvested only `rows[0]`, missing the receipts' top-level location arrays |
| 22 | same (run 2, after the harvest fix) | 66 quotes, 46 rc0 / 20 rc1 — the 20 were tag-strip **convention** differences, not misquotes |
| 23 | same (run 3, after the two-convention fix) | 66 quotes, 66 rc0, 0 failures |
| 24 | same (run 4, after the absence-marker fix) | 70 rows / 34 distinct, 70 rc0, 6 absence markers, 0 failures, `clean=True` |
| 25 | `python3 …/verify-quotes.py /tmp/summary-test.json --summary` | exit 0 — the `--summary` mode initially raised `KeyError: 'quotes'` after the counts rename; fixed and re-run |
| 26 | python comparison of the draft's OLD/NEW used-by strings against the registry | the OLD strings compare **equal** to the registry cells; the NEW strings extend them by exactly the two round-59 paths |
| 27 | `sha256sum` on the S161/S153 receipts + `sha256sum` on their staged bytes + the receipts' `fetch_guard` | both digests == the staged bytes; both guards R57-S3-complete |
| 28 | `grep -n 'usedby_findings'` / `sed -n '538,575p' scripts/sources-census.sh` (fleet, read-only) | the E11 dangling-used-by check confirmed |
| 29 | `grep -n -A4 -i 'anchor cell' corpus/lessons/round-56.md` / `round-57.md` | the N4 in-place-append precedent and its pending-ruling disclosure |
| 30 | `tail`/`grep` over `corpus/QUALITY.md`, `corpus/README.md`, `LOG.md`, `SCORECARD.md`, `AXES.md` (fleet, read-only) | criterion 110 confirmed as the maximum; the round-58 README/LOG/SCORECARD shapes and the AXES.md capabilities quote confirmed |
| 31 | `read` on `.ufo/waves/round-59/probes/d9-green-capslock.txt` (landed late) | the D9 green sweep: 4 terms + the S162 supplementary; GREEN verdict; **and** its structural block's mis-attributed `key`/`code` raw lines — F6 |
| 32 | `grep -n '"name": "code"'` / `'"name": "key"'` / `'"name": "text"'` + `sed -n` context on the staged S153 | every occurrence enumerated; the enclosing types of the 3053 / 2702 hits identified as `EventMetadata.properties` and `InspectorIssue.properties`; the scoped lines 14352 / 14358 / 14364 / 14334 / 14322 confirmed |
| 33 | `awk 'NR>=14307 && NR<=14460 && /"name":/' browser_protocol.json` | the 15 `dispatchKeyEvent` parameters in order — independently reproduced the probes seat's re-verification |
| 34 | `sha256sum` + `wc -c` on the corrected `probes/d9-green-capslock.txt`; `grep` for its CORRECTION OF RECORD block | sha256 `7e4c71b4…`, 32,218 B; the correction names 3053 / 2702 as `EventMetadata.properties` / `InspectorIssue.properties` and marks the scoped lines authoritative; the `modifierCapsLock` dfn at 3569 is labelled a DIFFERENT term (the initializer flag, not the latch) |
| 35 | `read` + `sha256sum` on the updated `probes/d6-six-entries.json`; `jq` of its `maskabilityTest` | the receipt grew 9,301 → **10,876 B** (sha256 `e4e5d885…`) and gained a six-case `maskabilityTest`: the D1-style rule turns RED on a forged swallowed Backspace / Enter and stays GREEN on the three non-unique control entries — the maskability is now MEASURED, and the D6 draft carries it |

**No network fetch was performed by this seat.** Every byte this seat cites was already
staged in the lane (by the scout, the L1 or the runner) or committed; this seat read them
read-only.

---

## 10. Limits of this seat's work (stated, not smoothed)

1. **This seat ran no browser and no instrument.** It authored no driver, counter or meter,
   made no live measurement, and took no data pass. Every "measured" statement in its
   drafts is either quoted from a **committed** receipt (with its path and digest) or marked
   `L1-at-data`.
2. **The knowledge note's measured table is a template**, not a result. Its field-value
   column and the `L1-at-data` cells must be filled from the live run; if the live run
   differs from the claim text, the note follows the live run.
3. **The D9 green sweep's own receipt is the R59Probes seat's artifact**, but it **landed**
   (sha256 `7e4c71b4…`, 32,218 B) and this seat's drafts cite it. This seat's independent
   byte sweep against the same staged bytes **agrees with it on every term** — and this
   seat's sweep **caught a mis-attribution in its first write** (F6), which the probes seat
   corrected with a disclosed correction-of-record note. The green sweep's per-term
   classifications are therefore double-sourced; this seat does not claim authorship of
   the sweep, only its independent corroboration.
4. **The S162 anchor cells are the L1's.** This seat measured the staged bytes (89,463 B,
   sha256 `72cf0d1d…`, `GetEventModifiers` at raw 92) and cross-verified the runner's
   independent copy byte-for-byte, but it cannot supply the fetch-guard record for a fetch
   it did not perform.
5. **No corpus file was written, so none of these drafts has been exercised by the census
   or the gate.** The used-by extension will fail the census's E11 check until both new
   paths exist on disk — that is expected and is stated in the draft.

---

## 11. Out of scope for this seat (not touched)

- C1's meter, rebind, mutants and the BG-screened surface (R59Meter / R59Rebind's paths).
- C2's driver, counter, live receipt and probe (R59Runner / R59Counter's paths).
- The D9 red-before / D3 / D6 probe receipts (R59Probes' paths) — read only, cited.
- The scout's staged bytes and receipts (R59Scout's paths) — read only.
- `corpus/SOURCES.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/lessons/`, `corpus/knowledge/`, `LOG.md`, `SCORECARD.md`, `AXES.md`, `MANIFEST.json`, `.ufo/state/`, `.ufo/watchdog.log` — **all untouched**.
- The fleet repo `/home/vgpnk/Projects/shokunin` and every sibling lane repo — read-only scans only.

---

## 12. Report trailer

Report: `.ufo/waves/round-59/w1/R59Scribe.md`

Artifacts produced by this seat (all under `.ufo/waves/round-59/scribe/`):

- `.ufo/waves/round-59/scribe/gate-quote-verification.json` — sha256 `2f74e64ef16e98020a7aa2d0711c55b170b6e912d55fcacf4e3689252edf191f`
- `.ufo/waves/round-59/scribe/verify-quotes.py` — sha256 `fe7e54c6f7c6c51afd440f229c7087a70a88a24137d10b4f1cbefe0579a0f04b`
- `.ufo/waves/round-59/scribe/usedby-oldnew.txt` — sha256 `c1ad35b2423eb940c28bbac5096781f43a8aff044067bffbbee3f3f98c125c33`
- `.ufo/waves/round-59/scribe/knowledge-note-draft.md` — sha256 `7d8060b4afe404efc93312a2fc398821b6469c2f71d87894f286918ab7f99802`
- `.ufo/waves/round-59/scribe/quality-and-scorecard-drafts.md` — sha256 `ce1f7ac8ca46ddaa2e336c5b6d10724fbcbb5d9444cd296779533e053c4574db`
- `.ufo/waves/round-59/scribe/corrections-of-record-draft.md` — sha256 `501ee45a72eb0abb9e53510363a09a6189eb45d36850b929370f68f969abba70`
- `.ufo/waves/round-59/scribe/log-and-readme-drafts.md` — sha256 `604b72da1ee6f7bbb803f1cc3056a31a73915bd598a0fc84f3575ab10d5e644e`

Tooling: **no tool was installed or upgraded by this seat** (none was needed; the verifier
is stdlib-only Python 3 — `hashlib`, `json`, `os`, `re`, `subprocess`, `sys` — and uses the
host's `cmp`). No `pacman` transaction (paused host-wide), no `uv tool` install, no binary
placed in `~/.local/bin` or any PATH directory.

Scratch: `/fast/scratch/hyaku/tabi-r59/R59Scribe/` — **deleted before yield**.
