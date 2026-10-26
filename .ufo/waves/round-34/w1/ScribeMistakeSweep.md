# ScribeMistakeSweep — round-34 w1 (frontier): round-33 wave-2 findings with no disposition

**Verdict.** I read all 44 round-33 wave-2 reports and the round-33 lesson in full and tested every finding
against the three disposition oracles the round-33 closure names — the lesson itself, the SCORECARD round-33
block (`SCORECARD.md:1690-1883`, including the wave-2 corrections and the executed disposition), and the
closure spot-check's routed defects 1–7. **32 findings carry no disposition line.** Four sit on the shipped
BiDi gate v2 where the gate's own header, SKILL's superseding registry row or the v2 note states a rule the
code does not enforce: a dash-decorated / upper-case `Measured` cell is admitted as a bare `yes` (the round-32
M2 class, closed only for the parenthesised form F7 pins); an absolute-specifier import of the gate's own
`evaluate` is admitted; the `s1` source-row rule stops a forged registry row only when it is the *sole* new
cite on the entry's `source:` line; and a near-copy of the gate is admitted as the driver. Four more are wrong
numbers or dead pointers left inside the round's evidence documents (lesson M5 "three" vs the receipt's four;
the S128 "(9 words)" for a 7-word quote; the S128 seat-file pointers `:7`/`:50`; and a "five land" count for
four landings), one is a landing the lesson claims but which never happened (CritCorrections D5), and one is a
disagreement between two wave-2 seats about the carried-errata count (20 vs 21, E3's dual marker) that the
round adjudicated from neither side. The pattern behind the gate items is uniform: each round-33 fix pinned one
*construction* (F7 one decoration, F8 one source-line shape, `t1` the relative and re-exported driver) and the
fix's `captured by` column was never re-read against that construction's neighbours — which is why the same
class of defect is open one round later in a different spelling.

Full deliverable: `.ufo/waves/round-34/w1/ScribeMistakeSweep/mistakes.md` (index table, 32 items with class,
evidence pointer, captured-by, oracle-absence, proposed fix and a falsifier each, plus an appendix of every
wave-2 finding I checked and found dispositioned, so the "not dispositioned" claim is bounded).

## Evidence

Lane read at HEAD `59f1b47` (`round-34: freeze claims, counters, controls and receipts before data`), read-only;
no lane file written, no lane script run against its own claim.

### Commands run (receipts: `.ufo/waves/round-34/w1/ScribeMistakeSweep/sweep-receipts.txt`)

```
bash .ufo/waves/round-34/w1/ScribeMistakeSweep/sweep-checks.sh /home/vgpnk/Projects/shokunin/tabi-shokunin
# exit 0; section 1 = per-keyword counts and grep exit codes over the three oracles,
#            section 2 = independent re-derivations
```

Decisive absence checks (section 1 of the receipt — count over lesson / SCORECARD 1690-1883 / spot-check):

```
absolute specifier import          0(exit 1)  0(exit 1)  0(exit 1)
resolvesToGate                     0(exit 1)  0(exit 1)  0(exit 1)
mkdtemp / XDG_RUNTIME_DIR          0(exit 1)  0(exit 1)  0(exit 1)
RerunLiveV2 (whole seat)           0(exit 1)  0(exit 1)  0(exit 1)
first-witness / witness loop       0(exit 1)  0(exit 1)  0(exit 1)
H2 session provenance mismatch     0(exit 1)  0(exit 1)  0(exit 1)
FIXTURE preimage overclaim         0(exit 1)  0(exit 1)  0(exit 1)
criterion 87 >=20 non-space        0(exit 1)  0(exit 1)  0(exit 1)
criterion 88 one-directional       0(exit 1)  0(exit 1)  0(exit 1)
S-KILL 1/2                         0(exit 1)  0(exit 1)  0(exit 1)
MutC1Rows m1b/m4b/m13              0(exit 1)  0(exit 1)  0(exit 1)
tag-pinned row rule                0(exit 1)  0(exit 1)  0(exit 1)
RevQuality87 / RevLesson33 seats   0(exit 1)  0(exit 1)  0(exit 1)
carried count 21 vs 20             0(exit 1)  0(exit 1)  0(exit 1)
CritC1Counter D3 re-filing         0(exit 1)  0(exit 1)  0(exit 1)
decorated yes / dash tail          2(exit 0)  0(exit 1)  0(exit 1)   ← class named (M2), shape not
```

Re-derivations (section 2 of the receipt, exit 0 each):

```
MEASURED parse: "yes"=measured:yes "yes (live)"=unmeasured "yes — live"=measured:yes "YES"=measured:yes
lesson S128 word claim: (9 words)                     ← the claim, at corpus/lessons/round-33.md:36
row-S128.md:7  -> "file also … must not be copied into the registry"   (the row is :10)
row-S128.md:50 -> 1 byte (blank)                      (the Gate row is :53)
lesson M5 claim: three `refused-route` rows           ← corpus/lessons/round-33.md:170
D.json newMappedRows: 4 refused-route,refused-route,refused-route,refused-route
README:766 -> "| `adjacency-screen.tsv` … | Every b…"  ← corpus/README.md:766
declaration line 2887 qualifier: 1 hit "loopback or operator-approved only"
SKILL standing scope 683: "- **Scope:** observation + operator-approved interaction only; never c…"
E3 markers: corrected_here=1 carried=1                 ← .ufo/waves/round-31/a2w1/ScribeErrata/errata.md
```

### Code evidence (bytes read at HEAD; runtime behaviour is inferred where marked)

| item | file:line at HEAD | what the bytes say |
|---|---|---|
| U01 | `scripts/check-bidi-runtime.mjs:149,368-375,860` | `/^(yes|no)(?:\s*[—–-]\s*\S[\s\S]*)?$/i`; verdict lower-cased; admission `verdict === "yes"` |
| U02 | `scripts/check-bidi-runtime.mjs:432-437` | `if (spec.startsWith("/")) return false;` — absolute specifiers never resolve to the gate |
| U03 | `scripts/check-bidi-runtime.mjs:742-753` | `for (const id of newRows) { … witness = …; break; }` then `if (!witness)` |
| U04 | `scripts/check-adjacency.mjs:918-921` | `if (!line.text.includes(sibling)) add(REASON.l0LineAbsent, …)` |
| U05 | `scripts/check-bidi-runtime.mjs:582,592,814,852` | `mkdtempSync(join(runtime, "tabi-bidi-"))` outside the try/finally; non-`Refusal` throw swallowed into `liveError` |
| U22/U23 | `scripts/check-bidi-runtime.mjs:774-777` | `sha256(drv) === sha256(gateBuf)` → "driver is a byte copy of this gate" |
| U30 | `scripts/check-bidi-runtime.mjs:601` | `env: { ...process.env, TMPDIR: …, HOME: …, XDG_… }` |

Round-33 reports and line pointers are cited per item in `mistakes.md` §2 (e.g. `w2/RevGateV2Code.md:9` L1,
`:12` L2, `w2/CritForgeV2C.md:42` D1, `w2/MutC1Rows.md:61` m4b, `w2/RerunLiveV2.md:83`/`:109`,
`w2/ConnW2.md:85-86`, `w2/RevQuality87.md:120-160`, `w2/RevLesson33.md:52-55`).

## Deliverables (relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`)

- `.ufo/waves/round-34/w1/ScribeMistakeSweep.md` — this report.
- `.ufo/waves/round-34/w1/ScribeMistakeSweep/mistakes.md` — the deliverable: index + 32 items + dispositioned
  appendix + commands + limits.
- `.ufo/waves/round-34/w1/ScribeMistakeSweep/sweep-checks.sh` — the sweep script (rerunnable).
- `.ufo/waves/round-34/w1/ScribeMistakeSweep/sweep-receipts.txt` — its output, both sections, exit codes.

## Limits

- No frozen counter was re-run: this is a document-and-code sweep; every "red state" is the seat's own recorded
  run unless the receipt marks it `[run]`.
- **Two gate copies, two numberings.** The w2 seats measured `042d6d9`'s gate, sha256 `62453b55…`; the shipped
  gate at HEAD `59f1b47` is `eded1be0…`, and its only delta is the M8 live-leg redirect (`:596-605`). Every
  code pointer in `mistakes.md` is re-verified against HEAD, so U01–U03, U05, U22, U23 and U28 hold on the
  shipped bytes. Where a seat's own pointer does not resolve in its copy (RevGateV2Code's `:76-77` for the
  `Measured` rule), the item says so and gives the resolving line.
- U01 and U03's parse half are observed (`node -e`, `require` of the frozen JSON) and U01's admission half is
  the seat's recorded probe (P1/P2); items U02, U05, U22, U23, U30 are code reads only.
- Severity is the seat's own except where two seats disagree; I did not re-grade the round.
- Zero findings were repaired: this seat attacks nothing and edits no lane file.

## Hygiene

- Wrote only `.ufo/waves/round-34/w1/ScribeMistakeSweep*` (four files); nothing at the fleet root, no lane
  tracked file, no lane index or jj state, no sibling repo, no `~/.local/bin`.
- No clone, no commits, no git/jj mutation, no browser, no network fetch, no tool installed.
- Scratch `/fast/scratch/hyaku/tabi-r34/ScribeMistakeSweep` created and removed before yield (no receipts were
  kept there; the two artifacts live in the output dir).
