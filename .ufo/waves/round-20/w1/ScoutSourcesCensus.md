# ScoutSourcesCensus — tabi round 20, wave 1

Scope: bounded source-registry census (`corpus/SOURCES.md`) plus the S096 anchor check against `.ufo/waves/round-20/design.json`. Read-only; this file is the only write. Source-only: no runtime, browser, or capability claim.

Axes: (1) row/tier/status integrity, (2) backlink (`used-by`) count and reach, (3) S096 anchor coverage against the 12 design decisions, (4) pin consistency.

## 1. Gate run

Command, lane root, default arguments: `node scripts/check-sources.mjs`

```
SOURCES_GATE verdict=clean rows=99 tiers=A:86,B:4,C:9 status=queued:19,mined:71,rejected:9 findings=0 file=corpus/SOURCES.md
```

Exit 0 (clean verdict). No `--self-test`, no other command run, no tool installed or updated.

## 2. Initial counts

Working tree. Identical to the baseline record at c49929430d996b016dde2e3a3a5be380f3433fdb (`.ufo/waves/round-20/source-counts-before.json`).

| Axis | Value | Membership |
|---|---|---|
| Rows | 99 | S001–S099, contiguous, no duplicate IDs (raw read: 31 + 31 + 37) |
| Tier A | 86 | all rows not listed below |
| Tier B | 4 | S006, S007, S019, S022 |
| Tier C | 9 | S026, S027, S038, S039, S040, S053, S057, S058, S094 |
| Status mined | 71 | |
| Status queued | 19 | S021, S022, S049, S050, S051, S052, S055, S056, S080, S081, S084, S085, S086, S088, S089, S090, S092, S093, S098 |
| Status rejected | 9 | exactly the tier-C rows |
| Findings | 0 | |

Knowledge notes: 37 (`counts-before.json`; glob returns 37 now). Lesson files: 44.

## 3. Backlinks (`used-by` column)

Counted by reading all 99 rows raw; the grep view truncates the column.

| Measure | Value |
|---|---|
| `used-by` path entries | 80 |
| rows with ≥1 entry | 72 (71 mined + S094 rejected) |
| rows with 2 entries | 8: S011, S013, S017, S023, S024, S025, S028, S029 |
| rows with 1 entry | 64 |
| rows with 0 entries | 27 (19 queued + S026, S027, S038, S039, S040, S053, S057, S058) |
| entries by tier | A 76 over 68 rows; B 3 (S006, S007, S019); C 1 (S094) |
| distinct targets | 15: 11 knowledge notes + 4 lessons |
| knowledge notes with a declared backlink | 11 of 37 |
| lesson files with a declared backlink | 4 of 44 |

Entries per target:

| Target | Entries | Rows |
|---|---|---|
| knowledge/source-recheck-round-18.md | 12 | S065–S076 |
| knowledge/webmcp-declarative-validation-round-19.md | 11 | S077, S078, S079, S082, S083, S087, S091, S095, S096, S097, S099 |
| knowledge/webmcp-chromium-loopback-round-16.md | 9 | S020, S030–S037 |
| knowledge/webmcp-invocation-round-17.md | 9 | S041–S048, S054 |
| knowledge/webdriver-bidi-capability-matrix.md | 8 | S005–S012 |
| knowledge/web-flake-retry-evidence.md | 7 | S013–S019 |
| knowledge/harness-hardening-round-18.md | 6 | S059–S064 |
| knowledge/chrome-remote-debugging-profile-boundary.md | 4 | S001–S004 |
| knowledge/source-recheck-round-12.md | 4 | S011, S013, S017, S028 |
| knowledge/playwright-accessible-locators-and-snapshots.md | 3 | S023–S025 |
| knowledge/aria-loopback-round-13.md | 3 | S023–S025 |
| lessons/kaika-fleet-round-1.md | 1 | S028 |
| lessons/round-14.md | 1 | S029 |
| lessons/round-15.md | 1 | S029 |
| lessons/round-19.md | 1 | S094 |

What the gate checks: each `used-by` path must exist and contain the row ID (E11); each mined row needs at least one path (W03). Both produce zero findings. The gate does not check reverse citations.

Fleet validator at baseline (`.ufo/waves/round-20/census-before.json`, `sources-census.sh validate`): exit 0, SOURCES.md `ok`, and 15 W04 "duplicate url across scopes" warnings: S058, S065, S066, S068, S069, S070, S073, S074, S075, S076, S077, S095, S096, S098, S099. Every one of these rows has teaches beginning "supersedes S…". Warnings, not failures.

## 4. S096, the round-20 primary source

- Row: tier A, kind code, mined, opened 2026-10-21, recheck on-release, used-by = 1 (`knowledge/webmcp-declarative-validation-round-19.md`), teaches "supersedes S078". S078 stays mined with the same used-by.
- Retrieval (`source-opening.json`): urllib, base64 decode of Gitiles TEXT, opened 2026-10-21T09:52:32Z. Its own scope note: same immutable bytes, no publisher-authenticity proof beyond HTTPS.
- Pins: decoded sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` appears in 11 places across 5 artifacts: design.json (:19, :128); source-opening.json; SOURCES.md S096 and S078 rows; round-19 `decisions.json` `bodySha256` (five source objects, :152, :283, :462, :514, :566); round-19 lesson row (:131). Source URL identical in design.json, source-opening.json, and the S096 row. Retained decoded size 68,278 B; reader numbering ends at line 1740.
- Not verified here: the on-disk file hash. Only the textual match across records was checked.

Observed S096 citers in lane docs (grep; evidence and `.ufo` excluded):

| File | Lines | In declared `used-by`? |
|---|---|---|
| SKILL.md | 2160, 2165, 2172, 2174, 2176 (DV-06, DV-11, DV-18, DV-20, DV-22) | no |
| corpus/README.md | 424 | no |
| knowledge/webmcp-declarative-validation-round-19.md | 129 | yes |
| lessons/round-19.md | 131, 137, 175 | no |

Three citing files are undeclared. The gate does not require declaration.

## 5. Anchor coverage: design decisions vs S096 anchors

Declared S096 anchors: 174–328, 729–758, 818–842.

| Decision | Span | Covered |
|---|---|---|
| LC01 | 181–186 | yes (174–328) |
| LC02 | 189–210 | yes |
| LC03 | 249–258 | yes |
| LC04 | 212–218 | yes |
| LC05 | 218–221 | yes |
| LC06 | 224–229 | yes |
| LC07 | 261–275 | yes |
| LC08 | 290–298 | yes |
| LC09 | 298–319 | yes |
| LC10 | 320–327 | yes |
| LC11 | 787–815 | **no**: inside undeclared gap 759–817 |
| LC12 | 818–830 | yes (818–842) |

LC11 content: lines 787–788 set `declarative_webmcp_call`; 790–806 are the respondWith branch; 807–813 are the preventDefault-without-respondWith error ("The site has a programming error: it called preventDefault() … without also calling respondWith()"). The file supports the LC11 topic; the row's anchor list omits it, and the gate cannot detect this. The lane's correction procedure is a new SOURCES row, with status/recheck/used-by transitions logged only where those cells change (SKILL.md:2010–2011).

Second observation: lines 833–842 are `submitFromJavaScript()`, which calls `CallDoneCallback(base::ok(String()))` at 841, a second null-String navigation sentinel. No decision span covers 841; LC12 covers only the `should_submit` path (818–830). [INFERENCE] Round-20 wording that generalizes the sentinel to all navigation needs line 841 or narrower wording.

## 6. Integration risks (report only; nothing edited)

1. S096 `used-by` needs the round-20 note path once that note exists. Gate E11 requires the path to exist and contain "S096". Baseline 80 → 81 if that note is the only addition. [INFERENCE]
2. The LC11 anchor gap needs a superseding row before the note cites 787–815 as sourced.
3. Retained S096 bytes sit under `corpus/evidence/round-20/sources/`, a directory new this round. Criterion 28 requires committed bytes before a note or row cites them. A default (gitignore-on) glob lists the file, so it is not ignored; tracking was not checked (no git run).
4. SKILL.md has no prose registry-row count (`SOURCES` grep: :1600, :2010 only).

## 7. Checks for main, once after integration

- `node scripts/check-sources.mjs`: expect rows 99 unless rows were added; verdict clean.
- `sha256sum corpus/evidence/round-20/sources/html_form_element.cc`: expect `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- `git ls-files corpus/evidence/round-20/sources/` at the integration revision: expect the file tracked.
- Re-count `used-by` by the same method: baseline 80.

## 8. Limits

- Gate ran on the working tree, not at c49929430d996b016dde2e3a3a5be380f3433fdb; counts match the baseline record.
- Fleet W04 output and `*-before.json` values are copied from baseline artifacts, not re-run.
- Read coverage: README and QUALITY in full; SKILL.md lines 1–300 plus its heading map and targeted greps; S096 source lines 1–2, 24–98, 174–330, 635–636, 729–760, 785–849 (license lines 3–23 not read).
- Span checks read the cited lines. No runtime, browser, or behavior claim is made.
- No tests, builds, formatters, or git commands run.

Report: .ufo/waves/round-20/w1/ScoutSourcesCensus.md
