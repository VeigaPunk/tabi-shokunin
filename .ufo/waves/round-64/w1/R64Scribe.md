# R64Scribe — round 64 knowledge entry, SOURCES rows and README row

Seat: R64Scribe (scribe) · wave w1 · round 64 · capability
`chromium-wheel-scroll-domain-linux` (second declared generation).

Scope: draft the generation-2 wheel/scroll knowledge entry, the SOURCES rows
the entry cites, and the README coverage row. **Nothing was committed**; the
drafts live under `.ufo/waves/round-64/w1/R64Scribe/draft/`.

## Deliverables

| File | What it is |
|---|---|
| `.ufo/waves/round-64/w1/R64Scribe/draft/chromium-wheel-scroll-round-64.md` | the generation-2 knowledge entry (as-of table, the measured model, the run binding, the counter contract, the live demonstration, closure proof, limits, history) |
| `.ufo/waves/round-64/w1/R64Scribe/draft/SOURCES-rows.md` | the two SOURCES rows the entry's `source:` header cites, in the lane's 11-column schema, plus integration notes |
| `.ufo/waves/round-64/w1/R64Scribe/draft/README-row.md` | the README coverage row to append, with the coverage-map gap measurement |

Receipts (this seat's own): `.ufo/waves/round-64/w1/R64Scribe/receipts/`
(`check-sources-trial.stdout`, `sources-census-trial.stdout`,
`verify-pixels-r64.mjs`, `verify-pixels-r64.json`).
Staged source bytes: `.ufo/waves/round-64/w1/R64Scribe/sources/`.

## Decisions

1. **Ids S170 and S171.** The registry's highest id is S167, so S170/S171
   collide with nothing. Both rows are for URLs the registry does not hold
   (`.../refs/tags/155.0.8059.84/.../domains/Input.pdl` and
   `.../domains/Browser.pdl`), so neither raises the census's duplicate-URL
   finding (W04/E04). The `@master` `browser_protocol.json` URL stays with
   S153 and the CSSOM View URL stays with S167 — re-opened in place, not
   re-appended.
2. **Build-scoped, not `@master`.** The receipt names Chromium
   155.0.8059.84 (`host.chromium` = `Chromium 155.0.8059.84 Arch Linux`), and
   both rows are pinned to that tag. S170's `teaches` cell says explicitly that
   it re-pins the same protocol text S153 carries from the moving `@master` JSON,
   so it is not independent corroboration of a second source — the same
   disclosure discipline S093/S098/S099 use.
3. **The `source:` header names exactly S170 and S171**, and the drafted
   SOURCES file contains exactly those two rows. The entry's DOM-side
   semantics (the `deltaMode` vocabulary and the `scrollTop` attribute class)
   stay grounded in S166/S167 by reference to the round-63 note rather than by
   a fresh row: those rows exist and are already mined, and re-citing them in a
   new header would need the round-64 entry added to their `used-by`, which is
   an integration step for the L1 (noted below).
4. **`recheck:` points at the counter CLI over the committed smoke receipt**,
   not at the scored receipt. The scored evidence directory
   `corpus/evidence/round64/` is **not** in the tree at the freeze revision
   (`git ls-tree -r --name-only 0fc68043… -- corpus/evidence/round64/` → 0
   lines), so a recheck line pointing there would name a path that does not
   resolve at the revision the note claims. The peer/L1 draft's `recheck:`
   points at `corpus/evidence/round64/…`; I flag this below.
5. **The counter's synthesis limit is stated in the entry's `## Limits`**, in
   the note's own voice, with the committed control named
   (`red-synthetic-rendering`, exit 0, predicate true, 0 findings) and the
   demonstration named as `scripts/verify-live-r64.mjs`.
6. **No Page-domain row.** The round-64 `Page.pdl` fetch at tag 155.0.8059.84
   decodes to sha256 `e944a3b1…5be`, byte-identical to the copy S105 already
   holds for tag 154.0.8037.97 (same digest, same 61,911 B decoded length).
   A second row for those bytes would be the same source under a new name — the
   pattern the lane records as source-diversity growth in S093→S098/S099 — so no
   row is proposed for it. The re-fetch is a freshness datum, recorded in the
   seat report below.

## Verification actually run (this seat)

| Check | Command | Observed |
|---|---|---|
| registry gate on the drafted rows | `node scripts/check-sources.mjs --file corpus/SOURCES.md --root <trial>` (HEAD registry + the two drafted rows inserted after S167, drafted entry copied to `corpus/knowledge/chromium-wheel-scroll-round-64.md` in the trial root) | `SOURCES_GATE verdict=clean rows=169 tiers=A:151,B:9,C:9 status=queued:15,mined:144,rejected:10 findings=0`, exit 0 |
| fleet census on the drafted rows | `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root <trial> --today 2026-11-04 <trial>` | `root ok …/corpus/SOURCES.md`, exit 0 (only the 22 pre-existing W04 warnings) |
| drafted rows parse as 11 columns | split each row on `\|` | 13 fields (11 cells + 2 delimiters), ids `S170`, `S171`; no literal or escaped `\|` inside any cell |
| ids do not collide | `grep -c '^| S168 \|^| S169 \|^| S170 ' corpus/SOURCES.md` | 0 at the freeze revision and in the working tree |
| every as-of-table command | the 18 `node -p` / CLI commands in the entry's §0, run verbatim | all exit 0, all outputs match the table's middle column |
| pixel binding re-derived independently of the counter | `node .ufo/waves/round-64/w1/R64Scribe/receipts/verify-pixels-r64.mjs` (decodes the committed PNG bytes with the frozen `png-r64.mjs`, re-checks all 256 nonce-grid bits, the four band samples and the witness pixel per leg) | 6/6 legs: 256/256 grid bits matched, band colours matched, witness pixel matched |
| mutant matrix shape | `node -p '…require("./.ufo/waves/round-64/controls/mutants/matrix.json")…'` | 16 rows, every row `liveExit 0` and `negativesAccepted == [check]`, 16 killed, 0 surviving, 0 redundant, 16 load-bearing; `pristine.negatives` all 1 |
| counter checks and selftest | `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs … --json` and `--selftest --scratch <ABS>` | `predicate true, findingCount 0, checks 29`; `verdict=clean cases=31 passed=31` |

## Findings

1. **[medium] The peer/L1 draft's `recheck:` line names a path that does not
   resolve at the revision it claims.** `corpus/knowledge/chromium-wheel-scroll-round-64.md`
   (untracked, written 21:55 by another seat) carries
   `recheck: node scripts/verify-live-r64.mjs … --evidence corpus/evidence/round64/chromium-wheel-scroll/receipt.json …`.
   At the freeze revision `0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741` that
   directory does not exist:
   `git ls-tree -r --name-only 0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741 -- corpus/evidence/round64/` → 0 lines.
   QUALITY criterion 28 requires an evidence pointer to resolve as committed
   bytes. The line becomes valid only once the scored receipt is committed —
   which the L1 does at integration. My draft's `recheck:` instead points at the
   committed smoke receipt, which resolves now; **the L1 should decide** which
   of the two forms to land, and if it lands the scored-path form it must
   commit that receipt in the same commit.

2. **[medium] The peer draft's `source:` header reaches the entry's external
   claims differently, and leaves the browser-identity protocol claim without a
   registry row.** The peer entry cites `S153, S167, S166`: the `@master`
   `browser_protocol.json` for the delta unit and the screenshot bound, and
   S166/S167 for the DOM-side semantics. That is a valid reading for those
   claims — but `S153` is `@master`, a moving artifact, while the note's claim
   is about the build the receipt names (Chromium 155.0.8059.84), and no
   registry row covers CDP `Browser.getVersion` at all
   (`grep -c 'getVersion' corpus/SOURCES.md` → 0). The peer entry marks the
   identity values `[measured]` and therefore does not claim a protocol row
   for them — but the entry's §2 item 6 asserts the identity is *read over
   CDP `Browser.getVersion`*, which is a protocol statement about the build.
   My S171 supplies that row (build-pinned), and my S170 re-pins the delta
   unit at the same tag while saying in its `teaches` cell that it is the same
   protocol text S153 carries, not a second independent source.

3. **[low] The round's `Page.pdl` re-fetch at tag 155.0.8059.84 is
   byte-identical to the tag-154 copy the registry already holds.** Decoded
   sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`,
   61,911 B decoded from an 82,548 B base64 transfer — the same digest and the
   same decoded length S105 records for tag 154.0.8037.97. Command:
   `sha256sum .ufo/waves/round-64/w1/R64Scribe/sources/page-pdl-155-decoded.pdl`.
   So the Page domain did not drift across those two tags, and no new row is
   warranted for it.

4. **[low] The README coverage map is four notes short of the tree.** At the
   freeze revision, 75 notes exist under `corpus/knowledge/` and 71 of them are
   named in `corpus/README.md`; the four unmapped ones are
   `knowledge/chrome-cdp-loopback-round-45.md`,
   `knowledge/chromium-control-keys-round-56.md`,
   `knowledge/webview2-control-keys-round-55.md` and
   `knowledge/webview2-modifier-domain-round-54.md`. Command:
   `diff <(ls corpus/knowledge/*.md | sed 's|corpus/||' | sort) <(grep -o 'knowledge/[a-z0-9.-]*\.md' corpus/README.md | sort -u)`
   → exactly those four `<` lines. QUALITY criterion 11 asks that the map
   either list every note or state its snapshot date and the exact gap in the
   same commit as each admit; the L1 should state the gap when it lands the
   r64 row.

5. **[low] The round's evidence directory is being populated outside the
   freeze, in the worktree only.** `corpus/evidence/round64/chromium-wheel-scroll/`
   exists in the worktree (MANIFEST present, `sha256sum -c MANIFEST.txt` →
   all OK) but is untracked, and its receipt's `nonce` is
   `tabi-r64-smoke-design` — the same nonce as the design-time smoke receipt,
   with a different launch token and different wheel timestamps. That is the
   scored copy of the design run, not an independent scored run; my entry says
   so by citing the committed design receipt and by marking the scored
   after-pass receipt `[unknown]` in the as-of table.

6. **[info] No new external ground was needed for the round's C2 claim**, so
   none is proposed: the provenance gate's own rows are the gate script
   (`scripts/check-receipt-provenance.mjs`, sha256 `947a595d…`), which is
   already recorded in the round's claims and pins. The before-state my entry
   cites (11 receipts, 34 failures — `schema` 11, `stdout-bound` 11,
   `inputs-bound` 11, `argv-real` 1) is read from the committed control
   `.ufo/waves/round-64/controls/gate-before.stdout`.

## Out of scope for this seat

- The scored after-pass receipt and its commit — the L1's.
- The `## Limits` wording of the round lesson — not this seat's file.
- Any change to `corpus/SOURCES.md`, `corpus/README.md`, `corpus/knowledge/` or
  `corpus/lessons/`: this seat drafts only, in its own wave directory, and
  writes nothing outside `.ufo/waves/round-64/w1/R64Scribe/`.

## Verdict

**Ready for integration, with one decision for the L1.** The three drafts are
complete and self-consistent: the entry's `source:` header names S170 and S171
and the drafted SOURCES file contains exactly those two rows, both at ids that
collide with nothing and at URLs the registry does not hold, and both verified
clean by the lane's own `check-sources.mjs` and by the fleet's
`sources-census.sh` when inserted after S167. Every measured value in the
entry is re-derivable by a command printed in the same row, and all 18 of
those commands were run and matched. The pixel-binding claim was additionally
re-derived independently of the counter (256/256 nonce-grid bits, all four
band samples and the witness pixel, on all six legs) and the mutant matrix was
checked for the load-bearing shape the entry asserts.

The one open decision is finding 1: whether the landed `recheck:` line names
the committed design receipt (my draft, resolves now) or the scored receipt
(the peer draft, resolves only once the L1 commits it). Findings 2–5 are
advisory and can be applied or not without changing the drafts.
