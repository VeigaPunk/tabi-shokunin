# Draft — routed defect 3: S125 release-pin receipt entry and cadence

Decision: **add the release-pin receipt entry for S125 and restore `on-release`.** Verified against the
frozen gate in a scratch clone; not landed (L1 integrates).

## Why this option

- Convention: of the 31 registry rows whose `source` cell carries a Chromium Gitiles tag, 30 read
  `on-release` and exactly one reads `90d` — S125 (`corpus/SOURCES.md:139`, recheck cell).
- The gate's verdict at the new stable is real information, not a no-op: at 156 every cited range holds,
  so a later release that changes ChromeDriver's enabling path turns the row `drifted` →
  `s1-drift-unsuperseded` and forces a superseding row from the round that re-measures the new driver —
  which is what the runtime entry's own recheck asks for.
- The alternative (record a reason for `90d`) is defensible on the immutable-tag argument, but the
  spot-check's supporting quote is misattributed: "re-run on a new ChromeDriver build" is the *runtime
  entry's* recheck (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:7`), not S125's registry cell,
  which has always carried a bare `90d` (`corpus/SOURCES.md:139`). The convention argument stands on
  its own and does not depend on that quote.

## Registry change (in place; contract rule 2 field `recheck`)

`corpus/SOURCES.md:139` recheck cell: `90d` → `on-release`.

Log line for the round-33 lesson §"Status / recheck / used-by changes":

    - S125 `recheck` `90d` → `on-release` (2026-10-26; a release-pin receipt entry was added this round,
      receipt population 23 → 24, resolved 24, verdict `holds`; the round-32 M10 change reversed).

## Files to commit

    corpus/evidence/round-29/release-pins/bytes/154.0.8037.97/chrome/test/chromedriver/session_commands.cc   (90,944 B)
    corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/chrome/test/chromedriver/session_commands.cc   (92,700 B)
    corpus/evidence/round-29/release-pins/refetch/S125.json                                                   (second seat)
    corpus/evidence/round-29/release-pins/receipt.json                                                        (append one row)

Receipt row: `drafts/s125-receipt-entry.json` (verbatim). Refetch record: `drafts/s125-refetch.json`.
The receipt is appended, not rewritten; its `note` claims every entry is a w1 seat output verbatim except
`superseded_by`, which would become untrue, so add a sibling key (the gate reads only `schema`, `stable`,
`rows`):

    "note_round_33": "S125 appended in round 33 by <landing seat> from its own two GETs at the tags named in its files; the round-29 note above describes the round-29 entries only."

## Verified run (scratch clone of the lane, `--repo` + 40-hex `--rev`)

    node scripts/check-release-pins.mjs --repo "$D" --rev beec3c0a7946c9f77e61431b9e87938b37a2ea94 --stable 156.0.8078.47 --json
    -> population 24, resolved 24, unresolved 0, holds 17, drifted 7, clean true, exit 0
    -> rows: {"id":"S125","resolved":true,"verdict":"holds","reasons":[]}

Same gate at the freeze commit without the entry: population 23, resolved 23, holds 16, drifted 7, clean,
exit 0 (`c1` capture `drafts/gate-at-freeze.json`).

## Fetch receipts (read-only HTTPS GET, `?format=TEXT`, base64 bodies decoded)

| URL | completed (UTC) | HTTP | body bytes | decoded sha256 |
|---|---|---|---|---|
| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc?format=TEXT | 2026-10-26T18:25:11Z | 200 | 90,944 | `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` |
| https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/chrome/test/chromedriver/session_commands.cc?format=TEXT | 2026-10-26T18:25:11Z | 200 | 92,700 | `1bb1537c89f579436479b72666547a46bb7369a11228982ae855c690b31fac06` |

The 154 digest equals the sha256 S125's own anchor cites, so the row's byte claim is confirmed a second
time. All six cited ranges occur as contiguous normalised blocks in the 156 bytes:

    287-289 HOLDS   332-338 HOLDS   378 HOLDS   407-410 HOLDS   429-464 HOLDS   510 HOLDS

## Lesson text (round-33 `## Gate`)

    - S125 recheck `90d` → `on-release` (round-32 routed defect 3, closed): 30 of the 31 tag-pinned code
      rows already read `on-release`; S125 was the only exception, and the spot-check's quote for it is the
      runtime entry's recheck (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:7`), not the registry
      cell. With the receipt entry appended, `scripts/check-release-pins.mjs` at `--stable 156.0.8078.47`
      reads population 24, resolved 24, holds 17, drifted 7, clean, exit 0, S125 `verdict: holds` — every
      cited range is still there at 156, so the entry is a live tripwire for the enabling path, not a
      no-op. The verdict is computed, not read: `f4-ranges` compares each cited block after per-line
      whitespace normalisation, and `f3-bytes absent` fires before any range is compared, so a missing or
      re-pointed tag is loud rather than silent.

## Honest limits

- **f6 independence is name-based.** The gate admits a refetch record whose `seat` string differs from
  `fetched_by`; my two role names came from one process. The landing must have a second seat actually
  fetch the 156 blob; the gate cannot tell.
- The stable value is not re-checked this round: `receipt.stable` is `156.0.8078.47` and must equal
  `--stable`; a new stable needs a new receipt (`trigger` row S108), not an edit of this one.
- Appending to a round-29 receipt is an append, but it does change a committed evidence file; the
  `note_round_33` key keeps the round-29 note from becoming false.
