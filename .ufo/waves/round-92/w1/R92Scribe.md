# R92Scribe — round 92 knowledge note draft

Seat `R92Scribe` (scribe; axes depth + coverage; milestone "knowledge note draft").
Deliverable: `.ufo/waves/round-92/w1/R92Scribe-note.md` (119 lines, cap 120). The L1 integrates it into
`corpus/knowledge/`; nothing was written under `corpus/`.

## Behaviour of the drafted note

The note follows the shape of `corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md`
(front matter → capability line → fixture → measured laws → limits → what cannot be proved). Content:

- **Front matter** cites S227 (CDP `Target.setAutoAttach` at tag 155.0.8059.84), S228
  (`docs/process_model_and_site_isolation.md` at that tag), S221 (Page.pdl `fileChooserOpened`),
  S222 (DOM.pdl `setFileInputFiles`), the receipt path, the driver sha256 pin and its location in
  `.ufo/waves/round-92/controls/instrument-sha256.txt`, the `verified-at` round/build, and the exact
  `recheck` command line with its observed result.
- **The measured decision table** gives arm X vs arm S for: attached `iframe` targets, `iframe`
  targets in `Target.getTargets`, the iframe target's URL, `targetId` == child frame id, the recorded
  `parentFrameId`, chooser count, the session the chooser arrived on, the chooser's `frameId`, `mode`
  and `backendNodeId`, the answer session and its error, the child input's `files`, the child's click
  records, the click coordinates, and per-leg `error`/`failures`. Every cell names its receipt JSON
  path (`legs[i].attached[]`, `legs[i].browserIframeTargets[]`, `legs[i].iframeTargets[0].url`,
  `legs[i].childFrameId`, `legs[i].choosers[0].session|frameId|mode|backendNodeId`, `legs[i].answer`,
  `legs[i].childFiles`, `legs[i].childClicks`, `legs[i].click`, `legs[i].error`, `failures`) and every
  number was read out of the receipt, not inferred.
- **The operational rule** is six steps for automation authors: enable
  `Page.setInterceptFileChooserDialog` on the page session *and* each attached `iframe` session;
  enumerate with `Target.setAutoAttach {autoAttach:true, waitForDebuggerOnStart:false, flatten:true}`
  on the page session; take the frame's identity from `Target.getTargets` (targetId == child frame id);
  click on the page session and read which session the event arrived on instead of assuming;
  answer with `DOM.setFileInputFiles {files, backendNodeId}` on that same session (the `backendNodeId`
  is session-scoped: 2 in X, 5 in S); then read `files` in the child document.
- **The limits** are copied verbatim from `plans/round-92.md` §Declared limits 1–6 (word-for-word,
  including the em dashes and the `localhost` vs `127.0.0.1` phrasing).
- **What is NOT measured** is an explicit section: no pid/process-layout observation, no
  registrable-domain site pair, no cross-session answer *failure* (the battery's `x-answer-on-page`
  case is a forged-receipt case, not a live one), no native dialog UI, no headful/other build/other OS,
  no non-flatten auto-attach, no browser-level discovery, no receipt-mode forgery resistance, no
  timing beyond the 1500 ms window, one fixture shape only — plus two counter-binding caveats found by
  reading the counter (below).

## Gates run by this seat

All read-only; no product code, predicate, counter, driver, battery, pin or control file was touched.

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ node scripts/check-iframe-chooser-round92.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
    --expect-driver-sha256 0feca90ba0272d92d3444d1b23bf0e85a089946408fe52e383e8ddf740321688 \
    --receipt corpus/evidence/round92/chromium-crosssite-iframe-chooser/receipt.json \
    --expect-nonce tabi-r92-live-63a66abf7529 --json
→ {"predicate":"C1-IFRAME-CHOOSER-R92","verdict":"clean","revision":"4fe08d26b2a77b2ea0958606e252c7cbd031123b",
   "mode":"receipt","checkCount":93,"findings":[]}
exit=0
```

`--receipt` mode only — no browser was launched by this seat, so no port was claimed and no chromium
was started under it. A `pgrep -af "remote-debugging-port="` sweep at the end of the seat showed live
chromium processes carrying port 19203 with `--user-data-dir=/fast/scratch/hyaku/tabi-r92/R92Critic2/…`
— a sibling seat's processes, left untouched per the lane rule. No process carries this seat's name
(`R92Scribe`). The receipt re-check is the same one the note's `recheck:` front-matter line names.

Other commands run (all read-only, exit 0 unless noted):
`sha256sum` on the three staged sources and on the corpus/scored receipts; `diff` of
`corpus/evidence/round92/.../receipt.json` against `.ufo/waves/round-92/scored/live-receipt.json`
(identical, sha256 `df7ae5bb…`); `python3` extraction of all six legs' fields from the receipt;
`grep`/`sed` reads of `plans/round-92.md`, `scripts/check-iframe-chooser-round92.mjs`,
`scripts/chrome-cdp-iframe-chooser-round92.mjs`, `.ufo/waves/round-92/controls/*.json` and
`.ufo/waves/round-92/sources/{Target.pdl,process-model.md}`; `git log`/`git show --stat` on
`2bac104844eb` and `a87c71766bc3` (read-only, no mutation).

## Touched surfaces

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-92/w1/R92Scribe-note.md` (new, the
  deliverable).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-92/w1/R92Scribe.md` (this report).
- Scratch `/fast/scratch/hyaku/tabi-r92/R92Scribe/` was created and removed; nothing was left behind.
  No receipt had to be copied into `w1/` because the only artefact this seat cites is the
  already-committed corpus receipt and the already-committed controls, both in place at their
  canonical paths.

## Out of scope (not done by this seat)

- No new source rows were opened; S227/S228 are cited with the quotes already located by the scout
  seat and staged in `.ufo/waves/round-92/sources/` (`Target.pdl` line 229-230, `process-model.md`
  line 146). `corpus/SOURCES.md` has no S227/S228 rows yet — the L1's row, not this seat's.
- No claim, predicate, counter, driver, battery, pin or control file was edited; no counterexample
  was hunted (the critic and mutation seats own that); no `--live` run was made; no commit, push or
  git/jj mutation was performed anywhere; nothing was written under `corpus/`.
- No tool was installed or upgraded, so no tooling authorization entry applies (nothing to record in
  `~/.omp/agent/RULES.md` terms).

## Findings

1. **The receipt's arms are cleanly separable and the note's decision table is fully receipt-backed.**
   All 6 legs carry `error: null`; X legs (3) show exactly one attached `iframe` target, exactly one
   `Target.getTargets` `iframe` target with the same `targetId` and the child URL, and the chooser on
   the `iframe` session; S legs (3) show zero of both and the chooser on the `page` session; every leg
   ends with `childFiles == [["tabi-r92-answer.txt", 22]]` and one trusted `s` click. Receipt paths and
   values are quoted in the note.
2. **Two counter-binding gaps that the note now marks as not-measured (not as falsifications).**
   Reading `scripts/check-iframe-chooser-round92.mjs`, the counter binds the chooser's count, session
   and `frameId` and the answer's session/error, but it does **not** bind the chooser's
   `backendNodeId` (grep for `backendNodeId` in the counter: no match), the chooser's `mode`, or the
   click coordinates (`l.click` is never read). Those three numbers are recorded in the receipt and
   quoted in the note, but they are not enforced by the counter. This is a property of the counter's
   scope, not evidence that the claim's wording is false — the note says so explicitly.
3. **The 93-check total is reproducible from the counter's structure** (8 receipt-level + 1 leg-set,
   then 15 per X leg and 13 per S leg: 9 + 3×15 + 3×13 = 93), which matches `checkCount: 93` in
   `.ufo/waves/round-92/scored/c1-live.json` and in my re-check.
4. **The r91 note's "same element, two origins" framing is the direct ancestor of this round's
   two-arm split**, and the new note says so in its first paragraph, so the corpus reader can follow
   the capability lineage r91 → r92.

## Adversarial question

Did any artefact this seat produced show the claim's stated wording false, or wider than what the
counter enforces? **No.** The note's every number comes from the frozen scored receipt; the note
copies the frozen limits verbatim; and the note explicitly marks the three counter-unbound fields
(`backendNodeId`, chooser `mode`, click coordinates) and the driver-owned 1500 ms window as *not
counter-enforced* rather than as measured laws. Nothing in the note asserts a site-pair, a process
observation, a cross-session failure, or a dialog-UI behaviour that the receipt does not carry.

VERDICT C1: neutral
Evidence: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-92/w1/R92Scribe-note.md`
(the draft this seat produced) and `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-92/scored/c1-live.json`
(the scored run it reads: verdict `clean`, 93 checks, 0 findings).

## Artefact paths

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-92/w1/R92Scribe-note.md` — the note
  draft for the L1 to integrate into `corpus/knowledge/` (suggested name:
  `chromium-crosssite-iframe-chooser-runtime-round-92.md`).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-92/w1/R92Scribe.md` — this report.
