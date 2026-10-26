# ConnSiblingLeads — round-33 w2: leads.tsv vs the landed screen ledger and map at 042d6d9

Seat: ConnSiblingLeads (leaf). Attack: cross-check `.ufo/waves/round-33/w1/ConnSiblingScan/leads.tsv` (41 leads)
against the landed `corpus/adjacency-screen.tsv` (43 screens) and `corpus/adjacency.tsv` (14 verified rows)
at `042d6d9abf97d567d495652a85eabc851b81adc1` — does any lead contradict a screen decision, which leads
are the strongest next-round map candidates, which sibling lanes should get an L0 question.

## Verdict: HOLDS

**No lead contradicts a screen decision, and no lead identifies a screened PROVINCE line as a real overlap.**
The 7 leads whose note names a sweep candidate (sweep_caught=yes/mapped) point at candidates whose landed
dispositions are consistent with the leads' own content: kaidoku:53 mapped (ruled), kagi:43 mapped
(contested-open Q62), kagi:59 screened same-surface (the lead itself says "report to integrator"), kake:39
mapped (contested-open Q62), kake:79 mapped (new row 14), kake:304 mapped (new row 13). The knowledge leads
that carry real_overlap=yes for lanes with screens (kake, kaidoku, kagi, kotoba, tsukuroi) **reinforce**
the screen reasons rather than refute them — notably the kake delegation corpus (SKILL.md:408/:559-560/:697,
field-performance-cwv.md:153, accessibility-review-packet.md:122, static-canonical-preflight.md:134) supports
the `not-browser-sense`/`no-claim-declared` screens on kake lines, and the kaidoku observation recipes
confirm but do not extend the ruled `cdp-runtime-observation` surface (the node --inspect half of :137 is
not tabi ground). No lead touches the kengaku:54 (screened not-browser-sense) or tsukuroi:150 (screened
third-lane-report) screens. Severity: n/a (no defect). This confirms w1's own claim ("no finding here
changes the frozen counter") against the landed bytes.

## Evidence

All commands run read-only; writes only in this seat dir and scratch.

- Clone at the attacked revision (exit 0):
  `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`
  `git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1` → HEAD `042d6d9…`
- Frozen C1 counter at 042d6d9 (exit 0; receipt `receipts/c1-at-042d6d9.json`, sha256 `4547a1ff…c40`):
  `predicate true | adjacency clean 14/14 | candidates 52 | mapped 9 | screened 43 | unaccounted 0 |
  newMapped 4 | screenFindings []` — the landed ledger/map fully account the sweep; no screened candidate is
  left unaccounted and no map row is unverified.
- Lead quote verification (all exit 0, `git -C <sibling> show <pin>:<path> | sed -n '<n>p'` hits the quoted
  string on the cited line): kake SKILL.md:408/:559/:560/:697, field-performance-cwv.md:153,
  accessibility-review-packet.md:122, static-canonical-preflight.md:134 @044048597d; kagi
  cdp-bridge-1password.md:70/:77 @69b61db; kumitate kimi-skills-plugins.md:250/:278/:321/:324 @8d557f85;
  kaidoku r3-runtime-observation.md:17/:50/:99, r4-16-frontier-rescan.md:184, r10-01-queue-ops.md:151,
  r10-02-queue-ops-2.md:117, r11-01-queue-ops.md:305 @fa6a8a3; kasegi mission-control.md:119,
  ufo-workspaces.md:272, SKILL.md:267 @9a10b02fe; kama consumer-registry.md:9/:235 @0163fea2;
  kengaku SKILL.md:39 @fc79f2a4.
- Mapped-candidate text equality across pins (the counter's `mapped` rule) confirmed for the leads' targets:
  kake:39@044048597d == kake:35@7c61c8cc ("The the-musketeer Chrome profile lease is contested scope
  (kagi/tabi/kake)"); kagi:43@69b61db == kagi:43@c2cab35bc; kaidoku:53@8b9634ed == kaidoku:53@9011581d.
- Sibling tip reachability: kake/kagi/kama/kumitate/kotoba lead pins == lane tips; kasegi lead pin
  9a10b02fe is an ancestor of tip 700153593e (`merge-base --is-ancestor` exit 0); kaidoku lead pin == tip
  fa6a8a3. All cited commits are reachable for future map rows.
- No network fetch (0 HTTPS GETs); no tool installed; no browser started. `pgrep -fa 'chromedriver|chromium'`
  at end: only host `earlyoom` (PID 1371, argv-match, not ours).

## Ranked next-round map-row candidates (see `ranked-leads.tsv`)

1. **kasegi authenticated-cdp-driving (3 leads; rank 1-3)** — mission-control.md:119, ufo-workspaces.md:272,
   SKILL.md:267. The largest untracked overlap mass: kasegi drives a browser at CDP 9222 to verify
   submissions. No kasegi row or L0 exists. Needs a new L0 (contested-open).
2. **kake browser-lab-tool-execution (3 leads; rank 4-6)** — SKILL.md:697 ("Running the tool is tabi's
   work."), SKILL.md:408, field-performance-cwv.md:153. Split-declared rows, immediately draftable without
   L0 (sibling_quote contains `tabi`); distinct from the four existing kake rows.
3. **kaidoku evidence-capture surfaces (4 leads; rank 7-10)** — r4-16:184 (screenshots), r10-01:151 (HAR),
   r3:50 (DOM/accessibility), r3:17 (disposable profile). Distinct from the ruled cdp-runtime-observation
   enumeration surface; need an L0 on the r16 ruling's scope.
4. **Corroboration-only (rank 11-16)** — kake SKILL.md:559-560 and static-canonical-preflight.md:134
   (support rows 14/12; a new row on the same (surface,sibling) pair is `duplicate_row`), kagi
   cdp-bridge-1password.md:70 (rides open Q62), kumitate kimi-skills-plugins.md:321/:250 (support row 10),
   kama consumer-registry.md:235 (supports row 11).
5. **kengaku WebArena (rank 17)** — SKILL.md:39; benchmark harness, optional.

## L0 question recommendations (see `l0-recommendations.tsv`; fleet `.ufo/l0-questions.md` append-only)

- **kasegi (new)**: authenticated-CDP browser-driving vs the contested lease (Q62) and the r16 CDP ruling.
- **kaidoku (new)**: does the r16 ruling (round-16-verifier-spotcheck.md:141-142) cover the live loopback
  evidence-capture recipes, or are they separate surfaces.
- **kengaku (optional)**: WebArena benchmark eval adjacency.
- No new question for kake/kagi/kama/kumitate/kotoba/tsukuroi: existing Q62/Q65 and the four split rows
  already cover their ground.

## Deliverables

- Report: `.ufo/waves/round-33/w2/ConnSiblingLeads.md` (this file)
- `.ufo/waves/round-33/w2/ConnSiblingLeads/crosscheck.tsv` — lead × landed-disposition matrix (41 rows)
- `.ufo/waves/round-33/w2/ConnSiblingLeads/ranked-leads.tsv` — ranked next-round map-row candidates
- `.ufo/waves/round-33/w2/ConnSiblingLeads/l0-recommendations.tsv` — proposed L0 questions
- `.ufo/waves/round-33/w2/ConnSiblingLeads/receipts/c1-at-042d6d9.json` (+ `.stderr` empty)

Hygiene: no lane tracked file, lane index, jj state, fleet repo or sibling repo written (sibling repos
read-only `git show`); scratch `/fast/scratch/hyaku/tabi-r33/ConnSiblingLeads` removed before yield.
