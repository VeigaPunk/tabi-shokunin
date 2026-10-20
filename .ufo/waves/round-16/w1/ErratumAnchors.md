# ErratumAnchors — round-16 wave-1 report

Seat: `TabiR16.ErratumAnchors-5` (leaf). Owned file written: `.ufo/waves/round-16/erratum-anchors.json` (new, 7227 bytes). No other lane file touched.

## Assignment

Routed defect 3 of `corpus/lessons/round-15-verifier-spotcheck.md:122` (verbatim: "3. **tabi — adopt the erratum.** Future SKILL/lesson text citing round-14 Node wording should point to the erratum section of this file."). Inventory every text in `SKILL.md`, `corpus/README.md`, `corpus/QUALITY.md`, `corpus/knowledge/*.md` citing the round-14 Node / pin.node / "never enforces" / historical-producer wording; record path:line, exact line, and whether it already distinguishes minimum enforcement from exact equality. Propose exact appended pointer text.

The superseded wording (quoted from `corpus/lessons/round-14-verifier-spotcheck.md`, opened this session): line 129 "the historical producer does not read pin.node" / "The producer's runtime pin match therefore cannot certify Node equality or historical minimum enforcement."; line 184 routed defect 1 "the historical producer, which never enforces pin.node". The authoritative correction is the "Erratum to the round-14 verifier wording" section at `round-15-verifier-spotcheck.md:90-101` (heading :90; corrected statement :101; section ends before :103).

## Hits (all five recorded in erratum-anchors.json)

| path:line | cites r14 Node wording | already distinguishes min vs exact | notes |
|---|---|---|---|
| `SKILL.md:1744` | yes | yes | r14 decision-table row "observed Node differs from pin.node.recorded … do not claim exact equality was checked … minimumMajor20" |
| `SKILL.md:1766-1777` | yes | yes | r15 "Named correction to round14's Node table" — states both enforcement layers, corrects the overbroad non-enforcement wording; no erratum-section pointer named |
| `corpus/README.md:255-257` | yes | yes | r14 paragraph: "historical producer … exact runtime-pinned bytes; Observed Node26.12.0 differs from descriptive24.21.0/minimum20" |
| `corpus/README.md:275-285` | yes | yes | r15 "Named qualification to the Node sentence above" — spec enforces minimumMajor20 at :269/:924, corrects overbroad inference; no erratum pointer |
| `corpus/QUALITY.md:56-58` (item 18) | yes | yes | "Runtime metadata distinguishes observed, minimum-enforced and descriptive recorded versions"; anchors to `corpus/lessons/round-14.md#mistakes`, not the r15 erratum |

All five hits already carry the correct minimum-vs-exact distinction — none reproduces the superseded "never enforces" claim. What routed defect 3 still lacks is a recorded pointer index connecting citing texts to the erratum section.

## Negative result

`corpus/knowledge/*.md`: zero hits for `pin.node`, `never enforc`, `historical producer`, `non-enforc`, `overbroad`, `exact (Node )?equality`, `nodeMajor`, `minimumMajor`, `assertPinnedRuntime`, `runtime-pin`. `aria-loopback-round-13.md` (the round-13 note) contains no Node/pin wording; `cdp-evidence-patterns.md:17` and `executor-test-sufficiency.md:51` mention `v24.21.0` only as the round-2/3 host version. No knowledge note needs a pointer.

## Proposed appended pointer text (append-only; new sections, no edits)

Historical lesson files are immutable; `round-15-verifier-spotcheck.md` itself is outside verifier evidence (sha-pinned at 7054a5e, unchanged at 36240c7). Per the round-14 precedent adopted in routed defect 1 — "Do not rewrite frozen original evidence; append the correction in next-round artifacts" — the pointer lands in a NEW section. Primary proposal (also in the JSON):

**Append at EOF of `corpus/lessons/round-15-verifier-spotcheck.md` (after :126)** — note: this file is outside-verifier evidence; L1 should confirm appendability for the closure file, else land the identical text in `corpus/lessons/round-16.md` instead:

```
## Erratum pointer adopters (round-16 routing, append-only)

Routed defect 3 of this file directed future SKILL/lesson text citing the round-14 Node wording to point here. The citing texts and their corrected distinction now live at:
- `SKILL.md` §Round 15, 'Named correction to round14's Node table and the frozen sidecar's note' (added round 15; distinguishes spec-enforced minimumMajor20 from exact equality to recorded 24.21.0).
- `corpus/README.md` §Round 15, 'Named qualification to the Node sentence above' (same distinction).
- `SKILL.md` round-14 decision-table row 'observed Node differs from pin.node.recorded' and `corpus/QUALITY.md` admission bar 18 predate the erratum but already state the observed/minimum-enforced/descriptive distinction; the erratum does not supersede them.
The corrected statement remains the 'Erratum to the round-14 verifier wording' section above: the historical round-13 run enforced the Node minimum per case in the spec and never enforced exact Node equality; the overbroad 'never enforces pin.node' wording is confined to `corpus/lessons/round-14-verifier-spotcheck.md:129,184`, which stays byte-unchanged.
```

**Fallback / companion append for `corpus/lessons/round-16.md`** (L1-owned new lesson):

```
Round-15 outside routed defect 3 adopted: every lane text citing the round-14 Node/pin.node wording now resolves through the erratum section of corpus/lessons/round-15-verifier-spotcheck.md; anchors inventoried in .ufo/waves/round-16/erratum-anchors.json.
```

## Verification / method

Greps run (all under `/home/vgpnk/Projects/shokunin/tabi-shokunin`): `-E "pin\.node|never enforce|historical producer|minimumMajor|exact Node|Node equality|Node minimum|24\.21|26\.12|erratum"`, `-E "round-14|r14|never enforc|non-enforc|overbroad"`, `-E "nodeMajor|assertPinnedRuntime|aria-loopback|runtime-pin|runtimePin"`, `-iE "producer|spotcheck|spot-check|round14|round-14|certify"` over the four target paths, plus a knowledge-dir sweep for the defect vocabulary. Exact lines re-read via `read`/`sed -n` before recording. No scripts run, no browser, no git mutation. Tools installed/updated: none (pacman pause honored; none needed).

## Risks / blockers

- `round-15-verifier-spotcheck.md` is an outside-closure artifact; whether the lane may append to it is an L1 call — hence the two-tier proposal (append-at-EOF vs land in `corpus/lessons/round-16.md`).
- No blocker; deliverable complete: anchors JSON written, append locations and exact pointer text proposed.
