# R96Scribe: C1 knowledge-note draft (round 96, wave w1)

Seat: R96Scribe (scribe, leaf member, no subagents, no Chromium runs, no commits, no git/jj mutation).
Milestone: knowledge note draft. Judged on: coverage, quality.

## What I drafted

- `.ufo/waves/round-96/w1/R96Scribe-note.md`: knowledge-note draft in the shape of
  `corpus/knowledge/chromium-oopif-backendnode-misdelivery-round-95.md` (front matter `source` / `verified-at` /
  `recheck`, then the law in one sentence, the scored-run table, why, practical rules, declared limits 1-6 in
  substance, evidence pointers, sources). Not written into `corpus/knowledge/`; the L1 integrates it.
- `.ufo/waves/round-96/w1/R96Scribe-recheck-corpus.json`: the receipt-mode recheck output (see Commands).
- This report.

## Values read from the receipt and the scored run (exact)

- `corpus/evidence/round96/client-oopif-filechooser/receipt.json`: schema `tabi-client-oopif-chooser-r96`, nonce
  `tabi-r96-live-c1225d318ea6`, driverSha256 `4020e57e…63b91`, chromium `Chromium 155.0.8059.84 Arch Linux`, crossHost
  `localhost`, reps 3, timeoutMs 3000, answer `{tabi-r96-answer.txt, 22}`, ports http 31691 / child 31692 / cdp 31693,
  generatedAt `2026-11-09T02:48:24.263Z`, failures `[]`, 15 legs.
- libs: puppeteer-core 25.16.0 (integrity `sha512-VA5Pf54N…`, `lib/puppeteer/cdp/Page.js` sha256 `31a522df…`);
  playwright-core 1.65.0 (integrity `sha512-vNSKgH6Y…`, `lib/coreBundle.js` sha256 `4ef83305…`).
- Witness B (`backendNodeId`): 2 in PPW-1, PPW-2, PPW-3; one event each; mode `selectSingle`; frameId equal to the
  iframe target id (`F06343F6…`, `B97D1113…`, `0B2EE83D…`).
- Puppeteer cross-site (PPX-1..3, PPW-1..3): `TimeoutError`, `Waiting for \`FileChooser\` failed: 3000ms exceeded`;
  child `#s` `[]`; parent `#pp` `[]`; click `[["s",true]]`.
- Puppeteer same-site (PPS-1..3): chooser, `isMultiple()` false, child `#s` `[["tabi-r96-answer.txt",22]]`.
- Playwright cross-site (PWX-1..3) and same-site (PWS-1..3): chooser, `isMultiple()` false, element id `s`, child `#s`
  `[["tabi-r96-answer.txt",22]]`.
- Scored `.ufo/waves/round-96/scored/c1-live.json`: verdict `clean`, checkCount 165, findings `[]`, driverRun status 0,
  outcomes timeout 6 / chooser 9. `c1-live.rc` = 0. Receipt sha256 `aad4611df15840e77589c901e444552a7ad5d36b0768ef567ddbc09a65fb635d`;
  the corpus copy and `scored/live-receipt.json` are byte-identical (`cmp` silent; sha256 equal).

## Commands run (exact; exit codes observed)

1. `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --show-toplevel` → the lane path (read-only).
2. `node scripts/check-client-oopif-chooser-round96.mjs --lane <lane> --expect-driver-sha256 4020e57ef865e5eed506796238bb981bb4dbcb226e8fe80eb52728585ce63b91 --receipt corpus/evidence/round96/client-oopif-filechooser/receipt.json --expect-nonce tabi-r96-live-c1225d318ea6 --json > /fast/scratch/hyaku/tabi-r96/R96Scribe/R96Scribe-recheck-corpus.json`
   → rc 0; `verdict clean`, `checkCount 163`, `findings []`, `mode receipt`, receipt sha256 `aad4611d…`.
   Copied to `w1/R96Scribe-recheck-corpus.json`.
3. Same counter, `--receipt .ufo/waves/round-96/scored/c1-live.json` (wrong file type, probe of refusal) → rc 2 (setup).
4. `node` one-liners reading the receipt: frame lists (`frames == [parentUrl, childUrl]`) 15/15; 15 distinct browser ids;
   per-leg tabulation as in the note.
5. `sha256sum` of the corpus receipt and `scored/live-receipt.json` (both `aad4611d…`, equal). I did NOT recompute the
   sha256 of `sources/Page.ts`: its value `e7f2f6b8ea8b…` is read from `.ufo/waves/round-96/sources/sha256.txt` and matches
   the SOURCES.md S236 row (both as recorded, not recomputed). The instrument hashes in `controls/instrument-sha256.txt`
   were not re-checked by this seat.
6. `grep` of the counter (lines 42-43 constants; 176-228 per-leg checks) to compare its enforced checks with the frozen
   sentence (see Findings).
7. `pgrep -fc "remote-debugging-port=31693"` → 0; no chromium launched by this seat (I was assigned no port triple).
8. Scratch `/fast/scratch/hyaku/tabi-r96/R96Scribe` removed with `rm -rf` before this yield.

Not run: the `--live` counting command (launches Chromium on ports I was not assigned; the scored run already exists);
the forgery battery; any `npm install`. No tool was installed or upgraded. No pacman transaction.

## Findings on the frozen claim wording

1. **Counter vs frozen sentence (predicate).** I compared `scripts/check-client-oopif-chooser-round96.mjs` lines
   176-228 with the predicate bullets in `plans/round-96.md` §Claim. Every enforced item matches the frozen sentence:
   schema, nonce, driver pin, chromium containing `155.0.8059.84`, crossHost `localhost`, reps, timeoutMs 3000, libs
   pinned exactly, answer, ports, leg order (`eq` on the ordered leg list), `failures` empty and no leg error, distinct
   UUID browser ids, leg arm fields and URLs, browser version string per library, frames `[parent, child]`, iframe-target
   count and url per arm, one trusted click, parent `#pp` `[]`, the Puppeteer timeout (name, exact message, multiple
   null, element null), child `#s` `[]` or `[answer]`, the chooser checks (resolves, multiple false, element `s` on
   Playwright), and the witness checks (target = iframe target, one event, `selectSingle`, integer `backendNodeId` > 0,
   frameId = target). I found no narrower enforcement on the predicate itself.
2. **"Never" sentence is broader than the instrument (falsifies-wording).** `plans/round-96.md` §Claim, the opening
   sentence of the "Sourced" paragraph, reads: "Puppeteer v25.16.0 never resolves `page.waitForFileChooser()` for a
   chooser opened inside a cross-site iframe — even when a separate CDP connection proves the chooser opened in that
   iframe". The instrument enforces only that the wait ends in a 3000 ms `TimeoutError` on the 6 cross-site Puppeteer
   legs (3 reps, one build, `localhost` vs `127.0.0.1`). "Never" over all waits is not enforced (declared limit 4 says
   a longer wait is unmeasured), and "a chooser opened inside a cross-site iframe" is proven only on the PPW legs
   (witness). On PPX the chooser's opening is not observed (limit 4 says so). The predicate itself is accurate; the
   prose sentence is not. The note uses the narrower wording.
3. **S230 cited for a mechanism the staged evidence does not contain.** The frozen claim says S230 is "Playwright
   `crPage.ts` v1.65.0, per-frame-session listener". The S230 row in `corpus/SOURCES.md` records only lines 636-637,
   `_handleFrameTree` (OOPIF attached from the parent session, frame id = target id). No Playwright source is staged in
   `.ufo/waves/round-96/sources/`. The Playwright listener account is therefore unsupported in the round's evidence. The
   behaviour (Playwright 6/6 chooser resolutions with fills) is supported by the receipt. The note says so.
4. **The "chooser opened" premise on PPX legs.** Same root as item 2. The note states the timeout and the empty child for
   PPX, and attributes the chooser opening only to PPW.
5. **Count.** The frozen claim states no check count (only `--live` exit 0, verdict clean, 0 findings over 15 legs). The
   scored 165 includes `driver-exit` and `ports-bound`; the receipt-mode recheck gives 163. No frozen count is falsified.
   The note gives both numbers with the reason.
6. **Pinned file vs staged file.** The staged `Page.ts` (sha256 `e7f2f6b8…`) is the TypeScript source at the tag. The
   pinned library file is the compiled `lib/puppeteer/cdp/Page.js` (sha256 `31a522df…`). The receipt does not show that
   the compiled file corresponds to the staged `.ts` lines 339/361/561-562; the line numbers are the source's. The note
   labels this as the source's account.
7. **S213 pins another Chromium.** S213's tag pins Chromium 156.0.8078.47, not 155.0.8059.84. The note cites S213 only
   for the `uploadFile` description and marks `uploadFile` UNMEASURED.

Verdict basis: items 2-4 are the frozen-wording falsification (prose "never" + chooser-opened premise). Item 3 is a sourcing
gap, not a leg-level falsehood. No leg-level statement of the predicate is false on the scored receipt (checked 15/15 legs
against the counter's checks above), and no re-derived count differs from a frozen number.

## Claim sentences I could not support from the receipt

- "Puppeteer … never resolves … for a chooser opened inside a cross-site iframe" (item 2).
- "per-frame-session listener" for Playwright (S230 row; item 3).
- Any statement that a chooser opened in the iframe on PPX legs (item 4).
- Any statement about `ElementHandle.uploadFile`, longer waits, headed mode, or launch paths (declared limits; not measured).

## Artifacts

- Note draft: `.ufo/waves/round-96/w1/R96Scribe-note.md`
- Recheck output: `.ufo/waves/round-96/w1/R96Scribe-recheck-corpus.json`
- Evidence the note cites: `.ufo/waves/round-96/scored/c1-live.json`, `.ufo/waves/round-96/scored/live-receipt.json`,
  `corpus/evidence/round96/client-oopif-filechooser/receipt.json`, `.ufo/waves/round-96/controls/rc.txt`,
  `.ufo/waves/round-96/probes/probe0.out`, `.ufo/waves/round-96/sources/Page.ts`.

## Checks for the main agent

- Read the note's front-matter `recheck:` line once against the counter (it is receipt mode; the scored count is `--live`).
- Decide whether `corpus/SOURCES.md` S230 needs a row for the Playwright chooser listener, or the note's Playwright
  mechanism sentence stays removed (as drafted).
- The `--live` counting command was not re-run by this seat; the scored run stands on its own record.

VERDICT C1: falsifies-wording
