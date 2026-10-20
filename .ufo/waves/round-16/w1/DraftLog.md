# Report — DraftLog (round 16, scribe seat `TabiR16.DraftLog-5`)

## Behavior
Drafted the round-16 LOG.md entry skeleton at
`.ufo/waves/round-16/drafts/DraftLog.md` in the round-15 entry style (LOG.md:828-961). Every
unmeasured value is an explicit `<PENDING …>` marker. No counts, digests, versions beyond those
observed below, or wave sizes were invented.

## Gates
None run. No selftests, counters, browsers or gates were executed by this seat (contract: scribes run none).
Observed only: file existence, `git rev-parse HEAD`, `git status --short`, `chromium --version`, `node -v`.

## Touched surfaces
- Written: `.ufo/waves/round-16/drafts/DraftLog.md` (owned draft).
- Written: `.ufo/waves/round-16/w1/DraftLog.md` (this report).
- Read only: `.ufo/waves/round-16/PLAN.md`, `LOG.md:825-961`,
  `corpus/lessons/round-15-verifier-spotcheck.md:1-15,100-126`, `corpus/README.md` (grep),
  `corpus/knowledge/browser-surface-census.md` (grep), `tabi-shokunin/README.md`, fleet root listing.

## Findings
1. **Pointer mismatch in PLAN.** PLAN.md cites a "README Frontier" native-WebMCP entry. The
   top-level `tabi-shokunin/README.md` (533 bytes) contains no frontier or WebMCP text. The matching
   text is in `corpus/README.md:35` (also `:181, :194, :216, :283`) and the census
   `corpus/knowledge/browser-surface-census.md:145-153` / `:188` (U3). L1 should correct the citation
   or confirm the intended file. Draft cites the resolved locations and marks it PENDING for L1.
2. **Version drift vs census.** Census inventory records chromium `152.0.7977.82-1`; `/usr/bin/chromium --version`
   now reports `Chromium 154.0.8037.97 Arch Linux`. Census is historical and must not be edited;
   round-16 receipts must pin the version they actually ran on.
3. **Baseline.** `git rev-parse HEAD` = `e38d2599a922cb729186353830fff8e159b4fef0` (matches PLAN.md:4).
   `git status --short` = `?? .ufo/waves/round-16/` only.
4. **Round-16 artifacts absent at drafting:** `measure.mjs` (both `./` and `.ufo/waves/round-16/`),
   `scripts/check-measurement-binding.mjs`, `scripts/webmcp-loopback-round16.mjs`,
   `corpus/knowledge/webmcp-chromium-loopback-round-16.md`. `corpus/evidence/round-16/` exists with no files.
   Expected: these are produced by the owning seats, not this one.
5. **Misroot sweep.** Fleet root `/home/vgpnk/Projects/shokunin` top level has no `*round-16*` entry.
   `reports/` is an empty directory with no `round-16` subdirectory. Glob hits for `round-16`
   elsewhere are sibling lanes' own paths (kaidoku, souji, mado, mori, tsukuroi, kama, kake, kagi,
   kumitate, kotoba, kotodama, kengaku, audio, revenger, chousa, tameshi, `.tower/jj-probe/`); they were
   not opened and are not misroots of this lane. No file from this seat was placed outside its scope.
6. **Tools.** None installed or updated by this seat. Present and used as observed: chromium 154.0.8037.97,
   node v24.21.0. Playwright 1.64.0 was not re-observed by this seat (PENDING). Pacman remains paused
   host-wide per orchestrator ruling; no pacman command was run.
7. **Wave sizes / role mix** not counted in this draft; the entry leaves them PENDING and points to
   `.ufo/waves/round-16/w1/assignments.json` and `swarm-registry.json` for L1 to measure.

## Out-of-scope items (not touched)
- LOG.md, SCORECARD.md, corpus/README.md, corpus/SOURCES.md, PLAN.md, all probe and measure files, and
  any commit: L1 or other owners only.
- The `corpus/README.md` frontier-row correction in finding 1 is a request to L1, not an edit by this seat.

## Recommended checks for the main agent after integration
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --short` — confirm only owned round-16 paths changed.
- Re-run `git rev-parse HEAD` at close and replace the baseline PENDING with the observed value.
- Re-check the absent-artifact list in finding 4 and the misroot glob in finding 5 at integration time.
