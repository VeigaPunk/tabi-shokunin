# W1-53 — Scribe53 — sources row / knowledge gate; lesson and mistakes; SCORECARD/LOG/round-38 consistency

Seat: Scribe53 · wave: round-38 w1 · attack id: W1-53 · leaf (no dispatch) · read-only.
Bounded surface: `corpus/SOURCES.md` row gate, `corpus/knowledge/playwright-firefox-loopback-round-38.md`,
`corpus/README.md` coverage map, `corpus/lessons/round-37.md` mistakes, `corpus/lessons/round-38.md`,
`SCORECARD.md` / `LOG.md` round-38 blocks, and the frozen instruments' dependence on those surfaces.

## 0. Revision state (time-scoped; read this before any finding)

| State | Contents relevant to this seat |
|---|---|
| `a8e7d50` (assignment's frozen-claims commit) | `claims.json` present. `corpus/SOURCES.md` = **143 rows, no S144** (`git show a8e7d50:corpus/SOURCES.md \| grep -cE '^\| S[0-9]+ \|'` → 143; `... \| grep -c 'S144'` → 0). No `corpus/lessons/round-38.md`; no round-38 knowledge note; `LOG.md` 0 lines matching `round-38\|Round 38`; `SCORECARD.md` no round-38 block; `.ufo/waves/round-38/baseline/` and `.../measure/` both empty. |
| `3bc0b10` (`round-38: record Firefox capability and routed defects`, committed 2026-10-27 **12:37:21 -0300**, i.e. inside this wave) | +6 files / +427 lines: `LOG.md`, `SCORECARD.md`, `corpus/SOURCES.md` (S144), `corpus/evidence/round-38/playwright-firefox/receipt.json`, the round-38 knowledge note, `corpus/lessons/round-38.md`. |

All observations below were re-derived at **`3bc0b10`** (current `HEAD`; working tree clean for these
paths: `git diff HEAD --stat` empty, porcelain only the wave-38 dispatch/spec/ready files and an
untracked `.ufo/waves/round-37/w1-results.json`). Mid-wave readings I took against `a8e7d50` are
**not** used as evidence except where the finding is itself about what the frozen commit lacked.

Frozen digest binding holds: `sha256sum` of all five `frozenDigests` entries equals the claim values
(`209d86a0…` c1-routed-defects, `704da806…` c1-adjacency-v6, `6a14d8ca…` c2-bidi-v4,
`6d7a925b…` c2-battery-mutants, `4cf3a849…` playwright driver).

## 1. C1's frozen counter cannot reach its own predicate while round-37 results are untracked (calibration)

Surface: `.ufo/waves/round-38/counters/c1-routed-defects.mjs` D1 vs `SCORECARD.md` round-38 block.

- Counter reads the round-37 results **as a committed blob at REV**: `c1-routed-defects.mjs:91`
  `const w1 = blob(repo, REV, '.ufo/waves/round-37/w1-results.json');` … `out.d1.seats = JSON.parse(w1).seats;`
  (line 94). Predicate requires `out.d1.seats === 34` (line 222).
- That file is **untracked**: `git cat-file -e 3bc0b10:.ufo/waves/round-37/w1-results.json` →
  `fatal: path '.ufo/waves/round-37/w1-results.json' exists on disk, but not in '3bc0b10'`; porcelain
  shows `?? .ufo/waves/round-37/w1-results.json`.
- Therefore the counter emits `d1-results` and leaves `d1.seats` **undefined**. Run at both REVs
  (`node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev <REV> --repo . [--json]`):
  - `3bc0b10`: `predicate=not-met findings=12`, exit 1; `d1` JSON = `{"stalePresent":true,"supersedingCorrection":true,"w2Absent":true}` — **no `seats` key**.
  - `a8e7d50`: `predicate=not-met findings=14`, exit 1.
- `SCORECARD.md:2102` (round-38 block, line 1) states: "The committed round-37 result object records
  34 w1 seats." The object is **not committed**, and it also carries **no verdict labels** (its
  per-seat keys are `name,agent,output,note` — `node -e` over the file), so it could not witness the
  D2 tally either.

What would falsify this finding: committing `.ufo/waves/round-37/w1-results.json` at or before the
measured REV, then `--json` output carrying `d1.seats:34` and no `d1-results` finding.

## 2. Three-way baseline disagreement in the frozen claim document (calibration)

- `claims.json:5-6` → `"frozenAt": "98239d0…"`, `"baseline": "98239d0…"`.
- Frozen counter constant: `c1-routed-defects.mjs:52` → `const BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35';`
  and D6 rejects a numstat receipt that does not name that baseline (lines 219-220).
- `LOG.md:2527` → "Round-start baseline: `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`. Frozen claims at
  `a8e7d50…`: … The frozen-instrument candidate commit is `98239d0…`."
- Precedent: round-37 `claims.json` `frozenAt` = `baseline` = `ed8ccfc…`, identical to the LOG round-37
  freeze line ("Baseline `ed8ccfc0…`", `LOG.md:2521`). Round-38 is the first round where the claims
  document's baseline is **not** the round-start tip but a round-38 commit.
- `frozenAt` also names a commit that does not contain `claims.json`
  (`git cat-file -e 98239d0:.ufo/waves/round-38/claims.json` → fatal; `git log --diff-filter=A -- .ufo/waves/round-38/claims.json`
  → `a8e7d50`).

Consequence, not mere bookkeeping: a seat that derives the numstat window from `claims.json` writes
`98239d0..REV` and the counter's D6 (`d6-window`) refuses it, while the LOG/counter window
`3f42a5c..REV` is the only accepted one.

What would falsify: a claims-document field that equals `3f42a5c…` (or a documented statement that
`baseline` means "frozen-instrument commit"), plus a committed numstat receipt at the same window.

## 3. S144 exists and its quote is true, but the row carries none of the provenance its precedent rows carry (coverage / source gate)

Committed row (`corpus/SOURCES.md:158`, 11 cells, tier `A`, status `mined`, `used-by` =
`corpus/knowledge/playwright-firefox-loopback-round-38.md`):

- `anchor` cell: `living docs page, §Firefox; opened 2026-10-27, page identifies Playwright's patched
  Firefox and platform variation` — no line/revision beyond the date, **no quote**, no byte count, no
  digest. Compare S142 (`:156`, `§DESCRIPTION first paragraph at line 3272 "…" (10 words, verbatim)`)
  and S143 (`:157`, `page fetched 2026-10-27T13:35:05Z … HTTP 200 … 38,351 B, sha256 46750b9f…`).
- No raw-fetch receipt for `playwright.dev/docs/browsers` anywhere in the lane tree:
  `grep -rn "playwright.dev" tabi-shokunin/corpus tabi-shokunin/.ufo/waves/round-38` returns the
  knowledge note's `source:` line and the lesson bullet only — no fetch record, no digest.
- Contract rule 1 (`.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:47`) puts the ≤25-word located quote in
  the round lesson's `## Gate`; the round-38 lesson does carry it — but with **zero 64-hex digests**:
  `git show 3bc0b10:corpus/lessons/round-38.md | grep -coE '[0-9a-f]{64}'` → `0`.
- The strictest shipped source predicate does require one: `c2-firefox-bidi-v4.mjs:576-584` searches
  the cited id's `## Gate` row for an https URL **and** `HEX64.test(...)` on the same host. Applied to
  this round's gate row, that shape refuses S144.
- Content check (independent, this seat): `curl -sSL` → `HTTP=200 BYTES=134107`,
  `sha256 bc8a4e2617cf0388026d59f9932ab762aebec61bdba9f4c0eda6a12c2127eee5`, and the lesson's 14-word
  quote is present verbatim: `Playwright doesn't work with the branded version of Firefox since it
  relies on patches.` So the claim is **true**; the in-tree provenance is what is missing.

Also structural, not a defect: the row arithmetic is consistent — `node scripts/check-sources.mjs` →
`SOURCES_GATE verdict=clean rows=144 tiers=A:128,B:7,C:9 status=queued:15,mined:120,rejected:9 findings=0`,
exit 0, i.e. exactly +1 tier-A mined row over the round-37 closure counts (143 / A127 / mined119);
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`.

What would falsify: a committed fetch receipt (timestamp, status, bytes, sha256) for
`https://playwright.dev/docs/browsers` bound to S144.

## 4. The round-38 knowledge note is admitted with no coverage-map row in the same commit (coverage / knowledge gate)

- Files vs map at `3bc0b10`: `corpus/knowledge/*.md` = **56**; README map rows matching
  `` ^| `knowledge/…` `` = **54**; rows without a file = **0**.
- Unlisted files (5): `playwright-firefox-loopback-round-38.md` (this round) plus four pre-existing —
  `bfcache-runtime-observed-round-25.md`, `navigation-history-bfcache-evidence.md`,
  `source-recheck-round-25.md`, `webmcp-nonautosubmit-round-21-corrected.md`.
- README snapshot is round-35: `corpus/README.md:737` "… `ls corpus/knowledge/*.md | wc -l` → 50 at the
  freeze"; no round-38 row, no new snapshot line, no gap statement. `corpus/README.md` is **not** in
  `3bc0b10`'s file list (diff stat: LOG, SCORECARD, SOURCES, receipt, note, lesson).
- QUALITY rule 11 (`corpus/QUALITY.md:26-28`): the map "either lists every current note or states its
  snapshot date and the exact open row-count gap in the same commit as each admit." Neither happened;
  the five-unlisted delta is the open gap. The four older misses show the debt is systemic, so this
  round inherits it rather than inventing it — but this round adds one more without stating it.

What would falsify: a README diff adding the round-38 row and a snapshot date + exact gap count.

## 5. Round-38 lesson asserts a round-end census and cites a receipt that does not exist (calibration, lesson accuracy)

`corpus/lessons/round-38.md` (committed `3bc0b10`, `## Census`):

> "Round-start command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate …` — exit 0, 143
> registry rows, `tabi ok`; … Round-end validation returned exit 0 and `tabi ok`; captured output at
> `.ufo/waves/round-38/measure/census-end.txt` (the registry parser's counts are reported in the round report)."

- `.ufo/waves/round-38/measure/` is **empty** (`ls -la` → only `.`/`..`; `find … -mindepth 1` → nothing);
  `git ls-tree -r 3bc0b10 -- .ufo/waves/round-38` lists only `claims.json` and the four counters.
- The wave was still in flight at that commit (this seat's assignment; `w1.ready.dispatched` 12:34), so a
  "round-end" validation cannot have happened.
- The frozen counter reads exactly that path and reports the absence: `d5-receipt census-end.txt absent at REV`
  (also `d6-file no numstat receipt under .ufo/waves/round-38/measure`).
- The round-start half is correct: `a8e7d50:corpus/SOURCES.md` = 143 rows, and census exits 0 with `tabi ok`.

What would falsify: a committed `measure/census-end.txt` carrying parsed rows/tier/status histograms whose
values equal a counter re-derivation (D5's own comparison), dated inside the round window.

## 6. Routed defect 4 (round-37 M3) is still open in the tree the round ships (calibration, lesson/mistakes)

- `git show 3bc0b10:corpus/lessons/round-37.md` M1 and M2 carry `Captured-by:`; **M3 does not** (`- **M3,
  class 'surface-mismatch' …**` block has `Fix:` only). Round-37 spot-check routed defect 4 asked for the
  field *and* a sentence-mutation red control.
- Round-38 lesson does not cover it: `## Mistakes` has one row (M1, the SCORECARD 68-seat overclaim,
  `Captured-by: none at round 37`); `grep -c surface-mismatch` over the committed lesson → **0**.
- Counter agrees: `d4-m3 no Mistakes row with captured-by naming round-37 M3 (surface-mismatch)` and
  `d4-receipt m3-sentence-mutant.json absent` (`.ufo/waves/round-38/baseline/` is empty).

What would falsify: a round-38 Mistakes row naming the round-37 M3 surface with a `Captured-by`, plus a
committed `baseline/m3-sentence-mutant.json` recording `exit`/`refused`/`killed`.

## 7. The 34 / 23 ok / 11 finding numbers are right; the citation chain to them is not (consistency — held number, broken pointer)

- Independent recompute from **committed** round-37 seat reports at `3bc0b10`
  (`.ufo/waves/round-37/w1/**`, last `VERDICT (ok|finding|error)` per seat, `report.md` winning):
  34 seats → `{"ok":23,"finding":11,"error":0,"none":0}`. This matches `LOG.md` round-38 ("seat tally
  23 ok / 11 finding") and `SCORECARD.md:2102` ("… supersedes the old tally").
- The pointer `SCORECARD.md:2102` uses ("The committed round-37 result object") does not resolve (§1), and
  the lesson's M1 fix names the same untracked artifact ("re-derive from committed `w1-results.json` (34 seats)").
- So: number holds, receipt citation fails. Correction is a one-line citation change to the committed
  `w1/` reports, not a number change.

## 8. Capability row's engine identity: true at the host, unbound in the receipt (coverage, informational)

- `SCORECARD.md` round-38 block: "Capability row: `playwright-firefox-loopback` — drive Playwright 1.64.0's
  patched Firefox 157.0 on loopback … Source: S144."
- Receipt `corpus/evidence/round-38/playwright-firefox/receipt.json`: `firefoxVersion: null` (hard-coded at
  `scripts/playwright-firefox-loopback-round38.mjs:157` and never reassigned), `browserVersion: "157.0"`
  (from `probe.version()`, line 159). No digest/pin of the binary — unlike `c2-firefox-bidi-v4.mjs:112-116`
  `PINNED_BINARIES` (firefox/geckodriver sha256s).
- Host check (this seat): `~/.cache/ms-playwright/firefox-1555/firefox/firefox --version` → `Mozilla Firefox
  157.0`; cache holds `firefox-1555` (also chromium-1248, chromium_headless_shell-1248, ffmpeg-1013, webkit-2370).
  So "Firefox 157.0" is reproducible, but it is not carried by the receipt.
- "Juggler transport" appears only in the driver comment (lines 3, 24 binary path `firefox-1555`); the
  receipt has no transport field. The claim's Juggler clause is inference from the Playwright build, not
  receipt-observed. The knowledge note itself is scoped honestly ("host/build-scoped loopback demonstration").

What would falsify: a receipt field populated from the binary's own `--version` plus a binary digest, or a
transport field naming Juggler.

## 9. Held (checked, no finding)

- **Frozen digests**: all five match `claims.json` `frozenDigests` (re-derived `sha256sum`).
- **Receipt internal consistency** for the knowledge note's sentences: run1/run2 `firstShotSha256` both
  `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`; per-run
  `egress {samples:2, nonLoopback:0, lines:1}`, `survivors 0`, `firefoxSurvivorPids 0`, `portClosed true`,
  `errors []`; `httpLog` 6 entries per run, **0 non-loopback** (all `http://127.0.0.1:<port>/…`).
  `binding` is derived, not asserted (`new Set(receipt.firstShotSha256).size === 1`, driver line 163).
- **Row arithmetic / census**: `check-sources` clean at 144 rows; `sources-census.sh validate` exit 0 `tabi ok`
  (W04 duplicate-url warnings only, S114/S115/S118/S123).
- **Quote truth**: the 14-word S144 quote is on the live page (§3).
- **Caption honesty**: LOG's round-38 entry ends "Round-38 closure result and landed commit hashes will
  follow" — the settlement is not claimed early; SCORECARD's C1/C2 bullets both say "result pending".

## 10. Conflicts reported verbatim for the canonical Rust judge (not resolved here)

1. `claims.json:6` `"baseline": "98239d0396ff32c3feb14638b3214fe688e8b122"` vs `LOG.md:2527`
   "Round-start baseline: `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`" vs `c1-routed-defects.mjs:52`
   `const BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35';`
2. `SCORECARD.md:2102` "The committed round-37 result object records 34 w1 seats" vs
   `git cat-file -e 3bc0b10:.ufo/waves/round-37/w1-results.json` → fatal (untracked).
3. `corpus/lessons/round-38.md` §Census "Round-end validation returned exit 0 … captured output at
   `.ufo/waves/round-38/measure/census-end.txt`" vs the directory being empty and the counter's
   `d5-receipt census-end.txt absent at REV`.
4. `corpus/lessons/round-38.md` §Gate "Admit S144 … the registry row is mined" vs the row carrying no
   quote/digest while precedent rows (S142/S143) carry both, and the v4-style source predicate requiring
   a 64-hex digest in the Gate row (`HEX64`) finding none there.

## 11. Out of scope / not performed

- Did not run the C2 counter `c2-firefox-bidi-v4.mjs`, the adjacency counter `c1-adjacency-sweep-v6.mjs`,
  or `c2-battery-mutants.mjs` (other seats' surfaces); did not re-run the Playwright driver.
- Did not open the readers' wave-2 or mutation batteries; no opinion on C1's D1-D6 *substance* beyond the
  gate/consistency surfaces above.
- No product edits, no commit/push, no git/jj mutation (`git` use is `cat-file`/`ls-tree`/`show`/`log`/
  `merge-base` reads only), no installs (no tool installed or upgraded; no pacman transaction), no sibling
  repo touch. Scratch `/fast/scratch/hyaku/tabi-r38/Scribe53/` removed before yielding.

## 12. Artifacts

- This note: `.ufo/waves/round-38/w1/Scribe53.md`.
- Evidence (scratch, cleaned): `c1-3bc0b10.json` (counter JSON at `3bc0b10`), `pw-browsers.html`
  (HTTP 200 / 134,107 B / sha256 `bc8a4e26…`).
