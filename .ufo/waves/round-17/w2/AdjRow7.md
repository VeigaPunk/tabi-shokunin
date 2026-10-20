VERDICT: ISSUES

Attacked: `corpus/adjacency.tsv` data row 7 at M=6c97851034e9d8f58b135d28ff969f1f28fa2f7d
(line 8): surface `secrets-and-session-material`, sibling `kagi`, disposition `refused-route`.
Re-verified all four citations and pin reachability, then attacked the disposition
(two-sidedness, ruling coverage, whether "refused-route" is really tabi refusing, and whether the
overlap is real or a passing mention).

## Citation mechanics — all hold
1. Sibling quote `secrets & vault ops — the-janitor flows, credential hygiene evidence` is a
   byte-exact substring of `kagi-shokunin@c2cab35bc92e57e39e5489bac3386db078345b3f:PROVINCE.md:3`
   (`**Domain:** secrets & vault ops — the-janitor flows, credential hygiene evidence`).
2. Pin reachable: kagi `refs/heads/master` == c2cab35… exactly (the pin IS the tip);
   `git -C kagi-shokunin merge-base --is-ancestor c2cab35… refs/heads/master` → exit 0; no
   `refs/heads/main` exists. `check-adjacency --json` tips: kagi → `refs/heads/master`.
3. Tabi quote `secrets (→ kagi — session material is` is byte-exact on `PROVINCE.md:16` at M
   (`web *publishing* (→ kake), secrets (→ kagi — session material is`). `git diff
   5859243… 6c97851… -- PROVINCE.md` is empty: the line is baseline bytes.
4. `ruling_ref` `-` is correct for refused-route (no ruling claimed). `ruling_quote` is a verbatim
   substring of the same tabi line — byte-identical to `tabi_quote`.
5. Gates: `node scripts/check-adjacency.mjs --at 6c97851… --json` → `verdict:"clean", rows:9,
   verified:9`; `node .ufo/waves/round-17/measure-c3.mjs 6c97851…` → `c3_adjacency_verified:9`,
   row index 6 `verified:true, reasons:[]`; at B=5859243… → 0 (map and checker absent).

## Disposition attack — findings
F1 — ONE-SIDED; the plan's own bar is unmet. PLAN §C3: "split-declared / refused-route: … both
quotes must state the split." Kagi's quoted line states only its own domain. At the pinned commit,
`git -C kagi-shokunin grep -E '\btabi\b' c2cab35… -- .` returns zero hits across the whole repo;
kagi `PROVINCE.md:63` ("Adjacent — report, don't absorb") names chousa, kasegi, kumitate, kama,
kaidoku, kake — not tabi. The split/route is declared by tabi only. The landed checker silently
relaxes the plan: `scripts/check-adjacency.mjs:82-87` states the committed refinement of "both
quotes state the split" is "exact verbatim existence", and `:764-780` requires only that
`ruling_quote` be a substring of the tabi file; the sibling-names-`tabi` test exists only for
`ruled` (`:905`). Row 7 makes `ruling_quote` a duplicate of `tabi_quote`, so it satisfies the
predicate with no second statement at all.

F2 — COMPOUND SURFACE OVERSTATES THE ROUTE. Tabi refuses *secrets*, but its **Owns** list keeps
`login-session handling rules (cookies/tokens shape-only, never values)` (`PROVINCE.md:11`), and
the quoted line's continuation (`PROVINCE.md:17`) is `shape-only, never content-read`. Tabi routes
secrets to kagi but retains session material shape-only. Kagi's PROVINCE at the pin never claims
browser session material; its nearest session line (`:33`) pins the-janitor's own `session-id` as
runtime state. The surface name joins a routed object (secrets) to an object kagi does not claim
(session material), and the ≤25-word quote ends before `shape-only`, hiding the carve-out.

F3 — PROVENANCE OUTSIDE THE WAVE-1 PIPELINE. Row 7 appears in no wave-1 fragment. All six
`.ufo/waves/round-17/adjacency/*.tsv` were read: `kagi.tsv` has exactly 3 rows (musketeer lease,
NMH manifest, cdp endpoint), none secrets. `git grep -F secrets-and-session-material 6c97851…`
matches only `corpus/adjacency.tsv:8`. PLAN §C3 says scouts write fragments and L1 concatenates;
this row was added at integration and never had a scout verification pass (the counter still
verifies it mechanically).

F4 — ALREADY-CREDITED BASELINE REFUSAL. `PROVINCE.md` is byte-identical B→M; the refusal block
`PROVINCE.md:15-19` was already scored in round 1 — `SCORECARD.md:100` at both B and M says
"refusal routes `PROVINCE.md:15-19`". Wave-1 `CriticC3.md` A3 item 7 flagged exactly this
("Pre-existing refusals recounted") and proposed a denominator repair; the landed map still counts
it toward the 0→9 move.

F5 — RULING/ROUTE CORRECTNESS HOLDS. No ruling covers this sibling and none is claimed; the
round-16 CDP ruling names kaidoku and the kagi scout explicitly declined to apply it to kagi
(`w1/AdjKagi.md`, "Deliberate non-use"). And refused-route genuinely is tabi refusing:
`PROVINCE.md:15-16` "**Refuses:** … secrets (→ kagi …)".

## Is the overlap real or a passing mention?
Real on tabi's side, not reciprocal. Tabi owns login-session handling (`PROVINCE.md:11`) with
operational rules at `SKILL.md:563` ("Secrets shape-only: session material never content-read") and
`SKILL.md:662-666` (§Session-material discipline: cookies/tokens/login state/profile stores never
content-read). Kagi is the correct owner for secrets content (`PROVINCE.md:3`; `:63` "kagi owns
runtime auth and credential custody"). So this is a genuine boundary, but only tabi declares it;
kagi's cited line is a generic domain/ownership claim, not a boundary acknowledgment. Under the
plan's text the row's evidence does not state a two-sided split.

## Concrete repair
1. Narrow the surface to `secrets-vault-ops` (or `secrets`), matching what `PROVINCE.md:16`
   actually routes; drop the session-material half — tabi owns it shape-only (`PROVINCE.md:11`) and
   kagi claims none of it.
2. Make the second quote distinct (e.g. `ruling_quote` = `secrets (→ kagi`, still verbatim on
   `:16`) and add a checker predicate `ruling_quote !== tabi_quote`; otherwise any refused-route
   row satisfies "both quotes" by duplication.
3. Enforce the stated bar or disclose the relaxation: either require the sibling quote to
   word-match `tabi` for split/refused (CriticC3 A3 item 6 repair) — which drops this row to
   contested-open, unfileable this round because no fleet L0 `tabi |` line names kagi/secrets — or
   record in the map/LOG that refused-route is tabi-unilateral by construction and stop counting it
   as a "verified adjacency disposition" (C3 = 8, not 9 under that reading).
4. Provenance: add the row to `adjacency/kagi.tsv` so the fragment→map transform is traceable, or
   disclose the L1 addition in LOG.
5. Baseline recount: exclude rows whose tabi side is unchanged since B from the C3 credit, or
   disclose the recount (CriticC3 A3 item 7).

Confidence: high on quotes/pin/gate results; high on kagi silence at the pin; medium on the
surface-naming critique (depends on whether "session material" is scoped to browser state or
the-janitor state).

Remaining unknowns: (a) integrator intent for refused-route — plan text (both quotes) vs landed
code (verbatim existence) — not resolvable from code alone; (b) whether kagi `PROVINCE.md:63`
"kagi owns runtime auth and credential custody" should count as acknowledgment of the route (it
does not name tabi; this seat reads it as no); (c) kagi corpus outside PROVINCE could acknowledge
tabi — word-boundary grep over the whole pin found zero hits.

Files written: .ufo/waves/round-17/w2/AdjRow7.md
Scratch: /tmp/tabi-r17w2-AdjRow7-XXXX used only as TMPDIR for the counter, removed. No tools
installed; no git writes; lane untouched.
