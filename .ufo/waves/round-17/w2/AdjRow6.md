VERDICT: HOLDS

Attacked: `corpus/adjacency.tsv` data row 6 at M = 6c97851034e9d8f58b135d28ff969f1f28fa2f7d
(`musketeer-cdp-9222-profile-lease | kagi | contested-open`) — the three verbatim quotes, sibling
and ruling pin reachability, and whether `contested-open` is the honest disposition (versus
ruled / split-declared / refused-route), whether the cited L0 line covers kagi, and whether the
overlap is real or a passing mention.

## Row identity and fields (observed)

Row is line 7 (header + 6 data rows) of `M:corpus/adjacency.tsv`, 9 TAB fields:
1 `musketeer-cdp-9222-profile-lease`
2 `kagi`
3 `kagi-shokunin@c2cab35bc92e57e39e5489bac3386db078345b3f:PROVINCE.md:43`
4 `**contested with kake** (lease/profile ownership unresolved`
5 `SKILL.md:556`
6 `a fresh throwaway profile per run under the run's own output dir`
7 `contested-open`
8 `fleet@ebeb396f7db43c55de2711baa409f8bb9b71147b:.ufo/l0-questions.md:62`
9 `rule the lease owner between kagi and kake, or declare the split`

Quote/pin verification (script over `git show` at the pinned commits):
- sibling: quote is a byte substring of PROVINCE.md:43 (6 words, 54 non-space chars, no TAB). Full
  line: "CDP `9222` + `~/.local/share/the-musketeer/chrome-profile` — **contested with kake**
  (lease/profile ownership unresolved; kagi pins only the 1Password native-messaging manifest —
  the profile dir itself is presence-only, mode unchecked). …".
- sibling pin reachable: kagi `refs/heads/master` == c2cab35 (`merge-base --is-ancestor` true).
- tabi: `M:SKILL.md:556` is "- **Profiles**: a fresh throwaway profile per run under the run's own
  output dir"; quote is a byte substring (12 words, 53 chars). `:557-558` continue "(`rm -rf` at
  run start, disposition logged); one owned browser per run; never a user profile".
- ruling: `ebeb396:.ufo/l0-questions.md:62` resolves, is reachable from fleet `refs/heads/master`
  (839d8df; merge-base true), is byte-identical at the pin and at fleet master tip (`cmp` clean),
  is a `tabi | round-17 |` row naming kagi (and kake), and the quote is a substring (12 words,
  53 chars).
- No earlier L0 line: fleet `l0-questions.md` at master is 62 lines; the only `musketeer|9222` hit
  is line 62; `git log -S musketeer|9222 -- .ufo/l0-questions.md` returns only ebeb396 (the commit
  that added it). No L0 answer exists after it.
- Gate runs: `node scripts/check-adjacency.mjs --at M` from the lane root → exit 0, verdict
  `clean`, rows 9, verified 9, findings []; `node .ufo/waves/round-17/measure-c3.mjs M` →
  `{"c3_adjacency_verified":9,...}` with row `line 7` = `verified:true, reasons:[],
  ruling_authority:"external"`.

## Disposition attack — each alternative falsified

- `ruled` fails: the only nearby adjudication is the round-16 integrator CDP ruling
  (`corpus/lessons/round-16-verifier-spotcheck.md:141-142`), which names tabi page-tool observation
  and kaidoku's REA provider surface — not the the-musketeer profile/9222 lease, and not kagi. The
  wave-1 scout explicitly declined to apply it (`w1/AdjKagi.md:34-36`).
- `split-declared` fails: kagi says "ownership unresolved" (`PROVINCE.md:43`); kake says the lease
  is "contested scope (kagi/tabi/kake) and stays with the integrator"
  (`kake-shokunin@7c61c8c:PROVINCE.md:35-36`). kagi's own map records a one-sided functional
  partition (`kagi-shokunin@c2cab35:corpus/adjacency.tsv:82` `kake | contested | presence-only`;
  `:83` kagi writes NativeMessagingHosts), but kake has not accepted it, so both sides do not
  state a split.
- `refused-route` fails: kagi reports the question "to the integrator, never adjudicated here"
  (`PROVINCE.md:55`), and tabi "will not adjudicate it" (L0 :62). That is a refusal to adjudicate,
  not a refused route; neither side refuses the surface.
- `contested-open` holds: kake commits a machine-wide lease rule — `SKILL.md:159-162` "Lease before
  browser. `webzites lease acquire --owner <name> --ttl-ms 900000` … The shared burner chrome
  (`the-musketeer` profile, CDP `127.0.0.1:9222`) serializes the whole kimi fleet"; its round-1
  audit reports the cross-claim and "One owner must be ruled on by the integrator"
  (`corpus/lessons/round-1-aggregator-audit.md:74-77`). kagi names the same surface as contested and
  pins only the 1Password NMH manifest (`PROVINCE.md:43`). No ruling exists; tabi's L0 line (line 62
  of 62) is unanswered.

## Real or passing mention?

- Real in writing on both owning lanes, not a drive-by mention: kake's lease protocol is a standing
  SKILL rule over this exact profile/port; kagi registers the surface and its own committed map
  labels the counterpart `contested`. The row is a genuine cross-lane scope row.
- The tabi side is a boundary, not a use. At M `git grep -n 9222|musketeer` over the whole tree
  finds no tabi operational artifact: PROVINCE.md has no 9222/musketeer/lease line (only "profile
  surfaces (shape-only census)"), SKILL.md hits only `released`/`mouseReleased`, no script defaults
  to 9222, and tabi's committed round-1 lesson rejected S027 ("port 9222 on the everyday profile")
  (`corpus/lessons/kaika-fleet-round-1.md:82`). SKILL.md:556-558 states the practice boundary (fresh
  run-owned profile, one owned browser, never a user profile), so "tabi holds no lease half" is
  consistent with the committed tree — though it is asserted by the L0 filing, not by a tabi
  PROVINCE registry line (PROVINCE is unchanged B→M: `git diff B..M -- PROVINCE.md` is empty, per
  the L1 amendment dropping the census-frozen append).
- The contest is currently inert on the host: `~/.local/share/the-musketeer/chrome-profile` ABSENT,
  `~/.local/share/the-musketeer` ABSENT, `webzites` NOT ON PATH, `~/Projects/webzites` ABSENT, no
  listener on 9222 (read-only checks, 2026-10-20). kagi already marks its surfaces list
  HISTORICAL/absent (`PROVINCE.md:10-16`). The row records a declared-scope ownership contest, not a
  live collision, and does not claim otherwise.

## Non-blocking observations (no repair needed for this verdict)

1. `ruling_quote` is tabi's petition fragment, not a status fragment: verbatim, in-contract, names
   kagi/kake, but the line's opening "Contested scope, no ruling on record:" states the disposition
   directly. Optional sharpening, same line, 17 words, names the sibling: "Contested scope, no
   ruling on record: the the-musketeer Chrome profile / CDP 127.0.0.1:9222 lease named by kagi".
2. kagi `PROVINCE.md:63` ("kake holds the musketeer profile lease (contested, above)") and
   `corpus/adjacency.tsv:82-83` record the one-sided partition not cited by the row; kake's
   acceptance is the real residual. This sharpens L0's question (confirm kake as lease holder and
   kagi as NMH writer, or rule otherwise) but does not move the disposition.

Residual unknowns: kake's acceptance of the partition is not on record [observed absence]; tabi's
live attach behavior is not exercised here, but no committed artifact contradicts the L0 claim. A
/tmp-clone checker run failed sibling resolution by design (repos resolve as siblings of the repo
root), so the lane-root run above is authoritative.

Files written: .ufo/waves/round-17/w2/AdjRow6.md
Tooling: none installed.
