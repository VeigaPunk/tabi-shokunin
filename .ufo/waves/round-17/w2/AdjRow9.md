VERDICT: ISSUES

Attacked: `corpus/adjacency.tsv` data row 9 (file line 10 at M) —
surface `kimi-webbridge-plugin-internals`, sibling `kumitate`,
disposition `split-declared`, ruling_ref `-`. Claims re-verified at
M = 6c97851034e9d8f58b135d28ff969f1f28fa2f7d (lane `refs/heads/master`).

## Observed — pins and quotes

- Row has exactly 9 fields; sibling pin
  `kumitate-shokunin@1770305fae20826b39905a8251ddeca6b4957ac4:SCORECARD.md:1556`.
  `git -C kumitate-shokunin rev-parse refs/heads/master` =
  `1770305fae20826b39905a8251ddeca6b4957ac4` — the pin **is** the sibling
  master tip; `merge-base --is-ancestor` → true; SCORECARD.md has 1630 lines
  at the pin, so :1556 resolves.
- Pinned line at the pin: `internals route to **tabi**, the \`config.toml\`
  REA MCP spawn key to **kaidoku**,`. The cell omits the trailing comma and is
  otherwise byte-identical — a verbatim substring (12 words / 68 non-space
  chars), which is what `check-adjacency.mjs` requires.
- Tabi `PROVINCE.md:6` at M: `**Owns (surfaces):** the kimi-webbridge plugin`
  (5 words / 42 chars, exact). The sentence continues `:7`
  `(\`~/.kimi-code/plugins/managed/kimi-webbridge/\`) as primary substrate`
  and `:8` `documentation; browser inventory + profile surfaces (shape-only census);`.
- `ruling_ref` is `-`, correct for `split-declared`. There is **no ruling/L0
  quote to verify**. The third field
  `(\`~/.kimi-code/plugins/managed/kimi-webbridge/\`) as primary substrate` is
  the `:7` continuation of the same tabi sentence, verbatim in the tabi file
  (line 7), 4 words / 66 chars. `check-adjacency.mjs:83-87` documents that for
  split rows the third quote is a substring of the tabi file, not a ruling;
  `:766-780` enforces exactly that. It is not evidence of a third source.

## Observed — shipped gates at M

- Checker, lane-named sandbox clone, `--at 6c9785… --fleet /home/vgpnk/Projects/shokunin --json`:
  `{"verdict":"clean","rows":9,"verified":9,"selfRulings":[2]}` exit 0.
- Counter, `/tmp/tabi-r17w2-AdjRow9-*/tabi-shokunin` (removed):
  `{"c3_adjacency_verified":9,"by_disposition":{"contested-open":2,"ruled":1,"split-declared":2,"refused-route":4}}`,
  kumitate row `verified:true, reasons:[]`; probes `count_agreement:true,
  real_ok:true, probe_rows:9`.
- Counter caveat (observed, not row 9): `measure-c3.mjs:1100` derives
  `ownToken` from `basename(--repo)` after stripping `-shokunin`. The same
  clone named `lane` produced `c3_adjacency_verified:8` and rejected row 0
  (the self-venue `ruled` row) with `ruling_venue`. The `M=9` claim therefore
  holds only when the `--repo` directory is named `tabi-shokunin` (the
  counter's default); a differently named verification sandbox silently
  under-counts rather than refusing.

## Observed — is the disposition honest?

- Overlap is real and substantive, not a passing mention. Kumitate
  `SCORECARD.md:1553-1559` at the pin is the **K-block boundary clause**
  (`FLEET-ADJACENCY-ERRATA-V1` clause A): the registry is “an enumerable
  CENSUS … not exclusive ownership of their domains:
  `plugins/managed/kimi-webbridge` internals route to **tabi**”, the
  `config.toml` REA key to kaidoku, `skills/*` to kotoba, secret-bearing paths
  to kagi; “census membership and `coverage:kimi-layer` = 10 are unchanged”.
  Tabi `PROVINCE.md:6-8` claims the same directory as primary substrate.
- The clause was committed by `ci` in `1a162a4` (2026-10-14 21:27), an
  ancestor of kumitate master. The fleet audit that produced it
  (`.ufo/waves/shokunin12h-20261014-p1-audit/members/FleetDeadPathAudit.md:292-295`
  at fleet master) states: “Tabi owns plugin internals, behavior, and CDP
  discipline (`tabi-shokunin/PROVINCE.md:6-8`). Kumitate holds only the
  package-presence count in K2.” The fleet report
  (`.ufo/reports/shokunin-12h-20261014-fleet-report.md:98-100`, section
  “## Phase 2 — kumitate (landed)”) records the clause “landed per the fleet
  audit”.
- Alternatives fail: `ruled` has no admissible venue — the audit clause lives
  under `.ufo/waves/`, refused by `check-adjacency.mjs:194-195`, and the fleet
  report lines 98-100 do not name kumitate (the checker requires the ruling
  quote to name the sibling). `contested-open` is false — kumitate concedes
  the internals; fleet L0 has 3 `tabi |` rows, none naming kumitate.
  `refused-route` is false — tabi claims, it does not refuse.
- [INFERENCE] The split is two-sided in content (kumitate concedes; tabi owns)
  but the tabi quoted cell states **ownership**, not a division; tabi never
  names kumitate in PROVINCE.md. The fleet audit supplies the explicit
  “Kumitate holds only the package-presence count” half, citing tabi's
  province as the tabi side.

## Issues

1. PLAN §C3 says for `split-declared` “both quotes must state the split”. The
   sibling quote does; the tabi quote states ownership only. The split is
   established jointly (kumitate's clause + tabi's claim + the audit), not by
   the tabi cell.
2. The shipped checker explicitly weakens that criterion: its header
   (`scripts/check-adjacency.mjs:83-87`) reduces “both quotes state the split”
   to “exact verbatim existence”, and `:766-780` only requires the third field
   to appear anywhere in the tabi file. Thus `verified:9` certifies citations,
   not disposition semantics. `w1/AdjSweep2.md:76` (“Both sides state the
   split”) overstates what the tabi cell shows.
3. The disposition under-describes provenance: this is a fleet-audit-imposed
   clause executed into the sibling's SCORECARD by `ci`, not a mutual
   province-level declaration. `split-declared` remains the only citable
   honest choice under the current vocabulary (see `ruled` above), so this is
   not a misclassification — but `-` must not be read as “no third-party
   authority exists”.

Repair (row truthfulness needs none): amend PLAN §C3 and the checker header
to state that a split row's sibling quote carries the division while the tabi
quote need only establish the tabi-side claim — which is what the gate already
enforces; correct `w1/AdjSweep2.md:76` to “sibling states the split; tabi's
province claims the plugin, no kumitate acknowledgment”; alternatively add a
disposition note or new vocabulary member for fleet-audit-imposed splits if the
map is to record that provenance. Optionally make `measure-c3.mjs` refuse a
`--repo` whose basename is not `<lane>-shokunin` instead of silently losing the
self-venue row.

Remaining unknowns: none material for this row. No tools installed or upgraded.
Sandbox `/tmp/tabi-r17w2-AdjRow9-9dRA` removed; no lane, fleet or sibling
repository was written.

Files written: `.ufo/waves/round-17/w2/AdjRow9.md`
