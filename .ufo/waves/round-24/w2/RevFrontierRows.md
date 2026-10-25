# RevFrontierRows — review of `corpus/README.md` §"Frontier — round 24" (committed at lane tip `ad125e8`)

Scope: the three-row block at `corpus/README.md:578-584`. Tests: (a) each row's
status word vs what the round actually holds, (b) each pointer resolves, (c) no
runtime observation claimed where none exists, (d) consistency with the entry's
Unknowns list. All commands run in the lane at tip
`ad125e85c235e1c4ec6a08e398bd64da01f68a08`, `TMPDIR=/home/vgpnk/tmp-tabi24`.

## Findings by severity

### F1 — HIGH: row 3 ("Self-assessment calibration") claims `held` while its own instrument and its own cited pointer both record a mismatch

Row 3 status: "held for SCORECARD.md". Two contradictions:

1. The row's own pointer `corpus/evidence/round-24/c2-measurements.json` records
   `"after": { "rev": "b973fde3c89fb2d3476ad0b6002791b75ec87a27", "mismatches": 1, …}`
   with counted `[{"class":"m3-unlanded-paths","claimed":"landed","observed":4}]`
   — the recorded after measurement is 1, not 0. `corpus/evidence/round-24/c2-tip.json`
   agrees: `mismatches 1, clean false`.
2. Re-run at the tip: `node scripts/check-selfassessment.mjs --rev ad125e85c235e1c4ec6a08e398bd64da01f68a08 --json`
   → **exit 1**, `mismatches: 1` (`m3-unlanded-paths`, `observed: 5` at capture time).
   m3 is worktree-scoped, not rev-scoped (`scripts/check-selfassessment.mjs:262-276`:
   any non-empty `git status --porcelain --untracked-files=all` vs the newest
   `## Round N — executed disposition` block). At run time the 5 paths were
   `.ufo/waves/round-24/{gen-w2.mjs,w2-dispatch.json,w2-spec.json,w2-dispatch.err,w2/}`;
   wave-2 landing is still in flight, so the count grows.

Adjacent evidence: `SCORECARD.md:1233` asserts "5 → 0 mismatches … **met** … tip
counts none" — the disposition the m3 class measures is contradicted by the
receipt committed two directories away in the same commit (`ad125e8`). The
README row inherits that error: as committed, the row's status word is not true
at any recorded observation point (b973fde receipt, ad125e8 re-run). "Held" is
only reachable with a fully clean worktree, which the round's own disposition
asserted but which has never been measured as such.

Honest wording would be e.g. `instrument held; calibration open (m3 fires on
unlanded paths at tip)` or the status deferred until the wave-2 tree lands.

### F2 — MEDIUM: row 1's "the lane's historical probes launched with `--disable-back-forward-cache`" is a falsified universal and mis-attributes the absence of a restore observation

Committed sweep of every `*effectiveArgv`/browser argv array in the tree's 1,892
JSON files: 141 launch argv arrays, of which **140 carry the flag and 1 does
not** — `.ufo/waves/round-17/probes/invoke-concurrency.json`
(`browser.effectiveArgv`, 13 tokens, spawns `/usr/lib/chromium/chromium`
directly, seat C2ProbeConcurrency, committed in `6c97851`). The flag-carrying
140 are all Playwright-harness launches (rounds 16–19) — the token is a
Playwright default, not a lane-chosen flag.

Older prose-recorded launches also lacked it: `corpus/knowledge/cdp-evidence-patterns.md:32`
records the round-1 effective child line `… --headless=new --remote-debugging-port=19333 … --disable-gpu --noerrdialogs …` (no flag),
`corpus/knowledge/live-dynamic-capture.md:29-32` inherits that recipe plus
`--disable-background-networking` only, `corpus/knowledge/multi-step-journey.md:47`
records `… --disable-gpu --disable-background-networking` only, and the current
runbook recipe at `SKILL.md:127-131` contains no `back-forward` token
(`git grep -nE` each file — only `SKILL.md` has zero hits).

So the clause is wrong in both directions: not every recorded launch carried
the flag, and the flag never covered the earliest, most history-relevant probes.
The actual reason no restore was observed is sharper and true: no committed
probe performs a history step — `git grep -nE "navigateToHistoryEntry|goBack|history\.back\(|history\.go\(" HEAD -- 'scripts/*.mjs' '.ufo/waves/*/probes/*.mjs' '.ufo/waves/*/measure-*.mjs'` → zero hits. The status cell should read
roughly: "no probe performs a history step, and the Playwright-era launches
carried `--disable-back-forward-cache` as a launcher default" — not the current
universal.

### F3 — MEDIUM-LOW: row 3's "held" hides that the instrument cannot decide 79 of 93 claims

Same re-run at `ad125e8`: 93 findings; could-not-evaluate by class
`{m1: 4, m2: 75}` = **79/93 (85%)** unevaluable; decidable 14 = 5 superseded,
8 agree, 1 mismatch. The m2 class is almost entirely could-not-evaluate (75/76
receipt commands sit outside the closed `git cat-file`/`git show` grammar, e.g.
"ambiguous script association" on m1). The claims' killRule says
could-not-evaluate is never a match — so "the lane's own figures are compared to
the instruments that produce them" describes a window in which only ~15% of
figures are actually compared. The status word should disclose that (e.g.
"held over the 14 decidable claims; 79 could-not-evaluate").

Also: the declared C2 window is `SCORECARD.md + SHONEN.md` (claims.json); the
instrument reads only `SCORECARD.md` (`scripts/check-selfassessment.mjs:280`,
no SHONEN reference). `SHONEN.md` carries 0 `N/N` tallies, so the count is
unaffected, but the row neither names SHONEN nor notes it was dropped.
"LOG.md … out of the window by declaration" is accurate — declared in
`.ufo/waves/round-24/w1-spec.json`/`w1-dispatch.json` ("not LOG.md (dated journal)…"),
though not in claims.json or the script header, so the declaration's canonical
location is the wave spec.

### F4 — LOW (adjacent): S105 byte-count is inverted in the rows the block points to

The row points at "rows S104/S105" and `corpus/evidence/round-24/sources/`.
The committed artifact `page.pdl` is **61,911 bytes** (decoded text;
`stat -c %s` + `sha256sum` → `e944a3b1…` matching the declared sha). Its base64
wire length is exactly 82,548 (`base64 -w0 | wc -c` → 82548), i.e.
`61911 * 4/3 = 82548`. Yet `corpus/SOURCES.md:120` and
`navigation-history-bfcache-evidence.md:4` both say "82548 bytes decoded" —
the encoded and decoded sizes are swapped. The sha and pin are correct; the
size field mislabels the wire length as the decoded length.

### F5 — CAVEAT (residual): "every lane gate" is bounded by the naming convention

Row 2 is verified clean at tip: `node scripts/check-gate-registry.mjs --rev ad125e8… --json`
→ exit 0, `nonconformant: 0`, 14 gates; `SKILL.md` §"Round 24 — gate registry
conformance" resolves at `SKILL.md:2455`. But the gate set is derived as
`scripts/` basenames matching `/^(check-[a-z0-9-]+|[a-z0-9-]*audit[a-z0-9-]*)\.mjs$/`
plus scripts named by gate-kind rows (`check-gate-registry.mjs:62,250-259`).
The 13 non-convention scripts in `scripts/` (`webmcp-*`, `pstack-*`, `user-*`,
`freshness-witness`, `selftest-measurement-binding`, `aria-loopback-round13`)
are all registered as `probe` kind, so the current claim is honest — but a
future gate not matching the convention and never named in a row is invisible
to the counter, making "every lane gate" strictly "every convention-derived
gate". Worth the qualifier in the row.

## Verified clean (no defect)

- Pointers: `corpus/knowledge/navigation-history-bfcache-evidence.md` exists,
  §2–§5 present, U1–U5 all in §5 (`grep -n "^U[0-9]"` → §5 only); S104/S105 rows
  at `corpus/SOURCES.md:119-120` carry 2026-10-25 access dates, shas match
  committed bytes; `corpus/evidence/round-24/sources/` holds both files.
- Discriminator documented at the pinned tag: `page.pdl` contains
  `BackForwardCacheRestore` (:1345), `experimental event backForwardCacheNotUsed`
  (:1706), `notRestoredExplanations` (:1713). Host build is now
  `chromium 154.0.8037.97-1` (`pacman -Q chromium`) — the pin matches the host's
  build, so "the pinned tag" is no longer ahead of the installed browser as the
  round-23 census (152.0.7977.82) would have suggested.
- No runtime overclaim in the block: "docs-held, runtime open" + "no restore has
  been observed on this host" matches claims `notClaimed` (no new browser run /
  bfcache observation) and entry U1–U5. U4's instability of the live article and
  U5's other-browser limit are not contradicted by the row.
- Row 1 status word pair (`docs-held, runtime open`) is the right calibration —
  the defect is the flag clause inside it, not the status pair itself.

## Unknowns / verification gaps

- Whether the m3 mismatch at the round's own after-measurement (b973fde,
  observed 4) was the same wave-2 artifacts class or leftover scratch — the
  receipt does not record path names; I did not reconstruct the tree at that
  instant. Either way a mismatch was recorded.
- `.ufo/waves/round-17/probes/invoke-concurrency.json` is a wave probe record,
  not a corpus evidence receipt; if "probes" is read narrowly as corpus-evidence
  harness launches, the counterexample narrows to the prose-recorded early
  launches (still flagless). The universal fails under both readings.
- No HTTP GET was performed (none named in this item); S104's live-article
  recheck is outside this seat.

## Tooling

None installed. Node 24 gate runs only; read-only git (`log/show/grep/ls-tree/rev-parse`).
