# R97Connector — sibling and own-lane overlap scan for C1 (round 97, w1)

Seat R97Connector (leaf, read-only). Axes named: **adjacency** (what C1 changes in the lane's durable
prose) and **calibration** (contradiction vs scope over-read vs citation gap). No `--live` run, no
driver/counter execution, no chromium, no ports, no npm install, no subagent. Scratch
`/fast/scratch/hyaku/tabi-r97/R97Connector/` created empty and removed. Evidence base: lane tip
`decbcdfb` (freeze `4a4e15e3`, scored `be9487f6`); `plans/round-97.md` §Claim and §Declared limits 1-7
read in full.

## Method (commands and results)

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
grep -rIl --include='*.md' -E 'uploadFile|setInputFiles|setFileInputFiles|isTrusted|isLocal' corpus/knowledge | wc -l  # 31
grep -rIn --include='*.md' -E 'uploadFile|setInputFiles' corpus/knowledge | wc -l                                     # 15
cd /home/vgpnk/Projects/shokunin
grep -rIl --include='*.md' -E 'Puppeteer|puppeteer-core|connectOverCDP|uploadFile|setInputFiles|setFileInputFiles' \
  --exclude-dir=.git --exclude-dir=evidence */corpus/ | grep -v '^tabi-shokunin/'   # no output, rc 1
grep -rIil -E 'playwright' --exclude-dir=.git */corpus/knowledge/ | grep -v '^tabi-shokunin/' | wc -l # 8, all kaidoku
cd tabi-shokunin
git grep -nE 'uploadFile|setInputFiles' 607c8b02 -- scripts     # rc 0; only check-record-drift-r81.mjs:104-105
git cat-file -e 607c8b02:scripts/check-client-oopif-uploadfile-round97.mjs  # rc 128 (before-state)
```

Read (not executed): `scripts/check-client-oopif-uploadfile-round97.mjs:58-67,187-232`; staged
`.ufo/waves/round-97/sources/fileUploadUtils.ts:31-34,62-75` and `crPage.ts:343-351`; `corpus/SOURCES.md` S213/S237/S238;
`.ufo/waves/round-97/claims.json`; `.ufo/waves/round-97/w1/R97Critic2.md:34-45`.

Counter vs frozen sentence: `ARMS` (`:60-67`) and the per-leg checks (`:213-232`) match `plans/round-97.md:53-63`
clause-for-clause at receipt level (files, event pairs, outcome, parent-empty, iframe-targets, frames,
versions; `--live` adds `driver-exit`, `ports-bound`, `missing-bound`). No narrower-property gap found from
the prose side; the runtime call-path audit is the critic/exec seats' work, not this one.

## 1. Own-lane hits (path:line — quote — relation)

| path:line | quote (abridged) | relation |
|---|---|---|
| `corpus/knowledge/chromium-file-chooser-runtime-round-77.md:80-81` | "Every `input`/`change`/`cancel` delivered by `setFileInputFiles` is trusted and has transient activation FALSE." | **agree, command-scoped.** C1's PUX/PUS/PUM route exactly this command through `ElementHandle.uploadFile` (S237:158-162), so C1 is a client-level corroboration of the r77 law. The sentence must not be transferred to a client API name: Playwright's default path carries buffers, not paths, so it cannot route this command (see §2.1). |
| `...round-77.md:48-54` | "The zero-length array is a special case … Puppeteer sets `element.files` from a `DataTransfer` in the page and dispatches events it marks as not trusted" | **agree, conditional.** The untrusted sentence belongs to the zero-files branch; C1's PUC measures exactly that pair after the trusted pair, and the non-empty calls (PUX/PUS/PUM) are trusted. Not a contradiction; the qualifier is load-bearing. |
| `...round-77.md:70` | pick-missing: "`change` with `[tabi-missing.txt, 0, text/plain]`; `arrayBuffer()` rejects `NotFoundError`" | **agree, predicts PUM.** C1 shows Puppeteer passes an absent path to that command unvalidated and resolves; PLM (Playwright) stats first and throws before the page. |
| `...round-77.md:94-96` | "To refuse a fake upload in a receipt, require all three: the opening event bound to the click, trusted `input`/`change`, and the click's activation." | **narrower (scope) — over-general if read globally.** C1's PUX/PUS/PUM are genuine client uploads with trusted events, **no chooser event and no click** (`#s` events are exactly `input`+`change`; R96Exec3:49-53 also recorded "no click"). Scoped to chooser-path receipts it is correct; as written it would refuse them. Errata-candidate qualifier, not a C1 defect. |
| `chromium-file-chooser-runtime-round-78.md:68-70` | "`DOM.setFileInputFiles` on the opened node delivers trusted `input`+`change` with exact bytes; … `[]` fires nothing and keeps the selection" | **agree, narrower than C1.** C1's trusted legs need no chooser and no "opened node", so the note understates the command's trust property rather than overstating it. The `[]` clause is command-scoped; it must not be read as Puppeteer `uploadFile()` (PUC clears and fires untrusted events). |
| `client-oopif-filechooser-round-96.md:22` (and `:35`) | "`element()` is the child's `#s`, and `setFiles` fills it" | **agree, no trust read.** C1's PLX/PLS child-files clause confirms the fill on both sites; the event split is new. |
| `client-oopif-filechooser-round-96.md:58-59,65-66` | "uploadFile(file) on the cross-site child fills it with no chooser involved … that is a seat observation, not a frozen, counted law" | **agree, predicts PUX; C1 freezes it.** C1 adds same-site (PUS), the trusted event pair, and the clear/missing arms; r96 recorded neither trust nor a same-site uploadFile leg. |
| `client-oopif-filechooser-round-96.md:73-76` | "library identity … version, lockfile integrity string (echoed, not verified against the installed bytes) and one chooser-bearing file sha256 … the rest of the install … is trusted" | **superseded in part by C1 D3.** The installed tree is now hashed (driver `:96-123`; `treeSha256` in the pin), so a comment-only edit fails; the "echoed" clause stays literally true for the SRI string (driver `:115,:124` reads `package-lock.json`, never recomputes it). C1's limit 2 states the transitive-package exclusion. |
| `corpus/knowledge/client-oopif-uploadfile-round-97.md:21-28` | the 24-leg table | **agree, is C1.** The round's own record matches the frozen sentence cell for cell; no new claim beyond it. |
| `...round-97.md:43-47` | "Puppeteer's clear … fires untrusted events even where its set fired trusted ones"; "Puppeteer does not check that a path exists" | **agree.** PUC/PUM practitioner statements match the plan and the r77 command-level row. |
| `...round-97.md:61-62` + `corpus/README.md:1282-1284` | "the buffers are set by injected page script, which dispatches the events itself (untrusted)"; README "Playwright reads files into payloads and injects them by page script" | **citation gap, not over-general.** S238's registered scope is buffer preparation (`fileUploadUtils.ts:62-75`); the dispatch half is not in the S-row. It is corroborated by `R97Critic2.md:34-45` (bundle `coreBundle.js:21274,22003-22016`, script `dispatchEvent` pair), but the note/README do not cite those bytes. Limit 6 keeps it out of the law. |
| `...round-97.md:66-75` (+ `corpus/lessons/round-97.md:5-8`) | limits summary: "identity pinned on version, lockfile integrity, one upload-bearing file sha256 and a whole-tree sha256 per package" | **accurate; two precision notes.** (a) "lockfile integrity" is the lockfile field compared to the pin, not a recomputation from installed bytes (tree sha is the verified part); the r96 note's "(echoed, not verified)" phrasing is sharper. (b) The summary drops plan limit 5's "a Playwright `isLocal` call with an absent path is unmeasured"; PLM's table row is scoped to default `connectOverCDP`, the title/README phrase "in Playwright" is not. Qualifier would close it. |
| `corpus/README.md:1269` | "Frontier: Puppeteer `ElementHandle.uploadFile` on an OOPIF input (needs no chooser), `launch` vs `connect`, other client versions." | **agree; first frontier item closed** by C1 (PUX/PUS), the other two remain (limit 2). |
| `chromium-showpicker-runtime-round-80.md:63-66`; `...-86.md:16-24`; `...-87.md:16-19` | "fires trusted `input`+`change`" on `DOM.setFileInputFiles` | **agree, same command-scoped law.** Repeated across r80/r86/r87; none says it of `setInputFiles`/`uploadFile` as client APIs. |
| `webdriver-bidi-capability-matrix.md:68` | "`input.setFiles` for file inputs only" | **no overlap** — WebDriver BiDi command, not Playwright/Puppeteer, no trust claim. |
| `webbridge-plugin-anatomy.md:85` | plugin verb "`upload` (:26)" | **no overlap** — r77:12-14 already records that it measures nothing about file inputs. |

The two over-generalisations named in the seat brief are **absent** from the corpus: no note says
"setInputFiles fires trusted events" (the trust sentence is always about `setFileInputFiles`), and no note
says "uploadFile validates paths" (the nearest, r77:70, says the command accepts a missing path; S213's
"confirm that they exist" comment is source prose, and C1 PUM measures the client resolving anyway).

## 2. Explicit contradictions

None. Every pre-r97 statement about this surface is command-scoped and survives; the client-API split C1
adds is unmeasured by any earlier note (r96:65-66 says so in terms). The two calibration hazards are
scope readings, stated above: **2.1** r77:80 does not transfer to `setInputFiles` (Playwright default reads
paths into buffers and drops `localPaths` — staged `.ufo/waves/round-97/sources/fileUploadUtils.ts:62-75` —
and the CDP command takes paths only, S222, so those buffers cannot travel through it; the untrusted pair
comes from the payload/script path, which is the limit-6 mechanism account corroborated by
`R97Critic2.md:34-45`; `crPage.ts:343-351` is the `isLocal` path that does send the command); **2.2**
r77:94-96's three-part test is a chooser-path refusal rule, not a universal authenticity test.

## 3. Sibling lanes: zero overlap

The exact client-upload term set returns **no** sibling file (`rc 1`). The only client-name hits are 8
kaidoku files where Playwright is a capture/HAR tool (`2026-10-13-r3-runtime-observation.md:99-115`,
`2026-10-14-r10-01-queue-ops.md:24,155-158`, etc.) — no upload, no OOPIF, no trust. Look-alikes that are
not overlap: `mado-shokunin/.../xdg-portal-routing-resolver-r90.md:36` (`FileChooser` = xdg portal
interface); `kasegi-shokunin/.../program-quirks.md:39-40` (HackerOne "attachments via dropzone's hidden
`input[type=file]`" — a portal quirk, no client/trust claim); chousa `/upload/` URLs. No sibling supplies a
competing client-upload result or a statement C1 contradicts.

## 4. Proposed move (bounded; L1 owns every edit)

Add one measured **producer-signature table** to the mutable r97 note (or carry it forward next round):
producer × `#s.files` × `#s` events × chooser event × click, with only measured cells filled —

| producer | `#s.files` | `#s` events | chooser event | click |
|---|---|---|---|---|
| page stub (`DataTransfer` + `dispatchEvent`) | script-set | untrusted input/change | none | none (r77) |
| Puppeteer `uploadFile(non-empty)` | answer | trusted input/change | none | none (C1) |
| Puppeteer `uploadFile()` clear (after a prior set, PUC) | `[]` | untrusted input/change | none | none (C1) |
| Playwright default `connectOverCDP` | answer, or ENOENT if absent | untrusted input/change, none on ENOENT | none | none (C1) |
| Playwright `isLocal: true` | answer | trusted input/change | none | none (C1) |
| raw CDP `setFileInputFiles` answer | answer (phantom if absent) | trusted input/change | one `Page.fileChooserOpened` | trusted click (r77/r78) |

This is synthesis, not a new measurement: it reuses r77/r78/r87 and C1. It improves **adjacency** (ties the
chooser generation to the client generation and re-grounds r77:94-96 as a chooser-path rule) and
**calibration** (the r97 title/README "in Playwright" gains "default `connectOverCDP`" from the same
table). It harms no axis: no claim wording, counter, receipt or driver byte changes; the table lives in
mutable prose.

Risks: r77/r78 bytes are record-frozen (a correction there must be an appended correction, not an edit; the
r97 note is the safer home); a table in prose can drift from the counter if future rounds add arms.
Verification: grep the table's cells against `client-oopif-uploadfile-round97.md:21-28` and r77:66-71;
`--receipt` re-score unchanged (no instrument bytes touched); the L1 decides whether the r97 note or a
correction block carries it.

## 5. What this seat did not establish

No `--live` run and no driver execution: nothing here tests the scored run's truth or the driver's runtime
call paths; the counter/sentence comparison is prose-level only. No receipt is cited (none copied). No
tool install or update occurred. A `--live` failure or a narrower-instrument finding from the exec/critic
seats stands independently of this scan.

Carries: this report only; every quote is re-readable at the cited path:line.

VERDICT C1: neutral
