VERDICT: PASS

## Deliverable
`node .ufo/waves/round-17/measure-c3.mjs [--repo <dir>] [--fleet-root <dir>] [REV]` → one JSON line
`{"c3_adjacency_verified":N,"c3_self_ruled":N,"c3_self_filed_questions":N,"by_disposition":{...},"rows":[...],"probes":{...}}`.
sha256 `372c9658df761f3a640ded2b69b575f1167330bc362df8a63396977c40f66bc1` (`sha256sum`, 1396 lines).
Reads `corpus/adjacency.tsv` and `scripts/check-adjacency.mjs` as blobs at REV via `git cat-file blob`;
re-verifies every row itself (sibling quote on the pinned line, tabi quote on its pinned line at REV,
ruling quote on its pinned line, contested-open → fleet l0 line names `tabi |` and the sibling lane);
counts rows with zero findings. Minimal Git env (`-c core.fsmonitor=false -c core.quotepath=false
-c core.commitGraph=false`), argv-only spawns, no shell.

## Baseline (acceptance)
`node .ufo/waves/round-17/measure-c3.mjs --repo . 5859243183c4d7ac5429dfdb8a73ce0d9a43d583`
→ `c3_adjacency_verified:0`, `probes.tsv.present:false`, `absent_reason:"absent"`,
`probes.checker.present:false`, `status:"checker_absent"` — verbatim: the map and the checker
do not exist at the baseline, nothing is verified, no fabrication.

## Positive path (acceptance)
Synthetic one-row map = real row 0 verbatim (`cdp-runtime-observation / kaidoku / ruled`, self-venue
ruling `tabi-shokunin@5859243:corpus/lessons/round-16-verifier-spotcheck.md:142`, last author
`protocol-shokunin`, ancestor of eval, line byte-identical) committed at
`/tmp/tabi-r17-C3Counter-pos` rev `b534c665ee8e34b8d372b91244317822517cdf31` on top of baseline +
the repaired checker:
`measure-c3.mjs --repo /tmp/tabi-r17-C3Counter-pos --fleet-root /home/vgpnk/Projects/shokunin b534c66...`
→ `verified:1`, `self_ruled:1`, `real_ok:true`, `exit:0`, `base_ok:true`, `count_agreement:true`,
`lane_name_independence.ok:true`, `lane_tip_symref.refused:true` (`lane_tip_unresolved`),
10/10 constructible mutations red (`sibling_line_reuse` `applied:false` — needs ≥2 rows). Sandbox kept
as cited evidence.

## Live measure (lane tip 6c97851)
`measure-c3.mjs --repo .` → `verified:9`, `self_ruled:1`, `self_filed:2`,
`by_disposition {contested-open:2, ruled:1, split-declared:2, refused-route:4}`,
checker `status:ran`, `real_ok:true exit:0`, `base_ok:true`, `agree:true`.

## Wave-2 repairs mirrored (L1 steer: "counter mirrors the repaired checker")
The worktree `scripts/check-adjacency.mjs` carries repairs not yet committed; the counter mirrors them:
- `GIT_PREFIX` += `core.commitGraph=false` (matches checker GIT_LITERAL_PATHSPECS hardening).
- `laneTip` = `symbolic-ref -q --no-recurse HEAD` → refs/heads/ name → `resolveLadderTip`; detached or
  symref HEAD → `lane_tip_unresolved`. `siblingTip` = `resolveLadderTip` over `master`→`main` (real tip).
- `sibling_ref` refuses `.ufo/` paths (`sibling_ref_invalid`); `surface` refuses non-`[a-z0-9-]`
  (`surface_charset`, Greek-omicron homoglyph); `ruled` refuses `.ufo/` venues and permits self-venue
  spotchecks via `selfVenueReason` (non-tabi author + ancestor-of-rev + line byte-identical).
- Ruling reasons renamed to the checker's vocabulary: `ruling_ref_invalid` (venue/parse),
  `ruling_quote_absent` (quote not on pinned line / `ruled` quote not naming the sibling),
  `ruling_unresolved`, `l0_line_absent`.
- Duplicate detection: folded `surface\0sibling` AND commit-independent pin `<lane>@<path>:<line>`;
  non-9-column rows skip bookkeeping, exactly as the checker.
- New output fields `c3_self_ruled`, `c3_self_filed_questions`; row field `sibling_pin`.
- New probes: `lane_name_independence` (counter rerun inside the `S`-named clone re-counts identically),
  `lane_tip_symref` (HEAD → symref branch → `lane_tip_unresolved`). New mutation specs:
  `sibling_line_reuse`, `non_ascii_surface`, `ruled_l0_venue`, `sibling_ufo_path`.
- `duplicate_surface` `target_row` corrected to the appended row index.

## Probe result vs REV blob checker
At lane tip `6c97851` the committed checker blob predates the repair (repairs are worktree-only).
Counter probes therefore report `checker_ok:false` on exactly the three new-rule mutations
(`sibling_line_reuse`, `non_ascii_surface`, `ruled_l0_venue`); all other mutations exit 1.
I verified the repaired worktree checker against each in `/tmp/tabi-r17-C3Counter-mutc`:
`sibling_line_reuse` rev `109a853` → exit 1 `duplicate_row`; `non_ascii_surface` rev `9563d09` →
exit 1 `surface_charset` (U+03BF); `ruled_l0_venue` rev `52e0169` → exit 1 `ruling_ref_invalid`.
Reason names match the counter's one-for-one. Once the repair is committed these probes go green;
the counter reports the REV blob truthfully, not the worktree.

## Tooling
None installed. `npx -y rea-agents` not needed (no REA calls). Node v24.21.0 / git already present.

Files written: `.ufo/waves/round-17/measure-c3.mjs`, `.ufo/waves/round-17/w1/C3Counter.md`
