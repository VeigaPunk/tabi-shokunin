# R61Critic — falsification report, tabi round 61 wave w1

Role: attack seat (critic). Scope: P1–P5 against the two frozen claims. I build nothing and fix
nothing; every statement is a command exit or a `path:line`.

Findings in full: `.ufo/waves/round-61/w1/R61Critic/critique.md` (final-state addendum included).
Receipts: `w1/R61Critic/receipts/`; forgeries: `w1/R61Critic/forgeries/` and `forgeries/final/`.

The bytes moved throughout the review. Trajectory: snapshot `8b175b27…` → `c4159978…` (header only);
v20 `9471026a…` → `b76d972e…` → `24c4cd45…`; r61 counter `222bbdd5…` → `f615a2f9…` → `ac5ce54b…` →
`97f10e67…`; runner `ed712fb8…` → `f33f0ab7…`; fixture base `7839c0a6…`. The nonce-shape rule moved
12→16 hex across those counter shas. Findings name the sha they were measured on; the closing section
gives the final read.

## Bottom line

- **C1 was false at its frozen control bytes.** At freeze the pinned `snapshot-r61.tsv` had header
  `lane<TAB>`; the "unchanged r60" wide-screen counter C1(d) names requires `lane<TAB>head` and exits
  **2**. With that one field corrected (same 20 heads) it exits **0, predicate true**, 85,775/85,775
  `.md` screened, roster 20, rowMismatch 0. The lane then applied that exact correction mid-wave
  (file byte-identical to this seat's probe, `c4159978…`) with **no declared pre-data correction** —
  and at final read (20:22:48) it was back to the frozen malformed bytes `8b175b27…`, with the wide
  counter exiting 2 again. `claims.json` still pins `8b175b27…` and still records
  `preDataCorrections: []`; the control oscillated and no rule binds its bytes.
- **C1 is blocked on its ledger clause.** The rebind exits **3**: 110 browser-ground hit lines have no
  disposition in a vocabulary the claims never name; it writes no ledger, and the v20 smoke then exits
  2 on the missing audit ledger. The data pass has no declared way to produce C1(a)'s ledgers.
- **C1's wide-screen clause is thin even when green**: it depends on nothing in v20 — the unchanged
  r60 instrument plus the same 20 heads greens it today, before any data pass.
- **C2's after-state is still not at the path the claim names**: `corpus/evidence/round61/` does not
  exist. A fresh runner smoke does exist as the fixture base (`7839c0a6…`, real bytes from
  `f33f0ab7…`) and it **greens** the counter (exit 0, findings [], cne []).
- **The instrument is green at final read**: counter `97f10e67`, `--selftest` **129/129, allPass true,
  idCoverage 68/68**, base receipt green. (It was red mid-migration at `ac5ce54b`: 110/129, green case
  failing `png-missing` — CR-C2-9.)
- **Three forgeries outside F green the counter at the final, fully green instrument** (real base
  `7839c0a6…`, counter `97f10e67`): consistent double press **exit 0, findings []**; secondary
  `button=2` across the press **exit 0, findings []**; `pointermove.pointerId=99` against press id 1
  **exit 0, findings []**. The three classes the seat named (dup down only, pen on one entry,
  reordered) are all refused.
- **C2 `f4` (cross-refusal) is vacuous**: the unchanged r60 counter greens a byte-identical r59 receipt
  carrying an added `pointerlog` (exit 0, findings []) and reds on `schema-wrong` or
  `driver-sha-mismatch` alone. It fires on every possible r61 receipt and evidences nothing about the
  pointer domain; Exec3 says the same ("schema-class cross-refusal only").
- **`--shot` self-documentation contradicts the CLI**: `:2670-2674` still calls it a no-op while
  `:2693-2696` collects positional files as overrides, and the frozen command passes a *directory*
  whose resolution I measured only at `ac5ce54b` (`png-missing`).

## Pins (sha256)

| object | sha256 |
|---|---|
| claims.json | `d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e` |
| c1/snapshot-r61.tsv | `8b175b27…` (freeze) → `c41599788d7a917d6a6760842c19202d36e7c9229e51ae292eb1f22282aa6a7c` (mid-wave) → `8b175b27…` (20:22:48, final read) |
| snapshot header-fix probe | `c4159978…` (byte-identical to the rewritten lane file) |
| counters/c1-adjacency-host-v20.mjs | `9471026a…` → `b76d972e…` → `24c4cd4573ee9f1e507708f5cca96597683ca7add47da04b185867ec14ca9094` |
| counters/rebind-r61.mjs | `20acefdaa795273d60ced94dc100546c7d4cfc7f798069700f501c96057c2e5d` |
| counters/chromium-receipt-r61.mjs | `222bbdd5…` → `f615a2f9…` → `ac5ce54b…` → `97f10e67c4ac1548179c4045373aae9d97ea2ae6a6245ffd7f04e88fdd233625` |
| fixtures synthetic base | `6dd8c3e206fcabe263c7de548993f679ef4a34e8c3a8aa56af7136a6a9689da2` |
| fixtures real runner-smoke base | `7839c0a65ac4bea9fa328c5e4ade92645ebfd3810eb803b46bd50061df9f4f22` |
| scripts/chrome-cdp-loopback-round61.mjs | `ed712fb8…` → `f33f0ab72eec4f13519cd67a0768c5f743a7b14248c68bdc1bc9f639352a4e76` |
| Exec2 smoke receipt (stale, superseded) | `3ad62723cf7e16b9bd6bbefa8a9f3c00e41d36b61413c4c85c834c8441088e0b` |
| Exec2 probe receipt | `a51698b494581f8f6814bcc901ec02d6fcd51060814cf1eed498d9b4cd08ce5b` |
| r60 wide-screen counter | `ba7ebc9ab65661523db30fa06f889dd393efc99627ace0382369decaabd85920` |
| r60 chromium counter | `b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae` |

## P-series

- **P1** — at freeze the r60 wide counter over snapshot-r61 exits 2 (header); after the correction it
  exits 0 with every count green (85,775 = 85,775, roster 20). C1(d) is thin and independent of v20.
- **P2** — forgeries from `6dd8c3e2…`, confirmed at the final instrument on the real base `7839c0a6…`:
  dup-down-only **red**; consistent double press **green**; pen-on-one/pen-on-release **red**;
  reordered **red**; `button=2` **green**; `pointerId=99` **green**. The live receipt did not exist —
  disclosed gap.
- **P3** — four counter shas observed; swept at each (126/126 at the two middle shas; 129/129 at the
  final; 110/129 mid-migration). No intermediate-byte green; the admissible receipt shape changed
  mid-wave (12→16 hex).
- **P4** — surviving mutations: C1 — require the snapshot header exactly `head` (42/42 selftest green,
  measured on a scratch copy), and the rebind's unresolved refusal (no frozen mutant covers the rebind);
  C2 — drop the button-value / stream-identity checks (frozen cases stay green; the greened forgeries
  prove it).
- **P5** — clause table in `critique.md`: C1 (a) and (d) **unimplementable as written**; "every v19
  case", "moved past" **ambiguous**; C2's recorder-acceptance clause **U** against `ed712fb8`, **I**
  against `f33f0ab7`; teardown closure and the shot-directory shape **unimplementable**.

## Defects found

1. Snapshot header grammar mismatch; pinned sha bound by no predicate or kill rule; control rewritten
   mid-wave without a declared correction (CR-C1-1/3/8).
2. Rebind's 110-line refusal against an unfrozen disposition vocabulary (CR-C1-2/7).
3. C1 do-nothing control contradicts (d); `rowMismatch > 0` unreachable without `--verify-rows`
   (CR-C1-4).
4. v20 selftest hardcodes `/fast/scratch/hyaku/tabi-r61/R61Exec1` (`:390`) — not hermetic (CR-C1-5).
5. Census control says "163 rows"; the file has 23 lines (CR-C1-6).
6. Runner/counter contract diverged then converged; retained smoke receipt stale; claim's receipt path
   empty (CR-C2-1/8).
7. Runner nonce grammar wider than the counter's; counter rule moved 12→16 hex mid-wave (CR-C2-2/6).
8. F incomplete: three green classes outside it; `f1` scoped to F only (CR-C2-3).
9. `f4` cannot fail for the reason it states (CR-C2-4).
10. Teardown closure (ports, curl exit 7) in the claim, not in the predicate (CR-C2-5).
11. `--shot` docs contradict the CLI; the frozen command passes a directory (CR-C2-9).

## Command ledger (exits)

r60 wide over the frozen snapshot **2**; over the header-fix probe **0**; over the rewritten lane file
**0** (85,775/85,775). v20 `--selftest` **0** (42/42, at `9471026a`); mutated v20 copy `--selftest`
**0** (42/42). Counter `--selftest` **0** (126/126) at `222bbdd5` and `f615a2f9`; **1** (110/129) at
`ac5ce54b`; **0** (129/129, 68/68) at `97f10e67`. Counter on synthetic green **0**; forgeries
**1/0/1/1/0/0**; on the real base **0**; final-state forgeries **0/0/0**. On Exec2 smoke **1**
(18 findings + `driver-sha-mismatch` under the current driver); on Exec2 probe **1** (21 findings).
r60 counter on r59-green+`pointerlog` **0**; schema rename **1**; wrong driver pin **1**.

## Deviations / gaps

No Chromium launch, no port, no delivery verification, no closure proof. The live
`corpus/evidence/round61/` receipt did not exist. Instrument bytes were moving throughout (four
counter shas): final-state forgery verdicts are reported against the newest green instrument
(`97f10e67`) and the real base (`7839c0a6…`). I did not launch the runner, did not re-measure the v19
before-command, and could not derive r60's "110 cases" from a retained artifact. No tool installs, no
git/jj mutations, no writes outside `w1/R61Critic/**` and scratch
(`/fast/scratch/hyaku/tabi-r61/R61Critic`, removed after receipts were copied here).
