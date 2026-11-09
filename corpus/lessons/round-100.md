# tabi — round 100

L1 `TabiR100`. Base `9a478a2e` (lane tip at round start; rounds 93-99 closed admitted). ONE claim — C1
coverage, the new capability generation `client-oopif-uploadsets-linux` (duplicate names kept, a 0-byte
payload lands as a real file, one path + one payload refused client-side, the two client-launched
browsers land two paths trusted, a directory walks recursively on a `webkitdirectory` input) — worded as the
conjunction of its counter's checks with the process facts named as driver-pin facts, frozen with its
executed controls in commit `468c2b94` (`claims.json.frozenAt` 03:14:58 -03:00) before the scored run
(`88b488db`) and before the wave `.ready` was written (03:16:41).

## Gate

### Sources — opened this round

- **S248** (admit, tier A, `mined`) — Playwright `packages/playwright-core/src/client/elementHandle.ts` at
  tag `v1.65.0`, https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/client/elementHandle.ts
  (accessed 2026-11-09 03:20 -03:00 by the L1, HTTP 200, 15,091 B, sha256 `b5e6046e19cb`, staged
  `.ufo/waves/round-100/sources/pw-elementHandle.ts`). Line 287: "File paths cannot be mixed with buffers"
  (5 words, inside `convertInputFiles`); line 278: "File paths must be all files or a single directory"
  (8 words, inside `resolvePathsAndDirectoryForInputFiles`). It teaches that the MIXED refusal is raised
  client-side before any browser call, and that a directory call takes exactly one path which must be a
  directory.
- **S249** (admit, tier A, `mined`) — same file, line 278 (see S248). It teaches the DIR leg's shape.
- **S250** (admit, tier A, `mined`) — WHATWG HTML, §4.10.5.1.17 File Upload state,
  https://html.spec.whatwg.org/multipage/input.html (accessed 2026-11-09 03:18 -03:00, HTTP 200,
  687,515 B, sha256 `b0202de1c0b4`, staged `.ufo/waves/round-100/sources/whatwg-input.html`). Lines
  4021-4025: "Filenames must not contain path components, even in the case that a user has selected an
  entire directory hierarchy" (20 words, count run by the L1 on the tag-stripped staged copy; the
  `multiple` one-file sentence sits at lines 4027-4028 of the same section). It teaches that a selected
  directory hierarchy arrives as basenames with the tree in `webkitRelativePath` — the DIR leg's
  `one.txt`/`two.txt` names. The `webkitRelativePath` definition itself is **not** in this document
  (0 occurrences in the staged copy, counted by R100Scout and the note); its normative home is the WICG
  entries API — see the post-wave correction in the r100 note.
- Re-opened unchanged (byte-identical sha256 to their rows; no cell changed, so no `status`/`recheck`/
  `used-by` change is logged): **S240** `dom.ts` (`65cb43c91893`; lines 756-761 the Non-multiple and
  `webkitdirectory` refusals), **S238** `fileUploadUtils.ts` (`96dd5ef0713d`; line 43 not 44 carries the
  exactly-one-category throw, line 80 the mimeType fallback), **S216** `input.html` (`b0202de1c0b4`;
  §4.10.5.1.17), **S237** `ElementHandle.ts` (`c86ed958566f`; lines 113-116 the `multiple` assert). The
  r100 note cites all four.

### Rejected as rows (reasons; flip conditions)

- WICG entries API (`https://wicg.github.io/entries-api/`, 316,318 B; `webkitRelativePath` getter
  definition) — reject as a row this round: it grounds a *note* correction (where the attribute is defined),
  not a leg of the predicate, and the L1 opened it via the wave's scout seat rather than the L1's own
  fetch. Flip: a round that makes the attribute's definition itself the claim.
- Chromium Blink `file_input_type.cc` / `directory_lister.cc` / `file_select_helper.cc` — reject as rows:
  they explain the browser-side recursive walk the DIR leg measures, but the claim's mechanism is Playwright
  client + browser behaviour, not Blink source. Flip: a round whose measured surface is Blink's enumeration
  (e.g. a depth limit or ordering rule).

### Census

Start (`.ufo/waves/round-100/census-start.txt`): `tabi E11` on the three new rows (the note naming them
did not exist at census time) — expected at round start; the registry was 247 rows before this round.
End: `tabi ok` (see `census-end.txt`), exit 0. Registry 247 → 250 rows (S248-S250), all tier A, `mined`,
`90d`, used-by the r100 knowledge note.

### Assimilation / considerthese

Assimilation: none (the lane's package adoption is not this round's claim). considerthese: no
`considerthese/` directory exists in this lane.

## Mistakes

1. **class: citation not in the document it is attributed to (stale/mis-attributed source).**
   Evidence: `plans/round-100.md` §Claim "Sourced" said S250 carries "the `webkitRelativePath`
   definition" and "each has a staged copy and a fetch-log line". R100Critic2 counted 0 occurrences of
   `webkit`/`webkitRelativePath`/`webkitdirectory` in the staged `whatwg-input.html` and found
   `pw-elementHandle.ts` (S248/S249) absent from `fetch-log.txt` (4 URLs, 5 files). The staged WHATWG
   copy is byte-identical to upstream, and `pw-elementHandle.ts` is byte-identical too — the code was
   right, the attribution was not. Captured-by: the wave — R100Critic2 (byte count) and R100Scout
   (token counts in `R100Scout-whatwg-tokens.json`); no lane gate reads the SOURCES anchor text against
   the staged bytes. Fix: append-only corrections in the r100 note (entries API + Blink IDL named) and
   the S248/S249 fetch-log line added post-wave (`.ufo/waves/round-100/sources/fetch-log.txt`). **Shown
   able to fail:** `grep -c 'webkitRelativePath' .ufo/waves/round-100/sources/whatwg-input.html` → 0
   where 1 was claimed; `grep -c 'client/elementHandle' .ufo/waves/round-100/sources/fetch-log.txt` → 0.
2. **class: line number carried from a draft that never matched the pinned file (off-by-one).**
   Evidence: the plan cited `fileUploadUtils.ts` "line 44" for the exactly-one-category throw; in the
   staged v1.65.0 file the throw is line 43 (line 44 is blank). Captured-by: R100Critic2 (upstream
   re-fetch diff). Fix: the S238 row's anchor is left as-is pre-freeze and corrected in the lesson
   (this entry) and the r100 note's why-section quotes line 43; a correction row is owed if S238's cell
   must be exact. **Shown able to fail:** `sed -n '43p;44p' .ufo/waves/round-100/sources/pw-fileUploadUtils.ts`.
3. **class: amendment dated before the findings it cites (process ordering).**
   Evidence: `plans/round-100.md` §Amendment A1 (dated "post-wave") sits in the freeze commit `468c2b94`
   (03:15:17), which precedes the wave dispatch (`w1.ready.dispatched` 03:17:23); R100Critic1's report
   was written 03:19:05. The substance is nonetheless right — R100Critic1 reached the same two
   narrowings, and the scored run (`launchFailed []`, clean 216) exercised neither clause — but the
   amendment text names findings that did not exist when the file was written. Captured-by: R100Scribe
   F4 (mtime ordering). Fix: post-wave amendments go in a separate post-wave commit, never in the
   freeze commit, even when the wording is known in advance. **Shown able to fail:** the two timestamps
   cannot be reconciled in either direction (`git show -s --format=%cI 468c2b94` vs
   `w1.ready.dispatched`); a correctly-ordered amendment would carry the wave's own timestamp.
4. **class: history sentence narrower than the receipts (negative-claim over-scope).**
   Evidence: A1 item 1 narrows the history sentence to "within the client-oopif r95-r99 drivers, no call
   puts three files, two files with a duplicate name, or a 0-byte file into one input". The r98 (`PUR`)
   and r99 (`PUAM`) absent-path arms *do* leave a 0-byte `File` in one input
   (`tabi-r98-missing.txt` / `tabi-r99-missing.txt`). The clause holds only for deliberate *named
   payload* files, not for the absent-path phantom (its reads reject `NotFoundError`; EMPTY1's read
   succeeds). Captured-by: R100Scribe F3. Fix: A1 is narrowed again by this lesson's entry (that is the
   append-only record); the future rule from r99 E1 stands — a "no lane instrument has ever" sentence
   runs its grep over `scripts/` whole, not a class glob, and a "no files" sentence names its producer.

## Leads (not rows, not claims this round; R100Exec3 ad-hoc probe, 3/3 each,
`.ufo/waves/round-100/w1/R100Exec3.md`)

- Duplicate *path* basenames: two paths both named `dup.txt` on `#m` (`isLocal`) land in order, trusted
  (the path-side analogue of DUP3).
- Empty file *path*: a 0-byte path on `#m` and on `#s` lands size 0, trusted, reads back ok (the trusted
  counterpart of EMPTY1).
- Four payloads on `#m` land in order, untrusted: no file-count ceiling at 4.
- `text()` on a 256-byte binary is lossy (256 chars, no throw) and `slice(1,3).arrayBuffer()` gives the
  2-byte digest (r99Exec3 (h) carried).
- A file path on `#d` is refused `[webkitdirectory] input requires passing a path to a directory`
  (S240 line 760-761) and a directory path on `#m` is refused `File input does not support directories,
  pass individual files instead` (S240 line 758); `[dirPath, filePath]` is refused
  `File paths must be all files or a single directory` (S249).

Each is a candidate counted leg for round 101 (r100 limit 4).

## Wave w1 (12 seats; every seat filed; artifacts in `.ufo/waves/round-100/w1/`; `w1-results.json`)

Roles: executor ×3, critic ×2, mutation-tester, revenger, reviewer, sentinel, scout, scribe, connector;
attack share (reviewer + critic + mutation-tester) 4/12 = 33 %. 0 dead seats. Verdicts: 10 `neutral`, 2
`falsifies-wording` (R100Critic1 W2 limit-8 first clause — the exact case r99 A1 item 2 narrowed, now
re-closed in the post-wave plan amendment; R100Critic2 the §Claim "Sourced" attribution of the
`webkitRelativePath` definition to S250 plus the `pw-elementHandle.ts` fetch-log gap and the
`fileUploadUtils.ts` 44-vs-43 line — narrowed by the r100 note's append-only correction and the S238
line correction above).
Reproductions of the frozen `--live` command: R100Exec1 ×2 clean 216; R100Exec2 `--reps 10` clean 678
and default clean 216, live killers 6/6; R100Sentinel strace run clean with 0 writes under `/tmp`/`/var/tmp`.
R100Mut 112 mutants / 56 killed / 11 survived (all equivalent, live-only or cosmetic; the r99
battery-survivor classes are now battery cases and confirmed killed) — routed to r101.
R100Sentinel's hardened-counter (exit-3 conjunct) and copy-then-execute diffs are recommendations against
limit 6/8 classes, not integrated (frozen bytes stay frozen); routed to r101.
R100Scout's opened sources (entries API, Playwright/Puppeteer issues) are held as leads, not rows.
Corrections integrated: R100Connector H1-H9 relation scan (no contradiction; the size-0-by-producer
table noted in the r100 note), R100Sentinel's remediation diffs carried forward.
