# ReviewSourceUse — tabi round 14, w1

Reviewer: TabiR14.ReviewSourceUse (leaf, read-only). Date: 2026-10-20.
Root: /home/vgpnk/Projects/shokunin/tabi-shokunin. Only write: this file.
No gate, census, self-test, browser, or build was executed. Tools installed or updated: none.
Author-side review; not non-author verification.

## State read

`corpus/SOURCES.md` changed while I was reading it. The first read showed 28 rows. The later read, which I treat as authoritative, shows **29 rows**: S029 was added at `corpus/SOURCES.md:43`, a `own-work` tier-A row. Counts by hand from the registry: tier A=23, B=4, C=2; status mined=24, queued=3, rejected=2. L1 should recount with the census command in the handoff section.

Axes used: calibration (teaches and anchor against the located source), coverage (which admitted claims have non-author reopen evidence), adjacency and integrity (gate validity and append-only rules).

## Verdict

- One gate-blocking defect: S029 `recheck` is `on-change`, which the validator rejects.
- Own-work tier A (S029) is defensible only for the field-read scope it already states. It cannot support runtime or Node-reproducibility claims.
- External reopen evidence covers 6 of the 23 tier-A rows. The other 17 rest on author-side opens only.
- Remaining calibration and anchor defects are immutable registry cells. The prior round-13 ruling carries them as debt. No supersedes row is recommended.

## Findings (by severity)

**F1 [blocking] — S029 recheck is invalid for the gate.**
- `corpus/SOURCES.md:43`, `recheck` cell = `on-change`.
- `scripts/check-sources.mjs:322`: `if (!isIsoDate(recheck) && !/^[0-9]+d$/.test(recheck) && recheck !== 'on-release') addFinding(... 'bad_recheck' ...)` → E09.
- `CORPUS.md` contract (`/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md:105-106`): recheck is "ISO date or cadence (`90d`, `180d`, `on-release`)". `on-change` is not in the contract, and the contract changes only by a new version.
- The round-14 lesson records the same value at `corpus/lessons/round-14.md:21` ("recheck nonexistent→on-change").
- Recommendation: change the S029 recheck cell before commit to `on-release`, the only non-date value the contract admits. Its trigger is the round-13 runtime pin. Update `round-14.md:21` to match. S029 is new this round, so this is a pre-commit correction, not an append-only change.

**F2 [high] — S029 tier A is defensible only for field reads.**
- `CORPUS.md:93-96` defines A as including "the lane's own re-runnable gate output". The receipt is a runtime experiment output, not a gate output.
- Re-running the producer needs uncommitted inputs: `corpus/lessons/round-13.md:71` ("node_modules/artifacts are ignored and not committed") and `corpus/knowledge/aria-loopback-round-13.md:11` (local dependencies restored with `npm ci`; no browser is committed).
- What is re-derivable from committed bytes is the JSON field read. The S029 scope cell (`SOURCES.md:43`: "Exact recorded worker cleanup and observed-versus-descriptive Node metadata, not a new runtime observation") matches that.
- Recommendation: keep A with this scope. Add `receipt.json` sha256 to the anchor. Confirm no knowledge note cites S029 for runtime behavior. The only current citer is `corpus/lessons/round-14.md`, and it uses S029 correctly (`round-14.md:19`, `:37-38`).
- Field locations checked by reading: aggregate `cleanup.server.listeningAfter: true` at `corpus/evidence/round-13/aria/receipt.json:2521`; `perWorker[0].listeningAfter: false` at `:2529`; `runtime.node: "26.12.0"` at `:20`; `pin.node` `recorded: "24.21.0"`, `minimumMajor: 20` at `:48`, `:61-63`. The anchor paths in S029 are correct.

**F3 [medium] — SOURCES.md header is stale.**
- `corpus/SOURCES.md:3-6`: "Every row below was opened in kaika fleet round-1 (2026-10-19) by the seat named in…". This is false for S029 (opened 2026-10-20, lane-authored). It is also loose for S028 (opened by the L1 re-fetch, not a seat, `corpus/lessons/kaika-fleet-round-1.md:99`).
- Recommendation: add a dated qualifier to the prose header. Headers are not registry cells. Do not touch row cells.

**F4 [medium] — S028 has no located quote for its load-bearing teaches.**
- `SOURCES.md:42` teaches: the check is compiled only under `GOOGLE_CHROME_BRANDING` and fails closed; anchor `.cc:169-177`.
- `corpus/lessons/kaika-fleet-round-1.md:44-70` covers S001–S027 only. The S028 entry at `:99` is a post-review addendum with no quote.
- The only S028 quote on file is `corpus/lessons/round-12.md:47`: "Prefers a free port over switching from IPv4 to IPv6." That is the `:113–114` port-fallback comment, a different claim.
- `corpus/knowledge/chrome-remote-debugging-profile-boundary.md:27-28` quotes `#if BUILDFLAG(GOOGLE_CHROME_BRANDING)` as code, but that excerpt is not a Gate record.
- CORPUS rule 1 requires a Gate record with a ≤25-word located quote for every new row. This is a historical gap, not a current defect in S029.
- Recommendation: if the round-14 Gate should cover S028, a fresh located re-open of `.cc:169-177` must be done and recorded in the round-14 lesson. This review did not open it, to avoid introducing new source material.

**F5 [medium] — S025 anchor is a bare homepage and its scope exceeds the opened page.**
- `SOURCES.md:39`: anchor "APG home, no revision marker"; scope "ARIA authoring semantics and widget patterns".
- CORPUS anchor rule (`CORPUS.md:99-100`): "exact section / heading / page / line plus revision… Never a bare homepage."
- Only the APG home was opened. The per-widget claim in the scope is not supported by an opened row. The round-13 ruling (`.ufo/waves/round-13/w1/ReviewSources.txt:55`, `:82`) keeps this as dissent: any future per-widget claim needs a new opened row first.
- S021 (`SOURCES.md:35`) has the same anchor defect: "rolling docs, no revision marker". S021 is queued and cited by no note.
- Recommendation: carried debt, per the round-13 ruling. The knowledge note already bounds the claim (`playwright-accessible-locators-and-snapshots.md:47`, §5 line 83). No supersedes row.

**F6 [medium] — S024 teaches is not in the source, and its anchor omits the sections it relies on.**
- `SOURCES.md:38` teaches: "structural evidence, not pixels". The aria-snapshots page does not say this. The note labels it synthesis (`playwright-accessible-locators-and-snapshots.md:79-81`).
- The teaches also says "matched partially or strictly". The anchor cites only "§Aria snapshots". The partial and strict behavior sits in §Partial matching and §Strict matching. The note corrects this attribution at §7 (`:127-131`).
- Carried debt, per round-13 `ReviewSources.txt` §4 (`:54`).

**F7 [low] — S023 teaches overstates the located sentence.**
- `SOURCES.md:37` teaches: "explicitly not an accessibility audit".
- Located sentence (§Locate by role, `corpus/lessons/kaika-fleet-round-1.md:66`, 19 words): "role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines".
- Carried debt. The knowledge note already labels it [inference] (`playwright-accessible-locators-and-snapshots.md:83`).

**F8 [low] — QUALITY #15 points outside the lane, and the in-fleet copy is not named.**
- `corpus/QUALITY.md:36-40` points to `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md`. That path is outside the lane and the fleet root.
- The fleet root has a frozen vendored copy: `/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`. Its tier definitions (lines 26-30) match `CORPUS.md:93-97`. `CORPUS.md:66-69` says the canonical section is the authority and fleet copies do not override.
- Recommendation: #15 should name the canonical path and the lane-readable vendored copy. No change to the tier rule.

**F9 [info] — quote-count erratum checks.**
- S024 "A template is a constraint, not necessarily a complete serialization of the accessibility tree." = 14 whitespace-separated words. The round-12 spot-check's "16" (`corpus/lessons/round-12-verifier-spotcheck.md:153`) is corrected by `round-13-verifier-spotcheck.md:163`. Correction confirmed.

## Own-work (tier A) versus external reopened docs

### Own-work

| row | what it may support | what it may not support | limit |
|---|---|---|---|
| S029 (`SOURCES.md:43`) | exact recorded field values in `corpus/evidence/round-13/aria/receipt.json` and `pin` (aggregate vs per-worker `listeningAfter`; recorded vs observed Node) | any ARIA behavior, browser support, Node-version reproducibility, cleanup completeness beyond the listed worker, a new runtime observation | single committed run; re-derivable from committed bytes only by reading JSON; producer needs uncommitted `node_modules` and browser |

### External reopens for tier-A rows (all 23)

Non-author evidence exists for 6 rows:

| row | non-author reopen | where | result | limit |
|---|---|---|---|---|
| S001 | round-1 W3ReviewTabi | `corpus/lessons/round-1-verifier-spotcheck.md:12` | quote and sha agree except dynamic page (disclosed) | quote is "These switches will no longer be respected if attempting to debug the default Chrome data directory" (16 words, `kaika-fleet-round-1.md:44`); page digest is not stable |
| S004 | round-1 W3ReviewTabi | `round-1-verifier-spotcheck.md:12` | agree | "Enables the default user data dir check even for non-Chrome branded builds, for testing" (14 words, `kaika-fleet-round-1.md:47`); superseded for teaches by S028 |
| S017 | round-1 W3ReviewTabi; round-12 seat reopen | `round-1-verifier-spotcheck.md:12`; `round-12.md:50` | agree | "New `--shuffle` command line option schedules tests in a random order" (11 words, `kaika-fleet-round-1.md:60`) |
| S023 | round-12 closure (sha256 matched); round-13 closure (reader text, not sha) | `round-12-verifier-spotcheck.md:151`, `:159-160`; `round-13-verifier-spotcheck.md:104`, `:115` | agree | "role locators do not replace accessibility audits and conformance tests" (10 words); full sentence 19 words at `kaika-fleet-round-1.md:66` |
| S024 | round-12 closure + integrator; round-13 closure (reader text) | `round-12-verifier-spotcheck.md:152`, `:159`; `round-13-verifier-spotcheck.md:111`, `:116` | agree | "contain (default): Matches if all specified children are present in order." (11 words); "A template is a constraint, not necessarily a complete serialization of the accessibility tree." (14 words, `playwright-accessible-locators-and-snapshots.md:26`) |
| S025 | round-12 closure; round-13 closure (reader text) | `round-12-verifier-spotcheck.md:154`; `round-13-verifier-spotcheck.md:117` | agree; round-13 scoped to home-page authoring scope | "This guide describes how to apply accessibility semantics to common design patterns and widgets." (14 words, `playwright-accessible-locators-and-snapshots.md:29`); no per-widget claim |

Word counts are whitespace splits, counted by hand.

Author-side only (17 A rows): S002, S003, S005, S008, S009, S010, S011, S012, S013, S014, S015, S016, S018, S020, S021, S028, S029. Their opens are seat or L1 re-fetches (`kaika-fleet-round-1.md:72-76`; `round-12.md:44-50`; `round-13.md:21-27`). Tier B rows (S006, S007, S019, S022) are also author-side only. S019 and S022 are abstract-only per their teaches cells.

Round-13 closure is text-level, not hash-level (`round-13-verifier-spotcheck.md:104` "official URLs via `read`"). Do not cite it as a sha256 reproduction.

### Recommended limits on admitted claims

- Runtime claims (ARIA fixture, Node metadata): cite the receipt by path with the commit (QUALITY #2). S029 supports only the field-read reading, not behavior.
- Locator and snapshot semantics: cite S023 and S024 for the located sentences above. Do not cite S023 for "explicitly not an audit". Use the note's [inference] label.
- Partial or strict template behavior: cite S024 §Partial matching and §Strict matching by name, not only §Aria snapshots.
- Per-widget APG keyboard or role claims: not supported. Needs a new opened row.
- Structural-not-pixels: not supported by S024; keep as [inference].
- Flake and wait claims: S019 and S022 are abstract-only. Keep any S019 claim to its Abstract wording.

## Verification for L1 (not run here)

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/check-sources.mjs
node scripts/check-sources.mjs --self-test
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
grep -n -E '(^|[^A-Za-z0-9])S029([^0-9]|$)' corpus/lessons/round-14.md
grep -c '^| S0' corpus/SOURCES.md
```

Expected after F1 is fixed: `SOURCES_GATE verdict=clean rows=29 tiers=A:23,B:4,C:2 status=queued:3,mined:24,rejected:2 findings=0`. Before F1 is fixed, the gate reports `bad_recheck` for S029 (E09).

## Carried debt (not edited)

F4 (S028 quote), F5 (S025/S021 anchors), F6 (S024 teaches and anchor), F7 (S023 teaches), F8 (QUALITY #15 pointer) are carried, not fixed. Immutable cells can only change by supersedes row, and the round-13 ruling opens none. F4 is the only one that could be closed in this round, by a fresh located re-open recorded in `round-14.md`.

## Writes

This file only. No registry, lesson, knowledge, QUALITY, or evidence file was changed.
