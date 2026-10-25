# RevEntryBfcache — review of `corpus/knowledge/navigation-history-bfcache-evidence.md` at ad125e8

Seat: `L1Tabi24.RevEntryBfcache` (leaf reviewer, read-only). Scope: the entry
against `corpus/QUALITY.md` and `PROVINCE.md` — decision-table actionability,
protocol field names for the pinned tag, over-claims, Unknowns honesty,
duplication. All retained bytes re-derived; no tool output trusted.

Retained bodies exist committed at `corpus/evidence/round-24/sources/`
(added in f6f7f45); every digest below was re-computed, not read.

## Findings (severity order)

### F1 — HIGH: S105 "82548 bytes decoded" is a false measured anchor

Entry `:3` and its `source:` line state `82548 bytes decoded`. The committed
retained body `corpus/evidence/round-24/sources/page.pdl` is **61,911 bytes**
(`wc -c`), sha256 `e944a3b1…` (matches the entry). `wc -c
.ufo/.../ScoutCdpPage/page.pdl.b64` → **82,548**: the quoted figure is the
base64 envelope size, not the decoded size. The same wrong figure propagates
into `corpus/SOURCES.md` S105's evidence cell and
`corpus/lessons/round-24.md:16`. QUALITY 2 requires the measured anchor; this
anchor misreports the retained bytes. (C3's killRule is about quote absence,
not byte counts, so it does not catch this — the quote spans verify.)

### F2 — HIGH: U4's "quoted spans are dated, not stable" is contradicted by the retained diff

U4 (`:85-88`) states the article "changed between two fetches in this same
round … so its quoted spans are dated, not stable." Grounded observation part
is true — `diff` of the committed copy (sha `0dd45292`) vs the scout's copy
(`.ufo/waves/round-24/scratch/ScoutBfcacheWeb/bfcache.html`, sha `4535f93b`)
shows **exactly 4 changed lines in one hunk**: a `<script nonce>` and its
inline loader block (file lines ~3415/4125 region). No prose changed; the
three cited spans (lines 2511, 2531, 2893) are byte-identical across both
copies. The inference "quoted spans … not stable" is unsupported — the
retained evidence shows the quoted spans *were* stable across the two fetches
while only a script nonce drifted. Honest version: digest-level drift
observed (nonce/script block), quote-level stability observed in this pair.
QUALITY 3 (observation vs inference) and the honest-Unknowns axis both fail
here.

### F3 — MEDIUM: §1 claims "scroll position and form values survive" — absent from S104

Entry `:26` asserts a restore produces "a live document — script state, scroll
position and form values survive." S104 supports the JS-state half ("postpone
destruction and pause JS execution" near line 2508; line 2552: "a snapshot of
the entire page in memory, including the JavaScript heap"). But `grep -ic
'scroll'` on the committed `bfcache.html` → 2, both `scrollbars` nav markup;
zero occurrences of `form data|form values|form state|form field`. Scroll
position and form values are unsourced additions — a documentation over-claim
against QUALITY 2/14 (a source reading may not justify more than the source
states).

### F4 — MEDIUM: decision-table row 3 requires an incomplete capture; `notRestoredExplanationsTree` omitted everywhere

PDL `page.pdl:1715` carries `optional
BackForwardCacheNotRestoredExplanationTree notRestoredExplanationsTree`
(per-frame reasons, `url`/`explanations`/`children` at 1700-1701 + tree type).
The entry's row 3 requires only "the event with its full
`notRestoredExplanations` array"; §2 names only the array. A receipt built to
this table loses subframe refusal reasons on multi-frame pages. Also note
extending S105's anchor beyond "required `notRestoredExplanations`" needs a
supersession row per QUALITY 50 — the current row's anchor names only the
array.

### F5 — MEDIUM: PDL scope and ordering caveats dropped, weakening both markers

`page.pdl:1702-1705` states `backForwardCacheNotUsed` "Do not assume any
ordering with the Page.frameNavigated event" and fires "only for main-frame
history navigation where the document changes (non-same-document
navigations)". The entry reproduces neither: §2 calls it "the negative
marker: the navigation happened and the cache refused it" without the
main-frame/non-same-document scope, and no sentence warns the two signals
cannot be ordered by arrival. A receipt that correlates by sequence or reads
absence of the event on a same-document/subframe navigation as cache-success
is left unguarded. Grounded on the committed bytes.

### F6 — MEDIUM: §4.2 "must drop `--disable-back-forward-cache`" is not actionable as written

The flag is a **Playwright default**, not a lane-chosen launch arg: it sits in
`chromiumSwitches.ts` inside the retained `round-13` Playwright bundle
(`corpus/evidence/round-13/aria/node_modules/playwright-core/lib/coreBundle.js`)
and appears in the round-17 receipt's inherited `argv`/`effectiveArgv`
(49-entry launch arrays). Omitting it from a custom args list does not remove
it; a probe needs `ignoreDefaultArgs: ['--disable-back-forward-cache']` (or an
equivalent) — which the runbook sentence doesn't say. Relatedly, §0's "its own
probe harness has historically launched with `--disable-back-forward-cache`"
reads as a lane choice; the retained evidence shows an inherited default.
Actionable version of the instruction is one sentence longer; as written a
conforming probe still launches with bfcache disabled.

### F7 — LOW (admission hygiene, QUALITY 11): index count left stale by the admit

`corpus/README.md:575` states `ls corpus/knowledge/*.md | wc -l` → **42**
(dated 2026-10-25); the tree at ad125e8 holds **43** (`ls corpus/knowledge/*.md
| wc -l` → 43; `git ls-tree -r --name-only ad125e8 -- corpus/knowledge | wc -l`
→ 43). The admission commit f6f7f45 added the note; integration commit
ad125e8 touched `corpus/README.md` but updated only the frontier table (`:582`
— the sole `navigation-history-bfcache` pointer), leaving the dated count and
adding no map row or stated gap. Not an entry-bytes defect; the admit left the
index map one row short with no snapshot-gap statement.

### F8 — LOW (cosmetic): `multi-step-journey.md:215-219` starts one bullet early

The cited span contains the named rule (it lives at `:217-219`), but `:215-216`
is the preceding "client shows 200" bullet; a reader opening the span lands on
the wrong bullet first. Numbering verified with `awk NR>=213&&NR<=221`.

## Verified clean (sweeps attached)

- **Protocol field names — correct for the pinned tag.** `page.pdl:1341-1352`:
  `experimental type NavigationType extends string / enum / Navigation /
  BackForwardCacheRestore`; `:1352` `experimental NavigationType type` on
  `event frameNavigated`. `:1706` `experimental event backForwardCacheNotUsed`
  with `:1711-1713` `Network.LoaderId loaderId`, `FrameId frameId`, required
  `array of … notRestoredExplanations`. `grep -c notRestoredReasons
  page.pdl` → 0: the entry's warning against the article's `NotRestoredReasons`
  spelling is grounded.
- **S104 quotes resolve byte-exact** in the committed retained body at lines
  2511 (`All major browsers include a bfcache`), 2531 (`restored from memory,
  without having to go to the network at all`), 2893 (`NotRestoredReasons API`).
- **Digests re-derive** (QUALITY 39 satisfied): `sha256sum
  corpus/evidence/round-24/sources/{bfcache.html,page.pdl}` → `0dd45292…`,
  `e944a3b1…`, both matching the entry and SOURCES.
- **No runtime/determinism/security claims.** "No browser ran for this entry"
  is consistent with the receipts; `tier: documented upstream, not measured in
  this lane` matches the `csrf-defense-shape-boundary.md` convention; U1–U5
  frame unmeasured surfaces as unknowns (except F2's bad inference inside U4).
  No sentence asserts a lane-observed restore, a determinism verdict, or a
  security property.
- **No duplication.** `grep -ril 'bfcache\|back-forward\|restore'
  corpus/knowledge/` → only this entry (plus round-24 lesson/README/SOURCES
  metadata); `multi-step-journey.md` has no bfcache/restore content — the entry
  adds a new edge class, it does not restate a held note.
- **Chromium pin consistent**: `154.0.8037.97` is the lane's pinned build
  (round-16/17/19 notes, `corpus/knowledge/webmcp-chromium-loopback-round-16.md:10`).
- **Tier requirement met** (QUALITY 12): S105 is tier A, S104 tier B, both
  mined/opened 2026-10-25.
- **Province**: fits "CDP session discipline / dynamic-page evidence
  patterns"; nothing out-of-scope absorbed (the `NotRestoredReasons` web-API
  naming note stays inside the evidence-readings boundary).

## Residual risk

- A third retained copy now exists in untracked scratch
  (`ScoutReopenS104/bfcache-reopen.html`, 157,663 B, sha `df5cc100`, mtime
  05:45, post-commit): U4's "two fetches" omits it. [INFERENCE: peer artifact
  from a live wave-2 seat; not counted against the frozen entry, but if U4 is
  ever revised it should name every fetch this round.]
- Whether `--disable-back-forward-cache` can actually be overridden at the
  pinned Playwright build, and whether a loopback restore can be induced at
  all, remain unmeasured — the entry names U1/U3 but the *remedial* path
  (F6) is likewise unverified.

## Verification gaps (things I did not do)

- No HTTP GET issued: all claims checked against the committed retained bytes
  and wave scratch, never the live sites.
- `corpus/QUALITY.md` has no criterion for decision-table completeness per se;
  F4/F5 read §3 against QUALITY 50 (source-only decision tables) and the
  entry's own declared purpose (a receipt must capture enough to conclude
  what the table says).
