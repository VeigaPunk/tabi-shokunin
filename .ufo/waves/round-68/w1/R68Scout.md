# R68Scout — round 68 w1 scout findings

Seat: `R68Scout` (scout, coverage axis). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Base: `1746c53de7d56e8aeaf420a68b5b95e6af96adf8`. No claims frozen here; everything below is
observation + inference, no adjudication.

Output dir: `.ufo/waves/round-68/w1/R68Scout/` (sources, receipts, SOURCES-*.md variants,
worksheet-independent.tsv). Scratch `/fast/scratch/hyaku/tabi-r68/R68Scout/` deleted before yield.
No tooling installed or upgraded (no pacman transaction; the host-wide pacman pause was respected).

---

## 1. r67 outside spot-check (read in full)

`corpus/lessons/round-67-verifier-spotcheck.md` — the non-author integrator's own record
("author: hyaku closure (non-author integrator, @m_zfl)"). Material points for round 68:

- **Round 67 is NOT admitted.** "the round is not admitted (C1 withdrawn before freeze; lowest-axis
  obligation unmet) — an honest stop, correctly self-reported by the lane." Axis verdicts:
  adjacency unchanged (8), calibration improved, coverage improved, depth/operability/freshness unchanged.
- **C1 was withdrawn, not frozen.** The r66 BG-word rule is refuted by the committed ledger
  (95 of 149 `no-tabi-ground` rows quote BG words; the meter admits only BG-hit rows). The
  withdrawal is verified sound by independent re-derivation.
- **Routed defect 1 (the C2 driver for round 68)** — "Gate registry stale at the registry home."
  `SKILL.md`'s instrument table lists only the r64 generation; the round-67 instruments
  (`chrome-cdp-loopback-round67.mjs`, `chromium-hscroll-r67.mjs` (+`make-negatives-r67.mjs`/
  `mutate-r67.mjs`), `verify-live-r67.mjs`, `check-receipt-provenance-v4.mjs`) "have no registry row
  (entry command, verdict map, self-test spelling, pinned-value path, write scope, owner).
  Gate standard delivery: closure grades no gate conformant until its registry row exists at
  `SKILL.md`." The spot-check names **six** paths; it does **not** name `png-r67.mjs`.
- **Routed defect 2** — `claims.json.frozenAt` reads `"pending-commit"` at the r67 freeze commit
  (same pattern as r66; disclosed in the lesson's errata).
- **Routed defect 3** — S172 §13.3 quote is 13 words, recorded as 14 in report/lesson/anchor cell.
  ≤25-word contract met; no rewrite of filed bytes. **This is the precedent for the C3 quote
  bookkeeping**: the r68 note must not repeat a word-count drift.
- **Routed defect 4** — pre-fix survivor evidence lived only in a seat report.
- Spot-check sampling table: 1 admit (S172), 2 rejects (the withdrawn C1 disposition rule;
  CSSOM View `scroll-completed` as a timing source).
- L0 (r67) is still open in the fleet channel: `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md:334`
  ("Operator ruling wanted: (1) how the adjacency axis should move when disposition is human
  adjudication …"). I found no answer file for it. **L0 r67 remains unanswered** — the r68
  adjacency candidate must not be scored as satisfying the lowest-axis obligation while this
  ruling is pending.

## 2. Input PDL staged r64 path — read, and independently re-opened this round

Staged r64 copy (read in place): `.ufo/waves/round-64/w1/R64Scribe/sources/s170-chromium155-Input.pdl`
— 336 lines, 14,431 B, sha256 `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d`.

**Independent re-open this round (not from the lane copy).** Official same-tag URL:

```
https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT
```

- `curl` → HTTP 200, 19,244 B transfer, sha256 `20257c65bbda07c6b3d9870b6f973403efa77a2ab84d479ecf6e629fe73df9d7`
- base64-decoded → 14,431 B, sha256 `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d` — **byte-identical** to the staged r64 copy (`cmp` → identical).
- Tag→commit verified independently: `refs/tags/155.0.8059.84` → `5869fe313571d75152b77813cf0a4ee26a4e6df0` (gitiles `+refs/...format=JSON`, HTTP 200).
- Blob identity confirmed against the gitiles blob id for the path at the tag: `815bf7c4147c4dd89ea6e9c7a0440517cb5a4937`, and `git hash-object` of my decoded file equals that blob id exactly. **This is byte identity with the upstream git object**, not merely "a digest I computed".
- The plain (non-`?format=TEXT`) URL serves an HTML page (116,567 B) containing the same PDL text; it is not the file bytes. `?format=TEXT` is the base64 file form.

**Byte-identity across tags (important for the C3 scope wording).** The decoded `Input.pdl` is
byte-identical at tags `154.0.8037.97`, `155.0.8059.84`, `156.0.8078.47` and `157.0.8103.6`
(same gitiles blob id `815bf7c4…` at all four; sha256 `5bbc6e23…` at 154/155/156).
=> A row scoped "at build tag 155.0.8059.84 only" is a **URL/anchor pin**, not a claim that the
declaration is build-specific. The r64 note already said exactly this ("the decoded bytes are
byte-identical to the 154.0.8037.97 files … so it does NOT establish build-specificity by itself",
`.ufo/waves/round-64/w1/R64Scout.md:213-216`). The S173 row must not silently upgrade that.

## 3. Located anchors and phase-token count (measured on my own fetched bytes)

Line numbers are 1-based in the decoded 14,431 B file (336 lines):

| item | lines | text |
|---|---|---|
| `synthesizeScrollGesture` | **286–287** | 286 `# Synthesizes a scroll gesture over a time period by issuing appropriate touch events.` / 287 `  experimental command synthesizeScrollGesture` |
| `preventFling` | **303–304** | 303 `      # Prevent fling (default: true).` / 304 `      optional boolean preventFling` |

Both match the assignment's expected 286–287 and 303–304.

**Phase-token count = 0.** Case-insensitive `grep -oi phase` over the whole file → **0 matches**
(`grep -ni phase` exits 1). `momentum` → 0. `overscroll` → 2 (as `xOverscroll`/`yOverscroll`);
`fling` → 2; `touchStart/touchMove/touchEnd/touchCancel` → 2 each (the `dispatchTouchEvent` enum
at 215–218 plus the prose). So the negative "this Input PDL declares no phase parameter" is
**true for this file** and the sweep is finite over one file.

Negative-scope caveat for the C3 note: the *master* CDP JSON
(`https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json`,
HTTP 200, 1,423,215 B, sha256 `cb4b0a40e03fddfdc4191f832259b9fed6684c303842c55d8c6fe1702f9a5efb`)
**does** contain the string `phase` 4 times — but only as `ThirdPartyPhaseout` /
`WarnThirdPartyPhaseout` / `ExcludeThirdPartyPhaseout` (cookie phase-out), and a recursive key
scan of the whole master protocol finds **no** key containing `phase`. The master's
`Input.synthesizeScrollGesture` has the identical description and the identical 12 parameters as
the 155 file. So the negative is "no *gesture-phase* parameter", not "the word phase never appears
in CDP" — the C3 note must keep that distinction.

## 4. Draft S173 scoped row (proposed; lane file NOT edited by me)

The sibling seat's working-tree S173 row already exists in `corpus/SOURCES.md` (uncommitted). I
drafted an independent version; **three defects in the current draft are measured below** and the
L1 must resolve them before freeze. Proposed cell values:

| cell | proposed value |
|---|---|
| id | `S173` |
| source | `Chromium 155.0.8059.84 — CDP Input domain PDL, synthesizeScrollGesture parameters — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT` |
| kind | `code` |
| tier | `A` |
| scope | `the Input.synthesizeScrollGesture parameter set as declared in the Input domain PDL at tag 155.0.8059.84 (command at lines 286-287, preventFling at 303-304); the same bytes are the file at tags 154.0.8037.97 and 156.0.8078.47, so this is a tag-pinned anchor and not a build-specific difference; documentation-held, runtime unmeasured` |
| anchor | `command synthesizeScrollGesture at decoded line 287 of the staged Input.pdl (14,431 B, sha256 5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d); parameter preventFling at lines 303-304; upstream git blob id 815bf7c4147c4dd89ea6e9c7a0440517cb5a4937 at refs/tags/155.0.8059.84 (commit 5869fe313571d75152b77813cf0a4ee26a4e6df0); fetched 2026-11-05` |
| teaches | `the protocol declares a scroll-gesture surface with explicit distance, overscroll, fling, speed, source-type and repeat parameters (12 parameters, lines 289-315); these declarations do not establish trackpad phase traces, fling-versus-no-fling runtime behaviour, or smooth rendering` |
| status | `mined` (only if the used-by paths exist) |
| opened | `2026-11-05` |
| recheck | `on-release` |
| used-by | `corpus/knowledge/chromium-scroll-gesture-protocol-round-68.md, corpus/lessons/round-68.md` |

**Located quotes (≤25 words each; word counts measured with `wc -w`, both located at the stated line):**

1. line **286** — "Synthesizes a scroll gesture over a time period by issuing appropriate touch events." — **13 words**
2. line **303** — "Prevent fling (default: true)." — **4 words**
3. line 295 — "The distance to scroll along the Y axis (positive to scroll up)." — 12 words
4. line 305 — "Swipe speed in pixels per second (default: 800)." — 8 words
5. line 310 — "The number of times to repeat the gesture (default: 0)." — 10 words

Quotes 1 and 2 are the two the C3 note needs; their word counts (13, 4) are what the lesson/anchor
cell must record, so r67 routed defect 3 (13-vs-14 drift) is not repeated. Every quote locates
**exactly** in my independently fetched bytes (`grep -n -F`, one hit each, at the stated line).

## 5. Measured findings that challenge the three round-68 candidates

### 5.1 C3 — the drafted S173 row breaks the lane's own SOURCES gate (E04 duplicate_url + E11)

`scripts/check-sources.mjs` (sha256 `afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77`):

```
node scripts/check-sources.mjs --root . --file .ufo/waves/round-68/w1/R68Scout/SOURCES-HEAD.md   # base copy
  → FINDING duplicate_url E04 row=S171 ; FINDING duplicate_url E04 row=S172 ; verdict=failed ; rc=1
node scripts/check-sources.mjs                                                                 # live worktree
  → FINDING duplicate_url E04 row=S171 ; S172 ; **S173** ; FINDING used_by_missing E11 row=S173 ; verdict=failed ; rc=1
```

- The **S173 E04 is caused by the current draft** and is fixable in the row text: the draft cites
  the *same* URL as the existing **S168** row (`…/domains/Input.pdl?format=TEXT`), and
  `check-sources.mjs` refuses a second row on the same URL unless the `teaches` cell opens
  `supersedes S<NNN>`. The fleet census (`scripts/sources-census.sh`, sha256
  `3fb7261569f464127…`, fleet copy) is **scope-sensitive**: same URL in a different scope is
  **W04 (warning)**, not E04, and the r67 lesson already established that reading
  (`corpus/lessons/round-67.md:20`: "The census contract allows cross-scope duplicates (W04 warning
  only; S171 duplicates S157). S172 uses a distinct scope."). Two independent gates disagree on
  the same file; whichever the L1 treats as authoritative must be named in the claim.
- The **S173 E11** is `used-by: corpus/lessons/round-68.md` — that file does not exist yet
  (no `corpus/lessons/round-68.md`; the r67 pattern is that the lesson lands before the row's
  used-by path resolves). My base-copy census run shows the same shape for S171/S172
  (`E11 missing used-by corpus/lessons/round-66.md`, `…round-67.md`) — those paths exist in the
  lane today, so the E11s in the copy run are an artifact of running the census against a
  *copy* outside the lane root; the live-worktree census run is the authoritative one and shows
  `E11 S173 missing used-by corpus/lessons/round-68.md` (exit 1) plus W04 for S171/S172/S173.
- Remedies I tested **on copies only** (never on the lane file): (A) drop `?format=TEXT` from the
  S173 URL → S173 E04 disappears, only the pre-existing S171/S172 E04s and the S173 E11 remain;
  (B) open the S173 `teaches` cell with `supersedes S168 — …` → S173 E04 disappears. Neither is
  my call: (A) changes the fetched representation (the `?format=TEXT` body is the file; the plain
  URL is an HTML page), and (B) asserts a supersession relation that is **false** — S168 is not
  corrected by S173, it is a *second scope* on the same file, and the lane's own precedent
  (S079/S099 on the same WebMCP PDL) uses `supersedes` only for a genuine correction.
  **[INFERENCE]** The honest fix is to make the *scope* distinct and let the census rule govern,
  plus fix the used-by path — but then the lane's own `check-sources.mjs` stays red on S173.
  The L1 must decide and disclose which gate is authoritative; this cannot be resolved by
  editing the teaches cell into a false supersession.
- The current draft's S173 `used-by` also points at `corpus/lessons/round-68.md` (absent) **and**
  `corpus/knowledge/chromium-scroll-gesture-protocol-round-68.md` (present, untracked).
- Note also: `scripts/check-sources.mjs` is **already red at the base** for S171/S172
  (2 findings, rc=1). So a green "SOURCES gate" claim at r68 is not available without stating
  the pre-existing debt.

### 5.2 C3 — do the claims deserve the coverage axis, or is it a count-only fake?

The C3 candidate is "docs-held synthesizeScrollGesture knowledge from Chromium 155 Input PDL (new S173)".
Two discrimination questions I can answer from source:

- **Is the *source* new?** No. The Input domain PDL at tag 155 is already registered as **S168**
  (opened 2026-11-04, same URL, same bytes, same staged file path family). S173 is a **second
  scope on an already-held source**. That is legitimate under the SOURCES contract (Rule 4:
  "Expansion is knowledge, not rows"), but the claim must be worded as *new scope/knowledge on an
  existing source*, not as a new source, and the expansion count must not be presented as a
  new-source count. The r64 scout already wrote this down for the same file.
- **Is the *knowledge* new (i.e. is it do-nothing if S173 is dropped)?** Yes, substantially. The
  synthesizeScrollGesture parameter set is **not** in any existing note: `grep -rn synthesizeScrollGesture
  corpus/knowledge/` returns only the new r68 note; the only other hit in the corpus is Playwright's
  vendored `types/protocol.d.ts` under `corpus/evidence/round-13/…` (a type declaration, not a
  lane claim). The r67 note lists "no trackpad phases" as a limit but says nothing about the
  gesture-synthesis command. So the note is new ground — provided it stays *documentation-held*.
- **Runtime-unmeasured qualifier must survive.** The r68 real-browser trial receipt
  (`.ufo/waves/round-68/controls/browser-real-trial.json`) shows `scripts/verify-live-r67.mjs`
  re-running the **r67** horizontal-wheel surface (exit 0, predicate true, driver sha
  `b7cd3b1d…`, counter sha `cf97a68d…`). Nothing in it calls `Input.synthesizeScrollGesture`:
  `grep -rn synthesizeScrollGesture scripts/ .ufo/waves/round-67/` → **zero hits**. So the note's
  "runtime unmeasured / no new runtime capability" statement is accurate, and the counter must
  check the *declared* surface (source bytes, params, quote, scope qualifier) — not a runtime run.
- **What must NOT be claimed**: global/only-surface exclusivity (the same file is at 154/155/156/157
  and the master protocol carries the same command), runtime capability (nothing executed it), or
  external authenticity from the digest alone (a digest match proves byte identity with the
  upstream blob id I verified; it does not authenticate the publisher).

### 5.3 C2 — the registry gate's own expectations vs the lane's canonical registry shape

`scripts/check-instrument-registry-r68.mjs` (working tree) expects a section titled
`## Instrument registry — round 68` with **seven** columns
`instrument, entry, verdicts, selftest, pinned, scope, owner`, and 7 expected paths (the six
named by the r67 spot-check **plus `png-r67.mjs`**, which the spot-check does *not* name).

Measured in a scratch clone of the lane at base (`/fast/scratch/hyaku/tabi-r68/R68Scout/clone-lane`,
`git rev-parse --show-toplevel` = the clone dir; clone only, no lane mutation):

- A candidate 7-column section with all 7 rows, correct committed sha256 per row, entry commands
  naming the path, verdicts/scope/owner filled, and an explicit "no selftest flag" where the
  instrument has none →
  `node scripts/check-instrument-registry-r68.mjs --skill SKILL.md --repo .` →
  `{"ok":true,"findings":[],"byCheck":{},"expected":7}` **rc=0**.
- `node scripts/check-instrument-registry-r68.mjs --selftest --scratch <dir>` →
  `{"verdict":"clean","cases":7,"failed":0}` **rc=0** (cases: green, section-missing, row-missing,
  sha-mismatch, entry-unbound, field-missing, selftest-unstated).
- **A defect in the gate's CLI: `--json` is documented in the usage string but is not accepted.**
  `node scripts/check-instrument-registry-r68.mjs --skill SKILL.md --repo . --json` →
  `usage: … --skill SKILL.md [--repo .] --json | --selftest --scratch <dir>` + `error: missing --skill`,
  **rc=2**. `parseArgs` returns null for a trailing valueless flag, so `--json` makes the gate
  refuse even a valid `--skill`. Any claim whose evidence is "the gate exits 0 with `--json`" would
  be false; the reproducible invocation is without `--json`. **[OBS]** — the gate also emits JSON
  unconditionally, so `--json` is redundant as well as broken.
- **Shape conflict with the lane's canonical registry**: the canonical eight-field gate-registry
  shape (`Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope |
  Owner`, `SKILL.md:2388/2433/2467`) is what `scripts/check-gate-registry.mjs` parses
  (`kind` cell must match `^(gate|probe)$`; missing-field list is `name, kind, entry, verdictMap,
  selftest, pinned, scope, owner`; `selftest` cell must contain `--self-test`; `pinned` cell must
  look like a path or a hex digest; `scope` must mention read/write/temp/isolation). A 7-column
  `Instrument | … | Owner` table has **no `kind` column**, so `check-gate-registry.mjs` will not see
  those rows as gate rows at all. Measured in the clone: base already has **5 nonconformant**
  gates; adding the two new r68 scripts as `scripts/check-*.mjs` (they match
  `GATE_CONVENTION = /^(check-[a-z0-9-]+…)\.mjs$/`) takes it to **7 nonconformant** unless
  canonical 8-field `kind: gate` rows are added; adding canonical rows for the two new r68 gates
  brings it back to **6** (the five pre-existing + one more, `check-adjacency-adjudication-r68`,
  still missing a `pinned` path/hex in my probe). So: **the C2 registry repair as specified does
  not by itself satisfy the lane's canonical `check-gate-registry.mjs`**, and the two new r68 gates
  are *themselves* unregistered gates under that gate. **[INFERENCE]** A C2 claim of "the registry
  home now carries the r67 rows" can be true for `check-instrument-registry-r68.mjs` while
  `check-gate-registry.mjs` still counts the new gates as nonconformant — the two gates disagree
  about what "registry row" means. The claim must name which gate it satisfies, and the L1 should
  decide whether the two new r68 gates also need canonical rows.

### 5.4 C1 — worksheet quote column (the r[5]→r[6] correction) verified independently

The generator `.ufo/waves/round-68/counters/build-worksheet-r68.mjs` reads the ledger and writes
one row per contested-open ledger row with `status = pending-non-author` and clean adjudication
cells. I regenerated it independently into my own scratch (not the lane file):

```
node .ufo/waves/round-68/counters/build-worksheet-r68.mjs \
  --ledger .ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv \
  --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv \
  --out <scratch>/worksheet-independent.tsv
→ {"ok":true,"rows":49,...} rc=0
```

- The generator's current code uses `r[6]` for the quote (`out.push([lane, r[2], head, r[6], 'pending-non-author', …])`).
  The ledger header (0-based) is `0 type, 1 lane, 2 path, 3 provinceSha256, 4 lines, 5 bgHits,
  6 quote, 7 disposition, 8 head` — so **`r[6]` is the quote column and `r[5]` is `bgHits`**. The
  correction is right: `r[5]` holds `-` for `line` rows (bgHits is only numeric on `file` rows),
  so a generator still on `r[5]` would have emitted `-` as the quote.
- Row count: 49 (`contested-open` rows in the r66 ledger; the full ledger census is
  95 `no-tabi-ground` + 49 `contested-open` + 5 `overlap-declared` = 149 `line` rows of 174 data rows).
- **Every one of the 49 quotes locates exactly** — I resolved each row's `path:line` at its
  snapshot-pinned sibling head with `git show <head>:<path>`: **49/49 exact string equality**
  (0 substring-only, 0 mismatches). Lanes: kaidoku 39, kama 5, kagi 2, revenger 2, kake 1.
- Also **49/49 exact at each sibling's LIVE head** (kagi `6742fdef…`, kaidoku `ee44eeb5…`,
  kama `9b4c7af1…`, revenger `dcb10b96…`, kake `d838e744…`), so the worksheet quotes are not
  stale relative to the current sibling trees.
- **Status honesty:** every row carries `pending-non-author` with `—` in the adjudicator, verdict,
  reason and date cells. These are **pending rows, not adjudications**. Any C1 claim that
  "adjudicated 49 rows" would be false; the measurable claim is "a 49-row worksheet exists whose
  quotes all locate at their pinned heads, pending a non-author adjudicator". The r67 spot-check
  already rejected a lexical/counting substitute for human adjudication, so the round must not
  re-import one. My rows are a *locatability* receipt, not a disposition.
- The r66 snapshot heads are the pinned ones; live heads differ (the snapshot is a r66-time
  artifact). The worksheet pins the snapshot head — that is the right binding for a worksheet, and
  my "live head" check is supplementary, not a change of pin.

## 6. Open questions for the L1 (not answered here)

1. **Which SOURCES gate is authoritative for r68** — the lane's `scripts/check-sources.mjs`
   (URL-only, scope-blind ⇒ E04 on S173) or the fleet `scripts/sources-census.sh` (scope-sensitive
   ⇒ W04 on S173)? The two disagree today on S171/S172 as well; `check-sources.mjs` is already red
   at base. The claim must name the gate it satisfies.
2. **S173 `used-by`**: `corpus/lessons/round-68.md` does not exist → live census exit 1 (E11).
   Land the lesson before the row, or point `used-by` at a path that exists.
3. **C2 shape**: does the r68 registry section need canonical 8-field `kind: gate` rows as well, so
   `check-gate-registry.mjs` sees the two new r68 gates (currently 5 → 7 nonconformant when they
   land)? And is `png-r67.mjs` (not named by the r67 spot-check) in scope for the "seven"?
4. **C3 scope wording**: keep the "same bytes at 154/155/156/157" caveat so "at this tag only"
   reads as a URL pin, not a build-specificity claim.
5. **L0 r67 is unanswered** — adjacency (the lowest axis, 8) has no ruling; C1's pending worksheet
   does not discharge it, and the round cannot claim the lowest-axis obligation is met on r68
   without the operator ruling.

## 7. Receipts (executed probes; argv / producer / input sha / rc / stdout)

All under `.ufo/waves/round-68/w1/R68Scout/receipts/` unless stated. Full stdout files kept.

| # | argv (cwd = lane root unless noted) | producer sha256 | input sha256 | rc | stdout |
|---|---|---|---|---|---|
| 1 | `curl -sS -w 'HTTP=%{http_code} SIZE=%{size_download}' -o input-155-formatTEXT.b64 'https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT'` (scratch) | n/a (network) | transfer sha256 `20257c65bbda07c6b3d9870b6f973403efa77a2ab84d479ecf6e629fe73df9d7`, 19,244 B | 0 | `HTTP=200 SIZE=19244` |
| 2 | `base64 -d input-155-formatTEXT.b64 > input-155-decoded.pdl; cmp input-155-decoded.pdl <lane staged r64 copy>` (scratch) | n/a | decoded sha256 `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d`, 14,431 B | 0 | `cmp` → identical (silent) |
| 3 | `curl -sS 'https://chromium.googlesource.com/chromium/src/+refs/tags/155.0.8059.84?format=JSON'` (scratch) | n/a | `refs/tags/155.0.8059.84` → `5869fe313571d75152b77813cf0a4ee26a4e6df0` | 0 | JSON above |
| 4 | `git hash-object sources/Input.pdl` (seat dir) | git | blob `815bf7c4147c4dd89ea6e9c7a0440517cb5a4937` == gitiles blob id at tag 155 | 0 | `815bf7c4147c4dd89ea6e9c7a0440517cb5a4937` |
| 5 | `grep -oi 'phase' sources/Input.pdl \| wc -l` | n/a | `5bbc6e23…` | 1 (`grep -ni` no match) | `0` |
| 6 | `grep -n -F <quote>` × 5 quotes on `sources/Input.pdl` | n/a | `5bbc6e23…` | 0 | one hit each at lines 286, 303, 295, 305, 310; word counts 13/4/12/8/10 |
| 7 | `node scripts/check-sources.mjs --root . --file .ufo/waves/round-68/w1/R68Scout/SOURCES-HEAD.md` | `afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77` | `SOURCES-HEAD.md` sha256 `2dd7d140f18db8aae332f3b03e721136820b746a4aaa90126306269b1f873471` (= `git show HEAD:corpus/SOURCES.md`) | **1** | `check-sources-basecopy.stdout.txt`: E04 S171, E04 S172; `verdict=failed rows=172 findings=2` |
| 8 | `node scripts/check-sources.mjs` (live worktree) | same | `corpus/SOURCES.md` | **1** | `check-sources-worktree.stdout.txt`: E04 S171, S172, **S173**, E11 S173; `verdict=failed rows=173 findings=4` |
| 9 | `node scripts/check-sources.mjs --root . --file …/SOURCES-variantA.md` (S173 URL without `?format=TEXT`) | same | variantA copy | 1 | `check-sources-variantA-plainurl.stdout.txt`: E04 S171, S172, E11 S173 (S173 E04 gone) |
| 10 | `node scripts/check-sources.mjs --root . --file …/SOURCES-variantB.md` (S173 teaches opens `supersedes S168 —`) | same | variantB copy | 1 | `check-sources-variantB-supersedes.stdout.txt`: E04 S171, S172, E11 S173 (S173 E04 gone) |
| 11 | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` | `3fb7261569f464127…` (full sha in `producer-sha256.txt`) | live `corpus/SOURCES.md` | **1** | `census-validate-worktree.tsv`: W04 S171/S172/S173 + **E11 S173 missing used-by corpus/lessons/round-68.md** |
| 12 | `…/sources-census.sh validate --root … --file …/SOURCES-HEAD.md tabi` | same | base copy | 1 | `census-validate-basecopy.tsv`: E11 S171/S172 (artifact of the out-of-lane copy — used-by paths resolve against the copy) |
| 13 | `node scripts/check-gate-registry.mjs --rev 1746c53d… --json` (lane) | — | base rev | 0 | `nonconformant=5 clean=false` (pre-existing: check-c2-knowledge-round41, check-cited-receipts, check-cited-receipts-v2, check-receipt-provenance, check-secondary-round62) |
| 14 | clone + candidate 7-col section → `node scripts/check-instrument-registry-r68.mjs --skill SKILL.md --repo .` (clone) | r68 gate (working tree) | candidate SKILL.md | **0** | `{"ok":true,"findings":[],"byCheck":{},"expected":7}` |
| 15 | `node scripts/check-instrument-registry-r68.mjs --skill SKILL.md --repo . --json` (clone) | r68 gate | candidate SKILL.md | **2** | usage + `error: missing --skill` — **`--json` breaks the documented CLI** |
| 16 | `node scripts/check-instrument-registry-r68.mjs --selftest --scratch <dir>` (clone) | r68 gate | — | **0** | `{"verdict":"clean","cases":7,"failed":0}` |
| 17 | `node scripts/check-gate-registry.mjs --repo . --rev HEAD --json` (clone, r68 gates committed) | — | clone rev | 0 | `nonconformant=7` (5 pre-existing + the 2 new r68 gates) |
| 18 | `node scripts/check-gate-registry.mjs --repo . --rev HEAD --json` (clone, canonical 8-field rows added) | — | clone rev | 0 | `nonconformant=6`; `check-adjacency-adjudication-r68` still `missing=['pinned']` in my probe |
| 19 | `node .ufo/waves/round-68/counters/build-worksheet-r68.mjs --ledger … --snapshot … --out <scratch>` | generator (working tree) | ledger `adjacency-host-delta-r66.tsv`, snapshot `snapshot-live-r66.tsv` | **0** | `{"ok":true,"rows":49,…}` |
| 20 | python: for each of the 49 worksheet rows, `git -C <sibling> show <pinned head>:<path>` and compare line to the quote | git | worksheet + r66 snapshot | 0 | **49/49 exact** at pinned heads; **49/49 exact** at live heads |
| 21 | `curl` master CDP JSON; python scan for `phase` keys and the `Input.synthesizeScrollGesture` params | — | sha256 `cb4b0a40…`, 1,423,215 B | 0 | 4 `phase` string hits, all `*ThirdPartyPhaseout`; **no** `phase` key anywhere; master command has the same 12 params |

No test suites, gates or census runs were executed beyond the probes above. No git/jj mutation was
made to the lane, the fleet root or any sibling repo: the only clone was
`/fast/scratch/hyaku/tabi-r68/R68Scout/clone-lane` (scratch, `git rev-parse --show-toplevel`
asserted to equal the clone dir before its two probe commits), and it was deleted before yield.
