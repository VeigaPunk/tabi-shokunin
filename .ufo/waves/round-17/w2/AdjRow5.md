VERDICT: HOLDS

Attacked: corpus/adjacency.tsv data row 5 at M (file line 6) — surface
`musketeer-cdp-9222-profile-lease`, sibling `kake`, disposition `contested-open`,
ruling_ref `fleet@ebeb396f7db43c55de2711baa409f8bb9b71147b:.ufo/l0-questions.md:62`.
Question: are the four cited texts verbatim/reachable, and is `contested-open` the honest
disposition (real overlap, not a passing mention; not a stated split; not tabi refusing a
route; ruling really absent and really covering this sibling)?

PINS (all verified)
- kake pin resolves and IS the tip ladder entry: `git -C kake-shokunin rev-parse --verify
  7c61c8cc…` ok; `for-each-ref refs/heads` → `refs/heads/master
  7c61c8cc791bde36dd5e3688bdfea2678d90146c`; `merge-base --is-ancestor 7c61c8c master`
  → ANCESTOR (in fact equal). Only master exists. So the pin is reachable, not dangling.
- kagi pin c2cab35 = kagi master tip; fleet pin ebeb396 = ancestor of fleet master 839d8df;
  no L0 commit after ebeb396 touched the file (`git log ebeb396..master -- .ufo/l0-questions.md`
  → empty).

QUOTES (sed on the pinned blobs)
1. kake `PROVINCE.md:35` @7c61c8cc:
   `  The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)`
   Row field 4 is a verbatim substring after trim (9 words, ≤25). ✔
   CONTEXT NOT QUOTED — line 36: `  and stays with the integrator.`
2. tabi `SKILL.md:556` @M:
   `- **Profiles**: a fresh throwaway profile per run under the run's own output dir`
   Field 6 verbatim (12 words). 557-558 continue: `rm -rf at run start, disposition
   logged); one owned browser per run; never a user profile`. ✔
3. L0 `:62` @ebeb396 (last line, 62-line file):
   `tabi | round-17 | Contested scope, no ruling on record: … Request: rule the lease owner
   between kagi and kake, or declare the split; tabi records this row as contested-open in
   corpus/adjacency.tsv until answered and will not adjudicate it.`
   Field 9 verbatim (12 words). ✔ Line matches `tabi | round-<N> |` and names `kake`. ✔
4. grep/semantics of the "no L0 line ever carried it" claim: `grep -inE
   'musketeer|9222|chrome-profile'` over the pin → only line 62; `git log -S'musketeer'`
   and `-S'9222'` over that path → only ebeb396. ✔

GATE: ran the M checker blob read-only (`git show M:scripts/check-adjacency.mjs` →
/tmp, `node … --at 6c978510… --repo LANE --fleet ROOT --json`):
`{"verdict":"clean","rows":9,"verified":9,...}`; tips name kake=master, kagi=master,
fleet=master. Row 5 is mechanically verified (not merely asserted).

DISPOSITION — the honest one, with caveats
- Contest real, not a passing mention. kake's line names tabi as one of three parties;
  kake `SKILL.md:159-162` @pin claims the resource machine-wide — `Lease before browser …
  The shared burner chrome (the-musketeer profile, CDP 127.0.0.1:9222) serializes the whole
  kimi fleet — one op at a time, machine-wide`; tabi `PROVINCE.md:8-9` @M owns `browser
  inventory + profile surfaces (shape-only census); CDP session discipline`. kake's claim
  reaches tabi's declared substrate, so recording the overlap is warranted.
- Open, and ruled by nobody. kagi `PROVINCE.md:43` `**contested with kake** (lease/profile
  ownership unresolved`; kagi `:55` `the CDP lease/profile ownership question is reported to
  the integrator, never adjudicated here`; kake `corpus/lessons/round-6-aggregator-audit.md:139`
  `CDP-9222 lease ownership kake↔kagi unadjudicated … no ruling artifact`; kake
  `corpus/lessons/round-10.md:62` `CDP-9222 lease ownership still unresolved — reported, not
  absorbed`. kake `PROVINCE.md:36` adds `and stays with the integrator` — deferral, not a
  ruling.
- The round-16 integrator ruling does NOT cover this sibling. `corpus/lessons/round-16-verifier-spotcheck.md:138-142`
  @B/M names only `tabi` and `kaidoku` (`kaidoku keeps CDP only as an REA provider surface`);
  no kake/musketeer/9222. Marking this row `ruled` on that text would be false; the row
  correctly does not.
- Not a stated split: kake says contested scope + integrator custody; tabi states a run rule,
  not a division of ownership. `split-declared` would be false. Not `refused-route` either:
  tabi `PROVINCE.md:15-19` Refuses lists reverse engineering, web publishing and secrets —
  not the lease; tabi's 556 rule keeps it out, it does not route a lease duty to kake.
  Of the four vocabulary cells, `contested-open` is the only truthful one.

Caveats (material, none falsifying)
- C1 truncation: field 4 stops at line 35; kake's own `and stays with the integrator` (36) is
  dropped from the map and from the L0 line (wave-1 `AdjKake.md` draft had it). The row alone
  over-reads kake as asserting an unresolved claim; kake actually asserts the contest AND
  integrator custody. Both are consistent with `contested-open`; the checker's
  `<path>:<line>` schema admits one line only (`check-adjacency.mjs:56-58`), so this is a map
  limitation, not a forged quote.
- C2 tabi's side is a boundary rule, not a claim: `SKILL.md:556` never says musketeer/9222.
  `git grep -iE 'musketeer|9222'` @M over `SKILL.md PROVINCE.md corpus/` → 0 hits in
  SKILL.md/PROVINCE.md; the only direct tabi mention is `corpus/README.md:353`, which is new
  at M (0 at B, 1 at M) and describes this very map, i.e. circular. 556 is the right
  non-circular citation, but the row's two-sidedness is weaker than a split row's.
- C3 the L0 clause `never attaches to 9222 or the musketeer profile` is [INFERENCE] from
  `SKILL.md:556-558` (`fresh throwaway profile … never a user profile`) and tabi practice; no
  tabi line says "9222". The row does not quote that clause, so the row is unaffected; the
  L0 evidence line overstates.
- C4 mild circularity: line 62 pre-announces `tabi records this row as contested-open` and is
  the only musketeer/9222 line in the L0 file; the "ruling_ref" is a self-authored unanswered
  question, not a ruling. The disposition is independently corroborated by both siblings
  (kagi :43/:55, kake round-6:139, round-10:62), so the bookkeeping is not self-certifying in
  substance. Note kagi/kake lessons frame it `kake↔kagi`; tabi's party status appears only in
  kake `PROVINCE.md:35` and is denied by tabi — which is itself part of what stays open.

Repair: none required for the row. If L1 wants kake's line-36 cession inside the map, the
schema — not the row — must change (allow a cited line span, or a separate note column); do
not append line 36 to field 4 (it is not on line 35 and would fail the gate for the right
reason). Optionally the L0 line's `never attaches to 9222` clause should be softened to
"never uses a user/shared profile (SKILL.md:556-558)" — L0-owned text, not this lane's.

Installs/upgrades: none. No `jj`, no git write; /tmp checker extraction only
(/tmp/tabi-r17w2-AdjRow5-DMGcB8, this report's only scratch, no clone).

Files written:
- .ufo/waves/round-17/w2/AdjRow5.md
