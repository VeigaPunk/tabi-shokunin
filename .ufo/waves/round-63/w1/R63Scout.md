# R63Scout — independent source recon for C1 (S166 MDN WheelEvent, S167 CSSOM View)

Seat: `R63Scout` · round 63 · wave w1 · lane tabi · axis judged: coverage
Scratch (deleted before yield): `/fast/scratch/hyaku/tabi-r63/R63Scout/`
Write scope: this wave dir only. No lane file, no frozen instrument, no fleet file was edited by this seat.

## VERDICT

Both fetched sources are byte-identical to the frozen staged bytes and ground exactly the property-class semantics the claim needs — but they ground **none** of the receipt's trust, cancelation, unit-enumeration or arithmetic fields, so every one of those must stay declared *measured*; the registry has no duplicate row for either URL and the two new rows (S166/S167) are legitimate new ids.

---

## 1. What I ran

All commands run with cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin` or the scratch dir; the scratch dir was the cwd for every fetch/parse so no relative path escaped it.

| # | argv | cwd | exit |
|---|---|---|---|
| 1 | `curl -sS -L --max-time 120 -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36' -o fresh-s166b-mdn-wheelevent.html -w '...' 'https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent'` | `/fast/scratch/hyaku/tabi-r63/R63Scout` | 0 (http 200, 156 604 B) |
| 2 | `curl -sS -L --max-time 180 -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36' -o fresh-s167-cssom-view.html -w '...' 'https://drafts.csswg.org/cssom-view/'` | `/fast/scratch/hyaku/tabi-r63/R63Scout` | 0 (http 200, 1 084 848 B) |
| 3 | `curl -sS -L --max-time 60 -D headers-s166b.txt -o /dev/null -A '<same UA>' 'https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent'` | scratch | 0 |
| 4 | `curl -sS -L --max-time 120 -D headers-s167.txt -o /dev/null -A '<same UA>' 'https://drafts.csswg.org/cssom-view/'` | scratch | 0 |
| 5 | `sha256sum fresh-s166b-mdn-wheelevent.html fresh-s167-cssom-view.html` | scratch | 0 |
| 6 | `cmp fresh-s166b-mdn-wheelevent.html <lane>/.ufo/waves/round-63/sources/s166b-mdn-wheelevent.html` | scratch | 0 (identical) |
| 7 | `cmp fresh-s167-cssom-view.html <lane>/.ufo/waves/round-63/sources/s167-cssom-view.html` | scratch | 0 (identical) |
| 8 | `git -C <lane> show 816592612dd2a8073437c595d3fe3c477125cf3c:<each pinned path> \| sha256sum` (8 paths) | lane | 0 |
| 9 | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs --selftest` | lane | 0 — `TABI_R63_COUNTER_SELFTEST verdict=clean cases=22 passed=22` |
| 10 | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs .ufo/waves/round-63/controls/smoke/receipt-run1.json --driver scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040 --shot .ufo/waves/round-63/controls/smoke --json` | lane | 0 — `{"predicate":true,"findingCount":0,"findings":[]}` |
| 11 | `grep -n -E '<exact URL>' corpus/SOURCES.md` + full-row parse for dup ids/URLs | lane | 0 |
| 12 | `node scripts/check-sources.mjs` (first read of the wave) | lane | **1** — 2× `used_by_missing` E11 (see §5) |
| 13 | `node scripts/check-sources.mjs` (after the lesson file landed) | lane | **0** — `verdict=clean rows=167 findings=0` |
| 14 | `node scripts/check-sources.mjs --json` | lane | 0 but `could_not_evaluate/bad_arguments` — `--json` is not accepted by this gate; **not** counted as a structured pass |
| 15 | `git -C <lane> show 816592612dd2a8073437c595d3fe3c477125cf3c:corpus/SOURCES.md \| grep -c -E '^\| S16[67] '` | lane | 0 (rows absent at freeze) |
| 16 | `git -C <lane> log --format=%H -- corpus/SOURCES.md` loop: count `^| S16[67] ` per revision | lane | 0 across all 40+ revisions (max historical id S165) |
| 17 | `grep -rn -E '<URL1>|<URL2>' --include='SOURCES.md' .` from the fleet root | fleet root | 0 — only tabi's own two lines |

No browser was needed; ports 19491/19492 were not used. No git/jj mutation of any kind was run (only `show`, `log`, `status`, `ls-files`, `cat-file`). No tool was installed or upgraded this round, so no install record is required under the operator tooling directive.

## 2. Fetch results (status, bytes, sha256)

| URL | http | bytes | sha256 (fresh) | sha256 (frozen staged) | identical? |
|---|---:|---:|---|---|---|
| `https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent` | 200 | 156 604 | `78bd40dc50dc71b9cb395dd9d7f4f58edb20cf3b77b6e24dd5832b79f476c2d1` | `78bd40dc50dc71b9cb395dd9d7f4f58edb20cf3b77b6e24dd5832b79f476c2d1` | **yes** |
| `https://drafts.csswg.org/cssom-view/` | 200 | 1 084 848 | `51a7efdb30a9aa946e50b395dafb417d0305e54bd71e1b23faa6ce0af05abb99` | `51a7efdb30a9aa946e50b395dafb417d0305e54bd71e1b23faa6ce0af05abb99` | **yes** |

Both hashes equal the claim pins exactly (C1 `pins` in `.ufo/waves/round-63/claims.json`), and both equal the bytes at freeze commit `816592612dd2a8073437c595d3fe3c477125cf3c` re-derived via `git show | sha256sum`. Zero redirects (`num_redirects=0`). Response headers: MDN `etag "a435b711d657e379cf9d0e1f2e505040"`, `last-modified: Wed, 04 Nov 2026 00:59:31 GMT`; CSSWG `etag "6aeb818d-108db0"`. MDN's own page footer (line 1833) says the content was last modified 2026-02-13; CSSOM View is an **Editor's Draft, 8 October 2026** (line 1359-1360), "This version" = the fetched URL (line 1366).

Raw bytes are staged in this wave dir: `fresh-s166b-mdn-wheelevent.html`, `fresh-s167-cssom-view.html`. Receipts: `fetch-receipts.json`.

## 3. Drift check against the frozen staged bytes — **no drift**

Both comparisons are byte-identical (`cmp` exit 0), so **no anchor text moved**. Every line number and byte offset below is therefore valid for both my fresh bytes and the frozen staged files. (The only byte-level difference anywhere in the round is a *file swap inside the same source directory*: `s166-mdn-wheel.html` — the MDN **Element: wheel event** page, 181 303 B, sha256 `6ec7ec37…` — is staged alongside `s166b-mdn-wheelevent.html` — the **WheelEvent** interface page. See finding F-3.)

## 4. Located quotes (verbatim, with line / element index)

Method: line numbers are 1-based lines of the fetched file; byte offsets are 1-based byte positions of the same lines (both also in `anchor-offsets.json`). Element index is the HTML element id / dfn id where one exists.

### S166 — MDN WheelEvent, `s166b-mdn-wheelevent.html` (§ "Instance properties", `<h2 id="instance_properties">`, line 1672)

```
1675| <dt id="wheelevent.deltax"><a href="/en-US/docs/Web/API/WheelEvent/deltaX"><code>WheelEvent.deltaX</code></a> <span class="badge inline readonly" title="This value may not be changed.">Read only</span></dt>      byte 94429
1677| <p>Returns a <code>double</code> representing the horizontal scroll amount.</p>                                                                                        byte 94641
1679| <dt id="wheelevent.deltay"><a href="/en-US/docs/Web/API/WheelEvent/deltaY"><code>WheelEvent.deltaY</code></a> <span class="badge inline readonly" title="This value may not be changed.">Read only</span></dt>      byte 94727
1681| <p>Returns a <code>double</code> representing the vertical scroll amount.</p>                                                                                          byte 94939
1683| <dt id="wheelevent.deltaz"><a href="/en-US/docs/Web/API/WheelEvent/deltaZ"><code>WheelEvent.deltaZ</code></a> <span class="badge inline readonly" title="This value may not be changed.">Read only</span></dt>      byte 95023
1685| <p>Returns a <code>double</code> representing the scroll amount for the z-axis.</p>                                                                                    byte 95235
1687| <dt id="wheelevent.deltamode"><a href="/en-US/docs/Web/API/WheelEvent/deltaMode"><code>WheelEvent.deltaMode</code></a> <span class="badge inline readonly" title="This value may not be changed.">Read only</span></dt>      byte 95325
1689| <p>Returns an <code>unsigned long</code> representing the unit of the <code>delta*</code> values' scroll amount.</p>                                                       byte 95546
```

Rendered text of lines 1679-1681 (exactly the lesson's S166 quote, 11 words, verified string-equal):
`WheelEvent.deltaY Read only Returns a double representing the vertical scroll amount.`

Also located, and directly relevant to how the delta values may be used (line 1598, byte 90100):
```
1598| <li>Even when the <code>wheel</code> event does trigger scrolling, the <code>delta*</code> values in the <code>wheel</code> event don't necessarily reflect the content's scrolling direction.</li>
```
This is a **caution against** reading delta values as scroll deltas — it belongs in the knowledge entry's limits, and it is the strongest source-side reason the arithmetic must stay measured.

### S167 — CSSOM View, `s167-cssom-view.html` (§ 6 "Extensions to the Element interface", `<h2 id="extension-to-the-element-interface">`, line 2945)

```
3357| <p>The <dfn class="dfn-paneled idl-code" data-dfn-for="Element" data-dfn-type="attribute" data-export id="dom-element-scrolltop"><code>scrollTop</code></dfn> attribute, on getting, must return the result of running these steps:</p>   byte 344720
3358| <ol>
3359|  <li data-md><p>Let <var>document</var> be the element's node document.</p></li>
3362|     <p>If <var>document</var> is not the active document, return zero and terminate these steps.</p></li>
3366|     <p>If <var>window</var> is null, return zero and terminate these steps.</p></li>
3368|     <p>If the element is the root element and <var>document</var> is in quirks mode, return zero and terminate these steps.</p></li>
3370|     <p>If the element is the root element return the value of <code>scrollY</code> on <var>window</var>.</p>   byte 346243
3374|     <p>If the element does not have any associated box, return zero and terminate these steps.</p></li>
3376|     <p>Return the y-coordinate of the scrolling area at the alignment point with the top of the padding edge of the element.</p>   byte 347524
3377| </ol>
```

Rendered text of line 3357 (the lesson's S167 quote, verified present verbatim; note the lesson claims "14 words", the actual word count of the quoted string is **13** — see F-5):
`The scrollTop attribute, on getting, must return the result of running these steps:`

Element interface IDL (line 6025, byte-anchored in `anchor-offsets.json`'s sibling file), showing the attribute type:
```
6025|   <c- b>attribute</c-> <a class="idl-code" ... id="idl-unrestricted-double①④"><c- b>unrestricted</c-> <c- b>double</c-></a> <a ... data-type="unrestricted double" href="#dom-element-scrolltop"><c- g>scrollTop</c- g></a>;
```

And the `Window.scrollY` getter — the accessor the receipt actually reads (line 2248, byte 151441), § 4 "Extensions to the Window Interface" (`<h2 id="extensions-to-the-window-interface">`, line 2055):
```
2248|   <p>The <dfn class="dfn-paneled idl-code" data-dfn-for="Window" data-dfn-type="attribute" data-export id="dom-window-scrolly"><code>scrollY</code></dfn> attribute must return the y-coordinate,
2249|   relative to the initial containing block origin,
2250|   of the top of the viewport,
2251|   or zero if there is no viewport. </p>
```
Rendered: `The scrollY attribute must return the y-coordinate, relative to the initial containing block origin, of the top of the viewport, or zero if there is no viewport.`

### What each quote does and does not ground (≤25 words each, as required)

- **S166 / deltaY (line 1681):** Grounds that `deltaY` *means* vertical scroll amount and is a read-only double. Grounds nothing about the values 120/-120 or passthrough.
- **S166 / deltaX (1677), deltaZ (1685):** Grounds that `deltaX` means horizontal and `deltaZ` z-axis scroll amount. Grounds nothing about their being 0.
- **S166 / deltaMode (1689):** Grounds that `deltaMode` names the *unit* of the delta values. Grounds nothing about 0 = pixels; no `DOM_DELTA_*` enumeration appears.
- **S166 / caution (1598):** Grounds that delta values need not reflect scroll direction. Grounds nothing about this host's arithmetic; it warns against inferring it.
- **S167 / scrollTop getter (3357 + steps):** Grounds that a scroll-position attribute class is spec-defined and its getter steps. Grounds nothing about the `window.scrollY` accessor used, nor any arithmetic.
- **S167 / scrollTop step (3370):** Grounds that for the **root element** `scrollTop` returns `scrollY` on `window`. Grounds nothing about a non-root element or about 120-px steps.
- **S167 / Window.scrollY (2248-2251):** Grounds that `window.scrollY` is the viewport's top y-coordinate. Grounds nothing about the measured values or their steps.

## 5. Registry duplicate check (`corpus/SOURCES.md`)

- **S166** — line 180 — `https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent` — docs / B / mined / opened 2026-11-04 / recheck 90d — anchor names `.ufo/waves/round-63/sources/s166b-mdn-wheelevent.html` sha256 `78bd40dc…`; used-by `corpus/knowledge/chromium-wheel-scroll-round-63.md, corpus/lessons/round-63.md`.
- **S167** — line 181 — `https://drafts.csswg.org/cssom-view/` — spec / A / mined / opened 2026-11-04 / recheck 90d — anchor names `.ufo/waves/round-63/sources/s167-cssom-view.html` sha256 `51a7efdb…`; same used-by pair.
- **Duplicate rows for either URL: 0.** Duplicate ids in the registry: none (167 rows, ids unique, max S167). Duplicate URLs: neither of these two URLs appears twice.
- **Fleet-wide**: `grep -rn` over every `*/corpus/SOURCES.md` plus `.ufo/reports/round-12/SOURCES.md` finds these two URLs only in tabi's own registry. The fleet aggregate carries **0** S-id registry rows (it is a pointer layer), so it cannot duplicate.
- **Id history**: S166/S167 were absent at the freeze commit (`git show 81659261:corpus/SOURCES.md` → 0 matches) and absent from every historical revision of the lane registry (max historical id S165) — they are new ids, correctly "the next unused".
- **A separate, non-registry id space** exists: `.ufo/waves/round-22/assimilation/quarantine-rows-full:33-34`, `.ufo/waves/round-24/assimilation/staged-ids.txt:65`, `union-ids.txt:166`, `.ufo/waves/round-25/assimilation/quarantine-ids.txt:33`, where S166/S167 name quarantined kaika webmcp rows (weel.co.jp, cla.com marketplace). 34 of those 37 ids already point at *different* URLs in the tabi registry (e.g. S163 = agent-browser.dev there vs dom.spec.whatwg.org in the registry), so the lane's practice is long-established and the new rows are **not** a duplicate-row finding under the lane's own gate.

Receipt: `registry-duplicate-check.json`.

## 6. Receipt field semantics — what the sources do NOT ground

Frozen receipt read: `.ufo/waves/round-63/controls/smoke/receipt-run1.json` (4 475 B; sha256 recorded in `receipt-field-grounding.json`). The frozen counter accepts it (command #10 above): `predicate true`, `findingCount 0`, exit 0.

Fields the two sources **do not** ground, and therefore must be declared *measured* in the knowledge entry (they already are — this section confirms it, and finds no leak):

| receipt field | grounded? | why not | declared as |
|---|---|---|---|
| `wheellog[].deltaMode: 0` (pixel identity) | **NO** | s166b:1689 says only that deltaMode is the *unit*; `grep DOM_DELTA` = 0 hits in both files. The numeric→unit map lives on the separate MDN sub-page `/Web/API/WheelEvent/deltaMode`, **linked at s166b:1687 but never fetched or staged**. | measured (entry §8, lesson Gate row 21) ✔ |
| `wheellog[].isTrusted: true` | **NO** | `isTrusted` = 0 hits in s166b; the only occurrence in either file is CSSOM:2539 (MediaQueryList, an external DOM reference), not a wheel-event rule. | measured (entry §2, lesson Gate row 21) ✔ |
| `wheellog[].cancelable: true` | **NO** | `cancelable` = 0 hits in s166b and s167. The staged-but-**unregistered** `s166-mdn-wheel.html:1596` ("The `wheel` event is cancelable…") would ground it, but that file is unpinned and has no row (F-3). | measured (entry §2, lesson Gate row 21) ✔ |
| `wheellog[].defaultPrevented` (true only on leg 4) | **NO** | 0 hits in s166b, s166 and s167. | measured (entry §2, §3, §4) ✔ |
| exact scroll arithmetic `0→120→240→120→120→240` | **NO** | Neither source states a 120-px step. CSSOM defines getters, not wheel-to-scroll mapping; s166b:1598 explicitly warns delta values need not reflect scroll direction. | measured (entry §1) ✔ |
| `legs[].scrollY` / `pageState.scrollY` values | **PARTIAL** | S167:2248-2251 grounds what `window.scrollY` *is*; S167:3370 grounds that the **root** element's `scrollTop` returns `scrollY` on `window`. The values themselves are measured. The accessor used (`window.scrollY`) is explicitly outside S167's declared scope ("the Element.scrollTop attribute getter only"), and the entry says so. | attribute class sourced, accessor + arithmetic measured (entry §2, lesson Gate row 22) ✔ |
| `deltaX: 0`, `deltaZ: 0` | **PARTIAL** | semantics sourced (1677/1685), values measured. | ✔ |
| `ts`, `seq`, `targetId`, `scrollYAtDispatch` | **NO** | page-side recorder facts; neither source speaks to them. | measured ✔ |

**No field that the sources fail to ground is presented as sourced.** The knowledge entry's `[sourced]`/`[measured]` split is accurate as it stands.

## 7. Findings by severity

### F-1 — MEDIUM — `corpus/SOURCES.md` S166/S167 rows landed uncommitted while their `used-by` lesson did not yet exist; the lane's own registry gate was RED at that moment
`corpus/SOURCES.md:180-181` (rows) vs `corpus/lessons/round-63.md` (missing at first read). First `node scripts/check-sources.mjs` → **exit 1**, `FINDING id=used_by_missing fleet=E11 row=S166 detail=path_missing` and the same for S167, `verdict=failed rows=167 findings=2`. Cause: both new rows list `corpus/lessons/round-63.md` in `used-by` and that file did not exist yet (only `corpus/knowledge/chromium-wheel-scroll-round-63.md` did). The lesson file appeared later in the same wave and the identical command then exited **0** with `verdict=clean findings=0`. **Not a defect in the frozen claim** and not repaired by this seat — reported because the L1 must land the lesson file together with the rows, or the registry gate stays red. Under C2's kill rules a dirty-worktree self-assessment run is could-not-evaluate, so this ordering matters for the landing revision.

### F-2 — LOW — the lesson's S167 quote word count is wrong (13, not 14)
`corpus/lessons/round-63.md:22` says "Quote (14 words): 'The scrollTop attribute, on getting, must return the result of running these steps'". The quoted string is 13 whitespace-separated words; the S166 quote on line 20 is correctly counted at 11. The quote text itself is verbatim-correct (verified string-equal against s167 line 3357 after tag-stripping) and stays well inside the contract's ≤25-word bound, so this is a cosmetic miscount only. Reported, not repaired (the lesson is another seat's file and this seat's scope excludes editing it).

### F-3 — LOW — a third staged source is committed, unpinned, unregistered and uncited
`.ufo/waves/round-63/sources/s166-mdn-wheel.html` (181 303 B, sha256 `6ec7ec37…`, canonical `https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event`) exists at the freeze commit `81659261` and is **not** in the `pins` map of `.ufo/waves/round-63/claims.json`, has **no** registry row, and is cited nowhere under `corpus/`. Its line 1596 is the one place that would ground `cancelable`/cancelation semantics for a wheel event. Its existence explains the "181,303→156,604 B staged" note in the lesson's S166 row, and it is the reason `s166b` (the WheelEvent interface page) is the file the S166 row must anchor to — the delta property descriptions appear **only** in `s166b` (`WheelEvent.deltaY` = 2 hits in s166b, 0 in s166). Not a claim defect; the claim correctly leaves cancelation un-sourced.

### F-4 — INFORMATIONAL — the counter's `delta-mode-pixels` finding name over-claims relative to the sources
`.ufo/waves/round-63/counters/chromium-wheel-r63.mjs:42` labels the check `delta-mode-pixels` while the check itself only asserts `e.deltaMode === 0` — the pixel *identity* of 0 is not in either source (F-matrix row 1). The knowledge entry and lesson both declare `deltaMode 0` as observed/measured, so the entry text is honest; only the internal finding label is optimistic. Frozen instrument — reported, not touched.

### F-5 — INFORMATIONAL — S167 is an Editor's Draft and a *living* URL; the row's tier A is scoped to the getter definition only
`drafts.csswg.org/cssom-view/` serves "Editor's Draft, 8 October 2026" (s167 lines 1359-1360, 1366) with a moving `etag "6aeb818d-108db0"`. S167's scope cell is correctly narrow ("the Element.scrollTop attribute getter definition only; not scroll behavior, smooth scrolling, event semantics or any other CSSOM surface") and the `recheck` is 90d, so the exposure is bounded — but the anchor should keep naming the served draft date, since an ED is not a dated W3C Recommendation.

### F-6 — INFORMATIONAL — the counter's selftest and the frozen smoke receipt both re-verify green
`node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs --selftest` → exit 0, `verdict=clean cases=22 passed=22` (matches C1's `selftestCases: 22`); the frozen control receipt is accepted with `findingCount 0`. Re-run for attack only; nothing was modified.

## 8. Coverage judgement (the axis this seat is judged on)

The C1 frontier statement says "S166 MDN WheelEvent (deltaX/deltaY/deltaZ/deltaMode semantics, tier B/docs) and S167 CSSOM View (scrollTop getter, tier A/spec) are opened this round and cited by the C1 knowledge entry and lesson."

Independently re-fetched and byte-verified:
- **S166 is real and sufficient for what it claims.** All four delta property descriptions are located verbatim in the staged bytes, and the tier-B/docs + scope combination ("not cross-browser pixel identity, not default-action cancelation") is honest about its own limits. ✔
- **S167 is real and sufficient for what it claims.** The `scrollTop` getter is located verbatim with its full step list, including the root-element→`window.scrollY` step that makes the two accessors comparable. ✔
- **The citation chain is complete**: both rows' `used-by` cite the knowledge entry *and* the round-63 lesson; the lesson's `## Gate` records URL, access date, and a ≤25-word located quote for each, and its four reject rows (S166 for pixel/`isTrusted`/`cancelable`/arithmetic; S167 for cancelation/smooth-scrolling) match exactly what the bytes support.
- **No duplicate registry row** for either URL, lane-wide or fleet-wide.
- **No sourced claim leaks**: every field the two sources cannot ground is already declared *measured* in the knowledge entry and the lesson.

The one substantive coverage limit is that the **trust and cancelation surface of this claim rests on no source at all** (`isTrusted`, `cancelable`, `defaultPrevented` — 0 hits in all three staged files). That is honestly declared, but it means a future round could raise real coverage by registering the already-staged MDN **Element: wheel event** page (F-3), whose line 1596 would ground `cancelable` and the cancel-suppresses-scrolling rule.

## 9. Byte-hash ledger (every hash cited above)

```
78bd40dc50dc71b9cb395dd9d7f4f58edb20cf3b77b6e24dd5832b79f476c2d1  fresh + frozen s166b-mdn-wheelevent.html  (claim pin)
51a7efdb30a9aa946e50b395dafb417d0305e54bd71e1b23faa6ce0af05abb99  fresh + frozen s167-cssom-view.html     (claim pin)
6ec7ec375ada09642a7ee76e63bb57eee1cf1e8e86e1b06f401bb8ecbacc7e4c  frozen s166-mdn-wheel.html                (unpinned, unregistered)
b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040  scripts/chrome-cdp-loopback-round63.mjs  (claim pin, C1 driver)
084705695a394256198b45c15fb7568b629e3bc750bbd46cfcb81cdb312d7178  .ufo/waves/round-63/counters/chromium-wheel-r63.mjs
4bf6e61404c1733778f32f14a18d807cdeff7aa5cc051bab54a074bab65571fb  .ufo/waves/round-63/counters/mutate-r63.mjs
598a19da3a5d214de82f15789c2616b753e34ee16d9fea83d134e36749add2eb  .ufo/waves/round-63/counters/make-negatives-r63.mjs
1ee9cda2661b178c233b292c02fe3320cfe6a1b23c0a3bbb060400ed5d7674c8  .ufo/waves/round-63/counters/old-generation-r63.mjs
5f0efd8fddc499acc7ebec8d2101aa0bfc2c46fac281c9193177861dd8731c8c  .ufo/waves/round-63/counters/mutants-r63.json
```

## 10. Checks skipped / not run (named as skipped)

- No browser was launched; ports 19491/19492 were **not** used (not needed — no live run was in this seat's scope).
- `node scripts/check-sources.mjs --json` → exit 0 but `could_not_evaluate/bad_arguments`; the gate has no `--json` mode. **Not counted as a pass.**
- The live scored run (`corpus/evidence/round63/chromium-wheel-scroll/receipt.json`) was **not** executed by this seat — out of scope for source recon; only the frozen smoke control receipt was fed to the frozen counter.
- The ten negatives and the eight mutants were **not** re-run by this seat (another seat owns that; this seat only confirmed the counter's selftest is clean at 22 cases).
- No tool was installed or upgraded → no tool/version/channel/reason record required.

## 11. Scope compliance

- Wrote only under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-63/w1/R63Scout/` and the scratch root.
- Edited **no** frozen instrument, no lane file outside my wave dir, no fleet file, no `MANIFEST.json`, no `.ufo/state`.
- Ran no git/jj mutation; no commit, push, stash, checkout, switch, reset or pull. Read-only git only, always with `-C <repo>`.
- No git fixture was needed (no commits created anywhere).
- Scratch dir `/fast/scratch/hyaku/tabi-r63/R63Scout/` deleted before this yield.
- No delegation, no background jobs, no swarm, no `agent://all` messages.

### Files in this wave dir
- `R63Scout.md` — this report.
- `fetch-receipts.json` — http status, bytes, sha256 (fresh + frozen + pin comparison), response headers, pin re-derivation at the freeze commit.
- `anchor-offsets.json` — every located quote with 1-based line, byte offset and verbatim text.
- `registry-duplicate-check.json` — S166/S167 row detail, duplicate scans, id history, gate runs with exit codes, the quarantine id-space note.
- `receipt-field-grounding.json` — the frozen receipt's field-by-field sourced/measured matrix plus the counter invocation that accepts it.
- `fresh-s166b-mdn-wheelevent.html`, `fresh-s167-cssom-view.html` — the raw bytes I fetched (byte-identical to the frozen staged files).
