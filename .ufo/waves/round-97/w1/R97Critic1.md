# R97Critic1 — wording vs instrument map (C1, `C1-CLIENT-OOPIF-UPLOADFILE-R97`)

Method: sentence-by-sentence map of `plans/round-97.md` §Claim + §Surface + §Derived limits +
`claims.json:statement` against `scripts/check-client-oopif-uploadfile-round97.mjs` (counter)
and, where the counter cannot see it, `scripts/client-oopif-uploadfile-round97.mjs` (driver,
pinned sha256 `09f0c2fe…c9e4eb`). Commands actually run (all exit 0): `sha256sum` on the three
instruments (all match `claims.json:8-10`); `diff` driver/counter/negatives vs freeze commit
`4a4e15e3` (identical); re-derivation node checks (counts, receipt fields, tree edge
properties). No Chromium, no `--live` run, no installs (RULES.md read first; host `/usr/bin`
tools + node only). Evidence artifact: `.ufo/waves/round-97/scored/c1-live.json` (232 checks,
clean) + `.ufo/waves/round-97/scored/live-receipt.json`.

Class: **C** = enforced-by-counter; **D** = enforced-by-driver-bytes-only (sha pin + receipt
fields + battery; counter observes only consequences); **N** = not enforced by either.

## Sentence map

| # | frozen sentence (plan) | class | enforcing code |
|---|---|---|---|
| S1 | Surface — "no lane instrument has ever called a direct-set API (grep … at base: no driver calls either)". | **C** (historical, spot-verified) | `git grep 'uploadFile\|setInputFiles' 607c8b02 -- scripts` → only `check-record-drift-r81.mjs:104-105` string literals; no driver calls. Accurate with the plan's "calls" qualifier. |
| S2 | Surface — "measures which files land, which `input`/`change` events the input sees and whether each is trusted, for Puppeteer `uploadFile` and Playwright `setInputFiles` (default + `isLocal:true`)". | **C+D** | Files/events/trust: counter L226-232 + driver L253-271. "The input sees" = `isTrusted` seen by listeners on `#s` itself — that reading is fixed by limit 4 (L97-100), which limits "listeners elsewhere, `focus`/`beforeinput`, contents, MIME, `lastModified` are not read". With limits the surface sentence is exact; counter checks only recorded lists, so unregistered types are unmeasured, as declared. |
| S3 | Surface — "plus the clear path and a path that does not exist". | **C** | PUC/PUM/PLM arms L62-67; legs L225-232; driver L252. |
| P1 | "On this host's Chromium 155.0.8059.84 (`/usr/bin/chromium --headless=new`, Linux)". | **D** for path/flags; **C** for version numbers | Path/flags: driver L55, L225 — receipt carries no launch args; pin is the only guard. Numbers: `Browser`/`clientBrowserVersion` L220, `chromium` contains L190. |
| P2 | "runs the pinned driver (sha256 checked before it runs; nonce passed in its environment; receipt written inside a fresh `mkdtemp` directory)". | **C** | Counter L106-126 (pin check L106-109 before `spawn` L126; nonce L110/L126; `mkdtemp` L122). |
| P3 | "for 3 repetitions of the legs PUX,PUS,PUC,PUM,PLX,PLS,PLL,PLM in that order (24 legs)". | **C** | Order/count: L58, L200-202; driver rep-major loop L284-286. |
| P4 | "each in a fresh browser and profile that the client connects to over its DevTools endpoint (`connect:{browserURL}`; `connectOverCDP(url)`, PLL `{isLocal:true}`)". | **D** (spawn/connect); **C** for observable proxies | Spawn/profile/connect: driver L222-225, L237-244 — counter sees only `fresh-browser` UUIDs (L206), versions (L220), frames (L221), `iframe-targets` (L223). Freshness is thus counter-enforced only as distinct-ID proxy; connect mode is pin-only. |
| P5 | "parent page `http://127.0.0.1:<http>/parent.html?leg=<id>` holds one file input `#pp` and one iframe … child `http://<host>:<child>/child.html?leg=<id>` holds one file input `#s` with `input`/`change`/`click` listeners recording `[type, isTrusted]` (host `localhost` but PUS/PLS `127.0.0.1`)". | **C** for URLs/hosts; **D** for listener registration | URLs/hosts: L219 (`childHost`/`childUrl`/`parentUrl`). Listeners: driver L170 (`addEventListener` on `#s` for all three types). Counter cannot see a sub-`#s` listener beyond its effect on `childEvents` — a second racing listener on `#s` would already change the exact list, so no hidden listener class is silently absorbed. |
| P6 | "The client runs the leg's call on the child frame — Puppeteer `(await frame.$('#s')).uploadFile(file)` (PUC: then `.uploadFile()`), Playwright `frame.locator('#s').setInputFiles(file, {timeout:5000})` — where `file` is the 22-byte answer file, or on PUM/PLM the absolute path `<driver scratch>/tabi-r97-missing.txt`, which does not exist". | **D** (call syntax/timeout) | Call shapes/timeout: driver L253-262; counter checks only `outcome`+files+events (L225-232). Path/content: answer `{name,size 22}` L194; `missingPath` binds to `<driver scratch>` in `--live` (L125, L185). The missing file's absence is recorded (`missingExists` L298) but not re-verified after the run — honest point, covered by limit 7. |
| P7 | "The counter exits 0 iff:" + bullets. | **C** | Exit logic: `findings.length ? 1 : 0` L242-244; setup refusal converts port/host failures to exit 2 (L157-160), never to law findings. |
| B1 | every leg: `/json/version Browser` is `Chrome/155.0.8059.84` + client's own version (`Chrome/…` Puppeteer, `155…` Playwright); lib/site/`isLocal`/call fields and exact parent/child URLs match the arm; client lists exactly `[parent, child]`; `Target.getTargets` (after load, before the call) exactly one `iframe` target (url = child) on every cross-site leg, none on PUS/PLS; parent `#pp` holds `[]`. | **C** (all fields); **D** only for "(after load, before the call)" timing | L219-224 (`leg-arm`, `browser`, `frames`, `iframe-targets`, `parent-files`). Timing: driver L246-251. |
| B2 | PUX,PUS,PLL: resolves, no error; `#s` exactly `[[tabi-r97-answer.txt,22]]`; exactly `[[input,true],[change,true]]`. | **C** | L225-226 (outcome/err null), L230-232. |
| B3 | PLX,PLS: resolves, no error; same file; exactly `[[input,false],[change,false]]`. | **C** | Same checks; `ARM.PLx` L64-66. |
| B4 | PUC: both calls resolve; `#s` `[]`; exactly `[T input, T change, U input, U change]`. | **C** (joint observable) + **D** (sequencing) | Counter has a single `outcome` slot (L62, L225-226): "both calls" is enforced as `outcome==='resolved'` + final `[]` + the 4-event sequence. Under the pinned driver (L257-258, one try block) a throw in either `await` sets `outcome='error'`, so resolved ⇒ both resolved. The counter alone cannot count calls — a `--receipt` forger could declare it; that path is explicitly disclosed (limit 7). No overclaim in `--live`: events `[T,T,U,U]` cannot arise from a clear-only or upload-only run (clear is untrusted, upload is trusted → a single call yields a 2-event list, which `child-events` rejects). |
| B5 | PUM: resolves, no error; exactly `[[tabi-r97-missing.txt,0]]`; `[T input, T change]`. | **C** | L225-226, L230-232. The informal word "phantom" appears only in counter's `outcomes.phantom` bucket label (L208, L235) and battery case names; the predicate itself claims only name+size+events, exactly what limit 4 says ("phantom file … is stated only as name + size 0 … FileReader / form submission … unmeasured"). The receipt shows the claim holds (PUM-1 in scored receipt). |
| B6 | PLM: ends with error name `Error` and message exactly `ENOENT: no such file or directory, stat '<missingPath>'`; `#s` `[]`, no event. | **C** | L227-228 (exact `errName`/`errMessage` built from receipt `missingPath`, bound in `--live` by L185), files `[]` and events `[]` via L230-232. Recorded PLM-1 message in scored receipt matches verbatim. |
| R0 | Parenthetical: "Every events list is compared exactly, so no leg may record a `click`." | **C** | Events are exact `JSON.stringify` equality (L179, L232) on all 24 legs — any recorded `click` changes every list. |
| R1 | Receipt level: schema, nonce, driver pin, `chromium` contains `155.0.8059.84`, `crossHost` `localhost`, `reps` 3, the two libraries pinned exactly (version/integrity/upload-file sha/tree counts+tree sha), answer, `missingPath` absolute+basename+`missingExists` false, three distinct ports 1024..65535, exact leg list, empty `failures` with no leg `error`, 24 distinct UUID-shaped browser ids; in `--live` also `driver-exit`/`ports-bound`/`missing-bound`. | **C** (all of it; the three `--live` bindings only in `--live`, as the sentence scopes) | L182-206 (`driver-exit`/`ports-bound`/`missing-bound` L183-185; `schema`/`nonce`/`driver-pin` L187-189; `chromium` L190; `cross-host` L191; `reps` L192; `libs` L193; `answer` L194; `missing` L196; `ports` L198; `leg-set` L202; `failures` L204; `fresh-browser` L206). Lib values in the plan match counter `LIBS` L52-55 exactly, and the scored receipt `libs` block matches. |

## Tree-sha question (special attention)

Sentence: "the tree sha256 is over sorted `<path>\0<file sha256>` lines of every regular
file under `node_modules/<name>`" (plan L69-70), with the loose summaries "installed tree
927 files / tree sha256 …" (L67-68) and "a sha256 over the whole installed package tree"
(limit 2, L94). Driver `treeSha256` (L96-108): recursive walk, one line per **regular file**
(`path\0<sha256>`) plus one line per **symlink** (`path\0link:<target>`), sorted, hashed;
empty directories are not entries (correct — no files beneath them to execute); entries that
are neither file, directory nor symlink (fifo/socket/device) are silently skipped; a symlink
to a directory is recorded as a link and not recursed; symlink *targets'* bytes are not
hashed. In the scored install this set is 927/116 lines and matches the pins; a tree that
differs only by an added empty dir or fifo hashes identically, but such entries are not
regular files and cannot change JS load behaviour — the parenthetical's precise definition
("every regular file") is the governing sentence and is exactly what the driver enforces, and
the driver's symlink lines make the instrument a superset of the parenthetical, not a
subset. The loose "whole tree" shorthand is therefore imprecise but does not claim behavior
the counter fails to enforce; the counter pins the exact 927/116-file trees (L193, `LIBX`
L52-55), which is the operative property. **Not a wording falsification**; narrowest true
restatement, for the record: "sorted `path\0<sha256>` lines of every regular file plus
`path\0link:<target>` lines of every symlink under `node_modules/<name>`; empty dirs and
non-regular non-symlink entries contribute no line."

## Other special attentions

- **"the call resolves" on PUC:** plan (L57) says "both calls resolve", while the generic
  bullets say "the call"; the counter checks one `outcome` (B4 above). Since the shared
  `outcome` + exact 4-event sequence in `--live` are jointly sufficient for "both calls
  resolved" under the pinned driver's single try block, the sentence does not claim more
  than the instrument enforces. **Enforced (C for the observable, D for sequencing).**
- **"which events the input sees"**: only `#s` listeners exist (parent HTML has no script,
  driver L172-174; child registers on `#s` only, L170), and the counter checks exactly the
  recorded `#s` lists. Unregistered event types are excluded by limit 4, which is part of
  the frozen claim ("the claim says nothing beyond them", L87). No sentence claims
  events-beyond-listeners. **Enforced as qualified.**
- **Every-leg `browser` check:** `l.browserVersion === 'Chrome/155.0.8059.84'` and
  puppeteer `client.version()`/`playwright version()` exact strings (L220) — the plan's
  two version strings are each checked only against their own library. Scored receipt: all
  24 `browserVersion` are `Chrome/155.0.8059.84`, playwright client versions `155.0.8059.84`
  — matches.
- **Counts re-derived:** per-leg checks = 9 (`leg-label`, `leg-arm`, `browser`, `frames`,
  `iframe-targets`, `parent-files`, `outcome`, `child-files`, `child-events`) × 24 = 216;
  receipt-level = 13 (`schema`, `nonce`, `driver-pin`, `chromium`, `cross-host`, `reps`, `libs`,
  `answer`, `missing`, `ports`, `leg-set`, `failures`, `fresh-browser`); live bindings = 3
  (`driver-exit`, `ports-bound`, `missing-bound`) → 216+13+3 = **232**, equal to
  `scored/c1-live.json:checkCount` (and 229 in `--receipt` mode, matching the control).
  Arms order in scored receipt is `PUX-1,PUS-1,PUC-1,PUM-1,PLX-1,PLS-1,PLL-1,PLM-1,…` as
  claimed; per-leg rows spot-check (PUX-1, PUS-1, PUC-1, PUM-1, PLM-1) match the predicate
  verbatim. **No number mismatch.**
- **Kill-rule evidence / controls:** `controls/rc.txt` expected verdicts all match committed
  outputs (controls table in plan L127-142); battery 70/70 killed (`controls/battery.json`);
  setup controls all exit 2 `setup`, never a law finding. No `--live` rerun was made here, so
  no new live evidence is claimed; the committed scored run is the leg-level evidence.
- **Source line citations (S237/S238):** staged bytes match the cited lines
  (`ElementHandle.ts` 138-150 zero-files, 158-162 `DOM.setFileInputFiles` on `this.client`;
  `fileUploadUtils.ts:62` non-collocated branch; `chromium.ts:162-163` `isLocal`). The
  mechanism is explicitly outside the predicate (limit 6) and the staged line numbers
  reconcile with the staged files. No drift there.

## `claims.json` drift check

`claims.json:25` (`statement`) is a **condensation**, not "verbatim" as its own first clause
claims: it omits the preamble detail (pin/mkdtemp/nonce environments, per-leg connect calls,
URL templates, `feTimeout`, `errName/errMessage` nulls) and the receipt-paragraph's numeric
pins, and compresses the exact arm bullets into shorter forms ("`#s` holds the answer",
"`PUC resolves`", "`stat <missingPath>`"). Semantically nothing contradicts the plan, and
every operative value (arms, per-arm events/files, every-leg fields, counts) matches the
plan's bullets; the `libraries` block (L13-14) matches the counter `LIBS` byte-for-byte, and
`frozenAt` (L5) precedes the freeze commit's committer date. The only inaccuracy is the word
"verbatim" describing a summary that defers receipt detail with "receipt level as in the
plan". Because the plan text is the frozen sentence the counter enforces, and the counter
enforces all of it (see R1), this is a **descriptive blemish in the pointer file, not a
narrower instrument**: quoted-overclaim test fails — no plan sentence is unenforced. It
does not change the verdict under the instrument-enforcement definition; recorded here as
drift.

## Conclusion

Every predicate sentence is either **C** (direct counter equality) or **D** for facts only
visible in the pinned driver (exact call syntax, spawn/connect mode, timing), with the
counter verifying all observable consequences and the battery covering every receipt-level
forgery class named in the predicate. Nothing remains where the frozen sentence claims more
than counter+driver together enforce; no leg-level statement was observed false in the
committed `--live` receipt; and all counts reconcile. The tree-sha and `claims.json`
"verbatim" notes above are wording imprecisions without enforcement consequence.

VERDICT C1: neutral
