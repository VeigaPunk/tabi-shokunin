# R98Connector — own-lane and sibling overlap scan (C1-CLIENT-OOPIF-UPLOADMODES-R98)

Seat: connector, round 98 w1, leaf (read-only; no lane file edited, no live run, no install).
Read in full: `plans/round-98.md` §Claim + §Declared limits 1–7; `corpus/knowledge/client-oopif-uploadfile-round-97.md`;
`client-oopif-filechooser-round-96.md`; the round's own note `client-oopif-uploadmodes-round-98.md`;
`corpus/README.md` r96–r98 sections; `corpus/lessons/round-97.md`, `round-98.md`; the instrument
`scripts/check-client-oopif-uploadmodes-round98.mjs` and the committed receipt. Sibling scan: every
`*-shokunin/corpus/knowledge/` file matching `puppeteer|playwright|setInputFiles|uploadFile|isTrusted|OOPIF|file chooser`.

## 1. Own-lane hits

| # | path:line | quote (abridged) | class |
|---|---|---|---|
| O1 | `corpus/knowledge/client-oopif-uploadmodes-round-98.md:15-37` | 24-leg law table: PUA/PLA/PLL trusted paths; PLAB/PLB/PLLB untrusted payloads; PLLM ENOENT; PUR phantom + `NotFoundError` read | **agree** — each row equals the committed receipt (independently re-read below), and every arm equals the counter's `ARM` table (`check-…round98.mjs:66-73`). |
| O2 | `client-oopif-uploadmodes-round-98.md:41-45` | "trusted `input`/`change` on an upload need **both** a file path **and** a browser Playwright treats as collocated … A payload object … gives untrusted … in every mode measured" | **agree** — exactly C1's 9/9 split; the law is transport-branch, not launch-vs-connect. |
| O3 | `client-oopif-uploadmodes-round-98.md:46-48` | "It is not a property of `connectOverCDP` itself — `isLocal` paths and launched paths are trusted." | **agree** — scoped to paths in the same sentence; PLLB (payload) is excluded correctly. |
| O4 | `client-oopif-uploadmodes-round-98.md:52-55` | "Puppeteer resolves and leaves a phantom entry (name, size 0, `type` `text/plain` from the extension) with trusted events; … `Blob.text()` rejects with `NotFoundError`" | **narrower** — "from the extension" is an unlabelled causal inference: C1/S241 ground only what the page reads (`type` `text/plain`, `NotFoundError` + Blink text). Nothing in S240–S242 or the receipt discriminates the cause. Drop it or mark `[INFERENCE]`. |
| O5 | `client-oopif-uploadmodes-round-98.md:90-93` | "its [r97] practitioner point 2 (`Playwright over a default connectOverCDP → untrusted`) is narrowed …; its limits 2, 4 and 5 frontier (launch, payloads, isLocal + absent path, the phantom's read) is now measured." | **narrower** — (a) the quoted half omits the half C1's PLLB actually falsifies-if-unqualified: r97's "Playwright with `isLocal: true` → trusted" (see O7); (b) the head over-reaches its own parenthesis: r97 limit 4 also names `lastModified` and limit 5 names multiple/directories/50 MB, still unmeasured (`plans/round-98.md` limit 4; note's own §Limits). Read as "the named frontier items". |
| O6 | `client-oopif-uploadfile-round-97.md:7` (title) | "Puppeteer `uploadFile` fires trusted events, Playwright's default `connectOverCDP` fires untrusted ones" | **agrees/narrower** — true of the r97 path legs it reports; launch and payload are outside r97 limit 2/5. C1 adds the missing cells, no contradiction. |
| O7 | `client-oopif-uploadfile-round-97.md:39-43` | "`isTrusted` … depends on the client path: Puppeteer and Playwright with `isLocal: true` → trusted; … `connectOverCDP(url, {isLocal: true})` is the setting that matches the trusted path." | **narrower / would-contradict-if-unqualified** — r97 limit 5 (`:84` "no payload objects") scopes it to paths; C1 PLLB (isLocal + payload → untrusted) is the counterexample. Reader-facing rule; the r98 note half-narrows it (O5). Needs an append-only correction (proposal §5). |
| O8 | `client-oopif-uploadfile-round-97.md:49-50` and `:82-84` | phantom read "Outside the counted claim … rejects with 'A requested file or directory could not be found…'"; "its read behaviour is a wave observation" | **agree (promotion)** — C1 PUR counts the same read with `NotFoundError` and Blink's exact message (S241); not a contradiction, a frontier close. |
| O9 | `chromium-file-chooser-runtime-round-77.md:70` | "pick-missing … `change` with `[tabi-missing.txt, 0, text/plain]`; `arrayBuffer()` rejects `NotFoundError`" | **narrower vs its own receipt** — the committed r77 receipt records **both** trusted `input` and `change` (seq 37–38). C1 PUR agrees with the receipt, not the abbreviated row. Row should read `input`/`change`. |
| O10 | `chromium-file-chooser-runtime-round-77.md:16-18,94-96` | page script cannot be told "except by `isTrusted`, by transient activation, and by whether a chooser ever opened"; require all three conjuncts | **agree / strengthened** — C1's 24 legs record zero `click` (events lists compared exactly), so trusted `input`/`change` alone are shown again to be chooser-free; launch and isLocal producers join Puppeteer `uploadFile` in that bucket. |
| O11 | `chromium-file-chooser-runtime-round-96.md:54-59` | "Puppeteer `launch` … also times out at 3000 ms; … Playwright `chromium.launch` also resolves and fills." | **agree (disjoint surface)** — those are `waitForFileChooser`/`setFiles` observations; C1's launch legs use `uploadFile`/`setInputFiles`. The timeout must not be imported into uploadFile (r96 point 1 already says uploadFile fills 3/3). |
| O12 | `chromium-crosssite-iframe-chooser-round-92.md:45-46`; `chromium-oopif-backendnode-scope-round-93.md:194-195` | child `files [["tabi-r9x-answer.txt",22]]`, one trusted click; six distinct browserIds | **agree (different producer)** — raw-CDP chooser answers; C1 records no click by construction and exactly one iframe target, as r92/r93 already saw for cross-site legs. |
| O13 | `chromium-oopif-backendnode-misdelivery-round-95.md:17-20` | page-session `DOM.setFileInputFiles(B)` "puts the file into the PARENT's input" when B lands on a parent input | **agree (different session path)** — C1 calls the child frame's own handle/session and counts parent `#pp` `[]`; no statement here covers the child-session call. |
| O14 | `corpus/README.md:1276-1289` | r97 coverage: "trusted for Puppeteer and for Playwright with `connectOverCDP(url,{isLocal:true})`, and untrusted for Playwright's default `connectOverCDP`" | **narrower (capture-scoped)** — the section reports r97's path legs and its Frontier line keeps launch/payload open; read standalone it over-generalises as O7. The README r98 section `:1303-1319` already carries the full split, so no edit is forced. |
| O15 | `corpus/README.md:1269-1270` | r96 Frontier: "`ElementHandle.uploadFile` on an OOPIF input …, `launch` vs `connect`" | **narrower (historical)** — closed by r97 (`uploadFile`) and r98 (launch); superseded by later sections, append-only history by design. |
| O16 | `corpus/lessons/round-97.md:114-115` | "Playwright `chromium.launch` → trusted events; `isLocal` + absent path → the same ENOENT `stat` message; Puppeteer `launch` = PUX; the phantom entry's page read rejects; payload objects → untrusted." | **agree** — C1 counts exactly these five pre-freeze leads; the unqualified "payload objects → untrusted" matches all three payload arms. |
| O17 | `corpus/lessons/round-98.md:5-9` | "a path gives trusted `input`/`change` on a launched browser and on `connectOverCDP` `isLocal`, a payload object gives untrusted ones on launched, default and `isLocal` browsers alike" | **agree** — one-line summary equals C1; no overreach found. |

## 2. Sibling hits

| # | path:line | quote (abridged) | class |
|---|---|---|---|
| S1 | `kaidoku-shokunin/corpus/knowledge/2026-10-13-r4-08-observe-verbs.md:161` | "launches an OWNED Electron via Playwright `_electron.launch`" | **screened** — Electron app harness; no Chromium file input, upload or `isTrusted`. |
| S2 | `kaidoku-shokunin/corpus/knowledge/2026-10-13-r3-runtime-observation.md:99-115` | "`rea capture-browser-scenario` runs an explicit Playwright scenario; `browser.mode:"connect"` … actions = goto\|click\|fill\|press\|…" | **screened** — action list has no `setInputFiles`/upload; no trust observation. |
| S3 | `kaidoku-shokunin/corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:43-44` | "`playwright` 1.64.0 global + `~/.cache/ms-playwright/chromium-1248`" | **screened** — tooling inventory, other version, no upload. |
| S4 | `kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-01-queue-ops.md:24` | "Playwright 1.64.0 `recordHar`, HAR 1.2, 5 entries" | **screened** — HAR capture, different surface. |
| S5 | `mado-shokunin/corpus/knowledge/mime-magic-sniff-r95.md:41` | "`gio info`, GTK file choosers and other GIO users" | **screened** — OS file dialog, not a browser `input type=file`. |
| S6 | `kasegi-shokunin/corpus/knowledge/program-quirks.md:40` | "attachments via dropzone's hidden `input[type=file]`" | **screened** — portal product observation; no automation or trust claim. |
| S7 | `kagi-shokunin/corpus/knowledge/openbao-audit-device-custody.md:43` | "`bao write … sys/audit-hash/file input=<nonce>`" | **screened** — word match only, not a file input. |

No sibling lane carries a `Puppeteer`/`Playwright` upload, `isTrusted`, OOPIF or cross-site-file-input statement:
`grep -rn 'isTrusted' */corpus/knowledge/ | grep -v '^tabi-shokunin'` and
`grep -rniE 'oopif|out-of-process iframe|cross-site iframe' */corpus/knowledge/ | grep -v '^tabi-shokunin'` both returned nothing (rc 1).
Seven sibling `puppeteer|playwright` files exist, all kaidoku and all screened above (S1–S4); the other hits are
word collisions (S5–S7). C1's surface is unique in the fleet; no sibling claim is narrowed, widened or contradicted.

## 3. Contradictions, stated plainly

- **Against C1: none.** No corpus statement asserts a leg-level fact C1 shows false. The three risky phrasings
  (O7, r97 lesson `:5-7`, README `:1276-1289`) are over-general *only if stripped of their own limit declarations*:
  r97 limit 5 (`client-oopif-uploadfile-round-97.md:84`) excludes payload objects, and C1's PLLB is exactly that
  excluded cell. That is a reader/calibration defect in a record file, not a widening of C1 and not a claim defect.
- **C1 against the corpus: none.** C1's 24 rows match the r98 note, the README r98 section and the r98 lesson.
- **Corpus against itself:** O9 (r77 row omits `input`, its receipt has it); O5 (r98 §Relation quotes only half of
  the r97 rule it narrows); O4 (`from the extension` unsourced).

## 4. Instrument ↔ frozen sentence (read-only check; no live run)

`scripts/check-client-oopif-uploadmodes-round98.mjs` check ids at `:189-246` map one-to-one onto the frozen
sentence's clauses: `leg-set` (`:208`, 8 arms × reps in order), `leg-arm` (`:224`, lib/mode/isLocal/input/both URLs),
`browser` (`:225`), `frames` (`:226`), `iframe-targets` (`:227`, exactly one, url = child), `parent-files` (`:229`, `[]`),
`outcome` (`:231,233`), `child-files/events/read` (`:235-237`), receipt `:193-212`, live `:189-191`. Arithmetic:
256 = 24 legs × 10 checks + 16 receipt checks. Committed receipt `corpus/evidence/round98/client-oopif-uploadmodes/receipt.json`
(sha256 `f69c571935fa…`, byte-identical to `.ufo/waves/round-98/scored/live-receipt.json`): 24 legs, 24 distinct UUID
browserIds, `failures` 0, `parentFiles` unique `[[]]`, and the four outcome classes 9/9/3/3 exactly as the note states.
Every driver-pin fact (launch vs connect, per-leg browser process, 400 ms settle, listener placement) is declared as
such in the sentence (limit 2) and the counter checks only its recorded consequences, as the sentence says. I found no
clause the instrument enforces more narrowly, and no count I could re-derive that differs.

## 5. Proposed move (one, bounded) — calibration + adjacency, no runtime bytes

**Move:** append one `## Correction — round 98 (append-only)` block to
`corpus/knowledge/client-oopif-uploadfile-round-97.md` (lane precedent: the r96 note's appended round-97 correction):
(1) point 2's trust sentence is scoped to **paths**; a payload object is untrusted in every mode measured, including
`connectOverCDP(url,{isLocal:true})` (r98 PLLB, `corpus/evidence/round98/…/receipt.json`), so "isLocal: true → trusted"
must be read as "isLocal path → trusted"; (2) the phantom read is now counted, not a wave observation: `Blob.text()`
rejects `NotFoundError` with Blink's message (r98 PUR; S241). Add one pointer sentence in the r98 note §Relation so the
half-quote at `:90-91` cannot be read as narrowing only the default-connect half.

**Axes:** calibration (primary: removes the last unqualified trust rule in the note a recheck line points readers to);
adjacency (cross-round synthesis r77/r97/r98). **Coverage unchanged** — no leg, check or receipt byte moves; the counter
and driver sha256 stay `e55581ea…`/`f8e95a98…` (claims.json `instruments`). **Harm:** none to the claim; a freshness gate
on `corpus/knowledge` must be re-run by the integration owner if it hashes changed notes (r96 correction precedent
passed it). Not proposed: any edit to README's r97 section (capture-scoped and already followed by the r98 section), or
to sibling PROVINCE pins (no overlap).

**Verification for L1 after applying:** `git diff --numstat <tip> -- corpus/knowledge/` shows additions-only for the two
notes; `sha256sum scripts/check-client-oopif-uploadmodes-round98.mjs scripts/client-oopif-uploadmodes-round98.mjs`
equals both `claims.json` pins; re-read the appended block against O7/O8. No live rerun is required by this move.

Evidence artifacts: `scripts/check-client-oopif-uploadmodes-round98.mjs`,
`corpus/evidence/round98/client-oopif-uploadmodes/receipt.json` (`f69c5719…`), `.ufo/waves/round-98/scored/c1-live.json`
(`verdict clean`, 256 checks, 0 findings, revision `b92b161d`), `.ufo/waves/round-98/claims.json`.

VERDICT C1: neutral
