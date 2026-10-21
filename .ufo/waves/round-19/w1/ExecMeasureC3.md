# ExecMeasureC3 — C3 calibration counter

**Verdict:** implemented in the isolated clone. The calibration counter emits `{c3_routed_closed, d1, d2, d3, d4}`, each defect result carrying `pass` and `reason`. Normal measurements are read from Git blobs at the supplied revision; the only pinned second revision is B for the explicitly required round-17/18 predicate comparison.

## Behavior

- **d1:** requires a round-19 LOG line containing `LOG.md:1059` and `QUALITY 33–39`; it independently parses numbered QUALITY criteria, counts criteria 33–39 citing `round-18.md`, and requires each number exactly once (seven total).
- **d2:** reads both frozen harness blobs at B, associates each `await withCase` / `await withControl` block's `id` with its own `predicate`, and re-derives six changes: five message-substring predicates plus `invoke-domain-disabled`'s nonempty-message check. It requires one round-19 `SCORECARD.md:830` line with “IDs and pass status retained,” “6 of 15 checks dropped numeric CDP codes,” the exact five-ID substring list, and the separate nonempty-message exception.
- **d3:** enumerates committed round-19 registry and record files. Each registry must have a nonempty `wave` equal to its sibling spec; every member in each registry and record must have a nonempty string `agentId`. The correction note must name both round-18 `record.json` files and both `swarm-registry.json` files, plus the dispatch/run cause.
- **d4:** reads the checker and ledger blobs at REV, requires valid nonempty entries, porcelain-v1 lane snapshots, and `trackedDiffEmpty:true`, then executes the checker in a temporary matching path under `/tmp`. It requires exit 0, result schema `tabi-r19-isolation-check-v1`, clean verdict, matching entry count, and empty findings/errors.
- `--self-test` exercises positive and negative d1–d4 cases, including the isolated checker runner with synthetic clean/failing checker blobs, and writes the required receipt. No tool was installed or updated.

## Retained evidence

### Probes

- `node /fast/scratch/tabi-r19/ExecMeasureC3-4/.ufo/waves/round-19/measure-c3.mjs --self-test` → `C3_SELFTEST verdict=clean cases=24 failed=0` (exit 0). Receipt: `corpus/evidence/round-19/selftests/c3.json`; producer SHA-256 `edb0ab9b942295a7cb34dba0973d81d88251517a07aec19447bca1f424d722ba`; stdout SHA-256 `e38fe8985d82e484b44fe7e5a6a96cab5d377ce4ffb0ec0cdd836ba49b528d26`; receipt body SHA-256 `c9811984f85407beb89bc485c3c9df0d49cdacc13c44f3c4e949580cd766cec3`.
- At B (`66251bfc1aef393e4aec599e950a8deb867736bb`), normal mode emitted `c3_routed_closed:false`; d1 `correction_line_missing`; d2 `correction_line_missing_or_ambiguous;listed_ids_do_not_match_derived_ids;substring_ids_do_not_match_derived_ids;derived_ids=invoke-unknown-tool,invoke-after-unregister,invoke-flags-off-control,invoke-iframe-frameid,invoke-before-enable,invoke-domain-disabled;message_substring_ids=invoke-unknown-tool,invoke-after-unregister,invoke-flags-off-control,invoke-iframe-frameid,invoke-before-enable;message_nonempty=invoke-domain-disabled`; d3 `no_round19_registries;no_round19_records;r18_registry_correction_incomplete`; d4 `checker_missing_at_revision`. Exit 1, as expected for B→0. No integrated round-19 revision was available to measure.

### Source anchors

All source URLs below are local `file:///` URLs, accessed 2026-10-21; SHA-256 is over the decoded file body. No external URLs were opened.

| Anchor | Exact quote (≤25 words) | URL | SHA-256 |
|---|---|---|---|
| `LOG.md:1059` at B | “QUALITY33–38 arise from the lesson's mistake rows.” | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/LOG.md` | `b2d5ff556dadd741c7542883af29f83d74158eadee5ad1bae652796a5c4c648f` |
| `corpus/QUALITY.md:140-165` at B | “A prose count carries its counting command against the named revision” | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/QUALITY.md` | `4be2546540f1c4e4a2d0939d7e563ed58f6f0494d2087932d57fb64d0eacf524` |
| `SCORECARD.md:830` at B | “original11 scenarios/four controls retained” | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/SCORECARD.md` | `afd3502f938d9dbb1ef7bfdb4312783d25c673bcd1d3457295b2900921be0d68` |
| `ScoutAssertionDelta.md:5,25,28` | “six round-17 predicates asserted a numeric CDP error code” | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/ScoutAssertionDelta.md` | `7913ec3561443c8d0c441d1c0d19d296754698ceb05a8c535815137ec504d70a` |
| `scripts/webmcp-invoke-round17.mjs:1177` at B | `o.invoke.error.code === -32602` | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round17.mjs` | `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` |
| `scripts/webmcp-invoke-round18.mjs:1975` at B | `/Tool not found/i.test(o.invoke.error.message)` | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs` | `d1443344c745a3e60417e19edf3d173054e085b912fa0ba1b58943d407896baa` |
| `.ufo/waves/round-18/w1/swarm-registry.json:3` at B | `"wave": null,` | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/swarm-registry.json` | `30461ac06689f08cf9e7041bee0cbf394bcd0222025b2aa38b744d7e722671ee` |
| `.ufo/waves/round-18/w2/swarm-registry.json:3` at B | `"wave": null,` | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/swarm-registry.json` | `48ad1fe01a60beba1a8fd4106124cf2a57381f8d547acc4852d766e3c60672e1` |
| `.ufo/waves/round-18/w1/record.json:4` at B | `"wave": null,` | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/record.json` | `7ca7d53f3d38d4b2df4a9b4256947a3f359ee6b07f2d77d2dc61121dc396a3be` |
| `.ufo/waves/round-18/w2/record.json:4` at B | `"wave": null,` | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/record.json` | `42147a2af424611e4406f532386acd4c0f674ff2d5d849c5426a363af18bf881` |

## Risks and blockers

- d2 reports five substring IDs separately from the one nonempty-message ID; `invoke-domain-disabled` is not described as a substring assertion.
- B contains no committed round-19 registry/record/correction note or isolation ledger, so d3 and d4 remain red at B. The real checker run against an integrated ledger remains unobserved; its wrapper's clean/failing behavior is covered by the self-test.

## Isolation

- Clone: `/fast/scratch/tabi-r19/ExecMeasureC3-4`
- Branch: `r19/ExecMeasureC3-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- L1 integration base: `12d1d95905400e611c4aa4188da6b768a3bf9efb` (current lane bytes were copied; they matched the prior counter/receipt bytes, so this is an empty tree marker).
- Commit: `1a7507e76e2d5848f1a3a3dde34776a95a11b932`
- Changed paths:
  - `.ufo/waves/round-19/measure-c3.mjs`
  - `corpus/evidence/round-19/selftests/c3.json`
