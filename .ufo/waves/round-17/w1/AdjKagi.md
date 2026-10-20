VERDICT: PASS

# AdjKagi — kagi sibling-overlap rows for round-17 C3 (wave 1)

Pins used: kagi `c2cab35bc92e57e39e5489bac3386db078345b3f` (`git -C …/kagi-shokunin rev-parse master`),
tabi `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (`rev-parse master`), fleet
`534852203d551f38c68e3a1efd26b6fbe7663267` (`git -C …/shokunin rev-parse HEAD`). Read-only on
kagi; no git write, no browser, no tool install; `scripts/check-adjacency.mjs` does not exist yet
at baseline (`ls` → No such file), so rows were verified by an independent awk/git re-check.

## Rows written — `.ufo/waves/round-17/adjacency/kagi.tsv` (3 rows, 9 cols each, no header)

| # | surface | sibling_ref | disposition | tabi side |
|---|---|---|---|---|
| 1 | musketeer-cdp-9222-profile-lease | PROVINCE.md:43 | contested-open | SKILL.md:556 quote / `NEEDS-L0` |
| 2 | musketeer-profile-native-messaging-manifest | corpus/adjacency.tsv:83 | split-declared | SKILL.md quote OK |
| 3 | cdp-9222-endpoint-use-scope | corpus/knowledge/cdp-bridge-1password.md:55 | split-declared | PROVINCE.md quote OK |

Quote audit (re-run for all rows): sibling_quote substring in the pinned line = OK for 3/3;
sibling_quote word counts 8 / 17 / 5 and tabi_quote word counts 12 / 5 / 7 (all ≤25); zero TABs
inside any field (`awk -F'\t'` → NF=9 per row).

### Evidence pasted (commands run from `/home/vgpnk/Projects/shokunin`)

```
$ git -C kagi-shokunin show c2cab35bc92e57e39e5489bac3386db078345b3f:PROVINCE.md | sed -n '43p'
- CDP `9222` + `~/.local/share/the-musketeer/chrome-profile` — **contested with kake** (lease/profile ownership unresolved; kagi pins only the 1Password native-messaging manifest — the profile dir itself is presence-only, mode unchecked). Declared as a partition row in `corpus/adjacency.tsv` (`kake` / `contested` / `presence-only`), so drifting the profile dir to an exact mode pin is `OVERCLAIM`, exit 1 (round 16)

$ git -C kagi-shokunin show c2cab35bc92e57e39e5489bac3386db078345b3f:corpus/adjacency.tsv | sed -n '83p'
$HOME/.local/share/the-musketeer/chrome-profile/NativeMessagingHosts	kagi	writer	declared	corpus/lessons/round-8-aggregator-box3-coldrun.md:64	NativeMessagingHosts	the NMH dir + 1Password manifest are written by this domain's `cdp-bridge ensure` inside kake's leased profile; the writer lane owns the row, and kagi declares exactly these two paths and nothing else in the subtree

$ git -C kagi-shokunin show c2cab35bc92e57e39e5489bac3386db078345b3f:corpus/knowledge/cdp-bridge-1password.md | sed -n '55p'
is deliberately a *reachability* probe.

$ git -C tabi-shokunin show 5859243183c4d7ac5429dfdb8a73ce0d9a43d583:PROVINCE.md | sed -n '9p'
CDP session discipline (endpoints, targets, screenshot/DOM evidence

$ git -C tabi-shokunin show 5859243183c4d7ac5429dfdb8a73ce0d9a43d583:SKILL.md | sed -n '556p'
- **Profiles**: a fresh throwaway profile per run under the run's own output dir

$ git -C tabi-shokunin show 5859243183c4d7ac5429dfdb8a73ce0d9a43d583:SKILL.md | sed -n '765p'
- Session material content-reads: shape-only, always (`browser-surface-census.md:3-8`;
```

Notes on the tabi quotes: PROVINCE.md:9 is a whole line ending at the source's own wrap (line 10
continues `capture); …`); the quote is still a byte-exact substring. Row 1 uses the profile rule at
SKILL.md:556, whose next line reads "(`rm -rf` at run start, disposition logged); one owned browser
per run; never a user profile" (`:557`). Row 3 pairs kagi's "reachability probe, not page work"
(`:55`) with tabi's CDP-session ownership (`PROVINCE.md:9`), so each lane declares its share. Row 2
pairs kagi's writer claim with tabi's shape-only rule.

## Why row 1 is `contested-open` + `NEEDS-L0`

kagi declares the lease contested with **kake** and routes it to the integrator
(`PROVINCE.md:55`), never adjudicating. Tabi has **no** PROVINCE.md/SKILL.md line naming CDP 9222,
the-musketeer, the lease, or a chrome profile (`git grep -nE '9222|musketeer|lease' <tabi>:PROVINCE.md SKILL.md`
→ only unrelated `released`/`mouseReleased` hits). Its nearest declaration is the profile rule at
`SKILL.md:556` (fresh throwaway profile per run; one owned browser per run; "never a user profile",
`:557`), used here as the tabi-side quote: tabi runs off its own run-owned profile, so any stake in
the shared musketeer profile / 9222 lease is unclaimed in writing. The contest is not moot — kake's
province names tabi in it (`kake-shokunin@7c61c8c:PROVINCE.md:35`, "contested scope
(kagi/tabi/kake)").

Fleet `.ufo/l0-questions.md` at HEAD `5348522` has exactly 2 `tabi |` lines (`:25` round-5
approval, `:34` round-1 namespace) and **0** lines matching `9222|CDP` (`grep -c` = 0), so no
citable tabi line exists → `ruling_ref=NEEDS-L0`, `ruling_quote=-`. The kake fragment
(`.ufo/waves/round-17/adjacency/kake.tsv`) records the same lease surface as `contested-open` +
`NEEDS-L0` with this same tabi quote, so both sides of the contest agree.

L1 action for row 1: file the L0 question below, then replace `NEEDS-L0`/`-` with
`fleet@<new-HEAD>:.ufo/l0-questions.md:<line>` + that line's verbatim quote. No PROVINCE append is
needed for the tabi quote (the SKILL profile rule already states tabi's side); append one only if
the lane wants the lease named in PROVINCE.

Drafted L0 question (one line, `tabi | round-17` form):
`tabi | round-17 | CDP 9222 + ~/.local/share/the-musketeer/chrome-profile: kagi PROVINCE.md:43 declares the lease contested with kake and PROVINCE.md:55 reports it to the integrator, never adjudicating; tabi owns browser-profile surfaces (shape-only census) and CDP session discipline (tabi PROVINCE.md:8-9) and its adjacency map must record the overlap. Does tabi (a) hold no lease claim, record the contest unresolved and pin no mode, or (b) take 9222/profile as tabi's browser surface under the round-16 CDP ruling (corpus/lessons/round-16-verifier-spotcheck.md:141, which names kaidoku, not kagi)? Recommendation (a).`

Deliberate non-use: I did **not** mark any kagi row `ruled` on
`corpus/lessons/round-16-verifier-spotcheck.md:141` — that ruling names **kaidoku**, and applying
it to kagi's reachability probe would overclaim. It is consistent with row 3, not a basis for it.

## Rejected / folded candidate overlaps

1. kagi `corpus/adjacency.tsv:82` (profile partition row, `kake/contested/presence-only`) — **folded
   into row 1**: same surface and same kagi↔kake contest; PROVINCE.md:43 is its declaration.
2. kagi `PROVINCE.md:55` (lease question reported to integrator, never adjudicated) and
   `SKILL.md:486` (never absorb CDP lease/musketeer profile) — **folded into row 1**: same surface;
   `refused-route` was unavailable because tabi states no side of that split (SKILL.md:556 is a
   profile-practice rule, not a routing refusal).
3. kagi `SKILL.md:448` (checklist: 9222+profile shared with kake fleet) — **folded**: checklist
   formulation of row 1's surface.
4. kagi `corpus/checklist.tsv:38` (H5 by-hand, "what would mechanise it: an integrator ruling")
   — **folded into the L0 draft**: gate-mechanisation note, not a distinct surface.
5. kagi `corpus/knowledge/cdp-bridge-1password.md:70` "start/inspect via the browser lane" —
   **rejected as not tabi**: kagi's own note `:77-79` attributes the shared browser to the webzites
   kimi fleet behind kake's `webzites lease acquire`; no tabi line pairs.
6. kagi `corpus/knowledge/cdp-bridge-1password.md:60` "open-popup is human/CDP UI — use
   agent-browser" — **rejected**: tabi never mentions `agent-browser` (`git grep` 0) and kagi
   routes browser work to the webzites/kake fleet (`:77-79`).
7. tabi `corpus/knowledge/webmcp-chromium-loopback-round-16.md:138-139` (prompt-injection risk
   "unassigned between kasegi/kagi") — **rejected as a kagi row**: kagi has zero
   `prompt-inject|webmcp|tool poisoning` lines at the pin (`git grep` empty), so no verifiable
   `sibling_quote` exists; the line is tabi's own route note, not a kagi declaration.
8. kagi `corpus/adjacency.tsv:81` (opencode group row) — **rejected**: owners are
   integrator/kotoba/kama/kengaku/kumitate; no browser surface, no tabi.
9. kagi `PROVINCE.md:63` ("kake holds the musketeer profile lease (contested, above)") — same
   surface as row 1; folded.
10. `git grep -n -i 'tabi'` in kagi `c2cab35b` → only two substring false positives
    (`executability` in two round-8 lesson lines, `portability` in `corpus/surface-census.sh:122`);
    kagi names tabi nowhere. Recorded, so no kagi row claims a textual tabi cross-reference.

Also observed (context, not a row): tabi's profile census says no `*chrome-profile*` dirs exist
under `~` at depth ≤5 (`corpus/knowledge/browser-surface-census.md:106`), consistent with kagi's
round-18 erratum (`PROVINCE.md:10-17`): the musketeer chrome profile is absent on this host, so
neither lane currently holds live bytes on the contested surface.

## Files written

- `.ufo/waves/round-17/adjacency/kagi.tsv` (3 rows, rows-only)
- `.ufo/waves/round-17/w1/AdjKagi.md` (this report)
