VERDICT: ISSUES

Attacked: `scripts/check-adjacency.mjs` and `.ufo/waves/round-17/measure-c3.mjs` at M
(`6c97851034e9d8f58b135d28ff969f1f28fa2f7d`) with 16 forged `corpus/adjacency.tsv` maps, one per
sandbox commit on top of M, plus one crafted-fleet case for the self-venue author rule. Sandbox
`/tmp/tabi-r17w2-ForgeC3Checker-g9pH/tabi-shokunin` (`git clone --no-hardlinks`, `checkout --detach M`,
named `tabi-shokunin` so the counter's ownToken resolves). Every case:
  checker `node scripts/check-adjacency.mjs --repo <S> --fleet /home/vgpnk/Projects/shokunin --at <rev> --json`
  counter `node .ufo/waves/round-17/measure-c3.mjs <rev> --repo <S> --fleet-root /home/vgpnk/Projects/shokunin`
Baseline at M, both instruments: checker `verdict=clean rows=9 verified=9` (`selfRulings [2]`); counter
`c3=9 {contested-open 2, ruled 1, split-declared 2, refused-route 4}`, all 7 probe mutations
`checker_exit=1`, probe base `exit 0`.

Required forgery classes — all defeated (checker reason / counter reason):
1. quote_from_other_line (kaidoku PROVINCE.md:3 quote on a :53 pin) — `sibling_quote_absent` /
   `sibling_quote_absent`; both 8/9, c3 8.
2. quote_padded_interior (doubled interior space) — `sibling_quote_absent` / `sibling_quote_absent`.
2c. quote_padded_edges (control; spaces around a valid quote) — accepted clean 9/9, c3 9. This is the
   documented field trim; the trimmed quote is still verbatim on the cited line, so no false claim
   passes. Not a surviving forgery.
3. sibling_homoglyph (`kаidoku`, U+0430) — `sibling_ref_invalid` (+`ruling_quote_absent`) /
   `sibling_ref_invalid`.
4. sibling_pin_unreachable (kaidoku `0e36c478…` exists only on `refs/jj/keep`, not an ancestor of main
   `b2aad08`) — `sibling_unresolved` / `sibling_unresolved`.
5. ruling_line_edited_after_pin (spotcheck line 142 edited at the evaluated rev, pin 5859243 kept) —
   `ruling_unresolved` / `ruling_venue` (checkSelfVenue false).
6. contested_open_l0_line_25 (fleet l0:25 is a `kake | round-17 |` row) — `l0_line_absent` /
   `l0_line_absent`.
7. tabi_ref_under_ufo (`.ufo/waves/round-17/PLAN.md:3`) — `tabi_ref_invalid` / `tabi_ref_invalid`.
8. duplicate_surface, case variant `CDP-RUNTIME-OBSERVATION` and edge-whitespace variant — appended row
   `duplicate_row` / `duplicate_row` (checker 9/10; counter c3 9, row unverified).
9. ruled_via_tabi_authored_lesson (crafted fleet: a `corpus/lessons/round-17-verifier-spotcheck.md` line
   committed on master with author `tabi-shokunin`) — `ruling_ref_invalid` "self ruling … was authored by
   tabi-shokunin; a lane cannot rule on itself" / `ruling_venue`, c3 0.
10. header_variant (`Surface`) — exit 2 `map_schema_invalid` / exit 2 `header_invalid`, c3 0.
Extras that also drop: tabi_quote_other_line (`tabi_quote_absent`), ruled_quote_unnamed
(`ruling_quote_absent` / `rulingUnnamed`), sibling_ref_traversal `../PROVINCE.md` (`sibling_ref_invalid`).

Survivors — forged maps both instruments certify green:
S1. Duplicate evidence under a renamed surface. A byte-identical copy of row 2 with only the surface
    changed to `cdp-runtime-observation-again` (rev `88dd3312…`) gives checker `exit 0 verdict=clean
    rows=10 verified=10` and counter `c3=10`, no reasons, probe base exit 0; the probe suite does not
    catch it (its `duplicate_surface` probe only uppercases the surface, which folds). The counter's own
    contract at `.ufo/waves/round-17/measure-c3.mjs:33-34` and `:651-654` ("a sibling line may be cited
    once (SentinelAnchor F11)") is not implemented: `:668` dedups on `fold(surface)\0fold(sibling)` only,
    so one pinned sibling line is counted twice. Repair: add the parsed sibling pin
    (`<lane>@<commit>:<path>:<line>`, `parseSiblingRef`) or the `sibling_ref`+`tabi_ref` pair to the
    duplicate key in `evaluate()`; mirror the same rule at `scripts/check-adjacency.mjs:1000`.
S2. Homoglyph surface. The same copy with surface `cdp-runtime-observatiοn` (Greek omicron U+03BF, rev
    `aeb47c90…`): checker clean 10/10, counter c3=10. NFKC (`check-adjacency.mjs:968`) does not unify
    cross-script confusables, and the counter's `fold` (`measure-c3.mjs:651-653`) does not NFKC at all.
    Repair: constrain `surface` to an ASCII charset (`[a-z0-9 -]`) and reject non-ASCII surfaces, while
    keeping the exact-string key as a second uniqueness check.
S3. `ruled` citing an l0 *question*. Row 7 (musketeer/kagi) switched to `disposition=ruled` with
    `ruling_ref=fleet@ebeb396:.ufo/l0-questions.md:62` and quote `rule the lease owner between kagi and
    kake` (rev `6d51bf62…`): checker clean 9/9; counter `c3=9` with `by_disposition ruled=2` (was 1). The
    cited line's own text says "no ruling on record … Request: rule the lease owner … or declare the
    split". L0 is special-cased only for contested-open (`check-adjacency.mjs:809`); a `ruled` fleet
    venue accepts any path (`:817`). Repair: refuse `.ufo/l0-questions.md` as a `ruled` venue (questions
    are not rulings), or require a ruled fleet line outside the l0 row grammar.
S4. Counter lane token is the checkout directory name. `ownToken: basename(laneRepo)` at
    `measure-c3.mjs:1100` versus the checker's constant `SELF_LANE='tabi'` (`check-adjacency.mjs:181`).
    A clone at M named `clone-S` (exactly the PLAN §C1 sandbox recipe `git clone --no-hardlinks LANE S`)
    yields counter `c3=8`, `by_disposition ruled=0`, row 2 `ruling_venue`, exit 0; the same clone's
    checker says clean 9/9. `count_agreement=false` is reported inside probes but changes no count and
    no exit code. Repair: use the constant lane token (or the committed lane identity) instead of the
    basename, and exit 2 when the lane token cannot be confirmed.

Not broken: line/file/commit pinning of quotes, orphan-pin reachability, self-venue authorship +
ancestry + byte-identity, header schema, path cleanliness/traversal, invisible-character ban, and the
4..25-word / 20-non-space floors all behaved as documented.

Files written: .ufo/waves/round-17/w2/ForgeC3Checker.md
Sandbox retained because cited survivors need reproduction: `/tmp/tabi-r17w2-ForgeC3Checker-g9pH`
(driver `/tmp/fc3-driver.mjs`, results `/tmp/fc3-results.json`, crafted fleet `.../fleet9`). No lane file
was modified; no tool was installed.
