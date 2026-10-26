# AdjKaidoku — round 33 w1, C1 build (kaidoku lane slice)

**Verdict.** The kaidoku lane's only unmapped C1 candidate, `kaidoku-shokunin@8b9634ed8253653e7eb994aad9860a624e3b0366:PROVINCE.md:137`, is a restatement of the runtime-observation surface already mapped for kaidoku at `:53` (`cdp-runtime-observation`, disposition `ruled`), so it is screened `same-surface` in a new `corpus/adjacency-screen.tsv`; its distinct half (`node --inspect` on a non-browser V8 target) is not a surface tabi practises, so no map row is honest. My validation commit `9163092f31f9cd4a1f82e5ebeaef40a36e3c8a2d` (scratch clone, screen file only) passes the adjacency gate clean (10 rows / 10 verified) and the frozen C1 counter now reports the candidate accounted — candidates 52, mapped 5, screened 1, unaccounted 46 (was 47), newMapped 0, `screenFindings: []`, predicate false. This seat contributes accounting for the kaidoku lane, **not** new map rows: the fleet predicate's `newMapped >= 4` and the remaining 46 candidates belong to the kake/kagi/kengaku/kotoba/tsukuroi seats; no non-overlap was mapped and no surface was split to feed the counter.

## Evidence

Baseline and setup (read-only on the lane and siblings; writes only in `$S`):

| command | exit | result |
|---|---|---|
| `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`; `git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea` | 0 | `rev-parse HEAD` = `e6b0a907…`; `rev-parse --show-toplevel` == `$S/clone`; `corpus/adjacency-screen.tsv` absent at baseline (`git ls-files corpus/adjacency.tsv corpus/adjacency-screen.tsv` → map only) |
| `node scripts/check-adjacency.mjs --at e6b0a907… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` | 0 | `verdict:"clean"`, `rows:10`, `verified:10`, `findings:0` — establishes the existing `cdp-runtime-observation` row (kaidoku) as verified, which a `same-surface` screen must name |

Candidate text and quote (frozen pin `8b9634ed8253653e7eb994aad9860a624e3b0366`):

```
$ git -C /home/vgpnk/Projects/shokunin/kaidoku-shokunin show 8b9634ed…:PROVINCE.md | sed -n 137p | grep -F 'self-launched CDP/V8-inspector targets (r3 recipe)'
| Runtime observation verbs | self-launched CDP/V8-inspector targets (r3 recipe); `node --inspect` needs a real file target (bare `file://` → `unsupported_location`) | `observe-web-session`, `observe-web-execution`, `observe-javascript-runtime`, `reconcile-javascript-runtime` | all held r4-08; `capture-electron-scenario` remains typed refusal (Playwright handshake, not app launch) |
exit=0     # words=5, non-space chars=46
```

`kaidoku :53` provenance: the candidate line at the frozen pin `8b9634ed…` and the line the map row cites (`kaidoku-shokunin@9011581d…:PROVINCE.md:53`) are byte-identical ("Runtime observation (CDP) | self-launched targets: `chromium --headless --remote-debugging-port=9222`…"), so the baseline counter's `mapped: 5` includes it — the pin difference does not change the cited text.

Screen row as committed (`corpus/adjacency-screen.tsv`, sha256 `5cb119b4d7a1f79899054ca2ced20f222a83e167c7528cd0bfc9a22f615a5a76`, 2 lines):

```
sibling_ref	reason	surface	quote	note
kaidoku-shokunin@8b9634ed8253653e7eb994aad9860a624e3b0366:PROVINCE.md:137	same-surface	cdp-runtime-observation	self-launched CDP/V8-inspector targets (r3 recipe)	Restates the runtime-observation surface already dispositioned ruled on the kaidoku :53 row (cdp-runtime-observation); the node --inspect half is not tabi browser ground.
```

Validation commit and gates (all in `$S/clone`, `-c user.name=AdjKaidoku -c user.email=AdjKaidoku@scratch.local`, toplevel asserted == `$S/clone`):

| command | exit | result |
|---|---|---|
| `git -C "$S/clone" commit` → `9163092f31f9cd4a1f82e5ebeaef40a36e3c8a2d` | 0 | 1 file changed, 2 insertions (`corpus/adjacency-screen.tsv`) |
| `node scripts/check-adjacency.mjs --at 9163092f… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` | **0** | `verdict:"clean"`, `rows:10`, `verified:10`, `selfRulings:[2]`, no findings |
| `node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev 9163092f… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` | **1** | `candidates:52 mapped:5 screened:1 unaccounted:46 newMapped:0 screenFindings:[] predicate:false`; `kaidoku:137` absent from `unaccountedKeys`; baseline J1 receipt for comparison: `mapped:5 screened:0 unaccounted:47 newMapped:0` (exit 1) |

Exit 1 is the counter's documented "evaluated, predicate not met" class; it is not a row failure — `screenFindings` is empty, i.e. the frozen counter itself accepted the ref/reason/surface/quote. Current `unaccounted` composition (computed from `unaccountedKeys`): kake 40, kagi 3, kengaku 1, kotoba 1, tsukuroi 1 = 46; kaidoku 0.

Two controls, run as throwaway commits and then `git reset --hard` back to `9163092` (working tree re-verified clean; `adjacency-screen.tsv` sha unchanged):

- **E1 — map `:137` under the existing surface** (`1d91f32f02617f0fff31654c000eb37cdf634501`): gate **exit 1**, `verdict:"failed"`, `rows:11`, `verified:10`, finding `{"row":12,"reason":"duplicate_row","detail":"surface=cdp-runtime-observation sibling=kaidoku pin=kaidoku@PROVINCE.md:137 first_row=2"}`. A map row for this line under the already-mapped surface is refused by the gate by construction.
- **E2 — mint a surface name for the same line** (`javascript-runtime-observation`, `92640aa8ac7b78de2a85d4742b5cbcd19e2a9d64`): gate **exit 0** clean (11/11) and counter `newMapped:1` (row 12). This is the precision hazard, not a finding I acted on: the line's distinct content is `node --inspect` on a non-browser V8 target, which is not among tabi's surfaces (PROVINCE.md:9-10, "CDP session discipline (endpoints, targets, screenshot/DOM evidence capture)"; tabi's runtime-observation practice is browser-side, SKILL.md:2480), so mapping it would have been mapping a non-overlap. Refused.

Tabi side cited for the judgement: `PROVINCE.md:9-10` (owns CDP session discipline: endpoints, targets, screenshot/DOM evidence capture; browser-facing craft at `:3-4`), `SKILL.md:2480` (held browser bfcache runtime observation), and the existing row's ruling `corpus/lessons/round-16-verifier-spotcheck.md:142` — "**kaidoku** keeps CDP only as an REA provider surface for shipped-artifact analysis" — which already names kaidoku for this surface.

No browser was launched: `pgrep -fa 'chromedriver|chromium'` returned only `1371 /usr/bin/earlyoom -r 3600 … --prefer (^|/)(java|node|chromium|python3?)$` (ppid 1, host daemon whose preference regex contains the word), no chromedriver and no chromium owned by this seat. No tool was installed or upgraded. Scratch `/fast/scratch/hyaku/tabi-r33/AdjKaidoku` removed after receipts were copied.

## Touched surfaces

- Ledger: new `corpus/adjacency-screen.tsv` row only; **no** `corpus/adjacency.tsv` row (delivered `rows.tsv` is empty on purpose — 0 map rows for this slice).
- Surface names: none new. `cdp-runtime-observation` reused only as a screen reference to the existing verified kaidoku row.
- No lane tracked file, lane index, jj state, fleet repo, sibling repo or `shokuknow` was written; the lane was read-only (`git show` only); the single commit lives in the scratch clone.

## Out of scope / not done here

- kake (40 unaccounted candidates), kagi (3), kengaku (1), kotoba (1), tsukuroi (1) — sibling seats; no drafts attempted, no surface names coined.
- C2 BiDi gate work, SOURCES/QUALITY/lesson edits, assimilation (claims.json `notClaimed`).
- The fleet C1 predicate is **not** met at my commit (`unaccounted=46`, `newMapped=0`); that is the seat-slice scope, not a defect claimed as passing.

## Findings for the L1

1. `kaidoku:137` and `:53` are one surface; the map cannot take a second kaidoku row on `cdp-runtime-observation` (E1 `duplicate_row`, `first_row=2`). Expect the same for any sibling line that restates an already-mapped surface.
2. The `newMapped` axis is surface-name-based, so minting a second name for an already-mapped surface is admitted by both the gate and the counter (E2: clean + `newMapped:1`). Round-33's `>= 4` target should be read as four *distinct real* overlaps, not four fresh strings; this seat's control is the only evidence I produced for that hazard.
3. Screening a restatement requires the referenced surface to be verified for that sibling; if a later wave drops or renames the kaidoku `cdp-runtime-observation` row, my screen row fails `screen-surface-unmapped` and `:137` returns to `unaccounted`.

## Artifacts

- `.ufo/waves/round-33/w1/AdjKaidoku.md` (this report)
- `.ufo/waves/round-33/w1/AdjKaidoku/rows.tsv` (0 rows; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`)
- `.ufo/waves/round-33/w1/AdjKaidoku/screen.tsv` (header + 1 row; sha256 `5cb119b4d7a1f79899054ca2ced20f222a83e167c7528cd0bfc9a22f615a5a76`)
- `.ufo/waves/round-33/w1/AdjKaidoku/candidates.md` (per-candidate table: key | decision | reason)
- `.ufo/waves/round-33/w1/AdjKaidoku/gate-9163092.json`, `counter-9163092.json`, `counter-baseline-b7d16fb.json`
- `.ufo/waves/round-33/w1/AdjKaidoku/control-E1-duplicate-surface-gate.json`, `control-E2-minted-surface-gate.json`, `control-E2-minted-surface-counter.json`
- `.ufo/waves/round-33/w1/AdjKaidoku/quote-check.txt`, `commands.txt`
