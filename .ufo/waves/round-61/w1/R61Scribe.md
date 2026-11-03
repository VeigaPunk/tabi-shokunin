# R61Scribe — round 61 wave w1 seat report

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Seat: scribe (drafts only; never wrote `corpus/`). Date 2026-11-03. Claims read in full first: `.ufo/waves/round-61/claims.json` (frozen at `7032914cb5229dc9ce2b867827e6f1ee5db7673b`, verified `git cat-file -t` -> commit). Lane baseline `6c5c2a2ef5dc9c790426e7d9efe2d3025a156441`.

## Deliverables (all under `.ufo/waves/round-61/w1/R61Scribe/`)

| file | bytes | sha256 | content |
|---|---|---|---|
| `s164-row.md` | 7,667 | `023a369f2bf260cf13884ce9a4ece41119cc6249fe5601d5c2088905ccb93acf` | the S164 registry row (11 cells, census-safe, byte/sha cells left as L1 placeholders) + reconciliation notes |
| `knowledge-draft.md` | 15,095 | `28dbcb57bc971392248178cc9ce1325751d44dd59fd40054cbaf86e088e855f6` | text for `corpus/knowledge/chromium-pointer-event-domain-round-61.md` (source/verified-at/recheck header, S164 ground, pointer model, focus, nonce trace, teardown, forgery set, scope box, limits) |
| `lesson-draft.md` | 11,319 | `311b7d23eade14ee53b6c3b2b4289985935c36a9c825540bc16758af61b89eb5` | skeleton for `corpus/lessons/round-61.md` (claims header, Gate candidates/admitted/rejected/spot-check, Mistakes with the one prefilled stale-premise row + 3 empty rows, Census, Sources & frontier, Limits, Corrections) |
| `log-draft.md` | 4,148 | `202f8c4db977ed42b9c5368f263241636241e5eb91ff1fa2655eeab9eee55e98` | skeleton for the `LOG.md` round-61 entry (11-seat wave, attack 5/11 = 45%, verdicts left to L1) |

All four cite `S164` by boundary-delimited id (knowledge 7x, lesson 12x, log 1x) so the `check-sources` used-by citation rule is satisfiable once they are landed.

## What was verified, with commands and exit codes

1. **Spec read for anchor drafting (not evidence).**
   `curl -sS -L -o pe.html -w 'final=%{url_effective} code=%{http_code} redirects=%{num_redirects} bytes=%{size_download}\n' https://www.w3.org/TR/pointerevents/` -> exit 0; `final=https://www.w3.org/TR/pointerevents/ code=200 redirects=0 bytes=948439`.
   `sha256sum pe.html` -> `ed503a5e0a6becf0898c0156bec45f0491132dab75cbebb73a14552e9e3318b8`; `wc -c` -> 948,439.
   The scout's `sources/s164-fetch-receipt.json` later recorded the same URL, 200, 0 redirects, 948,439 B, sha256 `ed503a…18b8`, `guardOk` true, staged `sources/s164-pointerevents.html` — byte-identical to the scribe read.
2. **S164 anchor extraction** (from the live/staged bytes): §3.1 PointerEvent interface `h3` raw 1589; IDL `readonly attribute long pointerId;` raw 1613; `readonly attribute DOMString pointerType;` raw 1623; dfn `dom-pointerevent-pointerid` raw 1630 (body 1630–1632); dfn `dom-pointerevent-pointertype` raw 1697 with prose raw 1699 and value table raw 1705–1707 (mouse / pen / touch) and empty-string rule raw 1710; §3.3.3 pointerdown raw 2226, table raw 2232–2249, MUST-fire sentence raw 2261; `isTrusted` occurrences raw 3822, 3937, 3992 (all cross-references); level/date raw 866/867; this-version raw 872; latest Recommendation raw 887. All agree with `sources/s164-quotes.json`.
3. **Row structure check.** Split on `|`: 12 pipes, 13 fields, 11 cells, zero literal pipes inside any cell. IDs/URL uniqueness: `grep -oE '^\| S[0-9]{3}' corpus/SOURCES.md | tail -1` -> `| S163`; `grep -ci 'pointerevents' corpus/SOURCES.md` -> 0 (exit 1, no match). Registry count 163 -> 164.
4. **Census validator on a scratch fixture containing the exact draft row** (plus the two used-by files citing S164):
   `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch>/corpus/SOURCES.md --today 2026-11-03` -> exit 0, `file	ok	…/corpus/SOURCES.md`.
   `node scripts/check-sources.mjs --root <scratch> --file corpus/SOURCES.md` -> exit 0, `SOURCES_GATE verdict=clean rows=1 tiers=A:1 status=queued:0,mined:1,rejected:0 findings=0`.
5. **Negative controls for the used-by rule.**
   Missing `corpus/knowledge/chromium-pointer-event-domain-round-61.md`: census -> `file	E11	S164 missing used-by corpus/knowledge/…`, exit 1; check-sources -> `FINDING id=used_by_missing fleet=E11 row=S164 detail=path_missing`, exit 1.
   File present but without the S164 string: check-sources -> `FINDING id=used_by_uncited fleet=- row=S164 detail=row_id_absent`, exit 1; census -> exit 0 (`ok`). So census E11 is existence-only; citation is `check-sources`-only.
6. **Frozen controls (read, not rerun).** `sha256sum .ufo/waves/round-61/c1/snapshot-r61.tsv` -> `8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27` (matches claims). `controls/c1-v19-at-round-open.json` -> predicate false, 18 findings (matches claims). `controls/census-start.txt` -> 22 W04 lines + `tabi	ok` (163 rows per claims).
7. **Source re-open receipts (read).** S153: 1,423,170 B, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` — byte-identical to the registered anchor. S161: 920,762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` — byte-identical. Both `guardOk` true, 0 redirects, host match.

## Pins recorded

- S164 staged bytes: `sources/s164-pointerevents.html`, 948,439 B, sha256 `ed503a5e0a6becf0898c0156bec45f0491132dab75cbebb73a14552e9e3318b8`.
- S153 re-open staged bytes: `sources/s153-browser-protocol.json`, 1,423,170 B, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7`.
- S161 re-open staged bytes: `sources/s161-uievents.html`, 920,762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918`.
- Snapshot: `.ufo/waves/round-61/c1/snapshot-r61.tsv`, sha256 `8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27`.
- Claims freeze commit: `7032914cb5229dc9ce2b867827e6f1ee5db7673b`.
- Draft files: the four sha256 values in the table above (computed on the final bytes).

## Findings / defects (reported, not amended)

1. **The frozen C2 citation overstates S164 for `isTrusted`.** `claims.json` C2 `remedies`/`sourcedClaim` name the PointerEvent interface `(pointerType values, pointerId, isTrusted)`. The served bytes mention `isTrusted` exactly three times (raw 3822, 3937, 3992), all as cross-references to `https://dom.spec.whatwg.org/#dom-event-istrusted`; `s164-quotes.json` records `definesIt: false`. No registered row scopes the DOM Standard's `Event.isTrusted` (S163 is scoped to `cancelable`). The row and note scope `isTrusted` out and treat the counter's `isTrusted === true` as a page-side behaviour witness. Evidence: `s164-quotes.json`, spec raw lines above.
2. **S153's registered scope does not cover `Input.dispatchMouseEvent`.** The row's `scope` cell names Page.captureScreenshot and the `/json/new` PUT; the round-61 re-open extends the anchor to the Input domain, but the `pointerType` parameter is at raw 14558 and is not in `sources/s153-quotes.json` (which quotes the command at 14458 and description at 14459). The knowledge note cites the parameter from the staged bytes and discloses the gap; the L1 decides whether to extend the re-open's quote set or drop the CDP-parameter sentence. No scope-cell edit is made (R1).
3. **Runbook step 4 order conflicts with the used-by gate.** Appending S164 before the knowledge note and lesson exist turns `census end` red (E11, exit 1) and `check-sources` red (used_by_missing/uncited, exit 1). Measured with the fixture above. Correct order: land the two citing files first (or run the gates after them). Also note census alone passes an uncited used-by file; `check-sources` is the citation gate.
4. **`controls/pointer-absence-sweep.txt` records `exit=2` for the lane-authored sweep section**, not grep's "no match" exit 1. The vendor/upstream section records `exit2=0` with four WebDriver BiDi transcript paths. The committed control therefore does not itself prove the corrected sentence "only lane-authored witnesses are absent" by a clean no-match status; it lists the vendor hits and an error-status first section. The frozen claims' narrative (corrected pre-freeze) is the authority for the wording, but the control's provenance is weaker than the sentence. Reported verbatim; no edit.
5. **Live cross-instrument contract mismatch, self-reconciled pre-freeze (transient).** At 23:06–23:07 UTC the runner wrote one combined `window.__ptrlog` with `ts` and no `mouselog`, while the counter's `checkPointerDomain` required pointer-only `ptrlog` + mouse-only `mouselog` + monotonic `seq` (and would have raised `pointer-log-wrong`/`pointer-order-wrong` on the live receipt). By 23:13:45 UTC the runner had been updated to the same contract (`window.__seq`, separate `__ptrlog`/`__mouselog`, `seq` on every entry; `scripts/chrome-cdp-loopback-round61.mjs` lines 160–170, receipt `mouselog` at 282/313). At 23:14 UTC only 1 of 131 counter fixtures carried `mouselog`, so the counter's fixture migration and selftest state were mid-flight and were not assessed by this seat. Re-read both instruments at the instrument freeze.
6. **Scout row vs seat spec (reconciled, not a defect).** `sources/s164-proposed-row.txt` sets `status` `queued` and `used-by` `—`; `s164-row.md` sets `mined` plus the two citing paths per the seat spec and runbook. Round 60 kept S163 `mined` despite a non-admitted round, so `mined` does not imply admission. The L1 decides.

## Deviations from the seat spec

- I fetched `https://www.w3.org/TR/pointerevents/` once myself to draft the anchor wording and raw lines before the scout receipt existed. That read is not evidence and is not the row pin; the row's byte/sha cells remain L1 placeholders, and the reconciliation note records the receipt values without filling the cells.
- I did not write `corpus/` (drafts only), did not run any instrument selftest or data pass, and ran no git/jj mutation. The scratch fixture (registry copy + two used-by stubs) was the only writing outside the wave dir.
- The `sources/` directory was empty when the seat started; the scout landed receipts at 20:03–20:09 local, after the first draft pass. The drafts were then reconciled against the receipts.

## Scratch cleanup

S = `/fast/scratch/hyaku/tabi-r61/R61Scribe` (spec fetch, validation fixture). Removed at the end of the seat; removal verified (`test -e` -> absent) before yield.

## Out of scope / not done

No product code, no judge invocation, no commit/add/jj, no corpus writes, no peer messaging, no delegation, no background jobs.
