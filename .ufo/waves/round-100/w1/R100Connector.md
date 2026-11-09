# R100Connector — own-lane and sibling overlap scan for C1 (round 100)

Scope: read-only. Read `plans/round-100.md` in full; the lane's r97/r98/r99 upload notes plus a
keyword sweep of all 112 lane knowledge notes; `corpus/README.md` r97-r99 coverage sections; the
committed receipt `corpus/evidence/round100/client-oopif-uploadsets/receipt.json`; staged sources
`.ufo/waves/round-100/sources/pw-elementHandle.ts`, `pw-dom.ts`, `pw-fileUploadUtils.ts`; and
`corpus/knowledge` of the 20 sibling lanes. No chromium run, no mutation, no commit by this seat.
The r100 knowledge note does not exist yet (no draft in `corpus/knowledge/` or the wave dir), so
"draft note" corrections below are owed to integration.

## A. Sibling lanes — no overlap

Grep tool, pattern
`File paths cannot be mixed|webkitRelativePath|duplicate names|uploadFile|setInputFiles|file chooser|fileChooser`
over `/home/vgpnk/Projects/shokunin/{audio,chousa,game-dev-2d,game-dev-3d,kagi,kaidoku,kake,kama,kasegi,kengaku,kotoba,kotodama,kumitate,lore,mado,mori,revenger,souji,tameshi,tsukuroi}-shokunin/corpus/knowledge/*.md`
→ **No matches found**. Second sweep `upload|Puppeteer|puppeteer|Playwright|playwright` and third
`MIME|mimeType|file input|input type=file|binary upload|multipart` → **no matches**. Census
(`bash`, rc 0): `lanes=21 files=1512` knowledge notes (tabi 112; 20 sibling lanes 1400; `kotodama` 0).
No sibling statement on Puppeteer/Playwright upload, MIME, directories or duplicate names exists to
agree with, contradict or narrow. Nothing to absorb.

## B. Own-lane hits

| # | path:line | quote (abbrev.) | relation to C1 | owed correction |
|---|---|---|---|---|
| H1 | `corpus/knowledge/client-oopif-uploadsets-round-99.md:78-80` | "Two files per multi-file call, one order; three or more files, duplicate names, empty files, directories, mixed path+payload calls and the 50 MB limit are unmeasured." | **narrows (as of r99)** — six of the seven now have counted legs (DUP3 three payloads + dup names, EMPTY1, DIR, MIXED; LAUNCH2PL/PU). Not falsified: the sentence is plan-scoped (`§Declared limits 1-8`). | r100 note relation: name the six moved items and the residual — 50 MB, four+ files, empty **path** (r99Exec3 b2, trusted, still uncounted), dir path on `#m`/`#s`, non-dir path on `#d`, duplicate **path** basenames, second nesting. |
| H2 | `…-uploadsets-round-99.md:46-48` | "Two files on a `multiple` input land in the order passed … One event pair per call, not per file." | **agrees, extends to three** — receipt `DUP3-1..3`: order `dup 21 / dup 22 / other 11`, events exactly `[[m,input,false],[m,change,false]]`. | New note must keep "two files" as r99's measured width and add three as r100's; must not read "in order" as ordering evidence among same-named files (see D3). |
| H3 | `…-uploadsets-round-99.md:42-44` | "Two files on an input without `multiple` is an error in both clients, and nothing is set." | **no conflict** — C1 never targets `#s`; MIXED's refusal is the *other* guard (path+buffer, on `#m`), with a different message. | Keep the two refusals separate in the new note; C1 limit 4 already keeps the `isLocal`-two-paths-on-`#s` refusal open. |
| H4 | `corpus/knowledge/client-oopif-uploadmodes-round-98.md:54-56` | "A test that checks `files.length` after `uploadFile` cannot tell a missing file from an empty one; read it, or check the path exists." | **agrees, sharpened** — `EMPTY1-1..3` carries the empty half: `[name,0,text/plain]`, both reads `["ok",0,"e3b0c442…b855"]`, events **untrusted**; the phantom is the same shape with **trusted** events and a rejecting read. Shape equality spans two producers and two trust regimes. | New note may state the pair; must attribute each cell (phantom = Puppeteer `connect`/`launch` path, r98 PUR/r99 PUAM; empty = Playwright payload, r100 EMPTY1). |
| H5 | `…-uploadmodes-round-98.md:51` | "Payload objects land as given: name, the passed `mimeType` as `File.type`, the exact bytes." | **agrees** — DUP3 keeps two `dup.txt` rows positionally (sizes 21/22), no dedupe/rename/normalisation. | New note should say the FileList is positional; if it says "duplicate names kept" it must not imply name-keyed storage. |
| H6 | `corpus/knowledge/client-oopif-uploadfile-round-97.md:113` | "Read point 2 as 'an `isLocal` **path** → trusted'." | **agrees, extends** — DIR: `isLocal` + one directory path on `#d` → both events trusted, `webkitRelativePath` `probe-dir/one.txt`, `probe-dir/sub/two.txt`. "Path" now measurably covers a directory path **on `#d`**. | New note: scope the extension to `#d`; do not extend the r97 producer table row (`:97`, "the file") to directories, and keep dir-on-`#m`/`#s` open (limit 4). |
| H7 | `corpus/knowledge/chromium-file-chooser-runtime-round-77.md:109-113` (same fact `chromium-showpicker-runtime-round-81.md:34-37`) | directory answered over raw CDP: "each `webkitRelativePath` rooted at the directory's basename", nested included | **agrees** — DIR is the production-client counterpart; basename root `probe-dir/` matches. | None. Worth cross-citing so the DIR leg is not read as new protocol behaviour, only new *client* behaviour. |
| H8 | `corpus/README.md:1339-1341` | r99 coverage: "two files on a `multiple` input land in order, trusted from paths (Playwright `isLocal`, Puppeteer `connect`) and untrusted from payloads" | **agrees, extends** to three files and to the launch arms (driver-pin). | None (append-only history). |
| H9 | `corpus/README.md:1346-1347` | "Frontier: three or more files and duplicate names, empty files, directories (`webkitdirectory`), mixed path+payload calls, other MIME names, `text()`/`slice()` on binary, transitive-package identity." | **consumed in part** — six of nine items are C1 legs. | r100 README section must mark the consumed six and the residual three, and say "empty files" was the **payload** leg (empty path stays open). |

Source-side cross-check (not a note): staged `pw-elementHandle.ts:287` throws exactly
`File paths cannot be mixed with buffers` in `convertInputFiles`, and `:278` the all-files-or-one-directory
sentence in `resolvePathsAndDirectoryForInputFiles`; `pw-dom.ts:757,759,761` and `pw-fileUploadUtils.ts:43`
match the plan's S240/S238 quotations. Receipt records `MIXED-1..3` as `Error` with exactly that message,
`files {s:[],m:[],d:[]}`, no events, no reads. Plan's S248/S249 attributions are correct.

## C. Contested scope (no falsification found)

1. **Plan limit 4, first clause** — "Three files in one multi-file call" reads client-agnostic, but the only
   three-file leg is DUP3: Playwright, default `connectOverCDP`, payloads. Three files on Puppeteer, three
   paths on any client, and three files on a launch arm are unmeasured. The predicate names the arm, so the
   claim is not overstated; the *limit* sentence is looser than the measurement. Suggest (L1 narrows):
   "three payloads in one Playwright attached call (DUP3)".
2. **MIXED's reach** — the client-side mixed check throws before any `stat`, so the leg exercises no path
   resolution and says nothing about the server-side S238:44 category check; also it is one arm (`isLocal`,
   `#m`). Plan limit 4/5 already say both; the new note must not generalise "mixed calls are refused".
3. **"not deduped or renamed"** — supported (two `dup.txt` rows with different sizes). The two dups differ in
   size, so *ordering among same-named same-size* files is not measured, and a name-keyed counter could not
   have distinguished them. Keep that out of the law sentence.

## D. Axes, one move

Axes: **adjacency** (bind the new capability to the three prior notes and the two README corrections) and
**calibration** (do not let a wider measured surface inflate the law sentence).

Proposed move (one, bounded, L1 integrates into the r100 note's practitioner section): add a three-row
"size-0 entries by producer" table —

| producer | row in `#k.files` | `input`/`change` | first read |
|---|---|---|---|
| Puppeteer path, absent (r98 PUR, r99 PUAM) | `[name,0,"text/plain"]` | trusted | rejects `NotFoundError` |
| Playwright `isLocal` path, 0-byte file (r99Exec3 b2; probe, uncounted) | `[name,0,"text/plain"]` | trusted | ok |
| Playwright payload, 0-byte buffer (r100 EMPTY1) | `[name,0,"text/plain"]` | untrusted | `ok`, empty SHA-256 |

with one calibration sentence: the identical shape is produced by three producers and neither `size` nor
`isTrusted` alone identifies a real file — only the read does, and "trusted + size 0" is **not** a phantom
signature (row 2 falsifies it).

Risks: (i) row 2 is a seat probe, must be labelled as such, never as a law; (ii) the table invites "0-byte
path reads ok" as a general claim — it is one arm in one probe, so it must stay outside the law sentence;
(iii) do not restate the table as "an empty file is indistinguishable from a phantom" (trust and read differ).

Verification for the L1: receipt legs `EMPTY1-1..3`, `DUP3-1..3`, `DIR-1..3`, `MIXED-1..3` in
`corpus/evidence/round100/client-oopif-uploadsets/receipt.json`; recheck command per `plans/round-100.md`
§Counting command; the note's `recheck:` line should name the `--live` form (receipt mode is forgeable,
limit 6).

## E. Commands run (honesty)

- `bash`: `for d in *-shokunin/corpus/knowledge; do find "$d" -maxdepth 1 -name '*.md' | wc -l; done` → `lanes=21 files=1512`, rc 0.
- `bash`: `git -C …/tabi-shokunin log --oneline -3` → `88b488db round-100: scored C1 live run … (freeze 468c2b94)`, rc 0 (read-only).
- `bash`: `python3 -c` reading `receipt.json` → 18 legs, `verdict`/`findings` clean, MIXED/DUP3/EMPTY1/DIR values as quoted, rc 0.
- `bash`: `sed -n '255,300p' .ufo/waves/round-100/sources/pw-elementHandle.ts` → lines 278/287 as quoted, rc 0.
- Grep tool calls (B/A above) — the three sibling patterns returned "No matches found"; lane sweeps returned the cited lines.
- No `--live` run by this seat; no law finding is claimed from a run.

VERDICT C1: neutral
